
-- Server-side free trial tracking table
CREATE TABLE public.feature_free_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature text NOT NULL,
  used_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature)
);

ALTER TABLE public.feature_free_trials ENABLE ROW LEVEL SECURITY;

-- Users can read their own trial records
CREATE POLICY "Users can read own trials"
  ON public.feature_free_trials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own trial records
CREATE POLICY "Users can insert own trials"
  ON public.feature_free_trials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
