"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const hasRequiredParams = Boolean(paymentKey && orderId && amount);

    const [status, setStatus] = useState<"LOADING" | "DONE" | "WAITING_FOR_DEPOSIT" | "ERROR">("LOADING");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!hasRequiredParams) return;

        fetch("/api/payments/toss/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentKey, orderId, amount }),
        })
            .then((res) => res.json().then((data) => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status >= 400) {
                    setStatus("ERROR");
                    setMessage(body.error || "결제 확인에 실패했습니다.");
                } else if (body.status === "DONE") {
                    setStatus("DONE");
                } else if (body.status === "WAITING_FOR_DEPOSIT") {
                    setStatus("WAITING_FOR_DEPOSIT");
                } else {
                    setStatus("ERROR");
                    setMessage(`알 수 없는 결제 상태: ${body.status}`);
                }
            })
            .catch((err) => {
                setStatus("ERROR");
                setMessage(err.message);
            });
    }, [hasRequiredParams, paymentKey, orderId, amount]);

    if (!hasRequiredParams) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-md">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 className="mb-2 text-xl font-bold text-red-600">결제 확인 실패</h1>
                    <p className="mb-6 text-gray-600">결제 확인 파라미터가 올바르지 않습니다.</p>
                    <Link href="/pricing">
                        <button className="w-full rounded-full bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                            요금제로 돌아가기
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-md">
                {status === "LOADING" && (
                    <div>
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <h1 className="text-xl font-bold text-gray-900">결제를 확인하는 중입니다...</h1>
                        <p className="mt-2 text-sm text-gray-500">잠시만 기다려 주세요. 페이지를 닫지 마세요.</p>
                    </div>
                )}

                {status === "DONE" && (
                    <div>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">결제가 완료되었습니다!</h1>
                        <p className="mb-6 text-gray-600">크레딧이 정상적으로 충전되었습니다.</p>
                        <Link href="/">
                            <button className="w-full rounded-full bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                                홈으로 이동
                            </button>
                        </Link>
                    </div>
                )}

                {status === "WAITING_FOR_DEPOSIT" && (
                    <div>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                            <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">입금 대기 중입니다</h1>
                        <p className="mb-6 text-gray-600">입금이 확인되면 크레딧이 자동으로 충전됩니다.</p>
                        <Link href="/">
                            <button className="w-full rounded-full border border-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-50">
                                확인
                            </button>
                        </Link>
                    </div>
                )}

                {status === "ERROR" && (
                    <div>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h1 className="mb-2 text-xl font-bold text-red-600">결제 확인 실패</h1>
                        <p className="mb-6 text-gray-600">{message}</p>
                        <Link href="/pricing">
                            <button className="w-full rounded-full bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
                                요금제로 돌아가기
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">로딩 중...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
