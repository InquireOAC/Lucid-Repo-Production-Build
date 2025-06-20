
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";

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
      console.log("Fetching subscription data for user:", user.id);
      
      // On native platforms, prioritize RevenueCat first
      if (Capacitor.isNativePlatform()) {
        try {
          console.log("Checking RevenueCat subscription status...");
          const result = await Purchases.getCustomerInfo();
          const customerInfo = result.customerInfo;
          const activeEntitlements = customerInfo.entitlements.active;
          
          console.log("RevenueCat customer info:", customerInfo);
          console.log("Active entitlements:", activeEntitlements);
          
          if (Object.keys(activeEntitlements).length > 0) {
            // User has active RevenueCat subscription
            const [entitlementKey, entitlement] = Object.entries(activeEntitlements)[0];
            console.log("Found active RevenueCat entitlement:", entitlementKey, entitlement);
            
            // Format RevenueCat subscription data
            const revenuecatSubscription = formatRevenueCatSubscription(entitlement, entitlementKey);
            setSubscription(revenuecatSubscription);
            return;
          } else {
            console.log("No active RevenueCat entitlements found");
          }
        } catch (revenueCatError) {
          console.error('RevenueCat check failed:', revenueCatError);
          // Continue to Supabase check as fallback
        }
      }

      // Check for direct subscription by user_id (covers synced RevenueCat purchases)
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

      // Fallback: get customer record and check subscription via customer_id (for Stripe)
      if (!Capacitor.isNativePlatform()) {
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (customerError) {
          console.error('Error fetching customer:', customerError);
        }

        if (customerData?.customer_id) {
          console.log(`Found customer ID: ${customerData.customer_id}`);

          // Get the subscription details via customer_id
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
            return;
          }
        }
      }

      console.log("No active subscription found");
      setSubscription(null);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Failed to load subscription information');
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const formatRevenueCatSubscription = (entitlement: any, entitlementKey: string) => {
    console.log("Formatting RevenueCat subscription:", entitlement);
    
    // Determine plan type from product identifier
    let planName: string;
    let imageTotal: number;
    
    if (entitlement.productIdentifier === 'com.lucidrepo.unlimited.monthly') {
      planName = 'Premium';
      imageTotal = 1000;
    } else if (entitlement.productIdentifier === 'com.lucidrepo.limited.monthly') {
      planName = 'Basic';
      imageTotal = 25;
    } else {
      // Default to Premium for unrecognized products
      planName = 'Premium';
      imageTotal = 1000;
    }

    const expirationDate = entitlement.expirationDate 
      ? new Date(entitlement.expirationDate).toLocaleDateString()
      : 'Active';

    return {
      plan: planName,
      status: 'active',
      currentPeriodEnd: expirationDate,
      analysisCredits: {
        used: 0,
        total: 999999,
        remaining: 999999,
      },
      imageCredits: {
        used: 0,
        total: imageTotal,
        remaining: imageTotal,
      },
      cancelAtPeriodEnd: false,
      subscriptionType: 'RevenueCat',
      productIdentifier: entitlement.productIdentifier
    };
  };

  const formatSubscriptionData = (subscriptionData: any) => {
    // Determine plan type from price_id or subscription_id
    let planName: string;
    let imageTotal: number;
    
    // Check for RevenueCat iOS subscriptions first
    if (subscriptionData.subscription_id?.startsWith('ios_') || 
        subscriptionData.price_id === 'com.lucidrepo.limited.monthly' ||
        subscriptionData.price_id === 'com.lucidrepo.unlimited.monthly') {
      
      if (subscriptionData.price_id === 'com.lucidrepo.unlimited.monthly') {
        planName = 'Premium';
        imageTotal = 1000;
      } else if (subscriptionData.price_id === 'com.lucidrepo.limited.monthly') {
        planName = 'Basic';
        imageTotal = 25;
      } else {
        // Fallback for iOS subscriptions without clear price_id
        planName = 'Premium'; // Default to premium for iOS
        imageTotal = 1000;
      }
    } else if (subscriptionData.price_id === 'price_premium') {
      planName = 'Premium';
      imageTotal = 1000;
    } else if (subscriptionData.price_id === 'price_basic') {
      planName = 'Basic';
      imageTotal = 25;
    } else {
      planName = 'Unknown';
      imageTotal = 0;
    }

    // Analysis is unlimited for all active subscriptions
    const analysisTotal = 999999;

    // Calculate remaining credits
    const imageUsed = subscriptionData.image_generations_used || 0;
    const imageRemaining = Math.max(0, imageTotal - imageUsed);

    return {
      plan: planName,
      status: subscriptionData.status,
      currentPeriodEnd: subscriptionData.current_period_end 
        ? new Date(subscriptionData.current_period_end * 1000).toLocaleDateString()
        : 'N/A',
      analysisCredits: {
        used: subscriptionData.dream_analyses_used || 0,
        total: analysisTotal,
        remaining: analysisTotal, // Always unlimited
      },
      imageCredits: {
        used: imageUsed,
        total: imageTotal,
        remaining: imageRemaining,
      },
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
      // Include subscription type for debugging
      subscriptionType: subscriptionData.subscription_id?.startsWith('ios_') ? 'RevenueCat' : 'Stripe'
    };
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user, fetchSubscription]);

  // Refresh function that can be called externally
  const refreshSubscription = useCallback(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user, fetchSubscription]);

  return {
    subscription,
    isLoading,
    isError,
    errorMessage,
    fetchSubscription,
    refreshSubscription
  };
}
