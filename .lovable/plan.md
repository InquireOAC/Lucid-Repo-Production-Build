

## Fix Avatar Character Generation + Reference Photo in Dream Images

### Problem 1: Saving Avatar Does Nothing with the Photo
Currently, when you upload a reference photo and save your Dream Avatar, it just stores the raw photo URL in the database. It never sends the photo to Gemini to generate a character version of you. The avatar preview just shows your uploaded selfie, not an AI-generated character.

### Problem 2: Reference Photo Not Sent During Dream Image Generation
When generating a dream image with "avatar likeness" enabled, the code fetches `ai_context` from the database but only uses `clothing_style` as a text descriptor in the prompt. The actual reference photo (`photo_url`) is never sent to the Gemini API. Since Gemini supports image inputs via `inline_data`, the reference photo should be included so the generated dream image actually looks like you, rendered in whatever visual style is selected.

---

### Solution

#### 1. Avatar Character Generation on Save (`AIContextDialog.tsx`)
When the user uploads a reference photo and clicks "Save Avatar":
- Upload the raw photo to storage (as it does now)
- Then call `generate-dream-image` with the photo + a prompt like "Create a stylized character portrait based on this reference photo" 
- The returned AI-generated character image becomes the avatar preview and is saved as `photo_url`
- Show a loading state ("Generating your avatar...") while this happens
- Display the generated avatar in the preview circle

#### 2. Update Edge Function to Accept Reference Images (`generate-dream-image/index.ts`)
- Accept an optional `referenceImageUrl` parameter alongside `prompt`
- When a reference image URL is provided, fetch the image, convert to base64, and include it as `inline_data` in the Gemini API `parts` array
- This allows Gemini to see the reference photo and generate images that match the person's likeness

#### 3. Pass Reference Photo During Dream Image Generation (`useDreamImageAI.ts`)
- When `useAIContext` is true and the user has a `photo_url`, pass it to `generate-dream-image` as `referenceImageUrl`
- The edge function will include the reference image in the Gemini call so the dream image respects the avatar likeness
- The selected image style (surreal, watercolor, etc.) is already in the text prompt, so Gemini will apply both the likeness and the style

---

### Technical Details

**Files to modify:**

1. **`supabase/functions/generate-dream-image/index.ts`**
   - Accept optional `referenceImageUrl` in the request body
   - When present, fetch the image from the URL, convert to base64
   - Include it as an `inline_data` part in the Gemini API `contents[0].parts` array alongside the text prompt
   - Structure: `{ inline_data: { mime_type: "image/jpeg", data: base64Data } }`

2. **`src/components/profile/AIContextDialog.tsx`**
   - After uploading the raw photo, call the edge function with a character generation prompt + the uploaded photo URL as reference
   - Save the AI-generated character URL as `photo_url` instead of the raw photo
   - Add loading state with "Generating your avatar..." message
   - Keep the raw photo available for reference during dream generation

3. **`src/hooks/useDreamImageAI.ts`**
   - Update `generateDreamImageFromAI` to accept an optional `referenceImageUrl` parameter
   - When `useAIContext` is true, fetch the AI context and pass `photo_url` as `referenceImageUrl` to the edge function
   - Pass the image style through properly so Gemini renders the likeness in the correct visual style

4. **`src/hooks/useImageGeneration.ts`**
   - Pass `useAIContext` and user ID to `generateDreamImageFromAI` so it can fetch and include the reference photo

**Edge function Gemini API call (updated structure):**
```
contents: [{
  parts: [
    { text: "dream scene prompt with style..." },
    { inline_data: { mime_type: "image/jpeg", data: "<base64>" } }  // reference photo
  ]
}]
```

**Avatar generation flow:**
1. User uploads photo -> stored in Supabase Storage
2. Edge function called with prompt "Create a stylized character portrait of this person" + photo as inline_data
3. Gemini generates a character version
4. Character image saved to storage, URL stored as `photo_url`
5. Avatar preview updates to show the generated character

**Dream image generation flow (with likeness):**
1. Dream prompt generated from dream content + style
2. AI context fetched, `photo_url` retrieved
3. Edge function called with dream prompt + reference photo as inline_data
4. Gemini generates dream scene featuring the person's likeness in the selected art style

