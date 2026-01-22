"use client";

import { motion } from "framer-motion";
import { Milestone } from "@/lib/modules";
import { History, Egg, Landmark, Zap, Clock } from "lucide-react";

const IconMap: any = { Egg, Landmark, Zap, Clock };

export const TimeMachine = ({ milestones }: { milestones: Milestone[] }) => {
    return (
        <div className="relative py-12 px-6 bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -z-10" />

            <div className="relative z-10 flex flex-col gap-12">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <History className="w-6 h-6 text-purple-400" />
                        <h3 className="text-white font-black text-3xl tracking-tighter uppercase">Time Machine</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-bold tracking-[0.3em] uppercase ml-9">The Chronicles of Your Code</p>
                </div>

                <div className="relative ml-4 md:ml-12 border-l-2 border-white/10 pl-8 md:pl-16 space-y-20">
                    {milestones.map((milestone, index) => {
                        const Icon = IconMap[milestone.icon] || Clock;
                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                {/* Year Label */}
                                <div className="absolute -left-[3.25rem] md:-left-[5.25rem] top-0 flex items-center justify-center w-10 md:w-16 h-8 bg-[#0a0a0a] border border-white/20 rounded-lg z-20">
                                    <span className="text-[10px] md:text-xs font-black text-white">{milestone.year}</span>
                                </div>

                                {/* Node Dot */}
                                <div className="absolute -left-[9.1rem] md:-left-[17.1rem] top-4 w-4 h-4 bg-purple-500 rounded-full border-4 border-[#0a0a0a] shadow-[0_0_15px_rgba(168,85,247,0.5)] z-20 group-hover:scale-150 transition-transform" />

                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors shadow-2xl">
                                        <Icon className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <div className="max-w-xl space-y-2">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors">
                                            {milestone.title}
                                        </h4>
                                        <p className="text-sm text-gray-400 leading-relaxed font-medium italic">
                                            "{milestone.description}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-center">
                    <p className="text-[10px] text-gray-600 font-bold tracking-[0.4em] uppercase">--- End of Recorded History ---</p>
                </div>
            </div>
        </div>
    );
};
