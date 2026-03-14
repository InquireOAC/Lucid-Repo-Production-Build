
Root cause identified:
- The menu you’re opening is from `src/pages/DreamStoryPage.tsx` (`HeroImage` drawer), not `DreamImageWithVideo`.
- That drawer only has **Save Image**, so **Generate Video** never appears there (even for admins).
- Previous fixes were in `DreamDetail` / edit flow, so they don’t affect `/dream/:dreamId` story view.

Implementation plan:

1) Add video access gating to `DreamStoryPage`
- In `DreamStoryContent`, add:
  - `useSubscriptionContext()` + `useUserRole()`
  - `isMystic = isAdmin || (subscription?.status === "active" && subscription?.plan === "Premium")`
  - `canGenerateVideo = isOwner && isMystic`
  - `showSubscribeLocked = isOwner && !isMystic`
- Keep owner requirement for editing/generating on this page.

2) Extend `HeroImage` action drawer to support video generation
- Update `HeroImage` props to receive:
  - `dreamId`, `dreamContent`, `videoUrl`, `canGenerateVideo`, `showSubscribeLocked`, and callback(s) for video updates.
- In drawer:
  - Show **Generate Video** when `canGenerateVideo && !videoUrl`
  - Show disabled **Generate Video (Subscribe)** when `showSubscribeLocked && !videoUrl`
  - Keep **Save Image** always.

3) Wire in `GenerateVideoDialog` on Dream Story page
- Add `showVideoDialog` state in `DreamStoryContent`.
- Open dialog from HeroImage action.
- On success, update local dream state (`video_url`) so UI reflects result immediately.

4) Render generated video in Hero area when available
- In `HeroImage`, render `<video ...>` when `videoUrl` exists (fallback poster/image if needed).
- Keep current title/tag overlay and long-press/right-click behavior intact.

5) Enforce top-tier rule server-side (security hardening)
- Update `supabase/functions/generate-dream-video/index.ts`:
  - Admin bypass remains.
  - Non-admin must have active subscription with top-tier price only (`price_premium` / `com.lucidrepo.unlimited.monthly`).
  - Reject lower tiers.
- This prevents client-side bypass attempts.

6) Validation checklist
- Admin owner on `/dream/:id`: right-click/long-press shows **Generate Video**.
- Premium owner: shows **Generate Video**.
- Basic owner: shows disabled **Generate Video (Subscribe)**.
- Non-owner: no generation option.
- After generation, video displays in hero and persists after refresh.
- Verify on mobile (390w long-press drawer) and desktop (right-click drawer).
