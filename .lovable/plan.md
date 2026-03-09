

# Android Subscription Support

## Current State
The app uses RevenueCat for native in-app purchases, which already supports both iOS and Android. The `revenueCatManager.ts`, `useNativeSubscription.ts`, and `NativeSubscriptionManager.tsx` are platform-agnostic in terms of RevenueCat API calls. However, several UI strings are iOS-specific ("App Store", "Apple ID").

## Changes Needed

### 1. NativeSubscriptionManager.tsx - Platform-aware text
- Change "Manage via App Store Settings" to dynamically show "App Store" or "Play Store" based on platform
- Update the legal footer text: "Auto-renews unless canceled..." to reference the correct store
- The "Most Popular" badge and feature lists remain the same

### 2. SubscriptionDialog.tsx - Platform-aware text
- Change "Manage your subscription through App Store settings" to reference the correct store

### 3. useNativeSubscription.ts - Platform-aware restore message
- Update the restore purchases toast that says "same Apple ID" to say "same Google account" on Android

### 4. No RevenueCat code changes needed
- The RevenueCat SDK automatically uses Google Play Billing on Android
- The same `revenueCatManager.ts` singleton works on both platforms
- Product identifiers in RevenueCat are mapped per-platform in the RevenueCat dashboard, so the same offering works

## Files to Modify

| File | Change |
|------|--------|
| `src/components/profile/NativeSubscriptionManager.tsx` | Platform-aware store name in UI text |
| `src/components/profile/SubscriptionDialog.tsx` | Platform-aware "manage subscription" text |
| `src/hooks/useNativeSubscription.ts` | Platform-aware restore message |

## Manual Steps (User must do)
After code changes:
1. **RevenueCat Dashboard**: Add your Android app in RevenueCat and configure Google Play Store credentials (service account JSON key)
2. **Google Play Console**: Create the same two subscription products (`com.lucidrepo.limited.monthly` and `com.lucidrepo.unlimited.monthly`) with matching pricing
3. **RevenueCat Offerings**: Map the Google Play products to the same offering as your iOS products
4. The RevenueCat API key may need to be platform-specific -- if you use a separate Android API key, you'll need to update the `get-revenuecat-key` edge function to return the correct key based on platform

