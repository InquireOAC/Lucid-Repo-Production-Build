-- Fix security definer view issues by recreating the public_profiles view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

-- Create a simple view without SECURITY DEFINER (which is the default)
CREATE VIEW public.public_profiles AS
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

-- Update the profiles table RLS policy to be more restrictive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view limited profile info" ON public.profiles;

-- Create a more secure policy that only allows viewing specific fields
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to basic public fields, sensitive fields are blocked
  CASE 
    WHEN auth.uid() = id THEN true  -- Users can see their own full profile
    ELSE false  -- Others cannot access profiles table directly, must use view
  END
);

-- Enable RLS on the view by creating policies specifically for it
-- Since we can't directly apply RLS to views, we'll use the underlying table policies

-- Grant proper access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Fix any remaining functions that might not have search_path set
-- Let's check if create_notification_preferences_for_new_user needs fixing
CREATE OR REPLACE FUNCTION public.create_notification_preferences_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;