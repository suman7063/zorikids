-- KiddoLearn Database Schema
-- Run this in your Supabase SQL editor

-- ============================================
-- 1. Profiles (Parent users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ============================================
-- 2. Children
-- ============================================
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 3 AND 12),
  age_group TEXT NOT NULL CHECK (age_group IN ('toddler', 'early', 'middle', 'upper')),
  avatar_emoji TEXT DEFAULT '🐻',
  avatar_color TEXT DEFAULT '#7C5CBF',
  interests TEXT[] DEFAULT '{}',
  preferred_language TEXT DEFAULT 'both' CHECK (preferred_language IN ('hindi', 'english', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can manage their children" ON children
  USING (parent_id = auth.uid());

-- ============================================
-- 3. Activities (Content catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hindi TEXT,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'story', 'math', 'drawing', 'meditation', 'hindi', 'english')),
  duration_minutes INTEGER DEFAULT 3,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  age_groups TEXT[] DEFAULT '{"toddler","early","middle","upper"}',
  description TEXT,
  content JSONB,
  xp_reward INTEGER DEFAULT 30,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities are public to read
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities are publicly readable" ON activities FOR SELECT USING (true);

-- ============================================
-- 4. Child Progress
-- ============================================
CREATE TABLE IF NOT EXISTS child_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE child_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view child progress" ON child_progress
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can insert child progress" ON child_progress FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- ============================================
-- 5. Badges
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_hindi TEXT,
  description TEXT,
  emoji TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  color TEXT DEFAULT '#7C5CBF'
);

-- Insert default badges
INSERT INTO badges (name, name_hindi, description, emoji, requirement_type, requirement_value, color) VALUES
  ('First Star', 'पहला सितारा', 'Complete your first activity', '🌟', 'activities_count', 1, '#F59E0B'),
  ('Hot Streak', 'लगातार 3 दिन', 'Learn 3 days in a row', '🔥', 'streak_days', 3, '#F97316'),
  ('Quiz Master', 'क्विज़ मास्टर', 'Complete 5 quizzes', '🧠', 'quiz_count', 5, '#7C5CBF'),
  ('Story Lover', 'कहानी प्रेमी', 'Read 3 stories', '📖', 'story_count', 3, '#0EA5E9'),
  ('Math Wizard', 'गणित जादूगर', 'Complete 5 math games', '🔢', 'math_count', 5, '#059669'),
  ('Little Artist', 'छोटा कलाकार', 'Draw 3 pictures', '🎨', 'drawing_count', 3, '#EC4899'),
  ('Zen Kid', 'शांत बच्चा', 'Complete 3 meditations', '🧘', 'meditation_count', 3, '#6366F1'),
  ('Champion', 'चैंपियन', 'Earn 500 XP total', '🏆', 'total_xp', 500, '#D97706'),
  ('Rocket Learner', 'रॉकेट लर्नर', '7-day streak', '🚀', 'streak_days', 7, '#8B5CF6'),
  ('Diamond Kid', 'हीरा बच्चा', 'Earn 1000 XP', '💎', 'total_xp', 1000, '#0EA5E9')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. Child Badges (earned)
-- ============================================
CREATE TABLE IF NOT EXISTS child_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, badge_id)
);

ALTER TABLE child_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view child badges" ON child_badges
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- ============================================
-- 7. Streaks
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(child_id)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can manage streaks" ON streaks
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- ============================================
-- 8. Screen Time Logs
-- ============================================
CREATE TABLE IF NOT EXISTS screen_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_used INTEGER DEFAULT 0,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE screen_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view screen time" ON screen_time_logs
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- ============================================
-- 9. Parent Settings
-- ============================================
CREATE TABLE IF NOT EXISTS parent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  daily_limit_minutes INTEGER DEFAULT 30,
  break_reminder_minutes INTEGER DEFAULT 20,
  eye_protection_mode BOOLEAN DEFAULT FALSE,
  allowed_content_types TEXT[] DEFAULT '{"quiz","story","math","drawing","meditation","hindi","english"}',
  pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id)
);

ALTER TABLE parent_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can manage own settings" ON parent_settings
  USING (parent_id = auth.uid());

-- ============================================
-- Helper function: Update streak
-- ============================================
CREATE OR REPLACE FUNCTION update_child_streak(p_child_id UUID)
RETURNS VOID LANGUAGE PLPGSQL AS $$
DECLARE
  v_streak RECORD;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT * INTO v_streak FROM streaks WHERE child_id = p_child_id;

  IF NOT FOUND THEN
    INSERT INTO streaks (child_id, current_streak, longest_streak, last_active_date)
    VALUES (p_child_id, 1, 1, v_today);
    RETURN;
  END IF;

  IF v_streak.last_active_date = v_today THEN
    RETURN; -- Already updated today
  ELSIF v_streak.last_active_date = v_today - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE streaks SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_active_date = v_today
    WHERE child_id = p_child_id;
  ELSE
    -- Streak broken
    UPDATE streaks SET
      current_streak = 1,
      last_active_date = v_today
    WHERE child_id = p_child_id;
  END IF;
END;
$$;
