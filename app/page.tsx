"use client";

import { useState, useRef } from "react";
import { Camera, Lock, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
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
  const [image, setImage] = useState<string | null>(null); // For display in Scanner
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
          setImage(compressedDataUrl); // Set image state for Scanner background
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

      // Delay for dramatic effect
      setTimeout(() => {
        setStep("teaser");
        setLoading(false);
      }, 5000); // Increased to 5s to let user enjoy the detailed scanning effect

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
      alert("⚠️ 치명적 오류: Toss Client Key가 없습니다.\nVercel 환경변수 설정을 확인해주세요.");
      return;
    }

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Debug Reset Function
  const handleReset = () => {
    localStorage.removeItem("wealth_analysis");
    setStep("upload");
    setResult(null);
    setImage(null);
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-md mx-auto relative bg-black text-white font-sans overflow-y-auto">

      {/* On-Screen Debugger (Visible to User for troubleshooting) */}
      <div className="fixed top-2 left-2 z-[9999] opacity-70 pointer-events-auto">
        <div className="bg-red-900/80 p-2 rounded text-[10px] text-white space-y-1">
          <p>v2.6 (Z-Index Fix)</p>
          <p>Step: {step}</p>
          <p>Result: {result ? "Loaded" : "Null"}</p>
          <button onClick={handleReset} className="px-2 py-1 bg-white text-black rounded font-bold mt-1">
            RESET APP
          </button>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black z-0" />

      {/* Step 1: 업로드 */}
      {step === "upload" && (
        <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700 mt-10">
          <div>
            <div className="inline-block px-3 py-1 border border-yellow-600 rounded-full bg-yellow-900/30 mb-4">
              <span className="text-yellow-400 text-xs font-bold tracking-widest">AI PHYSIOGNOMY v2.6 (Z-Index Fix)</span>
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 mb-3 drop-shadow-md">
              Wealth Face AI
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              상위 1% 슈퍼 리치들의 관상 빅데이터와<br />당신의 얼굴을 AI가 대조 분석합니다.
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-72 h-72 mx-auto border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="w-20 h-20 bg-gray-800/80 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-black">
              <Camera className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-gray-400 group-hover:text-yellow-400 font-bold transition-colors">
              얼굴 사진 업로드
            </p>
            <p className="text-gray-600 text-xs mt-2">정면이 잘 나온 사진을 권장합니다</p>
            <input type="file" accept="image/*" ref={fileInputRef} capture="user" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex justify-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider">
            <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Secure Scan</span>
            <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 99.8% Accuracy</span>
          </div>
        </div>
      )}

      {/* Step 2: 스캔 */}
      {step === "scanning" && (
        <div className="z-10 text-center space-y-8 w-full mt-20">
          <FaceScanner imageSrc={image} />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-widest animate-pulse">
              ANALYZING
            </h2>
            <p className="text-yellow-500/80 text-xs font-mono">
              Connecting to Wealth Data Server...
            </p>
          </div>
        </div>
      )}

      {/* Step 3: 결제 유도 (Premium Report UI) */}
      {step === "teaser" && result && (
        <div className="z-10 w-full space-y-6 text-center animate-in slide-in-from-bottom duration-700 pb-10 mt-10">

          <div className="space-y-2">
            <span className="text-yellow-500 text-xs font-bold tracking-widest uppercase">Analysis Complete</span>
            <h2 className="text-3xl font-bold px-4 leading-tight">
              당신은 <span className="text-yellow-400 underline decoration-yellow-600/50 underline-offset-4">{result.richLookalike}</span>과<br />
              <span className="text-4xl text-yellow-400 drop-shadow-lg">{result.matchRate}%</span> 일치합니다.
            </h2>
          </div>

          {/* Secret Report Card */}
          <div className="relative mx-auto w-full bg-[#1a1a1a] border border-yellow-600/30 rounded-xl overflow-hidden shadow-2xl shadow-yellow-900/20">
            {/* Header */}
            <div className="bg-black/50 p-3 border-b border-gray-800 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono">REPORT ID: #{new Date().getTime().toString().slice(-6)}</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                );
}
