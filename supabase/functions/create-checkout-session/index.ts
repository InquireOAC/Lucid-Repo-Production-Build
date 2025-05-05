import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'npm:stripe@14.14.0'

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

    const { action, productId } = await req.json()

    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    if (action === 'getProducts') {
      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      })

      return new Response(
        JSON.stringify({ 
          products: products.data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.default_price 
              ? `${(product.default_price.unit_amount || 0) / 100} ${product.default_price.currency}/${product.default_price.recurring?.interval}`
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
      if (!productId) {
        throw new Error('Product ID is required')
      }

      // Get the product to access its default price
      const product = await stripe.products.retrieve(productId, {
        expand: ['default_price']
      })

      if (!product.default_price) {
        throw new Error('Product has no default price')
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.default_price.id,
            quantity: 1,
          },
        ],
        success_url: `${req.headers.get('origin')}/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/profile`,
        customer_creation: 'always',
        subscription_data: {
          metadata: {
            supabase_user_id: authHeader,
          },
        },
      })

      return new Response(
        JSON.stringify({ sessionId: session.id }),
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