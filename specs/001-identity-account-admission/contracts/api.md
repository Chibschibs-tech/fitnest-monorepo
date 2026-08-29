# API Contracts — Identity, Account & Admission (001)

Phase 1 output. Both surfaces (web, mobile) consume exactly these contracts — no rule is reimplemented client-side (Article XIV). All routes live in `apps/web/app/api/`. Errors follow one shape: `{ error: { code, message } }` with French user-facing messages; a queued person never receives a rejection-shaped response (FR-014).

## Authentication layers

- **Client ↔ Supabase Auth (SDK, no custom route)**: `signInWithOtp({ phone })` sends the code; `verifyOtp({ phone, token })` verifies and opens the session. Rate limiting and cooldowns are Supabase-side (edge case: retry with fresh code, never a permanent lock).
- **Client ↔ domain routes**: bearer access token; server validates via `auth.getUser()` on every request (R2 — this is what makes revocation immediate, SC-009).
- **Interim staff routes** (`/api/admin/…`): legacy admin session (see plan.md Complexity Tracking). **Written expiry: switches to the staff model in slice 2** — the legacy mechanism (SHA-256, committed static salt) is declared obsolete and must not survive this slice. Every interim staff route writes a `staff_actions` audit row (who, when, what — see data-model.md); this is **mandatory** for first-delivery.

## Customer routes

### `POST /api/account/claim`
Called once after the **first** successful `verifyOtp` on a number. Idempotent per phone.

Request: `{ attribution?: { code: string } }` — a referral code or partner short code, resolved server-side; invalid/own code → attribution silently dropped to `direct` (claiming never fails on a bad code).

Behaviour: creates `customer_accounts` row (claimed_at, acquisition_source, referred_by/partner per R12) + first `phone_number_history` row + `referrals` row when referred. **Queue disabled** (FR-049/051): sets `admitted_at = now()` immediately. Existing account for this phone → returns it unchanged (no re-attribution, FR-016a).

Response `200`: the same shape as `GET /api/account/me`.

### `GET /api/account/me`
Response: account state, everything derived server-side —

```jsonc
{
  "account": { "id", "phone", "email", "referralCode", "claimedAt", "admittedAt" },
  "state": "queued" | "admitted" | "dormant",        // FR-052 derivations
  "queue": { "position": 12, "expectedWeek": "2026-W37" } | null,  // null unless queued & queue enabled
  "queueEnabled": true,
  "canConfigureSubscription": false,                  // FR-013: admitted && !dormant
  "referralAvailable": false                          // FR-022: has active subscription
}
```
Queued users get position + expected week, never an error or empty state (FR-009, FR-014, SC-005).

### `POST /api/account/email`
Request: `{ email }`. Stores against the account (FR-006/007). Never required outside the payment path (US5 scenario 2).

### `POST /api/account/reactivate`
Reactivates a dormant admission (FR-036): sets `admission_reactivated_at`. No queue re-entry, no blame copy.

### `GET /api/sessions` / `DELETE /api/sessions/:id`
Device list from `auth.sessions` (R3): `[{ id, deviceLabel, ip, lastSeenAt, current }]`. DELETE revokes one session server-side, immediate effect (FR-039/040, SC-009). `DELETE /api/sessions?scope=others` revokes all but the current one (lost-phone recovery, FR-041).

### `GET /api/wallet`
Response: `{ balances: [{ unit, label, amount }], entries: [{ id, unit, amount, reason, sourceType, acquiredAt }] }` — balance always computed from entries (SC-007). Read-only for clients; no consumption endpoint exists in this slice (redemption = pricing slice).

## Interim staff routes (legacy-admin protected)

### `GET /api/admin/queue`
Queued accounts in claim order, with this ISO week's admission count vs `weekly_admission_cap`.

### `POST /api/admin/admissions`
Request: `{ accountId }`. Manual admission (FR-042): rejects if the weekly cap is reached (the cap bounds, never admits). Sets `admitted_at`, creates the `admission_notices` row (due). Records the **person's effective admission**, never a slot (Article IX).

### `POST /api/admin/notices/:id/sent`
Marks a notice sent (`sent_at`, `channel`) after the manual send (FR-015, D-016).

### `PUT /api/admin/settings/queue-mode`
Request: `{ enabled: boolean }`. Disable → single transaction admits every queued account with `admitted_at = now()` + notice rows (FR-050/051). Enable → new claims queue again; the admitted stay admitted (working rule).

### `PUT /api/admin/settings/:key`
Updates one `app_settings` row (weekly cap, reward cap, reward sizes, dormancy weeks). Effective on next read — no release (FR-010, US2 scenario 4).

### `POST /api/admin/first-delivery`
Request: `{ accountId }`. Manual declaration that the account's first delivery completed (interim trigger, plan.md Complexity Tracking). **Caller traceability is mandatory (founder requirement, 2026-08-30): the endpoint records WHO called it and WHEN** in `staff_actions`, in the same transaction — it engraves `first_delivery_at`, an Article IX write-once datum, and triggers a referral reward; without caller traceability a false cohort is undetectable. Atomically: writes `first_delivery_at` (write-once, FR-028), writes the audit row, and runs reward issuance — FR-020 cap, FR-021 unique number, FR-022 referrer-active evaluated **now**; on pass, wallet entry (unit `day`, size from `referral_reward_days_by_cycle` keyed on the referred person's cycle, FR-019) + `reward_state = 'issued'`; on fail, `never_eligible`. Billing dates untouched (FR-018, SC-008).

## Internal write contracts (for later slices — specified now, Article IX/XIV)

- **Pricing engine & preview endpoint** (pricing slice) MUST take the requester's **account identity as an input from its first version** — endpoint, debounced preview, cache keyed by configuration — even while it influences nothing today. Affiliation discounts (D-025, R13) plug into that input as data; adding one must never traverse the chain.
- **Subscription creation** (pricing/checkout slice) MUST, in its creation transaction: require `email` present on the account (FR-006); write `subscriptions.customer_account_id`; set `price_guaranteed_until` (FR-033–034, never recalculated); freeze the **applied discount alongside the price and VAT rate** (D-025b — leaving an affiliation never changes a price mid-cycle); write `customer_accounts.first_subscribed_at` if still NULL (cohort key, FR-032).
- **Discount stacking** (recorded, not implemented — D-025c): the affiliation discount applies to the plan price; cycle and coupon keep their existing chain; no stacking between affiliation and coupon.
- **Subscription termination** MUST write `subscriptions.ended_at` once (FR-030).
- **Wallet redemption** (pricing slice) MUST consume days before dirhams (FR-046), value a day at the beneficiary's active-subscription TTC daily price at that moment (FR-047), and refuse day consumption with no active subscription — a day never converts to money.
