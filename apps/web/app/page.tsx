"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    CheckCircle2,
    Coins,
    FileSearch,
    Lock,
    Sparkles,
    Timer,
    TriangleAlert,
} from "lucide-react";
import type { JobProgressStage } from "shared";

interface JobLog {
    id: string;
    ts?: string;
    createdAt?: string;
    message: string;
}

interface Job {
    id: string;
    topic: string;
    status: string;
    progressStage: string;
    progressPct?: number;
    errorMessage?: string;
    resultUrl?: string;
    logs?: JobLog[];
    createdAt?: string;
}

const STAGES: JobProgressStage[] = ["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"];
const TIER_COSTS = { FREE: 0, PRO_PACK: 3, PREMIUM_PACK: 5 };

const stageLabel: Record<string, string> = {
    IDLE: "대기",
    PLAN: "기획",
    RESEARCH: "리서치",
    WRITE: "초안 작성",
    QA: "품질 점검",
    RENDER: "결과 생성",
    DONE: "완료",
};

export default function Home() {
    const { data: session } = useSession();
    const isSignedIn = Boolean(session?.user);

    const [topic, setTopic] = useState("");
    const [language, setLanguage] = useState("Korean");
    const [tier, setTier] = useState<keyof typeof TIER_COSTS>("FREE");
    const [job, setJob] = useState<Job | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [stuckHint, setStuckHint] = useState(false);

    const userCredits = session?.user?.credits || 0;
    const cost = TIER_COSTS[tier];
    const requireCredits = tier !== "FREE";
    const canAfford = userCredits >= cost;

    const ctaText = useMemo(() => {
        if (!isSignedIn) return "로그인하고 시작하기";
        if (requireCredits && !canAfford) return "크레딧이 부족해요";
        return "포트폴리오 생성 시작";
    }, [isSignedIn, requireCredits, canAfford]);

    const handleTierChange = (nextTier: keyof typeof TIER_COSTS) => {
        setTier(nextTier);
        if (nextTier !== "FREE" && (!isSignedIn || userCredits < TIER_COSTS[nextTier])) {
            setShowPaywall(true);
            return;
        }
        setShowPaywall(false);
    };

    const redirectToLogin = () => {
        const next = encodeURIComponent("/?focus=generate");
        window.location.href = `/login?next=${next}`;
    };

    const createJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setStuckHint(false);

        if (!topic.trim()) return;
        if (!isSignedIn) {
            redirectToLogin();
            return;
        }
        if (requireCredits && !canAfford) {
            setShowPaywall(true);
            return;
        }

        const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, language, tier }),
        });

        const data = await res.json();
        if (!res.ok) {
            setErrorMsg(data.error || "작업 생성에 실패했습니다.");
            return;
        }

        setJob(data);
    };

    useEffect(() => {
        if (!job || job.status === "COMPLETED" || job.status === "FAILED") return;

        const interval = setInterval(async () => {
            const res = await fetch(`/api/jobs?id=${job.id}`);
            if (!res.ok) return;
            const updated = await res.json();
            setJob(updated);
        }, 2000);

        return () => clearInterval(interval);
    }, [job?.id, job?.status]);

    useEffect(() => {
        if (!job) return;
        if (job.status !== "PENDING") return;
        if (job.progressStage !== "IDLE") return;

        const createdAt = job.createdAt ? new Date(job.createdAt).getTime() : Date.now();
        const elapsed = Date.now() - createdAt;
        setStuckHint(elapsed > 15000);
    }, [job]);

    const activeStageIndex = STAGES.indexOf((job?.progressStage as JobProgressStage) || "IDLE");

    return (
        <main className="pb-16">
            <section className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
                <div className="toss-card overflow-hidden p-8 md:p-10">
                    <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
                        <div>
                            <span className="toss-chip mb-4">
                                <Sparkles size={14} />
                                RIRO AI 리포트 스튜디오
                            </span>
                            <h1 className="text-3xl font-extrabold leading-tight text-[var(--toss-ink)] md:text-5xl">
                                생기부 포트폴리오 리포트를
                                <br />
                                토스처럼 빠르고 깔끔하게
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--toss-sub)] md:text-base">
                                먼저 서비스 구조를 둘러보고, 실제 생성 버튼을 누를 때 로그인하도록 구성했습니다.
                                고등학생도 복잡하지 않게 바로 쓸 수 있도록 단계를 단순하게 정리했습니다.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a href="#generate" className="toss-primary-btn inline-flex items-center gap-2 px-5 py-3 text-sm">
                                    생성 화면 열기
                                    <ArrowRight size={16} />
                                </a>
                                <Link href="/pricing" className="toss-secondary-btn inline-flex items-center gap-2 px-5 py-3 text-sm">
                                    요금제 보기
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#dce7fb] bg-[#f4f8ff] p-5">
                            <h2 className="text-sm font-bold text-[var(--toss-ink)]">이용 순서</h2>
                            <ol className="mt-4 space-y-3 text-sm text-[var(--toss-sub)]">
                                <li className="rounded-xl bg-white p-3">1. 주제, 언어, 분량 선택</li>
                                <li className="rounded-xl bg-white p-3">2. 자료 수집 + 초안 작성</li>
                                <li className="rounded-xl bg-white p-3">3. 품질 점검 후 결과 생성</li>
                                <li className="rounded-xl bg-white p-3">4. 보고서 미리보기 및 제출 준비</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-7 grid max-w-6xl gap-4 px-5 md:grid-cols-3 md:px-8">
                <div className="toss-card p-5">
                    <FileSearch size={18} className="text-[var(--toss-primary)]" />
                    <h3 className="mt-3 text-lg font-bold">근거 기반 생성</h3>
                    <p className="mt-2 text-sm text-[var(--toss-sub)]">
                        수집된 자료를 기준으로 리포트를 구성해 완성도와 신뢰도를 높입니다.
                    </p>
                </div>
                <div className="toss-card p-5">
                    <Timer size={18} className="text-[var(--toss-primary)]" />
                    <h3 className="mt-3 text-lg font-bold">실시간 진행률</h3>
                    <p className="mt-2 text-sm text-[var(--toss-sub)]">
                        리서치부터 완료까지 현재 단계를 타임라인으로 한눈에 볼 수 있습니다.
                    </p>
                </div>
                <div className="toss-card p-5">
                    <CheckCircle2 size={18} className="text-[var(--toss-ok)]" />
                    <h3 className="mt-3 text-lg font-bold">결과 바로 확인</h3>
                    <p className="mt-2 text-sm text-[var(--toss-sub)]">
                        완료된 작업은 전용 뷰어로 연결되어 바로 확인하고 정리할 수 있습니다.
                    </p>
                </div>
            </section>

            <section id="generate" className="mx-auto mt-7 max-w-6xl px-5 md:px-8">
                <div className="toss-card p-6 md:p-8">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-2xl font-extrabold">포트폴리오 생성</h2>
                        {!isSignedIn ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3e8] px-3 py-1.5 text-xs font-bold text-[#cb6500]">
                                <Lock size={14} />
                                생성 시 로그인 필요
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--toss-primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--toss-primary)]">
                                <Coins size={14} />
                                {userCredits} 크레딧
                            </div>
                        )}
                    </div>

                    {errorMsg && (
                        <div className="mb-5 rounded-2xl border border-[#ffd9d9] bg-[#fff5f5] p-4 text-sm font-semibold text-[var(--toss-danger)]">
                            {errorMsg}
                        </div>
                    )}

                    {showPaywall && (
                        <div className="mb-5 rounded-2xl border border-[#ffe5ce] bg-[#fff7ef] p-4 text-sm text-[#9a4d00]">
                            유료 플랜은 크레딧이 필요합니다. 먼저 충전해 주세요.
                        </div>
                    )}

                    {!job && (
                        <form onSubmit={createJob} className="grid gap-4">
                            <label className="grid gap-2">
                                <span className="text-sm font-semibold">주제</span>
                                <input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="h-12 rounded-xl border border-[var(--toss-line)] px-4 text-sm outline-none focus:border-[var(--toss-primary)]"
                                    placeholder="예: 생성형 AI가 학교 교육에 미치는 영향"
                                    required
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="grid gap-2">
                                    <span className="text-sm font-semibold">언어</span>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="h-12 rounded-xl border border-[var(--toss-line)] px-3 text-sm outline-none focus:border-[var(--toss-primary)]"
                                    >
                                        <option value="Korean">한국어</option>
                                        <option value="English">영어</option>
                                    </select>
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-sm font-semibold">플랜</span>
                                    <select
                                        value={tier}
                                        onChange={(e) => handleTierChange(e.target.value as keyof typeof TIER_COSTS)}
                                        className="h-12 rounded-xl border border-[var(--toss-line)] px-3 text-sm outline-none focus:border-[var(--toss-primary)]"
                                    >
                                        <option value="FREE">FREE (1-10쪽, 0크레딧)</option>
                                        <option value="PRO_PACK">PRO (11-20쪽, 3크레딧)</option>
                                        <option value="PREMIUM_PACK">PREMIUM (21-30쪽, 5크레딧)</option>
                                    </select>
                                </label>
                            </div>

                            {!isSignedIn && (
                                <p className="rounded-xl bg-[#eef5ff] px-3 py-2 text-sm text-[var(--toss-primary)]">
                                    지금은 둘러보기 모드입니다. 아래 버튼을 누르면 로그인 후 생성을 시작할 수 있습니다.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSignedIn && requireCredits && !canAfford}
                                className={`mt-1 h-12 rounded-xl text-sm font-bold ${
                                    isSignedIn && requireCredits && !canAfford
                                        ? "cursor-not-allowed bg-[#eef0f2] text-[#8b95a1]"
                                        : "toss-primary-btn"
                                }`}
                            >
                                {ctaText}
                            </button>
                        </form>
                    )}

                    {job && (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-[var(--toss-line)] bg-[#fafbfd] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-lg font-bold">{job.topic}</h3>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--toss-sub)]">
                                        {job.status}
                                    </span>
                                </div>
                                <div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--toss-sub)]">
                                    {STAGES.map((stage, idx) => (
                                        <span key={stage} className={idx <= activeStageIndex ? "text-[var(--toss-primary)]" : ""}>
                                            {stageLabel[stage] || stage}
                                        </span>
                                    ))}
                                </div>
                                <div className="h-2 w-full rounded-full bg-[#e9edf3]">
                                    <div
                                        className="h-2 rounded-full bg-[var(--toss-primary)] transition-all"
                                        style={{ width: `${job.progressPct || 0}%` }}
                                    />
                                </div>
                            </div>

                            {stuckHint && (
                                <div className="rounded-2xl border border-[#ffd8ba] bg-[#fff7ef] p-4 text-sm text-[#9a4d00]">
                                    <div className="flex items-center gap-2 font-bold">
                                        <TriangleAlert size={16} />
                                        작업이 아직 대기 상태에 머물러 있어요.
                                    </div>
                                    <p className="mt-1">
                                        로컬에서는 `pnpm run dev`(웹+워커) 또는 `pnpm run dev:worker`를 함께 실행해 주세요.
                                    </p>
                                </div>
                            )}

                            <div className="max-h-40 overflow-y-auto rounded-2xl border border-[var(--toss-line)] bg-white p-3 font-mono text-xs text-[var(--toss-sub)]">
                                {job.logs?.length ? (
                                    job.logs
                                        .slice()
                                        .reverse()
                                        .map((log) => (
                                            <div key={log.id}>
                                                [{new Date(log.ts || log.createdAt || Date.now()).toLocaleTimeString()}] {log.message}
                                            </div>
                                        ))
                                ) : (
                                    <div>로그를 불러오는 중...</div>
                                )}
                            </div>

                            {job.status === "FAILED" && (
                                <div className="rounded-2xl border border-[#ffd9d9] bg-[#fff5f5] p-4 text-sm text-[var(--toss-danger)]">
                                    <p className="font-bold">작업 실패</p>
                                    <p className="mt-1">{job.errorMessage || "알 수 없는 오류"}</p>
                                </div>
                            )}

                            {job.status === "COMPLETED" && (
                                <div className="rounded-2xl border border-[#d7f5e7] bg-[#f4fffa] p-4">
                                    <p className="text-sm font-bold text-[var(--toss-ok)]">생성이 완료되었습니다.</p>
                                    {job.resultUrl ? (
                                        <div className="mt-3 space-y-3">
                                            <iframe
                                                src={job.resultUrl}
                                                title="report-preview"
                                                className="h-96 w-full rounded-xl border border-[var(--toss-line)] bg-white"
                                            />
                                            <a
                                                href={job.resultUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex rounded-xl border border-[var(--toss-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--toss-sub)] hover:bg-[#f8f9fb]"
                                            >
                                                새 탭에서 보고서 열기
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-[var(--toss-sub)]">결과 URL 준비 중입니다.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
