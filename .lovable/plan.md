

## Plan: Elevate Cinematic Prompt to Spielberg-Level Grand Compositions

### What Changes

Two files need major prompt rewrites to produce grand, cinematic, Spielberg-quality dream imagery with beautiful character composition:

### 1. `supabase/functions/compose-cinematic-prompt/index.ts` — The Cinematic Director

**Current**: Generic "cinematographer" persona with basic camera angle and lighting instructions. Produces competent but not grand compositions.

**New**: Rewrite the system prompt to embody a Spielberg/Deakins-level director of photography. Key additions:
- **Grand scale mandate** — Every frame must feel like a pivotal moment in a $200M film. Favor sweeping compositions, dramatic depth, and awe-inspiring scale
- **Spielberg composition principles** — Use his signature techniques: silhouette against vast light sources, characters dwarfed by magnificent environments, lens flare as emotional punctuation, foreground framing elements creating depth layers
- **Character staging as storytelling** — When a character is present, they must be composed INTO the grandeur (not just placed in it). Think the bicycle across the moon, the figure at the end of the pier, the person standing at the edge of the impossible. The character becomes MORE powerful by contrast with scale
- **Emotional crescendo lighting** — Not just "motivated lighting" but lighting designed to make the viewer gasp. God rays, volumetric shafts, bioluminescence, aurora reflections — light as spectacle
- **Depth and layers** — Mandate foreground/midground/background composition with atmospheric separation. Every frame should have visual depth that pulls the viewer INTO the dream
- **Output length** — Increase from 200-300 words to 300-400 words for richer description

### 2. `supabase/functions/generate-dream-image/index.ts` — The Rendering Directive

**Current**: Basic "world-class cinematographer" preamble focused mostly on anti-compositing rules.

**New**: Enhance the cinematic rendering directive with:
- **Grand cinematic quality mandate** — "This is a frame from the most visually stunning film ever made"
- **Composition grandeur** — Dramatic depth of field, sweeping scale, breathtaking vistas even in intimate scenes
- **Character integration beauty** — When reference images are provided, the character must be composed as the emotional anchor of a grand tableau, not just "placed" in the scene. Think hero shots, silhouettes against vast dreamscapes, intimate moments framed by epic environments
- **Enhanced character reference instructions** — Instead of just "extract identity", instruct to "cast this person as the STAR of a cinematic masterpiece — they are the emotional center of an awe-inspiring frame"

### 3. `src/utils/promptBuildingUtils.ts` — Character Integration Directives

**Current**: Heavy on technical anti-composite rules but lacks cinematic composition guidance.

**New**: Add grand composition directives alongside the existing integration rules:
- **Hero composition** — "Place the character at a compositionally powerful position — rule of thirds power points, leading lines converging on them, environmental framing"
- **Scale and grandeur** — "The environment should feel vast and awe-inspiring around the character, creating a sense of the character being part of something magnificent"
- Trim some of the verbose anti-composite checklist (the rendering directive already covers this) to keep prompt length reasonable

### Files Modified (3)
1. `supabase/functions/compose-cinematic-prompt/index.ts` — Rewrite system prompt
2. `supabase/functions/generate-dream-image/index.ts` — Enhance rendering directive
3. `src/utils/promptBuildingUtils.ts` — Add grand composition to character directives

### No client-side changes needed — same API contracts, just better prompts.

