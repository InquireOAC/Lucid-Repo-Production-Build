
# Three-Part Improvement Plan

## 1. Visual Polish: White/Grey Text + Electric Blue Accents (No Gradient Text)

**Problem:** `gradient-text` CSS class is applied to ~23 files as the primary heading style, creating purple-to-gold gradient text on titles and dialog headers. `text-dream-pink` and `dream-pink` are used in video cards. Button variants `aurora`, `luminous`, and `magic` are all pure gradients. The accent color (`--accent`) is electric violet, not an electric blue.

**Plan:**

**`src/index.css`** — Update the `.gradient-text` class to use a solid electric blue instead of a purple-to-gold gradient:
```css
/* BEFORE */
.gradient-text {
  @apply text-transparent bg-clip-text;
  background-image: linear-gradient(135deg, ...purple...violet...blue...gold);
}

/* AFTER — solid electric blue, no gradient */
.gradient-text {
  color: hsl(210, 100%, 70%); /* electric blue */
}
```

**`tailwind.config.ts`** — Add an `electric-blue` color token (`hsl(210, 100%, 70%)`) and update `dream-pink` to map to something neutral (or keep it but override usages).

**`src/components/ui/button.tsx`** — Update the `aurora` variant to use electric-blue instead of a purple-violet-blue gradient:
```
aurora: "bg-[hsl(210,100%,55%)] text-white shadow-lg shadow-blue-500/30 hover:bg-[hsl(210,100%,65%)]"
```

**`src/components/videos/VideoCard.tsx`** and **`VideoDetail.tsx`** — Replace `text-dream-pink` with `text-white` or `text-white/80`. Replace gradient fallback with a solid deep purple background.

**`src/components/profile/ProfileSocialLinks.tsx`** — Keep Instagram's natural pink icon (this is brand-accurate), just ensure surrounding text is white/grey.

**`src/layouts/MainLayout.tsx`** — Update the active nav item to use electric blue instead of the aurora gradient for the active icon background.

**Muted foreground (`--muted-foreground`):** Already at `250 15% 60%` which is light grey — no change needed. The `--foreground` is `220 30% 95%` (near-white) — good.

---

## 2. Image Generation: Style-Aware Photorealistic Prompts + Character Compositing

**Problem:** When `realistic` or `hyper_realism` is selected, the prompt just appends *"Render in photorealistic artistic style"* — it doesn't tell Gemini to produce a true photograph, and it doesn't give Gemini explicit character-reference instructions when a photo is included. The character reference image is passed as a generic inline part without role context, so Gemini doesn't know it's a person to compose into the scene.

**Plan:**

**`src/utils/promptBuildingUtils.ts`** — Rewrite `addImageStyleToPrompt` with two improvements:
- For `realistic` and `hyper_realism`: use a strong photorealism instruction like *"Render as a photorealistic photograph, ultra high resolution, shot on DSLR camera, 8K, natural lighting, no painterly effects."*
- For all other styles: keep existing style strings.

**`src/utils/promptBuildingUtils.ts`** — Update `buildPersonalizedPrompt` to inject an explicit character-reference instruction when `aiContext.photo_url` is present:
```
"The reference image shows the main character of this dream. 
Compose this character naturally into the dream scene. 
The character should appear as the dreamer/protagonist of the scene."
```
This gives Gemini the semantic label "character reference" instead of just a raw image.

**`supabase/functions/generate-dream-image/index.ts`** — Accept an optional `isPhotoRealistic` boolean from the request body. When true (for realistic/hyper_realism styles + reference image), restructure the Gemini request:
- Place the reference image **first** in the parts array with a text prefix: `"[CHARACTER REFERENCE - The person in this photo is the main character to compose into the dream scene]"`  
- Then the prompt text second.
- Add `temperature: 1` (Gemini image generation requires this for best results per Google docs).

**`src/hooks/useImageGeneration.ts`** — Pass `imageStyle` into `generateDreamImageFromAI` so the edge function receives it.

**`src/hooks/useDreamImageAI.ts`** — Forward `imageStyle` to the edge function body.

---

## 3. Profile Banner: Change + Remove Controls

**Problem:** The banner only shows a camera icon on hover to change the image. There is no "remove banner" option. On mobile (iOS), the hover state is unreliable. The `ProfileBanner` component has no `onBannerRemoved` callback.

**Plan:**

**`src/components/profile/ProfileBanner.tsx`** — Redesign the edit UI for own-profile state:
- Replace the invisible hover button with a small persistent icon-button menu in the top-right corner of the banner (always visible for own profile).
- The menu (a `DropdownMenu`) will have two options:
  - **Change photo** — triggers file input (existing behavior)
  - **Remove photo** — deletes the banner from storage and clears `banner_image` in the `profiles` table, then calls a new `onBannerRemoved` callback.

Add a `removeBanner` async function:
```ts
const removeBanner = async () => {
  await supabase.storage.from("profile-banners").remove([`${user.id}/banner.*`]);
  await supabase.from("profiles").update({ banner_image: null }).eq("id", user.id);
  onBannerRemoved?.();
}
```

**`src/components/profile/ProfileBanner.tsx`** — Add `onBannerRemoved?: () => void` to the props interface.

**`src/components/profile/ProfileHeader.tsx`** — Pass `onBannerRemoved` to `ProfileBanner`, which resets the local `bannerImage` state to `null`.

---

## Technical File Summary

| File | Change |
|------|--------|
| `src/index.css` | `.gradient-text` → solid electric blue; no gradient |
| `tailwind.config.ts` | Add `electric-blue` token |
| `src/components/ui/button.tsx` | `aurora` variant → solid electric blue, no gradient |
| `src/layouts/MainLayout.tsx` | Active nav icon → electric blue |
| `src/components/videos/VideoCard.tsx` | Remove `dream-pink` usages |
| `src/components/videos/VideoDetail.tsx` | Remove `text-dream-pink` |
| `src/utils/promptBuildingUtils.ts` | Strong photorealism prompts + character reference labels |
| `src/hooks/useDreamImageAI.ts` | Forward `imageStyle` to edge function |
| `src/hooks/useImageGeneration.ts` | Pass `imageStyle` to `generateDreamImageFromAI` |
| `supabase/functions/generate-dream-image/index.ts` | Gemini character reference ordering + photorealism flag |
| `src/components/profile/ProfileBanner.tsx` | Dropdown menu with Change/Remove; `onBannerRemoved` prop |
| `src/components/profile/ProfileHeader.tsx` | Wire `onBannerRemoved` callback |
