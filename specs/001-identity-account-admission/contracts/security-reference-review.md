# SEC-A / SEC-C — isolated reference proposal

Status: design proposal; no task acceptance, provider qualification, production migration or gate approval.
Source: Fitnest `2854038dfe653289c326dd33650a311918f630ad`, 001 spec/research, D-052/053/057/059/063 and SEC-01/02/03/04/29.

## Contract

Every domain authorization checks verified token, stable internal account, matching live session, ownership, access expiry, idle limit, absolute limit and risk clearance. Missing validation denies. Session revocation affects the next authorization even while an old JWT remains cryptographically valid. API and any exposed direct interfaces must apply equivalent conditions. No positive cache may extend revocation latency.

Risky access requires independent proof from an email verified before the risk event, bound to the same account and limited in time/use. OTP, address, delivery facts and an unverified email are insufficient. Both single-device and bulk disconnect use this same authorization. Loss of proof routes to assisted recovery without releasing historical data.

Refresh rotation rejects reused tokens and revokes the affected session. Production must prove atomic replay detection. OTP sending reserves quota before contacting a provider; a timeout remains consumed until reconciliation, preventing blind repeats.

## Executable reference evidence

Run `node --test tests/security/identity-reference.test.mjs`.
Synthetic timing/quota values are test vectors only. The reference demonstrates logical boundaries and single-process serialization. It does NOT prove distributed atomicity, Supabase session API behavior, JWT cryptography, actual email proof consumption, database RLS, direct API denial or supplier billing.

The `verified`, `authorized` and proof attributes are trusted fixture inputs, not assertions that a caller may supply in a production API. A production adapter must derive them from independently verified server state. OTP request identifiers are remembered only for the lifetime of this reference process; persistence, retention and restart behavior require separate implementation. No assisted-recovery workflow is implemented here.

## Explicit unresolved decisions

| Decision | Required resolution | Gate |
|---|---|---|
| Access/idle/absolute lifetime | Proposed durations, permitted bounds, rationale and configuration version | G-SESSION |
| Device concurrency | One active session versus multiple owned revocable devices | G-SESSION |
| Risk policy | Signals, inactivity threshold, state transition and false-positive recovery | G-SESSION / G-RECOVERY |
| Both factors lost | Allowed evidence, support roles, audit, notifications and refusal/escalation procedure | G-RECOVERY |
| OTP live operation | Supplier, timeouts, shared quotas, retry/reconciliation and spend ceiling | G-PROVIDERS / G-BUDGET |

## Engineering proof still required

Select the supported targeted-revocation adapter or app-owned revocation ledger; never assume `getUser()` or auth session row existence proves every lifetime bound. Never call `admin.signOut(session_id)` as though it accepted a UUID, delete provider-managed rows, or retain another device JWT for revocation. Test the selected mechanism against isolated Supabase, including old JWT requests, refresh, role privileges, API/direct paths and unavailability. Bind the evidence to the exact implementation revision before completing SEC-C/T010.

The no-production-write requirement is preserved. Existing business decisions are not reopened; unresolved parameters are not silently defaulted.

