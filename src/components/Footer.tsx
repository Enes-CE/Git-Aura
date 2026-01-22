"use client";

import { motion } from "framer-motion";
import { Github, Sparkles, Heart } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const version = "1.0.0";

    return (
        <footer 
            className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl"
            data-testid="footer"
            role="contentinfo"
        >
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-xl font-bold font-space bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                GitAura
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Ultimate GitHub Profiler. Analyze your code, discover your developer persona, and see your global ranking.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400">
                                v{version}
                            </span>
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
                                First Release
                            </span>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/leaderboard"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                >
                                    Global Leaderboard
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* About Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">
                            About
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            GitAura is a high-end, cinematic web application that analyzes GitHub profiles with a focus on visual storytelling and data insights.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Built with</span>
                            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                            <span>by the GitAura Team</span>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="text-xs text-gray-500">
                        <p>
                            © {currentYear} GitAura. All rights reserved.
                        </p>
                        <p className="mt-1 text-gray-600">
                            This is the first version (v{version}) of GitAura. We're constantly improving!
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-cyan-400 transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

