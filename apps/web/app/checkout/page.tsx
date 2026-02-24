"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Coins, Loader2 } from "lucide-react";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const product = searchParams.get("product") || "PAID_TIER_1";
    const cost = product === "PAID_TIER_2" ? 5 : 3;

    const handleMockPay = async () => {
        setLoading(true);
        setError("");

        // Simulate payment processing through our dedicated testing webhook mock
        try {
            const res = await fetch("/api/webhooks/payment/mock", {
                method: "POST",
                body: JSON.stringify({ amount: cost, product }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Payment failed verification");

            // Success, redirect back
            router.push("/");
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 text-center space-y-6">
                <div className="bg-blue-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-4">
                    <Coins size={40} />
                </div>

                <h1 className="text-2xl font-black text-gray-900">Purchase Credits</h1>
                <p className="text-gray-500">You are buying <b>{cost} Credits</b> to unlock the {product.replace("PAID_TIER_", "Tier ")} generation.</p>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-gray-600">Total Price</span>
                        <span className="text-blue-600">₩{cost * 1000}</span>
                    </div>
                </div>

                {error && <div className="text-red-500 font-semibold bg-red-50 p-3 rounded">{error}</div>}

                <button
                    onClick={handleMockPay}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Pay with Toss/PortOne (Mock)"}
                </button>

                <p className="text-xs text-gray-400">This is a simulated payment gateway for development mode.</p>
            </div>
        </div>
    );
}
