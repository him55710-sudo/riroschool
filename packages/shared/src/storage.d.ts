export interface StorageAdapter {
    uploadFile(jobId: string, filename: string, buffer: Buffer, contentType: string): Promise<string>;
    getSignedUrl(storageKey: string): Promise<string>;
}
export declare class LocalStorageAdapter implements StorageAdapter {
    private baseDir;
    constructor(baseDir?: string);
    uploadFile(jobId: string, filename: string, buffer: Buffer, contentType: string): Promise<string>;
    getSignedUrl(storageKey: string): Promise<string>;
}
export declare class S3CompatibleAdapter implements StorageAdapter {
    uploadFile(jobId: string, filename: string, buffer: Buffer, contentType: string): Promise<string>;
    getSignedUrl(storageKey: string): Promise<string>;
}
export declare const storage: LocalStorageAdapter | S3CompatibleAdapter;
