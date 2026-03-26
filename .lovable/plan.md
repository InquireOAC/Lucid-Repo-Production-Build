

## Plan: Subscription Gate Lucid Stats & Dream Avatar + Full-Page Edit Profile

### 1. Gate Lucid Stats page behind subscription (`src/pages/LucidStats.tsx`)

- Import `useFeatureUsage` and the paywall event dispatcher
- After the auth check, if user has no active subscription, show a premium upsell screen instead of stats (similar pattern to the existing "sign in" guard)
- The upsell screen: Crown icon, "Premium Feature" title, description about analytics, and an "Upgrade" button that dispatches `show-paywall`
- Subscribed users and admins see the full stats page as normal

### 2. Gate Dream Avatar behind subscription (`src/components/profile/SettingsDialog.tsx`)

- When the "Dream Avatar" settings item is clicked, check subscription status
- If not subscribed, dispatch `show-paywall` instead of opening `AIContextDialog`
- Add a small "Premium" badge/crown icon next to the Dream Avatar menu item

### 3. Convert Edit Profile from dialog to full page (`src/components/profile/EditProfileDialog.tsx`)

Transform the cramped dialog into a full-screen sheet/page with richer content:

- Change from `Dialog` to a full-screen overlay using `Sheet` (side="bottom", full height) or a `Dialog` with `max-w-full h-full` styling
- **Layout redesign**:
  - Large centered avatar preview at top with tap-to-change
  - Sectioned form with visual groupings:
    - **Profile Picture** section: Symbol vs Dream Avatar picker (existing), but bigger preview
    - **Personal Info** section: Display Name, Username, Bio with better spacing
    - **Social Links** section: Inline social link editors (currently in a separate dialog — merge them here)
  - Sticky bottom save bar
  - Back/close button at top-left
- Add a header banner area with gradient background
- Include dream stats summary (dream count, streak) as read-only info cards

### Files Modified

| File | Change |
|------|--------|
| `src/pages/LucidStats.tsx` | Add subscription gate with paywall upsell |
| `src/components/profile/SettingsDialog.tsx` | Gate Dream Avatar click behind subscription |
| `src/components/profile/EditProfileDialog.tsx` | Redesign as full-screen page with sections, social links, and richer layout |
| `src/components/profile/ProfileDialogs.tsx` | Pass social links props through to EditProfileDialog |
| `src/components/profile/ProfileMainContent.tsx` | Pass additional props for edit profile |

