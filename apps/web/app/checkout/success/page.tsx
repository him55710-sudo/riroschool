"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    const [status, setStatus] = useState<"LOADING" | "DONE" | "WAITING_FOR_DEPOSIT" | "ERROR">("LOADING");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!paymentKey || !orderId || !amount) {
            setStatus("ERROR");
            setMessage("Invalid parameters.");
            return;
        }

        fetch("/api/payments/toss/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentKey, orderId, amount })
        })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status >= 400) {
                    setStatus("ERROR");
                    setMessage(body.error || "Payment confirmation failed.");
                } else if (body.status === "DONE") {
                    setStatus("DONE");
                } else if (body.status === "WAITING_FOR_DEPOSIT") {
                    setStatus("WAITING_FOR_DEPOSIT");
                } else {
                    setStatus("ERROR");
                    setMessage("Unknown payment status: " + body.status);
                }
            })
            .catch(err => {
                setStatus("ERROR");
                setMessage(err.message);
            });
    }, [paymentKey, orderId, amount]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {status === "LOADING" && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h1 className="text-xl font-bold text-gray-900">결제 승인 중...</h1>
                        <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요. 페이지를 벗어나지 마세요.</p>
                    </div>
                )}

                {status === "DONE" && (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
                        <p className="text-gray-600 mb-6">크레딧이 정상적으로 충전되었습니다.</p>
                        <Link href="/">
                            <button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                                대시보드로 이동
                            </button>
                        </Link>
                    </div>
                )}

                {status === "WAITING_FOR_DEPOSIT" && (
                    <div>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">입금 대기 중</h1>
                        <p className="text-gray-600 mb-6">가상계좌 입금이 확인되면 크레딧이 충전됩니다.</p>
                        <Link href="/">
                            <button className="w-full border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-50">
                                확인
                            </button>
                        </Link>
                    </div>
                )}

                {status === "ERROR" && (
                    <div>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-red-600 mb-2">승인 실패</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link href="/pricing">
                            <button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                                돌아가기
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
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">분석 중...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
