
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
    
    // Check for active subscription by user_id first (covers RevenueCat/iOS purchases)
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
    
    // Fallback: Get the customer ID associated with this user (for Stripe subscriptions)
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
      console.log('No customer found for user');
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
  // Check for RevenueCat subscriptions
  if (subscription.subscription_id?.startsWith('ios_') || 
      subscription.price_id === 'com.lucidrepo.limited.monthly' ||
      subscription.price_id === 'com.lucidrepo.unlimited.monthly') {
    
    if (featureType === 'analysis') {
      // Analysis is unlimited for all active subscriptions
      return true;
    } else if (featureType === 'image') {
      const imageUsed = subscription.image_generations_used || 0;
      
      if (subscription.price_id === 'com.lucidrepo.unlimited.monthly') {
        return imageUsed < 1000; // Premium: 1000 images
      } else if (subscription.price_id === 'com.lucidrepo.limited.monthly') {
        return imageUsed < 25; // Basic: 25 images
      } else {
        // Default for iOS subscriptions without clear price_id
        return imageUsed < 1000;
      }
    }
  }
  
  // Check for Stripe subscriptions
  const isBasic = subscription.price_id === 'price_basic';
  const isPremium = subscription.price_id === 'price_premium';
  
  if (!isBasic && !isPremium) {
    return false;
  }
  
  if (featureType === 'analysis') {
    // Analysis is unlimited for all active subscriptions
    return true;
  } else if (featureType === 'image') {
    const imageUsed = subscription.image_generations_used || 0;
    const imageLimit = isPremium ? 1000 : (isBasic ? 25 : 0);
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
    
    // Check for direct subscription first (RevenueCat/iOS)
    const { data: directSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (directSubscription?.customer_id) {
      return incrementUsageForCustomer(directSubscription.customer_id, featureType);
    }
    
    // Fallback: Get the customer ID associated with this user (Stripe)
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerError || !customerData?.customer_id) {
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
    
    // Only increment image usage since analysis is unlimited
    if (featureType === 'image') {
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
    
    // Check for active subscription by user_id first (covers RevenueCat/iOS purchases)
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
