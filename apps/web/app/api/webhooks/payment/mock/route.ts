import { NextResponse } from 'next/server';
import { paymentProvider, grantCredits, prisma } from 'shared';
import { authorizeApi } from "../../../../../lib/api-rbac";

export async function POST(req: Request) {
    const auth = await authorizeApi("webhooks:payment:mock");
    if (!auth.ok) return auth.response;

    try {
        const { amount, product } = await req.json();

        // 1. Create Checkout (in real world, this returns a URL to Toss/PortOne)
        const { orderId } = await paymentProvider.createCheckout(auth.context.userId, product, amount);

        // 2. Mock exactly what the webhook would do upon success
        // Verification is auto-passed in MockPaymentProvider
        const verified = await paymentProvider.verifyPayment("mock-tx-id");

        if (verified) {
            // 3. Mark order as PAID
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID', providerTxId: `mock-tx-${Date.now()}` }
            });

            // 4. Grant Credits (Idempotent by orderId)
            await grantCredits(auth.context.userId, amount, "PURCHASE", orderId);

            return NextResponse.json({ success: true, orderId });
        } else {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'FAILED' }
            });
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

    } catch (error: any) {
        console.error(`[MockWebhook] Error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
