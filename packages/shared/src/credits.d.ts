export declare function deductCredits(userId: string, cost: number, reason: string, jobId?: string): Promise<void>;
export declare function grantCredits(userId: string, amount: number, reason: string, orderId?: string): Promise<void>;
export declare function refundCredits(jobId: string): Promise<void>;
