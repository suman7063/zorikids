export { Colors } from "./colors";

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const AGE_GROUPS = {
  toddler: { label: "Tiny Stars", range: "3-5 years", emoji: "⭐" },
  early: { label: "Little Explorers", range: "6-7 years", emoji: "🔭" },
  middle: { label: "Super Learners", range: "8-10 years", emoji: "🚀" },
  upper: { label: "Brain Champions", range: "11-12 years", emoji: "🏆" },
} as const;

export const ACTIVITY_META = {
  quiz: { label: "Quiz Time", labelHindi: "क्विज़", emoji: "🧠", duration: "3 min" },
  story: { label: "Story World", labelHindi: "कहानी", emoji: "📖", duration: "5 min" },
  math: { label: "Math Magic", labelHindi: "गणित", emoji: "🔢", duration: "4 min" },
  drawing: { label: "Art Studio", labelHindi: "चित्रकारी", emoji: "🎨", duration: "Free" },
  meditation: { label: "Calm & Focus", labelHindi: "ध्यान", emoji: "🧘", duration: "3 min" },
  hindi: { label: "Hindi Padho", labelHindi: "हिंदी", emoji: "क", duration: "4 min" },
  english: { label: "English Fun", labelHindi: "अंग्रेजी", emoji: "A", duration: "4 min" },
} as const;
