import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { limit = 200 } = await req.json().catch(() => ({}))

    // Step 1: Get all existing mock-seed image URLs
    const { data: dreamsWithImages } = await supabase
      .from('dream_entries')
      .select('image_url')
      .not('image_url', 'is', null)
      .like('image_url', '%mock-seeds%')
      .limit(500)

    const imagePool = [...new Set(
      (dreamsWithImages || [])
        .map((d: any) => d.image_url)
        .filter(Boolean)
    )]

    if (imagePool.length === 0) {
      return new Response(JSON.stringify({ error: 'No mock-seed images found to distribute' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
      })
    }

    console.log(`Image pool size: ${imagePool.length}`)

    // Step 2: Get dreams without images
    const { data: imagelessDreams } = await supabase
      .from('dream_entries')
      .select('id')
      .is('image_url', null)
      .is('generatedImage', null)
      .eq('is_public', true)
      .limit(limit)

    if (!imagelessDreams || imagelessDreams.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'All public dreams already have images', updated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${imagelessDreams.length} dreams without images`)

    // Step 3: Assign images round-robin from the pool
    let updated = 0
    for (let i = 0; i < imagelessDreams.length; i++) {
      const imageUrl = imagePool[i % imagePool.length]
      const { error } = await supabase
        .from('dream_entries')
        .update({ image_url: imageUrl })
        .eq('id', imagelessDreams[i].id)

      if (!error) updated++
      else console.log(`Failed to update ${imagelessDreams[i].id}: ${error.message}`)
    }

    console.log(`Updated ${updated}/${imagelessDreams.length} dreams`)

    return new Response(JSON.stringify({ success: true, updated, total: imagelessDreams.length, poolSize: imagePool.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    })
  }
})
