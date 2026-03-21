

## Plan: MP4 Export + Native Gallery Save for Share Videos

### Changes

**1. `src/utils/shareVideoRenderer.ts`** — Prioritize MP4 format

Update `getRecorderMimeType()` to try MP4 first (iOS Safari supports `video/mp4`), then fall back to webm:
```typescript
function getRecorderMimeType(): string {
  if (MediaRecorder.isTypeSupported('video/mp4; codecs=avc1')) return 'video/mp4; codecs=avc1';
  if (MediaRecorder.isTypeSupported('video/mp4')) return 'video/mp4';
  if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) return 'video/webm; codecs=vp9';
  if (MediaRecorder.isTypeSupported('video/webm')) return 'video/webm';
  return 'video/mp4';
}
```

Update `supportsVideoRecording()` to check MP4 first too.

Update the blob creation in `renderShareVideo` to use the correct MIME type from the recorder.

**2. `src/components/share/ShareButton.tsx`** — Save to gallery on native

Replace the native video save path (currently uses `CapacitorShare.share`) with direct filesystem save to gallery:
- Write the file to `Directory.Documents` (persists and shows in Files app)
- Use `CapacitorShare.share` with the file URI so the OS share sheet offers "Save Video" / "Save to Photos" options
- Ensure filename always ends in `.mp4`

The current native flow already uses `Filesystem.writeFile` + `CapacitorShare.share`, which presents the share sheet allowing save to Photos. The key fix is ensuring the file is `.mp4` not `.webm` (handled by the format priority change above).

### Files Modified (2)
1. `src/utils/shareVideoRenderer.ts` — MP4 priority in codec selection
2. `src/components/share/ShareButton.tsx` — Ensure `.mp4` extension, minor save flow cleanup

