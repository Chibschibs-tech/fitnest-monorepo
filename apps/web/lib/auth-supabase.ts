/**
 * Supabase Auth adapter — the drop-in replacement for lib/auth.ts.
 *
 * STATUS: dormant. Nothing imports this yet, so production login is unchanged.
 * It activates only when these env vars are set in Vercel:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY   (server-only, for provisioning)
 *
 * Model: Supabase Auth owns identities in auth.users; the app keeps its own
 * public.users row (role, status, name, etc.) linked by users.auth_id. Session
 * management (JWT + refresh) is handled by @supabase/ssr cookies on web and by
 * the token store on mobile — the same identity works for both.
 *
 * Cutover, once env vars are set:
 *  1. Provision existing users into auth.users (admin.createUser) and backfill
 *     users.auth_id.  (one-off script, uses the service-role client)
 *  2. Point app/api/auth/login + register + session + logout, and the
 *     middleware session check, at these functions instead of lib/auth.ts.
 *  3. Rewrite RLS policies to real per-user rules using auth.uid() = users.auth_id.
 */

import { sql } from "@/lib/db"
import { createSupabaseServer } from "@/lib/supabase-server"
import { createSupabaseAdmin } from "@/lib/supabase"

export interface AppUser {
  id: number
  name: string | null
  email: string
  role: string
}

async function appUserByAuthId(authId: string): Promise<AppUser | null> {
  const rows = await sql`
    SELECT id, name, email, role, status FROM users WHERE auth_id = ${authId} LIMIT 1
  `
  if (rows.length === 0 || rows[0].status !== "active") return null
  const u = rows[0]
  return { id: u.id, name: u.name, email: u.email, role: u.role }
}

/** Email/password sign-in via Supabase Auth; returns the linked app user. */
export async function authenticateUser(email: string, password: string): Promise<AppUser | null> {
  const supabase = createSupabaseServer()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  })
  if (error || !data.user) return null
  return appUserByAuthId(data.user.id)
}

/** Current user from the Supabase Auth cookie session. */
export async function getSessionUser(): Promise<AppUser | null> {
  const supabase = createSupabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return appUserByAuthId(data.user.id)
}

/** Sign out (clears the Supabase Auth cookies). */
export async function deleteSession(): Promise<boolean> {
  const supabase = createSupabaseServer()
  await supabase.auth.signOut()
  return true
}

/** Register: create the auth identity, then the linked app user row. */
export async function createUser(name: string, email: string, password: string): Promise<AppUser | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const supabase = createSupabaseServer()
  const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password })
  if (error || !data.user) return null

  const rows = await sql`
    INSERT INTO users (name, email, role, status, auth_id)
    VALUES (${name}, ${normalizedEmail}, 'customer', 'active', ${data.user.id})
    ON CONFLICT (email) DO UPDATE SET auth_id = ${data.user.id}
    RETURNING id, name, email, role
  `
  return rows[0] ?? null
}

/**
 * One-off provisioning: create an auth.users identity for an existing app user
 * and backfill users.auth_id. Requires the service-role key. Call once per user
 * during the cutover (e.g. the admin), or lazily on first login.
 */
export async function provisionExistingUser(
  email: string,
  password: string,
): Promise<{ ok: boolean; authId?: string; error?: string }> {
  const admin = createSupabaseAdmin()
  if (!admin) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not set" }
  const normalizedEmail = email.toLowerCase().trim()

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  })
  if (error || !data.user) return { ok: false, error: error?.message || "createUser failed" }

  await sql`UPDATE users SET auth_id = ${data.user.id}, updated_at = NOW() WHERE LOWER(email) = ${normalizedEmail}`
  return { ok: true, authId: data.user.id }
}