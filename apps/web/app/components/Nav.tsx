"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Coins, LogOut, Sparkles, UserCircle2 } from "lucide-react";

export function Nav() {
    const { data: session, status } = useSession();

    return (
        <nav className="sticky top-0 z-50 px-3 py-3 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-[999px] border border-[var(--toss-line)] bg-white/90 px-5 shadow-[0_8px_20px_rgba(83,132,255,0.18)] md:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--toss-primary-soft)] px-3 py-1 text-xs font-extrabold lowercase text-[var(--toss-primary)]">
                        polio
                    </span>
                    <span className="text-sm font-bold text-[var(--toss-ink)] md:text-base">
                        포트폴리오 생성기
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/pricing"
                        className="hidden rounded-full border border-[var(--toss-line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--toss-sub)] md:inline-flex"
                    >
                        요금제
                    </Link>

                    {status === "loading" ? (
                        <div className="h-9 w-24 animate-pulse rounded-full bg-[#e8efff]" />
                    ) : session ? (
                        <>
                            <div className="hidden items-center gap-1 rounded-full bg-[var(--toss-primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--toss-primary)] md:flex">
                                <Coins size={14} />
                                {session.user?.credits ?? 0} 크레딧
                            </div>

                            <div className="hidden items-center gap-2 rounded-full border border-[var(--toss-line)] bg-white px-3 py-1.5 text-sm text-[var(--toss-sub)] md:flex">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="프로필" className="h-5 w-5 rounded-full" />
                                ) : (
                                    <UserCircle2 size={16} />
                                )}
                                <span className="max-w-[120px] truncate">{session.user?.name || "사용자"}</span>
                            </div>

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--toss-line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--toss-sub)] hover:bg-[#f4f8ff]"
                            >
                                <LogOut size={14} />
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login?next=/"
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--toss-primary)] px-4 py-2 text-xs font-semibold text-white hover:brightness-105"
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
