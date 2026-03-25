

## Plan: Enforce 9:16 Aspect Ratio via API Parameter

### Problem
Image generation relies solely on prompt instructions to request 9:16 orientation, which the model can ignore. The Vertex AI API supports an explicit `imageConfig.aspectRatio` parameter that guarantees the output dimensions.

### Fix

**File: `supabase/functions/generate-dream-image/index.ts`**
- Add `imageConfig: { aspectRatio: "9:16" }` to the `generationConfig` object in the Vertex AI request body (alongside the existing `responseModalities`)
- This is the official API parameter that forces the model to output 9:16 images regardless of prompt interpretation

**File: `supabase/functions/generate-dream-video/index.ts`**
- Already hardcodes `aspectRatio: "9:16"` in the Veo parameters — no change needed

### Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-dream-image/index.ts` | Add `imageConfig.aspectRatio: "9:16"` to `generationConfig` |

### Technical Detail

Current `generationConfig`:
```json
{
  "responseModalities": ["TEXT", "IMAGE"]
}
```

Updated:
```json
{
  "responseModalities": ["TEXT", "IMAGE"],
  "imageConfig": {
    "aspectRatio": "9:16"
  }
}
```

This is a single-line addition in the edge function. The prompt-based instructions remain as a reinforcement layer.

