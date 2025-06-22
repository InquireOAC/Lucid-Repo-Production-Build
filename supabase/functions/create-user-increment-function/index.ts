
-- This is a one-time SQL function to create the increment_subscription_usage_by_user function
CREATE OR REPLACE FUNCTION public.increment_subscription_usage_by_user(user_id_param uuid, credit_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE stripe_subscriptions
  SET 
    dream_analyses_used = CASE 
      WHEN credit_type = 'analysis' 
      THEN dream_analyses_used + 1 
      ELSE dream_analyses_used 
    END,
    image_generations_used = CASE 
      WHEN credit_type = 'image' 
      THEN image_generations_used + 1 
      ELSE image_generations_used 
    END,
    updated_at = now()
  WHERE user_id = user_id_param
  AND status = 'active'
  AND deleted_at IS NULL;
END;
$function$
