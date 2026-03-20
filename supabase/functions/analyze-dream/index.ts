import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    iat: now,
    exp: now + 3600,
  };
  const encode = (obj: any) => {
    const json = JSON.stringify(obj);
    const b64 = btoa(json);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const unsignedToken = `${headerB64}.${payloadB64}`;
  const pemContents = saKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${unsignedToken}.${sigB64}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get Google access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

const VALID_TASKS = ['analyze_dream', 'generate_image_prompt', 'create_image_prompt']
const MAX_CONTENT_LENGTH = 5000

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !data?.claims) {
      throw new Error('Unauthorized')
    }

    const userId = data.claims.sub

    const { dreamContent, task = 'analyze_dream' } = await req.json()

    if (!dreamContent || typeof dreamContent !== 'string') {
      throw new Error('Invalid dream content')
    }
    if (dreamContent.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Dream content too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.`)
    }
    if (!VALID_TASKS.includes(task)) {
      throw new Error('Invalid task type')
    }

    console.log(`Processing ${task} for user ${userId}, content length: ${dreamContent.length}`)

    const systemPrompt = (task === 'create_image_prompt' || task === 'generate_image_prompt')
      ? `You are a world-class cinematographer and concept artist specializing in dream visualization. Your task is to transform a dream description into a rich CINEMATIC SCENE BRIEF for an AI image generator.

OUTPUT FORMAT — Write a single, flowing, descriptive paragraph (120-180 words) that covers ALL of the following dimensions in natural language. Do NOT use headers, bullet points, or labels. Weave everything together as a unified scene description.

DIMENSIONS TO COVER IN YOUR OUTPUT:
1. ENVIRONMENT: Specific setting with world-building detail — architecture, landscape, biome, time of day, weather conditions, season
2. LIGHTING: Primary light source (sun, moon, neon, fire, bioluminescence), secondary fill light, color temperature (warm/cool/mixed), light quality (hard, soft, volumetric, diffused)  
3. CAMERA: Shot type (wide establishing, medium, close-up, over-the-shoulder), camera angle (eye-level, low-angle hero shot, bird's-eye, dutch tilt), implied focal length and depth of field
4. CHARACTER: Position in scene, action or pose, emotional state, relationship to environment
5. ATMOSPHERE: Particle effects, volumetric haze, fog, dust motes, smoke, rain, snow, magical energy
6. COLOR STORY: Dominant palette (2-3 primary hues), accent color, emotional resonance of the palette

RULES:
- Frame the scene as a MOVIE FRAME — every element intentionally composed
- The character is a NATIVE INHABITANT of this world, not a visitor
- Use cinematic language: "golden-hour rim light", "low-angle hero shot", "volumetric god rays", "atmospheric depth"
- Do NOT include any text, words, signs, or UI elements in the description
- Output ONLY the scene description — no preamble, no explanation`
      : `You are a professional dream analyst trained in Jungian psychology, depth psychology, and modern dream science. Your role is to provide warm, insightful, and personally resonant dream interpretations.

RESPONSE FORMAT — You MUST structure your response using exactly these five section headers in bold, each followed by 2-4 sentences of interpretation. Do not deviate from this structure.

**Core Narrative**
Describe the dream's central story arc and the emotional journey it maps. What situation or psychological theme is being played out? Use second person ("Your dream...") to make it feel personal and direct.

**Symbols & Archetypes**
Identify the 2-4 most significant symbols, objects, or figures in the dream. For each, explain its psychological and universal archetypal meaning (drawing from Jungian, transpersonal, or cross-cultural traditions). Acknowledge that personal associations always take precedence over universal meanings.

**Emotional Undercurrents**
Reflect on the emotional tone woven through the dream — not just surface feelings but the deeper emotional current beneath. What unresolved feelings, unmet needs, or emotional truths might this dream be touching? Be compassionate and non-judgmental.

**Message**
Synthesize what the dreamer's subconscious may be communicating. What might this dream be pointing toward in the dreamer's waking life — a decision, a relationship, an inner conflict, an opportunity for growth? Frame this as a possibility, not a prescription.

**Invitation**
Close with one specific, grounded, actionable reflection practice the dreamer can take into their waking life. This could be a journaling prompt, a contemplative question, a small intentional act, or a creative exercise. Make it concrete and immediately doable.

TONE RULES:
- Write in warm, accessible language — never clinical or academic
- Always use second person ("Your dream...", "You may be...", "Consider...")
- Acknowledge that dream meaning is deeply personal and context-dependent
- Do not be prescriptive — offer possibilities, not definitive interpretations
- Express genuine curiosity and respect for the dreamer's inner world
- Each section should be 2-4 sentences — substantive but not exhausting`

    console.log(`Generating ${task} using Vertex AI gemini-3-flash-preview`)

    const saKeyRaw = Deno.env.get('GOOGLE_VERTEX_SA_KEY')
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    if (!saKeyRaw || !projectId) {
      throw new Error('Google Cloud credentials not configured')
    }
    const saKey = JSON.parse(saKeyRaw)
    const accessToken = await getGoogleAccessToken(saKey)

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
        contents: [{ role: 'user', parts: [{ text: dreamContent }] }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vertex AI error:', response.status, errorText)
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      throw new Error(`Vertex AI error: ${response.status}`)
    }

    const result = await response.json()
    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!analysis) {
      console.error('No content in Vertex AI response:', JSON.stringify(result))
      throw new Error('No analysis generated')
    }

    console.log(`Successfully generated ${task} result`)

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze dream', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
