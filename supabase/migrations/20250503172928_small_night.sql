/*
  # Stripe Integration Schema

  1. Types
    - Creates stripe_subscription_status and stripe_order_status enums
  2. Tables
    - stripe_customers: Stores customer information
    - stripe_subscriptions: Stores subscription details
    - stripe_orders: Stores order information
  3. Views
    - stripe_user_subscriptions: Easy access to subscription data
    - stripe_user_orders: Easy access to order data
  4. Functions
    - check_subscription_credits: Validates credit usage
    - increment_subscription_usage: Updates credit counters
    - reset_subscription_usage: Resets monthly credits
*/

-- Create subscription status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create order status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id TEXT NOT NULL UNIQUE REFERENCES stripe_customers(customer_id),
  subscription_id TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  image_generations_used INTEGER DEFAULT 0,
  dream_analyses_used INTEGER DEFAULT 0
);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status stripe_order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Drop views if they exist
DROP VIEW IF EXISTS stripe_user_subscriptions;
DROP VIEW IF EXISTS stripe_user_orders;

-- Create views for easier querying
CREATE VIEW stripe_user_subscriptions AS
SELECT 
  c.customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.deleted_at IS NULL;

CREATE VIEW stripe_user_orders AS
SELECT 
  c.customer_id,
  o.id as order_id,
  o.checkout_session_id,
  o.payment_intent_id,
  o.amount_subtotal,
  o.amount_total,
  o.currency,
  o.payment_status,
  o.status as order_status,
  o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.deleted_at IS NULL;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS check_subscription_credits(TEXT, TEXT);
DROP FUNCTION IF EXISTS increment_subscription_usage(TEXT, TEXT);
DROP FUNCTION IF EXISTS reset_subscription_usage();

-- Create functions for subscription management
CREATE FUNCTION check_subscription_credits(
  customer_id TEXT,
  credit_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  subscription RECORD;
  credit_limit INTEGER;
  credits_used INTEGER;
BEGIN
  -- Get subscription
  SELECT * INTO subscription
  FROM stripe_subscriptions
  WHERE customer_id = check_subscription_credits.customer_id
  AND deleted_at IS NULL;

  -- Check subscription status
  IF subscription.status != 'active' THEN
    RETURN FALSE;
  END IF;

  -- Set credit limit based on price_id
  credit_limit := CASE 
    WHEN subscription.price_id = 'price_basic' THEN
      CASE credit_type
        WHEN 'analysis' THEN 10
        WHEN 'image' THEN 10   -- UPDATED from 5 to 10
        ELSE 0
      END
    WHEN subscription.price_id = 'price_premium' THEN
      CASE credit_type
        WHEN 'analysis' THEN 999999 -- Unlimited analysis
        WHEN 'image' THEN 999999    -- Unlimited images (for UI/logic; enforce with RLS if needed)
        ELSE 0
      END
    ELSE 0
  END;

  -- Get used credits
  credits_used := CASE credit_type
    WHEN 'analysis' THEN subscription.dream_analyses_used
    WHEN 'image' THEN subscription.image_generations_used
    ELSE 0
  END;

  RETURN credits_used < credit_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION increment_subscription_usage(
  customer_id TEXT,
  credit_type TEXT
) RETURNS VOID AS $$
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
  WHERE customer_id = increment_subscription_usage.customer_id
  AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset usage counts monthly
CREATE FUNCTION reset_subscription_usage() RETURNS VOID AS $$
BEGIN
  UPDATE stripe_subscriptions
  SET 
    dream_analyses_used = 0,
    image_generations_used = 0,
    updated_at = now()
  WHERE deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
