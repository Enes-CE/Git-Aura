"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
    onSearch: (username: string) => void;
    isLoading: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
    const [input, setInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSearch(input.trim());
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="relative w-full max-w-md group"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse" />
            <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl overflow-hidden focus-within:border-cyan-400/50 transition-all">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter GitHub Username..."
                    className="w-full bg-transparent text-white placeholder-gray-400 px-6 py-3 outline-none font-medium"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="p-3 bg-white/10 hover:bg-cyan-500/20 rounded-full text-white transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
            </div>
        </motion.form>
    );
};
