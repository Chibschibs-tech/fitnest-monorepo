# API contracts — 001

Shared versioned contracts for web/app/staff; implementation pending. Domain mutations are server-side, with validated input and `{error:{code,message,requestId}}` localized FR/EN. Success is never fabricated on downstream failure.

## Authentication and authorization

Public client may use Supabase Auth OTP/refresh with public key. Provider secrets and SMS hook live server-side. Application quota/spend controls supplement provider limits. A verified token is only the first check: validate live session/time bounds, independent-proof clearance when required, owner and resource permissions. Proposed domain access is via server APIs; deny direct database access unless equivalently protected and tested. Staff uses 003 identity + TOTP + permission/resource checks, never a forged-cookie or legacy guard.

## Customer endpoints

| Route | Contract | Acceptance |
|---|---|---|
| POST /api/account/claim | Optional public attribution code; principal/phone come from verified auth, not body. Atomic new account + phone history + attribution; existing cleared owner is idempotent. Risky ownership enters proof-required without exposing old account. Queue-off admits immediately | SEC-01/02/04; T015 |
| GET /api/account/me | Own minimized account and derived queue/subscriber states. Queue has position, expectedWeek (nullable), estimateConditional, paused and capacity version; no fake date at cap zero | SEC-04/29; T014/019 |
| POST /api/account/email | Capture candidate email on own account. Verification is account/purpose-bound, expiring and single-use; existing proof remains until replacement is safely verified. Unverified email is not unique or identifying | SEC-04; T039; LOT-12 email contract |
| POST /api/account/reactivate | Dormant admission reactivates with server time, no requeue or blame | T026 |
| GET /api/sessions | Owner-scoped minimized device labels, times and current marker; no raw tokens and no unnecessary IP disclosure | SEC-03/04 |
| DELETE /api/sessions/:id | Verify owned target and same independent-proof rule as bulk disconnect; supported revocation strategy from S001-SEC-C | SEC-03/04; T029/031 |
| DELETE /api/sessions?scope=others | Same proof and owner check, retain current authorized session; no one-by-one bypass | SEC-03/04 |
| GET /api/wallet | Own balances grouped by unit and paginated entries with reason/source/acquisition time; exact decimal serialization and cursor contract | SEC-26/29; T042/044 |

Risk/proof-required responses expose no profile, wallet or order. Verification email is required at payment summary by D-053; if supplier is unavailable, the operation remains pending with a safe recovery path.

## Staff endpoints (003 prerequisite)

| Route | Required permission intent and behavior |
|---|---|
| GET /api/admin/queue | admissions.read; paginated queue, actual Casablanca ISO-week count and cap |
| POST /api/admin/admissions | admissions.manage; accountId and request idempotency key; serialize cap check with admission and notice/audit writes |
| POST /api/admin/notices/:id/sent | admissions.notice; record manual channel/sent timestamp idempotently, never pretend message sent |
| PUT /api/admin/settings/queue-mode | settings.manage plus required reauth; disable admits all queued and records due notices, atomically/versioned; retries create no duplicates |
| PUT /api/admin/settings/:key | settings.manage; expected current version, validated next value, conflict on concurrent stale update; immutable audit and no invariant override |

Each permission intent must be entered in the 003 matrix with resource scope; unknown permission denies. Cross-origin mutations fail. No general account-only `/api/admin/first-delivery` is exposed.

## First-delivery integration

T037 implements an internal domain handler for an authoritative completed delivery event. Contract includes eventId, deliveryId, subscriptionId, accountId resolved from that delivery, actor/authorized transition and server occurrence time. LOT-11 owns delivery assignment/state. Reject mismatched ownership, unauthorized transition or stale/replayed events. In one transaction/outbox boundary record first_delivery_at once, referral evaluation and source-unique wallet entry; serialize the referrer's cap. Correction is a separate audited event with approved compensation, never deletion or a second reward. Local fixtures may invoke the handler; production cannot invent a delivery to make a test pass.

## Cross-lot write obligations

- Pricing preview receives authenticated identity and configuration/version context from day one; freeze applied discounts and VAT, preserving REPO-D-025. Affiliation implementation remains outside V1; no affiliation/coupon stacking.
- Initial paid activation reconciles authenticated provider event, amount, currency and quote; verifies email; sets subscription customer_account_id, cycle/price/discount/tax/rule snapshots and price_guaranteed_until; sets first_subscribed_at only once. Never activate from browser redirect.
- Termination records ended_at once and subscription-state history sufficient for historical cohorts; current status alone is insufficient.
- Wallet redemption serializes balance, spends days before MAD, freezes active-beneficiary-rate valuation and source/idempotency key. No active subscription means no day redemption or conversion to cash.
- Payment/notification/delivery retry use stable business idempotency keys. Outbox consumers deduplicate; failures remain visible to the exception queue.

Contract acceptance means fixtures/schema reviewed; it does not waive T013, provider qualification or integrated end-to-end acceptance.
