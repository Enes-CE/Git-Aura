/**
 * Environment variables validation
 * Bu dosya uygulama başlarken gerekli environment variable'ları kontrol eder
 */

const requiredEnvVars = {
    // NextAuth
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    
    // GitHub OAuth
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Optional
    GITHUB_TOKEN: process.env.GITHUB_TOKEN, // Optional
    CRON_SECRET: process.env.CRON_SECRET, // Optional
};

const optionalEnvVars = ["GITHUB_TOKEN", "CRON_SECRET"];

export function validateEnvVars(): { valid: boolean; missing: string[]; warnings: string[] } {
    const missing: string[] = [];
    const warnings: string[] = [];

    Object.entries(requiredEnvVars).forEach(([key, value]) => {
        if (!value && !optionalEnvVars.includes(key)) {
            missing.push(key);
        } else if (!value && optionalEnvVars.includes(key)) {
            warnings.push(key);
        }
    });

    return {
        valid: missing.length === 0,
        missing,
        warnings,
    };
}

export function getEnvValidationMessage(): string | null {
    const validation = validateEnvVars();
    
    if (!validation.valid) {
        return `Missing required environment variables: ${validation.missing.join(", ")}`;
    }
    
    if (validation.warnings.length > 0) {
        console.warn(`Optional environment variables not set: ${validation.warnings.join(", ")}`);
    }
    
    return null;
}

// Server-side validation (API routes için)
export function validateEnvVarsServer(): void {
    const validation = validateEnvVars();
    
    if (!validation.valid) {
        throw new Error(
            `Missing required environment variables: ${validation.missing.join(", ")}\n` +
            `Please check your .env.local file.`
        );
    }
}

