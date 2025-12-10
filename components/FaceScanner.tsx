"use client";

import { motion } from "framer-motion";

export default function FaceScanner() {
    return (
        <div className="relative w-64 h-64 mx-auto border-2 border-gold-500/30 rounded-lg overflow-hidden bg-black/50">
            {/* 격자 무늬 배경 */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="border border-gold-500/50"></div>
                ))}
            </div>

            {/* 스캔 라인 애니메이션 */}
            <motion.div
                className="absolute w-full h-2 bg-gold-400/80 shadow-[0_0_15px_#fbbf24]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* 분석 텍스트 */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-gold-400 text-xs font-mono animate-pulse">
                ANALYZING FACIAL DATA...
            </div>
        </div>
    );
}
