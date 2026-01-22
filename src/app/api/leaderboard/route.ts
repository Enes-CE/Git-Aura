import { NextRequest, NextResponse } from "next/server";
import { getTopLeaderboard, getAvailableLanguages, getUserRank, LeaderboardFilters } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        // Eğer sadece dilleri istiyorsa
        if (searchParams.get("languages") === "true") {
            const languages = await getAvailableLanguages();
            return NextResponse.json({ 
                languages: languages || [],
                success: true 
            }, { status: 200 });
        }
        
        // Username validation helper function
        const validateUsername = (username: string): { valid: boolean; error?: string } => {
            if (!username) return { valid: false, error: "Username is required" };
            
            // GitHub username validation: alphanumeric, hyphens, no spaces, max 39 chars
            const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$/;
            if (!usernameRegex.test(username)) {
                return { valid: false, error: "Invalid username format. Username must be alphanumeric with hyphens, max 39 characters" };
            }
            
            if (username.length > 100) {
                return { valid: false, error: "Username too long. Maximum length is 100 characters" };
            }
            
            return { valid: true };
        };
        
        // Eğer kullanıcı sıralaması isteniyorsa
        const username = searchParams.get("username");
        if (username && searchParams.get("rank") === "true") {
            const validation = validateUsername(username);
            if (!validation.valid) {
                return NextResponse.json({
                    rank: null,
                    success: false,
                    error: validation.error || "Invalid username",
                }, { status: 400 });
            }
            
            try {
                const rankData = await getUserRank(username);
                if (!rankData) {
                    return NextResponse.json({
                        rank: null,
                        success: false,
                        error: "User not found",
                    }, { status: 404 });
                }
                return NextResponse.json({ 
                    rank: rankData,
                    success: true 
                }, { status: 200 });
            } catch (error: any) {
                // Kullanıcı bulunamadıysa uygun response döndür
                return NextResponse.json({
                    rank: null,
                    success: false,
                    error: "User not found",
                }, { status: 404 });
            }
        }
        
        // Query parameter validation
        const language = searchParams.get("language") || undefined;
        const tier = searchParams.get("tier") || undefined;
        const minAuraParam = searchParams.get("minAura");
        const minStarsParam = searchParams.get("minStars");
        const minFollowersParam = searchParams.get("minFollowers");
        const sortByParam = searchParams.get("sortBy");
        const limitParam = searchParams.get("limit");
        
        // Parse ve validate numeric parameters
        const minAura = minAuraParam ? (isNaN(parseInt(minAuraParam)) ? undefined : parseInt(minAuraParam)) : undefined;
        const minStars = minStarsParam ? (isNaN(parseInt(minStarsParam)) ? undefined : parseInt(minStarsParam)) : undefined;
        const minFollowers = minFollowersParam ? (isNaN(parseInt(minFollowersParam)) ? undefined : parseInt(minFollowersParam)) : undefined;
        const limit = limitParam ? (isNaN(parseInt(limitParam)) ? 50 : Math.min(100, Math.max(1, parseInt(limitParam)))) : 50;
        
        // Username validation (eğer filter olarak kullanılıyorsa)
        if (username && searchParams.get("rank") !== "true") {
            const validation = validateUsername(username);
            if (!validation.valid) {
                return NextResponse.json({
                    error: validation.error || "Invalid username format",
                    success: false,
                }, { status: 400 });
            }
        }
        
        const filters: LeaderboardFilters = {
            language,
            tier,
            minAura,
            minStars,
            minFollowers,
            sortBy: (sortByParam as any) || "impact_index",
            limit,
        };

        const leaderboard = await getTopLeaderboard(filters);
        const languages = await getAvailableLanguages(); // Her zaman dilleri de gönder
        
        // Eğer username varsa, kullanıcının sıralamasını da gönder
        let userRank = null;
        if (username) {
            // Username validation
            const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$/;
            if (usernameRegex.test(username) && username.length <= 100) {
                try {
                    userRank = await getUserRank(username);
                } catch (error) {
                    // Kullanıcı bulunamadıysa null döndür, hata fırlatma
                    console.warn(`User rank not found for: ${username}`);
                }
            }
        }
        
        // Her zaman standart response formatı döndür (boş leaderboard bile olsa)
        return NextResponse.json({
            leaderboard: Array.isArray(leaderboard) ? leaderboard : [],
            availableLanguages: Array.isArray(languages) ? languages : [],
            userRank: userRank || null,
            success: true,
            count: Array.isArray(leaderboard) ? leaderboard.length : 0,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error in leaderboard API:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}

