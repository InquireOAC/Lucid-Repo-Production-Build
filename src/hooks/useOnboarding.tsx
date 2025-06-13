
import { useState, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      let hasSeenIt = false;
      
      // Try Capacitor Preferences first (for native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await Preferences.get({ key: 'hasSeenOnboarding' });
          hasSeenIt = result.value === 'true';
          console.log('Onboarding status checked (Capacitor):', hasSeenIt);
        } catch (error) {
          console.log('Capacitor Preferences not available, falling back to localStorage');
          // Fall back to localStorage if Capacitor Preferences fails
          hasSeenIt = localStorage.getItem('hasSeenOnboarding') === 'true';
          console.log('Onboarding status checked (localStorage fallback):', hasSeenIt);
        }
      } else {
        // Use localStorage for web
        hasSeenIt = localStorage.getItem('hasSeenOnboarding') === 'true';
        console.log('Onboarding status checked (localStorage):', hasSeenIt);
      }
      
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
