

# Make Image Prompt Editable with Regenerate Button

## Overview
Replace the small single-line `Input` for the image prompt with a proper multi-line `Textarea` that invites the user to write or edit their own prompt, plus a dedicated "Regenerate" button right next to it so they can re-render the image using their custom prompt.

## Changes

### 1. `src/components/dreams/ImagePromptInput.tsx`

- Replace `Input` with `Textarea` (multi-line, 3 rows, resizable)
- Add a label: "Image Prompt" so it's clear what the field is for
- Add a "Regenerate" button below the textarea (with Wand2 icon)
- Accept new props: `onRegenerate` callback and `isGenerating` boolean
- Better placeholder text: "Describe the image you want to generate..."

### 2. `src/components/DreamImageGenerator.tsx`

- Move the prompt input + regenerate button to be more prominent -- show it both when an image exists AND when no image exists yet (so users can write a custom prompt before first generation too)
- Pass `onRegenerate` and `isGenerating` props to the updated `ImagePromptInput`
- Remove the separate "Regenerate" button from the image action bar (it moves into the prompt input component)
- Keep the "Save" / download button in the image action bar

## Technical Details

**ImagePromptInput changes:**
- Switch from `Input` to `Textarea` with `rows={3}` and `resize-none`
- Add props: `onRegenerate?: () => void`, `isGenerating?: boolean`
- Layout: label on top, textarea, then a right-aligned regenerate button below
- The regenerate button is disabled when `isGenerating` is true or prompt is empty

**DreamImageGenerator changes:**
- Show `ImagePromptInput` in all states (not just when `generatedImage` exists), placed after the image area but before the Avatar toggle
- Remove the duplicate "Regenerate" button from the image actions row (lines 127-129)
- Pass `generateImage` as the `onRegenerate` callback

