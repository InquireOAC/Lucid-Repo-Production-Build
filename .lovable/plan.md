

# Admin Unlimited Access + Admin Role Assignment from Dashboard

## Overview

Two changes:
1. **Admins get unlimited access to all features** (analysis, image generation, video generation, chat) without needing a subscription -- they are treated as having the highest tier.
2. **Admins can assign the admin role** (not just moderator) to other users from the Admin Dashboard's User Manager.

## Current State

- Feature gating currently uses a hardcoded email check (`inquireoac@gmail.com`) scattered across 4 files to bypass subscription checks. This is fragile and only works for one person.
- The `user_roles` table only has a SELECT RLS policy (users can view their own roles). There is no INSERT policy, so the `UserManager` component's `assignModerator` call only works because it likely runs against an anon key with no RLS enforcement issue -- but assigning admin roles is not implemented in the UI.
- The `isSubscribed` check in `DreamImageWithVideo` and `DreamDetail` does not account for admin status.

## Database Changes

Add an RLS policy on `user_roles` allowing admins to INSERT new roles:

```sql
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Also add a DELETE policy so admins can remove roles:

```sql
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

## Frontend Changes

### 1. `useUserRole` hook -- already exists, no changes needed
The hook already fetches the user's role. We'll use `isAdmin` from it.

### 2. `useFeatureUsage.ts` -- Replace hardcoded email with admin role check
- Import and use `useUserRole` (or query `user_roles` table directly to avoid hook dependency issues)
- Replace all `user.email === "inquireoac@gmail.com"` checks with an `isAdmin` check
- When `isAdmin` is true: `canUseFeature` returns true, `hasUsedFeature` returns false, `recordFeatureUsage` skips recording

### 3. `useImageGeneration.ts` -- Replace hardcoded email with admin check
- Replace `isAppCreator` email check with admin role check
- Pass admin status or use the same pattern

### 4. `useChatFeatureAccess.ts` -- Replace hardcoded email with admin check
- Same pattern: replace email check with admin role

### 5. `DreamAnalysis.tsx` -- Replace hardcoded email with admin check
- Replace `isAppCreator` email check with admin role

### 6. `DreamDetail.tsx` -- Include admin status in `isSubscribed`
- Change `const isSubscribed = !!subscription?.subscribed;` to also be true when the user is an admin
- This ensures admins see "Generate Video" instead of the locked option

### 7. `UserManager.tsx` -- Add "Make Admin" button
- Add a second button or a dropdown/select to assign either "moderator" or "admin" role
- Show current role badges (admin/moderator) next to users
- Add ability to query existing roles for search results

### 8. `DreamImageWithVideo.tsx` -- No changes needed
Already receives `isSubscribed` as a prop; the fix in `DreamDetail.tsx` covers it.

## File Summary

| File | Action |
|------|--------|
| `user_roles` RLS policies | Add INSERT and DELETE policies for admins |
| `src/hooks/useFeatureUsage.ts` | Replace email checks with admin role check |
| `src/hooks/useImageGeneration.ts` | Replace email check with admin role check |
| `src/hooks/useChatFeatureAccess.ts` | Replace email check with admin role check |
| `src/components/DreamAnalysis.tsx` | Replace email check with admin role check |
| `src/components/DreamDetail.tsx` | Include admin in isSubscribed logic |
| `src/components/admin/UserManager.tsx` | Add admin role assignment + role display |

## Security Notes

- Admin role assignment is protected server-side by the new RLS policy (`has_role(auth.uid(), 'admin')`)
- The admin bypass is validated against the `user_roles` database table, not client-side storage or hardcoded credentials
- The hardcoded email bypass will be fully removed

