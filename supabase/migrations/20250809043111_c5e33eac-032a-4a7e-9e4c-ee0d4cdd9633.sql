-- Drop the trigger first, then function, then recreate both with proper security
DROP TRIGGER IF EXISTS update_learning_progress_trigger ON public.practice_sessions;
DROP FUNCTION IF EXISTS public.update_learning_progress();

-- Recreate function with proper search_path security setting
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

-- Recreate the trigger
CREATE TRIGGER update_learning_progress_trigger
  AFTER INSERT ON public.practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_progress();