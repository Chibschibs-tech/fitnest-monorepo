# Integration and rollout

## Verified baseline, 2026-10-17

- Repository: `Chibschibs-tech/fitnest-monorepo`.
- Main: `5333ca88f52e9c0ec7daad79cfd919034d863af2`.
- Slice 001: `99d5e2ff78db63bbc048890dc17fd2d9d6f132b9`, 48 unchecked tasks;
  security injection is explicitly pending.
- Existing CI installs pnpm dependencies and builds the web application with Node
  20. It does not yet implement all quality gates described in slice 001.
- Connector read/write capability is available. That is not evidence of a
  configured live runner, secrets, staging or production permissions.

## Workflow publication blocker

On 2026-10-17, branch creation and an ordinary source-file commit succeeded,
but GitHub returned HTTP 403 for `.github/workflows/delivery-loop.yml`. Read-back
returned 404. No automatic retry or alternative execution route was attempted.
The exact workflow is retained as `workflow-template.yml` for review. It is not
a discovered GitHub Actions workflow at that location. An authorized maintainer
must install it at the intended path or grant the connector credential the
required workflow-writing permission. The precise credential type is not known.
Existing application CI remains separate; its success cannot stand in for this job.

## Implementation sequence

1. Review and merge the foundation only after the new job and existing CI have
   passed. Do not configure the path-filtered foundation job as a universal
   required check without first adding an always-reported aggregate status.
2. Resolve a real target task against current specifications and commit. Map its
   editable paths and acceptance tests. Product work remains subject to the
   security injection and schema gates; the demo is not a substitute.
3. Pin an OpenCode executable version and a permitted provider/model. Implement
   the runner adapter with a bounded execution and authenticated result schema.
4. Add reliable provider metering, reservations across concurrent tasks and an
   enforceable spending ceiling. Qualify provider terms and quotas before use;
   subscription credits are not automatically interchangeable with API dollars.
5. Configure a separate reviewer context and trusted test execution. Run one real
   low-impact task end to end before allowing a batch of tasks.
6. Connect isolated staging and verify the accepted commit, deployment ID and
   business acceptance checks. No production credentials reach the coding runner.
7. Bind founder approval to the exact staged release, deploy through a separate
   service and verify the result. An incident blocks delivery and invokes a
   reviewed runbook, not an unconditional automatic rollback.

## Required adapter controls

**Scheduler:** reviewed immutable task contract; verified delivered dependencies;
unique run/event IDs; bounded attempts; no automatic reset of terminal failures.
Any successor run must identify the reconciled predecessor and its actual costs.
The sample cap is per task, not a global or monthly spending cap.

**Runner:** ephemeral workspace, unprivileged user, CPU/memory/time limits and
restricted network. A worktree and a diff allowlist are not process isolation.
Compute the diff independently, including untracked files, both sides of renames,
symlinks and submodules. Do not accept the agent's description of its own diff.

**Checks:** trusted commands and protected test sources; verify their result on
the exact proposed commit. Tests load candidate code, so they also require an
isolated process with no deployment secrets. The example's `syntax` and
`acceptance` checks must be replaced by the actual task's applicable lint,
typecheck, build, integration and acceptance checks.

**Review:** specification, exact diff and trustworthy evidence in a clean context;
authenticated reviewer identity; structured findings. A scripted reviewer is
useful for transition tests but cannot certify security or product quality.

**State:** use transactional compare-and-swap and unique event constraints before
multiple hosts. Store audit evidence separately with restricted write access.
Persist only sanitized structured records, never API keys or raw model output.
The reducer's hashes detect mismatched content, not an attacker who can rewrite
both the content and its hashes.

**Deployment:** verify commit and deployment identifiers. A rebase or merge that
changes the commit invalidates earlier release evidence. Authenticate approvals
outside the runner and impose their expiration. This PR configures no actual
production gate or branch protection; state transitions alone cannot enforce them.

## Failure recovery

- On timeout or process crash, verify that the worker stopped and reconcile cost,
  Git commits and external effects before creating a successor.
- Do not automatically delete an old file-store lock; first check that no writer
  owns it. Keep the prior state for investigation.
- An ambiguous remote-write response can hide a successful write. Read back the
  remote state before deciding what to do; never automatically retry a write.
- Production incidents need a concrete recovery decision. Data migrations may
  require a forward fix; do not assume a code rollback restores the data.

## Sources

Official documents consulted on 2026-10-17:

- https://opencode.ai/docs/cli/
- https://opencode.ai/docs/agents/
- https://opencode.ai/docs/permissions/
- https://docs.github.com/en/actions/reference/security/secure-use

The exact OpenCode output contract, provider/model, billing limits and review
service are not yet qualified or activated.
