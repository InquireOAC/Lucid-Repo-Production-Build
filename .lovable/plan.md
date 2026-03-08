

## Three Changes: Remove Button Gradients, Redesign New Dream Page, Add Audio to Lucid Repo

### 1. Remove All Gradient Button Variants

**`src/components/ui/button.tsx`**
- `luminous`: Replace gradient with solid `bg-primary text-white` with glow shadow
- `aurora`: Replace gradient with solid `bg-primary text-white` with subtle shadow
- `magic`: Replace gradient with solid `bg-secondary text-white`
- Keep hover effects (scale, shadow) but no `bg-gradient-*` classes

**`src/components/ui/badge.tsx`**
- `aurora` badge variant: Replace `bg-gradient-to-r from-primary/30 to-accent/30` with solid `bg-primary/30 text-white`

No changes needed at usage sites — the variant names stay the same.

---

### 2. Redesign New Dream Page

Transform from a basic form into an immersive, step-guided experience:

**`src/pages/NewDream.tsx`** — Full rewrite of the layout

- **Simplified sticky header**: Back arrow + minimal "Save" text button (no big colored button in header)
- **Large title input**: Bigger placeholder text, more prominent — feels like a writing app
- **Input mode toggle**: Redesign as a segmented control (pill-shaped container with sliding indicator) instead of two separate buttons
- **Writing area**: Larger min-height (300px), more breathing room, subtle animated border glow when focused
- **Tags section redesigned**: Horizontal scrollable row (like the new Lucid Repo filter bar), not a wrapped grid. Lucid tag gets a special star icon
- **Date moved inline**: Small subtle date chip at the top near the title, not a separate section
- **AI tools (Analysis + Image)**: Collapsed into a "Dream Tools" section with icon-labeled cards users tap to expand. Cleaner than always-visible blocks
- **Bottom save**: Full-width solid primary button (no gradient), fixed to bottom with backdrop blur

```text
┌─────────────────────────────┐
│ ←                     Save  │
│                             │
│  Title your dream...        │  ← large, clean input
│  Mar 8, 2026                │  ← subtle date chip
│                             │
│  ┌─[Text]──[Voice]────────┐ │  ← segmented control
│  │                        │ │
│  │  Write your dream...   │ │  ← tall textarea
│  │                        │ │
│  └────────────────────────┘ │
│                             │
│  ──── Tags (scroll) ────── │
│  [✦Lucid] [Flying] [Night] │
│                             │
│  ──── Dream Tools ──────── │
│  [🧠 Analyze] [🎨 Image]   │  ← tappable cards
│                             │
│ ┌─────────────────────────┐ │
│ │      Save Dream         │ │  ← solid primary, fixed bottom
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

### 3. Audio Playback on Lucid Repo Dream Story Page

**`src/pages/DreamStoryPage.tsx`**
- In the author bar area, if `dream.audio_url` exists, show an audio play button (headphones icon)
- Tapping it reveals the `AudioPlayer` component below the author bar
- Uses the existing `AudioPlayer` component from `src/components/dreams/AudioPlayer.tsx`
- Small "Listen to this dream" label with a headphones icon

**`src/components/repos/DiscoveryDreamCard.tsx`**
- Add a small headphones icon badge on the dream card cover if `dream.audio_url` exists (similar to the LUCID badge positioning) — top-right corner

---

### Files Changed
| File | Action |
|------|--------|
| `src/components/ui/button.tsx` | Edit — remove gradients from luminous/aurora/magic |
| `src/components/ui/badge.tsx` | Edit — remove gradient from aurora variant |
| `src/pages/NewDream.tsx` | Rewrite — redesigned layout |
| `src/pages/DreamStoryPage.tsx` | Edit — add audio section |
| `src/components/repos/DiscoveryDreamCard.tsx` | Edit — add audio indicator |

