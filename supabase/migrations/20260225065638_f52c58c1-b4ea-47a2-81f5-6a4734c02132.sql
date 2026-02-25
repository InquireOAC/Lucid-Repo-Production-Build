
-- Add video_url column to dream_entries
ALTER TABLE public.dream_entries ADD COLUMN video_url TEXT DEFAULT NULL;

-- Create dream-videos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('dream-videos', 'dream-videos', true);

-- Allow authenticated users to upload to dream-videos bucket
CREATE POLICY "Authenticated users can upload dream videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dream-videos' AND auth.uid() IS NOT NULL);

-- Allow public read access to dream videos
CREATE POLICY "Dream videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'dream-videos');

-- Allow users to delete their own dream videos
CREATE POLICY "Users can delete their own dream videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'dream-videos' AND auth.uid() IS NOT NULL);
