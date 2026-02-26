import { AlertTriangle, BookOpen, CheckCircle2 } from "lucide-react";
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
        <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
            <div className="toss-card overflow-hidden">
                <div className="grid md:grid-cols-[1.1fr_1fr]">
                    <div className="border-b border-[var(--toss-line)] bg-[#f2f7ff] p-8 md:border-b-0 md:border-r">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--toss-primary)]">
                            <BookOpen size={20} />
                        </div>
                        <h1 className="mt-4 text-3xl font-extrabold">로그인</h1>
                        <p className="mt-2 text-sm text-[var(--toss-sub)]">
                            Google 계정으로 로그인하면 보고서 생성, 결제, 작업 내역 저장 기능을 사용할 수 있어요.
                        </p>

                        <ul className="mt-6 space-y-2 text-sm text-[var(--toss-sub)]">
                            <li>- 내 작업은 계정 기준으로 안전하게 관리됩니다.</li>
                            <li>- 크레딧과 결제 내역이 자동으로 연동됩니다.</li>
                            <li>- 유료 작업 실패 시 환불 로직이 동작합니다.</li>
                        </ul>
                    </div>

                    <div className="p-8">
                        {isGoogleAuthReady ? (
                            <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#cdeedc] bg-[#f2fff8] px-3 py-2 text-sm text-[#16794f]">
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                <p>Google OAuth 설정이 확인되었습니다.</p>
                            </div>
                        ) : (
                            <div className="mb-4 rounded-xl border border-[#ffd8c2] bg-[#fff6ef] px-3 py-3 text-sm text-[#9a4d00]">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <p className="font-semibold">Google OAuth 설정이 완전하지 않습니다.</p>
                                </div>
                                {isDev && (
                                    <div className="mt-2 space-y-1 pl-6 text-xs">
                                        <p>CLIENT_ID 형식: 숫자-문자.apps.googleusercontent.com</p>
                                        <p>CLIENT_SECRET: 비어 있으면 안 됩니다</p>
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
