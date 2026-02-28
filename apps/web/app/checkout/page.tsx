"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { AlertTriangle, ArrowLeft, CreditCard, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

type OrderInfo = {
    orderId: string;
    amount: number;
    orderName: string;
    customerEmail?: string;
    customerName?: string;
};

function CheckoutContent() {
    const searchParams = useSearchParams();
    const product = searchParams.get("product");

    const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
    const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const paymentMethodsWidgetRef = useRef<unknown>(null);

    useEffect(() => {
        if (!product) return;

        fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product }),
        })
            .then((res) => res.json())
            .then(async (data) => {
                if (data.error) throw new Error(data.error);
                setOrderInfo(data);

                const widget = await loadPaymentWidget(TOSS_CLIENT_KEY, "@anonymous");
                setPaymentWidget(widget);
            })
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("결제 초기화에 실패했습니다.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [product]);

    useEffect(() => {
        if (paymentWidget && orderInfo) {
            const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                "#payment-method",
                { value: orderInfo.amount },
                { variantKey: "DEFAULT" }
            );

            paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
            paymentMethodsWidgetRef.current = paymentMethodsWidget;
        }
    }, [paymentWidget, orderInfo]);

    const handlePaymentRequest = async () => {
        if (!paymentWidget || !orderInfo) return;

        try {
            await paymentWidget.requestPayment({
                orderId: orderInfo.orderId,
                orderName: orderInfo.orderName,
                successUrl: `${window.location.origin}/checkout/success`,
                failUrl: `${window.location.origin}/checkout/fail`,
                customerEmail: orderInfo.customerEmail,
                customerName: orderInfo.customerName,
            });
        } catch (err: unknown) {
            console.error("결제 요청 실패", err);
        }
    };

    if (!product) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16">
                <div className="toss-card p-8 text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#cc4154]">
                        <AlertTriangle size={26} />
                    </div>
                    <h1 className="text-2xl font-extrabold">상품 선택 정보가 없습니다</h1>
                    <p className="mt-2 text-sm text-[var(--toss-sub)]">요금제 화면으로 돌아가 상품을 다시 선택해 주세요.</p>
                    <button
                        onClick={() => (window.location.href = "/pricing")}
                        className="toss-secondary-btn mt-6 inline-flex items-center gap-1 px-4 py-2 text-sm font-bold"
                    >
                        <ArrowLeft size={14} />
                        요금제로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-[var(--toss-sub)]">결제 모듈을 불러오는 중...</div>;
    }

    if (error) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16">
                <div className="toss-card p-8 text-center">
                    <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#cc4154]">
                        <AlertTriangle size={26} />
                    </div>
                    <h1 className="text-2xl font-extrabold">결제를 준비할 수 없습니다</h1>
                    <p className="mt-2 text-sm text-[var(--toss-sub)]">{error}</p>
                    <button
                        onClick={() => (window.location.href = "/pricing")}
                        className="toss-secondary-btn mt-6 inline-flex items-center gap-1 px-4 py-2 text-sm font-bold"
                    >
                        <ArrowLeft size={14} />
                        요금제로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-12 md:py-14">
            <div className="toss-card p-7 md:p-8">
                <div className="mb-6 flex items-center justify-between gap-2">
                    <h2 className="text-3xl font-extrabold">결제하기</h2>
                    <span className="toss-chip">
                        <CreditCard size={14} />
                        Toss Payments
                    </span>
                </div>

                <div className="mb-6 rounded-2xl border border-[var(--toss-line)] bg-[#f4f8ff] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-[var(--toss-sub)]">{orderInfo?.orderName}</span>
                        <span className="text-2xl font-extrabold text-[var(--toss-primary)]">₩{orderInfo?.amount.toLocaleString()}</span>
                    </div>
                </div>

                <div id="payment-method"></div>
                <div id="agreement"></div>

                <button onClick={handlePaymentRequest} className="toss-primary-btn mt-6 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold">
                    <Wallet size={16} />
                    결제 진행
                </button>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-[var(--toss-sub)]">결제 모듈을 불러오는 중...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
