
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dreamContent, task = 'analyze_dream' } = await req.json()
    
    // Set system prompt based on the requested task
    const systemPrompt = task === 'create_image_prompt' 
      ? 'You are an expert at creating concise, detailed image prompts for AI image generators from a first-person perspective. Generate a SINGLE, vivid prompt in plain English (max 35 words) based on the dream description. Always frame the scene from the dreamer\'s point of view using phrases like "I see", "in front of me", "I am standing", "looking at", etc. Focus on what the dreamer would visually experience from their perspective, including mood, colors, and atmosphere. Do NOT include any text overlays or prompts on the image itself.'
      : 'You are an expert dream analyst. Analyze the dream and provide meaningful insights about its potential psychological significance, symbolism, and what it might reveal about the dreamer\'s subconscious mind. Keep the analysis concise but insightful.'
    
    console.log(`Generating ${task} for dream content. System prompt: ${systemPrompt.substring(0, 50)}...`)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
