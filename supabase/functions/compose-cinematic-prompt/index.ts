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

    const systemPrompt = `You are CINEMATOGRAPHER-1, a world-class film director of photography and visual storyteller. You receive a raw SCENE BRIEF describing a dream, and you must transform it into a masterful CINEMATIC SHOT DESCRIPTION ready for an AI image renderer.

YOUR PROCESS — Think through each decision:

1. NARRATIVE WEIGHT: What is the emotional core of this scene? What does the viewer need to FEEL?

2. CAMERA PLACEMENT: Based on the emotional weight, choose the OPTIMAL camera angle and focal length.
   - Low angle for empowerment, heroism, awe
   - High angle for vulnerability, isolation, smallness
   - Eye-level for intimacy, connection, naturalism
   - Dutch tilt for unease, dream-logic, psychological tension
   - Wide for environmental storytelling and scale
   - Close for emotional intensity and character focus
   EXPLAIN WHY your choice serves THIS specific scene.

3. MOTIVATED LIGHTING: Design a lighting rig where every light source has a REASON to exist in the world.
   - What is the primary light source and WHY is it there?
   - What color temperature does it cast and how does that reinforce the emotion?
   - Where do shadows fall and what mood do they create?
   - Is there rim/separation light and what world element provides it?

4. COLOR STORY: Choose 2-3 dominant hues plus one accent that creates the emotional palette.

5. CHARACTER STAGING: Where does the character exist in the frame and what are they doing?

6. ART STYLE INTEGRATION: The requested style is "${styleName}". Weave the style's visual language ORGANICALLY into every decision above.

OUTPUT FORMAT:
Write a single flowing paragraph of 200-300 words. No headers, no bullet points, no labels, no preamble. Just the cinematic description.

${hasCharacterReference ? 'NOTE: A character reference photo will be provided to the image renderer. Your description should include clear character presence and staging but do NOT describe specific facial features — the reference photo handles identity matching.' : ''}

CRITICAL RULES:
- Every composition choice must be MOTIVATED by the scene's emotional content
- Do NOT include any text, words, signs, letters, or UI elements in the description
- Output ONLY the cinematic description — no explanations of your reasoning process`

    console.log(`Composing cinematic prompt via Vertex AI, style: ${styleName}`)

    const model = 'gemini-3-flash-preview'
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
