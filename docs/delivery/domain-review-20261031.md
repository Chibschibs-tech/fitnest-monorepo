# Independent domain reference review - 31 October 2026

Disposition: suitable for publication as partial product contract/reference proposals. No B04-C/B11-C/B12-C task acceptance, production readiness, deployment or food certification is granted.

## Verification reproduced
- B04-C: 52 synthetic model tests passed.
- B11-C: 45 synthetic model tests passed.
- B12-C: 60 synthetic model tests passed.
- Combined Node test run: 157 passed, zero failed/skipped/cancelled.

Command: node --test specs/food/contracts/food-reference.test.mjs specs/operations/contracts/operations-reference.test.mjs specs/communications/contracts/communications-reference.test.mjs

## Corrected review findings
B04-C: live staff/MFA/risk/lifetime facts are required; missing hazard assessment evidence blocks eligibility; resolved ingredient/component taxonomy cannot disappear or be relabelled in recipe projection; cost capture date round-trips to an actual ISO instant; blank evidence/identity strings are rejected. Import remains draft-only; deep-frozen version snapshots and reviewed digest prevent silent candidate replacement.

B11-C: idempotency binds project/actor/operation/key and normalized command including version/revision. Complete/pending/unknown/malformed states cannot fabricate success or duplicate effects. Existing malformed consumer receipts deny; unknown effects require reconciliation. Events carry correlation IDs, and failures require an exception owner. Acknowledgement is not inferred from the read-only Preparation role; assignment/correction/logistics policies remain explicit prerequisites. Current authority and scope are rechecked before replay. Safety blocks cannot be cleared by role or logistics amendment.

B12-C: authenticated callback evidence binds exact outcome/key/attempt; unknown is not not_sent. Historical email verification and current completed proof are separate, with prior-email-before-risk and current-proof-after-risk bounds. OTP hook ID reuse across account/purpose conflicts. Notification envelopes are strict minimal allowlists; current recipient/push eligibility and renewal state are required; admission remains manual. The 1..10 retry range is labelled synthetic model bound, not ratified production policy.

## Source and scope
The packets reference semantic plan 2854038dfe653289c326dd33650a311918f630ad and base46599153870b62421ff20568b0dd8679222a297b. They preserve B01-C contract_accepted dependencies and G-CONSTITUTION and identify open food/assignment/provider/privacy decisions. Review used supplied pinned-source context and local artifacts, not a fresh live receipt-ledger read.

All references use trusted adapter facts and in-memory/synchronous state. Tests do not prove cryptography, provider verification, durable transaction atomicity, concurrent races, crash recovery, actual authorization on every API, timezone calculation, deployed version or production operations. Those remain implementation/qualification obligations.

B04-C is explicitly partial: measurement and taxonomy checks, preliminary review eligibility and component-wise macro-band membership do not establish physically coherent nutrient declarations, food safety, server recalculation or whole-day feasibility. B11-C does not implement production/picking screens, the food safety evaluator or real timezone adapter. B12-C sends no messages and does not implement provider credentials, transport or charging. No platform profiles, scheduler or receipt gates changed.

## Reviewed bytes
See reviewed-files.json alongside this report for SHA-256 of the12local product files after corrections. Any content change requires renewed review of its delta; UTF-8 transport must preserve these bytes or document encoding-only conversion separately.
