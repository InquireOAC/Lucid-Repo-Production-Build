-- Phase 1: Create new learning system architecture

-- 1. Create learning_paths table (4 main paths)
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create path_levels table (replaces learning_levels with path association)
CREATE TABLE path_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_required INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path_id, level_number)
);

-- 3. Create user_path_progress table (tracks per-path progress)
CREATE TABLE user_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

-- 4. Create practice_types table
CREATE TABLE practice_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 5,
  category TEXT NOT NULL,
  requires_timer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create daily_practice_log table
CREATE TABLE daily_practice_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_type_id UUID REFERENCES practice_types(id),
  path_id UUID REFERENCES learning_paths(id),
  level_id UUID REFERENCES path_levels(id),
  duration_minutes INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create lesson_completions table
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id UUID REFERENCES path_levels(id),
  lesson_type TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id, lesson_id)
);

-- 7. Update learning_achievements to support path categorization
ALTER TABLE learning_achievements 
ADD COLUMN IF NOT EXISTS path_id UUID REFERENCES learning_paths(id),
ADD COLUMN IF NOT EXISTS category TEXT;

-- 8. Update learning_progress to track multiple paths
ALTER TABLE learning_progress
ADD COLUMN IF NOT EXISTS dream_recall_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS lucid_dreaming_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS obe_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS meditation_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS dream_recall_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lucid_dreaming_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS obe_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS meditation_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_practice_date DATE;

-- Enable RLS on all new tables
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_practice_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_paths (public read)
CREATE POLICY "Anyone can view learning paths"
ON learning_paths FOR SELECT
USING (true);

-- RLS Policies for path_levels (public read)
CREATE POLICY "Anyone can view path levels"
ON path_levels FOR SELECT
USING (true);

-- RLS Policies for user_path_progress
CREATE POLICY "Users can view their own path progress"
ON user_path_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own path progress"
ON user_path_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own path progress"
ON user_path_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for practice_types (public read)
CREATE POLICY "Anyone can view practice types"
ON practice_types FOR SELECT
USING (true);

-- RLS Policies for daily_practice_log
CREATE POLICY "Users can view their own practice logs"
ON daily_practice_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice logs"
ON daily_practice_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice logs"
ON daily_practice_log FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for lesson_completions
CREATE POLICY "Users can view their own lesson completions"
ON lesson_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson completions"
ON lesson_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Seed initial data: 4 Learning Paths
INSERT INTO learning_paths (name, title, description, icon, order_index) VALUES
('dream_recall', 'Dream Recall Mastery', 'Master the ability to remember multiple dreams per night with vivid detail. Build the foundation for all dream work.', '📔', 1),
('lucid_dreaming', 'Lucid Dreaming Mastery', 'Achieve consistent lucidity, stabilization, and control. Progress to advanced OBE exit techniques from lucid dreams.', '✨', 2),
('obe', 'Vibrational State & OBE Mastery', 'Master direct OBE projection via the vibrational state. Learn Robert Monroe''s techniques for out-of-body experiences.', '🌌', 3),
('meditation', 'Energy Meditation Mastery', 'Develop meditation skills for dream work, culminating in energy sensing and manipulation abilities.', '🧘', 4);

-- Seed initial data: Practice Types
INSERT INTO practice_types (name, display_name, xp_reward, category, requires_timer) VALUES
('dream_journal', 'Dream Journal Entry', 5, 'journaling', false),
('dream_journal_detailed', 'Detailed Dream Journal (200+ words)', 10, 'journaling', false),
('reality_check', 'Reality Check', 3, 'awareness', false),
('meditation_5min', 'Meditation Session (5 min)', 5, 'meditation', true),
('meditation_10min', 'Meditation Session (10 min)', 10, 'meditation', true),
('meditation_20min', 'Meditation Session (20+ min)', 20, 'meditation', true),
('wbtb_attempt', 'WBTB Attempt', 10, 'technique', false),
('lucid_dream', 'Lucid Dream Achievement', 50, 'achievement', false),
('obe_experience', 'OBE Experience', 75, 'achievement', false),
('video_lesson', 'Video Lesson Completed', 8, 'learning', false),
('practice_exercise', 'Practice Exercise Completed', 10, 'learning', true),
('reading_material', 'Reading Material Completed', 8, 'learning', false);

-- Create function to update user_path_progress.updated_at
CREATE OR REPLACE FUNCTION update_path_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_path_progress
CREATE TRIGGER update_user_path_progress_timestamp
BEFORE UPDATE ON user_path_progress
FOR EACH ROW
EXECUTE FUNCTION update_path_progress_timestamp();