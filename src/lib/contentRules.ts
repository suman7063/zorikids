import type { AgeWorld } from "../theme/ageThemes";

// Hardcoded rules — kis age ko kya dikhana/chhupaana hai
export const CONTENT_RULES: Record<AgeWorld, {
  showQuiz: boolean;
  showMath: boolean;
  showDrawing: boolean;
  showMeditation: boolean;
  showHindi: boolean;
  showEnglish: boolean;
  showRhymes: boolean;
  showStories: boolean;
  maxVideoDuration: number;   // seconds
  quizOptions: number;        // 2 for baby, 3 for explorer, 4 for champion
  quizTimer: number;          // seconds per question
  audioAutoPlay: boolean;
  showTextLabels: boolean;
  buttonSize: "xl" | "lg" | "md";
}> = {
  baby: {
    showQuiz:        false,   // 2-3 saal ke bachche quiz nahi kar sakte
    showMath:        false,
    showDrawing:     true,    // Sirf color/tap drawing
    showMeditation:  false,
    showHindi:       false,
    showEnglish:     false,
    showRhymes:      true,    // Main content
    showStories:     false,
    maxVideoDuration: 180,    // Max 3 minutes
    quizOptions:     2,
    quizTimer:       30,
    audioAutoPlay:   true,    // Auto play sound
    showTextLabels:  false,   // Sirf emojis/images
    buttonSize:      "xl",    // Bahut bade buttons
  },

  explorer: {
    showQuiz:        true,    // Simple 3-option quiz
    showMath:        true,    // Basic 1+1=? type
    showDrawing:     true,
    showMeditation:  true,    // Short breathing exercises
    showHindi:       true,    // Basic Hindi words
    showEnglish:     true,    // ABC, simple words
    showRhymes:      true,
    showStories:     true,    // Short stories (3-5 min)
    maxVideoDuration: 300,    // Max 5 minutes
    quizOptions:     3,
    quizTimer:       20,
    audioAutoPlay:   false,
    showTextLabels:  true,
    buttonSize:      "lg",
  },

  champion: {
    showQuiz:        true,
    showMath:        true,    // Advanced math
    showDrawing:     true,
    showMeditation:  true,
    showHindi:       true,    // Full Hindi reading
    showEnglish:     true,    // Full English
    showRhymes:      true,
    showStories:     true,    // Long stories
    maxVideoDuration: 600,    // Max 10 minutes
    quizOptions:     4,
    quizTimer:       15,      // Less time = more challenge
    audioAutoPlay:   false,
    showTextLabels:  true,
    buttonSize:      "md",
  },
};

// Helper: Is activity allowed for this age world?
export function isAllowed(world: AgeWorld, type: string): boolean {
  const rules = CONTENT_RULES[world];
  const map: Record<string, boolean> = {
    quiz:       rules.showQuiz,
    math:       rules.showMath,
    drawing:    rules.showDrawing,
    meditation: rules.showMeditation,
    hindi:      rules.showHindi,
    english:    rules.showEnglish,
    rhymes:     rules.showRhymes,
    story:      rules.showStories,
  };
  return map[type] ?? true;
}
