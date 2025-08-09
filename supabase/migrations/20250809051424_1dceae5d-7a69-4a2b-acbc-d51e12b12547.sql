-- Fix security warning: Add proper search_path to the learning progress function
CREATE OR REPLACE FUNCTION update_learning_progress()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_total_xp INTEGER;
    new_level INTEGER;
    xp_requirements INTEGER[] := ARRAY[0, 0, 100, 250, 450, 700, 1000, 1400];
    i INTEGER;
BEGIN
    -- Calculate new total XP
    SELECT COALESCE(SUM(xp_earned), 0) + NEW.xp_earned
    INTO new_total_xp
    FROM public.practice_sessions 
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
    INSERT INTO public.learning_progress (user_id, total_xp, current_level, updated_at)
    VALUES (NEW.user_id, new_total_xp, new_level, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        updated_at = EXCLUDED.updated_at;
    
    -- Update streak if this is a new day
    INSERT INTO public.learning_streaks (user_id, streak_date, activities_completed, xp_earned)
    VALUES (NEW.user_id, CURRENT_DATE, 1, NEW.xp_earned)
    ON CONFLICT (user_id, streak_date)
    DO UPDATE SET 
        activities_completed = public.learning_streaks.activities_completed + 1,
        xp_earned = public.learning_streaks.xp_earned + NEW.xp_earned;
    
    -- Update streak counter in learning_progress
    UPDATE public.learning_progress 
    SET 
        current_streak = (
            SELECT COUNT(DISTINCT streak_date)
            FROM public.learning_streaks 
            WHERE user_id = NEW.user_id 
            AND streak_date >= CURRENT_DATE - INTERVAL '30 days'
            AND streak_date <= CURRENT_DATE
            ORDER BY streak_date DESC
        ),
        longest_streak = GREATEST(
            COALESCE(longest_streak, 0),
            (
                SELECT COUNT(DISTINCT streak_date)
                FROM public.learning_streaks 
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