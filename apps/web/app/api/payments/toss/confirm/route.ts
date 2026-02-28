import { NextResponse } from 'next/server';
import { prisma } from 'shared';
import { v4 as uuidv4 } from 'uuid';
import { authorizeApi, canAccessOwnedResource } from "../../../../../lib/api-rbac";

type ConfirmPaymentBody = {
    paymentKey?: string;
    orderId?: string;
    amount?: number | string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

export async function POST(req: Request) {
    const auth = await authorizeApi("payments:confirm");
    if (!auth.ok) return auth.response;

    try {
        const body = (await req.json()) as ConfirmPaymentBody;
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
        if (!canAccessOwnedResource(auth.context, order.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        if (process.env.NODE_ENV === "production" && !process.env.TOSS_SECRET_KEY) {
            console.error(`[Toss Confirm] CRITICAL: TOSS_SECRET_KEY is missing in production. OrderID: ${orderId}`);
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        const basicToken = Buffer.from(secretKey + ":").toString("base64");
        const idempotencyKey = uuidv4();

        const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${basicToken}`,
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
                        reason: `PURCHASE_${order.product}`,
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
    } catch (error: unknown) {
        console.error("Payment Confirmation API Exception:", error);
        return NextResponse.json({ error: getErrorMessage(error, "Internal Server Error") }, { status: 500 });
    }
}
