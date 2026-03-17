

# Upgrade Dream Book to React Three Fiber

## Overview
Replace the current CSS-based 3D book viewer with a proper Three.js 3D book using `@react-three/fiber@^8.18` and `@react-three/drei@^9.122.0`. The book will be a 3D mesh with textured pages that flip with realistic animations, lighting, and shadows.

## Dependencies
- `three@>=0.133`
- `@react-three/fiber@^8.18` (React 18 compatible)
- `@react-three/drei@^9.122.0`

## Architecture

Replace `DreamBook3DViewer.tsx` entirely. Add a helper to render React page content to canvas textures.

```text
src/components/dream-book/
├── DreamBook3DViewer.tsx      ← rewrite (R3F Canvas + Book mesh)
├── Book3DScene.tsx            ← new (scene: lights, camera, book)
├── BookPage3D.tsx             ← new (single page mesh with flip animation)
├── usePageTextures.ts         ← new (render page content to canvas textures)
```

## Implementation

### 1. Install dependencies
Add `three`, `@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0`.

### 2. `usePageTextures.ts`
- For each page (cover, TOC, dream spreads), render a hidden HTML element to an offscreen canvas using `html-to-image` (already installed) or `html2canvas` (already installed)
- Cache textures as `THREE.CanvasTexture` objects
- Return array of textures keyed by page index
- Regenerate when dreams data changes

### 3. `BookPage3D.tsx`
- A `<mesh>` component representing a single page (thin box or plane geometry)
- Props: `frontTexture`, `backTexture`, `isFlipped`, `pageIndex`, `flipProgress`
- Uses `useSpring` from drei or manual `useFrame` lerp for smooth rotation around the spine (left edge pivot)
- Geometry: `PlaneGeometry` with slight curve using vertex displacement for realism
- Double-sided with front/back textures mapped to respective faces

### 4. `Book3DScene.tsx`
- Sets up the scene inside R3F `<Canvas>`
- Ambient light + soft directional light for premium shadow/glow
- `<OrbitControls>` from drei — constrained to slight rotation (not full orbit), allows user to tilt the book
- Book cover as a slightly thicker mesh with leather-like material
- Spine mesh connecting pages
- Ground shadow / contact shadow from drei
- Camera positioned at a comfortable reading angle

### 5. `DreamBook3DViewer.tsx` (rewrite)
- Wraps everything in `<Canvas>` from R3F
- Passes `currentPage`, `onPageChange`, `dreams`, `authorName` into the scene
- Swipe/drag on the canvas triggers page flip (pointer events → `onPageChange`)
- Fallback: if WebGL unavailable, show the old CSS-based viewer

### 6. Page rendering flow
1. Existing React components (`DreamBookCover`, `DreamBookPageSpread`, `DreamBookTableOfContents`) render into hidden DOM elements
2. `html2canvas` captures each to a canvas
3. Canvases become `THREE.CanvasTexture` applied to page meshes
4. When `currentPage` changes, the corresponding `BookPage3D` animates its `rotateY` from 0 to -PI (flip left)

## What stays the same
- `DreamBook.tsx` page — no changes, same props to viewer
- `DreamBookReader.tsx` — untouched
- `DreamBookControls.tsx` — untouched, still drives `currentPage`
- All filter/export logic — untouched
- `DreamBookCover`, `DreamBookPageSpread`, `DreamBookTableOfContents` — kept as-is, reused for texture generation

## Files

| File | Action |
|------|--------|
| `package.json` | Add three, @react-three/fiber, @react-three/drei |
| `src/components/dream-book/DreamBook3DViewer.tsx` | Rewrite |
| `src/components/dream-book/Book3DScene.tsx` | Create |
| `src/components/dream-book/BookPage3D.tsx` | Create |
| `src/components/dream-book/usePageTextures.ts` | Create |

