import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

// Build sırasında environment variables yoksa fallback değerler kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-secret";
const githubId = process.env.GITHUB_ID || "placeholder-id";
const githubSecret = process.env.GITHUB_SECRET || "placeholder-secret";

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: githubId,
            clientSecret: githubSecret,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    // GitHub username
                    login: profile.login,
                    // GitHub ile başarılı OAuth → e‑mail'i verified kabul ediyoruz
                    emailVerified: profile.email ? new Date() : null,
                };
            },
        }),
    ],
    adapter: supabaseUrl && supabaseSecret && supabaseUrl !== "https://placeholder.supabase.co"
        ? SupabaseAdapter({
            url: supabaseUrl,
            secret: supabaseSecret,
        }) as any
        : undefined, // Build sırasında adapter yoksa undefined
    callbacks: {
        async signIn({ user, account, profile }) {
            // Eğer GitHub OAuth ile giriş yapıldıysa ve email varsa
            if (account?.provider === "github" && profile && user.email) {
                // Service role key ile Supabase client oluştur
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    {
                        auth: {
                            autoRefreshToken: false,
                            persistSession: false,
                        },
                    }
                );

                // Mevcut kullanıcının email_verified'i null ise güncelle
                // next_auth schema'sını kullan
                try {
                    const { data: existingUser, error: fetchError } = await supabaseAdmin
                        .schema("next_auth")
                        .from("users")
                        .select("email_verified")
                        .eq("email", user.email)
                        .single();

                    if (!fetchError && existingUser && !existingUser.email_verified) {
                        // email_verified'i şimdi olarak güncelle
                        await supabaseAdmin
                            .schema("next_auth")
                            .from("users")
                            .update({ email_verified: new Date().toISOString() })
                            .eq("email", user.email);
                    }
                } catch (error) {
                    // Hata durumunda sessizce devam et (yeni kullanıcı olabilir)
                    console.error("Error updating email_verified:", error);
                }
            }
            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                // Kullanıcı id'si
                // @ts-ignore
                session.user.id = user.id;
                // GitHub login bilgisini de session'a taşı
                // @ts-ignore
                session.user.login = (user as any).login;
            }
            return session;
        },
    },
    pages: {
        signIn: "/", // Redirect to home on auth issues
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
