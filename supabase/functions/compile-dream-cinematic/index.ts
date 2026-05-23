// Compiles a dream into a 2-segment, 30-second cinematic spec.
// Each segment is one 15s Seedance clip. Global "locks" (character, wardrobe,
// environment, palette, lighting, style language) are emitted once so both
// segments stay visually consistent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are the cinematic director for Lucid Repo dream films.

You compile a dream into a 30-SECOND short structured as EXACTLY TWO 15-SECOND SEGMENTS. Each segment is ONE continuous handheld camera shot — no internal cuts. Aspect ratio is always vertical 9:16.

EMIT GLOBAL CONSISTENCY ANCHORS (used to lock the look across both segments):
- subject: one sentence overall premise of the film.
- locks.character: how the character looks in body/build/pose language. Do NOT describe specific facial features — likeness comes from a reference image that will be supplied externally.
- locks.wardrobe: the outfit they wear; carried verbatim across both segments.
- locks.environment: the dream location(s), materials, time of day, weather, key props.
- style.palette: 2-3 dominant colors plus one accent.
- style.lighting: dominant light language (rim, low-key, golden-hour, neon, volumetric god rays, etc.).
- style.style_language: cinematography style (e.g. "anamorphic 35mm film grain, naturalistic color science").

THEN EMIT EXACTLY 2 SEGMENTS:
- segment.index 0 covers seconds 0-15. segment.index 1 covers seconds 15-30.
- key_frame_prompt: 60-90 words describing the OPENING FRAME of this 15s shot. Concrete subject + action + setting + light + lens. Honor every lock and style anchor verbatim. No facial details.
- motion_script: 40-70 words. ONE continuous camera move (slow push-in, dolly-around, handheld follow, rising crane). Describe character action + environmental motion (wind, particles, light shifts). No scene changes inside the segment.
- narration: ONE sentence, max ~35 words. Read it aloud at calm dream-narration pace and it must finish inside the 15 seconds. Pull it naturally from the dream content — not a summary of the camera.

HARD CONTINUITY RULES:
- Segment 1's last beat must visually hand off into segment 0's opening frame: same character, same wardrobe, same lighting, same palette, same environment family.
- The story moves FORWARD between segments — a turn, a step deeper, a reveal — never a teleport to an unrelated place.
- Both key_frame_prompts must restate the character, wardrobe and lighting language so each frame can stand alone for the renderer.

OUTPUT VIA THE PROVIDED TOOL ONLY. JSON ONLY. NO PLAIN TEXT REPLY.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { dreamId } = await req.json();
    if (!dreamId) throw new Error("dreamId required");
    // Two 15-second segments — always 30 seconds total.
    const totalDuration = 30;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: dream } = await supabase
      .from("dream_entries")
      .select("id, title, content, mood, tags")
      .eq("id", dreamId)
      .eq("user_id", user.id)
      .single();
    if (!dream) throw new Error("Dream not found");

    const userMessage = [
      dream.title && `Title: ${dream.title}`,
      dream.mood && `Mood: ${dream.mood}`,
      dream.tags?.length ? `Tags: ${dream.tags.join(", ")}` : "",
      "Dream content:",
      dream.content,
      "",
      "Compile this into exactly 2 segments totaling 30 seconds (15s each).",
    ].filter(Boolean).join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMessage },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_cinematic_spec",
            description: "Return a 2-segment, 30-second cinematic spec for this dream.",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string" },
                locks: {
                  type: "object",
                  properties: {
                    character: { type: "string" },
                    wardrobe: { type: "string" },
                    environment: { type: "string" },
                  },
                  required: ["character", "wardrobe", "environment"],
                  additionalProperties: false,
                },
                style: {
                  type: "object",
                  properties: {
                    palette: { type: "string" },
                    lighting: { type: "string" },
                    style_language: { type: "string" },
                  },
                  required: ["palette", "lighting", "style_language"],
                  additionalProperties: false,
                },
                segments: {
                  type: "array",
                  minItems: 2,
                  maxItems: 2,
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "integer", enum: [0, 1] },
                      start: { type: "number" },
                      end: { type: "number" },
                      key_frame_prompt: { type: "string" },
                      motion_script: { type: "string" },
                      narration: { type: "string" },
                    },
                    required: ["index", "start", "end", "key_frame_prompt", "motion_script", "narration"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["subject", "locks", "style", "segments"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_cinematic_spec" } },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("[compile-dream-cinematic] gateway error", res.status, t);
      return new Response(JSON.stringify({ error: `AI gateway error ${res.status}` }), {
        status: res.status === 429 || res.status === 402 ? res.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const argsRaw = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argsRaw) throw new Error("Model returned no structured spec");
    const spec = JSON.parse(argsRaw);

    // Hard-enforce exactly 2 segments at fixed time windows.
    if (!Array.isArray(spec.segments) || spec.segments.length !== 2) {
      throw new Error("Compiler did not return exactly 2 segments");
    }
    spec.segments.sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0));
    spec.segments[0].start = 0; spec.segments[0].end = 15;
    spec.segments[1].start = 15; spec.segments[1].end = 30;

    // Upsert spec
    await supabase.from("dream_cinematic_specs")
      .upsert({
        dream_id: dreamId,
        user_id: user.id,
        spec_json: spec,
        total_duration: totalDuration,
      }, { onConflict: "dream_id" });

    // Reset segment rows: delete + reinsert pending rows.
    // Reuses the dream_cinematic_beats table — beat_index 0 = segment 1, beat_index 1 = segment 2.
    // The row's `prompt` column stores the per-segment MOTION script (used by the video generator).
    // The opening-frame prompt and global locks live in spec_json and are passed via the
    // orchestrator to the frame generator at render time.
    await supabase.from("dream_cinematic_beats").delete().eq("dream_id", dreamId);
    const beatRows = spec.segments.map((s: any) => ({
      dream_id: dreamId,
      user_id: user.id,
      beat_index: s.index,
      start_time: s.start,
      end_time: s.end,
      prompt: s.motion_script,
      narration_text: s.narration,
      status: "pending",
    }));
    await supabase.from("dream_cinematic_beats").insert(beatRows);

    return new Response(JSON.stringify({ spec, segmentCount: beatRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[compile-dream-cinematic] error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
