-- Create learning levels table
CREATE TABLE public.learning_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  xp_required integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create learning progress table
CREATE TABLE public.learning_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  current_level integer NOT NULL DEFAULT 1,
  total_xp integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create learning achievements table
CREATE TABLE public.learning_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 0,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.learning_achievements(id),
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create practice sessions table
CREATE TABLE public.practice_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_type text NOT NULL,
  level_id uuid REFERENCES public.learning_levels(id),
  duration_minutes integer,
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create learning streaks table
CREATE TABLE public.learning_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  streak_date date NOT NULL,
  activities_completed integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_date)
);

-- Enable RLS on all tables
ALTER TABLE public.learning_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for learning_levels (public read access)
CREATE POLICY "Anyone can view learning levels" 
ON public.learning_levels 
FOR SELECT 
USING (true);

-- Create RLS policies for learning_progress
CREATE POLICY "Users can view their own learning progress" 
ON public.learning_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" 
ON public.learning_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" 
ON public.learning_progress 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for learning_achievements (public read access)
CREATE POLICY "Anyone can view learning achievements" 
ON public.learning_achievements 
FOR SELECT 
USING (true);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for practice_sessions
CREATE POLICY "Users can view their own practice sessions" 
ON public.practice_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice sessions" 
ON public.practice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for learning_streaks
CREATE POLICY "Users can view their own streaks" 
ON public.learning_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.learning_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.learning_streaks 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert initial learning levels
INSERT INTO public.learning_levels (level_number, title, description, content, xp_required) VALUES
(1, 'Dream Awareness Foundations', 'Build your foundation of dream recall and awareness', 
 '{"lessons": ["Understanding Sleep Cycles", "Dream Recall Techniques", "Setting Up Your Dream Journal", "Creating the Right Environment"], "practices": ["Daily Dream Logging", "Morning Recall Ritual", "Sleep Hygiene Checklist"]}', 0),
(2, 'Dream Recognition Training', 'Learn to recognize when you are dreaming', 
 '{"lessons": ["What are Dream Signs?", "Reality Check Techniques", "Building Dream Awareness", "Digital vs Physical Reality Checks"], "practices": ["Reality Check Routine", "Dream Sign Journal", "Awareness Exercises"]}', 100),
(3, 'Intention Setting & Affirmations', 'Master the art of lucid dream programming', 
 '{"lessons": ["The Power of Intention", "Crafting Effective Affirmations", "Evening Routine Setup", "Visualization Techniques"], "practices": ["Intention Setting Ritual", "Affirmation Practice", "Pre-sleep Programming"]}', 250),
(4, 'Meditation & Relaxation', 'Develop mindfulness and relaxation skills', 
 '{"lessons": ["Progressive Muscle Relaxation", "Breathing Techniques", "Mindfulness Meditation", "Body Awareness"], "practices": ["Daily Meditation", "Relaxation Sessions", "Mindfulness Exercises"]}', 450),
(5, 'Advanced Techniques (WBTB/MILD)', 'Learn proven lucid dreaming induction methods', 
 '{"lessons": ["Wake-Back-to-Bed Method", "Mnemonic Induction Technique", "Timing Your Practice", "Combining Techniques"], "practices": ["WBTB Sessions", "MILD Practice", "Technique Experimentation"]}', 700),
(6, 'Binaural Beats & Audio Tools', 'Harness the power of sound for lucid dreaming', 
 '{"lessons": ["Understanding Brainwaves", "Binaural Beat Frequencies", "Audio-Enhanced Meditation", "Creating Sleep Soundscapes"], "practices": ["Binaural Beat Sessions", "Audio Meditation", "Sleep Sound Mixing"]}', 1000),
(7, 'Lucid Dream Control', 'Master control within your lucid dreams', 
 '{"lessons": ["Dream Stabilization", "Flying Techniques", "Dream Character Interaction", "Advanced Dream Control"], "practices": ["Stabilization Exercises", "Control Challenges", "Advanced Practices"]}', 1400);

-- Insert initial achievements
INSERT INTO public.learning_achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first learning session', '🌟', 10, 'sessions_completed', 1),
('Dream Journaler', 'Log 7 dreams in your journal', '📔', 25, 'dreams_logged', 7),
('Reality Master', 'Complete 50 reality checks', '👁️', 30, 'reality_checks', 50),
('Meditation Monk', 'Complete 10 meditation sessions', '🧘', 35, 'meditation_sessions', 10),
('Week Warrior', 'Maintain a 7-day practice streak', '🔥', 50, 'streak_days', 7),
('Lucid Beginner', 'Reach Level 2', '⭐', 40, 'level_reached', 2),
('Audio Explorer', 'Listen to 5 binaural beat sessions', '🎵', 25, 'audio_sessions', 5),
('Dream Recall Pro', 'Log 30 dreams', '🎯', 75, 'dreams_logged', 30),
('Consistency King', 'Maintain a 30-day streak', '👑', 150, 'streak_days', 30),
('Advanced Dreamer', 'Reach Level 5', '🚀', 100, 'level_reached', 5),
('Lucid Master', 'Complete all 7 levels', '🏆', 200, 'level_reached', 7),
('Daily Devotee', 'Practice for 100 days total', '💎', 250, 'total_practice_days', 100);

-- Create function to update learning progress
CREATE OR REPLACE FUNCTION public.update_learning_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user's learning progress when they complete a practice session
  INSERT INTO public.learning_progress (user_id, total_xp, last_activity_date, updated_at)
  VALUES (NEW.user_id, NEW.xp_earned, CURRENT_DATE, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_xp = learning_progress.total_xp + NEW.xp_earned,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update learning progress
CREATE TRIGGER update_learning_progress_trigger
  AFTER INSERT ON public.practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_progress();