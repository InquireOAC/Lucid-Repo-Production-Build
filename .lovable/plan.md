
# Dream Video Generation: Image-to-Video with Google Veo

## Overview

Add the ability to generate short animated videos from dream images using Google's Veo model via Vertex AI. Users long-press a dream image to access a context menu with a "Generate Video" option, optionally providing a custom animation prompt. The video auto-plays in dream detail view, while thumbnails remain static images everywhere else (journal, Lucid Repo, profile grids).

## Prerequisites (User Action Required)

Before implementation, you'll need a Google Cloud project with Vertex AI enabled:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable the **Vertex AI API**
4. Create a **Service Account** with "Vertex AI User" role
5. Generate a JSON key for the service account
6. We'll store the key contents as a Supabase secret (`GOOGLE_VERTEX_SA_KEY`)
7. Note your **Google Cloud Project ID** (stored as `GOOGLE_CLOUD_PROJECT_ID`)

## Database Changes

Add a `video_url` column to the `dream_entries` table to store the generated video URL:

```text
ALTER TABLE dream_entries ADD COLUMN video_url TEXT DEFAULT NULL;
```

A new storage bucket `dream-videos` (public) for storing generated MP4 files.

## New Edge Function: `generate-dream-video`

**File: `supabase/functions/generate-dream-video/index.ts`**

This function:
1. Accepts `imageUrl` (the dream image) and an optional `animationPrompt` (user's custom direction)
2. Authenticates the user and checks subscription (Dreamer/Mystic only)
3. Calls the Vertex AI Veo API (`predictLongRunning`) with the image + prompt
4. Polls for completion (Veo is async -- typically takes 30-120 seconds)
5. Downloads the resulting video, uploads to `dream-videos` bucket
6. Updates the dream entry's `video_url` column
7. Returns the public video URL

```text
Flow:
  Client -> Edge Function -> Vertex AI (Veo) -> Poll for result -> Upload to Storage -> Return URL
```

Key API details:
- Endpoint: `POST https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/us-central1/publishers/google/models/veo-3.0-generate-preview:predictLongRunning`
- Auth: Google Service Account JWT token (generated from the SA key)
- Input: Base64-encoded source image + text prompt
- Output: Video in GCS, downloaded and re-uploaded to Supabase storage

## Frontend Changes

### 1. Long-Press Context Menu on Dream Images

**Files: `src/components/dreams/DreamDetailContent.tsx`, new component `src/components/dreams/DreamImageContextMenu.tsx`**

- Wrap the dream image in the detail view with a long-press handler
- On long-press (or right-click on desktop), show a context menu with options:
  - "Generate Video" -- opens the video generation dialog
  - "Save Image" -- existing save functionality
  - "Share" -- existing share functionality
- Only show "Generate Video" for subscribed users (Dreamer/Mystic)
- Free users see a locked option with "Subscribe to unlock"

### 2. Video Generation Dialog

**New file: `src/components/dreams/GenerateVideoDialog.tsx`**

A modal dialog that:
- Shows a preview of the dream image
- Has a text input for custom animation prompt (optional, with placeholder like "The scene slowly pans across the dreamscape...")
- Has a "Generate Video" button
- Shows a progress state while the video is being generated (with estimated time: ~1-2 minutes)
- On completion, auto-closes and the video appears in dream detail

### 3. Video Player in Dream Detail

**Modified: `src/components/dreams/DreamDetailContent.tsx`**

- If the dream has a `video_url`, show a video player instead of the static image
- Use an HTML5 `<video>` element with:
  - `autoPlay`, `loop`, `muted`, `playsInline` attributes for auto-play behavior
  - Poster set to the dream image (thumbnail while loading)
  - Tap to toggle play/pause
  - The existing double-tap-to-like still works

### 4. Static Thumbnails Everywhere Else

**No changes needed** to these components -- they already use `image_url`/`generatedImage` for display:
- `src/components/dreams/DreamCard.tsx` (journal)
- `src/components/repos/MasonryDreamGrid.tsx` (Lucid Repo)
- `src/components/profile/DreamCardItem.tsx` (profile grid)

These will continue showing the static dream image as the thumbnail.

### 5. Subscription Gating

Video generation is a premium feature available to Dreamer and Mystic subscribers only:
- Gate the "Generate Video" option behind subscription check
- Add "Dream Video Generation" to the feature lists in subscription UI components

## Updated Dream Type

**File: `src/types/dream.ts`**

Add `video_url?: string` to the `DreamEntry` interface.

## File Summary

| File | Action |
|------|--------|
| `dream_entries` table | Add `video_url` column (migration) |
| Storage bucket `dream-videos` | Create (migration) |
| `supabase/functions/generate-dream-video/index.ts` | New edge function |
| `supabase/config.toml` | Add function config |
| `src/types/dream.ts` | Add `video_url` field |
| `src/components/dreams/DreamImageContextMenu.tsx` | New -- long-press menu |
| `src/components/dreams/GenerateVideoDialog.tsx` | New -- generation UI |
| `src/components/dreams/DreamDetailContent.tsx` | Modified -- video player + context menu |
| `src/utils/subscriptionProductUtils.ts` | Add video feature to lists |
| `src/components/profile/StripeSubscriptionManager.tsx` | Add video feature to lists |
| `src/hooks/useNativeSubscription.ts` | Add video feature to lists |

## Technical Considerations

- **Async generation**: Veo takes 30-120 seconds. The edge function will poll internally and return when done. The client shows a loading state.
- **Video size**: Veo generates ~5-8 second videos. File sizes are typically 2-5MB.
- **Rate limiting**: Apply the same subscription credit system -- could count as an image generation credit or add a separate `video_generations_used` counter.
- **Timeout**: Edge functions have a 150-second timeout on Supabase. If Veo takes longer, we may need a webhook/polling pattern where the client polls for status.
- **Fallback**: If video generation fails, the dream keeps its static image -- no data loss.
