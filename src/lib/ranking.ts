import { UserProfile, RepoStats } from "./github";

export type RankTier = "Platinum" | "Gold" | "Silver" | "Bronze" | "Iron";

export interface RankResult {
    percentile: number; // e.g. 1.5 for "Top 1.5%"
    tier: RankTier;
    label: string;
    description: string; // Comparative insight
}

export const getGlobalRank = (user: UserProfile, repos: RepoStats[]): RankResult => {
    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);
    const followers = user.followers;

    // Weights
    const score = (totalStars * 2) + (totalForks * 1.5) + (followers * 1) + (user.public_repos * 0.5);

    // Simulated Global Distribution Thresholds (based on general GitHub statistics approximations)
    // Top 1%: ~500+ score
    // Top 5%: ~100+ score
    // Top 10%: ~50+ score
    // Top 25%: ~20+ score

    let percentile: number;
    let tier: RankTier;
    let label: string;
    let description: string;

    if (score > 1000) {
        percentile = 0.1;
        tier = "Platinum";
        label = "Elite 0.1%";
        description = "You're shaping the future of open source. A true legend.";
    } else if (score > 500) {
        percentile = 1.5;
        tier = "Gold";
        label = "Top 1.5%";
        description = `Your impact score is higher than 98.5% of global developers.`;
    } else if (score > 100) {
        percentile = 5;
        tier = "Silver";
        label = "Top 5%";
        description = `You produce more value than 95% of active GitHub users.`;
    } else if (score > 50) {
        percentile = 12;
        tier = "Bronze";
        label = "Top 12%";
        description = "Your productivity is well above the global average.";
    } else {
        percentile = 35;
        tier = "Iron";
        label = "Top 35%";
        description = "You are on your way to greatness. Consistency is key.";
    }

    // Refine percentile visually for specific edge cases
    if (percentile === 1.5 && score > 800) percentile = 0.5;

    return { percentile, tier, label, description };
};
