
-- 1. Storage: dream-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

-- 2. Storage: dream-videos bucket - tighten INSERT and DELETE to folder ownership
DROP POLICY IF EXISTS "Authenticated users can upload dream videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload dream videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dream-videos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own dream videos" ON storage.objects;
CREATE POLICY "Users can delete their own dream videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'dream-videos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Also restrict updates on dream-videos to owners
CREATE POLICY "Users can update their own dream videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'dream-videos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Storage: legacy dreamimages bucket - require folder ownership for writes
DROP POLICY IF EXISTS "Authenticated users can upload dream images" ON storage.objects;
CREATE POLICY "Authenticated users can upload dream images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dreamimages'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can update dream images" ON storage.objects;
CREATE POLICY "Authenticated users can update dream images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'dreamimages'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can delete dream images" ON storage.objects;
CREATE POLICY "Authenticated users can delete dream images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'dreamimages'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. dream_likes: restrict SELECT
DROP POLICY IF EXISTS "Authenticated users can view likes" ON public.dream_likes;
CREATE POLICY "Users can view relevant likes"
ON public.dream_likes FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.dream_entries d
    WHERE d.id = dream_likes.dream_id
      AND (d.is_public = true OR d.user_id = auth.uid())
  )
);

-- 5. followers: restrict SELECT to involved parties
DROP POLICY IF EXISTS "Users can view followers" ON public.followers;
CREATE POLICY "Users can view their own follow relationships"
ON public.followers FOR SELECT TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- 6. Recreate views with security_invoker so they enforce caller's RLS
DROP VIEW IF EXISTS public.sync_alerts_safe;
CREATE VIEW public.sync_alerts_safe
WITH (security_invoker = true) AS
SELECT id, theme, emoji, description, dreamer_count, is_trending, created_at
FROM public.sync_alerts;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, username, display_name, avatar_url, avatar_symbol, avatar_color,
       bio, social_links, banner_image, color_scheme, created_at
FROM public.profiles;

-- 7. Fix mutable search_path on remaining function
ALTER FUNCTION public.update_path_progress_timestamp() SET search_path = public;
