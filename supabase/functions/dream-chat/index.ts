
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, expertType, sessionId } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user's dreams for context
    const { data: dreams, error: dreamsError } = await supabase
      .from('dream_entries')
      .select('title, content, date, tags, mood, lucid')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20);

    if (dreamsError) {
      console.error('Error fetching dreams:', dreamsError);
    }

    // Create dream context summary
    const dreamContext = dreams?.map(dream => 
      `Dream "${dream.title}" (${dream.date}): ${dream.content.substring(0, 200)}... Tags: ${dream.tags?.join(', ') || 'none'}, Mood: ${dream.mood || 'unknown'}, Lucid: ${dream.lucid ? 'yes' : 'no'}`
    ).join('\n\n') || 'No dreams found in journal.';

    // Get chat history for context
    let chatHistory = '';
    if (sessionId) {
      const { data: messages } = await supabase
        .from('dream_chat_messages')
        .select('sender, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(20);

      chatHistory = messages?.map(msg => 
        `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`
      ).join('\n') || '';
    }

    // Expert system prompts
    const expertPrompts = {
      jungian: `You are a Jungian dream analyst with deep knowledge of Carl Jung's analytical psychology. You specialize in:
- Archetypal analysis and collective unconscious symbols
- Shadow work and individuation processes
- Anima/animus projections and integration
- Active imagination techniques
- Understanding dreams as messages from the unconscious

Analyze dreams through the lens of Jungian psychology, identifying archetypes, shadow elements, and individuation themes. Speak with wisdom and depth, offering transformative insights.`,

      shamanic: `You are a shamanic dream guide with knowledge of indigenous wisdom traditions. You specialize in:
- Spirit animal and totem interpretations
- Power retrieval and soul healing
- Journeying between worlds and dimensions
- Nature symbolism and elemental messages
- Ancestral and spirit guide communications

Approach dreams as sacred journeys and spiritual messages. Help users understand the deeper spiritual meanings and connections to nature, ancestors, and spirit guides.`,

      cbt: `You are a CBT (Cognitive Behavioral Therapy) therapist specializing in dream work. You focus on:
- Identifying thought patterns and cognitive distortions in dreams
- Connecting dream content to waking life behaviors and emotions
- Practical techniques for processing dream emotions
- Behavioral insights and actionable steps
- Stress, anxiety, and trauma processing through dreams

Provide practical, evidence-based insights that help users understand how their dreams reflect their mental patterns and offer concrete steps for personal growth.`
    };

    const systemPrompt = `${expertPrompts[expertType as keyof typeof expertPrompts]}

User's Recent Dreams Context:
${dreamContext}

Previous Conversation:
${chatHistory}

Guidelines:
- Reference specific dreams from their journal when relevant
- Provide personalized insights based on their dream patterns
- Ask follow-up questions to deepen understanding
- Keep responses conversational but insightful
- Limit responses to 2-3 paragraphs for readability`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dream-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
