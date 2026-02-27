
## Force 9:16 Portrait Aspect Ratio for All Dream Images and Videos

### Problem
Dream images are generated without any aspect ratio constraint (Gemini defaults to roughly square). Videos then try to detect the image aspect ratio, resulting in inconsistent dimensions. Both should always be vertical 9:16.

### Changes

#### 1. Image Generation -- Force 9:16 via Prompt Directive
**File: `supabase/functions/generate-dream-image/index.ts`**

The Gemini image model doesn't accept an explicit size parameter, so we control the output by adding a mandatory aspect ratio instruction to the cinematic rendering directive. At the top of the `contentParts` array (inside the existing directive text block around line 82-84), prepend:

```
MANDATORY OUTPUT FORMAT: Generate this image in PORTRAIT orientation with a 9:16 aspect ratio (e.g., 1024x1820 or similar vertical dimensions). The frame MUST be taller than it is wide. This is non-negotiable.
```

This will be added to the existing `[CINEMATIC RENDERING DIRECTIVE]` text block so Gemini renders a tall/vertical image every time.

#### 2. Video Generation -- Hardcode 9:16
**File: `supabase/functions/generate-dream-video/index.ts`**

Remove all the dimension-detection logic (PNG/JPEG header parsing, client aspect ratio parameter). Replace with a single hardcoded value:

```typescript
const detectedAspectRatio = "9:16";
```

This eliminates ~30 lines of unnecessary code and guarantees every video is vertical.

### Technical Details

- **Image side**: Gemini 3 Pro respects compositional instructions well, so adding the portrait/9:16 directive to the system prompt is the reliable approach (there is no explicit `size` API parameter for the chat completions image generation endpoint).
- **Video side**: Veo supports `"9:16"` as a valid aspect ratio value (confirmed -- it only rejects `"1:1"`). Hardcoding removes the fragile header-parsing logic entirely.
- Both edge functions will be redeployed after changes.
