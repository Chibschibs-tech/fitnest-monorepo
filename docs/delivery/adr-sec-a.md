# ADR SEC-A — OTP abuse, risky access and assisted recovery

Date: 2026-10-24. Status: proposed design for independent review, not an operational approval.
Task: S001-SEC-A. Planning baseline: `2854038dfe653289c326dd33650a311918f630ad`.

## Scope and sources

The task criterion is: “OTP abuse/risk/recovery design; record unresolved choices and no production writes.” Its outputs are an ADR and isolated acceptance fixtures. This document supplies the ADR missing from the original reference proposal. It does not implement customer authentication or qualify a messaging supplier.

Normative inputs are `docs/delivery/backlog.json` (S001-SEC-A and its verified dependency into S001-T010), `specs/001-identity-account-admission/spec.md` (FR-001–007, FR-038–041, FR-044 and Recovery and ownership), `research.md` (R1–R4), and `docs/delivery/security-requirements.md` (SEC-01, SEC-02, SEC-04 and transversal authorization/audit requirements). Product decisions use the D namespace in `product-baseline.md`, especially D-052/053/057/059; historical REPO-D entries are not substitutes. The machine-readable companion is `contracts/S001-SEC-A.json`.

## Decision and trust boundary

An account has a stable internal identity. Possession of its current telephone number proves present number control, not ownership of its historical admission, wallet, subscription or personal information. Creating a new identity and obtaining historical access are different authorization decisions. An unverified or newly added email, delivery address, last delivery, plan knowledge or support assertion is not independent prior proof.

The reference module in `tests/security/identity-reference.mjs` accepts synthetic server facts. It is not an authorization boundary: never pass request/browser assertions as proof records. The application must load the account, session, risk event, prior factor verification and one-use action challenge from authoritative storage after authenticating the principal. Resource ownership and permission are checked separately on every domain request and every permitted direct path. No provider SDK behavior is asserted by this ADR.

## OTP request and verification protocol

1. Normalize the phone and validate the request purpose. Return a non-enumerating response regardless of whether an account exists; also test timing/status/body differences during implementation.
2. In a shared transaction, acquire the applicable number, IP/context and project spending reservations and enforce a cooldown. Bind the idempotency key to the normalized destination, purpose, principal/context and request fingerprint. The same key with different arguments is a conflict. Concurrent instances must not each spend the final quota unit.
3. Commit one reservation and one outbox dispatch intent before contacting a supplier. A duplicate request returns the prior operation state; `replay: true` in the model does not authorize another supplier send. Neither process-local memory nor a caller-provided `ledger.has()` result proves shared atomicity.
4. Record the supplier request identity and reconcile callbacks. A confirmed send or unknown outcome retains the reservation. Missing, malformed or contradictory outcome facts are ambiguous. Never release quota or blindly resend after timeout. Retry eligibility for an explicitly confirmed `not_sent` result is only one condition: a fresh quota/cooldown/attempt check and the same business idempotency identity are still required.
5. Bind a challenge to purpose, account/context and expiry. Verification atomically checks and consumes it once, with a shared bounded attempt counter. Expired, replayed and cross-purpose codes deny. Supplier errors authenticate nobody. Avoid unlimited victim lockout; the exact cooldown/window policy remains a reviewed operational choice.
6. Keep OTPs, raw tokens and telephone/email values out of technical logs. Audit outcomes using restricted, minimized identifiers and retention. Settings are typed and versioned; no configuration disables ownership, proof or spending invariants.

The pure fixtures test decision predicates only. Real multi-instance quotas, transaction isolation, challenge consumption races, outbox deduplication, billing reconciliation and deliverability require implementation/integration evidence and are not claimed here.

## Risk and historical access

Normal, already authorized same-device use should refresh silently within finite approved bounds and avoid unnecessary SMS. A new device, changed/recycled number, missing/expired session, long inactivity, repeated verification failure or session anomaly triggers the independent-proof path. Unknown risk classifications and missing/unavailable/pending validation deny historical access.

For a known risk, require a previously verified independent factor belonging to the actual account and actual action. The reference positive example is verified email with verification before the risk event, a finite unexpired proof lifetime, explicit server validation and unused status. Wrong account/action, fresh email, phone OTP alone, missing provenance, a used proof and nonfinite timestamps deny. These fields are evidence from trusted server records, never authorization by caller booleans.

The implementation must atomically consume the action proof in the same authorization transaction as the protected operation so two concurrent requests cannot reuse it. Verify new phone control separately before replacing a number. For email replacement, require reauthentication and confirm the new email. Do not replace a factor using only that same factor. Targeted and bulk revocation have the same independent-proof requirement; repeated single-device revocations cannot bypass it.

S001-SEC-C owns the supported session/revocation mechanism. S001-T010 must implement token validation AND a live bounded session AND risk clearance AND resource ownership, with old-token/direct-path tests. A valid JWT, a user lookup, or a database row by itself is not proof of the complete guarantee.

## Assisted recovery

If independent prior proof is absent, deny history and identity transfer. Losing both factors leads only to an audited assistance case, never automatic account unlock. Support records evidence and escalation; support approval alone does not confer account ownership. A boolean `independentEvidence.sufficient` in a synthetic fixture stands for the future independently checked case record, not a field a client or one support agent may set to bypass recovery. The exact evidence checklist, second-review rule, retention and approval authority remain G-RECOVERY decisions.

## Open decisions and blocking owners

| Choice | Gate / owner | Evidence required before operational use |
|---|---|---|
| Access, idle and absolute lifetime; refresh/reuse behavior | G-SESSION / Security + Product | Approved configuration ADR and tests against actual session behavior |
| Multiple revocable devices versus native single-session UX; eviction | G-SESSION / Security + Product | One explicit cross-surface policy and supported targeted/bulk revocation proof |
| Risk taxonomy, thresholds and sticky/cleared state | G-SESSION / Security + Product | Reviewed thresholds and boundary/unknown/unavailable tests |
| Assisted recovery evidence, approvals and retention | G-RECOVERY / Security + Support | Reviewed checklist, audit design and failure scenarios |
| Supplier, templates/consent, secrets, runbooks and spend ceiling | G-PROVIDERS and G-BUDGET / Operations + founder where required | Non-production supplier qualification and reconciled cost evidence |

The reference's 600-second access, 30-day idle, 90-day absolute lifetime and five verification attempts are illustrative fixture values, not ratified deployed settings. The unresolved contract entries stay `unratified`. No gate is approved by this document.

## Evidence and closure

| Criterion component | Evidence | Scope |
|---|---|---|
| OTP abuse and ambiguous supplier outcome design | Protocol above; quota/idempotency/attempt/non-enumeration/send-result fixtures | Design and pure predicates; no shared transaction proof |
| Risk and recovery design | Trust boundary, prior proof and assistance sections; positive/negative proof fixtures | Design and pure predicates; no live identity integration |
| Unresolved choices | Five entries in the JSON contract and gate/owner table above | Recorded, not silently approved |
| No production writes | PR file scope restricted to this ADR, contract and pure test fixtures; test child has no credentials or filesystem-write permission | Attestation must bind the actual reviewed commit and execution, not a JSON self-assertion |

Original implementation provenance is attempt 114 (`3afa4d349341efb978221f87ac3fce12e29c0e64`). Regression alignment, fail-closed helper corrections and this ADR are operator-authored; the attempt-112 Kimi review is not evidence for these changes. The 35-test earlier result is superseded for the changed tree; rerun all 26 reference tests and the unchanged 11 protected tests, and obtain independent exact-commit review.

Closure requires source-to-design review, isolated tests, exact-commit independent review, applicable repository CI, G-CONSTITUTION evidence, integration into the approved non-production branch and a recorded acceptance bound to those proofs. The source edge requires `verified`, so a weaker `contract_accepted` receipt does not unlock S001-T010. An acceptance policy may cover the complete **design task** only after those proofs exist; changing a protected check from partial to behavioral without adding evidence is not validation. Runtime identity acceptance and operational gates remain obligations of their owning tasks.
