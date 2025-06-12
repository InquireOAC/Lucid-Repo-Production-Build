
import { useEffect } from 'react';
import { useFeatureUsage } from './useFeatureUsage';

/**
 * Hook to sync subscription status when purchases are made
 */
export const useSubscriptionSync = () => {
  const { refreshSubscriptionStatus } = useFeatureUsage();

  useEffect(() => {
    // Listen for subscription update events
    const handleSubscriptionUpdate = async () => {
      console.log('Subscription update event received, refreshing status...');
      await refreshSubscriptionStatus();
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);

    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, [refreshSubscriptionStatus]);
};
