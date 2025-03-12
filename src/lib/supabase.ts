
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use environment variables if available, otherwise use hardcoded values for development
const supabaseUrl = 'https://txrjielutfxndpcwazgl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cmppZWx1dGZ4bmRwY3dhemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzA2OTUsImV4cCI6MjA1NzM0NjY5NX0.0vZVtz_WxIlO--H0nDftV6QBUt6byBl47EHXji38RdY';

// Log that we're creating a Supabase client - helps with debugging
console.log('Creating Supabase client with URL:', supabaseUrl);
console.log('Supabase key validity check:', supabaseAnonKey ? 'Key provided' : 'No key provided');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Check if the client is created
console.log('Supabase client created:', supabase ? 'Success' : 'Failed');
