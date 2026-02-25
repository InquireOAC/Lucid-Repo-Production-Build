

# Use Gemini 3 Flash Preview for Scene Brief + Cinematic Director

## Overview
Replace the current `gpt-4o-mini` (via direct OpenAI API) in the `analyze-dream` edge function with `google/gemini-3-flash-preview` via the Lovable AI Gateway. Then add a new `compose-cinematic-prompt` edge function (also using `gemini-3-flash-preview`) as a "Cinematic Director" thinking layer that intelligently composes the final prompt before image rendering.

## Current Flow
```text
Dream Text --> OpenAI gpt-4o-mini (scene brief) --> static style append --> gemini-3-pro-image (render)
```

## New Flow
```text
Dream Text --> gemini-3-flash-preview (scene brief) --> gemini-3-flash-preview (cinematic director) --> gemini-3-pro-image (render)
```

## Changes

### 1. `supabase/functions/analyze-dream/index.ts` -- Switch to Gemini 3 Flash

- Remove the direct OpenAI API call (`fetch('https://api.openai.com/v1/chat/completions', ...)`)
- Replace with Lovable AI Gateway call using `google/gemini-3-flash-preview`
- Use `LOVABLE_API_KEY` instead of `OPENAI_API_KEY` (already available as a secret)
- Keep the existing system prompts (scene brief and dream analysis) -- they already work well
- The `analyze_dream` task continues to use a stronger reasoning approach (was `gpt-4o`, now `gemini-3-flash-preview` for both tasks since it has strong reasoning)

### 2. New Edge Function: `supabase/functions/compose-cinematic-prompt/index.ts`

A new "Cinematic Director" thinking layer:

- **Model**: `google/gemini-3-flash-preview` via Lovable AI Gateway
- **Input**: Raw scene brief, selected image style, whether character reference exists
- **System Prompt**: A cinematographer persona that analyzes each specific dream scene and makes intelligent decisions about:
  - Optimal camera angle and focal length for maximum dramatic impact
  - Motivated lighting design (WHY a light source works for this scene, not just what it is)
  - Color story that reinforces the dream's emotional arc
  - Character staging and relationship to environment
  - Style-specific composition rules woven organically into the description (not appended as static blocks)
- **Output**: A single enhanced cinematic prompt (200-300 words) ready for the image renderer
- Auth: `verify_jwt = false` in config.toml (auth is handled in the calling code)

### 3. `src/hooks/useDreamImageAI.ts` -- Wire in the Cinematic Director

- After getting the raw scene brief from `analyze-dream`, call the new `compose-cinematic-prompt` edge function
- Pass the raw brief, image style, and whether AI context (avatar/character reference) is being used
- Use the enhanced prompt returned from the cinematic director as the final prompt sent to `generate-dream-image`

### 4. `src/utils/promptBuildingUtils.ts` -- Simplify style handling

- The massive static style blocks in `addImageStyleToPrompt` become redundant since the cinematic director layer will intelligently apply style directives
- Simplify this function to pass just the style name to the cinematic director, rather than appending 10-15 lines of static text
- Keep the character identity and integration contract text (those are rendering directives for the image model, not composition decisions)

### 5. `supabase/config.toml` -- Add new function entry

```toml
[functions.compose-cinematic-prompt]
verify_jwt = false
```

## What This Achieves

- **Unified model family**: The entire text reasoning pipeline uses Gemini 3 Flash Preview -- fast, strong reasoning, consistent output style
- **No more direct OpenAI dependency** for the scene brief (removes the `OPENAI_API_KEY` requirement from `analyze-dream`)
- **Intelligent composition**: Instead of static "use rule of thirds" text blocks, the AI analyzes each specific dream and decides the best composition
- **Motivated decisions**: The thinking layer explains WHY certain camera angles, lighting, and colors work for each unique scene
- **Better prompts**: A carefully reasoned 200-300 word prompt produces significantly better results than a 120-word brief with 500 words of static directives appended

## Performance Impact

- Scene brief: ~1-2s (Gemini 3 Flash is fast)
- Cinematic director: ~1-2s (same model, non-streaming)
- Image render: ~15-20s (unchanged, still Gemini 3 Pro Image)
- Total overhead from thinking layer: minimal (~1-2s added)

