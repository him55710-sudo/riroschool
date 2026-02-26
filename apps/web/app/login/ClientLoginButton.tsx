"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type ClientLoginButtonProps = {
    disabled?: boolean;
    callbackUrl?: string;
};

export function ClientLoginButton({ disabled = false, callbackUrl = "/" }: ClientLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const toFriendlyError = (code: string) => {
        switch (code) {
            case "Configuration":
                return "Google OAuth 설정이 완전하지 않습니다. .env.local 값을 확인해 주세요.";
            case "OAuthSignin":
            case "OAuthCallback":
                return "Google 로그인 과정에서 오류가 발생했습니다. 리디렉션 URI를 확인해 주세요.";
            case "AccessDenied":
                return "접근이 거부되었습니다. OAuth 동의 화면과 테스트 사용자 설정을 확인해 주세요.";
            default:
                return "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        }
    };

    const handleSignIn = async () => {
        if (disabled || isLoading) return;

        setIsLoading(true);
        setErrorMessage("");

        try {
            const result = await signIn("google", { callbackUrl, redirect: false });
            if (!result) {
                setErrorMessage("로그인 요청 생성에 실패했습니다.");
                return;
            }

            if (result.error) {
                setErrorMessage(toFriendlyError(result.error));
                return;
            }

            if (result.url) {
                const authUrl = new URL(result.url, window.location.origin);
                const errorCode = authUrl.searchParams.get("error");
                if (errorCode) {
                    setErrorMessage(toFriendlyError(errorCode));
                    return;
                }
                window.location.assign(result.url);
                return;
            }

            setErrorMessage("Google 로그인 페이지 이동에 실패했습니다.");
        } catch {
            setErrorMessage("로그인 중 예외가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <button
                onClick={handleSignIn}
                disabled={disabled || isLoading}
                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold transition ${
                    disabled || isLoading
                        ? "cursor-not-allowed border-[#e5e8eb] bg-[#f2f4f6] text-[#8b95a1]"
                        : "border-[#d7e5ff] bg-white text-[#2d79f5] hover:bg-[#f7fbff]"
                }`}
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isLoading ? "Google로 이동 중..." : "Google 계정으로 로그인"}
            </button>

            {errorMessage && (
                <p className="rounded-xl border border-[#ffd9d9] bg-[#fff5f5] px-3 py-2 text-sm text-[var(--toss-danger)]">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
