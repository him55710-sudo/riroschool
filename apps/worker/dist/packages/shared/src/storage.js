"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.S3CompatibleAdapter = exports.LocalStorageAdapter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalStorageAdapter {
    baseDir;
    constructor(baseDir = './.storage') {
        this.baseDir = path_1.default.resolve(process.cwd(), baseDir);
        if (!fs_1.default.existsSync(this.baseDir)) {
            fs_1.default.mkdirSync(this.baseDir, { recursive: true });
        }
    }
    async uploadFile(jobId, filename, buffer, _contentType) {
        const jobDir = path_1.default.join(this.baseDir, jobId);
        if (!fs_1.default.existsSync(jobDir))
            fs_1.default.mkdirSync(jobDir, { recursive: true });
        const filePath = path_1.default.join(jobDir, filename);
        fs_1.default.writeFileSync(filePath, buffer);
        return `local://${jobId}/${filename}`;
    }
    async getSignedUrl(storageKey) {
        // For local dev, we will serve this via Next.js
        if (!storageKey.startsWith('local://'))
            throw new Error('Invalid storage key');
        const pathPart = storageKey.replace('local://', '');
        return `/api/jobs/download?key=${encodeURIComponent(pathPart)}`;
    }
}
exports.LocalStorageAdapter = LocalStorageAdapter;
// S3 Stub for later
class S3CompatibleAdapter {
    async uploadFile(jobId, filename, _buffer, _contentType) {
        console.warn("S3 upload not fully implemented. Stubbing.");
        return `s3://${process.env.STORAGE_BUCKET}/${jobId}/${filename}`;
    }
    async getSignedUrl(storageKey) {
        return `https://${process.env.STORAGE_BUCKET}.s3.amazonaws.com/${storageKey.replace('s3://', '')}`;
    }
}
exports.S3CompatibleAdapter = S3CompatibleAdapter;
exports.storage = process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID
    ? new S3CompatibleAdapter()
    : new LocalStorageAdapter();
