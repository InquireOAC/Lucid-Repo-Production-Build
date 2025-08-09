-- Fix security issue by setting search_path for the function
DROP FUNCTION IF EXISTS public.update_learning_progress();

CREATE OR REPLACE FUNCTION public.update_learning_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update user's learning progress when they complete a practice session
  INSERT INTO public.learning_progress (user_id, total_xp, last_activity_date, updated_at)
  VALUES (NEW.user_id, NEW.xp_earned, CURRENT_DATE, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_xp = public.learning_progress.total_xp + NEW.xp_earned,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
  
  RETURN NEW;
END;
$$;