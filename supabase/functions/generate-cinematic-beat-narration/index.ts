// Synthesizes narration MP3 for one beat using ElevenLabs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { elevenLabsTTS } from "../_shared/elevenlabs-tts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const body = await req.json().catch(() => ({}));
  const { dreamId, beatIndex, voiceId } = body;

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

    const { data: allBeats } = await supabase
      .from("dream_cinematic_beats")
      .select("beat_index, narration_text")
      .eq("dream_id", dreamId)
      .eq("user_id", user.id)
      .order("beat_index");

    const beat = allBeats?.find((b: any) => b.beat_index === beatIndex);
    if (!beat || !beat.narration_text) throw new Error("Beat has no narration text");

    const prev = allBeats?.find((b: any) => b.beat_index === beatIndex - 1)?.narration_text;
    const next = allBeats?.find((b: any) => b.beat_index === beatIndex + 1)?.narration_text;

    const { audioUrl } = await elevenLabsTTS(
      { text: beat.narration_text, voiceId, previousText: prev, nextText: next },
      {
        supabaseUrl,
        serviceRoleKey: serviceKey,
        bucket: "dream-audio",
        path: `${user.id}/cinematic/${dreamId}/beat-${beatIndex}-${Date.now()}.mp3`,
      },
    );

    await supabase.from("dream_cinematic_beats")
      .update({ narration_url: audioUrl })
      .eq("dream_id", dreamId).eq("beat_index", beatIndex);

    return new Response(JSON.stringify({ audioUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[generate-cinematic-beat-narration] error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});