"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Coins, Download, Lock, TriangleAlert, WandSparkles } from "lucide-react";
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
}

const STAGES: JobProgressStage[] = ["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"];
const TIER_COSTS = { FREE: 0, PRO_PACK: 3, PREMIUM_PACK: 5 };

const STAGE_LABEL: Record<string, string> = {
    IDLE: "대기",
    PLAN: "계획",
    RESEARCH: "리서치",
    WRITE: "작성",
    QA: "품질 점검",
    RENDER: "렌더링",
    DONE: "완료",
};

function formatLogTime(log: JobLog) {
    const raw = log.ts || log.createdAt;
    if (!raw) return "--:--:--";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "--:--:--";
    return date.toLocaleTimeString();
}

export default function Home() {
    const { data: session } = useSession();
    const isSignedIn = Boolean(session?.user);
    const userCredits = session?.user?.credits || 0;

    const [topic, setTopic] = useState("");
    const [language, setLanguage] = useState("Korean");
    const [tier, setTier] = useState<keyof typeof TIER_COSTS>("FREE");
    const [job, setJob] = useState<Job | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const cost = TIER_COSTS[tier];
    const requireCredits = tier !== "FREE";
    const canAfford = userCredits >= cost;

    const ctaText = useMemo(() => {
        if (!isSignedIn && requireCredits) return "로그인 후 시작";
        if (requireCredits && !canAfford) return "크레딧 부족";
        return "포트폴리오 생성";
    }, [isSignedIn, requireCredits, canAfford]);

    const activeStageIndex = STAGES.indexOf((job?.progressStage as JobProgressStage) || "IDLE");

    const redirectToLogin = () => {
        const next = encodeURIComponent("/?focus=generate");
        window.location.href = `/login?next=${next}`;
    };

    const createJob = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMsg("");

        if (!topic.trim()) return;
        if (!isSignedIn && requireCredits) return redirectToLogin();
        if (requireCredits && !canAfford) return setShowPaywall(true);

        try {
            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, language, tier }),
            });
            const data = (await response.json()) as Job & { error?: string };
            if (!response.ok) {
                setErrorMsg(data.error || "작업 생성에 실패했습니다.");
                return;
            }
            setJob(data);
        } catch {
            setErrorMsg("네트워크 오류로 작업 생성에 실패했습니다.");
        }
    };

    useEffect(() => {
        if (!job || job.status === "COMPLETED" || job.status === "FAILED") return;
        const interval = setInterval(async () => {
            const response = await fetch(`/api/jobs?id=${job.id}`);
            if (!response.ok) return;
            const updated = (await response.json()) as Job;
            setJob(updated);
        }, 2000);
        return () => clearInterval(interval);
    }, [job]);

    return (
        <main className="mx-auto max-w-4xl px-5 pb-16 pt-8 md:px-8">
            <section id="generate" className="toss-card p-6 md:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[var(--toss-ink)] md:text-3xl">포트폴리오 생성</h1>
                        <p className="mt-1 text-sm text-[var(--toss-sub)]">주제를 입력하면 바로 생성할 수 있어요.</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--toss-primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--toss-primary)]">
                        <Coins size={14} />
                        {userCredits} 크레딧
                    </div>
                </div>

                <form onSubmit={createJob} className="grid gap-4">
                    <label className="grid gap-1.5">
                        <span className="text-sm font-semibold">주제</span>
                        <input
                            value={topic}
                            onChange={(event) => setTopic(event.target.value)}
                            placeholder="예시: 시대별 건축철학"
                            className="h-11 rounded-xl border border-[var(--toss-line)] bg-white px-3.5 text-sm outline-none focus:border-[var(--toss-primary)]"
                            required
                        />
                    </label>

                    <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-1.5">
                            <span className="text-sm font-semibold">언어</span>
                            <select
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                className="h-11 rounded-xl border border-[var(--toss-line)] bg-white px-3 text-sm outline-none focus:border-[var(--toss-primary)]"
                            >
                                <option value="Korean">한국어</option>
                                <option value="English">영어</option>
                            </select>
                        </label>

                        <label className="grid gap-1.5">
                            <span className="text-sm font-semibold">요금제</span>
                            <select
                                value={tier}
                                onChange={(event) => {
                                    const nextTier = event.target.value as keyof typeof TIER_COSTS;
                                    setTier(nextTier);
                                    setShowPaywall(nextTier !== "FREE" && (!isSignedIn || userCredits < TIER_COSTS[nextTier]));
                                }}
                                className="h-11 rounded-xl border border-[var(--toss-line)] bg-white px-3 text-sm outline-none focus:border-[var(--toss-primary)]"
                            >
                                <option value="FREE">무료 (1-10쪽)</option>
                                <option value="PRO_PACK">프로 (11-20쪽)</option>
                                <option value="PREMIUM_PACK">프리미엄 (21-30쪽)</option>
                            </select>
                        </label>
                    </div>

                    {!isSignedIn && requireCredits && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef4ff] px-3 py-2 text-sm text-[var(--toss-primary)]">
                            <Lock size={14} />
                            유료 플랜은 로그인 후 이용할 수 있어요.
                        </div>
                    )}

                    {showPaywall && (
                        <div className="rounded-xl border border-[#ffe0bc] bg-[#fff7ec] px-3 py-2 text-sm text-[#9a5a12]">
                            선택한 요금제에는 크레딧이 필요합니다.
                        </div>
                    )}

                    {errorMsg && (
                        <div className="rounded-xl border border-[#ffd7d9] bg-[#fff5f5] px-3 py-2 text-sm font-semibold text-[var(--toss-danger)]">
                            {errorMsg}
                        </div>
                    )}

                    <div className="mt-1 flex flex-wrap gap-2.5">
                        <button
                            type="submit"
                            disabled={isSignedIn && requireCredits && !canAfford}
                            className={`inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold ${
                                isSignedIn && requireCredits && !canAfford
                                    ? "cursor-not-allowed bg-[#dbe5f8] text-[#7a8cae]"
                                    : "toss-primary-btn"
                            }`}
                        >
                            <WandSparkles size={15} />
                            {ctaText}
                        </button>
                        <Link href="/pricing" className="toss-secondary-btn inline-flex h-11 items-center px-4 text-sm">
                            요금제 보기
                        </Link>
                    </div>
                </form>
            </section>

            <section className="toss-card mt-5 p-6 md:p-8">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-xl font-extrabold">작업 상태</h2>
                    <span className="rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[var(--toss-sub)]">
                        {job ? job.status : "작업 없음"}
                    </span>
                </div>

                {!job && <p className="text-sm text-[var(--toss-sub)]">생성 버튼을 누르면 진행 상태가 표시됩니다.</p>}

                {job && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-[var(--toss-line)] bg-[#fcfdff] p-4">
                            <p className="text-base font-bold">{job.topic}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--toss-sub)]">
                                {STAGES.map((stage, index) => (
                                    <span key={stage} className={index <= activeStageIndex ? "text-[var(--toss-primary)]" : ""}>
                                        {STAGE_LABEL[stage]}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-[#e5ecfb]">
                                <div
                                    className="h-2 rounded-full bg-[var(--toss-primary)] transition-all"
                                    style={{ width: `${job.progressPct || 0}%` }}
                                />
                            </div>
                        </div>

                        {job.status === "PENDING" && job.progressStage === "IDLE" && (
                            <div className="rounded-2xl border border-[#ffe1bf] bg-[#fff9f1] p-3 text-sm text-[#9a5a12]">
                                <div className="inline-flex items-center gap-1.5 font-bold">
                                    <TriangleAlert size={15} />
                                    작업이 대기 상태에 머물고 있습니다.
                                </div>
                                <p className="mt-1 text-xs">서버의 worker 실행 상태를 확인해 주세요.</p>
                            </div>
                        )}

                        <div className="max-h-40 overflow-y-auto rounded-2xl border border-[var(--toss-line)] bg-white p-3 font-mono text-xs text-[var(--toss-sub)]">
                            {job.logs?.length ? (
                                job.logs
                                    .slice()
                                    .reverse()
                                    .map((log) => (
                                        <div key={log.id}>
                                            [{formatLogTime(log)}] {log.message}
                                        </div>
                                    ))
                            ) : (
                                <div>로그를 불러오는 중...</div>
                            )}
                        </div>

                        {job.status === "FAILED" && (
                            <div className="rounded-2xl border border-[#ffd7d9] bg-[#fff5f5] p-3 text-sm text-[var(--toss-danger)]">
                                {job.errorMessage || "작업이 실패했습니다."}
                            </div>
                        )}

                        {job.status === "COMPLETED" && job.resultUrl && (
                            <div className="rounded-2xl border border-[#d6e4ff] bg-[#f5f9ff] p-4">
                                <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--toss-ok)]">
                                    <CheckCircle2 size={15} />
                                    보고서 생성 완료
                                </p>
                                <iframe
                                    src={job.resultUrl}
                                    title="report-preview"
                                    className="mt-3 h-80 w-full rounded-xl border border-[var(--toss-line)] bg-white"
                                />
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    <a
                                        href={job.resultUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="toss-secondary-btn inline-flex h-10 items-center px-4 text-sm"
                                    >
                                        전체 보고서 보기
                                    </a>
                                    <a
                                        href={`/api/jobs/download?id=${job.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#c9d9fb] bg-[#edf4ff] px-4 text-sm font-semibold text-[var(--toss-primary)] hover:bg-[#e4efff]"
                                    >
                                        <Download size={15} />
                                        PDF 다운로드
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
