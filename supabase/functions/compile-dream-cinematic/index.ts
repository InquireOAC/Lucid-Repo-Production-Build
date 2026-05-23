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

Compile the dream into a 30-second short structured as exactly TWO 15-second segments. Each segment is ONE continuous handheld camera shot — no internal cuts. Aspect ratio is always vertical 9:16.

GLOBAL CONSISTENCY ANCHORS (carried verbatim across both segments):
- subject: one sentence overall premise of the film.
- locks.character: how the character looks in body/build/pose language. Do NOT describe specific facial features — likeness comes from a reference image supplied externally.
- locks.wardrobe: the outfit they wear, carried verbatim across both segments.
- locks.environment: the dream location(s), materials, time of day, weather, key props.
- style.palette: 2-3 dominant colors plus one accent.
- style.lighting: dominant light language (rim, low-key, golden-hour, neon, volumetric god rays, etc.).
- style.style_language: cinematography style (e.g. "anamorphic 35mm film grain, naturalistic color science").

THEN EMIT EXACTLY 2 SEGMENTS in the segments array:
- Segment 0 covers seconds 0-15. Segment 1 covers seconds 15-30.
- key_frame_prompt: 60-90 words describing the OPENING FRAME of this 15s shot. Concrete subject + action + setting + light + lens. Honor every lock and style anchor verbatim. No facial details.
- motion_script: 40-70 words. ONE continuous camera move (slow push-in, dolly-around, handheld follow, rising crane). Describe character action + environmental motion. No scene changes inside the segment.
- narration: ONE sentence drawn naturally from the dream content, max ~30 words so it finishes inside 15 seconds at calm narration pace.

CONTINUITY RULES:
- Segment 1 picks up where segment 0 ended: same character, same wardrobe, same lighting, same palette, same environment family. The story moves FORWARD — a turn, a step deeper, a reveal — never a teleport.
- Both key_frame_prompts must restate the character, wardrobe and lighting language so each frame can stand alone.

OUTPUT VIA THE PROVIDED TOOL ONLY. JSON ONLY.`;

interface RawSegment {
  index?: number;
  start?: number;
  end?: number;
  key_frame_prompt?: string;
  motion_script?: string;
  narration?: string;
}

function normaliseSegments(raw: unknown): RawSegment[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s) => s && typeof s === "object") as RawSegment[];
}

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
    if (!dream.content || dream.content.trim().length < 30) {
      throw new Error("Dream is too short to compile into a cinematic — add more detail to the story first.");
    }

    const userMessage = [
      dream.title && `Title: ${dream.title}`,
      dream.mood && `Mood: ${dream.mood}`,
      dream.tags?.length ? `Tags: ${dream.tags.join(", ")}` : "",
      "Dream content:",
      dream.content,
      "",
      "Compile this into exactly 2 segments totaling 30 seconds (15s each).",
    ].filter(Boolean).join("\n");

    console.log(`[compile-dream-cinematic] dream=${dreamId} content_len=${dream.content.length}`);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMessage },
        ],
        // Loose schema — let the model emit the shape and clean it up server-side.
        // Strict minItems/maxItems/enum/additionalProperties causes Gemini's
        // tool-call layer to silently fail or return malformed args.
        tools: [{
          type: "function",
          function: {
            name: "emit_cinematic_spec",
            description: "Return a 2-segment 30-second cinematic spec for this dream.",
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
                },
                style: {
                  type: "object",
                  properties: {
                    palette: { type: "string" },
                    lighting: { type: "string" },
                    style_language: { type: "string" },
                  },
                },
                segments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "integer" },
                      start: { type: "number" },
                      end: { type: "number" },
                      key_frame_prompt: { type: "string" },
                      motion_script: { type: "string" },
                      narration: { type: "string" },
                    },
                  },
                },
              },
              required: ["subject", "segments"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_cinematic_spec" } },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("[compile-dream-cinematic] gateway error", res.status, t.slice(0, 500));
      return new Response(JSON.stringify({ error: `AI gateway error ${res.status}: ${t.slice(0, 200)}` }), {
        status: res.status === 429 || res.status === 402 ? res.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;
    let argsRaw: string | undefined = choice?.tool_calls?.[0]?.function?.arguments;

    // Fallback: some gateway responses put the JSON in `content` instead of a tool call.
    if (!argsRaw && typeof choice?.content === "string") {
      const match = choice.content.match(/\{[\s\S]*\}/);
      if (match) argsRaw = match[0];
    }
    if (!argsRaw) {
      console.error("[compile-dream-cinematic] no structured spec — raw response:", JSON.stringify(data).slice(0, 800));
      throw new Error("Compiler returned no structured spec");
    }

    let spec: any;
    try {
      spec = JSON.parse(argsRaw);
    } catch (parseErr) {
      console.error("[compile-dream-cinematic] JSON parse failed:", argsRaw.slice(0, 500));
      throw new Error("Compiler returned malformed JSON");
    }

    // Robust segment normalisation. We want exactly 2 segments with stable
    // index/start/end. Trust the model on prompt content but rewrite the
    // timing / index ourselves.
    const segmentsIn = normaliseSegments(spec.segments);
    if (segmentsIn.length === 0) {
      console.error("[compile-dream-cinematic] no segments in spec:", JSON.stringify(spec).slice(0, 500));
      throw new Error("Compiler returned no segments");
    }

    let segments: RawSegment[];
    if (segmentsIn.length >= 2) {
      segments = segmentsIn.slice(0, 2);
    } else {
      // Only one segment — duplicate with a clear continuation prompt so we
      // still get a 30s film. Not ideal but better than failing.
      const only = segmentsIn[0];
      segments = [
        only,
        {
          key_frame_prompt: `${only.key_frame_prompt || ""} Continuation: the dream deepens, same character and wardrobe, lighting and palette held.`,
          motion_script: only.motion_script || "Continuing handheld camera motion through the same scene.",
          narration: only.narration || "",
        },
      ];
      console.warn("[compile-dream-cinematic] only one segment returned, duplicated as continuation");
    }

    // Force canonical timing and indexing.
    segments[0] = { ...segments[0], index: 0, start: 0, end: 15 };
    segments[1] = { ...segments[1], index: 1, start: 15, end: 30 };

    // Backfill required fields with empty-string defaults so downstream
    // generators don't choke on undefined.
    const ensureStr = (v: unknown) => (typeof v === "string" ? v : "");
    segments = segments.map((s) => ({
      index: s.index,
      start: s.start,
      end: s.end,
      key_frame_prompt: ensureStr(s.key_frame_prompt),
      motion_script: ensureStr(s.motion_script) || ensureStr(s.key_frame_prompt),
      narration: ensureStr(s.narration),
    }));

    spec.segments = segments;
    spec.locks = spec.locks || {};
    spec.style = spec.style || {};

    // Upsert spec
    const { error: specErr } = await supabase.from("dream_cinematic_specs")
      .upsert({
        dream_id: dreamId,
        user_id: user.id,
        spec_json: spec,
        total_duration: totalDuration,
      }, { onConflict: "dream_id" });
    if (specErr) {
      console.error("[compile-dream-cinematic] spec upsert error:", specErr);
      throw new Error(`Failed to save spec: ${specErr.message}`);
    }

    // Reset segment rows. beat_index 0 = segment 1, beat_index 1 = segment 2.
    // The `prompt` column stores the per-segment motion script (used by the
    // video generator). The opening-frame prompt and global locks live in
    // spec_json and are passed via the orchestrator to the frame generator
    // at render time.
    await supabase.from("dream_cinematic_beats").delete().eq("dream_id", dreamId);
    const beatRows = segments.map((s) => ({
      dream_id: dreamId,
      user_id: user.id,
      beat_index: s.index!,
      start_time: s.start!,
      end_time: s.end!,
      prompt: s.motion_script || s.key_frame_prompt || "Continuous dreamlike camera motion through the scene.",
      narration_text: s.narration,
      status: "pending",
    }));
    const { error: beatsErr } = await supabase.from("dream_cinematic_beats").insert(beatRows);
    if (beatsErr) {
      console.error("[compile-dream-cinematic] beats insert error:", beatsErr);
      throw new Error(`Failed to save segments: ${beatsErr.message}`);
    }

    console.log(`[compile-dream-cinematic] success dream=${dreamId} segments=${beatRows.length}`);
    return new Response(JSON.stringify({ spec, segmentCount: beatRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[compile-dream-cinematic] fatal:", e?.message, e?.stack?.slice(0, 500));
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
