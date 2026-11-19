# Foundation design ADR — B01-C protected design qualification

Status: **proposal** (not accepted).  
Task key: **B01-C**.  
Source plan: `2854038dfe653289c326dd33650a311918f630ad`.  
`runtimeAcceptance`: false. `productionReady`: false.

This document is a design contract and isolated reference fixture for the B01-C foundation criterion. It preserves the accepted S001-SEC-A, S001-SEC-B and S001-SEC-C deliverables and the gates **G-CONSTITUTION**, **G-RECOVERY**, **G-SESSION** and **G-T013**. It authorizes no production writes, no live provider calls, no migrations and no acceptance claims.

## Context

The pinned source context defines a foundation layer for the Fitnest monorepo: shared API conventions, deterministic idempotency and lock ordering, transactional outbox semantics, environment qualification, migration/restore discipline, server-authoritative time and audit redaction. The actual codebase boundary is observed, not assumed. The candidate baseline contains the five SEC-B evidence files under `docs/delivery/evidence/`, the SEC-A reference model in `tests/security/identity-reference.mjs`, the SEC-C reference model in `tests/security/session-reference.mjs`, the design-only source documents under `docs/delivery/`, and the three workspace manifests `package.json`, `apps/web/package.json` and `packages/core/package.json`. The runtime inventory records the workspace-byte SHA-256 and the full `engines`/`dependencies`/`devDependencies` of each manifest as observed facts, with no claim that those versions are release recommendations or deployed observations.

The schema inventory captured on 2026-10-26 (`schema-inventory-2026-10-26.json`, SHA-256 `a6735a85...`) enumerates 24 public relations, 261 columns, 23 sequences, 5 roles and zero public functions, views, policies or triggers in the `public` schema at capture time. All 24 public tables have RLS enabled and deny inspected `anon`/`authenticated` table privileges. `postgres` and `service_role` have `BYPASSRLS`; client roles do not. The 23 public sequences still grant `USAGE`/`UPDATE` to client roles and per-creator default privileges remain relevant. The Data API configuration evidence (`data-api-settings-20261026.json`, SHA-256 `85e25aa3...`) records the API as installed, exposing `public` and `graphql_public`, with automatic new-table exposure enabled, zero public functions listed and `maxRows` 1000. The runtime-role configuration evidence (`runtime-role-config.json`, SHA-256 `629620ec...`) infers a `postgres` pooler username from the Supabase naming convention but explicitly records `liveConnectionRoleObserved=false`, `migrationConnectionRoleObserved=false` and `credentialsRetained=false`. The source channel inventory (`source-channel-inventory-20261026.json`, SHA-256 `4f398dae...`) binds 108 route files to reviewed source SHA `b8911d6c2d3a1343a22ba2aca462608ab0c9ec12` and marks server actions as `unknown`. The baseline migration review (`baseline-migration-review-20261026.json`, SHA-256 `6a34394b...`) confirms the 24 public table names match the source baseline, notes the nullable-plan migration is not recorded in the remote history and records `observedPlanNameNullable=NO`.

These observations are configuration and source-bound facts, not runtime authorization proofs. Live application-role confirmation remains false.

## Decision

Adopt the B01-C foundation contract as a set of pure, deterministic design fixtures recorded in `packages/core/contracts/foundation-design.json` and `packages/core/contracts/foundation-reference.mjs`. Every helper treats its inputs as synthetic server records and fails closed on malformed, missing or contradictory values. The fixtures do not import application code, use clocks, write files, spawn processes or access networks.

## Preserved gates and upstream contracts

- **G-CONSTITUTION**: unchanged; no constitutional rule is overridden by a foundation convention.
- **G-RECOVERY**: unchanged; the foundation does not invent recovery evidence or assisted-recovery policy.
- **G-SESSION**: unchanged; session durations, risk thresholds and device policy remain downstream of SEC-C.
- **G-T013**: unchanged; production migration application requires explicit founder arbitration with a concrete diff, privilege plan, data impact, local tests and restore procedure.

The accepted SEC-A (`tests/security/identity-reference.mjs` and its contract) and SEC-B (five evidence files and inventory fixtures) deliverables are preserved verbatim. This task does not rewrite them.

## Common API, error and event schemas

### API result envelope

Every authoritative API response uses a versioned DTO:

```json
{
  "version": 1,
  "requestId": "<server-generated request id>",
  "code": "DENIED|CONFLICT|INVALID|UNAVAILABLE",
  "data": "<domain DTO, when authorized and valid>"
}
```

Human-readable text belongs to the presentation layer and is never the contract. The `code` is a stable machine identifier; unknown codes are normalized to `UNAVAILABLE`. The `requestId` is server-generated and opaque to clients.

### Error envelope

The minimal error response contains exactly:

```json
{ "version": 1, "requestId": "<request id>", "code": "DENIED|CONFLICT|INVALID|UNAVAILABLE" }
```

The reference fixture `apiError({requestId, code, error})` never reflects the internal `error` object, so `sql`, `token`, `phone`, `otp` and health fields cannot leak through the boundary.

### Domain event schema

```json
{
  "eventId": "<opaque event id>",
  "eventType": "<domain.event-name>",
  "eventVersion": 1,
  "aggregateId": "<aggregate id>",
  "aggregateVersion": 1,
  "occurredAt": "<UTC timestamptz instant>",
  "correlationId": "<correlation id>",
  "payload": "<minimal domain payload>"
}
```

### Outbox record schema

The outbox is persisted in the same transaction as the business commit:

```json
{
  "event": "<domain event above>",
  "lease": "<current processor lease or null>",
  "attempts": 0,
  "nextAttemptAt": "<UTC timestamptz or null>",
  "outcome": "pending|delivered|failed|ambiguous"
}
```

Delivery is at-least-once. Consumer receipts are unique per event/recipient/channel. An ambiguous external provider outcome is reconciled before any retry; the fixture never authorizes a duplicate effect from an unknown result.

## Obligation inventory

(SEC-29)

The inventory obligation is satisfied by binding the five SEC-B evidence files to their exact SHA-256 values and by recording the unresolved runtime state. The evidence array is:

- `docs/delivery/evidence/baseline-migration-review-20261026.json` → `6a34394b983d5b69d8a5680af92f9c3051be5d132eb2764fdcabb7b50cf10580`
- `docs/delivery/evidence/data-api-settings-20261026.json` → `85e25aa3a603de53c3eb62a5c5fe8bfa7b30c5321b95848b5657d2881638bef6`
- `docs/delivery/evidence/runtime-role-config.json` → `629620ec08edea6a57818a57e74ee81305c299814d1102d1741cdf097577011d`
- `docs/delivery/evidence/schema-inventory-2026-10-26.json` → `a6735a85aceff1e317ea18d99a34c2f3ed5907389f47acd9c57187e2d3822f7c`
- `docs/delivery/evidence/source-channel-inventory-20261026.json` → `4f398daedc6d23761c6979e81ce011b54c3e092b913022e282e4771fddcf72ac`

`inventory.liveDeploymentConfirmed` is false. The runtime manifest entries record the workspace-byte SHA-256 of each of the three present manifests and their full `engines`/`dependencies`/`devDependencies` objects, with absent manifest sections recorded as empty objects:

- `package.json` → `18db7ad3d07b67223ebf59e24c320a5b48217b2520e28b217661e80806e41f05` (no `engines`, no `dependencies`, `devDependencies` = `npm-run-all`, `vitest` 5.0.5, `typescript` 5.9.3, `@types/node` 24.19.2).
- `apps/web/package.json` → `cf57b8894f31db9ff8c6f7a3a80883b346fae69d5ca9615529866ec27879b80e` (no `engines`; `dependencies` includes `next` 14.2.16, `react` ^18, `@supabase/supabase-js` 2.110.7, `@supabase/ssr` 0.5.2 and the full dependency list recorded byte-for-byte; `devDependencies` includes `typescript` ^5 and `eslint-config-next` 16.0.7).
- `packages/core/package.json` → `d5abfda8f00898c94fdeb31b07c94e208b7974217e3f11e9a095522e197229e9` (no `engines`, no `dependencies`, no `devDependencies`).

These are observed manifest contents, not release recommendations and not deployed runtime observations.

Verification plan: recompute the SHA-256 of each evidence file against `sec-bc/reviewed-bindings.json`; verify schema-inventory structural coherence (24 public relations, 261 columns, 23 sequences, no client table privileges); verify data-api-settings exposes `public` and `graphql_public` with automatic new-table exposure; verify runtime-role-config does not claim a live role observation; verify source-channel-inventory route count and reviewed SHA; verify baseline-migration-review public table alignment and unresolved nullable mismatch. Recompute the SHA-256 of each runtime manifest from its UTF-8 workspace bytes and compare the `versions` objects against the parsed manifest; absent sections must be empty objects, never fabricated. Reject any hash mismatch, missing evidence or substituted empty-file digest.

## Obligation api_errors

(SEC-06, SEC-32)

The API error fixture returns only `{version:1, requestId, code}`. Allowed codes are `DENIED`, `CONFLICT`, `INVALID` and `UNAVAILABLE`; unknown codes map to `UNAVAILABLE`. Internal errors containing SQL, tokens, phones or health data are discarded. Server authorization applies on every channel; a forged cookie, stale client version or direct transport call cannot bypass the server-side predicate.

Verification plan: run the `apiError` fixture against all four valid codes, unknown codes, missing codes and malformed inputs; assert the returned object contains exactly `version`, `requestId` and `code`; assert internal error payloads are absent. Cross-check the source-channel-inventory route list to confirm every route is expected to return stable machine codes and request IDs. Test that an old or forged client assertion is denied with `DENIED` or `UNAVAILABLE`, not with raw provider/SQL detail.

## Obligation settings

(SEC-11)

Settings must be typed, bounded, versioned and audited. Secrets must stay outside business tables. No setting may disable an invariant or reopen a frozen day. Sensitive changes require reauthentication. The fixture rejects any input that violates these invariants.

Verification plan: inspect the schema inventory and Data API settings for any business table storing secrets; confirm no setting schema permits `canDisableInvariant=true` or `secretsInBusinessTables=true`. Exercise invalid value rejection, stale-version conflict and recovery of a previous rule version. Confirm that a setting change cannot reopen a frozen consumption/delivery/production day.

## Obligation events_outbox

(B01-C/AC-01)

The outbox fixture enforces the following order: business commit and outbox persistence must occur in the same transaction; the event identity and version must be valid; an existing consumer receipt causes `skip`; an ambiguous or unknown external outcome causes `reconcile`; otherwise the event may be delivered. The event schema carries `eventId`, `eventType`, `eventVersion`, `aggregateId`, `aggregateVersion`, `occurredAt`, `correlationId` and `payload`. Delivery is at-least-once, consumer receipts are unique, and unknown external outcomes never justify a duplicate effect.

Verification plan: run the `outbox` fixture against the representative input and boundary cases (`businessCommitted=false`, `outboxPersisted=false`, `sameTransaction=false`, invalid `eventId`, invalid `eventVersion`, `consumerReceiptExists=true`, `externalOutcome='ambiguous'`, `externalOutcome='unknown'`, `externalOutcome='not_attempted'`); assert the decision is `deliver`, `skip`, `reconcile` or `reject` as specified. Confirm the event schema fields are present and that no path delivers when the transaction boundary is broken.

## Obligation idempotency_lock_order

(B01-C/AC-01)

Idempotency keys are bound to `tenant`, `actor`, `operation`, `key` and `payloadHash`. The fixture returns `create` for a fresh request, `replay` for an existing record whose `state` is `complete`, `wait` for `state` `pending`, `reconcile` for `state` `unknown`, `conflict` when any binding field (tenant, actor, operation, key or payloadHash) differs, and `reject` for malformed input. An unknown provider outcome is never allowed to produce a duplicate effect.

Lock ordering is deterministic per tenant: `lockOrder({tenant, locks})` validates that every lock belongs to the same tenant, that IDs are nonempty strings, that ranks are nonnegative safe integers, deduplicates identical `(rank, id)` tuples and returns the remaining tuples sorted ascending by rank then id. Cross-tenant or invalid input returns `null`.

Verification plan: run the `idempotency` fixture across fresh requests, records with `state` `complete`, `pending` and `unknown`, records with a mismatched tenant/actor/operation/key/payloadHash and malformed inputs; assert the exact decision. Run `lockOrder` with duplicate ranks, duplicate ids across ranks, cross-tenant locks, negative ranks, missing ids and empty arrays; assert the sorted tuple output or `null`.

## Obligation environments

(SEC-31)

Local and CI are the only disposable qualification environments and must use synthetic data, sandbox providers and credentials scoped to that exact environment. Production — and any environment name other than `local` or `ci` — is never a fixture. The `environment` fixture returns true only when `environment` is `local` or `ci`, `syntheticData` is true, `providerMode` is `sandbox` and `credentialsEnvironment` matches the named environment.

Verification plan: run the `environment` fixture against `ci` and `local` with sandbox/synthetic/matched credentials, and against `production`, `staging`, missing synthetic data, live provider mode and credential/environment mismatch; assert the boolean result. Confirm `.env.example` contains placeholders and that no service-role secret or production credential is present in the candidate baseline.

## Obligation privileges

(SEC-29)

Application and migration database privileges must be separated. No privileged client keys are allowed. The schema inventory shows `postgres` and `service_role` hold `BYPASSRLS`, while `anon` and `authenticated` do not. The runtime-role evidence infers a `postgres` pooler username but records no live observation. `liveRuntimeRoleConfirmed` remains false until T006 observes actual `current_user`, session user and role memberships through a real application connection.

Verification plan: re-read schema-inventory to confirm no `anon`/`authenticated` table privileges and that only `postgres`/`service_role` have `BYPASSRLS`. Re-read runtime-role-config to confirm `liveConnectionRoleObserved=false`, `migrationConnectionRoleObserved=false` and `credentialsRetained=false`. Confirm the reference module imports no application database client and makes no live connection. Keep `applicationMigrationSeparated=true` and `clientPrivilegedKeysAllowed=false` until independent platform acceptance.

## Obligation migration_restore

(B01-C/AC-01, SEC-31)

Migration history must be reconciled, isolated restore must be tested, erasure requests must be replayable and changes must be backward compatible. The fixture returns `eligible` only when all four required flags are true and the change is not destructive; it returns `blocked` for any destructive change unconditionally and for a production change without recorded founder approval. `supabase/migrations/` is the canon; legacy Drizzle scripts require reconciliation. The baseline review shows the nullable-plan migration is not recorded remotely and `observedPlanNameNullable=NO`, so a blind production replay is not authorized.

Verification plan: run the `migration` fixture with all required flags true and `destructive=false`; confirm `eligible`. Run with each required flag false, with `destructive=true`, and with `production=true` but `founderApproved=false`; confirm `blocked`. Cross-check `baseline-migration-review-20261026.json` for `productionReplayPerformed=false` and unresolved nullable-plan state. Confirm the migration canon path is `supabase/migrations/` and that any legacy script is explicitly reconciled before use.

## Obligation time

(D-058, SEC-15)

Time authority is server-side. Business dates use `Africa/Casablanca`. Instants are stored in `timestamptz`. Intervals are half-open `[start, end)`. One transaction uses one time anchor. Consumption, delivery and production dates are distinct. The D-058 prototype receives an explicit `Date` from the caller and returns Casablanca business date and ISO-week boundaries; it must not add seven 24-hour periods, because Ramadan and local transitions produce 167/169-hour weeks.

Verification plan: exercise the D-058 time prototype at before/at/after cutoff, midnight, phone-timezone offset and local-time transitions; assert correct Casablanca business date and half-open interval boundaries. Confirm that native rendering and device timezone remain separate downstream qualifications.

## Obligation audit

(SEC-30)

Business audit is restricted. Technical IDs are pseudonymized. `health`, `otp`, `phone` and `token` fields are redacted. Audit exports require an export actor and evidence of permission and resource scope. The API error fixture never reflects internal errors; the security notification fixture carries no telephone, email, OTP, session token or history.

Verification plan: inspect the `apiError` fixture to confirm internal error objects are discarded. Confirm the redaction list is enforced in any audit/export schema. Test that an audit export without an actor or without permission is rejected. Verify notification payloads contain no health data.

## Obligation compatibility

(SEC-32)

The API contract version is 1. Responses are versioned. Server authorization applies on every channel. Old clients cannot bypass server rules. The source channel inventory records 108 routes at reviewed SHA `b8911d6c...`.

Dependency pinning and lockfile presence are **not observed** in the current manifests. `apps/web/package.json` declares numerous `"latest"` version specifiers (for example `@auth/core`, `next-auth`, `drizzle-orm`, `knex`, `pg`, `stripe`, `uuid` and many more), and the runtime inventory records no lockfile hash for any of the three manifests. Exact dependency pinning, mandatory CI, artifact-to-commit traceability and demonstrated rollback therefore remain unresolved SEC-32 pre-acceptance requirements, not already-true statements about this baseline.

Verification plan: confirm `api.contractVersion=1`, `versioned=true`, `serverAuthorizationEveryChannel=true`, `oldClientCannotBypassRules=true` and `rawErrorsAllowed=false`. Cross-check source-channel-inventory for route count, reviewed SHA and method coverage. Test that a forged or stale client request is denied by the server authorization fixture regardless of client version. Confirm the candidate baseline does not contain unversioned or raw-error responses. For dependency supply-chain assurance, confirm whether a lockfile exists in the workspace, note the `"latest"` qualifiers recorded in `apps/web/package.json`, and treat exact dependency pinning, mandatory CI, artifact-to-commit traceability and demonstrated rollback as unresolved acceptance requirements rather than already-true statements.

## Actual schema and runtime boundaries observed

- **Schema boundary**: 24 public tables, all RLS-enabled, zero client table privileges, 23 client-visible sequences, zero public functions/views/policies at capture time.
- **Data API boundary**: installed, `public` + `graphql_public` exposed, automatic new-table exposure enabled, zero public functions listed, `maxRows=1000`.
- **Runtime identity boundary**: configured `postgres` pooler username inferred; no live `current_user` observation; no migration role observation; credentials not retained.
- **Source boundary**: 108 API routes bound to reviewed SHA `b8911d6c...`; server actions marked `unknown`; five export paths recorded.
- **Migration boundary**: source baseline `20260829155420_remote_schema.sql` matches public table names; nullable-plan migration `20260829160000_meal_type_prices_plan_name_nullable.sql` is not recorded remotely; `observedPlanNameNullable=NO`.
- **Manifest boundary**: `package.json`, `apps/web/package.json` and `packages/core/package.json` are present in the candidate baseline; the inventory records their workspace-byte SHA-256 and full `engines`/`dependencies`/`devDependencies`. None of the three declares an `engines` section; the root and `packages/core` manifests declare no `dependencies`; the `apps/web` manifest declares a large dependency set including `next` 14.2.16 and `@supabase/supabase-js` 2.110.7. The `apps/web` manifest contains numerous `"latest"` version specifiers and no lockfile hash is recorded for any of the three manifests, so exact dependency pinning is not an observed fact.

None of these observations certify runtime security, deployed identity or production readiness.

## Unresolved deployment and runtime facts

The following facts remain explicitly unresolved and are not relabeled as business choices:

- The actual deployed application database role and migration role have not been observed; `liveRuntimeRoleConfirmed` is false.
- Docker is absent in the current editing environment; the local Auth qualification is prepared but not claimed passed.
- The native mobile directory is absent from the root pnpm workspace; adding it requires separate dependency resolution and device build.
- T012 (identity/referral/wallet scaffolding) remains incomplete; no ledger representation or unit scale is invented here.
- T013 production migration authorization remains open pending founder arbitration.
- G-SESSION session lifetimes, device policy and provider refresh exceptions remain downstream of SEC-C.
- Provider defaults in the local Auth fixture do not decide production session policy.
- The manifest versions are observed contents, not release recommendations and not deployed runtime observations; no `engines` section is declared in any of the three manifests.
- No lockfile hash is recorded for any manifest and `apps/web/package.json` declares numerous `"latest"` version specifiers; exact dependency pinning, mandatory CI, artifact-to-commit traceability and demonstrated rollback remain unresolved SEC-32 acceptance requirements.

## Reference model

`packages/core/contracts/foundation-reference.mjs` exports a frozen `CRITERION` and the pure functions `authorize`, `idempotency`, `outbox`, `environment`, `migration`, `lockOrder` and `apiError`. It imports no application infrastructure, uses no clocks, writes no files, spawns no processes and accesses no network. Candidate code is intended to run in a separate Node process with no filesystem-write or child-process permission, inside the existing network-disabled Docker proof container.

## No production writes or acceptance claims

This proposal authorizes no production writes, no live provider calls, no migrations, no deployment and no acceptance. The JSON declaration keeps `status=proposal`, `runtimeAcceptance=false` and `productionReady=false`. The checker intentionally does not accept a document's own acceptance assertion. Independent platform acceptance is required before any status change.
