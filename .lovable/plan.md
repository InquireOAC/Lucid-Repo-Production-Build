

# Multi-Reference Avatar: Face, Outfit, and Accessory Uploads

## Overview

Upgrade the Dream Avatar dialog to accept 3 separate reference images (face photo, outfit photo, accessory photo) that are all sent to the AI image generator to produce a full-body and portrait avatar with accurate likeness, clothing, and accessories.

## Changes

### 1. Database Migration -- Add new columns to `ai_context`

Add two new nullable columns to store the outfit and accessory reference photo URLs:

```text
ALTER TABLE ai_context ADD COLUMN outfit_photo_url TEXT;
ALTER TABLE ai_context ADD COLUMN accessory_photo_url TEXT;
```

### 2. `src/components/profile/AIContextDialog.tsx` -- Multi-image upload UI

- Add state for `outfitFile`, `outfitPreview`, `accessoryFile`, `accessoryPreview`
- Replace the single "Reference Photo" upload area with 3 labeled upload sections:
  - **Face Photo** (required) -- existing upload, relabeled
  - **Outfit Photo** (optional) -- new upload for clothing/outfit reference
  - **Accessory Photo** (optional) -- new upload for accessories (jewelry, glasses, hats, etc.)
- Each section shows a thumbnail preview when a file is selected
- The "Generate Character" button remains but now requires at least the face photo
- Remove the text-based "Clothing Style" input field since outfit is now image-based
- Update `handleSave` to persist all 3 URLs to the `ai_context` table
- Update `loadAIContext` to load and display existing outfit/accessory photos

### 3. `src/components/profile/AIContextDialog.tsx` -- Updated prompt construction

Update `generateCharacterAvatar` to:
- Upload all provided photos (face, outfit, accessory) to Supabase storage
- Pass all image URLs to the edge function via new body parameters: `outfitImageUrl` and `accessoryImageUrl`
- Update prompts to request a **full-body portrait** that incorporates:
  - The person's face/identity from the face photo
  - The clothing/outfit from the outfit photo (if provided)
  - The accessories from the accessory photo (if provided)

### 4. `supabase/functions/generate-dream-image/index.ts` -- Accept multiple reference images

Update the edge function to:
- Accept `outfitImageUrl` and `accessoryImageUrl` in addition to existing `referenceImageUrl`
- For each provided image, fetch it, convert to base64, and add as a labeled content part:
  - Face image tagged as `[CHARACTER_IDENTITY_REFERENCE]` (existing behavior)
  - Outfit image tagged as `[OUTFIT_REFERENCE]` with instruction: "Extract ONLY the clothing, garments, and outfit from this image. Dress the character in this exact outfit."
  - Accessory image tagged as `[ACCESSORY_REFERENCE]` with instruction: "Extract ONLY the accessories (jewelry, glasses, hats, bags, etc.) from this image. Add these exact accessories to the character."
- The main prompt will be updated to request a full-body composition when outfit/accessory references are present

### 5. `src/utils/aiContextUtils.ts` -- Pass new URLs to dream image generation

Update `getUserAIContext` return type and consumers to also return `outfit_photo_url` and `accessory_photo_url` so they can be passed during dream image generation when AI context is enabled.

## Files Changed

| File | Action |
|------|--------|
| Database migration | Add `outfit_photo_url` and `accessory_photo_url` columns to `ai_context` |
| `src/components/profile/AIContextDialog.tsx` | Multi-image upload UI + updated prompt logic |
| `supabase/functions/generate-dream-image/index.ts` | Accept and process multiple reference images |
| `src/utils/aiContextUtils.ts` | Return new photo URLs for dream generation |

## Technical Details

- Each uploaded image goes through the same `uploadPhoto` helper (stored in `dream-images` bucket under `ai-context-photos/`)
- The edge function processes images sequentially: face first, then outfit, then accessory -- each as a separate labeled content part in the messages array
- Max file size remains 5MB per image
- Outfit and accessory uploads are optional -- if not provided, behavior falls back to current face-only generation
- The prompt will dynamically adjust: if all 3 images are provided, it requests a "full-body portrait wearing the exact outfit and accessories shown"; if only face, it generates a portrait as before

