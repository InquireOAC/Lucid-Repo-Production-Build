
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PROMPT_LENGTH = 6000

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

        if (isPhotoRealistic) {
          contentParts.push({
            type: 'text',
            text: `[ANTI-COMPOSITE DIRECTIVE] You MUST generate the environment and character in a SINGLE unified pass. Do NOT generate them separately. The character must be LIT by the same light sources as the environment. Shadows must fall in the same direction. Atmospheric effects (fog, haze, particles) must affect BOTH the character and the environment equally. The character must have correct contact shadows where they touch surfaces. FAILURE INDICATORS to avoid: cut-out edges, mismatched lighting, floating appearance, different color temperatures between character and background.`
          })
        }
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
