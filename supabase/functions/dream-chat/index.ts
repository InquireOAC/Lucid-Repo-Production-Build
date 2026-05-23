import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const VALID_EXPERT_TYPES = ['jungian', 'shamanic', 'cbt'];
const MAX_MESSAGE_LENGTH = 3000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, expertType, sessionId } = await req.json();

    if (!message || typeof message !== 'string') throw new Error('Invalid message');
    if (message.length > MAX_MESSAGE_LENGTH) throw new Error(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
    if (!VALID_EXPERT_TYPES.includes(expertType)) throw new Error('Invalid expert type');
    if (!sessionId || typeof sessionId !== 'string') throw new Error('Invalid session ID');

    console.log("Dream chat request received:", { expertType, sessionId, messageLength: message.length });

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data: dreams } = await supabase
      .from('dream_entries')
      .select('title, content, date, tags, mood, lucid')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20);

    const dreamContext = dreams?.map(dream =>
      `Dream "${dream.title}" (${dream.date}): ${dream.content.substring(0, 200)}... Tags: ${dream.tags?.join(', ') || 'none'}, Mood: ${dream.mood || 'unknown'}, Lucid: ${dream.lucid ? 'yes' : 'no'}`
    ).join('\n\n') || 'No dreams found in journal.';

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

    const expertPrompts = {
      jungian: `You are a Jungian dream analyst with deep knowledge of Carl Jung's analytical psychology. You specialize in archetypal analysis, shadow work, individuation, anima/animus projections, and active imagination techniques. Analyze dreams through the lens of Jungian psychology.`,
      shamanic: `You are a shamanic dream guide with knowledge of indigenous wisdom traditions. You specialize in spirit animal interpretations, power retrieval, journeying between worlds, nature symbolism, and ancestral communications. Approach dreams as sacred journeys.`,
      cbt: `You are a CBT therapist specializing in dream work. You focus on identifying thought patterns and cognitive distortions, connecting dream content to waking life, practical techniques for processing emotions, and actionable behavioral insights.`
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error:', response.status, errorText);
      throw new Error(`Vertex AI error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) throw new Error('No response generated');

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
