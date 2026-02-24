import fs from 'fs';
import path from 'path';

export interface StorageAdapter {
    uploadFile(jobId: string, filename: string, buffer: Buffer, contentType: string): Promise<string>;
    getSignedUrl(storageKey: string): Promise<string>;
}

export class LocalStorageAdapter implements StorageAdapter {
    private baseDir: string;

    constructor(baseDir: string = './.storage') {
        this.baseDir = path.resolve(process.cwd(), baseDir);
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    async uploadFile(jobId: string, filename: string, buffer: Buffer, contentType: string): Promise<string> {
        const jobDir = path.join(this.baseDir, jobId);
        if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });

        const filePath = path.join(jobDir, filename);
        fs.writeFileSync(filePath, buffer);
        return `local://${jobId}/${filename}`;
    }

    async getSignedUrl(storageKey: string): Promise<string> {
        // For local dev, we will serve this via Next.js
        if (!storageKey.startsWith('local://')) throw new Error('Invalid storage key');
        const pathPart = storageKey.replace('local://', '');
        return `/api/jobs/download?key=${encodeURIComponent(pathPart)}`;
    }
}

// S3 Stub for later
export class S3CompatibleAdapter implements StorageAdapter {
    async uploadFile(jobId: string, filename: string, buffer: Buffer, contentType: string): Promise<string> {
        console.warn("S3 upload not fully implemented. Stubbing.");
        return `s3://${process.env.STORAGE_BUCKET}/${jobId}/${filename}`;
    }

    async getSignedUrl(storageKey: string): Promise<string> {
        return `https://${process.env.STORAGE_BUCKET}.s3.amazonaws.com/${storageKey.replace('s3://', '')}`;
    }
}

export const storage = process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID
    ? new S3CompatibleAdapter()
    : new LocalStorageAdapter();
