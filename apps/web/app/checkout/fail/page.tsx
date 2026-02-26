"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutFailContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || "";
    const message = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
    const orderId = searchParams.get("orderId") || "";

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">결제에 실패했습니다</h1>
                <p className="mb-6 text-gray-600">{message}</p>
                <div className="mb-6 rounded-2xl bg-gray-100 p-4 text-left text-sm">
                    <p>
                        <strong>오류 코드:</strong> {code}
                    </p>
                    <p>
                        <strong>주문 번호:</strong> {orderId}
                    </p>
                </div>
                <button
                    onClick={() => (window.location.href = "/pricing")}
                    className="w-full rounded-full bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                >
                    요금제로 돌아가기
                </button>
            </div>
        </div>
    );
}

export default function CheckoutFailPage() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <CheckoutFailContent />
        </Suspense>
    );
}
