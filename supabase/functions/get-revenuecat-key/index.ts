import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the RevenueCat API key from environment variables
    const revenueCatApiKey = Deno.env.get('REVENUECAT_API_KEY')
    
    if (!revenueCatApiKey) {
      console.error('REVENUECAT_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'RevenueCat API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the API key securely to authenticated requests
    return new Response(
      JSON.stringify({ apiKey: revenueCatApiKey }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in get-revenuecat-key function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})