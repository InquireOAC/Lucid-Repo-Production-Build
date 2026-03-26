
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureUsage } from './useFeatureUsage';
import { showSubscriptionPrompt } from '@/lib/stripe';
import { useUserRole } from '@/hooks/useUserRole';

const FREE_TRIAL_MESSAGE_LIMIT = 5;

export const useChatFeatureAccess = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { hasUsedFeature, canUseFeature, recordFeatureUsage, hasActiveSubscription, subscriptionTier } = useFeatureUsage();
  const [isChecking, setIsChecking] = useState(false);
  const sessionMessageCount = useRef(0);

  const canUseChat = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      setIsChecking(true);

      // Admins & subscribers get unlimited access
      if (isAdmin) return true;

      // Use the unified canUseFeature with 'chat' key
      const canUse = await canUseFeature('chat');
      if (!canUse) return false;

      // For free trial users, enforce per-session message limit
      const trialUsed = hasUsedFeature('chat');
      if (!trialUsed) {
        // First-time user, but limit messages per session
        if (sessionMessageCount.current >= FREE_TRIAL_MESSAGE_LIMIT) {
          showSubscriptionPrompt('chat');
          return false;
        }
        return true;
      }

      // If we got here with canUse=true, user has subscription
      return true;
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

      sessionMessageCount.current += 1;

      if (hasActiveSubscription) return true;

      // Record the trial usage server-side on first message
      if (sessionMessageCount.current === 1 && !hasUsedFeature('chat')) {
        await recordFeatureUsage('chat');
        return true;
      }

      // Check if free trial message limit reached
      if (!hasActiveSubscription && sessionMessageCount.current >= FREE_TRIAL_MESSAGE_LIMIT) {
        // Will be blocked on next canUseChat call
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error recording chat usage:', error);
      return false;
    }
  };

  const resetSessionCount = () => {
    sessionMessageCount.current = 0;
  };

  return {
    canUseChat,
    recordChatUsage,
    resetSessionCount,
    isChecking,
    isAppCreator: isAdmin,
    hasActiveSubscription,
    subscriptionTier,
    hasUsedFeature: (feature: 'analysis' | 'image' | 'chat') => hasUsedFeature(feature),
    sessionMessageCount: sessionMessageCount.current,
    freeTrialMessageLimit: FREE_TRIAL_MESSAGE_LIMIT,
  };
};
