"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Crown, Share2, Home } from "lucide-react";

interface AnalysisResult {
    richLookalike: string;
    matchRate: number;
    animalType: string;
    potentialWealth: string;
    summary: string;
    detailedAnalysis: string;
}

function ResultPageContent() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verifyPayment = async () => {
            const paymentKey = searchParams.get("paymentKey");
            const orderId = searchParams.get("orderId");
            const amount = searchParams.get("amount");
            const storedData = localStorage.getItem("wealth_analysis");

            // Case 1: Just returned from Payment Gateway (Needs Verification)
            if (paymentKey && orderId && amount) {
                try {
                    const res = await fetch("/api/payment/confirm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentKey, orderId, amount }),
                    });

                    if (res.ok) {
                        // Verification Success
                        if (storedData) setResult(JSON.parse(storedData));
                        // Clean up URL
                        window.history.replaceState({}, "", "/result?success=true");
                    } else {
                        // Verification Failed
                        const errorData = await res.json();
                        alert(`결제 승인 실패: ${errorData.error}`);
                        router.push("/");
                    }
                } catch (e) {
                    console.error(e);
                    alert("결제 서버 연결 실패");
                    router.push("/");
                }
            }
            // Case 2: Already verified or Dev Mode (success=true)
            else if (searchParams.get("success") === "true" && storedData) {
                setResult(JSON.parse(storedData));
            } else {
                // Invalid access
                // alert("잘못된 접근입니다.");
                // router.push("/");
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    if (!result) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">결과를 불러오는 중...</div>;

    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
            <div className="text-center mb-8 animate-in fade-in duration-700">
                <div className="inline-block p-3 rounded-full bg-yellow-500/20 mb-4">
                    <Crown className="w-10 h-10 text-yellow-500" />
                </div>
                <h1 className="text-3xl font-bold text-yellow-400 mb-2">당신의 재물운 분석</h1>
                <p className="text-gray-400 text-sm">AI Face Physiognomy Report</p>
            </div>

            <div className="space-y-6">
                {/* 핵심 요약 카드 */}
                <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-black rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">닮은 부자</p>
                            <p className="font-bold text-yellow-400">{result.richLookalike}</p>
                        </div>
                        <div className="text-center p-3 bg-black rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">물형 관상</p>
                            <p className="font-bold text-yellow-400">{result.animalType}상</p>
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-400 mb-1">잠재 추정 자산</p>
                        <p className="text-4xl font-extrabold text-white">{result.potentialWealth}</p>
                    </div>

                    <div className="bg-yellow-500/10 p-4 rounded-lg">
                        <p className="text-yellow-200 font-medium text-center">"{result.summary}"</p>
                    </div>
                </div>

                {/* 상세 분석 */}
                <div className="bg-gray-900 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">
                        👁️ 상세 관상 풀이
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                        {result.detailedAnalysis}
                    </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-3 pt-4">
                    <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <Share2 className="w-5 h-5" /> 공유하기
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Home className="w-5 h-5" /> 처음으로
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultPageContent />
        </Suspense>
    );
}
