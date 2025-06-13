
import { useState, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const result = await Preferences.get({ key: 'hasSeenOnboarding' });
      const hasSeenIt = result.value === 'true';
      console.log('Onboarding status checked:', hasSeenIt);
      setHasSeenOnboarding(hasSeenIt);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if we can't check
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    console.log('Refreshing onboarding status...');
    await checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return { hasSeenOnboarding, isLoading, refreshOnboardingStatus };
};
