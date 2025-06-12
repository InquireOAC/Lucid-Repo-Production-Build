
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const handleSubscriptionUpdate = () => {
      console.log('Subscription updated, clearing feature usage cache');
      // Clear any cached feature usage data to force a re-check
      localStorage.removeItem(`feature_usage_${user.id}`);
    };

    // Listen for subscription update events
    window.addEventListener('subscription-updated', handleSubscriptionUpdate);

    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, [user]);
};
