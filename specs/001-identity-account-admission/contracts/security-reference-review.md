# ADR: OTP abuse, risk and recovery design (S001-SEC-A)

Status: Proposal (unratified). Task key: S001-SEC-A. Source baseline: `2854038dfe653289c326dd33650a311918f630ad`.

## Context

001 (`specs/001-identity-account-admission/spec.md`) gives customers a phone-OTP identity with a stable internal account, bounded sessions and independent verified-email recovery proof. The product baseline (`docs/delivery/product-baseline.md`) and the clarification register (`docs/delivery/clarifications.md`) leave five decisions open under G-SESSION, G-RECOVERY and G-PROVIDERS, while D-052/D-053/D-057/D-058/D-059 and FR-001 through FR-053 settle the invariants those decisions must respect. Research (`specs/001-identity-account-admission/research.md`) records R1–R13, including the corrections that remove `signOut(session_id)` (R3) and reject `getUser()`-alone liveness (R2).

This ADR records the abuse, risk and recovery design as an isolated reference model, separates what is settled from what remains unratified, and asserts no production writes. It grants no authority: production writes, gates, budget and task acceptance are all unapproved.

## Decision

Adopt the following fixed invariants as the design contract. They are recorded verbatim in `docs/delivery/contracts/S001-SEC-A.json` and encoded as a frozen reference model in `tests/security/identity-reference.mjs`.

### OTP abuse controls

- Quota is checked **before** send (`otp.quotaBeforeSend=true`) under shared atomic accounting (`otp.sharedAtomicAccountingRequired=true`), so concurrent requests on one reservation cannot overspend.
- Sends are idempotent by purpose key (`otp.idempotencyRequired=true`); a replayed key reuses the reservation rather than consuming quota again.
- An **ambiguous** provider outcome consumes the reservation (`otp.ambiguousSendConsumesReservation=true`) and is never blindly retried (`otp.blindRetryAllowed=false`), avoiding duplicate OTPs and duplicate spend.
- Verification attempts are bounded (`otp.verificationAttemptsBounded=true`).
- Account enumeration is forbidden (`otp.accountEnumerationAllowed=false`): lookup responses are generic.
- The live OTP provider is not yet qualified (`otp.providerQualified=false`).

### Risk gating

- The customer has a stable internal identity (`risk.stableInternalIdentity=true`); phone control alone never unlocks historical data after a risk signal (`risk.phoneOtpAloneUnlocksHistory=false`) (FR-001, D-053).
- Independent, previously verified email proof is required for historical access after risk (`risk.independentPreviouslyVerifiedProofRequired=true`), and that proof is account- and action-bound (`risk.proofAccountAndActionBound=true`) and single-use (`risk.proofSingleUse=true`) (FR-038).
- Single-device and bulk revoke require the same proof (`risk.singleAndBulkRevokeSameProof=true`) (FR-040).
- Unavailable session validation denies (`risk.unavailableValidationDenies=true`) (R2).

### Recovery

- Delivery facts are never sufficient proof (`recovery.deliveryFactsSufficient=false`); a newly added email is never sufficient (`recovery.newlyAddedEmailSufficient=false`) (D-053, spec "Recovery and ownership").
- A factor is never replaced using only that same factor (`recovery.replaceFactorUsingSameFactor=false`).
- Both factors lost resolves to **audited assistance without automatic unlock** (`recovery.bothFactorsLost`); missing independent evidence resolves to **deny history and identity transfer** (`recovery.missingIndependentEvidence`).
- Support approval alone is never sufficient (`recovery.supportApprovalAloneSufficient=false`).

## Rationale

- `quotaBeforeSend` + shared atomic reservation directly implements the cross-instance spend protection R4 flags as still unqualified, while `idempotencyRequired` prevents duplicate charges on retries (FR-011's capacity-response flow never sends duplicate notices, FR-024's ledger is append-only).
- `ambiguousSendConsumesReservation` with `blindRetryAllowed=false` is the only safe stance when the provider cannot report delivery: retrying on unknown outcome risks duplicate OTPs, which is exactly the abuse the task targets.
- `phoneOtpAloneUnlocksHistory=false` follows FR-001/FR-038 and D-053: current number control proves current reachability, not ownership of historical admission/wallet/referral data. The independent verified-email proof is account/action bound and single-use so it cannot be replayed to lift the gate twice.
- `unavailableValidationDenies` follows R2: a positive cache must never extend access beyond the promised revocation boundary; if the session status cannot be validated, the request fails closed.
- Recovery refuses delivery-knowledge and newly-added-email shortcuts because D-053 states "delivery facts alone prove nothing", and the spec's recovery section forbids address/plan/last-delivery as evidence. This keeps account takeover from a delivery-detail leak.

## Consequences

- No production writes are authorized or attested by this proposal. `verification.noProductionWritesAttested` remains false because this document cannot attest execution history.
- The design is a reference model only (`verification.referenceModelOnly=true`); distributed atomicity and live provider behavior are unproven, and independent qualified review is still required (`verification.independentReviewRequired=true`).
- `providerQualified=false` refers to the live OTP provider, not to any LLM provider; separate operator LLM funding does not change the authority flags.

## Unresolved choices (recorded, not decided)

1. **session_durations** (G-SESSION): access/idle/absolute limits and refresh-rotation behavior are proposed but unratified.
2. **device_concurrency** (G-SESSION): reconciling 001's multiple revocable devices against 004's single active session.
3. **risk_signals** (G-SESSION): the precise taxonomy and thresholds of risk signals.
4. **assisted_recovery_evidence** (G-RECOVERY): the evidence checklist and audit fields for assisted recovery.
5. **live_provider_and_budget** (G-PROVIDERS): supplier selection, secret-manager credentials, templates/consent, failure runbooks and spend ceiling.

Each is recorded with its gate and a source-grounded proposal in `docs/delivery/contracts/S001-SEC-A.json`, status `unratified`.

## Reference model

`tests/security/identity-reference.mjs` exports a frozen `CRITERION`, the risk-signal table, proposed session limits and pure functions mirroring the invariants above. `tests/security/identity-reference.test.mjs` exercises those functions with `node:test` and also loads `docs/delivery/contracts/S001-SEC-A.json`, asserting the contract has exactly the required object shape (no extra keys), that its fixed values match the frozen reference model, and that every unresolved `proposal`/`remainingEvidence` is source-grounded prose within 20–4000 characters. Run with `node tests/security/identity-reference.test.mjs`. These fixtures are isolated; they do not touch production, the local Supabase stack, or any live provider.
