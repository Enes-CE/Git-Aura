import { NextRequest, NextResponse } from "next/server";
import { populatePopularUsers } from "@/lib/leaderboard";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const limit = body.limit || 1000; // Default 1000 kullanıcı

        const result = await populatePopularUsers(limit);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${result.added} users. ${result.errors} errors occurred.`,
            note: result.added < 1000 
                ? "For more accurate rankings, consider running this multiple times or increasing the limit."
                : "Great! You now have enough users for more accurate rankings.",
            ...result,
        });
    } catch (error: any) {
        console.error("Error populating leaderboard:", error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message || "Failed to populate leaderboard" 
            },
            { status: 500 }
        );
    }
}

// GET endpoint for easy testing
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "1000"); // Default 1000 kullanıcı

    try {
        const result = await populatePopularUsers(limit);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${result.added} users. ${result.errors} errors occurred.`,
            note: result.added < 1000 
                ? "For more accurate rankings, consider running this multiple times or increasing the limit."
                : "Great! You now have enough users for more accurate rankings.",
            ...result,
        });
    } catch (error: any) {
        console.error("Error populating leaderboard:", error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message || "Failed to populate leaderboard" 
            },
            { status: 500 }
        );
    }
}

