# Plan: Accurate Technique Imagery + Lucid Engine Logo on Auth

## 1. Regenerate all 8 technique hero images

Currently only 6 techniques have images (MILD and WBTB fall back to the emoji), and several existing images don't visually match what the technique actually is. Generate fresh 9:16-friendly 16:10 hero JPEGs (1536×960, fast model) tuned to each technique, using the project "Cosmic Tech" palette — deep navy `#060B18`, primary blue `#3B82F6`, soft cosmic glow, cinematic, no text overlays, no people's faces front-and-center.

| # | Technique | Image concept |
|---|---|---|
| 0 | Reality Checks | Close-up of a hand with one extra finger glowing faintly, palm half-translucent, cosmic blue ambient light |
| 1 | MILD (Mnemonic) | Person lying in bed at night, ethereal thought-thread of light spiraling from forehead into a starfield (intention/memory) |
| 2 | WBTB (Wake Back To Bed) | Bedside scene at 4am, soft alarm clock glow, moonlight through window, warm-to-cool color shift |
| 3 | WILD (Wake Initiated) | First-person POV drifting through hypnagogic geometric tunnel, kaleidoscopic violet/blue fractal vortex |
| 4 | SSILD (Senses) | Abstract three concentric rings of light (eye, ear, hand silhouettes faintly inside), pulsating cosmic blue |
| 5 | FILD (Finger Induced) | Macro shot of two fingers gently tapping in shadow, micro-light trails between them, deep blue ambience |
| 6 | DEILD (Dream Exit) | Figure suspended between two dream worlds — fading scene on one side, new dream forming on the other, ribbon of light connecting them |
| 7 | Wake-Initiated Meditation | Silhouette in lotus pose floating in cosmic void, halo of soft starlight, calm symmetrical composition |

Files written to `src/assets/techniques/` as `.jpg`:
`reality-checks.jpg`, `mild.jpg`, `wbtb.jpg`, `wild.jpg`, `ssild.jpg`, `fild.jpg`, `deild.jpg`, `meditation.jpg` (new `.jpg` extension; old `.jpeg` files will be deleted to keep the folder clean).

## 2. Wire up the new images

Edit both `src/components/insights/TechniqueCard.tsx` and `src/components/insights/TechniqueDetailPage.tsx`:
- Update the 6 existing imports to the new `.jpg` filenames
- Add 2 new imports: `mildImg`, `wbtbImg`
- Extend `TECHNIQUE_IMAGES` map to cover all indices 0–7 (so MILD and WBTB stop showing the emoji fallback)

No changes to `techniqueData.ts` or other files.

## 3. Swap the Auth page logo

The Lucid Engine `lucid-logo.png` is already in this project at `src/assets/lucid-logo.png` (copied during the loader work). 

- Edit `src/pages/Auth.tsx`: replace the existing `lucidRepoLogo` import (currently `@/assets/lucid-repo-logo.png`) with `@/assets/lucid-logo.png`. Keep all existing styling, sizing, and glow treatment — only the image source changes.
- No other logo usages will be touched (only Auth, as requested).

## Out of scope
- Loader logo (already Lucid Engine)
- Other branding surfaces (onboarding, splash, etc.)
- Technique data copy or step changes
