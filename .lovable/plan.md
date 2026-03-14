

# Add Video Generation & Regenerate to Section Images

## Problem
The `SectionImage` component's action drawer only has "Save Image." It needs "Generate Video" and "Regenerate Image" (with prompt editing) options.

## Changes

### 1. `src/pages/DreamStoryPage.tsx` — Extend `SectionImage` component

**Props**: Add `dreamId`, `dreamContent` (section text), `prompt`, `canGenerateVideo`, `showSubscribeLocked`, `isOwner`, and callbacks `onVideoGenerated`, `onImageRegenerated`.

**Drawer actions**:
- **Save Image** — keep as-is
- **Generate Video** — opens `GenerateVideoDialog` using the section image as source (gated by Mystic/Admin)
- **Regenerate Image** — toggles an inline prompt editor (textarea pre-filled with existing prompt) + "Regenerate" button. On submit, calls `compose-cinematic-prompt` (if prompt empty) then `generate-dream-image`, updates the section in `section_images` JSON in DB, and refreshes local state.

**State additions in `SectionImage`**:
- `showVideoDialog` — controls video dialog
- `showRegeneratePrompt` — toggles prompt editor
- `editPrompt` — editable prompt text
- `isRegenerating` — loading state

**State additions in `DreamStoryContent`**:
- `sectionVideoDialogIndex` — which section's video dialog is open (null = closed)
- Helper `handleSectionVideoGenerated(index, videoUrl)` — updates `section_images[index]` with a `video_url` field, saves to DB
- Helper `handleSectionImageRegenerated(index, newImageUrl, newPrompt)` — updates `section_images[index]` image_url/prompt, saves to DB

### 2. `SectionImage` render updates
- Show video if `section.video_url` exists (autoplay loop muted, with poster fallback)
- Below the image, when `showRegeneratePrompt` is true, render a small card with Textarea + Regenerate button
- Drawer gets 3 actions: Save Image, Generate Video (gated), Regenerate Image (owner only)

### 3. Wire `GenerateVideoDialog` per section
- Reuse existing `GenerateVideoDialog`, passing section's `image_url` as `imageUrl` and section `text` as `dreamContent`
- On success, persist `video_url` into the section's entry in the `section_images` JSONB array

### 4. Regenerate logic (inside `SectionImage` or a small helper)
- Call `compose-cinematic-prompt` with edited prompt or section text
- Call `generate-dream-image` with the resulting prompt
- Update the specific section entry in DB via `supabase.from("dream_entries").update({ section_images: updatedArray })`
- Refresh local dream state

No database migrations needed — `section_images` is already a JSONB column that can hold `video_url` per section.

