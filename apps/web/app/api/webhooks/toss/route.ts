import { NextResponse } from 'next/server';
import { prisma } from 'shared';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Toss Payments Webhook spec
        const {
            eventType, // e.g. "PAYMENT_STATUS_CHANGED"
            data // contains paymentKey, orderId, status, secret, etc.
        } = body;

        if (!data || !data.orderId) {
            return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { providerTxId: data.orderId }
        });

        if (!order) {
            console.warn(\`Webhook ignored: Order \${data.orderId} not found\`);
            return NextResponse.json({ status: "IGNORED" }, { status: 200 });
        }

        // Verify webhook authenticity (compare secrets if we have one stored from /confirm, or rely on Toss IP whitelisting in production)
        if (order.paymentSecret && data.secret && order.paymentSecret !== data.secret) {
            console.error(\`Webhook secret mismatch for order \${order.id}\`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (order.status === "PAID") {
            // Idempotent: already paid
            return NextResponse.json({ status: "ALREADY_PAID" }, { status: 200 });
        }

        // Handle transitions from WAITING_FOR_DEPOSIT or PENDING -> DONE
        if (data.status === "DONE") {
            let creditsToGrant = 0;
            if (order.product === "PRO_PACK") creditsToGrant = 3;
            if (order.product === "PREMIUM_PACK") creditsToGrant = 5;

            await prisma.$transaction([
                prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "PAID",
                        paymentStatus: "DONE",
                        providerPayload: JSON.stringify(data)
                    }
                }),
                prisma.creditLedger.create({
                    data: {
                        userId: order.userId,
                        delta: creditsToGrant,
                        reason: \`PURCHASE_\${order.product}\`,
                        orderId: order.id
                    }
                }),
                prisma.user.update({
                    where: { id: order.userId },
                    data: { credits: { increment: creditsToGrant } }
                })
            ]);
            console.log(\`[Webhook] Order \${order.id} marked PAID and \${creditsToGrant} credits granted.\`);
        } else {
             // Update status for other events (CANCELED, EXPIRED, etc)
             await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: data.status,
                    providerPayload: JSON.stringify(data)
                }
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error("Webhook processing error:", error);
        // Return 500 so Toss retries if something threw unexpectedly
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
