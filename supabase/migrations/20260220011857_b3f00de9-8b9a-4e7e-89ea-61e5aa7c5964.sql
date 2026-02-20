
CREATE TABLE public.dream_symbol_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  symbols jsonb NOT NULL DEFAULT '{}'::jsonb,
  dream_count integer NOT NULL DEFAULT 0,
  last_analyzed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_symbol_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own symbol analyses"
  ON public.dream_symbol_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symbol analyses"
  ON public.dream_symbol_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symbol analyses"
  ON public.dream_symbol_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symbol analyses"
  ON public.dream_symbol_analyses FOR DELETE
  USING (auth.uid() = user_id);
