
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { revenueCatManager } from "@/utils/revenueCatManager";

export function useSubscription(user: any) {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchedUser = useRef<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      // Prevent duplicate fetches
      if (fetchingRef.current && lastFetchedUser.current === user.id) {
        console.log("Subscription fetch already in progress for this user, skipping...");
        return;
      }
      
      fetchingRef.current = true;
      lastFetchedUser.current = user.id;
      
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);
      console.log("Fetching subscription data for user:", user.id);
      console.log("User email:", user.email);
      
      // ALWAYS check Supabase first for user subscriptions - this covers ALL subscription types
      console.log("Checking Supabase for any active subscription by user_id...");
      const { data: userSubscription, error: userSubError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (userSubError) {
        console.error('Error fetching user subscription:', userSubError);
      }

      if (userSubscription) {
        console.log("Found active subscription for user:", userSubscription);
        setSubscription(formatSubscriptionData(userSubscription));
        return;
      }

      console.log("No subscription found by user_id");

      // On native platforms, check RevenueCat briefly
      if (Capacitor.isNativePlatform()) {
        try {
          console.log("Checking RevenueCat for subscription...");
          const result = await revenueCatManager.getCustomerInfo();
          const customerInfo = result.customerInfo;
          const activeEntitlements = customerInfo.entitlements.active;
          
          if (Object.keys(activeEntitlements).length > 0) {
            const [entitlementKey, entitlement] = Object.entries(activeEntitlements)[0];
            console.log("Found RevenueCat entitlement:", entitlementKey);
            
            // Format RevenueCat subscription data temporarily
            const revenuecatSubscription = formatRevenueCatSubscription(entitlement, entitlementKey);
            setSubscription(revenuecatSubscription);
            
            // Trigger sync in background without waiting
            triggerBackgroundSync();
            return;
          }
        } catch (revenueCatError) {
          console.error('RevenueCat check failed:', revenueCatError);
        }
      }

      // Fallback: check by customer_id for web-based Stripe subscriptions
      if (!Capacitor.isNativePlatform()) {
        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (customerData?.customer_id) {
          const { data: subscriptionData } = await supabase
            .from('stripe_subscriptions')
            .select('*')
            .eq('customer_id', customerData.customer_id)
            .eq('status', 'active')
            .maybeSingle();

          if (subscriptionData) {
            console.log("Found subscription by customer_id:", subscriptionData);
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
      fetchingRef.current = false;
    }
  }, [user]);

  // Background sync without blocking the UI
  const triggerBackgroundSync = useCallback(async () => {
    try {
      if (!Capacitor.isNativePlatform()) return;
      
      const result = await revenueCatManager.getCustomerInfo();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return;

      // Fire and forget sync
      supabase.functions.invoke('sync-revenuecat-subscription', {
        body: { customerInfo: result.customerInfo },
        headers: { Authorization: `Bearer ${session.access_token}` }
      }).then(() => {
        console.log('Background sync completed');
        // Refresh after successful sync
        setTimeout(() => fetchSubscription(), 2000);
      }).catch(error => {
        console.error('Background sync failed:', error);
      });
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, [fetchSubscription]);

  const formatRevenueCatSubscription = useCallback((entitlement: any, entitlementKey: string) => {
    console.log("Formatting RevenueCat subscription:", entitlement);
    
    // Determine plan type from product identifier
    let planName: string;
    let imageTotal: number;
    
    if (entitlement.productIdentifier === 'com.lucidrepo.unlimited.monthly') {
      planName = 'Premium';
      imageTotal = 1000;
    } else if (entitlement.productIdentifier === 'com.lucidrepo.limited.monthly') {
      planName = 'Basic';
      imageTotal = 10;
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
  }, []);

  const formatSubscriptionData = useCallback((subscriptionData: any) => {
    // Determine plan type from price_id or subscription_id
    let planName: string;
    let imageTotal: number;
    
    // Check for RevenueCat iOS subscriptions first
    if (subscriptionData.subscription_id?.startsWith('revenuecat_') || 
        subscriptionData.price_id === 'com.lucidrepo.limited.monthly' ||
        subscriptionData.price_id === 'com.lucidrepo.unlimited.monthly') {
      
      if (subscriptionData.price_id === 'com.lucidrepo.unlimited.monthly') {
        planName = 'Premium';
        imageTotal = 1000;
      } else if (subscriptionData.price_id === 'com.lucidrepo.limited.monthly') {
        planName = 'Basic';
        imageTotal = 10;
      } else {
        // Fallback for RevenueCat subscriptions without clear price_id
        planName = 'Premium'; // Default to premium for RevenueCat
        imageTotal = 1000;
      }
    } else if (subscriptionData.price_id === 'price_premium') {
      planName = 'Premium';
      imageTotal = 1000;
    } else if (subscriptionData.price_id === 'price_basic') {
      planName = 'Basic';
      imageTotal = 10;
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
      subscriptionType: subscriptionData.subscription_id?.startsWith('revenuecat_') ? 'RevenueCat' : 'Stripe'
    };
  }, []);

  // Clear subscription state when user changes (including sign out)
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      fetchingRef.current = false;
      lastFetchedUser.current = null;
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && (!lastFetchedUser.current || lastFetchedUser.current !== user.id)) {
      fetchSubscription();
    }
  }, [user?.id, fetchSubscription]);

  // Refresh function that can be called externally
  const refreshSubscription = useCallback(() => {
    if (user?.id) {
      fetchingRef.current = false; // Reset fetch guard
      fetchSubscription();
    }
  }, [user?.id, fetchSubscription]);

  return useMemo(() => ({
    subscription,
    isLoading,
    isError,
    errorMessage,
    fetchSubscription,
    refreshSubscription
  }), [subscription, isLoading, isError, errorMessage, fetchSubscription, refreshSubscription]);
}
