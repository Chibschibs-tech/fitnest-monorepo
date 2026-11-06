# BX-C — why Fitnest cannot yet run unattended

Inspected the actual `execution-p2` source of
`chihabJekwip/ekwip-delivery-platform` on 2026-10-18. The paid pilot is not a generic
Fitnest runner. A GitHub draft PR or Vercel Ready status does not establish that it is.

| Source | Observed boundary | Required implementation and proof |
|---|---|---|
| `packages/executor/src/policy.ts` | Exact Ekwip repository, `execution-p2`, four CSV-related editable files | Tenant/project registry with explicit allowed repository, base SHA, task paths and scoped credentials; negative cross-project tests |
| `packages/executor/src/worker.ts` | Every task runs `/proof/csv.test.mjs` | Trusted versioned acceptance profiles per task; code cannot choose its own passing checks |
| `.github/workflows/executor-pilot.yml` | Manual `workflow_dispatch`, at most two attempts | Durable scheduler/event trigger, dependency eligibility and lease recovery; prove the next task starts without a user relaunch |
| `src/server/executor.ts` | PR URL accepted only for Ekwip; no Fitnest manifest import | Atomic idempotent import with source revision/hash, status/evidence/cost mapping, then visible dashboard reconciliation |
| Pilot failure evidence | `scopePassed=false`, `checksPassed=false` | Distinguish no patch, path violation and worker/process failure; retain bounded, sanitized diagnostics before another paid attempt |
| Spend controls | Time-limited pilot approval and tariff checks | New explicit Fitnest budget/rate qualification with reservations and cost reconciliation; never reuse an expired pilot approval |

The exact reason for the previous scope failure is **not known** from the available
evidence. Do not loosen path isolation or increase spend to force success.

## Closure test for the first autonomous Fitnest cycle

On a dedicated nonproduction project and bounded budget, import accepted task
contracts, claim one eligible task, run isolated OpenCode against its pinned source,
collect the patch, execute externally controlled checks, and permit a bounded
correction on a known test failure. Review evidence binds the exact tested commit.
Only then advance a dependency; never equate a model's completion message with
acceptance. Provider timeout or unknown cost enters reconciliation, not a blind retry.

The dashboard must show all of: source/task ID, status, blocker, attempts, reserved
and measured costs (with their basis), checked SHA, tests, review, PR and delivery
environment. Planning tasks and prototypes must not appear as delivered work.

## Current execution truth

The foundation work in this PR is performed directly in the development session;
it is not evidence that the paid OpenCode scheduler ran. No provider key was read,
no paid task was dispatched and no spending approval was extended. The next
platform increment is the Fitnest adapter/import/check profile above, not another
arbitrary demonstration task. No new account setup is required from the founder
to continue preparing and testing this code.
