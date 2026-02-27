

## Fix: Video URL Not Persisting After Re-opening Dream

### Root Cause
The `video_url` is correctly saved to the database by the `generate-dream-video` edge function. However, two data-fetching hooks manually map dream fields and **omit `video_url`** from the normalized output. When the user leaves and re-opens a dream, the video URL is lost.

### Changes

#### 1. Fix Journal dream fetch (`src/hooks/useJournalEntries.tsx`)
Add `video_url` to the formatted dream object (around line 53):
```typescript
audio_url: dream.audio_url,
audioUrl: dream.audio_url,
video_url: dream.video_url,   // <-- add this
```

#### 2. Fix Lucid Repo dream fetch (`src/hooks/useDreams.tsx`)
Add `video_url` to the normalized dream object (around line 97):
```typescript
audio_url: dream.audio_url || null,
audioUrl: dream.audio_url || null,
video_url: dream.video_url || null,   // <-- add this
```

### Why This Fixes It
- The database already has `video_url` stored correctly
- The `DreamDetail` component already reads `dream.video_url` and passes it to `DreamImageWithVideo` for autoplay
- The only gap was these two fetch functions silently dropping the field during normalization

### Files Modified
- `src/hooks/useJournalEntries.tsx` (1 line added)
- `src/hooks/useDreams.tsx` (1 line added)

