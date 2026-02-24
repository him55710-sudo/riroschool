"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const shared_1 = require("shared");
const research_1 = require("./stages/research");
const write_1 = require("./stages/write");
const qa_1 = require("./stages/qa");
const format_1 = require("./stages/format");
const credits_1 = require("shared/src/credits");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
async function processJob(jobId) {
    const job = await shared_1.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        console.error(`[WORKER] Job ${jobId} not found.`);
        return;
    }
    console.log(`[WORKER] Starting job ${jobId} - ${job.topic}`);
    try {
        // --- 1. RESEARCH ---
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "PROCESSING",
                progressStage: shared_1.JobProgressStage.RESEARCH,
                progressPct: 10
            }
        });
        await (0, research_1.gatherSources)(job);
        // --- 2. DRAFTING ---
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: shared_1.JobProgressStage.WRITE,
                progressPct: 40
            }
        });
        const rawDraft = await (0, write_1.generateDraft)(job);
        // --- 3. QA GATE ---
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: shared_1.JobProgressStage.QA,
                progressPct: 70
            }
        });
        const safeDraft = await (0, qa_1.runQAGate)(job, rawDraft);
        // --- 4. FORMATTING ---
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: shared_1.JobProgressStage.DONE,
                progressPct: 90
            }
        });
        const finalArtifact = await (0, format_1.formatReport)(job, safeDraft);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                progressStage: shared_1.JobProgressStage.DONE,
                progressPct: 100,
                resultUrl: finalArtifact.url
            }
        });
        console.log(`[WORKER] Finished job ${jobId}`);
    }
    catch (err) {
        console.error(`[WORKER] Failed job ${jobId}: ${err.message}`);
        await shared_1.prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                progressPct: 0,
                errorMessage: err.message
            }
        });
        // Refund Credits on failure automatically
        if (job.userId && job.tier !== "FREE") {
            try {
                await (0, credits_1.refundCredits)(jobId);
            }
            catch (refundErr) {
                console.error(`[WORKER] Failed to refund job ${jobId}: ${refundErr.message}`);
            }
        }
    }
}
async function startWorker() {
    const subscriber = (0, redis_1.createClient)({ url: redisUrl });
    await subscriber.connect();
    console.log(`[WORKER] Listening for jobs on 'job-queue' ...`);
    subscriber.subscribe("job-queue", async (message) => {
        const payload = JSON.parse(message);
        if (payload.type === "NEW_JOB") {
            await processJob(payload.jobId);
        }
    });
    // Dummy process to keep alive
    setInterval(() => {
        console.log(`[WORKER] Heartbeat...`);
    }, 60000);
}
startWorker().catch(console.error);
