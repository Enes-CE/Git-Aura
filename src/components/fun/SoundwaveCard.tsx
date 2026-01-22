"use client";

import { motion } from "framer-motion";
import { Music, Play, Pause } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { useState, useRef, useEffect } from "react";

interface SoundwaveProps {
    waveData: number[]; // 24 data points (0-100)
}

export const SoundwaveCard = ({ waveData }: SoundwaveProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);

    const playAuraSound = () => {
        if (isPlaying) {
            // Stop
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current = null;
            }
            setIsPlaying(false);
        } else {
            // Play
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (!audioContextRef.current) {
                    audioContextRef.current = new AudioContext();
                }

                const ctx = audioContextRef.current;
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                // Calculate frequency based on average wave intensity
                const avgIntensity = waveData.reduce((a, b) => a + b, 0) / waveData.length;
                const frequency = 200 + (avgIntensity * 5); // 200-700 Hz range

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.start();
                oscillator.stop(ctx.currentTime + 2);

                oscillatorRef.current = oscillator;
                setIsPlaying(true);

                setTimeout(() => setIsPlaying(false), 2000);
            } catch (error) {
                console.error("Audio playback failed:", error);
            }
        }
    };

    return (
        <GlassCard className="relative overflow-hidden hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)] transition-all duration-500 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-blue-900/20 opacity-50" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Music className="w-5 h-5" />
                        <h3 className="text-xl font-bold font-space">Aura Soundwave</h3>
                    </div>
                    <button
                        onClick={playAuraSound}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isPlaying
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-cyan-500/10 hover:border-cyan-500/30'
                            }`}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isPlaying ? 'Playing' : 'Play'}
                        </span>
                    </button>
                </div>

                {/* Visualizer */}
                <div className="h-32 flex items-end justify-center gap-1 bg-black/20 rounded-xl p-4 border border-white/5">
                    {waveData.map((intensity, index) => (
                        <motion.div
                            key={index}
                            className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                            initial={{ height: 0 }}
                            animate={{
                                height: `${intensity}%`,
                                opacity: isPlaying ? [0.5, 1, 0.5] : 0.7
                            }}
                            transition={{
                                height: { duration: 0.5, delay: index * 0.02 },
                                opacity: isPlaying ? { duration: 0.5, repeat: Infinity } : {}
                            }}
                            style={{
                                minHeight: '4px',
                                boxShadow: isPlaying ? '0 0 10px rgba(6, 182, 212, 0.5)' : 'none'
                            }}
                        />
                    ))}
                </div>

                <div className="text-center text-xs text-gray-500">
                    <p>Your commit rhythm visualized as sound. Each bar represents an hour of the day.</p>
                </div>
            </div>
        </GlassCard>
    );
};
