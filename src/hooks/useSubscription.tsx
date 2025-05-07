
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription(user: any) {
  const [subscription, setSubscription] = useState<any>(null);

  const fetchSubscription = async () => {
    try {
      console.log("Fetching subscription data...");
      // First get the customer record
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        return;
      }

      if (!customerData?.customer_id) {
        console.log("No customer ID found for user");
        return;
      }

      console.log(`Found customer ID: ${customerData.customer_id}`);

      // Then get the subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('customer_id', customerData.customer_id)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        return;
      }

      if (subscriptionData) {
        console.log("Subscription data found:", subscriptionData);
        setSubscription({
          plan: subscriptionData.price_id === 'price_premium' ? 'Premium' : 'Basic',
          status: subscriptionData.status,
          currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
          analysisCredits: {
            used: subscriptionData.dream_analyses_used || 0,
            total: subscriptionData.price_id === 'price_premium' ? 999999 : 10
          },
          imageCredits: {
            used: subscriptionData.image_generations_used || 0,
            total: subscriptionData.price_id === 'price_premium' ? 20 : 5
          }
        });
      } else {
        console.log("No subscription data found");
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
    }
  };

  return {
    subscription,
    fetchSubscription
  };
}
