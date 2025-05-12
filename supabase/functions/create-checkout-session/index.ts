
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
    console.log('Starting create-checkout-session function');
    
    // Validate Stripe key with better diagnostics
    if (!STRIPE_SECRET_KEY) {
      console.error('Missing Stripe secret key');
      throw new Error('Missing Stripe API key. Please set STRIPE_SECRET_KEY in your edge function secrets.');
    }
    
    if (!STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error(`Invalid Stripe secret key format: ${STRIPE_SECRET_KEY.substring(0, 5)}...`);
      throw new Error('Invalid Stripe API key format. The key should start with "sk_".');
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    console.log('Stripe initialized successfully');

    const { action, priceId } = await req.json();
    console.log(`Action: ${action}, PriceId: ${priceId || 'not provided'}`);

    // Verify authentication except for the getProducts action which can be public
    if (action !== 'getProducts') {
      const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
      if (!authHeader) {
        throw new Error('No authorization header provided');
      }
    }

    if (action === 'getProducts') {
      console.log('Fetching all products from Stripe');
      try {
        // First, verify the Stripe connection with a simple API call
        await stripe.balance.retrieve();
        console.log('Stripe connection verified successfully');
        
        // Get all active products and prices from Stripe
        const products = await stripe.products.list({
          active: true,
          expand: ['data.default_price'],
        });

        console.log(`Found ${products.data.length} products`);
        
        // Format products for frontend display
        const formattedProducts = products.data
          .filter(product => product.default_price)
          .map(product => {
            const price = product.default_price as Stripe.Price;
            const unitAmount = price.unit_amount || 0;
            const currency = price.currency || 'usd';
            const interval = price.recurring?.interval || 'month';
            
            // Parse features from metadata or use defaults
            let features = [];
            try {
              if (product.metadata.features) {
                features = JSON.parse(product.metadata.features);
              }
            } catch (e) {
              console.error('Error parsing product features:', e);
              features = [];
            }

            // Add default features if none exist
            if (features.length === 0) {
              if (product.name.toLowerCase().includes('premium')) {
                features = [
                  'Unlimited dream analyses',
                  '20 Image generations per month',
                  'Advanced dream patterns detection',
                  'Priority support'
                ];
              } else {
                features = [
                  '10 Dream analyses per month',
                  '5 Image generations per month',
                  'Dream journal backup'
                ];
              }
            }

            return {
              id: price.id,
              name: product.name,
              description: product.description,
              price: `$${(unitAmount / 100).toFixed(2)}/${interval}`,
              features: features
            };
          });

        return new Response(
          JSON.stringify({ products: formattedProducts }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (stripeError) {
        console.error('Stripe error fetching products:', stripeError);
        
        // Return fallback products with a 200 status
        const fallbackProducts = [
          {
            id: 'price_basic',
            name: 'Basic',
            price: '$4.99/month',
            features: ['10 Dream analyses per month', '5 Image generations per month', 'Dream journal backup']
          },
          {
            id: 'price_premium',
            name: 'Premium',
            price: '$9.99/month',
            features: ['Unlimited dream analyses', '20 Image generations per month', 'Advanced dream patterns detection', 'Priority support']
          }
        ];
        
        console.log('Returning fallback products due to Stripe error');
        return new Response(
          JSON.stringify({ 
            products: fallbackProducts,
            error: 'Could not fetch products from Stripe, using default data',
            errorDetails: stripeError.message
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    if (action === 'createSession') {
      if (!priceId) {
        throw new Error('Price ID is required');
      }

      const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
      if (!authHeader) {
        throw new Error('No authorization header provided');
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase credentials not configured');
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Fetch user information
      const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      console.log(`User authenticated: ${user.id}`);

      // Check if customer already exists
      let customerId;
      const { data: customerData } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerData?.customer_id) {
        customerId = customerData.customer_id;
        console.log(`Found existing customer: ${customerId}`);
      } else {
        // Create a new Stripe customer
        try {
          const stripeCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
              supabase_user_id: user.id
            }
          });
          
          // Store customer in database
          await supabase
            .from('stripe_customers')
            .insert({
              user_id: user.id,
              customer_id: stripeCustomer.id,
              email: user.email,
              created_at: new Date().toISOString()
            });
          
          customerId = stripeCustomer.id;
          console.log(`Created new customer: ${customerId}`);
        } catch (stripeError) {
          console.error('Error creating Stripe customer:', stripeError);
          throw new Error(`Failed to create Stripe customer: ${stripeError.message}`);
        }
      }

      // Create checkout session
      try {
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${origin}/profile?tab=subscription&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/profile?tab=subscription&canceled=true`,
          subscription_data: {
            metadata: {
              supabase_user_id: user.id,
            },
          },
        });
        
        console.log(`Created checkout session: ${session.id}`);

        return new Response(
          JSON.stringify({ url: session.url }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (stripeError) {
        console.error('Error creating checkout session:', stripeError);
        throw new Error(`Failed to create checkout session: ${stripeError.message}`);
      }
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    
    // Determine if this is a Stripe-specific error
    const isStripeError = error.type && error.type.startsWith('Stripe');
    const errorMessage = error.message || 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        isStripeError: isStripeError || false,
        code: error.code || 'unknown_error'
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
})
