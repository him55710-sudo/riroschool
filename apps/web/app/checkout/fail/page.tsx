"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

function CheckoutFailContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || "";
    const message = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
    const orderId = searchParams.get("orderId") || "";

    return (
        <div className="mx-auto max-w-xl px-4 py-16">
            <div className="toss-card p-8 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#cc4154]">
                    <AlertTriangle size={24} />
                </div>
                <h1 className="text-3xl font-extrabold">결제에 실패했습니다</h1>
                <p className="mt-2 text-sm text-[var(--toss-sub)]">{message}</p>

                <div className="mt-6 rounded-2xl border border-[var(--toss-line)] bg-[#f4f8ff] p-4 text-left text-sm text-[var(--toss-sub)]">
                    <p>
                        <strong className="font-extrabold text-[var(--toss-ink)]">오류 코드:</strong> {code || "정보 없음"}
                    </p>
                    <p className="mt-1">
                        <strong className="font-extrabold text-[var(--toss-ink)]">주문 번호:</strong> {orderId || "정보 없음"}
                    </p>
                </div>

                <button
                    onClick={() => (window.location.href = "/pricing")}
                    className="toss-secondary-btn mt-6 inline-flex px-4 py-2 text-sm font-bold"
                >
                    요금제로 돌아가기
                </button>
            </div>
        </div>
    );
}

export default function CheckoutFailPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-[var(--toss-sub)]">로딩 중...</div>}>
            <CheckoutFailContent />
        </Suspense>
    );
}
