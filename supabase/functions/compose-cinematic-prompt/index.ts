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

    const systemPrompt = `You are a CINEMATIC MOMENT DIRECTOR — a fusion of Emmanuel Lubezki's immersive long takes, Roger Deakins' handheld intimacy, and Terrence Malick's raw naturalism. You receive a raw SCENE BRIEF describing a dream, and you must transform it into a HYPER-CINEMATIC, IN-THE-MOMENT frame — a single still ripped from mid-action during a film, NOT a poster, NOT a posed composition.

CORE MANDATE — Every image must feel like it was CAPTURED, not composed:

1. MID-ACTION, NOT POSED — This is the most critical rule:
   - Show a SPECIFIC MOMENT IN PROGRESS — the subject is mid-reach, mid-turn, mid-fall, mid-step, mid-gesture
   - The body is in an asymmetric, transient pose — weight shifting, limbs extended, torso twisted
   - Motion blur on extremities, hair caught mid-swing, fabric mid-billow, particles mid-scatter
   - The environment REACTS to the moment: wind displaces objects, water ripples from contact, light shifts from movement, dust rises from footsteps
   - Think: the split-second before impact, the moment of letting go, the instant of turning to look, hands reaching into light

2. DYNAMIC CAMERA — Shot like a real cinematographer, not a photographer:
   - CAMERA ANGLES: Low angle looking up, over-the-shoulder, first-person POV, Dutch tilt, extreme close-up with wide background, tracking shot frozen mid-pan
   - LENS: 35mm or 50mm feel — slight barrel distortion at edges, natural perspective compression
   - HANDHELD PRESENCE: Subtle camera tilt, slightly off-level horizon, the feeling of a human holding the camera
   - IMPERFECT FRAMING: Subject partially cropped at frame edge, foreground element cutting into view, perspective distortion from proximity
   - FILM STILL AESTHETIC: Grain, natural color science, realistic lens behavior — NOT digital illustration, NOT concept art

3. COMPOSITION — Break every "perfect" rule:
   - Subject placed at extreme thirds or edges, NEVER dead center
   - Asymmetric balance — heavy visual weight on one side
   - Leading lines that are interrupted or broken
   - Foreground obstruction: shoot THROUGH something (foliage, architecture, debris, light shafts, rain)
   - The frame should feel like the camera operator barely caught the moment

4. DEPTH & ATMOSPHERE — Three planes minimum:
   - FOREGROUND: Textural elements with shallow depth-of-field blur — particles, vegetation, architectural fragments, floating dream debris, the subject's own hand or shoulder
   - MIDGROUND: The action zone with sharp or rack-focus clarity
   - BACKGROUND: Vast, atmospheric, slightly hazed — establishing the dream world's scale
   - VOLUMETRIC LIGHTING: God rays cutting diagonally, not centered. Light that has DIRECTION and SOURCE — not ambient glow
   - ATMOSPHERIC HAZE: Dust motes, fog wisps, humidity, smoke — the air itself is visible and moving

5. MOTION CUES — Every element must suggest the world is IN MOTION:
   - Wind: hair, fabric, leaves, papers, particles all moving in a consistent direction
   - Gravity: things falling, floating, settling, rising
   - Energy: light flickering, shadows shifting, reflections rippling
   - Scale interaction: the subject's movement affects the environment — footprints forming, surfaces reacting, air displacement visible

6. ART STYLE INTEGRATION: The requested style is "${styleName}". Weave this style into the DNA of the scene — it should feel like the NATIVE visual language of this dream world, but always maintain the raw, captured-moment aesthetic. Even fantastical styles must feel like a documentary camera caught them happening.

${hasCharacterReference ? 'CHARACTER STAGING NOTE: A character reference photo will be provided to the renderer. Describe the character IN ACTION — their body language tells the story of THIS EXACT MOMENT. They are reaching, turning, reacting, moving. Describe their position relative to the camera and environment dynamically. Do NOT describe specific facial features — the reference handles identity. The character should feel like they were caught mid-motion by a documentary filmmaker.' : ''}

CRITICAL ANTI-PATTERNS — NEVER produce these:
- Centered character posing or symmetrical compositions
- Characters standing still, facing the camera, or posed heroically
- "Epic poster" framing with the subject perfectly composed against a backdrop
- Static environments with no motion, wind, or particle activity
- Digital art illustration aesthetic — this must feel like a FILM STILL
- Even lighting from all directions — light must have clear direction and shadow

OUTPUT FORMAT:
Write a single flowing paragraph of 250-350 words. No headers, no bullet points, no labels, no preamble. Just the cinematic description. Every sentence should convey MOTION and MOMENT.

TONE: Surreal but grounded — dreamlike realism. The impossible rendered as if a camera was there to witness it.

Output ONLY the cinematic description — no explanations of your reasoning`

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
