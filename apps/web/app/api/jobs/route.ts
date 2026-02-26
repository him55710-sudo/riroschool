import { NextResponse } from "next/server";
import { prisma, JobCreateSchema, TIER_LIMITS, deductCredits } from "shared";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../../../lib/auth";

const TIER_COSTS: Record<string, number> = {
    FREE: 0,
    PRO_PACK: 3,
    PREMIUM_PACK: 5,
};

const LOCAL_FALLBACK_DELAY_MS = Number(process.env.LOCAL_JOB_FALLBACK_DELAY_MS || "12000");

const buildLocalFallbackHtml = (topic: string, language: string, tier: string) => {
    const locale = language === "English" ? "en-US" : "ko-KR";
    const generatedAt = new Date().toLocaleString(locale);
    const tierLabel =
        tier === "PREMIUM_PACK" ? "PREMIUM (21-30쪽)" : tier === "PRO_PACK" ? "PRO (11-20쪽)" : "FREE (1-10쪽)";

    return `<!doctype html>
<html lang="${language === "English" ? "en" : "ko"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${topic}</title>
  <style>
    body { font-family: "Noto Sans KR", sans-serif; margin: 0; padding: 40px; color: #191f28; background: #f5f7fb; }
    .paper { max-width: 960px; margin: 0 auto; background: #fff; border: 1px solid #e5e8eb; border-radius: 18px; padding: 32px; }
    h1 { margin: 0; font-size: 30px; line-height: 1.25; }
    h2 { margin-top: 28px; font-size: 20px; }
    p { line-height: 1.75; color: #333d4b; }
    .meta { margin-top: 8px; color: #6b7684; font-size: 13px; }
    .chip { display: inline-block; margin-top: 14px; background: #ebf3ff; color: #2b74de; padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: 12px; }
    .warn { margin-top: 20px; background: #fff7ef; color: #9a4d00; padding: 14px; border-radius: 12px; border: 1px solid #ffe5ce; font-size: 13px; }
    ul { color: #333d4b; line-height: 1.75; }
  </style>
</head>
<body>
  <article class="paper">
    <h1>${topic}</h1>
    <p class="meta">생성 시각: ${generatedAt}</p>
    <span class="chip">${tierLabel}</span>

    <h2>요약</h2>
    <p>현재 문서는 로컬 fallback 모드로 생성된 결과입니다. 워커 큐 연결이 없을 때도 확인 가능한 결과를 제공하기 위해 만들어졌습니다.</p>

    <h2>핵심 내용</h2>
    <ul>
      <li>주제의 배경과 문제 상황을 정리합니다.</li>
      <li>중요 쟁점과 기대 효과를 구분해서 설명합니다.</li>
      <li>실행 가능한 다음 단계 제안을 제공합니다.</li>
    </ul>

    <h2>다음 단계</h2>
    <p>고품질 AI 리포트를 원한다면 worker를 실행하고 GEMINI_API_KEY를 설정한 뒤 다시 생성해 주세요.</p>

    <div class="warn">안내: 이 문서는 장애 대응용 기본 결과이며, 최종 AI 품질 모드와는 다를 수 있습니다.</div>
  </article>
</body>
</html>`;
};

async function processLocallyIfStillPending(jobId: string) {
    const claimed = await prisma.job.updateMany({
        where: { id: jobId, status: "PENDING" },
        data: {
            status: "PROCESSING",
            progressStage: "WRITE",
            progressPct: 45,
        },
    });

    if (claimed.count === 0) return;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;

    try {
        await prisma.jobLog.create({
            data: { jobId, stage: "WRITE", message: "워커 fallback이 활성화되어 로컬 리포트를 생성합니다." },
        });

        const html = buildLocalFallbackHtml(job.topic, job.language, job.tier);
        const artifact = await prisma.artifact.create({
            data: {
                jobId,
                type: "HTML_REPORT",
                storageKey: `local://final/${job.id}.html`,
                metadata: html,
                url: `/api/jobs/result?id=${job.id}`,
            },
        });

        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                progressStage: "DONE",
                progressPct: 100,
                resultUrl: artifact.url,
            },
        });

        await prisma.jobLog.create({
            data: { jobId, stage: "DONE", message: "로컬 fallback 리포트 생성이 완료되었습니다." },
        });
    } catch (error: any) {
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                errorMessage: error?.message || "Local fallback failed",
            },
        });
    }
}

function scheduleLocalFallback(jobId: string) {
    if (process.env.NODE_ENV === "production") return;
    setTimeout(() => {
        void processLocallyIfStillPending(jobId);
    }, LOCAL_FALLBACK_DELAY_MS);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(getAuthOptions());
        const userId = session?.user?.id;

        const body = await req.json();
        const parsed = JobCreateSchema.parse(body);
        const cost = TIER_COSTS[parsed.tier] || 0;

        if (cost > 0 && !userId) {
            return NextResponse.json({ error: "유료 플랜은 로그인이 필요합니다." }, { status: 401 });
        }

        if (userId) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const existingJob = await prisma.job.findFirst({
                where: {
                    userId,
                    topic: parsed.topic,
                    tier: parsed.tier,
                    language: parsed.language,
                    createdAt: { gte: twentyFourHoursAgo },
                },
            });

            if (existingJob) {
                if (existingJob.status === "PENDING") scheduleLocalFallback(existingJob.id);
                return NextResponse.json(existingJob, { status: 200 });
            }
        }

        if (userId && cost > 0) {
            try {
                await deductCredits(userId, cost, "JOB_COST");
            } catch (e: any) {
                return NextResponse.json({ error: e.message || "크레딧이 부족합니다." }, { status: 402 });
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
                status: "PENDING",
                progressStage: "IDLE",
                progressPct: 0,
            },
        });

        await prisma.jobLog.create({
            data: { jobId: job.id, stage: "IDLE", message: `작업이 생성되었습니다. (비용: ${cost}크레딧)` },
        });

        scheduleLocalFallback(job.id);
        return NextResponse.json(job, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "작업 생성에 실패했습니다." }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(getAuthOptions());
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
        const job = await prisma.job.findUnique({
            where: { id },
            include: { logs: true },
        });
        if (!job) return NextResponse.json({ error: "작업을 찾을 수 없습니다." }, { status: 404 });

        if (job.userId && job.userId !== session?.user?.id) {
            return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
        }
        return NextResponse.json(job);
    }

    const jobs = await prisma.job.findMany({
        where: session?.user?.id ? { userId: session.user.id } : { userId: null },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
    return NextResponse.json(jobs);
}
