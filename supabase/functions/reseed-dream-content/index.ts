import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { phase, limit = 10, offset = 0 } = await req.json()

    // Get all mock user IDs
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (authErr) throw new Error(`Auth error: ${authErr.message}`)

    const mockUserIds = authUsers.users
      .filter(u => u.email?.startsWith('mock_') && u.email?.endsWith('@lucidrepo-seed.test'))
      .map(u => u.id)

    console.log(`Found ${mockUserIds.length} mock users`)

    if (phase === 'content') {
      return await handleContentPhase(supabase, lovableApiKey, mockUserIds, limit, offset)
    } else if (phase === 'images') {
      return await handleImagePhase(supabase, lovableApiKey, mockUserIds, limit, offset)
    } else if (phase === 'count') {
      return await handleCount(supabase, mockUserIds)
    } else {
      throw new Error('Invalid phase. Use "content", "images", or "count".')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleCount(supabase: any, mockUserIds: string[]) {
  // Count dreams needing content rewrite (all mock dreams)
  const { count: totalMock } = await supabase
    .from('dream_entries')
    .select('id', { count: 'exact', head: true })
    .in('user_id', mockUserIds)

  // Count dreams needing images (mock dreams with no image_url)
  const { count: needsImage } = await supabase
    .from('dream_entries')
    .select('id', { count: 'exact', head: true })
    .in('user_id', mockUserIds)
    .is('image_url', null)

  return new Response(
    JSON.stringify({ totalMockDreams: totalMock, needsImage }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleContentPhase(supabase: any, apiKey: string, mockUserIds: string[], limit: number, offset: number) {
  // Fetch a batch of mock dreams
  const { data: dreams, error } = await supabase
    .from('dream_entries')
    .select('id, title, tags, mood, content')
    .in('user_id', mockUserIds)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`Fetch error: ${error.message}`)
  if (!dreams || dreams.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No more dreams to process', processed: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`Processing content for ${dreams.length} dreams (offset ${offset})`)

  let processed = 0
  let errors = 0

  for (const dream of dreams) {
    try {
      // Clean title: strip "Revisited", "Again", "Continued", "II", "III", "IV"
      let cleanTitle = dream.title
        .replace(/\s*(Revisited|Again|Continued|Returns?|Once More|Part\s*\d+)\s*$/i, '')
        .replace(/\s*(II|III|IV|V)\s*$/, '')
        .trim()

      if (!cleanTitle) cleanTitle = dream.title

      const tags = dream.tags || []
      const mood = dream.mood || ''

      const systemPrompt = `You are a dream journal ghostwriter. You write vivid, immersive first-person dream narratives. Each dream you write is COMPLETELY UNIQUE — never recycle phrases, imagery patterns, or narrative structures between dreams.

RULES:
- Write 150-250 words in first person, past tense
- The story MUST directly relate to and explore the dream's TITLE — the title is the anchor
- Include specific sensory details (textures, sounds, temperatures, smells)
- Create a clear narrative arc with a beginning, middle, and end
- NEVER use these overused phrases: "colors that had no name", "rippling light", "waves of light", "shimmering", "ethereal glow", "otherworldly", "dreamscape"
- Each dream should have its own unique vocabulary and tone
- The mood/tags should subtly influence the emotional texture, not be stated literally
- End with a memorable, specific image or sensation — not a generic "then I woke up"
- Do NOT include a title — output ONLY the dream narrative text`

      const userPrompt = `Write a unique dream narrative for:
TITLE: "${cleanTitle}"
TAGS: ${tags.join(', ') || 'none'}
MOOD: ${mood || 'unspecified'}

Remember: the story must be ABOUT the title. If the title says "The Glass Elevator," the dream better involve a glass elevator.`

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`AI error for dream ${dream.id}:`, response.status, errText)
        errors++
        continue
      }

      const result = await response.json()
      const newContent = result.choices?.[0]?.message?.content?.trim()

      if (!newContent) {
        console.error(`No content generated for dream ${dream.id}`)
        errors++
        continue
      }

      // Update dream: new content, cleaned title, clear old image
      const { error: updateErr } = await supabase
        .from('dream_entries')
        .update({
          content: newContent,
          title: cleanTitle,
          image_url: null,
          generatedImage: null,
        })
        .eq('id', dream.id)

      if (updateErr) {
        console.error(`Update error for ${dream.id}:`, updateErr)
        errors++
      } else {
        processed++
      }
    } catch (err) {
      console.error(`Error processing dream ${dream.id}:`, err)
      errors++
    }
  }

  return new Response(
    JSON.stringify({ processed, errors, total: dreams.length, nextOffset: offset + limit }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleImagePhase(supabase: any, apiKey: string, mockUserIds: string[], limit: number, offset: number) {
  // Fetch mock dreams that need images
  const { data: dreams, error } = await supabase
    .from('dream_entries')
    .select('id, title, content, tags, user_id')
    .in('user_id', mockUserIds)
    .is('image_url', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw new Error(`Fetch error: ${error.message}`)
  if (!dreams || dreams.length === 0) {
    return new Response(
      JSON.stringify({ message: 'No more dreams need images', processed: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`Generating images for ${dreams.length} dreams`)

  const styles = ['surreal', 'digital_art', 'fantasy', 'oil_painting', 'watercolor', 'impressionist', 'cyberpunk', 'minimalist', 'sketch', 'vintage']
  let processed = 0
  let errors = 0

  for (const dream of dreams) {
    try {
      const style = styles[Math.floor(Math.random() * styles.length)]

      // Step 1: Compose cinematic prompt from dream content
      const sceneBrief = `Title: ${dream.title}\n\nDream narrative: ${dream.content.substring(0, 1500)}`

      const cinematicRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'system',
              content: `You are CINEMATOGRAPHER-1. Transform the dream narrative into a cinematic shot description for an AI image renderer. Write a single flowing paragraph of 150-200 words. Art style: "${style}". CRITICAL: Describe a scene in PORTRAIT/VERTICAL framing (taller than wide). NO text, words, or UI elements. Focus on the KEY VISUAL MOMENT of this specific dream — not generic dreamscape imagery. Output ONLY the description.`
            },
            { role: 'user', content: sceneBrief }
          ],
        }),
      })

      if (!cinematicRes.ok) {
        console.error(`Cinematic prompt error for ${dream.id}:`, cinematicRes.status)
        errors++
        continue
      }

      const cinematicData = await cinematicRes.json()
      const cinematicPrompt = cinematicData.choices?.[0]?.message?.content?.trim()

      if (!cinematicPrompt) {
        console.error(`No cinematic prompt for ${dream.id}`)
        errors++
        continue
      }

      // Step 2: Generate image
      const contentParts = [
        {
          type: 'text',
          text: `[MANDATORY FORMAT] Generate this image in PORTRAIT orientation — 9:16 aspect ratio (taller than wide, e.g. 1024x1820). The image must depict a VERTICAL scene. Do NOT rotate or generate a landscape scene within a vertical frame.`
        },
        {
          type: 'text',
          text: cinematicPrompt
        },
        {
          type: 'text',
          text: `[FINAL REMINDER] PORTRAIT 9:16 vertical orientation. The scene must be composed for vertical viewing — no sideways/rotated content. Taller than wide. Non-negotiable.`
        }
      ]

      const imageRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3.1-flash-image-preview',
          messages: [{ role: 'user', content: contentParts }],
          modalities: ['image', 'text'],
        }),
      })

      if (!imageRes.ok) {
        const errText = await imageRes.text()
        console.error(`Image gen error for ${dream.id}:`, imageRes.status, errText.substring(0, 200))
        errors++
        continue
      }

      const imageData = await imageRes.json()
      const message = imageData.choices?.[0]?.message

      let dataUrl: string | null = null
      if (message?.images?.length > 0) {
        dataUrl = message.images[0]?.image_url?.url ?? null
      }
      if (!dataUrl && Array.isArray(message?.content)) {
        for (const part of message.content) {
          if (part.type === 'image_url' && part.image_url?.url) {
            dataUrl = part.image_url.url
            break
          }
        }
      }

      if (!dataUrl) {
        console.error(`No image returned for ${dream.id}`)
        errors++
        continue
      }

      // Step 3: Upload to storage
      const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!matches) {
        console.error(`Invalid data URL for ${dream.id}`)
        errors++
        continue
      }

      const mimeType = matches[1]
      const imageBase64 = matches[2]

      // Chunked base64 decoding to avoid stack overflow
      const chunks: Uint8Array[] = []
      const chunkSize = 8192
      for (let i = 0; i < imageBase64.length; i += chunkSize) {
        const chunk = imageBase64.slice(i, i + chunkSize)
        const binaryChunk = atob(chunk)
        const bytes = new Uint8Array(binaryChunk.length)
        for (let j = 0; j < binaryChunk.length; j++) {
          bytes[j] = binaryChunk.charCodeAt(j)
        }
        chunks.push(bytes)
      }

      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
      const imageBytes = new Uint8Array(totalLength)
      let pos = 0
      for (const chunk of chunks) {
        imageBytes.set(chunk, pos)
        pos += chunk.length
      }

      const ext = mimeType.includes('png') ? 'png' : 'jpg'
      const fileName = `mock-seeds/${dream.id}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('dream-images')
        .upload(fileName, imageBytes, { contentType: mimeType, upsert: true })

      if (uploadErr) {
        console.error(`Upload error for ${dream.id}:`, uploadErr)
        errors++
        continue
      }

      const { data: urlData } = supabase.storage
        .from('dream-images')
        .getPublicUrl(fileName)

      const { error: updateErr } = await supabase
        .from('dream_entries')
        .update({ image_url: urlData.publicUrl })
        .eq('id', dream.id)

      if (updateErr) {
        console.error(`DB update error for ${dream.id}:`, updateErr)
        errors++
      } else {
        processed++
        console.log(`✓ Image generated for "${dream.title}" (${dream.id})`)
      }
    } catch (err) {
      console.error(`Error processing image for ${dream.id}:`, err)
      errors++
    }
  }

  return new Response(
    JSON.stringify({ processed, errors, total: dreams.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
