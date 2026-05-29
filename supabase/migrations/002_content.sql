-- ============================================
-- Rhyme Videos (Age-tagged content)
-- ============================================
CREATE TABLE IF NOT EXISTS rhyme_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hindi TEXT,
  youtube_id TEXT NOT NULL,
  thumbnail_emoji TEXT DEFAULT '🎵',
  age_groups TEXT[] DEFAULT '{"baby","explorer","champion"}',
  category TEXT DEFAULT 'rhymes' CHECK (category IN ('rhymes','animals','abc','stories','hindi','english','math')),
  language TEXT DEFAULT 'hindi' CHECK (language IN ('hindi','english','both')),
  duration_seconds INTEGER DEFAULT 120,
  xp_reward INTEGER DEFAULT 20,
  has_quiz BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rhyme_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Videos are publicly readable" ON rhyme_videos;
CREATE POLICY "Videos are publicly readable" ON rhyme_videos FOR SELECT USING (true);

-- Seed videos
INSERT INTO rhyme_videos
  (title, title_hindi, youtube_id, thumbnail_emoji, age_groups, category, language, duration_seconds, xp_reward, has_quiz, sort_order)
VALUES
  ('Ek Mota Hathi',       'एक मोटा हाथी',     'i35AUg11hvo', '🐘', '{"baby","explorer"}',            'rhymes',  'hindi',   183, 15, false, 1),
  ('Machli Jal Ki Rani',  'मछली जल की रानी',  'eIUFnHPaOc',  '🐟', '{"baby","explorer"}',            'animals', 'hindi',   120, 15, false, 2),
  ('Chanda Mama',         'चंदा मामा',         'zzIUFnHPaOc', '🌙', '{"baby","explorer"}',            'rhymes',  'hindi',   150, 15, false, 3),
  ('Lakdi Ki Kathi',      'लकड़ी की काठी',     'P2r7LoytBfo', '🏇', '{"explorer","champion"}',        'rhymes',  'hindi',   194, 20, true,  4),
  ('Johny Johny Yes Papa','Johny Johny',        'mYlDnAkwhjM', '👶', '{"baby","explorer"}',            'rhymes',  'english', 122, 20, true,  5),
  ('Twinkle Twinkle',     'टिमटिम तारे',       '90g8cLhvomE', '⭐', '{"baby","explorer","champion"}', 'rhymes',  'english', 125, 20, true,  6),
  ('Baa Baa Black Sheep', 'काली भेड़',          'MIZbUhVNzRs', '🐑', '{"explorer","champion"}',        'rhymes',  'english', 113, 25, true,  7),
  ('Old MacDonald',       'किसान का खेत',      'acRSa-5C3Nk', '🐄', '{"explorer","champion"}',        'animals', 'english', 175, 25, true,  8),
  ('Wheels on the Bus',   'बस के पहिये',       '_gvJCXdxvIY', '🚌', '{"explorer","champion"}',        'rhymes',  'english', 146, 25, true,  9)
ON CONFLICT DO NOTHING;

-- ============================================
-- Video Quiz Questions
-- ============================================
CREATE TABLE IF NOT EXISTS video_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES rhyme_videos(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_hindi TEXT,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  question_emoji TEXT DEFAULT '🤔',
  age_groups TEXT[] DEFAULT '{"explorer","champion"}'
);

ALTER TABLE video_quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Quizzes are publicly readable" ON video_quizzes;
CREATE POLICY "Quizzes are publicly readable" ON video_quizzes FOR SELECT USING (true);
