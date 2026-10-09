## Goal

Consolidate all character avatar management (you + side characters) in one place: the **Edit Avatar** dialog in Settings. Remove the inline Side Characters UI from the dream entry/edit screens, but keep the background auto-detection so saving a dream still links named people to your character roster.

## Background

- `AIContextDialog` (Settings → Dream Avatar → Edit Avatar) already reads/writes the `public.dream_characters` table with a carousel + add/edit flow that supports name, face/outfit/accessory references, style picker, and AI portrait generation.
- The `EditDream` page has a second, parallel UI ("Side Characters" collapsible) using `CharacterCreatorDialog`, which writes to the same `dream_characters` table.
- Auto-detection runs in `useJournalActions.tsx` via the `extract-dream-characters` edge function and is fired after a dream save. It inserts/links rows in `dream_characters` and `dream_entries.dream_character_ids`.

Because both UIs already write to the same table, side characters auto-detected from dreams already show up in the Settings carousel today — we just need to remove the duplicate inline UI.

## Changes

### 1. `src/pages/EditDream.tsx` — remove inline Side Characters UI
- Delete the entire "Side Characters" collapsible block (the `<button>` toggle + `AnimatePresence` body + add card).
- Remove related state, refs, and helpers: `sideCharacters`, `characterDialog`, `charactersOpen`, `isExtractingCharacters`, `refreshSideCharacters`, and its `useEffect`.
- Remove the `<CharacterCreatorDialog>` mount near the bottom of the page and its `onSaved` linking logic.
- Drop the now-unused imports: `CharacterCreatorDialog`, `Users`, `Plus`.
- Leave the save flow untouched so `handleEditDream` still kicks off background extraction.

### 2. `src/components/dreams/CharacterCreatorDialog.tsx` — delete
- No remaining importers after step 1, and `AIContextDialog` already provides the equivalent (and more polished) creator UI for the same `dream_characters` rows.

### 3. `src/components/profile/AIContextDialog.tsx` — minor copy + clarity polish
- Update the empty-state / header copy so it's clear this dialog manages **both** the dreamer's own avatar and side characters (e.g. subtitle: "Your dream self and the people who show up in your dreams"). Carousel chips already render every row, including the auto-detected ones.
- No schema or logic changes; we are not introducing a "self vs side" flag.

### 4. `src/hooks/useJournalActions.tsx` — leave as-is
- Confirms the post-save call to `extract-dream-characters` still runs after `handleAddDream` / `handleEditDream`, so saving a dream with named people continues to create/link `dream_characters` rows that then appear in the Settings dialog.

### 5. New Dream / DreamEntryForm
- No edits required — neither file currently shows a Side Characters section.

## Out of scope

- No database or RLS changes.
- No changes to the `extract-dream-characters` edge function.
- No changes to cinematic/scene generation that reads `dream_character_ids`.

## Risks

- Users mid-flow who relied on the inline section will need to discover Settings → Edit Avatar. The empty-state copy update in AIContextDialog plus the existing auto-detection toast cover this.
