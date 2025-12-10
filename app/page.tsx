"use client";

import { useState, useRef } from "react";
import { Upload, Camera, Lock, CheckCircle2 } from "lucide-react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import FaceScanner from "@/components/FaceScanner";
import { clsx } from "clsx";

// 타입 정의
interface AnalysisResult {
  richLookalike: string;
  matchRate: number;
  animalType: string;
  potentialWealth: string;
  summary: string;
  detailedAnalysis: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "scanning" | "teaser">("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        startAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. 분석 시작
  const startAnalysis = async (base64Image: string) => {
    setStep("scanning");
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setResult(data);

      // 스캔 효과를 위해 3초 딜레이 (심리학적 트릭)
      setTimeout(() => {
        setStep("teaser");
        setLoading(false);
        // 결과 데이터는 로컬 스토리지에 임시 저장 (결제 성공 페이지에서 사용)
        sessionStorage.setItem("wealth_analysis", JSON.stringify(data));
        // User used localStorage in their snippet, but sessionStorage is cleaner for this session-based flow. 
        // I'll stick to localStorage if they insisted, but sessionStorage avoids old data. 
        // Wait, user code said localStorage. I should probably respect it or improve it. 
        // User said: "localStorage.setItem". I'll use localStorage to be safe with their instructions.
        localStorage.setItem("wealth_analysis", JSON.stringify(data));
      }, 3000);

    } catch (error) {
      console.error(error);
      alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
      setStep("upload");
      setLoading(false);
    }
  };

  // 3. 결제 핸들러 (Toss Payments)
  const handlePayment = async () => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    const customerKey = "ANONYMOUS"; // 비회원 결제

    if (!clientKey) return alert("결제 키 설정 오류");

    try {
      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

      // 3,900원 결제 요청
      await paymentWidget.requestPayment({
        orderId: `ORDER_${new Date().getTime()}`,
        orderName: "AI 부자 관상 상세 리포트",
        customerName: "익명 고객",
        successUrl: `${window.location.origin}/result?success=true`, // Added query param for consistency with result page logic often used
        failUrl: `${window.location.origin}/result?fail=true`,
      });
    } catch (error) {
      console.error("Payment Error", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative overflow-hidden bg-black text-white">
      {/* 배경 효과 - Fixed gradient syntax for Tailwind 3 if needed, or inline style */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(251,191,36,0.1)_0%,rgba(0,0,0,1)_70%)] z-0 pointer-events-none" />

      {/* Step 1: 업로드 화면 */}
      {step === "upload" && (
        <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2">
              Wealth Face AI
            </h1>
            <p className="text-gray-400 text-sm">
              상위 1% 부자들의 관상 데이터와<br />당신의 얼굴을 대조합니다.
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-64 h-64 mx-auto border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/5 transition-all group"
          >
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-500 group-hover:text-yellow-400 font-medium">
              사진 업로드 또는 촬영
            </p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex gap-2 justify-center text-xs text-gray-600">
            <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 사진 저장 안함</span>
            <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 100% 익명 보장</span>
          </div>
        </div>
      )}

      {/* Step 2: 스캔/로딩 화면 */}
      {step === "scanning" && (
        <div className="z-10 text-center space-y-6">
          <FaceScanner />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-yellow-500 animate-pulse">
              관상 데이터 분석 중...
            </h2>
            <p className="text-gray-400 text-sm">
              눈매, 콧볼, 하관의 재물운을 계산하고 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: 맛보기(Teaser) 및 결제 유도 */}
      {step === "teaser" && result && (
        <div className="z-10 w-full space-y-6 animate-in slide-in-from-bottom duration-700">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-1">분석 완료</p>
            <h2 className="text-2xl font-bold text-white">
              당신은 <span className="text-yellow-400">'{result.richLookalike}'</span>과<br />
              관상이 <span className="text-yellow-400 text-3xl">{result.matchRate}%</span> 일치합니다!
            </h2>
          </div>

          {/* 블러 처리된 결과 카드 */}
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-hidden">
            <div className="filter blur-md select-none opacity-50">
              <h3 className="text-xl font-bold mb-4 text-yellow-500">상세 분석 리포트</h3>
              <p className="text-gray-300 mb-2">당신의 잠재 자산은 약 000억 원입니다.</p>
              <p className="text-gray-300 mb-2">특히 중년 이후에 00운이 트이면서...</p>
              <p className="text-gray-300">조심해야 할 점은 입매가 00하여 돈이...</p>
            </div>

            {/* 결제 오버레이 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
              <Lock className="w-12 h-12 text-yellow-500 mb-3" />
              <p className="text-white font-bold text-lg mb-4">전체 결과 잠금 해제</p>
              <button
                onClick={handlePayment}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform animate-bounce"
              >
                결과 확인하기 (3,900원)
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500">
            * 커피 한 잔 값으로 당신의 숨겨진 부의 기운을 확인하세요.
          </p>
        </div>
      )}
    </main>
  );
}
