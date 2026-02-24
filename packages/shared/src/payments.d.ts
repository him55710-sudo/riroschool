export interface PaymentProvider {
    createCheckout(userId: string, productId: string, amount: number): Promise<{
        checkoutUrl: string;
        orderId: string;
    }>;
    verifyPayment(providerTxId: string): Promise<boolean>;
    handleWebhook(payload: any, signature: string): Promise<{
        orderId: string;
        status: 'PAID' | 'FAILED';
    }>;
}
export declare class MockPaymentProvider implements PaymentProvider {
    createCheckout(userId: string, productId: string, amount: number): Promise<{
        checkoutUrl: string;
        orderId: string;
    }>;
    verifyPayment(providerTxId: string): Promise<boolean>;
    handleWebhook(payload: any, signature: string): Promise<{
        orderId: any;
        status: any;
    }>;
}
export declare const paymentProvider: MockPaymentProvider;
