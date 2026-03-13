
import { supabase } from '@/integrations/supabase/client';

// Check if a user has access to premium features
export const checkFeatureAccess = async (featureType: 'analysis' | 'image'): Promise<boolean> => {
  try {
    console.log(`Checking access for feature: ${featureType}`);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleData) return true;
    
    const { data: userSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (userSubscription) return checkCreditsForSubscription(userSubscription, featureType);
    
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerData?.customer_id) {
      const { data: subscription } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (subscription) return checkCreditsForSubscription(subscription, featureType);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
};

const checkCreditsForSubscription = (subscription: any, featureType: 'analysis' | 'image'): boolean => {
  if (featureType === 'analysis') return true;
  
  const imageUsed = subscription.image_generations_used || 0;
  
  if (subscription.subscription_id?.startsWith('revenuecat_') || 
      subscription.price_id === 'com.lucidrepo.limited.monthly' ||
      subscription.price_id === 'com.lucidrepo.unlimited.monthly') {
    if (subscription.price_id === 'com.lucidrepo.unlimited.monthly') return imageUsed < 1000;
    if (subscription.price_id === 'com.lucidrepo.limited.monthly') return imageUsed < 10;
    return imageUsed < 1000;
  }
  
  const isBasic = subscription.price_id === 'price_basic';
  const isPremium = subscription.price_id === 'price_premium';
  if (!isBasic && !isPremium) return false;
  
  const imageLimit = isPremium ? 1000 : (isBasic ? 10 : 0);
  return imageUsed < imageLimit;
};

export const incrementFeatureUsage = async (featureType: 'analysis' | 'image'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleData) return true;
    
    const { error: directError } = await supabase.rpc(
      'increment_subscription_usage_by_user',
      { user_id_param: user.id, credit_type: featureType }
    );
    
    if (!directError) return true;
    
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!customerData?.customer_id) return false;
    
    if (featureType === 'image') {
      const { error: usageError } = await supabase.rpc(
        'increment_subscription_usage',
        { customer_id: customerData.customer_id, credit_type: featureType }
      );
      if (usageError) return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return false;
  }
};

export const showSubscriptionPrompt = (featureType: 'analysis' | 'image') => {
  const feature = featureType === 'analysis' ? 'dream analysis' : 'image generation';
  console.warn(`Premium feature limit reached: ${feature}`);
};

export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleData) return true;
    
    const { data: userSubscription } = await supabase
      .from('stripe_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (userSubscription) return true;
    
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!customerData?.customer_id) return false;
    
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
