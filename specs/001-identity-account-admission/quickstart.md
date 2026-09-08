# Quickstart — Validation guide for slice 001

Runnable scenarios proving the feature end-to-end. References: [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md). No implementation code here — this is the validation script.

## Prerequisites

- `pnpm install` at repo root; Docker running.
- `supabase start` (local stack) — the proposed migrations of this slice applied **locally only** (production apply is a founder-gated act, Article II).
- Supabase Auth phone mode with **test phone numbers** configured (fixed OTP, zero SMS — R4). No SMS provider needed.
- `pnpm --filter my-v0-project dev` for the web app (the package's historical name — renaming is out of this slice's scope). Web-only slice (D-030): cross-surface checks run web ↔ web with a second browser/device.
- Seed: `app_setting_definitions` + version-1 values (`queue_enabled = true`, `weekly_admission_cap = 8`, `referral_reward_cap = 5`, `admission_dormancy_weeks = 4`, reward sizes — typed/bounded/versioned per D-057), `wallet_units` (`day`, `mad`), one `partners` row with a short code.

## Scenario walkthroughs (map 1:1 to the spec's user stories)

### US1 — Claim (P1)
1. With test number A: send OTP, verify, `POST /api/account/claim`. Expect: account exists, `state = "queued"`, position + expected week visible, `claimed_at` and `acquisition_source = "direct"` recorded, **no password, no email asked** (SC-001).
2. Repeat claim with the same number → same account id, same position (idempotency, edge case 1).
3. Flip `queue_enabled = false`, claim with fresh number B → `state = "admitted"`, `admitted_at` set immediately, no waiting screen (FR-049/051, scenario 1bis).

> **SC-005 measurement note (founder, 2026-08-30)**: while admission notices are sent manually (FR-015, D-016), the 48-hour response of SC-005 is measured **operationally**, not by software — the system records due/sent, the staff guarantees the delay. The immediate queue-status view (position + expected week) is the software half of the promise.

### US2 — Waiting without rejection (P1)
1. Queue enabled, account A queued: `GET /api/account/me` shows position and expected week — never an error shape (FR-014, SC-005).
2. `canConfigureSubscription = false` while queued (FR-013).
3. Admit A via `POST /api/admin/admissions` → `admitted_at` recorded, notice row due; `GET /api/account/me` → `state = "admitted"`, `canConfigureSubscription = true`.
4. Change `weekly_admission_cap` via settings route → expected weeks shift on next read, no client release (US2 scenario 4).
5. Admit up to the cap, then attempt one more → refused: the cap bounds, never admits (FR-042).

### US3 — Return & cross-surface (P2, verified web ↔ web per D-030)
1. Close and reopen the web app with A's session → still signed in, **zero OTP sent** (SC-002).
2. Sign in from a second browser/device with the same number (one OTP) → same account id, same queue/wallet history (FR-003, SC-006).
3. `GET /api/sessions` from either device lists both sessions; `DELETE` the other device's session, then replay a request with its old token → rejected on next request (SC-009, R2).

### US4 — Referral (P2)
1. From an account with an active subscription (fixture), copy `referralCode`; claim number C with it → `referrals` row `pending`, referrer recorded permanently, **no reward yet** (FR-016/017).
2. `POST /api/admin/first-delivery` for C → reward `issued`, wallet entry unit `day` on the referrer sized by C's cycle, referrer's billing untouched (FR-018/019, SC-008).
3. Replay first-delivery for C → no second write (`first_delivery_at` write-once), no second reward (FR-021).
4. Set `referral_reward_cap = 1` and run a second referred first delivery → `never_eligible` (FR-020).
5. Self-referral and unknown codes at claim → attribution falls back to `direct`, claim never fails.

### US5 — Email at payment (P2)
1. Admitted account without email: `GET /api/account/me` shows `email: null`; browsing demands nothing (US5 scenario 2).
2. `POST /api/account/email` stores it; the account remains phone-anchored (FR-006/007).

### US6 — Wallet (P3)
1. After US4, `GET /api/wallet` on the referrer: balance in `day` equals the sum of entries; the entry carries reason, source, `acquired_at` (FR-024/025).
2. Attempt `UPDATE`/`DELETE` on `wallet_entries` directly in SQL (as service role) → trigger raises: append-only holds even for privileged code (R10, SC-007).
3. Insert a `wallet_units` row `point` → accepted with no migration, no release (FR-053).

### Queue-mode switch (FR-048–051)
1. With ≥2 accounts queued, `PUT /api/admin/settings/queue-mode {enabled:false}` → all queued become admitted in one transaction, each with `admitted_at` and a notice row (FR-050/051).
2. Re-enable → previously admitted stay admitted; a fresh claim queues (working rule).

### Cohort reconstruction (FR-032, SC-004)
Run the documented SQL (data-model § FR-032): for a chosen ISO week, list accounts whose `first_subscribed_at` falls in it and count those with an active subscription at +4/8/12 weeks. With fixture subscriptions, verify counts by hand. Proves computability from day one.

## Automated checks (Article XI)

- `pnpm test` — Vitest: `@fitnest/core` unit tests (queue position/expected week, balance derivation, consumption order, referral eligibility matrix) + API integration tests (claim idempotency, write-once triggers, cap bound, revocation).
- `pnpm -r exec tsc --noEmit` — strict TypeScript across the workspace.
- CI green required on the PR (Article XI).

## Expected outcomes summary

Every SC of the spec is exercised: SC-001 (US1), SC-002/003 (US3), SC-004 (cohort SQL), SC-005 (US2), SC-006 (US3), SC-007 (US6), SC-008 (US4), SC-009 (US3 step 3).
