

# Update Subscription Tiers and Gate Voice-to-Text

## Summary

Fix the inconsistent image credit limits across the codebase (some places say 10, others 25) and add voice-to-text transcription as a subscription-only feature. Free users can still record audio, but the AI transcription step will be gated.

## Current State vs. Updated State

```text
+---------------------------+----------+-------------------+-------------------+
| Feature                   | Free     | Dreamer ($4.99)   | Mystic ($15.99)   |
+---------------------------+----------+-------------------+-------------------+
| Dream Analysis            | 1 trial  | Unlimited         | Unlimited         |
| Dream Image Generation    | 1 trial  | 10/month (FIX)    | Unlimited         |
| Voice-to-Text (NEW GATE)  | No       | Unlimited         | Unlimited         |
| Voice Recording (no STT)  | Yes      | Yes               | Yes               |
| Priority Support          | Yes      | Yes               | Yes               |
+---------------------------+----------+-------------------+-------------------+
```

## Changes

### 1. Fix Dreamer image credit inconsistencies (standardize to 10)

Several files currently use 25 for the Dreamer/Basic tier. These all need to be aligned to 10:

**`src/hooks/useSubscription.tsx`**
- `formatRevenueCatSubscription`: Change `imageTotal = 25` to `imageTotal = 10` for `com.lucidrepo.limited.monthly`
- `formatSubscriptionData`: Change `imageTotal = 25` to `imageTotal = 10` for the basic RevenueCat price_id

**`src/lib/stripe.ts`**
- `checkCreditsForSubscription`: Change the Basic RevenueCat image check from `imageUsed < 25` to `imageUsed < 10`
- Update the Stripe basic check (already 25 in places) to 10

**`src/hooks/useNativeSubscription.ts`**
- Change the Basic product features text from `'25 Dream Art Generations'` to `'10 Dream Art Generations'`

**`src/utils/subscriptionProductUtils.ts`**
- Already shows 10 for Dreamer -- no change needed

**`src/components/profile/StripeSubscriptionManager.tsx`**
- The fallback products already show 10 -- no change needed
- The `imageLimit` for non-premium is already `10` -- confirmed correct

**Database function `check_subscription_credits`**
- Already returns 10 for `price_basic` image credits -- no change needed

### 2. Gate voice-to-text transcription behind subscription

**`src/components/dreams/VoiceRecorder.tsx`**
- Accept new props: `isSubscribed: boolean`
- When recording stops and `onTranscriptionComplete` is called, check `isSubscribed`
- If not subscribed, skip the `transcribeAudio()` call and show a toast: "Subscribe to unlock AI voice transcription"
- Free users can still record and save audio, just no auto-transcription

**`src/components/DreamEntryForm.tsx`** (or wherever VoiceRecorder is rendered)
- Pass `isSubscribed` prop to VoiceRecorder, derived from `useSubscriptionContext` or `useFeatureUsage`

### 3. Update feature lists in subscription UIs

**`src/hooks/useNativeSubscription.ts`**
- Add `'Voice-to-Text Journaling'` to both Basic and Premium feature arrays

**`src/utils/subscriptionProductUtils.ts`**
- Add `'Voice-to-Text Journaling'` to both Mystic and Dreamer feature arrays

**`src/components/profile/StripeSubscriptionManager.tsx`**
- Add `'Voice-to-Text Journaling'` to the fallback product feature arrays

**`src/components/profile/NativeSubscriptionManager.tsx`**
- No code changes needed (features come from the products array)

## Files Modified

1. `src/hooks/useSubscription.tsx` -- fix image credits from 25 to 10
2. `src/lib/stripe.ts` -- fix image credits from 25 to 10
3. `src/hooks/useNativeSubscription.ts` -- fix features text + add voice-to-text
4. `src/utils/subscriptionProductUtils.ts` -- add voice-to-text to feature lists
5. `src/components/profile/StripeSubscriptionManager.tsx` -- add voice-to-text to fallback features
6. `src/components/dreams/VoiceRecorder.tsx` -- gate transcription behind subscription
7. `src/components/DreamEntryForm.tsx` -- pass subscription status to VoiceRecorder

