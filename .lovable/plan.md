

## Plan: Migrate All AI Functions to Vertex AI with Latest Models

### Latest Available Models (from Vertex AI docs, March 2026)

**GA (Generally Available):**
- `gemini-2.5-flash` — text, multimodal (GA)
- `gemini-2.5-flash-image` — image generation + understanding (GA)

**Preview (Latest):**
- `gemini-3-flash-preview` — best text/reasoning, 1M context, function calling (Preview)
- `gemini-3.1-flash-image-preview` — latest image generation, 128K context, 14 ref images (Preview)
- `gemini-3-pro-image-preview` — highest quality image gen, reasoning-enhanced, 14 ref images (Preview)
- `gemini-3.1-pro-preview` — latest reasoning-first model (Preview)

**Video:**
- `veo-3.0-generate-preview` — already in use
- `veo-3.1-generate-001` — latest GA video model

**Key finding:** Image generation models (`gemini-3-pro-image-preview`, `gemini-3.1-flash-image-preview`) do NOT support function calling or Chat Completions (OpenAI-compatible). They must use the native `generateContent` endpoint. Text models like `gemini-3-flash-preview` DO support function calling and structured output.

### Recommended Model Mapping

| Function | Current | New Vertex Model | Rationale |
|---|---|---|---|
| **Image gen** (`generate-dream-image`) | Lovable Gateway / gemini-3-pro-image-preview | `gemini-3-pro-image-preview` | Best image quality, supports 14 reference images, reasoning-enhanced |
| **Text analysis** (`analyze-dream`) | Lovable Gateway / gemini-3-flash | `gemini-3-flash-preview` | Latest text model with function calling |
| **Cinematic prompt** (`compose-cinematic-prompt`) | Lovable Gateway / gemini-3-flash | `gemini-3-flash-preview` | |
| **Animation prompt** (`compose-animation-prompt`) | Lovable Gateway / gemini-3-flash | `gemini-3-flash-preview` | |
| **Section splitting** (`split-dream-sections`) | Lovable Gateway / gemini-3-flash | `gemini-3-flash-preview` | Needs function calling |
| **Character analysis** (`analyze-character-image`) | Lovable Gateway / gemini-2.5-flash | `gemini-3-flash-preview` | Multimodal text analysis |
| **Dream chat** (`dream-chat`) | OpenAI / gpt-4o-mini | `gemini-3-flash-preview` | |
| **Symbol analysis** (`analyze-dream-symbols`) | OpenAI / gpt-4o-mini | `gemini-3-flash-preview` | |
| **Dream insight** (`generate-dream-insight`) | OpenAI / gpt-4o-mini | `gemini-3-flash-preview` | |
| **Video gen** (`generate-dream-video`) | Vertex AI / veo-3.0-generate-preview | No change (already on Vertex) | Could upgrade to veo-3.1 later |

### Implementation Per Function (9 functions)

**1. Add `getGoogleAccessToken()` helper** to each function — copied from existing `generate-dream-video/index.ts` (lines 10-71). Creates JWT from service account key, exchanges for OAuth bearer token.

**2. Replace API endpoint** from:
```
https://ai.gateway.lovable.dev/v1/chat/completions  (or api.openai.com)
```
to:
```
https://us-central1-aiplatform.googleapis.com/v1/projects/{projectId}/locations/us-central1/publishers/google/models/{model}:generateContent
```

**3. Adapt request format** — OpenAI to Gemini native:
- `messages[{role, content}]` → `contents[{role, parts[{text}]}]`
- System message → `systemInstruction: { parts: [{ text }] }`
- Image parts: `image_url` data URIs → `inlineData: { mimeType, data }`
- Tool/function calling: OpenAI `tools` → Gemini `tools[{functionDeclarations}]`
- For image gen: add `generationConfig: { responseModalities: ["TEXT", "IMAGE"] }`

**4. Adapt response parsing**:
- Text: `choices[0].message.content` → `candidates[0].content.parts[0].text`
- Image: extract `inlineData` from response parts
- Tool calls: `candidates[0].content.parts[0].functionCall.args`

### Important Notes
- Image generation models (`gemini-3-pro-image-preview`) do NOT support Chat Completions endpoint — must use native `generateContent`
- `gemini-3-pro-image-preview` supports up to 14 reference images (perfect for face + outfit + accessory refs)
- `voice-to-text` stays on OpenAI Whisper (no Vertex equivalent)
- `seed-mock-data` / `reseed-dream-content` stay on Lovable gateway (admin-only)
- No client-side changes needed — same response shapes
- Secrets already configured: `GOOGLE_VERTEX_SA_KEY`, `GOOGLE_CLOUD_PROJECT_ID`

### Files Modified (9)
1. `supabase/functions/generate-dream-image/index.ts`
2. `supabase/functions/analyze-dream/index.ts`
3. `supabase/functions/compose-cinematic-prompt/index.ts`
4. `supabase/functions/compose-animation-prompt/index.ts`
5. `supabase/functions/split-dream-sections/index.ts`
6. `supabase/functions/analyze-character-image/index.ts`
7. `supabase/functions/dream-chat/index.ts`
8. `supabase/functions/analyze-dream-symbols/index.ts`
9. `supabase/functions/generate-dream-insight/index.ts`

