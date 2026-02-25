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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { dreamContent, imageUrl } = await req.json();
    if (!dreamContent && !imageUrl) {
      throw new Error("dreamContent or imageUrl is required");
    }

    const systemPrompt = `You are a cinematic animation director creating a 4-second motion directive for an AI video generator (image-to-video). You receive a dream narrative and the dream's generated image. Analyze BOTH the visual composition of the image AND the emotional arc of the dream text.

Your directive must:
- Describe SPECIFIC motion that serves the dream's emotional core
- Reference visual elements you observe in the image (colors, subjects, environment)
- Include camera movement (slow push-in, gentle pan, static with parallax, subtle dolly)
- Include environmental motion (wind in hair, rippling water, drifting clouds, flickering light, swirling particles)
- Stay achievable in 4 seconds — no scene changes, no complex sequences
- Feel dreamlike: slightly slow, atmospheric, ethereal

Output ONLY the animation directive. No preamble, no explanation. 1-2 sentences, max 80 words.`;

    const userContent: any[] = [];

    if (imageUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }

    userContent.push({
      type: "text",
      text: dreamContent
        ? `Dream narrative: ${dreamContent}`
        : "Analyze the image and create a subtle 4-second animation directive.",
    });

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
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const prompt =
      data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("compose-animation-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
