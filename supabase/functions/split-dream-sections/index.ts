import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a narrative analyst. Split the given dream story into 2-4 logical narrative sections. Each section should represent a distinct scene, shift in setting, or emotional turning point. Return ONLY valid JSON array.`,
            },
            {
              role: "user",
              content: `Split this dream narrative into 2-4 sections. Each section should be a meaningful story beat. Return a JSON array like: [{"section":1,"text":"..."},{"section":2,"text":"..."}]

Dream text:
${content}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_sections",
                description: "Return the dream split into narrative sections",
                parameters: {
                  type: "object",
                  properties: {
                    sections: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          section: { type: "number" },
                          text: { type: "string" },
                        },
                        required: ["section", "text"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["sections"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_sections" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const sections = parsed.sections;

    if (!Array.isArray(sections) || sections.length < 2) {
      throw new Error("Invalid sections response");
    }

    return new Response(JSON.stringify({ sections }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("split-dream-sections error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
