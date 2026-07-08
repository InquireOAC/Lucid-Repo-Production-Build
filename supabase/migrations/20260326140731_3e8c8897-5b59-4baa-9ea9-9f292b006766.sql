
CREATE OR REPLACE FUNCTION public.get_poll_results(p_announcement_id uuid)
RETURNS TABLE(selected_option text, vote_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT selected_option, count(*) as vote_count
  FROM poll_responses
  WHERE announcement_id = p_announcement_id
  GROUP BY selected_option;
$$;
