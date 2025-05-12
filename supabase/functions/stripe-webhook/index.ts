
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'npm:stripe@14.14.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    console.log('Processing webhook request');
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    // Validate Stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No stripe-signature header');
      return new Response('No stripe-signature header', { status: 400 });
    }

    if (!STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('Invalid Stripe secret key format');
      return new Response('Server configuration error', { status: 500 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    const body = await req.text();
    
    // Verify webhook signature and construct event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      console.log(`Webhook event type: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    // Process different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing subscription: ${subscription.id}`);
        await handleSubscriptionUpdate(stripe, subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Handling deleted subscription: ${subscription.id}`);
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout completed: ${session.id}`);
        await handleCheckoutSession(session);
        // Sync subscription if this was a subscription checkout
        if (session.mode === 'subscription' && typeof session.customer === 'string') {
          await syncCustomerSubscriptions(stripe, session.customer);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.customer === 'string') {
          console.log(`Invoice payment succeeded for subscription: ${invoice.subscription}`);
          await syncCustomerSubscriptions(stripe, invoice.customer);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSubscriptionUpdate(stripe: Stripe, subscription: Stripe.Subscription) {
  try {
    // Get customer data
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    ) as Stripe.Customer;
    
    // Get the price
    const priceId = subscription.items.data[0].price.id;
    
    // Find user_id from customer metadata
    const userId = customer.metadata?.supabase_user_id || 
                  subscription.metadata?.supabase_user_id;
    
    console.log(`Updating subscription for user: ${userId}, price: ${priceId}`);

    // Upsert into stripe_subscriptions
    const { error } = await supabase
      .from('stripe_subscriptions')
      .upsert(
        {
          customer_id: subscription.customer as string,
          user_id: userId,
          subscription_id: subscription.id,
          price_id: priceId,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          status: subscription.status,
          updated_at: new Date().toISOString(),
          // Reset usage credits at renewal
          ...(subscription.status === 'active' && {
            dream_analyses_used: 0,
            image_generations_used: 0
          })
        },
        { onConflict: 'customer_id' }
      );

    if (error) {
      console.error('Error upserting subscription:', error);
      throw error;
    }
    
    console.log(`Successfully updated subscription: ${subscription.id}`);
  } catch (error) {
    console.error('Error in handleSubscriptionUpdate:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Get the customer ID
    const customerId = subscription.customer as string;
    
    // Update subscription as canceled
    const { error } = await supabase
      .from('stripe_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscription.id);
    
    if (error) {
      console.error('Error updating deleted subscription:', error);
      throw error;
    }
    
    console.log(`Marked subscription ${subscription.id} as canceled`);
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  try {
    // Record the completed checkout
    const { error } = await supabase
      .from('stripe_orders')
      .insert({
        checkout_session_id: session.id,
        payment_intent_id: session.payment_intent,
        customer_id: session.customer as string,
        amount_subtotal: session.amount_subtotal,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        status: 'completed',
      });

    if (error) {
      console.error('Error inserting order record:', error);
      throw error;
    }
    
    console.log(`Recorded checkout session: ${session.id}`);
  } catch (error) {
    console.error('Error in handleCheckoutSession:', error);
    throw error;
  }
}

async function syncCustomerSubscriptions(stripe: Stripe, customerId: string) {
  try {
    console.log(`Syncing subscriptions for customer: ${customerId}`);
    
    // Fetch the customer's active subscriptions from Stripe
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method', 'data.items.data.price'],
    });
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No subscriptions found for customer: ${customerId}`);
      return;
    }
    
    for (const subscription of subscriptions) {
      await handleSubscriptionUpdate(stripe, subscription);
    }
    
    console.log(`Successfully synced ${subscriptions.length} subscriptions for customer: ${customerId}`);
  } catch (error) {
    console.error(`Error syncing customer subscriptions:`, error);
    throw error;
  }
}
