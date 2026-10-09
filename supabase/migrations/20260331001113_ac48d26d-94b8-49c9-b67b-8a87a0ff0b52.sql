
-- 1. Fix avatars bucket: replace permissive policies with ownership-checked ones
DROP POLICY IF EXISTS "Authenticated upload for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for avatars" ON storage.objects;

CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 2. Fix profiles: drop the broad SELECT policy, add admin-only SELECT policy
-- The owner policy "Users can view their own profile" (USING: auth.uid() = id) already exists
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

-- Admin needs to read all profiles for dashboard
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
