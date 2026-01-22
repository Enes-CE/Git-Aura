import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET() {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
        return NextResponse.json({
            hasToken: false,
            message: "GITHUB_TOKEN not found in environment variables",
        });
    }

    try {
        const octokit = new Octokit({ auth: token });
        const { data: rateLimit } = await octokit.rest.rateLimit.get();
        
        return NextResponse.json({
            hasToken: true,
            tokenPrefix: token.substring(0, 7) + "...",
            rateLimit: {
                limit: rateLimit.rate.limit,
                remaining: rateLimit.rate.remaining,
                reset: new Date(rateLimit.rate.reset * 1000).toISOString(),
            },
            authenticated: rateLimit.rate.limit > 60, // Authenticated requests have 5000 limit
        });
    } catch (error: any) {
        return NextResponse.json({
            hasToken: true,
            tokenPrefix: token.substring(0, 7) + "...",
            error: error.message,
            authenticated: false,
        }, { status: 500 });
    }
}

