import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../../lib/auth";
import { prisma } from "shared";

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
];

export default async function PricingPage() {
    const session = await getServerSession(getAuthOptions());

    let credits = 0;
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { credits: true },
        });
        credits = user?.credits || 0;
    }

    return (
        <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
            <section className="toss-card p-7 md:p-9">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="toss-chip">요금제</p>
                        <h1 className="mt-3 text-3xl font-extrabold text-[var(--toss-ink)] md:text-4xl">
                            필요한 만큼 선택하세요
                        </h1>
                        <p className="mt-2 text-sm text-[var(--toss-sub)]">
                            무료로 시작하고, 더 긴 분량이 필요할 때 프로/프리미엄으로 확장하면 됩니다.
                        </p>
                    </div>
                    {session?.user ? (
                        <div className="rounded-2xl border border-[var(--toss-line)] bg-[#f4f8ff] px-4 py-3 text-sm text-[var(--toss-sub)]">
                            현재 보유 크레딧: <strong className="text-[var(--toss-primary)]">{credits} 크레딧</strong>
                        </div>
                    ) : (
                        <Link href="/login?next=/pricing" className="toss-secondary-btn inline-flex px-4 py-2 text-sm">
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
                            className={`rounded-3xl border p-6 shadow-sm ${
                                plan.featured
                                    ? "border-[#bdd1ff] bg-[#f2f7ff]"
                                    : "border-[var(--toss-line)] bg-white"
                            }`}
                        >
                            {plan.featured && (
                                <span className="mb-4 inline-flex rounded-full bg-[var(--toss-primary)] px-3 py-1 text-xs font-bold text-white">
                                    추천 플랜
                                </span>
                            )}
                            <h2 className="text-xl font-extrabold text-[var(--toss-ink)]">{plan.title}</h2>
                            <p className="mt-2 text-sm text-[var(--toss-sub)]">{plan.subtitle}</p>
                            <p className="mt-4 text-2xl font-extrabold text-[var(--toss-ink)]">{plan.price}</p>
                            <p className="mt-1 text-sm font-semibold text-[var(--toss-primary)]">{plan.credits}</p>

                            <ul className="mt-5 space-y-2 text-sm text-[var(--toss-sub)]">
                                {plan.points.map((item) => (
                                    <li key={item}>- {item}</li>
                                ))}
                            </ul>

                            <Link
                                href={href}
                                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold ${
                                    plan.featured ? "toss-primary-btn" : "toss-secondary-btn"
                                }`}
                            >
                                {label}
                            </Link>
                        </article>
                    );
                })}
            </section>
        </main>
    );
}
