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
    // Parse platform from request body
    let platform = 'ios'; // default to iOS for backward compatibility
    try {
      const body = await req.json();
      if (body?.platform) {
        platform = body.platform;
      }
    } catch {
      // No body or invalid JSON — default to iOS
    }

    // Return the correct API key based on platform
    const secretName = platform === 'android' ? 'REVENUECAT_ANDROID_API_KEY' : 'REVENUECAT_API_KEY';
    const revenueCatApiKey = Deno.env.get(secretName);

    if (!revenueCatApiKey) {
      console.error(`${secretName} not found in environment variables`);
      return new Response(
        JSON.stringify({ error: `RevenueCat API key not configured for platform: ${platform}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Returning RevenueCat key for platform: ${platform}`);

    return new Response(
      JSON.stringify({ apiKey: revenueCatApiKey }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-revenuecat-key function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
