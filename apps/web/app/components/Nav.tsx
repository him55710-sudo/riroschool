"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Coins, LogOut, Sparkles, UserCircle2 } from "lucide-react";

export function Nav() {
    const { data: session, status } = useSession();

    return (
        <nav className="sticky top-0 z-50 border-b border-[var(--toss-line)] bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="rounded-xl bg-[var(--toss-primary-soft)] px-2 py-1 text-xs font-extrabold text-[var(--toss-primary)]">
                        RIRO
                    </span>
                    <span className="text-sm font-bold text-[var(--toss-ink)] md:text-base">
                        포트폴리오 빌더
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/pricing"
                        className="hidden rounded-xl border border-[var(--toss-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--toss-sub)] md:inline-flex"
                    >
                        요금제
                    </Link>

                    {status === "loading" ? (
                        <div className="h-9 w-24 animate-pulse rounded-xl bg-[#f1f3f5]" />
                    ) : session ? (
                        <>
                            <div className="hidden items-center gap-1 rounded-full bg-[var(--toss-primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--toss-primary)] md:flex">
                                <Coins size={14} />
                                {session.user?.credits ?? 0} 크레딧
                            </div>

                            <div className="hidden items-center gap-2 rounded-xl border border-[var(--toss-line)] bg-white px-3 py-1.5 text-sm text-[var(--toss-sub)] md:flex">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="avatar" className="h-5 w-5 rounded-full" />
                                ) : (
                                    <UserCircle2 size={16} />
                                )}
                                <span className="max-w-[120px] truncate">{session.user?.name || "사용자"}</span>
                            </div>

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="inline-flex items-center gap-1 rounded-xl border border-[var(--toss-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--toss-sub)] hover:bg-[#f8f9fb]"
                            >
                                <LogOut size={14} />
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login?next=/"
                            className="inline-flex items-center gap-1 rounded-xl bg-[var(--toss-primary)] px-3 py-2 text-xs font-semibold text-white hover:brightness-105"
                        >
                            <Sparkles size={14} />
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
