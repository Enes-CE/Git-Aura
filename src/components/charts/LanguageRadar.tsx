"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { LanguageData } from "@/lib/github";

export const LanguageRadar = ({ data }: { data: LanguageData[] }) => {
    // Normalize data for Radar if needed, but raw values might be too disparate.
    // Converting to log scale or percentage might be better visually if values differ largely.
    // For now, let's assume raw values but visual might be skewed.
    // Let's take the top 5 and use generic 0-100 scale for visual balance based on max.

    const maxVal = Math.max(...data.map(d => d.value));
    const normalizedData = data.slice(0, 5).map(d => ({
        subject: d.name,
        A: (d.value / maxVal) * 100,
        fullMark: 100,
    }));

    return (
        <div className="w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={normalizedData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Radar
                        name="Language DNA"
                        dataKey="A"
                        stroke="#bc13fe"
                        strokeWidth={3}
                        fill="#00f2ff"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
