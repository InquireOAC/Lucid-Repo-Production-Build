
-- Create ai_context table to store user's AI context for personalized image generation
CREATE TABLE public.ai_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  pronouns TEXT,
  age_range TEXT,
  photo_url TEXT,
  hair_color TEXT,
  hair_style TEXT,
  skin_tone TEXT,
  eye_color TEXT,
  height TEXT,
  build TEXT,
  clothing_style TEXT,
  aesthetic_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.ai_context ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI context" 
  ON public.ai_context 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI context" 
  ON public.ai_context 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI context" 
  ON public.ai_context 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI context" 
  ON public.ai_context 
  FOR DELETE 
  USING (auth.uid() = user_id);
