import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: photoUrl } }
            ]
          }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI Gateway error:', response.status, errorText)
      throw new Error(`AI analysis failed: ${response.status}`)
    }

    const data = await response.json()
    const fingerprint = data.choices?.[0]?.message?.content || ''

    if (!fingerprint) throw new Error('No fingerprint generated')

    console.log(`Visual fingerprint generated, length: ${fingerprint.length}`)

    // Save fingerprint to ai_context
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
