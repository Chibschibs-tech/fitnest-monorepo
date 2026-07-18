import { createBrowserClient } from "@supabase/ssr"

/**
 * Supabase browser client (public key). Used by client components once Supabase
 * Auth is activated. Reads NEXT_PUBLIC_* env vars, so it is inert until those
 * are set in Vercel.
 */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}