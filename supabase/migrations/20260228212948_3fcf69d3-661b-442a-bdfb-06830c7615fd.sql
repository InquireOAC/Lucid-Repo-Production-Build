
-- Create community_challenges table
CREATE TABLE public.community_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  required_tag text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  prize_description text,
  status text NOT NULL DEFAULT 'draft',
  banner_image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create challenge_entries table
CREATE TABLE public.challenge_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  dream_id uuid NOT NULL REFERENCES public.dream_entries(id) ON DELETE CASCADE,
  entered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, dream_id)
);

-- Enable RLS
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

-- community_challenges: admins can do everything
CREATE POLICY "Admins can manage challenges"
ON public.community_challenges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- community_challenges: all authenticated users can view active challenges
CREATE POLICY "Users can view active challenges"
ON public.community_challenges
FOR SELECT
TO authenticated
USING (status = 'active');

-- challenge_entries: users can insert their own entries
CREATE POLICY "Users can insert their own entries"
ON public.challenge_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- challenge_entries: users can view their own entries
CREATE POLICY "Users can view their own entries"
ON public.challenge_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- challenge_entries: admins can view all entries
CREATE POLICY "Admins can view all entries"
ON public.challenge_entries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- challenge_entries: admins can delete entries
CREATE POLICY "Admins can delete entries"
ON public.challenge_entries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
