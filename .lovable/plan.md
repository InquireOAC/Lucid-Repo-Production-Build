

## Switch to Gemini 2.5 Flash Image via Google Cloud + Simplify Dream Avatar UI

### Overview
Replace DALL-E 3 with Google Gemini 2.5 Flash Image generation using your own Google Cloud project API key, and simplify the Dream Avatar dialog.

### 1. Add Google AI API Key Secret
- You'll need to provide your Google AI API key (from Google AI Studio or Google Cloud console)
- It will be stored as a Supabase secret named `GOOGLE_AI_API_KEY`

### 2. Update `generate-dream-image` Edge Function
- Replace the OpenAI DALL-E 3 call with a direct call to Google's Generative Language API (`generativelanguage.googleapis.com`)
- Use the `gemini-2.5-flash-preview-image-generation` model with `responseModalities: ["TEXT", "IMAGE"]`
- The response returns base64-encoded image data
- The edge function will decode the base64, upload it to the `dream-images` Supabase storage bucket, and return a permanent public URL
- Authentication via `GOOGLE_AI_API_KEY` query parameter

### 3. Simplify Dream Avatar Dialog (`AIContextDialog.tsx`)
Remove these fields:
- Pronouns
- Age Range
- Hair Color
- Hair Style
- Skin Tone
- Height/Build

Keep:
- Name/Nickname
- Reference Photo upload
- Eye Color
- Clothing Style

### 4. Simplify Prompt Building (`promptBuildingUtils.ts`)
- Remove hair_color, hair_style, skin_tone, height, age_range from the `buildPersonalizedPrompt` function
- Keep eye_color and clothing_style descriptors

### 5. Simplify Client-Side Upload Logic (`useImageGeneration.ts`)
- Since the edge function now returns a permanent Supabase URL (not a temporary OpenAI URL), remove the background upload step with timeout racing
- The generated URL is already permanent, so no need for the `uploadImage` call

---

### Technical Details

**Files to modify:**
- `supabase/functions/generate-dream-image/index.ts` -- Replace OpenAI with direct Google Generative Language API call, handle base64 response, upload to Supabase Storage
- `supabase/config.toml` -- Keep `generate-dream-image` config (no change needed)
- `src/components/profile/AIContextDialog.tsx` -- Remove pronouns, age_range, hair_color, hair_style, skin_tone, height fields
- `src/utils/promptBuildingUtils.ts` -- Remove hair/skin/height/age descriptors, keep eye_color and clothing_style
- `src/hooks/useImageGeneration.ts` -- Remove background upload step since edge function returns permanent URLs

**New secret required:** `GOOGLE_AI_API_KEY` -- Your API key from Google AI Studio (https://aistudio.google.com/apikey) or Google Cloud Console

**Edge function API call (new):**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-image-generation:generateContent?key={API_KEY}

Body:
{
  "contents": [{ "parts": [{ "text": prompt }] }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

The response contains `inlineData` with `mimeType` and base64 `data` which gets uploaded to Supabase Storage.

