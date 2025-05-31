
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APPLE_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Product ID mapping
const PRODUCT_MAPPING = {
  'com.lucidrepo.basic.monthly': 'price_basic',
  'com.lucidrepo.premium.monthly': 'price_premium'
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

    console.log(`Verifying purchase for product: ${productId}`);

    // Verify receipt with Apple
    const verificationResult = await verifyWithApple(receiptData);
    
    if (!verificationResult.valid) {
      throw new Error('Invalid receipt');
    }

    // Map Apple product ID to our internal price ID
    const priceId = PRODUCT_MAPPING[productId as keyof typeof PRODUCT_MAPPING];
    if (!priceId) {
      throw new Error('Unknown product ID');
    }

    // Create or update customer record
    let customerId;
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (customerData?.customer_id) {
      customerId = customerData.customer_id;
    } else {
      // Create a new customer record for iOS purchases
      const iosCustomerId = `ios_${user.id}`;
      await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: iosCustomerId,
          email: user.email,
          created_at: new Date().toISOString()
        });
      customerId = iosCustomerId;
    }

    // Create or update subscription record
    const subscriptionData = {
      customer_id: customerId,
      user_id: user.id,
      subscription_id: `ios_${transactionId}`,
      price_id: priceId,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30 days from now
      cancel_at_period_end: false,
      status: 'active',
      updated_at: new Date().toISOString(),
      dream_analyses_used: 0,
      image_generations_used: 0
    };

    const { error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .upsert(subscriptionData, { onConflict: 'customer_id' });

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      throw subscriptionError;
    }

    console.log('iOS purchase verified and subscription updated successfully');

    return new Response(
      JSON.stringify({ success: true }),
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
      JSON.stringify({ error: error.message }),
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

    // If status is 21007, receipt is from sandbox, try sandbox endpoint
    if (result.status === 21007) {
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
    }

    // Status 0 means valid receipt
    if (result.status === 0) {
      return { valid: true, data: result };
    } else {
      console.error('Apple receipt verification failed:', result);
      return { valid: false };
    }
  } catch (error) {
    console.error('Error verifying with Apple:', error);
    return { valid: false };
  }
}
