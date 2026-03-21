

## Plan: Animated Share Card with Media Transitions

### What the user wants
When a dream has multiple scene images/videos (hero image + section images + any videos), the share card should cycle through them with smooth crossfade transitions — producing a **video file** instead of a static PNG for sharing to socials.

### Media collection logic
Gather all visual media from the dream in order:
1. Hero image (`image_url` / `generatedImage`)
2. Hero video (`video_url`)
3. Section images (`section_images[].image_url`)
4. Section videos (`section_images[].video_url`)

Filter out nulls/empty. If only 1 image and no videos → fall back to current static PNG behavior.

### Approach: Canvas + MediaRecorder

**Preview dialog** — Show a live cycling preview in the share dialog using React state and CSS crossfade transitions between the collected media items. Each item shows for ~3 seconds with a ~1 second crossfade.

**Video export** — When the user taps "Save":
1. Draw each media frame to an offscreen canvas (1080x1920) with the same text overlay (title, date, excerpt, logo)
2. For images: draw for 3 seconds, crossfade to next over 1 second
3. For videos: play video frames to canvas via `requestAnimationFrame` for up to 4 seconds
4. Capture the canvas stream via `canvas.captureStream(30)` + `MediaRecorder`
5. Output as `.webm` (or `.mp4` on native via a different codec if available)
6. Share/download the video file

**Fallback**: If MediaRecorder is unavailable (older iOS Safari), fall back to static PNG of the first image.

### Files modified

| File | Change |
|---|---|
| `src/components/share/ShareButton.tsx` | Add media collection logic, animated preview with cycling images/videos, video recording export path alongside existing PNG path |
| `src/components/share/DreamShareCard.tsx` | Minor — no longer primary render path for multi-media dreams |
| `src/utils/shareUtils.ts` | Add `renderShareVideo()` utility: canvas animation loop + MediaRecorder capture, returns a Blob |

### Key details

- **Duration**: Each image/video shows ~3s, crossfade ~1s. Total video length = `mediaCount * 3 + (mediaCount - 1) * 1` seconds, capped at ~30s
- **Text overlay**: Same bottom panel design (title, date, excerpt, logo) rendered on every frame via canvas drawing — identical to current `renderShareCardToCanvas` but called per-frame
- **Video frames**: Use a hidden `<video>` element, seek/play it, draw frames to canvas via `ctx.drawImage(videoEl, ...)`
- **Format**: `video/webm; codecs=vp9` on web, native platforms get the webm file shared via Capacitor Share
- **Single media fallback**: If dream has only 1 image and no videos, use existing static PNG path (no change)
- **Preview**: The dialog preview shows a live crossfading slideshow so the user sees what the output will look like before saving

