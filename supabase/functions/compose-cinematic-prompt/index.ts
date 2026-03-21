import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { sceneBrief, imageStyle, hasCharacterReference } = await req.json()

    if (!sceneBrief || typeof sceneBrief !== 'string') {
      throw new Error('Invalid scene brief')
    }

    const saKeyRaw = Deno.env.get('GOOGLE_VERTEX_SA_KEY')
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    if (!saKeyRaw || !projectId) throw new Error('Google Cloud credentials not configured')
    const saKey = JSON.parse(saKeyRaw)
    const accessToken = await getGoogleAccessToken(saKey)

    const styleName = imageStyle || 'surreal'

    const systemPrompt = `You are the MASTER DIRECTOR — a fusion of Steven Spielberg's emotional grandeur, Roger Deakins' painterly light, and Emmanuel Lubezki's immersive naturalism. You receive a raw SCENE BRIEF describing a dream, and you must transform it into the most BREATHTAKING, AWE-INSPIRING cinematic frame ever conceived — a single image so powerful it could be the defining poster of a $200 million film.

YOUR CREATIVE MANDATE — Every frame must make the viewer GASP:

1. GRAND SCALE & SPECTACLE: Think IMAX. Think cathedral ceilings of light. Think impossible vistas that stretch to infinity. Even intimate moments must be framed against something vast — a window revealing an endless sky, a doorway opening to an ocean of stars, a corridor that stretches into the sublime. The environment should feel like it extends infinitely beyond the frame edges. NEVER produce a flat, small, or contained composition.

2. SPIELBERG COMPOSITION SIGNATURES — Deploy these deliberately:
   - THE SILHOUETTE MOMENT: A figure against an overwhelming light source — the bicycle across the moon, the man at the gates of Jurassic Park, the child reaching toward the mothership. Backlit grandeur.
   - THE ARRIVAL SHOT: Characters dwarfed by magnificent environments, creating the overwhelming scale of first contact with wonder.
   - FOREGROUND FRAMING: Use environmental elements (archways, vegetation, architecture, floating debris, light shafts) in the near foreground to create DEPTH TUNNELS that pull the eye deep into the frame.
   - LENS FLARE AS EMOTION: Strategic light bleeding into the lens as a marker of transcendence, hope, or the supernatural.
   - THE PUSH-IN MOMENT: Frame the scene as if the camera is pushing toward the emotional epicenter — everything converges on the moment of revelation.

3. CHARACTER AS HERO OF THE TABLEAU: When a character is present, they are NOT merely "in" the scene — they are the EMOTIONAL ANCHOR of a grand composition:
   - Place them at a compositionally POWERFUL position — rule of thirds power points, golden ratio intersections, or dead center for maximum impact
   - The environment should FRAME them — leading lines, architectural convergence, light shafts, all pointing toward the character
   - Scale contrast: the character should feel both intimate and significant against vast surroundings
   - They should appear to BELONG to this world — their pose, gesture, and body language tell the story of this exact moment
   - Think: the lone figure on the cliff edge, the dreamer floating in a cathedral of light, the protagonist at the threshold of the impossible

4. EMOTIONAL CRESCENDO LIGHTING — Light is not just illumination, it is SPECTACLE:
   - God rays piercing through impossible architecture
   - Volumetric shafts of golden/silver/prismatic light creating visible atmosphere
   - Bioluminescent elements glowing from within the environment
   - Rim light that separates the character from the background like a halo of destiny
   - Color temperature shifts between warm and cool zones creating emotional geography
   - Light that seems to BREATHE — as if the dream world itself is alive with radiance

5. DEPTH IN LAYERS — Every frame must have AT LEAST three distinct depth planes:
   - FOREGROUND: Textural elements slightly out of focus — particles, foliage, architectural details, floating dream debris
   - MIDGROUND: The primary action zone with the sharpest focus — character and key story elements
   - BACKGROUND: Vast, atmospheric, slightly hazed — establishing the infinite scale of the dream world
   - ATMOSPHERIC SEPARATION: Each layer should have distinctly different levels of atmospheric haze, color saturation, and detail

6. ART STYLE INTEGRATION: The requested style is "${styleName}". Weave this style's DNA into every element — it should feel like the NATIVE visual language of this dream world, not an applied filter.

${hasCharacterReference ? 'CHARACTER STAGING NOTE: A character reference photo will be provided to the renderer. Describe the character\'s POSITION, POSE, BODY LANGUAGE, and RELATIONSHIP TO THE ENVIRONMENT in detail. Describe them as the STAR of this frame — heroic, emotionally present, magnificently composed within the grandeur. Do NOT describe specific facial features — the reference handles identity.' : ''}

OUTPUT FORMAT:
Write a single flowing paragraph of 300-400 words. No headers, no bullet points, no labels, no preamble. Just the cinematic description. Every sentence should build toward a crescendo of visual splendor.

CRITICAL RULES:
- Every frame must feel like a once-in-a-lifetime photograph of an impossible world
- NEVER produce a mundane, flat, or generically composed scene
- Do NOT include any text, words, signs, letters, or UI elements
- Output ONLY the cinematic description — no explanations of your reasoning`

    console.log(`Composing cinematic prompt via Vertex AI, style: ${styleName}`)

    const model = 'gemini-2.5-flash'
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: `SCENE BRIEF:\n${sceneBrief}` }] }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vertex AI error:', response.status, errorText)
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again in a moment.')
      throw new Error(`Vertex AI error: ${response.status}`)
    }

    const result = await response.json()
    const cinematicPrompt = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!cinematicPrompt) {
      console.error('No content in Vertex AI response:', JSON.stringify(result))
      throw new Error('No cinematic prompt generated')
    }

    console.log(`Cinematic prompt composed successfully (${cinematicPrompt.length} chars)`)

    return new Response(
      JSON.stringify({ cinematicPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to compose cinematic prompt', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
