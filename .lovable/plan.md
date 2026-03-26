

## Subscription Gating Audit: Issues Found & Fix Plan

### Critical Bugs

1. **Free trial stored in localStorage — trivially bypassable**
   - `useFeatureUsage.ts` line 26: `localStorage.getItem(`feature_usage_${user.id}`)` is the sole gatekeeper for free trials
   - Users can clear localStorage, use incognito, or switch browsers to get unlimited free uses
   - No server-side record of free trial consumption exists

2. **Stale `hasActiveSubscription` in `canUseFeature`**
   - Line 165: `if (hasActiveSubscription)` checks the React state, but `checkSubscriptionStatus()` on line 163 is async and updates state — the state won't be updated yet in the same render cycle
   - This means the first call after subscription activation may still deny access

3. **Chat gating reuses `analysis` feature key**
   - `useChatFeatureAccess.ts` lines 30/54: `hasUsedFeature('analysis')` and `recordFeatureUsage('analysis')` — chat usage is tracked under the "analysis" bucket
   - Using one free analysis also blocks free chat, and vice versa — likely unintentional

4. **No per-message gating on Chat — free trial gives unlimited messages**
   - `canUseChat()` only checks if the user has *ever used* the analysis feature. Once they pass the check for message #1, they can send unlimited messages in that session without re-checking
   - `recordChatUsage()` is called after each message but only marks localStorage — it doesn't actually limit subsequent messages

5. **Image generation records usage inconsistently**
   - `useImageGeneration.ts` lines 119-125: If `hasUsedFeature("image")` is false, it calls `markFeatureAsUsed` (localStorage only). If true, it calls `recordFeatureUsage` (database increment). But the database increment only works for subscribed users — free trial usage is never recorded server-side.

### Design Issues

6. **Dreamer and Mystic tiers have nearly identical feature lists**
   - Both get: Unlimited Analysis, Dream Video Generation, Voice-to-Text Journaling
   - Only difference: 10 vs unlimited image generations
   - There's no reason to pay 3x more ($15.99 vs $4.99) for just more images — the value gap is unclear

7. **"Dream Video Generation" and "Voice-to-Text" listed as paid features but no gating exists**
   - These features are listed in the paywall but there's no `canUseFeature('video')` or `canUseFeature('voice')` check anywhere in the codebase
   - Free users can likely access these features without restriction

8. **Chat has no subscription-tier differentiation**
   - Chat is gated as a binary (free trial vs subscribed) but isn't differentiated between Dreamer/Mystic tiers
   - It's listed nowhere in the paywall feature lists

9. **Analysis usage counter increments in DB but is never checked**
   - `dream_analyses_used` increments in `stripe_subscriptions` but `checkCreditsForSubscription` returns `true` for all analysis regardless — the counter is dead code

### Proposed Fixes

#### Phase 1: Fix critical bypass bugs

**A. Server-side free trial tracking** (new migration + code changes)
- Add a `feature_free_trials` table: `(user_id UUID, feature TEXT, used_at TIMESTAMPTZ, PRIMARY KEY(user_id, feature))`
- Replace all localStorage checks with a Supabase query to this table
- On first use, insert a row; on subsequent checks, if row exists → trial consumed
- Files: `useFeatureUsage.ts`, new migration

**B. Fix stale state in `canUseFeature`**
- Make `checkSubscriptionStatus` return the boolean directly instead of relying on React state
- File: `useFeatureUsage.ts`

**C. Give Chat its own feature key**
- Change `useChatFeatureAccess.ts` to use `'chat'` instead of `'analysis'`
- Add `'chat'` to the `FeatureType` union

#### Phase 2: Fix gating gaps

**D. Add per-session message limits for free chat**
- Free trial: 5 messages per session, then paywall
- Dreamer: unlimited messages
- Mystic: unlimited messages

**E. Gate video generation and voice-to-text**
- Add `canUseFeature('video')` check in video generation flow
- Add `canUseFeature('voice')` check in voice recorder
- Or remove them from the paid feature list if they're intentionally free

#### Phase 3: Tier differentiation (optional, recommended)

**F. Differentiate Dreamer vs Mystic more clearly**
- Suggestion: Dreamer gets 5 chat messages/day, Mystic gets unlimited
- Dreamer gets 10 images, Mystic gets unlimited (already done)
- Dreamer gets basic analysis, Mystic gets "deep analysis" with more sections
- Or: keep features identical but adjust pricing to be closer ($4.99 / $9.99)

### Files Changed

| File | Action |
|------|--------|
| New migration | Create `feature_free_trials` table with RLS |
| `src/hooks/useFeatureUsage.ts` | Replace localStorage with Supabase queries; fix async state bug |
| `src/hooks/useChatFeatureAccess.ts` | Use `'chat'` feature key; add message-count limits |
| `src/lib/stripe.ts` | Add `'chat'` to feature type; update `checkCreditsForSubscription` |
| `src/components/DreamChat.tsx` | Enforce per-session message cap for free/Dreamer users |
| `src/components/paywall/PaywallDialog.tsx` | Add Chat to the feature list display |
| Voice/Video components | Add gating or remove from paid list |

