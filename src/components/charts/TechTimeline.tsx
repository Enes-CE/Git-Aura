"use client";

import { motion } from "framer-motion";
import { TechEvolution } from "@/lib/analyzer";
import { ArrowRight } from "lucide-react";

interface TechTimelineProps {
    evolution: TechEvolution[];
}

export const TechTimeline = ({ evolution }: TechTimelineProps) => {
    if (evolution.length === 0) return null;

    return (
        <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-6 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/20 via-cyan-500/40 to-purple-500/20" />

            {/* Timeline Items */}
            <div className="relative flex justify-between items-start">
                {evolution.map((item, index) => (
                    <motion.div
                        key={item.year}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center gap-3 flex-1"
                    >
                        {/* Year Node */}
                        <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-4 border-black shadow-lg group hover:scale-110 transition-transform">
                            <span className="text-xs font-bold text-white">{item.year}</span>
                            <div className="absolute inset-0 rounded-full bg-cyan-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Languages */}
                        <div className="flex flex-col gap-1 items-center min-h-[60px]">
                            {item.languages.map((lang, langIndex) => (
                                <motion.div
                                    key={lang}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 + langIndex * 0.05 }}
                                    className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-gray-300 whitespace-nowrap hover:bg-white/10 transition-colors"
                                >
                                    {lang}
                                </motion.div>
                            ))}
                        </div>

                        {/* Arrow (except last) */}
                        {index < evolution.length - 1 && (
                            <ArrowRight className="absolute top-6 left-[60%] w-4 h-4 text-cyan-500/50 -translate-y-1/2" />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
