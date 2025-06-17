
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { toast } from 'sonner';

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

      // First check for RevenueCat/iOS subscription by user_id
      const { data: directSubscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (directSubscription) {
        console.log('Found active RevenueCat subscription');
        setHasActiveSubscription(true);
        return;
      }

      // Check RevenueCat on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await Purchases.getCustomerInfo();
          const customerInfo = result.customerInfo;
          const activeEntitlements = customerInfo.entitlements.active;
          const hasActiveEntitlement = Object.keys(activeEntitlements).length > 0;
          
          console.log('RevenueCat active entitlements:', activeEntitlements);
          setHasActiveSubscription(hasActiveEntitlement);
          return;
        } catch (revenueCatError) {
          console.error('RevenueCat check failed:', revenueCatError);
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
      
      // Check if user has an active subscription (RevenueCat only)
      if (hasActiveSubscription) {
        console.log(`User has active RevenueCat subscription for ${featureType}, allowing access`);
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
      showSubscriptionPrompt(featureType);
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
      
      // For subsequent usage, check if they have active subscription
      if (hasActiveSubscription) {
        console.log(`User has active subscription, allowing ${featureType} usage`);
        return true;
      }
      
      // No subscription and already used free trial
      showSubscriptionPrompt(featureType);
      return false;
    } catch (error) {
      console.error('Error recording feature usage:', error);
      return false;
    }
  };

  const showSubscriptionPrompt = (featureType: FeatureType) => {
    const feature = featureType === 'analysis' ? 'dream analysis' : 'image generation';
    
    if (Capacitor.isNativePlatform()) {
      toast.error(`Premium feature limit reached`, {
        description: `You've used your free ${feature} trial. Subscribe to continue using this feature.`,
        action: {
          label: 'Subscribe',
          onClick: () => window.location.href = '/profile?tab=subscription'
        },
        duration: 5000
      });
    } else {
      toast.error(`Premium feature limit reached`, {
        description: `You've used your free ${feature} trial. Download our mobile app to subscribe and continue.`,
        duration: 5000
      });
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
