-- Fix video_entries policies - restore public viewing while keeping admin management
DROP POLICY IF EXISTS "Admins can manage all videos" ON public.video_entries;
DROP POLICY IF EXISTS "Anyone can view published videos" ON public.video_entries;

-- Allow anyone to view published videos (was accidentally removed)
CREATE POLICY "Anyone can view published videos"
ON public.video_entries
FOR SELECT
USING (is_published = true);

-- Allow admins to manage all videos (create, update, delete)
CREATE POLICY "Admins can manage videos"
ON public.video_entries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));