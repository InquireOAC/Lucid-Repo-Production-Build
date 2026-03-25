

## Fix: Technique Detail Page Back Button 404

The back button on `TechniqueDetailPage.tsx` navigates to `/explore`, a route that no longer exists. Change it to navigate to `/` (Home).

### Change

**`src/components/insights/TechniqueDetailPage.tsx` line 49**
- Change `navigate("/explore")` → `navigate("/")`

Single one-line fix.

