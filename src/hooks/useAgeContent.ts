import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAgeTheme } from "./useAgeTheme";
import { isAllowed, CONTENT_RULES } from "../lib/contentRules";

export type RhymeVideo = {
  id: string;
  title: string;
  title_hindi: string;
  youtube_id: string;
  thumbnail_emoji: string;
  category: string;
  language: string;
  duration_seconds: number;
  xp_reward: number;
  has_quiz: boolean;
};

export function useAgeContent() {
  const { world, theme } = useAgeTheme();
  const rules = CONTENT_RULES[world];

  const [videos, setVideos]   = useState<RhymeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [world]);

  async function fetchVideos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rhyme_videos")
      .select("*")
      .contains("age_groups", [world])   // Only videos tagged for this world
      .eq("is_active", true)
      .order("sort_order");

    if (!error && data) setVideos(data);
    setLoading(false);
  }

  // Filter activity types by hardcoded rules
  function getAllowedActivities(types: string[]): string[] {
    return types.filter((t) => isAllowed(world, t));
  }

  return {
    videos,
    loading,
    rules,
    world,
    theme,
    getAllowedActivities,
    // Quick booleans from rules
    showQuiz:       rules.showQuiz,
    showMath:       rules.showMath,
    showRhymes:     rules.showRhymes,
    showStories:    rules.showStories,
    quizOptions:    rules.quizOptions,
    quizTimer:      rules.quizTimer,
    buttonSize:     rules.buttonSize,
    showTextLabels: rules.showTextLabels,
    audioAutoPlay:  rules.audioAutoPlay,
  };
}
