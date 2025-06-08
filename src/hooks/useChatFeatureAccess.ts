
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureUsage } from './useFeatureUsage';
import { showSubscriptionPrompt } from '@/lib/stripe';

export const useChatFeatureAccess = () => {
  const { user } = useAuth();
  const { hasUsedFeature, markFeatureAsUsed, canUseFeature } = useFeatureUsage();
  const [isChecking, setIsChecking] = useState(false);

  const isAppCreator = user?.email === "inquireoac@gmail.com";

  const canUseChat = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      setIsChecking(true);
      
      // Special case for app creator - always return true
      if (isAppCreator) {
        return true;
      }
      
      // Check if user has already used their free trial for analysis (chat uses analysis quota)
      const hasUsed = hasUsedFeature('analysis');
      
      if (!hasUsed) {
        // User hasn't used their free trial yet
        console.log('First time using chat feature, allowing free trial');
        return true;
      }
      
      // User has used their free trial, check for subscription access
      const hasAccess = await canUseFeature('analysis');
      
      if (!hasAccess) {
        showSubscriptionPrompt('analysis');
        return false;
      }
      
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
      if (!user || isAppCreator) return true;
      
      // For first-time usage, just mark it locally
      if (!hasUsedFeature('analysis')) {
        markFeatureAsUsed('analysis');
        return true;
      }
      
      // For subsequent usage, the subscription system will handle it
      return true;
    } catch (error) {
      console.error('Error recording chat usage:', error);
      return false;
    }
  };

  return {
    canUseChat,
    recordChatUsage,
    isChecking,
    isAppCreator,
    hasUsedFeature: (feature: 'analysis' | 'image') => hasUsedFeature(feature),
  };
};
