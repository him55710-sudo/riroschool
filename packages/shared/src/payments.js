"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentProvider = exports.MockPaymentProvider = void 0;
const db_1 = require("./db");
class MockPaymentProvider {
    async createCheckout(userId, productId, amount) {
        const order = await db_1.prisma.order.create({
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
    async verifyPayment(_providerTxId) {
        return true; // Auto-pass in mock
    }
    async handleWebhook(payload, _signature) {
        // Basic mock webhook format: { orderId: '...', status: 'PAID' }
        return {
            orderId: payload.orderId,
            status: payload.status
        };
    }
}
exports.MockPaymentProvider = MockPaymentProvider;
exports.paymentProvider = new MockPaymentProvider();
