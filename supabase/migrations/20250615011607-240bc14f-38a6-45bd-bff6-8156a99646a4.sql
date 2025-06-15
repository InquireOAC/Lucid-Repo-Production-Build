
-- Create credit_transactions table to track all credit grants
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_granted INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'RevenueCat webhook',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add available_credits column to profiles table (assuming you want to track credits there)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS available_credits INTEGER NOT NULL DEFAULT 0;

-- Enable RLS on credit_transactions table
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own credit transactions
CREATE POLICY "Users can view their own credit transactions" 
  ON public.credit_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for authenticated users to view their own profile credits
CREATE POLICY "Users can view their own credits" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Add index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_timestamp ON public.credit_transactions(timestamp);
