import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Animal = {
  id: string;
  key: string;
  name_hi: string;
  name_en: string;
  sound_word: string;
  emoji: string;
  bg: string;
  accent: string;
  video_url: string | null;
  sound_url: string | null;
  is_published: boolean;
  created_at: string;
};
