"use client";

import { motion } from "framer-motion";
import { AuraAvatarConfig } from "@/lib/avatar";
import { Shield, Sparkles, Ghost } from "lucide-react";

interface AuraAvatarProps {
    config: AuraAvatarConfig;
}

export const AuraAvatar = ({ config }: AuraAvatarProps) => {
    const { type, primaryColor, imageUrl } = config;

    return (
        <div className="w-full h-full flex flex-col items-center justify-between py-8 px-6 bg-[#0a0a0a] rounded-[2.5rem] border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">

            {/* Background Aura Glow */}
            <div
                className="absolute inset-0 opacity-10 blur-[100px]"
                style={{ background: `radial-gradient(circle at 50% 50%, ${primaryColor}, transparent)` }}
            />

            {/* 1. TOP: Character Name */}
            <div className="w-full text-center z-10">
                <motion.h2
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-white font-black text-4xl tracking-tighter uppercase leading-none"
                >
                    {type}
                </motion.h2>
                <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
                    <Sparkles className="w-3 h-3" style={{ color: primaryColor }} />
                    <span className="text-[8px] font-black tracking-[0.4em] uppercase text-gray-400">Verified Aura Entity</span>
                </div>
            </div>

            {/* 2. CENTER: The Image (Fixed Size to prevent collapse) */}
            <div className="relative w-full aspect-square max-w-[260px] my-6 z-10">
                <div
                    className="absolute inset-0 rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl"
                    style={{ borderColor: `${primaryColor}40` }}
                >
                    <img
                        src={imageUrl}
                        alt={type}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if image fails to load
                            console.error("Image failed to load:", imageUrl);
                            e.currentTarget.src = "https://via.placeholder.com/400x400?text=Avatar+Not+Found";
                        }}
                    />
                </div>
                {/* Floating Accent */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-black/80 border border-white/20 flex items-center justify-center backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                </div>
            </div>

            {/* 3. BOTTOM: Class and Bars */}
            <div className="w-full flex flex-col items-center gap-6 z-10">
                <div className="text-center">
                    <span className="text-cyan-400 font-black text-[11px] tracking-[0.6em] uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                        CYBER-ORGANIC ENTITY
                    </span>
                    <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-2" />
                </div>

                {/* Stats Bars */}
                <div className="w-full grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-gray-500 tracking-wider uppercase">Spirit</span>
                            <Ghost className="w-3 h-3 text-cyan-400" />
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-gray-500 tracking-wider uppercase">Defense</span>
                            <Shield className="w-3 h-3 text-white" />
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '70%' }}
                                className="h-full"
                                style={{ backgroundColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Industrial Rim Accent */}
            <div className="absolute inset-2 border border-white/[0.03] rounded-[2.2rem] pointer-events-none" />
        </div>
    );
};
