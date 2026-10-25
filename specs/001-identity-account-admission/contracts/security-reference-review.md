# Security Reference Review — S001-SEC-A

Status: Proposal (unratified). Task key: S001-SEC-A. Source baseline: `2854038dfe653289c326dd33650a311918f630ad`. Authority: no production writes authorized, no gates approved, no budget approved, no task accepted.

## Relationship to the ADR

This review accompanies `docs/delivery/adr-sec-a.md` and is kept consistent with it. The ADR is the design authority for S001-SEC-A; this file records the security review of its fixed invariants, the trust boundary and the verification limits. Any apparent divergence resolves in favor of the ADR and the machine contract at `docs/delivery/contracts/S001-SEC-A.json`, which both this review and the ADR encode verbatim.

## Invariants under review

- OTP (SEC-01/SEC-02): purpose-bound expiring single-use challenges; shared multi-instance quota by number/IP/context checked before send; idempotency; ambiguous-send reconciliation that consumes the reservation and forbids blind retry; bounded verification attempts; non-enumerating responses; no victim lockout. `providerQualified=false`.
- Risk (SEC-04/D-053/FR-001/038): stable internal identity; phone OTP alone never unlocks history; independent previously verified email proof, account/action bound and single-use; single and bulk revoke share the same proof; unavailable validation denies.
- Recovery (SEC-04/D-053/FR-041/044): delivery facts and newly added email prove nothing; a factor is never replaced using only that factor; both factors lost resolve to audited assistance without automatic unlock; missing independent evidence denies history and identity transfer; support approval alone is never sufficient. Completed assisted recovery and number replacement both carry a mandatory SEC-04 security notification.

## Trust boundary

Model helper inputs are authoritative synthetic server records, never browser assertions. A browser-supplied value has no authority; any value that is not a strict, well-formed server fact fails closed. The runtime application must load actual principal/account/action/session/risk/factor/event/channel records, check resource ownership, atomically consume the one-use proof, and maintain an audited transactional outbox with authenticated, deduplicated callbacks, bounded retries and failure alerts.

## Review scope and limits

The reference model is a decision fixture, not a shared ledger, not a provider integration and not a proof of distributed atomicity. `verification.distributedAtomicityProven=false`, `providerBehaviorProven=false` and `noProductionWritesAttested=false`; independent qualified review remains required and full acceptance is not claimed. The reference tests run only in an isolated author container and touch no production, database or live provider. `providerQualified=false` refers to the live OTP provider, not to any LLM provider; separate operator LLM funding does not change the authority flags.

## Open gates

Five choices remain unratified, recorded with their gates and owners in the ADR and contract: session_durations, device_concurrency and risk_signals (G-SESSION, owner Security + product); assisted_recovery_evidence (G-RECOVERY, owner Security + support); live_provider_and_budget (G-PROVIDERS, owner Operations + engineering, with OTP financial approval under G-BUDGET owned by Founder + orchestrator). No session time, device count, risk threshold, recovery-document policy or supplier is silently approved.
