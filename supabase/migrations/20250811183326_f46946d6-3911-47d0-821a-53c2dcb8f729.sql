-- Fix security issues by setting proper search paths for functions

-- Update create_activity function to have secure search path
CREATE OR REPLACE FUNCTION create_activity(
  activity_type text,
  user_id_param uuid,
  target_user_id_param uuid,
  dream_id_param uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.activities (type, user_id, target_user_id, dream_id)
  VALUES (activity_type, user_id_param, target_user_id_param, dream_id_param);
END;
$$;

-- Update handle_like_activity function to have secure search path
CREATE OR REPLACE FUNCTION handle_like_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  dream_owner_id uuid;
BEGIN
  -- Get the dream owner
  SELECT user_id INTO dream_owner_id
  FROM public.dream_entries
  WHERE id = NEW.dream_id;
  
  -- Only create activity if someone else liked the dream (not self-like)
  IF dream_owner_id IS NOT NULL AND dream_owner_id != NEW.user_id THEN
    PERFORM public.create_activity('like', NEW.user_id, dream_owner_id, NEW.dream_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_comment_activity function to have secure search path
CREATE OR REPLACE FUNCTION handle_comment_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  dream_owner_id uuid;
BEGIN
  -- Get the dream owner
  SELECT user_id INTO dream_owner_id
  FROM public.dream_entries
  WHERE id = NEW.dream_id;
  
  -- Only create activity if someone else commented (not self-comment)
  IF dream_owner_id IS NOT NULL AND dream_owner_id != NEW.user_id THEN
    PERFORM public.create_activity('comment', NEW.user_id, dream_owner_id, NEW.dream_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_message_activity function to have secure search path
CREATE OR REPLACE FUNCTION handle_message_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create activity for the receiver
  PERFORM public.create_activity('message', NEW.sender_id, NEW.receiver_id, NEW.shared_dream_id);
  
  RETURN NEW;
END;
$$;

-- Update handle_follow_activity function to have secure search path
CREATE OR REPLACE FUNCTION handle_follow_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create activity for the person being followed
  PERFORM public.create_activity('follow', NEW.follower_id, NEW.followed_id, NULL);
  
  RETURN NEW;
END;
$$;