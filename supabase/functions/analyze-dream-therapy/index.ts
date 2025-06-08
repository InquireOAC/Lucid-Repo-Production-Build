
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dreamContent, dreamTitle } = await req.json();

    if (!dreamContent) {
      return new Response(
        JSON.stringify({ error: 'Dream content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate Jungian analysis
    const jungianPrompt = `As a Jungian analyst, interpret this dream: "${dreamTitle}: ${dreamContent}"

Focus on:
- Archetypal symbols and their meanings
- Connection to the collective unconscious
- Shadow work and individuation process
- Anima/animus dynamics
- Personal and universal symbols

Provide a thoughtful, professional interpretation in 3-4 paragraphs.`;

    // Generate Shamanic analysis
    const shamanicPrompt = `As a shamanic dream interpreter, analyze this dream: "${dreamTitle}: ${dreamContent}"

Focus on:
- Spiritual messages and guidance
- Animal spirit guides and totems
- Energy patterns and chakras
- Past life connections
- Healing and transformation opportunities
- Connection to nature and elements

Provide a compassionate, spiritual interpretation in 3-4 paragraphs.`;

    // Generate CBT analysis
    const cbtPrompt = `As a cognitive behavioral therapist, interpret this dream: "${dreamTitle}: ${dreamContent}"

Focus on:
- Underlying thought patterns and beliefs
- Emotional processing and regulation
- Behavioral insights and patterns
- Problem-solving opportunities
- Practical applications for daily life
- Cognitive distortions that may be present

Provide a practical, solution-focused interpretation in 3-4 paragraphs.`;

    const analyses = await Promise.all([
      generateAnalysis(jungianPrompt, openaiApiKey),
      generateAnalysis(shamanicPrompt, openaiApiKey),
      generateAnalysis(cbtPrompt, openaiApiKey)
    ]);

    return new Response(
      JSON.stringify({
        jungian_analysis: analyses[0],
        shamanic_analysis: analyses[1],
        cbt_analysis: analyses[2]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-dream-therapy function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateAnalysis(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional dream interpreter. Provide thoughtful, compassionate, and insightful dream analysis. Keep responses between 200-400 words.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Unable to generate analysis at this time.';
}
