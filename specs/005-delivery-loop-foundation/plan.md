# Implementation plan

## Design

- `tooling/delivery-loop`: dependency-free Node ESM tooling, outside the pnpm
  workspace. Pin Node 24.19.0 for this package only.
- Pure state reducer receives sanitized events exclusively from trusted adapters.
- Single-host file store serializes updates with an exclusive lock and revision
  comparison. It is a local adapter; distributed execution is deferred.
- Keep demonstration-only recipe code in `fixtures/`, with protected acceptance
  tests. Use two scripted candidates and real temporary Git commits and tests.
- New workflow on pull requests, relevant foundation-branch pushes and main.
  Read-only contents permission, pinned actions, five-minute timeout, no secrets
  or deployment, no persisted checkout credential.
- Keep application manifests, lockfile, existing CI and database files unchanged.

## Constitution review

| Articles | Assessment |
|---|---|
| I, IV, VI, VII | No product behavior, subscription pricing or wallet implementation; recipe calculation is a fixture |
| II | No schema change or database access; migration review remains a separate gate |
| III | Developer tooling, not a new customer-facing capability or Calo parity deviation |
| V, VIII, IX | No customer/staff identity, payment processor or cohort changes |
| X | Internal code, comments and documentation in English; no user interface change |
| XI | Dedicated branch/PR, spec/clarifications/plan/tasks/analysis, critical-path tests and dedicated CI; TypeScript application settings unchanged |
| XII | Scope and evidence limitations explicit; no new market measurement or Calo-derived claim |
| XIII | No amendment or override; the slice-001 security block and founder gate remain intact |
| XIV | Future external adapters extend the controller; no business engine is duplicated into application code |

Node ESM here is developer scripting, like the existing repository scripts; it
does not introduce application JavaScript or relax TypeScript strictness. No
constitutional exception is requested by this tooling scope.

## Validation and rollout

Run 27 controller/store/fixture tests, then the two-attempt demonstration. Require
first acceptance exit nonzero, second zero and final status `ready_staging`.
Check that preflight exits 2 and live execution remains false. Validate workflow
structure and full action SHAs. Existing application CI must also pass before
merge; a dedicated tooling pass cannot waive it.

First publish a draft PR. After review and merge, qualify the real model runner,
budget limiter, independent review, staging and approval adapters separately as
detailed in the package integration guide. No stage may be marked operational
from example configuration alone.
