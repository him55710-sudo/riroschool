"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Coins, LogIn, LogOut, User as UserIcon } from "lucide-react";

export function Nav() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="font-extrabold text-xl tracking-tight text-blue-900 bg-blue-50 px-3 py-1 rounded">
                    RIRO<span className="text-gray-900 ml-1">PORTFOLIO</span>
                </div>

                <div className="flex items-center gap-6">
                    {status === "loading" ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                    ) : session ? (
                        <>
                            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-1.5 rounded-full font-bold border border-yellow-200">
                                <Coins size={18} />
                                <span>{session?.user?.credits || 0} Credits</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                <div className="flex items-center gap-1.5">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="User Avatar" className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <UserIcon size={16} />
                                    )}
                                    {session.user?.name}
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => signIn("google", { callbackUrl: '/' })}
                            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                        >
                            <LogIn size={18} /> Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
