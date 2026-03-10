
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString() }

const SYMBOLS = ['star', 'moon', 'sun', 'cloud', 'planet', 'galaxy', 'shootingstar', 'eye']
const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA', '#1EAEDB', '#33C3F0', '#ea384c', '#F97316', '#0EA5E9', '#8B5CF6', '#D946EF', '#10B981', '#F59E0B', '#EC4899']
const TAGS = ['Nightmare', 'Lucid', 'Recurring', 'Adventure', 'Spiritual', 'Flying', 'Falling', 'Water']
const MOODS = ['peaceful', 'anxious', 'excited', 'confused', 'joyful', 'melancholic', 'terrified', 'empowered', 'nostalgic', 'awestruck']

const PREFIXES = ['lucid', 'dream', 'astral', 'cosmic', 'ethereal', 'mystic', 'lunar', 'stellar', 'oneiro', 'somnia', 'nebula', 'aurora', 'phantom', 'spirit', 'void', 'night', 'shadow', 'crystal', 'zen', 'echo']
const SUFFIXES = ['dreamer', 'walker', 'voyager', 'seeker', 'wanderer', 'explorer', 'diver', 'rider', 'catcher', 'weaver', 'sage', 'nomad', 'mystic', 'keeper', 'traveler', 'gazer', 'hunter', 'dancer', 'singer', 'child']
const NAMES = ['Luna', 'Orion', 'Nova', 'Sage', 'Zara', 'Kai', 'Iris', 'Ash', 'River', 'Sky', 'Phoenix', 'Jade', 'Atlas', 'Mira', 'Leo', 'Aria', 'Felix', 'Eden', 'Nyx', 'Sol', 'Raven', 'Wren', 'Celeste', 'Jasper', 'Indigo', 'Rowan', 'Lyra', 'Finn', 'Ember', 'Aurora', 'Cypress', 'Dahlia', 'Ezra', 'Flora', 'Gale', 'Haven', 'Ivy', 'Juno', 'Kira', 'Selene']

const BIOS = [
  'Exploring the landscapes between waking and sleeping 🌙',
  'Lucid dreaming enthusiast. Charting the unconscious.',
  'Dreams are the royal road to the unconscious ✨',
  'Astral projector | Dream journalist | Night adventurer',
  'Chasing lucidity one dream at a time 🦋',
  'The dream world is my second home',
  'Recording my nightly adventures since 2024',
  'Sleep is my superpower 💫',
  'Oneironaut in training 🚀',
  'Bridging the gap between dreams and reality',
  'Every night is an adventure waiting to unfold 🌌',
  'Dream researcher & consciousness explorer',
  'Mapping the architecture of sleep 🏛️',
  'Where imagination meets the infinite',
  'Seeking meaning in the theater of the mind',
  '', '', '',
]

const TITLES = [
  'The Crystal Cathedral Under the Sea', 'Flying Over Neon Tokyo at Midnight', 'The Garden That Grew Upside Down',
  'Meeting My Future Self in a Mirror Maze', 'Racing Through a Storm of Colors', 'The Library With Infinite Floors',
  'Swimming With Luminous Whales', 'A City Built Entirely of Music', 'Walking on the Surface of Jupiter',
  'The Forest Where Trees Whisper Secrets', 'Floating Through an Aurora Borealis', 'The Clockwork Kingdom',
  'Diving Into a Painting That Came Alive', 'The Train That Traveled Between Dreams', 'An Ocean Made of Starlight',
  'Dancing With Shadows in a Moonlit Desert', 'The Lighthouse at the Edge of Consciousness', 'Finding a Door in the Sky',
  'The Market Where They Sell Memories', 'Riding a Dragon Through a Nebula', 'A Conversation With the Moon',
  'The Staircase That Led to Yesterday', 'Walking Through Walls of Water', 'The City That Only Exists at Dawn',
  'Playing Chess With a Giant on a Cloud', 'The Meadow Where Gravity Reversed', 'Exploring a Sunken Spaceship',
  'The Bridge Between Two Universes', 'A Symphony Conducted by Lightning', 'The Room That Changed With Every Blink',
  'Surfing Waves of Golden Sand', 'The Labyrinth of Flowering Vines', 'Meeting Animals That Spoke in Riddles',
  'A Palace Made of Frozen Moonlight', 'The Elevator That Went Sideways', 'Running Through a Field of Stars',
  'The Island That Floated Above the Clouds', 'A Snowstorm Inside a Cathedral', 'The Door That Opened Into Space',
  'Watching the Earth From a Glass Mountain', 'The River That Flowed Uphill', 'A Forest of Crystal Trees',
]

function generateContent(title: string): string {
  const scenes = [
    'shimmering with bioluminescent light', 'pulsing with ethereal energy', 'wrapped in golden mist',
    'floating above an endless ocean', 'carved from pure moonlight', 'humming with ancient power',
  ]
  const details = [
    'I became lucid when I noticed the impossible geometry around me.', 'A deep sense of peace washed over me.',
    'Colors I had never seen before danced at the edges of my vision.', 'Time moved differently here — each second stretched into an eternity.',
    'The air tasted like electricity and lavender.', 'Every surface reflected not light, but memories.',
  ]
  const endings = [
    'As I reached the center, a figure made entirely of starlight turned to face me, and in its eyes I saw galaxies spinning.',
    'The dream shifted then, dissolving like watercolors in rain, leaving only the feeling of something vast and beautiful.',
    'I tried to hold onto the moment, but it slipped through my fingers like luminous sand, and I woke with tears of wonder.',
    'A voice that was not a voice whispered through the space, and I understood something I could never put into words.',
    'The entire landscape began to sing — a harmony so perfect it vibrated through every cell of my being.',
    'I knew I was dreaming, and the knowledge made everything sharper, more vivid, more achingly real than waking life.',
  ]
  return `I found myself in ${title.toLowerCase().replace(/^the /, 'a place like ')}. The space was ${pick(scenes)}, stretching in every direction beyond comprehension. ${pick(details)} I walked deeper into the dream, each step revealing new wonders — structures that defied physics, colors that had no name, sounds that were visible as rippling waves of light. ${pick(details)} ${pick(endings)}`
}

const CONTENTS_FN = generateContent

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { phase } = await req.json().catch(() => ({ phase: 'all' }))
    const log: string[] = []

    if (phase === 'all' || phase === 'profiles') {
      const batchStart = 0
      const batchSize = 100
      log.push(`Phase A: Creating ${batchSize} auth users + profiles...`)
      const userIds: string[] = []
      const usedUsernames = new Set<string>()

      // Generate all usernames first
      const userConfigs: { username: string; email: string; displayName: string; bio: string; symbol: string; color: string }[] = []
      for (let i = 0; i < batchSize; i++) {
        let username: string
        do {
          username = `${pick(PREFIXES)}_${pick(SUFFIXES)}_${randInt(1, 99)}`
        } while (usedUsernames.has(username))
        usedUsernames.add(username)
        userConfigs.push({
          username,
          email: `mock_${username}@lucidrepo-seed.test`,
          displayName: pick(NAMES),
          bio: pick(BIOS),
          symbol: pick(SYMBOLS),
          color: pick(COLORS),
        })
      }

      // Create users in parallel batches of 10
      for (let i = 0; i < userConfigs.length; i += 10) {
        const batch = userConfigs.slice(i, i + 10)
        const results = await Promise.allSettled(
          batch.map(async (cfg) => {
            const { data, error } = await supabase.auth.admin.createUser({
              email: cfg.email,
              password: crypto.randomUUID(),
              email_confirm: true,
              user_metadata: { username: cfg.username },
            })
            if (error) throw error
            const userId = data.user.id
            await supabase.from('profiles').update({
              display_name: cfg.displayName,
              bio: cfg.bio,
              avatar_symbol: cfg.symbol,
              avatar_color: cfg.color,
            }).eq('id', userId)
            return userId
          })
        )
        for (const r of results) {
          if (r.status === 'fulfilled') userIds.push(r.value)
          else log.push(`User error: ${(r.reason as Error).message}`)
        }
      }
      log.push(`Created ${userIds.length} users`)

      // Phase B: Dreams
      log.push('Phase B: Creating dream entries...')
      let dreamCount = 0
      const allDreams: any[] = []
      const usedTitleSet = new Set<string>()

      for (const userId of userIds) {
        const n = randInt(3, 5)
        for (let j = 0; j < n; j++) {
          let title = pick(TITLES)
          if (usedTitleSet.has(title)) title += ' ' + pick(['II', 'III', '— Revisited', '— Continued', '— Again'])
          usedTitleSet.add(title)

          const dreamTags: string[] = []
          const shuffled = [...TAGS].sort(() => Math.random() - 0.5)
          for (let t = 0; t < randInt(1, 4); t++) dreamTags.push(shuffled[t])

          const createdDaysAgo = randInt(0, 60)
          allDreams.push({
            user_id: userId,
            title,
            content: pick(CONTENTS),
            tags: dreamTags,
            mood: pick(MOODS),
            lucid: dreamTags.includes('Lucid') || Math.random() < 0.3,
            is_public: true,
            like_count: randInt(0, 85),
            comment_count: randInt(0, 12),
            view_count: randInt(5, 500),
            date: daysAgo(createdDaysAgo),
            created_at: daysAgo(createdDaysAgo),
          })
          dreamCount++
        }
      }

      // Insert dreams in batches
      for (let i = 0; i < allDreams.length; i += 50) {
        const { error } = await supabase.from('dream_entries').insert(allDreams.slice(i, i + 50))
        if (error) log.push(`Dream batch error: ${error.message}`)
      }
      log.push(`Created ${dreamCount} dreams`)

      // Phase B2: Connections
      log.push('Phase B2: Creating connections data...')

      const syncAlerts = [
        { theme: 'Flying', emoji: '🔗', description: '12 dreamers experienced Flying dreams in the last 48 hours', dreamer_count: 12, is_trending: true },
        { theme: 'Water', emoji: '🔗', description: '8 dreamers experienced Water dreams in the last 48 hours', dreamer_count: 8, is_trending: false },
        { theme: 'Lucid', emoji: '🔗', description: '15 dreamers experienced Lucid dreams in the last 48 hours', dreamer_count: 15, is_trending: true },
      ]
      await supabase.from('sync_alerts').insert(syncAlerts)

      const waves = [
        { theme: 'Flying', emoji: '🌊', description: 'A surge of Flying dreams swept through the community', dream_count: 45, timeframe_start: daysAgo(3), timeframe_end: new Date().toISOString(), top_symbols: ['Flying', 'Sky', 'Freedom'] },
        { theme: 'Water', emoji: '🌊', description: 'Water dreams are flowing through the collective unconscious', dream_count: 32, timeframe_start: daysAgo(3), timeframe_end: new Date().toISOString(), top_symbols: ['Water', 'Ocean', 'Swimming'] },
      ]
      await supabase.from('collective_waves').insert(waves)

      const clusters = [
        { event_name: 'Full Moon March 2026', emoji: '🌕', description: 'Dream activity spiked during the full moon', dream_count: 67, event_date: daysAgo(5), top_themes: ['Lucid', 'Spiritual', 'Flying'] },
        { event_name: 'Spring Equinox', emoji: '🌸', description: 'Spring equinox brought vivid transformation dreams', dream_count: 48, event_date: daysAgo(10), top_themes: ['Adventure', 'Recurring', 'Water'] },
      ]
      await supabase.from('dream_clusters').insert(clusters)

      // Dream matches
      const matches: any[] = []
      for (let i = 0; i < 40 && allDreams.length > 1; i++) {
        const d1 = pick(allDreams)
        const d2 = pick(allDreams)
        if (d1.user_id === d2.user_id) continue
        const shared = d1.tags.filter((t: string) => d2.tags.includes(t))
        if (shared.length === 0) continue
        matches.push({
          user1_id: d1.user_id, dream1_id: d1.id || crypto.randomUUID(),
          user2_id: d2.user_id, dream2_id: d2.id || crypto.randomUUID(),
          match_percentage: Math.round((shared.length / new Set([...d1.tags, ...d2.tags]).size) * 100),
          shared_elements: shared,
        })
      }
      // We need actual dream IDs — fetch them
      const { data: recentDreams } = await supabase.from('dream_entries').select('id, user_id, tags').eq('is_public', true).order('created_at', { ascending: false }).limit(200)
      if (recentDreams && recentDreams.length > 1) {
        const realMatches: any[] = []
        for (let i = 0; i < 30; i++) {
          const d1 = pick(recentDreams)
          const d2 = pick(recentDreams)
          if (d1.user_id === d2.user_id || d1.id === d2.id) continue
          const shared = (d1.tags || []).filter((t: string) => (d2.tags || []).includes(t))
          if (shared.length === 0) continue
          realMatches.push({
            user1_id: d1.user_id, dream1_id: d1.id,
            user2_id: d2.user_id, dream2_id: d2.id,
            match_percentage: Math.round((shared.length / new Set([...(d1.tags || []), ...(d2.tags || [])]).size) * 100),
            shared_elements: shared,
          })
        }
        if (realMatches.length > 0) {
          const { error } = await supabase.from('dream_matches').insert(realMatches)
          if (error) log.push(`Matches error: ${error.message}`)
          else log.push(`Inserted ${realMatches.length} dream matches`)
        }
      }

      log.push('Connections data created')

      return new Response(JSON.stringify({ success: true, log, userCount: userIds.length, dreamCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (phase === 'images') {
      log.push('Phase C: Generating AI images for 20 dreams...')

      const { data: dreamsToImage } = await supabase
        .from('dream_entries')
        .select('id, title, content, tags, mood')
        .is('image_url', null)
        .eq('is_public', true)
        .limit(100)

      const selected = (dreamsToImage || []).sort(() => Math.random() - 0.5).slice(0, 20)
      log.push(`Selected ${selected.length} dreams`)

      const styles = ['surreal', 'fantasy', 'digital_art', 'cyberpunk', 'impressionist', 'oil_painting', 'watercolor', 'minimalist', 'hyper_realism', 'sketch']
      let successCount = 0

      for (const dream of selected) {
        try {
          const style = pick(styles)
          const sceneBrief = `Dream Title: "${dream.title}"\n\nDream Scene:\n${dream.content.substring(0, 2000)}\n\nMood: ${dream.mood || 'mysterious'}\nTags: ${(dream.tags || []).join(', ')}`

          // Step 1: Cinematic prompt
          const promptRes = await fetch(`${supabaseUrl}/functions/v1/compose-cinematic-prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRoleKey}` },
            body: JSON.stringify({ sceneBrief, imageStyle: style, hasCharacterReference: false }),
          })
          if (!promptRes.ok) { log.push(`Prompt failed for "${dream.title}": ${promptRes.status}`); continue }
          const { cinematicPrompt } = await promptRes.json()
          if (!cinematicPrompt) { log.push(`No prompt for "${dream.title}"`); continue }

          // Step 2: Generate image directly via AI gateway
          const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${lovableApiKey}` },
            body: JSON.stringify({
              model: 'google/gemini-3-pro-image-preview',
              messages: [{ role: 'user', content: [
                { type: 'text', text: '[CINEMATIC RENDERING DIRECTIVE] Generate this image in PORTRAIT orientation with a 9:16 aspect ratio. No text, no words, no UI elements.' },
                { type: 'text', text: cinematicPrompt },
              ]}],
              modalities: ['image', 'text'],
            }),
          })
          if (!aiRes.ok) { log.push(`AI failed for "${dream.title}": ${aiRes.status}`); continue }

          const aiData = await aiRes.json()
          const msg = aiData.choices?.[0]?.message
          let dataUrl: string | null = null
          if (msg?.images?.length > 0) dataUrl = msg.images[0]?.image_url?.url ?? null
          if (!dataUrl && Array.isArray(msg?.content)) {
            for (const p of msg.content) { if (p.type === 'image_url' && p.image_url?.url) { dataUrl = p.image_url.url; break } }
          }
          if (!dataUrl) { log.push(`No image for "${dream.title}"`); continue }

          // Upload
          const m = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
          if (!m) { log.push(`Bad data URL for "${dream.title}"`); continue }
          const bin = atob(m[2])
          const bytes = new Uint8Array(bin.length)
          for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k)
          const ext = m[1].includes('png') ? 'png' : 'jpg'
          const fileName = `mock-seeds/${dream.id}.${ext}`

          const { error: upErr } = await supabase.storage.from('dream-images').upload(fileName, bytes, { contentType: m[1], upsert: true })
          if (upErr) { log.push(`Upload failed: ${upErr.message}`); continue }

          const { data: urlData } = supabase.storage.from('dream-images').getPublicUrl(fileName)
          await supabase.from('dream_entries').update({ image_url: urlData.publicUrl }).eq('id', dream.id)
          successCount++
          log.push(`✅ ${successCount}/20 "${dream.title}" (${style})`)
        } catch (err) {
          log.push(`Error: ${err.message}`)
        }
      }
      log.push(`Phase C done: ${successCount} images`)
    }

    return new Response(JSON.stringify({ success: true, log }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, success: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
