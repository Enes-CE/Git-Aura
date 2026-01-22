import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET(request: NextRequest) {
    // Query parameter'dan token al (test için)
    const searchParams = request.nextUrl.searchParams;
    const testToken = searchParams.get("token");
    const token = testToken || process.env.GITHUB_TOKEN;
    
    // Token yoksa
    if (!token || token.trim() === "") {
        return NextResponse.json({
            hasToken: false,
            message: "GITHUB_TOKEN not found in environment variables",
            authenticated: false,
            success: false,
        }, { status: 200 }); // 200 döndür, çünkü bu bir hata değil, durum bilgisi
    }

    // Invalid token format kontrolü
    if (token.length < 10) {
        return NextResponse.json({
            hasToken: true,
            message: "Invalid token format",
            authenticated: false,
            success: false,
            error: "Token is too short or malformed",
        }, { status: 200 });
    }
    
    // Empty string kontrolü
    if (token.trim() === "") {
        return NextResponse.json({
            hasToken: false,
            message: "Empty token provided",
            authenticated: false,
            success: false,
        }, { status: 200 });
    }
    
    // Very long token kontrolü (edge case)
    if (token.length > 1000) {
        return NextResponse.json({
            hasToken: true,
            message: "Token exceeds maximum length",
            authenticated: false,
            success: false,
            error: "Token is too long",
        }, { status: 200 });
    }
    
    // Special characters kontrolü (GitHub token genelde alphanumeric + bazı özel karakterler)
    // Ama çok kısıtlayıcı olmayalım, sadece çok garip karakterler için kontrol edelim
    if (/[<>\"'&]/.test(token)) {
        return NextResponse.json({
            hasToken: true,
            message: "Token contains invalid characters",
            authenticated: false,
            success: false,
            error: "Token contains potentially dangerous characters",
        }, { status: 200 });
    }

    try {
        const octokit = new Octokit({ auth: token });
        const { data: rateLimit } = await octokit.rest.rateLimit.get();
        
        const isAuthenticated = rateLimit.rate.limit > 60; // Authenticated requests have 5000 limit
        
        return NextResponse.json({
            hasToken: true,
            tokenPrefix: token.substring(0, 7) + "...",
            rateLimit: {
                limit: rateLimit.rate.limit,
                remaining: rateLimit.rate.remaining,
                reset: new Date(rateLimit.rate.reset * 1000).toISOString(),
            },
            authenticated: isAuthenticated,
            success: true,
        }, { status: 200 });
    } catch (error: any) {
        // Invalid token veya expired token durumları
        const isInvalidToken = error.status === 401 || error.message?.includes("Bad credentials");
        const isExpired = error.message?.includes("expired") || error.message?.includes("revoked");
        
        return NextResponse.json({
            hasToken: true,
            tokenPrefix: token.substring(0, 7) + "...",
            authenticated: false,
            success: false,
            error: isInvalidToken 
                ? "Invalid or expired token" 
                : isExpired 
                ? "Token has expired or been revoked"
                : error.message || "Failed to authenticate with GitHub",
        }, { status: isInvalidToken ? 401 : 500 });
    }
}

