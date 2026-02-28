"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Coins, LogOut, Sparkles, UserCircle2 } from "lucide-react";

export function Nav() {
    const { data: session, status } = useSession();

    return (
        <nav className="sticky top-0 z-50 px-3 pt-3 md:px-5">
            <div className="mx-auto max-w-6xl">
                <div className="toss-card flex h-16 items-center justify-between rounded-[999px] px-5 md:px-7">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="rounded-full bg-[var(--toss-primary-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--toss-primary)]">
                            polio
                        </span>
                        <span className="text-sm font-bold text-[var(--toss-ink)] md:text-base">포트폴리오 생성기</span>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-3">
                        <Link
                            href="/"
                            className="hidden rounded-full border border-[var(--toss-line)] bg-white/85 px-4 py-2 text-xs font-bold text-[var(--toss-sub)] transition hover:border-[#9ebfff] hover:bg-white md:inline-flex"
                        >
                            생성
                        </Link>
                        <Link
                            href="/pricing"
                            className="hidden rounded-full border border-[var(--toss-line)] bg-white/85 px-4 py-2 text-xs font-bold text-[var(--toss-sub)] transition hover:border-[#9ebfff] hover:bg-white md:inline-flex"
                        >
                            요금제
                        </Link>

                        {status === "loading" ? (
                            <div className="h-9 w-24 animate-pulse rounded-full bg-[#dfeafe]" />
                        ) : session ? (
                            <>
                                <div className="hidden items-center gap-1 rounded-full bg-[var(--toss-primary-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--toss-primary)] md:flex">
                                    <Coins size={14} />
                                    {session.user?.credits ?? 0} 크레딧
                                </div>

                                <div className="hidden items-center gap-2 rounded-full border border-[var(--toss-line)] bg-white px-3 py-1.5 text-sm text-[var(--toss-sub)] md:flex">
                                {session.user?.image ? (
                                        <Image src={session.user.image} alt="프로필" width={20} height={20} className="h-5 w-5 rounded-full" />
                                    ) : (
                                        <UserCircle2 size={16} />
                                    )}
                                    <span className="max-w-[120px] truncate font-semibold">{session.user?.name || "사용자"}</span>
                                    {session.user?.isAdmin && (
                                        <span className="ml-1 rounded bg-[#ffebeb] px-1.5 py-0.5 text-[0.65rem] font-bold text-[#f04452]">
                                            운영자
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="inline-flex items-center gap-1 rounded-full border border-[var(--toss-line)] bg-white px-4 py-2 text-xs font-bold text-[var(--toss-sub)] transition hover:border-[#a6c4ff] hover:bg-[#f1f6ff]"
                                >
                                    <LogOut size={14} />
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login?next=/"
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--toss-primary)] px-4 py-2 text-xs font-extrabold text-white transition hover:brightness-105"
                            >
                                <Sparkles size={14} />
                                로그인
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
