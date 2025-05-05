import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripePrices = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-products', {
      body: { action: 'getProducts' }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to fetch products');
    }

    if (!data?.products) {
      throw new Error('No products returned from server');
    }
    
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

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { action: 'createSession', productId }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to create checkout session');
    }
    
    if (!data?.sessionId) {
      throw new Error('No session ID returned from server');
    }
    
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
    const { data, error } = await supabase.functions.invoke('create-portal-session');
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to create portal session');
    }
    
    if (!data?.url) {
      throw new Error('No portal URL returned from server');
    }
    
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};