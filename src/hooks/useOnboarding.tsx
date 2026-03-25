

import { useState, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

// DEV: force onboarding — set to true to always show onboarding during development
const DEV_FORCE_ONBOARDING = false;

// Session-level guard: once onboarding is completed or confirmed seen in this
// browser/app session, never show it again regardless of storage state.
let sessionCompleted = false;

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    sessionCompleted ? true : null
  );
  const [isLoading, setIsLoading] = useState(!sessionCompleted);

  const checkOnboardingStatus = useCallback(async () => {
    // Session guard — skip all checks
    if (sessionCompleted) {
      setHasSeenOnboarding(true);
      setIsLoading(false);
      return;
    }

    // DEV: force onboarding override
    if (DEV_FORCE_ONBOARDING) {
      console.log('DEV: Forcing onboarding to show');
      setHasSeenOnboarding(false);
      setIsLoading(false);
      return;
    }

    try {
      let hasSeenIt = false;
      
      // Always check localStorage first (fastest, works everywhere)
      if (localStorage.getItem('hasSeenOnboarding') === 'true') {
        hasSeenIt = true;
      }
      
      // On native, also check Capacitor Preferences as backup
      if (!hasSeenIt && Capacitor.isNativePlatform()) {
        try {
          const result = await Preferences.get({ key: 'hasSeenOnboarding' });
          if (result.value === 'true') {
            hasSeenIt = true;
            // Sync back to localStorage so future checks are instant
            localStorage.setItem('hasSeenOnboarding', 'true');
          }
        } catch {
          // Preferences unavailable, localStorage already checked
        }
      }

      // Lock session guard so re-mounts never re-check
      if (hasSeenIt) sessionCompleted = true;
      
      setHasSeenOnboarding(hasSeenIt);
    } catch {
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    // Lock session guard immediately
    sessionCompleted = true;
    // Immediately update state so onboarding never flashes back
    setHasSeenOnboarding(true);

    // Persist to ALL available storage mechanisms
    try {
      localStorage.setItem('hasSeenOnboarding', 'true');
    } catch {
      // localStorage unavailable
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await Preferences.set({ key: 'hasSeenOnboarding', value: 'true' });
      } catch {
        // Preferences unavailable, localStorage already set
      }
    }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    await checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return { hasSeenOnboarding, isLoading, refreshOnboardingStatus, completeOnboarding };
};
