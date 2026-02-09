

## Add "Generate Character" Button to Avatar Dialog

### Change
Instead of automatically generating the avatar when "Save Avatar" is pressed, add a separate "Generate Character" button that appears after uploading a reference photo. This lets the user preview the generated avatar before committing to save.

### How It Works
1. User uploads a reference photo -- raw photo preview appears below the upload area
2. A "Generate Character" button appears next to/below the raw photo preview
3. Clicking it uploads the raw photo, calls the edge function, and shows the result in the avatar circle
4. User can re-generate if they don't like the result
5. "Save Avatar" only saves the current state to the database (no generation logic)

### Technical Details

**File: `src/components/profile/AIContextDialog.tsx`**

- Add a new state: `generatedAvatarUrl` to hold the URL returned by the edge function (separate from `photoPreview` which tracks what's loaded from DB)
- Add a `handleGenerateCharacter` function that:
  - Uploads the raw photo via `uploadPhoto()`
  - Calls `generateCharacterAvatar(rawPhotoUrl)`
  - On success, sets `generatedAvatarUrl` and updates `photoPreview` to show the result in the avatar circle
  - Shows loading spinner in the avatar circle during generation
- Add a "Generate Character" button that appears when `rawPhotoPreview` exists (a file has been selected). Disabled while loading.
- Simplify `handleSave`:
  - Remove all photo upload and generation logic from it
  - It saves `generatedAvatarUrl || contextData.photo_url` as the `photo_url` -- just a database write
  - If a photo was uploaded but not generated yet, show a toast prompting the user to generate first
- The avatar circle shows: loading spinner during generation, `generatedAvatarUrl` if set, otherwise `photoPreview` (from DB), otherwise "No avatar yet"

