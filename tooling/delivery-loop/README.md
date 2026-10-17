# Delivery loop foundation

This developer-tooling package contains a tested controller and a reproducible
local demonstration. **Live execution is disabled.** There is no connected LLM,
GitHub writer, deployment adapter or production approval service in this package.

## Run

Node 24.19.0 and Git are required. No npm dependencies or installation are needed.
From the repository root:

```sh
node --test tooling/delivery-loop/test/*.test.mjs
node tooling/delivery-loop/src/demo.mjs
node tooling/delivery-loop/src/preflight.mjs
```

The last command intentionally exits **2**. It reports missing integrations and
cannot be enabled by flipping configuration booleans. The existing application
CI still runs separately; these tests do not establish application readiness.
The dedicated workflow is installed at `.github/workflows/delivery-loop.yml`.
Workflow-write permission was confirmed by a successful commit and read-back on
2026-10-17. Both this job and existing application CI must pass on the latest PR
head before merge. `workflow-template.yml` retains the reviewed initial template;
the active workflow is the source of truth for subsequent changes.

The demo creates a temporary Git repository, submits a deliberately defective
cost-calculation fixture, observes failing acceptance tests, then submits the
corrected fixture and runs those tests again. Candidates and review are scripted;
no model is called. It finishes at `ready_staging`, without a deployment.
Logs and a structured report are written under `runtime/` and ignored by Git.

## Files and trust boundary

| File | Responsibility |
|---|---|
| `src/loop.mjs` | Task transitions, attempt and accounting limits, commit-bound evidence, production gate |
| `src/store.mjs` | Single-host state, exclusive lock, atomic update, event deduplication |
| `src/demo.mjs` | Real local Git commits and tests; simulated writer and reviewer |
| `src/preflight.mjs` | Explicit disabled state and integration inventory |
| `fixtures/recipe-cost.mjs` | Demonstration input only; not an application pricing engine |
| `test/` | Controller refusal cases, persistence and fixture acceptance |
| `examples/` | Demo contract and policy; not live authorization |
| `workflow-template.yml` | Initial reviewed template; active configuration is `.github/workflows/delivery-loop.yml` |
| `docs/integration.md` | Remaining adapters, controls and rollout sequence |

`applyEvent` is a trusted internal reducer, not an authenticated API. A string
such as `trusted_runner`, `cleanContext: true`, a check ID or a different reviewer
name cannot authenticate the sender or prove review independence. Adapters must
verify those facts. The implementation agent must never submit controller events,
write its state, or modify trusted policy and acceptance tests.

The state stores sanitized structured evidence and references. It is not a
cryptographically authenticated audit trail. The file store supports one host;
it is not a distributed scheduler, a network-filesystem store or an OS sandbox.

The USD 1 budget and USD 0.30 reservation in the example are **simulation values**.
A real spending ceiling requires a provider/proxy limiter plus reliable metering,
including review calls. The reducer can detect an overrun after a call; it cannot
prevent provider spending on its own. Unknown costs and expired leases block
rather than automatically refunding reservations or replaying work.

## Project integration

Specification: [005 delivery loop foundation](../../specs/005-delivery-loop-foundation/spec.md).

This package sits outside the pnpm workspace and application imports. It adds no
application dependency, database migration or runtime change. Node 24.19.0 is
pinned only for this tooling. Existing application CI uses Node 20 and remains
unchanged in this PR.

Slice 001 on commit `99d5e2ff78db63bbc048890dc17fd2d9d6f132b9` still blocks its
implementation pending security-requirement injection. This tooling PR does not
satisfy that gate, mark any of its 48 tasks complete, or supersede founder gate T013.
