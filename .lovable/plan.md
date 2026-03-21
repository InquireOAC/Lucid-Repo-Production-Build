

## Fix: Video Not Filling Share Card Preview

### Problem
In the animated share card preview, videos show black bars (visible at top in screenshot) instead of filling the entire 9:16 container like images do. Both should use cover-fit to fill the space.

### Root Cause
The `<video>` element likely needs `display: 'block'` to prevent inline element spacing issues, and may benefit from explicit sizing to ensure the browser renders it as a full cover element.

### Fix — `src/components/share/ShareButton.tsx` (line ~178-186)

Add `display: 'block'` to the video style to match image rendering behavior:

```tsx
<video
  key={current.url}
  src={current.url}
  autoPlay
  muted
  playsInline
  loop
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  }}
/>
```

Also add `display: 'block'` to the image element for consistency (line ~188-193).

One file, two lines added.

