import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubProfile } from "@/lib/github";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    try {
        const data = await fetchGitHubProfile(username);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: error.message === "User not found" ? 404 : 500 });
    }
}
