
import { createClient } from '@supabase/supabase-js';

// Get the environment variables (should be set in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export the URL for use in utility functions
export const SUPABASE_URL = supabaseUrl;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
