"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

export function AdminControls({ currentVersion }: { currentVersion: string }) {
    const router = useRouter();

    const setVersion = async (version: string) => {
        await fetch("/api/admin/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activePromptVersion: version }),
        });
        router.refresh();
    };

    return (
        <div className="toss-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-2xl font-extrabold">
                    <Settings size={20} className="text-[var(--toss-primary)]" />
                    Prompt Version Control
                </h2>
                <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-extrabold text-[var(--toss-primary)]">Active: {currentVersion}</span>
            </div>

            <p className="mt-2 text-sm text-[var(--toss-sub)]">작업 생성에 사용하는 시스템 프롬프트 버전을 즉시 전환합니다.</p>

            <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => setVersion("v1")} className="toss-primary-btn px-4 py-2 text-sm font-extrabold">
                    Set Prompt V1
                </button>
                <button onClick={() => setVersion("v2")} className="toss-secondary-btn px-4 py-2 text-sm font-bold">
                    Set Prompt V2 (Strict)
                </button>
            </div>
        </div>
    );
}
