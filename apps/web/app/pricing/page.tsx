import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { Sparkles, BadgeCheck, Gem } from "lucide-react";
import { getAuthOptions } from "../../lib/auth";
import { prisma } from "shared";
import { isAdminEmail } from "../../lib/rbac";

const PLANS = [
    {
        id: "FREE",
        title: "무료",
        subtitle: "가볍게 시작하는 기본 플랜",
        price: "0원",
        credits: "0 크레딧",
        points: ["1-10쪽 생성", "기본 생성 속도", "서비스 체험용으로 적합"],
        cta: { label: "무료로 시작", href: "/" },
        featured: false,
    },
    {
        id: "PRO_PACK",
        title: "프로",
        subtitle: "충분한 분량과 안정적인 품질",
        price: "3,000원",
        credits: "3 크레딧",
        points: ["11-20쪽 생성", "리서치 밀도 강화", "구조 완성도 향상"],
        cta: { label: "프로 구매", href: "/checkout?product=PRO_PACK" },
        featured: true,
    },
    {
        id: "PREMIUM_PACK",
        title: "프리미엄",
        subtitle: "심화 분석 중심의 고급 리포트",
        price: "5,000원",
        credits: "5 크레딧",
        points: ["21-30쪽 생성", "고밀도 분석", "제출용 완성도 최적화"],
        cta: { label: "프리미엄 구매", href: "/checkout?product=PREMIUM_PACK" },
        featured: false,
    },
] as const;

export default async function PricingPage() {
    const session = await getServerSession(getAuthOptions());
    const adminBaseCredits = Number(process.env.ADMIN_BASE_CREDITS || "10000");

    let credits = 0;
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, credits: true, email: true },
        });

        if (user) {
            const admin = isAdminEmail(user.email || session.user.email);
            if (admin && Number.isFinite(adminBaseCredits) && adminBaseCredits > 0 && user.credits < adminBaseCredits) {
                const updated = await prisma.user.update({
                    where: { id: user.id },
                    data: { credits: adminBaseCredits },
                    select: { credits: true },
                });
                credits = updated.credits;
            } else {
                credits = user.credits;
            }
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
            <section className="toss-card p-7 md:p-9">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="toss-chip">Pricing</p>
                        <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">프로젝트 규모에 맞춰 유연하게 선택하세요</h1>
                        <p className="mt-2 max-w-2xl text-sm text-[var(--toss-sub)] md:text-base">
                            무료로 시작한 뒤, 필요 분량이 커질 때 프로와 프리미엄으로 확장하면 됩니다.
                            크레딧은 즉시 반영되고 실패 작업에는 복구 로직이 적용됩니다.
                        </p>
                    </div>

                    {session?.user ? (
                        <div className="rounded-2xl border border-[var(--toss-line)] bg-[#edf4ff] px-4 py-3 text-sm text-[var(--toss-sub)]">
                            현재 보유 크레딧: <strong className="font-extrabold text-[var(--toss-primary)]">{credits} 크레딧</strong>
                        </div>
                    ) : (
                        <Link href="/login?next=/pricing" className="toss-secondary-btn inline-flex px-4 py-2 text-sm font-bold">
                            로그인하고 구매하기
                        </Link>
                    )}
                </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
                {PLANS.map((plan) => {
                    const href = session?.user ? plan.cta.href : "/login?next=/pricing";
                    const label = session?.user ? plan.cta.label : "로그인 후 이용";

                    return (
                        <article
                            key={plan.id}
                            className={`relative overflow-hidden rounded-3xl border p-6 ${
                                plan.featured
                                    ? "border-[#b8d0ff] bg-gradient-to-b from-[#f1f7ff] to-[#eaf3ff] shadow-[0_16px_32px_rgba(36,99,235,0.18)]"
                                    : "border-[var(--toss-line)] bg-white/90 shadow-[0_10px_22px_rgba(28,60,125,0.1)]"
                            }`}
                        >
                            <div className="pointer-events-none absolute -right-14 -top-10 h-28 w-28 rounded-full bg-[#d9ebff]" />
                            <div className="relative">
                                {plan.featured ? (
                                    <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-[var(--toss-primary)] px-3 py-1 text-xs font-extrabold text-white">
                                        <Sparkles size={13} /> 추천 플랜
                                    </span>
                                ) : (
                                    <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-[#f1f5ff] px-3 py-1 text-xs font-extrabold text-[var(--toss-sub)]">
                                        {plan.id === "FREE" ? <BadgeCheck size={13} /> : <Gem size={13} />} {plan.id.replace("_", " ")}
                                    </span>
                                )}

                                <h2 className="text-2xl font-extrabold text-[var(--toss-ink)]">{plan.title}</h2>
                                <p className="mt-2 text-sm text-[var(--toss-sub)]">{plan.subtitle}</p>
                                <p className="mt-5 text-3xl font-extrabold text-[var(--toss-ink)]">{plan.price}</p>
                                <p className="mt-1 text-sm font-bold text-[var(--toss-primary)]">{plan.credits}</p>

                                <ul className="mt-5 space-y-2.5 text-sm text-[var(--toss-sub)]">
                                    {plan.points.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 leading-6">
                                            <span className="mt-2 block h-2 w-2 shrink-0 rounded-full bg-[var(--toss-primary)]" />
                                            <span className="block">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={href}
                                    className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-extrabold ${
                                        plan.featured ? "toss-primary-btn" : "toss-secondary-btn"
                                    }`}
                                >
                                    {label}
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </section>
        </main>
    );
}
