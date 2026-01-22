"use client";

import { motion } from "framer-motion";

interface AuraScoreProps {
    score: number;
    percentile: number;
}

export const AuraScore = ({ score, percentile }: AuraScoreProps) => {
    const circumference = 2 * Math.PI * 45; // radius 45
    // Normalize impact index for the ring (0-100 scale, index can be higher so cap it or map it)
    const normalizedScore = Math.min(100, (score / 1000) * 100);
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute -top-4 right-0 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-black text-cyan-400">
                TOP {percentile}%
            </div>
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="45"
                    className="stroke-gray-700/30 fill-none"
                    strokeWidth="8"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45"
                    className="fill-none stroke-current text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="text-4xl font-bold font-space text-white"
                >
                    {score}
                </motion.span>
                <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Aura</span>
            </div>
        </div>
    );
};
