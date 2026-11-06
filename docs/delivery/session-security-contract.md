# S001-SEC-C / T010 — executable authorization foundation

Status: implementation proposal; integration and product arbitration remain open.
The pure decision module is `packages/core/src/identity/session.ts`. It is not
yet connected to a public route, and does not verify JWT signatures itself.

The caller must verify the token cryptographically against the pinned Supabase
project/issuer, require the authenticated audience and customer principal, then
read live provider session, account and app clearance with one server time anchor.
Unverified decoding, user metadata, an email string or possession of a recycled
phone number can never create clearance. No positive authorization cache is used.
The returned identity is the account bound to the verified auth user and session.

The module rejects a missing provider session even before JWT expiry. It also
checks absolute lifetime explicitly: Supabase does not synchronously remove every
expired session. The app maintains its own last authorized activity instant; it
does not interpret the timezone-less provider `refreshed_at` as an app clock.
At 2026-10-18, a read-only catalog query on fitnest-db confirmed `auth.sessions.id`,
`user_id`, `created_at`, `not_after` and `refreshed_at`; no session rows were read.

Proposed private application records, to be incorporated in reviewed migrations:

- Account security: account UUID, auth user UUID, revocation generation, suspended.
- Session clearance: provider session UUID, account/auth user, generation,
  cleared/expires/last-activity/revoked timestamps, ownership proof category,
  step-up timestamp and method. No raw access token or refresh token.
- Only server-side proof verification can create or renew clearance. A new OTP
  session on an existing identity starts without historical-data access until proof.
- A targeted revoke marks the app clearance revoked in an owner-scoped transaction.
  All-device revoke increments the account generation. Provider refresh cleanup is
  a separate supported Auth operation; do not call `admin.signOut(session_id)`.
- Other-device revocation always needs fresh verified-email step-up, whether one
  device or all others are selected. This closes the one-by-one eviction bypass.
- Sensitive mutations and revoke operations must use the same per-account lock.
  The transaction rechecks live session/clearance under that lock before business
  writes. After a revocation response commits, a new request cannot use old clearance.
  Previously completed/in-flight reads are not retrospectively revoked.

All durations and the policy version are explicit inputs, with no production
defaults. Tests use synthetic values; they do not resolve G-SESSION, device-count
policy, inactivity duration, or the G-RECOVERY fallback when verified email is absent.
The verified-email proof flow must exist before it can grant clearance; a flag or
client payload is never evidence of verification.

Remaining acceptance: transactional repository implementation and real-role tests,
actual JWT verification/API integration, phone recycle/recovery acceptance,
concurrent revoke/mutation tests, denial of all direct legacy access paths, and
runtime/device qualification. This module alone does not close T010 or SEC-29.

Observed local verification: 40 core tests pass (13 existing time tests, 27 session
cases), and strict core TypeScript passes. The installed Vitest 5.0.5 and TypeScript
5.9.3 binaries were invoked directly; the host's unrelated pnpm launcher attempted
dependency reinstallation and was not used to modify the lockfile.

Sources checked: https://supabase.com/docs/guides/auth/sessions
and the pinned repository data-model contract. No production schema changes.
