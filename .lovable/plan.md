

# Fix Dream Book Download Button

## Problem
The export modal's download logic uses `document.createElement("a").click()` which fails silently on native iOS (Capacitor) since there's no real browser download manager. Additionally, the error handling shows no user feedback — errors are only logged to console.

## Fix

### `src/components/dream-book/DreamBookExportModal.tsx`

1. **Use `file-saver`** (already in dependencies) for the web download path — `saveAs(blob, "dream-book.pdf")` instead of the manual anchor element approach
2. **Use Capacitor Filesystem + Share** on native platforms — write the blob to cache, then open the native share sheet so the user can save/share the PDF
3. **Add error toast** so users see feedback when export fails
4. **Add success toast** on completion

Changes:
- Import `saveAs` from `file-saver`, `Capacitor` from `@capacitor/core`, `Filesystem`/`Directory` from `@capacitor/filesystem`, `Share` from `@capacitor/share`, and `toast` from `sonner`
- In `handleExport`, after generating the blob:
  - If native platform: convert blob to base64, write to cache via `Filesystem.writeFile`, then call `Share.share({ url: fileUri })`
  - If web: call `saveAs(blob, "dream-book.pdf")`
- Wrap in try/catch with `toast.error("Failed to export dream book")` on failure and `toast.success("Dream book exported!")` on success

