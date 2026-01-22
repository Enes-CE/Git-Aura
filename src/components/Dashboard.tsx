"use client";

import { motion } from "framer-motion";
import { UserProfile, RepoStats, LanguageData } from "@/lib/github";
import { GlassCard } from "./ui/GlassCard";
import { LanguageRadar } from "./charts/LanguageRadar";
import { ActivityArea } from "./charts/ActivityArea";
import { AuraScore } from "./ui/AuraScore";
import { CountUp } from "./ui/CountUp";
import { ShareModal } from "./ShareModal";
import { RankingCard } from "./ranking/RankingCard";
import { TechTimeline } from "./charts/TechTimeline";
import { ClockChart } from "./charts/ClockChart";
import { Clock } from "lucide-react";
import { GhostCard } from "./insights/GhostCard";
import { QualityCard } from "./insights/QualityCard";
import { ZodiacCard } from "./fun/ZodiacCard";
import { SoulmateCard } from "./fun/SoulmateCard";
import { SoundwaveCard } from "./fun/SoundwaveCard";
import { performFullAnalysis } from "@/lib/analyzer";
import { getTechZodiac, findCodingSoulmate, generateAuraSoundwave } from "@/lib/fun";
import { getPersona, getBadges, calculateStreak, calculateImpactScore } from "@/lib/persona";
import { getGlobalRank } from "@/lib/ranking";
import { generateAuraAvatar } from "@/lib/avatar";
import { TimeMachine } from "./TimeMachine";
import { CodeArcheology } from "./CodeArcheology";
import { TheDuel } from "./TheDuel";
import { MapPin, Trophy, Activity, MessageSquare, Code2, Clock as ClockIcon, Zap, Flame, Languages, Shield, DraftingCompass, Megaphone, Moon, Sword, Wand2, FlaskConical, Ghost, ShieldCheck, UserCheck, Factory, Trophy as TrophyIcon, Share2 } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

interface DashboardProps {
    data: {
        user: UserProfile;
        repos: RepoStats[];
        languages: LanguageData[];
    };
}

export const Dashboard = ({ data }: DashboardProps) => {
    const { user, repos, languages } = data;
    const [isShareOpen, setIsShareOpen] = useState(false);
    const { data: session } = useSession();
    const currentUserId = (session?.user as any)?.id;

    // Full Analysis Engine
    const analysis = performFullAnalysis(user, repos, languages);
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const persona = getPersona(user, repos, languages);
    const badges = getBadges(user, repos);
    const globalRank = getGlobalRank(user, repos);

    // Fun Modules
    const techZodiac = getTechZodiac(user, languages);
    const codingSoulmate = findCodingSoulmate(user, repos, languages, analysis.commitHabit.peakHour);
    const auraSoundwave = generateAuraSoundwave(repos);

    // Avatar Generation
    const githubAgeInYears = new Date().getFullYear() - new Date(user.created_at).getFullYear();
    const avgCommitsPerDay = repos.length / Math.max(1, githubAgeInYears);
    const avatarConfig = generateAuraAvatar(
        languages,
        avgCommitsPerDay,
        githubAgeInYears,
        analysis.commitHabit.peakHour,
        totalStars,
        analysis.impactIndex
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12"
        >
            {/* Header: User Profile Summary */}
            <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div variants={item} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black object-cover"
                    />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 bg-black border border-white/20 p-2 rounded-xl"
                    >
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                </motion.div>

                <div className="flex-1 text-center md:text-left space-y-4">
                    <motion.div variants={item} className="space-y-1">
                        <h2 className="text-4xl md:text-5xl font-black font-space text-white">
                            {user.name || user.login}
                        </h2>
                        <p className="text-gray-400 text-lg flex items-center justify-center md:justify-start gap-2">
                            <a
                                href={`https://github.com/${user.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            >
                                @{user.login}
                            </a>
                            {user.location && (
                                <>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                    <MapPin className="w-4 h-4" />
                                    {user.location}
                                </>
                            )}
                        </p>
                    </motion.div>

                    <motion.div variants={item} className="flex flex-wrap justify-center md:justify-start gap-3">
                        {badges.map((badge) => (
                            <div key={badge.id} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                <span className={`w-2 h-2 rounded-full ${badge.color.replace('text', 'bg')}`}></span>
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{badge.label}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Aura Power Level Bar */}
                    <motion.div variants={item} className="pt-2 space-y-3">
                        <div className="flex items-center justify-between mb-1.5 px-1">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Developer Power Level</span>
                        </div>
                        <div className="h-2 w-full md:w-64 bg-white/5 rounded-full overflow-hidden border border-white/10 relative group">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (analysis.impactIndex / 5000) * 100)}%` }}
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            />
                            {/* Scanning Line */}
                            <motion.div
                                animate={{ left: ['-10%', '110%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                            />
                        </div>
                        {/* Aura Index Display */}
                        <div className="flex items-center gap-3 px-1">
                            <div className="flex-1">
                                <p className="text-2xl font-black text-cyan-400 tabular-nums">
                                    <CountUp to={analysis.impactIndex} />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={item} className="flex flex-col gap-4">
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-colors flex items-center gap-3 group"
                    >
                        <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Share Aura
                    </button>
                    <Link
                        href="/leaderboard"
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl hover:border-cyan-500/50 transition-all flex items-center justify-center gap-3 group"
                    >
                        <Trophy className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                            Leaderboard
                        </span>
                    </Link>
                </motion.div>
            </div>

            {/* Grid Layout: Stats & Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Core Metrics */}
                <div className="lg:col-span-4 space-y-8">
                    <RankingCard rank={globalRank} isGodMode={analysis.isGodMode} />

                    <GlassCard className="p-8 space-y-6">
                        <h3 className="text-xl font-bold font-space flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-500" />
                            Activity Pulse
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Repos</p>
                                <p className="text-2xl font-black text-white"><CountUp to={user.public_repos} /></p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Stars</p>
                                <p className="text-2xl font-black text-white"><CountUp to={totalStars} /></p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Followers</p>
                                <p className="text-2xl font-black text-white"><CountUp to={user.followers} /></p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Best Streak</p>
                                <p className="text-2xl font-black text-orange-400 flex items-center gap-1">
                                    <CountUp to={calculateStreak(repos)} />
                                    <Flame className="w-5 h-5" />
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 group hover:bg-cyan-500/10 transition-colors">
                                <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Aura Index</p>
                                <p className="text-2xl font-black text-cyan-400 tabular-nums">
                                    <CountUp to={analysis.impactIndex} />
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 group hover:bg-purple-500/10 transition-colors">
                                <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Impact Mag</p>
                                <p className="text-2xl font-black text-white tabular-nums">
                                    {calculateImpactScore(user, repos)}
                                    <span className="text-[10px] text-gray-500 ml-1">/ 10</span>
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: Insights & Visuals */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold font-space flex items-center gap-2 mb-6">
                                <Code2 className="w-5 h-5 text-purple-500" />
                                Language Stack
                            </h3>
                            <div className="h-[300px]">
                                <LanguageRadar data={languages} />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold font-space flex items-center gap-2 mb-6">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Commit Rhythm
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl bg-white/5 ${analysis.commitHabit.color}`}>
                                        <div className="p-2 border border-white/10 rounded-lg">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Archetype</p>
                                        <h4 className={`text-xl font-black uppercase ${analysis.commitHabit.color}`}>{analysis.commitHabit.label}</h4>
                                    </div>
                                </div>
                                <div className="pt-4 pb-2">
                                    <ClockChart habit={analysis.commitHabit} />
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-8">
                        <div className="flex justify-between items-center mb-8 px-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <h3 className="text-xl font-bold font-space text-white">Tech Evolution</h3>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Trajectory Analysis</p>
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <TechTimeline evolution={analysis.techEvolution} />
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Suggestions & Persona */}
            <div className="space-y-8 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <motion.h2 variants={item} className="text-3xl font-bold font-space text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-yellow-400" />
                        Developer Persona
                    </motion.h2>
                    <motion.div variants={item} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <PersonaIconMapper icon={persona.icon} className={`w-5 h-5 ${persona.color}`} />
                        <span className={`text-sm font-black uppercase tracking-[0.2em] ${persona.color}`}>
                            {persona.title}
                        </span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SuggestionCard
                        icon={<PersonaIconMapper icon={persona.icon} className={`w-6 h-6 ${persona.color}`} />}
                        title={persona.title}
                        desc={persona.description}
                        score={85}
                        colorClass={persona.color}
                    />
                    <SuggestionCard
                        icon={<Languages className="w-6 h-6 text-blue-400" />}
                        title="Repo Architecture"
                        desc="Analyzed code complexity and project separation metrics reveal a solid structural foundation."
                        score={Math.max(45, Math.min(100, (user.public_repos / 40) * 100))}
                    />
                    <SuggestionCard
                        icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
                        title="Quality Index"
                        desc="Code maintainability and documentation health across your active repositories."
                        score={analysis.qualityScore.score > 0 ? analysis.qualityScore.score : 72}
                    />
                </div>
            </div>

            {/* Advanced Insights: Ghost & Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                <GhostCard risk={analysis.riskAnalysis} />
                <QualityCard quality={analysis.qualityScore} />
            </div>

            {/* Fun Experience: Zodiac, Soulmate & Soundwave */}
            <div className="space-y-4 pt-8">
                <motion.h2 variants={item} className="text-2xl font-bold font-space text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-purple-500" />
                    Experience Zone
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ZodiacCard zodiac={techZodiac} />
                    <SoulmateCard match={codingSoulmate} />
                    <SoundwaveCard waveData={auraSoundwave} />
                </div>
            </div>

            {/* Module 2: Time Machine */}
            <div className="pt-12">
                <TimeMachine milestones={analysis.modules.timeMachine} />
            </div>

            {/* Module 3: Code Archeology */}
            <div className="pt-12">
                <CodeArcheology achievements={analysis.modules.archeology} />
            </div>

            {/* Module 4: The Duel */}
            <div className="pt-12">
                <TheDuel userAvatar={avatarConfig} stats={analysis.modules.duelStats} />
            </div>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                user={user}
                persona={persona}
                stats={{
                    aura: analysis.impactIndex,
                    impact: calculateImpactScore(user, repos),
                    stars: totalStars
                }}
                rank={globalRank}
                avatarConfig={avatarConfig}
            />
        </motion.div >
    );
};

const SuggestionCard = ({ icon, title, desc, score, colorClass = "text-cyan-400" }: { icon: React.ReactNode, title: string, desc: string, score: number, colorClass?: string }) => (
    <GlassCard className="p-6 relative overflow-hidden group">
        <div className="absolute top-4 right-4 z-10">
            <div className={`px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${score > 70 ? 'bg-cyan-400' : score > 40 ? 'bg-yellow-400' : 'bg-orange-400'}`} />
                <span className="text-sm font-black text-white tabular-nums tracking-tighter">
                    {score}<span className="text-[10px] text-gray-500 ml-0.5">%</span>
                </span>
            </div>
        </div>
        <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-white/5 w-fit border border-white/10">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="text-lg font-bold text-white font-space leading-tight">{title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed pr-8 line-clamp-2">{desc}</p>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    className={`h-full bg-gradient-to-r from-transparent ${score > 70 ? 'via-cyan-500' : 'via-yellow-500'} to-transparent`}
                />
            </div>
        </div>
    </GlassCard>
);
const PersonaIconMapper = ({ icon, className }: { icon: string, className?: string }) => {
    switch (icon) {
        case "Moon": return <Moon className={className} />;
        case "Languages": return <Languages className={className} />;
        case "DraftingCompass": return <DraftingCompass className={className} />;
        case "Megaphone": return <Megaphone className={className} />;
        case "Shield": return <Shield className={className} />;
        case "Wand2": return <Wand2 className={className} />;
        case "FlaskConical": return <FlaskConical className={className} />;
        case "Ghost": return <Ghost className={className} />;
        case "Sword": return <Sword className={className} />;
        default: return <Sword className={className} />;
    }
};
