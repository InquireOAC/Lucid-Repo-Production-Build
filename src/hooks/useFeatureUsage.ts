
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { checkFeatureAccess, incrementFeatureUsage, showSubscriptionPrompt } from '@/lib/stripe';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

type FeatureType = 'analysis' | 'image';

export const useFeatureUsage = () => {
  const { user } = useAuth();
  const [usageState, setUsageState] = useState<Record<FeatureType, boolean>>({
    analysis: false,
    image: false
  });
  const [isChecking, setIsChecking] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Load usage state from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedUsage = localStorage.getItem(`feature_usage_${user.id}`);
      if (savedUsage) {
        setUsageState(JSON.parse(savedUsage));
      }
      
      // Check subscription status
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      if (!user) return;

      console.log('Checking subscription status for user:', user.id);

      // ALWAYS check Supabase first - this ensures cross-device consistency
      const { data: directSubscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (directSubscription) {
        console.log('Found active subscription in Supabase for user');
        setHasActiveSubscription(true);
        return;
      }

      // On native platforms, also check RevenueCat as fallback
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await Purchases.getCustomerInfo();
          const customerInfo = result.customerInfo;
          const activeEntitlements = customerInfo.entitlements.active;
          const hasActiveEntitlement = Object.keys(activeEntitlements).length > 0;
          
          console.log('RevenueCat active entitlements:', activeEntitlements);
          if (hasActiveEntitlement) {
            console.log('Found active RevenueCat subscription');
            setHasActiveSubscription(true);
            return;
          }
        } catch (revenueCatError) {
          console.error('RevenueCat check failed:', revenueCatError);
        }
      }

      // Check legacy Stripe customer subscription (web only)
      if (!Capacitor.isNativePlatform()) {
        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (customerData?.customer_id) {
          const { data: subscription } = await supabase
            .from('stripe_subscriptions')
            .select('status')
            .eq('customer_id', customerData.customer_id)
            .eq('status', 'active')
            .maybeSingle();

          if (subscription) {
            console.log('Found active Stripe subscription');
            setHasActiveSubscription(true);
            return;
          }
        }
      }

      console.log('No active subscription found');
      setHasActiveSubscription(false);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasActiveSubscription(false);
    }
  };

  const hasUsedFeature = (featureType: FeatureType): boolean => {
    if (!user) return false;
    
    // Special case for app creator - always return false to indicate feature has not been used
    if (user.email === "inquireoac@gmail.com") {
      return false;
    }
    
    return usageState[featureType];
  };

  const markFeatureAsUsed = (featureType: FeatureType): void => {
    if (!user) return;
    
    // Special case for app creator - don't mark features as used
    if (user.email === "inquireoac@gmail.com") {
      return;
    }
    
    const newUsageState = {
      ...usageState,
      [featureType]: true
    };
    
    setUsageState(newUsageState);
    localStorage.setItem(`feature_usage_${user.id}`, JSON.stringify(newUsageState));
  };

  // Function to check if user can use the feature (free trial or subscription)
  const canUseFeature = async (featureType: FeatureType): Promise<boolean> => {
    try {
      if (!user) return false;
      setIsChecking(true);
      
      // Special case for app creator - always return true
      if (user.email === "inquireoac@gmail.com") {
        console.log('App creator detected, allowing feature access');
        return true;
      }
      
      // Check if user has an active subscription
      await checkSubscriptionStatus();
      
      if (hasActiveSubscription) {
        console.log(`User has active subscription for ${featureType}, allowing access`);
        return true;
      }
      
      // Check if user has already used their free trial
      const hasUsed = hasUsedFeature(featureType);
      
      if (!hasUsed) {
        // User hasn't used their free trial yet
        console.log(`First time using ${featureType} feature, allowing free trial`);
        return true;
      }
      
      // User has used their free trial and no active subscription
      console.log(`User has used free trial for ${featureType} and has no subscription`);
      
      // On native platforms, don't show Stripe subscription prompt
      if (Capacitor.isNativePlatform()) {
        console.log('Native platform: User needs to subscribe through the app');
        return false;
      } else {
        showSubscriptionPrompt(featureType);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking feature usage:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Function to record usage of a feature
  const recordFeatureUsage = async (featureType: FeatureType): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Special case for app creator - don't record usage
      if (user.email === "inquireoac@gmail.com") {
        console.log('App creator detected, not recording usage');
        return true;
      }
      
      // For first-time usage, just mark it locally
      if (!hasUsedFeature(featureType)) {
        console.log(`Marking ${featureType} as used locally (free trial)`);
        markFeatureAsUsed(featureType);
        return true;
      }
      
      // For subsequent usage, increment in database if they have a subscription
      console.log(`Recording ${featureType} usage in database`);
      const success = await incrementFeatureUsage(featureType);
      return success;
    } catch (error) {
      console.error('Error recording feature usage:', error);
      return false;
    }
  };

  return {
    hasUsedFeature,
    markFeatureAsUsed,
    canUseFeature,
    recordFeatureUsage,
    isChecking,
    hasActiveSubscription
  };
};
