
-- Dream Series table
CREATE TABLE public.dream_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_image_url text,
  tags text[] DEFAULT '{}'::text[],
  is_public boolean DEFAULT false,
  status text NOT NULL DEFAULT 'ongoing',
  like_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  chapter_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dream Series Chapters table
CREATE TABLE public.dream_series_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.dream_series(id) ON DELETE CASCADE,
  dream_id uuid NOT NULL REFERENCES public.dream_entries(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(series_id, dream_id),
  UNIQUE(series_id, chapter_number)
);

-- Dream Series Follows table
CREATE TABLE public.dream_series_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  series_id uuid NOT NULL REFERENCES public.dream_series(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- Enable RLS
ALTER TABLE public.dream_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_series_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_series_follows ENABLE ROW LEVEL SECURITY;

-- dream_series policies
CREATE POLICY "Anyone can view public series" ON public.dream_series FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own series" ON public.dream_series FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own series" ON public.dream_series FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own series" ON public.dream_series FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own series" ON public.dream_series FOR DELETE USING (auth.uid() = user_id);

-- dream_series_chapters policies
CREATE POLICY "Anyone can view chapters of public series" ON public.dream_series_chapters FOR SELECT USING (EXISTS (SELECT 1 FROM public.dream_series WHERE id = series_id AND is_public = true));
CREATE POLICY "Users can view chapters of own series" ON public.dream_series_chapters FOR SELECT USING (EXISTS (SELECT 1 FROM public.dream_series WHERE id = series_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage chapters of own series" ON public.dream_series_chapters FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.dream_series WHERE id = series_id AND user_id = auth.uid()));
CREATE POLICY "Users can update chapters of own series" ON public.dream_series_chapters FOR UPDATE USING (EXISTS (SELECT 1 FROM public.dream_series WHERE id = series_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete chapters of own series" ON public.dream_series_chapters FOR DELETE USING (EXISTS (SELECT 1 FROM public.dream_series WHERE id = series_id AND user_id = auth.uid()));

-- dream_series_follows policies
CREATE POLICY "Users can view their own follows" ON public.dream_series_follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can follow series" ON public.dream_series_follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow series" ON public.dream_series_follows FOR DELETE USING (auth.uid() = user_id);
