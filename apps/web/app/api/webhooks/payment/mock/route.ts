import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { paymentProvider, grantCredits, prisma } from 'shared';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, product } = await req.json();

        // 1. Create Checkout (in real world, this returns a URL to Toss/PortOne)
        const { orderId } = await paymentProvider.createCheckout(session.user.id, product, amount);

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
            await grantCredits(session.user.id, amount, "PURCHASE", orderId);

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
