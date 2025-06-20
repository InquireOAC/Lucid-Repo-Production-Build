
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload = await req.json()
    console.log('RevenueCat webhook received:', JSON.stringify(payload, null, 2))

    const eventType = payload.event?.type
    const appUserId = payload.event?.app_user_id

    // Handle different event types
    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        console.log(`Processing ${eventType} for user: ${appUserId}`)
        await handleSubscriptionEvent(supabase, payload)
        break
        
      case 'TRANSFER':
        console.log('Processing TRANSFER event')
        await handleTransferEvent(supabase, payload)
        break
        
      case 'CANCELLATION':
      case 'EXPIRATION':
        console.log(`Processing ${eventType} for user: ${appUserId}`)
        await handleCancellationEvent(supabase, payload)
        break
        
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function handleSubscriptionEvent(supabase: any, payload: any) {
  const appUserId = payload.event?.app_user_id
  const productId = payload.event?.product_id
  const entitlements = payload.event?.entitlements

  if (!appUserId) {
    console.error('No app_user_id found in subscription event')
    return
  }

  console.log(`Syncing subscription for user: ${appUserId}`)
  console.log('Product ID:', productId)
  console.log('Entitlements:', entitlements)

  // Create or update subscription record
  const subscriptionId = `revenuecat_${appUserId}_${productId || 'unknown'}`
  
  // Cancel any existing active subscriptions for this user first
  const { error: cancelError } = await supabase
    .from('stripe_subscriptions')
    .update({ 
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', appUserId)
    .eq('status', 'active')

  if (cancelError) {
    console.error('Error canceling existing subscriptions:', cancelError)
  }

  // Create new subscription record
  const subscriptionData = {
    customer_id: `revenuecat_${appUserId}`,
    user_id: appUserId,
    subscription_id: subscriptionId,
    price_id: productId || 'com.lucidrepo.unlimited.monthly',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
    cancel_at_period_end: false,
    dream_analyses_used: 0,
    image_generations_used: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { error: insertError } = await supabase
    .from('stripe_subscriptions')
    .insert(subscriptionData)

  if (insertError) {
    console.error('Error creating subscription:', insertError)
  } else {
    console.log('Subscription created successfully for user:', appUserId)
  }
}

async function handleTransferEvent(supabase: any, payload: any) {
  const transferredFrom = payload.transferred_from?.[0]
  const transferredTo = payload.transferred_to?.[0]

  console.log(`Transfer event: ${transferredFrom} -> ${transferredTo}`)

  if (!transferredFrom || !transferredTo) {
    console.error('Missing transfer user IDs')
    return
  }

  // Update existing subscription records to point to the new user ID
  const { error: updateError } = await supabase
    .from('stripe_subscriptions')
    .update({
      user_id: transferredTo,
      customer_id: `revenuecat_${transferredTo}`,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', transferredFrom)
    .eq('status', 'active')

  if (updateError) {
    console.error('Error updating subscription for transfer:', updateError)
  } else {
    console.log(`Successfully transferred subscription from ${transferredFrom} to ${transferredTo}`)
  }

  // Also update customer records if they exist
  const { error: customerUpdateError } = await supabase
    .from('stripe_customers')
    .update({
      user_id: transferredTo,
      customer_id: `revenuecat_${transferredTo}`,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', transferredFrom)

  if (customerUpdateError) {
    console.error('Error updating customer for transfer:', customerUpdateError)
  }
}

async function handleCancellationEvent(supabase: any, payload: any) {
  const appUserId = payload.event?.app_user_id

  if (!appUserId) {
    console.error('No app_user_id found in cancellation event')
    return
  }

  console.log(`Canceling subscription for user: ${appUserId}`)

  const { error: cancelError } = await supabase
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', appUserId)
    .eq('status', 'active')

  if (cancelError) {
    console.error('Error canceling subscription:', cancelError)
  } else {
    console.log('Subscription canceled successfully for user:', appUserId)
  }
}
