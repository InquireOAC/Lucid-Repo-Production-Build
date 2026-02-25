

# Color Scheme Customization

## Overview
Add a color scheme picker to Settings that lets users personalize their app's accent colors. All users get access to a few base themes, while subscribers unlock premium/expanded themes. The selected scheme is stored in their profile and applied globally via CSS custom properties.

## How It Works

The app already uses CSS custom properties (`--primary`, `--aurora-purple`, etc.) for all colors. A new provider will override these variables at runtime based on the user's chosen scheme, making every button, glow, gradient, and card reflect their choice instantly.

## Color Schemes Available

| Scheme | Primary Hue | Who Gets It |
|--------|------------|-------------|
| Aurora Blue (default) | Blue 217 | Everyone |
| Cosmic Violet | Purple 263 | Everyone |
| Emerald Dream | Green 160 | Subscribers |
| Rose Quartz | Pink 340 | Subscribers |
| Solar Gold | Amber 38 | Subscribers |
| Midnight Teal | Teal 180 | Subscribers |

## New Files

### 1. `src/data/colorSchemes.ts`
Defines the available schemes as an array of objects, each containing:
- `id`, `name`, `description`
- `requiresSubscription: boolean`
- CSS variable overrides for both light and dark modes (`--primary`, `--ring`, `--aurora-purple`, `--glow-purple`, etc.)
- A `previewColor` hex value for the picker UI

### 2. `src/contexts/ColorSchemeContext.tsx`
A React context provider that:
- Reads the user's `color_scheme` preference from their profile
- Falls back to `"aurora-blue"` (default)
- Applies the chosen scheme's CSS variable overrides to `document.documentElement.style`
- Cleans up overrides on scheme change
- Exposes `{ currentScheme, setColorScheme, availableSchemes }` to consumers

### 3. `src/components/profile/ColorSchemeDialog.tsx`
A settings sub-dialog with:
- A grid of color scheme preview circles (showing `previewColor`)
- Scheme name and description below each
- A lock icon + "Premium" badge on subscriber-only schemes
- Tapping a free scheme applies it immediately
- Tapping a locked scheme shows a toast nudging to subscribe
- Saves selection to the `profiles` table

## Modified Files

### 4. `src/components/profile/SettingsDialog.tsx`
- Add a new "Appearance" section between "Profile" and "Notifications"
- Add a `Palette` icon button labeled "Color Scheme" that opens `ColorSchemeDialog`
- Add state: `const [showColorScheme, setShowColorScheme] = useState(false)`

### 5. `src/App.tsx`
- Wrap the app with `<ColorSchemeProvider>` inside `AuthProvider` and `SubscriptionProvider` so it has access to user and subscription state

### 6. Database: `profiles` table
- Add a new column `color_scheme` (text, nullable, default null) to store the user's chosen scheme ID
- No migration needed for RLS since existing update policies already cover owner-only updates

## Technical Details

### CSS Variable Override Strategy
The provider sets variables directly on the root element:
```typescript
const applyScheme = (scheme: ColorScheme) => {
  const root = document.documentElement;
  const vars = isDark ? scheme.darkVars : scheme.lightVars;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
```

On cleanup or scheme change, previously set properties are removed first to fall back to the CSS defaults.

### Subscription Gating
The `ColorSchemeDialog` imports `useSubscriptionContext()` to check if the user has an active subscription. Free schemes are always selectable; premium ones show a lock overlay and redirect to the subscription dialog on tap.

### Profile Persistence
On scheme selection, the dialog calls:
```typescript
await supabase.from("profiles")
  .update({ color_scheme: schemeId })
  .eq("id", user.id);
```

The `ColorSchemeContext` listens to auth state and fetches the user's `color_scheme` from their profile on mount.

