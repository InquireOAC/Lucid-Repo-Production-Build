
-- Cinematic dream specs and per-beat tracking
CREATE TABLE public.dream_cinematic_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  spec_json JSONB NOT NULL,
  total_duration NUMERIC NOT NULL DEFAULT 30,
  final_video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_cinematic_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cinematic specs" ON public.dream_cinematic_specs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cinematic specs" ON public.dream_cinematic_specs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cinematic specs" ON public.dream_cinematic_specs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cinematic specs" ON public.dream_cinematic_specs
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.dream_cinematic_beats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID NOT NULL,
  user_id UUID NOT NULL,
  beat_index INTEGER NOT NULL,
  start_time NUMERIC NOT NULL DEFAULT 0,
  end_time NUMERIC NOT NULL DEFAULT 5,
  prompt TEXT NOT NULL,
  narration_text TEXT,
  frame_url TEXT,
  video_url TEXT,
  narration_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dream_id, beat_index)
);

CREATE INDEX idx_dream_cinematic_beats_dream ON public.dream_cinematic_beats(dream_id);

ALTER TABLE public.dream_cinematic_beats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cinematic beats" ON public.dream_cinematic_beats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cinematic beats" ON public.dream_cinematic_beats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cinematic beats" ON public.dream_cinematic_beats
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cinematic beats" ON public.dream_cinematic_beats
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_cinematic_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_dream_cinematic_specs_updated
  BEFORE UPDATE ON public.dream_cinematic_specs
  FOR EACH ROW EXECUTE FUNCTION public.update_cinematic_updated_at();

CREATE TRIGGER trg_dream_cinematic_beats_updated
  BEFORE UPDATE ON public.dream_cinematic_beats
  FOR EACH ROW EXECUTE FUNCTION public.update_cinematic_updated_at();
