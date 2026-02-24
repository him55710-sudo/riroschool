import { NextResponse } from 'next/server';
import { prisma } from 'shared';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { paymentKey, orderId, amount } = body;

        if (!paymentKey || !orderId || !amount) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // 1. Fetch Order from DB to validate amount
        const order = await prisma.order.findUnique({
            where: { providerTxId: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status === "PAID") {
            // Already paid, return idempotently
            return NextResponse.json({ status: "DONE" }, { status: 200 });
        }

        if (order.amount !== Number(amount)) {
            return NextResponse.json({ error: "Amount mismatch. Possible tampering." }, { status: 400 });
        }

        // 2. Call Toss Confirm API
        const secretKey = process.env.TOSS_SECRET_KEY || "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";
        const basicToken = Buffer.from(secretKey + ":").toString("base64");
        const idempotencyKey = uuidv4();

        const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: {
                "Authorization": \`Basic \${basicToken}\`,
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) })
        });

        const tossData = await response.json();

        if (!response.ok) {
            console.error("Toss Confirm Error:", tossData);
            return NextResponse.json({ error: tossData.message || "Toss API Error" }, { status: response.status });
        }

        // 3. Process the response status
        const paymentStatus = tossData.status; // "DONE", "CANCELED", "WAITING_FOR_DEPOSIT", etc.
        const providerPayload = JSON.stringify(tossData);

        if (paymentStatus === "DONE") {
            // Transaction to mark order paid and grant credits
            let creditsToGrant = 0;
            if (order.product === "PRO_PACK") creditsToGrant = 3;
            if (order.product === "PREMIUM_PACK") creditsToGrant = 5;

            await prisma.$transaction([
                prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "PAID",
                        paymentKey: tossData.paymentKey,
                        paymentStatus: tossData.status,
                        paymentMethod: tossData.method,
                        paymentSecret: tossData.secret,
                        providerPayload: providerPayload
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
        } else if (paymentStatus === "WAITING_FOR_DEPOSIT") {
             await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "WAITING_FOR_DEPOSIT",
                    paymentKey: tossData.paymentKey,
                    paymentStatus: tossData.status,
                    paymentMethod: tossData.method,
                    paymentSecret: tossData.secret,
                    providerPayload: providerPayload
                }
            });
            // Do NOT grant credits yet. Wait for Toss Webhook to send 'DONE' payload.
        } else {
             // Fails or Canceled
             await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "FAILED",
                    paymentKey: tossData.paymentKey,
                    paymentStatus: tossData.status,
                    providerPayload: providerPayload
                }
            });
        }

        return NextResponse.json({ status: paymentStatus }, { status: 200 });
    } catch (error: any) {
        console.error("Payment Confirmation API Exception:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
