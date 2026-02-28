import { AlertTriangle, BookOpen, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { ClientLoginButton } from "./ClientLoginButton";
import { hasGoogleOAuthCredentials, normalizeGoogleClientId } from "../../lib/auth-env";

type LoginPageProps = {
    searchParams?: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = (await searchParams) || {};
    const callbackUrl = params.next || "/";

    const normalizedClientId = normalizeGoogleClientId(process.env.GOOGLE_CLIENT_ID || "");
    const hasClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
    const isGoogleAuthReady = hasGoogleOAuthCredentials();
    const isDev = process.env.NODE_ENV !== "production";

    return (
        <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
            <div className="toss-card overflow-hidden">
                <div className="grid md:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative border-b border-[var(--toss-line)] bg-gradient-to-br from-[#ecf4ff] to-[#f3f9ff] p-8 md:border-b-0 md:border-r">
                        <div className="pointer-events-none absolute -bottom-10 -right-12 h-36 w-36 rounded-full bg-[#d8edff]" />

                        <div className="relative">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--toss-primary)] shadow-[0_6px_14px_rgba(35,95,220,0.2)]">
                                <BookOpen size={20} />
                            </div>
                            <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">로그인</h1>
                            <p className="mt-2 text-sm text-[var(--toss-sub)] md:text-base">
                                Google 계정으로 로그인하면 생성 이력, 결제, 크레딧 정보를 한 계정에서 안정적으로 관리할 수 있습니다.
                            </p>

                            <ul className="mt-6 space-y-3 text-sm text-[var(--toss-sub)]">
                                <li className="inline-flex items-start gap-2">
                                    <Shield size={15} className="mt-0.5 text-[var(--toss-primary)]" />
                                    모든 작업은 계정 단위로 안전하게 연결됩니다.
                                </li>
                                <li className="inline-flex items-start gap-2">
                                    <Sparkles size={15} className="mt-0.5 text-[var(--toss-primary)]" />
                                    크레딧/결제 결과가 실시간으로 동기화됩니다.
                                </li>
                                <li className="inline-flex items-start gap-2">
                                    <CheckCircle2 size={15} className="mt-0.5 text-[var(--toss-primary)]" />
                                    유료 작업 실패 시 복구 로직이 자동으로 적용됩니다.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="p-8">
                        {isGoogleAuthReady ? (
                            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#cfe0ff] bg-[#f4f8ff] px-3 py-2 text-sm text-[#1d4ea3]">
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                <p className="font-semibold">Google OAuth 설정이 확인되었습니다.</p>
                            </div>
                        ) : (
                            <div className="mb-4 rounded-2xl border border-[#ffd8c2] bg-[#fff6ef] px-3 py-3 text-sm text-[#9a4d00]">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <p className="font-semibold">Google OAuth 설정이 완전하지 않습니다.</p>
                                </div>
                                {isDev && (
                                    <div className="mt-2 space-y-1 pl-6 text-xs">
                                        <p>CLIENT_ID 형식: 숫자-문자.apps.googleusercontent.com</p>
                                        <p>CLIENT_SECRET: 비어 있으면 안 됩니다.</p>
                                        <p>현재 CLIENT_ID: {normalizedClientId || "(비어 있음)"}</p>
                                        <p>현재 CLIENT_SECRET: {hasClientSecret ? "(입력됨)" : "(비어 있음)"}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <ClientLoginButton disabled={!isGoogleAuthReady} callbackUrl={callbackUrl} />
                    </div>
                </div>
            </div>
        </div>
    );
}
