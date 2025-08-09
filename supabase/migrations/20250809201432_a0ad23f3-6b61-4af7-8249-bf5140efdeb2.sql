-- Create video_entries table for YouTube videos
CREATE TABLE public.video_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL UNIQUE,
  youtube_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  dreamer_story_name TEXT NOT NULL,
  duration INTEGER, -- in seconds
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.video_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for video_entries
CREATE POLICY "Anyone can view published videos" 
ON public.video_entries 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admin can manage all videos" 
ON public.video_entries 
FOR ALL
USING (auth.uid() = created_by);

CREATE POLICY "Admin can create videos" 
ON public.video_entries 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_video_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_entries_updated_at
  BEFORE UPDATE ON public.video_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_video_entries_updated_at();