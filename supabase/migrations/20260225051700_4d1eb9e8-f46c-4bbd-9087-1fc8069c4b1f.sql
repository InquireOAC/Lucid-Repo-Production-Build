
-- Allow admins to view all content flags for moderation
CREATE POLICY "Admins can view all content flags"
ON public.content_flags
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update content flags (resolve/dismiss)
CREATE POLICY "Admins can update content flags"
ON public.content_flags
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
