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
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here are ${dreams.length} dreams to analyze:\n\n${dreamTexts}` },
        ],
        temperature: 0.3,
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_symbols',
              description: 'Return the extracted dream symbols organized by category',
              parameters: {
                type: 'object',
                properties: {
                  people: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' }, description: { type: 'string' } }, required: ['name','count','description'], additionalProperties: false } },
                  places: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' }, description: { type: 'string' } }, required: ['name','count','description'], additionalProperties: false } },
                  objects: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' }, description: { type: 'string' } }, required: ['name','count','description'], additionalProperties: false } },
                  themes: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' }, description: { type: 'string' } }, required: ['name','count','description'], additionalProperties: false } },
                  emotions: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'number' }, description: { type: 'string' } }, required: ['name','count','description'], additionalProperties: false } },
                },
                required: ['people','places','objects','themes','emotions'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'return_symbols' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No function call in response");
    }
    const symbols = JSON.parse(toolCall.function.arguments);

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
