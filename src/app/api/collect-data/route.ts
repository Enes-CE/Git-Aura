import { NextRequest, NextResponse } from "next/server";
import { populateComprehensiveUsers } from "@/lib/leaderboard";
import { analyzeRealDistribution } from "@/lib/distribution-analysis";

/**
 * Kapsamlı veri toplama endpoint'i
 * Tüm seviyelerden kullanıcıları toplar (elite, high, medium, low, beginner)
 */
export async function POST(request: NextRequest) {
    try {
        console.log("🚀 Starting comprehensive data collection...");
        const result = await populateComprehensiveUsers();
        
        // Dağılım analizi yap
        const distribution = await analyzeRealDistribution();
        
        return NextResponse.json({
            success: true,
            message: `Successfully collected data from ${result.totalAdded} users. ${result.totalErrors} errors occurred.`,
            stats: {
                totalAdded: result.totalAdded,
                totalErrors: result.totalErrors,
                byLevel: result.byLevel,
            },
            distribution: distribution ? {
                totalUsers: distribution.totalUsers,
                percentiles: distribution.percentiles,
                mean: Math.round(distribution.mean),
                median: Math.round(distribution.median),
            } : null,
        });
    } catch (error: any) {
        console.error("Error in comprehensive data collection:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to collect comprehensive data",
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint - Dağılım analizi ve istatistikler
 */
export async function GET(request: NextRequest) {
    try {
        const distribution = await analyzeRealDistribution();
        
        if (!distribution) {
            return NextResponse.json({
                success: false,
                message: "Not enough data for distribution analysis. Need at least 100 users.",
            });
        }

        return NextResponse.json({
            success: true,
            distribution: {
                totalUsers: distribution.totalUsers,
                percentiles: distribution.percentiles,
                mean: Math.round(distribution.mean),
                median: Math.round(distribution.median),
                stdDev: Math.round(distribution.stdDev),
                min: distribution.min,
                max: distribution.max,
            },
            interpretation: {
                top1Percent: `Users with impact index >= ${distribution.percentiles.p99} are in top 1%`,
                top5Percent: `Users with impact index >= ${distribution.percentiles.p95} are in top 5%`,
                top10Percent: `Users with impact index >= ${distribution.percentiles.p90} are in top 10%`,
                median: `Median impact index is ${distribution.median}`,
            },
        });
    } catch (error: any) {
        console.error("Error analyzing distribution:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to analyze distribution",
            },
            { status: 500 }
        );
    }
}

