"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { fetchGitHubProfile, UserProfile, RepoStats, LanguageData } from "@/lib/github";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingPortal } from "@/components/LoadingPortal";
import { UserMenu } from "@/components/ui/UserMenu";
import { signIn, useSession } from "next-auth/react";
import { upsertLeaderboardEntry } from "@/lib/leaderboard";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { GitHubStars } from "@/components/GitHubStars";

export default function Home() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<{
        user: UserProfile;
        repos: RepoStats[];
        languages: LanguageData[];
    } | null>(null);

    const handleSearch = async (username: string) => {
        setIsLoading(true);
        try {
            const result = await fetchGitHubProfile(username);
            setData(result);

            // Eğer kullanıcı giriş yapmışsa, leaderboard'a kaydet
            if (status === "authenticated" && session?.user) {
                const userId = (session.user as any).id;
                if (userId) {
                    try {
                        await upsertLeaderboardEntry(
                            userId,
                            result.user,
                            result.repos,
                            result.languages
                        );
                    } catch (error) {
                        console.error("Failed to update leaderboard:", error);
                        // Leaderboard hatası kullanıcıyı engellemez, sadece log'la
                    }
                }
            }
        } catch (error: any) {
            // Daha kullanıcı dostu error handling
            const errorMessage = error.message || "Bir hata oluştu";
            console.error("GitHub profile fetch error:", error);
            
            // Rate limit hatası için özel mesaj
            if (errorMessage.includes("rate limit")) {
                toast.error("Rate Limit Aşıldı", {
                    description: "GitHub API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
                    duration: 5000,
                });
            } else if (errorMessage.includes("not found")) {
                toast.error("Kullanıcı Bulunamadı", {
                    description: "Lütfen geçerli bir GitHub kullanıcı adı girin.",
                    duration: 4000,
                });
            } else {
                toast.error("Hata Oluştu", {
                    description: errorMessage,
                    duration: 4000,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Kullanıcı GitHub ile giriş yaptığında, otomatik olarak kendi hesabını analiz et
    useEffect(() => {
        if (status === "authenticated" && session?.user && !data && !isLoading) {
            const login = (session.user as any).login as string | undefined;
            if (login) {
                handleSearch(login);
            }
        }
    }, [status, session, data, isLoading]);

    return (
        <main className="min-h-screen relative bg-[#030014] overflow-x-hidden">
            <BackgroundCanvas />
            <UserMenu />
            {/* GitHub Stars sadece landing page'de görünsün */}
            {!data && <GitHubStars />}

            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        key="landing"
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        data-testid="landing-page"
                    >
                        <Hero
                            onConnectGithub={() => signIn("github")}
                            isLoading={status === "loading" || isLoading}
                        />
                        {/* Footer should NOT be visible on landing page */}
                        <div data-testid="footer" style={{ display: 'none' }} aria-hidden="true" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-10"
                    >
                        <div className="pt-8">
                            <Dashboard data={data} />
                        </div>
                        {/* Back Button */}
                        <button
                            onClick={() => setData(null)}
                            className="fixed bottom-8 left-8 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-xl z-50 group"
                        >
                            <span className="hidden group-hover:inline mr-2 text-xs font-black uppercase tracking-widest">Reset Aura</span>
                            ↺
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLoading && <LoadingPortal />}
            </AnimatePresence>
            
            {/* Footer sadece Dashboard gösterildiğinde (data varsa) */}
            {data && <Footer />}
        </main>
    );
}
