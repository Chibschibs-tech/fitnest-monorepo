# Supabase Auth cutover — activation checklist

The Supabase Auth layer is built and dormant. Nothing imports it, so production
login is unchanged. To activate it:

## 1. Set env vars (Vercel → fitnest-monorepo-web → Settings → Environment Variables)

    NEXT_PUBLIC_SUPABASE_URL      = https://blboseqvdmpdrthipxdk.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_oOCQO7D-6PPz8vyfBD7HJw_jZLXNLAJ
    SUPABASE_SERVICE_ROLE_KEY     = <from Supabase → Project Settings → API → service_role>  (SECRET)

(The URL and anon/publishable key are public and safe. The service_role key is
secret — set it only in Vercel, never commit it.)

## 2. Provision existing users into Supabase Auth

For each existing app user (currently just the admin), call
`provisionExistingUser(email, password)` from `lib/auth-supabase.ts` once — it
creates the auth.users identity and backfills `users.auth_id`. New sign-ups get
linked automatically by `createUser`.

## 3. Flip the routes

Point these at `lib/auth-supabase.ts` instead of `lib/auth.ts`:
- `app/api/auth/login/route.ts`  → `authenticateUser` (Supabase issues the session cookie via the SSR client; drop the manual `createSession`)
- `app/api/auth/register/route.ts` → `createUser`
- `app/api/auth/logout/route.ts` → `deleteSession`
- `app/api/auth/session/route.ts` and `middleware.ts` → `getSessionUser`

Do it on a branch, verify the Vercel preview build, and test login/register/logout
against the preview URL before promoting.

## 4. Real RLS policies

With auth in place, replace the current lock-everything-out RLS with per-user
rules, e.g.:

    CREATE POLICY "own rows" ON orders FOR SELECT
      USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

## 5. App phase — OAuth

In Supabase → Authentication → Providers, enable Google and Apple and paste
their client IDs / secrets (from the Google Cloud and Apple Developer consoles).
Apple sign-in is mandatory once Google is offered. This is the only part that
needs external dashboards.