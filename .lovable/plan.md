

# Redesign Dream Book Title Page — Dreamy Story Aesthetic

## Problem
The current title page is plain: black background, squared-off image edges, and flat text overlay. It needs to feel like a cinematic dream story cover — atmospheric, elegant, and immersive.

## Design Direction
A rich, layered title page inspired by movie posters and storybook covers, using the Cosmic Tech palette:

- **Hero media** fills most of the page with **rounded corners** and a soft **vignette/glow border** — no hard square edges
- **Radial gradient background** using the deep blue palette (#060B18 → primary blue glow) instead of flat black
- **Dreamy decorative elements**: subtle sparkle icons, a thin ornamental divider line between title and metadata
- **Typography hierarchy**: large serif title with text-shadow/glow, elegant small-caps date line, mood as a glowing badge, tags as floating pill chips
- **Lucid indicator**: sparkle icon with a soft primary glow, not just plain text
- **Scene count badge**: small "Chapter X scenes" indicator with a Film icon
- **Soft gradient overlays** on the image — bottom-to-top AND a radial vignette around edges for the dreamy fade effect

## Changes

### `DreamBookPageSpread.tsx` — Book mode title page (lines 178-217)

Replace the current flat layout with:

```
┌─────────────────────────────┐
│  radial gradient bg         │
│  ┌───────────────────────┐  │
│  │                       │  │  ← hero media with rounded-2xl,
│  │    image / video      │  │     soft shadow, vignette overlay
│  │                       │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│     ✦ Dream Title ✦        │  ← serif, text glow
│    ── ornamental line ──    │
│    Jan 15, 2025 · Mystical  │  ← small caps metadata
│    ☆ Lucid  · 4 scenes     │  ← badges with glow
│    #flying  #ocean  #light  │  ← floating tag pills
└─────────────────────────────┘
```

- Background: `bg-gradient-to-b from-[#060B18] via-[#0a1628] to-[#060B18]` with a radial glow behind the image
- Image container: `rounded-2xl overflow-hidden shadow-2xl shadow-primary/20` with margin/padding, not edge-to-edge
- Vignette overlay inside image: radial gradient from transparent center to dark edges
- Title: `text-xl font-bold font-serif` with `drop-shadow` and subtle primary glow
- Ornamental divider: thin line with Sparkles icon centered
- Metadata: `tracking-widest uppercase text-[10px]`
- Tags: small rounded-full pills with `bg-primary/10 border border-primary/20`

### `DreamBookPageSpread.tsx` — Reader mode title page (lines 81-115)

Apply matching aesthetic:
- Rounded image with shadow and vignette
- Same typography treatment and decorative divider
- Tags as styled pills instead of plain text

### No other files change — this is purely a visual redesign of the title page rendering.

## Files

| File | Change |
|------|--------|
| `src/components/dream-book/DreamBookPageSpread.tsx` | Redesign both book-mode and reader-mode title pages |

