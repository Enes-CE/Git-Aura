import { UserProfile, RepoStats, LanguageData } from "./github";
import {
    ModuleAnalysis,
    analyzeTimeMachine,
    analyzeArcheology,
    calculateDuelStats
} from "./modules";

export interface CommitHabit {
    label: string;
    icon: string;
    color: string;
    hourDistribution: number[]; // 24 saatlik dağılım
    peakHour: number;
}

export interface TechEvolution {
    year: number;
    languages: string[];
    dominantLanguage?: string;
}

export interface RiskAnalysis {
    riskiestDay: string; // e.g., "Tuesday"
    riskiestHour: number;
    bugFixPercentage: number;
    insight: string;
}

export interface QualityScore {
    score: number; // 0-100
    breakdown: {
        hasDescription: boolean;
        hasLicense: boolean;
        hasReadme: boolean;
        hasTopics: boolean;
    };
    suggestion: string;
}

export interface AnalysisResult {
    commitHabit: CommitHabit;
    techEvolution: TechEvolution[];
    consistencyScore: number;
    impactIndex: number;
    globalPercentile: number;
    comparativeText: string;
    isGodMode: boolean;
    riskAnalysis: RiskAnalysis;
    qualityScore: QualityScore;
    modules: ModuleAnalysis;
}

export const analyzeCommitHabits = (repos: RepoStats[]): CommitHabit => {
    // Simüle edilmiş commit saatleri (Gerçek GitHub Events API'si gerektirir)
    // Şimdilik repo update saatlerinden yaklaşık bir dağılım oluşturuyoruz
    const hourDistribution = new Array(24).fill(0);

    repos.forEach(repo => {
        if (repo.updated_at) {
            const hour = new Date(repo.updated_at).getHours();
            hourDistribution[hour]++;
        }
    });

    // En yoğun saati bul
    const peakHour = hourDistribution.indexOf(Math.max(...hourDistribution));

    // Etiket belirle
    let label = "Code Ronin";
    let icon = "Clock";
    let color = "text-gray-400";

    if (peakHour >= 0 && peakHour < 6) {
        label = "Midnight Phantom";
        icon = "Moon";
        color = "text-purple-400";
    } else if (peakHour >= 9 && peakHour < 17) {
        label = "Corporate Warrior";
        icon = "Briefcase";
        color = "text-blue-400";
    } else if (peakHour >= 17 && peakHour < 22) {
        label = "Evening Craftsman";
        icon = "Sunset";
        color = "text-orange-400";
    }

    return { label, icon, color, hourDistribution, peakHour };
};

export const analyzeTechEvolution = (repos: RepoStats[]): TechEvolution[] => {
    const evolutionMap = new Map<number, Map<string, number>>();

    repos.forEach(repo => {
        const year = new Date(repo.created_at).getFullYear();
        if (repo.language) {
            if (!evolutionMap.has(year)) {
                evolutionMap.set(year, new Map());
            }
            const yearMap = evolutionMap.get(year)!;
            yearMap.set(repo.language, (yearMap.get(repo.language) || 0) + 1);
        }
    });

    // Son 5 yılı al ve dominant language belirle
    const currentYear = new Date().getFullYear();
    const evolution: TechEvolution[] = [];

    for (let year = currentYear - 4; year <= currentYear; year++) {
        const yearMap = evolutionMap.get(year);
        if (yearMap && yearMap.size > 0) {
            const languages = Array.from(yearMap.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([lang]) => lang);

            evolution.push({
                year,
                languages: languages.slice(0, 3),
                dominantLanguage: languages[0]
            });
        }
    }

    return evolution;
};

export const calculateConsistencyScore = (repos: RepoStats[]): number => {
    // Son 30 günlük aktiviteyi simüle et
    // Gerçek implementasyonda GitHub Events API kullanılmalı

    if (repos.length < 5) return 30; // Az repo = düşük skor

    // Repo update tarihlerini al
    const dates = repos
        .map(r => new Date(r.updated_at).getTime())
        .sort((a, b) => b - a)
        .slice(0, 30);

    if (dates.length < 2) return 40;

    // Günler arası farkları hesapla
    const intervals: number[] = [];
    for (let i = 0; i < dates.length - 1; i++) {
        if (!isNaN(dates[i]) && !isNaN(dates[i + 1])) {
            const dayDiff = Math.abs(dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
            intervals.push(dayDiff);
        }
    }

    if (intervals.length === 0) return 50;

    // Standart sapma hesapla
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    let stdDev = Math.sqrt(variance);

    if (isNaN(stdDev)) stdDev = 0;

    // Düşük standart sapma = yüksek tutarlılık
    // Normalize et (0-100)
    const score = Math.max(0, Math.min(100, 100 - (stdDev * 2)));

    return Math.round(score);
};

export const calculateImpactIndex = (user: UserProfile, repos: RepoStats[]): number => {
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
    const followers = user.followers || 0;
    const repoCount = user.public_repos || 0;

    // Aura is the "Total Digital Mass"
    const index = (totalStars * 3) + (totalForks * 6) + (followers * 12) + (repoCount * 5);
    return isNaN(index) ? 0 : index;
};

export const getGlobalPercentile = (impactIndex: number, totalStars: number, repoCount: number): number => {
    // Statik eşikler (GitHub global istatistiklerine dayalı tahminler)
    if (impactIndex > 10000 || totalStars > 500) return 0.1; // Elite 0.1%
    if (impactIndex > 5000 || totalStars > 100) return 1.5; // Top 1.5%
    if (impactIndex > 1000 || totalStars > 50) return 5; // Top 5%
    if (impactIndex > 500 || repoCount > 50) return 12; // Top 12%
    if (impactIndex > 100) return 25; // Top 25%

    return 50; // Ortalama
};

export const generateComparativeText = (percentile: number): string => {
    if (percentile <= 0.1) {
        return "You are shaping the future of open source. A true legend among millions.";
    } else if (percentile <= 1.5) {
        return `Your impact score is higher than ${(100 - percentile).toFixed(1)}% of all GitHub developers.`;
    } else if (percentile <= 5) {
        return `You produce more value than ${(100 - percentile).toFixed(0)}% of active GitHub users.`;
    } else if (percentile <= 12) {
        return "Your productivity is well above the global average. Keep pushing!";
    } else if (percentile <= 25) {
        return "You're in the top quarter of developers. Solid foundation!";
    }

    return "You are on your way to greatness. Consistency is key.";
};

export const checkGodMode = (user: UserProfile, impactIndex: number): boolean => {
    // Easter Egg: Ikonik kullanıcılar veya ultra-yüksek skorlar
    const iconicUsers = ['torvalds', 'gaearon', 'tj', 'sindresorhus', 'yyx990803', 'addyosmani'];
    const isIconic = iconicUsers.includes(user.login.toLowerCase());
    const isUltraHighScore = impactIndex > 15000;

    return isIconic || isUltraHighScore;
};

export const analyzeRiskPatterns = (repos: RepoStats[]): RiskAnalysis => {
    // Simulated risk analysis based on repo names and update patterns
    // In real implementation, would analyze commit messages via GitHub API

    const bugKeywords = ['fix', 'bug', 'error', 'patch', 'hotfix', 'issue'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Analyze repo names for bug-related keywords
    const bugRelatedRepos = repos.filter(repo =>
        bugKeywords.some(keyword => repo.name.toLowerCase().includes(keyword))
    );

    // Analyze update times
    const dayDistribution = new Array(7).fill(0);
    const hourDistribution = new Array(24).fill(0);

    repos.forEach(repo => {
        const date = new Date(repo.updated_at);
        dayDistribution[date.getDay()]++;
        hourDistribution[date.getHours()]++;
    });

    const riskiestDayIndex = dayDistribution.indexOf(Math.max(...dayDistribution));
    const riskiestHour = hourDistribution.indexOf(Math.max(...hourDistribution));
    const bugFixPercentage = Math.min(100, Math.round((bugRelatedRepos.length / repos.length) * 100 * 3)); // Amplified for demo

    let insight = `Your peak activity on ${dayNames[riskiestDayIndex]}s at ${riskiestHour}:00 suggests `;

    if (riskiestHour >= 22 || riskiestHour < 6) {
        insight += "late-night coding sessions. Consider more rest to reduce bugs.";
    } else if (riskiestHour >= 9 && riskiestHour < 17) {
        insight += "focused work hours. Your bug rate is likely lower during this time.";
    } else {
        insight += "evening productivity. Quality tends to be high during these hours.";
    }

    return {
        riskiestDay: dayNames[riskiestDayIndex],
        riskiestHour,
        bugFixPercentage,
        insight
    };
};

export const calculateQualityScore = (repos: RepoStats[], consistencyScore: number, impactIndex: number): QualityScore => {
    if (repos.length === 0) return { score: 0, breakdown: { hasDescription: false, hasLicense: false, hasReadme: false, hasTopics: false }, suggestion: "Start creating your first repository!" };

    // 1. Documentation Scrutiny (Sample top 15)
    const sampleRepos = repos
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 15);

    const reposWithDesc = sampleRepos.filter(r => r.description && r.description.trim().length > 3).length;
    const reposWithLicense = sampleRepos.filter(r => r.license !== null).length;
    const reposWithReadme = sampleRepos.filter(r => r.has_readme || (r.description && r.description.length > 15)).length;
    const originalRepos = sampleRepos.filter(r => !r.fork).length;

    // 2. Compute Proportional Base (Max 60 pts)
    const descScore = (reposWithDesc / sampleRepos.length) * 15;
    const licenseScore = (reposWithLicense / sampleRepos.length) * 10;
    const readmeScore = (reposWithReadme / sampleRepos.length) * 20;
    const originalScore = (originalRepos / sampleRepos.length) * 15;

    // 3. Authority & Consistency Boosts (Max 40 pts)
    // Community Validation: High Aura/Impact implies quality standards are met by popularity
    const authorityBoost = Math.min(25, (impactIndex / 2000) * 5); // Decent boost for high impact

    // Discipline Boost: Consistency is a proxy for code health
    const consistencyBoost = (consistencyScore / 100) * 15;

    const totalScore = Math.min(100, Math.round(descScore + licenseScore + readmeScore + originalScore + authorityBoost + consistencyBoost + 10));

    const breakdown = {
        hasDescription: reposWithDesc > sampleRepos.length * 0.3,
        hasLicense: reposWithLicense > sampleRepos.length * 0.2,
        hasReadme: reposWithReadme > sampleRepos.length * 0.4,
        hasTopics: sampleRepos.some(r => (r.stargazers_count || 0) > 10 || r.has_wiki || r.has_pages)
    };

    let suggestion = "";
    if (totalScore > 85) {
        suggestion = "Master level repository management. Your projects serve as a benchmark for quality.";
    } else if (totalScore > 65) {
        suggestion = "Professional grade hygiene. Your documentation is clear and your repositories are well-maintained.";
    } else if (!breakdown.hasReadme) {
        suggestion = "Quick fix: Adding READMEs to your most popular repos will drastically increase your quality score.";
    } else {
        suggestion = "Consider standardizing your repository structure with Licenses and detailed descriptions.";
    }

    return { score: totalScore, breakdown, suggestion };
};

export const performFullAnalysis = (user: UserProfile, repos: RepoStats[], languages: LanguageData[]): AnalysisResult => {
    const commitHabit = analyzeCommitHabits(repos);
    const techEvolution = analyzeTechEvolution(repos);
    const consistencyScore = calculateConsistencyScore(repos);
    const impactIndex = calculateImpactIndex(user, repos);
    const riskAnalysis = analyzeRiskPatterns(repos);
    const qualityScore = calculateQualityScore(repos, consistencyScore, impactIndex);

    // New Modules Analysis
    const modules: ModuleAnalysis = {
        timeMachine: analyzeTimeMachine(user, repos),
        archeology: analyzeArcheology(user, repos, languages),
        duelStats: calculateDuelStats(user, repos, languages, consistencyScore)
    };

    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const globalPercentile = getGlobalPercentile(impactIndex, totalStars, user.public_repos);
    const comparativeText = generateComparativeText(globalPercentile);
    const isGodMode = checkGodMode(user, impactIndex);

    return {
        commitHabit,
        techEvolution,
        consistencyScore,
        impactIndex,
        globalPercentile,
        comparativeText,
        isGodMode,
        riskAnalysis,
        qualityScore,
        modules
    };
};
