-- ============================================================
-- Lucid Engine `projects` table (shared-Supabase hand-off target).
--
-- src/lib/dream-to-project.ts (exportDreamToSharedDb) upserts a dream into
-- this table so it can be opened in the Lucid Engine studio. The table and
-- its RLS policies were never defined in this repo, so the write silently
-- failed and the app fell back to a bare deep-link. This migration creates
-- the table with owner-only RLS so the export both works and is secure.
--
-- Columns mirror exactly what exportDreamToSharedDb writes. Lucid Engine may
-- add more columns of its own; this is the minimal shared contract.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text,
  dream_text      text,
  film_style      text DEFAULT 'lucid-realism',
  aspect_ratio    text DEFAULT '16:9',
  status          text DEFAULT 'draft',
  thumbnail_url   text,
  source_app      text,
  source_dream_id uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_projects_source_dream_id ON public.projects (source_dream_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Owner-only access. Without these, any authenticated user could read/write
-- any project once the table exists.
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Keep updated_at fresh on upsert/update.
CREATE OR REPLACE FUNCTION public.touch_projects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_projects_updated_at();
