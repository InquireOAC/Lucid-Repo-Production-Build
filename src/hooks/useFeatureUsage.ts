
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { incrementFeatureUsage, showSubscriptionPrompt } from '@/lib/stripe';
import { Capacitor } from '@capacitor/core';
import { revenueCatManager } from '@/utils/revenueCatManager';
import { useUserRole } from '@/hooks/useUserRole';

export type FeatureType = 'analysis' | 'image' | 'chat' | 'video' | 'voice';

export const useFeatureUsage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [trialCache, setTrialCache] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'none' | 'dreamer' | 'mystic'>('none');

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      loadTrialStatus();
    }
  }, [user]);

  const loadTrialStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('feature_free_trials')
        .select('feature')
        .eq('user_id', user.id);
      
      const cache: Record<string, boolean> = {};
      (data || []).forEach(row => { cache[row.feature] = true; });
      setTrialCache(cache);
    } catch (error) {
      console.error('Error loading trial status:', error);
    }
  };

  const checkSubscriptionStatus = useCallback(async (): Promise<{ active: boolean; tier: 'none' | 'dreamer' | 'mystic' }> => {
    try {
      if (!user) return { active: false, tier: 'none' };

      // Check Supabase by user_id
      const { data: userSub } = await supabase
        .from('stripe_subscriptions')
        .select('status, price_id, subscription_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (userSub) {
        const tier = determineTier(userSub.price_id, userSub.subscription_id);
        setHasActiveSubscription(true);
        setSubscriptionTier(tier);
        return { active: true, tier };
      }

      // Native: check RevenueCat
      if (Capacitor.isNativePlatform()) {
        try {
          await revenueCatManager.initialize(user.id);
          const result = await revenueCatManager.getCustomerInfo();
          const activeEntitlements = result.customerInfo.entitlements.active;
          if (Object.keys(activeEntitlements).length > 0) {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.access_token) {
                await supabase.functions.invoke('sync-revenuecat-subscription', {
                  body: { customerInfo: result.customerInfo },
                  headers: { Authorization: `Bearer ${session.access_token}` }
                });
              }
            } catch (syncError) {
              console.error('Failed to sync RevenueCat:', syncError);
            }
            setHasActiveSubscription(true);
            setSubscriptionTier('mystic'); // RevenueCat defaults
            return { active: true, tier: 'mystic' };
          }
        } catch (e) {
          console.error('RevenueCat check failed:', e);
        }
      }

      // Fallback: legacy Stripe customer
      if (!Capacitor.isNativePlatform()) {
        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (customerData?.customer_id) {
          const { data: sub } = await supabase
            .from('stripe_subscriptions')
            .select('status, price_id, subscription_id')
            .eq('customer_id', customerData.customer_id)
            .eq('status', 'active')
            .maybeSingle();

          if (sub) {
            const tier = determineTier(sub.price_id, sub.subscription_id);
            setHasActiveSubscription(true);
            setSubscriptionTier(tier);
            return { active: true, tier };
          }
        }
      }

      setHasActiveSubscription(false);
      setSubscriptionTier('none');
      return { active: false, tier: 'none' };
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
      setSubscriptionTier('none');
      return { active: false, tier: 'none' };
    }
  }, [user]);

  const determineTier = (priceId: string | null, subscriptionId: string | null): 'dreamer' | 'mystic' => {
    const pid = (priceId || '').toLowerCase();
    const sid = (subscriptionId || '').toLowerCase();
    if (pid === 'price_premium' || pid === 'com.lucidrepo.unlimited.monthly' || 
        pid.includes('unlimited') || pid.includes('premium') || pid.includes('mystic') ||
        sid.includes('unlimited') || sid.includes('premium')) {
      return 'mystic';
    }
    return 'dreamer';
  };

  const hasUsedFeature = (featureType: FeatureType): boolean => {
    if (!user || isAdmin) return false;
    return !!trialCache[featureType];
  };

  const canUseFeature = async (featureType: FeatureType): Promise<boolean> => {
    try {
      if (!user) return false;
      setIsChecking(true);

      if (isAdmin) return true;

      // Fresh subscription check — returns directly, no stale state
      const { active } = await checkSubscriptionStatus();
      if (active) return true;

      // Check server-side trial status
      const { data: trialRow } = await supabase
        .from('feature_free_trials')
        .select('id')
        .eq('user_id', user.id)
        .eq('feature', featureType)
        .maybeSingle();

      if (!trialRow) {
        // Trial not yet used
        return true;
      }

      // Trial consumed, no subscription
      if (Capacitor.isNativePlatform()) {
        showSubscriptionPrompt(featureType as any);
      } else {
        showSubscriptionPrompt(featureType as any);
      }
      return false;
    } catch (error) {
      console.error('Error checking feature usage:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const recordFeatureUsage = async (featureType: FeatureType): Promise<boolean> => {
    try {
      if (!user || isAdmin) return true;

      // Check if trial already consumed
      const { data: trialRow } = await supabase
        .from('feature_free_trials')
        .select('id')
        .eq('user_id', user.id)
        .eq('feature', featureType)
        .maybeSingle();

      if (!trialRow) {
        // First use — record trial server-side
        const { error } = await supabase
          .from('feature_free_trials')
          .insert({ user_id: user.id, feature: featureType });
        
        if (error) console.error('Error recording trial:', error);
        setTrialCache(prev => ({ ...prev, [featureType]: true }));
        return true;
      }

      // Subsequent use — increment DB for subscribed users
      if (featureType === 'image' || featureType === 'analysis') {
        const success = await incrementFeatureUsage(featureType);
        return success;
      }
      return true;
    } catch (error) {
      console.error('Error recording feature usage:', error);
      return false;
    }
  };

  return {
    hasUsedFeature,
    canUseFeature,
    recordFeatureUsage,
    isChecking,
    hasActiveSubscription,
    subscriptionTier,
    checkSubscriptionStatus,
  };
};
