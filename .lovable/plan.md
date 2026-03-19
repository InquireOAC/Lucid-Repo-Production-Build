

# Revamp Onboarding — Complete Cinematic Experience (6 Screens)

## Development Mode
- Hardcode `hasSeenOnboarding = false` in `useOnboarding.tsx` with `// DEV: force onboarding` comment
- Render `OnboardingFlow` in `App.tsx` above the router, gated by `useOnboarding`

## 6 Screens

1. **"Enter the Dream Realm"** — Cosmic gradient background (purple → blue → black), floating particle stars, app logo with pulsing glow ring, tagline: *"Your dreams hold secrets. It's time to decode them."*

2. **"Capture Every Dream"** — Moon icon with orbital ring animation, wisps of gradient blur drifting across. *"Record your dreams the moment you wake. Voice, text, or sketch — never lose a dream again."*

3. **"AI-Powered Insights"** — Brain/Sparkles icon with constellation dots animation. *"Unlock hidden patterns. Our AI reveals the symbols, emotions, and meanings within your dreams."*

4. **"See Your Dreams Come Alive"** — Sparkles + Film icons with pulsing glow, film-frame border motif. *"Transform your dreams into stunning AI-generated artwork and cinematic videos. Watch your subconscious unfold before your eyes."*

5. **"Join the Dream Community"** — Globe/network icon with pulsing connection nodes, ripple effect. *"Share dreams, discover connections, and explore the collective unconscious with dreamers worldwide."*

6. **"Your Journey Begins"** — Visual elements converge into a portal/gateway animation. *"Step through the gateway. Thousands of dreamers are already inside."* CTA: "Enter the Dream Realm" with glow effect.

## Navigation
- Dot indicators, swipe support via touch events, "Skip" in top-right
- "Next" on screens 1-5, "Enter the Dream Realm" on screen 6

## Technical Approach
- All visuals code-driven: CSS keyframes + Framer Motion (`AnimatePresence` for transitions)
- Particles: array of absolutely-positioned divs with randomized animation delays
- Lucide icons for all screen iconography
- Dark theme forced throughout

## Files

| File | Change |
|------|--------|
| `src/components/onboarding/OnboardingFlow.tsx` | Complete rewrite — 6 animated screens with particles, gradients, swipe, dot nav, skip |
| `src/hooks/useOnboarding.tsx` | Add DEV override to force-show onboarding |
| `src/App.tsx` | Render `OnboardingFlow` gated by `useOnboarding` above router |

