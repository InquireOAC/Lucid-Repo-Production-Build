// Extracts person names mentioned in a dream and ensures each one has a
// placeholder row in dream_characters, then writes the union of linked
// character ids back to the dream_entries row.
//
// Designed to run async after a dream save. Loose Gemini tool schema with
// robust fallbacks — see compile-dream-cinematic for the same pattern.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a named-entity recognizer for personal dream journals.

Extract every PERSON name explicitly mentioned in the dream by name. A person is a human or human-like being given a proper noun name in the text.

INCLUDE:
- First names ("Sarah", "Marcus")
- Full names ("Sarah Chen")
- Nicknames used as names ("Buddy" if used like a name)

EXCLUDE:
- The dreamer themselves — first-person pronouns ("I", "me", "my") never count
- Generic role nouns with no proper name ("my mother", "a man", "the stranger")
- Places, things, brands, animals not given a personal name
- Abstract concepts, gods, characters from fiction the dreamer is watching (e.g. "Batman" inside a movie within the dream)
- Duplicate references — return each person ONCE, with the most complete form of their name

Return an empty array if no named people appear.

Output via the provided tool only. JSON only.`;

interface ExtractedName {
  name?: string;
}

function normaliseNameList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const n = (item as ExtractedName).name;
    if (typeof n !== "string") continue;
    const trimmed = n.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
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
      .select("id, title, content, dream_character_ids")
      .eq("id", dreamId)
      .eq("user_id", user.id)
      .single();
    if (!dream) throw new Error("Dream not found");

    const content = dream.content || "";
    if (content.trim().length < 30) {
      console.log(`[extract-dream-characters] dream=${dreamId} content too short, skipping`);
      return new Response(JSON.stringify({ characters: [], skipped: "content_too_short" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingCharacters } = await supabase
      .from("dream_characters")
      .select("id, name, photo_url")
      .eq("user_id", user.id);

    const userMessage = [
      dream.title && `Dream title: ${dream.title}`,
      "Dream content:",
      content,
    ].filter(Boolean).join("\n");

    console.log(`[extract-dream-characters] dream=${dreamId} content_len=${content.length} existing=${existingCharacters?.length || 0}`);

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
            name: "emit_characters",
            description: "Return the list of named people in the dream.",
            parameters: {
              type: "object",
              properties: {
                characters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { name: { type: "string" } },
                  },
                },
              },
              required: ["characters"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_characters" } },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("[extract-dream-characters] gateway error", res.status, t.slice(0, 500));
      return new Response(JSON.stringify({ error: `AI gateway error ${res.status}: ${t.slice(0, 200)}` }), {
        status: res.status === 429 || res.status === 402 ? res.status : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;
    let argsRaw: string | undefined = choice?.tool_calls?.[0]?.function?.arguments;
    if (!argsRaw && typeof choice?.content === "string") {
      const match = choice.content.match(/\{[\s\S]*\}/);
      if (match) argsRaw = match[0];
    }
    if (!argsRaw) {
      console.error("[extract-dream-characters] no structured response:", JSON.stringify(data).slice(0, 600));
      throw new Error("Extractor returned no structured response");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsRaw);
    } catch (parseErr) {
      console.error("[extract-dream-characters] JSON parse failed:", argsRaw.slice(0, 400));
      throw new Error("Extractor returned malformed JSON");
    }

    const extractedNames = normaliseNameList(parsed.characters);
    console.log(`[extract-dream-characters] dream=${dreamId} extracted ${extractedNames.length} names: ${extractedNames.join(", ")}`);

    // Match extracted names against existing characters (case-insensitive).
    const existingByLower = new Map<string, { id: string; name: string | null; photo_url: string | null }>();
    for (const c of existingCharacters || []) {
      if (c.name) existingByLower.set(c.name.toLowerCase(), c);
    }

    const resolved: Array<{ id: string; name: string; photo_url: string | null; isNew: boolean }> = [];
    const toInsert: Array<{ user_id: string; name: string }> = [];
    for (const name of extractedNames) {
      const existing = existingByLower.get(name.toLowerCase());
      if (existing) {
        resolved.push({ id: existing.id, name: existing.name || name, photo_url: existing.photo_url, isNew: false });
      } else {
        toInsert.push({ user_id: user.id, name });
      }
    }

    if (toInsert.length > 0) {
      const { data: inserted, error: insErr } = await supabase
        .from("dream_characters")
        .insert(toInsert)
        .select("id, name, photo_url");
      if (insErr) {
        console.error("[extract-dream-characters] insert error:", insErr);
        throw new Error(`Failed to create placeholders: ${insErr.message}`);
      }
      for (const row of inserted || []) {
        resolved.push({ id: row.id, name: row.name || "", photo_url: row.photo_url, isNew: true });
      }
    }

    // Union with whatever was already linked to the dream (manual additions etc.)
    const existingLinked = new Set<string>((dream.dream_character_ids as string[] | null) || []);
    for (const c of resolved) existingLinked.add(c.id);
    const merged = Array.from(existingLinked);

    const { error: updErr } = await supabase
      .from("dream_entries")
      .update({ dream_character_ids: merged })
      .eq("id", dreamId)
      .eq("user_id", user.id);
    if (updErr) {
      console.error("[extract-dream-characters] dream update error:", updErr);
      throw new Error(`Failed to link characters: ${updErr.message}`);
    }

    console.log(`[extract-dream-characters] dream=${dreamId} linked ${merged.length} total characters (${resolved.filter(c => c.isNew).length} new)`);

    return new Response(JSON.stringify({ characters: resolved, linkedIds: merged }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[extract-dream-characters] fatal:", e?.message, e?.stack?.slice(0, 500));
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
