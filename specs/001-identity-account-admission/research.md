# Research and corrections — 001

2026-10-18. Prior research at 99d5e2f is preserved in Git history. Statements below distinguish selected architecture, proposed details and proof still required.

## R1 — Identity

Retain Supabase Auth phone OTP and stable `customer_accounts.id` linked by `auth_user_id`. Number control is not ownership of past history; no legacy merge. Verify Supabase Auth linking behavior and risky-session gate with isolated fixtures before exposing domain data.

## R2 — Immediate revocation

Do not claim `getUser()` alone proves a session is live. After validating the token/principal, enforce session status, ownership, risk clearance and bounded lifetime at the authorization boundary. Supabase documents the JWT `session_id` relationship to `auth.sessions`; sign-out can leave a JWT cryptographically valid until expiry. Native lifetime limits are checked on refresh, so row existence alone does not prove all time bounds.

Select and prove the exact guard in S001-SEC-C before implementing T010. Prefer server-only domain APIs with direct table access denied; if any direct path remains, enforce equivalent session/ownership checks there and test it. Fail closed on unavailable session validation. No positive cache may extend access beyond the promised revocation boundary.

## R3 — Device controls

`auth.admin.signOut` takes a JWT, not a session UUID. The old `signOut(session_id)` recipe is removed. Do not directly delete provider-managed rows as an assumed supported API. Qualify a supported targeted-revocation mechanism (or an app-level revocation record consulted on every domain authorization and renewed-token path) with isolated tests; never store another device's raw JWT merely to make an API call work. Session listing is server-only, owner-scoped and minimized. G-SESSION resolves device-count UX; G-RECOVERY protects single and bulk disconnect equally.

Official references checked 2026-10-18: [sessions](https://supabase.com/docs/guides/auth/sessions), [admin signOut](https://supabase.com/docs/reference/javascript/auth-admin-signout). These references support the correction, not a tested Fitnest integration.

## R4 — OTP delivery

Use local-only test numbers/OTP fixtures for development. Live Send-SMS hook worker credentials stay server-side; supplier deliverability, cost, hook timeout/error behavior and cross-instance spend/quota protection require qualification. Provider selection is not asserted to be a configuration-only change.

## R5 — Settings

`app_setting_definitions` plus append-only `app_settings_versions` and a current-value view. Validate types/bounds and reserve a version atomically per key. Business writes retain the effective version. No setting disables ownership, financial or food invariants. Actual runtime DB role cannot mutate history or change triggers/DDL.

## R6 — Database exposure

Inventory every exposed schema/table/view/function/storage/realtime interface, including legacy tables, before introducing public client credentials. Deny client domain access by default; reads use authorized server contracts. Any justified owner-read exception needs an explicit policy plus session/risk tests. Service privileges are server-only; prefer minimum application privileges instead of treating service-role bypass as authorization.

## R7 — Test tooling

The base core package points to a missing runner. T001 introduces a pinned Vitest runner; T048 proves real local database tests in CI. Pin versions only after checking workspace/runtime compatibility. No passing test is claimed by this document.

## R8 — Queue estimation

Derived rank orders by `(claimed_at, id)` for a stable tie-break. Let C be configured weekly cap, A actual admissions this Casablanca ISO week, R=max(C−A,0), p current queued rank. If C=0, return expectedWeek=null and paused=true. Otherwise weekOffset=0 when p<=R, else ceil((p−R)/C). Add calendar ISO weeks in Africa/Casablanca, not fixed UTC durations. This is a conditional capacity estimate under unchanged capacity/claim order, never an admission promise: actual admissions remain manual. Test cap lowered below A, week boundary, rank ties and C=0.

## R9 — Wallet units

Reference-data units `day` and `mad`, exact decimal arithmetic, explicit scale/rounding contract and no conversion inside the ledger. Redemption stores valuation and rule versions separately. New units do not imply new reward mechanics.

## R10 — Ledger enforcement

Least database privileges plus append-only triggers and idempotency uniqueness. RLS bypass is not SQL privilege bypass. Deny UPDATE/DELETE/TRUNCATE and trigger/DDL modification to runtime roles; test those actual roles. Schema owners/migration administrators remain privileged and controlled, so never claim even a superuser cannot alter data. Atomic balance serialization protects concurrent spending; compensation is a new linked entry.

## R11 — Cohorts

Capture first subscription at server-confirmed paid activation, never draft/browser return. Retention needs subscription validity intervals/end events, not only today's status. Bridge columns in REPO-D-026 are obligations for LOT-07; tests reconstruct +4/+8/+12 weeks.

## R12 — Attribution

One short-code resolution mechanism for referral and partnership with disjoint/unambiguous namespaces, collision retry and database uniqueness. Existing users are never reattributed. QR carries a public acquisition code, never a session token.

## R13 — Future affiliation

Preserve REPO-D-025(a/b/c): identity-aware pricing/cache, discount-inclusive frozen price, no affiliation/coupon stacking. Distinguish permanent partner acquisition from ongoing affiliation. No affiliation-discount feature or parallel price grid is built in V1.
