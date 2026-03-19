
import { useState, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

// DEV: force onboarding — set to true to always show onboarding during development
const DEV_FORCE_ONBOARDING = true;

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    // DEV: force onboarding override
    if (DEV_FORCE_ONBOARDING) {
      console.log('DEV: Forcing onboarding to show');
      setHasSeenOnboarding(false);
      setIsLoading(false);
      return;
    }

    try {
      let hasSeenIt = false;
      
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await Preferences.get({ key: 'hasSeenOnboarding' });
          hasSeenIt = result.value === 'true';
        } catch {
          hasSeenIt = localStorage.getItem('hasSeenOnboarding') === 'true';
        }
      } else {
        hasSeenIt = localStorage.getItem('hasSeenOnboarding') === 'true';
      }
      
      setHasSeenOnboarding(hasSeenIt);
    } catch {
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    await checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return { hasSeenOnboarding, isLoading, refreshOnboardingStatus };
};
