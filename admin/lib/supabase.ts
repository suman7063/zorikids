import { createClient } from "@supabase/supabase-js";

// Admin client — service role key, RLS bypass karta hai
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
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
