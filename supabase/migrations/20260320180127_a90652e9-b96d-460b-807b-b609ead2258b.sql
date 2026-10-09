-- Remove direct INSERT policies from achievement tables
DROP POLICY IF EXISTS "Users can insert own achievements" ON lucid_user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;

-- Create server-side function for granting lucid achievements with validation
CREATE OR REPLACE FUNCTION public.grant_lucid_achievement(p_achievement_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_rule jsonb;
  v_rule_type text;
  v_rule_value int;
  v_stats jsonb;
  v_met boolean := false;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM lucid_user_achievements WHERE user_id = v_user_id AND achievement_id = p_achievement_id) THEN
    RETURN false;
  END IF;

  -- Get the achievement definition
  SELECT unlock_rule INTO v_rule FROM lucid_achievement_definitions WHERE id = p_achievement_id;
  IF v_rule IS NULL THEN
    RAISE EXCEPTION 'Achievement not found';
  END IF;

  v_rule_type := v_rule->>'type';
  v_rule_value := (v_rule->>'value')::int;

  -- Validate using actual dream data
  CASE v_rule_type
    WHEN 'total_lucid' THEN
      v_met := (SELECT count(*) >= v_rule_value FROM dream_entries WHERE user_id = v_user_id AND lucid = true);
    WHEN 'recall_streak' THEN
      -- Use the stats function for complex streak calc
      v_stats := get_lucid_stats(v_user_id);
      v_met := (v_stats->>'longest_recall_streak')::int >= v_rule_value;
    WHEN 'lucidity_level' THEN
      v_met := EXISTS (SELECT 1 FROM dream_entries WHERE user_id = v_user_id AND lucidity_level >= 3);
    WHEN 'techniques_tried' THEN
      v_met := (SELECT count(DISTINCT technique_used) >= v_rule_value FROM dream_entries WHERE user_id = v_user_id AND technique_used IS NOT NULL AND technique_used != '');
    WHEN 'total_entries' THEN
      v_met := (SELECT count(*) >= v_rule_value FROM dream_entries WHERE user_id = v_user_id);
    ELSE
      RETURN false;
  END CASE;

  IF NOT v_met THEN
    RETURN false;
  END IF;

  INSERT INTO lucid_user_achievements (user_id, achievement_id) VALUES (v_user_id, p_achievement_id);
  RETURN true;
END;
$$;

-- Create server-side function for granting learning achievements with validation
CREATE OR REPLACE FUNCTION public.grant_learning_achievement(p_achievement_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_req_type text;
  v_req_value int;
  v_met boolean := false;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM user_achievements WHERE user_id = v_user_id AND achievement_id = p_achievement_id) THEN
    RETURN false;
  END IF;

  -- Get the achievement definition
  SELECT requirement_type, requirement_value INTO v_req_type, v_req_value 
  FROM learning_achievements WHERE id = p_achievement_id;
  IF v_req_type IS NULL THEN
    RAISE EXCEPTION 'Achievement not found';
  END IF;

  -- Validate using actual data
  CASE v_req_type
    WHEN 'sessions_completed' THEN
      v_met := (SELECT count(*) >= v_req_value FROM practice_sessions WHERE user_id = v_user_id);
    WHEN 'dreams_logged' THEN
      v_met := (SELECT count(*) >= v_req_value FROM dream_entries WHERE user_id = v_user_id);
    WHEN 'reality_checks' THEN
      v_met := (SELECT COALESCE(SUM(activities_completed), 0) >= v_req_value FROM learning_streaks WHERE user_id = v_user_id);
    WHEN 'meditation_sessions' THEN
      v_met := (SELECT count(*) >= v_req_value FROM practice_sessions WHERE user_id = v_user_id AND practice_type = 'meditation');
    WHEN 'streak_days' THEN
      v_met := (SELECT COALESCE(longest_streak, 0) >= v_req_value FROM learning_progress WHERE user_id = v_user_id);
    WHEN 'total_xp' THEN
      v_met := (SELECT COALESCE(total_xp, 0) >= v_req_value FROM learning_progress WHERE user_id = v_user_id);
    ELSE
      RETURN false;
  END CASE;

  IF NOT v_met THEN
    RETURN false;
  END IF;

  INSERT INTO user_achievements (user_id, achievement_id) VALUES (v_user_id, p_achievement_id);
  RETURN true;
END;
$$;