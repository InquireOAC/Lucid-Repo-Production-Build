
-- Admin can update any dream (e.g. set is_public = false on flagged content)
CREATE POLICY "Admins can update any dream"
  ON public.dream_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete any dream
CREATE POLICY "Admins can delete any dream"
  ON public.dream_entries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.stripe_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
