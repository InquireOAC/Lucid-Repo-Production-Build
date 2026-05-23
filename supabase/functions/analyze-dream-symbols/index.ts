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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
const dreamTexts = dreams.map((d: { title: string; content: string }, i: number) =>
      `Dream ${i + 1}: "${d.title}" - ${d.content}`
    ).join("\n\n");

    const systemPrompt = `You are a dream analysis expert. Analyze the following collection of dreams and extract recurring symbols, themes, characters, places, objects, and emotions.

Rules:
- Count how many different dreams each symbol appears in (not total mentions)
- Sort each category by count descending
- Include up to 10 items per category
- Only include symbols that appear in at least 1 dream
- Be specific but not overly granular (e.g. "Water/Ocean" not "Pacific Ocean wave #3")`;
const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: "user", parts: [{ text: `Here are ${dreams.length} dreams to analyze:\n\n${dreamTexts}` }] },
        ],
        tools: [
          {
            functionDeclarations: [
              {
                name: "return_symbols",
                description: "Return the extracted dream symbols organized by category",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    people: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          count: { type: "NUMBER" },
                          description: { type: "STRING" },
                        },
                        required: ["name", "count", "description"],
                      },
                    },
                    places: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          count: { type: "NUMBER" },
                          description: { type: "STRING" },
                        },
                        required: ["name", "count", "description"],
                      },
                    },
                    objects: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          count: { type: "NUMBER" },
                          description: { type: "STRING" },
                        },
                        required: ["name", "count", "description"],
                      },
                    },
                    themes: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          count: { type: "NUMBER" },
                          description: { type: "STRING" },
                        },
                        required: ["name", "count", "description"],
                      },
                    },
                    emotions: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          count: { type: "NUMBER" },
                          description: { type: "STRING" },
                        },
                        required: ["name", "count", "description"],
                      },
                    },
                  },
                  required: ["people", "places", "objects", "themes", "emotions"],
                },
              },
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["return_symbols"],
          },
        },
        generationConfig: {
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vertex AI error:", response.status, errorText);
      throw new Error(`Vertex AI error: ${response.status}`);
    }

    const data = await response.json();
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (!functionCall) {
      throw new Error("No function call in response");
    }

    const symbols = functionCall.args;

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
