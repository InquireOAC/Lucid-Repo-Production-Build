
# Lucid Repo × Lucid Engine: Ecosystem Branding Plan

## What Lucid Engine establishes (the parent system)

- **Wordmark pattern**: `Lucid ___` — two-word lockup, lowercase-cap, monoline.
- **Brand font**: Basis Grotesque Arabic Pro (300/400/500/700/900), with JetBrains Mono for technical/timecode accents.
- **Signature color**: a single electric blue (`217 91% 50%` light / `217 91% 60%` dark) with no secondary hue competing.
- **Surface language**: deep slate near-black (`220 13% 5%`), glassmorphism via `--glass-surface / --glass-strong / --glass-border`, ink scale (`--ink-soft`, `--ink-faint`).
- **Signature gradient**: `linear-gradient(135deg, hsl(217 91% 50%) → hsl(217 80% 62%))` — monochrome blue, no purple.
- **Signature glow**: tight blue shadow (`--glow-primary`, `--glow-secondary`).
- **Radius**: `1rem` — soft, generous.
- **Voice**: cinematic, studio-grade, "Your Personal Production Studio".

Lucid Repo today drifts off-system in three ways: (1) the palette mixes blue + violet/purple via `cosmic.purple`, `aurora.violet`, `--aurora-purple`, `magic-gradient`; (2) wordmark/logo treatment uses a 5-stop blue→white shimmer that doesn't match Engine's flat monoline; (3) tokens like `--glass-surface`, `--ink-soft`, `--ink-faint`, `--tc-*` and the `Basis Grotesque Arabic Pro` family name aren't mirrored.

---

## Proposed identity: "Lucid Repo, by Lucid Studios"

Position Repo as the **dreaming/archive** sibling to Engine's **production** studio. Same studio, different room.

### 1. Wordmark & lockup

- Adopt the Engine lockup pattern: `Lucid Repo` set in Basis Grotesque 500, tight tracking (-0.02em), single-color foreground — no gradient text by default.
- Replace the current 5-stop blue/white shimmer headline with a **monochrome blue lockup** that only animates on first paint (subtle `logo-breathe`, matching Engine's keyframe).
- Co-brand footer/about: small `JetBrains Mono` tag — `LUCID · STUDIOS // REPO v1.0` — mirroring Engine's technical accent typography.
- App icon: blue glyph on `#0a0f1a` (Engine's exact theme-color), with a "moon/journal" mark that visually rhymes with Engine's icon silhouette.

### 2. Color system (drop purple, commit to Engine blue)

Remove the violet drift in `tailwind.config.ts` and `colorSchemes.ts`:

- `cosmic.purple`, `cosmic.violet`, `aurora.purple`, `aurora.violet`, `dream.purple`, `dream.violet`, `oniri.purple`, `oniri.violet`, `magic-gradient`, `aurora-gradient`, `luminous-gradient` → re-point all to the Engine blue ramp (`217 91% 50/60%` + `217 80% 62/70%`).
- The "Aurora Blue" preset becomes the **default + canonical** scheme; the other free/premium palettes stay as user-selectable themes but the **brand chrome** (logo, splash, paywall, onboarding, marketing pages) always renders in Engine blue regardless of user theme.
- Background: shift dark mode from `220 15% 6%` / `220 13% 8%` to Engine's exact `220 13% 5%` / `220 13% 8%`. Light mode adopts Engine's `220 30% 98%` / `220 18% 94%`.

### 3. Typography

- Rename font family token from `Basis Grotesque Pro` to `Basis Grotesque Arabic Pro` and add 300/500/900 weights to match Engine's range (currently only 400/700 are loaded).
- Add `JetBrains Mono` for: timestamps on dream cards, dream IDs, stats numerals in Lucid Stats, dev/debug surfaces. This is the single biggest "ecosystem" signal — Engine uses it everywhere for timecode.
- Body remains Basis 400; headings move to Basis 500 (not 700) to match Engine's lighter editorial weight.

### 4. Shared design tokens

Port the Engine token set into Repo's `index.css` so component classes are interchangeable:

```text
--glass-surface, --glass-strong, --glass-border
--ink-soft, --ink-faint
--gradient-primary, --gradient-radial
--glow-primary, --glow-secondary
--transition-smooth
```

And the `.bg-glass / .bg-glass-strong / .border-glass / .text-ink / .text-ink-soft / .text-ink-faint` utility layer. This lets future shared components (auth, paywall, profile cards) drop into either app without rework.

### 5. Surface & motion language

- Replace `magic-gradient` / `aurora-gradient` usages with Engine's flat blue `gradient-primary`.
- Replace `magic-glow` and dual-color `glow-pulse` keyframes with Engine's single-tone `glow-pulse` + `logo-breathe` / `logo-shimmer` set.
- Set `--radius: 1rem` (Repo currently inherits the same, confirm and lock).
- Glass cards across Home, Paywall, Profile, Lucid Stats use `bg-glass-strong border-glass` instead of bespoke `bg-[#0d1425]` / `border-border/20` literals.

### 6. Cross-product surfaces

- **Splash / initial loader** (`index.html`): match Engine's `#0a0f1a` background + blue spinner ring exactly. Drop the current purple `#8b5cf6` border-top if Repo uses it.
- **Auth & Onboarding**: add a small "from the makers of Lucid Engine" footer line, blue underline link out to lucidengine.app.
- **Paywall**: subscription tiers carry a "Lucid Studios" badge; the highest tier mentions cross-app perks (e.g. "Bring dreams from Repo straight into Engine").
- **Settings → About**: new "The Lucid Suite" panel listing Repo + Engine with parallel iconography, linking out.

### 7. Naming & voice

- Marketing tagline: **"Lucid Repo — where dreams are kept."** (parallel cadence to "Lucid Engine — your personal production studio.")
- Replace "cosmic / aurora / magic" descriptors in user-facing copy with the more grounded "lucid / studio / archive" vocabulary Engine uses.

---

## Files this touches (technical)

| Area | Files |
|---|---|
| Tokens | `src/index.css`, `tailwind.config.ts` |
| Palette presets | `src/data/colorSchemes.ts` |
| Fonts | `public/fonts/` (add Basis 300/500/900), `index.html` (preload), `tailwind.config.ts` font family rename |
| Splash | `index.html` initial loader colors |
| Logo / wordmark | `src/components/onboarding/OnboardingFlow.tsx`, sidebar logo usage of `LogoForFramer-3.png` (consider new monoline SVG) |
| Paywall co-brand | `src/components/paywall/PaywallDialog.tsx` |
| Glass utilities | new `.bg-glass*` / `.text-ink*` classes in `src/index.css`, migrate hardcoded `bg-[#0d1425]` / `bg-black/40` callsites opportunistically |
| About / Suite panel | new `src/components/profile/LucidSuiteCard.tsx` |

## Rollout order

1. Token + font alignment (invisible groundwork — no visual regression risk).
2. Drop purple from chrome surfaces; keep user-selectable themes intact.
3. Wordmark + splash + favicon swap.
4. Co-branded paywall, onboarding footer, "Lucid Suite" about panel.
5. Opportunistic migration of bespoke surface classes to `.bg-glass*`.

No backend or business-logic changes.
