
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APPLE_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Product ID mapping - Updated to match expected price IDs
const PRODUCT_MAPPING = {
  'com.lucidrepo.limited.monthly': 'price_basic',
  'com.lucidrepo.unlimited.monthly': 'price_premium'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting iOS purchase verification');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { receiptData, productId, transactionId } = await req.json();
    
    if (!receiptData || !productId) {
      throw new Error('Missing receipt data or product ID');
    }

    console.log(`Verifying purchase for product: ${productId}, user: ${user.id}`);

    // Verify receipt with Apple
    const verificationResult = await verifyWithApple(receiptData);
    
    if (!verificationResult.valid) {
      throw new Error('Invalid receipt');
    }

    console.log('Apple receipt verification successful');

    // Map Apple product ID to our internal price ID
    const priceId = PRODUCT_MAPPING[productId as keyof typeof PRODUCT_MAPPING];
    if (!priceId) {
      console.error('Unknown product ID:', productId);
      throw new Error(`Unknown product ID: ${productId}`);
    }

    console.log(`Mapped product ${productId} to price_id: ${priceId}`);

    // Create or update customer record
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingCustomer?.customer_id) {
      customerId = existingCustomer.customer_id;
      console.log('Using existing customer ID:', customerId);
    } else {
      // Create a new customer record for iOS purchases
      customerId = `ios_${user.id}`;
      const { error: customerError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: customerId,
          email: user.email,
          created_at: new Date().toISOString()
        });
      
      if (customerError) {
        console.error('Error creating customer:', customerError);
        throw customerError;
      }
      console.log('Created new customer ID:', customerId);
    }

    // Calculate period dates (30 days from now)
    const now = Math.floor(Date.now() / 1000);
    const periodEnd = now + (30 * 24 * 60 * 60); // 30 days from now

    // Create or update subscription record
    const subscriptionData = {
      customer_id: customerId,
      user_id: user.id,
      subscription_id: `ios_${transactionId}`,
      price_id: priceId,
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      status: 'active' as const,
      updated_at: new Date().toISOString(),
      dream_analyses_used: 0,
      image_generations_used: 0
    };

    console.log('Inserting/updating subscription:', subscriptionData);

    // First, deactivate any existing subscriptions for this customer
    const { error: deactivateError } = await supabase
      .from('stripe_subscriptions')
      .update({ 
        status: 'canceled' as const,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', customerId)
      .eq('status', 'active');

    if (deactivateError) {
      console.error('Error deactivating existing subscriptions:', deactivateError);
    }

    // Insert the new subscription
    const { error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .insert(subscriptionData);

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log('iOS purchase verified and subscription created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription: subscriptionData,
        message: 'Subscription activated successfully'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error verifying iOS purchase:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to verify iOS purchase and activate subscription'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});

async function verifyWithApple(receiptData: string): Promise<{ valid: boolean; data?: any }> {
  try {
    // First try production endpoint
    let response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'receipt-data': receiptData,
        'password': APPLE_SHARED_SECRET,
        'exclude-old-transactions': true
      }),
    });

    let result = await response.json();
    console.log('Apple production verification result:', result.status);

    // If status is 21007, receipt is from sandbox, try sandbox endpoint
    if (result.status === 21007) {
      console.log('Trying sandbox verification...');
      response = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'receipt-data': receiptData,
          'password': APPLE_SHARED_SECRET,
          'exclude-old-transactions': true
        }),
      });

      result = await response.json();
      console.log('Apple sandbox verification result:', result.status);
    }

    // Status 0 means valid receipt
    if (result.status === 0) {
      return { valid: true, data: result };
    } else {
      console.error('Apple receipt verification failed with status:', result.status);
      return { valid: false };
    }
  } catch (error) {
    console.error('Error verifying with Apple:', error);
    return { valid: false };
  }
}
