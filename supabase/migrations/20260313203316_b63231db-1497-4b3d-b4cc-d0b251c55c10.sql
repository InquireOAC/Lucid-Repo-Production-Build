CREATE OR REPLACE FUNCTION public.get_lucid_stats(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  v_total_lucid integer;
  v_lucid_this_month integer;
  v_total_entries integer;
  v_total_nights integer;
  v_avg_word_count numeric;
  v_days_since_last_lucid integer;
  v_current_lucid_streak integer;
  v_longest_lucid_streak integer;
  v_current_recall_streak integer;
  v_longest_recall_streak integer;
  v_avg_lucidity numeric;
  v_techniques jsonb;
  v_top_symbols jsonb;
  v_lucid_chart jsonb;
  v_recall_chart jsonb;
  v_level_distribution jsonb;
  v_latest_insight jsonb;
  v_achievements jsonb;
  v_rec record;
  v_streak integer;
  v_max_streak integer;
  v_prev_date date;
BEGIN
  SELECT count(*) INTO v_total_entries FROM dream_entries WHERE user_id = p_user_id;
  SELECT count(*) INTO v_total_lucid FROM dream_entries WHERE user_id = p_user_id AND lucid = true;
  SELECT count(*) INTO v_lucid_this_month FROM dream_entries WHERE user_id = p_user_id AND lucid = true AND dream_date >= date_trunc('month', current_date);
  SELECT count(DISTINCT dream_date) INTO v_total_nights FROM dream_entries WHERE user_id = p_user_id AND dream_date IS NOT NULL;
  SELECT coalesce(avg(word_count), 0) INTO v_avg_word_count FROM dream_entries WHERE user_id = p_user_id AND word_count IS NOT NULL AND word_count > 0;

  -- Days since last lucid (date - date = integer in postgres, no extract needed)
  SELECT (current_date - max(dream_date)) INTO v_days_since_last_lucid
  FROM dream_entries WHERE user_id = p_user_id AND lucid = true AND dream_date IS NOT NULL;

  v_streak := 0; v_max_streak := 0; v_current_lucid_streak := 0; v_prev_date := NULL;
  FOR v_rec IN
    SELECT DISTINCT dream_date FROM dream_entries 
    WHERE user_id = p_user_id AND lucid = true AND dream_date IS NOT NULL
    ORDER BY dream_date DESC
  LOOP
    IF v_prev_date IS NULL OR v_prev_date - v_rec.dream_date = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      IF v_current_lucid_streak = 0 THEN v_current_lucid_streak := v_streak; END IF;
      v_max_streak := greatest(v_max_streak, v_streak);
      v_streak := 1;
    END IF;
    v_prev_date := v_rec.dream_date;
  END LOOP;
  IF v_current_lucid_streak = 0 THEN v_current_lucid_streak := v_streak; END IF;
  v_max_streak := greatest(v_max_streak, v_streak);
  v_longest_lucid_streak := v_max_streak;

  v_streak := 0; v_max_streak := 0; v_current_recall_streak := 0; v_prev_date := NULL;
  FOR v_rec IN
    SELECT DISTINCT dream_date FROM dream_entries
    WHERE user_id = p_user_id AND dream_date IS NOT NULL
    ORDER BY dream_date DESC
  LOOP
    IF v_prev_date IS NULL OR v_prev_date - v_rec.dream_date = 1 THEN
      v_streak := v_streak + 1;
    ELSE
      IF v_current_recall_streak = 0 THEN v_current_recall_streak := v_streak; END IF;
      v_max_streak := greatest(v_max_streak, v_streak);
      v_streak := 1;
    END IF;
    v_prev_date := v_rec.dream_date;
  END LOOP;
  IF v_current_recall_streak = 0 THEN v_current_recall_streak := v_streak; END IF;
  v_max_streak := greatest(v_max_streak, v_streak);
  v_longest_recall_streak := v_max_streak;

  SELECT coalesce(jsonb_agg(t), '[]'::jsonb) INTO v_techniques FROM (
    SELECT technique_used as technique, 
           count(*) as uses, 
           count(*) FILTER (WHERE lucid = true) as successes,
           round(count(*) FILTER (WHERE lucid = true)::numeric / count(*)::numeric * 100) as rate
    FROM dream_entries
    WHERE user_id = p_user_id AND technique_used IS NOT NULL AND technique_used != ''
    GROUP BY technique_used
    ORDER BY rate DESC, uses DESC
  ) t;

  SELECT coalesce(jsonb_agg(s), '[]'::jsonb) INTO v_top_symbols FROM (
    SELECT symbol, count(*) as count
    FROM dream_entries, unnest(tags) as symbol
    WHERE user_id = p_user_id AND tags IS NOT NULL AND array_length(tags, 1) > 0
    GROUP BY symbol
    ORDER BY count DESC
    LIMIT 10
  ) s;

  SELECT coalesce(avg(lucidity_level), 0) INTO v_avg_lucidity 
  FROM dream_entries WHERE user_id = p_user_id AND lucidity_level IS NOT NULL;

  SELECT coalesce(jsonb_object_agg(level, cnt), '{}'::jsonb) INTO v_level_distribution FROM (
    SELECT lucidity_level::text as level, count(*) as cnt
    FROM dream_entries WHERE user_id = p_user_id AND lucidity_level IS NOT NULL
    GROUP BY lucidity_level
  ) ld;

  SELECT coalesce(jsonb_agg(c ORDER BY c.week), '[]'::jsonb) INTO v_lucid_chart FROM (
    SELECT date_trunc('week', dream_date)::date as week,
           count(*) FILTER (WHERE lucid = true) as lucid_count,
           count(*) as total_count
    FROM dream_entries
    WHERE user_id = p_user_id AND dream_date >= current_date - 90 AND dream_date IS NOT NULL
    GROUP BY date_trunc('week', dream_date)
  ) c;

  SELECT coalesce(jsonb_agg(r ORDER BY r.day), '[]'::jsonb) INTO v_recall_chart FROM (
    SELECT dream_date as day, count(*) as count
    FROM dream_entries
    WHERE user_id = p_user_id AND dream_date >= current_date - 30 AND dream_date IS NOT NULL
    GROUP BY dream_date
  ) r;

  SELECT to_jsonb(di) INTO v_latest_insight FROM (
    SELECT summary_message, recommendation_message, motivation_message, generated_at
    FROM dream_insights WHERE user_id = p_user_id
    ORDER BY generated_at DESC LIMIT 1
  ) di;

  SELECT coalesce(jsonb_agg(a), '[]'::jsonb) INTO v_achievements FROM (
    SELECT lua.achievement_id, lua.unlocked_at, lad.key, lad.title, lad.description, lad.icon, lad.category
    FROM lucid_user_achievements lua
    JOIN lucid_achievement_definitions lad ON lad.id = lua.achievement_id
    WHERE lua.user_id = p_user_id
    ORDER BY lua.unlocked_at DESC
  ) a;

  result := jsonb_build_object(
    'total_lucid_dreams', coalesce(v_total_lucid, 0),
    'lucid_this_month', coalesce(v_lucid_this_month, 0),
    'current_lucid_streak', coalesce(v_current_lucid_streak, 0),
    'longest_lucid_streak', coalesce(v_longest_lucid_streak, 0),
    'days_since_last_lucid', v_days_since_last_lucid,
    'total_entries', coalesce(v_total_entries, 0),
    'total_nights', coalesce(v_total_nights, 0),
    'current_recall_streak', coalesce(v_current_recall_streak, 0),
    'longest_recall_streak', coalesce(v_longest_recall_streak, 0),
    'avg_dreams_per_night', CASE WHEN v_total_nights > 0 THEN round(v_total_entries::numeric / v_total_nights, 2) ELSE 0 END,
    'avg_word_count', round(coalesce(v_avg_word_count, 0)),
    'techniques', v_techniques,
    'top_symbols', coalesce(v_top_symbols, '[]'::jsonb),
    'avg_lucidity_level', round(coalesce(v_avg_lucidity, 0), 1),
    'level_distribution', coalesce(v_level_distribution, '{}'::jsonb),
    'lucid_chart', coalesce(v_lucid_chart, '[]'::jsonb),
    'recall_chart', coalesce(v_recall_chart, '[]'::jsonb),
    'latest_insight', v_latest_insight,
    'achievements', coalesce(v_achievements, '[]'::jsonb)
  );

  RETURN result;
END;
$function$;