

## Fix Character Generation - Correct Model Name

### Problem
The edge function calls model `gemini-2.5-flash-preview-image-generation`, which does not exist (404 error). According to the official Vertex AI / Google AI documentation, the correct model ID for Gemini 2.5 Flash image generation is `gemini-2.5-flash-image`.

### Change

**File: `supabase/functions/generate-dream-image/index.ts`**

One-line fix on line 87 -- update the model name in the API URL:

- **Before:** `gemini-2.5-flash-preview-image-generation`
- **After:** `gemini-2.5-flash-image`

The full URL becomes:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=...
```

Everything else remains unchanged: the `generativelanguage.googleapis.com` endpoint, `GOOGLE_AI_API_KEY` authentication, the `inline_data` reference image format, `responseModalities: ["TEXT", "IMAGE"]`, and the `inlineData` response parsing are all correct per the API spec.

### No Other Files Affected
- `AIContextDialog.tsx` -- no changes
- `useImageGeneration.ts` -- no changes
- `useDreamImageAI.ts` -- no changes

