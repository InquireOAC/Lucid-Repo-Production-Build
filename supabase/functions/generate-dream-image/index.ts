
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PROMPT_LENGTH = 2000

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

    const { prompt } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt')
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(`Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`)
    }

    console.log(`Generating image for user ${user.id}, prompt length: ${prompt.length}`)

    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!googleApiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-image-generation:generateContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    )

    const data = await response.json()
    
    if (data.error) {
      console.error("Gemini API error:", data.error)
      throw new Error(data.error.message || 'Gemini API error')
    }

    // Extract base64 image from response
    const candidates = data.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from Gemini')
    }

    let imageBase64: string | null = null
    let mimeType = 'image/png'

    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data
        mimeType = part.inlineData.mimeType || 'image/png'
        break
      }
    }

    if (!imageBase64) {
      throw new Error('No image data returned from Gemini')
    }

    console.log("Image generated, uploading to storage...")

    // Decode base64 and upload to Supabase Storage
    const binaryString = atob(imageBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const ext = mimeType.includes('png') ? 'png' : 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    // Use service role client for storage upload
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
