import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side usage
let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createClient();
  }

  // Client-side: reuse singleton
  if (!client) {
    client = createClient();
  }
  return client;
}
