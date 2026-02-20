

# Fix: Upgrade Dream Image Generation to Gemini 3 Pro Image Preview

## Problem

The current `generate-dream-image` edge function uses `gemini-2.5-flash-image` via the direct Google AI Studio API. This model produces stylized, digital-drawn looking images rather than realistic ones.

The Lucid Engine project uses `google/gemini-3-pro-image-preview` (Nano Banana Pro) via the Lovable AI Gateway, which produces far more realistic, photographic-quality images.

## Root Cause Summary

| Aspect | Current (this project) | Lucid Engine |
|--------|----------------------|--------------|
| Model | `gemini-2.5-flash-image` | `google/gemini-3-pro-image-preview` |
| API | Direct Google AI Studio | Lovable AI Gateway |
| Image quality | Digital/stylized | Photorealistic |
| Response format | `candidates[0].content.parts[].inlineData` | `choices[0].message.images[].image_url.url` |

## Changes

### 1. Update `supabase/functions/generate-dream-image/index.ts`

Switch from direct Google AI Studio API to the Lovable AI Gateway with the higher-quality model:

- Replace `GOOGLE_AI_API_KEY` with `LOVABLE_API_KEY` (already available as a Supabase secret)
- Change API endpoint from `generativelanguage.googleapis.com` to `https://ai.gateway.lovable.dev/v1/chat/completions`
- Change model to `google/gemini-3-pro-image-preview`
- Update request format: use OpenAI-compatible `messages` array with `modalities: ["image", "text"]` instead of `contents` with `parts`
- Update response parsing: extract image from `choices[0].message.images[0].image_url.url` (base64 data URL) instead of `candidates[0].content.parts[].inlineData`
- Add proper error handling for 429 (rate limit) and 402 (credits exhausted) status codes
- Reference images will be sent as `image_url` content parts (base64 data URLs) instead of `inline_data`

No changes needed to the frontend -- the edge function returns the same `imageUrl` response shape.

### Files Changed

| File | Action |
|------|--------|
| `supabase/functions/generate-dream-image/index.ts` | Update -- switch API, model, request/response format |

