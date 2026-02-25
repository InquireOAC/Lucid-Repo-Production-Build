
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureUsage } from './useFeatureUsage';
import { showSubscriptionPrompt } from '@/lib/stripe';
import { useUserRole } from '@/hooks/useUserRole';

export const useChatFeatureAccess = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { hasUsedFeature, canUseFeature, recordFeatureUsage, hasActiveSubscription } = useFeatureUsage();
  const [isChecking, setIsChecking] = useState(false);

  const canUseChat = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      setIsChecking(true);
      
      // Admins get unlimited access
      if (isAdmin) {
        console.log('Admin detected, allowing chat access');
        return true;
      }
      
      // Check if user has an active subscription first
      if (hasActiveSubscription) {
        console.log('User has active subscription, allowing unlimited chat access');
        return true;
      }
      
      // Check if user has already used their free trial for analysis/chat
      const hasUsed = hasUsedFeature('analysis');
      
      if (!hasUsed) {
        // User hasn't used their free trial yet
        console.log('First time using chat feature, allowing free trial');
        return true;
      }
      
      // User has used their free trial and no active subscription
      console.log('User has used free trial for chat and has no subscription');
      showSubscriptionPrompt('analysis');
      return false;
    } catch (error) {
      console.error('Error checking chat feature access:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const recordChatUsage = async (): Promise<boolean> => {
    try {
      if (!user || isAdmin) return true;
      
      // If user has active subscription, don't record usage (unlimited)
      if (hasActiveSubscription) {
        console.log('User has subscription, not recording chat usage (unlimited)');
        return true;
      }
      
      // For first-time usage, mark it locally as used
      if (!hasUsedFeature('analysis')) {
        console.log('Recording first-time chat usage (free trial)');
        await recordFeatureUsage('analysis');
        return true;
      }
      
      // If they've used their trial and no subscription, they shouldn't reach here
      console.log('User has no subscription and already used trial');
      return false;
    } catch (error) {
      console.error('Error recording chat usage:', error);
      return false;
    }
  };

  return {
    canUseChat,
    recordChatUsage,
    isChecking,
    isAppCreator: isAdmin,
    hasActiveSubscription,
    hasUsedFeature: (feature: 'analysis' | 'image') => hasUsedFeature(feature),
  };
};
