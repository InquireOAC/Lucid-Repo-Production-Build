import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const saKeyRaw = Deno.env.get("GOOGLE_VERTEX_SA_KEY");
    const projectId = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");
    if (!saKeyRaw || !projectId) throw new Error("Google Cloud credentials not configured");
    const saKey = JSON.parse(saKeyRaw);
    const accessToken = await getGoogleAccessToken(saKey);

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

    const userParts: any[] = [];

    if (imageUrl) {
      // Fetch image and convert to inlineData
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binary);
        const mimeType = imgRes.headers.get("content-type") || "image/png";
        userParts.push({
          inlineData: { mimeType, data: base64 },
        });
      }
    }

    userParts.push({
      text: dreamContent
        ? `Dream narrative: ${dreamContent}`
        : "Analyze the image and create a subtle 4-second animation directive.",
    });

    const model = "gemini-2.5-flash";
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: userParts }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Vertex AI error:", response.status, errText);
      throw new Error(`Vertex AI error: ${response.status}`);
    }

    const data = await response.json();
    const prompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("compose-animation-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
