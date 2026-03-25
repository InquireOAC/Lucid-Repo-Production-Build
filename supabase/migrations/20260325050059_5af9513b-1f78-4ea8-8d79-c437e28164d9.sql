
-- Academy: user_progress
CREATE TABLE public.academy_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_tier INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_journal_date DATE,
  streak_multiplier DECIMAL(3,1) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Academy: modules
CREATE TABLE public.academy_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  track TEXT NOT NULL CHECK (track IN ('lucid_dreaming', 'astral_projection')),
  tier_required INTEGER NOT NULL,
  prerequisite_module_id TEXT REFERENCES public.academy_modules(id),
  lesson_count INTEGER NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Academy: lessons
CREATE TABLE public.academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]',
  practice_tasks JSONB NOT NULL DEFAULT '[]',
  quiz_questions JSONB NOT NULL DEFAULT '[]',
  technique_markers JSONB,
  xp_reward INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, lesson_number)
);

-- Academy: user_lesson_progress
CREATE TABLE public.academy_user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.academy_modules(id),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','learning','practicing','logging','quizzing','completed','failed')),
  cards_viewed INTEGER DEFAULT 0,
  practice_completed BOOLEAN DEFAULT false,
  dream_logged BOOLEAN DEFAULT false,
  quiz_score DECIMAL(5,2),
  quiz_passed BOOLEAN DEFAULT false,
  xp_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Academy: user_module_progress
CREATE TABLE public.academy_user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL REFERENCES public.academy_modules(id) ON DELETE CASCADE,
  lessons_completed INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Academy: badges
CREATE TABLE public.academy_badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('milestone','streak','technique','tier','social')),
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Academy: user_badges
CREATE TABLE public.academy_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id TEXT NOT NULL REFERENCES public.academy_badges(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Academy: xp_transactions
CREATE TABLE public.academy_xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  multiplier DECIMAL(3,1) DEFAULT 1.0,
  final_amount INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('lesson','quiz','module_complete','dream_log','lucid_dream','challenge','streak_bonus')),
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Academy: weekly_challenges
CREATE TABLE public.academy_weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  verification_keywords JSONB NOT NULL DEFAULT '[]',
  min_tier INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  xp_reward INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Academy: user_challenge_progress
CREATE TABLE public.academy_user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.academy_weekly_challenges(id),
  completed BOOLEAN DEFAULT false,
  dream_entry_id UUID,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.academy_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS: Reference tables (modules, lessons, badges, challenges) - readable by all
CREATE POLICY "Anyone can read modules" ON public.academy_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can read lessons" ON public.academy_lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can read badges" ON public.academy_badges FOR SELECT USING (true);
CREATE POLICY "Anyone can read challenges" ON public.academy_weekly_challenges FOR SELECT USING (true);

-- RLS: User-owned tables
CREATE POLICY "Users read own progress" ON public.academy_user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.academy_user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.academy_user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own lesson progress" ON public.academy_user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lesson progress" ON public.academy_user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own lesson progress" ON public.academy_user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own module progress" ON public.academy_user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own module progress" ON public.academy_user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own module progress" ON public.academy_user_module_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own badges" ON public.academy_user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON public.academy_user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own xp" ON public.academy_xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp" ON public.academy_xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own challenge progress" ON public.academy_user_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own challenge progress" ON public.academy_user_challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own challenge progress" ON public.academy_user_challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- Seed modules (9 LD + placeholder AP)
INSERT INTO public.academy_modules (id, title, description, track, tier_required, prerequisite_module_id, lesson_count, icon, sort_order) VALUES
('dream_recall', 'Dream Recall Training', 'Journaling methods, wake-back timing, memory anchoring, sleep position effects, dream fragment assembly', 'lucid_dreaming', 1, NULL, 5, '📓', 1),
('reality_testing', 'Reality Testing', 'Nose pinch, hand check, text reading, light switches, building the habit loop', 'lucid_dreaming', 1, NULL, 4, '🔍', 2),
('dream_signs', 'Dream Signs', 'Personal sign identification, pattern recognition across entries, building a sign catalog', 'lucid_dreaming', 2, 'dream_recall', 4, '🔮', 3),
('mild', 'MILD Technique', 'Mnemonic induction, intention phrasing, visualization rehearsal, prospective memory training, pre-sleep protocol', 'lucid_dreaming', 2, 'reality_testing', 6, '🧠', 4),
('wbtb', 'WBTB Method', 'Optimal wake timing, alarm strategies, activity during wake period, combining with MILD/WILD', 'lucid_dreaming', 3, 'mild', 5, '⏰', 5),
('wild', 'WILD Technique', 'Hypnagogic awareness, body scanning, transition signals, sleep paralysis navigation, maintaining consciousness', 'lucid_dreaming', 3, 'wbtb', 7, '🌊', 6),
('dream_stabilization', 'Dream Stabilization', 'Grounding techniques, sensory engagement, hand rubbing, spinning method, verbal commands', 'lucid_dreaming', 3, 'mild', 5, '⚓', 7),
('dream_control', 'Dream Control', 'Flying mechanics, teleportation, object manifestation, NPC interaction, scene shifting, time manipulation', 'lucid_dreaming', 4, 'dream_stabilization', 8, '🎮', 8),
('dream_incubation', 'Dream Incubation', 'Pre-sleep visualization, target scene programming, intention loops, success verification', 'lucid_dreaming', 4, 'dream_signs', 5, '🌱', 9);

-- Seed badges
INSERT INTO public.academy_badges (id, name, description, category, icon) VALUES
('dream_novice', 'Dream Novice', 'Log your first dream', 'milestone', '📝'),
('week_warrior', 'Week Warrior', '7-day journal streak', 'streak', '🔥'),
('moon_keeper', 'Moon Keeper', '30-day journal streak', 'streak', '🌙'),
('reality_hacker', 'Reality Hacker', 'Complete Reality Testing module', 'technique', '🔍'),
('first_lucid', 'First Lucid', 'Log first AI-verified lucid dream', 'milestone', '✨'),
('mild_master', 'MILD Master', 'Complete MILD module', 'technique', '🧠'),
('wild_one', 'Wild One', 'Complete WILD module', 'technique', '🌊'),
('dream_walker', 'Dream Walker', 'Reach Lucid Explorer tier', 'tier', '🚶'),
('oneironaut', 'Oneironaut', 'Reach Oneironaut tier', 'tier', '🧑‍🚀'),
('dream_architect', 'Dream Architect', 'Reach Astral Architect tier', 'tier', '🏗️'),
('challenge_champion', 'Challenge Champion', 'Complete 5 weekly challenges', 'social', '🏆'),
('dream_sharer', 'Dream Sharer', 'Share 10 dreams publicly', 'social', '🤝');

-- Seed lessons for Dream Recall Training (5 lessons)
INSERT INTO public.academy_lessons (module_id, lesson_number, title, cards, practice_tasks, quiz_questions, technique_markers) VALUES
('dream_recall', 1, 'Why We Forget Dreams',
 '[{"title":"The Forgetting Curve","body":"Within 5 minutes of waking, you lose 50% of dream content. After 10 minutes, 90% is gone. This isn''t a flaw — your brain is designed to forget dreams to prevent confusion with real memories."},{"title":"Memory Anchoring","body":"The key to dream recall is catching memories before they dissolve. Your first conscious thought upon waking determines whether you remember. Moving, checking your phone, or thinking about the day ahead all accelerate forgetting."},{"title":"The Stillness Technique","body":"When you wake up, don''t move. Keep your eyes closed. Replay whatever fragments you remember. Even a single image or emotion is enough to start pulling the thread. The more you practice, the more detail you''ll recover."}]',
 '[{"task":"Set an alarm 15 minutes early tomorrow and practice the Stillness Technique upon waking"},{"task":"Keep a notebook or phone within arm''s reach of your bed tonight"},{"task":"Before sleep tonight, tell yourself: I will remember my dreams when I wake up"}]',
 '[{"question":"What percentage of dream content is lost within 5 minutes of waking?","options":["10%","25%","50%","75%"],"correct_index":2},{"question":"What is the most important thing to do when you first wake up for dream recall?","options":["Check your phone","Stay still with eyes closed","Drink water","Stretch your body"],"correct_index":1},{"question":"Why does the brain naturally forget dreams?","options":["Dreams are meaningless","To prevent confusion with real memories","The brain runs out of storage","Dreams only exist during deep sleep"],"correct_index":1}]',
 '["dream recall", "remember", "journal", "wrote down", "fragments"]'),

('dream_recall', 2, 'Setting Up Your Dream Journal',
 '[{"title":"Digital vs Physical","body":"Both work. A physical journal has no blue light, but a phone app lets you record audio notes. The best journal is the one you''ll actually use every single morning without exception."},{"title":"What to Record","body":"Write everything: scenes, people, emotions, colors, sounds, even vague feelings. Use present tense (''I am flying over a city'') to stay connected to the experience. Don''t worry about making sense — raw fragments are gold."},{"title":"The 3-Minute Rule","body":"You don''t need to write a novel. Commit to 3 minutes of writing every morning. Even two sentences like ''I was in a house. Felt anxious.'' build the neural pathways that improve recall over time."},{"title":"Tagging Your Dreams","body":"After writing, add tags: emotions, themes, recurring elements. Over weeks, patterns emerge. These patterns become your personal dream signs — the key to lucid dreaming."}]',
 '[{"task":"Log a dream in Lucid Repo right after waking tomorrow — even if it''s just fragments"},{"task":"Add at least 3 tags to your dream entry"},{"task":"Set your phone to Do Not Disturb mode before sleep tonight"}]',
 '[{"question":"What tense should you use when writing dream journal entries?","options":["Past tense","Future tense","Present tense","It doesn''t matter"],"correct_index":2},{"question":"How long should you commit to writing each morning at minimum?","options":["30 seconds","3 minutes","10 minutes","As long as possible"],"correct_index":1},{"question":"Why is tagging dreams important?","options":["For social media sharing","To identify recurring patterns and dream signs","To impress other dreamers","Tags aren''t actually important"],"correct_index":1}]',
 '["journal", "wrote", "recorded", "logged", "tags"]'),

('dream_recall', 3, 'Wake-Back Timing',
 '[{"title":"Sleep Cycles 101","body":"You cycle through sleep stages every 90 minutes. Dreams happen during REM sleep, which gets longer as the night progresses. Your most vivid, memorable dreams occur in the last 2-3 hours of sleep."},{"title":"Strategic Alarms","body":"Set an alarm 5-6 hours after falling asleep. Wake briefly (1-5 minutes), then go back to sleep with the intention to remember. This targets the longest REM periods and dramatically improves recall."},{"title":"Weekend Practice","body":"Weekends are ideal for wake-back practice since you can sleep in. The extended morning sleep often produces the most vivid and easiest-to-remember dreams. Use this time to build your recall muscles."}]',
 '[{"task":"Calculate your ideal wake-back time (5-6 hours after your usual bedtime)"},{"task":"Set a gentle alarm for your wake-back time tonight"},{"task":"When the alarm wakes you, spend 2 minutes recalling any dreams before going back to sleep"}]',
 '[{"question":"How long is a typical sleep cycle?","options":["30 minutes","60 minutes","90 minutes","120 minutes"],"correct_index":2},{"question":"When do the most vivid dreams typically occur?","options":["First hour of sleep","Middle of the night","Last 2-3 hours of sleep","They''re evenly distributed"],"correct_index":2},{"question":"How long should you stay awake during a wake-back attempt?","options":["1-5 minutes","15-20 minutes","30 minutes","1 hour"],"correct_index":0}]',
 '["alarm", "wake", "REM", "sleep cycle", "recall"]'),

('dream_recall', 4, 'Sleep Position & Environment',
 '[{"title":"Position Matters","body":"Many dreamers report more vivid dreams when sleeping on their back. Side sleeping can also work well. Find what works for you by tracking your sleep position alongside your dream entries for a week."},{"title":"Your Sleep Sanctuary","body":"A cool, dark room promotes better REM sleep. Remove screens 30 minutes before bed. Consider using a sleep mask if your room isn''t dark enough. White noise can help if you''re in a noisy environment."},{"title":"Pre-Sleep Ritual","body":"Consistency signals your brain that it''s time for dreams. A 10-minute wind-down routine — dim lights, light stretching, setting your dream intention — creates a reliable bridge between waking and dreaming life."}]',
 '[{"task":"Track your sleep position tonight and note it in your dream journal tomorrow"},{"task":"Remove all screens from reach 30 minutes before bed tonight"},{"task":"Create a simple 3-step pre-sleep ritual and practice it tonight"}]',
 '[{"question":"What room temperature is best for vivid dreaming?","options":["Warm","Cool","Hot","Temperature doesn''t matter"],"correct_index":1},{"question":"How far before bed should you stop using screens?","options":["5 minutes","15 minutes","30 minutes","2 hours"],"correct_index":2},{"question":"Why does a consistent pre-sleep ritual help with dreaming?","options":["It makes you tired faster","It signals your brain that it''s time for dreams","It reduces nightmares","It only works for lucid dreaming"],"correct_index":1}]',
 '["sleep position", "bedroom", "dark room", "ritual", "wind down"]'),

('dream_recall', 5, 'Dream Fragment Assembly',
 '[{"title":"Working With Fragments","body":"Most mornings you won''t remember a full dream narrative. That''s normal. A color, a face, an emotion — these fragments are the raw material. Your job is to write them down and let your memory fill in gaps over the day."},{"title":"The Chain Technique","body":"Start with any fragment and ask: what came before this? What came after? Often, pulling one thread unravels the whole dream. Don''t force it — gently explore each fragment like turning a stone over in your hand."},{"title":"Delayed Recall","body":"Dreams sometimes resurface hours later — triggered by a sight, smell, or situation. Keep your journal app handy. When a dream memory pops up during the day, record it immediately. These delayed fragments are often the most meaningful."}]',
 '[{"task":"Tomorrow morning, write down at least 3 dream fragments, even single words or images"},{"task":"Use the Chain Technique on your strongest fragment to reconstruct more of the dream"},{"task":"Keep Lucid Repo open on your phone today and log any delayed dream memories that surface"}]',
 '[{"question":"What should you do when you only remember dream fragments?","options":["Ignore them — only full dreams count","Write them down immediately","Wait until you remember more","Try to force the full memory"],"correct_index":1},{"question":"What is the Chain Technique?","options":["Linking multiple dreams together","Starting with a fragment and asking what came before/after","Writing dreams in chronological order","A meditation technique"],"correct_index":1},{"question":"When might dream memories resurface during the day?","options":["Never — dreams are only recalled upon waking","Only during meditation","Triggered by sights, smells, or situations","Only when you''re tired"],"correct_index":2}]',
 '["fragments", "recalled later", "partial memory", "chain technique"]');

-- Seed lessons for Reality Testing (4 lessons)
INSERT INTO public.academy_lessons (module_id, lesson_number, title, cards, practice_tasks, quiz_questions, technique_markers) VALUES
('reality_testing', 1, 'Introduction to Reality Checks',
 '[{"title":"What Is a Reality Check?","body":"A reality check is a test you perform to determine whether you''re awake or dreaming. In dreams, certain physical laws break down. By habitually testing reality during the day, you''ll eventually do it in a dream — and realize you''re dreaming."},{"title":"The Habit Loop","body":"Reality checks work through habit. Perform them 10-15 times daily until they become automatic. The goal is to make checking reality so routine that your dreaming mind does it too. Consistency beats intensity."},{"title":"Critical Awareness","body":"Don''t just mechanically do checks — genuinely question your reality each time. Ask yourself: could this be a dream? Look around for anything unusual. This mindset of genuine questioning is what transfers into dreams."}]',
 '[{"task":"Perform 10 reality checks today, spread throughout your waking hours"},{"task":"Set 5 hourly reminders on your phone to prompt reality checks"},{"task":"Each time you do a reality check, genuinely ask: Am I dreaming right now?"}]',
 '[{"question":"What is the primary purpose of reality checks?","options":["To reduce anxiety","To determine if you''re dreaming","To improve focus","To help you fall asleep"],"correct_index":1},{"question":"How many reality checks should you aim for daily?","options":["1-2","5-7","10-15","50+"],"correct_index":2},{"question":"What mindset should accompany each reality check?","options":["Mechanical repetition","Genuine questioning of reality","Relaxation","Visualization"],"correct_index":1}]',
 '["reality check", "am I dreaming", "checked hands", "nose pinch"]'),

('reality_testing', 2, 'The Nose Pinch Test',
 '[{"title":"How It Works","body":"Pinch your nose shut and try to breathe through it. In waking life, you can''t breathe. In a dream, air flows right through your pinched nose. It''s the most reliable reality check because it produces an unmistakable physical sensation."},{"title":"Why It''s Reliable","body":"Unlike visual checks, the nose pinch engages your body awareness, which dreams simulate poorly. The feeling of breathing through a closed nose is so surprising that it almost always triggers lucidity."},{"title":"Making It a Habit","body":"Pair the nose pinch with everyday triggers: every time you walk through a doorway, check your phone, or drink water. Link the check to activities you do 10+ times daily. Within a week, it becomes second nature."}]',
 '[{"task":"Practice the nose pinch reality check every time you walk through a doorway today"},{"task":"Perform the nose pinch test right now — genuinely try to breathe through your pinched nose"},{"task":"Log in your dream journal tonight whether you did any reality checks in your dreams"}]',
 '[{"question":"What happens when you nose-pinch reality check in a dream?","options":["Nothing — it works the same as waking","You can breathe through your pinched nose","Your nose disappears","You wake up immediately"],"correct_index":1},{"question":"Why is the nose pinch considered the most reliable reality check?","options":["It''s the easiest to remember","It engages body awareness that dreams simulate poorly","It was invented by scientists","It works 100% of the time"],"correct_index":1},{"question":"What is the best way to build a reality check habit?","options":["Do 100 checks in one hour","Pair it with existing daily activities","Only do it before bed","Practice once a week"],"correct_index":1}]',
 '["nose pinch", "breathe", "pinched nose", "reality check"]'),

('reality_testing', 3, 'Hand & Text Checks',
 '[{"title":"The Hand Check","body":"Look at your hands carefully. Count your fingers. In dreams, hands often look distorted — extra fingers, blurry edges, changing shapes. If your hands look wrong, you''re dreaming. This check has been used by lucid dreamers for decades."},{"title":"The Text Check","body":"Read some text, look away, then read it again. In dreams, text changes between readings. Signs, books, clocks — all are unstable in dreams. If the text shifts or becomes gibberish on second reading, you''re in a dream."},{"title":"Combining Checks","body":"Use multiple checks together for higher reliability. Nose pinch + hand check is a powerful combination. If one fails (rare), the other catches it. Build a personal routine: pinch nose → check hands → read nearby text."}]',
 '[{"task":"Look at your hands right now. Count your fingers slowly. Practice this 5 times today."},{"task":"Find some text (sign, book, phone screen). Read it, look away, read again. Do this 3 times today."},{"task":"Create your personal reality check combo routine and practice it 8 times today"}]',
 '[{"question":"What commonly happens to hands in dreams?","options":["They glow","They have extra fingers or look distorted","They become invisible","Nothing different"],"correct_index":1},{"question":"What happens to text in dreams when you read it twice?","options":["It stays the same","It gets clearer","It changes or becomes gibberish","It disappears"],"correct_index":2},{"question":"Why should you combine multiple reality checks?","options":["To waste more time","For higher reliability — if one fails, another catches it","Because single checks never work","To impress other dreamers"],"correct_index":1}]',
 '["hands", "fingers", "text", "reading", "looked at hands"]'),

('reality_testing', 4, 'Building Your Reality Check Routine',
 '[{"title":"Trigger Stacking","body":"Choose 5 daily triggers: walking through doors, drinking water, hearing your name, checking time, sitting down. Attach your reality check routine to each. Within 2 weeks, checking reality becomes as automatic as breathing."},{"title":"Quality Over Quantity","body":"10 mindful reality checks beat 50 mechanical ones. Each check should take 5-10 seconds of genuine questioning. Really look at your hands. Really try to breathe through your pinched nose. Feel the question: is this real?"},{"title":"Tracking Your Practice","body":"Log your reality checks in Lucid Repo. Note how many you did, which triggers worked best, and whether any checks felt particularly vivid or unusual. This data helps you optimize your practice over time."}]',
 '[{"task":"Choose 5 specific daily triggers for your reality checks and write them down"},{"task":"Perform at least 12 mindful reality checks today using your chosen triggers"},{"task":"Log your reality check count and best triggers in your dream journal tonight"}]',
 '[{"question":"How many daily triggers should you initially choose for reality checks?","options":["1","3","5","10"],"correct_index":2},{"question":"What matters more for reality check effectiveness?","options":["Doing as many as possible","Quality and genuine questioning","Speed of the check","Doing them at the same time daily"],"correct_index":1},{"question":"Why should you track your reality check practice?","options":["For social media content","To optimize which triggers work best","Because it''s required","To compete with others"],"correct_index":1}]',
 '["reality check", "trigger", "routine", "habit", "practice"]');

-- Seed a sample weekly challenge
INSERT INTO public.academy_weekly_challenges (title, description, verification_keywords, min_tier, start_date, end_date, xp_reward) VALUES
('Find Your Hands', 'Look at your hands in a dream tonight. Notice their shape, count your fingers, and observe any differences from waking life.', '["hands", "fingers", "looked at", "hand check", "counted fingers"]', 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 30);
