# Implementation Plan: Identity, Account & Admission

**Branch**: `001-identity-account-admission` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-identity-account-admission/spec.md`

## Summary

Build the customer identity model from a fresh base: phone-anchored accounts verified by one-time code (no password), long-lived revocable sessions, a configuration-switchable admission queue, referral and partner attribution captured at claim time, an append-only unit-typed wallet ledger, and the cohort instrumentation that can never be reconstructed later (Article IX).

Technical approach: Supabase Auth in phone/OTP mode carries identity and sessions (`auth.users` ↔ `public.customer_accounts` via `auth_user_id`, reusing the dormant `auth-supabase.ts` skeleton's intent). All domain state lives in new PostgreSQL tables shipped as **proposed** Supabase migrations (Article II: nothing applied without founder approval — gate T013, explicit). Business rules — queue mode, weekly cap, referral cap and reward sizes, dormancy window, wallet units — are rows in configuration/reference tables, never constants; settings are **typed, bounded, versioned with an immutable history** while ledger immutability is an **invariant no setting can disable** (Article XIV, D-057). Every surface consumes the same server routes and the same `@fitnest/core` domain logic; no rule is reimplemented per surface. **This slice ships web-only UI (D-030)** — `apps/mobile` stays a skeleton, mobile parity is a later slice on the same contracts. OTP dispatch runs through the server-side Send-SMS hook worker and **no secret ever reaches a client** — anon key only (D-059). All domain timestamps are server-clock; ISO weeks compute in Africa/Casablanca (D-058).

## Technical Context

**Language/Version**: TypeScript 5.x, `strict: true` everywhere (Article XI)

**Primary Dependencies**: Next.js (App Router) in `apps/web`; Expo / React Native in `apps/mobile`; `@supabase/supabase-js` (+ `@supabase/ssr` for web) for auth; `pg` for server-side SQL (existing `apps/web/lib/db.ts` pattern); `@fitnest/core` for shared domain logic (queue position/expected week, wallet balance & consumption order, referral eligibility)

**Storage**: Supabase PostgreSQL — `supabase/migrations` is the single canon (Article II). All schema changes in this slice are drafted as migration files and **proposed for founder review before any apply**. Supabase Auth schema (`auth.users`, `auth.sessions`) carries identity & sessions.

**Testing**: Vitest at workspace level for `@fitnest/core` domain logic and API route integration tests (the existing `packages/core` test script points to a missing runner — see research R7). Critical paths under Article XI: claim idempotency, wallet append-only + balance, referral one-reward-per-phone, cohort reconstruction query.

**Target Platform**: Web (Vercel/Node), iOS + Android via Expo. Casablanca market, French-first copy (Article X).

**Project Type**: pnpm monorepo — web app + mobile app + shared package + SQL canon

**Performance Goals**: launch scale (hundreds of claims/week). SC-001 claim flow < 2 min end-to-end; SC-002 ≥95% of same-device returns with zero SMS; SC-009 revocation effective immediately (see research R2 for the token-verification consequence).

**Constraints**: SMS provider unselected (Q-001) — blocks live OTP delivery, not development (test OTP in dev); RLS policies must exist before the first client-side Supabase connection (Q-002) — this slice IS that first connection, so RLS ships with the new tables; no automated notification sending (FR-015, manual at launch); staff model out of scope — admission endpoints get interim protection (see Complexity Tracking); affiliation model (D-025) — nothing built, but the account model and the pricing-slice write contracts must keep account-carried affiliation discounts addable as data (research R13, contracts § internal write contracts).

**Scale/Scope**: 6 user stories, FR-001–053, ~10 new tables, ~12 server routes, 2 client surfaces (web screens in this slice; mobile parity relies on the same routes — see Structure Decision).

## Constitution Check

*GATE: evaluated against Constitution v4.2.0 before Phase 0; re-checked after Phase 1.*

| Article | Gate | Status |
|---|---|---|
| I — Product Truth | Wallet/identity are spine capabilities; no plan named in code; nothing keyed on plan titles | ✅ PASS — no plan references anywhere in this slice |
| II — Schema Discipline | Migrations under `supabase/migrations` only; no runtime DDL; linking by identifier | ✅ PASS — migrations drafted for review, not applied; no DDL in routes; all FKs by id |
| III — Do Not Build | No points mechanics, no Express Shop, no staff model, no phone-change flow, no automated sending | ✅ PASS — spec's Out-of-scope list enforced; FR-053 explicitly forbids points mechanics |
| IV — Pricing Engine | No price computation in this slice; day valuation (FR-047) is specified but redemption is deferred to pricing slice | ✅ PASS — wallet stores units, never converts; FR-033–035 record/read prices, never compute them |
| V — Identity & Account | Phone anchor, OTP verifies (not sessions), no customer password, email nullable-until-payment, one number = one account cross-surface | ✅ PASS — this slice implements Article V CUSTOMERS verbatim |
| VI — Subscription Configuration | Server-persisted draft, atomic creation, calorie rules | N/A — subscription configuration is not built in this slice; admission only gates the entry to it (FR-013). Applies to the pricing/checkout slice |
| VII — Wallet | Append-only ledger, balance derived, corrections are compensating entries, rewards never move billing dates | ✅ PASS — enforced by trigger + no-UPDATE/DELETE policy (data-model) |
| VIII — Payments | No processor SDK, opaque server payment session, server-side confirmation | N/A — no payment is built here; only the email-before-payment account behaviour (FR-006) is delivered, the payment itself is a later slice |
| IX — Cohort Instrumentation | claimed_at, admitted_at, first_subscribed_at, first_delivery_at, acquisition source captured from first account; never overwritten | ✅ PASS — write-once columns + FR-032 reconstruction query proven in quickstart |
| X — Mobile-first UX | French copy, no dead ends for queued users (FR-014), honest expected week | ✅ PASS — queue screens designed no-rejection by spec |
| XI — Quality Gates | Feature branch, PR + green CI, TS strict, tests on critical paths | ✅ PASS — branch exists; Vitest introduced (research R7) |
| XII — Traceability | Every rule carries surface/market/status | ✅ PASS — spec Traceability table complete |
| XIII — Governance | Plan states compliance per article; exceptions are escalated, never self-granted | ✅ PASS — this table is the per-article statement required by XIII.2; the two exceptions (legacy admin session, manual first-delivery endpoint) are escalated in Complexity Tracking and were arbitrated by the founder on 2026-08-30 |
| XIV — Evolvability | Queue mode, caps, reward sizes, wallet units are data; same engine for both surfaces | ✅ PASS — `app_settings` + reference tables; `@fitnest/core` shared logic |

**Flagged exception (justified below)**: admission and queue-mode toggling are staff acts (FR-042, FR-048) but the staff model is a separate future feature. Interim: these server routes are protected by the **existing legacy admin session** until the staff feature lands. This touches Article V STAFF territory without implementing it — recorded in Complexity Tracking.

**Post-design re-check (after Phase 1)**: no new violation introduced. The data model adds no plan-title linkage, no code-enumerated business rule, no mutable ledger path. Gates hold.

## Project Structure

### Documentation (this feature)

```text
specs/001-identity-account-admission/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (incl. proposed migration DDL — NOT applied)
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Server route contracts (both surfaces consume these)
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
supabase/
└── migrations/          # Canon (Article II). New files DRAFTED by this slice,
                         # applied only after founder approval.

packages/core/
└── src/
    ├── identity/        # queue position & expected-week derivation, account states
    ├── wallet/          # balance derivation, unit typing, consumption-order rule
    ├── referral/        # attribution & reward-eligibility rules
    └── __tests__/       # Vitest — critical-path tests (Article XI)

apps/web/
├── app/
│   ├── (auth)/claim/    # claim flow: phone → OTP → account + queue/direct
│   ├── account/         # queue status, devices/sessions, wallet screens
│   └── api/
│       ├── account/     # claim, me, email
│       ├── queue/       # status
│       ├── sessions/    # list & revoke devices
│       ├── wallet/      # balance + ledger
│       └── admin/
│           ├── admissions/   # manual admission under cap (interim legacy-admin auth)
│           ├── queue-mode/   # enable/disable (mass-admit on disable)
│           ├── notices/      # mark admission notice sent
│           └── first-delivery/  # manual first-delivery completion → reward issuance
└── lib/
    ├── supabase/        # browser + server clients (activates dormant auth-supabase.ts intent)
    └── db.ts            # existing pg pool (server-side reads/writes)

apps/mobile/             # UNTOUCHED in this slice (D-030, web-only) — future mobile-parity
                         # slice consumes the same contracts and @fitnest/core
```

**Structure Decision**: single shared backend — all domain writes go through `apps/web/app/api/*` server routes backed by `@fitnest/core` rules; every surface is a thin client of the same contracts (Article XIV: one engine, every surface; D-059). This slice builds the web client only (D-030). Supabase Auth is the only component clients talk to directly (OTP send/verify, token refresh — anon key only, no client secret); every domain table is behind RLS that denies client writes (research R6).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Admission/queue-mode/notice/first-delivery admin routes protected by the **legacy password-based admin session** (Article V STAFF not yet built) | FR-042 requires a manual staff act now; the staff model is a separate arbitrated feature | Building the staff table/roles inside this slice would smuggle a whole feature past its own spec (Article III). Leaving the routes unprotected is unacceptable. **Written expiry (founder, 2026-08-30): the legacy mechanism is declared obsolete — SHA-256, static salt committed to the repo, password formerly stored in clear. It must not survive this slice: the staff routes (admissions, queue-mode, notices, first-delivery) switch to the staff model in slice 2.** |
| A minimal **manual first-delivery endpoint** although deliveries are out of scope | FR-017: referral reward triggers on first completed delivery; without a trigger point the reward path (US4) is untestable and the `first_delivery_at` cohort date (FR-028, Article IX) is uncapturable | Waiting for the delivery slice would defer Article IX-grade capture; automating deliveries here would violate Article III. A staff-marked event is the smallest honest trigger, matching D-016 (manual operations at launch). |
