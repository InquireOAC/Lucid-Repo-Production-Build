import { supabase } from '@/integrations/supabase/client';

// Function to check if a user has an active subscription
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error("Error fetching subscription status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
};

// Helper function to show consistent subscription prompts
export const showSubscriptionPrompt = (featureType: 'analysis' | 'image') => {
  const feature = featureType === 'analysis' ? 'dream analysis' : 'image generation';
  console.warn(`Premium feature limit reached: ${feature}`);
};
