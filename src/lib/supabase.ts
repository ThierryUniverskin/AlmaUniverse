import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a single instance of the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance
let supabase: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase() {
  if (!supabase) {
    supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // No-op lock to avoid AbortError in React Strict Mode
        lock: async <R,>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
          return await fn();
        },
      },
    });
  }
  return supabase;
}

// For backwards compatibility
export function createClient() {
  return getSupabase();
}
