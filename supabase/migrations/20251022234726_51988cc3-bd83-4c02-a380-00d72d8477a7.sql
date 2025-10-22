-- Seed Dream Recall Path Levels (6 levels) with detailed content

-- Get the dream_recall path_id
DO $$
DECLARE
  dream_recall_id UUID;
BEGIN
  SELECT id INTO dream_recall_id FROM learning_paths WHERE name = 'dream_recall';

  -- Level 1: Dream Journal Foundation
  INSERT INTO path_levels (path_id, level_number, title, description, xp_required, content) VALUES
  (dream_recall_id, 1, 'Dream Journal Foundation', 'Learn the fundamentals of dream journaling and establish your morning recall ritual.', 0, 
  '{
    "overview": "Start your dream recall journey by setting up your dream journal and learning the science behind dream memory. This level will teach you why immediate journaling is crucial and how to capture dreams before they fade.",
    "practices": [
      {"id": "setup_journal", "title": "Set up digital dream journal", "xp": 5},
      {"id": "first_entry", "title": "Write first dream entry", "xp": 5},
      {"id": "morning_ritual", "title": "Learn morning recall ritual", "xp": 5},
      {"id": "daily_journal", "title": "5-minute daily journaling", "xp": 5}
    ],
    "videos": [
      {"id": "why_journaling", "title": "Why Dream Journaling Changes Everything", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "10:00"},
      {"id": "dream_memory_science", "title": "The Science of Dream Memory", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "8:00"}
    ],
    "readings": [
      {"id": "neuroscience", "title": "The Neuroscience of Dream Recall", "content": "The hippocampus plays a crucial role in dream recall. During REM sleep, your brain creates vivid narratives, but the prefrontal cortex (responsible for memory encoding) is less active. This is why dreams fade so quickly. By writing dreams immediately upon waking, you are activating your prefrontal cortex and encoding the dream memory before it disappears."},
      {"id": "best_practices", "title": "Best Practices for Capturing Dreams", "content": "1. Keep journal NEXT to your bed 2. Write IMMEDIATELY upon waking 3. Do not move your body when you first wake up 4. Start with keywords if you cannot remember everything 5. Write in present tense"},
      {"id": "mistakes", "title": "Common Beginner Mistakes to Avoid", "content": "Mistake #1: I will remember it later - No you will not. Write NOW. Mistake #2: Waiting too long after waking. Mistake #3: Moving your body before capturing the dream."}
    ],
    "exercises": [
      {"id": "setup_wizard", "title": "Guided Journal Setup Wizard", "type": "interactive", "description": "Step-by-step setup of your dream journal with wake-up time and journaling preferences"},
      {"id": "morning_checklist", "title": "Morning Recall Checklist", "type": "checklist", "description": "Daily checklist to guide your morning dream capture routine"},
      {"id": "timed_write", "title": "5-Minute Morning Write Session", "type": "timer", "duration": 5, "description": "Timed writing exercise to capture dreams quickly"}
    ],
    "achievement": {"id": "first_dream", "title": "First Dream Logged", "xp": 5, "emoji": "📔"}
  }'::jsonb),

  -- Level 2: Morning Rituals & Consistency
  (dream_recall_id, 2, 'Morning Rituals & Consistency', 'Develop a consistent morning practice and understand the optimal timing for dream recall.', 50,
  '{
    "overview": "Master the art of waking up without losing your dreams. Learn the critical 5-10 minute window for dream recall and build a 7-day journaling streak.",
    "practices": [
      {"id": "wake_reminder", "title": "Set wake-up reminder/alarm", "xp": 5},
      {"id": "no_movement", "title": "Practice no-movement waking technique", "xp": 10},
      {"id": "seven_day_streak", "title": "Daily journaling for 7 days straight", "xp": 25},
      {"id": "voice_recording", "title": "Voice recording dreams upon waking", "xp": 10}
    ],
    "videos": [
      {"id": "morning_protocol", "title": "The 5-Minute Morning Protocol", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "8:00"},
      {"id": "wake_without_losing", "title": "How to Wake Up Without Losing Dreams", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "10:00"}
    ],
    "readings": [
      {"id": "recall_window", "title": "The Importance of Dream Recall Windows", "content": "You have approximately 5-10 minutes after waking before dream memories begin to fade significantly. Research shows: 0-2 minutes after waking: 90% dream retention, 5 minutes: 50% dream retention, 10 minutes: 10-20% dream retention."},
      {"id": "sleep_cycles", "title": "Sleep Cycle Optimization for Recall", "content": "You dream most vividly during REM sleep which occurs in cycles. The best time to wake up for dream recall is after 6, 7.5, or 9 hours at the end of a complete REM cycle."}
    ],
    "exercises": [
      {"id": "alarm_setup", "title": "Wake-Up Reminder Setup", "type": "interactive", "description": "Configure optimal wake-up time based on your sleep cycles"},
      {"id": "streak_tracker", "title": "Morning Checklist Gamification", "type": "checklist", "description": "Track your 7-day dream journaling streak"},
      {"id": "voice_recorder", "title": "Voice Recording Dreams", "type": "recorder", "description": "Practice voice recording for faster dream capture"}
    ],
    "achievement": {"id": "seven_day_streak", "title": "7-Day Dream Streak", "xp": 25, "emoji": "🔥"}
  }'::jsonb),

  -- Level 3: Dream Sign Recognition
  (dream_recall_id, 3, 'Dream Sign Recognition', 'Identify recurring patterns and elements in your dreams to build awareness.', 150,
  '{
    "overview": "Analyze your past dreams to discover your personal dream signs - the recurring elements that will later become triggers for lucidity.",
    "practices": [
      {"id": "review_dreams", "title": "Review past 20 dreams for patterns", "xp": 15},
      {"id": "create_sign_list", "title": "Create personal dream sign list", "xp": 10},
      {"id": "tag_elements", "title": "Tag recurring elements in journal", "xp": 10},
      {"id": "weekly_review", "title": "Weekly dream review sessions", "xp": 10}
    ],
    "videos": [
      {"id": "identify_signs", "title": "Identifying Your Personal Dream Signs", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "15:00"},
      {"id": "pattern_training", "title": "Pattern Recognition Training", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "12:00"}
    ],
    "readings": [
      {"id": "universal_signs", "title": "Common Universal Dream Signs", "content": "Universal dream signs include: unusual locations, deceased loved ones, inability to find bathroom, teeth falling out, flying or floating, being naked in public, being chased, failing exams, malfunctioning technology."},
      {"id": "lucidity_triggers", "title": "How Dream Signs Become Lucidity Triggers", "content": "Once you identify your dream signs they become reality check triggers. When you see a dream sign in waking life perform a reality check. Your brain learns the pattern and eventually seeing the sign IN a dream triggers lucidity."}
    ],
    "exercises": [
      {"id": "ai_detector", "title": "AI-Powered Dream Sign Detector", "type": "ai_analysis", "description": "AI analyzes your dreams to identify recurring patterns and elements"},
      {"id": "tagging_tool", "title": "Dream Sign Tagging Interface", "type": "interactive", "description": "Review and tag dream signs in your past entries"},
      {"id": "visualization", "title": "Pattern Visualization Dashboard", "type": "dashboard", "description": "View charts and graphs of your dream sign patterns"}
    ],
    "achievement": {"id": "dream_detective", "title": "Dream Detective", "xp": 30, "emoji": "🔍"}
  }'::jsonb),

  -- Level 4: Multiple Dreams Per Night
  (dream_recall_id, 4, 'Multiple Dreams Per Night', 'Learn to recall 3+ dreams in a single night using advanced techniques.', 300,
  '{
    "overview": "Master Wake Back to Bed (WBTB) technique and dream chaining to recall multiple dreams from different REM cycles in one night.",
    "practices": [
      {"id": "wbtb_practice", "title": "Wake Back to Bed for dream recall", "xp": 15},
      {"id": "rem_alarms", "title": "Set alarms for REM cycle endings", "xp": 10},
      {"id": "three_dreams", "title": "Journal 3+ dreams in one night", "xp": 20},
      {"id": "dream_chaining", "title": "Practice dream chaining technique", "xp": 15}
    ],
    "videos": [
      {"id": "sleep_cycles_deep", "title": "Understanding Sleep Cycles", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "14:00"},
      {"id": "wbtb_technique", "title": "WBTB for Maximum Recall", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "12:00"}
    ],
    "readings": [
      {"id": "rem_science", "title": "REM Sleep Science and Optimization", "content": "REM sleep occurs in cycles throughout the night. The longest and most vivid REM periods occur in the final cycles (after 6+ hours of sleep). By waking briefly during these cycles you can capture multiple dreams."},
      {"id": "chaining", "title": "Dream Chaining Techniques", "content": "Dream chaining is the practice of capturing one dream then immediately going back to sleep to enter another dream while the memory is fresh. This can result in 3-5 dream recalls per night."}
    ],
    "exercises": [
      {"id": "smart_alarm", "title": "Smart Alarm Scheduler", "type": "calculator", "description": "Calculates optimal alarm times based on your REM cycles"},
      {"id": "multi_entry", "title": "Multi-Dream Entry Interface", "type": "form", "description": "Special form for logging multiple dreams from one night"},
      {"id": "sleep_calculator", "title": "Sleep Cycle Calculator", "type": "calculator", "description": "Determine your personal sleep cycle timing"}
    ],
    "achievement": {"id": "multi_dream", "title": "Multiple Dream Master", "xp": 40, "emoji": "🌙"}
  }'::jsonb),

  -- Level 5: Advanced Memory Techniques
  (dream_recall_id, 5, 'Advanced Memory Techniques', 'Apply cognitive science and memory athlete techniques to dream recall.', 500,
  '{
    "overview": "Learn advanced memory techniques including prospective memory training, memory palace, and sensory amplification for enhanced dream recall.",
    "practices": [
      {"id": "prospective_memory", "title": "Prospective memory training", "xp": 15},
      {"id": "visualization_practice", "title": "Visualization exercises before sleep", "xp": 15},
      {"id": "memory_palace", "title": "Memory palace technique for dreams", "xp": 20},
      {"id": "sensory_detail", "title": "Sensory detail enhancement practice", "xp": 15}
    ],
    "videos": [
      {"id": "memory_palace_dreams", "title": "Memory Palace for Dream Recall", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "16:00"},
      {"id": "sensory_amplification", "title": "Sensory Amplification Training", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "13:00"}
    ],
    "readings": [
      {"id": "prospective_memory_science", "title": "Cognitive Science of Prospective Memory", "content": "Prospective memory is remembering to remember. By setting the intention before sleep to remember your dreams you activate neural pathways that make recall more likely upon waking."},
      {"id": "memory_athletes", "title": "Advanced Recall Techniques from Memory Athletes", "content": "Memory champions use visualization and association techniques. Apply these to dreams: create vivid mental images of dream scenes, associate dreams with physical locations, use the method of loci."}
    ],
    "exercises": [
      {"id": "visualization_timer", "title": "Guided Visualization with Timer", "type": "guided_audio", "duration": 10, "description": "Pre-sleep visualization practice"},
      {"id": "sensory_checklist", "title": "Sensory Detail Checklist", "type": "checklist", "description": "Rate dreams on sight sound smell touch taste emotion"},
      {"id": "memory_game", "title": "Memory Game Integration", "type": "game", "description": "Train your memory with cognitive exercises"}
    ],
    "achievement": {"id": "memory_athlete", "title": "Memory Athlete", "xp": 50, "emoji": "🧠"}
  }'::jsonb),

  -- Level 6: Total Dream Recall Mastery
  (dream_recall_id, 6, 'Total Dream Recall Mastery', 'Achieve expert-level dream recall with 5+ dreams per night consistently.', 750,
  '{
    "overview": "Master dream recall at the highest level. Recall 5+ dreams per night, capture dreams in under 2 minutes, and achieve 30-day perfect recall streak. Unlock Lucid Dreaming Path.",
    "practices": [
      {"id": "five_plus_dreams", "title": "Recall 5+ dreams per night consistently", "xp": 25},
      {"id": "instant_capture", "title": "Instant dream capture (under 2 minutes)", "xp": 20},
      {"id": "teach_others", "title": "Teach others dream recall", "xp": 25},
      {"id": "perfect_streak", "title": "Complete 30-day perfect recall streak", "xp": 100}
    ],
    "videos": [
      {"id": "mastery_mindset", "title": "Mastery Mindset", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "15:00"},
      {"id": "expert_interviews", "title": "Expert Interviews with Lucid Dreamers", "url": "https://youtube.com/watch?v=dQw4w9WgXcQ", "duration": "25:00"}
    ],
    "readings": [
      {"id": "memory_consolidation", "title": "Long-term Memory Consolidation", "content": "At mastery level your brain has rewired itself for automatic dream recall. The neural pathways are so strong that remembering dreams becomes effortless. You wake up with full dream memories already encoded."},
      {"id": "maintaining_mastery", "title": "Maintaining Recall Mastery", "content": "Even at mastery level consistency is key. Continue daily journaling and periodic review. Your brain can lose this skill if you stop practicing for extended periods."}
    ],
    "exercises": [
      {"id": "expert_mode", "title": "Expert Mode Journal", "type": "timed_challenge", "description": "Timed challenges for rapid dream capture"},
      {"id": "teaching_module", "title": "Community Teaching Feature", "type": "interactive", "description": "Share your knowledge with beginners"},
      {"id": "certification", "title": "Mastery Certification Quiz", "type": "quiz", "description": "Test your dream recall knowledge"}
    ],
    "achievement": {"id": "recall_master", "title": "Dream Recall Master", "xp": 100, "emoji": "🏆"},
    "unlocks": ["lucid_dreaming"]
  }'::jsonb);

END $$;