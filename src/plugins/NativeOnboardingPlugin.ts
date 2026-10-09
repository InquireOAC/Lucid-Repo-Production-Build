import { registerPlugin } from '@capacitor/core';

export interface NativeOnboardingPluginInterface {
  /**
   * Present the full-screen native SwiftUI onboarding flow.
   * Resolves with { completed: true } when the user accepts terms and taps
   * "Enter the Dream Realm", or { completed: false } if dismissed early.
   */
  presentOnboarding(): Promise<{ completed: boolean }>;
}

const NativeOnboardingPlugin = registerPlugin<NativeOnboardingPluginInterface>('NativeOnboardingPlugin', {
  web: undefined,
});

export { NativeOnboardingPlugin };
