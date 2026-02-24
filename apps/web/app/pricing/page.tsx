import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { prisma } from "shared";

export default async function PricingPage() {
    const session = await getServerSession(authOptions);
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
                        Pricing & Plans
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Choose the right portfolio generation length for your needs.
                    </p>
                    {session?.user && (
                        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg inline-block">
                            <span className="font-semibold">Your Current Balance:</span> {credits} Credits
                        </div>
                    )}
                </div>

                <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">

                    {/* FREE Tier */}
                    <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">FREE</h2>
                            <p className="mt-4 text-sm text-gray-500">Perfect for quick summaries and basic outlines.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">₩0</span>
                            </p>
                            <Link href="/">
                                <button className="mt-8 block w-full bg-gray-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-700">
                                    Start for free
                                </button>
                            </Link>
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ 1-10 Pages</span>
                                </li>
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ Standard Generation Speed</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* PRO Tier */}
                    <div className="border border-blue-500 rounded-lg shadow-md divide-y divide-gray-200 bg-white relative">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                        </div>
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">PRO Pack <span className="text-sm font-normal text-gray-500">(3 Credits)</span></h2>
                            <p className="mt-4 text-sm text-gray-500">For deep structural portfolios with extensive research.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">₩3,000</span>
                            </p>
                            {session?.user ? (
                                <Link href="/checkout?product=PRO_PACK">
                                    <button className="mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                                        Buy 3 Credits
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/api/auth/signin">
                                    <button className="mt-8 block w-full bg-blue-100 border border-transparent rounded-md py-2 text-sm font-semibold text-blue-700 text-center hover:bg-blue-200">
                                        Sign in to Buy
                                    </button>
                                </Link>
                            )}
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span className="font-semibold text-blue-600">✓ 11-20 Pages</span>
                                </li>
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ High-Quality Citations</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* PREMIUM Tier */}
                    <div className="border border-purple-500 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">PREMIUM Pack <span className="text-sm font-normal text-gray-500">(5 Credits)</span></h2>
                            <p className="mt-4 text-sm text-gray-500">For academic-level long-form massive portfolios.</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">₩5,000</span>
                            </p>
                            {session?.user ? (
                                <Link href="/checkout?product=PREMIUM_PACK">
                                    <button className="mt-8 block w-full bg-purple-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-purple-700">
                                        Buy 5 Credits
                                    </button>
                                </Link>
                            ) : (
                                <Link href="/api/auth/signin">
                                    <button className="mt-8 block w-full bg-purple-100 border border-transparent rounded-md py-2 text-sm font-semibold text-purple-700 text-center hover:bg-purple-200">
                                        Sign in to Buy
                                    </button>
                                </Link>
                            )}
                        </div>
                        <div className="pt-6 pb-8 px-6">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span className="font-semibold text-purple-600">✓ 21-30 Pages</span>
                                </li>
                                <li className="flex space-x-3 text-sm text-gray-500">
                                    <span>✓ Maximum Source Capacity</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
