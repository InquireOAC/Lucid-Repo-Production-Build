-- Add audio_url column to dream_entries table only
ALTER TABLE public.dream_entries ADD COLUMN IF NOT EXISTS audio_url TEXT;