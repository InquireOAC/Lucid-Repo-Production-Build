
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  -- Insert default dream tags for new user (ignore if they already exist)
  INSERT INTO public.dream_tags (user_id, name, color)
  VALUES 
    (NEW.id, 'Nightmare', '#ef4444'),
    (NEW.id, 'Lucid', '#3b82f6'),
    (NEW.id, 'Recurring', '#8b5cf6'),
    (NEW.id, 'Adventure', '#10b981'),
    (NEW.id, 'Spiritual', '#f59e0b'),
    (NEW.id, 'Flying', '#6366f1'),
    (NEW.id, 'Falling', '#ec4899'),
    (NEW.id, 'Water', '#0ea5e9')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;
