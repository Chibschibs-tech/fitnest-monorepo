# Source control and constitution synchronization

Base: `001-identity-account-admission` at `99d5e2ff78db63bbc048890dc17fd2d9d6f132b9`. This branch preserves the existing 48 tasks. Its draft PR targets that branch; it does not merge the slice or the controller into main.

Constitution PR #5 (`constitution-v4.3.0`) is still an integration dependency. This change does not overwrite it or declare it merged. The following exact alignment is required before dependent behavior merges:

| Article | Required alignment | Authority |
|---|---|---|
| IV Pricing | Monthly reference plus weekly flat daily premium and quarterly percentage; quantity-aware price cells, server identity/configuration context, integer centimes | D-003/005/007/018; REPO-D-025 |
| V Identity | Stable internal identity; phone is entry credential; bounded rotating sessions and independent verified-email recovery; all-staff TOTP | D-052/053/063 |
| VIII Payments | Server creates opaque payment session; hosted/tokenized card entry; explicit recurring amount/frequency, consent, opt-out, mandate, no trial renewal | PR #5; D-062 |
| X UX | French and English; native subscriber life plus narrowly scoped web rescue; no web wallet/preferences portal | PR #5; D-033/040/061 |
| XIV Configuration | Typed/bounded/versioned settings, frozen rule versions, audit and purpose-limited retention; ownership/ledger/food/payment invariants cannot be configured away | PR #5; D-057 |

Status: an explicit v4.4 consolidation is proposed on `fitnest-governance-alignment-20261024`. It ports the founder-arbitrated PR #5 v4.3 text and aligns the five articles below to the already recorded product decisions. Formal merge and attributable review evidence are still required. This document does not approve G-CONSTITUTION or change any other gate. Existing `docs/decisions-log.md` entries are preserved and a pointer is appended; product D IDs use the namespace in product-baseline.md.

## Evidence and execution

`backlog.json` is a planning/readiness manifest, not a running scheduler. `tooling/delivery-plan/validate.py` checks references, complete CAP/SEC coverage, acyclic dependencies and evidence requirements; it outputs planning-ready work separately from paid automatic dispatch. Passing this check does not pass application tests, validate food, authorize migrations, enable the Ekwip executor or establish production readiness.

Each execution is bound to repository, base/head commit, task, approved input versions and allowed paths. Record status, attempts, model/provider, metered input/output/cached tokens, cost estimate and reconciled cost separately, tests, PR and artifact links. Unknown cost is null, never zero. An LLM statement of success is not evidence. Commit changes invalidate dependent review where inputs changed.

Workflow: planned → ready → running → checking → review → verified; failures return to bounded repair or blocked with cause/owner. Only a verified dependency (or an accepted contract explicitly typed in the edge) unlocks its consumers. Retry the same business operation with its idempotency key. Pause on budget exhaustion, repeated identical failure, scope drift, missing decision or unsafe migration. Never fabricate a fallback output.

Contract acceptance lets another team work against a versioned fixture; it does not prove runtime integration. Full end-to-end verification is mandatory before release. A task is verified only when its acceptance, exact commit, tests and review evidence are recorded; a contract is accepted only with attributable review evidence.

The existing Ekwip pilot is not automatically a Fitnest worker. Qualify it under LOT-X before dispatch, with a Fitnest-specific budget. No perpetual background orchestration is activated by this documentation PR.
