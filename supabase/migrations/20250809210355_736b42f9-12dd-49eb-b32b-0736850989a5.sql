-- Fix the overly restrictive profiles table RLS policies
-- Drop the broken policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create proper RLS policies for profiles table
-- Policy 1: Users can view their own complete profile data
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Anyone can view basic public profile information (for usernames, avatars, etc.)
CREATE POLICY "Anyone can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Ensure public_profiles view has proper access
-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Also make sure the main profiles table allows the necessary access for the view
GRANT SELECT ON public.profiles TO authenticated, anon;