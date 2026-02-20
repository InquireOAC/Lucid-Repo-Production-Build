
# Dream Image Generation Upgrade: Visual Fingerprint + Cinematic Character Compositing

## What Lucid Engine Does Better

After analyzing [Lucid Engine](/projects/befcf051-a84a-49de-9e27-949eb46970a6), here are the key techniques it uses that Lucid Repo is missing:

1. **Visual Fingerprint**: Before generating any image, Lucid Engine runs the reference photo through an AI analysis step (`analyze-character-image`) that produces an extremely detailed text description of the person's face, hair, skin, body, and distinctive features. This "fingerprint" is then injected into every generation prompt, giving Gemini a textual anchor alongside the image.

2. **Anti-Composite Instructions**: Lucid Engine explicitly tells Gemini to generate the environment FIRST as a 3D space, THEN render the character INSIDE it -- not pasted on top. It includes failure indicators (cut-out edges, mismatched lighting) and success indicators (matching shadows, atmospheric depth).

3. **Shot Framing Awareness**: Depending on the dream content, it adjusts how large the character should appear (15-35% for wide shots, 60-90% for close-ups).

4. **Labeled Image Categories**: Reference images are explicitly labeled as `[CHARACTER_IDENTITY]` vs `[ENVIRONMENT_STYLE]` so Gemini knows what to extract from each image.

5. **Photorealism Enhancement Block**: For realistic styles, it includes a massive block covering skin pores, material authenticity, camera optics (ARRI Alexa, Zeiss lenses), and lighting physics.

## Current Gaps in Lucid Repo

- No visual fingerprint -- the reference photo is passed as raw bytes with a one-line label
- No anti-composite or spatial integration instructions
- No shot framing detection
- The character reference label is minimal: just "[CHARACTER REFERENCE] maintain their likeness"
- Prompt max length is only 2000 chars -- too small for rich prompts
- No visual fingerprint caching in the database

---

## Implementation Plan

### Step 1: Add Visual Fingerprint Generation + Caching

**New edge function: `supabase/functions/analyze-character-image/index.ts`**

When a user uploads/updates their AI context photo, generate a detailed visual fingerprint using the Lovable AI Gateway (Gemini 2.5 Flash). Store it in the `ai_context` table in a new `visual_fingerprint` text column.

The fingerprint prompt will analyze:
- Facial structure and proportions
- Eye, nose, mouth details
- Hair color, texture, style
- Skin tone and distinctive marks
- Body type and build

**Database migration**: Add `visual_fingerprint` text column to `ai_context` table.

**Trigger**: Call this function automatically when `photo_url` is set/updated in the AI Context dialog. Also callable manually via a "Re-analyze" button.

### Step 2: Rewrite Prompt Building with Cinematic Integration

**`src/utils/promptBuildingUtils.ts`** -- Major rewrite of `buildPersonalizedPrompt`:

When a reference photo exists AND visual fingerprint is available:

```
CHARACTER IDENTITY MATCHING (HIGHEST PRIORITY)
- FACE: Exact same facial structure, eye shape, nose, lips, jawline
- SKIN: Precise tone, texture, markings
- HAIR: Exact color, texture, style, length
- BODY: Same build, proportions

VISUAL FINGERPRINT:
[cached fingerprint text from ai_context]

CHARACTER-ENVIRONMENT INTEGRATION (MANDATORY):
1. FIRST: Generate the complete dream environment
2. THEN: Place the camera within this space
3. FINALLY: Render the character STANDING INSIDE this 3D space

INTEGRATION CHECKLIST:
- Lighting: Character lit by SAME sources as environment
- Atmosphere: Haze/particles affect both character and scene
- Grounding: Feet cast natural shadows
- Single pass: Generate character + environment together
```

For **photorealistic** styles, append the enhanced photorealism block:
- Skin pores, subsurface scattering, micro-wrinkles
- Camera optics (cinema camera, prime lens, natural bokeh)
- Lighting physics (motivated sources, shadow falloff)
- Material authenticity

### Step 3: Upgrade Edge Function with Better Structure

**`supabase/functions/generate-dream-image/index.ts`** changes:

1. Increase `MAX_PROMPT_LENGTH` from 2000 to 6000 to accommodate rich prompts
2. Always label the reference image with `[CHARACTER_IDENTITY_REFERENCE]` prefix text
3. For photorealistic styles, add explicit anti-composite instructions in a separate text part before the prompt
4. Structure parts as: `[Label] -> [Image] -> [Full prompt with fingerprint + integration rules]`

### Step 4: Wire Visual Fingerprint into Generation Flow

**`src/hooks/useDreamImageAI.ts`** -- When building the prompt, fetch the visual fingerprint from `ai_context` alongside `photo_url` and pass it into `buildPersonalizedPrompt`.

**`src/utils/aiContextUtils.ts`** -- Update `getUserAIContext` query to also select `visual_fingerprint`.

**`src/components/profile/AIContextDialog.tsx`** -- After saving/updating the reference photo, call the new `analyze-character-image` edge function to generate the fingerprint. Show a brief "Analyzing your photo..." state.

---

## Technical File Summary

| File | Action |
|------|--------|
| `supabase migration` | Add `visual_fingerprint` text column to `ai_context` |
| `supabase/functions/analyze-character-image/index.ts` | New edge function -- AI vision analysis of reference photo |
| `src/utils/promptBuildingUtils.ts` | Major rewrite with fingerprint injection, anti-composite rules, photorealism block |
| `supabase/functions/generate-dream-image/index.ts` | Increase prompt limit, labeled image parts, structured request |
| `src/utils/aiContextUtils.ts` | Include `visual_fingerprint` in query |
| `src/hooks/useDreamImageAI.ts` | Pass fingerprint to prompt builder |
| `src/hooks/useImageGeneration.ts` | Pass fingerprint through generation flow |
| `src/components/profile/AIContextDialog.tsx` | Trigger fingerprint generation on photo upload |
| `supabase/config.toml` | Register new edge function |
