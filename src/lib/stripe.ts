
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
    
    // Check if user has admin role in database
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleData) {
      console.log('Admin user detected via database role, granting access');
      return true;
    }
    
    // PRIORITY 1: Check for active subscription by user_id (covers ALL subscription types including RevenueCat)
    const { data: userSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (userSubscription) {
      console.log('Found active subscription by user_id:', userSubscription);
      return checkCreditsForSubscription(userSubscription, featureType);
    }
    
    // FALLBACK: Check by customer_id for legacy subscriptions
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerData?.customer_id) {
      console.log('Found customer ID:', customerData.customer_id);
      
      // Check for active subscription
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (subscription) {
        console.log('Found active subscription by customer_id:', subscription);
        return checkCreditsForSubscription(subscription, featureType);
      }
    }
    
    console.log('No active subscription found for user');
    return false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

// Helper function to check credits for a subscription object
const checkCreditsForSubscription = (subscription: any, featureType: 'analysis' | 'image'): boolean => {
  console.log('Checking credits for subscription:', subscription.price_id, 'Feature:', featureType);
  
  // Check for RevenueCat subscriptions
  if (subscription.subscription_id?.startsWith('revenuecat_') || 
      subscription.price_id === 'com.lucidrepo.limited.monthly' ||
      subscription.price_id === 'com.lucidrepo.unlimited.monthly') {
    
    console.log('RevenueCat subscription detected');
    
    if (featureType === 'analysis') {
      // Analysis is unlimited for all active subscriptions
      return true;
    } else if (featureType === 'image') {
      const imageUsed = subscription.image_generations_used || 0;
      
      if (subscription.price_id === 'com.lucidrepo.unlimited.monthly') {
        const hasCredits = imageUsed < 1000; // Premium: 1000 images
        console.log(`Premium RevenueCat: ${imageUsed}/1000 images used, access: ${hasCredits}`);
        return hasCredits;
      } else if (subscription.price_id === 'com.lucidrepo.limited.monthly') {
        const hasCredits = imageUsed < 10; // Basic: 10 images
        console.log(`Basic RevenueCat: ${imageUsed}/10 images used, access: ${hasCredits}`);
        return hasCredits;
      } else {
        // Default for iOS subscriptions without clear price_id
        const hasCredits = imageUsed < 1000;
        console.log(`Default iOS subscription: ${imageUsed}/1000 images used, access: ${hasCredits}`);
        return hasCredits;
      }
    }
  }
  
  // Check for Stripe subscriptions
  const isBasic = subscription.price_id === 'price_basic';
  const isPremium = subscription.price_id === 'price_premium';
  
  console.log('Stripe subscription detected - Basic:', isBasic, 'Premium:', isPremium);
  
  if (!isBasic && !isPremium) {
    console.log('Unknown price_id for Stripe subscription:', subscription.price_id);
    return false;
  }
  
  if (featureType === 'analysis') {
    // Analysis is unlimited for all active subscriptions
    return true;
  } else if (featureType === 'image') {
    const imageUsed = subscription.image_generations_used || 0;
    const imageLimit = isPremium ? 1000 : (isBasic ? 10 : 0);
    const hasCredits = imageUsed < imageLimit;
    console.log(`Stripe ${isPremium ? 'Premium' : 'Basic'}: ${imageUsed}/${imageLimit} images used, access: ${hasCredits}`);
    return hasCredits;
  }
  
  return false;
};

// Increment usage for a specific feature
export const incrementFeatureUsage = async (featureType: 'analysis' | 'image'): Promise<boolean> => {
  try {
    console.log(`Incrementing usage for feature: ${featureType}`);
    
    // First, check if the user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in for usage increment');
      return false;
    }
    
    // Check if user has admin role - admins don't increment usage
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleData) {
      console.log('Admin user detected, not incrementing usage');
      return true;
    }
    
    // PRIORITY 1: Try to increment by user_id first (now available!)
    console.log('Incrementing usage by user_id for:', featureType);
    const { error: directError } = await supabase.rpc(
      'increment_subscription_usage_by_user',
      { 
        user_id_param: user.id,
        credit_type: featureType
      }
    );
    
    if (!directError) {
      console.log('Successfully incremented usage by user_id for:', featureType);
      return true;
    }
    
    console.log('Direct user_id increment failed, trying customer_id method...', directError);
    
    // FALLBACK: Get customer record and increment by customer_id
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!customerData?.customer_id) {
      console.error('No customer found for user');
      return false;
    }
    
    console.log('Found customer ID for usage increment:', customerData.customer_id);
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
        console.error('Failed to increment usage via RPC:', usageError);
        return false;
      }
      
      console.log('Successfully incremented image usage');
    } else {
      console.log('Analysis usage not incremented (unlimited)');
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
    
    // Check if user has admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleData) {
      return true;
    }
    
    // PRIORITY 1: Check by user_id for active subscription (covers all types)
    const { data: userSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (userSubscription) {
      return true;
    }
    
    // FALLBACK: Check for customer record and active subscription by customer_id
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!customerData?.customer_id) {
      return false;
    }
    
    // Check if the user has an active subscription
    const { data: subscriptionData } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('customer_id', customerData.customer_id)
      .eq('status', 'active')
      .maybeSingle();
    
    return !!subscriptionData;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
