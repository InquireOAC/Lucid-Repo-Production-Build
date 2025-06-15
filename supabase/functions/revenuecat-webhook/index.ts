
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    type: string;
    id: string;
    event_timestamp_ms: number;
    app_user_id: string;
    aliases?: string[];
    original_app_user_id?: string;
  };
  app_id: string;
  entitlements?: Record<string, {
    expires_date?: string;
    grace_period_expires_date?: string;
    product_identifier: string;
    purchase_date: string;
  }>;
  product_id?: string;
  period_type?: string;
  purchased_at_ms?: number;
}

interface CreditGrantConfig {
  [key: string]: number;
}

// Credits are used ONLY for image generation
// Analysis is unlimited for all subscribers
const IMAGE_GENERATION_CREDITS: CreditGrantConfig = {
  'com.lucidrepo.limited.monthly': 25,     // Basic: 25 image generations
  'com.lucidrepo.unlimited.monthly': 1000, // Premium: 1000 image generations
  'limited': 25,      // fallback without .monthly
  'unlimited': 1000   // fallback without .monthly
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload: RevenueCatWebhookEvent = await req.json();
    
    console.log('RevenueCat webhook received:', {
      eventType: payload.event?.type,
      appUserId: payload.event?.app_user_id,
      entitlements: payload.entitlements,
      productId: payload.product_id
    });

    // Validate required fields
    if (!payload.event?.app_user_id) {
      console.error('Missing app_user_id in webhook payload');
      return new Response(
        JSON.stringify({ error: 'Missing app_user_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { type: eventType, app_user_id: userId } = payload.event;

    // Only process INITIAL_PURCHASE and RENEWAL events
    if (!['INITIAL_PURCHASE', 'RENEWAL'].includes(eventType)) {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(
        JSON.stringify({ message: `Event type ${eventType} ignored` }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user exists in Supabase
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id, available_credits')
      .eq('id', userId)
      .single();

    if (userError || !userExists) {
      console.error('User not found in Supabase:', userId, userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine credits to grant based on entitlements (for image generation only)
    let creditsToGrant = 0;
    let entitlementKey = '';

    if (payload.entitlements) {
      // Check active entitlements
      for (const [key, entitlement] of Object.entries(payload.entitlements)) {
        if (IMAGE_GENERATION_CREDITS[entitlement.product_identifier]) {
          creditsToGrant = IMAGE_GENERATION_CREDITS[entitlement.product_identifier];
          entitlementKey = entitlement.product_identifier;
          break;
        }
      }
    }

    // Fallback: check product_id if no entitlement match
    if (creditsToGrant === 0 && payload.product_id) {
      if (IMAGE_GENERATION_CREDITS[payload.product_id]) {
        creditsToGrant = IMAGE_GENERATION_CREDITS[payload.product_id];
        entitlementKey = payload.product_id;
      } else {
        // Try to match partial product names for fallback
        for (const [key, credits] of Object.entries(IMAGE_GENERATION_CREDITS)) {
          if (payload.product_id.toLowerCase().includes(key.toLowerCase())) {
            creditsToGrant = credits;
            entitlementKey = payload.product_id;
            break;
          }
        }
      }
    }

    if (creditsToGrant === 0) {
      console.error('No matching entitlement or product found for credit grant:', {
        entitlements: payload.entitlements,
        productId: payload.product_id
      });
      return new Response(
        JSON.stringify({ error: 'No matching entitlement for credit grant' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Granting ${creditsToGrant} image generation credits for entitlement: ${entitlementKey}`);

    // Start transaction to update credits and insert transaction record
    const { error: transactionError } = await supabase.rpc('process_credit_grant', {
      p_user_id: userId,
      p_credits_granted: creditsToGrant,
      p_source: 'RevenueCat webhook - Image generation credits',
      p_entitlement: entitlementKey
    });

    if (transactionError) {
      // If RPC doesn't exist, do it manually with two separate operations
      console.log('RPC not found, using manual approach');
      
      // Insert credit transaction record
      const { error: insertError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          credits_granted: creditsToGrant,
          source: 'RevenueCat webhook - Image generation credits',
          timestamp: new Date().toISOString()
        });

      if (insertError) {
        console.error('Failed to insert credit transaction:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to record credit transaction' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Update user's available credits
      const newCreditTotal = userExists.available_credits + creditsToGrant;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ available_credits: newCreditTotal })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user credits:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update user credits' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log(`Successfully granted ${creditsToGrant} image generation credits to user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Granted ${creditsToGrant} image generation credits to user ${userId}`,
        creditsGranted: creditsToGrant,
        entitlement: entitlementKey,
        note: 'Dream analysis is unlimited for all subscribers'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('RevenueCat webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
