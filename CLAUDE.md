# CLAUDE.md — AI Assistant Guide for Lucid Repo Production Build

## Project Overview

**Lucid Repo** is a full-stack AI-powered dream journal application. Users can record, analyze, and share dreams, generate AI images and videos from dream content, learn lucid dreaming techniques, and track progress with achievements and statistics.

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions on Deno)
- **Mobile**: Capacitor 6 (iOS native bindings)
- **Deployment**: Lovable platform (auto-deploys on push to master)
- **Supabase Project ID**: `oelghoaiuvjhywlzldkt`

---

## Repository Structure

```
/
├── src/
│   ├── components/         # UI components organized by feature
│   │   ├── ui/             # shadcn/ui base primitives (DO NOT edit manually)
│   │   ├── journal/        # Dream journaling components
│   │   ├── profile/        # User profile components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── insights/       # Learning & lucid dreaming components
│   │   ├── lucid-repo/     # Public dream repository components
│   │   └── ...             # Other feature-specific subdirectories
│   ├── pages/              # Route-level page components
│   ├── hooks/              # Custom React hooks (80+)
│   ├── contexts/           # React Context providers
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript interfaces and types
│   ├── lib/                # Utility functions
│   ├── layouts/            # Layout wrappers
│   ├── integrations/       # Third-party integration helpers
│   │   └── supabase/       # Supabase client, types, hooks
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── functions/          # Deno edge functions (23 serverless APIs)
│   └── migrations/         # PostgreSQL migration files
├── public/                 # Static assets
├── ios/                    # Capacitor iOS native project
└── Configuration files     # vite.config.ts, tailwind.config.ts, tsconfig.json, etc.
```

---

## Development Setup

### Prerequisites

- Node.js (use bun as the package manager — `bun.lock` is present)
- Bun: `npm install -g bun`

### Install & Run

```bash
bun install           # Install dependencies
bun run dev           # Start dev server on http://localhost:8080
bun run build         # Production build → /dist
bun run lint          # Run ESLint
bun run preview       # Preview production build
```

### Mobile Development

```bash
bun run ios:dev       # Build + sync + open iOS simulator (requires Xcode)
bun run android:dev   # Build + sync + open Android emulator
```

### Environment Variables

Required in `.env` (Vite-prefixed for client exposure):

```
VITE_SUPABASE_URL=https://oelghoaiuvjhywlzldkt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
VITE_SUPABASE_PROJECT_ID=oelghoaiuvjhywlzldkt
```

---

## Architecture & Key Patterns

### Provider Stack (App.tsx)

```
QueryClientProvider
  → AuthProvider
    → SubscriptionProvider
      → ThemeProvider (dark mode default)
        → ColorSchemeProvider
          → BrowserRouter
            → MainLayout + Routes
```

### State Management

| Layer | Tool | Use Case |
|-------|------|----------|
| Server state | TanStack React Query | Supabase queries, caching |
| Global client state | Zustand (`dreamStore.ts`) | Dream entries, tags |
| Auth/Subscription state | React Context | Auth user, subscription plan |
| Theming | React Context | Color scheme, dark/light mode |
| Local persistence | localStorage | Dream drafts, onboarding flags |

### Data Fetching

- **Always use React Query** for Supabase reads. Use `useQuery` for fetches, `useMutation` for writes.
- The Supabase client is at `src/integrations/supabase/client.ts`.
- Never call Supabase directly in page components — wrap in a custom hook under `src/hooks/`.

### Routing

Defined in `App.tsx`. Uses `BrowserRouter` (with hash preservation in `main.tsx` for HMR). Key routes:

| Path | Component |
|------|-----------|
| `/journal` | Dream journal list |
| `/journal/new` | New dream entry |
| `/journal/edit/:dreamId` | Edit dream |
| `/lucid-repo` | Public dream feed |
| `/profile/:userId` | User profile |
| `/chat` | AI dream chat |
| `/insights` | Lucid dreaming insights |
| `/learn` | Educational content |
| `/lucid-stats` | Statistics dashboard |
| `/admin` | Admin dashboard |
| `/auth` | Login/signup |

---

## Naming & Code Conventions

### File & Component Naming

- **Components**: PascalCase, file name matches component name (`DreamEntryForm.tsx`)
- **Hooks**: camelCase with `use` prefix (`useDreamJournal.ts`)
- **Utilities/lib**: camelCase (`imageUtils.ts`, `formatDate.ts`)
- **Types**: PascalCase interfaces in `src/types/`
- **Context files**: `*Context.tsx` pattern

### Component Rules

- **Functional components only** — no class components
- All components use hooks for logic
- Complex logic is extracted into custom hooks in `src/hooks/`
- Keep page components thin — delegate to feature components and hooks
- Use `useCallback` and `useMemo` for expensive operations or stable references passed as props

### TypeScript

- Strict mode is **disabled** (`noImplicitAny: false`), but type interfaces should still be used
- Define new types in `src/types/` or co-locate with the component if single-use
- Use Supabase-generated types from `src/integrations/supabase/types.ts` for DB shapes

### Styling

- **Tailwind CSS only** — no custom CSS files unless absolutely unavoidable
- Use the custom color tokens defined in `tailwind.config.ts`:
  - `cosmic-*`, `aurora-*`, `dream-*`, `oniri-*` palettes
  - Prefer theme-aware classes over hardcoded colors
- Dark mode is the default; always verify light mode appearance
- Mobile-first; use `sm:`, `md:`, `lg:` breakpoints
- For iOS safe areas use `pt-safe-top`, `pb-safe-bottom` classes

### UI Components

- Use **shadcn/ui** components from `src/components/ui/` for all base elements (Button, Dialog, Input, etc.)
- Do NOT manually edit files in `src/components/ui/` — these are managed by shadcn CLI
- Import from `@/components/ui/<component>`
- Use **Lucide React** for icons (`import { IconName } from 'lucide-react'`)
- Use **Sonner** (`toast`) for all user-facing notifications — import from `sonner`

### Forms

- Use **React Hook Form** + **Zod** for all forms
- Define Zod schema first, derive TypeScript type with `z.infer<>`
- Use `useForm` with `zodResolver`

---

## Supabase Edge Functions

Located in `supabase/functions/`. Each function is a Deno TypeScript module.

### Key Functions

| Function | Auth Required | Purpose |
|----------|:---:|---------|
| `analyze-dream` | No | OpenAI dream analysis |
| `generate-dream-image` | Yes | DALL-E/Vertex image generation |
| `dream-chat` | Yes | OpenAI chat completions |
| `analyze-dream-symbols` | Yes | Symbol extraction |
| `compose-cinematic-prompt` | No | Cinematic prompt composition for images |
| `compose-animation-prompt` | Yes | Animation prompt generation |
| `generate-dream-video` | Yes | Video generation |
| `split-dream-sections` | No | Text sectioning |
| `voice-to-text` | Yes | Speech-to-text |
| `create-checkout-session` | Yes | Stripe checkout |
| `stripe-webhook` | No | Stripe event handling |
| `revenuecat-webhook` | No | Mobile subscription events |
| `sync-revenuecat-subscription` | Yes | Mobile sub sync |
| `generate-dream-insight` | Yes | AI-powered insights |

### Calling Edge Functions from Client

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: value },
});
```

### Writing/Modifying Edge Functions

- Runtime is **Deno** — use Deno import syntax (`import { serve } from "https://deno.land/std/..."`)
- Handle CORS: use the shared CORS headers pattern already present in existing functions
- Always validate JWT when `auth required` (check existing functions for the pattern)
- Use `Deno.env.get('KEY')` for secrets; secrets are set in the Supabase dashboard

---

## Database

### Key Tables

| Table | Purpose |
|-------|---------|
| `dream_entries` | User dream records (content, images, audio, lucidity level, symbols) |
| `profiles` | Extended user profiles |
| `dream_insights` | AI-generated insights per user |
| `lucid_achievement_definitions` | Achievement definitions |
| `lucid_user_achievements` | User achievement tracking |
| `stripe_subscriptions` | Web subscription state |
| `stripe_customers` | Stripe customer mapping |
| `user_roles` | Admin/user role assignments |

### RLS

Row Level Security is enabled on most tables. When writing new queries:
- Authenticated users can only access their own data by default
- Admin operations require `user_roles` check
- Public dream repo content has explicit public read policies

### Migrations

New migrations go in `supabase/migrations/` with timestamp prefix: `YYYYMMDDHHMMSS_description.sql`

### Database Functions

- `get_lucid_stats()` — consolidated dream statistics
- `increment_subscription_usage()` — credit tracking for AI features

---

## Subscription & Feature Gating

Features are gated behind subscription plans. The `SubscriptionProvider` context exposes:

```typescript
const { isSubscribed, usageCount, maxUsage } = useSubscription();
```

- AI image generation, video, and chat features check subscription before calling edge functions
- Mobile subscriptions managed via **RevenueCat**; web via **Stripe**
- Usage increments tracked in `stripe_subscriptions.usage_count`

---

## Mobile (Capacitor)

- App ID: `app.dreamweaver.LucidRepo`
- Web assets served from `dist/` directory
- Platform detection: `Capacitor.isNativePlatform()`
- Native plugins used: local-notifications, filesystem, keyboard, preferences, share, splash-screen, status-bar

When adding native features:
1. Install the Capacitor plugin: `bun add @capacitor/plugin-name`
2. Sync native projects: `npx cap sync`
3. Wrap calls in `isNativePlatform()` check for web fallback

---

## Theming

Four color themes defined in `tailwind.config.ts` and managed by `ColorSchemeContext`:

- **Cosmic** (default) — deep purples and blues
- **Aurora** — greens and teals
- **Dream** — pinks and magentas
- **Oniri** — warm ambers and golds

Custom animations available: `glow`, `shimmer`, `fade-in-up`, `gradient-shift`

---

## Testing

**No test suite is currently configured.** If adding tests:
- Use **Vitest** (compatible with Vite) + **React Testing Library**
- Place test files alongside components as `*.test.tsx`

---

## Linting & Code Quality

```bash
bun run lint    # ESLint with TypeScript + React hooks rules
```

- ESLint config: `eslint.config.js`
- Rules: `@typescript-eslint` + `react-hooks` + `react-refresh`
- Fix lint errors before committing

---

## Git Workflow

- Main production branch: **`master`**
- Deployment is automatic on push to `master` via the Lovable platform
- Feature branches follow pattern: `feature/description` or `claude/description`
- Use clear, descriptive commit messages

---

## Common Pitfalls

1. **Do not edit `src/components/ui/`** — managed by shadcn CLI
2. **Do not commit `.env`** — it contains secret keys
3. **Always handle Supabase errors** — check `error` from every Supabase call
4. **Mobile safe areas** — use `pt-safe-top` / `pb-safe-bottom` for full-screen layouts
5. **Dark mode first** — the default theme is dark; test both modes when changing UI
6. **`bun` not `npm`** — use `bun` for all package management commands
7. **Edge functions use Deno** — not Node.js; avoid Node-specific APIs in edge functions
8. **RLS is enforced** — raw Supabase admin queries will be blocked unless using service role key (only in edge functions)
