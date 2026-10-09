-- Add soft-delete archive flag to dream_entries
ALTER TABLE public.dream_entries
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dream_entries_archived
  ON public.dream_entries (user_id, is_archived);
