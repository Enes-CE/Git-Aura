import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "high-contrast";
}

export const GlassCard = ({ children, className, variant = "default", ...props }: GlassCardProps) => {
    return (
        <motion.div
            className={cn(
                "rounded-2xl p-6 transition-all duration-300",
                variant === "default" ? "glass hover:bg-white/[0.05]" : "glass-high-contrast",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
