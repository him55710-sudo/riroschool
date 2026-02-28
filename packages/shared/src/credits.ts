import { prisma } from './db';

// Safely deduct credits using a Prisma transaction.
// Throws if insufficient balance.
export async function deductCredits(userId: string, cost: number, reason: string, jobId?: string): Promise<void> {
    if (cost <= 0) return;

    await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (user.credits < cost) throw new Error("Insufficient credits");

        // Dec credits
        await tx.user.update({
            where: { id: userId },
            data: { credits: { decrement: cost } }
        });

        // Record ledger
        await tx.creditLedger.create({
            data: {
                userId,
                delta: -cost,
                reason,
                jobId
            }
        });
    });
}

export async function grantCredits(userId: string, amount: number, reason: string, orderId?: string): Promise<void> {
    if (amount <= 0) return;

    await prisma.$transaction(async (tx: any) => {
        // Check for idempotency if an orderId is provided
        if (orderId) {
            const existing = await tx.creditLedger.findFirst({ where: { orderId, reason } });
            if (existing) {
                console.warn(`[Credits] Grant ignored. Order ${orderId} already granted.`);
                return; // Idempotent: early return
            }
        }

        await tx.user.update({
            where: { id: userId },
            data: { credits: { increment: amount } }
        });

        await tx.creditLedger.create({
            data: {
                userId,
                delta: amount,
                reason,
                orderId
            }
        });
    });
}

// Used when a JOB fails midway to refund the cost
export async function refundCredits(jobId: string): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
        // Find the original deduction
        const deduction = await tx.creditLedger.findFirst({
            where: { jobId, reason: 'JOB_COST', delta: { lt: 0 } }
        });

        if (!deduction) return; // No deduction found, nothing to refund
        const refundAmount = Math.abs(deduction.delta);

        // Prevent double refund
        const existingRefund = await tx.creditLedger.findFirst({
            where: { jobId, reason: 'REFUND' }
        });
        if (existingRefund) return;

        await tx.user.update({
            where: { id: deduction.userId },
            data: { credits: { increment: refundAmount } }
        });

        await tx.creditLedger.create({
            data: {
                userId: deduction.userId,
                delta: refundAmount,
                reason: 'REFUND',
                jobId
            }
        });

        console.log(`[Credits] Refunded ${refundAmount} credits to User ${deduction.userId} for Job ${jobId}.`);
    });
}
