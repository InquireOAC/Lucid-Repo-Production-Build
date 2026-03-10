
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// ── Helpers ──
function uuid() {
  return crypto.randomUUID()
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ── Data pools ──
const SYMBOLS = ['star', 'moon', 'sun', 'cloud', 'planet', 'galaxy', 'shootingstar', 'eye']
const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA', '#1EAEDB', '#33C3F0', '#ea384c', '#F97316', '#0EA5E9', '#8B5CF6', '#D946EF', '#10B981', '#F59E0B', '#EC4899']
const TAGS = ['Nightmare', 'Lucid', 'Recurring', 'Adventure', 'Spiritual', 'Flying', 'Falling', 'Water']
const MOODS = ['peaceful', 'anxious', 'excited', 'confused', 'joyful', 'melancholic', 'terrified', 'empowered', 'nostalgic', 'awestruck']

const USERNAME_PREFIXES = ['lucid', 'dream', 'astral', 'cosmic', 'ethereal', 'mystic', 'lunar', 'stellar', 'oneiro', 'somnia', 'nebula', 'aurora', 'phantom', 'spirit', 'void', 'night', 'shadow', 'crystal', 'zen', 'echo']
const USERNAME_SUFFIXES = ['dreamer', 'walker', 'voyager', 'seeker', 'wanderer', 'explorer', 'diver', 'rider', 'catcher', 'weaver', 'sage', 'nomad', 'mystic', 'keeper', 'traveler', 'gazer', 'hunter', 'dancer', 'singer', 'child']
const DISPLAY_FIRST = ['Luna', 'Orion', 'Nova', 'Sage', 'Zara', 'Kai', 'Iris', 'Ash', 'River', 'Sky', 'Phoenix', 'Jade', 'Atlas', 'Mira', 'Leo', 'Aria', 'Felix', 'Eden', 'Nyx', 'Sol', 'Raven', 'Wren', 'Celeste', 'Jasper', 'Indigo', 'Rowan', 'Lyra', 'Finn', 'Ember', 'Sage', 'Aurora', 'Cypress', 'Dahlia', 'Ezra', 'Flora', 'Gale', 'Haven', 'Ivy', 'Juno', 'Kira']

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
  '',
  '',
  '',
]

const DREAM_TITLES = [
  'The Crystal Cathedral Under the Sea',
  'Flying Over Neon Tokyo at Midnight',
  'The Garden That Grew Upside Down',
  'Meeting My Future Self in a Mirror Maze',
  'Racing Through a Storm of Colors',
  'The Library With Infinite Floors',
  'Swimming With Luminous Whales',
  'A City Built Entirely of Music',
  'Walking on the Surface of Jupiter',
  'The Forest Where Trees Whisper Secrets',
  'Floating Through an Aurora Borealis',
  'The Clockwork Kingdom',
  'Diving Into a Painting That Came Alive',
  'The Train That Traveled Between Dreams',
  'An Ocean Made of Starlight',
  'Dancing With Shadows in a Moonlit Desert',
  'The Lighthouse at the Edge of Consciousness',
  'Finding a Door in the Sky',
  'The Market Where They Sell Memories',
  'Riding a Dragon Through a Nebula',
  'A Conversation With the Moon',
  'The Staircase That Led to Yesterday',
  'Walking Through Walls of Water',
  'The City That Only Exists at Dawn',
  'Playing Chess With a Giant on a Cloud',
  'The Meadow Where Gravity Reversed',
  'Exploring a Sunken Spaceship',
  'The Bridge Between Two Universes',
  'A Symphony Conducted by Lightning',
  'The Room That Changed With Every Blink',
  'Surfing Waves of Golden Sand',
  'The Labyrinth of Flowering Vines',
  'Meeting Animals That Spoke in Riddles',
  'A Palace Made of Frozen Moonlight',
  'The Elevator That Went Sideways',
  'Running Through a Field of Stars',
  'The Island That Floated Above the Clouds',
  'A Snowstorm Inside a Cathedral',
  'The Door That Opened Into Space',
  'Watching the Earth From a Glass Mountain',
  'The River That Flowed Uphill',
  'A Forest of Crystal Trees',
  'The Telescope That Showed the Past',
  'Dancing on the Rings of Saturn',
  'The Village Inside a Raindrop',
  'Becoming a Bird Over the Grand Canyon',
  'The Archive of Lost Dreams',
  'A Waterfall That Fell Into the Sky',
  'The Corridor Between Sleeping and Waking',
  'Holding the Sun in My Hands',
  'The Carnival at the Bottom of the Ocean',
  'Walking Barefoot on Clouds',
  'The Map That Drew Itself',
  'A Garden Growing Inside a Storm',
  'The Mirror That Showed Another World',
  'Sailing a Ship Made of Light',
  'The Mountain That Sang at Sunset',
  'Discovering a New Color in a Dream',
  'The Castle That Rebuilt Itself Each Night',
  'Swimming Through Liquid Stars',
]

const DREAM_CONTENTS = [
  `I found myself standing at the edge of a vast crystal cathedral submerged beneath the ocean. The walls shimmered with bioluminescent light, casting dancing patterns across the sandy floor. Schools of translucent fish swirled around the towering pillars, and through the glass ceiling, I could see the surface of the water far above, rippling with moonlight. A deep sense of peace washed over me as I walked through the nave, my footsteps echoing in impossible acoustics. At the altar, a figure made entirely of coral sat in meditation, and as I approached, it opened its eyes — they were galaxies, spinning with ancient light.`,

  `The city below me was alive with neon — rivers of pink, cyan, and electric blue flowing through streets that twisted like circuitry. I was flying, arms outstretched, the wind warm against my face as I banked between holographic billboards and glass skyscrapers that stretched into the clouds. I became lucid when I noticed the moon had been replaced by an enormous eye that watched the city with calm curiosity. Below, people moved like data streams, and their voices rose as music — a symphony of the metropolis. I dove toward a rooftop garden where cherry blossoms fell upward into the night sky.`,

  `Every step I took through the garden defied physics. Roots reached toward a sky that was actually the ground, and flowers bloomed downward like chandeliers of color. The grass was above me, soft and green, and butterflies flew in spiraling patterns that left trails of golden dust. I realized I was walking on the underside of the world, and above me — or was it below? — I could see another version of myself, mirroring my movements. When we both reached the center of the garden, a tree grew from both directions simultaneously, its branches intertwining to form a doorway.`,

  `The mirror maze stretched in every direction, each reflection showing a different age of me. In one mirror, I was a child, laughing and chasing fireflies. In another, I was elderly, sitting peacefully in a garden I didn't recognize. But in the central mirror, someone who looked exactly like me — but older, wiser, with silver-streaked hair — stepped through the glass. "You've been looking for answers in the wrong timeline," they said. Their voice echoed through the maze, and every reflection nodded in agreement. They handed me a key made of frozen time, and when I touched it, I felt the weight of every choice I'd ever made.`,

  `Colors exploded around me like a living storm — not rain, but pure chromatic energy. I was running through it, each color changing the sensation in my body: blue brought calm, red surged adrenaline, gold filled me with nostalgic warmth. I became lucid when I tasted the purple — it tasted like thunder and lavender simultaneously. The storm had a center, an eye of pure white light, and I knew instinctively that if I reached it, I would understand something fundamental about consciousness. But the colors were intoxicating, and I kept pausing to let them wash over me.`,

  `The library was impossibly tall — floors spiraling upward into mist, each level filled with books that glowed faintly. I pulled one from a shelf and it opened to a page that contained a living scene: a miniature ocean with tiny ships sailing across it. Another book contained a forest, complete with wind and birdsong. The librarian — a figure draped in constellation patterns — told me that each book was someone's dream, archived for eternity. "Your dreams are on floor 7,429," they said. I began climbing, and with each floor, the books grew older and the light grew warmer.`,

  `The whales were enormous and luminous, their bodies casting light like swimming aurora borealis. I swam alongside them in water that was warm and thick as honey, breathing naturally despite being hundreds of meters deep. One whale turned its massive eye toward me — an eye as large as my entire body — and in it, I saw reflected not my face but my thoughts, displayed as swirling patterns of light. The whale sang, and the sound was a language I almost understood, words that existed just at the edge of comprehension. We dove together toward a trench filled with glowing coral cities.`,

  `Every building was an instrument. The skyscrapers were organs, their windows opening and closing to play deep, resonant chords. The roads were piano keys, and my footsteps created melodies as I walked. Street lamps were tuning forks, humming in perfect harmony, and the river that ran through the center of the city was a continuous cello note. I became lucid when I clapped my hands and heard it harmonize with the city's song. The people here spoke in melodies, and I found I could understand them perfectly when I stopped trying to translate and just listened with my whole body.`,

  `Jupiter's surface was not solid — it was thick gas that supported my weight like a trampoline made of clouds. The Great Red Spot churned below me, a vortex of brick-red and amber energy, and I could feel its magnetic pull. Above, Jupiter's moons hung like lanterns — Io glowing volcanic orange, Europa gleaming ice-blue. I walked for what felt like hours, the gas clouds reshaping themselves into familiar forms: my childhood home, my first school, places from memories I'd forgotten. Jupiter was dreaming too, I realized, and its dreams were made of the dreams of everyone who'd ever looked up at it.`,

  `The forest floor was covered in soft moss that pulsed with a gentle heartbeat. Every tree was ancient and vast, their bark carved with symbols that shifted when I wasn't looking directly at them. I pressed my ear against an oak and heard a whisper: "Remember what you came here for." But I couldn't remember — the forgetting was part of the dream. Deeper in the forest, the trees thinned and gave way to a clearing where the ground was glass, and beneath it, I could see another forest, mirroring this one, where another version of me looked up and pressed their hand against the glass where my foot rested.`,

  `I was inside the aurora borealis, floating through curtains of green and purple light that rippled like silk in a gentle breeze. Each ribbon of light contained tiny scenes — moments from lives I'd never lived but somehow remembered. A wedding in a field of sunflowers. A child learning to ride a bicycle on a dirt road. An old woman painting a sunset from her porch. The aurora wrapped around me like a cocoon, warm and electric, and I felt connected to every consciousness that had ever gazed up at the northern lights. Time didn't exist here — only the eternal dance of charged particles telling stories.`,

  `Gears the size of buildings turned slowly around me, their teeth interlocking with precision that made the air vibrate. The entire kingdom was clockwork — citizens made of brass and copper moved through streets paved with watch faces, each one showing a different time. The queen sat on a throne of interlinked clock hands, her crown a spinning orrery of miniature planets. "Every tick is a universe being born," she explained, her voice keeping perfect time with the great central pendulum that swung between the two tallest towers. I noticed my own heartbeat had synchronized with the kingdom's rhythm.`,

  `The painting was a landscape — rolling hills under a violet sky — but as I leaned in, the canvas pulled me through. I tumbled into a world where the brushstrokes were visible in everything: the clouds were swirls of white impasto, the grass was a thousand tiny green lines. Colors were richer here, more saturated than reality allows. I walked through this painted world and found the artist — a woman sitting at an easel, painting another painting. "Each painting contains a world," she said, "and each world contains a painter, painting worlds." I looked into her canvas and saw myself, looking into a canvas.`,

  `The train had no engine — it moved by intention, accelerating as my thoughts grew more vivid and slowing when I drifted into passivity. Each car was a different dream: one was a ballroom filled with dancing shadows, another was a beach at perpetual sunset, a third was my grandmother's kitchen, complete with the smell of fresh bread. The conductor — a figure whose face kept changing between people I'd loved — punched my ticket, which was a small photograph of a dream I hadn't had yet. "This is your stop," they said, though the train hadn't stopped, and I stepped off into a dream that was just beginning.`,

  `The ocean was made of liquid light — not water, but concentrated starlight that lapped against shores of dark crystal. I stood at the edge, my bare feet touching the luminous surf, and each wave that washed over my toes sent a cascade of memories through my mind — not my memories, but the memories of the universe itself. The birth of stars, the slow dance of galaxies, the patient evolution of consciousness from stone to life to dream. I waded in, and the deeper I went, the more memories I could access, until I was floating in the sum total of everything that had ever existed.`,

  `The desert was bone-white under a moon so large it filled half the sky, its craters visible like the face of an ancient friend. My shadow moved independently, dancing when I stood still, freezing when I moved. Other shadows gathered around it — tall, short, human, animal, shapes I couldn't name — and they began a dance that was old, older than language, a dance that mapped the movements of something beyond comprehension. I joined them, my body moving in ways I didn't know I could, and together we cast a shadow that was greater than the sum of our parts.`,

  `The lighthouse stood at the very edge of everything — beyond it was not ocean but the raw material of dreams, swirling and unformed, like paint on a palette before the brush touches canvas. The light swept in a slow circle, and wherever its beam touched the formless void, things briefly crystallized: a mountain, a city, a face, before dissolving back. The lighthouse keeper was my own subconscious, wearing a face I almost recognized. "Every night I project," they said, gesturing at the light. "And every night, you walk through what I create without ever looking back here to see the source."`,

  `I stood in a field of tall grass under a sky that had no sun — the light came from everywhere and nowhere. Above me, a door hung in the air, ornate and ancient, its frame carved with symbols that matched the ones I'd been dreaming about for years. I reached for the handle and the grass around me leaned away, as if the field itself was holding its breath. Through the door was not another place but another way of being — I could feel it radiating through the wood, a frequency of existence I'd only ever glimpsed in the deepest meditation.`,

  `Stalls stretched in every direction, but instead of fruit or fabric, they sold moments. One vendor had a jar of first kisses, each one glowing pink. Another sold childhood afternoons — golden and warm, packaged in small glass vials. I found a stall selling forgotten dreams, and there, in a dusty corner, was one of mine from twenty years ago, perfectly preserved. When I opened it, the dream played around me like a hologram — I was five years old, and I was flying over my childhood neighborhood, and everything was possible.`,

  `The dragon was made of the same material as the nebula we flew through — gas and light and gravity. Its wings spread for kilometers, their edges dissolving into the cosmic dust that surrounded us. I rode at the base of its neck, where scales of crystallized hydrogen reflected every color that existed. Below us, stars were being born — hydrogen clouds collapsing into points of furious light — and the dragon dove between them, threading through stellar nurseries with an elegance that made gravity seem like a suggestion rather than a law.`,

  `The moon's voice was low and resonant, a sound that I felt more than heard. We sat together at the edge of a cliff overlooking a silver sea — the moon had descended to sit beside me, taking a form that was roughly humanoid but made of reflected light. "You dream of me almost every night," the moon said, "but you never remember." It showed me all the dreams I'd had about it — thousands of them, stretching back to childhood, all filed away in a part of my memory I couldn't access while awake.`,
]

// ── Profile generator ──
function generateProfiles(count: number) {
  const profiles = []
  const usedUsernames = new Set<string>()
  for (let i = 0; i < count; i++) {
    let username: string
    do {
      username = `${pick(USERNAME_PREFIXES)}_${pick(USERNAME_SUFFIXES)}_${randInt(1, 99)}`
    } while (usedUsernames.has(username))
    usedUsernames.add(username)

    profiles.push({
      id: uuid(),
      username,
      display_name: pick(DISPLAY_FIRST),
      bio: pick(BIOS),
      avatar_symbol: pick(SYMBOLS),
      avatar_color: pick(COLORS),
      created_at: daysAgo(randInt(1, 90)),
      updated_at: new Date().toISOString(),
    })
  }
  return profiles
}

// ── Dream generator ──
function generateDreams(profiles: { id: string }[]) {
  const dreams: any[] = []
  const usedTitles = new Set<string>()
  
  for (const profile of profiles) {
    const numDreams = randInt(3, 5)
    for (let j = 0; j < numDreams; j++) {
      let title: string
      do {
        title = pick(DREAM_TITLES)
        if (usedTitles.has(title)) {
          title = title + ' ' + ['II', 'III', 'IV', '— Revisited', '— Continued', '— Part Two'][randInt(0, 5)]
        }
      } while (usedTitles.has(title))
      usedTitles.add(title)

      const dreamTags = []
      const numTags = randInt(1, 4)
      const shuffled = [...TAGS].sort(() => Math.random() - 0.5)
      for (let t = 0; t < numTags; t++) dreamTags.push(shuffled[t])

      const isLucid = dreamTags.includes('Lucid') || Math.random() < 0.3
      const createdDaysAgo = randInt(0, 60)

      dreams.push({
        id: uuid(),
        user_id: profile.id,
        title,
        content: pick(DREAM_CONTENTS),
        tags: dreamTags,
        mood: pick(MOODS),
        lucid: isLucid,
        is_public: true,
        like_count: randInt(0, 85),
        comment_count: randInt(0, 12),
        view_count: randInt(5, 500),
        date: daysAgo(createdDaysAgo),
        created_at: daysAgo(createdDaysAgo),
        updated_at: daysAgo(createdDaysAgo),
      })
    }
  }
  return dreams
}

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

    // ── PHASE A: Profiles ──
    if (phase === 'all' || phase === 'profiles') {
      log.push('Starting Phase A: Generating 100 mock profiles...')
      const profiles = generateProfiles(100)

      // Insert in batches of 25
      for (let i = 0; i < profiles.length; i += 25) {
        const batch = profiles.slice(i, i + 25)
        const { error } = await supabase.from('profiles').insert(batch)
        if (error) {
          log.push(`Profile batch ${i / 25 + 1} error: ${error.message}`)
          // Try individual inserts on conflict
          for (const p of batch) {
            const { error: e2 } = await supabase.from('profiles').insert(p)
            if (e2) log.push(`Individual profile error (${p.username}): ${e2.message}`)
          }
        }
      }
      log.push(`Phase A complete: ${profiles.length} profiles inserted`)

      // ── PHASE B: Dreams ──
      log.push('Starting Phase B: Generating dream entries...')
      const dreams = generateDreams(profiles)

      for (let i = 0; i < dreams.length; i += 50) {
        const batch = dreams.slice(i, i + 50)
        const { error } = await supabase.from('dream_entries').insert(batch)
        if (error) {
          log.push(`Dream batch ${i / 50 + 1} error: ${error.message}`)
        }
      }
      log.push(`Phase B complete: ${dreams.length} dreams inserted`)

      // ── PHASE B2: Connections data ──
      log.push('Starting Phase B2: Generating connections data...')
      
      // Dream matches - pick random pairs of dreams with overlapping tags
      const matches: any[] = []
      for (let i = 0; i < 40; i++) {
        const d1 = pick(dreams)
        const d2 = pick(dreams)
        if (d1.user_id === d2.user_id || d1.id === d2.id) continue
        const shared = d1.tags.filter((t: string) => d2.tags.includes(t))
        if (shared.length === 0) continue
        const totalUnique = new Set([...d1.tags, ...d2.tags]).size
        matches.push({
          user1_id: d1.user_id,
          dream1_id: d1.id,
          user2_id: d2.user_id,
          dream2_id: d2.id,
          match_percentage: Math.round((shared.length / totalUnique) * 100),
          shared_elements: shared,
        })
      }
      if (matches.length > 0) {
        const { error } = await supabase.from('dream_matches').insert(matches)
        if (error) log.push(`Dream matches error: ${error.message}`)
        else log.push(`Inserted ${matches.length} dream matches`)
      }

      // Sync alerts
      const syncAlerts = [
        { theme: 'Flying', emoji: '🔗', description: '12 dreamers experienced Flying dreams in the last 48 hours', dreamer_count: 12, is_trending: true },
        { theme: 'Water', emoji: '🔗', description: '8 dreamers experienced Water dreams in the last 48 hours', dreamer_count: 8, is_trending: false },
        { theme: 'Lucid', emoji: '🔗', description: '15 dreamers experienced Lucid dreams in the last 48 hours', dreamer_count: 15, is_trending: true },
      ]
      const { error: saErr } = await supabase.from('sync_alerts').insert(syncAlerts)
      if (saErr) log.push(`Sync alerts error: ${saErr.message}`)
      else log.push('Inserted sync alerts')

      // Collective waves
      const waves = [
        { theme: 'Flying', emoji: '🌊', description: 'A surge of Flying dreams swept through the community', dream_count: 45, timeframe_start: daysAgo(3), timeframe_end: new Date().toISOString(), top_symbols: ['Flying', 'Sky', 'Freedom'] },
        { theme: 'Water', emoji: '🌊', description: 'Water dreams are flowing through the collective unconscious', dream_count: 32, timeframe_start: daysAgo(3), timeframe_end: new Date().toISOString(), top_symbols: ['Water', 'Ocean', 'Swimming'] },
      ]
      const { error: cwErr } = await supabase.from('collective_waves').insert(waves)
      if (cwErr) log.push(`Collective waves error: ${cwErr.message}`)
      else log.push('Inserted collective waves')

      // Dream clusters
      const clusters = [
        { event_name: 'Full Moon March 2026', emoji: '🌕', description: 'Dream activity spiked during the full moon', dream_count: 67, event_date: daysAgo(5), top_themes: ['Lucid', 'Spiritual', 'Flying'] },
        { event_name: 'Spring Equinox', emoji: '🌸', description: 'Spring equinox brought vivid transformation dreams', dream_count: 48, event_date: daysAgo(10), top_themes: ['Adventure', 'Recurring', 'Water'] },
      ]
      const { error: dcErr } = await supabase.from('dream_clusters').insert(clusters)
      if (dcErr) log.push(`Dream clusters error: ${dcErr.message}`)
      else log.push('Inserted dream clusters')

      // If phase is 'all', continue to images
      if (phase === 'all') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            log,
            message: 'Profiles and dreams seeded. Call again with phase="images" to generate AI images for 20 dreams.',
            profileCount: profiles.length,
            dreamCount: dreams.length,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // ── PHASE C: AI Image Generation ──
    if (phase === 'images') {
      log.push('Starting Phase C: Generating AI images for 20 dreams...')

      // Fetch 20 random dreams that don't have images yet (from mock users)
      const { data: dreamsToImage, error: fetchErr } = await supabase
        .from('dream_entries')
        .select('id, title, content, tags, mood')
        .is('image_url', null)
        .eq('is_public', true)
        .limit(100)

      if (fetchErr) throw new Error(`Failed to fetch dreams: ${fetchErr.message}`)

      // Shuffle and pick 20
      const shuffled = (dreamsToImage || []).sort(() => Math.random() - 0.5).slice(0, 20)
      log.push(`Selected ${shuffled.length} dreams for image generation`)

      const styles = ['surreal', 'fantasy', 'digital_art', 'cyberpunk', 'impressionist', 'oil_painting', 'watercolor', 'minimalist', 'hyper_realism', 'sketch']

      let successCount = 0
      for (const dream of shuffled) {
        try {
          const style = pick(styles)
          
          // Step 1: Compose cinematic prompt
          const sceneBrief = `Dream Title: "${dream.title}"\n\nDream Scene:\n${dream.content.substring(0, 2000)}\n\nMood: ${dream.mood || 'mysterious'}\nTags: ${(dream.tags || []).join(', ')}`

          const promptRes = await fetch(`${supabaseUrl}/functions/v1/compose-cinematic-prompt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              sceneBrief,
              imageStyle: style,
              hasCharacterReference: false,
            }),
          })

          if (!promptRes.ok) {
            log.push(`Cinematic prompt failed for "${dream.title}": ${promptRes.status}`)
            continue
          }

          const { cinematicPrompt } = await promptRes.json()
          if (!cinematicPrompt) {
            log.push(`No cinematic prompt for "${dream.title}"`)
            continue
          }

          // Step 2: Generate image via AI gateway directly
          const contentParts = [
            {
              type: 'text',
              text: `[CINEMATIC RENDERING DIRECTIVE] Generate this image in PORTRAIT orientation with a 9:16 aspect ratio (e.g., 1024x1820). The frame MUST be taller than it is wide. Render as a single unified cinematic dream scene frame. No text, no words, no UI elements.`
            },
            { type: 'text', text: cinematicPrompt }
          ]

          const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lovableApiKey}`,
            },
            body: JSON.stringify({
              model: 'google/gemini-3-pro-image-preview',
              messages: [{ role: 'user', content: contentParts }],
              modalities: ['image', 'text'],
            }),
          })

          if (!aiRes.ok) {
            log.push(`AI gateway failed for "${dream.title}": ${aiRes.status}`)
            continue
          }

          const aiData = await aiRes.json()
          const message = aiData.choices?.[0]?.message
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
            log.push(`No image in AI response for "${dream.title}"`)
            continue
          }

          // Upload to storage
          const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
          if (!matches) { log.push(`Invalid data URL for "${dream.title}"`); continue }

          const mimeType = matches[1]
          const imageBase64 = matches[2]
          const binaryString = atob(imageBase64)
          const bytes = new Uint8Array(binaryString.length)
          for (let k = 0; k < binaryString.length; k++) bytes[k] = binaryString.charCodeAt(k)

          const ext = mimeType.includes('png') ? 'png' : 'jpg'
          const fileName = `mock-seeds/${dream.id}.${ext}`

          const { error: uploadErr } = await supabase.storage
            .from('dream-images')
            .upload(fileName, bytes, { contentType: mimeType, upsert: true })

          if (uploadErr) {
            log.push(`Upload failed for "${dream.title}": ${uploadErr.message}`)
            continue
          }

          const { data: urlData } = supabase.storage.from('dream-images').getPublicUrl(fileName)
          const finalUrl = urlData.publicUrl

          const { error: updateErr } = await supabase
            .from('dream_entries')
            .update({ image_url: finalUrl })
            .eq('id', dream.id)

          if (updateErr) {
            log.push(`Failed to update dream ${dream.id}: ${updateErr.message}`)
          } else {
            successCount++
            log.push(`✅ Generated image ${successCount}/20 for "${dream.title}" (${style})`)
          }
        } catch (err) {
          log.push(`Error generating image for "${dream.title}": ${err.message}`)
        }
      }

      log.push(`Phase C complete: ${successCount}/${shuffled.length} images generated`)
    }

    return new Response(
      JSON.stringify({ success: true, log }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
