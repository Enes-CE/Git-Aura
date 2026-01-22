"use client";

import { motion } from "framer-motion";
import { Achievement } from "@/lib/modules";
import { Crown, Star, Flame, Award, Shield, Zap, Search } from "lucide-react";

const IconMap: any = { Crown, Star, Flame, Award, Shield, Zap };

const RarityStyles = {
    common: "from-gray-400 to-gray-600 border-gray-500/30 text-gray-400",
    rare: "from-blue-400 to-blue-600 border-blue-500/30 text-blue-400",
    epic: "from-purple-400 to-purple-600 border-purple-500/30 text-purple-400",
    legendary: "from-yellow-400 to-orange-600 border-yellow-500/30 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
};

export const CodeArcheology = ({ achievements }: { achievements: Achievement[] }) => {
    return (
        <div className="p-10 bg-[#080808] rounded-[3rem] border border-white/5 relative overflow-hidden group">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

            <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Search className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-white font-black text-3xl tracking-tighter uppercase">Code Archeology</h3>
                        </div>
                        <p className="text-xs text-cyan-500 font-bold tracking-[0.3em] uppercase opacity-70 ml-9">Artifacts Uncovered In Your History</p>
                    </div>

                    <div className="w-full md:w-64 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span>Collection Progress</span>
                            <span className="text-cyan-400">{achievements.filter(a => a.unlocked).length} / {achievements.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement, index) => {
                        const Icon = IconMap[achievement.icon] || Award;
                        const isUnlocked = achievement.unlocked;
                        const rarityInPercent = Math.round(achievement.rarityScore * 100);

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative p-6 rounded-[2rem] border bg-black/40 backdrop-blur-xl transition-all duration-500 overflow-hidden group ${isUnlocked
                                        ? 'border-white/10 hover:border-cyan-500/50'
                                        : 'border-white/5 opacity-40 grayscale pointer-events-none'
                                    }`}
                            >
                                {/* Glow Effect for Rare items */}
                                {isUnlocked && achievement.rarity === 'legendary' && (
                                    <div className="absolute -inset-px bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}

                                <div className="relative z-10 flex flex-col h-full gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${isUnlocked ? RarityStyles[achievement.rarity].split(' ')[2] : 'text-gray-600'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${RarityStyles[achievement.rarity]}`}>
                                                {achievement.rarity}
                                            </div>
                                            <span className="text-[10px] font-bold text-white/40">Top {rarityInPercent}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-cyan-500/50 uppercase tracking-widest">{achievement.category}</span>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{achievement.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                                            {achievement.description}
                                        </p>
                                    </div>

                                    {/* Progress to Next Level */}
                                    <div className="mt-auto pt-4 space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600">
                                            <span>Discovery Progress</span>
                                            <span>{Math.round(achievement.progressToNext || 0)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${achievement.progressToNext || 0}%` }}
                                                className={`h-full bg-gradient-to-r ${RarityStyles[achievement.rarity].split(' ').slice(0, 2).join(' ')}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
