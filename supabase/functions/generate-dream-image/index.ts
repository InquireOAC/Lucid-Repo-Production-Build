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

    const { prompt, referenceImageUrl, imageStyle, outfitImageUrl, accessoryImageUrl, extraReferenceImageUrls } = await req.json()

    if (!prompt || typeof prompt !== 'string') throw new Error('Invalid prompt')
    if (prompt.length > MAX_PROMPT_LENGTH) throw new Error(`Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`)

    const extraRefs: string[] = Array.isArray(extraReferenceImageUrls)
      ? extraReferenceImageUrls.filter((u: unknown): u is string => typeof u === 'string' && u.length > 0)
      : []

    console.log(`Generating image via FAL nano-banana-2 for user ${user.id}, prompt length: ${prompt.length}, hasReference: ${!!referenceImageUrl}, hasOutfit: ${!!outfitImageUrl}, hasAccessory: ${!!accessoryImageUrl}, extraRefs: ${extraRefs.length}, style: ${imageStyle}`)

    const refLabels: string[] = []
    const refUrls: string[] = []
    if (referenceImageUrl) {
      refLabels.push('Character reference: match the supplied person exactly — face, hair, skin tone, and body proportions.')
      refUrls.push(referenceImageUrl)
    }
    if (outfitImageUrl) {
      refLabels.push('Outfit reference: dress the character in the supplied outfit, adapted to the scene materials.')
      refUrls.push(outfitImageUrl)
    }
    if (accessoryImageUrl) {
      refLabels.push('Accessory reference: include the supplied accessories on the character.')
      refUrls.push(accessoryImageUrl)
    }
    if (extraRefs.length > 0) {
      refLabels.push('Additional character references: each supplied image after the primary references depicts another named person who appears in this scene. Render each one with their own distinct likeness — do not blend or merge them with the primary character.')
      refUrls.push(...extraRefs)
    }
    // nano-banana-2 edit mode caps at 14 references.
    const cappedRefs = refUrls.slice(0, 14)

    // The compiler upstream already produced a clean, focused scene prompt.
    // We add ONLY two short framing/safeguard lines so the renderer gets a tight signal.
    const fullPrompt = [
      refLabels.length ? refLabels.join(' ') : null,
      prompt,
      'Render in vertical 9:16 portrait orientation, photographic cinematic quality, clean anatomy with five fingers per hand and natural symmetric eyes, no text or watermarks.',
    ].filter(Boolean).join('\n\n')

    const { imageUrls } = await falNanoBanana2(
      {
        prompt: fullPrompt,
        numImages: 1,
        aspectRatio: '9:16',
        resolution: '1K',
        imageUrls: cappedRefs,
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
