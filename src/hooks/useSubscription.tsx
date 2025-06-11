
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSubscription(user: any) {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);
      console.log("Fetching subscription data...");
      
      // First check for direct subscription by user_id (covers iOS purchases)
      const { data: directSubscription, error: directError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (directError) {
        console.error('Error fetching direct subscription:', directError);
      }

      if (directSubscription) {
        console.log("Found direct subscription for user:", directSubscription);
        setSubscription(formatSubscriptionData(directSubscription));
        return;
      }

      // Fallback: get customer record and check subscription via customer_id
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        setIsError(true);
        setErrorMessage('Failed to retrieve customer information');
        return;
      }

      if (!customerData?.customer_id) {
        console.log("No customer ID or direct subscription found for user");
        setSubscription(null);
        return;
      }

      console.log(`Found customer ID: ${customerData.customer_id}`);

      // Then get the subscription details via customer_id
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        setIsError(true);
        setErrorMessage('Failed to retrieve subscription details');
        return;
      }

      if (subscriptionData) {
        console.log("Subscription data found via customer_id:", subscriptionData);
        setSubscription(formatSubscriptionData(subscriptionData));
      } else {
        console.log("No active subscription found");
        setSubscription(null);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Failed to load subscription information');
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const formatSubscriptionData = (subscriptionData: any) => {
    // Get proper limits from plan id
    let analysisTotal: number;
    let imageTotal: number;
    let planName: string;

    if (subscriptionData.price_id === 'price_premium') {
      analysisTotal = 999999;
      imageTotal = 999999;
      planName = 'Premium';
    } else if (subscriptionData.price_id === 'price_basic') {
      analysisTotal = 999999; // Unlimited for Basic!
      imageTotal = 10;
      planName = 'Basic';
    } else {
      analysisTotal = 0;
      imageTotal = 0;
      planName = 'Unknown';
    }

    return {
      plan: planName,
      status: subscriptionData.status,
      currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
      analysisCredits: {
        used: subscriptionData.dream_analyses_used || 0,
        total: analysisTotal,
      },
      imageCredits: {
        used: subscriptionData.image_generations_used || 0,
        total: imageTotal,
      },
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
      // Include subscription type for debugging
      subscriptionType: subscriptionData.subscription_id?.startsWith('ios_') ? 'iOS' : 'Stripe'
    };
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user, fetchSubscription]);

  return {
    subscription,
    isLoading,
    isError,
    errorMessage,
    fetchSubscription
  };
}
