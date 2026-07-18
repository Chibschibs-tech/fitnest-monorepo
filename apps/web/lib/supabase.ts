import { createClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client for privileged server operations (e.g.
 * provisioning existing users into Supabase Auth during the cutover).
 * SERVICE ROLE KEY IS SECRET - server only, never imported by client code.
 * Inert until SUPABASE_SERVICE_ROLE_KEY is set in Vercel.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}