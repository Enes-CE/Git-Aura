import { Octokit } from "@octokit/rest";

// Octokit instance'ını her seferinde yeniden oluştur ki env variable'lar güncel olsun
const getOctokit = () => {
    return new Octokit({
        auth: process.env.GITHUB_TOKEN, // Optional: for higher rate limits
    });
};

export interface UserProfile {
    name: string;
    login: string;
    avatar_url: string;
    bio: string;
    followers: number;
    following: number;
    public_repos: number;
    location: string;
    company: string;
    created_at: string;
    blog: string;
    twitter_username?: string;
    html_url: string;
}

export interface RepoStats {
    name: string;
    description: string;
    stargazers_count: number;
    language: string;
    forks_count: number;
    html_url: string;
    updated_at: string;
    created_at: string;
    license: { name: string } | null;
    fork: boolean;
    has_wiki?: boolean;
    has_pages?: boolean;
    has_issues?: boolean;
    has_readme?: boolean; // New: Real check for top repos
}

export interface LanguageData {
    name: string;
    value: number; // Bytes or count
    color?: string;
}

export const fetchGitHubProfile = async (username: string) => {
    const octokit = getOctokit();
    
    // Token kontrolü - debug için
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.warn("⚠️ GITHUB_TOKEN not found in environment variables. Using unauthenticated requests (lower rate limit).");
    } else {
        console.log(`✅ GITHUB_TOKEN found (${token.substring(0, 7)}...), using authenticated requests.`);
    }
    
    try {
        const { data: user } = await octokit.users.getByUsername({ username });

        // Fetch repos (up to 100 recent ones to calculate stats)
        const { data: repos } = await octokit.repos.listForUser({
            username,
            sort: "updated",
            per_page: 100,
        });

        // Smart Augmentation: Check README for top 3 repos only to avoid rate limits
        const topRepos = [...repos]
            .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
            .slice(0, 3);

        const enrichedRepos = await Promise.all(repos.map(async (repo) => {
            const isTopRepo = topRepos.some(tr => tr.id === repo.id);
            let has_readme = false;

            if (isTopRepo) {
                try {
                    // Silent check to avoid "Scary" 404 console logs in dev mode
                    const response = await octokit.request('GET /repos/{owner}/{repo}/readme', {
                        owner: username,
                        repo: repo.name,
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    });
                    has_readme = response.status === 200;
                } catch (e) {
                    has_readme = false;
                }
            }

            return {
                ...repo,
                has_readme,
                has_wiki: repo.has_wiki,
                has_pages: repo.has_pages,
                has_issues: repo.has_issues
            } as RepoStats;
        }));

        const languagesMap: Record<string, number> = {};
        enrichedRepos.forEach(repo => {
            if (repo.language) {
                languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
            }
        });

        // Convert to array and sort
        const languages: LanguageData[] = Object.entries(languagesMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 languages

        return {
            user: user as UserProfile,
            repos: enrichedRepos,
            languages,
        };
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error("User not found");
        }
        if (error.status === 403 && error.message?.includes("rate limit")) {
            throw new Error("GitHub API rate limit exceeded. Please add GITHUB_TOKEN to .env.local for higher limits.");
        }
        throw new Error(error.message || "Failed to fetch profile");
    }
};

/**
 * Popüler GitHub kullanıcılarını çek (birden fazla kaynaktan, daha fazla kullanıcı için optimize edilmiş)
 */
export const fetchPopularUsers = async (limit: number = 50): Promise<string[]> => {
    const octokit = getOctokit();
    const uniqueOwners = new Set<string>();
    
    try {
        // Strateji 1: En çok star alan repo'lardan (son 30 gün)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
        
        // Daha fazla sayfa çek (her sayfa 100, maksimum 10 sayfa = 1000 kullanıcı)
        const maxPages = Math.min(10, Math.ceil(limit / 100));
        
        for (let page = 1; page <= maxPages && uniqueOwners.size < limit; page++) {
            const { data: repos1 } = await octokit.rest.search.repos({
                q: `stars:>1000 pushed:>${dateStr}`,
                sort: "stars",
                order: "desc",
                per_page: 100,
                page,
            });

            repos1.items.forEach((repo) => {
                if (repo.owner && repo.owner.login && repo.owner.type === "User") {
                    uniqueOwners.add(repo.owner.login);
                }
            });
        }

        // Strateji 2: Tüm zamanların en popüler repo'ları (farklı star eşikleri)
        if (uniqueOwners.size < limit) {
            const starThresholds = [10000, 5000, 3000, 2000, 1000];
            
            for (const threshold of starThresholds) {
                if (uniqueOwners.size >= limit) break;
                
                for (let page = 1; page <= 3 && uniqueOwners.size < limit; page++) {
                    try {
                        const { data: repos2 } = await octokit.rest.search.repos({
                            q: `stars:>${threshold}`,
                            sort: "stars",
                            order: "desc",
                            per_page: 100,
                            page,
                        });

                        repos2.items.forEach((repo) => {
                            if (repo.owner && repo.owner.login && repo.owner.type === "User") {
                                uniqueOwners.add(repo.owner.login);
                            }
                        });
                    } catch (error) {
                        console.warn(`Error fetching repos with ${threshold}+ stars:`, error);
                        break; // Rate limit veya başka bir hata varsa dur
                    }
                }
            }
        }

        // Strateji 3: Farklı dillerde popüler repo'lardan owner'ları çek
        if (uniqueOwners.size < limit) {
            const languages = ['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin'];
            
            for (const lang of languages) {
                if (uniqueOwners.size >= limit) break;
                
                for (let page = 1; page <= 2 && uniqueOwners.size < limit; page++) {
                    try {
                        const { data: repos3 } = await octokit.rest.search.repos({
                            q: `language:${lang} stars:>1500`,
                            sort: "stars",
                            order: "desc",
                            per_page: 100,
                            page,
                        });

                        repos3.items.forEach((repo) => {
                            if (repo.owner && repo.owner.login && repo.owner.type === "User") {
                                uniqueOwners.add(repo.owner.login);
                            }
                        });
                    } catch (error) {
                        console.warn(`Error fetching ${lang} repos:`, error);
                        break;
                    }
                }
            }
        }

        return Array.from(uniqueOwners).slice(0, limit);
    } catch (error: any) {
        console.error("Error fetching popular users:", error);
        throw new Error(error.message || "Failed to fetch popular users");
    }
};
