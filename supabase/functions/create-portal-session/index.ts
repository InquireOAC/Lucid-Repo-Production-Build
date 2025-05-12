
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'npm:stripe@14.14.0'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting create-portal-session function');
    
    // Initialize Stripe
    if (!STRIPE_SECRET_KEY.startsWith('sk_')) {
      throw new Error('Invalid Stripe secret key format. Please check your environment variables.');
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('Stripe initialized');
    
    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user info
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    console.log(`User authenticated: ${user.id}`);

    // Get customer ID from database
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .single();

    if (customerError || !customerData?.customer_id) {
      throw new Error('Customer not found');
    }
    
    console.log(`Found customer: ${customerData.customer_id}`);

    // Create portal session
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.customer_id,
      return_url: `${origin}/profile?tab=subscription`,
    });
    
    console.log(`Created portal session: ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in create-portal-session:', error);
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
})
