import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { revenueCatManager } from "@/utils/revenueCatManager";

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

      console.log("No subscription found by user_id, checking RevenueCat...");

      // On native platforms, check RevenueCat with detailed logging
      if (Capacitor.isNativePlatform()) {
        try {
          console.log("Initializing RevenueCat with user ID:", user.id);
          await revenueCatManager.initialize(user.id);
          
          console.log("Checking RevenueCat for subscription...");
          const result = await revenueCatManager.getCustomerInfo();
          const customerInfo = result.customerInfo;
          const activeEntitlements = customerInfo.entitlements.active;
          
          console.log("RevenueCat customer info:", {
            originalAppUserId: customerInfo.originalAppUserId,
            originalPurchaseDate: customerInfo.originalPurchaseDate,
            activeEntitlements: Object.keys(activeEntitlements),
            allEntitlements: Object.keys(customerInfo.entitlements.all)
          });
          
          if (Object.keys(activeEntitlements).length > 0) {
            // User has active RevenueCat subscription but it's not synced to Supabase
            const [entitlementKey, entitlement] = Object.entries(activeEntitlements)[0];
            console.log("Found RevenueCat entitlement that needs syncing:", {
              entitlementKey,
              productIdentifier: entitlement.productIdentifier,
              expirationDate: entitlement.expirationDate
            });
            
            // Format RevenueCat subscription data temporarily
            const revenuecatSubscription = formatRevenueCatSubscription(entitlement, entitlementKey);
            setSubscription(revenuecatSubscription);
            
            // Trigger immediate sync to Supabase
            console.log("Triggering immediate sync to Supabase...");
            const syncSuccess = await triggerImmediateSync();
            
            if (syncSuccess) {
              // Refresh after successful sync
              setTimeout(() => {
                console.log("Refreshing subscription data after successful sync...");
                fetchSubscription();
              }, 2000);
            }
            
            return;
          } else {
            console.log("No active RevenueCat entitlements found");
            console.log("All entitlements:", customerInfo.entitlements.all);
            
            // Check if subscription might have been transferred - look for any subscription records 
            // that might be associated with this user's email or other identifiers
            console.log("Checking for transferred subscriptions...");
            await checkForTransferredSubscriptions();
          }
        } catch (revenueCatError) {
          console.error('RevenueCat check failed:', revenueCatError);
          toast.error('Failed to check mobile subscription status');
        }
      }

      // Fallback: check by customer_id for legacy Stripe subscriptions
      if (!Capacitor.isNativePlatform()) {
        console.log("Checking for legacy Stripe subscriptions by customer_id...");
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

          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('stripe_subscriptions')
            .select('*')
            .eq('customer_id', customerData.customer_id)
            .eq('status', 'active')
            .maybeSingle();

          if (subscriptionError) {
            console.error('Error fetching subscription by customer_id:', subscriptionError);
          }

          if (subscriptionData) {
            console.log("Found subscription by customer_id:", subscriptionData);
            setSubscription(formatSubscriptionData(subscriptionData));
            return;
          }
        }
      }

      console.log("No active subscription found anywhere");
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

  const checkForTransferredSubscriptions = useCallback(async () => {
    try {
      console.log('Checking for transferred subscriptions...');
      
      // Look for subscriptions that might belong to this user but under different user_ids
      // This could happen due to RevenueCat transfers
      const { data: possibleSubscriptions, error } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('status', 'active')
        .like('customer_id', 'revenuecat_%');

      if (error) {
        console.error('Error checking for transferred subscriptions:', error);
        return;
      }

      console.log('Found RevenueCat subscriptions:', possibleSubscriptions?.length || 0);
      
      // For now, just log this information. In a production app, you might want to
      // implement more sophisticated matching logic based on email or other identifiers
      if (possibleSubscriptions && possibleSubscriptions.length > 0) {
        console.log('Existing RevenueCat subscriptions found, but none match current user ID');
        console.log('This might indicate a transfer event that needs manual resolution');
      }
    } catch (error) {
      console.error('Error in checkForTransferredSubscriptions:', error);
    }
  }, []);

  const triggerImmediateSync = useCallback(async () => {
    try {
      console.log('Triggering immediate sync to Supabase...');
      
      if (!Capacitor.isNativePlatform()) {
        console.log('Not on native platform, skipping RevenueCat sync');
        return false;
      }
      
      const result = await revenueCatManager.getCustomerInfo();
      const customerInfo = result.customerInfo;
      
      console.log('Syncing customer info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active)
      });
      
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('No valid session found for sync');
        return false;
      }

      console.log('Calling sync function with customer info...');
      const { data, error } = await supabase.functions.invoke('sync-revenuecat-subscription', {
        body: {
          customerInfo: customerInfo
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error('Sync function error:', error);
        return false;
      }
      
      console.log('Immediate sync completed successfully:', data);
      return true;
    } catch (error) {
      console.error('Immediate sync failed:', error);
      return false;
    }
  }, []);

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
    if (subscriptionData.subscription_id?.startsWith('revenuecat_') || 
        subscriptionData.price_id === 'com.lucidrepo.limited.monthly' ||
        subscriptionData.price_id === 'com.lucidrepo.unlimited.monthly') {
      
      if (subscriptionData.price_id === 'com.lucidrepo.unlimited.monthly') {
        planName = 'Premium';
        imageTotal = 1000;
      } else if (subscriptionData.price_id === 'com.lucidrepo.limited.monthly') {
        planName = 'Basic';
        imageTotal = 25;
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
      subscriptionType: subscriptionData.subscription_id?.startsWith('revenuecat_') ? 'RevenueCat' : 'Stripe'
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
