"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const UserMenu = () => {
    const { data: session, status } = useSession();

    if (status === "loading") return null;

    if (!session) return null;

    return (
        <div className="fixed top-6 right-6 z-[60]">
            <AnimatePresence mode="wait">
                <motion.div
                    key="user-logged-in"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-2 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-xl transition-all group"
                    style={{ marginRight: session ? "0" : "0" }}
                >
                    {session.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-8 h-8 rounded-full border border-white/20"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-white/20">
                            <UserIcon className="w-4 h-4 text-cyan-400" />
                        </div>
                    )}
                    <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{session.user?.name}</span>
                    <button
                        onClick={() => signOut()}
                        className="ml-2 p-1.5 hover:bg-red-500/20 rounded-full text-white/30 hover:text-red-400 transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
