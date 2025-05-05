
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripePrices = async () => {
  try {
    console.log("Calling get-products function to fetch prices...");
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { action: 'getProducts' }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to fetch products');
    }

    if (!data?.products) {
      console.error('No products returned from server');
      throw new Error('No products returned from server');
    }
    
    console.log("Products received:", data.products);
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createCheckoutSession = async (productId: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    console.log(`Creating checkout session for product ID: ${productId}`);
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { action: 'createSession', productId }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to create checkout session');
    }
    
    if (!data?.sessionId) {
      console.error('No session ID returned from server');
      throw new Error('No session ID returned from server');
    }
    
    console.log(`Redirecting to checkout with session ID: ${data.sessionId}`);
    const { error: stripeError } = await stripe.redirectToCheckout({ 
      sessionId: data.sessionId 
    });
    
    if (stripeError) {
      throw new Error(stripeError.message);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async () => {
  try {
    console.log("Creating portal session...");
    const { data, error } = await supabase.functions.invoke('create-portal-session');
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to create portal session');
    }
    
    if (!data?.url) {
      console.error('No portal URL returned from server');
      throw new Error('No portal URL returned from server');
    }
    
    console.log(`Redirecting to portal URL: ${data.url}`);
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};
