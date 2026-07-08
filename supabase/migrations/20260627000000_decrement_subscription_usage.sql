-- Best-effort counterpart to increment_subscription_usage_by_user.
-- Used by edge functions to refund a metered image/analysis credit when the
-- downstream AI generation fails AFTER the credit was already consumed, so a
-- user is never charged for a render that didn't complete.
CREATE OR REPLACE FUNCTION public.decrement_subscription_usage_by_user(user_id_param uuid, credit_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.stripe_subscriptions
  SET
    dream_analyses_used = CASE
      WHEN credit_type = 'analysis'
      THEN GREATEST(COALESCE(dream_analyses_used, 0) - 1, 0)
      ELSE dream_analyses_used
    END,
    image_generations_used = CASE
      WHEN credit_type = 'image'
      THEN GREATEST(COALESCE(image_generations_used, 0) - 1, 0)
      ELSE image_generations_used
    END,
    updated_at = now()
  WHERE user_id = user_id_param
    AND deleted_at IS NULL
    AND status = 'active';
END;
$function$;
