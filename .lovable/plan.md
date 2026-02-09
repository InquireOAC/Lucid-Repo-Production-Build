

## Add Visual Style Selector to Dream Avatar Modal

### Change
Add a horizontal scrollable style picker to the Dream Avatar dialog (same visual pattern used in the dream image generator) so users can choose an art style for their generated character avatar (e.g., Surreal, Cyberpunk, Fantasy, Digital Art, etc.).

### How It Works
1. User uploads a reference photo as before
2. A new style selector row appears below the upload area, showing thumbnail previews of each art style
3. User taps a style to select it (defaults to "Digital Art" since it suits avatars well)
4. Clicking "Generate Character" uses the selected style in the prompt sent to the edge function
5. User can change styles and regenerate to compare looks

### Technical Details

**File: `src/components/profile/AIContextDialog.tsx`**

- Import the existing style thumbnail images from `@/assets/styles/` (same imports used in `DreamImageGenerator.tsx`)
- Define a `styleOptions` array with a curated subset of styles that work well for character avatars (e.g., Digital Art, Surreal, Fantasy, Cyberpunk, Realistic, Watercolor, Sketch, Oil Painting)
- Add state: `selectedStyle` (default: `"digital_art"`)
- Render a horizontal scrollable row of style thumbnails between the photo upload section and the Name field, using the same visual pattern as `DreamImageGenerator.tsx` (72x72 rounded thumbnails with selection ring)
- Modify `generateCharacterAvatar()` to incorporate the selected style into the prompt, e.g.: `"Create a stylized character portrait... in a ${styleLabel} art style..."`
- The style selector is always visible (not gated on photo upload) so users can browse styles before uploading

No changes needed to the edge function or any other files -- the style is purely a prompt modification on the client side.

