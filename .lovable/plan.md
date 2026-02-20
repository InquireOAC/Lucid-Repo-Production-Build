

# Upgrade All Image Style Descriptions for High-Quality Generation

## Problem

The style descriptions used in prompt building are too short and generic (e.g., "delicate watercolor painting with transparent washes"). This gives the AI model insufficient guidance, resulting in inconsistent or low-quality stylistic output. The "realistic" and "hyper_realism" styles already have detailed multi-line descriptions, but all other styles are one-liners.

## Changes

### 1. `src/utils/promptBuildingUtils.ts` -- Upgrade `addImageStyleToPrompt`

Replace every one-liner style description in the `styleMap` with detailed, multi-line style directives similar to what "realistic" and "hyper_realism" already have. Each style will get specific rendering instructions covering medium, technique, lighting, color palette, and texture:

| Style | Current Description | Upgraded Description (summary) |
|-------|-------------------|-------------------------------|
| surreal | "surreal dreamlike artistic style with vivid colors" | Detailed Salvador Dali-inspired: melting forms, impossible geometry, hyper-detailed textures, chromatic lighting, cinematic composition |
| digital_art | "polished digital art with vibrant colors" | AAA concept art quality: clean vector edges, volumetric lighting, subsurface scattering, 4K render, ArtStation-trending quality |
| fantasy | "epic fantasy art with rich detail and magical atmosphere" | Epic fantasy illustration: golden-hour rim lighting, ornate details, atmospheric depth, magical particle effects, painterly brushwork |
| cyberpunk | "cyberpunk digital art with neon lights and futuristic dystopia" | Neon-drenched cyberpunk: holographic HUD overlays, rain-slick reflections, volumetric fog with neon scatter, chrome/carbon materials, Blade Runner aesthetic |
| watercolor | "delicate watercolor painting with transparent washes" | Traditional watercolor on cold-press paper: visible paper grain, pigment granulation, wet-on-wet bleeding edges, transparent layered glazes, unpainted white highlights |
| oil_painting | "classical oil painting with rich impasto texture" | Museum-quality oil painting: thick impasto brushstrokes, canvas weave texture, Rembrandt-style chiaroscuro, glazed luminous skin tones, visible palette knife marks |
| sketch | "detailed pencil sketch with expressive linework" | Professional graphite sketch: varied pencil pressure (2H-6B range), cross-hatching for shadow depth, paper tooth texture, smudged soft gradients, raw construction lines |
| impressionist | "impressionist painting with visible brushstrokes and soft light" | Monet/Renoir style: broken color dabs, en plein air natural light, chromatic shadow theory, thick visible brushstrokes, diffused edges |
| abstract | "abstract art with bold shapes and non-representational forms" | Bold abstract composition: geometric and organic forms, Kandinsky/Rothko influence, saturated color fields, strong compositional tension, textured mixed-media feel |
| minimalist | "minimalist design with clean lines and limited palette" | Japanese-inspired minimalism: vast negative space, 2-3 color palette max, single focal element, clean geometric forms, zen-like tranquility |
| vintage | "vintage photography with film grain and muted tones" | 1970s analog film: Kodak Portra/Ektachrome color science, visible film grain, slight light leaks, warm muted tones, soft vignette, period-accurate lens characteristics |

### 2. `src/components/profile/AIContextDialog.tsx` -- Upgrade avatar style prompts

Update the non-realistic avatar prompt in `generateCharacterAvatar` to include the same style-specific detail. Instead of the generic `"Create a stylized character portrait ... in a ${styleLabel} art style"`, use a lookup of detailed per-style avatar prompts matching the descriptions above. This ensures avatar generation gets the same quality guidance as dream images.

### Files Changed

| File | Action |
|------|--------|
| `src/utils/promptBuildingUtils.ts` | Upgrade all style descriptions in `addImageStyleToPrompt` with detailed multi-line rendering directives |
| `src/components/profile/AIContextDialog.tsx` | Upgrade avatar generation prompt with per-style detailed descriptions |

