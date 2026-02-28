import { prisma } from './db';

export interface PaymentProvider {
    createCheckout(userId: string, productId: string, amount: number): Promise<{ checkoutUrl: string, orderId: string }>;
    verifyPayment(providerTxId: string): Promise<boolean>;
    handleWebhook(payload: any, signature: string): Promise<{ orderId: string, status: 'PAID' | 'FAILED' }>;
}

export class MockPaymentProvider implements PaymentProvider {
    async createCheckout(userId: string, productId: string, amount: number) {
        const order = await prisma.order.create({
            data: {
                userId,
                amount,
                product: productId,
                provider: 'MOCK',
                status: 'PENDING'
            }
        });

        // Mock checkout URL goes straight to a page that simulates success
        return {
            checkoutUrl: `/checkout?orderId=${order.id}&amount=${amount}&product=${productId}`,
            orderId: order.id
        };
    }

    async verifyPayment(_providerTxId: string) {
        return true; // Auto-pass in mock
    }

    async handleWebhook(payload: any, _signature: string) {
        // Basic mock webhook format: { orderId: '...', status: 'PAID' }
        return {
            orderId: payload.orderId,
            status: payload.status
        };
    }
}

export const paymentProvider = new MockPaymentProvider();
