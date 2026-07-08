import { registerPlugin } from '@capacitor/core';

export type PaywallResult = 'purchased' | 'dismissed' | 'error' | 'unsupported';

export interface NativePaywallPluginInterface {
  /**
   * Present the native SwiftUI paywall powered by RevenueCat.
   * On iOS 14 or if RevenueCat is not yet initialised, returns
   * { result: 'unsupported' } so the caller can fall back to the React paywall.
   *
   * @param options.feature  Which feature gate triggered the paywall
   *                         ('analysis' | 'image' | 'chat')
   */
  presentPaywall(options: {
    feature: 'analysis' | 'image' | 'chat';
  }): Promise<{ result: PaywallResult; message?: string }>;
}

const NativePaywallPlugin = registerPlugin<NativePaywallPluginInterface>('NativePaywallPlugin', {
  web: undefined,
});

export { NativePaywallPlugin };
