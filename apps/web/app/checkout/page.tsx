"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

export const dynamic = "force-dynamic";

// In a real app, use NEXT_PUBLIC_TOSS_CLIENT_KEY from .env
// We will fallback to the official Toss test key if env is missing
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const product = searchParams.get("product"); // "PRO_PACK" or "PREMIUM_PACK"

    const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
    const [orderInfo, setOrderInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const paymentMethodsWidgetRef = useRef<any>(null);

    useEffect(() => {
        if (!product) {
            setError("No product selected.");
            setLoading(false);
            return;
        }

        // Initialize Order from our Server
        fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product })
        })
            .then(res => res.json())
            .then(async (data) => {
                if (data.error) throw new Error(data.error);
                setOrderInfo(data);

                // Initialize Toss Widget
                const widget = await loadPaymentWidget(TOSS_CLIENT_KEY, "@anonymous"); // using anonymous for simplicity, or customerKey
                setPaymentWidget(widget);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [product]);

    useEffect(() => {
        if (paymentWidget && orderInfo) {
            // Render Payment Method UI
            const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                "#payment-method",
                { value: orderInfo.amount },
                { variantKey: "DEFAULT" }
            );

            // Render Agreement UI
            paymentWidget.renderAgreement(
                "#agreement",
                { variantKey: "AGREEMENT" }
            );

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
        } catch (err: any) {
            console.error("Payment failed", err);
            // handle Toss specific error codes if needed
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">결제 모듈을 불러오는 중...</div>;
    if (error) return (
        <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-red-500 font-bold mb-4">입력 오류</div>
                <div className="text-gray-700 mb-6">{error === "No product selected." ? "선택된 상품이 없습니다." : error === "Invalid product" ? "존재하지 않거나 지원하지 않는 상품입니다." : error}</div>
                <button
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                    요금제로 돌아가기
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">결제하기</h2>

                <div className="mb-6 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-gray-700">{orderInfo?.orderName}</span>
                    <span className="text-xl font-bold text-blue-600">₩{orderInfo?.amount.toLocaleString()}</span>
                </div>

                <div id="payment-method"></div>
                <div id="agreement"></div>

                <button
                    onClick={handlePaymentRequest}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                    결제하기
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
