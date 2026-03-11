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

    const { limit = 100 } = await req.json().catch(() => ({}))

    // Get pool of existing mock-seed images
    const { data: dreamsWithImages } = await supabase
      .from('dream_entries')
      .select('image_url')
      .not('image_url', 'is', null)
      .like('image_url', '%mock-seeds%')
      .limit(500)

    const imagePool = [...new Set(
      (dreamsWithImages || []).map((d: any) => d.image_url).filter(Boolean)
    )]

    if (imagePool.length === 0) {
      return new Response(JSON.stringify({ error: 'No mock-seed images found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
      })
    }

    // Get imageless dreams
    const { data: imagelessDreams } = await supabase
      .from('dream_entries')
      .select('id')
      .is('image_url', null)
      .is('generatedImage', null)
      .eq('is_public', true)
      .limit(limit)

    if (!imagelessDreams || imagelessDreams.length === 0) {
      return new Response(JSON.stringify({ success: true, updated: 0, remaining: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Batch update using parallel promises (groups of 10)
    let updated = 0
    const batchSize = 10
    for (let b = 0; b < imagelessDreams.length; b += batchSize) {
      const batch = imagelessDreams.slice(b, b + batchSize)
      const promises = batch.map((dream, idx) => {
        const imageUrl = imagePool[(b + idx) % imagePool.length]
        return supabase
          .from('dream_entries')
          .update({ image_url: imageUrl })
          .eq('id', dream.id)
      })
      const results = await Promise.all(promises)
      updated += results.filter(r => !r.error).length
    }

    // Check remaining
    const { count } = await supabase
      .from('dream_entries')
      .select('id', { count: 'exact', head: true })
      .is('image_url', null)
      .is('generatedImage', null)
      .eq('is_public', true)

    return new Response(JSON.stringify({ success: true, updated, remaining: count || 0, poolSize: imagePool.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    })
  }
})
