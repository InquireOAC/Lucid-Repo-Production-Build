

## Fix: Dream Avatar Page - Empty State and Missing Avatar

### Problems
1. **Empty page when no characters exist**: The dialog shows a bare "No characters yet" message with a button, instead of immediately entering the character creation form.
2. **Existing avatar not displaying**: If the user has data in `ai_context` but no records in `dream_characters`, the page appears empty because it only queries `dream_characters`.

### Solution

**File: `src/components/profile/AIContextDialog.tsx`**

Two changes:

1. **Auto-enter "add" mode when no characters exist**: After `fetchCharacters` completes and returns 0 results, automatically set `mode` to `"add"` instead of staying in `"view"` mode showing the empty state. This gives users the creation form immediately.

2. **Migrate existing `ai_context` data**: When `dream_characters` is empty, also check the `ai_context` table. If the user has an existing avatar there (photo_url), auto-create a `dream_characters` record from it so their existing avatar appears in the carousel. This handles the case where a user previously generated an avatar before the multi-character system was added.

### Changes Detail

- In `fetchCharacters()` (around line 89-109): After fetching dream_characters, if empty, query `ai_context` for the user. If ai_context has a `photo_url`, insert a new `dream_characters` row from that data and re-fetch. If still empty after migration attempt, set `mode = "add"`.
- Remove the empty state block (lines 537-545) since users will never see "view" mode with 0 characters.

