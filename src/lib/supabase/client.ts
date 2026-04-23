import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient;

export const createClient = () => {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing environment variables for Supabase");
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
};


