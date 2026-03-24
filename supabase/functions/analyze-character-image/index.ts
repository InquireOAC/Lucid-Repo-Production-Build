import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { photoUrl } = await req.json()
    if (!photoUrl) throw new Error('Missing photoUrl')

    console.log(`Analyzing character image for user ${user.id}`)

    const saKeyRaw = Deno.env.get('GOOGLE_VERTEX_SA_KEY')
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    if (!saKeyRaw || !projectId) throw new Error('Google Cloud credentials not configured')
    const saKey = JSON.parse(saKeyRaw)
    const accessToken = await getGoogleAccessToken(saKey)

    const analysisPrompt = `You are a visual identity analyst. Analyze this reference photo and produce an extremely detailed visual fingerprint description. This will be used to recreate this person's likeness in AI-generated dream scenes.

Describe IN DETAIL:

FACE:
- Overall face shape (oval, round, square, heart, etc.)
- Forehead size and shape
- Cheekbone prominence
- Jawline definition and shape
- Chin shape

EYES:
- Eye shape (almond, round, hooded, monolid, etc.)
- Eye size relative to face
- Eye color with specific shade details
- Eyebrow shape, thickness, arch
- Distance between eyes

NOSE:
- Bridge width and height
- Tip shape (pointed, rounded, upturned, etc.)
- Nostril shape and width
- Overall nose size relative to face

MOUTH/LIPS:
- Lip fullness (upper vs lower)
- Lip shape and cupid's bow definition
- Mouth width
- Natural expression

SKIN:
- Exact skin tone (use descriptive terms like warm olive, cool beige, deep brown, fair with pink undertones, etc.)
- Texture and any distinctive marks (freckles, moles, dimples, scars)
- Under-eye area description

HAIR:
- Exact color with highlights/lowlights
- Texture (straight, wavy, curly, coily)
- Length and style
- Hairline shape
- Volume and density

BODY (if visible):
- Build/body type
- Shoulder width
- Approximate height impression
- Posture

DISTINCTIVE FEATURES:
- Any unique identifying characteristics
- Facial asymmetries
- Expression tendencies
- Overall impression/energy

Format as a single continuous paragraph that could be injected into an image generation prompt. Do NOT use headers or bullet points in the output. Write it as flowing descriptive text.`

    // Fetch photo and convert to base64
    const imgRes = await fetch(photoUrl)
    if (!imgRes.ok) throw new Error('Failed to fetch photo')
    const buffer = await imgRes.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    const base64 = btoa(binary)
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg'

    const model = 'gemini-2.5-flash'
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: analysisPrompt },
              { inlineData: { mimeType, data: base64 } },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vertex AI error:', response.status, errorText)
      throw new Error(`AI analysis failed: ${response.status}`)
    }

    const data = await response.json()
    const fingerprint = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!fingerprint) throw new Error('No fingerprint generated')

    console.log(`Visual fingerprint generated, length: ${fingerprint.length}`)

    const { error: updateError } = await supabase
      .from('ai_context')
      .update({ visual_fingerprint: fingerprint, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error saving fingerprint:', updateError)
      throw new Error('Failed to save visual fingerprint')
    }

    return new Response(
      JSON.stringify({ fingerprint }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to analyze character image' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
