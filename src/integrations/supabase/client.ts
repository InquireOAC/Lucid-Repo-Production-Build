
import { createClient } from '@supabase/supabase-js';

// Get the environment variables (should be set in .env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oelghoaiuvjhywlzldkt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbGdob2FpdXZqaHl3bHpsZGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDIxNjcsImV4cCI6MjA2MTI3ODE2N30.OBX9YYpRFi673ckRHjM0k_yjWl1xBpRM4FY_oJjapWc';

// Export the URL for use in utility functions
export const SUPABASE_URL = supabaseUrl;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
