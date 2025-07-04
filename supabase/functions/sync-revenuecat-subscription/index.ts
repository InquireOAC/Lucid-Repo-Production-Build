
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RevenueCatCustomerInfo {
  entitlements: {
    active: Record<string, {
      isActive: boolean;
      productIdentifier: string;
      purchaseDate: string;
      expirationDate?: string;
    }>;
  };
  originalPurchaseDate: string;
  latestExpirationDate?: string;
  activeSubscriptions: string[];
}

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

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { customerInfo } = await req.json() as { customerInfo: RevenueCatCustomerInfo };
    
    console.log('Syncing RevenueCat subscription for user:', user.id);
    console.log('Customer info:', customerInfo);

    // Check if user has active entitlements
    const activeEntitlements = customerInfo.entitlements.active;
    const hasActiveSubscription = Object.keys(activeEntitlements).length > 0;

    if (hasActiveSubscription) {
      // Find the first active entitlement
      const [entitlementKey, entitlement] = Object.entries(activeEntitlements)[0];
      
      console.log('Active entitlement found:', entitlementKey, entitlement);

      // Map product identifier to our price_id
      let priceId = entitlement.productIdentifier;
      
      // Generate a subscription ID for RevenueCat subscriptions
      const subscriptionId = `revenuecat_${user.id}_${entitlement.productIdentifier}`;
      
      // Calculate period timestamps
      const purchaseDate = new Date(entitlement.purchaseDate);
      const expirationDate = entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
      
      // First, ensure we have a customer record for this user
      const customerId = `revenuecat_${user.id}`;
      
      // Check if customer record exists, if not create one
      const { data: existingCustomer } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingCustomer) {
        const { error: customerError } = await supabase
          .from('stripe_customers')
          .insert({
            user_id: user.id,
            customer_id: customerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (customerError) {
          console.error('Error creating customer:', customerError);
          return new Response(
            JSON.stringify({ error: 'Failed to create customer record' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Created new customer ID:', customerId);
      } else {
        console.log('Using existing customer for user:', user.id);
      }

      // Cancel any existing active subscriptions for this user (to avoid duplicates)
      const { error: cancelError } = await supabase
        .from('stripe_subscriptions')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (cancelError) {
        console.error('Error canceling existing subscriptions:', cancelError);
      }

      // Insert new subscription record with both customer_id and user_id for maximum compatibility
      const subscriptionData = {
        customer_id: customerId,
        user_id: user.id, // This is crucial for cross-device access
        subscription_id: subscriptionId,
        price_id: priceId,
        status: 'active' as const,
        current_period_start: Math.floor(purchaseDate.getTime() / 1000),
        current_period_end: expirationDate ? Math.floor(expirationDate.getTime() / 1000) : Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        cancel_at_period_end: false,
        dream_analyses_used: 0,
        image_generations_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('stripe_subscriptions')
        .insert(subscriptionData);

      if (insertError) {
        console.error('Error inserting subscription:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully synced RevenueCat subscription for user:', user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription synced successfully',
          subscriptionId,
          priceId,
          status: 'active',
          userId: user.id // Include user ID in response for verification
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // No active subscription, mark any existing ones as canceled
      const { error: updateError } = await supabase
        .from('stripe_subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscription found',
          status: 'canceled',
          userId: user.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Sync subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
