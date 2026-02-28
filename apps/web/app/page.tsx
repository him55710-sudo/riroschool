"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Coins,
    Download,
    Lock,
    Send,
    ShieldCheck,
    TriangleAlert,
    WandSparkles,
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
}

type ChatRole = "user" | "assistant";

type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
};

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

const STATUS_LABEL: Record<string, string> = {
    PENDING: "대기",
    PROCESSING: "진행 중",
    COMPLETED: "완료",
    FAILED: "실패",
};

const INITIAL_CHAT_MESSAGE: ChatMessage = {
    id: "assistant-initial",
    role: "assistant",
    content: "안녕하세요. 포트폴리오 제작을 도와드릴 AI 에이전트입니다. 목표 직무와 강조할 경험을 먼저 알려주세요.",
};

const createClientId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

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

    const [isChatting, setIsChatting] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatError, setChatError] = useState("");

    const chatScrollRef = useRef<HTMLDivElement>(null);

    const cost = TIER_COSTS[tier];
    const requireCredits = tier !== "FREE";
    const canAfford = userCredits >= cost;

    const activeStageIndex = STAGES.indexOf((job?.progressStage as JobProgressStage) || "IDLE");
    const jobStatusLabel = job?.status ? STATUS_LABEL[job.status] || job.status : "작업 없음";
    const currentStageLabel = job?.progressStage ? STAGE_LABEL[job.progressStage] || job.progressStage : "대기";

    const redirectToLogin = () => {
        const next = encodeURIComponent("/?focus=generate");
        window.location.href = `/login?next=${next}`;
    };

    const startChat = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMsg("");

        if (!topic.trim()) return;
        if (!isSignedIn && requireCredits) return redirectToLogin();
        if (requireCredits && !canAfford) return setShowPaywall(true);

        setChatMessages([INITIAL_CHAT_MESSAGE]);
        setChatInput("");
        setChatError("");
        setIsChatting(true);
    };

    const sendChatMessage = async (event: React.FormEvent) => {
        event.preventDefault();

        const trimmed = chatInput.trim();
        if (!trimmed || isChatLoading) return;

        const userMessage: ChatMessage = {
            id: createClientId("user"),
            role: "user",
            content: trimmed,
        };
        const assistantId = createClientId("assistant");

        setChatInput("");
        setChatError("");
        setIsChatLoading(true);

        const nextMessages = [...chatMessages, userMessage];
        setChatMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    language,
                    tier,
                    messages: nextMessages.map((message) => ({
                        role: message.role,
                        content: message.content,
                    })),
                }),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error || "챗봇 응답 생성에 실패했습니다.");
            }

            if (!response.body) {
                throw new Error("스트리밍 응답을 받을 수 없습니다.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                assistantText += decoder.decode(value, { stream: true });
                setChatMessages((prev) =>
                    prev.map((message) =>
                        message.id === assistantId ? { ...message, content: assistantText } : message,
                    ),
                );
            }

            assistantText += decoder.decode();
            if (!assistantText.trim()) {
                assistantText = "응답이 비어 있습니다. 질문을 조금 더 구체적으로 입력해 주세요.";
            }

            setChatMessages((prev) =>
                prev.map((message) =>
                    message.id === assistantId ? { ...message, content: assistantText } : message,
                ),
            );
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "챗봇 연결 중 오류가 발생했습니다.";
            setChatError(message);
            setChatMessages((prev) =>
                prev.map((chatMessage) =>
                    chatMessage.id === assistantId
                        ? { ...chatMessage, content: `오류: ${message}` }
                        : chatMessage,
                ),
            );
        } finally {
            setIsChatLoading(false);
        }
    };

    const confirmAndCreateJob = async () => {
        setErrorMsg("");

        const contextLines = chatMessages
            .filter((message) => message.content.trim().length > 0)
            .map((message) => `${message.role === "assistant" ? "assistant" : "user"}: ${message.content}`)
            .join("\n");

        const richTopic = `${topic}\n\n--- Portfolio Chat Context ---\n${contextLines}`;

        try {
            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: richTopic, language, tier }),
            });
            const data = (await response.json()) as Job & { error?: string };
            if (!response.ok) {
                setErrorMsg(data.error || "작업 생성에 실패했습니다.");
                return;
            }
            setJob(data);
            setIsChatting(false);
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

    useEffect(() => {
        if (!isChatting) return;
        if (!chatScrollRef.current) return;
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, [chatMessages, isChatLoading, isChatting]);

    return (
        <main className="mx-auto max-w-[1380px] px-5 pb-16 pt-8 md:px-8">
            <section className="toss-card fade-up overflow-hidden p-6 md:p-8">
                <div className="pointer-events-none absolute -left-20 top-5 h-44 w-44 bubble-blob bg-[#d5e6ff]" />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 bubble-blob bg-[#d4f7ff]" />

                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <p className="toss-chip">AI Portfolio Studio</p>
                        <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">학습 주제를 보고서로 빠르게 완성하세요</h1>
                        <p className="mt-3 max-w-2xl text-sm text-[var(--toss-sub)] md:text-base">
                            주제를 넣으면 리서치부터 작성, 품질 점검까지 자동으로 진행합니다. 진행률과 로그를 실시간으로 확인하고,
                            결과는 바로 미리보기와 PDF로 내려받을 수 있습니다.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-semibold text-[var(--toss-sub)]">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5">실시간 진행 추적</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5">결제/크레딧 연동</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5">즉시 PDF 다운로드</span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[var(--toss-line)] bg-white/82 p-5 shadow-[0_10px_24px_rgba(34,78,164,0.12)]">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--toss-sub)]">현재 상태</p>
                        <div className="mt-3 space-y-3 text-sm text-[var(--toss-sub)]">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[var(--toss-primary)]" />
                                인증 기반 작업 보호
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-[var(--toss-primary)]" />
                                단계별 진행률 표시
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock3 size={16} className="text-[var(--toss-primary)]" />
                                평균 1~3분 내 결과 확인
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#cfe1ff] bg-[#eff5ff] px-4 py-3 text-sm text-[var(--toss-sub)]">
                            보유 크레딧: <strong className="font-extrabold text-[var(--toss-primary)]">{userCredits} 크레딧</strong>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <section id="generate" className="toss-card p-7 md:p-9">
                    {!isChatting ? (
                        <>
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-extrabold md:text-3xl">포트폴리오 설계</h2>
                                    <p className="mt-1 text-sm text-[var(--toss-sub)]">AI 에이전트와 대화하며 포트폴리오 방향성을 기획합니다.</p>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--toss-primary-soft)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--toss-primary)]">
                                    <Coins size={14} />
                                    {userCredits} 크레딧
                                </div>
                            </div>

                            <form onSubmit={startChat} className="grid gap-4">
                                <label className="grid gap-1.5">
                                    <span className="text-sm font-bold">주제</span>
                                    <input
                                        value={topic}
                                        onChange={(event) => setTopic(event.target.value)}
                                        placeholder="예시: 시대별 건축철학"
                                        className="h-11 rounded-xl border border-[var(--toss-line)] bg-white/90 px-3.5 text-sm"
                                        required
                                    />
                                </label>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className="grid gap-1.5">
                                        <span className="text-sm font-bold">언어</span>
                                        <select
                                            value={language}
                                            onChange={(event) => setLanguage(event.target.value)}
                                            className="h-11 rounded-xl border border-[var(--toss-line)] bg-white/90 px-3 text-sm"
                                        >
                                            <option value="Korean">한국어</option>
                                            <option value="English">영어</option>
                                        </select>
                                    </label>

                                    <label className="grid gap-1.5">
                                        <span className="text-sm font-bold">요금제</span>
                                        <select
                                            value={tier}
                                            onChange={(event) => {
                                                const nextTier = event.target.value as keyof typeof TIER_COSTS;
                                                setTier(nextTier);
                                                setShowPaywall(nextTier !== "FREE" && (!isSignedIn || userCredits < TIER_COSTS[nextTier]));
                                            }}
                                            className="h-11 rounded-xl border border-[var(--toss-line)] bg-white/90 px-3 text-sm"
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
                                    <div className="rounded-xl border border-[#ffd7d9] bg-[#fff5f5] px-3 py-2 text-sm font-bold text-[var(--toss-danger)]">
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="mt-1 flex flex-wrap gap-2.5">
                                    <button
                                        type="submit"
                                        disabled={isSignedIn && requireCredits && !canAfford}
                                        className={`inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-extrabold ${
                                            isSignedIn && requireCredits && !canAfford
                                                ? "cursor-not-allowed border border-[#d2def8] bg-[#dee8fb] text-[#6f83ab]"
                                                : "toss-primary-btn"
                                        }`}
                                    >
                                        <WandSparkles size={15} />
                                        AI와 설계 시작
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex min-h-[680px] flex-col md:min-h-[760px]">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-xl font-extrabold md:text-2xl">AI 요구사항 구체화</h3>
                                <button
                                    onClick={() => setIsChatting(false)}
                                    className="text-sm font-semibold text-[var(--toss-sub)] hover:text-[var(--toss-ink)]"
                                >
                                    옵션으로 돌아가기
                                </button>
                            </div>

                            <div
                                ref={chatScrollRef}
                                className="flex-1 overflow-y-auto rounded-2xl border border-[var(--toss-line)] bg-[#f7faff] p-5 md:p-6"
                            >
                                {chatMessages.map((message) => (
                                    <div key={message.id} className={`mb-5 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[90%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm md:text-base ${
                                                message.role === "user"
                                                    ? "bg-[var(--toss-primary)] text-white"
                                                    : "border border-[var(--toss-line)] bg-white text-[var(--toss-ink)]"
                                            }`}
                                        >
                                            {message.content || (message.role === "assistant" && isChatLoading ? "생각 중..." : "")}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {chatError && (
                                <div className="mt-3 rounded-xl border border-[#ffd7d9] bg-[#fff5f5] px-4 py-3 text-base font-semibold text-[var(--toss-danger)]">
                                    {chatError}
                                </div>
                            )}

                            <form onSubmit={sendChatMessage} className="mt-4 flex gap-3">
                                <input
                                    value={chatInput}
                                    onChange={(event) => setChatInput(event.target.value)}
                                    placeholder="추가할 경험, 성과, 원하는 톤을 입력하세요"
                                    className="h-12 flex-1 rounded-xl border border-[var(--toss-line)] bg-white px-4 text-base focus:border-[var(--toss-primary)] focus:outline-none"
                                    disabled={isChatLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="toss-primary-btn inline-flex h-12 items-center gap-1.5 rounded-xl px-5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-65"
                                >
                                    <Send size={15} />
                                    전송
                                </button>
                            </form>

                            <button
                                onClick={confirmAndCreateJob}
                                disabled={isChatLoading}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b72ff] py-4 text-base font-bold text-white shadow-md transition hover:bg-[#1a5ce6] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <CheckCircle2 size={17} />
                                대화 종료 및 포트폴리오 렌더링 시작
                            </button>
                        </div>
                    )}
                </section>

                <section className="toss-card p-7 md:p-9">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <h2 className="text-3xl font-extrabold md:text-[2rem]">작업 상태</h2>
                        <span className="rounded-full bg-[#eff4ff] px-4 py-1.5 text-sm font-extrabold text-[var(--toss-sub)]">{jobStatusLabel}</span>
                    </div>

                    {!job && (
                        <div className="rounded-2xl border border-dashed border-[var(--toss-line)] bg-white/65 p-6 text-base text-[var(--toss-sub)]">
                            생성 버튼을 누르면 단계별 진행 상태와 로그가 표시됩니다.
                            <div className="mt-4 inline-flex items-center gap-1.5 text-base font-bold text-[var(--toss-primary)]">
                                먼저 주제를 입력해 시작하세요 <ArrowRight size={16} />
                            </div>
                        </div>
                    )}

                    {job && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[var(--toss-line)] bg-[#fcfdff] p-5">
                                <p className="text-lg font-extrabold leading-snug md:text-xl">{job.topic}</p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-[#d6e4ff] bg-[#eef4ff] px-4 py-3">
                                        <p className="text-xs font-extrabold tracking-[0.08em] text-[var(--toss-sub)]">현재 단계</p>
                                        <p className="mt-1 text-base font-extrabold text-[var(--toss-primary)] md:text-lg">{currentStageLabel}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#d6e4ff] bg-[#f3f8ff] px-4 py-3">
                                        <p className="text-xs font-extrabold tracking-[0.08em] text-[var(--toss-sub)]">완료율</p>
                                        <p className="mt-1 text-base font-extrabold text-[var(--toss-primary)] md:text-lg">{job.progressPct || 0}%</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                    {STAGES.map((stage, index) => (
                                        <span
                                            key={stage}
                                            className={`rounded-full px-3 py-1.5 font-bold ${
                                                index <= activeStageIndex
                                                    ? "bg-[var(--toss-primary-soft)] text-[var(--toss-primary)]"
                                                    : "bg-[#eef2fb] text-[var(--toss-sub)]"
                                            }`}
                                        >
                                            {STAGE_LABEL[stage]}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 h-3 w-full rounded-full bg-[#e5ecfb]">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-[#2f6fff] to-[#0da6b2] transition-all"
                                        style={{ width: `${job.progressPct || 0}%` }}
                                    />
                                </div>
                            </div>

                            {job.status === "PENDING" && job.progressStage === "IDLE" && (
                                <div className="rounded-2xl border border-[#ffe1bf] bg-[#fff9f1] p-4 text-base text-[#9a5a12]">
                                    <div className="inline-flex items-center gap-2 font-bold">
                                        <TriangleAlert size={16} />
                                        작업이 대기 상태에 머물고 있습니다.
                                    </div>
                                    <p className="mt-1 text-sm">서버의 worker 실행 상태를 확인해 주세요.</p>
                                </div>
                            )}

                            <div className="max-h-72 overflow-y-auto rounded-2xl border border-[var(--toss-line)] bg-white p-4 font-mono text-sm leading-relaxed text-[var(--toss-sub)]">
                                {job.logs?.length ? (
                                    job.logs.map((log) => (
                                        <div key={log.id}>
                                            [{formatLogTime(log)}] {log.message}
                                        </div>
                                    ))
                                ) : (
                                    <div>로그를 불러오는 중...</div>
                                )}
                            </div>

                            {job.status === "FAILED" && (
                                <div className="rounded-2xl border border-[#ffd7d9] bg-[#fff5f5] p-4 text-base font-semibold text-[var(--toss-danger)]">
                                    {job.errorMessage || "작업이 실패했습니다."}
                                </div>
                            )}

                            {job.status === "COMPLETED" && job.resultUrl && (
                                <div className="rounded-2xl border border-[#d6e4ff] bg-[#f5f9ff] p-5">
                                    <p className="inline-flex items-center gap-1.5 text-base font-extrabold text-[var(--toss-ok)]">
                                        <CheckCircle2 size={16} />
                                        보고서 생성 완료
                                    </p>
                                    <iframe
                                        src={job.resultUrl}
                                        title="report-preview"
                                        className="mt-3 h-96 w-full rounded-xl border border-[var(--toss-line)] bg-white"
                                    />
                                    <div className="mt-3 flex flex-wrap gap-2.5">
                                        <a
                                            href={job.resultUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="toss-secondary-btn inline-flex h-11 items-center px-5 text-base font-bold"
                                        >
                                            전체 보고서 보기
                                        </a>
                                        <a
                                            href={`/api/jobs/download?id=${job.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#c9d9fb] bg-[#edf4ff] px-5 text-base font-bold text-[var(--toss-primary)] hover:bg-[#e4efff]"
                                        >
                                            <Download size={16} />
                                            PDF 다운로드
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
