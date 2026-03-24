

## Plan: Fix Dream Saving Being Blocked by Content Filter

### Root Cause
`src/pages/NewDream.tsx` (lines 78-79) runs `containsInappropriateContent()` on the dream text before saving. This filter flags extremely common dream words: "die", "kill", "hurt", "harm", "naked", "expose", "attack", "knife", "gun", "stalk", "assault". Longer dreams naturally contain more of these words, making it virtually impossible to save detailed dreams.

This was already fixed in `DreamEntryForm.tsx` (used by the dialog-based entry) but was never removed from `NewDream.tsx` (the full-page entry).

### Fix — `src/pages/NewDream.tsx`

Remove the content filter check from the `handleSubmit` function (lines 78-79). Private dream journaling should not be censored — content filtering should only apply when sharing dreams publicly.

**Remove:**
```typescript
const textToCheck = `${formData.title} ${formData.content}`;
if (containsInappropriateContent(textToCheck)) { toast.error(getContentWarningMessage()); return; }
```

Also remove the unused imports of `containsInappropriateContent` and `getContentWarningMessage`.

### Files Modified (1)
`src/pages/NewDream.tsx` — Remove 2 lines of filter logic + 1 import line.

