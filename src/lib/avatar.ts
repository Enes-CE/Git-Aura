import { LanguageData } from "./github";

export type AvatarType =
    | "Code Samurai" | "Cyber Ninja" | "Data Dragon" | "Silicon Cyborg"
    | "Midnight Owl" | "Zen Gardener" | "Cloud Phoenix" | "Void Panther"
    | "Binary Wolf" | "Golden Lion" | "Quantum Cat" | "Iron Golem"
    | "Neon Butterfly" | "Space Astronaut" | "Electric Beaver" | "Crystalline Deer"
    | "Stealth Raven" | "Magma Rhino" | "Spirit Kitsune" | "Root Ent";

export interface AuraAvatarConfig {
    type: AvatarType;
    primaryColor: string;
    secondaryColor: string;
    description: string;
    imageUrl: string;
}

export const generateAuraAvatar = (
    languages: LanguageData[],
    avgCommitsPerDay: number,
    githubAgeInYears: number,
    peakHour: number,
    totalStars: number,
    impactIndex: number
): AuraAvatarConfig => {
    const dominantLang = languages[0]?.name.toLowerCase() || "";
    let type: AvatarType = "Cyber Ninja";

    if (githubAgeInYears > 10) type = "Root Ent";
    else if (peakHour >= 0 && peakHour <= 4) type = "Midnight Owl";
    else if (totalStars > 500 || impactIndex > 100000) type = "Golden Lion";
    else if (avgCommitsPerDay > 15) type = "Silicon Cyborg";
    else if (dominantLang.includes("go") || dominantLang.includes("rust")) type = "Cloud Phoenix";
    else if (dominantLang.includes("python")) type = "Data Dragon";
    else if (dominantLang.includes("c++") || dominantLang === "c") type = "Code Samurai";
    else if (dominantLang.includes("css") || dominantLang.includes("html") || languages.length > 5) type = "Neon Butterfly";
    else if (avgCommitsPerDay > 5) type = "Electric Beaver";
    else if (impactIndex < 5000 && githubAgeInYears > 3) type = "Zen Gardener";
    else type = "Cyber Ninja";

    // Mapping to local files uploaded by user
    const configMap: Record<AvatarType, Partial<AuraAvatarConfig>> = {
        "Code Samurai": { primaryColor: "#ef4444", secondaryColor: "#7f1d1d", description: "Disciplined warrior of low-level optimization", imageUrl: "/avatars/Code_Samurai.png" },
        "Cyber Ninja": { primaryColor: "#06b6d4", secondaryColor: "#1e40af", description: "Swift shadow maneuvering through complex JS frameworks", imageUrl: "/avatars/Cyber_Ninja.png" },
        "Data Dragon": { primaryColor: "#10b981", secondaryColor: "#064e3b", description: "Calculating master of vast data realms and AI", imageUrl: "/avatars/Data_Dragon.png" },
        "Silicon Cyborg": { primaryColor: "#64748b", secondaryColor: "#0f172a", description: "Tireless machine of continuous integration", imageUrl: "/avatars/Silicon_Cyborg.png" },
        "Midnight Owl": { primaryColor: "#8b5cf6", secondaryColor: "#2e1065", description: "Legendary nocturnal being of deep-night logic", imageUrl: "/avatars/Midnight_owl.png" },
        "Zen Gardener": { primaryColor: "#4ade80", secondaryColor: "#166534", description: "Refining and growing clean code with organic patience", imageUrl: "/avatars/Zen_Gardener.png" },
        "Cloud Phoenix": { primaryColor: "#f97316", secondaryColor: "#7c2d12", description: "Rising through infrastructure deployments and scale", imageUrl: "/avatars/Cloud_Phoenix.png" },
        "Void Panther": { primaryColor: "#334155", secondaryColor: "#020617", description: "Silent, minimalist, and extremely dangerous impact", imageUrl: "/avatars/Void_Panther.png" },
        "Binary Wolf": { primaryColor: "#94a3b8", secondaryColor: "#334155", description: "Hunter of bugs and security vulnerabilities", imageUrl: "/avatars/Binary_Wolf.png" },
        "Golden Lion": { primaryColor: "#f59e0b", secondaryColor: "#78350f", description: "Regal leader of the open source savannah", imageUrl: "/avatars/Golden_Lion.png" },
        "Quantum Cat": { primaryColor: "#d946ef", secondaryColor: "#701a75", description: "Existing in multiple stacks simultaneously", imageUrl: "/avatars/Quantum_Cat.png" },
        "Iron Golem": { primaryColor: "#475569", secondaryColor: "#1e293b", description: "Unshakeable force of system architecture", imageUrl: "/avatars/Iron_Golem.png" },
        "Neon Butterfly": { primaryColor: "#ec4899", secondaryColor: "#831843", description: "Graceful architect of beautiful interfaces", imageUrl: "/avatars/Neon_Butterly.png" },
        "Space Astronaut": { primaryColor: "#0ea5e9", secondaryColor: "#0c4a6e", description: "Exploring the final frontiers of new technology", imageUrl: "/avatars/Space_Astronout.png" },
        "Electric Beaver": { primaryColor: "#78350f", secondaryColor: "#451a03", description: "Consistent builder of robust software foundations", imageUrl: "/avatars/Electric_Beaver.png" },
        "Crystalline Deer": { primaryColor: "#06b6d4", secondaryColor: "#164e63", description: "Perfect clarity and mathematical precision", imageUrl: "/avatars/Crystalline_Deer.png" },
        "Stealth Raven": { primaryColor: "#0f172a", secondaryColor: "#020617", description: "Highly intelligent observer with pinpoint impact", imageUrl: "/avatars/Stealth_Raven.png" },
        "Magma Rhino": { primaryColor: "#dc2626", secondaryColor: "#7f1d1d", description: "Heavyweight power in legacy code production", imageUrl: "/avatars/Magma_Rhino.png" },
        "Spirit Kitsune": { primaryColor: "#f472b6", secondaryColor: "#831843", description: "Clever, adaptable master of diverse technologies", imageUrl: "/avatars/Spirit_Kitsune.png" },
        "Root Ent": { primaryColor: "#166534", secondaryColor: "#064e3b", description: "Ancient guardian of the GitHub ecosystem roots", imageUrl: "/avatars/Root_Ent.png" },
    };

    const config = configMap[type];

    return {
        type,
        primaryColor: config.primaryColor!,
        secondaryColor: config.secondaryColor!,
        description: config.description!,
        imageUrl: config.imageUrl!
    };
};
