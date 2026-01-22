"use client";

import { motion } from "framer-motion";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { UserMenu } from "@/components/ui/UserMenu";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const currentUserLogin = (session?.user as any)?.login;

    return (
        <main className="min-h-screen relative bg-[#030014] overflow-x-hidden">
            <BackgroundCanvas />
            <UserMenu />
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to Dashboard</span>
                    </Link>
                </motion.div>

                {/* Leaderboard */}
                <Leaderboard currentUserLogin={currentUserLogin} />
            </div>
            
            {/* Footer should be visible on leaderboard page */}
            <Footer />
        </main>
    );
}

