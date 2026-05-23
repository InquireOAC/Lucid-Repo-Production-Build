import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if we have a recent insight (< 3 days old)
    const { data: existing } = await supabase
      .from("dream_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      const ageMs = Date.now() - new Date(existing.generated_at).getTime();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (ageMs < threeDaysMs) {
        return new Response(JSON.stringify(existing), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: stats, error: statsErr } = await supabase.rpc(
      "get_lucid_stats",
      { p_user_id: user.id }
    );
    if (statsErr) throw statsErr;

    if (!stats || stats.total_entries < 5) {
      return new Response(
        JSON.stringify({
          summary_message: null,
          recommendation_message: null,
          motivation_message: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are an expert lucid dreaming coach. Based on the following dream statistics for a user, provide personalized coaching.

Stats:
- Total dreams logged: ${stats.total_entries}
- Total lucid dreams: ${stats.total_lucid_dreams}
- Lucid dreams this month: ${stats.lucid_this_month}
- Current recall streak: ${stats.current_recall_streak} days
- Longest recall streak: ${stats.longest_recall_streak} days
- Current lucid streak: ${stats.current_lucid_streak} days
- Average word count per entry: ${stats.avg_word_count}
- Average lucidity level: ${stats.avg_lucidity_level} (1=slight, 2=moderate, 3=full)
- Top techniques: ${JSON.stringify(stats.techniques)}
- Top dream symbols: ${JSON.stringify(stats.top_symbols?.slice(0, 5))}`;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [
          {
            functionDeclarations: [
              {
                name: "return_insight",
                description: "Return the personalized dream coaching insight",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    summary: { type: "STRING", description: "One sentence summarizing their current dream practice status." },
                    recommendation: { type: "STRING", description: "One actionable tip or recommendation." },
                    motivation: { type: "STRING", description: "One short motivational message." },
                  },
                  required: ["summary", "recommendation", "motivation"],
                },
              },
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["return_insight"],
          },
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Vertex AI error:", aiResponse.status, errText);
      throw new Error(`Vertex AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const functionCall = aiData.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    let parsed: { summary: string; recommendation: string; motivation: string };
    if (functionCall?.args) {
      parsed = functionCall.args;
    } else {
      parsed = {
        summary: "Your dream practice is progressing well.",
        recommendation: "Try maintaining a consistent journaling schedule.",
        motivation: "Every dream logged brings you closer to lucidity.",
      };
    }

    const insightData = {
      user_id: user.id,
      summary_message: parsed.summary,
      recommendation_message: parsed.recommendation,
      motivation_message: parsed.motivation,
      generated_at: new Date().toISOString(),
      based_on_entry_count: stats.total_entries,
      based_on_date_range: "all",
    };

    if (existing) {
      await supabase
        .from("dream_insights")
        .update(insightData)
        .eq("id", existing.id);
    } else {
      await supabase.from("dream_insights").insert(insightData);
    }

    return new Response(JSON.stringify(insightData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
