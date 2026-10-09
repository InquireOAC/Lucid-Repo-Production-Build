-- Link dream entries to their side-character placeholders.
-- The array stores dream_characters.id values that were either auto-extracted
-- from the dream text or manually added by the user. Cascade is handled
-- in app code, not SQL, because dropping a character should keep prior
-- dreams readable (just removes the linkage on next save).
ALTER TABLE public.dream_entries
  ADD COLUMN dream_character_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

CREATE INDEX IF NOT EXISTS idx_dream_entries_character_ids
  ON public.dream_entries USING gin (dream_character_ids);
