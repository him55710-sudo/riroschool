import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../../lib/auth";
import Link from "next/link";
import { prisma } from "shared";

export default async function PricingPage() {
    const session = await getServerSession(getAuthOptions());
    let credits = 0;

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { credits: true }
        });
        credits = user?.credits || 0;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
            <div className="max-w-7xl w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        크레딧 요금제
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        필요한 보고서 분량에 맞춰 가장 알맞은 요금제를 선택하세요 ✨
                    </p>
                    {session?.user && (
                        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg inline-block">
                            <span className="font-semibold">현재 보유 크레딧:</span> {credits} 크레딧
                        </div>
                    )}
                </div>

                <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">

                    {/* FREE Tier */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">FREE</h2>
                            <p className="mt-4 text-sm text-gray-500">가벼운 요약과 기본 개요 확인에 딱 맞아요.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">무료</span>
                            </p>
                            <Link href="/">
                                <button className="mt-8 block w-full bg-gray-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-700 transition">
                                    무료로 시작하기
                                </button>
                            </Link>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">지원 기능</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ 1~10쪽 분량</span>
                                </li>
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ 일반 속도 생성</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* PRO Tier */}
                    <div className="border border-blue-500 rounded-lg shadow-md divide-y divide-gray-200 bg-white relative">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">추천! 인기 플랜</span>
                        </div>
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">PRO 요금제 <span className="text-sm font-normal text-gray-500">(3 크레딧)</span></h2>
                            <p className="mt-4 text-sm text-gray-500">상세한 구조와 깊이 있는 세특 탐구용으로 가장 많이 선택해요.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">₩3,000</span>
                            </p>
                            {session?.user ? (
                                <Link href="/checkout?product=PRO_PACK">
                                    <button className="mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700 transition">
                                        3 크레딧 충전하기
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/api/auth/signin">
                                    <button className="mt-8 block w-full bg-blue-100 border border-transparent rounded-md py-2 text-sm font-semibold text-blue-700 text-center hover:bg-blue-200 transition">
                                        로그인 후 결제하기
                                    </button>
                                </Link>
                            )}
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">지원 기능</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span className="font-semibold text-blue-600">✓ 11~20쪽 분량의 풍부한 리포트</span>
                                </li>
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ 고품질 참고문헌 및 출처 정리</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* PREMIUM Tier */}
                    <div className="border border-purple-500 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">PREMIUM 요금제 <span className="text-sm font-normal text-gray-500">(5 크레딧)</span></h2>
                            <p className="mt-4 text-sm text-gray-500">대학 학술제 수준의 깊이와 완벽한 분량을 자랑하는 완전판입니다.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">₩5,000</span>
                            </p>
                            {session?.user ? (
                                <Link href="/checkout?product=PREMIUM_PACK">
                                    <button className="mt-8 block w-full bg-purple-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-purple-700 transition">
                                        5 크레딧 충전하기
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/api/auth/signin">
                                    <button className="mt-8 block w-full bg-purple-100 border border-transparent rounded-md py-2 text-sm font-semibold text-purple-700 text-center hover:bg-purple-200 transition">
                                        로그인 후 결제하기
                                    </button>
                                </Link>
                            )}
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">지원 기능</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span className="font-semibold text-purple-600">✓ 21~30쪽 분량의 전문 리포트</span>
                                </li>
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ 논문급 방대한 출처 및 최대 깊이 분석</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
