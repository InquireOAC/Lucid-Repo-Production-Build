## Goal

Add Lucid Engine's cinematic pipeline — **FAL nano-banana-2** for images, **FAL Seedance 2.0** for video, **Gemini** for shot-beat compilation, **ElevenLabs** for narration — into Lucid Repo as an additive "Cinematic Dream" mode that turns a dream into a ~30s narrated multi-shot video while preserving character consistency via the user's avatar reference.

Existing Vertex image gen + Veo video gen stay untouched behind a feature flag so nothing breaks.

---

## How Lucid Engine does it (reference)

- **Images:** `POST https://fal.run/fal-ai/nano-banana-2` (text→image) and `/edit` (image_urls→image). Supports `num_images` (1–4), `aspect_ratio`, `resolution` (1K/2K). Character refs go into `image_urls` on `/edit`. Hosted URLs are re-uploaded to a Supabase bucket.
- **Video:** Seedance 2.0 via FAL. Inputs: prompt, duration (5 or 10), aspect_ratio, optional `image_url` (start frame OR character ref), optional `end_image_url`.
- **Cinematic compiler:** Gemini via Lovable AI Gateway with a strict tool-call schema returning `{ subject, cinematography, beats:[{start,end,framing,lens,text,sfx,characters}], sound }`. Beats are timed, gap-free, character-aware.
- **Character consistency:** the avatar URL is threaded into `image_urls` for every nano-banana-2 `/edit` and as `image_url` for Seedance when no rendered start frame exists.

---

## Decisions (locked in)

- **Single secret:** `FAL_API_KEY` (powers both nano-banana-2 and Seedance via FAL).
- **Narration:** ElevenLabs connector (gateway-based). One narrator voice picked per-user (default: Sarah `EXAVITQu4vr4xnSDxMaL`), generated as MP3 stitched per-beat.
- **Hard cap:** total cinematic video ≤ **30 s**. Beats capped at **5** (avg 6s/beat). Per-beat Seedance duration = 5s. Long-form is pushed to Lucid Engine.
- **Gating:** Mystic tier only (matches current `generate-dream-video`), admin bypass already exists in pattern.
- **Feature flag:** `VITE_USE_FAL_CINEMATIC` (default false). Existing dialog/Veo flow unchanged when off.

---

## Plan

### 1. Connectors + secrets

- Add secret `FAL_API_KEY`.
- Link ElevenLabs connector to project for narration.
- Reuse existing `dream-videos` and `dream-images` buckets (no new bucket).

### 2. New shared helpers (`supabase/functions/_shared/`)

- `fal-nano-banana.ts` — port from Lucid Engine. Persists outputs to `dream-images/{user_id}/cinematic/...`.
- `fal-seedance.ts` — `POST https://fal.run/fal-ai/bytedance/seedance/v1/pro/image-to-video` (sync mode w/ FAL polling), persists MP4 to `dream-videos/{user_id}/cinematic/...`.
- `elevenlabs-tts.ts` — single-call MP3 synthesis using `eleven_multilingual_v2`, with `previous_text`/`next_text` stitching for per-beat narration.
- `avatar-reference.ts` — server-side helper that returns the user's character ref URL (reuses logic from `useDreamAvatar` / `AIContextDialog`).

### 3. New edge functions (all behind Mystic gate)

- `compile-dream-cinematic` — port of Lucid Engine's `compile-seedance-prompt`. Inputs: `{ dreamId, totalDuration: 30, sequenceMode: true }`. Pulls dream content + sections, returns a 4–5 beat spec capped at 30s total. Persists spec to `dream_cinematic_specs`.
- `generate-cinematic-beat-frame` — for one beat, calls FAL nano-banana-2 `/edit` with `{ prompt: beat.text + style + subject, image_urls: [avatarRef], aspect_ratio: "9:16", resolution: "1K" }`. Stores frame URL in `dream_cinematic_beats`.
- `generate-cinematic-beat-video` — calls Seedance with `{ prompt: beat.text, image_url: beatFrameUrl, aspect_ratio: "9:16", duration: 5 }`. Stores MP4 URL.
- `generate-cinematic-beat-narration` — calls ElevenLabs TTS for beat text, stores MP3 URL in `dream-audio` bucket.
- `assemble-cinematic-dream` — orchestrator: invokes the three per-beat functions in parallel for all beats, waits for completion, then concatenates clips + overlays narration. For v1, concatenation is **client-side** using a small `cinematicAssembler.ts` utility built on `MediaRecorder` + `<video>` + `<audio>` (avoids ffmpeg edge function complexity, reuses pattern from `shareVideoRenderer`). Final MP4 uploaded to `dream-videos` and written to `dream_entries.video_url`.

### 4. DB migration (one)

- `dream_cinematic_specs` — `(id, dream_id unique, user_id, spec_json, total_duration, created_at)` RLS owner-only.
- `dream_cinematic_beats` — `(id, dream_id, beat_index, prompt, narration_text, frame_url, video_url, narration_url, status, created_at, updated_at, unique(dream_id, beat_index))` RLS owner-only.

### 5. Frontend touchpoints (minimal)

- `src/components/dreams/GenerateVideoDialog.tsx` — add a tab/toggle at top: **"Animate frame (Veo)"** (current behavior) vs **"Cinematic Dream — beta"** (new flow). New tab only renders when `VITE_USE_FAL_CINEMATIC` is on. Cinematic tab shows: beat timeline preview after compile, then progress bar through frames → videos → narration → assembly.
- New `src/hooks/useDreamCinematic.ts` — orchestrates the 4 steps with per-beat progress and subscription gating (reuses `canUseFeature('video')`).
- New `src/utils/cinematicAssembler.ts` — client-side concat of beat MP4s + narration into a single MP4 blob.
- No changes to `useDreamImageAI`, `useSectionImageGeneration`, `SectionImagesManager`, journal, or Lucid Repo.

### 6. Cost / safety guards

- Max 5 beats per dream, total ≤ 30s.
- Rate limit: once per dream per 24h via a unique-by-day check in `assemble-cinematic-dream`.
- All FAL/Seedance/TTS calls inside try/catch with status writes to `dream_cinematic_beats.status` so the UI can recover.
- In-dialog copy: "Need a longer film? Continue in Lucid Engine →" linking out.

---

## ASCII flow

```text
Dream entry ─► compile-dream-cinematic (Gemini, tool call)
                    │
                    ▼
            spec: 4–5 beats × ~6s, character refs per beat
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
  beat-frame    beat-video    beat-narration
 (nano-banana   (Seedance     (ElevenLabs
   2 + avatar)   img2vid)      multilingual v2)
       └────────────┼────────────┘
                    ▼
          assemble-cinematic-dream
        (client concat + audio mux)
                    ▼
        dream_entries.video_url ◄── final 9:16 MP4
```

---

## What changes vs. stays

**Changes**
- 1 secret + 1 connector link.
- 5 new edge functions + 4 shared helpers.
- 1 migration (2 tables).
- 1 new hook, 1 new util, 1 tab in `GenerateVideoDialog`.

**Stays**
- All existing UI, navigation, Vertex image gen, Veo video gen, journal, sections, avatar system, subscription tiers, RLS patterns, hook signatures.

---

## Technical notes

- Seedance endpoint via FAL: `https://fal.run/fal-ai/bytedance/seedance/v1/pro/image-to-video` (auth `Authorization: Key ${FAL_API_KEY}`). I'll verify the exact slug at build time against FAL docs; nano-banana-2 slug is confirmed (`fal-ai/nano-banana-2`).
- Aspect always `9:16` to match the app's portrait standard.
- Client assembly uses `<canvas>` + `MediaRecorder` (already proven in `shareVideoRenderer.ts`) — keeps edge functions free of ffmpeg.
- Narration timing: each beat's MP3 is played over its clip; if MP3 is longer than the clip, clip is held on last frame; if shorter, silence pads the end.
