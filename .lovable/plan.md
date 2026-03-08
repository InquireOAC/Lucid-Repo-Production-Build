
## Fix: Pages not scrolling to top on navigation

### Problem
When navigating between pages (tabs or other links), the new page opens at the same scroll position as the previous page. This happens because the scrollable container retains its scroll position across route changes in the Single Page Application, making the experience confusing.

### Solution
We need to automatically scroll the main content container to the top whenever the route changes. Since the scrolling happens inside a specific `div` in the `MainLayout` rather than on the `window` itself, we need to attach a reference to that container and reset its scroll position when the path changes.

### Changes
1. **Update `src/layouts/MainLayout.tsx`**:
   - Create a `useRef` for the main scrollable container.
   - Add a `useEffect` that listens to `location.pathname` changes.
   - When the path changes, call `.scrollTo(0, 0)` on the container reference to instantly jump to the top of the new page.

This will ensure that every time you navigate to a new tab or page, you start exactly at the top.
