"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Github, Globe, RotateCcw, Image as ImageIcon, Layers } from "lucide-react";
import { UserProfile } from "@/lib/github";
import { Persona } from "@/lib/persona";
import { RankResult } from "@/lib/ranking";
import { AuraAvatarConfig } from "@/lib/avatar";
import { AuraAvatar } from "./AuraAvatar";
import { toPng } from "html-to-image";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    persona: Persona;
    stats: {
        aura: number;
        impact: number;
        stars: number;
    };
    rank: RankResult;
    avatarConfig: AuraAvatarConfig;
}

export const ShareModal = ({ isOpen, onClose, user, persona, stats, rank, avatarConfig }: ShareModalProps) => {
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleDownload = async (side: "front" | "back" | "both") => {
        setIsGenerating(true);
        try {
            if (side === "front" && frontRef.current) {
                const dataUrl = await toPng(frontRef.current, { cacheBust: true, pixelRatio: 3 });
                downloadImage(dataUrl, `gitaura-${user.login}-stats.png`);
            } else if (side === "back" && backRef.current) {
                const dataUrl = await toPng(backRef.current, { cacheBust: true, pixelRatio: 3 });
                downloadImage(dataUrl, `gitaura-${user.login}-avatar.png`);
            } else if (side === "both") {
                if (frontRef.current) {
                    const frontUrl = await toPng(frontRef.current, { cacheBust: true, pixelRatio: 3 });
                    downloadImage(frontUrl, `gitaura-${user.login}-stats.png`);
                }
                setTimeout(async () => {
                    if (backRef.current) {
                        const backUrl = await toPng(backRef.current, { cacheBust: true, pixelRatio: 3 });
                        downloadImage(backUrl, `gitaura-${user.login}-avatar.png`);
                    }
                }, 500);
            }
        } catch (err) {
            console.error("Failed to generate image", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                    />

                    {/* Main Layout: Horizontal on desktop */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12 max-w-5xl w-full h-full max-h-[90vh] justify-center"
                    >
                        {/* Close Button Mobile Only */}
                        <button
                            onClick={onClose}
                            className="absolute top-0 right-0 md:hidden bg-white/10 p-2 rounded-full text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* LEFT/CENTER: The Card Container */}
                        <div
                            className="relative aspect-[9/16] h-full max-h-[60vh] md:max-h-[80vh] shrink-0"
                            style={{ perspective: "2000px" }}
                        >
                            <motion.div
                                className="relative w-full h-full"
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.8, type: "spring", damping: 15 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Front Side */}
                                <div
                                    ref={frontRef}
                                    className="absolute inset-0 w-full h-full bg-black rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <FrontCard user={user} persona={persona} stats={stats} rank={rank} />
                                </div>

                                {/* Back Side */}
                                <div
                                    ref={backRef}
                                    className="absolute inset-0 w-full h-full bg-black rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)"
                                    }}
                                >
                                    <BackCard avatarConfig={avatarConfig} />
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT: Sophisticated Action Dock */}
                        <div className="flex flex-row md:flex-col gap-3 md:bg-white/5 md:p-6 md:rounded-[2rem] md:border md:border-white/10 md:backdrop-blur-md">
                            {/* Flip Toggle */}
                            <button
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                            >
                                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Flip Card</span>
                            </button>

                            <div className="w-[1px] md:w-full h-full md:h-[1px] bg-white/10" />

                            {/* Download Options */}
                            <button
                                onClick={() => handleDownload(isFlipped ? "back" : "front")}
                                disabled={isGenerating}
                                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                            >
                                <ImageIcon className="w-6 h-6" />
                                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Download Current</span>
                            </button>

                            <button
                                onClick={() => handleDownload("both")}
                                disabled={isGenerating}
                                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl"
                            >
                                <Layers className="w-6 h-6" />
                                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Get All Files</span>
                            </button>

                            <div className="w-[1px] md:w-full h-full md:h-[1px] bg-white/10" />

                            {/* Close (Desktop) */}
                            <button
                                onClick={onClose}
                                className="hidden md:flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                                <X className="w-6 h-6" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Close</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

// Front Card Component
const FrontCard = ({ user, persona, stats, rank }: any) => {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.2),transparent_50%)]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 text-center">
                <h3 className="text-xs font-black tracking-[0.5em] text-gray-400">GIT AURA</h3>
                <div className={`px-4 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase`}>
                    {rank.label} GLOBAL
                </div>
                <div className="flex flex-col items-center gap-6 my-6">
                    <div className="relative">
                        <div className="absolute -inset-6 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                        <img src={user.avatar_url} alt="" className="relative w-32 h-32 rounded-full border-[6px] border-white/5 object-cover" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white leading-none">@{user.login}</h1>
                        <p className={`text-[10px] font-black tracking-[0.3em] uppercase mt-3 py-1 px-3 rounded-lg bg-white/5 ${persona.color}`}>
                            {persona.title}
                        </p>
                    </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-px bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/10 shrink-0 backdrop-blur-xl">
                    <div className="bg-black/20 py-5 px-4 flex flex-col items-center justify-center gap-1.5 border-r border-white/10">
                        <span className="text-[8px] text-gray-500 font-black tracking-[0.3em] uppercase opacity-70">Aura Index</span>
                        <span className="text-2xl font-black text-cyan-400 tabular-nums leading-none">
                            {stats.aura > 9999 ? (stats.aura / 1000).toFixed(1) + 'k' : stats.aura}
                        </span>
                    </div>
                    <div className="bg-black/20 py-5 px-4 flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[8px] text-gray-500 font-black tracking-[0.3em] uppercase opacity-70">Impact Mag</span>
                        <span className="text-2xl font-black text-white tabular-nums leading-none flex items-baseline gap-1">
                            {Number(stats.impact).toFixed(1)}
                            <span className="text-[10px] text-gray-600">/10</span>
                        </span>
                    </div>
                </div>
                <p className="text-[8px] text-gray-600 font-black tracking-[0.4em] uppercase">POWERED BY GITAURA.ME</p>
            </div>
        </div>
    );
};

// Back Card Component
const BackCard = ({ avatarConfig }: { avatarConfig: AuraAvatarConfig }) => {
    return (
        <div className="relative h-full w-full bg-[#050505] overflow-hidden flex items-center justify-center">
            {/* Dark Grid Pattern base */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />

            <div className="w-full h-full flex items-center justify-center p-4">
                <AuraAvatar config={avatarConfig} />
            </div>
        </div>
    );
};

