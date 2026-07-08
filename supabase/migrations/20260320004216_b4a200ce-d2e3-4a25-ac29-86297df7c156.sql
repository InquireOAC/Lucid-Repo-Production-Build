-- Fix: Restrict user_public_map to authenticated users only (was exposing emails publicly)
DROP POLICY IF EXISTS "Allow read access to everyone" ON user_public_map;
CREATE POLICY "Authenticated users can read" ON user_public_map
  FOR SELECT TO authenticated USING (true);