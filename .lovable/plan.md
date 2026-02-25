
## Fix Video Aspect Ratio, Persist Video URL, and Add Video Management in Edit Dream

### 1. Fix Video Aspect Ratio Mismatch

The Veo API request in `generate-dream-video/index.ts` does not specify an `aspectRatio` parameter. Veo defaults to 16:9 regardless of the input image's dimensions. The fix is to detect the source image's aspect ratio before calling the API and pass the matching `aspectRatio` parameter (e.g., `"9:16"`, `"16:9"`, `"1:1"`, or the closest supported ratio).

**File: `supabase/functions/generate-dream-video/index.ts`**
- After fetching the image, determine its dimensions (decode image headers or use the known aspect from the request)
- Accept an optional `aspectRatio` param from the client, or compute it server-side by probing the image
- Pass `aspectRatio` in the Veo `parameters` block alongside `sampleCount`

### 2. Persist Video URL and Play in Dream Detail

The edge function already saves `video_url` to the DB (line 296-300). The issue is that after generation, the client updates local state but doesn't persist it back to the local dream store so it survives navigation.

**File: `src/components/dreams/DreamImageWithVideo.tsx`**
- After `onVideoGenerated` fires, also call `onUpdate` (new prop) to persist `video_url` in the local dream store

**File: `src/components/DreamDetail.tsx`**
- Pass an `onUpdate` callback through to `DreamDetailContent` -> `DreamImageWithVideo` so the video URL gets saved to the dream store
- The existing code already shows video when `videoUrl` is set (line 201) -- just need to ensure it's loaded from `dream.video_url` on open (already done at line 47)

**File: `src/hooks/useDreamDbActions.tsx`**
- Add `video_url` to the `allowedFields` array (line 42) so edits that include video_url are persisted

### 3. Video Carousel in Edit Dream Form

Add a horizontal carousel in the "Dream Visualization" section of `DreamEntryForm.tsx` / `DreamImageGenerator.tsx` that shows:
- **Slide 1**: The dream image (existing behavior)
- **Slide 2** (if video exists): The dream video with playback, plus buttons to edit the animation prompt and regenerate/delete the video

**File: `src/components/DreamImageGenerator.tsx`**
- Accept new props: `existingVideoUrl`, `dreamId`, `onVideoDeleted`, `onVideoGenerated`, `dreamContent`
- When a video exists, wrap the image display in a `Carousel` with two slides
- Slide 1: Existing `ImageDisplay` component
- Slide 2: Video player with:
  - Inline `<video>` element playing the existing video
  - "Delete Video" button (deletes from storage + clears `video_url` in DB)
  - "Regenerate Video" button (opens `GenerateVideoDialog` to edit prompt and regenerate)
- Add dot indicators to show which slide is active

**File: `src/components/DreamEntryForm.tsx`**
- Pass `existingDream?.video_url` and `existingDream?.id` as new props to `DreamImageGenerator`
- Pass `dreamContent` (formData.content) for the animation prompt composer
- Handle `onVideoDeleted` to clear video_url from the dream
- Handle `onVideoGenerated` to update the video_url

**File: `src/components/dreams/GenerateVideoDialog.tsx`**
- No structural changes needed -- it already accepts `dreamId`, `imageUrl`, `onVideoGenerated`, and `dreamContent`

### 4. Video Deletion Logic

**File: `src/components/DreamImageGenerator.tsx`**
- Add a `handleDeleteVideo` function that:
  1. Deletes the video file from the `dream-videos` Supabase storage bucket
  2. Updates the `dream_entries` row to set `video_url = null`
  3. Calls `onVideoDeleted()` to update parent state

### Technical Summary

Files to modify:
1. **`supabase/functions/generate-dream-video/index.ts`** -- Add `aspectRatio` parameter to Veo request based on input image dimensions
2. **`src/hooks/useDreamDbActions.tsx`** -- Add `video_url` to allowed update fields
3. **`src/components/DreamImageGenerator.tsx`** -- Add video carousel slide with delete/regenerate controls
4. **`src/components/DreamEntryForm.tsx`** -- Pass video-related props to `DreamImageGenerator`
5. **`src/components/DreamDetail.tsx`** -- Ensure video URL updates propagate to dream store
6. **`src/components/dreams/DreamImageWithVideo.tsx`** -- Minor: propagate video URL update to parent store

No database schema changes needed -- `video_url` column already exists on `dream_entries`.
