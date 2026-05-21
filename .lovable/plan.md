# Cinematic Onboarding Redesign

Replace the current 7-screen `OnboardingFlow.tsx` with a chaptered cinematic flow that mirrors Lucid Engine's structure — labeled chapter progress, a "sigil" logo with breathing/unlock animations, glass cards, SVG draw-in icons, an animated process flow diagram, and choreographed sequential reveals — while keeping all Lucid Repo content (dreams, not films) and the existing terms-acceptance behavior.

## Structure

New folder: `src/components/onboarding/`
```
OnboardingFlow.tsx        (orchestrator — replaces current file)
screens/
  AwakeningScreen.tsx       Chapter 1 — Sigil + "Welcome to Lucid Repo"
  CaptureScreen.tsx         Chapter 2 — Glass cards of dream-capture powers
  IntelligenceScreen.tsx    Chapter 3 — Animated flow diagram (dream → insight)
  CommunityScreen.tsx       Chapter 4 — Constellation of dreamers
  ThresholdScreen.tsx       Chapter 5 — Terms accept + "Enter the Dream Realm"
components/
  ChapterProgress.tsx       Labeled dot progress (Awakening · Capture · Insight · Community · Threshold)
  LucidSigil.tsx            Logo with breathing glow + unlock burst (uses LogoForFramer.png)
  GlassCard.tsx             Reusable frosted card
  AnimatedIcon.tsx          SVG stroke-draw icons (moon, brain, eye, globe)
  FlowDiagram.tsx           Auto-playing 5-step dream→insight sequence
```

Delete the existing monolithic `OnboardingFlow.tsx` content and rewrite it as a thin orchestrator (~80 lines) that manages step state, swipe gestures, and the terms-acceptance handoff.

## Chapter content (Lucid Repo themed)

1. **Awakening** — Sigil breathes in, "Hello Dreamer" microtype, "Welcome to" → shimmer "Lucid Repo", tagline "Your dreams hold secrets. It's time to decode them." Sequential reveal over ~3s. Begin button + Skip.
2. **Capture** — Four glass cards with draw-in SVG icons: Voice Capture, Written Journal, Lucidity Tracking, Dream Tags.
3. **Insight** — `FlowDiagram` auto-cycling: Dream Input → Symbol Analysis → Pattern Recognition → AI Interpretation → Personal Archive.
4. **Community** — Animated constellation (reused from current file) with three glass cards: Share Dreams, Dream Repo, Collective Patterns.
5. **Threshold** — Sigil with unlock-burst animation, terms checkbox (links to Terms/Privacy), "Enter the Dream Realm" primary CTA. Calls `markTermsAsAccepted()` then `onComplete()`.

## Visual language

- Background: existing radial gradient + retain the current `Particles` and `ShootingStars` (already in OnboardingFlow.tsx — extract to `components/AmbientBackground.tsx`).
- Film grain overlay (SVG noise, opacity 0.015) like Lucid Engine.
- Glass cards: `bg-white/[0.03] backdrop-blur-xl border-white/[0.08]` with inner highlight and `shadow-[0_8px_32px_rgba(0,0,0,0.3)]`.
- Sigil: `LogoForFramer.png` inside a blurred primary halo with `animate-sigil-breathe` (2.5s ease-in-out scale 1↔1.04 + opacity).
- Chapter progress: labeled dots with ping animation on current, gradient connector lines that fill as you advance.
- Choreographed timings per screen (200ms / 600ms / 1200ms / 1800ms staggers) using `setTimeout` + transition classes — same pattern as Lucid Engine.

## Animations to add to `src/index.css`

```css
@keyframes onb-sigil-breathe { 0%,100%{transform:scale(1);opacity:.95} 50%{transform:scale(1.04);opacity:1} }
@keyframes onb-glow-pulse-soft { 0%,100%{opacity:.4} 50%{opacity:.7} }
@keyframes onb-draw-icon { to { stroke-dashoffset: 0; } }
@keyframes onb-particle-burst { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(0)} }
@keyframes onb-shimmer { to { background-position: 300% center; } }
@keyframes onb-film-grain { 0%{transform:translate(0,0)} 100%{transform:translate(-2%,-2%)} }
```
(Keep existing `onb-twinkle`, `onb-float`, `onb-shoot` keyframes — already defined.)

## Wiring

- `src/App.tsx` already imports `OnboardingFlow` from `./components/onboarding/OnboardingFlow` — no route change needed.
- Keep `useTermsAcceptance().markTermsAsAccepted()` call on final CTA.
- Keep swipe-left/swipe-right gesture from current file.
- Preserve `onComplete()` callback contract — `useOnboarding.completeOnboarding` still fires and persists `hasSeenOnboarding`.

## Out of scope

- No backend changes, no profile-data collection (Lucid Repo doesn't need film style / aspect ratio defaults).
- No changes to `useOnboarding`, `useTermsAcceptance`, or `App.tsx` routing.
- Native iOS onboarding plugin untouched.
