
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'npm:stripe@14.14.0'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const { action, priceId } = await req.json()

    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    if (action === 'getProducts') {
      // Get all active products from Stripe
      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      })

      return new Response(
        JSON.stringify({ 
          products: products.data.map(product => ({
            id: product.default_price ? (product.default_price as Stripe.Price).id : '',
            name: product.name,
            description: product.description,
            price: product.default_price 
              ? `${((product.default_price as Stripe.Price).unit_amount || 0) / 100} ${(product.default_price as Stripe.Price).currency}/${(product.default_price as Stripe.Price).recurring?.interval}`
              : 'N/A',
            features: product.metadata.features ? 
              JSON.parse(product.metadata.features) : []
          }))
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (action === 'createSession') {
      if (!priceId) {
        throw new Error('Price ID is required')
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Fetch user information
      const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Check if customer already exists
      let customerId;
      const { data: customerData } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (customerData?.customer_id) {
        customerId = customerData.customer_id;
      } else {
        // Create a new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id
          }
        })
        
        // Store customer in database
        await supabase
          .from('stripe_customers')
          .insert({
            user_id: user.id,
            customer_id: stripeCustomer.id,
            email: user.email,
            created_at: new Date().toISOString()
          })
        
        customerId = stripeCustomer.id;
      }

      // Create checkout session
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
        success_url: `${req.headers.get('origin')}/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/profile`,
        subscription_data: {
          metadata: {
            supabase_user_id: user.id,
          },
        },
      })

      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
