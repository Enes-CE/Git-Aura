"use client";

import { motion } from "framer-motion";

export const LandingHero = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 relative z-10">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="text-6xl md:text-8xl font-bold font-space tracking-tighter mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-500 animate-gradient">
                        GitAura
                    </span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                    Unlock the hidden aesthetics of your GitHub profile.
                    <span className="block text-cyan-400/80 mt-2">Cinematic. Data-driven. Beautiful.</span>
                </p>
            </motion.div>

            {children}
        </div>
    );
};
