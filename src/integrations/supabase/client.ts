
import { createClient } from '@supabase/supabase-js';

// Get the environment variables (should be set in .env file).
// Accept both the canonical name (VITE_SUPABASE_ANON_KEY) and the name the
// project's .env actually uses (VITE_SUPABASE_PUBLISHABLE_KEY) so the two can't
// silently drift and force a fall back to the baked-in key. The anon/publishable
// key is safe to ship to the client; the fallback only exists for local dev.
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbGdob2FpdXZqaHl3bHpsZGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDIxNjcsImV4cCI6MjA2MTI3ODE2N30.OBX9YYpRFi673ckRHjM0k_yjWl1xBpRM4FY_oJjapWc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oelghoaiuvjhywlzldkt.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  FALLBACK_ANON_KEY;

if (
  !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    '[supabase] No VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY set — using the baked-in dev key.',
  );
}

// Export the URL for use in utility functions
export const SUPABASE_URL = supabaseUrl;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
