# Lucid Repo — Codebase Review, Weak Points & UI/UX Upgrade

> Produced from a full read-only exploration of every subsystem, with the
> highest-impact findings re-verified by hand against source. Items marked ✅
> were independently confirmed in the code; items flagged as *overstated* were
> downgraded after verification so this review does not exaggerate risk.

## What the app is

Lucid Repo (package `dreamweaver-ai-journal`) is a React 18 + Vite + TypeScript + Capacitor
(iOS/Android) app backed by Supabase (Postgres + Deno edge functions), with RevenueCat (native)
and Stripe (web) for monetization. Its purpose: record a dream as text, then progressively turn it
into media — **dream story → AI images (scenes) → short AI video clips → an assembled ~30s
cinematic short** — with **social features** (public feed, profiles, follows, likes, comments,
messaging, a Netflix-style "Lucid Repo" discovery surface) on top. The strategic endgame is a
hand-off to **Lucid Engine**, the owner's separate AI-native filmmaking platform. Design tokens,
fonts, and several utilities are already branded as a shared "Lucid Engine Cinematic System."

## How the core pipelines work (verified)

- **Story layer** — edge functions via the **Lovable AI gateway** (`google/gemini-2.5-flash`):
  `analyze-dream`, `analyze-dream-symbols`, `extract-dream-characters`, `split-dream-sections`;
  character photos → `analyze-character-image` (visual fingerprint).
- **Image pipeline** — `DreamImageGenerator` → `generate-dream-image` → `fal-nano-banana.ts`
  (FAL `nano-banana-2`, 9:16, persisted to `dream-images` bucket).
- **Cinematic pipeline** — `useDreamCinematic.run()` → `compile-dream-cinematic` (LLM compiles a
  fixed 2×15s = 30s spec with continuity "locks") → `assemble-cinematic-dream` (2 key frames, then
  `Promise.all` of 2× Seedance 15s clips + 2× ElevenLabs narrations) → **client-side**
  `cinematicAssembler.ts` stitches via `canvas.captureStream()` + `MediaRecorder` → uploaded to
  `dream-videos`, saved on `dream_entries.video_url`.
- **Social** — `dream_entries.is_public` feeds `useDiscoveryDreams` / `useFeedPublicDreams`, plus
  likes/comments/follows/messaging/notifications and the `repos/netflix/*` discovery components.
- **Lucid Engine hand-off** — `dream-to-project.ts` → `exportDreamToSharedDb()` upserts into a shared
  `projects` table; `OpenInLucidEngine` opens `lucidengine.app/studio/{id}`.

## Findings (severity-rated; ✅ = verified in source)

### Critical
1. **✅ Image generation is not metered/gated server-side.** `generate-dream-image` checked auth
   only, then called paid FAL directly — the endpoint is directly callable by any authenticated
   (even free) user → unbounded paid generation. (Inconsistent with the video/cinematic paths, which
   *do* gate server-side.) **Fixed in Phase 1.**
2. **✅ Lucid Engine export targets a table that doesn't exist here.** `exportDreamToSharedDb()`
   writes to `projects`, but there is no `projects` migration and no `projects` entry in generated
   `types.ts`. The write fails and silently falls back to a deep link — the data hand-off is
   aspirational. If the table is later added without RLS, any user could read/write any project.
3. **Cinematic generation is one long synchronous edge call** (`Promise.all` of 2× Seedance + 2×
   TTS; FAL polled up to ~7.5 min) with no job queue, idempotency, per-beat rollback, or client
   resume — risks edge timeouts and loses in-flight jobs on mobile backgrounding; money spent with no
   durable request record.
4. **✅ Dual comment tables / dual code paths.** `comments` and `dream_comments` both exist;
   `useDreamComments.tsx` uses `comments` while `DreamComments.tsx` uses `dream_comments`, and counts
   are hand-maintained client-side. Comments on one path are invisible on the other.

### High
5. **Moderation/blocking is client-side only** — blocked users' content still returns from the DB;
   `content_flags` lacks an admin-only SELECT restriction; flag emails go to one hardcoded address.
   (App-Store UGC compliance needs server-side enforcement.)
6. **Feed/discovery N+1 queries and no pagination** (`useFeedPublicDreams`, `useDiscoveryDreams`,
   profile lists, conversations).
7. **Like/credit/trial race conditions** — like toggle is read-modify-write; trial insert isn't an
   idempotent upsert; chat trial limit is client-`useRef` only.
8. **Fragile subscription source-of-truth** — Stripe + RevenueCat in parallel; sync cancels-then-
   inserts (desync window) and guesses period dates; RevenueCat webhook trusts `app_user_id`
   unvalidated; gating uses a hardcoded price-id allowlist while the rich `video-models.ts` tier/
   credit model is defined but **unused**.
9. **Prompt-injection exposure** — raw dream text is interpolated into LLM prompts without
   delimiting/escaping (`split-dream-sections`, `compile-dream-cinematic`, `dream-chat`).
10. **No global error boundary** — a render error in any lazy route white-screens the app.

### Medium
11. **✅ Image-upload utility sprawl** — 5+ overlapping hooks/utils with inconsistent retry; FAL/
    OpenAI ephemeral-URL expiry not consistently persisted.
12. **Dead/duplicate code** — `src/useDreamJournal.tsx` (unused twin), superseded `JournalHeader`/
    `DailyQuote`/`DreamsList`, and a now-shipped `design.md`.
13. **`DreamEntry` duplicated casings** (`image_url`/`generatedImage`, `image_prompt`/`imagePrompt`)
    with no normalizer.
14. **Env var name mismatch** — `client.ts` reads `VITE_SUPABASE_ANON_KEY` but `.env` sets
    `VITE_SUPABASE_PUBLISHABLE_KEY` → relies on a hardcoded fallback (the anon key is safe to expose;
    the issue is the brittle fallback + drift). `VITE_LUCID_ENGINE_URL` is undefined.
15. **Notification/reading-history read-state in `localStorage`** — not synced across devices.
16. **Character visual fingerprint computed but not wired into image prompts** — weaker likeness
    consistency than intended.

### Low / calibration
17. `dream_entries` **does** have RLS (admin + owner/public policies exist — the automated "no RLS"
    flag was *overstated*); a formal policy/test audit is still warranted for storage buckets and
    newer tables (`projects`, `blocked_users`, `content_flags`).
18. Raw AI error messages surfaced/stored; section images silently hidden once a cinematic exists;
    `analyze-dream`'s 15k-char cap can truncate silently.

## UI/UX upgrade proposal

The "cinematic / Netflix-for-your-dreams" redesign in `design.md` is **~70% already shipped** — Home
and Journal use hero + poster rails + FAB + sticky frosted header + category pills, and tokens were
rewritten to the Lucid Engine system (primary = Lucid Engine **blue**, dark-only, glassmorphism,
aurora/Ken-Burns motion). So `design.md` describes the past; the upgrade pushes **beyond** it:

- **A. Finish + unify the cinematic shell** — drop Home's "Lucid Techniques" grid, add the missing
  "Your Cinematic Dreams" rail, unify `HomeHeroCarousel`/`JournalHeroPoster` onto one hero, and
  **consolidate the 6+ DreamCard variants** into one `variant`-driven component (biggest
  maintainability win). Apply the typography scale and unify pill styles.
- **B. Elevate the creation flow** — make image → video → cinematic a guided, resumable "production"
  pipeline with per-beat status, ETA, and a "keeps running if you leave" affordance; add a
  pre-generation credit/entitlement preview.
- **C. Accessibility & resilience** — `prefers-reduced-motion` guards, visible `:focus-visible`
  rings, reconsider the global `user-select:none`, real error/loading-skeleton states, and a
  route-level error boundary.
- **D. Social/discovery UX** — feed skeletons + error/retry, share-card preview, comment send/error
  states on a single comment data path.

## Execution roadmap

- **Phase 0** — this document.
- **Phase 1 (critical):** server-side gating/metering on `generate-dream-image` (+ sweep paid edge
  fns); unify the comment table/path + count trigger; route-level error boundary; env-var fixes;
  Lucid Engine `projects` strategy (migration + RLS, or a documented link contract).
- **Phase 2 (pipeline robustness):** async/resumable cinematic job model (persisted status, FAL
  request IDs, idempotency, per-beat retry/rollback, client polling); consolidate image-upload
  utilities; wire character fingerprint into prompts.
- **Phase 3 (social/scale & moderation):** server-side blocking/flagging via RLS + triggers;
  aggregate queries; pagination; server-side notification read-state; atomic like/trial; delimit
  user text in LLM prompts.
- **Phase 4 (UI/UX upgrade):** sections A–D above.

## Verification

- **Image gating:** with a free-tier JWT, call `generate-dream-image` directly → 402 once the free
  image is used / over the monthly limit; credit consumed exactly once; refunded on render failure.
- **Comments:** post via both UI entry points → appears in both; `comment_count` matches `count(*)`
  on the single canonical table.
- **Cinematic resilience:** background the app mid-render, reopen → status resumes, final video lands;
  a single forced beat failure retries that beat only.
- **Moderation:** block user B as A, query feed/discovery/comments directly as A → B absent
  (RLS-enforced, not just hidden).
- **UI/UX:** `prefers-reduced-motion` disables animations; Tab shows focus rings; feed/gen errors
  render a retry card; one `DreamCard` renders across Home/Journal/Discovery/Profile.
- `npm run lint` + `npm run build` green after each phase.
