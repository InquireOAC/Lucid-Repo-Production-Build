
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const VALID_TASKS = ['analyze_dream', 'generate_image_prompt', 'create_image_prompt']
const MAX_CONTENT_LENGTH = 5000

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !data?.claims) {
      throw new Error('Unauthorized')
    }

    const userId = data.claims.sub

    const { dreamContent, task = 'analyze_dream' } = await req.json()

    // Input validation
    if (!dreamContent || typeof dreamContent !== 'string') {
      throw new Error('Invalid dream content')
    }

    if (dreamContent.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Dream content too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.`)
    }

    if (!VALID_TASKS.includes(task)) {
      throw new Error('Invalid task type')
    }

    console.log(`Processing ${task} for user ${userId}, content length: ${dreamContent.length}`)
    
    // Set system prompt based on the requested task
    const systemPrompt = (task === 'create_image_prompt' || task === 'generate_image_prompt')
      ? `You are a world-class cinematographer and concept artist specializing in dream visualization. Your task is to transform a dream description into a rich CINEMATIC SCENE BRIEF for an AI image generator.

OUTPUT FORMAT — Write a single, flowing, descriptive paragraph (120-180 words) that covers ALL of the following dimensions in natural language. Do NOT use headers, bullet points, or labels. Weave everything together as a unified scene description.

DIMENSIONS TO COVER IN YOUR OUTPUT:
1. ENVIRONMENT: Specific setting with world-building detail — architecture, landscape, biome, time of day, weather conditions, season
2. LIGHTING: Primary light source (sun, moon, neon, fire, bioluminescence), secondary fill light, color temperature (warm/cool/mixed), light quality (hard, soft, volumetric, diffused)  
3. CAMERA: Shot type (wide establishing, medium, close-up, over-the-shoulder), camera angle (eye-level, low-angle hero shot, bird's-eye, dutch tilt), implied focal length and depth of field
4. CHARACTER: Position in scene, action or pose, emotional state, relationship to environment
5. ATMOSPHERE: Particle effects, volumetric haze, fog, dust motes, smoke, rain, snow, magical energy
6. COLOR STORY: Dominant palette (2-3 primary hues), accent color, emotional resonance of the palette

RULES:
- Frame the scene as a MOVIE FRAME — every element intentionally composed
- The character is a NATIVE INHABITANT of this world, not a visitor
- Use cinematic language: "golden-hour rim light", "low-angle hero shot", "volumetric god rays", "atmospheric depth"
- Do NOT include any text, words, signs, or UI elements in the description
- Output ONLY the scene description — no preamble, no explanation`
      : `You are a professional dream analyst trained in Jungian psychology, depth psychology, and modern dream science. Your role is to provide warm, insightful, and personally resonant dream interpretations.

RESPONSE FORMAT — You MUST structure your response using exactly these five section headers in bold, each followed by 2-4 sentences of interpretation. Do not deviate from this structure.

**Core Narrative**
Describe the dream's central story arc and the emotional journey it maps. What situation or psychological theme is being played out? Use second person ("Your dream...") to make it feel personal and direct.

**Symbols & Archetypes**
Identify the 2-4 most significant symbols, objects, or figures in the dream. For each, explain its psychological and universal archetypal meaning (drawing from Jungian, transpersonal, or cross-cultural traditions). Acknowledge that personal associations always take precedence over universal meanings.

**Emotional Undercurrents**
Reflect on the emotional tone woven through the dream — not just surface feelings but the deeper emotional current beneath. What unresolved feelings, unmet needs, or emotional truths might this dream be touching? Be compassionate and non-judgmental.

**Message**
Synthesize what the dreamer's subconscious may be communicating. What might this dream be pointing toward in the dreamer's waking life — a decision, a relationship, an inner conflict, an opportunity for growth? Frame this as a possibility, not a prescription.

**Invitation**
Close with one specific, grounded, actionable reflection practice the dreamer can take into their waking life. This could be a journaling prompt, a contemplative question, a small intentional act, or a creative exercise. Make it concrete and immediately doable.

TONE RULES:
- Write in warm, accessible language — never clinical or academic
- Always use second person ("Your dream...", "You may be...", "Consider...")
- Acknowledge that dream meaning is deeply personal and context-dependent
- Do not be prescriptive — offer possibilities, not definitive interpretations
- Express genuine curiosity and respect for the dreamer's inner world
- Each section should be 2-4 sentences — substantive but not exhausting`
    
    console.log(`Generating ${task} for dream content. System prompt: ${systemPrompt.substring(0, 50)}...`)
    
    // Use gpt-4o for analysis (deeper reasoning), mini for image prompt generation
    const model = (task === 'analyze_dream') ? 'gpt-4o' : 'gpt-4o-mini'
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: dreamContent
          }
        ],
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      console.error('OpenAI API error:', data.error)
      throw new Error(data.error.message || 'OpenAI API error')
    }
    
    const analysis = data.choices[0].message.content
    console.log(`Successfully generated ${task} result`)

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze dream', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
