"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const loadingMessages = [
    "Scanning GitHub Database...",
    "Analyzing commit patterns...",
    "Calculating evolution path...",
    "Detecting productivity ghosts...",
    "Measuring code quality...",
    "Computing global rank..."
];

export const LoadingPortal = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-8 relative z-20">
            <div className="relative">
                {/* Outer Ring */}
                <motion.div
                    className="w-32 h-32 rounded-full border-b-4 border-cyan-500/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner Ring Reverse */}
                <motion.div
                    className="absolute inset-0 w-24 h-24 m-auto rounded-full border-t-4 border-purple-500/50"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Core Pulse */}
                <motion.div
                    className="absolute inset-0 w-16 h-16 m-auto bg-white/10 rounded-full blur-md"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            </div>

            <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-cyan-400 font-space tracking-widest text-sm uppercase"
                    >
                        {loadingMessages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
};

