import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dreams } = await req.json();

    if (!dreams || !Array.isArray(dreams) || dreams.length === 0) {
      return new Response(
        JSON.stringify({ error: "No dreams provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const dreamTexts = dreams.map((d: { title: string; content: string }, i: number) =>
      `Dream ${i + 1}: "${d.title}" - ${d.content}`
    ).join("\n\n");

    const systemPrompt = `You are a dream analysis expert. Analyze the following collection of dreams and extract recurring symbols, themes, characters, places, objects, and emotions.

Return a JSON object with exactly these categories:
{
  "people": [{"name": "symbol name", "count": number, "description": "brief note"}],
  "places": [{"name": "symbol name", "count": number, "description": "brief note"}],
  "objects": [{"name": "symbol name", "count": number, "description": "brief note"}],
  "themes": [{"name": "symbol name", "count": number, "description": "brief note"}],
  "emotions": [{"name": "symbol name", "count": number, "description": "brief note"}]
}

Rules:
- Count how many different dreams each symbol appears in (not total mentions)
- Sort each category by count descending
- Include up to 10 items per category
- Only include symbols that appear in at least 1 dream
- Be specific but not overly granular (e.g. "Water/Ocean" not "Pacific Ocean wave #3")
- Return ONLY valid JSON, no markdown or extra text`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here are ${dreams.length} dreams to analyze:\n\n${dreamTexts}` },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const symbols = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ symbols, dream_count: dreams.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-dream-symbols error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
