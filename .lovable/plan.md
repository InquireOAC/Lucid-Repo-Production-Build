

# AI-Powered Video Animation Prompts with Image Analysis (Veo 3.0)

## Summary

When a user triggers "Generate Video," Gemini 3 Flash Preview will analyze **both** the dream text **and** the dream image (multimodal) to craft an intelligent 4-second cinematic animation prompt. The video generation model is also updated from Veo 2.0 to **Veo 3.0**. The user sees the AI-generated prompt pre-filled and can edit it before generating.

## Flow

```text
User taps "Generate Video"
  -> Dialog opens, shows "Crafting animation..."
  -> Edge function receives dream text + image URL
  -> Gemini 3 Flash analyzes text + image together (multimodal)
  -> Returns cinematic animation prompt
  -> Pre-fills textarea (editable)
  -> User clicks "Generate Video"
  -> Veo 3.0 generates 4-second video from image + prompt
```

## Changes

### 1. New Edge Function: `compose-animation-prompt`

**File: `supabase/functions/compose-animation-prompt/index.ts`**

Uses Lovable AI Gateway with `google/gemini-3-flash-preview` in **multimodal mode** -- sending both the dream narrative text and the dream image as message parts. The system prompt instructs Gemini to:

- Analyze the visual composition, colors, and elements in the image
- Cross-reference with the dream narrative's emotional arc
- Produce a 1-2 sentence (max 80 words) animation directive for a 4-second video
- Focus on subtle camera movements and environmental motion achievable in 4 seconds
- No scene changes, no complex sequences

The user message will include both an image part (base64 or URL) and the dream text, leveraging Gemini's native multimodal input.

### 2. Update `supabase/config.toml`

Add entry for the new `compose-animation-prompt` function with `verify_jwt = true`.

### 3. Update `GenerateVideoDialog.tsx`

- Accept new prop: `dreamContent: string`
- On dialog open, immediately call `compose-animation-prompt` with `{ dreamContent, imageUrl }`
- Show loading state: "AI is analyzing your dream..."
- Pre-fill the textarea with the AI-generated prompt
- User can edit or accept, then click Generate Video
- If the AI prompt generation fails, fall back to empty textarea with placeholder

### 4. Thread `dreamContent` through components

- **`DreamDetailContent.tsx`**: Already receives `content` prop. Pass it to `DreamImageWithVideo` as `dreamContent`.
- **`DreamImageWithVideo.tsx`**: Accept `dreamContent` prop, pass it to `GenerateVideoDialog`.
- **`DreamDetail.tsx`**: Already passes `dream.content` to `DreamDetailContent` -- no change needed.

### 5. Update `generate-dream-video` Edge Function

- Change model from `veo-2.0-generate-001` to `veo-3.0-generate-preview`
- Remove hardcoded `aspectRatio: "16:9"` to let Veo match the source image's native aspect ratio
- Keep the same polling and upload logic

## File Summary

| File | Action |
|------|--------|
| `supabase/functions/compose-animation-prompt/index.ts` | New -- multimodal Gemini prompt generation |
| `supabase/config.toml` | Add `compose-animation-prompt` entry |
| `supabase/functions/generate-dream-video/index.ts` | Update model to Veo 3.0, remove hardcoded aspect ratio |
| `src/components/dreams/GenerateVideoDialog.tsx` | Add auto-prompt generation on open |
| `src/components/dreams/DreamImageWithVideo.tsx` | Accept + pass `dreamContent` |
| `src/components/dreams/DreamDetailContent.tsx` | Pass `content` as `dreamContent` to `DreamImageWithVideo` |

