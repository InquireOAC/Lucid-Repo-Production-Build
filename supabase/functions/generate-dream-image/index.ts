import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PROMPT_LENGTH = 15000

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

async function fetchImageAsBase64(url: string): Promise<{ base64: string; contentType: string } | null> {
  try {
    console.log("Fetching image:", url.substring(0, 100))
    const response = await fetch(url)
    if (!response.ok) {
      console.warn("Failed to fetch image:", response.status)
      return null
    }
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    const base64 = btoa(binary)
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    console.log("Image fetched, size:", bytes.length)
    return { base64, contentType }
  } catch (err) {
    console.warn("Error fetching image:", err)
    return null
  }
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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { prompt, referenceImageUrl, imageStyle, outfitImageUrl, accessoryImageUrl } = await req.json()

    if (!prompt || typeof prompt !== 'string') throw new Error('Invalid prompt')
    if (prompt.length > MAX_PROMPT_LENGTH) throw new Error(`Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`)

    console.log(`Generating image via Vertex AI for user ${user.id}, prompt length: ${prompt.length}, hasReference: ${!!referenceImageUrl}, hasOutfit: ${!!outfitImageUrl}, hasAccessory: ${!!accessoryImageUrl}, style: ${imageStyle}`)

    const saKeyRaw = Deno.env.get('GOOGLE_VERTEX_SA_KEY')
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID')
    if (!saKeyRaw || !projectId) throw new Error('Google Cloud credentials not configured')
    const saKey = JSON.parse(saKeyRaw)
    const accessToken = await getGoogleAccessToken(saKey)

    const contentParts: any[] = []

    // === CINEMATIC RENDERING DIRECTIVE ===
    contentParts.push({
      text: `[CINEMATIC RENDERING DIRECTIVE — READ THIS FIRST]

MANDATORY OUTPUT FORMAT: Generate this image in PORTRAIT orientation with a 9:16 aspect ratio (e.g., 1024x1820 or similar vertical dimensions). The frame MUST be taller than it is wide. This is non-negotiable.

You are a world-class cinematographer and visual effects supervisor generating a SINGLE UNIFIED MOVIE FRAME from a dream world. Every image you produce must read as a real frame from a film set in an alternate reality — not an AI-generated composite.

PRIME DIRECTIVES:
1. THINK IN 3D SPACE FIRST — Before rendering anything, mentally construct the complete 3D environment: its geometry, atmosphere, light sources, and physics.
2. ONE UNIFIED RENDER — Generate the entire frame — character AND environment — in a single unified compositional pass.
3. REFERENCE IMAGES ARE CASTING REFERENCES — Any reference images provided show you WHO the character is. They do NOT tell you the scene, background, lighting, or environment.
4. UNIFIED PHYSICS — The character obeys the same physical laws as the environment.

ABSOLUTE ANTI-COMPOSITE LAWS:
✗ Halo or cut-out edges around any element
✗ Character lit from different direction or color temperature than the environment
✗ Character appears to float without ground-contact shadow
✗ Character detail sharpness inconsistent with their depth in the scene
✗ Any element that looks pasted-in, layered, or composited

Now render the following cinematic dream scene:`
    })

    // Face / identity reference
    if (referenceImageUrl) {
      const img = await fetchImageAsBase64(referenceImageUrl)
      if (img) {
        contentParts.push({
          text: '[CHARACTER_IDENTITY_REFERENCE] The following image is the CHARACTER REFERENCE. Extract ONLY the person\'s identity (face, hair, skin, body) from this image. Do NOT extract the background, lighting, or environment.'
        })
        contentParts.push({
          inlineData: { mimeType: img.contentType, data: img.base64 }
        })
        contentParts.push({
          text: `[CHARACTER-WORLD INTEGRATION CONTRACT] This character is a NATIVE INHABITANT of the dream world. Render them physically embedded in the 3D space: lit by the same light sources, affected by the same atmospheric conditions.`
        })
      }
    }

    // Outfit reference
    if (outfitImageUrl) {
      const img = await fetchImageAsBase64(outfitImageUrl)
      if (img) {
        contentParts.push({
          text: '[OUTFIT_REFERENCE] Extract ONLY the clothing, garments, and outfit from this image. Dress the character in this EXACT outfit.'
        })
        contentParts.push({
          inlineData: { mimeType: img.contentType, data: img.base64 }
        })
      }
    }

    // Accessory reference
    if (accessoryImageUrl) {
      const img = await fetchImageAsBase64(accessoryImageUrl)
      if (img) {
        contentParts.push({
          text: '[ACCESSORY_REFERENCE] Extract ONLY the accessories from this image. Add these EXACT accessories to the character.'
        })
        contentParts.push({
          inlineData: { mimeType: img.contentType, data: img.base64 }
        })
      }
    }

    // Add the prompt text
    contentParts.push({ text: prompt })

    // Final reinforcement of vertical orientation
    contentParts.push({
      text: `[FINAL MANDATORY REMINDER] The output image MUST be in PORTRAIT / VERTICAL orientation (9:16 aspect ratio — taller than wide). Do NOT produce a landscape or square image under any circumstances.`
    })

    const model = 'gemini-2.5-flash-image'
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: contentParts,
          }
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    })

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again in a moment.')
      const errorText = await response.text()
      console.error("Vertex AI error:", response.status, errorText)
      throw new Error(`Vertex AI error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Vertex AI response received")

    // Extract image from Vertex AI native response
    // Vertex returns candidates[].content.parts[] where image parts have inlineData
    let imageBase64: string | null = null
    let imageMimeType = 'image/png'

    const parts = data.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data
        imageMimeType = part.inlineData.mimeType || 'image/png'
        break
      }
    }

    if (!imageBase64) {
      console.error("No image in Vertex AI response:", JSON.stringify(data).substring(0, 800))
      throw new Error('No image data returned from AI')
    }

    console.log("Image generated, uploading to storage...")

    const binaryString = atob(imageBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const ext = imageMimeType.includes('png') ? 'png' : 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)

    const { error: uploadError } = await adminSupabase.storage
      .from('dream-images')
      .upload(fileName, bytes, {
        contentType: imageMimeType,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      throw new Error('Failed to upload image to storage')
    }

    const { data: urlData } = adminSupabase.storage
      .from('dream-images')
      .getPublicUrl(fileName)

    const imageUrl = urlData.publicUrl
    console.log("Image uploaded successfully:", imageUrl)

    return new Response(
      JSON.stringify({
        imageUrl,
        image_url: imageUrl,
        generatedImage: imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate image' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
