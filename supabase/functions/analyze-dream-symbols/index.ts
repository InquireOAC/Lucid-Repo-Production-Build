import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getGoogleAccessToken(saKey: any): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: saKey.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  };
  const encode = (obj: any) => {
    const b64 = btoa(JSON.stringify(obj));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const pemContents = saKey.private_key.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(unsignedToken));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${unsignedToken}.${sigB64}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`Failed to get Google access token: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
}

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

    const saKeyRaw = Deno.env.get("GOOGLE_VERTEX_SA_KEY");
    const projectId = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");
    if (!saKeyRaw || !projectId) throw new Error("Google Cloud credentials not configured");
    const saKey = JSON.parse(saKeyRaw);
    const accessToken = await getGoogleAccessToken(saKey);

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

    const model = "gemini-3-flash-preview";
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`;

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
