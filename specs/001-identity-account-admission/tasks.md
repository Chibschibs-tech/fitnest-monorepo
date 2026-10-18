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
- Every domain route enforces the reviewed token, live-session, time-bound, risk and ownership checks (research R2, SC-009). OTP dispatch goes through the server-side Send-SMS hook worker; **no secret ever lives client-side** — anon key only (D-059).
- New staff routes depend on verified 003 identity/TOTP/permissions; no legacy guard is introduced.

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
- [ ] T006 Draft deny-by-default grants/RLS for every new table and the exposed legacy surfaces inventoried by S001-SEC-B. No client domain writes; API-only reads preferred. Every direct-read exception must validate owner, live session and risk clearance. Tests use actual anon/authenticated/runtime roles (SEC-29).
- [ ] T007 Draft migration `supabase/migrations/20260908120300_identity_seeds_and_subscriptions.sql`: seed `app_setting_definitions` + v1 values (`queue_enabled=true`, `weekly_admission_cap=8` bounded ≥0, `referral_reward_cap=5` bounded ≥0, `referral_reward_days_by_cycle`, `admission_dormancy_weeks=4` bounded ≥1) and `wallet_units` (`day`, `mad`); ALTER `subscriptions` ADD nullable `customer_account_id` (FK), `ended_at`, `price_guaranteed_until` (REPO-D-026)
- [ ] T008 Apply T004–T007 to the **local** stack (`supabase db reset`) and smoke-verify constraints (append-only raise, write-once raise, RLS denial, settings bounds rejection) with a throwaway SQL script — do NOT touch production

**Shared infrastructure**:

- [ ] T009 [P] Create Supabase clients in `apps/web/lib/supabase/client.ts` (browser, anon key only) and `apps/web/lib/supabase/server.ts` (service-role + SSR helpers), activating the intent of the dormant `apps/web/lib/auth-supabase.ts` (research R1, D-059)
- [ ] T010 Implement the reviewed token + live-session + time-bound + risk-clearance + owner guard from S001-SEC-C. Do not infer immediate revocation from getUser() alone; test old JWT against API and exposed direct paths (SEC-03/04/29).
- [ ] T011 Integrate the 003 staff guard (email/password/TOTP, permission/resource scope) and mandatory staff audit. Do not create require-legacy-admin.ts. New staff routes remain unavailable until 003 is verified (D-046/052).
- [ ] T012 [P] Scaffold `@fitnest/core` domain modules with types treating wallet units as opaque data (FR-053) and a single time utility pinning ISO-week computation to Africa/Casablanca (D-058): `packages/core/src/identity/`, `packages/core/src/wallet/`, `packages/core/src/referral/`, `packages/core/src/time/`, exported from `packages/core/src/index.ts`

**Founder gate (closes Phase 2 — Article II: proposed → reviewed → applied)**:

- [ ] T013 Present the four draft migrations (T004–T007) to the founder for review and production-apply arbitration — **explicit founder approval required, never assumed**; log the outcome in `docs/decisions-log.md`. No task of phases 3–8 starts before this gate passes.

**Checkpoint**: schema live locally, RLS/privileges verified, guards and core scaffolding in place, **schema arbitrated by the founder**.

---

## Phase 3: User Story 1 — A visitor claims a place (P1) — MVP

**Goal**: phone + OTP → account + queue position (or direct admission when queue disabled), attribution captured permanently.

**Independent Test**: quickstart § US1 — fresh test number end-to-end; idempotent re-claim; queue-disabled direct admission.

### Tests (critical path — write first, must fail before implementation)

- [ ] T014 [P] [US1] Test queue/state derivation including cap=0 (paused, no date), actual admissions already consumed this week, cap lowered below actual count, stable rank tie-break and Casablanca ISO-week boundary (research R8).
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

- [ ] T021 [US2] Real-database tests: two concurrent admissions for one remaining place never exceed cap; disable queue vs concurrent claim admits consistently; duplicate retries do not duplicate notices; settings versions/audit remain immutable (SEC-11).

### Implementation

- [ ] T022 [US2] Implement `GET /api/admin/queue` in `apps/web/app/api/admin/queue/route.ts`: queued accounts in claim order + current ISO-week (Africa/Casablanca) admission count vs cap (003 staff guard + permission/resource scope + audit)
- [ ] T023 [US2] Implement `POST /api/admin/admissions` in `apps/web/app/api/admin/admissions/route.ts`: weekly-cap check (D-058 week), write-once `admitted_at`, create `admission_notices` row, `staff_actions` audit — records the person's effective admission, never a slot (FR-042, Article IX)
- [ ] T024 [P] [US2] Implement `POST /api/admin/notices/[id]/sent` in `apps/web/app/api/admin/notices/[id]/sent/route.ts` (`sent_at`, `channel`, audit — FR-015, D-016)
- [ ] T025 [US2] Implement `PUT /api/admin/settings/queue-mode` in `apps/web/app/api/admin/settings/queue-mode/route.ts`: disable = single transaction admitting every queued account + notice rows + audit (FR-048–051); and generic `PUT /api/admin/settings/[key]` in `apps/web/app/api/admin/settings/[key]/route.ts`: writes a **new validated version row** (type/bounds per `app_setting_definitions`, D-057) — effective next read, FR-010
- [ ] T026 [US2] Implement `POST /api/account/reactivate` in `apps/web/app/api/account/reactivate/route.ts`: dormant admission reactivation, no queue re-entry, no blame copy (FR-036)
- [ ] T027 [US2] Build web queue-status view in `apps/web/app/account/page.tsx`: position + expected week, admitted state, dormant state with reactivation step — never a rejection, an error shape, or an empty catalogue (FR-014, SC-005); subscription-configuration entry gated by `canConfigureSubscription` (FR-013); FR/EN copy (D-033)
- [ ] T028 [US2] Build admissions/notice/settings screen inside the verified 003 admin shell and permissions, with version conflict/error states. No temporary legacy-auth screen (D-046/052).

**Checkpoint**: full queue lifecycle works in both modes; funnel dates (`claimed_at`, `admitted_at`) recorded continuously across the switch.

---

## Phase 5: User Story 3 — Return & sessions (P2)

**Goal**: long-lived sessions, zero avoidable SMS, device list, immediate revocation, lost-phone recovery. Cross-surface unity verified web ↔ web until the mobile slice (D-030).

**Independent Test**: quickstart § US3 — reopen with zero OTP; same account from a second browser/device; revoked token fails on next request.

### Tests (critical path)

- [ ] T029 [US3] Test revoked access against all domain/direct paths, own/other-device scope, bounded expiry/refresh replay, risky recovery and proof-required single/bulk disconnect; no one-by-one bypass (SEC-03/04).

### Implementation

- [ ] T030 [P] [US3] Implement device-label derivation from `user_agent` in `packages/core/src/identity/device-label.ts` (shared by all surfaces — R3)
- [ ] T031 [US3] Implement owner-scoped device list and targeted/bulk revoke using the supported, tested S001-SEC-C design. Same independent proof applies to disconnecting one other device or all. No signOut(session_id) call and no OTP-only risky fallback (SEC-03/04).
- [ ] T032 [US3] Implement bounded session configuration from the accepted G-SESSION ADR, document deployed/local values and rotation/reuse behavior. Prove server lifetime enforcement; no unlimited refresh/session assumption (D-053).
- [ ] T033 [US3] Handoff native devices/recovery UI to 004/LOT-09, using the shared session contract. Keep this ID as a trace obligation and close it only with native acceptance evidence; no web subscriber devices page (D-040).

**Checkpoint**: SC-002/003/006/009 verifiable end-to-end (web ↔ web).

---

## Phase 6: User Story 4 — Referral (P2)

**Goal**: attribution at claim (built in US1) plus reward issuance on first delivery — cap, one-reward-per-number, referrer-active evaluated at issuance, wallet entry in days.

**Independent Test**: quickstart § US4.

### Tests (critical path)

- [ ] T034 [P] [US4] Unit tests for reward eligibility matrix in `packages/core/src/__tests__/referral.test.ts`: cap reached, number already rewarded, referrer inactive at evaluation, reward size by cycle (FR-019–022)
- [ ] T035 [US4] Real-database tests: authoritative first-delivery event is owner/actor scoped, write-once and source-idempotent; duplicate events and two referrals at cap-minus-one produce at most one allowed reward; correction/replay never reissues (SEC-27).

### Implementation

- [ ] T036 [P] [US4] Implement reward-eligibility rules in `packages/core/src/referral/eligibility.ts` (pure; settings-driven cap and sizes)
- [ ] T037 [US4] Implement internal first-delivery reward handler against the LOT-11 accepted delivery-event contract. Use delivery/subscription/event IDs and authorized transition, not arbitrary account-only success. Record actor, server time, cohort fact and atomic capped reward with outbox/audit; expose no standalone manual backdoor (SEC-10/27).
- [ ] T038 [US4] Handoff referral share/history UI to native LOT-10 using the shared contract and active-subscription eligibility; retain this ID until native proof. No web subscriber referral dashboard (D-040).

**Checkpoint**: full referral lifecycle from claim attribution to issued reward, audited.

---

## Phase 7: User Story 5 — Email at payment (P2)

**Goal**: email stored on demand, never demanded outside the payment path, not the sign-in anchor; verified email is independent recovery proof and unique per account (D-053).

**Independent Test**: quickstart § US5.

- [ ] T039 [US5] Implement account email capture/verification integration with LOT-12: account-bound expiring single-use proof, partial uniqueness for verified normalized email, generic collision error. Payment and risky recovery fail closed until required proof (SEC-04).
- [ ] T040 [US5] Build verified-email step at the web payment summary, connected to LOT-12; claim still requires no email. No unrelated subscriber web management surface (D-013/053).

**Checkpoint**: account carries email when supplied; phone remains the only anchor.

---

## Phase 8: User Story 6 — Wallet visibility (P3)

**Goal**: balance + immutable history visible to the holder.

**Independent Test**: quickstart § US6.

### Tests (critical path)

- [ ] T041 [P] [US6] Unit tests for balance derivation per unit + consumption-order rule (days before dirhams — rule shipped for the pricing slice) in `packages/core/src/__tests__/wallet.test.ts` (FR-045–047)
- [ ] T042 [US6] Test ledger privileges and append-only triggers with actual runtime roles (including TRUNCATE denial), idempotent source and compensation; balance equals sum by unit. Concurrent redemption is additionally owned by LOT-07 (SEC-26).

### Implementation

- [ ] T043 [P] [US6] Implement balance derivation + unit-opaque types in `packages/core/src/wallet/balance.ts` (units read from `wallet_units`, never enumerated in code — FR-053)
- [ ] T044 [US6] Implement `GET /api/wallet` in `apps/web/app/api/wallet/route.ts` (balances per unit + entries with reason/source/acquired_at — read-only, no consumption endpoint in this slice)
- [ ] T045 [US6] Handoff native wallet balances/history UI to LOT-10; preserve day and MAD units and this acceptance ID. Do not build apps/web/app/account/wallet (D-040, MC-08).

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

**Internal claim milestone = Phase 1 + 2 (gate T013 included) + US1**: a person claims with phone + OTP and holds a recorded, attributed place — the unrecoverable Article IX data starts being captured. Validate with quickstart § US1, then deliver US2 (queue lifecycle), then US3–US6 in priority order. Each story is independently testable against the local stack; nothing reaches production before the founder gate T013 has been explicitly approved.

## Security integration — no missing translation blocker

The 32 SEC requirements are now in `docs/delivery/security-requirements.md`; no request for the founder to translate them remains. T001–T048 remain unchecked: this PR changes the plan, not implementation evidence.

- [ ] S001-SEC-A Specify OTP abuse limits, independent recovery/risk workflow and acceptance fixtures (SEC-01/02/04); close G-RECOVERY with evidence before protected production access.
- [ ] S001-SEC-B Inventory actual schema/exposed interfaces and define least-privilege/RLS migration tests including legacy tables, views and RPC; no live writes (SEC-06/29/30).
- [ ] S001-SEC-C Prove supported targeted revocation and bounded session/risk enforcement in isolation; resolve G-SESSION with 004 before T010/T031/T032. Record provider limitations and repeatable tests (SEC-03).

T004–T007 consume S001-SEC-B/C findings. T011/T028 and staff APIs consume verified 003. T039/T040 consume accepted email contract; live use requires service qualification. T037 consumes accepted delivery-event contract and synthetic fixtures; full event chain must be verified before launch. T033/T038/T045 are explicit native handoffs, not V1 scope deletions. Cross-lot status/dependencies are in `docs/delivery/backlog.json`.

T013 remains unchanged: explicit founder migration arbitration closes Phase 2 and blocks 001 phases 3–8. The preparation of contracts/tests and foundation work is not a production application approval. No claim of whole-V1 completion follows from the first claim milestone.
