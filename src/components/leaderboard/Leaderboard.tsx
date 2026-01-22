"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, GitFork, Users, Code2, ExternalLink, Medal, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { LeaderboardEntry } from "@/lib/leaderboard";
import { useSession } from "next-auth/react";

interface LeaderboardProps {
    currentUserLogin?: string;
}

const tierColors: Record<string, string> = {
    Platinum: "text-purple-400",
    Gold: "text-yellow-400",
    Silver: "text-gray-300",
    Bronze: "text-orange-400",
    Iron: "text-gray-500",
};

const tierBgColors: Record<string, string> = {
    Platinum: "bg-purple-500/10 border-purple-500/30",
    Gold: "bg-yellow-500/10 border-yellow-500/30",
    Silver: "bg-gray-500/10 border-gray-500/30",
    Bronze: "bg-orange-500/10 border-orange-500/30",
    Iron: "bg-gray-500/5 border-gray-500/20",
};

export const Leaderboard = ({ currentUserLogin }: LeaderboardProps) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const { data: session } = useSession();
    
    // Filters state
    const [filters, setFilters] = useState({
        language: "",
        tier: "",
        minAura: "",
        minStars: "",
        minFollowers: "",
        sortBy: "impact_index",
    });

    // Debounced filters for API calls (only number inputs are debounced)
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    // Available languages state (from API)
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    
    // User rank state
    const [userRank, setUserRank] = useState<{
        rank: number;
        totalUsers: number;
        percentile: number;
        aboveUsers: number;
        estimatedGlobalRank?: number;
        estimatedGlobalPercentile?: number;
        isEstimated?: boolean;
        distributionBased?: boolean;
    } | null>(null);

    // Fallback to session if currentUserLogin not provided
    const currentLogin = currentUserLogin || (session?.user as any)?.login;

    // Fetch leaderboard function
    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedFilters.language) params.append("language", debouncedFilters.language);
            if (debouncedFilters.tier) params.append("tier", debouncedFilters.tier);
            if (debouncedFilters.minAura) params.append("minAura", debouncedFilters.minAura);
            if (debouncedFilters.minStars) params.append("minStars", debouncedFilters.minStars);
            if (debouncedFilters.minFollowers) params.append("minFollowers", debouncedFilters.minFollowers);
            params.append("sortBy", debouncedFilters.sortBy);

            // Kullanıcı login varsa, sıralamasını da iste
            if (currentLogin) {
                params.append("username", currentLogin);
            }
            
            const response = await fetch(`/api/leaderboard?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                
                // API response formatını kontrol et (yeni format: { leaderboard, availableLanguages } veya eski format: array)
                if (Array.isArray(data)) {
                    // Eski format (sadece array)
                    setLeaderboard(data);
                } else {
                    // Yeni format (object with leaderboard and availableLanguages)
                    setLeaderboard(data.leaderboard || []);
                    // API'den gelen tüm dilleri set et (sadece boş değilse güncelle)
                    if (data.availableLanguages && Array.isArray(data.availableLanguages) && data.availableLanguages.length > 0) {
                        setAvailableLanguages(data.availableLanguages);
                    }
                    // Kullanıcı sıralamasını set et
                    if (data.userRank) {
                        setUserRank(data.userRank);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedFilters]);

    // Debounce effect for number inputs (minAura, minStars, minFollowers)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500); // 500ms debounce for number inputs

        return () => clearTimeout(timer);
    }, [filters.minAura, filters.minStars, filters.minFollowers]);

    // Immediate update for select inputs (language, tier, sortBy)
    useEffect(() => {
        setDebouncedFilters(filters);
    }, [filters.language, filters.tier, filters.sortBy]);

    // Fetch when debounced filters change
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    if (isLoading) {
        return (
            <div className="pt-12">
                <GlassCard className="p-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="pt-12">
                <GlassCard className="p-8">
                    <div className="text-center py-12">
                        <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No leaderboard entries yet. Be the first!</p>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="pt-12">
            <div className="flex items-center justify-between mb-8">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold font-space text-white flex items-center gap-3"
                    data-testid="leaderboard-title"
                >
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    Global Leaderboard
                </motion.h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all"
                        data-testid="filter-button"
                        aria-label="Toggle filters"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-semibold">Filters</span>
                        {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest" data-testid="top-developers-count">
                        {isLoading ? "Loading..." : `Top ${leaderboard.length} Developers`}
                    </div>
                </div>
            </div>

            {/* User Rank Card */}
            {userRank && currentLogin && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <GlassCard className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/50 flex items-center justify-center">
                                    <Trophy className="w-8 h-8 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                                        Your GitHub Rank
                                        {userRank.isEstimated && (
                                            <span className="ml-2 text-yellow-400">(Estimated)</span>
                                        )}
                                    </p>
                                    <p className="text-3xl font-black text-white">
                                        #{userRank.rank.toLocaleString()}
                                        <span className="text-lg text-gray-400 ml-2">
                                            of {userRank.totalUsers.toLocaleString()}
                                        </span>
                                    </p>
                                    <p className="text-sm text-cyan-400 mt-1">
                                        Top {userRank.percentile.toFixed(2)}% of developers
                                    </p>
                                    {userRank.isEstimated && !userRank.distributionBased && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Based on power-law distribution model of ~10M active GitHub users
                                        </p>
                                    )}
                                    {userRank.distributionBased && (
                                        <p className="text-xs text-cyan-400 mt-2">
                                            ✓ Based on real data distribution from {userRank.totalUsers.toLocaleString()} users
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Percentile</p>
                                <div className="relative w-24 h-24">
                                    <svg className="transform -rotate-90 w-24 h-24">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-white/10"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - userRank.percentile / 100)}`}
                                            className="text-cyan-400 transition-all duration-1000"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-black text-cyan-400">
                                            {userRank.percentile.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!leaderboard.some(e => e.github_username === currentLogin) && (
                            <div className="mt-4 pt-4 border-t border-cyan-500/20">
                                <p className="text-xs text-gray-400 text-center">
                                    Your profile is not in the top {leaderboard.length} list. 
                                    Keep coding to climb the ranks! 🚀
                                </p>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            )}

            {/* Filters Panel */}
            <AnimatePresence>
                {isFiltersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6 overflow-visible relative z-50"
                    >
                    <GlassCard className="p-6 relative z-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Language Filter */}
                            <div className="relative z-[60]">
                                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                                    Language
                                </label>
                                <select
                                    value={filters.language}
                                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 appearance-none cursor-pointer hover:bg-[#0f0f15] transition-colors relative z-[60]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        paddingRight: '40px'
                                    }}
                                >
                                    <option value="" className="bg-[#0a0a0f] text-white">All Languages</option>
                                    {availableLanguages.length > 0 ? (
                                        availableLanguages.map((lang) => (
                                            <option key={lang} value={lang} className="bg-[#0a0a0f] text-white">
                                                {lang}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled className="bg-[#0a0a0f] text-gray-500">Loading languages...</option>
                                    )}
                                </select>
                            </div>

                            {/* Tier Filter */}
                            <div className="relative z-[60]">
                                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                                    Tier
                                </label>
                                <select
                                    value={filters.tier}
                                    onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 appearance-none cursor-pointer hover:bg-[#0f0f15] transition-colors relative z-[60]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        paddingRight: '40px'
                                    }}
                                >
                                    <option value="" className="bg-[#0a0a0f] text-white">All Tiers</option>
                                    <option value="Platinum" className="bg-[#0a0a0f] text-white">Platinum</option>
                                    <option value="Gold" className="bg-[#0a0a0f] text-white">Gold</option>
                                    <option value="Silver" className="bg-[#0a0a0f] text-white">Silver</option>
                                    <option value="Bronze" className="bg-[#0a0a0f] text-white">Bronze</option>
                                    <option value="Iron" className="bg-[#0a0a0f] text-white">Iron</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="relative z-[60]">
                                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 appearance-none cursor-pointer hover:bg-[#0f0f15] transition-colors relative z-[60]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        paddingRight: '40px'
                                    }}
                                >
                                    <option value="impact_index" className="bg-[#0a0a0f] text-white">Aura Score</option>
                                    <option value="total_stars" className="bg-[#0a0a0f] text-white">Stars</option>
                                    <option value="followers" className="bg-[#0a0a0f] text-white">Followers</option>
                                    <option value="total_forks" className="bg-[#0a0a0f] text-white">Forks</option>
                                </select>
                            </div>

                            {/* Min Aura */}
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                                    Min Aura Score
                                </label>
                                <input
                                    type="number"
                                    value={filters.minAura}
                                    onChange={(e) => setFilters({ ...filters, minAura: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:bg-[#0f0f15] transition-colors"
                                />
                            </div>

                            {/* Min Stars */}
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                                    Min Stars
                                </label>
                                <input
                                    type="number"
                                    value={filters.minStars}
                                    onChange={(e) => setFilters({ ...filters, minStars: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:bg-[#0f0f15] transition-colors"
                                />
                            </div>

                            {/* Min Followers */}
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">
                                    Min Followers
                                </label>
                                <input
                                    type="number"
                                    value={filters.minFollowers}
                                    onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:bg-[#0f0f15] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setFilters({
                                        language: "",
                                        tier: "",
                                        minAura: "",
                                        minStars: "",
                                        minFollowers: "",
                                        sortBy: "impact_index",
                                    });
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Clear All
                            </button>
                        </div>
                    </GlassCard>
                </motion.div>
                )}
            </AnimatePresence>

            <GlassCard className="p-6">
                {/* Leaderboard Stats Summary */}
                <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Developers</p>
                            <p className="text-2xl font-black text-white">
                                {userRank ? userRank.totalUsers.toLocaleString() : leaderboard.length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Avg Aura Score</p>
                            <p className="text-2xl font-black text-cyan-400">
                                {leaderboard.length > 0
                                    ? Math.round(
                                          leaderboard.reduce((sum, e) => sum + e.impact_index, 0) / leaderboard.length
                                      ).toLocaleString()
                                    : "0"}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Stars</p>
                            <p className="text-2xl font-black text-yellow-400">
                                {leaderboard.reduce((sum, e) => sum + e.total_stars, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Languages</p>
                            <p className="text-2xl font-black text-purple-400">
                                {availableLanguages.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {leaderboard.map((entry, index) => {
                        const isCurrentUser = currentLogin === entry.github_username;
                        const tier = entry.tier || "Iron";
                        const tierColor = tierColors[tier] || tierColors.Iron;
                        const tierBg = tierBgColors[tier] || tierBgColors.Iron;

                        return (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                                    isCurrentUser
                                        ? "bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                            >
                                {/* Rank with Medal Icon */}
                                <div className="flex-shrink-0 w-14 flex items-center justify-center">
                                    {index < 3 ? (
                                        <div className="relative">
                                            <Medal className={`w-8 h-8 ${
                                                index === 0 ? "text-yellow-400" : 
                                                index === 1 ? "text-gray-300" : 
                                                "text-orange-400"
                                            }`} />
                                            <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${
                                                index === 0 ? "text-yellow-900" : 
                                                index === 1 ? "text-gray-800" : 
                                                "text-orange-900"
                                            }`}>
                                                {index + 1}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Medal className="w-8 h-8 text-blue-500/60" />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-900">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <a
                                    href={`https://github.com/${entry.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                >
                                    <img
                                        src={entry.github_avatar_url}
                                        alt={entry.github_username}
                                        className="w-14 h-14 rounded-full border-2 border-white/20 hover:border-cyan-400/50 transition-colors"
                                    />
                                </a>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <a
                                            href={`https://github.com/${entry.github_username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold text-lg text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                                        >
                                            {entry.github_username}
                                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                                        </a>
                                        {isCurrentUser && (
                                            <span className="text-xs px-2.5 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/40 font-bold">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        {entry.dominant_language && (
                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                                                <Code2 className="w-3.5 h-3.5" />
                                                {entry.dominant_language}
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-1 rounded-full border ${tierBg} ${tierColor} text-xs font-bold`}>
                                            {tier}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="hidden lg:grid grid-cols-3 gap-6 px-6 border-l border-white/10">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1.5">
                                            <Star className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wide">Stars</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{entry.total_stars.toLocaleString()}</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1.5">
                                            <GitFork className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wide">Forks</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{entry.total_forks.toLocaleString()}</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1.5">
                                            <Users className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase tracking-wide">Followers</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{entry.followers.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* AURA Score - Prominent */}
                                <div className="flex-shrink-0 text-right border-l border-white/10 pl-6">
                                    <div className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">
                                        AURA
                                    </div>
                                    <div className="text-3xl font-black text-cyan-400 tabular-nums">
                                        {Math.round(entry.impact_index).toLocaleString()}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
};

