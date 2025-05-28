
import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const result = await Preferences.get({ key: 'hasSeenOnboarding' });
        const hasSeenIt = result.value === 'true';
        setHasSeenOnboarding(hasSeenIt);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding if we can't check
        setHasSeenOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  return { hasSeenOnboarding, isLoading };
};
