import { UserProfile, RepoStats, LanguageData } from "./github";

export interface Persona {
    title: string;
    icon: string;
    color: string; // Tailwind text color class
    description: string;
}

export interface Badge {
    id: string;
    icon: string;
    label: string;
    color: string;
}

/**
 * Optimizes the developer persona based on multi-dimensional analysis:
 * 1. Bio Keywords
 * 2. Language Dominance
 * 3. Activity Patterns
 * 4. Engagement Metrics
 */
export const getPersona = (user: UserProfile, repos: RepoStats[], languages: LanguageData[]): Persona => {
    const bio = (user.bio || "").toLowerCase();
    const scores: Record<string, number> = {
        phantom: 0,    // Night activity
        polyglot: 0,   // Language diversity
        architect: 0,  // Structure / High repo count
        evangelist: 0, // Social impact
        sentinel: 0,   // Security / Backend
        sorcerer: 0,   // Frontend / UI
        alchemist: 0,  // AI / Data
        hunter: 0,     // Bug fixing / Maintenance
        ronin: 1       // Default wanderer
    };

    // --- 1. Bio Keyword Analysis ---
    const keywords = {
        sentinel: ["security", "cyber", "backend", "server", "linux", "cloud", "infra"],
        sorcerer: ["frontend", "ui", "ux", "react", "vue", "web", "design", "css"],
        alchemist: ["ai", "ml", "data", "python", "intelligence", "neural", "tensor"],
        hunter: ["fix", "maintaining", "bug", "testing", "qa", "debug"],
        evangelist: ["community", "speaker", "writing", "blog", "developer advocate", "open source"]
    };

    Object.entries(keywords).forEach(([key, words]) => {
        words.forEach(word => {
            if (bio.includes(word)) scores[key] += 5;
        });
    });

    // --- 2. Language Diversity & Dominance ---
    if (languages.length >= 8) scores.polyglot += 15;

    const topLang = languages[0]?.name.toLowerCase();
    if (["javascript", "typescript", "react"].includes(topLang)) scores.sorcerer += 3;
    if (["python", "r", "julia"].includes(topLang)) scores.alchemist += 3;
    if (["rust", "go", "c++", "c", "java"].includes(topLang)) scores.sentinel += 3;

    // --- 3. Activity Patterns ---
    const nightUpdates = repos.slice(0, 20).filter(r => {
        if (!r.updated_at) return false;
        const hour = new Date(r.updated_at).getHours();
        return hour >= 0 && hour < 6;
    }).length;
    if (nightUpdates > 4) scores.phantom += 12;

    // --- 4. Structural & Engagement Proxies ---
    if (user.public_repos > 50) scores.architect += 10;
    if (repos.some(r => r.forks_count > 50)) scores.architect += 5;
    if (user.followers > 500) scores.evangelist += 15;

    // --- 5. Determine Winner ---
    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const personaMap: Record<string, Persona> = {
        phantom: {
            title: "The Midnight Phantom",
            icon: "Moon",
            color: "text-purple-400",
            description: "Coding while the world sleeps. Connectivity is your muse."
        },
        polyglot: {
            title: "Polyglot Sensei",
            icon: "Languages",
            color: "text-yellow-400",
            description: "Master of syntax, speaker of many machine tongues."
        },
        architect: {
            title: "System Architect",
            icon: "DraftingCompass",
            color: "text-cyan-400",
            description: "Building digital skyscrapers with foundational excellence."
        },
        evangelist: {
            title: "Tech Evangelist",
            icon: "Megaphone",
            color: "text-pink-400",
            description: "Your voice echoes through the commit logs of thousands."
        },
        sentinel: {
            title: "Cyber Sentinel",
            icon: "Shield",
            color: "text-emerald-400",
            description: "Guardian of the back-end and master of secure infrastructure."
        },
        sorcerer: {
            title: "UI Sorcerer",
            icon: "Wand2",
            color: "text-sky-400",
            description: "Bending pixels and the DOM to your aesthetic will."
        },
        alchemist: {
            title: "AI Alchemist",
            icon: "FlaskConical",
            color: "text-indigo-400",
            description: "Transmuting raw data into digital gold and intelligence."
        },
        hunter: {
            title: "Ghost Hunter",
            icon: "Ghost",
            color: "text-orange-400",
            description: "Exorcising bugs and refining code into its purest form."
        },
        ronin: {
            title: "Code Ronin",
            icon: "Sword",
            color: "text-gray-200",
            description: "A wandering warrior of code, seeking the perfect commit."
        }
    };

    return personaMap[winner] || personaMap.ronin;
};

export const calculateImpactScore = (user: UserProfile, repos: RepoStats[]): number => {
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

    // Weight engagement: Forks are more valuable as they imply active usage/forking
    const rawImpact = (totalStars * 1) + (totalForks * 3);
    const repoCount = Math.max(user.public_repos, 1);
    const density = rawImpact / repoCount;

    // Richer logarithmic scale (Richter scale style)
    // 0.1 stars/repo -> ~1.0 Mag
    // 100 stars/repo -> ~8.0 Mag
    const mag = Math.log10(density + 1) * 3.5 + 1;

    return Number(Math.min(10, mag).toFixed(1));
};

export const getBadges = (user: UserProfile, repos: RepoStats[]): Badge[] => {
    const badges: Badge[] = [];
    const accountAgeYears = (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24 * 365);

    // 1. Community Presence
    if (user.followers >= 1000) {
        badges.push({ id: "influencer", icon: "Users", label: "Global Influencer", color: "text-pink-500" });
    } else if (user.followers >= 100) {
        badges.push({ id: "community", icon: "UserCheck", label: "Community Leader", color: "text-purple-400" });
    }

    // 2. Open Source Impact
    const maxStars = Math.max(...repos.map(r => r.stargazers_count), 0);
    if (maxStars >= 1000) {
        badges.push({ id: "legend", icon: "Trophy", label: "Lighthouse", color: "text-yellow-500" });
    } else if (maxStars >= 100) {
        badges.push({ id: "starlord", icon: "Star", label: "Star Lord", color: "text-yellow-400" });
    }

    // 3. Wisdom (Account Age)
    if (accountAgeYears >= 10) {
        badges.push({ id: "elder", icon: "Ancient", label: "GitHub Elder", color: "text-emerald-500" });
    } else if (accountAgeYears >= 5) {
        badges.push({ id: "og", icon: "Crown", label: "OG Developer", color: "text-cyan-400" });
    }

    // 4. Productivity
    if (user.public_repos > 100) {
        badges.push({ id: "factory", icon: "Factory", label: "Code Factory", color: "text-orange-400" });
    } else if (user.public_repos > 30) {
        badges.push({ id: "prolific", icon: "Zap", label: "Prolific Builder", color: "text-blue-400" });
    }

    return badges;
};

export const calculateStreak = (repos: RepoStats[]): number => {
    if (repos.length === 0) return 0;

    // A simplified consistency metric based on historical density
    const oldestRepoDate = new Date(repos[repos.length - 1].created_at).getTime();
    const accountAgeDays = (new Date().getTime() - oldestRepoDate) / (1000 * 3600 * 24);

    const density = repos.length / (accountAgeDays / 30); // Repos per month average

    // Weighted simulation: active users get higher "best streaks"
    const baseStreak = Math.floor(density * 4) + 2;
    const luck = Math.floor(Math.random() * 5);

    return Math.min(365, baseStreak + luck);
};
