"use client";

import { useState, useRef } from "react";
import { Camera, Lock, CheckCircle2 } from "lucide-react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import FaceScanner from "@/components/FaceScanner";

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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "scanning" | "teaser">("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 이미지 업로드 (Mobile Resize Logic Preserved)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side Resize Logic to prevent Payload Too Large on Mobile
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Resize to max 800px width
          const scaleSize = MAX_WIDTH / img.width;

          if (scaleSize < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 70% quality JPEG
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          startAnalysis(compressedDataUrl);
        };
        img.src = event.target?.result as string;
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

      if (!response.ok) {
        throw new Error(data.error || "분석 실패");
      }

      setResult(data);
      localStorage.setItem("wealth_analysis", JSON.stringify(data));

      setTimeout(() => {
        setStep("teaser");
        setLoading(false);
      }, 3000);

    } catch (error) {
      alert("AI 분석 중 오류가 발생했습니다. (API 키 확인 필요)\n" + (error instanceof Error ? error.message : String(error)));
      console.error(error);
      setStep("upload");
      setLoading(false);
    }
  };

  // 3. 결제 핸들러 (Standard SDK for Popup)
  const handlePayment = async () => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      alert("환경변수(NEXT_PUBLIC_TOSS_CLIENT_KEY)가 설정되지 않았습니다!");
      return;
    }

    try {
      // SDK 로드
      const tossPayments = await loadTossPayments(clientKey);

      // 결제 요청 (카드 결제창 팝업)
      await (tossPayments as any).requestPayment("카드", {
        amount: 3900,
        orderId: `ORDER_${new Date().getTime()}`,
        orderName: "AI 관상 분석 리포트",
        customerName: "익명 고객",
        successUrl: `${window.location.origin}/result?success=true`,
        failUrl: `${window.location.origin}/result?fail=true`,
      });
    } catch (error) {
      console.error("Payment Error:", error);
      alert("결제 창을 띄우는 데 실패했습니다. 콘솔을 확인하세요.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto relative bg-black text-white overflow-hidden">

      {/* Step 1: 업로드 */}
      {step === "upload" && (
        <div className="z-10 text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">
              Wealth Face AI
            </h1>
            <p className="text-gray-400 text-sm">
              상위 1% 부자 관상 데이터 대조
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-64 h-64 mx-auto border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 bg-gray-900"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-gray-500 font-medium">사진 업로드</p>
            {/* Added capture='user' back for mobile camera support */}
            <input type="file" accept="image/*" ref={fileInputRef} capture="user" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>
      )}

      {/* Step 2: 스캔 */}
      {step === "scanning" && (
        <div className="z-10 text-center space-y-6">
          <FaceScanner />
          <p className="text-yellow-400 animate-pulse font-bold">AI가 얼굴을 분석 중입니다...</p>
        </div>
      )}

      {/* Step 3: 결제 유도 */}
      {step === "teaser" && result && (
        <div className="z-10 w-full space-y-6 text-center">
          <h2 className="text-2xl font-bold">
            당신은 <span className="text-yellow-400">{result.richLookalike}</span>과<br />
            <span className="text-yellow-400">{result.matchRate}%</span> 일치합니다!
          </h2>

          <div className="bg-gray-800 p-6 rounded-xl relative overflow-hidden">
            <div className="filter blur-sm opacity-30">
              <p>상세 분석 내용이 여기에 표시됩니다...</p>
              <p>재물운이 아주 강력하며...</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Lock className="w-10 h-10 text-yellow-500 mb-2" />
              <button
                onClick={handlePayment}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full shadow-lg"
              >
                결과 확인하기 (3,900원)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
