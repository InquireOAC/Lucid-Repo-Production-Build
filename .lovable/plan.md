

# Platform-Specific RevenueCat API Keys

## Problem
The edge function `get-revenuecat-key` returns a single `REVENUECAT_API_KEY` regardless of platform. Android needs a different key than iOS.

## Changes

### 1. Add Android RevenueCat secret
A new Supabase secret `REVENUECAT_ANDROID_API_KEY` needs to be added for the Google Play RevenueCat key. The existing `REVENUECAT_API_KEY` will continue to serve as the iOS key.

### 2. Update edge function `get-revenuecat-key/index.ts`
- Parse `platform` from request body
- Return `REVENUECAT_API_KEY` for iOS, `REVENUECAT_ANDROID_API_KEY` for Android
- Fall back to `REVENUECAT_API_KEY` if no platform specified

### 3. Update `src/utils/revenueCatManager.ts` - `fetchApiKey()`
- Pass `{ platform: Capacitor.getPlatform() }` as body to `supabase.functions.invoke('get-revenuecat-key')`

### 4. Update `capacitor.config.ts`
- Remove the hardcoded `PurchasesCapacitor.apiKey` since we fetch it dynamically
- Or keep it as iOS fallback — but cleaner to remove since `revenueCatManager` handles it

### 5. Android SDK version
Note: The Android `compileSdkVersion` / `targetSdkVersion` is set in `android/app/build.gradle` which is generated when you run `npx cap add android`. Lovable cannot edit that file directly since it's not in the project. After generating the Android project locally, you'll need to update `compileSdk` and `targetSdk` from 34 to 35 in `android/app/build.gradle`.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/get-revenuecat-key/index.ts` | Accept `platform` param, return correct key |
| `src/utils/revenueCatManager.ts` | Send platform in fetchApiKey() |
| `capacitor.config.ts` | Remove hardcoded PurchasesCapacitor apiKey |

## Manual Step
- You will need to add the `REVENUECAT_ANDROID_API_KEY` secret to Supabase with your Android RevenueCat public API key
- After running `npx cap add android`, update `android/app/build.gradle` to set `compileSdk = 35` and `targetSdk = 35`

