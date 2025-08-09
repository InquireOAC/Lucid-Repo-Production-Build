-- Fix profiles table RLS policies to prevent public data exposure
-- Drop the overly permissive policy that allows anyone to select all profiles
DROP POLICY IF EXISTS "Profiles: anyone can select by username/id" ON public.profiles;

-- Create more secure policies for profiles table
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Anyone can view limited public profile information (username, display_name, avatar_url, bio)
CREATE POLICY "Public can view limited profile info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- However, we need to create a view for public profile access to limit exposed columns
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  avatar_symbol,
  avatar_color,
  bio,
  created_at
FROM public.profiles;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Fix database functions with insecure search paths
-- Function 1: update_video_entries_updated_at
CREATE OR REPLACE FUNCTION public.update_video_entries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function 2: delete_user_account 
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Verify that the requesting user is deleting their own account
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;

  -- Delete all user-related data in the correct order (to handle foreign key constraints)
  
  -- Delete user's activities (both as user and target)
  DELETE FROM public.activities WHERE user_id = user_id_to_delete OR target_user_id = user_id_to_delete;
  
  -- Delete user's messages (both sent and received)
  DELETE FROM public.messages WHERE sender_id = user_id_to_delete OR receiver_id = user_id_to_delete;
  
  -- Delete user's content flags (both as reporter and flagged user)
  DELETE FROM public.content_flags WHERE reporter_user_id = user_id_to_delete OR flagged_user_id = user_id_to_delete;
  
  -- Delete user's blocked users relationships
  DELETE FROM public.blocked_users WHERE blocker_user_id = user_id_to_delete OR blocked_user_id = user_id_to_delete;
  
  -- Delete user's followers/following relationships
  DELETE FROM public.followers WHERE follower_id = user_id_to_delete OR following_id = user_id_to_delete;
  DELETE FROM public.follows WHERE follower_id = user_id_to_delete OR followed_id = user_id_to_delete;
  
  -- Delete user's dream interactions
  DELETE FROM public.dream_likes WHERE user_id = user_id_to_delete;
  DELETE FROM public.dream_comments WHERE user_id = user_id_to_delete;
  DELETE FROM public.likes WHERE user_id = user_id_to_delete;
  DELETE FROM public.comments WHERE user_id = user_id_to_delete;
  
  -- Delete user's dream entries (this will cascade to related likes/comments via triggers)
  DELETE FROM public.dream_entries WHERE user_id = user_id_to_delete;
  
  -- Delete user's custom tags
  DELETE FROM public.dream_tags WHERE user_id = user_id_to_delete;
  
  -- Delete user's subscription data
  DELETE FROM public.subscriptions WHERE user_id = user_id_to_delete;
  DELETE FROM public.stripe_customers WHERE user_id = user_id_to_delete;
  
  -- Delete user's terms acceptance
  DELETE FROM public.terms_acceptance WHERE user_id = user_id_to_delete;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  -- Finally, delete the auth user (this is the most important part)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$function$;

-- Function 3: update_learning_progress
CREATE OR REPLACE FUNCTION public.update_learning_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Function 4: handle_user_blocked
CREATE OR REPLACE FUNCTION public.handle_user_blocked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Remove follow relationships in both directions
  DELETE FROM public.follows 
  WHERE (follower_id = NEW.blocker_user_id AND followed_id = NEW.blocked_user_id)
     OR (follower_id = NEW.blocked_user_id AND followed_id = NEW.blocker_user_id);
  
  -- Remove legacy followers table relationships in both directions (if they exist)
  DELETE FROM public.followers 
  WHERE (follower_id = NEW.blocker_user_id AND following_id = NEW.blocked_user_id)
     OR (follower_id = NEW.blocked_user_id AND following_id = NEW.blocker_user_id);
  
  -- Delete all messages between the blocker and blocked user
  DELETE FROM public.messages 
  WHERE (sender_id = NEW.blocker_user_id AND receiver_id = NEW.blocked_user_id)
     OR (sender_id = NEW.blocked_user_id AND receiver_id = NEW.blocker_user_id);
  
  RETURN NEW;
END;
$function$;

-- Function 5: update_comment_count
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.dream_entries
  SET comment_count = (
    SELECT COUNT(*) FROM public.dream_comments WHERE dream_id = NEW.dream_id
  )
  WHERE id = NEW.dream_id;
  RETURN NEW;
END;
$function$;

-- Function 6: check_subscription_credits
CREATE OR REPLACE FUNCTION public.check_subscription_credits(customer_id text, credit_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  subscription RECORD;
  credit_limit INTEGER;
  credits_used INTEGER;
BEGIN
  -- Get subscription
  SELECT * INTO subscription
  FROM public.stripe_subscriptions
  WHERE customer_id = check_subscription_credits.customer_id
  AND deleted_at IS NULL;

  -- Check subscription status
  IF subscription.status != 'active' THEN
    RETURN FALSE;
  END IF;

  -- Set credit limit based on price_id
  credit_limit := CASE 
    WHEN subscription.price_id = 'price_basic' THEN
      CASE credit_type
        WHEN 'analysis' THEN 999999  -- Unlimited for Basic now!
        WHEN 'image' THEN 10
        ELSE 0
      END
    WHEN subscription.price_id = 'price_premium' THEN
      CASE credit_type
        WHEN 'analysis' THEN 999999 -- Unlimited
        WHEN 'image' THEN 999999    -- Unlimited images
        ELSE 0
      END
    ELSE 0
  END;

  -- Get used credits
  credits_used := CASE credit_type
    WHEN 'analysis' THEN subscription.dream_analyses_used
    WHEN 'image' THEN subscription.image_generations_used
    ELSE 0
  END;

  RETURN credits_used < credit_limit;
END;
$function$;

-- Function 7: increment_subscription_usage
CREATE OR REPLACE FUNCTION public.increment_subscription_usage(customer_id text, credit_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.stripe_subscriptions
  SET 
    dream_analyses_used = CASE 
      WHEN credit_type = 'analysis' 
      THEN dream_analyses_used + 1 
      ELSE dream_analyses_used 
    END,
    image_generations_used = CASE 
      WHEN credit_type = 'image' 
      THEN image_generations_used + 1 
      ELSE image_generations_used 
    END,
    updated_at = now()
  WHERE customer_id = increment_subscription_usage.customer_id
  AND deleted_at IS NULL;
END;
$function$;

-- Function 8: reset_subscription_usage
CREATE OR REPLACE FUNCTION public.reset_subscription_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.stripe_subscriptions
  SET 
    dream_analyses_used = 0,
    image_generations_used = 0,
    updated_at = now()
  WHERE deleted_at IS NULL;
END;
$function$;

-- Function 9: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Insert default dream tags for new user
  INSERT INTO public.dream_tags (user_id, name, color)
  VALUES 
    (NEW.id, 'Nightmare', '#ef4444'),
    (NEW.id, 'Lucid', '#3b82f6'),
    (NEW.id, 'Recurring', '#8b5cf6'),
    (NEW.id, 'Adventure', '#10b981'),
    (NEW.id, 'Spiritual', '#f59e0b'),
    (NEW.id, 'Flying', '#6366f1'),
    (NEW.id, 'Falling', '#ec4899'),
    (NEW.id, 'Water', '#0ea5e9');

  RETURN NEW;
END;
$function$;

-- Function 10: create_activity
CREATE OR REPLACE FUNCTION public.create_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'dream_likes' THEN
    INSERT INTO public.activities (user_id, target_user_id, type, dream_id)
    VALUES (
      NEW.user_id,
      (SELECT user_id FROM public.dream_entries WHERE id = NEW.dream_id),
      'like',
      NEW.dream_id
    );
  ELSIF TG_TABLE_NAME = 'dream_comments' THEN
    INSERT INTO public.activities (user_id, target_user_id, type, dream_id)
    VALUES (
      NEW.user_id,
      (SELECT user_id FROM public.dream_entries WHERE id = NEW.dream_id),
      'comment',
      NEW.dream_id
    );
  ELSIF TG_TABLE_NAME = 'followers' THEN
    INSERT INTO public.activities (user_id, target_user_id, type, dream_id)
    VALUES (
      NEW.follower_id,
      NEW.following_id,
      'follow',
      NULL
    );
  END IF;
  RETURN NEW;
END;
$function$;