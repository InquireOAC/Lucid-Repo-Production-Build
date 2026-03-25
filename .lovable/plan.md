

## Plan: Offline Dream Storage with Local Media Caching

### Problem
Dream entry text data is saved to localStorage (via Zustand store), but generated images and videos are only stored as remote URLs pointing to Supabase Storage. Without internet, users can't view their dream media. localStorage also has ~5MB limits which won't hold media.

### Solution
Use **IndexedDB** (via a lightweight wrapper) to cache dream media blobs locally. When dreams sync from the database, download and cache their images/videos. When displaying media, serve from local cache first, falling back to remote URL.

### What Changes

**1. Local media cache utility (`src/utils/localMediaCache.ts`)**
- IndexedDB store called `dream-media` with two object stores: `images` and `videos`
- Functions: `cacheMedia(key, blob)`, `getCachedMedia(key): string | null` (returns object URL), `deleteCachedMedia(key)`, `cacheMediaFromUrl(url): Promise<string>` (fetches and caches)
- Keys are the dream ID + type suffix (e.g., `dreamId-image`, `dreamId-video`)
- On native (Capacitor), uses `@capacitor/filesystem` to write to app data directory instead of IndexedDB for better persistence

**2. Background media sync in `useJournalEntries.tsx`**
- After `setAllEntries`, iterate entries with image/video URLs and call `cacheMediaFromUrl` for each in the background (non-blocking)
- Track which entries have been cached to avoid re-downloading

**3. Offline-aware media display**
- Create `useLocalMedia(dreamId, remoteUrl, type)` hook that returns the best available URL (cached blob URL or remote)
- Update `ImageDisplay.tsx` and video display components to use this hook
- If offline and no cache exists, show a placeholder

**4. Cache on save**
- In `useJournalActions.tsx`, after a dream is saved with an image, cache the image blob locally immediately

**5. Cache cleanup on delete**
- In `handleDeleteDream`, also call `deleteCachedMedia` for the dream's image and video

### Files

| File | Action |
|------|--------|
| `src/utils/localMediaCache.ts` | Create — IndexedDB wrapper for media blob storage |
| `src/hooks/useLocalMedia.ts` | Create — hook returning cached or remote URL |
| `src/hooks/useJournalEntries.tsx` | Modify — trigger background media caching after sync |
| `src/hooks/useJournalActions.tsx` | Modify — cache media on save, clean on delete |
| `src/components/dreams/ImageDisplay.tsx` | Modify — use `useLocalMedia` hook |

### Technical Detail

**IndexedDB approach** (works on web + Capacitor WebView):
```typescript
const DB_NAME = 'dream-media-cache';
const STORE_NAME = 'media';

async function cacheMediaFromUrl(key: string, url: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  // Store blob in IndexedDB keyed by dreamId-type
}

function getCachedMediaUrl(key: string): Promise<string | null> {
  // Retrieve blob from IndexedDB, return URL.createObjectURL(blob)
}
```

**Background sync** (non-blocking, won't slow UI):
```typescript
// After setAllEntries in syncDreamsFromDb:
formattedDreams.forEach(dream => {
  if (dream.generatedImage) {
    cacheMediaFromUrl(`${dream.id}-image`, dream.generatedImage).catch(() => {});
  }
  if (dream.video_url) {
    cacheMediaFromUrl(`${dream.id}-video`, dream.video_url).catch(() => {});
  }
});
```

**Size management**: IndexedDB has much higher limits than localStorage (typically 50%+ of available disk). No explicit eviction needed for MVP — most users won't exceed limits with dream images.

