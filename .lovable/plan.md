

## Plan: Add Dream Avatar Character Carousel to Image Generator

### What
When "Use Avatar" is toggled ON, show a horizontal carousel of the user's `dream_characters` between the toggle and the Visual Style selector. The selected character's `photo_url` will be used as the reference image during generation (instead of the current single `ai_context` lookup).

### Changes

**1. `src/components/DreamImageGenerator.tsx`**
- Import `supabase` and `useAuth` (supabase already imported)
- When `useAIContext` is toggled ON, fetch `dream_characters` for the current user
- Store characters in local state + a `selectedCharacterId`
- Render a horizontal scrollable carousel of character avatars (circular thumbnails with name labels, similar to the style selector pattern) between the "Use Avatar" toggle and the "Visual Style" section
- Auto-select the first character by default
- Pass the selected character ID down through the generation flow

**2. `src/hooks/useImageState.ts`**
- Add `selectedCharacterId` / `setSelectedCharacterId` state (string | null)
- Expose through the return object

**3. `src/hooks/useDreamImageGeneration.tsx`**
- Pass `selectedCharacterId` through to `useImageGeneration`

**4. `src/hooks/useImageGeneration.ts`**
- Accept optional `selectedCharacterId` parameter
- In `generateImage`, instead of querying `ai_context` for the reference photo, query `dream_characters` by the selected ID to get `photo_url` and character metadata
- Pass the character's `photo_url` as `referenceImageUrl` and character metadata into prompt building

**5. `src/hooks/useDreamImageAI.ts`**
- Update `getImagePrompt` to accept an optional character object (with photo_url, visual_fingerprint, etc.) instead of always fetching from `ai_context`
- When a character is provided, use its data directly; otherwise fall back to `ai_context` lookup (backward compat)

### UI Design
- Small circular avatars (~56px) in a horizontal scroll row
- Selected avatar gets a primary border + ring (matching existing patterns)
- Character name below each avatar
- Only visible when "Use Avatar" switch is ON
- Smooth conditional render with no layout shift

### Data Flow
```text
Toggle ON → fetch dream_characters → show carousel → user selects one
     ↓
Generate clicked → selectedCharacterId used to get photo_url + metadata
     ↓
photo_url → referenceImageUrl in generate-dream-image edge function
metadata → prompt personalization via buildPersonalizedPrompt
```

No database changes needed — `dream_characters` table already has all required fields.

