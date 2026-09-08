# Research — Identity, Account & Admission (001)

Phase 0 output. Every NEEDS CLARIFICATION from the Technical Context is resolved here or explicitly deferred with its blocking scope.

## R1 — Identity & session mechanism: Supabase Auth (phone/OTP mode) vs custom session store

**Decision**: Supabase Auth (GoTrue) in phone/OTP mode. `auth.users` is the identity record; `public.customer_accounts.auth_user_id` (UUID, unique, FK) anchors the domain profile — the exact skeleton the dormant `apps/web/lib/auth-supabase.ts` was kept for (founder arbitration, 2026-08-29).

**Rationale**:
- Q-001's provider criteria already assume "compatibilité avec Supabase Auth en mode phone" — the decision log points here.
- OTP issuance, verification, rate limiting, token refresh, and multi-device sessions are solved infrastructure; rebuilding them is a custom crypto/session surface we would then own (Article XI risk for zero product value).
- Session semantics match FR-038 natively: GoTrue refresh tokens have no calendar expiration by default; a session lives until sign-out or revocation.
- Cross-surface unity (FR-003): same Supabase project, same `auth.users` row from web and mobile SDKs.

**Alternatives considered**:
- *Custom sessions on `pg` (like the legacy `sessions` table)*: full control, but we would own OTP generation, SMS integration, token rotation, and revocation semantics — high-risk reimplementation of a solved problem, and it walls us off from RLS (`auth.uid()`).
- *NextAuth/Auth.js*: web-centric; phone OTP support is a custom provider anyway, and mobile (Expo) would need a second integration — violates "one engine, every surface" (Article XIV).

## R2 — Immediate revocation (SC-009) despite JWT access tokens

**Problem**: GoTrue access tokens are JWTs valid until expiry (default 1 h) even after the session row is revoked. Naive local JWT verification would let a revoked session keep working for up to an hour — violating SC-009.

**Decision**: every domain server route authenticates with `supabase.auth.getUser(jwt)` (server-side call that validates against the live session) rather than local JWT decode. A revoked session then fails on the **next request**, satisfying "no request made after the revocation succeeds" (SC-009). **Access-token TTL: 1 hour** (founder arbitration, 2026-08-30) — since revocation is already immediate on the API side via per-request server validation, the TTL only bounds the client's direct calls to Supabase (owner-only RLS reads); a short TTL would multiply refreshes for no real gain.

**Alternatives considered**: short TTL (e.g. 10 min) — rejected by founder: refresh churn without real gain; local JWT verification with a denylist table — reimplements what `getUser` already does.

## R3 — Device list & per-device revocation (FR-039–041)

**Decision**: sessions are read from `auth.sessions` (GoTrue stores one row per session with `user_agent` and `ip`) via a server route using the service-role client, filtered to the caller's `auth.uid()`. Revocation of one device = `auth.admin.signOut(session_id)` / deletion of that session row (server-side, service role). "Revoke all others" after re-verifying on a new device (FR-041) = GoTrue global sign-out scoped to `others`.

**Rationale**: no custom device table to keep consistent with reality; the session store is the device list. A human-readable device label is derived from `user_agent` at display time (in `@fitnest/core`, shared by both surfaces).

**Alternatives considered**: a domain `devices` table synced on sign-in — a second source of truth that drifts from `auth.sessions`; rejected (Article II spirit: one canon per fact).

## R4 — SMS provider (Q-001, open)

**Decision**: deferred by founder decision — the choice blocks **implementation of live OTP delivery**, not this plan. Development and testing proceed with Supabase Auth *test phone numbers / test OTPs* (fixed codes, zero SMS sent). The integration point is pure configuration: Supabase supports Twilio, MessageBird, Vonage natively and any provider via the *Send SMS hook* — switching providers is config, not code (Article XIV compliant by construction). **D-059 (2026-09-08)**: OTP dispatch goes through the server-side Send-SMS hook worker; SMS-provider credentials live only server-side; the client holds nothing but the public anon key.

**Criteria recorded in decisions log (Q-001)**: Moroccan deliverability, per-SMS cost, Supabase phone-mode compatibility. Expected volume is low by design (FR-005, SC-003) — weight cost accordingly.

## R5 — Business-rule configuration storage (FR-010, FR-020, FR-036, FR-048)

**Decision** *(shape superseded by D-057, 2026-09-08 — see data-model § Settings)*: settings are **typed, bounded, versioned**: `app_setting_definitions` declares type and bounds per key; `app_settings_versions` is an append-only history (value validated by trigger, `changed_by`, `changed_at`); the current value is the highest version. Keys for this slice: `queue_enabled` (bool), `weekly_admission_cap` (int ≥ 0), `referral_reward_cap` (int ≥ 0, default 5), `referral_reward_days_by_cycle` (object: cycle → days), `admission_dormancy_weeks` (int ≥ 1, default 4). Changing any of them is an INSERT of a new version, no release (Article XIV). Invariants (append-only ledger, write-once dates) are **not** settings and cannot be disabled.

**Rationale**: one table, one read path, JSONB gives typed-enough values without a migration per new key. Structured reference data that other tables FK against (partners, wallet units) gets real tables instead — FK integrity beats JSONB there.

**Alternatives considered**: environment variables (violates Article XIV — changing a cap would be a deploy); one column per setting in a singleton row (migration per new setting — exactly what FR-048/XIV forbid).

## R6 — RLS posture (Q-002 becomes acute in this slice)

**Decision**: this slice opens the **first client-side Supabase connection** (auth SDK), so RLS ships with every new table, enabled at creation:
- `customer_accounts`, `wallet_entries`, `referrals` (as referrer), `admission_notices`: SELECT allowed to the owning account (`auth_user_id = auth.uid()` join); **no INSERT/UPDATE/DELETE for clients** — all writes go through server routes using the service-role key.
- `app_settings`, `partners`, `wallet_units`, `phone_number_history`: no client access at all (server-only).
- Legacy tables keep their current no-client-key posture; nothing changes for them here.

**Rationale**: the founder's Q-002 framing — policies must exist *before* the first direct client connection. Deny-by-default with narrow read grants is the smallest correct surface.

## R7 — Test tooling (Article XI)

**Finding**: `packages/core/package.json` declares `"test": "node --experimental-strip-types src/__tests__/run.ts"` but `src/__tests__/` does not exist in the working tree — the script is currently broken.

**Decision**: adopt **Vitest** as the workspace test runner (pinned version, Article XI), starting with `packages/core` (queue derivation, wallet balance & consumption order, referral eligibility) and API-route integration tests in `apps/web`. The broken script is replaced, not worked around.

**Alternatives considered**: keep `node --test` with strip-types — viable but no workspace watch/coverage story and the existing setup is broken anyway; Jest — heavier, slower on TS, no advantage here.

## R8 — Queue position & expected week: stored vs derived

**Decision**: **derived, never stored.** A person's position = their rank by `claimed_at` among non-admitted accounts. Expected week = ceiling(position / `weekly_admission_cap`) weeks from now, surfaced as a week, never a date (spec assumption). Both derivations live in `@fitnest/core` and are computed by one SQL query server-side.

**Rationale**: a stored position is a cache that must be re-shuffled on every admission and cap change — drift risk for zero benefit at launch scale (hundreds/week). Deriving keeps FR-042 (manual admission in any order) and cap changes (US2 scenario 4) automatically consistent. Honesty guarantee of FR-011/FR-014 is a display rule, not storage.

**Alternatives considered**: materialized position column — invalidated by manual out-of-order admission (FR-042 allows staff to admit anyone); a queue table separate from accounts — one more join for no extra fact (claimed_at + admitted_at already encode the queue).

## R9 — Wallet unit extensibility (FR-045, FR-053)

**Decision**: `wallet_units` reference table (`unit text PK`, `label`, `active bool`), seeded with `day` and `mad`. `wallet_entries.unit` FKs to it. Adding "points" tomorrow = one INSERT (Article XIV), while the FK still rejects typos.

**Rationale**: a bare text column satisfies "unit is data" but silently accepts garbage; a Postgres ENUM requires a migration per unit — exactly what FR-053 forbids. The reference table is the only option satisfying both integrity and evolvability.

## R10 — Append-only enforcement for the wallet ledger (FR-024, SC-007)

**Decision**: defense in depth: (1) RLS grants clients SELECT only; (2) a `BEFORE UPDATE OR DELETE` trigger on `wallet_entries` raising an exception unconditionally — even the service-role path cannot mutate history; corrections are compensating entries by construction.

**Alternatives considered**: revoking UPDATE/DELETE privileges only — the service role bypasses grants; application discipline alone — Article VII deserves a database-level guarantee.

## R11 — Cohort reconstruction (FR-032, SC-004)

**Decision**: plain SQL over write-once columns — no materialized views, no analytics infra at this scale. `first_subscribed_at` on the account (written once, at first subscription creation) keys the cohort week; "still active at +4/8/12 weeks" reads subscription validity intervals. The exact query is part of quickstart validation so it is proven computable from day one, not archaeologically later.

**Note**: subscription *creation* is out of this slice; this slice ships the columns and the write contract (contracts/api.md § internal write points) so the pricing/checkout slice writes them from its first day.

## R12 — Attribution codes (FR-016, FR-043)

**Decision**: one mechanic, two owners. `referral_code` on `customer_accounts` and `short_code` on `partners`, both from a crockford-base32-style alphabet (no 0/O/1/I ambiguity), 6–8 chars, unique, hand-typable (Fitpass physical card) and QR-encodable (the QR encodes the claim URL carrying the code). Attribution is resolved server-side at claim time only (FR-016a) and stored permanently (`referred_by_account_id` XOR `partner_id` + `acquisition_source`).

**Alternatives considered**: URL-only attribution — fails the physical-card case; separate attribution-events table — over-modeled, attribution is a write-once fact on the account (FR-031).

## R13 — Affiliation-ready pricing inputs (D-025 — decided, nothing built)

**Founder decision (2026-08-30, replaces the earlier Fitnest Pro proposal)**: negotiated conditions (Fitnest Pro, member-condition partnerships) are **discounts applied automatically per connected account** — an *affiliation carried by the account*, not a parallel price grid. `meal_type_prices` remains the single universal price source (Article IV preserved). Special menus are a distinct need, not covered by a discount, not treated.

**Consequences carried by this slice's contracts, with zero implementation**:
- The pricing engine / preview endpoint (pricing slice) takes the **requester's account identity as an input from its first version** — endpoint, debounced preview, cache keyed by configuration — even while it influences nothing. Without it, adding affiliation later traverses the whole chain.
- The subscription price freeze **includes the applied discount** alongside the frozen price and VAT rate: a collaborator leaving their company never sees their price change mid-cycle.
- Stacking rule recorded, not implemented: affiliation discount applies to the plan price; cycle and coupon keep their existing chain; **no stacking between affiliation and coupon**.

**Impact on this slice's data model**: none structural. `customer_accounts` gains nothing today; adding affiliation later is a reference table + one account reference — a row, not a refactor (Article XIV). Not to be confused with `partners` (claim-time *attribution*, write-once) — an affiliation is an *ongoing condition*; a partner may later own one, via a separate future link.
