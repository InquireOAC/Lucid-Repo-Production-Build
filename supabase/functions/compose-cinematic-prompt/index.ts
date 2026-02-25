
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sceneBrief, imageStyle, hasCharacterReference } = await req.json()

    if (!sceneBrief || typeof sceneBrief !== 'string') {
      throw new Error('Invalid scene brief')
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    const styleName = imageStyle || 'surreal'

    const systemPrompt = `You are CINEMATOGRAPHER-1, a world-class film director of photography and visual storyteller. You receive a raw SCENE BRIEF describing a dream, and you must transform it into a masterful CINEMATIC SHOT DESCRIPTION ready for an AI image renderer.

YOUR PROCESS — Think through each decision:

1. NARRATIVE WEIGHT: What is the emotional core of this scene? What does the viewer need to FEEL?

2. CAMERA PLACEMENT: Based on the emotional weight, choose the OPTIMAL camera angle and focal length.
   - Low angle for empowerment, heroism, awe
   - High angle for vulnerability, isolation, smallness
   - Eye-level for intimacy, connection, naturalism
   - Dutch tilt for unease, dream-logic, psychological tension
   - Wide for environmental storytelling and scale
   - Close for emotional intensity and character focus
   EXPLAIN WHY your choice serves THIS specific scene.

3. MOTIVATED LIGHTING: Design a lighting rig where every light source has a REASON to exist in the world.
   - What is the primary light source and WHY is it there? (sun through stained glass, bioluminescent flora, neon signs, campfire)
   - What color temperature does it cast and how does that reinforce the emotion?
   - Where do shadows fall and what mood do they create?
   - Is there rim/separation light and what world element provides it?

4. COLOR STORY: Choose 2-3 dominant hues plus one accent that creates the emotional palette.
   - Warm palettes for nostalgia, comfort, passion
   - Cool palettes for mystery, isolation, serenity
   - Complementary tension for conflict, energy, transformation
   - Monochromatic for focus, meditation, singularity

5. CHARACTER STAGING: Where does the character exist in the frame and what are they doing?
   - Their pose, gesture, and emotional expression
   - Their spatial relationship to the environment (dwarfed by it, commanding it, at peace within it)
   - Eye direction and implied narrative

6. ART STYLE INTEGRATION: The requested style is "${styleName}". Weave the style's visual language ORGANICALLY into every decision above — don't append it as a separate block. The style should feel like a natural consequence of the scene's emotional needs, not a filter applied on top.

OUTPUT FORMAT:
Write a single flowing paragraph of 200-300 words. This is a professional shot description — dense, specific, every word earning its place. No headers, no bullet points, no labels, no preamble. Just the cinematic description.

${hasCharacterReference ? 'NOTE: A character reference photo will be provided to the image renderer. Your description should include clear character presence and staging but do NOT describe specific facial features — the reference photo handles identity matching.' : ''}

CRITICAL RULES:
- Every composition choice must be MOTIVATED by the scene's emotional content
- Do NOT use generic phrases like "rule of thirds" without explaining WHY that serves this scene
- Do NOT include any text, words, signs, letters, or UI elements in the description
- Output ONLY the cinematic description — no explanations of your reasoning process`

    console.log(`Composing cinematic prompt for style: ${styleName}, hasCharRef: ${hasCharacterReference}`)

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `SCENE BRIEF:\n${sceneBrief}` }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI Gateway error:', response.status, errorText)
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.')
      }
      throw new Error(`AI Gateway error: ${response.status}`)
    }

    const result = await response.json()
    const cinematicPrompt = result.choices?.[0]?.message?.content

    if (!cinematicPrompt) {
      console.error('No content in AI response:', JSON.stringify(result))
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
