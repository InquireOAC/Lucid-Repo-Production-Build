

## Pass Generated Avatar to Dream Image Generation

### Current State
The code in `useImageGeneration.ts` (lines 62-69) already fetches `photo_url` from `ai_context` and passes it as `referenceImageUrl` to `generateDreamImageFromAI`. Since `AIContextDialog.handleSave` saves the AI-generated avatar as `photo_url` (not the raw upload), this is already the correct behavior.

### What Needs to Change

**No changes needed to the dream generation flow.** The current code in `useImageGeneration.ts` correctly:
1. Fetches `aiContext.photo_url` (which is the generated avatar, not the raw reference photo)
2. Passes it as `referenceImageUrl` to `generateDreamImageFromAI`
3. The edge function includes it as `inline_data` so Gemini renders the user's likeness

### Only Change: Avatar Dialog UI (`AIContextDialog.tsx`)

Show the raw uploaded photo in a preview under the "Reference Photo" section instead of in the avatar circle:

- Add a `rawPhotoPreview` state for the blob URL of the selected file
- In `handlePhotoUpload`, set `rawPhotoPreview` (not `photoPreview`)
- Add a small image preview below the upload area showing `rawPhotoPreview`
- The avatar circle at top only shows the AI-generated avatar from `photo_url`
- Remove the fallback that saves the raw photo when avatar generation fails -- show an error instead

### Technical Details

**`src/components/profile/AIContextDialog.tsx`:**
- New state: `const [rawPhotoPreview, setRawPhotoPreview] = useState<string | null>(null)`
- `handlePhotoUpload`: change `setPhotoPreview(URL.createObjectURL(file))` to `setRawPhotoPreview(URL.createObjectURL(file))`
- Add `<img>` element below the upload area displaying `rawPhotoPreview` when present, with a rounded border and max height
- In `handleSave`: remove the fallback block (`toast.warning` + `photoUrl = rawPhotoUrl`). If generation fails, show `toast.error` and return early
- `photoPreview` only updates from `contextData.photo_url` (loaded from DB) or after successful avatar generation

**`src/hooks/useImageGeneration.ts`:** No changes -- keep existing lines 62-69 that pass `aiContext.photo_url` (the generated avatar) as `referenceImageUrl`

