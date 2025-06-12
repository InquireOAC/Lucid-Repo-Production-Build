
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

export const useFeatureUsage = () => {
  const { user } = useAuth();
  const [hasUsedAnalysis, setHasUsedAnalysis] = useState(false);
  const [hasUsedImage, setHasUsedImage] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check RevenueCat subscription status on iOS
  const checkRevenueCatSubscription = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || !user) {
      return false;
    }

    try {
      console.log('Checking RevenueCat subscription status...');
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Check if user has any active entitlements
      const activeEntitlements = customerInfo.entitlements.active;
      const hasActiveEntitlement = Object.keys(activeEntitlements).length > 0;
      
      console.log('RevenueCat active entitlements:', activeEntitlements);
      console.log('Has active subscription from RevenueCat:', hasActiveEntitlement);
      
      return hasActiveEntitlement;
    } catch (error) {
      console.error('Error checking RevenueCat subscription:', error);
      return false;
    }
  }, [user]);

  // Check Supabase subscription status
  const checkSupabaseSubscription = useCallback(async () => {
    if (!user) return false;

    try {
      // Check for active subscription by user_id (covers iOS purchases)
      const { data: directSubscription } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (directSubscription) {
        return true;
      }

      // Fallback to customer-based lookup for Stripe subscriptions
      const { data: customerData } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!customerData?.customer_id) {
        return false;
      }

      const { data: subscriptionData } = await supabase
        .from('stripe_subscriptions')
        .select('status')
        .eq('customer_id', customerData.customer_id)
        .eq('status', 'active')
        .maybeSingle();

      return !!subscriptionData;
    } catch (error) {
      console.error('Error checking Supabase subscription:', error);
      return false;
    }
  }, [user]);

  // Load feature usage data
  const loadFeatureUsage = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feature_usage')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHasUsedAnalysis(data?.used_analysis || false);
      setHasUsedImage(data?.used_image || false);

      // Check both RevenueCat and Supabase for active subscriptions
      const [revenueCatActive, supabaseActive] = await Promise.all([
        checkRevenueCatSubscription(),
        checkSupabaseSubscription()
      ]);

      const hasActiveSub = revenueCatActive || supabaseActive;
      setHasActiveSubscription(hasActiveSub);
      
      console.log('Subscription status check:', {
        revenueCat: revenueCatActive,
        supabase: supabaseActive,
        combined: hasActiveSub
      });

    } catch (error) {
      console.error('Error loading feature usage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, checkRevenueCatSubscription, checkSupabaseSubscription]);

  useEffect(() => {
    loadFeatureUsage();
  }, [loadFeatureUsage]);

  const hasUsedFeature = useCallback((featureType: 'analysis' | 'image') => {
    return featureType === 'analysis' ? hasUsedAnalysis : hasUsedImage;
  }, [hasUsedAnalysis, hasUsedImage]);

  const canUseFeature = useCallback(async (featureType: 'analysis' | 'image') => {
    // App creator always has access
    if (user?.email === "inquireoac@gmail.com") {
      return true;
    }

    // If user has an active subscription, they can use features
    if (hasActiveSubscription) {
      console.log(`Feature ${featureType} allowed - user has active subscription`);
      return true;
    }

    // If no subscription, check if they've used their free trial
    const hasUsed = featureType === 'analysis' ? hasUsedAnalysis : hasUsedImage;
    
    if (!hasUsed) {
      console.log(`Feature ${featureType} allowed - free trial available`);
      return true;
    }

    console.log(`Feature ${featureType} blocked - no subscription and free trial used`);
    return false;
  }, [user, hasActiveSubscription, hasUsedAnalysis, hasUsedImage]);

  const markFeatureAsUsed = useCallback(async (featureType: 'analysis' | 'image') => {
    if (!user) return;

    try {
      const updateData = {
        user_id: user.id,
        [featureType === 'analysis' ? 'used_analysis' : 'used_image']: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('feature_usage')
        .upsert(updateData);

      if (error) throw error;

      if (featureType === 'analysis') {
        setHasUsedAnalysis(true);
      } else {
        setHasUsedImage(true);
      }

      console.log(`Marked ${featureType} as used for user ${user.id}`);
    } catch (error) {
      console.error(`Error marking ${featureType} as used:`, error);
    }
  }, [user]);

  // Refresh subscription status (useful after purchase)
  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) return;

    console.log('Refreshing subscription status...');
    const [revenueCatActive, supabaseActive] = await Promise.all([
      checkRevenueCatSubscription(),
      checkSupabaseSubscription()
    ]);

    const hasActiveSub = revenueCatActive || supabaseActive;
    setHasActiveSubscription(hasActiveSub);
    
    console.log('Refreshed subscription status:', {
      revenueCat: revenueCatActive,
      supabase: supabaseActive,
      combined: hasActiveSub
    });

    return hasActiveSub;
  }, [user, checkRevenueCatSubscription, checkSupabaseSubscription]);

  return {
    hasUsedFeature,
    canUseFeature,
    markFeatureAsUsed,
    hasActiveSubscription,
    refreshSubscriptionStatus,
    isLoading
  };
};
