-- Function to update learning progress when practice sessions are completed
CREATE OR REPLACE FUNCTION update_learning_progress()
RETURNS TRIGGER AS $$
DECLARE
    new_total_xp INTEGER;
    new_level INTEGER;
    xp_requirements INTEGER[] := ARRAY[0, 0, 100, 250, 450, 700, 1000, 1400];
    i INTEGER;
BEGIN
    -- Calculate new total XP
    SELECT COALESCE(SUM(xp_earned), 0) + NEW.xp_earned
    INTO new_total_xp
    FROM practice_sessions 
    WHERE user_id = NEW.user_id AND id != NEW.id;
    
    -- Determine new level based on XP
    new_level := 1;
    FOR i IN 2..7 LOOP
        IF new_total_xp >= xp_requirements[i] THEN
            new_level := i;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    -- Upsert learning progress
    INSERT INTO learning_progress (user_id, total_xp, current_level, updated_at)
    VALUES (NEW.user_id, new_total_xp, new_level, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        updated_at = EXCLUDED.updated_at;
    
    -- Update streak if this is a new day
    INSERT INTO learning_streaks (user_id, streak_date, activities_completed, xp_earned)
    VALUES (NEW.user_id, CURRENT_DATE, 1, NEW.xp_earned)
    ON CONFLICT (user_id, streak_date)
    DO UPDATE SET 
        activities_completed = learning_streaks.activities_completed + 1,
        xp_earned = learning_streaks.xp_earned + NEW.xp_earned;
    
    -- Update streak counter in learning_progress
    UPDATE learning_progress 
    SET 
        current_streak = (
            SELECT COUNT(DISTINCT streak_date)
            FROM learning_streaks 
            WHERE user_id = NEW.user_id 
            AND streak_date >= CURRENT_DATE - INTERVAL '30 days'
            AND streak_date <= CURRENT_DATE
            ORDER BY streak_date DESC
        ),
        longest_streak = GREATEST(
            COALESCE(longest_streak, 0),
            (
                SELECT COUNT(DISTINCT streak_date)
                FROM learning_streaks 
                WHERE user_id = NEW.user_id 
                AND streak_date >= CURRENT_DATE - INTERVAL '30 days'
                AND streak_date <= CURRENT_DATE
                ORDER BY streak_date DESC
            )
        ),
        last_activity_date = CURRENT_DATE
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update learning progress when practice sessions are completed
DROP TRIGGER IF EXISTS update_learning_progress_trigger ON practice_sessions;
CREATE TRIGGER update_learning_progress_trigger
    AFTER INSERT ON practice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_progress();

-- Update learning_levels table with correct XP requirements
INSERT INTO learning_levels (level_number, title, description, xp_required, content) VALUES
(1, 'Dream Awareness Foundations', 'Learn the basics of dream journaling and reality checks', 0, '{}'),
(2, 'Reality Check Training', 'Master reality checking techniques', 100, '{}'),
(3, 'Intention Setting', 'Program your mind for lucid dreaming', 250, '{}'),
(4, 'Meditation & Relaxation', 'Develop mindfulness and body awareness', 450, '{}'),
(5, 'WBTB & MILD Techniques', 'Advanced induction methods', 700, '{}'),
(6, 'Binaural Beats & Audio', 'Enhance your practice with sound', 1000, '{}'),
(7, 'Advanced Dream Control', 'Master your lucid dreams', 1400, '{}')
ON CONFLICT (level_number) DO UPDATE SET
    xp_required = EXCLUDED.xp_required,
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Recalculate all existing user progress to fix any inconsistencies
DO $$
DECLARE
    user_record RECORD;
    user_total_xp INTEGER;
    user_new_level INTEGER;
    xp_requirements INTEGER[] := ARRAY[0, 0, 100, 250, 450, 700, 1000, 1400];
    i INTEGER;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM practice_sessions LOOP
        -- Calculate total XP for this user
        SELECT COALESCE(SUM(xp_earned), 0)
        INTO user_total_xp
        FROM practice_sessions 
        WHERE user_id = user_record.user_id;
        
        -- Determine level based on XP
        user_new_level := 1;
        FOR i IN 2..7 LOOP
            IF user_total_xp >= xp_requirements[i] THEN
                user_new_level := i;
            ELSE
                EXIT;
            END IF;
        END LOOP;
        
        -- Update or insert learning progress
        INSERT INTO learning_progress (user_id, total_xp, current_level, updated_at)
        VALUES (user_record.user_id, user_total_xp, user_new_level, now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_xp = EXCLUDED.total_xp,
            current_level = EXCLUDED.current_level,
            updated_at = EXCLUDED.updated_at;
    END LOOP;
END $$;