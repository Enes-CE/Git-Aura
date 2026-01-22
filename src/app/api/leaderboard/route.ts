import { NextRequest, NextResponse } from "next/server";
import { getTopLeaderboard, getAvailableLanguages, getUserRank, LeaderboardFilters } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        // Eğer sadece dilleri istiyorsa
        if (searchParams.get("languages") === "true") {
            const languages = await getAvailableLanguages();
            return NextResponse.json({ languages });
        }
        
        // Eğer kullanıcı sıralaması isteniyorsa
        const username = searchParams.get("username");
        if (username && searchParams.get("rank") === "true") {
            const rankData = await getUserRank(username);
            return NextResponse.json({ rank: rankData });
        }
        
        const filters: LeaderboardFilters = {
            language: searchParams.get("language") || undefined,
            tier: searchParams.get("tier") || undefined,
            minAura: searchParams.get("minAura") ? parseInt(searchParams.get("minAura")!) : undefined,
            minStars: searchParams.get("minStars") ? parseInt(searchParams.get("minStars")!) : undefined,
            minFollowers: searchParams.get("minFollowers") ? parseInt(searchParams.get("minFollowers")!) : undefined,
            sortBy: (searchParams.get("sortBy") as any) || "impact_index",
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
        };

        const leaderboard = await getTopLeaderboard(filters);
        const languages = await getAvailableLanguages(); // Her zaman dilleri de gönder
        
        // Eğer username varsa, kullanıcının sıralamasını da gönder
        let userRank = null;
        if (username) {
            userRank = await getUserRank(username);
        }
        
        return NextResponse.json({
            leaderboard,
            availableLanguages: languages,
            userRank,
        });
    } catch (error: any) {
        console.error("Error in leaderboard API:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}

