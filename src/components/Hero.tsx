"use client";

import { motion } from "framer-motion";
import { Github, ChevronRight } from "lucide-react";

interface HeroProps {
    onConnectGithub: () => void;
    isLoading?: boolean;
}

export const Hero = ({ onConnectGithub, isLoading = false }: HeroProps) => {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold font-space tracking-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        Unlock Your Code Aura
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
                    Connect your GitHub account, analyze your profile in depth, and uncover your developer persona.
                </p>

                {/* Connect GitHub Button */}
                <div className="relative max-w-lg mx-auto w-full group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur" />
                    <button
                        onClick={onConnectGithub}
                        disabled={isLoading}
                        className="relative flex items-center justify-center gap-3 bg-black rounded-full px-6 py-4 w-full text-white font-medium text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Github className="w-6 h-6 text-cyan-400" />
                        <span className="uppercase tracking-[0.25em] text-xs md:text-sm text-white/80">
                            Connect GitHub
                        </span>
                        <ChevronRight className="w-5 h-5 text-cyan-300" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
