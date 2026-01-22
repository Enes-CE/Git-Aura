import { supabase } from "./supabase";

/**
 * Gerçek verilerden dağılım analizi yap
 */
export interface DistributionStats {
    totalUsers: number;
    percentiles: {
        p99: number;  // Top %1
        p95: number;  // Top %5
        p90: number;  // Top %10
        p75: number;  // Top %25
        p50: number;  // Median
        p25: number;  // Bottom %25
    };
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
}

/**
 * Veritabanındaki gerçek dağılımı analiz et
 */
export async function analyzeRealDistribution(): Promise<DistributionStats | null> {
    try {
        // Tüm impact_index değerlerini çek
        const { data, error } = await supabase
            .from("user_leaderboard")
            .select("impact_index")
            .order("impact_index", { ascending: false });

        if (error || !data || data.length === 0) {
            return null;
        }

        const impactIndices = data.map(entry => Math.round(entry.impact_index)).sort((a, b) => b - a);
        const totalUsers = impactIndices.length;

        if (totalUsers < 100) {
            // Yeterli veri yok
            return null;
        }

        // İstatistikler hesapla
        const mean = impactIndices.reduce((sum, val) => sum + val, 0) / totalUsers;
        const median = impactIndices[Math.floor(totalUsers / 2)];
        
        // Standart sapma
        const variance = impactIndices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totalUsers;
        const stdDev = Math.sqrt(variance);

        // Percentile'ları hesapla
        const getPercentile = (percentile: number): number => {
            const index = Math.floor((totalUsers * (100 - percentile)) / 100);
            return impactIndices[index] || 0;
        };

        const percentiles = {
            p99: getPercentile(99),  // Top %1
            p95: getPercentile(95),  // Top %5
            p90: getPercentile(90),  // Top %10
            p75: getPercentile(75),  // Top %25
            p50: median,             // Median
            p25: getPercentile(25),  // Bottom %25
        };

        return {
            totalUsers,
            percentiles,
            mean,
            median,
            stdDev,
            min: impactIndices[totalUsers - 1],
            max: impactIndices[0],
        };
    } catch (error) {
        console.error("Error analyzing distribution:", error);
        return null;
    }
}

/**
 * Gerçek dağılıma göre kullanıcının sıralamasını hesapla
 */
export function calculateRankFromRealDistribution(
    userImpactIndex: number,
    distribution: DistributionStats
): {
    rank: number;
    percentile: number;
    aboveUsers: number;
} {
    // Veritabanında bu skordan yüksek kaç kullanıcı var?
    // Bu sorgu Supabase'de yapılacak, burada sadece hesaplama mantığı
    
    // Percentile hesapla (gerçek dağılıma göre)
    let percentile = 0;
    
    if (userImpactIndex >= distribution.percentiles.p99) {
        // Top %1
        percentile = 99 + ((userImpactIndex - distribution.percentiles.p99) / (distribution.max - distribution.percentiles.p99)) * 1;
    } else if (userImpactIndex >= distribution.percentiles.p95) {
        // Top %5
        percentile = 95 + ((userImpactIndex - distribution.percentiles.p95) / (distribution.percentiles.p99 - distribution.percentiles.p95)) * 4;
    } else if (userImpactIndex >= distribution.percentiles.p90) {
        // Top %10
        percentile = 90 + ((userImpactIndex - distribution.percentiles.p90) / (distribution.percentiles.p95 - distribution.percentiles.p90)) * 5;
    } else if (userImpactIndex >= distribution.percentiles.p75) {
        // Top %25
        percentile = 75 + ((userImpactIndex - distribution.percentiles.p75) / (distribution.percentiles.p90 - distribution.percentiles.p75)) * 15;
    } else if (userImpactIndex >= distribution.percentiles.p50) {
        // Top %50
        percentile = 50 + ((userImpactIndex - distribution.percentiles.p50) / (distribution.percentiles.p75 - distribution.percentiles.p50)) * 25;
    } else {
        // Bottom %50
        percentile = (userImpactIndex / distribution.percentiles.p50) * 50;
    }

    percentile = Math.min(99.99, Math.max(0.01, percentile));
    
    const aboveUsers = Math.round(distribution.totalUsers * (1 - percentile / 100));
    const rank = aboveUsers + 1;

    return {
        rank,
        percentile: Math.round(percentile * 100) / 100,
        aboveUsers,
    };
}

