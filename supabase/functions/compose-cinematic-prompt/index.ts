import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { sceneBrief, imageStyle, hasCharacterReference } = await req.json()

    if (!sceneBrief || typeof sceneBrief !== 'string') {
      throw new Error('Invalid scene brief')
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    const styleName = imageStyle || 'surreal'

    // Single, focused compiler prompt. Output goes directly to FAL nano-banana-2,
    // which prefers concrete, scene-grounded language over stacked meta-directives.
    const systemPrompt = `You are the cinematic prompt compiler for an AI image renderer (nano-banana-2). You receive a SCENE BRIEF describing a dream and produce ONE clean, renderable image prompt.

WRITE THE OUTPUT AS A SINGLE DESCRIPTIVE PARAGRAPH, 110-150 WORDS, that names — in this order — subject, action, setting, lighting, atmosphere, color palette, lens/framing. No headers, no bullet points, no labels, no preamble.

WHAT TO INCLUDE
- Subject and clear action: who is in frame and what they are doing in this exact moment.
- Setting: architecture or landscape, time of day, weather.
- Lighting: one dominant source plus how it shapes the subject (rim, soft wrap, hard shadows).
- Atmosphere: dust, mist, particles, rain — pick at most two and place them spatially.
- Color story: 2 primary hues plus 1 accent, named concretely (e.g. "deep teal and bruised violet, accented by amber lamp glow").
- Lens / framing: focal length feel (35mm / 50mm / 85mm), shot size (medium / wide / over-the-shoulder), and depth of field.
- Style language: weave the requested style "${styleName}" into the description naturally — not as an appendix.

ANATOMY + RENDERING SAFEGUARDS (always include, phrased naturally inside the paragraph)
- Hands fully visible with five clean fingers each, natural finger spacing, no extra digits.
- Eyes symmetrical, both visible if facing camera, natural pupils — no warped or doubled eyes.
- Clothing folds consistent, no fused or detached fabric, no melting seams.
- One head, one body, accurate limb count, limbs attached at natural joints.
- Sharp main subject; any blur is intentional motion blur or shallow-DOF background.

HARD CONSTRAINTS
- ${hasCharacterReference ? 'A character reference image WILL be supplied. Describe the character only by pose, body language and position in the frame. Do NOT describe their face, hair color, skin tone or specific facial features — the reference handles identity.' : 'No character reference is supplied. Describe character appearance naturally if the scene calls for one.'}
- No text, no signs, no UI, no watermarks in the image.
- Vertical 9:16 framing is enforced by the renderer — do not waste words restating it.
- One coherent moment only. No collages, no split screens, no multiple panels.

OUTPUT ONLY THE PARAGRAPH. NO EXPLANATION.`

    console.log(`Composing cinematic prompt via Lovable AI, style: ${styleName}`)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `SCENE BRIEF:\n${sceneBrief}` },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI gateway error:', response.status, errorText)
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again in a moment.')
      throw new Error(`AI gateway error: ${response.status}`)
    }

    const result = await response.json()
    const cinematicPrompt = result.choices?.[0]?.message?.content

    if (!cinematicPrompt) {
      console.error('No content in Lovable AI response:', JSON.stringify(result))
      throw new Error('No cinematic prompt generated')
    }

    console.log(`Cinematic prompt composed successfully (${cinematicPrompt.length} chars)`)

    return new Response(
      JSON.stringify({ cinematicPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to compose cinematic prompt', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
