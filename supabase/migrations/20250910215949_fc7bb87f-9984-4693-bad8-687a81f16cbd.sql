-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('dream-audio', 'dream-audio', true);

-- Create RLS policies for dream-audio bucket
CREATE POLICY "Users can view their own audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dream-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'dream-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'dream-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'dream-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view public audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'dream-audio');