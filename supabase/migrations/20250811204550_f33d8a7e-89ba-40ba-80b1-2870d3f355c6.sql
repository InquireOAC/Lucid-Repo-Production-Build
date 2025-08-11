-- Create video_comments table
CREATE TABLE public.video_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for video comments
CREATE POLICY "Anyone can view video comments" 
ON public.video_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create video comments" 
ON public.video_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video comments" 
ON public.video_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraint to video_entries
ALTER TABLE public.video_comments
ADD CONSTRAINT fk_video_comments_video_id
FOREIGN KEY (video_id) REFERENCES public.video_entries(id) ON DELETE CASCADE;

-- Add comment count to video_entries table
ALTER TABLE public.video_entries 
ADD COLUMN comment_count INTEGER DEFAULT 0;

-- Create function to update comment count
CREATE OR REPLACE FUNCTION public.update_video_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.video_entries 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.video_entries 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic comment count updates
CREATE TRIGGER update_video_comment_count_trigger
AFTER INSERT OR DELETE ON public.video_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_video_comment_count();