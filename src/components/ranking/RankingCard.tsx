"use client";

import { motion } from "framer-motion";
import { RankResult, RankTier } from "@/lib/ranking";
import { Trophy, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingCardProps {
    rank: RankResult;
    isGodMode?: boolean;
}

const TierStyles: Record<RankTier, string> = {
    Platinum: "bg-gradient-to-br from-slate-300 via-cyan-100 to-slate-300 border-cyan-200/50 shadow-cyan-500/20 text-slate-900",
    Gold: "bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-600 border-yellow-400/50 shadow-yellow-500/20 text-yellow-950",
    Silver: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border-slate-300/50 shadow-slate-500/20 text-slate-900",
    Bronze: "bg-gradient-to-br from-orange-200 via-orange-400 to-orange-700 border-orange-400/50 shadow-orange-500/20 text-orange-950",
    Iron: "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 border-gray-600/50 shadow-gray-500/20 text-gray-100"
};

export const RankingCard = ({ rank, isGodMode = false }: RankingCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
                "relative overflow-hidden rounded-2xl p-[1px] group",
                "before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:animate-spin-slow before:opacity-30",
                // Glow effect
                "after:absolute after:inset-0 after:bg-white/5 after:blur-xl"
            )}
        >
            {/* God Mode Particles */}
            {isGodMode && (
                <>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            initial={{
                                x: "50%",
                                y: "50%",
                                opacity: 0
                            }}
                            animate={{
                                x: `${50 + (Math.random() - 0.5) * 200}%`,
                                y: `${50 + (Math.random() - 0.5) * 200}%`,
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </>
            )}

            {/* Inner Card Content */}
            <div className={cn(
                "relative h-full w-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden backdrop-blur-md",
                TierStyles[rank.tier],
                isGodMode && "shadow-[0_0_50px_rgba(234,179,8,0.5)]"
            )}>
                {/* Holographic Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10 pointer-events-none skew-x-12" />

                <div className="relative z-20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-black/10 rounded-lg backdrop-blur-sm">
                            <Globe className="w-5 h-5 opacity-80" />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-70">
                            <Sparkles className="w-3 h-3" />
                            Global Rank
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-4xl md:text-5xl font-black font-space tracking-tighter leading-none">
                            {rank.label}
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                            Open Source Impact
                        </p>
                    </div>
                </div>

                <div className="relative z-20 mt-6 pt-4 border-t border-black/10">
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                        "{rank.description}"
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
