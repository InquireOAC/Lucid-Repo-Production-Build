-- Drop redundant duplicate SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own credits" ON profiles;

-- Re-add authenticated SELECT for all users (needed for FK joins, social features)
CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);