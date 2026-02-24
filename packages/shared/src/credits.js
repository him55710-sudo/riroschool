"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductCredits = deductCredits;
exports.grantCredits = grantCredits;
exports.refundCredits = refundCredits;
const db_1 = require("./db");
// Safely deduct credits using a Prisma transaction.
// Throws if insufficient balance.
async function deductCredits(userId, cost, reason, jobId) {
    if (cost <= 0)
        return;
    await db_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("User not found");
        if (user.credits < cost)
            throw new Error("Insufficient credits");
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
async function grantCredits(userId, amount, reason, orderId) {
    if (amount <= 0)
        return;
    await db_1.prisma.$transaction(async (tx) => {
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
async function refundCredits(jobId) {
    await db_1.prisma.$transaction(async (tx) => {
        // Find the original deduction
        const deduction = await tx.creditLedger.findFirst({
            where: { jobId, reason: 'JOB_COST', delta: { lt: 0 } }
        });
        if (!deduction)
            return; // No deduction found, nothing to refund
        const refundAmount = Math.abs(deduction.delta);
        // Prevent double refund
        const existingRefund = await tx.creditLedger.findFirst({
            where: { jobId, reason: 'REFUND' }
        });
        if (existingRefund)
            return;
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
