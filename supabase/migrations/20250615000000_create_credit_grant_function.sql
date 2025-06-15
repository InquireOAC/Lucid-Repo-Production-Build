
-- Create a function to handle credit grants atomically
CREATE OR REPLACE FUNCTION public.process_credit_grant(
  p_user_id UUID,
  p_credits_granted INTEGER,
  p_source TEXT,
  p_entitlement TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert credit transaction record
  INSERT INTO public.credit_transactions (
    user_id,
    credits_granted,
    source,
    timestamp
  ) VALUES (
    p_user_id,
    p_credits_granted,
    p_source,
    now()
  );

  -- Update user's available credits
  UPDATE public.profiles 
  SET available_credits = available_credits + p_credits_granted,
      updated_at = now()
  WHERE id = p_user_id;

  -- Verify the update affected a row
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
END;
$$;
