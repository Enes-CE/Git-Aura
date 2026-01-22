"use client";

import { motion } from "framer-motion";
import { RiskAnalysis } from "@/lib/analyzer";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface GhostCardProps {
    risk: RiskAnalysis;
}

export const GhostCard = ({ risk }: GhostCardProps) => {
    return (
        <GlassCard className="hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-500">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-xl font-bold font-space">Productivity Ghost</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <Clock className="w-3 h-3" />
                            Peak Risk Time
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {risk.riskiestDay}
                        </div>
                        <div className="text-sm text-gray-500">{risk.riskiestHour}:00</div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <TrendingUp className="w-3 h-3" />
                            Bug Fix Rate
                        </div>
                        <div className="text-2xl font-bold text-red-400">
                            {risk.bugFixPercentage}%
                        </div>
                        <div className="text-sm text-gray-500">of activity</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-4 rounded-xl border border-red-500/20">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        <span className="font-bold text-red-400">Insight:</span> {risk.insight}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
};
