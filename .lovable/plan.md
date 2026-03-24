

## Plan: Upgrade Cinematic Prompt Composer to Dynamic In-the-Moment Style

### Problem
The current `compose-cinematic-prompt` system prompt produces "epic poster" style compositions — static, symmetrical, centered character poses. The user wants hyper-cinematic, mid-action frames that feel like a single captured moment from a film.

### Fix — `supabase/functions/compose-cinematic-prompt/index.ts`

Replace the system prompt (lines 68-113) with the new creative direction. Key changes:

1. **Core philosophy shift**: From "defining poster of a $200M film" → "a single frame ripped from mid-action in a film"
2. **Camera direction**: Add dynamic angles (low angle, over-the-shoulder, first-person, tilted), handheld feel, 35mm/50mm lens feel
3. **Motion mandate**: Every element must show motion — wind, particles, fabric, falling, reaching, turning. No static poses.
4. **Anti-patterns explicitly forbidden**: Centered posing, symmetrical "epic poster" compositions, characters staring at camera, static environments
5. **Composition**: Imperfect framing, cropped edges, perspective distortion, off-center subjects
6. **Environmental interaction**: Particles, clouds moving, light rays shifting, fabric motion — the world reacts to the moment
7. **Tone**: "Surreal but grounded" — dreamlike realism, not digital art illustration

The existing infrastructure (Vertex AI call, auth, character staging note, style integration) remains unchanged. Only the system prompt text is replaced.

### Updated System Prompt Direction

```
You are a CINEMATIC MOMENT DIRECTOR — capturing raw, in-the-moment
dream frames. Not posters. Not posed compositions. A single frame
ripped from mid-action as if from a Lubezki long take or a Deakins
handheld push-in.

CORE MANDATE: Every image must feel like it was CAPTURED, not composed.

1. MID-ACTION, NOT POSED
   - Show a specific moment in progress
   - Subject doing something: reaching, turning, falling, walking
   - Motion blur, wind, energy, environmental reaction

2. DYNAMIC CAMERA
   - Low angle, over-the-shoulder, first-person, tilted framing
   - 35mm or 50mm lens feel — slight handheld presence
   - Imperfect framing: cropped edges, perspective distortion
   - Film still aesthetic, not digital illustration

3. AVOID (CRITICAL)
   - Centered character posing
   - Symmetrical "epic poster" compositions
   - Characters staring directly at camera
   - Static environments with no motion

4. DEPTH & ATMOSPHERE
   - Foreground elements, background scale
   - Volumetric lighting, god rays, atmospheric haze
   - Realistic lighting direction
   - Motion cues throughout

5. TONE: Surreal but grounded — dreamlike realism
```

### Files Modified (1)
`supabase/functions/compose-cinematic-prompt/index.ts` — System prompt rewrite (~45 lines changed), then redeploy edge function.

