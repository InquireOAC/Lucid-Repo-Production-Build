

## Redesign: Magazine Editorial Dream Share Card (9:16)

Full-bleed dream image background with a frosted glass text overlay panel at the bottom. Clean, premium, social-media-ready.

### Design

```text
┌──────────────────────┐
│                      │
│   FULL-BLEED IMAGE   │
│   (dream visual)     │
│                      │
│                      │
│                      │
│                      │
│                      │
│┌────────────────────┐│
││ ░░ FROSTED GLASS ░░││
││                    ││
││ ✦ DREAM JOURNAL ✦ ││
││ Title              ││
││ Date               ││
││                    ││
││ "Dream excerpt..." ││
││                    ││
││ ── logo/badge ──   ││
│└────────────────────┘│
└──────────────────────┘
```

- **Full-bleed image**: Dream visualization fills the entire 9:16 card as background
- **Bottom gradient**: Dark gradient fades from transparent at top to near-black at bottom
- **Frosted glass panel**: Sits at the bottom ~45% with backdrop blur, containing title, date, short excerpt, and branding
- **No image fallback**: If no dream image exists, use the cosmic gradient background with a subtle star pattern instead
- **Branding**: "Lucid Repo" logo/app store badge at the very bottom of the glass panel

### Files Changed

| File | Change |
|------|--------|
| `src/components/share/DreamShareCard.tsx` | Complete rewrite — full-bleed image bg with frosted glass overlay panel at bottom |
| `src/components/share/ShareButton.tsx` | Update preview card in the dialog to match the new design; simplify the inline preview to render the same layout |

### Key Details

- **Off-screen render card** (`DreamShareCard`): 1080x1920 canvas with dream image as full background `object-fit: cover`, gradient overlay bottom 50%, frosted panel with title/date/excerpt/logo
- **Preview in dialog** (`ShareButton`): Same layout scaled down to fit the dialog, using preloaded base64 images for reliable html2canvas capture
- **Text truncation**: Dream content capped at ~150 chars for cleaner visuals on the share card
- **Analysis removed**: Too cluttered for a share image; only title + date + short excerpt
- **Color palette**: Keep existing cosmic blue tokens for the glass panel border glow and fallback background

