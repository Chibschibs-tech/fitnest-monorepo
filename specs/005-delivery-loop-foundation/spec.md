# 005 — Delivery loop foundation

Status: implementation proposed for review; live automation disabled.
Date: 2026-10-17. Scope: developer tooling only. Branch: `delivery-loop-foundation`.

## Problem and outcome

Fitnest needs repeatable development with explicit acceptance, bounded correction
attempts and reviewable evidence. A successful model response must not be treated
as a tested change, a successful deployment or founder approval.

Deliver a deterministic controller, a local persistence adapter, a reproducible
failure/correction demonstration and an isolated CI workflow. The first integration
makes the controller reviewable in the real repository without activating an
unqualified model runner or changing product behavior.

## Clarifications

- User authorization covers preparing a branch and PR for this foundation. It
  does not choose a paid provider budget or replace the explicit production gate.
- The recipe-cost code is a fixture, never imported by web, mobile or shared core.
  Its MAD/unit choices are demo inputs, not new ratified product defaults.
- No migration, live LLM request, automatic merge, deployment or recurring service.
- Existing main and slice 001 are baselines, not declarations of current production
  state. This work does not certify security or capacity of the application.

## Acceptance

| ID | Required behavior |
|---|---|
| LOOP-01 | A task requires a verified base commit, exact editable scope and acceptance IDs before starting |
| LOOP-02 | A failing attempt can be corrected; the attempt and accounting limits terminate repeated failure |
| LOOP-03 | Unknown cost or expired execution blocks for reconciliation and retains the reservation |
| LOOP-04 | Tests, review and deployment evidence must reference the accepted commit |
| LOOP-05 | The implementation identity cannot approve its own result; findings request correction |
| LOOP-06 | Unexpected paths, protected files and unsafe file modes stop the attempt |
| LOOP-07 | Replayed identical events are idempotent; altered replays and stale revisions are rejected |
| LOOP-08 | Restart preserves state and structured evidence; an existing writer lock is not overwritten |
| LOOP-09 | Production requires an unexpired approval for the staged release; post-deployment checks must pass |
| LOOP-10 | Preflight fails closed because live adapters are absent; configuration flags cannot activate them |
| COST-UNKNOWN | Missing price produces an incomplete result, not a fabricated zero or a complete partial total |
| COST-ZERO | An explicitly zero price remains valid |
| COST-UNITS | Net-to-purchase yield is applied; liters require a documented density |
| COST-ROUNDING | Use exact intermediate arithmetic and round only the final monetary total |

The cost fixture exercises the September 11 meals-evolution proposal, sections
3.1/3.3. It is a demonstrator for LOOP-02, not the implementation of the meals
schema. Source provenance and this explicit limit must travel with the fixture.

## Definition of done

Local tests and the scripted failure/correction demo pass. The dedicated workflow
is installed at `.github/workflows/delivery-loop.yml` after the workflow-write
permission update on 2026-10-17. It runs the same commands and retains evidence
without deployment secrets. A draft PR contains exact scope, validation and
remaining integration work. Both foundation and application CI must pass on the
latest PR head, and review is required before merge. Workflow installation alone
does not establish a passing run or live autonomy.
