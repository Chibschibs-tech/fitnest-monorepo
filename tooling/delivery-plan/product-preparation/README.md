# Product preparation - B01-I and independent contracts
Date: 2026-10-31. Status: preparation only.

This bundle belongs to Work Fitnest. It defines product acceptance and source-bound test cases; it does not register an execution profile, dispatch work, accept a task or change the semantic backlog.

## Immutable basis
Repository: Chibschibs-tech/fitnest-monorepo.
Semantic plan: 2854038dfe653289c326dd33650a311918f630ad.
Read base: 46599153870b62421ff20568b0dd8679222a297b.

| Source | Git blob |
|---|---|
| docs/delivery/backlog.json | 30f920979a313672728a0cd24448de0da97a4276 |
| packages/core/contracts/foundation-design.json | ff08333ac37d96bf40d2fcce867dc57d8bf908e0 |
| packages/core/contracts/foundation-design.md | 5f5ad642304913790717ba6be6fce722af944d42 |
| docs/delivery/clarifications.md | 977ae5ee5a7e043e7e26053b9436e5525a149621 |
| docs/delivery/product-baseline.md | 3b7916574c1a640b4d29c16d1c32475a35880d15 |

B01-C acceptance is an external platform receipt reported in the handoff. Its integrated documents still contain proposal labels and runtimeAcceptance=false; these immutable files are not rewritten here. Historical document statements about Docker, deployed roles and CI are not new observations.

## B01-I preparation
packages/core/contracts/B01-I-acceptance-preparation.json maps all 11 accepted foundation obligations to 31 implementation acceptance cases. Each case is explicitly not_run and identifies actual required evidence rather than counting a pure design fixture as runtime proof.

Required start dependencies are preserved exactly:
- B01-C: contract_accepted.
- S001-T001, S001-T002, S001-T003: verified.

G-CONSTITUTION remains a merge gate. G-SESSION, G-RECOVERY and G-T013 are retained where relevant. Preparation may proceed; this bundle is not permission to start dependent implementation or apply production migrations.

The highest-value implementation proofs are real transaction rollback/outbox atomicity, worker crash/lease fencing, concurrency/idempotency, next-request authorization, restricted database roles, isolated restore and exact deployed artifact checks. Validation of this packet itself proves only completeness and traceability.

## Three independent design packets
tooling/delivery-plan/product-preparation/next-contracts-20261031.json contains 20 concrete cases across:
- B04-C: food evidence/versioning/import. G-FOOD blocks real data qualification; G-MACROS concerns display convention, not a change to stored bands.
- B11-C: operations/freeze/delivery adapter. G-ROUND leaves ownership/visibility/corrections explicit; delivery failures do not invent compensation. This contract supplies B02-C's missing LOT-11 interface.
- B12-C: verified email and transactional communications. Preserve manual admission notices, opt-in push and no duplicate sends. G-PROVIDERS/G-RECOVERY/G-PRIVACY remain scoped and unresolved.

All three have only B01-C contract_accepted as a dependency and no start gates in the pinned graph. None depends on unfinished B02-C or T001-3 in that graph. All retain G-CONSTITUTION for merge. This selection does not assert that the platform has already admitted them or that no current execution exists; Ekwip must check task/source/candidate ownership before admission.

## Handoff contract
Work Fitnest supplies concrete contract proposals, executable product fixtures, exact commits/reports and semantic review. Work Ekwip owns admission/deduplication, profile preparation, recognition of existing code, qualification, orchestration, integration/deployment and recovery.

Expected evidence fields are recorded in the B01-I packet. Unobserved receipt, integrated commit or testable version stays null. Receipt and runtime validation remain separate. No provider calls, production writes, schema changes or runtime tests were performed by creating this bundle.
