-- Create function to increment subscription usage by user_id directly
CREATE OR REPLACE FUNCTION public.increment_subscription_usage_by_user(user_id_param uuid, credit_type text)
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
  AND deleted_at IS NULL
  AND status = 'active';
END;
$function$