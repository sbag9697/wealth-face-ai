"use client";

import { useEffect, useState } from "react";

interface FaceScannerProps {
    imageSrc: string | null;
}

const SCAN_MESSAGES = [
    "얼굴 랜드마크 추출 중...",
    "관상학 데이터 대조 중...",
    "재물운 패턴 분석 중...",
    "상위 1% 부자 데이터 매칭...",
    "잠재 자산 계산 중...",
];

export default function FaceScanner({ imageSrc }: FaceScannerProps) {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
        }, 800); // Change text every 0.8s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-64 h-64 mx-auto border-2 border-yellow-500 rounded-lg overflow-hidden bg-black">
            {/* 
        1. User Image Background 
        - Shows the user's face dimly to feel "real".
      */}
            {imageSrc && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
                    style={{ backgroundImage: `url(${imageSrc})` }}
                />
            )}

            {/* 
        2. Tech Overlay Grid 
        - A static science-fiction grid.
      */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20 z-10">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="border border-yellow-500/50"></div>
                ))}
            </div>

            {/* 
        3. Targeting Corners 
        - Decoration for the corners.
      */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-yellow-400 z-20" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-yellow-400 z-20" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-yellow-400 z-20" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-400 z-20" />

            {/* 
        4. Moving Scan Line 
        - The primary animation.
      */}
            {/* 
        4. Moving Scan Line 
        - The primary animation (CSS Keyframes for stability).
      */}
            <div
                className="absolute w-full h-1 bg-yellow-400 z-30 animate-scan-line"
                style={{
                    boxShadow: "0 0 15px 2px rgba(250, 204, 21, 0.8)",
                }}
            />
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                }
                .animate-scan-line {
                    animation: scan 2.5s linear infinite;
                }
            `}</style>

            {/* 
        5. Cycling Analysis Text 
        - Main feedback loop for user.
      */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-40">
                <div className="inline-block bg-black/80 px-3 py-1 rounded-full border border-yellow-500/50">
                    <p className="text-yellow-400 text-xs font-mono animate-pulse font-bold tracking-wider">
                        {SCAN_MESSAGES[msgIndex]}
                    </p>
                </div>
            </div>

            {/* 
        6. Random Binary/Matrix Effect (Simulated) 
      */}
            <RandomCoordinates />
        </div>
    );
}

function RandomCoordinates() {
    const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setCoords({
                x: Math.random(),
                y: Math.random(),
                z: Math.random(),
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-4 right-4 text-[10px] text-yellow-500/60 font-mono text-right z-10">
            <p>X: {coords.x.toFixed(4)}</p>
            <p>Y: {coords.y.toFixed(4)}</p>
            <p>Z: {coords.z.toFixed(4)}</p>
        </div>
    );
}

