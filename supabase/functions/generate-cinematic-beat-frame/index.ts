// Generates a 9:16 key frame for one cinematic beat using FAL nano-banana-2,
// anchored on the user's avatar reference for character consistency.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { falNanoBanana2 } from "../_shared/fal-nano-banana.ts";
import { getUserAvatarReference } from "../_shared/avatar-reference.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Auth required");

    const { dreamId, beatIndex } = await req.json();
    if (!dreamId || beatIndex === undefined) throw new Error("dreamId and beatIndex required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: beat } = await supabase
      .from("dream_cinematic_beats")
      .select("*")
      .eq("dream_id", dreamId)
      .eq("beat_index", beatIndex)
      .eq("user_id", user.id)
      .single();
    if (!beat) throw new Error("Beat not found");

    await supabase.from("dream_cinematic_beats")
      .update({ status: "frame_generating", error_message: null })
      .eq("id", beat.id);

    const avatarUrl = await getUserAvatarReference(supabaseUrl, serviceKey, user.id);

    const { imageUrls } = await falNanoBanana2(
      {
        prompt: beat.prompt + (avatarUrl ? " — keep the character likeness consistent with the reference image." : ""),
        numImages: 1,
        aspectRatio: "9:16",
        resolution: "1K",
        imageUrls: avatarUrl ? [avatarUrl] : [],
        outputFormat: "jpeg",
      },
      {
        supabaseUrl,
        serviceRoleKey: serviceKey,
        bucket: "dream-images",
        pathPrefix: `${user.id}/cinematic/${dreamId}/beat-${beatIndex}`,
      },
    );

    const frameUrl = imageUrls[0];
    await supabase.from("dream_cinematic_beats")
      .update({ frame_url: frameUrl, status: "frame_done" })
      .eq("id", beat.id);

    return new Response(JSON.stringify({ frameUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[generate-cinematic-beat-frame] error", e);
    try {
      const { dreamId, beatIndex } = await req.json().catch(() => ({}));
      if (dreamId !== undefined && beatIndex !== undefined) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await supabase.from("dream_cinematic_beats")
          .update({ status: "frame_failed", error_message: e?.message?.slice(0, 500) })
          .eq("dream_id", dreamId).eq("beat_index", beatIndex);
      }
    } catch (_) {}
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});