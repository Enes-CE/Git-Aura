"use client";

import { motion } from "framer-motion";
import { QualityScore } from "@/lib/analyzer";
import { Award, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { CountUp } from "../ui/CountUp";

interface QualityCardProps {
    quality: QualityScore;
}

export const QualityCard = ({ quality }: QualityCardProps) => {
    const getScoreColor = (score: number) => {
        if (score >= 75) return "text-green-400";
        if (score >= 50) return "text-yellow-400";
        return "text-orange-400";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 75) return "Excellent";
        if (score >= 50) return "Good";
        return "Needs Work";
    };

    return (
        <GlassCard className="hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-500">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400">
                        <Award className="w-5 h-5" />
                        <h3 className="text-xl font-bold font-space">Code Quality</h3>
                    </div>
                    <div className={`text-3xl font-black font-space ${getScoreColor(quality.score)}`}>
                        <CountUp to={quality.score} /><span className="text-sm text-gray-500">/100</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-2">
                    <div className={`px-4 py-1 rounded-full border ${quality.score >= 75 ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            quality.score >= 50 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        }`}>
                        <span className="text-xs font-bold uppercase tracking-wider">{getScoreLabel(quality.score)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(quality.breakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                            {value ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                                <XCircle className="w-4 h-4 text-gray-600" />
                            )}
                            <span className={value ? "text-gray-300" : "text-gray-600"}>
                                {key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-green-900/20 to-cyan-900/20 p-4 rounded-xl border border-green-500/20">
                    <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {quality.suggestion}
                        </p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
