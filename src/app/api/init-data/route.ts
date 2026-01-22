import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { populateComprehensiveUsers } from "@/lib/leaderboard";
import { validateEnvVarsServer } from "@/lib/env-validation";

/**
 * İlk kurulum için kapsamlı veri toplama
 * Bu endpoint sadece bir kez çalıştırılmalı (ilk kurulumda)
 */
export async function POST(request: NextRequest) {
    try {
        // Environment variables validation
        validateEnvVarsServer();
        
        // Mevcut kullanıcı sayısını kontrol et
        const { count } = await supabase
            .from("user_leaderboard")
            .select("*", { count: "exact", head: true });

        const currentUserCount = count || 0;

        // Eğer zaten yeterli kullanıcı varsa, sadece güncelleme yap
        if (currentUserCount >= 1000) {
            return NextResponse.json({
                success: true,
                message: "Leaderboard already initialized with sufficient data",
                currentCount: currentUserCount,
                action: "update",
            });
        }

        // İlk kurulum: Kapsamlı veri toplama
        console.log("🚀 Starting initial data collection...");
        const result = await populateComprehensiveUsers();

        return NextResponse.json({
            success: true,
            message: `Initial data collection completed. ${result.totalAdded} users added.`,
            stats: {
                totalAdded: result.totalAdded,
                totalErrors: result.totalErrors,
                byLevel: result.byLevel,
            },
            note: "This was the initial setup. Future updates will be automatic.",
        });
    } catch (error: any) {
        console.error("Error in initial data collection:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to initialize data",
            },
            { status: 500 }
        );
    }
}

// GET endpoint - Durum kontrolü
export async function GET(request: NextRequest) {
    try {
        const { count } = await supabase
            .from("user_leaderboard")
            .select("*", { count: "exact", head: true });

        const currentUserCount = count || 0;
        const needsInit = currentUserCount < 1000;

        return NextResponse.json({
            initialized: !needsInit,
            currentUserCount,
            recommendation: needsInit
                ? "Run POST /api/init-data to initialize with comprehensive data"
                : "Leaderboard is ready. Updates will happen automatically.",
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to check status",
            },
            { status: 500 }
        );
    }
}

