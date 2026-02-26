import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "redis";
import { prisma } from "shared";
import { gatherSources } from "./stages/research";
import { generateDraft } from "./stages/write";
import { runQAGate } from "./stages/qa";
import { formatReport } from "./stages/format";
import { refundCredits } from "shared/src/credits";

function bootstrapWorkerEnv() {
    const roots = new Set<string>([
        process.cwd(),
        path.resolve(process.cwd(), ".."),
        path.resolve(process.cwd(), "../.."),
        path.resolve(__dirname, ".."),
        path.resolve(__dirname, "../.."),
        path.resolve(__dirname, "../../.."),
    ]);

    const candidates: string[] = [];
    for (const root of roots) {
        candidates.push(path.join(root, ".env.local"));
        candidates.push(path.join(root, ".env"));
    }

    const loaded = new Set<string>();
    for (const filePath of candidates) {
        const normalized = path.resolve(filePath);
        if (loaded.has(normalized) || !fs.existsSync(normalized)) continue;
        loadEnv({ path: normalized, override: false });
        loaded.add(normalized);
    }
}

bootstrapWorkerEnv();

function resolveRepoRoot() {
    const candidates = [
        process.cwd(),
        path.resolve(process.cwd(), ".."),
        path.resolve(process.cwd(), "../.."),
        path.resolve(__dirname, ".."),
        path.resolve(__dirname, "../.."),
        path.resolve(__dirname, "../../.."),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, "pnpm-workspace.yaml"))) {
            return candidate;
        }
    }
    return process.cwd();
}

const repoRoot = resolveRepoRoot();
const workerPidFilePath = path.join(repoRoot, ".storage", "worker.pid");

function registerWorkerPidFile() {
    try {
        fs.mkdirSync(path.dirname(workerPidFilePath), { recursive: true });
        fs.writeFileSync(
            workerPidFilePath,
            JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }),
            "utf8",
        );
    } catch (error) {
        console.warn("[WORKER] Failed to write worker PID file:", error);
    }
}

function cleanupWorkerPidFile() {
    try {
        if (!fs.existsSync(workerPidFilePath)) return;
        const raw = fs.readFileSync(workerPidFilePath, "utf8");
        const parsed = JSON.parse(raw) as { pid?: number };
        if (parsed.pid === process.pid) {
            fs.unlinkSync(workerPidFilePath);
        }
    } catch {
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
const processingJobs = new Set<string>();

const ollamaModel = (process.env.OLLAMA_MODEL || "").trim();
const geminiApiKey = (process.env.GEMINI_API_KEY || "").trim();
if (!geminiApiKey && !ollamaModel) {
    console.warn("[WORKER] GEMINI_API_KEY and OLLAMA_MODEL are empty. Report quality will be limited.");
} else if (!geminiApiKey && ollamaModel) {
    console.log(`[WORKER] Using Ollama model '${ollamaModel}' for draft generation when needed.`);
}

async function appendLog(jobId: string, stage: string, message: string) {
    try {
        await prisma.jobLog.create({ data: { jobId, stage, message } });
    } catch (e) {
        console.error(`[WORKER] Failed to write log for ${jobId}:`, e);
    }
}

async function claimPendingJob(jobId: string) {
    const claimed = await prisma.job.updateMany({
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

async function processJob(jobId: string) {
    if (processingJobs.has(jobId)) return;
    processingJobs.add(jobId);

    try {
        const claimed = await claimPendingJob(jobId);
        if (!claimed) return;

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return;

        console.log(`[WORKER] Starting job ${jobId} - ${job.topic}`);
        await appendLog(jobId, "RESEARCH", "Collecting sources...");
        await gatherSources(job);

        await prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "WRITE",
                progressPct: 40,
            },
        });
        await appendLog(jobId, "WRITE", "Generating draft...");
        const rawDraft = await generateDraft(job);

        await prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "QA",
                progressPct: 70,
            },
        });
        await appendLog(jobId, "QA", "Running QA checks...");
        const safeDraft = await runQAGate(job, rawDraft);

        await prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "RENDER",
                progressPct: 90,
            },
        });
        await appendLog(jobId, "RENDER", "Rendering final report...");
        const finalArtifact = await formatReport(job, safeDraft);

        await prisma.job.update({
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
    } catch (err: any) {
        console.error(`[WORKER] Failed job ${jobId}: ${err.message}`);
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                progressPct: 0,
                errorMessage: err.message,
            },
        });
        await appendLog(jobId, "FAILED", err.message || "Unknown worker failure");

        const failedJob = await prisma.job.findUnique({ where: { id: jobId } });
        if (failedJob?.userId && failedJob.tier !== "FREE") {
            try {
                await refundCredits(jobId);
            } catch (refundErr: any) {
                console.error(`[WORKER] Failed to refund job ${jobId}: ${refundErr.message}`);
            }
        }
    } finally {
        processingJobs.delete(jobId);
    }
}

async function pollPendingJobs() {
    try {
        const pending = await prisma.job.findMany({
            where: { status: "PENDING" },
            select: { id: true },
            orderBy: { createdAt: "asc" },
            take: 3,
        });

        for (const job of pending) {
            void processJob(job.id);
        }
    } catch (e) {
        console.error("[WORKER] Polling failed:", e);
    }
}

async function startRedisSubscriber() {
    if (!redisUrl) {
        console.warn("[WORKER] REDIS_URL is empty. Running in DB polling mode only.");
        return;
    }

    try {
        const subscriber = createClient({ url: redisUrl });
        await subscriber.connect();
        console.log("[WORKER] Redis connected. Subscribing to job-queue...");

        await subscriber.subscribe("job-queue", async (message) => {
            try {
                const payload = JSON.parse(message);
                if (payload.type === "NEW_JOB" && payload.jobId) {
                    void processJob(payload.jobId);
                }
            } catch (e) {
                console.error("[WORKER] Invalid queue payload:", e);
            }
        });
    } catch (e) {
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
