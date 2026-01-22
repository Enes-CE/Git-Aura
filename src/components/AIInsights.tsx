import { GlassCard } from "./ui/GlassCard";
import { Sparkles, Zap, Target } from "lucide-react";
import { UserProfile } from "@/lib/github";

export const AIInsights = ({ user }: { user: UserProfile }) => {
    // Mock AI Logic based on simple stats
    const getPersona = () => {
        if (user.followers > 1000) return "Tech Influencer";
        if (user.public_repos > 50) return "Open Source Warrior";
        return "Rising Star";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <GlassCard className="flex flex-col items-start gap-4" variant="high-contrast">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <h3 className="font-bold font-space text-lg">Developer Persona</h3>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    {getPersona()}
                </div>
                <p className="text-sm text-gray-400">
                    Based on your activity, you show strong traits of consistency and community engagement.
                </p>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-purple-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-bold font-space text-lg">Coded Suggestions</h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                        <Target className="w-4 h-4 text-cyan-500 mt-1" />
                        <span>Update your bio to include your current tech stack.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                        <Target className="w-4 h-4 text-cyan-500 mt-1" />
                        <span>Pin your most popular repository to showcase your best work.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                        <Target className="w-4 h-4 text-cyan-500 mt-1" />
                        <span>Add a README to your profile repository.</span>
                    </li>
                </ul>
            </GlassCard>
        </div>
    );
};
