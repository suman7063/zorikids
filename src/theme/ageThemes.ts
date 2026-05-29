export type AgeWorld = "baby" | "explorer" | "champion";

export function getAgeWorld(age: number): AgeWorld {
  if (age <= 3) return "baby";
  if (age <= 5) return "explorer";
  return "champion";
}

export const AGE_WORLDS = {
  baby: {
    label: "Baby World",
    labelHindi: "बेबी वर्ल्ड",
    emoji: "🐣",
    ageRange: "2–3 साल",

    colors: {
      background: "#FFFDE7",
      card: "#FFFFFF",
      cardSecondary: "#F1F8E9",
      primary: "#FDD835",       // Sunny yellow
      primaryLight: "#FFF176",
      secondary: "#66BB6A",     // Grass green
      accent: "#FF7043",        // Orange
      text: "#212121",
      textMuted: "#757575",
      border: "#FFF9C4",
      shadow: "rgba(253, 216, 53, 0.3)",
      tabBar: "#FFFFFF",
      tabBarActive: "#FDD835",
      gradient: ["#FDD835", "#66BB6A"],
    },

    ui: {
      buttonSize: 100,          // Very large touch targets
      fontSize: 28,
      borderRadius: 32,
      showText: false,          // No text labels
      iconSize: 56,
      cardPadding: 24,
    },

    content: {
      categories: ["rhymes", "animals", "colors", "shapes"],
      maxDuration: 3,           // Max 3 min videos
      audioFirst: true,
      showQuiz: false,
    },

    mascot: "🐘",
    characters: ["🐘", "🐮", "🐸", "🐥", "🦁", "🐼"],
  },

  explorer: {
    label: "Explorer World",
    labelHindi: "एक्सप्लोरर वर्ल्ड",
    emoji: "🚀",
    ageRange: "3–5 साल",

    colors: {
      background: "#FFF5F5",
      card: "#FFFFFF",
      cardSecondary: "#EFF6FF",
      primary: "#DC2626",       // Bold red
      primaryLight: "#F87171",
      secondary: "#0EA5E9",     // Sky blue
      accent: "#FBBF24",        // Gold
      text: "#1C1917",
      textMuted: "#6B7280",
      border: "#FECACA",
      shadow: "rgba(220, 38, 38, 0.18)",
      tabBar: "#FFFFFF",
      tabBarActive: "#DC2626",
      gradient: ["#DC2626", "#0EA5E9"],
    },

    ui: {
      buttonSize: 80,
      fontSize: 20,
      borderRadius: 24,
      showText: true,
      iconSize: 40,
      cardPadding: 18,
    },

    content: {
      categories: ["rhymes", "abc", "123", "stories", "hindi"],
      maxDuration: 5,
      audioFirst: false,
      showQuiz: true,
    },

    mascot: "🦁",
    characters: ["🦁", "🐯", "🦊", "🐺", "🦝", "🐻"],
  },

  champion: {
    label: "Champion World",
    labelHindi: "चैंपियन वर्ल्ड",
    emoji: "🏆",
    ageRange: "5–8 साल",

    colors: {
      background: "#F5F3FF",
      card: "#FFFFFF",
      cardSecondary: "#FFF7ED",
      primary: "#7C3AED",       // Purple
      primaryLight: "#A78BFA",
      secondary: "#F97316",     // Orange
      accent: "#10B981",        // Green
      text: "#1E1B4B",
      textMuted: "#6B7280",
      border: "#DDD6FE",
      shadow: "rgba(124, 58, 237, 0.15)",
      tabBar: "#FFFFFF",
      tabBarActive: "#7C3AED",
      gradient: ["#7C3AED", "#F97316"],
    },

    ui: {
      buttonSize: 60,
      fontSize: 16,
      borderRadius: 16,
      showText: true,
      iconSize: 28,
      cardPadding: 16,
    },

    content: {
      categories: ["quiz", "math", "stories", "hindi", "english", "drawing"],
      maxDuration: 10,
      audioFirst: false,
      showQuiz: true,
    },

    mascot: "🦸",
    characters: ["🦸", "🧙", "👩‍🚀", "🧑‍🎨", "👨‍🔬", "🧑‍💻"],
  },
} as const;

export type AgeTheme = (typeof AGE_WORLDS)[AgeWorld];
