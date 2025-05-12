
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Check if a user has access to premium features
export const checkFeatureAccess = async (featureType: 'analysis' | 'image'): Promise<boolean> => {
  try {
    console.log(`Checking access for feature: ${featureType}`);
    
    // First, check if the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return false;
    }
    
    // Special case for admin users for testing
    if (user.email === "inquireoac@gmail.com") {
      console.log('Admin user, granting access');
      return true;
    }
    
    // Get the customer ID associated with this user
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerError) {
      console.error('Customer lookup error:', customerError);
      return false;
    }
    
    if (!customerData?.customer_id) {
      console.log('No Stripe customer found for user');
      return false;
    }
    
    // Check if the user has enough credits
    const { data: hasAccess, error: accessError } = await supabase.rpc(
      'check_subscription_credits',
      { 
        customer_id: customerData.customer_id,
        credit_type: featureType
      }
    );
    
    if (accessError) {
      console.error('Credit check error:', accessError);
      return false;
    }
    
    console.log(`Access for ${featureType}: ${hasAccess}`);
    return !!hasAccess;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

// Increment usage for a specific feature
export const incrementFeatureUsage = async (featureType: 'analysis' | 'image'): Promise<boolean> => {
  try {
    // First, check if the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Special case for admin users
    if (user.email === "inquireoac@gmail.com") {
      console.log('Admin user, not incrementing usage');
      return true;
    }
    
    // Get the customer ID associated with this user
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerError || !customerData?.customer_id) return false;
    
    console.log(`Incrementing ${featureType} usage for customer: ${customerData.customer_id}`);
    
    // Increment usage for this feature
    const { error: usageError } = await supabase.rpc(
      'increment_subscription_usage',
      { 
        customer_id: customerData.customer_id,
        credit_type: featureType
      }
    );
    
    if (usageError) {
      console.error('Failed to increment usage:', usageError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return false;
  }
};

// Helper function to show consistent subscription prompts
export const showSubscriptionPrompt = (featureType: 'analysis' | 'image') => {
  const feature = featureType === 'analysis' ? 'dream analysis' : 'image generation';
  
  toast.error(`Premium feature limit reached`, {
    description: `You've used all your ${feature} credits for this billing period. Upgrade your plan to continue.`,
    action: {
      label: 'Upgrade',
      onClick: () => window.location.href = '/profile?tab=subscription'
    },
    duration: 5000
  });
};

// Helper function for checking if a user has a valid subscription
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    // First, check if the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }
    
    // Special case for admin users
    if (user.email === "inquireoac@gmail.com") {
      return true;
    }
    
    // Get the customer ID associated with this user
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerError || !customerData?.customer_id) {
      return false;
    }
    
    // Check if the user has an active subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('customer_id', customerData.customer_id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (subscriptionError) {
      return false;
    }
    
    return !!subscriptionData;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
