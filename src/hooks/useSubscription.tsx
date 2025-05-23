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
      
      // First get the customer record
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
        console.log("No customer ID found for user");
        setSubscription(null);
        return;
      }

      console.log(`Found customer ID: ${customerData.customer_id}`);

      // Then get the subscription details
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
        console.log("Subscription data found:", subscriptionData);

        // Get proper limits from plan id
        let analysisTotal: number;
        let imageTotal: number;
        if (subscriptionData.price_id === 'price_premium') {
          analysisTotal = 999999;
          imageTotal = 999999;
        } else if (subscriptionData.price_id === 'price_basic') {
          analysisTotal = 10;
          imageTotal = 10;
        } else {
          analysisTotal = 0;
          imageTotal = 0;
        }

        setSubscription({
          plan: subscriptionData.price_id === 'price_premium' ? 'Premium' : 'Basic',
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
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end
        });
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
