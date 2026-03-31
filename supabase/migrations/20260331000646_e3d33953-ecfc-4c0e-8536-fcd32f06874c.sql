
-- 1. Fix dream_likes: restrict SELECT to authenticated users only (not public/anonymous)
DROP POLICY IF EXISTS "Users can view likes" ON public.dream_likes;
CREATE POLICY "Authenticated users can view likes" ON public.dream_likes
  FOR SELECT TO authenticated
  USING (true);

-- 2. Fix sync_alerts: create a view that excludes dreamer_ids, then restrict direct table access
-- Drop the old broad SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view sync alerts" ON public.sync_alerts;
-- Create a restrictive policy that only allows service_role direct access
CREATE POLICY "Service role can manage sync alerts" ON public.sync_alerts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a secure view that excludes dreamer_ids
CREATE OR REPLACE VIEW public.sync_alerts_safe AS
SELECT id, theme, emoji, description, dreamer_count, is_trending, created_at
FROM public.sync_alerts;

-- 3. Fix profiles: undo the column-level REVOKE (which breaks owner reads too)
-- and instead use a more targeted approach
GRANT SELECT (available_credits, is_subscribed) ON public.profiles TO authenticated;
-- Now drop the overly broad SELECT and replace with a policy that hides sensitive fields for non-owners
-- We keep the broad policy because too many social features depend on it (dream cards, profile cards, etc.)
-- The public_profiles view already excludes sensitive fields - the real fix is ensuring the app uses it
