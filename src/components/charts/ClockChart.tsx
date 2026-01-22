"use client";

import { motion } from "framer-motion";
import { CommitHabit } from "@/lib/analyzer";

interface ClockChartProps {
    habit: CommitHabit;
}

export const ClockChart = ({ habit }: ClockChartProps) => {
    const maxValue = Math.max(...habit.hourDistribution);
    const radius = 80;
    const center = 100;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Clock Visualization */}
            <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200" className="transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="2"
                    />

                    {/* Hour Markers & Bars */}
                    {habit.hourDistribution.map((value, hour) => {
                        const angle = (hour * 15) * (Math.PI / 180); // 15° per hour
                        const barLength = maxValue > 0 ? (value / maxValue) * 40 : 0;

                        // Start point (inner circle)
                        const x1 = center + (radius - 45) * Math.cos(angle);
                        const y1 = center + (radius - 45) * Math.sin(angle);

                        // End point (based on value)
                        const x2 = center + (radius - 45 + barLength) * Math.cos(angle);
                        const y2 = center + (radius - 45 + barLength) * Math.sin(angle);

                        const isPeak = hour === habit.peakHour;

                        return (
                            <motion.line
                                key={hour}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={isPeak ? "#06b6d4" : "rgba(168, 85, 247, 0.6)"}
                                strokeWidth={isPeak ? "3" : "2"}
                                strokeLinecap="round"
                                initial={{ x2: x1, y2: y1 }}
                                animate={{ x2, y2 }}
                                transition={{ delay: hour * 0.02, duration: 0.5 }}
                            />
                        );
                    })}

                    {/* Center Dot */}
                    <circle cx={center} cy={center} r="4" fill="#06b6d4" />
                </svg>

                {/* Hour Labels (12, 3, 6, 9) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-xs text-gray-500 font-bold">00</div>
                <div className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 text-xs text-gray-500 font-bold">06</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-xs text-gray-500 font-bold">12</div>
                <div className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 text-xs text-gray-500 font-bold">18</div>
            </div>
        </div>
    );
};
