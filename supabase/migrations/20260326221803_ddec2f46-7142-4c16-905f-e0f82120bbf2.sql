CREATE OR REPLACE FUNCTION public.increment_view_count(p_dream_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE dream_entries
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_dream_id;
$$;