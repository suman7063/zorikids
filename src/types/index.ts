export type AgeGroup = "toddler" | "early" | "middle" | "upper";

export type ActivityType =
  | "quiz"
  | "story"
  | "math"
  | "drawing"
  | "meditation"
  | "hindi"
  | "english";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  age_group: AgeGroup;
  avatar_emoji: string;
  avatar_color: string;
  interests: string[];
  preferred_language: "hindi" | "english" | "both";
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  title_hindi: string;
  type: ActivityType;
  duration_minutes: number;
  difficulty: DifficultyLevel;
  age_group: AgeGroup[];
  thumbnail_url?: string;
  description: string;
  content: ActivityContent;
  xp_reward: number;
  is_premium: boolean;
}

export interface ActivityContent {
  questions?: QuizQuestion[];
  story?: StoryContent;
  math_problems?: MathProblem[];
  meditation?: MeditationContent;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  image_url?: string;
}

export interface StoryContent {
  pages: StoryPage[];
  audio_url?: string;
}

export interface StoryPage {
  text: string;
  image_url?: string;
}

export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  options: number[];
  hint?: string;
}

export interface MeditationContent {
  duration_seconds: number;
  instructions: string[];
  background_sound?: string;
}

export interface ChildProgress {
  id: string;
  child_id: string;
  activity_id: string;
  completed: boolean;
  score?: number;
  xp_earned: number;
  completed_at: string;
}

export interface Badge {
  id: string;
  name: string;
  name_hindi: string;
  description: string;
  emoji: string;
  requirement_type: string;
  requirement_value: number;
  color: string;
}

export interface ChildBadge {
  id: string;
  child_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface Streak {
  id: string;
  child_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

export interface ScreenTimeLog {
  id: string;
  child_id: string;
  date: string;
  minutes_used: number;
  session_start: string;
  session_end?: string;
}

export interface ParentSettings {
  id: string;
  parent_id: string;
  daily_limit_minutes: number;
  break_reminder_minutes: number;
  eye_protection_mode: boolean;
  allowed_content_types: ActivityType[];
  pin: string;
}
