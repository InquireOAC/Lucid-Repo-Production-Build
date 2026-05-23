// Orchestrator for the 2-segment cinematic dream pipeline.
//
// Sequence:
//   1. Read the spec from dream_cinematic_specs.
//   2. Generate segment-0 key frame (anchored on the user's avatar).
//   3. Generate segment-1 key frame, passing segment-0's frame as a continuity
//      reference so the renderer carries character + wardrobe + palette forward.
//   4. In parallel: generate the 15s Seedance video for each segment, and the
//      ElevenLabs narration for each segment.
//   5. Return all segments so the client-side assembler can stitch the final clip.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getUserAvatarReference } from "../_shared/avatar-reference.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function invokeChild(name: string, body: any, authHeader: string) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `${name} failed (${res.status})`);
  return data;
}

function buildStyleBlock(spec: any): string {
  const locks = spec?.locks || {};
  const style = spec?.style || {};
  const parts = [
    locks.character ? `Character: ${locks.character}.` : null,
    locks.wardrobe ? `Wardrobe: ${locks.wardrobe}.` : null,
    locks.environment ? `Environment: ${locks.environment}.` : null,
    style.palette ? `Color palette: ${style.palette}.` : null,
    style.lighting ? `Lighting: ${style.lighting}.` : null,
    style.style_language ? `Visual style: ${style.style_language}.` : null,
  ].filter(Boolean);
  return parts.join(" ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Auth required");

    const { dreamId, voiceId } = await req.json();
    if (!dreamId) throw new Error("dreamId required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Mystic gating (or admin bypass)
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleData;

    if (!isAdmin) {
      const { data: subData } = await supabase
        .from("stripe_subscriptions")
        .select("status, price_id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .eq("status", "active")
        .maybeSingle();
      const allowedPriceIds = ["price_premium", "com.lucidrepo.unlimited.monthly"];
      if (!subData || !allowedPriceIds.includes(subData.price_id)) {
        throw new Error("Cinematic Dream requires a Mystic subscription");
      }
    }

    const { data: spec } = await supabase
      .from("dream_cinematic_specs")
      .select("spec_json")
      .eq("dream_id", dreamId)
      .eq("user_id", user.id)
      .single();
    if (!spec?.spec_json) throw new Error("No cinematic spec — compile first");

    const segments = (spec.spec_json.segments || []).slice().sort((a: any, b: any) => a.index - b.index);
    if (segments.length !== 2) throw new Error("Spec must contain exactly 2 segments");
    const styleBlock = buildStyleBlock(spec.spec_json);

    // Step 1: frame 0 — anchored on user avatar.
    const frame0Prompt = `${segments[0].key_frame_prompt} ${styleBlock}`.trim();
    const frame0 = await invokeChild(
      "generate-cinematic-beat-frame",
      { dreamId, beatIndex: 0, framePrompt: frame0Prompt },
      authHeader,
    );
    const frame0Url: string | undefined = frame0?.frameUrl;
    if (!frame0Url) throw new Error("Segment 0 frame failed");

    // Step 2: frame 1 — anchored on user avatar AND segment-0's frame for continuity.
    const frame1Prompt = `${segments[1].key_frame_prompt} ${styleBlock} Carry the character, wardrobe, lighting and color palette forward exactly from the previous reference image.`.trim();
    const frame1 = await invokeChild(
      "generate-cinematic-beat-frame",
      { dreamId, beatIndex: 1, framePrompt: frame1Prompt, prevFrameUrl: frame0Url },
      authHeader,
    );
    if (!frame1?.frameUrl) throw new Error("Segment 1 frame failed");

    // Step 3: videos (15s each) + narrations, all in parallel.
    // Both segments route through Seedance 2 omni-reference so the avatar
    // identity is locked through the motion (not just baked into the start
    // frame). Segment 2 additionally references segment 1's key frame for
    // wardrobe / palette / environment handoff.
    const avatarUrl = await getUserAvatarReference(supabaseUrl, serviceKey, user.id);
    const motion0 = `${segments[0].motion_script} ${styleBlock}`.trim();
    const motion1 = `${segments[1].motion_script} ${styleBlock} Maintain the exact character, wardrobe, lighting and color grade from the supplied references.`.trim();
    const refs0 = [avatarUrl].filter((u): u is string => !!u);
    const refs1 = [avatarUrl, frame0Url].filter((u): u is string => !!u);

    await Promise.all([
      invokeChild("generate-cinematic-beat-video", { dreamId, beatIndex: 0, motionPrompt: motion0, duration: 15, referenceImages: refs0 }, authHeader),
      invokeChild("generate-cinematic-beat-video", { dreamId, beatIndex: 1, motionPrompt: motion1, duration: 15, referenceImages: refs1 }, authHeader),
      invokeChild("generate-cinematic-beat-narration", { dreamId, beatIndex: 0, voiceId }, authHeader),
      invokeChild("generate-cinematic-beat-narration", { dreamId, beatIndex: 1, voiceId }, authHeader),
    ]);

    const { data: completed } = await supabase
      .from("dream_cinematic_beats")
      .select("*")
      .eq("dream_id", dreamId)
      .eq("user_id", user.id)
      .order("beat_index");

    return new Response(JSON.stringify({ beats: completed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[assemble-cinematic-dream] error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
