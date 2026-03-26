

## Plan: Remove AI Dream Analyst Card & Fix Feed Avatars

### Changes

**1. Remove AI Dream Analyst card** (`src/pages/Home.tsx`)
- Delete lines 90-105 (the entire AI Dream Analyst CTA block)
- Remove unused `Crosshair` import

**2. Fix avatar display in FeedDreamCard** (`src/pages/Home.tsx`)
- The feed query already fetches `avatar_url`, `avatar_symbol`, and `avatar_color` from profiles
- The `FeedDreamCard` currently only checks `avatar_url` and falls back to an empty div — it ignores symbol avatars entirely
- Replace the inline avatar logic with the existing `SymbolAvatar` component (used elsewhere in the app, e.g. `DreamCardUser.tsx`)
- This will properly show: uploaded avatar photos, symbol-based avatars, or a letter fallback

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Remove AI Analyst card; import `SymbolAvatar`; update `FeedDreamCard` avatar rendering |

