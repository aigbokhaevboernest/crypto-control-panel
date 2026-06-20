// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

// For Vite, we need to be careful with environment variables
// The service role key should ONLY be used in server-side or admin contexts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase admin credentials not found. Admin features may not work.');
}

// This client bypasses RLS - USE ONLY IN ADMIN PAGES
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
