"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

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
            .catch((err) => {
                console.error(err);
                setError(err.message);
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

    if (!product)
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-md">
                    <div className="mb-4 font-bold text-red-500">입력 오류</div>
                    <div className="mb-6 text-gray-700">상품이 선택되지 않았습니다.</div>
                    <button
                        onClick={() => (window.location.href = "/pricing")}
                        className="w-full rounded-full bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                    >
                        요금제로 돌아가기
                    </button>
                </div>
            </div>
        );

    if (loading) return <div className="p-8 text-center text-gray-500">결제 모듈을 불러오는 중...</div>;

    if (error)
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-md">
                    <div className="mb-4 font-bold text-red-500">입력 오류</div>
                    <div className="mb-6 text-gray-700">{error}</div>
                    <button
                        onClick={() => (window.location.href = "/pricing")}
                        className="w-full rounded-full bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                    >
                        요금제로 돌아가기
                    </button>
                </div>
            </div>
        );

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">결제하기</h2>

                <div className="mb-6 flex items-center justify-between rounded-2xl bg-gray-100 p-4">
                    <span className="font-medium text-gray-700">{orderInfo?.orderName}</span>
                    <span className="text-xl font-bold text-blue-600">₩{orderInfo?.amount.toLocaleString()}</span>
                </div>

                <div id="payment-method"></div>
                <div id="agreement"></div>

                <button
                    onClick={handlePaymentRequest}
                    className="mt-6 w-full rounded-full bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                >
                    결제 진행
                </button>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">결제 모듈을 불러오는 중...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
