
-- 1. Fix user_public_map: restrict SELECT to own row only
DROP POLICY IF EXISTS "Authenticated users can read" ON public.user_public_map;
CREATE POLICY "Authenticated users can read own email" ON public.user_public_map
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 2. Fix subscriptions: remove user UPDATE policy (subscriptions should only be modified server-side)
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- 3. Fix profiles: replace broad SELECT with owner-only for sensitive fields
-- We keep the broad SELECT since social features depend on it, but we rely on public_profiles view for non-owner access
-- The existing USING(true) policy is needed for foreign key joins. Instead, revoke sensitive columns from authenticated role.
REVOKE SELECT (available_credits, is_subscribed) ON public.profiles FROM authenticated;
-- Re-grant to the owner via a function or rely on service role for these columns
