import { supabase } from "./supabase";
import { UserProfile, RepoStats, LanguageData } from "./github";
import { performFullAnalysis } from "./analyzer";
import { getGlobalRank } from "./ranking";

export interface LeaderboardEntry {
    id: string;
    user_id: string;
    github_username: string;
    github_avatar_url: string;
    impact_index: number;
    total_stars: number;
    total_forks: number;
    followers: number;
    public_repos: number;
    dominant_language: string | null;
    last_analyzed_at: string;
    rank?: number; // Frontend'de hesaplanacak
    tier?: string; // Frontend'de hesaplanacak
}

/**
 * Kullanıcının analiz sonuçlarını leaderboard tablosuna kaydet/güncelle
 */
export async function upsertLeaderboardEntry(
    userId: string | null,
    user: UserProfile,
    repos: RepoStats[],
    languages: LanguageData[]
): Promise<void> {
    const analysis = performFullAnalysis(user, repos, languages);
    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0);
    
    // Dominant language bul
    const dominantLanguage = languages.length > 0 
        ? languages.sort((a, b) => b.value - a.value)[0].name 
        : null;

    const { error } = await supabase
        .from("user_leaderboard")
        .upsert(
            {
                user_id: userId,
                github_username: user.login,
                github_avatar_url: user.avatar_url,
                impact_index: Math.round(analysis.impactIndex),
                total_stars: totalStars,
                total_forks: totalForks,
                followers: user.followers,
                public_repos: user.public_repos,
                dominant_language: dominantLanguage,
                last_analyzed_at: new Date().toISOString(),
            },
            {
                onConflict: "github_username", // github_username unique, user_id nullable olabilir
                ignoreDuplicates: false,
            }
        );

    if (error) {
        console.error("Error upserting leaderboard entry:", error);
        throw error;
    }
}

/**
 * Popüler GitHub kullanıcılarını analiz edip leaderboard'a ekle
 */
export async function populatePopularUsers(limit: number = 50): Promise<{ added: number; errors: number }> {
    const { fetchPopularUsers } = await import("./github");
    const { fetchGitHubProfile } = await import("./github");
    
    try {
        const usernames = await fetchPopularUsers(limit);
        let added = 0;
        let errors = 0;

        // Her kullanıcıyı analiz et ve ekle (rate limit için batch processing)
        for (const username of usernames) {
            try {
                const profileData = await fetchGitHubProfile(username);
                await upsertLeaderboardEntry(
                    null, // Popüler kullanıcılar için user_id yok
                    profileData.user,
                    profileData.repos,
                    profileData.languages
                );
                added++;
                console.log(`✅ Added ${username} to leaderboard`);
                
                // Rate limit için küçük bir delay
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error: any) {
                console.error(`❌ Failed to add ${username}:`, error.message);
                errors++;
            }
        }

        return { added, errors };
    } catch (error: any) {
        console.error("Error populating popular users:", error);
        throw error;
    }
}

/**
 * Kapsamlı veri toplama: Tüm seviyelerden kullanıcıları topla ve analiz et
 */
export async function populateComprehensiveUsers(): Promise<{
    totalAdded: number;
    totalErrors: number;
    byLevel: Record<string, { added: number; errors: number }>;
}> {
    const { fetchComprehensiveUsers } = await import("./data-collection");
    const { fetchGitHubProfile } = await import("./github");
    
    try {
        const results = await fetchComprehensiveUsers();
        let totalAdded = 0;
        let totalErrors = 0;
        const byLevel: Record<string, { added: number; errors: number }> = {};

        for (const result of results) {
            const levelStats = { added: 0, errors: 0 };
            
            console.log(`\n📊 Processing ${result.count} ${result.level} users...`);
            
            for (const username of result.users) {
                try {
                    const profileData = await fetchGitHubProfile(username);
                    await upsertLeaderboardEntry(
                        null,
                        profileData.user,
                        profileData.repos,
                        profileData.languages
                    );
                    levelStats.added++;
                    totalAdded++;
                    
                    // Rate limit koruması
                    await new Promise(resolve => setTimeout(resolve, 150));
                } catch (error: any) {
                    levelStats.errors++;
                    totalErrors++;
                    console.error(`❌ Failed to add ${username}:`, error.message);
                    
                    // Rate limit hatası varsa daha uzun bekle
                    if (error.status === 403) {
                        console.warn("⚠️ Rate limit reached, waiting 60 seconds...");
                        await new Promise(resolve => setTimeout(resolve, 60000));
                    }
                }
            }
            
            byLevel[result.level] = levelStats;
            console.log(`✅ ${result.level}: ${levelStats.added} added, ${levelStats.errors} errors`);
        }

        return {
            totalAdded,
            totalErrors,
            byLevel,
        };
    } catch (error: any) {
        console.error("Error in comprehensive user population:", error);
        throw error;
    }
}

export interface LeaderboardFilters {
    language?: string;
    tier?: string;
    minAura?: number;
    minStars?: number;
    minFollowers?: number;
    sortBy?: "impact_index" | "total_stars" | "followers" | "total_forks";
    limit?: number;
}

/**
 * Tüm mevcut dilleri çek (filtreler için)
 */
export async function getAvailableLanguages(): Promise<string[]> {
    const { data, error } = await supabase
        .from("user_leaderboard")
        .select("dominant_language");

    if (error) {
        console.error("Error fetching available languages:", error);
        return [];
    }

    const languages = Array.from(
        new Set(
            (data || [])
                .map((entry) => entry.dominant_language)
                .filter((lang): lang is string => Boolean(lang))
        )
    ).sort();

    return languages;
}

/**
 * GitHub'daki tahmini aktif kullanıcı sayısı (istatistiksel tahmin)
 * GitHub'da ~100M+ toplam kullanıcı var, ama aktif olanlar (ayda en az 1 commit) ~8-12M civarında
 * Daha konservatif bir tahmin kullanıyoruz
 */
const ESTIMATED_ACTIVE_GITHUB_USERS = 10_000_000;

/**
 * Power-law distribution (Pareto dağılımı) kullanarak daha gerçekçi sıralama
 * GitHub'daki gerçek dağılım power-law'a yakındır (80/20 kuralı)
 */
function estimateGlobalRank(impactIndex: number): {
    estimatedRank: number;
    estimatedPercentile: number;
} {
    if (impactIndex <= 0) {
        return {
            estimatedRank: ESTIMATED_ACTIVE_GITHUB_USERS,
            estimatedPercentile: 0,
        };
    }

    // Power-law distribution parametreleri
    // GitHub'daki gerçek dağılım: çoğu kullanıcı düşük skor, az sayıda kullanıcı çok yüksek skor
    // alpha = 2.0 (tipik power-law parametresi, GitHub için uygun)
    const alpha = 2.0;
    const minIndex = 1; // Minimum impactIndex
    const maxIndex = 500000; // Maksimum impactIndex (elite kullanıcılar için)

    // Normalize impactIndex (0-1 arası)
    const normalizedIndex = Math.min(1, (impactIndex - minIndex) / (maxIndex - minIndex));

    // Power-law CDF (Cumulative Distribution Function)
    // P(X <= x) = 1 - (x_min / x)^(alpha - 1)
    // Tersine çevirerek percentile hesapla
    let percentile: number;
    
    if (normalizedIndex <= 0.001) {
        // En düşük %0.1 - çok düşük skorlar
        percentile = normalizedIndex * 0.1;
    } else if (normalizedIndex <= 0.01) {
        // %0.1 - %1 arası
        percentile = 0.1 + (normalizedIndex - 0.001) * 9;
    } else if (normalizedIndex <= 0.1) {
        // %1 - %10 arası
        percentile = 1 + (normalizedIndex - 0.01) * 10;
    } else {
        // %10 - %100 arası (power-law kullan)
        const powerLawPercentile = 1 - Math.pow(minIndex / impactIndex, alpha - 1);
        percentile = Math.max(10, Math.min(99.9, powerLawPercentile * 100));
    }

    // Sıralama hesapla (percentile'den)
    const estimatedRank = Math.max(1, Math.round(ESTIMATED_ACTIVE_GITHUB_USERS * (1 - percentile / 100)));

    return {
        estimatedRank,
        estimatedPercentile: Math.round(percentile * 100) / 100,
    };
}

/**
 * Kullanıcının GitHub'daki sıralamasını hesapla (gerçek verilerle)
 */
export async function getUserRank(githubUsername: string): Promise<{
    rank: number;
    totalUsers: number;
    percentile: number;
    aboveUsers: number;
    estimatedGlobalRank?: number;
    estimatedGlobalPercentile?: number;
    isEstimated?: boolean;
    distributionBased?: boolean;
} | null> {
    try {
        // Kullanıcının entry'sini bul
        const { data: userEntry, error: userError } = await supabase
            .from("user_leaderboard")
            .select("impact_index")
            .eq("github_username", githubUsername)
            .single();

        if (userError || !userEntry) {
            return null;
        }

        const userImpactIndex = Math.round(userEntry.impact_index);

        // Toplam kullanıcı sayısı (veritabanında)
        const { count: totalCount, error: totalError } = await supabase
            .from("user_leaderboard")
            .select("*", { count: "exact", head: true });

        if (totalError || totalCount === null) {
            return null;
        }

        const dbUserCount = totalCount;

        // Eğer yeterli veri varsa (1000+ kullanıcı), gerçek dağılım analizi yap
        if (dbUserCount >= 1000) {
            const { analyzeRealDistribution, calculateRankFromRealDistribution } = await import("./distribution-analysis");
            const distribution = await analyzeRealDistribution();

            if (distribution) {
                // Gerçek dağılıma göre hesapla
                const realRank = calculateRankFromRealDistribution(userImpactIndex, distribution);
                
                // Veritabanında bu skordan yüksek kaç kullanıcı var? (kesin sayı)
                const { count, error: countError } = await supabase
                    .from("user_leaderboard")
                    .select("*", { count: "exact", head: true })
                    .gt("impact_index", userImpactIndex);

                if (!countError && count !== null) {
                    // Gerçek sıralama (veritabanından)
                    return {
                        rank: count + 1,
                        totalUsers: dbUserCount,
                        percentile: ((dbUserCount - count) / dbUserCount) * 100,
                        aboveUsers: count,
                        isEstimated: false,
                        distributionBased: true,
                    };
                } else {
                    // Dağılım analizine göre tahmin
                    return {
                        rank: realRank.rank,
                        totalUsers: dbUserCount,
                        percentile: realRank.percentile,
                        aboveUsers: realRank.aboveUsers,
                        isEstimated: true,
                        distributionBased: true,
                    };
                }
            }
        }

        // Yeterli veri yoksa, istatistiksel tahmin kullan
        const { estimatedRank, estimatedPercentile } = estimateGlobalRank(userImpactIndex);
        
        // Veritabanındaki gerçek sıralama (eğer varsa)
        const { count, error: countError } = await supabase
            .from("user_leaderboard")
            .select("*", { count: "exact", head: true })
            .gt("impact_index", userImpactIndex);

        if (!countError && count !== null && dbUserCount >= 100) {
            // Veritabanında yeterli veri var, gerçek sıralamayı kullan
            return {
                rank: count + 1,
                totalUsers: dbUserCount,
                percentile: ((dbUserCount - count) / dbUserCount) * 100,
                aboveUsers: count,
                estimatedGlobalRank: estimatedRank,
                estimatedGlobalPercentile: estimatedPercentile,
                isEstimated: false,
                distributionBased: false,
            };
        }

        // İstatistiksel tahmin kullan
        return {
            rank: estimatedRank,
            totalUsers: ESTIMATED_ACTIVE_GITHUB_USERS,
            percentile: estimatedPercentile,
            aboveUsers: estimatedRank - 1,
            estimatedGlobalRank: estimatedRank,
            estimatedGlobalPercentile: estimatedPercentile,
            isEstimated: true,
            distributionBased: false,
        };
    } catch (error) {
        console.error("Error calculating user rank:", error);
        return null;
    }
}

/**
 * Filtrelenmiş leaderboard'u çek
 */
export async function getTopLeaderboard(filters: LeaderboardFilters = {}): Promise<LeaderboardEntry[]> {
    const {
        language,
        tier,
        minAura = 0,
        minStars = 0,
        minFollowers = 0,
        sortBy = "impact_index",
        limit = 50,
    } = filters;

    let query = supabase
        .from("user_leaderboard")
        .select("*");

    // Filtreler
    if (language) {
        query = query.eq("dominant_language", language);
    }

    if (minAura > 0) {
        query = query.gte("impact_index", minAura);
    }

    if (minStars > 0) {
        query = query.gte("total_stars", minStars);
    }

    if (minFollowers > 0) {
        query = query.gte("followers", minFollowers);
    }

    // Sıralama
    query = query.order(sortBy, { ascending: false });

    // Limit
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching leaderboard:", error);
        throw error;
    }

    let entries = (data || []).map((entry) => {
        // Tier hesapla
        const score = (entry.total_stars * 2) + (entry.total_forks * 1.5) + (entry.followers * 1) + (entry.public_repos * 0.5);
        
        let tier: string = "Iron";
        if (score > 1000) tier = "Platinum";
        else if (score > 500) tier = "Gold";
        else if (score > 100) tier = "Silver";
        else if (score > 50) tier = "Bronze";

        return {
            ...entry,
            impact_index: Math.round(entry.impact_index), // Integer'a çevir
            tier,
        };
    });

    // Tier filtresi (eğer belirtilmişse, client-side'da filtrele)
    if (tier) {
        entries = entries.filter((entry) => entry.tier === tier);
    }

    // Rank ekle
    return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));
}

