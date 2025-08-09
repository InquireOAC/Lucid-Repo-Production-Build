-- Fix security definer view issues by recreating all views without SECURITY DEFINER

-- Drop and recreate public_profiles view
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  avatar_symbol,
  avatar_color,
  bio,
  created_at
FROM public.profiles;

-- Drop and recreate stripe_user_subscriptions view
DROP VIEW IF EXISTS public.stripe_user_subscriptions;
CREATE VIEW public.stripe_user_subscriptions AS
SELECT 
  c.customer_id,
  s.subscription_id,
  s.status AS subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON (c.customer_id = s.customer_id)
WHERE (c.deleted_at IS NULL);

-- Drop and recreate stripe_user_orders view  
DROP VIEW IF EXISTS public.stripe_user_orders;
CREATE VIEW public.stripe_user_orders AS
SELECT 
  c.customer_id,
  o.id AS order_id,
  o.checkout_session_id,
  o.payment_intent_id,
  o.amount_subtotal,
  o.amount_total,
  o.currency,
  o.payment_status,
  o.status AS order_status,
  o.created_at AS order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON (c.customer_id = o.customer_id)
WHERE (c.deleted_at IS NULL);

-- Grant proper access to all views
GRANT SELECT ON public.public_profiles TO authenticated, anon;
GRANT SELECT ON public.stripe_user_subscriptions TO authenticated;
GRANT SELECT ON public.stripe_user_orders TO authenticated;