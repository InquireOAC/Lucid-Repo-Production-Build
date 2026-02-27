
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PROMPT_LENGTH = 15000

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
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
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
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { prompt, referenceImageUrl, imageStyle, outfitImageUrl, accessoryImageUrl } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt')
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(`Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`)
    }

    const isPhotoRealistic = imageStyle === 'realistic' || imageStyle === 'hyper_realism'

    console.log(`Generating image for user ${user.id}, prompt length: ${prompt.length}, hasReference: ${!!referenceImageUrl}, hasOutfit: ${!!outfitImageUrl}, hasAccessory: ${!!accessoryImageUrl}, style: ${imageStyle}`)

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const contentParts: any[] = []

    // === CINEMATIC RENDERING DIRECTIVE (fires first, before all reference images) ===
    contentParts.push({
      type: 'text',
      text: `[CINEMATIC RENDERING DIRECTIVE — READ THIS FIRST]

MANDATORY OUTPUT FORMAT: Generate this image in PORTRAIT orientation with a 9:16 aspect ratio (e.g., 1024x1820 or similar vertical dimensions). The frame MUST be taller than it is wide. This is non-negotiable.

You are a world-class cinematographer and visual effects supervisor generating a SINGLE UNIFIED MOVIE FRAME from a dream world. Every image you produce must read as a real frame from a film set in an alternate reality — not an AI-generated composite.

PRIME DIRECTIVES:
1. THINK IN 3D SPACE FIRST — Before rendering anything, mentally construct the complete 3D environment: its geometry, atmosphere, light sources, and physics. This world EXISTS. The character will be placed WITHIN it.
2. ONE UNIFIED RENDER — Generate the entire frame — character AND environment — in a single unified compositional pass. Never composite elements together. Never paste a character onto a background.
3. REFERENCE IMAGES ARE CASTING REFERENCES — Any reference images provided show you WHO the character is (their identity, face, outfit). They do NOT tell you the scene, background, lighting, or environment. Those come EXCLUSIVELY from the scene description below.
4. UNIFIED PHYSICS — The character obeys the same physical laws as the environment: same gravity, same light, same atmospheric effects, same perspective rules.

CINEMATIC COMPOSITION LAWS:
- Frame the image as a director would frame a movie shot — intentional composition, clear subject hierarchy, deliberate depth of field
- Character is the PROTAGONIST of this frame — visually dominant, emotionally clear, narratively present
- Environment is the WORLD — it surrounds, contextualizes, and interacts with the character
- Apply the appropriate cinematic shot type as described in the scene (wide, medium, close-up, dutch angle, etc.)
- Color temperature must be UNIFIED across the entire frame — no mismatched warmth between character and scene

ABSOLUTE ANTI-COMPOSITE LAWS (scan for and eliminate these failure modes):
✗ Halo or cut-out edges around any element
✗ Character lit from different direction or color temperature than the environment
✗ Character appears to float without ground-contact shadow
✗ Character detail sharpness inconsistent with their depth in the scene
✗ Any element that looks pasted-in, layered, or composited
✗ Different render styles between character and environment (e.g., photorealistic figure against painted background)

Now render the following cinematic dream scene:`
    })

    // Face / identity reference
    if (referenceImageUrl) {
      const img = await fetchImageAsBase64(referenceImageUrl)
      if (img) {
        contentParts.push({
          type: 'text',
          text: '[CHARACTER_IDENTITY_REFERENCE] The following image is the CHARACTER REFERENCE. Extract ONLY the person\'s identity (face, hair, skin, body) from this image. Do NOT extract the background, lighting, or environment from this image — those come from the dream scene description below.'
        })
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${img.contentType};base64,${img.base64}` }
        })

        contentParts.push({
          type: 'text',
          text: `[CHARACTER-WORLD INTEGRATION CONTRACT] This character is a NATIVE INHABITANT of the dream world — not a visitor. Render them physically embedded in the 3D space: lit by the same light sources, affected by the same atmospheric conditions, casting shadows that match the environment's light direction. Their feet must have contact shadows. Their skin must show the color temperature of the scene's dominant light. Any fog, particles, or volumetric atmosphere must wrap around them identically to how it affects the environment. Generate as ONE unified frame.`
        })
      }
    }

    // Outfit reference
    if (outfitImageUrl) {
      const img = await fetchImageAsBase64(outfitImageUrl)
      if (img) {
        contentParts.push({
          type: 'text',
          text: '[OUTFIT_REFERENCE] The following image is the OUTFIT REFERENCE. Extract ONLY the clothing, garments, and outfit from this image. Dress the character in this EXACT outfit — replicate the style, color, fabric, and fit precisely.'
        })
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${img.contentType};base64,${img.base64}` }
        })
      }
    }

    // Accessory reference
    if (accessoryImageUrl) {
      const img = await fetchImageAsBase64(accessoryImageUrl)
      if (img) {
        contentParts.push({
          type: 'text',
          text: '[ACCESSORY_REFERENCE] The following image is the ACCESSORY REFERENCE. Extract ONLY the accessories (jewelry, glasses, hats, bags, watches, etc.) from this image. Add these EXACT accessories to the character.'
        })
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${img.contentType};base64,${img.base64}` }
        })
      }
    }

    // Add the prompt text
    contentParts.push({ type: 'text', text: prompt })

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-3-pro-image-preview',
          messages: [
            {
              role: 'user',
              content: contentParts,
            }
          ],
          modalities: ['image', 'text'],
        }),
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue generating images.')
      }
      const errorText = await response.text()
      console.error("AI Gateway error:", response.status, errorText)
      throw new Error(`AI Gateway error: ${response.status}`)
    }

    const data = await response.json()
    console.log("AI response keys:", Object.keys(data).join(', '))
    console.log("Choice message keys:", JSON.stringify(Object.keys(data.choices?.[0]?.message || {})))

    // Handle both response formats:
    // 1. message.images array (older format)
    // 2. message.content array with image_url parts (Gemini native format)
    let dataUrl: string | null = null

    const message = data.choices?.[0]?.message

    // Format 1: message.images[]
    if (message?.images && message.images.length > 0) {
      dataUrl = message.images[0]?.image_url?.url ?? null
    }

    // Format 2: message.content[] with parts
    if (!dataUrl && Array.isArray(message?.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          dataUrl = part.image_url.url
          break
        }
      }
    }

    if (!dataUrl) {
      console.error("No images in response:", JSON.stringify(data).substring(0, 800))
      throw new Error('No image data returned from AI')
    }

    const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid image data URL format')
    }

    const mimeType = matches[1]
    const imageBase64 = matches[2]

    console.log("Image generated, uploading to storage...")

    const binaryString = atob(imageBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const ext = mimeType.includes('png') ? 'png' : 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)

    const { error: uploadError } = await adminSupabase.storage
      .from('dream-images')
      .upload(fileName, bytes, {
        contentType: mimeType,
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
