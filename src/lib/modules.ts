import { UserProfile, RepoStats, LanguageData } from "./github";

// 1. Time Machine Types
export interface Milestone {
    id: string;
    year: number;
    title: string;
    description: string;
    icon: string;
    type: "birth" | "colossus" | "peak" | "mastery";
}

// 2. Code Archeology Types
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    rarityScore: number; // e.g. 0.01 for top 1%
    category: "discovery" | "mastery" | "social" | "ancient";
    unlocked: boolean;
    progressToNext?: number; // 0-100 percentage to next level
}

// 3. The Duel Types
export interface DuelStats {
    attack: number;    // From commit frequency
    defense: number;   // From account age
    magic: number;     // From language diversity
    speed: number;     // From consistency
    specialMove: string;
}

export interface ModuleAnalysis {
    timeMachine: Milestone[];
    archeology: Achievement[];
    duelStats: DuelStats;
}

// --- LOGIC HELPERS ---

export const analyzeTimeMachine = (user: UserProfile, repos: RepoStats[]): Milestone[] => {
    const milestones: Milestone[] = [];
    const sortedRepos = [...repos].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // The Birth
    if (sortedRepos.length > 0) {
        milestones.push({
            id: "birth",
            year: new Date(sortedRepos[0].created_at).getFullYear(),
            title: "The Genesis",
            description: `Remember '${sortedRepos[0].name}'? That was your first spark in the GitHub universe. Most people were watching Netflix, you were creating.`,
            icon: "Egg",
            type: "birth"
        });
    }

    // The Colossus (Biggest repo by stars or size)
    const colossus = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
    if (colossus && colossus.stargazers_count > 0) {
        milestones.push({
            id: "colossus",
            year: new Date(colossus.created_at).getFullYear(),
            title: "The Great Monument",
            description: `'${colossus.name}' became your legacy. ${colossus.stargazers_count} souls recognized your craft. It remains a beacon of your skill.`,
            icon: "Landmark",
            type: "colossus"
        });
    }

    // The Awakening (First Star received)
    const firstStarRepo = sortedRepos.find(r => r.stargazers_count > 0);
    if (firstStarRepo && firstStarRepo.name !== colossus?.name) {
        milestones.push({
            id: "awakening",
            year: new Date(firstStarRepo.created_at).getFullYear(),
            title: "The Awakening",
            description: `Someone out there starred '${firstStarRepo.name}'. The moment you realized your code wasn't just for you, but for the world.`,
            icon: "Zap",
            type: "mastery"
        });
    }

    // Mastery (Dominant Year)
    const yearCounts: Record<number, number> = {};
    const yearLanguages: Record<number, Record<string, number>> = {};

    repos.forEach(r => {
        const year = new Date(r.created_at).getFullYear();
        yearCounts[year] = (yearCounts[year] || 0) + 1;

        if (r.language) {
            if (!yearLanguages[year]) yearLanguages[year] = {};
            yearLanguages[year][r.language] = (yearLanguages[year][r.language] || 0) + 1;
        }
    });

    // Tech Shifts Detection
    const sortedYears = Object.keys(yearLanguages).map(Number).sort((a, b) => a - b);
    let lastDominantLang = "";
    const seenSpecialties = new Set<string>();

    sortedYears.forEach(year => {
        const langs = yearLanguages[year];
        const dominantLang = Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Add ONLY if it's a NEW specialty the user hasn't mastered before
        if (dominantLang && dominantLang !== lastDominantLang && !seenSpecialties.has(dominantLang)) {
            milestones.push({
                id: `shift-${year}`,
                year,
                title: `${dominantLang} Specialist`,
                description: `A shift in your tech stack! You started mastering ${dominantLang} this year, expanding your digital vocabulary.`,
                icon: "Code2",
                type: "mastery"
            });
            lastDominantLang = dominantLang;
            seenSpecialties.add(dominantLang);
        }
    });

    const peakYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakYear) {
        milestones.push({
            id: "peak",
            year: parseInt(peakYear[0]),
            title: "Golden Era",
            description: `In ${peakYear[0]}, you were a coding machine. ${peakYear[1]} projects launched. Your keyboard must have been smoking!`,
            icon: "Zap",
            type: "peak"
        });
    }

    // STRICT FILTER: One unique milestone per year, based on priority
    // Priority: 0 (Birth) > 1 (Monument) > 2 (Peak) > 3 (Shift)
    const priorityMap: Record<string, number> = { birth: 0, colossus: 1, peak: 2, mastery: 3 };
    const uniqueYearMilestones: Record<number, Milestone> = {};

    milestones.forEach(m => {
        const existing = uniqueYearMilestones[m.year];
        if (!existing || priorityMap[m.type] < priorityMap[existing.type]) {
            uniqueYearMilestones[m.year] = m;
        }
    });

    return Object.values(uniqueYearMilestones).sort((a, b) => a.year - b.year);
};

export const analyzeArcheology = (user: UserProfile, repos: RepoStats[], languages: LanguageData[]): Achievement[] => {
    const achievements: Achievement[] = [];
    const githubAge = new Date().getFullYear() - new Date(user.created_at).getFullYear();

    // 1. Ancient Architect
    achievements.push({
        id: "ancient",
        title: "Ancient Architect",
        description: `Account active for ${githubAge} years. You've witnessed the evolution of git.`,
        icon: "Crown",
        rarity: githubAge > 8 ? "legendary" : githubAge > 3 ? "rare" : "common",
        rarityScore: githubAge > 8 ? 0.05 : 0.15,
        category: "ancient",
        unlocked: githubAge >= 2,
        progressToNext: Math.min(100, (githubAge / 10) * 100)
    });

    // 2. Starlord
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    achievements.push({
        id: "starlord",
        title: "Starlord",
        description: "Amassed recognition from the global developer community.",
        icon: "Star",
        rarity: totalStars > 500 ? "legendary" : totalStars > 100 ? "epic" : "rare",
        rarityScore: totalStars > 100 ? 0.08 : 0.25,
        category: "social",
        unlocked: totalStars >= 10,
        progressToNext: Math.min(100, (totalStars / 1000) * 100)
    });

    // 3. Artifact Collection (Rare Languages)
    const rareLangs = ["COBOL", "Fortran", "Lisp", "Haskell", "Assembly", "Prolog", "Delphi"];
    const foundArtifacts = languages.filter(l => rareLangs.includes(l.name));

    achievements.push({
        id: "artifact_collector",
        title: "Artifact Hunter",
        description: foundArtifacts.length > 0
            ? `Found rare artifacts: ${foundArtifacts.map(l => l.name).join(", ")}`
            : "No rare linguistic artifacts found in this sector yet.",
        icon: "Search",
        rarity: foundArtifacts.length > 0 ? "epic" : "common",
        rarityScore: 0.12,
        category: "discovery",
        unlocked: foundArtifacts.length > 0,
        progressToNext: (foundArtifacts.length / 3) * 100
    });

    // 4. Code Firefighter
    const bugKeywords = ['fix', 'bug', 'patch', 'hotfix', 'issue'];
    const quickFixes = repos.filter(r => bugKeywords.some(k => r.name.toLowerCase().includes(k))).length;
    achievements.push({
        id: "firefighter",
        title: "Code Firefighter",
        description: "Expert at neutralizing critical bugs under pressure.",
        icon: "Flame",
        rarity: "rare",
        rarityScore: 0.18,
        category: "mastery",
        unlocked: quickFixes >= 2,
        progressToNext: Math.min(100, (quickFixes / 10) * 100)
    });

    // 5. Fork Master
    const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
    achievements.push({
        id: "forkmaster",
        title: "Fork Master",
        description: "Your architecture is a blueprint for others to follow.",
        icon: "Shield",
        rarity: "legendary",
        rarityScore: 0.03,
        category: "social",
        unlocked: totalForks >= 15,
        progressToNext: Math.min(100, (totalForks / 50) * 100)
    });

    // 6. Midnight Phantom (Night Owl)
    const nightUpdates = repos.filter(r => {
        const hour = new Date(r.updated_at).getHours();
        return hour >= 0 && hour <= 5;
    }).length;
    achievements.push({
        id: "night_owl",
        title: "Midnight Phantom",
        description: "Your best work happens when the world is asleep.",
        icon: "Zap",
        rarity: "rare",
        rarityScore: 0.15,
        category: "mastery",
        unlocked: nightUpdates >= 5,
        progressToNext: Math.min(100, (nightUpdates / 20) * 100)
    });

    // 7. Global Influencer
    const followers = user.followers || 0;
    achievements.push({
        id: "influencer",
        title: "Global Influencer",
        description: "A leader whose digital footsteps are followed by many.",
        icon: "Crown",
        rarity: followers > 100 ? "legendary" : "epic",
        rarityScore: 0.05,
        category: "social",
        unlocked: followers >= 20,
        progressToNext: Math.min(100, (followers / 500) * 100)
    });

    // 8. Polyglot Specialist
    const langCount = languages.length;
    achievements.push({
        id: "polyglot",
        title: "Polyglot Wizard",
        description: "A master of many tongues in the digital realm.",
        icon: "Award",
        rarity: langCount >= 6 ? "epic" : "rare",
        rarityScore: 0.1,
        category: "mastery",
        unlocked: langCount >= 4,
        progressToNext: Math.min(100, (langCount / 10) * 100)
    });

    return achievements;
};

export const calculateDuelStats = (user: UserProfile, repos: RepoStats[], languages: LanguageData[], consistency: number): DuelStats => {
    const attack = Math.min(100, Math.round((repos.length / 50) * 100));
    const githubAge = new Date().getFullYear() - new Date(user.created_at).getFullYear();
    const defense = Math.min(100, Math.round((githubAge / 10) * 100));
    const magic = Math.min(100, Math.round((languages.length / 12) * 100));
    const speed = consistency;

    let specialMove = "Kernel Panic";
    if (magic > attack) specialMove = "Polymorphic Strike";
    if (defense > 80) specialMove = "Unbreakable Firewall";
    if (attack > 90) specialMove = "Mainframe Overclock";

    return { attack, defense, magic, speed, specialMove };
};
