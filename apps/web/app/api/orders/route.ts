import { NextResponse } from 'next/server';
import { prisma } from 'shared';
import { authorizeApi } from "../../../lib/api-rbac";

type CreateOrderBody = {
    product?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

export async function POST(req: Request) {
    const auth = await authorizeApi("orders:create");
    if (!auth.ok) return auth.response;

    try {
        const body = (await req.json()) as CreateOrderBody;
        const product = body.product;

        let amount = 0;
        let orderName = "";

        if (product === "PRO_PACK") {
            amount = 3000;
            orderName = "PRO Pack (3 Credits)";
        } else if (product === "PREMIUM_PACK") {
            amount = 5000;
            orderName = "PREMIUM Pack (5 Credits)";
        } else {
            return NextResponse.json({ error: "Invalid product" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.context.userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create random orderId ensuring it fits Toss requirements (6-64 chars)
        const orderId = `order_${user.id}_${Date.now()}`;

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                product: product,
                amount: amount,
                currency: "KRW",
                status: "PENDING",
                provider: "TOSS",
                providerTxId: orderId, // using as Toss orderId
            }
        });

        return NextResponse.json({
            orderId: order.providerTxId, // Our unique identifier passed to Toss
            amount: order.amount,
            orderName: orderName,
            customerName: user.name || "Customer",
            customerEmail: user.email,
        }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error, "Failed to create order") }, { status: 500 });
    }
}
