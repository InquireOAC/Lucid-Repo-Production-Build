import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'npm:stripe@14.14.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No stripe-signature header', { status: 400 });
    }

    const body = await req.text();
    // Expand the nested price object so we get a real price ID
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
      {
        // @ts-ignore - allow override of options
        expand: ['data.object.items.data.price']
      }
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscription(subscription);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSession(session);
        // Also sync the subscription for this customer immediately
        if (typeof session.customer === 'string') {
          await syncCustomerFromStripe(session.customer);
        }
        break;
      }
      // handle other events as needed…
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function updateSubscription(subscription: Stripe.Subscription) {
  const supabaseUserId = subscription.metadata?.supabase_user_id;
  const priceId = (subscription.items.data[0].price as Stripe.Price).id;

  const { error } = await supabase
    .from('stripe_subscriptions')
    .upsert(
      {
        user_id: supabaseUserId,
        customer_id: subscription.customer,
        subscription_id: subscription.id,
        price_id: priceId,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'subscription_id' }
    );

  if (error) throw error;
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const { error } = await supabase
    .from('stripe_orders')
    .insert({
      checkout_session_id: session.id,
      payment_intent_id: session.payment_intent,
      customer_id: session.customer,
      amount_subtotal: session.amount_subtotal,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      status: 'completed',
    });

  if (error) throw error;
}

async function syncCustomerFromStripe(customerId: string) {
  // fetch the customer's active subscription from Stripe
  const { data: subs } = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: 'all',
    expand: ['data.default_payment_method'],
  });
  if (!subs || subs.data.length === 0) return;

  const subscription = subs.data[0] as Stripe.Subscription;
  await updateSubscription(subscription);
}
