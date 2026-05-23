// Compiles a dream into a 4–5 beat cinematic spec capped at 30s.
// Uses Lovable AI Gateway (Gemini) with strict tool-call schema.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a cinematic shot-list planner for Lucid Repo dream visualizations.
You produce a beat-synced SHOT SEQUENCE that fits inside a single short video clip (max 30 seconds total).

Each beat is a discrete cut with its own framing, lens, action, sensory atmosphere, and narration line.
Maintain character likeness and dream location continuity across beats. The character reference image will be supplied externally — do NOT describe wardrobe details.

- Plan exactly 4 to 5 beats.
- Beats must be tightly timed, gap-free, and add up to the target total duration.
- Each beat is ~5–7 seconds.
- Aspect ratio is always vertical 9:16 portrait.
- Narration text should be ONE short sentence per beat (max ~14 words), drawn naturally from the dream content, written as if a calm voice is narrating a dream.
- Framing values: Wide, Medium-wide, Medium, Medium close-up, Close-up, POV.
- Lens values: 24mm lens, 35mm lens, 50mm lens, 85mm lens, anamorphic.

Always output valid JSON via the provided tool. Never reply in plain text.`;

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

    const { dreamId, totalDuration: rawDuration } = await req.json();
    if (!dreamId) throw new Error("dreamId required");
    const totalDuration = Math.min(30, Math.max(15, Number(rawDuration) || 30));

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
      `Total duration: ${totalDuration}s. Plan 4–5 beats covering the full duration without gaps.`,
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
            description: "Return a structured cinematic spec for this dream.",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string", description: "One-sentence overall subject/scene description." },
                cinematography: {
                  type: "object",
                  properties: {
                    format: { type: "string" },
                    look: { type: "string" },
                    cameraBody: { type: "string" },
                    lens: { type: "string" },
                    lighting: { type: "string" },
                    atmosphere: { type: "array", items: { type: "string" } },
                  },
                  required: ["format", "look", "cameraBody", "lens", "lighting", "atmosphere"],
                  additionalProperties: false,
                },
                beats: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      start: { type: "number" },
                      end: { type: "number" },
                      framing: { type: "string" },
                      lens: { type: "string" },
                      text: { type: "string", description: "Action only — what physically happens in this beat." },
                      narration: { type: "string", description: "One short narration sentence (max ~14 words)." },
                      sfx: { type: "string", description: "Per-beat SFX cue chain." },
                    },
                    required: ["start", "end", "framing", "lens", "text", "narration", "sfx"],
                    additionalProperties: false,
                  },
                },
                sound: { type: "string" },
              },
              required: ["subject", "cinematography", "beats", "sound"],
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

    // Clamp beats to 5
    if (Array.isArray(spec.beats) && spec.beats.length > 5) {
      spec.beats = spec.beats.slice(0, 5);
    }

    // Upsert spec
    await supabase.from("dream_cinematic_specs")
      .upsert({
        dream_id: dreamId,
        user_id: user.id,
        spec_json: spec,
        total_duration: totalDuration,
      }, { onConflict: "dream_id" });

    // Reset beats: delete + reinsert pending rows
    await supabase.from("dream_cinematic_beats").delete().eq("dream_id", dreamId);
    const beatRows = spec.beats.map((b: any, i: number) => ({
      dream_id: dreamId,
      user_id: user.id,
      beat_index: i,
      start_time: b.start,
      end_time: b.end,
      prompt: `${spec.subject}. ${b.text} ${b.framing}, ${b.lens}. ${spec.cinematography?.lighting || ""}`.trim(),
      narration_text: b.narration,
      status: "pending",
    }));
    if (beatRows.length) await supabase.from("dream_cinematic_beats").insert(beatRows);

    return new Response(JSON.stringify({ spec, beatCount: beatRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[compile-dream-cinematic] error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});