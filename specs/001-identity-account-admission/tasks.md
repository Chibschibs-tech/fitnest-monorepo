# Tasks: Identity, Account & Admission

**Input**: Design documents from `/specs/001-identity-account-admission/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: INCLUDED — Article XI mandates tests on critical paths (claim idempotency, wallet append-only + balance, referral one-reward-per-phone, cohort reconstruction, session revocation). Tests are limited to those paths; no blanket TDD.

**Organization**: grouped by user story so each is an independently testable increment. Branch: `001-identity-account-admission` (Article XI — never `pricing-unification`).

**Scope (D-030, founder 2026-09-08)**: this slice is **web-only** for UI surfaces. `apps/mobile` is a viewer skeleton; mobile parity is a dedicated later slice. Multi-surface guarantees hold by construction — shared API contracts + `@fitnest/core` (Article XIV), FR-003 via the Supabase Auth model. US3/SC-006 cross-surface checks are verified web ↔ web (two browsers/devices) until the mobile slice.

**Non-negotiable ground rules (from plan & founder arbitrations)**:
- Migrations are DRAFTED under `supabase/migrations/` and applied to the **local** Supabase stack only, until the founder gate T013 arbitrates the production apply (Article II: proposed → reviewed → applied; **T013 requires the founder's explicit approval**). **The gate closes Phase 2: no user-story task starts before it passes.**
- No business rule as a code constant: caps, modes, reward sizes, dormancy come from `app_settings` — **typed, bounded, versioned, append-only history (D-057)**; wallet units from `wallet_units` (Article XIV). Ledger immutability is an **invariant, never a setting** (D-057).
- All admission/cohort dates at **server clock**; ISO-week boundaries (weekly cap, cohorts) computed in **Africa/Casablanca** (D-058). Client clocks are never trusted.
- Every domain route authenticates via `supabase.auth.getUser()` server-side (research R2 — immediate revocation, SC-009). OTP dispatch goes through the server-side Send-SMS hook worker; **no secret ever lives client-side** — anon key only (D-059).
- Interim staff routes use the legacy admin session, write `staff_actions` audit rows, and are **declared obsolete: they switch to the staff model in slice 2** (plan.md Complexity Tracking; D-052 dates the legacy hole).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: workspace tooling for this slice.

- [ ] T001 Add Vitest (pinned) at workspace root and wire `pnpm test`; replace the broken `packages/core` test script (`node --experimental-strip-types src/__tests__/run.ts` → `vitest run`) in `packages/core/package.json` (research R7, Article XI)
- [ ] T002 [P] Add `@supabase/supabase-js` + `@supabase/ssr` (pinned) to `apps/web/package.json`; document `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` entries in `.env.example` (anon key is the only client-visible value — D-059)
- [ ] T003 [P] Configure Supabase Auth phone mode with test phone numbers (fixed OTP, zero SMS — research R4) in `supabase/config.toml` for the local stack (create via `supabase init` if absent, preserving `supabase/migrations/`); verify `supabase start` boots

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: schema, security posture, shared engine scaffolding. No user story starts before this phase completes — **including the founder gate T013**.

**Migrations (drafted, applied locally only — production apply is founder-gated at T013)**:

- [ ] T004 Draft migration `supabase/migrations/20260908120000_identity_tables.sql`: `customer_accounts` (incl. `email_verified_at`, partial UNIQUE index on verified email — D-053), `phone_number_history`, `partners`, `referrals`, `wallet_units`, `wallet_entries`, `admission_notices`, `app_setting_definitions` + `app_settings_versions` (typed, bounded, versioned, append-only — D-057), `staff_actions` exactly per data-model.md (UUID PKs, FKs, CHECK constraints: attribution XOR, self-referral, unique `referred_phone_e164`; all timestamps `timestamptz`, server clock — D-058)
- [ ] T005 Draft migration `supabase/migrations/20260908120100_identity_triggers.sql`: append-only triggers on `wallet_entries`, `staff_actions`, `app_settings_versions` (BEFORE UPDATE OR DELETE raises — research R10, D-057); write-once trigger on `customer_accounts` protected columns (`claimed_at`, `admitted_at`, `first_subscribed_at`, `first_delivery_at`, `acquisition_source`, `referred_by_account_id`, `partner_id` — FR-031); type/bounds validation trigger on `app_settings_versions` against `app_setting_definitions` (D-057)
- [ ] T006 Draft migration `supabase/migrations/20260908120200_identity_rls.sql`: enable RLS on all new tables; owner-SELECT policies on `customer_accounts`, `wallet_entries`, `referrals` (as referrer), `admission_notices` via `auth_user_id = auth.uid()`; zero client-write policies; server-only tables get no client policy at all (research R6, Q-002, D-059)
- [ ] T007 Draft migration `supabase/migrations/20260908120300_identity_seeds_and_subscriptions.sql`: seed `app_setting_definitions` + v1 values (`queue_enabled=true`, `weekly_admission_cap=8` bounded ≥0, `referral_reward_cap=5` bounded ≥0, `referral_reward_days_by_cycle`, `admission_dormancy_weeks=4` bounded ≥1) and `wallet_units` (`day`, `mad`); ALTER `subscriptions` ADD nullable `customer_account_id` (FK), `ended_at`, `price_guaranteed_until` (D-026)
- [ ] T008 Apply T004–T007 to the **local** stack (`supabase db reset`) and smoke-verify constraints (append-only raise, write-once raise, RLS denial, settings bounds rejection) with a throwaway SQL script — do NOT touch production

**Shared infrastructure**:

- [ ] T009 [P] Create Supabase clients in `apps/web/lib/supabase/client.ts` (browser, anon key only) and `apps/web/lib/supabase/server.ts` (service-role + SSR helpers), activating the intent of the dormant `apps/web/lib/auth-supabase.ts` (research R1, D-059)
- [ ] T010 [P] Create `apps/web/lib/auth/require-user.ts`: bearer-token guard calling `supabase.auth.getUser()` per request and resolving the caller's `customer_accounts` row (research R2, SC-009)
- [ ] T011 [P] Create `apps/web/lib/auth/require-legacy-admin.ts`: interim staff guard reusing the existing legacy admin session, marked `@deprecated — dies with slice 2 (staff model, D-052)`; and `apps/web/lib/staff-audit.ts`: `recordStaffAction()` writing `staff_actions` (who, when, what) — mandatory on every interim staff route
- [ ] T012 [P] Scaffold `@fitnest/core` domain modules with types treating wallet units as opaque data (FR-053) and a single time utility pinning ISO-week computation to Africa/Casablanca (D-058): `packages/core/src/identity/`, `packages/core/src/wallet/`, `packages/core/src/referral/`, `packages/core/src/time/`, exported from `packages/core/src/index.ts`

**Founder gate (closes Phase 2 — Article II: proposed → reviewed → applied)**:

- [ ] T013 Present the four draft migrations (T004–T007) to the founder for review and production-apply arbitration — **explicit founder approval required, never assumed**; log the outcome in `docs/decisions-log.md`. No task of phases 3–8 starts before this gate passes.

**Checkpoint**: schema live locally, RLS on, guards and core scaffolding in place, **schema arbitrated by the founder**.

---

## Phase 3: User Story 1 — A visitor claims a place (P1) — MVP

**Goal**: phone + OTP → account + queue position (or direct admission when queue disabled), attribution captured permanently.

**Independent Test**: quickstart § US1 — fresh test number end-to-end; idempotent re-claim; queue-disabled direct admission.

### Tests (critical path — write first, must fail before implementation)

- [ ] T014 [P] [US1] Unit tests for queue position/expected-week derivation (Africa/Casablanca weeks — D-058) and account-state derivation in `packages/core/src/__tests__/identity.test.ts` (position = rank by `claimed_at` among non-admitted; expected week from cap; states queued/admitted/dormant — R8, FR-052, FR-036)
- [ ] T015 [P] [US1] Integration test for claim idempotency + attribution in `apps/web/__tests__/api/claim.test.ts`: same phone twice → same account, no re-attribution (FR-016a); referral code, partner code, invalid/own code → `direct`; queue-disabled claim → immediate `admitted_at` (FR-051); all dates server-clock (D-058)

### Implementation

- [ ] T016 [P] [US1] Implement queue/state derivations in `packages/core/src/identity/queue.ts` and `packages/core/src/identity/states.ts` (pure functions over rows + settings)
- [ ] T017 [P] [US1] Implement attribution resolution in `packages/core/src/referral/attribution.ts`: crockford-base32 code generation (6–8 chars, no 0/O/1/I), referral-vs-partner resolution, self-referral rejection (R12)
- [ ] T018 [US1] Implement `POST /api/account/claim` in `apps/web/app/api/account/claim/route.ts`: transaction creating `customer_accounts` + first `phone_number_history` row + `referrals` row when referred; idempotent per phone; `admitted_at = now()` when `queue_enabled = false`; never fails on a bad attribution code (contracts § claim)
- [ ] T019 [US1] Implement `GET /api/account/me` in `apps/web/app/api/account/me/route.ts`: derived state, queue position + expected week, `queueEnabled`, `canConfigureSubscription`, `referralAvailable` (contracts § me)
- [ ] T020 [US1] Build web claim flow in `apps/web/app/(auth)/claim/page.tsx` + OTP components: phone entry → `signInWithOtp` → code entry → `verifyOtp` → claim → queue/admitted view; FR/EN copy (D-033), mobile-first, retry with fresh code without losing state (US1 scenario 3, Article X); route added to middleware `publicRoutes`, **not linked from navbar/homepage until launch (P2 arbitration)**

**Checkpoint**: a person can claim on the web; accounts, attribution and claim dates land correctly. MVP.

---

## Phase 4: User Story 2 — Waiting without rejection; admission; queue as switchable mode (P1)

**Goal**: honest queue view, manual admission under cap, notices due/sent, queue mode toggle with mass admission, dormancy + reactivation.

**Independent Test**: quickstart § US2 and § Queue-mode switch.

### Tests (critical path)

- [ ] T021 [P] [US2] Integration test for admission cap + queue-mode switch in `apps/web/__tests__/api/admission.test.ts`: cap bounds but never admits, ISO week evaluated in Africa/Casablanca (FR-042, D-058); disable mode → all queued admitted in one transaction with notices (FR-050/051); re-enable → admitted stay admitted; every staff act writes `staff_actions`; settings change = new version row, history immutable (D-057)

### Implementation

- [ ] T022 [US2] Implement `GET /api/admin/queue` in `apps/web/app/api/admin/queue/route.ts`: queued accounts in claim order + current ISO-week (Africa/Casablanca) admission count vs cap (legacy-admin guard + audit)
- [ ] T023 [US2] Implement `POST /api/admin/admissions` in `apps/web/app/api/admin/admissions/route.ts`: weekly-cap check (D-058 week), write-once `admitted_at`, create `admission_notices` row, `staff_actions` audit — records the person's effective admission, never a slot (FR-042, Article IX)
- [ ] T024 [P] [US2] Implement `POST /api/admin/notices/[id]/sent` in `apps/web/app/api/admin/notices/[id]/sent/route.ts` (`sent_at`, `channel`, audit — FR-015, D-016)
- [ ] T025 [US2] Implement `PUT /api/admin/settings/queue-mode` in `apps/web/app/api/admin/settings/queue-mode/route.ts`: disable = single transaction admitting every queued account + notice rows + audit (FR-048–051); and generic `PUT /api/admin/settings/[key]` in `apps/web/app/api/admin/settings/[key]/route.ts`: writes a **new validated version row** (type/bounds per `app_setting_definitions`, D-057) — effective next read, FR-010
- [ ] T026 [US2] Implement `POST /api/account/reactivate` in `apps/web/app/api/account/reactivate/route.ts`: dormant admission reactivation, no queue re-entry, no blame copy (FR-036)
- [ ] T027 [US2] Build web queue-status view in `apps/web/app/account/page.tsx`: position + expected week, admitted state, dormant state with reactivation step — never a rejection, an error shape, or an empty catalogue (FR-014, SC-005); subscription-configuration entry gated by `canConfigureSubscription` (FR-013); FR/EN copy (D-033)
- [ ] T028 [P] [US2] Build minimal interim admin screen in `apps/web/app/admin/admissions/page.tsx`: queue list, admit button (cap-aware), notices due/sent, queue-mode toggle, settings edit with version history visible — protected by the legacy admin session (deprecated, slice 2, D-052)

**Checkpoint**: full queue lifecycle works in both modes; funnel dates (`claimed_at`, `admitted_at`) recorded continuously across the switch.

---

## Phase 5: User Story 3 — Return & sessions (P2)

**Goal**: long-lived sessions, zero avoidable SMS, device list, immediate revocation, lost-phone recovery. Cross-surface unity verified web ↔ web until the mobile slice (D-030).

**Independent Test**: quickstart § US3 — reopen with zero OTP; same account from a second browser/device; revoked token fails on next request.

### Tests (critical path)

- [ ] T029 [P] [US3] Integration test for revocation in `apps/web/__tests__/api/sessions.test.ts`: revoke one session → its token fails on the very next request (SC-009, R2); `scope=others` keeps only the current session (FR-041); email-corroboration branch per D-053 when a verified email exists

### Implementation

- [ ] T030 [P] [US3] Implement device-label derivation from `user_agent` in `packages/core/src/identity/device-label.ts` (shared by all surfaces — R3)
- [ ] T031 [US3] Implement `GET /api/sessions` + `DELETE /api/sessions/[id]` + `DELETE /api/sessions?scope=others` in `apps/web/app/api/sessions/route.ts` and `apps/web/app/api/sessions/[id]/route.ts`: read `auth.sessions` via service role filtered to caller, revoke server-side (FR-039–041); mass revocation from a newly-verified device is corroborated by the verified email when one exists (D-053 — dormant until transactional email exists, phone-OTP-only fallback documented)
- [ ] T032 [US3] Configure session semantics: access-token TTL **1 hour** (founder arbitration — revocation is already immediate via per-request server validation), no refresh-token expiry, in `supabase/config.toml` (local) + document the production dashboard values in `docs/supabase-auth-config.md` (FR-038, R2)
- [ ] T033 [US3] Build web devices view in `apps/web/app/account/devices/page.tsx`: list, disconnect one, disconnect all others (FR/EN copy, D-033)

**Checkpoint**: SC-002/003/006/009 verifiable end-to-end (web ↔ web).

---

## Phase 6: User Story 4 — Referral (P2)

**Goal**: attribution at claim (built in US1) plus reward issuance on first delivery — cap, one-reward-per-number, referrer-active evaluated at issuance, wallet entry in days.

**Independent Test**: quickstart § US4.

### Tests (critical path)

- [ ] T034 [P] [US4] Unit tests for reward eligibility matrix in `packages/core/src/__tests__/referral.test.ts`: cap reached, number already rewarded, referrer inactive at evaluation, reward size by cycle (FR-019–022)
- [ ] T035 [P] [US4] Integration test for first-delivery flow in `apps/web/__tests__/api/first-delivery.test.ts`: `first_delivery_at` write-once, reward issued atomically with `staff_actions` audit (who/when), replay → no double write, no double reward (FR-021, SC-008)

### Implementation

- [ ] T036 [P] [US4] Implement reward-eligibility rules in `packages/core/src/referral/eligibility.ts` (pure; settings-driven cap and sizes)
- [ ] T037 [US4] Implement `POST /api/admin/first-delivery` in `apps/web/app/api/admin/first-delivery/route.ts`: single transaction — write-once `first_delivery_at`, **mandatory `staff_actions` row (caller + moment — founder requirement: without caller traceability a false cohort is undetectable)**, eligibility evaluation, wallet entry (unit `day`, size from `referral_reward_days_by_cycle`), `reward_state` transition; billing dates untouched (FR-017–022, SC-008)
- [ ] T038 [US4] Surface the referral share code (own `referralCode`, gated by `referralAvailable`) in `apps/web/app/account/page.tsx` (FR-022, US4 scenario 5)

**Checkpoint**: full referral lifecycle from claim attribution to issued reward, audited.

---

## Phase 7: User Story 5 — Email at payment (P2)

**Goal**: email stored on demand, never demanded outside the payment path, never an identity factor. Verified email unique per account (D-053).

**Independent Test**: quickstart § US5.

- [ ] T039 [US5] Implement `POST /api/account/email` in `apps/web/app/api/account/email/route.ts`: format validation at the boundary; unverified email non-unique and non-identifying; the partial UNIQUE constraint applies to **verified** emails (D-053 — verification flow dormant until transactional email exists) (FR-006/007)
- [ ] T040 [P] [US5] Add the email-capture step component in `apps/web/app/account/` (rendered only by the future payment path; nothing else ever asks — US5 scenario 2)

**Checkpoint**: account carries email when supplied; phone remains the only anchor.

---

## Phase 8: User Story 6 — Wallet visibility (P3)

**Goal**: balance + immutable history visible to the holder.

**Independent Test**: quickstart § US6.

### Tests (critical path)

- [ ] T041 [P] [US6] Unit tests for balance derivation per unit + consumption-order rule (days before dirhams — rule shipped for the pricing slice) in `packages/core/src/__tests__/wallet.test.ts` (FR-045–047)
- [ ] T042 [P] [US6] Integration test for ledger immutability in `apps/web/__tests__/api/wallet.test.ts`: UPDATE/DELETE on `wallet_entries` raises even as service role; balance = sum of entries (SC-007, R10, D-057 invariant)

### Implementation

- [ ] T043 [P] [US6] Implement balance derivation + unit-opaque types in `packages/core/src/wallet/balance.ts` (units read from `wallet_units`, never enumerated in code — FR-053)
- [ ] T044 [US6] Implement `GET /api/wallet` in `apps/web/app/api/wallet/route.ts` (balances per unit + entries with reason/source/acquired_at — read-only, no consumption endpoint in this slice)
- [ ] T045 [P] [US6] Build wallet view in `apps/web/app/account/wallet/page.tsx` (FR/EN copy, D-033)

**Checkpoint**: SC-007 holds; ledger ready for the pricing slice's redemption rules.

---

## Phase 9: Polish & cross-cutting

- [ ] T046 Document and test the FR-032 cohort-reconstruction SQL (first-subscription week in Africa/Casablanca — D-058, still-active at +4/8/12 weeks) as a committed query in `specs/001-identity-account-admission/cohort-query.sql` + a Vitest asserting it against fixtures (SC-004; depends on T007 columns)
- [ ] T047 [P] Run the full `quickstart.md` validation pass (all US scenarios + queue-mode switch) against the local stack and record results in the PR description
- [ ] T048 [P] Verify workspace-wide `tsc --noEmit` strict pass and green `pnpm test`; wire both into CI for the PR, **including Supabase provisioning in the pipeline** (`supabase start` or equivalent containers) so the integration tests of T015/T021/T029/T035/T042 actually run in CI (Article XI)

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → user stories**: T001–T003 then T004–T013 block everything. **T013 (founder gate on the migrations, explicit approval) closes Phase 2: no user-story task starts before the founder has arbitrated the schema** (Article II: proposed → reviewed → applied).
- **US1 (Phase 3)**: first — every other story consumes accounts created here. MVP.
- **US2 (Phase 4)**: depends on US1 (accounts to queue/admit).
- **US3 (Phase 5)**: depends on US1 only (sessions exist from the first verifyOtp). Can run parallel to US2.
- **US4 (Phase 6)**: depends on US1 (attribution) + needs a subscription fixture for FR-022; reward entry lands in the wallet (tables exist from Phase 2, independent of US6 screens).
- **US5 (Phase 7)**: depends on US1 only. Can run parallel to US2–US4.
- **US6 (Phase 8)**: depends on Phase 2 tables; entries produced by US4 make the test real. Can run parallel to US5.
- **Phase 9**: last.

### Parallel opportunities

- Within Phase 2: T009–T012 in parallel after T008; T013 (founder gate) after all of them.
- After US1: US2, US3, US5 can proceed in parallel; US4 after a subscription fixture exists; US6 anytime after Phase 2.
- All `[P]` test tasks within a story run in parallel before that story's implementation.

## Implementation Strategy

**MVP = Phase 1 + 2 (gate T013 included) + US1**: a person claims with phone + OTP and holds a recorded, attributed place — the unrecoverable Article IX data starts being captured. Stop, validate with quickstart § US1, then deliver US2 (queue lifecycle), then US3–US6 in priority order. Each story is independently testable against the local stack; nothing reaches production before the founder gate T013 has been explicitly approved.

> **Pending injection**: the 2026-09-08 security-review requirements (SEC-01–04, SEC-26, SEC-27 for this slice; SEC-06, SEC-08, SEC-29–32 as transversal foundation) will be added with their acceptance tests as soon as the founder transmits their English text. `/speckit-implement` does not start before that injection.
