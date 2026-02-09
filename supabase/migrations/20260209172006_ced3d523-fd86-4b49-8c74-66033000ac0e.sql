
-- Add banner_image column to profiles
ALTER TABLE public.profiles ADD COLUMN banner_image TEXT;

-- Create profile-banners storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-banners', 'profile-banners', true);

-- Storage policies for profile-banners
CREATE POLICY "Anyone can view profile banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-banners');

CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
