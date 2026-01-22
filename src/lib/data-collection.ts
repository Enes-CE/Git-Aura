import { Octokit } from "@octokit/rest";

const getOctokit = () => {
    return new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
};

/**
 * Farklı seviyelerden GitHub kullanıcılarını çek
 * - Elite: 10000+ stars
 * - High: 1000-10000 stars
 * - Medium: 100-1000 stars
 * - Low: 10-100 stars
 * - Beginner: 1-10 stars
 */
export interface UserCollectionStrategy {
    level: "elite" | "high" | "medium" | "low" | "beginner";
    starRange: { min: number; max?: number };
    limit: number;
    description: string;
}

export const COLLECTION_STRATEGIES: UserCollectionStrategy[] = [
    {
        level: "elite",
        starRange: { min: 10000 },
        limit: 500,
        description: "Elite developers (10k+ stars)",
    },
    {
        level: "high",
        starRange: { min: 1000, max: 10000 },
        limit: 2000,
        description: "High-level developers (1k-10k stars)",
    },
    {
        level: "medium",
        starRange: { min: 100, max: 1000 },
        limit: 3000,
        description: "Medium-level developers (100-1k stars)",
    },
    {
        level: "low",
        starRange: { min: 10, max: 100 },
        limit: 2000,
        description: "Low-level developers (10-100 stars)",
    },
    {
        level: "beginner",
        starRange: { min: 1, max: 10 },
        limit: 2500,
        description: "Beginner developers (1-10 stars)",
    },
];

/**
 * Belirli bir seviyeden kullanıcıları çek
 */
export async function fetchUsersByLevel(
    strategy: UserCollectionStrategy
): Promise<string[]> {
    const octokit = getOctokit();
    const uniqueOwners = new Set<string>();
    
    try {
        const { min, max } = strategy.starRange;
        let query = `stars:>=${min}`;
        if (max) {
            query += ` stars:<=${max}`;
        }
        
        // Farklı dillerde arama yaparak daha geniş bir örneklem al
        const languages = [
            "JavaScript", "Python", "TypeScript", "Java", "Go", "Rust",
            "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Dart",
            "Scala", "Clojure", "Elixir", "Haskell", "OCaml"
        ];
        
        const maxPages = Math.ceil(strategy.limit / (languages.length * 10));
        
        for (const lang of languages) {
            if (uniqueOwners.size >= strategy.limit) break;
            
            for (let page = 1; page <= maxPages && uniqueOwners.size < strategy.limit; page++) {
                try {
                    const searchQuery = `${query} language:${lang}`;
                    const { data } = await octokit.rest.search.repos({
                        q: searchQuery,
                        sort: "stars",
                        order: "desc",
                        per_page: 100,
                        page,
                    });
                    
                    data.items.forEach((repo) => {
                        if (repo.owner && repo.owner.login && repo.owner.type === "User") {
                            uniqueOwners.add(repo.owner.login);
                        }
                    });
                    
                    // Rate limit koruması
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error: any) {
                    if (error.status === 403) {
                        console.warn(`Rate limit reached for ${lang}, waiting...`);
                        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 dakika bekle
                    } else {
                        console.warn(`Error fetching ${lang} repos:`, error.message);
                    }
                    break;
                }
            }
        }
        
        // Eğer yeterli kullanıcı bulunamadıysa, dil filtresi olmadan dene
        if (uniqueOwners.size < strategy.limit) {
            for (let page = 1; page <= 10 && uniqueOwners.size < strategy.limit; page++) {
                try {
                    const { data } = await octokit.rest.search.repos({
                        q: query,
                        sort: "stars",
                        order: "desc",
                        per_page: 100,
                        page,
                    });
                    
                    data.items.forEach((repo) => {
                        if (repo.owner && repo.owner.login && repo.owner.type === "User") {
                            uniqueOwners.add(repo.owner.login);
                        }
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error: any) {
                    console.warn(`Error fetching repos:`, error.message);
                    break;
                }
            }
        }
        
        return Array.from(uniqueOwners).slice(0, strategy.limit);
    } catch (error: any) {
        console.error(`Error fetching users for level ${strategy.level}:`, error);
        throw error;
    }
}

/**
 * Tüm seviyelerden kullanıcıları çek (kapsamlı veri toplama)
 */
export async function fetchComprehensiveUsers(): Promise<{
    level: string;
    users: string[];
    count: number;
}[]> {
    const results = [];
    
    for (const strategy of COLLECTION_STRATEGIES) {
        console.log(`📊 Collecting ${strategy.description}...`);
        try {
            const users = await fetchUsersByLevel(strategy);
            results.push({
                level: strategy.level,
                users,
                count: users.length,
            });
            console.log(`✅ Collected ${users.length} ${strategy.level} users`);
        } catch (error: any) {
            console.error(`❌ Failed to collect ${strategy.level} users:`, error.message);
            results.push({
                level: strategy.level,
                users: [],
                count: 0,
            });
        }
    }
    
    return results;
}

