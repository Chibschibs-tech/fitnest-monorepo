# Data Model — Identity, Account & Admission (001)

Phase 1 output. Every table below is a **proposed migration** under `supabase/migrations/` — drafted for founder review, applied by nobody before approval (Article II, founder arbitration 2026-08-29). The DDL sketches are normative for shape, not final SQL.

Conventions: new tables use UUID primary keys (`gen_random_uuid()`), `timestamptz`, snake_case. Legacy tables (`users`, `subscriptions`, …) keep their integer keys; this slice never writes to legacy identity tables.

## Entity overview

```text
auth.users (Supabase)  1──1  customer_accounts ──< phone_number_history
     │                              │ │ │
auth.sessions (device list)         │ │ └──< admission_notices
                                    │ └──< wallet_entries >── wallet_units
                                    └──< referrals (as referrer / as referred)
partners ──< customer_accounts (attribution)
app_settings (no FK — configuration)
subscriptions (legacy, extended) >── customer_accounts
```

## Tables

### `customer_accounts` — the person (FR-001–008, FR-028–031, FR-052)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `auth_user_id` | uuid UNIQUE NOT NULL → `auth.users(id)` | identity anchor bridge (R1) |
| `phone_e164` | text UNIQUE NOT NULL | current number; uniqueness = FR-003. History in `phone_number_history` |
| `email` | text NULL | nullable until payment (FR-006); **not unique** (spec assumption) |
| `referral_code` | text UNIQUE NOT NULL | own shareable code (R12) |
| `claimed_at` | timestamptz NOT NULL | write-once (FR-028, FR-031) |
| `admitted_at` | timestamptz NULL | write-once; set by staff act, or immediately at claim when queue disabled (FR-051) |
| `admission_reactivated_at` | timestamptz NULL | dormant-admission reactivation (FR-036); dormancy itself is **derived**: `admitted_at` + `admission_dormancy_weeks` elapsed AND `first_subscribed_at IS NULL` AND not reactivated since |
| `first_subscribed_at` | timestamptz NULL | write-once; **cohort key** (FR-032). Written by the future subscription-creation flow (write contract in contracts/api.md) |
| `first_delivery_at` | timestamptz NULL | write-once; referral-reward trigger (FR-017) |
| `acquisition_source` | text NOT NULL | `referral` / `partnership` / `direct` (FR-029); write-once |
| `referred_by_account_id` | uuid NULL → `customer_accounts(id)` | set iff source = referral, at claim only (FR-016, FR-016a) |
| `partner_id` | uuid NULL → `partners(id)` | set iff source = partnership (FR-043) |
| `created_at` | timestamptz NOT NULL | |

- **Account states (FR-052)** are all derived, never stored as a status column: *queued* = `admitted_at IS NULL` (queue active); *admitted* = `admitted_at IS NOT NULL`; *dormant* = derivation above; *active-subscriber* = ≥1 active row in `subscriptions` for this account (FR-037: model N, UI 1).
- **Queue position** is derived: rank by `claimed_at` among `admitted_at IS NULL` (R8). No position column exists.
- **Write-once enforcement**: `BEFORE UPDATE` trigger rejecting any change to `claimed_at`, `admitted_at` (once non-null), `first_subscribed_at`, `first_delivery_at`, `acquisition_source`, `referred_by_account_id`, `partner_id` (FR-031).
- RLS: owner may SELECT own row; no client writes (R6).

### `phone_number_history` — FR-044

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `account_id` | uuid NOT NULL → `customer_accounts(id)` | |
| `phone_e164` | text NOT NULL | |
| `effective_from` | timestamptz NOT NULL | first row written at claim |
| `effective_to` | timestamptz NULL | NULL = current |

Append-only in practice (no change flow this slice — the table exists so FR-021/D-014 per-number rules survive a future number change). Server-only access.

### `partners` — FR-043

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | e.g. Fitpass |
| `short_code` | text UNIQUE NOT NULL | hand-typable, QR-encodable (R12) |
| `active` | boolean NOT NULL DEFAULT true | deactivating stops new attributions, never erases past ones (FR-031) |
| `created_at` | timestamptz NOT NULL | |

Adding a partner is a row (Article XIV). Server-only access.

### `referrals` — FR-016–022

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `referrer_account_id` | uuid NOT NULL → `customer_accounts(id)` | |
| `referred_account_id` | uuid UNIQUE NOT NULL → `customer_accounts(id)` | one referrer per referred, forever |
| `referred_phone_e164` | text UNIQUE NOT NULL | denormalized on purpose: **FR-021's one-reward-per-number survives account deletion and number reuse** |
| `created_at` | timestamptz NOT NULL | = claim moment (FR-016) |
| `reward_state` | text NOT NULL DEFAULT 'pending' | `pending` → `issued` / `never_eligible` |
| `reward_wallet_entry_id` | uuid NULL → `wallet_entries(id)` | set when issued (SC-008 traceability) |
| `reward_evaluated_at` | timestamptz NULL | moment of FR-022 evaluation (first delivery completed) |

- Self-referral rejected at claim (edge case). Cap check (FR-020) counts `reward_state = 'issued'` per referrer against `app_settings.referral_reward_cap` **at issuance**.
- RLS: referrer may SELECT own rows (their referral activity); no client writes.

### `wallet_units` — FR-053 (R9)

| Column | Type | Rules |
|---|---|---|
| `unit` | text PK | seed: `day`, `mad` |
| `label` | text NOT NULL | display label (French) |
| `active` | boolean NOT NULL DEFAULT true | |

Adding a unit (tomorrow: `point`) = one INSERT. No enum anywhere in code: `@fitnest/core` treats units as opaque data.

### `wallet_entries` — FR-023–027, FR-045–047 (R10)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `account_id` | uuid NOT NULL → `customer_accounts(id)` | the wallet **is** the account (FR-023) |
| `unit` | text NOT NULL → `wallet_units(unit)` | typed entry (FR-045) |
| `amount` | numeric(10,2) NOT NULL | signed; positive = credit, negative = consumption/compensation |
| `reason` | text NOT NULL | human-readable (FR-024) |
| `source_type` | text NOT NULL | e.g. `referral_reward`, `service_credit`, `refund`, `manual_adjustment` |
| `source_id` | uuid NULL | id in the source domain; entry stays self-describing if the source disappears (edge case) |
| `acquired_at` | timestamptz NOT NULL | acquisition moment — future expiration depends on it (FR-053) |
| `created_at` | timestamptz NOT NULL | |

- **Append-only**: `BEFORE UPDATE OR DELETE` trigger raises unconditionally — even service role cannot mutate (R10, SC-007). Corrections are compensating entries.
- Balance = `SUM(amount) GROUP BY unit` — always derived, never stored (Article VII).
- Consumption order (FR-046: days before dirhams) and day valuation (FR-047) are `@fitnest/core` rules for the **future** redemption slice; this slice only guarantees the ledger shape they need.
- RLS: owner SELECT; no client writes.

### `admission_notices` — FR-015

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `account_id` | uuid NOT NULL → `customer_accounts(id)` | |
| `due_at` | timestamptz NOT NULL | created when admission is recorded |
| `sent_at` | timestamptz NULL | staff marks after manual send (D-016) |
| `channel` | text NULL | free text at launch (whatsapp/sms/call) |

Server-only access; surfaced in the interim admin UI.

### `staff_actions` — audit of interim staff acts (founder requirement, 2026-08-30)

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `action` | text NOT NULL | `admission`, `queue_mode_change`, `notice_sent`, `first_delivery`, `setting_change` |
| `account_id` | uuid NULL → `customer_accounts(id)` | the affected account, when applicable |
| `performed_by` | text NOT NULL | caller identity (legacy admin identifier now; staff account id from slice 2) |
| `performed_at` | timestamptz NOT NULL | |
| `details` | jsonb NULL | e.g. old/new setting value, notice channel |

Append-only (same trigger pattern as `wallet_entries`). **Mandatory for `first_delivery`**: it engraves `first_delivery_at` (Article IX, write-once) and triggers a referral reward — without caller traceability, a false cohort is undetectable. The other interim routes write here too; the table outlives the legacy auth it audits. Server-only access.

### `app_settings` — R5 (FR-010, FR-020, FR-036, FR-048)

| Column | Type |
|---|---|
| `key` | text PK |
| `value` | jsonb NOT NULL |
| `updated_at` | timestamptz NOT NULL |

Seed keys: `queue_enabled`, `weekly_admission_cap`, `referral_reward_cap` (5), `referral_reward_days_by_cycle`, `admission_dormancy_weeks` (4). Server-only access.

### `subscriptions` (legacy, **extended — proposed**) — FR-030, FR-032–035, FR-037

Existing production table (integer PK, frozen pricing already present: `price_per_day_mad`, `discount_percentage`, `total_mad`, `duration_weeks`). Proposed additions, all nullable so the migration is non-breaking:

| Column | Type | Rules |
|---|---|---|
| `customer_account_id` | uuid NULL → `customer_accounts(id)` | bridges the new identity model; written by the future subscription flow from its first day (Article IX / XIV) |
| `ended_at` | timestamptz NULL | FR-030 "the date it ended, if it ended" — write-once when set |
| `price_guaranteed_until` | date NULL | FR-033–034: set at creation, never recalculated |

FR-035 (guarantee-expiry surveillance) is a query over `price_guaranteed_until`, no extra structure.

## Affiliation — decided, deliberately absent (D-025, R13)

Fitnest Pro and member-condition partnerships are **account-carried affiliations granting automatic discounts** — no parallel price grid, `meal_type_prices` stays the single source (Article IV). Nothing is built in this slice and no column is added: adding affiliation later is a reference table plus one account reference — a row, not a refactor (Article XIV). Distinct from `partners` above: attribution is a write-once claim-time fact; an affiliation is an ongoing condition. The pricing-engine identity input and the discount-inclusive freeze it requires are recorded in [contracts/api.md](./contracts/api.md) § internal write contracts.

## Sessions & devices — no domain table

`auth.sessions` (Supabase) is the device list (R3). No `devices` table is created; the plan deliberately avoids a second source of truth. Device labels derive from `user_agent` at display time.

## State transitions

```text
Person:  (none) ──claim──> queued ──staff admission / queue-off──> admitted
         admitted ──4 weeks without first subscription──> dormant (derived, silent)
         dormant ──reactivation──> admitted (admission_reactivated_at set)
         admitted ──first subscription (future slice)──> cohort member (first_subscribed_at)

Referral: pending ──referred person's first delivery + FR-020/021/022 checks pass──> issued
          pending ──checks fail at evaluation──> never_eligible   (both terminal)

Queue mode: enabled ⇄ disabled (app_settings). On disable: one transaction admits every
            queued account (admitted_at = now(), notice row created) — FR-050/051.
            On re-enable: admitted stay admitted (working rule, flagged for re-arbitration).
```

## Validation rules (enforced server-side, tested per Article XI)

- Claim is **idempotent per phone**: existing `phone_e164` → return existing account, no new attribution (FR-016a, edge case 1).
- Attribution XOR: `referred_by_account_id` and `partner_id` never both set; consistent with `acquisition_source`. CHECK constraint.
- Self-referral: `referred_by_account_id <> id`. CHECK constraint.
- Email format validated at capture (FR-006 boundary); never unique.
- Admission cap: at admission time, `COUNT(admitted this ISO week) < weekly_admission_cap` — bounds, never admits (FR-042).
- Reward issuance transaction: FR-021 (unique `referred_phone_e164` with an issued reward), FR-020 (cap), FR-022 (referrer has an active subscription **now**) all evaluated at issuance; wallet entry (unit `day`, amount from `referral_reward_days_by_cycle`) and `reward_state='issued'` written atomically.
