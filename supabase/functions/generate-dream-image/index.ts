import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { falNanoBanana2 } from "../_shared/fal-nano-banana.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PROMPT_LENGTH = 15000

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

    console.log(`Generating image via FAL nano-banana-2 for user ${user.id}, prompt length: ${prompt.length}, hasReference: ${!!referenceImageUrl}, hasOutfit: ${!!outfitImageUrl}, hasAccessory: ${!!accessoryImageUrl}, style: ${imageStyle}`)

    // === CINEMATIC RENDERING DIRECTIVE — prepended to the user's prompt ===
    const directive = `[CINEMATIC RENDERING DIRECTIVE — READ THIS FIRST]

MANDATORY OUTPUT FORMAT: Generate this image in PORTRAIT orientation with a 9:16 aspect ratio (e.g., 1024x1820 or similar vertical dimensions). The frame MUST be taller than it is wide. This is non-negotiable.

You are rendering a SINGLE FRAME from the most visually stunning film ever made — a $200 million cinematic masterpiece directed by Steven Spielberg, shot by Roger Deakins. This is not an illustration. This is not a composite. This is a REAL FRAME from an alternate-reality film shot on IMAX with supernatural production design.

GRAND CINEMATIC QUALITY MANDATE:
- Every frame must evoke AWE — breathtaking scale, dramatic depth, spectacular lighting
- Compose with DEPTH: distinct foreground elements (slightly soft), sharp midground action, vast atmospheric background
- Light must be SPECTACULAR: volumetric god rays, rim lighting that separates subjects like halos, dramatic color temperature contrasts between warm and cool zones
- The environment must feel INFINITE — extending far beyond the frame edges with atmospheric perspective and haze
- Use dramatic camera angles: low angles for power, wide lenses for scale, shallow depth of field for intimacy within grandeur`

    const refLabels: string[] = []
    const refUrls: string[] = []
    if (referenceImageUrl) {
      refLabels.push('[CHARACTER_IDENTITY_REFERENCE — Cast this exact person as the protagonist. Preserve face, hair, skin, body proportions.]')
      refUrls.push(referenceImageUrl)
    }
    if (outfitImageUrl) {
      refLabels.push('[OUTFIT_REFERENCE — Dress the character in this exact outfit.]')
      refUrls.push(outfitImageUrl)
    }
    if (accessoryImageUrl) {
      refLabels.push('[ACCESSORY_REFERENCE — Add these exact accessories to the character.]')
      refUrls.push(accessoryImageUrl)
    }

    const fullPrompt = [
      directive,
      refLabels.join('\n'),
      `Now render the following cinematic dream scene in a 9:16 vertical / portrait frame:\n${prompt}`,
      `[FINAL MANDATORY REMINDER] The output image MUST be in PORTRAIT / VERTICAL orientation (9:16 aspect ratio — taller than wide).`,
    ].filter(Boolean).join('\n\n')

    const { imageUrls } = await falNanoBanana2(
      {
        prompt: fullPrompt,
        numImages: 1,
        aspectRatio: '9:16',
        resolution: '1K',
        imageUrls: refUrls,
        outputFormat: 'png',
      },
      {
        supabaseUrl,
        serviceRoleKey,
        bucket: 'dream-images',
        pathPrefix: `${user.id}/dream`,
      },
    )

    const imageUrl = imageUrls[0]
    if (!imageUrl) throw new Error('No image returned from FAL')
    console.log('Image generated via FAL, persisted at:', imageUrl)

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
