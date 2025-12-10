"use client";

import { motion } from "framer-motion";

export default function FaceScanner() {
    return (
        <div className="relative w-64 h-64 mx-auto border-2 border-yellow-500 rounded-lg overflow-hidden bg-black/80">
            {/* 격자 무늬 */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-30">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="border border-yellow-500"></div>
                ))}
            </div>

            {/* 스캔 라인 (확실하게 보이도록 설정) */}
            <motion.div
                className="absolute w-full h-1 bg-yellow-400 shadow-[0_0_20px_#facc15]"
                style={{ boxShadow: "0 0 15px 2px rgba(250, 204, 21, 0.8)" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* 텍스트 */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-yellow-400 text-xs font-mono animate-pulse font-bold">
                SCANNING...
            </div>
        </div>
    );
}
