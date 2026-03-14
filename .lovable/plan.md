

# Re-add Video Generation — Mystic-Only Access

Video generation infrastructure already exists (`DreamImageWithVideo`, `GenerateVideoDialog`, edge functions). The components are wired up and functional. The only change needed is ensuring the `isSubscribed` prop that gates video access reflects **Mystic-tier only** (not Dreamer).

## Changes

### 1. `src/components/DreamDetail.tsx`
- Currently: `const isSubscribed = isAdmin || !!subscription?.subscribed;`
- This checks a `.subscribed` property that doesn't exist in the formatted subscription object (it has `.plan` and `.status`). This means video generation is effectively broken for everyone.
- Change to: `const isMystic = isAdmin || (subscription?.status === 'active' && subscription?.plan === 'Premium');`
- Pass `isMystic` as the `isSubscribed` prop to `DreamDetailContent`

### 2. No other file changes needed
- `DreamImageWithVideo.tsx` already uses `isSubscribed` to show/hide "Generate Video" vs "Generate Video (Subscribe)" in the action drawer
- `GenerateVideoDialog.tsx` is fully functional
- `DreamDetailContent.tsx` passes `isSubscribed` through correctly
- Edge functions (`compose-animation-prompt`, `generate-dream-video`) are already deployed

This is a one-line fix that correctly gates video generation to Mystic (Premium) subscribers and admins only.

