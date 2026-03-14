

# Fix: Section Video Overwrites Hero Video

## Root Cause
The `generate-dream-video` edge function (line 307-311) **always** does:
```sql
UPDATE dream_entries SET video_url = '...' WHERE id = dreamId
```
This overwrites the hero `video_url` even when the video was generated for a section image. The section JSONB update happens client-side *after*, but the hero damage is already done.

## Changes

### 1. `supabase/functions/generate-dream-video/index.ts`
- Accept an optional `skipDreamUpdate` boolean from the request body
- When `skipDreamUpdate` is true, skip the `dream_entries` update — just return the video URL
- The client already handles persisting section videos into `section_images` JSONB

### 2. `src/pages/DreamStoryPage.tsx` — SectionImage's `GenerateVideoDialog`
- Pass a custom `onVideoGenerated` that does NOT touch `dream.video_url`
- Already correct — `handleSectionVideoGenerated` updates `section_images` only
- But the `GenerateVideoDialog` itself calls the edge function which does the DB write
- Fix: pass `skipDreamUpdate: true` to the edge function when generating for a section

### 3. `src/components/dreams/GenerateVideoDialog.tsx`
- Accept an optional `skipDreamUpdate` prop
- Pass it through to the edge function body

## Implementation Detail

**Edge function change** (lines 102, 307-313):
```typescript
const { dreamId, imageUrl, animationPrompt, aspectRatio, skipDreamUpdate } = await req.json();

// Only update dream entry video_url if not a section image
if (!skipDreamUpdate) {
  await supabase.from("dream_entries").update({ video_url: publicUrl.publicUrl }).eq("id", dreamId).eq("user_id", user.id);
}
```

**GenerateVideoDialog** — add `skipDreamUpdate?: boolean` prop, pass in body.

**DreamStoryPage SectionImage** — pass `skipDreamUpdate` to `GenerateVideoDialog`.

