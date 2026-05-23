
DROP VIEW IF EXISTS public.stripe_user_orders;
CREATE VIEW public.stripe_user_orders
WITH (security_invoker = true) AS
SELECT c.customer_id, o.id AS order_id, o.checkout_session_id, o.payment_intent_id,
       o.amount_subtotal, o.amount_total, o.currency, o.payment_status,
       o.status AS order_status, o.created_at AS order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.deleted_at IS NULL AND c.user_id = auth.uid();

DROP VIEW IF EXISTS public.stripe_user_subscriptions;
CREATE VIEW public.stripe_user_subscriptions
WITH (security_invoker = true) AS
SELECT c.customer_id, s.subscription_id, s.status AS subscription_status,
       s.price_id, s.current_period_start, s.current_period_end,
       s.cancel_at_period_end, s.payment_method_brand, s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.deleted_at IS NULL AND c.user_id = auth.uid();
