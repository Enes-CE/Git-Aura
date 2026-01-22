import { NextRequest, NextResponse } from "next/server";
import { populatePopularUsers } from "@/lib/leaderboard";
import { supabase } from "@/lib/supabase";

/**
 * Periyodik olarak popüler kullanıcıları güncelle
 * Bu endpoint Vercel Cron Jobs veya benzeri servislerle çağrılabilir
 * 
 * Vercel Cron Jobs için vercel.json'a ekle:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-leaderboard",
 *     "schedule": "0 2 * * *" // Her gün saat 02:00'de
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
    // Basit bir API key kontrolü (production'da daha güvenli yapılmalı)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Mevcut kullanıcı sayısını kontrol et
        const { count } = await supabase
            .from("user_leaderboard")
            .select("*", { count: "exact", head: true });

        const currentUserCount = count || 0;
        const targetUserCount = 5000; // Hedef: 5000 kullanıcı
        const usersToAdd = Math.max(0, targetUserCount - currentUserCount);

        if (usersToAdd === 0) {
            return NextResponse.json({
                success: true,
                message: "Leaderboard already has enough users",
                currentCount: currentUserCount,
            });
        }

        // Eksik kullanıcıları ekle (maksimum 500)
        const limit = Math.min(500, usersToAdd);
        console.log(`🔄 Updating leaderboard: Adding ${limit} popular users...`);
        
        const result = await populatePopularUsers(limit);

        return NextResponse.json({
            success: true,
            message: `Added ${result.added} users. ${result.errors} errors occurred.`,
            currentCount: currentUserCount + result.added,
            targetCount: targetUserCount,
            added: result.added,
            errors: result.errors,
        });
    } catch (error: any) {
        console.error("Error in cron update:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to update leaderboard",
            },
            { status: 500 }
        );
    }
}

// POST da destekle (manuel tetikleme için)
export async function POST(request: NextRequest) {
    return GET(request);
}

