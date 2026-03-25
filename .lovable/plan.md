

## Plan: Implement Dream Academy Learning System (MVP)

This is a large feature. The spec describes a full gamified learning system with 5 tiers, 15 modules, lesson UX flows (Learn > Practice > Log > Quiz), badges, weekly challenges, leaderboard, and more. The existing codebase has a partial learning system (learning_paths, path_levels, learning_progress tables exist) with a "Coming Soon" dialog on the Learn page.

We'll implement this in phases. **This plan covers Phase 1: Core Academy MVP** — the foundation that makes the learning page functional and engaging.

---

### What Gets Built

**1. Home Page — Academy Entry Card**
- Add a "Dream Academy" card on the Home page between Quick Links and Today's Repo Activity
- Shows user's current tier name + badge, XP progress bar to next tier, and current module
- Tappable — routes to `/learn`

**2. New Database Schema (Migration)**
- Create tables from the spec: `academy_modules`, `academy_lessons`, `academy_user_progress`, `academy_user_lesson_progress`, `academy_user_module_progress`, `academy_badges`, `academy_user_badges`, `academy_xp_transactions`, `academy_weekly_challenges`, `academy_user_challenge_progress`
- Seed the 9 lucid dreaming modules with lesson content (cards, practice tasks, quiz questions)
- Seed the badge definitions
- RLS policies per spec

**3. Redesigned Learn Page — Academy Home**
- Remove "Coming Soon" dialog
- XP/Tier progress hero card with tier name (Sleeper → Astral Architect), XP bar, streak widget
- Active weekly challenge card (if any)
- Module list (skill tree) with progress bars, lock icons for tier-gated modules, prerequisite indicators
- Lucid Dreaming track shown first; AP track shown locked at bottom

**4. Module Detail Screen**
- Module header: title, description, tier requirement, prerequisite status
- Numbered lesson list with completion status icons (not started / in progress / completed)
- Module completion badge preview

**5. Lesson UX Flow (4-Step: Learn > Practice > Log > Quiz)**
- **Learn Step**: Swipeable card stack with progress dots, max 80 words per card, "Start Practice" CTA on final card
- **Practice Step**: Numbered task checklist, "I've completed my practice" CTA
- **Log Step**: Shows most recent dream journal entry (or prompt to log one), placeholder for AI analysis text, stats row
- **Quiz Step**: Multiple choice (A-D), one question at a time, check answer reveal with green/red, results screen with score + XP earned, 80% pass threshold, retry without extra XP

**6. XP & Tier System**
- Hook `useAcademyProgress` to manage user progress (total XP, tier, streak)
- XP earning actions: lesson complete (+15), quiz pass (+50), module complete (+100), streak bonus (+5 × multiplier)
- Streak multiplier tiers: 1-6 days = 1x, 7-13 = 1.5x, 14-29 = 2x, 30+ = 3x
- Tier auto-promotion when XP thresholds crossed

**7. Badge System**
- Award badges on milestone completion (first dream, 7-day streak, module completions, tier promotions)
- Toast notification when badge earned
- Viewable on Academy home

---

### Files Created/Modified

| File | Action |
|------|--------|
| `supabase/migrations/[new]_academy_schema.sql` | Create all Academy tables, seed modules + lessons + badges |
| `src/hooks/useAcademyProgress.ts` | New — user progress, XP, tier, streak |
| `src/hooks/useAcademyModules.ts` | New — fetch modules with user progress |
| `src/hooks/useAcademyLesson.ts` | New — lesson data + 4-step flow state |
| `src/hooks/useAcademyBadges.ts` | New — badge tracking |
| `src/hooks/useAcademyXP.ts` | New — XP awarding with multiplier logic |
| `src/components/academy/AcademyHeroCard.tsx` | New — tier/XP progress hero |
| `src/components/academy/ModuleList.tsx` | New — skill tree module list |
| `src/components/academy/ModuleDetail.tsx` | New — module detail with lesson list |
| `src/components/academy/LessonFlow.tsx` | New — 4-step lesson container |
| `src/components/academy/LearnStep.tsx` | New — swipeable card stack |
| `src/components/academy/PracticeStep.tsx` | New — task checklist |
| `src/components/academy/LogStep.tsx` | New — dream journal review |
| `src/components/academy/QuizStep.tsx` | New — multiple choice quiz |
| `src/components/academy/LessonComplete.tsx` | New — completion screen with XP breakdown |
| `src/components/academy/WeeklyChallengeCard.tsx` | New — active challenge display |
| `src/components/academy/BadgeShowcase.tsx` | New — earned badges grid |
| `src/components/academy/TierBadge.tsx` | New — tier icon/name display |
| `src/pages/Learn.tsx` | Rewrite — full Academy home |
| `src/pages/Home.tsx` | Add Academy entry card |

### Technical Detail

**Tier Thresholds:**
```
Tier 1 (Sleeper): 0 XP
Tier 2 (Dreamer): 500 XP  
Tier 3 (Lucid Explorer): 1,500 XP
Tier 4 (Oneironaut): 4,000 XP
Tier 5 (Astral Architect): 10,000 XP
```

**Module Seed Data (9 LD modules):**
Dream Recall Training (T1, 5 lessons), Reality Testing (T1, 4 lessons), Dream Signs (T2, 4 lessons), MILD (T2, 6 lessons), WBTB (T3, 5 lessons), WILD (T3, 7 lessons), Dream Stabilization (T3, 5 lessons), Dream Control (T4, 8 lessons), Dream Incubation (T4, 5 lessons)

Each lesson seeded with: 3-6 learn cards, 3-5 practice tasks, 3-5 quiz questions with correct answers.

**Lesson Flow State Machine:**
```
not_started → learning → practicing → logging → quizzing → completed/failed
```

**XP Award Function (client-side):**
```typescript
const awardXP = async (amount: number, source: string, refId?: string) => {
  const multiplier = getStreakMultiplier(progress.current_streak);
  const finalAmount = Math.round(amount * multiplier);
  // Insert xp_transaction, update user progress, check tier promotion
};
```

**Design Tokens:** Uses the spec's color palette (#0A0A12 bg, #13131F card, #8B5CF6 purple primary, #2DD4BF teal, #F59E0B amber) applied via Tailwind classes matching existing theme variables.

### What's Deferred to Phase 2
- AP track modules (locked, visible but not playable)
- AI dream analysis during Log step (placeholder text for now)
- Weekly challenge AI verification (manual completion for now)
- Leaderboard
- Dream Gallery
- Dream Circles / Mentorship
- Push notifications for Academy events
- Edge functions (award-xp, update-streak) — XP logic runs client-side for MVP

