-- Phase 2: Create database function for streak and XP updates

-- Function to update learning streak and XP
CREATE OR REPLACE FUNCTION update_learning_streak_and_xp(
  p_user_id UUID,
  p_xp_to_add INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_practice_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get current learning progress
  SELECT last_practice_date, current_streak, longest_streak
  INTO v_last_practice_date, v_current_streak, v_longest_streak
  FROM learning_progress
  WHERE user_id = p_user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO learning_progress (
      user_id, 
      total_xp, 
      current_streak, 
      longest_streak, 
      last_practice_date
    )
    VALUES (
      p_user_id, 
      p_xp_to_add, 
      1, 
      1, 
      CURRENT_DATE
    );
    RETURN;
  END IF;

  -- Calculate new streak
  IF v_last_practice_date = CURRENT_DATE THEN
    -- Same day, just add XP (streak stays the same)
    UPDATE learning_progress
    SET total_xp = total_xp + p_xp_to_add,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF v_last_practice_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    
    UPDATE learning_progress
    SET total_xp = total_xp + p_xp_to_add,
        current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_practice_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE learning_progress
    SET total_xp = total_xp + p_xp_to_add,
        current_streak = 1,
        last_practice_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;