import { NextResponse } from 'next/server';
import { prisma, JobCreateSchema, TIER_LIMITS, deductCredits } from 'shared';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const TIER_COSTS: Record<string, number> = {
    FREE: 0,
    PAID_TIER_1: 3,
    PAID_TIER_2: 5,
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const body = await req.json();
        const parsed = JobCreateSchema.parse(body);
        const cost = TIER_COSTS[parsed.tier] || 0;

        if (cost > 0 && !userId) {
            return NextResponse.json({ error: "Authentication required for paid tiers" }, { status: 401 });
        }

        // Anti-Duplication Check
        // If the same user requests the exact same topic within 24 hours, return the existing job.
        if (userId) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const existingJob = await prisma.job.findFirst({
                where: {
                    userId: userId,
                    topic: parsed.topic,
                    tier: parsed.tier,
                    language: parsed.language,
                    createdAt: {
                        gte: twentyFourHoursAgo
                    }
                }
            });

            if (existingJob) {
                console.log(`[API] Anti-Duplication triggered. Returning existing job ${existingJob.id} for user ${userId}`);
                return NextResponse.json(existingJob, { status: 200 });
            }
        }

        // Deduct credits if necessary
        if (userId && cost > 0) {
            try {
                await deductCredits(userId, cost, "JOB_COST");
            } catch (e: any) {
                return NextResponse.json({ error: e.message || "Insufficient credits" }, { status: 402 });
            }
        }

        const limits = TIER_LIMITS[parsed.tier];

        const job = await prisma.job.create({
            data: {
                userId: userId || null,
                topic: parsed.topic,
                language: parsed.language,
                tier: parsed.tier,
                pageRangeMin: limits.minPages,
                pageRangeMax: limits.maxPages,
                status: 'PENDING',
                progressStage: 'IDLE',
            },
        });

        await prisma.jobLog.create({
            data: { jobId: job.id, stage: 'IDLE', message: `Job created. Cost: ${cost} credits.` }
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
        const job = await prisma.job.findUnique({
            where: { id },
            include: { logs: true }
        });
        if (!job) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

        // Simple privacy: If it has a user, only that user or admin can see it.
        if (job.userId && job.userId !== session?.user?.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json(job);
    }

    // If fetching multiple, only return user's own jobs or public free jobs.
    const jobs = await prisma.job.findMany({
        where: session?.user?.id ? { userId: session.user.id } : { userId: null },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    return NextResponse.json(jobs);
}
