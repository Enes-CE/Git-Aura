"use client";

import { motion } from "framer-motion";
import { IconicDeveloper } from "@/lib/fun";
import { Heart, TrendingUp } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { CountUp } from "../ui/CountUp";

interface SoulmateCardProps {
    match: {
        developer: IconicDeveloper;
        matchScore: number;
        reason: string;
    };
}

export const SoulmateCard = ({ match }: SoulmateCardProps) => {
    const { developer, matchScore, reason } = match;

    return (
        <GlassCard className="relative overflow-hidden hover:border-pink-500/50 hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] transition-all duration-500 group">
            {/* Romantic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-transparent to-red-900/20 opacity-50" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                        <Heart className="w-5 h-5" />
                        <h3 className="text-xl font-bold font-space">Your Coding Soulmate</h3>
                    </div>
                    <div className="flex items-center gap-1 text-pink-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-2xl font-bold">
                            <CountUp to={matchScore} />%
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-6xl">{developer.avatar}</div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-white mb-1">{developer.name}</div>
                        <div className="text-sm text-gray-400">{developer.specialty}</div>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400">
                                {developer.dominantLanguage}
                            </span>
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">
                                {developer.peakHour}:00 Peak
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-pink-900/30 to-red-900/30 p-4 rounded-xl border border-pink-500/20">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        <span className="font-bold text-pink-400">Why you match:</span> {reason}
                    </p>
                </div>

                {/* Floating Hearts */}
                <div className="absolute top-4 right-4 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [-5, -15, -5],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        >
                            <Heart className="w-3 h-3 text-pink-400 fill-pink-400/20" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};
