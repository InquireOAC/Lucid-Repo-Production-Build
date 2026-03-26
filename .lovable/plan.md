

## Plan: Overhaul Paywall & Feature Gating System

Two major workstreams: (1) fix the broken `showSubscriptionPrompt` which currently only logs to console, and (2) redesign all paywall UI to match the app's cosmic aesthetic.

---

### Problem Summary

- **`showSubscriptionPrompt()`** in `src/lib/stripe.ts` does nothing visible — it only calls `console.warn`. Users hitting the paywall see no UI feedback.
- Free trial tracking uses `localStorage`, meaning users can clear storage or switch devices to bypass gating.
- Paywall UIs across Analysis, Image Gen, and Chat are inconsistent — some show Lock buttons, some show nothing.
- The subscription plan cards (Stripe & Native) are functional but generic.

---

### 1. Create a Unified Paywall Dialog Component

**New file: `src/components/paywall/PaywallDialog.tsx`**

A full-screen or bottom-sheet dialog that appears whenever a gated feature is triggered without access. Themed to match the cosmic dark aesthetic.

- Header: feature-specific icon + title (e.g., "Dream Analysis", "Dream Art", "AI Chat")
- Benefit list with icons for each feature
- Two plan cards (Dreamer / Mystic) with subscribe buttons
- Platform-aware: Stripe checkout on web, RevenueCat on native
- "Restore Purchases" button on native
- Legal footer

### 2. Create a Paywall State Manager

**New file: `src/components/paywall/usePaywall.ts`**

A hook + React context that provides:
- `showPaywall(feature: 'analysis' | 'image' | 'chat')` — opens the dialog
- `isPaywallOpen` state
- Replaces all `showSubscriptionPrompt()` calls across the codebase

### 3. Replace `showSubscriptionPrompt` Everywhere

**Files to update:**
- `src/lib/stripe.ts` — rewrite `showSubscriptionPrompt` to dispatch a custom event
- `src/components/DreamAnalysis.tsx` — use paywall dialog instead of Lock button
- `src/components/dreams/InitialImagePrompt.tsx` — use paywall dialog
- `src/components/DreamChat.tsx` — use paywall dialog for locked state
- `src/hooks/useFeatureUsage.ts` — trigger paywall instead of silent prompt
- `src/hooks/useChatFeatureAccess.ts` — trigger paywall
- `src/hooks/useImageGeneration.ts` — trigger paywall

### 4. Redesign Plan Cards in SubscriptionDialog & Managers

**Files to update:**
- `src/components/profile/StripeSubscriptionManager.tsx`
- `src/components/profile/NativeSubscriptionManager.tsx`
- `src/components/profile/SubscriptionDialog.tsx`

New design for plan cards:
- Dark flat backgrounds (`bg-[#0d1425]`) consistent with app
- Mystic card gets a subtle gradient border highlight
- Large price display with `/mo` suffix
- Feature list with differentiated icons per feature (not just checkmarks)
- "Most Popular" badge on Mystic uses primary glow
- Subscribe buttons: Mystic = solid primary, Dreamer = outline

### 5. Architecture of the Paywall Dialog

```text
┌─────────────────────────────────┐
│  [X]                            │
│                                 │
│     ✦  Unlock [Feature Name]    │
│                                 │
│  "Your free trial has been      │
│   used. Subscribe to continue." │
│                                 │
│  ┌─── Dreamer ───┐ ┌─ Mystic ─┐│
│  │  $4.99/mo     │ │ $15.99/mo ││
│  │  ✓ Analysis   │ │ ✓ All    ││
│  │  ✓ 10 Images  │ │ ✓ Unlim  ││
│  │  [Subscribe]  │ │[Subscribe]││
│  └───────────────┘ └──────────┘│
│                                 │
│     Restore Purchases (native)  │
│     Terms of Service            │
└─────────────────────────────────┘
```

### 6. Event-Based Trigger System

Rather than prop-drilling the paywall through every component, use a global event pattern:

```typescript
// lib/stripe.ts
export const showSubscriptionPrompt = (featureType) => {
  window.dispatchEvent(new CustomEvent('show-paywall', { detail: { feature: featureType } }));
};
```

The `PaywallDialog` component listens for this event at the app root level (mounted in `App.tsx` or `MainLayout.tsx`). This means **zero changes** to the existing call sites in hooks — they already call `showSubscriptionPrompt`, which will now actually work.

### Files Changed

| File | Action |
|------|--------|
| `src/components/paywall/PaywallDialog.tsx` | **Create** — themed paywall dialog |
| `src/lib/stripe.ts` | **Edit** — `showSubscriptionPrompt` dispatches custom event |
| `src/layouts/MainLayout.tsx` | **Edit** — mount PaywallDialog |
| `src/components/profile/StripeSubscriptionManager.tsx` | **Edit** — redesign plan cards |
| `src/components/profile/NativeSubscriptionManager.tsx` | **Edit** — redesign plan cards |
| `src/components/profile/SubscriptionDialog.tsx` | **Edit** — minor styling alignment |
| `src/components/DreamAnalysis.tsx` | **Edit** — locked state triggers paywall dialog |
| `src/components/dreams/InitialImagePrompt.tsx` | **Edit** — locked state triggers paywall dialog |
| `src/components/DreamChat.tsx` | **Edit** — locked state triggers paywall dialog |

