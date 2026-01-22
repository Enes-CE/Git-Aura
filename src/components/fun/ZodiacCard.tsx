"use client";

import { motion } from "framer-motion";
import { TechZodiac } from "@/lib/fun";
import { Building2, Sparkles, Flame, Eye, Compass } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

const IconMap: any = {
    Building2, Sparkles, Flame, Eye, Compass
};

interface ZodiacCardProps {
    zodiac: TechZodiac;
}

export const ZodiacCard = ({ zodiac }: ZodiacCardProps) => {
    const ZodiacIcon = IconMap[zodiac.icon] || Sparkles;

    return (
        <GlassCard className="relative overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-500 group">
            {/* Mystical Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 opacity-50" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-white/5 border border-white/10`}>
                            <ZodiacIcon className={`w-5 h-5 ${zodiac.color}`} />
                        </div>
                        <h3 className="text-xl font-bold font-space text-white">Your Tech Zodiac</h3>
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Mystical</div>
                </div>

                <div className="text-center py-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block"
                    >
                        <div className={`text-4xl font-black font-space ${zodiac.color} mb-2 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]`}>
                            {zodiac.sign}
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">
                            Element: <span className={zodiac.color}>{zodiac.element}</span>
                        </div>
                    </motion.div>
                </div>

                <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 p-4 rounded-xl border border-purple-500/20">
                    <p className="text-sm text-gray-300 leading-relaxed text-center italic">
                        "{zodiac.description}"
                    </p>
                </div>

                {/* Decorative Stars */}
                <div className="flex justify-center gap-2 pt-2">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className={`w-1 h-1 rounded-full ${zodiac.color.replace('text-', 'bg-')}`}
                        />
                    ))}
                </div>
            </div>
        </GlassCard>
    );
};
