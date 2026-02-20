
# Fix Dream Avatar Display in Dream Detail

## Problem
When viewing a dream from the journal, the `SymbolAvatar` in the dream detail header doesn't show the user's Dream Avatar image. The `avatarUrl` prop is never passed to the `SymbolAvatar` component, so it always falls back to the symbol icon.

The Lucid Repo already works correctly -- `DreamCardUser` passes `avatarUrl` from `profile.avatar_url`. The only missing piece is in `DreamDetail.tsx`.

## Fix

**File: `src/components/DreamDetail.tsx`** (line ~161)

Add `avatarUrl` prop to the `SymbolAvatar` call in the header section:

- Extract `avatarUrl` from the profile object (same pattern as `avatarSymbol` and `avatarColor`)
- Pass it as `avatarUrl={avatarUrl}` to the `SymbolAvatar` component

The `authProfile` from `useAuth()` already contains `avatar_url` from the `profiles` table, so for owned dreams this will show the Dream Avatar if set. For other users' dreams, `dream.profiles.avatar_url` will be used (already included in all dream queries).

## Scope
- Single line addition in one file
- No database changes needed
- No new dependencies
