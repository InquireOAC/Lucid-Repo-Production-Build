

# Export Dream Journal as PDF Book

## Overview
Add an "Export Dream Journal" button to the Settings screen that generates a beautifully formatted PDF book from the user's dream entries. The PDF includes a cover page with the user's profile info, and each dream entry gets its own page(s) with the dream image, title, date, tags, mood, description, and analysis. The user can then download or share the PDF.

## New Dependency
- **jspdf** -- lightweight client-side PDF generation library (no server needed)

## New Files

### 1. `src/utils/exportDreamJournalPdf.ts`
Core PDF generation logic using jsPDF:

- **Cover page**: 
  - Title: "Dream Journal" in large decorative text
  - Subtitle: user's display name or username
  - Date range (earliest to latest dream date)
  - Total dream count
  - A soft gradient or border decoration

- **Dream entry pages** (one per dream, sorted by date descending):
  - Dream title (large, bold)
  - Date and mood
  - Tags as inline labels
  - Dream image (if available) -- fetched and embedded as base64
  - Dream description (content) with text wrapping
  - Dream analysis section (if available), separated by a divider
  - Page number in footer

- **Image handling**: 
  - Fetch each dream image URL, draw it to a canvas to get base64
  - Skip images that fail to load (show placeholder text instead)
  - Images sized to fit within page width while maintaining aspect ratio

- **Export function signature**:
  ```
  exportDreamJournalPdf(dreams: DreamEntry[], profile: { display_name, username }): Promise<Blob>
  ```

### 2. `src/components/profile/ExportJournalDialog.tsx`
A full-screen slide-in dialog (matching the existing settings sub-dialog pattern) that:

- Shows a preview summary: "X dreams will be exported"
- Has a "Generate PDF" button that triggers the export
- Shows a progress indicator while generating (loading spinner + "Generating your dream journal...")
- Once complete, offers two buttons:
  - "Download" -- saves the PDF file
  - "Share" -- uses Capacitor Share on native, or triggers download on web
- Error handling with toast messages

## Modified Files

### 3. `src/components/profile/SettingsDialog.tsx`
- Add a new section "Data" between "Dream Avatar" and "Community" with:
  - Button: "Export Dream Journal" with a `BookOpen` icon from lucide-react
- Add state `showExportJournal` and render `ExportJournalDialog`

## Technical Details

**jsPDF usage:**
- Create A4-sized pages (210 x 297 mm)
- Use built-in fonts (Helvetica for body, Helvetica-Bold for titles)
- `addImage()` for dream images with JPEG compression to keep file size reasonable
- `splitTextToSize()` for word-wrapping long dream descriptions
- `addPage()` for each new dream entry
- Footer with page numbers on every page

**Image loading strategy:**
- For each dream with an image URL, create an `<img>` element, load the URL with crossOrigin, draw to an offscreen canvas, and extract as JPEG base64
- Use a timeout (5s per image) to avoid blocking on broken URLs
- Process images sequentially to avoid memory spikes

**Sharing on native:**
- Write the PDF blob to Capacitor Filesystem as a temp file
- Use `Share.share({ url: fileUri })` to open the native share sheet
- On web, use `saveAs()` from file-saver (already installed)

