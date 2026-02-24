"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Lock, Coins } from "lucide-react";
import type { Job, JobProgressStage } from "shared";

const STAGES: JobProgressStage[] = ["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"];
const TIER_COSTS = { FREE: 0, PAID_TIER_1: 3, PAID_TIER_2: 5 };

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

    const activeStageIndex = STAGES.indexOf(job?.progressStage || "IDLE");

    return (
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 text-gray-900 font-sans p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="text-center pt-8">
                    <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Portfolio Report Builder</h1>
                    <p className="text-gray-600">AI-powered 1-30 page high-quality reports.</p>
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
                            <h3 className="text-xl font-bold text-yellow-900">Premium Feature Locked</h3>
                            <p className="text-yellow-800 mt-1">This tier costs <b>{cost} Credits</b>, but you only have {userCredits}.</p>
                        </div>
                        <a href={`/checkout?product=${tier}`} className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-yellow-600 transition flex items-center gap-2 shadow-md">
                            <Coins size={20} /> Purchase Credits
                        </a>
                    </div>
                )}

                {!job && (
                    <form onSubmit={createJob} className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Research Topic</label>
                            <input
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Artificial Intelligence in Education 2026"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Language</label>
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Korean">Korean</option>
                                    <option value="English">English</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 flex justify-between">
                                    <span>Size / Tier</span>
                                    <span className="text-gray-400 font-normal">Cost</span>
                                </label>
                                <select
                                    value={tier}
                                    onChange={e => handleTierChange(e.target.value)}
                                    className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-left"
                                >
                                    <option value="FREE">FREE (1-10 Pages) - 0 Credits</option>
                                    <option value="PAID_TIER_1">PRO (11-20 Pages) - 3 Credits 🔒</option>
                                    <option value="PAID_TIER_2">PREMIUM (21-30 Pages) - 5 Credits 🔒</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={requireCredits && !canAfford}
                            className={`w-full font-bold py-3 rounded transition ${requireCredits && !canAfford ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {requireCredits && !canAfford ? 'Insufficient Credits' : 'Generate Portfolio'}
                        </button>
                    </form>
                )}

                {/* --- Progress UI stays the same --- */}
                {job && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2">Status: {job.topic}</h2>

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
                                Job Failed: {job.errorMessage}
                                <div className="text-sm font-normal mt-1 text-red-600">If credits were deducted, they have automatically been refunded to your account.</div>
                                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white text-red-700 border-red-300 border rounded cursor-pointer">Start Over</button>
                            </div>
                        )}

                        {job.status === "COMPLETED" && job.resultUrl && (
                            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center space-y-4">
                                <h3 className="text-green-800 font-extrabold text-xl">✅ Report Generation Complete!</h3>
                                <iframe
                                    src={job.resultUrl}
                                    className="w-full h-96 border rounded bg-white shadow-inner"
                                    title="PDF Preview"
                                />

                                <div className="flex gap-4 pt-4">
                                    <a href={job.resultUrl} download className="flex-1 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
                                        Download PDF
                                    </a>
                                    <button onClick={() => navigator.clipboard.writeText("Submitted via Antigravity Portfolio Generator")} className="flex-1 bg-white border-2 border-green-600 text-green-700 font-bold py-3 rounded hover:bg-green-50 transition">
                                        Copy for Submission
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
