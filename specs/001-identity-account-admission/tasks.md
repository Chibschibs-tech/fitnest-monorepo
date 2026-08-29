# Tasks: Identity, Account & Admission

**Input**: Design documents from `/specs/001-identity-account-admission/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: INCLUDED — Article XI mandates tests on critical paths (claim idempotency, wallet append-only + balance, referral one-reward-per-phone, cohort reconstruction, session revocation). Tests are limited to those paths; no blanket TDD.

**Organization**: grouped by user story so each is an independently testable increment. Branch: `001-identity-account-admission` (Article XI — never `pricing-unification`).

**Non-negotiable ground rules (from plan & founder arbitrations)**:
- Migrations are DRAFTED under `supabase/migrations/` and applied to the **local** Supabase stack only, until the founder gate T013 arbitrates the production apply (Article II: proposed → reviewed → applied). **The gate closes Phase 2: no user-story task starts before it passes** — phases 3–8 build against this schema, and a problem discovered later would leave forty tasks built on sand.
- No business rule as a code constant: caps, modes, reward sizes, dormancy come from `app_settings`; wallet units from `wallet_units` (Article XIV).
- Every domain route authenticates via `supabase.auth.getUser()` server-side (research R2 — immediate revocation, SC-009).
- Interim staff routes use the legacy admin session, write `staff_actions` audit rows, and are **declared obsolete: they switch to the staff model in slice 2** (plan.md Complexity Tracking).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: workspace tooling for this slice.

- [ ] T001 Add Vitest (pinned) at workspace root and wire `pnpm test`; replace the broken `packages/core` test script (`node --experimental-strip-types src/__tests__/run.ts` → `vitest run`) in `packages/core/package.json` (research R7, Article XI)
- [ ] T002 [P] Add `@supabase/supabase-js` + `@supabase/ssr` (pinned) to `apps/web/package.json`; add `@supabase/supabase-js` to `apps/mobile/package.json`; document `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_JWT_*` entries in `.env.example`
- [ ] T003 [P] Configure Supabase Auth phone mode with test phone numbers (fixed OTP, zero SMS — research R4) in `supabase/config.toml` for the local stack; verify `supabase start` boots

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: schema, security posture, shared engine scaffolding. No user story starts before this phase completes — **including the founder gate T013**.

**Migrations (drafted, applied locally only — production apply is founder-gated at T013)**:

- [ ] T004 Draft migration `supabase/migrations/20260830120000_identity_tables.sql`: `customer_accounts`, `phone_number_history`, `partners`, `referrals`, `wallet_units`, `wallet_entries`, `admission_notices`, `app_settings`, `staff_actions` exactly per data-model.md (UUID PKs, FKs, CHECK constraints: attribution XOR, self-referral, unique `referred_phone_e164`)
- [ ] T005 Draft migration `supabase/migrations/20260830120100_identity_triggers.sql`: append-only triggers on `wallet_entries` and `staff_actions` (BEFORE UPDATE OR DELETE raises — research R10); write-once trigger on `customer_accounts` protected columns (`claimed_at`, `admitted_at`, `first_subscribed_at`, `first_delivery_at`, `acquisition_source`, `referred_by_account_id`, `partner_id` — FR-031)
- [ ] T006 Draft migration `supabase/migrations/20260830120200_identity_rls.sql`: enable RLS on all nine new tables; owner-SELECT policies on `customer_accounts`, `wallet_entries`, `referrals` (as referrer), `admission_notices` via `auth_user_id = auth.uid()`; zero client-write policies; server-only tables get no client policy at all (research R6, Q-002)
- [ ] T007 Draft migration `supabase/migrations/20260830120300_identity_seeds_and_subscriptions.sql`: seed `wallet_units` (`day`, `mad`) and `app_settings` (`queue_enabled=true`, `weekly_admission_cap=8`, `referral_reward_cap=5`, `referral_reward_days_by_cycle`, `admission_dormancy_weeks=4`); ALTER `subscriptions` ADD nullable `customer_account_id` (FK), `ended_at`, `price_guaranteed_until` (D-026)
- [ ] T008 Apply T004–T007 to the **local** stack (`supabase db reset`) and smoke-verify constraints (append-only raise, write-once raise, RLS denial) with a throwaway SQL script — do NOT touch production

**Shared infrastructure**:

- [ ] T009 [P] Create Supabase clients in `apps/web/lib/supabase/client.ts` (browser) and `apps/web/lib/supabase/server.ts` (service-role + SSR helpers), activating the intent of the dormant `apps/web/lib/auth-supabase.ts` (research R1)
- [ ] T010 [P] Create `apps/web/lib/auth/require-user.ts`: bearer-token guard calling `supabase.auth.getUser()` per request and resolving the caller's `customer_accounts` row (research R2, SC-009)
- [ ] T011 [P] Create `apps/web/lib/auth/require-legacy-admin.ts`: interim staff guard reusing the existing legacy admin session, marked `@deprecated — dies with slice 2 (staff model)`; and `apps/web/lib/staff-audit.ts`: `recordStaffAction()` writing `staff_actions` (who, when, what) — mandatory on every interim staff route
- [ ] T012 [P] Scaffold `@fitnest/core` domain modules with types treating wallet units as opaque data (FR-053): `packages/core/src/identity/`, `packages/core/src/wallet/`, `packages/core/src/referral/`, exported from `packages/core/src/index.ts`

**Founder gate (closes Phase 2 — Article II: proposed → reviewed → applied)**:

- [ ] T013 Present the four draft migrations (T004–T007) to the founder for review and production-apply arbitration; log the outcome in `docs/decisions-log.md`. **No task of phases 3–8 starts before this gate passes** — they all develop against the schema introduced here; a problem discovered after would leave forty tasks built on it.

**Checkpoint**: schema live locally, RLS on, guards and core scaffolding in place, **schema arbitrated by the founder**.

---

## Phase 3: User Story 1 — A visitor claims a place (P1) — MVP

**Goal**: phone + OTP → account + queue position (or direct admission when queue disabled), attribution captured permanently.

**Independent Test**: quickstart § US1 — fresh test number end-to-end; idempotent re-claim; queue-disabled direct admission.

### Tests (critical path — write first, must fail before implementation)

- [ ] T014 [P] [US1] Unit tests for queue position/expected-week derivation and account-state derivation in `packages/core/src/__tests__/identity.test.ts` (position = rank by `claimed_at` among non-admitted; expected week from cap; states queued/admitted/dormant — R8, FR-052, FR-036)
- [ ] T015 [P] [US1] Integration test for claim idempotency + attribution in `apps/web/__tests__/api/claim.test.ts`: same phone twice → same account, no re-attribution (FR-016a); referral code, partner code, invalid/own code → `direct`; queue-disabled claim → immediate `admitted_at` (FR-051)

### Implementation

- [ ] T016 [P] [US1] Implement queue/state derivations in `packages/core/src/identity/queue.ts` and `packages/core/src/identity/states.ts` (pure functions over rows + settings)
- [ ] T017 [P] [US1] Implement attribution resolution in `packages/core/src/referral/attribution.ts`: crockford-base32 code generation (6–8 chars, no 0/O/1/I), referral-vs-partner resolution, self-referral rejection (R12)
- [ ] T018 [US1] Implement `POST /api/account/claim` in `apps/web/app/api/account/claim/route.ts`: transaction creating `customer_accounts` + first `phone_number_history` row + `referrals` row when referred; idempotent per phone; `admitted_at = now()` when `queue_enabled = false`; never fails on a bad attribution code (contracts § claim)
- [ ] T019 [US1] Implement `GET /api/account/me` in `apps/web/app/api/account/me/route.ts`: derived state, queue position + expected week, `queueEnabled`, `canConfigureSubscription`, `referralAvailable` (contracts § me)
- [ ] T020 [US1] Build web claim flow in `apps/web/app/(auth)/claim/page.tsx` + OTP components: phone entry → `signInWithOtp` → code entry → `verifyOtp` → claim → queue/admitted view; French copy, mobile-first, retry with fresh code without losing state (US1 scenario 3, Article X)
- [ ] T021 [P] [US1] Build mobile claim flow in `apps/mobile` (follow the app's existing navigation structure): same SDK calls, same `/api/account/claim` contract — no rule reimplemented client-side (Article XIV)

**Checkpoint**: a person can claim on web and mobile; accounts, attribution and claim dates land correctly. MVP.

---

## Phase 4: User Story 2 — Waiting without rejection; admission; queue as switchable mode (P1)

**Goal**: honest queue view, manual admission under cap, notices due/sent, queue mode toggle with mass admission, dormancy + reactivation.

**Independent Test**: quickstart § US2 and § Queue-mode switch.

### Tests (critical path)

- [ ] T022 [P] [US2] Integration test for admission cap + queue-mode switch in `apps/web/__tests__/api/admission.test.ts`: cap bounds but never admits (FR-042); disable mode → all queued admitted in one transaction with notices (FR-050/051); re-enable → admitted stay admitted; every staff act writes `staff_actions`

### Implementation

- [ ] T023 [US2] Implement `GET /api/admin/queue` in `apps/web/app/api/admin/queue/route.ts`: queued accounts in claim order + current ISO-week admission count vs cap (legacy-admin guard + audit)
- [ ] T024 [US2] Implement `POST /api/admin/admissions` in `apps/web/app/api/admin/admissions/route.ts`: weekly-cap check, write-once `admitted_at`, create `admission_notices` row, `staff_actions` audit — records the person's effective admission, never a slot (FR-042, Article IX)
- [ ] T025 [P] [US2] Implement `POST /api/admin/notices/[id]/sent` in `apps/web/app/api/admin/notices/[id]/sent/route.ts` (`sent_at`, `channel`, audit — FR-015, D-016)
- [ ] T026 [US2] Implement `PUT /api/admin/settings/queue-mode` in `apps/web/app/api/admin/settings/queue-mode/route.ts`: disable = single transaction admitting every queued account + notice rows + audit (FR-048–051); and generic `PUT /api/admin/settings/[key]` in `apps/web/app/api/admin/settings/[key]/route.ts` (cap, reward sizes, dormancy — effective next read, FR-010)
- [ ] T027 [US2] Implement `POST /api/account/reactivate` in `apps/web/app/api/account/reactivate/route.ts`: dormant admission reactivation, no queue re-entry, no blame copy (FR-036)
- [ ] T028 [US2] Build web queue-status view in `apps/web/app/account/page.tsx`: position + expected week, admitted state, dormant state with reactivation step — never a rejection, an error shape, or an empty catalogue (FR-014, SC-005); subscription-configuration entry gated by `canConfigureSubscription` (FR-013)
- [ ] T029 [P] [US2] Build minimal interim admin screen in `apps/web/app/admin/admissions/page.tsx`: queue list, admit button (cap-aware), notices due/sent, queue-mode toggle, settings edit — protected by the legacy admin session (deprecated, slice 2)
- [ ] T030 [P] [US2] Mirror queue-status view in `apps/mobile` (same `/api/account/me` contract, no client-side rules)

**Checkpoint**: full queue lifecycle works in both modes; funnel dates (`claimed_at`, `admitted_at`) recorded continuously across the switch.

---

## Phase 5: User Story 3 — Return & cross-surface sessions (P2)

**Goal**: long-lived sessions, zero avoidable SMS, device list, immediate revocation, lost-phone recovery.

**Independent Test**: quickstart § US3 — reopen with zero OTP; same account on both surfaces; revoked token fails on next request.

### Tests (critical path)

- [ ] T031 [P] [US3] Integration test for revocation in `apps/web/__tests__/api/sessions.test.ts`: revoke one session → its token fails on the very next request (SC-009, R2); `scope=others` keeps only the current session (FR-041)

### Implementation

- [ ] T032 [P] [US3] Implement device-label derivation from `user_agent` in `packages/core/src/identity/device-label.ts` (shared by both surfaces — R3)
- [ ] T033 [US3] Implement `GET /api/sessions` + `DELETE /api/sessions/[id]` + `DELETE /api/sessions?scope=others` in `apps/web/app/api/sessions/route.ts` and `apps/web/app/api/sessions/[id]/route.ts`: read `auth.sessions` via service role filtered to caller, revoke server-side (FR-039–041)
- [ ] T034 [US3] Configure session semantics: access-token TTL **1 hour** (founder arbitration — revocation is already immediate via per-request server validation), no refresh-token expiry, in `supabase/config.toml` (local) + document the production dashboard values in `docs/supabase-auth-config.md` (FR-038, R2)
- [ ] T035 [US3] Build web devices view in `apps/web/app/account/devices/page.tsx`: list, disconnect one, disconnect all others (French copy)
- [ ] T036 [P] [US3] Mirror sign-in persistence + devices view in `apps/mobile` (secure token storage per Supabase SDK defaults; same contracts)

**Checkpoint**: SC-002/003/006/009 verifiable end-to-end.

---

## Phase 6: User Story 4 — Referral (P2)

**Goal**: attribution at claim (built in US1) plus reward issuance on first delivery — cap, one-reward-per-number, referrer-active evaluated at issuance, wallet entry in days.

**Independent Test**: quickstart § US4.

### Tests (critical path)

- [ ] T037 [P] [US4] Unit tests for reward eligibility matrix in `packages/core/src/__tests__/referral.test.ts`: cap reached, number already rewarded, referrer inactive at evaluation, reward size by cycle (FR-019–022)
- [ ] T038 [P] [US4] Integration test for first-delivery flow in `apps/web/__tests__/api/first-delivery.test.ts`: `first_delivery_at` write-once, reward issued atomically with `staff_actions` audit (who/when), replay → no double write, no double reward (FR-021, SC-008)

### Implementation

- [ ] T039 [P] [US4] Implement reward-eligibility rules in `packages/core/src/referral/eligibility.ts` (pure; settings-driven cap and sizes)
- [ ] T040 [US4] Implement `POST /api/admin/first-delivery` in `apps/web/app/api/admin/first-delivery/route.ts`: single transaction — write-once `first_delivery_at`, **mandatory `staff_actions` row (caller + moment — founder requirement: without caller traceability a false cohort is undetectable)**, eligibility evaluation, wallet entry (unit `day`, size from `referral_reward_days_by_cycle`), `reward_state` transition; billing dates untouched (FR-017–022, SC-008)
- [ ] T041 [US4] Surface the referral share code (own `referralCode`, gated by `referralAvailable`) in `apps/web/app/account/page.tsx` and mirror in `apps/mobile` (FR-022, US4 scenario 5)

**Checkpoint**: full referral lifecycle from claim attribution to issued reward, audited.

---

## Phase 7: User Story 5 — Email at payment (P2)

**Goal**: email stored on demand, never demanded outside the payment path, never an identity factor.

**Independent Test**: quickstart § US5.

- [ ] T042 [US5] Implement `POST /api/account/email` in `apps/web/app/api/account/email/route.ts`: format validation at the boundary, stored non-unique (FR-006/007, spec assumption)
- [ ] T043 [P] [US5] Add the email-capture step component in `apps/web/app/account/` (rendered only by the future payment path; nothing else ever asks — US5 scenario 2) and mirror in `apps/mobile`

**Checkpoint**: account carries email when supplied; phone remains the only anchor.

---

## Phase 8: User Story 6 — Wallet visibility (P3)

**Goal**: balance + immutable history visible to the holder.

**Independent Test**: quickstart § US6.

### Tests (critical path)

- [ ] T044 [P] [US6] Unit tests for balance derivation per unit + consumption-order rule (days before dirhams — rule shipped for the pricing slice) in `packages/core/src/__tests__/wallet.test.ts` (FR-045–047)
- [ ] T045 [P] [US6] Integration test for ledger immutability in `apps/web/__tests__/api/wallet.test.ts`: UPDATE/DELETE on `wallet_entries` raises even as service role; balance = sum of entries (SC-007, R10)

### Implementation

- [ ] T046 [P] [US6] Implement balance derivation + unit-opaque types in `packages/core/src/wallet/balance.ts` (units read from `wallet_units`, never enumerated in code — FR-053)
- [ ] T047 [US6] Implement `GET /api/wallet` in `apps/web/app/api/wallet/route.ts` (balances per unit + entries with reason/source/acquired_at — read-only, no consumption endpoint in this slice)
- [ ] T048 [P] [US6] Build wallet view in `apps/web/app/account/wallet/page.tsx` and mirror in `apps/mobile`

**Checkpoint**: SC-007 holds; ledger ready for the pricing slice's redemption rules.

---

## Phase 9: Polish & cross-cutting

- [ ] T049 Document and test the FR-032 cohort-reconstruction SQL (first-subscription week, still-active at +4/8/12 weeks) as a committed query in `specs/001-identity-account-admission/cohort-query.sql` + a Vitest asserting it against fixtures (SC-004; depends on T007 columns)
- [ ] T050 [P] Run the full `quickstart.md` validation pass (all US scenarios + queue-mode switch) against the local stack and record results in the PR description
- [ ] T051 [P] Verify workspace-wide `tsc --noEmit` strict pass and green `pnpm test`; wire both into CI for the PR, **including Supabase provisioning in the pipeline** (`supabase start` or equivalent containers) so the integration tests of T015/T022/T031/T038/T045 actually run in CI (Article XI)

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → user stories**: T001–T003 then T004–T013 block everything. **T013 (founder gate on the migrations) closes Phase 2: no user-story task starts before the founder has arbitrated the schema** (Article II: proposed → reviewed → applied).
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

**MVP = Phase 1 + 2 (gate T013 included) + US1**: a person claims with phone + OTP and holds a recorded, attributed place — the unrecoverable Article IX data starts being captured. Stop, validate with quickstart § US1, then deliver US2 (queue lifecycle), then US3–US6 in priority order. Each story is independently testable against the local stack; nothing reaches production before the founder gate T013 has arbitrated the schema.
