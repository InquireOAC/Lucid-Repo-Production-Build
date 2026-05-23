// Turns a segment's key frame into a Seedance video clip.
// Defaults to 15s for the 2-segment cinematic dream flow; falls back to 5s
// if no duration is provided (legacy single-beat callers).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { falSeedanceImageToVideo, type SeedanceDuration } from "../_shared/fal-seedance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function clampDuration(d: unknown): SeedanceDuration {
  const v = typeof d === "number" ? d : parseInt(String(d ?? 5), 10);
  if (v >= 15) return 15;
  if (v >= 10) return 10;
  return 5;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const { dreamId, beatIndex, motionPrompt, duration } = body;

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
    if (!beat.frame_url) throw new Error("Beat has no frame yet");

    await supabase.from("dream_cinematic_beats")
      .update({ status: "video_generating", error_message: null })
      .eq("id", beat.id);

    const seedancePrompt = (motionPrompt && typeof motionPrompt === "string" && motionPrompt.length > 0)
      ? motionPrompt
      : beat.prompt;
    const clipDuration = clampDuration(duration);

    const { videoUrl } = await falSeedanceImageToVideo(
      {
        prompt: seedancePrompt,
        imageUrl: beat.frame_url,
        aspectRatio: "9:16",
        duration: clipDuration,
        resolution: "720p",
      },
      {
        supabaseUrl,
        serviceRoleKey: serviceKey,
        bucket: "dream-videos",
        path: `${user.id}/cinematic/${dreamId}/seg-${beatIndex}-${Date.now()}.mp4`,
      },
    );

    await supabase.from("dream_cinematic_beats")
      .update({ video_url: videoUrl, status: "video_done" })
      .eq("id", beat.id);

    return new Response(JSON.stringify({ videoUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[generate-cinematic-beat-video] error", e);
    try {
      if (dreamId !== undefined && beatIndex !== undefined) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await supabase.from("dream_cinematic_beats")
          .update({ status: "video_failed", error_message: e?.message?.slice(0, 500) })
          .eq("dream_id", dreamId).eq("beat_index", beatIndex);
      }
    } catch (_) {}
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
