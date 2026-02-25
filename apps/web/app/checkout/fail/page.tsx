"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutFailContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code") || "";
    const message = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
    const orderId = searchParams.get("orderId") || "";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="bg-gray-100 p-4 rounded text-sm text-left mb-6">
                    <p><strong>에러 코드:</strong> {code}</p>
                    <p><strong>주문 번호:</strong> {orderId}</p>
                </div>
                <button
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                >
                    돌아가기
                </button>
            </div>
        </div>
    );
}

export default function CheckoutFailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutFailContent />
        </Suspense>
    );
}
