import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { prisma, deductCredits, grantCredits, refundCredits } from '../src';

describe('Credit Logic & Ledger Transactions', () => {
    let testUser: any;

    beforeAll(async () => {
        // Setup a clean test user
        testUser = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                name: "Test User",
                credits: 10
            }
        });
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: testUser.id } });
    });

    test('dectuctCredits: Successfully deducts valid amount and creates ledger entry', async () => {
        await deductCredits(testUser.id, 3, "JOB_COST", "test-job-1");

        const user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(7);

        const ledger = await prisma.creditLedger.findFirst({
            where: { userId: testUser.id, jobId: "test-job-1" }
        });

        expect(ledger).toBeDefined();
        expect(ledger?.delta).toBe(-3);
        expect(ledger?.reason).toBe("JOB_COST");
    });

    test('deductCredits: Fails atomic transaction if insufficient balance', async () => {
        await expect(deductCredits(testUser.id, 10, "JOB_COST", "test-job-2")).rejects.toThrow("Insufficient credits");

        // Balance shouldn't change
        const user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(7); // from prev test
    });

    test('grantCredits: Idempotency check prevents double granting for same order', async () => {
        const orderId = `test-order-${Date.now()}`;

        await grantCredits(testUser.id, 5, "PURCHASE", orderId);
        let user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(12);

        // Try same orderId
        await grantCredits(testUser.id, 5, "PURCHASE", orderId);
        user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(12); // STILL 12
    });

    test('refundCredits: Refunds a deducted job exactly once', async () => {
        await deductCredits(testUser.id, 3, "JOB_COST", "test-job-fail");
        let user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(9);

        await refundCredits("test-job-fail");
        user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(12);

        // Try redundant refund
        await refundCredits("test-job-fail");
        user = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(user?.credits).toBe(12); // STILL 12
    });
});
