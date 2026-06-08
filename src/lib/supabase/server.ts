import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Simple server-side Supabase client using direct JS client
// No cookie/auth handling needed since our RLS allows anonymous access
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  }

  return createSupabaseClient(url, key);
}
