"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DuelStats } from "@/lib/modules";
import { AuraAvatarConfig } from "@/lib/avatar";
import { useState, useEffect } from "react";
import { Sword, Shield, Zap, Flame, Crown, Play, Search, Loader2 } from "lucide-react";
import { fetchGitHubProfile } from "@/lib/github";
import { performFullAnalysis } from "@/lib/analyzer";
import { generateAuraAvatar } from "@/lib/avatar";
import { toast } from "sonner";

interface TheDuelProps {
    userAvatar: AuraAvatarConfig;
    stats: DuelStats;
}

const StatBar = ({ label, value, color, icon: Icon }: any) => {
    // Tailwind JIT fix: Explicitly map colors
    const colorMap: any = {
        "text-red-400": "bg-red-500",
        "text-purple-400": "bg-purple-500",
        "text-cyan-400": "bg-cyan-400",
        "text-gray-500": "bg-gray-600"
    };

    const bgColor = colorMap[color] || "bg-gray-500";
    const shadowColor = color === 'text-cyan-400' ? 'rgba(34,211,238,0.5)' :
        color === 'text-red-400' ? 'rgba(239,68,68,0.5)' :
            color === 'text-purple-400' ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)';

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <Icon className={`w-3 h-3 ${color}`} />
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{label}</span>
                </div>
                <span className="text-[10px] font-bold text-white">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${bgColor}`}
                    style={{ boxShadow: `0 0 10px ${shadowColor}` }}
                />
            </div>
        </div>
    );
};

export const TheDuel = ({ userAvatar, stats }: TheDuelProps) => {
    const [isBattling, setIsBattling] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [challenger, setChallenger] = useState<any>({
        name: "ROOT ENT [ANCIENT]",
        imageUrl: "/avatars/Root_Ent.png",
        type: "Guardian",
        primaryColor: "#22c55e",
        stats: {
            attack: 75,
            defense: 90,
            magic: 40,
            speed: 55
        }
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsLoading(true);
        try {
            const data = await fetchGitHubProfile(searchQuery);
            const analysis = performFullAnalysis(data.user, data.repos, data.languages);

            // Calculate RPG stats for challenger
            const attack = Math.min(100, Math.round((data.repos.length / 50) * 100));
            const githubAge = new Date().getFullYear() - new Date(data.user.created_at).getFullYear();
            const defense = Math.min(100, Math.round((githubAge / 10) * 100));
            const magic = Math.min(100, Math.round((data.languages.length / 12) * 100));
            const speed = analysis.consistencyScore;

            const avatarConfig = generateAuraAvatar(
                data.languages,
                data.repos.length / Math.max(1, githubAge),
                githubAge,
                analysis.commitHabit.peakHour,
                data.repos.reduce((acc, r) => acc + r.stargazers_count, 0),
                analysis.impactIndex
            );

            setChallenger({
                name: data.user.name || data.user.login,
                imageUrl: avatarConfig.imageUrl,
                type: avatarConfig.type,
                primaryColor: avatarConfig.primaryColor,
                stats: { attack, defense, magic, speed }
            });
            setWinner(null);
        } catch (error) {
            toast.error("Kullanıcı Bulunamadı", {
                description: "Lütfen geçerli bir GitHub kullanıcı adı girin.",
            });
        } finally {
            setIsLoading(false);
            setSearchQuery("");
        }
    };

    const runDuel = () => {
        setIsBattling(true);
        setWinner(null);

        setTimeout(() => {
            const userPower = stats.attack + stats.magic + stats.speed;
            const enemyPower = challenger.stats.attack + challenger.stats.magic + challenger.stats.speed;

            setWinner(userPower >= enemyPower ? "user" : "enemy");
            setIsBattling(false);
        }, 3000);
    };

    return (
        <div className="relative py-16 px-6 md:px-12 bg-[#050505] rounded-[3rem] border border-white/5 overflow-hidden">
            {/* Arena Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#111_0%,#000_100%)]" />
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="relative z-10 flex flex-col gap-12 items-center">
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3">
                        <Sword className="w-8 h-8 text-red-500 animate-pulse" />
                        <h3 className="text-white font-black text-4xl tracking-tighter uppercase">The Duel Arena</h3>
                        <Sword className="w-8 h-8 text-red-500 animate-pulse scale-x-[-1]" />
                    </div>
                    <p className="text-xs text-red-500 px-4 py-1 bg-red-500/10 border border-red-500/20 rounded-full font-bold tracking-[0.4em] uppercase inline-block">
                        Simulation Mode: Active
                    </p>
                </div>

                <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-4 relative">
                    {/* User Avatar */}
                    <motion.div
                        animate={isBattling ? { x: [0, 20, -10, 0], scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: isBattling ? Infinity : 0, duration: 0.2 }}
                        className="flex flex-col items-center gap-6 w-full max-w-[300px]"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-48 h-48 rounded-[2rem] border-4 border-cyan-500/50 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] relative">
                                <img src={userAvatar.imageUrl} className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-xl">
                                LVL {Math.floor(stats.defense / 10) + 1} {userAvatar.type}
                            </div>
                        </div>

                        <div className="w-full space-y-4 pt-6">
                            <StatBar label="Attack" value={stats.attack} color="text-red-400" icon={Flame} />
                            <StatBar label="Magic" value={stats.magic} color="text-purple-400" icon={Zap} />
                            <StatBar label="Defense" value={stats.defense} color="text-cyan-400" icon={Shield} />
                        </div>
                    </motion.div>

                    {/* VS Center */}
                    <div className="flex flex-col items-center gap-8 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 blur-[100px] -z-10" />
                        <AnimatePresence mode="wait">
                            {winner ? (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center gap-4 py-8"
                                >
                                    <Crown className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                                    <span className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {winner === 'user' ? 'Victory!' : 'Defeat!'}
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center bg-white/2 backdrop-blur-3xl"
                                    animate={isBattling ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
                                >
                                    <span className="text-5xl font-black text-white/10 italic">VS</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSearch} className="relative w-full max-w-xs mt-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Challenge a Friend..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : <Search className="w-5 h-5" />}
                            </button>
                        </form>

                        <button
                            disabled={isBattling || isLoading}
                            onClick={runDuel}
                            className="group relative px-10 py-4 bg-white text-black font-black text-sm uppercase tracking-[0.3em] overflow-hidden rounded-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isBattling ? "Fighting..." : "Start Duel"}
                                <Play className="w-4 h-4 fill-current" />
                            </span>
                        </button>
                    </div>

                    <motion.div
                        animate={isBattling ? { x: [0, -20, 10, 0], scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: isBattling ? Infinity : 0, duration: 0.2, delay: 0.1 }}
                        className="flex flex-col items-center gap-6 w-full max-w-[300px]"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-red-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-48 h-48 rounded-[2rem] border-4 border-white/10 overflow-hidden shadow-2xl relative">
                                <img src={challenger.imageUrl} className="w-full h-full object-cover" alt="Enemy" />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-xl">
                                LVL {Math.floor(challenger.stats.defense / 10) + 1} {challenger.name}
                            </div>
                        </div>

                        <div className="w-full space-y-4 pt-6">
                            <StatBar label="Attack" value={challenger.stats.attack} color="text-gray-500" icon={Flame} />
                            <StatBar label="Magic" value={challenger.stats.magic} color="text-gray-500" icon={Zap} />
                            <StatBar label="Defense" value={challenger.stats.defense} color="text-gray-500" icon={Shield} />
                        </div>
                    </motion.div>
                </div>

                {/* Footer Insight */}
                <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-2xl max-w-2xl text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        Calculated using: Commits ({stats.attack}), Account Age ({stats.defense}), Language Diversity ({stats.magic}), and Consistency ({stats.speed})
                    </p>
                </div>
            </div>
        </div>
    );
};
