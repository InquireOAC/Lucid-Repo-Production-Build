

## Plan: Add Technique Selector to New Dream Page

### Problem
The dedicated New Dream page (`/journal/new` via `NewDream.tsx`) doesn't have a technique selector, so `technique_used` is never saved when using that page. The `DreamEntryForm` (used in the dialog flow) already has one.

### Changes

**`src/pages/NewDream.tsx`**:
1. Add `technique_used` field to `formData` state (default `""`)
2. Add a technique selector UI in the tags/metadata section — a horizontally scrollable row of selectable badges (matching the existing tag pill style), with options: MILD, WILD, WBTB, Reality Checks, Meditation, Supplements
3. Pass `technique_used` through to `handleAddDream` — but since `handleAddDream` in `useJournalActions` doesn't accept `technique_used` yet, we need to update the pipeline

**`src/hooks/useJournalActions.tsx`**:
1. Extend the `handleAddDream` parameter type to include `technique_used?: string` and `lucidity_level?: number`
2. Pass these fields through to `addDreamToDb` so they're saved to the database

**`src/hooks/useDreamDbActions.tsx`**:
1. Add `technique_used` and `lucidity_level` to the `addDreamToDb` insert object (already in the Pick type via DreamEntry, just needs to be included in the actual insert payload)

### UI Design
Below the Tags section, add a "Technique" label with horizontally scrollable badge pills (same style as tags). Tapping one selects it (highlighted), tapping again deselects. Only one can be selected at a time.

### Files
| File | Action |
|---|---|
| `src/pages/NewDream.tsx` | Add technique_used state + selector UI + pass to submit |
| `src/hooks/useJournalActions.tsx` | Accept technique_used in handleAddDream params |
| `src/hooks/useDreamDbActions.tsx` | Include technique_used in DB insert |

