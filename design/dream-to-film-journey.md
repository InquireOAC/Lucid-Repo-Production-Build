# Dream to Film: proposed creation journey

## Product goal

Take someone from a written or recorded dream to an illustrated story and then a short film without making them learn separate image, scene, and video tools. The dream remains readable and editable throughout. The creator always knows what will be generated next, what it will cost, and where the result will appear.

## What the current app does

- The Edit Dream page puts the story, AI analysis, a single Dream Image, and Dream Scenes in separate long accordions. The scene manager is a carousel with actions below it, so the current image and the action being taken are easy to disconnect.
- Scene generation immediately splits the text into 2–4 AI briefs and renders every image. There is no chance to review boundaries, visual direction, or estimated credits first. The section briefs may paraphrase the dream, so they cannot serve as its reading text.
- A whole-dream image can launch either a one-frame animation or an independent narrated cinematic. A scene image launches a separate animation dialog. A third route stitches scene clips into a film. These routes converge on `video_url` but start in different places and are not explained as alternatives.
- Generated images, clips, and the final film are stored partly inside `section_images` and partly on the dream row. Regenerating can overwrite a result; the editor and reader currently handle existing clips differently. Progress and errors are mostly tied to an open component rather than a durable project view.
- The saved story reader now interleaves the original text and scene art. This should become the preview of the creation project, not another competing editing surface.

## One primary path

Use a single **Create Film** workspace reached from the dream page and the journal. The workspace has a horizontal progress header and one central preview. The primary button advances the same project through these stages:

`Story → Scenes → Images → Motion → Film → Share`

The stages are visible, but users can return to earlier ones without losing completed media. A first-time creator sees only the next meaningful decision. Existing dreams open at their furthest completed stage.

### 1. Story: choose what to visualize

Show the title, original story, cover image, and a clear **Create visual story** button. Allow text edits and a private/public choice, but save the story before any generation begins. Voice transcription can feed this same story field. AI analysis stays available as an optional side panel; it is not a prerequisite to artwork.

When the user starts, create a *draft scene plan* from the original text. Do not spend image credits yet. Show the expected number of scenes and a cost estimate before proceeding.

### 2. Scenes: review the storyboard

Show the dream as readable passages with numbered scene markers inserted at exact saved text offsets. Each marker opens a card containing a short visual brief. The user can move a marker, combine or split scenes, rename a scene, and mark one as cover art. Offer **Use suggested scenes** as the fast path.

The preview is a vertical illustrated-story canvas, matching the reference screenshots: text, an image placeholder, more text, the next placeholder. Desktop can show a narrow scene strip for navigation; mobile keeps a single reading column. No separate scene carousel in the editor.

Before image generation, offer three high-impact choices in one compact panel: visual style, character appearance (including optional avatar/reference), and frame shape. Hide the full prompt behind **Advanced direction**. Show a thumbnail style preview and carry these choices across scenes for consistency.

### 3. Images: create and curate frames

The primary action is **Generate 3 scene images · X credits** (actual count and price calculated from the plan). Render scene cards progressively in place. Each card has a clear status: queued, generating, ready, or failed. A failed card can retry alone.

Tapping a ready frame opens a full-screen viewer with **Keep**, **Try another**, and **Edit direction**. Keep previous variants in a small history; changing an image should never silently discard a clip made from an earlier variant. A single frame can be used as the cover, and the cover can also be generated independently if desired.

The reader preview updates from the selected image for each scene. Its prose is always the saved dream text, not the generated scene brief.

### 4. Motion: animate selected frames

When at least one image is ready, show **Bring scenes to life**. Select scenes with checkmarks; default to all ready scenes. Each selected card shows the source still, a suggested motion sentence, duration, and an optional motion edit. Global motion presets such as *gentle*, *cinematic*, and *dynamic* set a starting point without forcing prompt writing.

Before starting, show the exact number of clips, estimated credits, rough wait, and subscription requirement. Then render each clip into its card. Each card can play/pause, retry, or select a different image variant. A failed clip should not block other scenes. If a source image changes, label the old clip **made from an earlier image** and let the creator keep or replace it deliberately.

### 5. Film: assemble and review

Provide a timeline of the selected clips in story order, with drag-to-reorder, trim, and optional title/end card. Narration and music can be added here; auto narration is an opt-in choice with a voice preview. Show the total duration before export. **Preview film** should use existing assets. **Export film** should assemble those assets without regenerating imagery or motion.

The finished screen contains one prominent player and three actions: **Save to dream**, **Download**, and **Share**. The dream's public story retains its inline illustrations and gains a film button; the film does not replace the readable story.

## Alternative fast path

For a user who only wants a quick result, offer **Make it for me** at the storyboard stage. It accepts the suggested scene plan and shared style, generates the frames, animates them, and opens the film review. Show a single confirmation with total expected credits and what will be produced. The advanced stages remain accessible if the user wants to adjust anything later.

The existing one-image animation remains an explicit **Animate this image** action in a frame viewer. The separate text-to-film pipeline can be retained as an experimental **Generate film directly from text** option, clearly labeled because it does not use the approved scene images. Neither option should share the primary **Create Film** call to action.

## Interaction and visual direction

- Use the story itself as the canvas. Scene cards occupy the same positions where published art will appear, so the editor and reader feel continuous.
- Keep the interface dark and cinematic, with generous reading spacing, image-led cards, restrained blue highlights, and full-screen image/video previews.
- Use a persistent bottom action on mobile and a sticky action rail on desktop. The action label names the next result and its cost.
- Make progress honest: stage labels come from server job state. Do not display simulated percentages for image or video calls.
- Autosave scene plans and selected variants. A creator can leave and resume from the journal, with completed media intact.
- Make every scene action accessible by a visible button or menu. Long-press can be a shortcut, never the only path.

## State and implementation shape

Create stable `scene_id` records linked to a dream. Each scene stores an exact `start_offset` and `end_offset` into a versioned story, its brief, and ordering. Keep image and clip variants as separate asset records with `source_asset_id`, prompt/direction, generation status, cost, and created time. A project stores the selected variant IDs, global visual settings, film settings, and published film ID. Keep legacy `section_images` readable during migration; convert them to scene records on first edit without changing the original story text.

Persist generation jobs server-side with idempotency keys. Image, motion, narration, and export jobs should be independently retryable. Charge only for a started paid job and show the actual charge before it starts. When reassembling an existing film, reuse saved clips. Record the source image on every clip so changing an image cannot accidentally present an unrelated animation as current.

## Acceptance checks

1. A new creator can save a dream, approve a suggested scene plan, generate images, animate them, preview a film, and return to that project after a reload.
2. Before every paid batch, the creator can see the item count and credits; a failure exposes a single-scene retry without rerunning successful items.
3. The published story preserves every word of the saved dream and places selected images inline. Images enlarge on tap, and available scene clips play from the same viewer.
4. Changing a scene image leaves earlier variants and clips recoverable and clearly identifies which image produced each clip.
5. The film export uses the approved clips in storyboard order and does not call image or motion generation again.
6. Mobile and desktop both show a clear next action, all scene actions are keyboard/touch accessible, and loading/error/empty states are understandable.

## Build order

First add the project/scene/asset model and migrate existing media read-only. Next build the storyboard and image stage, then the motion stage and durable job state. Finally replace the competing cinematic dialogs with the film workspace and route old entry points into the correct stage. Keep the published reader as the visual acceptance target throughout.
