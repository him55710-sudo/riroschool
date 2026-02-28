"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("dotenv");
const redis_1 = require("redis");
const shared_1 = require("shared");
const research_1 = require("./stages/research");
const write_1 = require("./stages/write");
const qa_1 = require("./stages/qa");
const format_1 = require("./stages/format");
const credits_1 = require("shared/src/credits");
function bootstrapWorkerEnv() {
    const roots = new Set([
        process.cwd(),
        node_path_1.default.resolve(process.cwd(), ".."),
        node_path_1.default.resolve(process.cwd(), "../.."),
        node_path_1.default.resolve(__dirname, ".."),
        node_path_1.default.resolve(__dirname, "../.."),
        node_path_1.default.resolve(__dirname, "../../.."),
    ]);
    const candidates = [];
    for (const root of roots) {
        candidates.push(node_path_1.default.join(root, ".env.local"));
        candidates.push(node_path_1.default.join(root, ".env"));
    }
    const loaded = new Set();
    for (const filePath of candidates) {
        const normalized = node_path_1.default.resolve(filePath);
        if (loaded.has(normalized) || !node_fs_1.default.existsSync(normalized))
            continue;
        (0, dotenv_1.config)({ path: normalized, override: false });
        loaded.add(normalized);
    }
}
bootstrapWorkerEnv();
function resolveRepoRoot() {
    const candidates = [
        process.cwd(),
        node_path_1.default.resolve(process.cwd(), ".."),
        node_path_1.default.resolve(process.cwd(), "../.."),
        node_path_1.default.resolve(__dirname, ".."),
        node_path_1.default.resolve(__dirname, "../.."),
        node_path_1.default.resolve(__dirname, "../../.."),
    ];
    for (const candidate of candidates) {
        if (node_fs_1.default.existsSync(node_path_1.default.join(candidate, "pnpm-workspace.yaml"))) {
            return candidate;
        }
    }
    return process.cwd();
}
const repoRoot = resolveRepoRoot();
const workerPidFilePath = node_path_1.default.join(repoRoot, ".storage", "worker.pid");
function registerWorkerPidFile() {
    try {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(workerPidFilePath), { recursive: true });
        node_fs_1.default.writeFileSync(workerPidFilePath, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }), "utf8");
    }
    catch (error) {
        console.warn("[WORKER] Failed to write worker PID file:", error);
    }
}
function cleanupWorkerPidFile() {
    try {
        if (!node_fs_1.default.existsSync(workerPidFilePath))
            return;
        const raw = node_fs_1.default.readFileSync(workerPidFilePath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.pid === process.pid) {
            node_fs_1.default.unlinkSync(workerPidFilePath);
        }
    }
    catch {
        // ignore cleanup errors
    }
}
registerWorkerPidFile();
process.on("exit", cleanupWorkerPidFile);
process.on("SIGINT", () => {
    cleanupWorkerPidFile();
    process.exit(0);
});
process.on("SIGTERM", () => {
    cleanupWorkerPidFile();
    process.exit(0);
});
const redisUrl = process.env.REDIS_URL || "";
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS || "4000");
const processingJobs = new Set();
const geminiApiKey = (process.env.GEMINI_API_KEY || "").trim();
const ollamaModel = (process.env.OLLAMA_MODEL || "").trim();
const ollamaEnabled = process.env.OLLAMA_DISABLED !== "1" && (process.env.OLLAMA_ENABLED || "0").trim() === "1" && ollamaModel;
if (!geminiApiKey && !ollamaEnabled) {
    console.warn("[WORKER] GEMINI_API_KEY is missing and Ollama fallback is disabled. FREE tier only local generation is available.");
}
else if (!geminiApiKey && ollamaEnabled) {
    console.log(`[WORKER] GEMINI_API_KEY is missing. Using Ollama model '${ollamaModel}' as fallback.`);
}
async function appendLog(jobId, stage, message) {
    try {
        await shared_1.prisma.jobLog.create({ data: { jobId, stage, message } });
    }
    catch (e) {
        console.error(`[WORKER] Failed to write log for ${jobId}:`, e);
    }
}
async function claimPendingJob(jobId) {
    const claimed = await shared_1.prisma.job.updateMany({
        where: { id: jobId, status: "PENDING" },
        data: {
            status: "PROCESSING",
            progressStage: "RESEARCH",
            progressPct: 10,
            errorMessage: null,
        },
    });
    return claimed.count > 0;
}
async function processJob(jobId) {
    if (processingJobs.has(jobId))
        return;
    processingJobs.add(jobId);
    try {
        const claimed = await claimPendingJob(jobId);
        if (!claimed)
            return;
        const job = await shared_1.prisma.job.findUnique({ where: { id: jobId } });
        if (!job)
            return;
        console.log(`[WORKER] Starting job ${jobId} - ${job.topic}`);
        await appendLog(jobId, "RESEARCH", "Collecting sources...");
        await (0, research_1.gatherSources)(job);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "WRITE",
                progressPct: 40,
            },
        });
        await appendLog(jobId, "WRITE", "Generating draft...");
        const rawDraft = await (0, write_1.generateDraft)(job);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "QA",
                progressPct: 70,
            },
        });
        await appendLog(jobId, "QA", "Running QA checks...");
        const safeDraft = await (0, qa_1.runQAGate)(job, rawDraft);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "RENDER",
                progressPct: 90,
            },
        });
        await appendLog(jobId, "RENDER", "Rendering final report...");
        const finalArtifact = await (0, format_1.formatReport)(job, safeDraft);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                progressStage: "DONE",
                progressPct: 100,
                resultUrl: finalArtifact.url,
            },
        });
        await appendLog(jobId, "DONE", "Job completed successfully.");
        console.log(`[WORKER] Finished job ${jobId}`);
    }
    catch (err) {
        console.error(`[WORKER] Failed job ${jobId}: ${err.message}`);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                progressPct: 0,
                errorMessage: err.message,
            },
        });
        await appendLog(jobId, "FAILED", err.message || "Unknown worker failure");
        const failedJob = await shared_1.prisma.job.findUnique({ where: { id: jobId } });
        if (failedJob?.userId && failedJob.tier !== "FREE") {
            try {
                await (0, credits_1.refundCredits)(jobId);
            }
            catch (refundErr) {
                console.error(`[WORKER] Failed to refund job ${jobId}: ${refundErr.message}`);
            }
        }
    }
    finally {
        processingJobs.delete(jobId);
    }
}
async function pollPendingJobs() {
    try {
        const pending = await shared_1.prisma.job.findMany({
            where: { status: "PENDING" },
            select: { id: true },
            orderBy: { createdAt: "asc" },
            take: 3,
        });
        for (const job of pending) {
            void processJob(job.id);
        }
    }
    catch (e) {
        console.error("[WORKER] Polling failed:", e);
    }
}
async function startRedisSubscriber() {
    if (!redisUrl) {
        console.warn("[WORKER] REDIS_URL is empty. Running in DB polling mode only.");
        return;
    }
    try {
        const subscriber = (0, redis_1.createClient)({ url: redisUrl });
        await subscriber.connect();
        console.log("[WORKER] Redis connected. Subscribing to job-queue...");
        await subscriber.subscribe("job-queue", async (message) => {
            try {
                const payload = JSON.parse(message);
                if (payload.type === "NEW_JOB" && payload.jobId) {
                    void processJob(payload.jobId);
                }
            }
            catch (e) {
                console.error("[WORKER] Invalid queue payload:", e);
            }
        });
    }
    catch (e) {
        console.warn("[WORKER] Redis subscribe unavailable. Polling mode will continue.", e);
    }
}
async function startWorker() {
    await startRedisSubscriber();
    await pollPendingJobs();
    setInterval(() => {
        void pollPendingJobs();
    }, POLL_INTERVAL_MS);
    setInterval(() => {
        console.log("[WORKER] Heartbeat...");
    }, 60000);
}
startWorker().catch((err) => {
    console.error("[WORKER] Fatal startup error:", err);
});
