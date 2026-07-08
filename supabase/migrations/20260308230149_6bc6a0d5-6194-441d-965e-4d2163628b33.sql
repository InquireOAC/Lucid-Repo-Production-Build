
CREATE TABLE public.dream_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text,
  photo_url text,
  face_photo_url text,
  outfit_photo_url text,
  accessory_photo_url text,
  avatar_style text DEFAULT 'digital_art',
  visual_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters" ON public.dream_characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own characters" ON public.dream_characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON public.dream_characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON public.dream_characters FOR DELETE USING (auth.uid() = user_id);
