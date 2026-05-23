// Orchestrator: runs frame → video → narration for every beat in parallel,
// waits for completion, and returns the full beat list so the client can
// assemble the final cinematic clip.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { data: beats } = await supabase
      .from("dream_cinematic_beats")
      .select("beat_index")
      .eq("dream_id", dreamId)
      .eq("user_id", user.id)
      .order("beat_index");
    if (!beats?.length) throw new Error("No beats found — compile the spec first");

    // Step 1: frames in parallel
    await Promise.all(beats.map((b: any) =>
      invokeChild("generate-cinematic-beat-frame", { dreamId, beatIndex: b.beat_index }, authHeader)
    ));

    // Step 2: videos + narration in parallel for each beat
    await Promise.all(beats.flatMap((b: any) => [
      invokeChild("generate-cinematic-beat-video", { dreamId, beatIndex: b.beat_index }, authHeader),
      invokeChild("generate-cinematic-beat-narration", { dreamId, beatIndex: b.beat_index, voiceId }, authHeader),
    ]));

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