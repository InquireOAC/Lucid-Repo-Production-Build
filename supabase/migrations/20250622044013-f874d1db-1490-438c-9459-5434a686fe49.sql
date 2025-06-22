
-- Add user_id column to stripe_subscriptions table for cross-device subscription access
ALTER TABLE stripe_subscriptions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance on user_id lookups
CREATE INDEX idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);

-- Update existing RevenueCat subscriptions to include user_id based on customer_id pattern
UPDATE stripe_subscriptions 
SET user_id = CAST(SUBSTRING(customer_id FROM 'revenuecat_(.*)') AS uuid)
WHERE customer_id LIKE 'revenuecat_%' 
AND user_id IS NULL;
