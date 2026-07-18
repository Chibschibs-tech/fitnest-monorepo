import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Supabase server client bound to the request cookies. This is how the web app
 * will read/refresh the Supabase Auth session server-side after the cutover.
 * Inert until NEXT_PUBLIC_SUPABASE_* env vars are set.
 */
export function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // called from a Server Component - safe to ignore, middleware refreshes
          }
        },
      },
    },
  )
}