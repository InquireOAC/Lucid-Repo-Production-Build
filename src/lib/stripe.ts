
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
      console.log('No customer found for user - checking for any active subscription');
      
      // Also check if there might be any active subscription for this user
      // (in case the customer record is missing but subscription exists)
      const { data: directSubscription } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (directSubscription) {
        console.log('Found direct subscription for user:', directSubscription);
        return checkCreditsForSubscription(directSubscription, featureType);
      }
      
      return false;
    }
    
    console.log('Found customer ID:', customerData.customer_id);
    
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
      
      // Fallback: Check subscription directly if RPC fails
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (subscription) {
        console.log('Using fallback subscription check');
        return checkCreditsForSubscription(subscription, featureType);
      }
      
      return false;
    }
    
    console.log(`Access for ${featureType}: ${hasAccess}`);
    return !!hasAccess;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

// Helper function to check credits for a subscription object
const checkCreditsForSubscription = (subscription: any, featureType: 'analysis' | 'image'): boolean => {
  const isBasic = subscription.price_id === 'price_basic';
  const isPremium = subscription.price_id === 'price_premium';
  
  if (!isBasic && !isPremium) {
    return false;
  }
  
  // Get credit limits
  const analysisLimit = isPremium ? 999999 : (isBasic ? 999999 : 0);
  const imageLimit = isPremium ? 999999 : (isBasic ? 10 : 0);
  
  // Get used credits
  const analysisUsed = subscription.dream_analyses_used || 0;
  const imageUsed = subscription.image_generations_used || 0;
  
  if (featureType === 'analysis') {
    return analysisUsed < analysisLimit;
  } else if (featureType === 'image') {
    return imageUsed < imageLimit;
  }
  
  return false;
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
    
    if (customerError || !customerData?.customer_id) {
      // Try to find subscription by user_id directly (for iOS purchases)
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('customer_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (subscription?.customer_id) {
        return incrementUsageForCustomer(subscription.customer_id, featureType);
      }
      
      console.error('No customer or subscription found for user');
      return false;
    }
    
    return incrementUsageForCustomer(customerData.customer_id, featureType);
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return false;
  }
};

// Helper function to increment usage for a customer
const incrementUsageForCustomer = async (customerId: string, featureType: 'analysis' | 'image'): Promise<boolean> => {
  try {
    console.log(`Incrementing ${featureType} usage for customer: ${customerId}`);
    
    // Increment usage for this feature
    const { error: usageError } = await supabase.rpc(
      'increment_subscription_usage',
      { 
        customer_id: customerId,
        credit_type: featureType
      }
    );
    
    if (usageError) {
      console.error('Failed to increment usage:', usageError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing usage for customer:', error);
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
    
    // Check for active subscription by user_id first (covers iOS purchases)
    const { data: directSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (directSubscription) {
      return true;
    }
    
    // Fallback to customer-based lookup for Stripe subscriptions
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
