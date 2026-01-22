"use client";

import { useEffect, useState } from "react";
import { Github, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface GitHubStarsProps {
    owner?: string;
    repo?: string;
}

export const GitHubStars = ({ owner, repo }: GitHubStarsProps) => {
    const [stars, setStars] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                // GitHub repo bilgisi - kesin değerler kullan
                const repoOwner = owner || "Enes-CE";
                const repoName = repo || "Git-Aura";
                
                const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`);
                
                if (response.ok) {
                    const data = await response.json();
                    setStars(data.stargazers_count || 0);
                } else {
                    // API hatası veya repo bulunamadıysa 0 göster
                    setStars(0);
                }
            } catch (error) {
                console.error("Failed to fetch GitHub stars:", error);
                setStars(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStars();
    }, [owner, repo]);

    const displayStars = stars !== null ? stars : 0;
    // Kesin repo URL'i - environment variable'lara bağımlı değil
    const repoUrl = `https://github.com/${owner || "Enes-CE"}/${repo || "Git-Aura"}`;

    return (
        <motion.a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-xl transition-all group"
        >
            <Github className="w-4 h-4 text-white/70 group-hover:text-cyan-400 transition-colors" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {isLoading ? (
                <span className="text-xs font-bold text-white/50">...</span>
            ) : (
                <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                    {displayStars.toLocaleString()}
                </span>
            )}
        </motion.a>
    );
};

