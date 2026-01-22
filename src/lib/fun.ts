import { UserProfile, RepoStats, LanguageData } from "./github";

export interface TechZodiac {
    sign: string;
    element: string;
    description: string;
    color: string;
    icon: string;
}

export interface IconicDeveloper {
    name: string;
    avatar: string;
    dominantLanguage: string;
    peakHour: number;
    avgCommitsPerDay: number;
    specialty: string;
}

export const iconicDevelopers: IconicDeveloper[] = [
    {
        name: "Linus Torvalds",
        avatar: "🐧",
        dominantLanguage: "C",
        peakHour: 10,
        avgCommitsPerDay: 15,
        specialty: "System Architecture"
    },
    {
        name: "Guido van Rossum",
        avatar: "🐍",
        dominantLanguage: "Python",
        peakHour: 14,
        avgCommitsPerDay: 8,
        specialty: "Language Design"
    },
    {
        name: "Brendan Eich",
        avatar: "⚡",
        dominantLanguage: "JavaScript",
        peakHour: 22,
        avgCommitsPerDay: 12,
        specialty: "Web Innovation"
    },
    {
        name: "Anders Hejlsberg",
        avatar: "💎",
        dominantLanguage: "TypeScript",
        peakHour: 9,
        avgCommitsPerDay: 10,
        specialty: "Type Systems"
    },
    {
        name: "Yukihiro Matsumoto",
        avatar: "💎",
        dominantLanguage: "Ruby",
        peakHour: 16,
        avgCommitsPerDay: 7,
        specialty: "Developer Happiness"
    }
];

export const getTechZodiac = (user: UserProfile, languages: LanguageData[]): TechZodiac => {
    const accountAge = new Date().getFullYear() - new Date(user.created_at).getFullYear();
    const dominantLang = languages[0]?.name || "Code";

    // Zodiac logic based on account age and language
    const zodiacs: TechZodiac[] = [
        {
            sign: "The Architect",
            element: "System",
            description: "You build foundations that last. Your code is the bedrock others build upon.",
            color: "text-blue-400",
            icon: "Building2"
        },
        {
            sign: "The Alchemist",
            element: "Transform",
            description: "You turn complex problems into elegant solutions. Magic flows through your commits.",
            color: "text-purple-400",
            icon: "Sparkles"
        },
        {
            sign: "The Phoenix",
            element: "Rebirth",
            description: "You rise from legacy code, refactoring chaos into beauty.",
            color: "text-orange-400",
            icon: "Flame"
        },
        {
            sign: "The Oracle",
            element: "Wisdom",
            description: "Your experience guides others. You see patterns before they emerge.",
            color: "text-cyan-400",
            icon: "Eye"
        },
        {
            sign: "The Nomad",
            element: "Explore",
            description: "You traverse languages and frameworks fearlessly. Adaptation is your strength.",
            color: "text-green-400",
            icon: "Compass"
        }
    ];

    // Selection logic
    if (accountAge > 10) return zodiacs[3]; // Oracle
    if (languages.length > 5) return zodiacs[4]; // Nomad
    if (dominantLang.includes("Script") || dominantLang === "JavaScript") return zodiacs[1]; // Alchemist
    if (dominantLang === "C" || dominantLang === "Rust" || dominantLang === "Go") return zodiacs[0]; // Architect

    return zodiacs[2]; // Phoenix (default)
};

export const findCodingSoulmate = (
    user: UserProfile,
    repos: RepoStats[],
    languages: LanguageData[],
    peakHour: number
): { developer: IconicDeveloper; matchScore: number; reason: string } => {
    const dominantLang = languages[0]?.name || "";
    const avgActivity = repos.length / Math.max(1, new Date().getFullYear() - new Date(user.created_at).getFullYear());

    let bestMatch = iconicDevelopers[0];
    let highestScore = 0;
    let matchReason = "";

    iconicDevelopers.forEach(dev => {
        let score = 0;
        let reasons: string[] = [];

        // Language match (40 points)
        if (dominantLang.toLowerCase().includes(dev.dominantLanguage.toLowerCase())) {
            score += 40;
            reasons.push(`shared love for ${dev.dominantLanguage}`);
        }

        // Peak hour proximity (30 points)
        const hourDiff = Math.abs(peakHour - dev.peakHour);
        if (hourDiff <= 3) {
            score += 30 - (hourDiff * 5);
            reasons.push("similar work schedule");
        }

        // Activity level (30 points)
        const activityDiff = Math.abs(avgActivity - dev.avgCommitsPerDay);
        if (activityDiff <= 5) {
            score += 30 - (activityDiff * 3);
            reasons.push("matching productivity rhythm");
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = dev;
            matchReason = reasons.join(", ");
        }
    });

    return {
        developer: bestMatch,
        matchScore: Math.min(100, highestScore),
        reason: matchReason || "complementary coding philosophy"
    };
};

export const generateAuraSoundwave = (repos: RepoStats[]): number[] => {
    // Generate 24 data points representing hourly commit intensity
    const hourlyIntensity = new Array(24).fill(0);

    repos.forEach(repo => {
        const hour = new Date(repo.updated_at).getHours();
        hourlyIntensity[hour]++;
    });

    // Normalize to 0-100 range
    const max = Math.max(...hourlyIntensity, 1);
    return hourlyIntensity.map(val => (val / max) * 100);
};
