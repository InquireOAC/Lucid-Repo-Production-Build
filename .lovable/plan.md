

# Fix Avatar Deletion and Redesign Reference Photo UI

## Problem 1: Cannot Delete Saved Avatar
The Face photo's `onClear` handler only clears `photoFile` and `rawPhotoPreview`, but does NOT clear `contextData.photo_url` or `photoPreview`. Since the `PhotoUploadSection` displays `preview || existingUrl`, the saved avatar URL from the database always shows and cannot be removed. The same issue exists for generated avatars -- `photoPreview` (which holds the generated avatar URL) is never cleared either.

## Problem 2: UI Layout
The current 3-column grid with tiny 64x64 upload boxes feels cramped. The upload sections need clearer visual hierarchy and better touch targets.

## Changes to `src/components/profile/AIContextDialog.tsx`

### Fix 1: Allow deleting saved avatar from Face section
Update the Face `onClear` handler to also clear:
- `contextData.photo_url` (the saved DB URL)
- `photoPreview` (the generated avatar display URL)

This ensures the avatar preview circle also clears, and when the user saves, `photo_url` will be set to `null` in the database.

### Fix 2: Redesign the PhotoUploadSection component
Replace the cramped 3-column grid with a vertical stack of card-style rows. Each reference photo gets a horizontal card with:
- A larger thumbnail (80x80 rounded) on the left
- Label, description text, and upload/clear actions on the right
- Descriptions: Face = "Required -- used for likeness", Outfit = "Optional -- clothing reference", Accessory = "Optional -- jewelry, glasses, etc."
- Clear button positioned as a small icon on the thumbnail corner (existing pattern)
- Upload area uses a tappable card-style layout instead of a tiny dashed box

### Layout structure per row:
```text
+------------------------------------------+
| [80x80 image/upload]  Face *             |
|                        Used for likeness  |
|                        [Upload / Clear]   |
+------------------------------------------+
```

### Fix 3: Add delete confirmation for generated avatar
When clearing the Face photo and a generated avatar exists, show a confirmation toast or simply clear it immediately (since it hasn't been saved yet if `generatedAvatarUrl` is set, or will be nulled on next save if from DB).

## Technical Details

**Single file changed:** `src/components/profile/AIContextDialog.tsx`

- Face `onClear`: Add `setContextData(prev => ({ ...prev, photo_url: undefined }))` and `setPhotoPreview(null)`
- Outfit/Accessory `onClear`: Already clear `contextData` fields (correct), but also need to persist null on save -- this already works since `handleSave` reads from `contextData`
- Redesign `PhotoUploadSection` to use a horizontal card layout with larger thumbnails and helper text
- Add a `description` prop to `PhotoUploadSection` for contextual help text
- Change grid from `grid-cols-3` to a vertical `space-y-3` stack of cards

