import { createClient } from "redis";
import { prisma, JobProgressStage } from "shared";
import { gatherSources } from "./stages/research";
import { generateDraft } from "./stages/write";
import { runQAGate } from "./stages/qa";
import { formatReport } from "./stages/format";
import { refundCredits } from "shared/src/credits";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

async function processJob(jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
        console.error(`[WORKER] Job ${jobId} not found.`);
        return;
    }

    console.log(`[WORKER] Starting job ${jobId} - ${job.topic}`);
    try {
        // --- 1. RESEARCH ---
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "PROCESSING",
                progressStage: "RESEARCH",
                progressPct: 10
            }
        });
        await gatherSources(job);

        // --- 2. DRAFTING ---
        await prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "WRITE",
                progressPct: 40
            }
        });
        const rawDraft = await generateDraft(job);

        // --- 3. QA GATE ---
        await prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "QA",
                progressPct: 70
            }
        });
        const safeDraft = await runQAGate(job, rawDraft);

        // --- 4. FORMATTING ---
        await prisma.job.update({
            where: { id: jobId },
            data: {
                progressStage: "DONE",
                progressPct: 90
            }
        });
        const finalArtifact = await formatReport(job, safeDraft);

        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                progressStage: "DONE",
                progressPct: 100,
                resultUrl: finalArtifact.url
            }
        });
        console.log(`[WORKER] Finished job ${jobId}`);

    } catch (err: any) {
        console.error(`[WORKER] Failed job ${jobId}: ${err.message}`);
        await prisma.job.update({
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
                await refundCredits(jobId);
            } catch (refundErr: any) {
                console.error(`[WORKER] Failed to refund job ${jobId}: ${refundErr.message}`);
            }
        }
    }
}

async function startWorker() {
    const subscriber = createClient({ url: redisUrl });
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
