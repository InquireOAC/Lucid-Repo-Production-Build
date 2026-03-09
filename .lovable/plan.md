

## Fix: Scroll-to-top not working on Lucid Repo and Profile pages

### Root Cause
The outer container in `MainLayout.tsx` uses `min-h-screen` which allows it to grow beyond the viewport. When child pages also use `min-h-screen`, the document itself scrolls rather than the inner `scrollRef` div. This means `scrollRef.current.scrollTo(0, 0)` has no effect because that div isn't the one actually scrolling --- the browser window/body is.

The `window.scrollTo(0, 0)` fallback likely fires before the content renders (due to React's async rendering), so it also fails.

### Solution
Two changes to `MainLayout.tsx`:

1. **Lock the outer container** to exactly viewport height with `h-screen overflow-hidden` instead of `min-h-screen`. This forces all scrolling into the inner `scrollRef` div, making `scrollRef.current.scrollTo(0, 0)` the single source of truth for scroll position.

2. **Keep the window/document scroll resets** as additional safety nets.

```text
┌─ outer div: h-screen + overflow-hidden ──────┐
│  ┌─ scrollRef div: flex-1 overflow-y-auto ──┐ │
│  │  <Outlet /> (all page content)            │ │
│  │  (this is the ONLY thing that scrolls)    │ │
│  └───────────────────────────────────────────┘ │
│  ┌─ fixed tab bar ──────────────────────────┐ │
│  └───────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### File Changes

**`src/layouts/MainLayout.tsx`** (line 36):
- Change `min-h-screen` to `h-screen overflow-hidden` on the root container div.

This is a one-line class change that fixes the core issue for all pages at once.

