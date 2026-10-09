// Returns the user's best character reference URL for cinematic gen.
// Looks up the user's AI context (set via AIContextDialog) for a photo URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function getUserAvatarReference(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
): Promise<string | null> {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Try ai_context table or profile photo. Adjust to whichever exists.
  // Primary: profiles.avatar_url
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.avatar_url) return profile.avatar_url as string;
  } catch (_) {
    // ignore
  }

  // Fallback: ai_contexts table if present
  try {
    const { data: ctx } = await supabase
      .from("ai_contexts")
      .select("photo_url")
      .eq("user_id", userId)
      .maybeSingle();
    if (ctx?.photo_url) return ctx.photo_url as string;
  } catch (_) {
    // table may not exist; ignore
  }

  return null;
}