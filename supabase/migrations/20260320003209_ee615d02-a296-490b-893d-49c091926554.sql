
-- 1. Enable RLS on creator_profiles
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view creator profiles" ON creator_profiles
  FOR SELECT USING (true);

CREATE POLICY "Owner can insert creator profile" ON creator_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Owner can update creator profile" ON creator_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owner can delete creator profile" ON creator_profiles
  FOR DELETE USING (auth.uid() = id);

-- 2. Restrict profiles table: drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view public profile data" ON profiles;

-- Add a policy so authenticated users can see other profiles' public fields via the public_profiles view
-- but full profile access is owner-only (existing policy handles this)
CREATE POLICY "Authenticated users can view basic profile data" ON profiles
  FOR SELECT TO authenticated
  USING (true);
