
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
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
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { prompt } = await req.json()
    
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt')
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(`Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`)
    }

    console.log(`Generating image for user ${user.id}, prompt length: ${prompt.length}`)
    
    console.log("Generating image with prompt:", prompt)
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      }),
    })

    const data = await response.json()
    if (data.error) {
      console.error("OpenAI API error:", data.error)
      throw new Error(data.error.message)
    }

    const imageUrl = data.data[0].url;
    console.log("Image generation successful, returning URL")
    
    // Return with multiple field names for compatibility with different parts of the app
    return new Response(
      JSON.stringify({ 
        imageUrl: imageUrl, 
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
