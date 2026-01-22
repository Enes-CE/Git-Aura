"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { RepoStats } from "@/lib/github";
import { format, parseISO } from "date-fns";

export const ActivityArea = ({ repos }: { repos: RepoStats[] }) => {
    // Aggregate valid dates
    const activityMap: Record<string, number> = {};

    repos.forEach(repo => {
        if (repo.updated_at) {
            const date = repo.updated_at.split('T')[0];
            // Group by month for smoother wave? Or just raw last 10-20 updates
            const month = format(parseISO(repo.updated_at), 'MMM yyyy');
            activityMap[month] = (activityMap[month] || 0) + 1;
        }
    });

    // Convert to array and reverse to show chronological
    const data = Object.entries(activityMap)
        .map(([date, count]) => ({ date, count }))
        .reverse()
        .slice(-12); // Last 12 periods

    return (
        <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                        labelStyle={{ color: "#94a3b8" }}
                        itemStyle={{ color: "#00f2ff" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#00f2ff"
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
