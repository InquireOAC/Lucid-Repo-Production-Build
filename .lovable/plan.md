

## Plan: Change Dream Text to App's Brand Font

**What**: Update the dream content text in `DreamDetailContent.tsx` to use the app's brand font (`font-basis` / Basis Grotesque Pro).

**Change** in `src/components/dreams/DreamDetailContent.tsx`:
- Line 142: Add `font-basis` class to the `PaginatedText` className
- From: `className="text-sm whitespace-pre-wrap"`
- To: `className="text-sm whitespace-pre-wrap font-basis"`

**1 file modified**: `src/components/dreams/DreamDetailContent.tsx`

