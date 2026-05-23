// Generates a 9:16 key frame for one cinematic segment using FAL nano-banana-2.
//
// References (in order, up to 14 supported by nano-banana-2 edit mode):
//   1. The user's avatar (character likeness)
//   2. Optional prevFrameUrl — the previous segment's key frame, used to lock
//      wardrobe, palette and environment continuity into segment 1.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { falNanoBanana2 } from "../_shared/fal-nano-banana.ts";
import { getUserAvatarReference } from "../_shared/avatar-reference.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const { dreamId, beatIndex, framePrompt, prevFrameUrl } = body;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Auth required");
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

    // Reference image stack: avatar first (anchors identity), then optional
    // previous-segment frame (anchors wardrobe, palette, environment).
    const refUrls: string[] = [];
    if (avatarUrl) refUrls.push(avatarUrl);
    if (prevFrameUrl) refUrls.push(prevFrameUrl);

    // Use the orchestrator-provided framePrompt when available; fall back to
    // the row's stored prompt (legacy / single-call invocations).
    const basePrompt = (framePrompt && typeof framePrompt === "string" && framePrompt.length > 0)
      ? framePrompt
      : beat.prompt;

    const refClause = [
      avatarUrl ? "Match the character likeness from the first reference image exactly." : null,
      prevFrameUrl ? "Carry the wardrobe, color palette, lighting and environment forward from the supplied previous-frame reference." : null,
    ].filter(Boolean).join(" ");

    const renderPrompt = [
      basePrompt,
      refClause,
      "Vertical 9:16 portrait framing, cinematic photographic quality, clean anatomy with five fingers per hand and natural symmetric eyes, no text or watermarks.",
    ].filter(Boolean).join(" ");

    const { imageUrls } = await falNanoBanana2(
      {
        prompt: renderPrompt,
        numImages: 1,
        aspectRatio: "9:16",
        resolution: "1K",
        imageUrls: refUrls,
        outputFormat: "jpeg",
      },
      {
        supabaseUrl,
        serviceRoleKey: serviceKey,
        bucket: "dream-images",
        pathPrefix: `${user.id}/cinematic/${dreamId}/seg-${beatIndex}`,
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
