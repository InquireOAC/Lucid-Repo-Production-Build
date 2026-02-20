
# Cinematic Dream Image Generation Upgrade

## The Problem
The current pipeline generates good images but falls short of truly cinematic quality because:

1. **The base prompt is too thin** — the `analyze-dream` edge function generates a max 35-word prompt. This is far too sparse to convey a cinematic scene with proper composition, lighting, atmosphere, and character-world integration.
2. **The system prompt in `analyze-dream` is generic** — it creates a simple visual description instead of a full cinematic scene brief.
3. **Style directives are appended as afterthoughts** — they are bolted on after the base prompt instead of being architecturally woven in from the start.
4. **Character placement is instructed but not architecturally enforced at the prompt level** — the "anti-composite" directive exists in the edge function for photo-realistic styles only, but not for all styles.
5. **No cinematic framing language** — no camera direction, shot type, focal length, or composition principle is baked into the foundational prompt.

## The Upgrade Plan

### Layer 1 — `analyze-dream` Edge Function (Prompt Architecture)
Completely rewrite the `create_image_prompt` system prompt from:
> "35-word plain English prompt from dreamer's POV"

To a **Cinematic Scene Brief** that produces a rich, multi-dimensional prompt covering:
- **Environment** — specific world-building details, time of day, weather, biome
- **Lighting** — primary source, secondary fill, atmospheric conditions, color temperature
- **Camera** — shot type (wide establishing, medium, close), angle (eye level, low, bird's-eye), lens feel
- **Character** — position within the scene, action, emotional state
- **Atmosphere** — particles, volumetric light, haze, depth layers
- **Color story** — dominant palette, accent hues, emotional resonance

This is the most critical change — better raw material feeds every downstream step.

### Layer 2 — `promptBuildingUtils.ts` (Cinematic Integration Layer)
Upgrade the `buildPersonalizedPrompt` function to:
- Enforce **Unified World Rendering** — character is a native inhabitant of the scene, not a visitor
- Add **Cinematic Composition Rules** for every code path (with photo OR without photo)
- Add a **Style-Specific Character Integration** addendum that adapts the character's visual treatment to the chosen art style (e.g., painterly brushstrokes in oil painting style, neon rim light in cyberpunk)
- Strengthen the anti-composite directive for ALL styles, not just photorealistic ones
- Add depth cues: foreground, midground (where character lives), background

### Layer 3 — Style Directives Upgrade
Upgrade each style block in `addImageStyleToPrompt` to include explicit **cinematic composition principles**:
- **Surreal**: Rule-of-thirds placement, impossible horizon lines, trompe l'oeil depth
- **Realistic/Hyper-realism**: Cinematic aspect ratio feel, motivated key light, one-stop-under exposure for drama
- **Fantasy**: Hero shot composition, rising angle, volumetric god-rays framing the character
- **Cyberpunk**: Dutch angle, low-angle character shot, neon rim lighting as natural world light
- **All styles**: Each gets a "Composition Directive" block with shot type recommendation

### Layer 4 — `generate-dream-image` Edge Function
Add a **Cinematic Rendering Directive** as a prepended system-level text part that fires before any reference images:
- Forces the model to think of the image as a **movie frame** first
- Instructs the model to treat reference images as casting references, not copy-paste sources
- Ensures the character is rendered **at home** in the world, not visiting it

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-dream/index.ts` | Rewrite the `create_image_prompt` system prompt to produce a cinematic scene brief instead of a 35-word description |
| `src/utils/promptBuildingUtils.ts` | Upgrade `buildPersonalizedPrompt` with deeper cinematic character-world integration directives + upgrade all style blocks with composition principles |
| `supabase/functions/generate-dream-image/index.ts` | Add a leading cinematic rendering directive content part that primes the model for movie-frame thinking |

## How the Upgraded Pipeline Flows

```text
Dream Text (user input)
        |
        v
analyze-dream edge function
  [NEW] Cinematic Scene Brief system prompt
  → Outputs: Rich scene description with environment,
    lighting, camera angle, atmosphere, color story
        |
        v
buildPersonalizedPrompt (client-side)
  [UPGRADED] Character woven into scene DNA
  [NEW] Composition Directive
  [UPGRADED] Style-specific character integration
  → Outputs: Full cinematic prompt (up to 6000 chars)
        |
        v
generate-dream-image edge function
  [NEW] Cinematic Rendering Directive prepended
  Reference images (face, outfit, accessory)
  [EXISTING] Anti-composite directive (now all styles)
  Full prompt
  → Outputs: Cinematic dream image
```

## What the Output Will Look Like

Before: Character appears composited into a generic scene
After: Character is a native of the dream world — same light, same atmosphere, same physics. The image reads as a single unified movie frame from an alternate world.

Key improvements visible in output:
- Characters cast natural shadows matching the environment's light direction
- Atmospheric haze or particles affect both character and world equally
- Camera angle is intentional and cinematically motivated
- Each style has its own compositional "voice" — fantasy uses hero shots, cyberpunk uses low-angle dutch angles, surreal uses impossible perspectives
- Color temperature is unified across the entire frame

No new dependencies, no database changes, no UI changes needed. This is a pure quality upgrade to the AI pipeline.
