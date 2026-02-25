"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Lock, Coins } from "lucide-react";
import type { JobProgressStage } from "shared";

interface Job {
    id: string;
    topic: string;
    status: string;
    progressStage: string;
    progressPct?: number;
    errorMessage?: string;
    resultUrl?: string;
    logs?: any[];
}

const STAGES: JobProgressStage[] = ["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"];
const TIER_COSTS = { FREE: 0, PRO_PACK: 3, PREMIUM_PACK: 5 };

export default function Home() {
    const { data: session } = useSession();
    const [topic, setTopic] = useState("");
    const [language, setLanguage] = useState("Korean");
    const [tier, setTier] = useState("FREE");
    const [job, setJob] = useState<Job | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const userCredits = session?.user?.credits || 0;
    const requireCredits = (tier as keyof typeof TIER_COSTS) !== "FREE";
    const cost = TIER_COSTS[tier as keyof typeof TIER_COSTS];
    const canAfford = userCredits >= cost;

    const handleTierChange = (newTier: string) => {
        setTier(newTier);
        if (newTier !== "FREE" && (!session || userCredits < TIER_COSTS[newTier as keyof typeof TIER_COSTS])) {
            setShowPaywall(true);
        } else {
            setShowPaywall(false);
        }
    };

    const createJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;
        setErrorMsg("");

        if (requireCredits && !canAfford) {
            setShowPaywall(true);
            return;
        }

        const res = await fetch("/api/jobs", {
            method: "POST",
            body: JSON.stringify({ topic, language, tier }),
            headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) {
            const d = await res.json();
            setErrorMsg(d.error || "Failed to create job");
            return;
        }

        const newJob = await res.json();
        setJob(newJob);

        // Quick reload window to reflect balance decrement (hacky but works for demo)
        if (cost > 0) setTimeout(() => window.location.reload(), 2000);
    };

    useEffect(() => {
        if (!job || job.status === "COMPLETED" || job.status === "FAILED") return;

        const interval = setInterval(async () => {
            const res = await fetch(`/api/jobs?id=${job.id}`);
            if (res.ok) {
                const updatedJob = await res.json();
                setJob(updatedJob);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [job?.id, job?.status]);

    const activeStageIndex = STAGES.indexOf((job?.progressStage as JobProgressStage) || "IDLE");

    return (
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 text-gray-900 font-sans p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="text-center pt-8">
                    <h1 className="text-4xl font-extrabold text-blue-900 mb-2">항상 앞서가는 생기부 메이커</h1>
                    <p className="text-gray-600">AI가 도와주는 1~30쪽 분량의 압도적인 탐구 보고서를 완성해보세요!</p>
                </header>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded font-semibold text-center">
                        {errorMsg}
                    </div>
                )}

                {showPaywall && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl flex flex-col items-center text-center space-y-4 shadow-sm animate-pulse-fast">
                        <div className="bg-white p-3 rounded-full text-yellow-500 shadow-sm">
                            <Lock size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-yellow-900">유료 플랜 전용 기능입니다 🔒</h3>
                            <p className="text-yellow-800 mt-1">이 플랜은 <b>{cost} 크레딧</b>이 필요합니다. (현재 보유: {userCredits} 크레딧)</p>
                        </div>
                        <a href={`/checkout?product=${tier}`} className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-600 transition flex items-center gap-2 shadow-md">
                            <Coins size={20} /> 크레딧 충전하러 가기
                        </a>
                    </div>
                )}

                {!job && (
                    <form onSubmit={createJob} className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">어떤 주제로 보고서를 쓸까요?</label>
                            <input
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="예: 생성형 AI가 미래 교육에 미치는 영향 분석"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">언어 선택</label>
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Korean">한국어</option>
                                    <option value="English">영어</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 flex justify-between">
                                    <span>보고서 분량 / 플랜</span>
                                    <span className="text-gray-400 font-normal">필요 크레딧</span>
                                </label>
                                <select
                                    value={tier}
                                    onChange={e => handleTierChange(e.target.value)}
                                    className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-left"
                                >
                                    <option value="FREE">FREE (1~10쪽) - 무료 (0 크레딧)</option>
                                    <option value="PRO_PACK">PRO (11~20쪽) - 3 크레딧 🔒</option>
                                    <option value="PREMIUM_PACK">PREMIUM (21~30쪽) - 5 크레딧 🔒</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={requireCredits && !canAfford}
                            className={`w-full font-bold py-3 rounded transition ${requireCredits && !canAfford ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {requireCredits && !canAfford ? '크레딧이 부족합니다' : '멋진 포트폴리오 생성하기 ✨'}
                        </button>
                    </form>
                )}

                {/* --- Progress UI stays the same --- */}
                {job && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">작업 진행 상황: {job.topic}</h2>

                        <div className="relative pt-4">
                            <div className="flex justify-between text-xs font-semibold text-gray-400">
                                {STAGES.map((s, i) => (
                                    <span key={s} className={i <= activeStageIndex ? "text-blue-600" : ""}>{s}</span>
                                ))}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${job.progressPct || 0}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 font-mono text-sm rounded h-32 overflow-y-auto text-gray-700 flex flex-col-reverse">
                            {job.logs?.slice().reverse().map((log: any) => (
                                <div key={log.id}>[{new Date(log.ts || log.createdAt).toLocaleTimeString()}] {log.message}</div>
                            ))}
                            {!job.logs?.length && <div>Initializing...</div>}
                        </div>

                        {job.status === "FAILED" && (
                            <div className="bg-red-50 text-red-700 p-4 rounded font-bold border border-red-200">
                                작업 실패: {job.errorMessage}
                                <div className="text-sm font-normal mt-1 text-red-600">만약 크레딧이 차감되었다면 자동으로 환불 처리되었습니다.</div>
                                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white text-red-700 border-red-300 border rounded cursor-pointer hover:bg-red-50">처음부터 다시하기</button>
                            </div>
                        )}

                        {job.status === "COMPLETED" && job.resultUrl && (
                            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center space-y-4">
                                <h3 className="text-green-800 font-extrabold text-xl">✅ 탐구 보고서 생성이 완료되었습니다!</h3>
                                <iframe
                                    src={job.resultUrl}
                                    className="w-full h-96 border rounded bg-white shadow-inner"
                                    title="PDF Preview"
                                />

                                <div className="flex gap-4 pt-4">
                                    <a href={job.resultUrl} download className="flex-1 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
                                        📄 PDF 다운로드
                                    </a>
                                    <button onClick={() => navigator.clipboard.writeText("Submitted via Antigravity Portfolio Generator")} className="flex-1 bg-white border-2 border-green-600 text-green-700 font-bold py-3 rounded hover:bg-green-50 transition">
                                        🔗 제출용 링크 복사
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
