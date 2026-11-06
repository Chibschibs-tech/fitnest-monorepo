# Fitnest V1 delivery baseline

This is the implementation starting point for the full V1 approved in the founder's master plan, not a reduced demonstration scope. Updated 2026-10-18 on a branch from 001 at 99d5e2f.

## Read order

1. [Product baseline](product-baseline.md): D-001–065/MC-01–08 and explicit collisions with the historical repository journal.
2. [Security requirements](security-requirements.md): 32 English requirements with acceptance tests.
3. [Backlog](backlog.json): 38 reconstructed capabilities, all delivery lots, dependencies, gates, budgets and evidence fields; the original 48 task IDs are preserved.
4. [Clarifications](clarifications.md): only genuinely unresolved product/provider/content inputs.
5. [Acceptance](acceptance.md): screen mapping, food database tests and end-to-end release conditions.
6. [Governance](governance.md): constitution PR #5 integration, review/evidence and executor boundaries.

## Delivery order

Foundation implementation is now proposed in a separate increment:
[runtime/test contract](foundation-contract.md), [live schema evidence](schema-exposure-review.md),
and [executor gap review](executor-gap-review.md). The time prototype has 13 passing
local cases and strict core typechecking. Auth fixtures and CI are prepared; their
runtime result is pending. These changes do not activate the paid scheduler.

| Stage | Work | Exit proof |
|---|---|---|
| Baseline | Reconcile source/spec/task coverage and contradictions | This draft PR and validated manifest; not application completion |
| Foundations | Runtime/CI/data boundaries; 003 staff; 001 foundations and explicit T013 | Real local database/security evidence and reviewed migrations |
| Shared contracts | Food/import, offer/price, payment, generation, native UX, delivery and communications | Versioned contracts, fixtures, permissions and negative cases |
| First internal chain | Acquisition → verified payment → native day → production → delivery → wallet | One real integrated test chain; not all of V1 |
| Complete V1 | All lifecycle changes, administration, analytics, food exceptions and communication recovery | Every confirmed CAP and unresolved scope explicitly resolved |
| Qualification/release | Security, concurrency, 500-active/5000-subscriber load, native builds, restore and operational rehearsal | Exact release artifacts plus explicit production/store decisions |
| Operations | Metrics, incident/restore, scaling and versioned feature intake | Measured service/cost and repeatable safe releases |

Roles represent product/UX, architecture, backend/data, mobile/web, food/operations, QA/security and release responsibilities. They are ownership assignments, not a claim that autonomous agents are already running. A contract task must produce a technical plan, permissions, API/schema/events, acceptance fixtures, performance/recovery budget and smaller implementation steps before its implementation work packet is dispatched.

## Validate and inspect readiness

```sh
python3 tooling/delivery-plan/validate.py
python3 -m unittest discover -s tooling/delivery-plan -p 'test_*.py'
```

The validator is read-only and makes no network/LLM call. Planning-ready means its input dependencies/start gates are satisfied; it does **not** mean automatic execution is allowed. Dispatch also requires an enabled qualified executor, explicit per-task budget and retry bound, resolved merge gates and approved Fitnest project budget. All costs start unknown (null), not zero.

No migrations, application deployment, paid model call, store release or background agent is triggered by this PR. The current Ekwip executor/dashboard must import this contract and be qualified under LOT-X; a file in Git is not a working dashboard integration. Routine implementation/review proceeds within the already authorized scope, while the explicit T013 production gate remains intact.
