"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";

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
            .catch((err: unknown) => {
                setStatus("ERROR");
                if (err instanceof Error) {
                    setMessage(err.message);
                } else {
                    setMessage("결제 상태 확인 중 오류가 발생했습니다.");
                }
            });
    }, [hasRequiredParams, paymentKey, orderId, amount]);

    if (!hasRequiredParams) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16">
                <div className="toss-card p-8 text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#cc4154]">
                        <AlertTriangle size={24} />
                    </div>
                    <h1 className="text-2xl font-extrabold">결제 확인에 필요한 정보가 없습니다</h1>
                    <p className="mt-2 text-sm text-[var(--toss-sub)]">요청 파라미터가 올바르지 않아 결제 결과를 확인할 수 없습니다.</p>
                    <Link href="/pricing" className="toss-secondary-btn mt-6 inline-flex px-4 py-2 text-sm font-bold">
                        요금제로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-16">
            <div className="toss-card p-8 text-center">
                {status === "LOADING" && (
                    <div>
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4ff] text-[var(--toss-primary)]">
                            <LoaderCircle size={24} className="animate-spin" />
                        </div>
                        <h1 className="text-2xl font-extrabold">결제를 확인하는 중입니다</h1>
                        <p className="mt-2 text-sm text-[var(--toss-sub)]">잠시만 기다려 주세요. 페이지를 닫지 마세요.</p>
                    </div>
                )}

                {status === "DONE" && (
                    <div>
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f9f0] text-[var(--toss-ok)]">
                            <CheckCircle2 size={24} />
                        </div>
                        <h1 className="text-3xl font-extrabold">결제가 완료되었습니다</h1>
                        <p className="mt-2 text-sm text-[var(--toss-sub)]">크레딧이 정상적으로 충전되었습니다.</p>
                        <Link href="/" className="toss-primary-btn mt-6 inline-flex px-4 py-2 text-sm font-extrabold">
                            홈으로 이동
                        </Link>
                    </div>
                )}

                {status === "WAITING_FOR_DEPOSIT" && (
                    <div>
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff6e8] text-[var(--toss-warn)]">
                            <Clock3 size={24} />
                        </div>
                        <h1 className="text-3xl font-extrabold">입금 대기 중입니다</h1>
                        <p className="mt-2 text-sm text-[var(--toss-sub)]">입금이 확인되면 크레딧이 자동으로 충전됩니다.</p>
                        <Link href="/" className="toss-secondary-btn mt-6 inline-flex px-4 py-2 text-sm font-bold">
                            확인
                        </Link>
                    </div>
                )}

                {status === "ERROR" && (
                    <div>
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#cc4154]">
                            <AlertTriangle size={24} />
                        </div>
                        <h1 className="text-2xl font-extrabold">결제 확인 실패</h1>
                        <p className="mt-2 text-sm text-[var(--toss-sub)]">{message}</p>
                        <Link href="/pricing" className="toss-secondary-btn mt-6 inline-flex px-4 py-2 text-sm font-bold">
                            요금제로 돌아가기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-[var(--toss-sub)]">로딩 중...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
