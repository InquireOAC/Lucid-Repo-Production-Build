// ============================================================
// Server-authoritative entitlement gate + meter.
//
// The client (useFeatureUsage / canUseFeature) gates the UI, but the
// edge endpoints are directly callable by any authenticated user with the
// public anon key + their JWT. This module enforces the SAME policy on the
// server so paid generations cannot be triggered without an entitlement:
//
//   admin                         -> allow (no metering)
//   active subscription           -> allow only if under the monthly limit,
//                                    then atomically meter the usage
//   otherwise (free tier)         -> consume the single one-time free trial
//                                    (atomic via UNIQUE(user_id, feature))
//
// Always call with a SERVICE-ROLE client so RLS does not hide the
// subscription / trial rows.
// ============================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Monthly image-generation caps per Stripe / RevenueCat price id.
 *  Mirrors checkCreditsForSubscription() in src/lib/stripe.ts. */
const IMAGE_MONTHLY_LIMITS: Record<string, number> = {
  price_premium: 1000,
  "com.lucidrepo.unlimited.monthly": 1000,
  price_basic: 10,
  "com.lucidrepo.limited.monthly": 10,
};

export type EntitlementTier = "admin" | "subscriber" | "free-trial" | "none";

export interface EntitlementResult {
  allowed: boolean;
  /** HTTP status to return on denial (200 when allowed). */
  status: number;
  /** User-facing reason when denied. */
  reason?: string;
  tier: EntitlementTier;
}

async function isAdmin(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

/**
 * Gate + meter exactly one image generation. Consumes the entitlement on
 * success (increments subscriber usage, or claims the free trial), so the
 * caller must refund (see refundImageCredit) if the downstream generation
 * fails after this returns `allowed: true`.
 */
export async function checkAndConsumeImageCredit(
  admin: SupabaseClient,
  userId: string,
): Promise<EntitlementResult> {
  // 1. Admin bypass
  if (await isAdmin(admin, userId)) {
    return { allowed: true, status: 200, tier: "admin" };
  }

  // 2. Active subscription -> enforce monthly limit, then meter
  const { data: sub } = await admin
    .from("stripe_subscriptions")
    .select("price_id, image_generations_used")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .eq("status", "active")
    .maybeSingle();

  if (sub) {
    const limit = IMAGE_MONTHLY_LIMITS[(sub.price_id as string) ?? ""] ?? 0;
    const used = (sub.image_generations_used as number) ?? 0;
    if (limit <= 0) {
      return {
        allowed: false,
        status: 402,
        reason: "Your current plan does not include image generation.",
        tier: "subscriber",
      };
    }
    if (used >= limit) {
      return {
        allowed: false,
        status: 402,
        reason: `You've reached your monthly image limit (${used}/${limit}).`,
        tier: "subscriber",
      };
    }
    await admin.rpc("increment_subscription_usage_by_user", {
      user_id_param: userId,
      credit_type: "image",
    });
    return { allowed: true, status: 200, tier: "subscriber" };
  }

  // 3. Free tier -> atomically claim the single free image.
  //    UNIQUE(user_id, feature) makes a duplicate insert fail (23505),
  //    which closes the concurrent-burst hole.
  const { error: claimErr } = await admin
    .from("feature_free_trials")
    .insert({ user_id: userId, feature: "image" });

  if (claimErr) {
    return {
      allowed: false,
      status: 402,
      reason: "You've used your free image. Subscribe to keep creating dream scenes.",
      tier: "free-trial",
    };
  }
  return { allowed: true, status: 200, tier: "free-trial" };
}

/**
 * Best-effort refund of a consumed image credit when the downstream
 * generation fails. Free trials are released by deleting the claim row;
 * subscriber usage is decremented via RPC (no-op if the RPC is absent).
 */
export async function refundImageCredit(
  admin: SupabaseClient,
  userId: string,
  tier: EntitlementTier,
): Promise<void> {
  try {
    if (tier === "free-trial") {
      await admin
        .from("feature_free_trials")
        .delete()
        .eq("user_id", userId)
        .eq("feature", "image");
    } else if (tier === "subscriber") {
      await admin.rpc("decrement_subscription_usage_by_user", {
        user_id_param: userId,
        credit_type: "image",
      });
    }
  } catch (_) {
    // Refund is best-effort; never let it mask the original error.
  }
}
