# B11-C operations contract v1 - proposal

Source semantic plan: 2854038dfe653289c326dd33650a311918f630ad. Base: 46599153870b62421ff20568b0dd8679222a297b.
Design only. No runtime acceptance, production readiness, profile activation or deployment. Accepted SEC-A/B/C and B01-C are unchanged.

## Delivery boundary
All five adapters (listByRound, confirm, fail, correct, reconcile) use version 1 and the B01-C error envelope. Runtime routes must validate schemas and unknown fields before execution. The reference's trusted context is derived from server identity/provider, current assignment and accepted policy; none of its booleans is an HTTP claim.

Known permissions are proposed interface keys, not automatic grants: delivery.round.read, delivery.confirm, delivery.fail, delivery.correct, logistics.post_cutoff and preparation.acknowledge. The latter must NOT be inferred from the read-only Preparation role. A future explicit ownership decision must authorize acknowledgement. Administrator names confer nothing.

G-ROUND remains unresolved: who assigns/reassigns rounds, useful visibility window, necessary contact/bag/notes fields and correction ownership. The reference takes accepted synthetic assignment facts and otherwise denies. The delivery projection deliberately contains no phone/health/payment data. Real driver contact projection is pending G-ROUND; this packet is not delivery-ready UI.

## State and concurrency
The narrow reference model uses planned -> prepared -> delivered or failed. Planned/prepared progression belongs to later implementation; its examples begin prepared. Terminal corrections can propose delivered/failed only after an explicitly accepted correction policy. G-MUTATIONS remains unresolved. This state subset is not an authorization to implement a broader lifecycle or a compensation rule.

Each mutation binds the expected delivery revision. The server transaction locks the scoped resource, checks current identity/scope/safety/policy and idempotency binding, appends event and durable outbox, updates effective projection, then commits. Event identity is stable and globally unique in production. Reference event IDs are deterministic per synthetic project state only.

Idempotency binding: project, actor, operation, key. Payload binds command version, delivery, expected revision, reason and correction target. An exact retry retains its original expected revision; a request changing that revision under the same key conflicts. Pending records return WAIT, unknown outcomes RECONCILE, and malformed/incomplete records fail closed; only a completed record bound to a stored event may replay. An exact retry rechecks live authorization and returns the existing event; different payload conflicts. Same action under a new key cannot reconfirm an already terminal delivery. Unknown outcomes require reconciliation; do not infer success from absence of a response.

Correction appends delivery.corrected with previous/new effective status, reason, actor, server timestamp and production/assignment versions. It never edits/deletes the original delivery.confirmed/failed event. Failure also identifies the exception owner and never invents refund/credit.

## Safety, freeze and production amendments
A trusted food/safety evaluator identifies an unsafe frozen-day recipe/profile impact. The model appends operations.safety_blocked and prevents handover; it neither regenerates meals nor clears the block. Runtime must also stop preparation/picking and propagate the incident to every affected delivery. The model does not implement the food evaluator or incident resolution.

D-055 logistics changes require a dedicated explicit scoped grant AND an accepted logistics policy, a reason and safety clearance. A numbered amended production version invalidates previous acknowledgement. The proposed acknowledgement command binds actor and exact current version. Handover remains denied until acknowledgement; acknowledgement cannot clear safety. No role overrides food safety.

Runtime must create numbered consolidation/picking/labels from immutable version snapshots and retain prior versions with operator acknowledgement. This packet defines the mutation boundary; it does not deliver those business screens/print artifacts.

## Time authority
Use server time and IANA Africa/Casablanca. Consumption J, production J-1 daytime and delivery J-1 evening are separate fields. D-044 example: an 18-22 delivery slot yields last-call opening at 23:00 J-2 and closing at 05:00 J-1. This is a local civil-time rule, not a fixed UTC offset or always-six-hours UTC arithmetic across a timezone transition.

B01-I time adapter must return versioned absolute opening/closing instants with explicit DST/ambiguous-time behavior. The reference only verifies a supplied half-open useful visibility window [start,end). It does not calculate local timezone transitions or claim D01 end-to-end validation.

## One event, separate unique consumers
The same authoritative delivery.confirmed event feeds notification and referral/reward processing. Each consumer uses a durable unique (eventId, consumer) receipt. The reference records applied/unknown and refuses unknown retries with RECONCILE. It never sends or transfers money/days.

A correction does not emit a second confirmed event. Actual first-delivery eligibility and any reversal/compensation remain with the accepted referral/lifecycle contracts. Deduplicating an event alone does not establish commercial eligibility. Provider reconciliation and atomic consumer side effects require integration tests.

## Reconciliation denominator
The synthetic effective projection partitions planned rows into planned-not-prepared, prepared-unresolved, delivered and failed. prepared includes the last three groups. Therefore:
- notPrepared = planned - prepared
- unresolvedPrepared = prepared - delivered - failed
- unaccounted = planned - delivered - failed

For planned120/prepared118/delivered115/failed3, notPrepared2, unresolvedPrepared0, unaccounted2. Corrections preserve history and recalculate effective counts. Broader cancellation/return states require explicit extensions, not silent classification.

## Verification and ownership
Run node --test specs/operations/contracts/operations-reference.test.mjs.
Tests cover trusted-fact scope/window refusals, immutable state transitions, idempotency, correction history, safety denial, amendments/acknowledgement, duplicate and unknown consumer outcomes, and exact reconciliation.

Unproven: production SQL races/rollback/crash recovery, external provider effects, real permissions and all channels, timezone calculations, food feasibility and operational incident resolution. Model tests do not create an Ekwip receipt. Work Fitnest owns product correction and semantic review; Ekwip owns deduplicated admission, qualified execution and integration. Do not create another execution if B11-C already has one.
