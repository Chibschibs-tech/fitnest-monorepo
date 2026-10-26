# ADR SEC-B - schema, exposure and privilege inventory

Status: proposed contract for independent review; not an acceptance receipt.
Source plan: `2854038dfe653289c326dd33650a311918f630ad`.
Source task: `S001-SEC-B`, kind `contract`, output
`ADR and isolated acceptance fixtures`. Its verbatim acceptance is:
"Actual schema/exposure and privilege inventory; record unresolved choices and no production writes."

## Context and verified boundary

The 26 October capture in `evidence/schema-inventory-2026-10-26.json`
establishes public object metadata and effective client privileges at capture
time, with additional managed Storage/Realtime relation metadata. All 24 public
tables enable RLS and deny the inspected client table privileges. This does not
mean that the application or every HTTP interface is secure.

The inspected public tables are owned by postgres. postgres and service_role
have BYPASSRLS. Client roles have no BYPASSRLS. Twenty-three public sequences
still grant client USAGE/UPDATE. Default privileges differ by creator.
No public functions, views, policies or custom triggers were found.
No Storage bucket or public publication membership was found. Managed schemas
have their own grants, including realtime.subscription client SELECT with RLS
off; do not extrapolate public-table denial to them.

The observer connection was postgres. That identity is NOT the application's
runtime identity. Source `apps/web/lib/db.ts` obtains a connection from
DATABASE_URL; source inspection alone cannot identify its deployed role.
Neither a missing pgrst.db_schemas setting nor the local Supabase configuration
proves the deployed Data API exposure.

## Contract decisions, preserving existing product rules

1. Default-deny domain access. Keep client domain writes closed. API-only reads
   are preferred. A direct-read exception needs a named surface, minimum grant,
   ownership check and live-session/risk checks; it cannot be introduced by
   copying broad Supabase examples. D-059 and SEC-06/29 govern this boundary.
2. Separate migration owner from application role. Inventory both actual
   identities, membership and effective privileges. T006 proposes minimum
   grants per object; no runtime credential may acquire ownership/BYPASSRLS
   just to make a test pass.
3. Treat tables, columns, sequences, routines, views and inherited/default
   privileges separately. RLS does not protect TRUNCATE or sequence operations.
   Every migration must explicitly account for the actual creator's defaults,
   including PUBLIC function EXECUTE.
4. Inventory every enabled transport separately: application routes/actions,
   Data API tables/views/RPC, GraphQL, Storage and Realtime. A PostgREST
   pre-request check does not cover other products. Direct exceptions require
   the same current-session boundary as the server.
5. Preserve legacy closure and identity separation. No users/customer_accounts
   merge or reactivation of public legacy registration/guest checkout is
   authorized. Legacy integer relationships and timestamp semantics require a
   reviewed additive migration plan, not coercion.
6. Settings remain typed/versioned/audited. Ledger immutability and ownership
   are invariants, never switches. D-057/SEC-30 remain binding.
7. This task produces a read-only inventory, decisions and isolated fixtures.
   T004-T008 own migration implementation. SEC-C/T010 own bounded-session and
   old-token denial behavior. T013 retains production application authorization.

## What is known, unknown, and who supplies it

| Item | Classification | Responsible follow-up | Acceptance implication |
|---|---|---|---|
| public schema/object/grant snapshot | Observed metadata | Reviewer checks captured evidence | Contract evidence available |
| Data API enabled and exact exposed-schema configuration | Observed configuration; see Channel inventory and exposure | Root read-only dashboard evidence | HTTP behavior remains untested |
| deployed application and migration DB role names/memberships | Configured application postgres inferred; live/migration unknown | Root config evidence plus actual-connection query follow-up | Cannot assert runtime/migration separation |
| route/action/export/GraphQL source map | 108 API routes read at bound source SHA; other actions/deployed SHA partial | Fitnest source/deployment owner | Scope and limitations in source-channel inventory |
| desired direct-read exceptions | No exception approved by this ADR | Security/product review of each proposed path | Default-deny maintained meanwhile |
| privilege/migration replay and client cross-account behavior | Downstream runtime verification | T004-T008/T006, disposable synthetic stack | Not relabelled as a required runtime implementation inside SEC-B |
| revoked JWT denial on every supported path | Downstream runtime verification | SEC-C/T010 | SEC-B does not certify it |
| production migration application | Separate authorization | T013 founder gate | Not performed or authorized here |

Missing factual inventory is not a discretionary product choice. It stays
explicitly unresolved and cannot be silently marked verified. Conversely,
future runtime implementation tests must not be conflated with this contract's
design deliverable. Independent acceptance must judge the actual task contract,
its evidence and declared unresolved scope; this ADR cannot accept itself.

## Isolated acceptance fixtures and proof mapping

| Obligation | Evidence/fixture | Negative case |
|---|---|---|
| actual metadata is structurally coherent | snapshot and sec-b-contract.test.mjs | column/constraint refers to absent table |
| client table denial is distinct from sequences/default ACL | sec-b-inventory.test.mjs | table grant, disabled RLS, sequence access |
| missing information remains unknown | both suites, contract factual gaps | removed privilege, role or API evidence |
| bypass paths are separately visible | inventory fixtures | invoker/definer RPC, view, public bucket/publication |
| source scope is not rewritten into runtime delivery | contract test | downstream requirements treated as delivered |
| no production writes claimed | capture operations + SQL collector | observer role/SELECT probe confused with deployed role |
| immutable review inputs are handed off | contract paths and exact source commit | changed source/task acceptance or missing gate |

Commands:

```text
node --test tests/security/sec-b-inventory.test.mjs tests/security/sec-b-contract.test.mjs
```

Fixtures validate analysis and the contract evidence boundary. They do not
exercise deployed HTTP authorization. The analyzer continues to return
`accepted:false`; only Ekwip's independent verifier may record acceptance after
review, integration and commit-bound checks.

## Operational constraints

No schema/data/grant mutation, provider dispatch, production apply or customer
row extraction occurred. Metadata and role-probe timestamps are historical
observations. A later deploy or migration needs fresh evidence. Keep existing
SEC-A acceptance and its files untouched.


## Actual inventory and provenance

Snapshot `evidence/schema-inventory-2026-10-26.json` is bound to fitnest-db
(blboseqvdmpdrthipxdk), capture 2026-10-26T18:27:55.491238+00:00. SHA-256:
`a6735a85aceff1e317ea18d99a34c2f3ed5907389f47acd9c57187e2d3822f7c`.
It combines separate metadata SELECTs, migration listing and two READ ONLY
role probes. No customer rows were selected. The observer is postgres, not an
assertion of the application's live identity. The code-review SHA is
b8911d6c2d3a1343a22ba2aca462608ab0c9ec12; deployment parity is not asserted.

## Schema and privilege boundaries

The capture enumerates roles, schemas, relations, RLS flags, columns, column
grants, constraints, sequences, public functions and default ACL. All 24 public
tables deny inspected anon/authenticated table privileges, while 23 sequences
retain USAGE/UPDATE and per-creator defaults remain relevant. Zero public
functions/views is scoped to public, not all PostgreSQL schemas.
Runtime config evidence now identifies a configured postgres pooler username,
inferred by the role.project_ref convention; it is not a live current_user
observation. The metadata flags postgres BYPASSRLS, so configured privilege is a
finding for T006, not proof of role separation. Migration identity is unresolved.

## Channel inventory and exposure

The immutable source map in `evidence/source-channel-inventory-20261026.json`
recursively enumerates 120 API directories and reads all 108 route files at the
reviewed SHA. It records HTTP methods, imports and five API export routes.
Lexical auth identifiers are navigation aids, never authorization verdicts.
Legacy register and guest-orders return 410 in their source. Middleware checks
cookie presence, so each handler's server guard is still a required review.

Root observed the deployed Data API configuration read-only around 19:24 UTC:
installed, public and graphql_public exposed, 0/24 tables exposed, no functions
listed, automatic exposure checked, extra search path public/extensions.
`evidence/data-api-settings-20261026.json` records approximate timestamp and
provenance. This resolves configured exposure, not actual HTTP reachability.

RPC findings are limited to no public functions; GraphQL is configured exposed.
Storage had zero buckets; Realtime had zero public publication membership.
Non-API server actions, alternative exports and deployed SHA parity remain
explicitly unresolved rather than asserted absent. T006 owns actual-role
transport tests; SEC-C/T010 own live-session enforcement.

## Owner session and risk boundary

Default-deny domain writes and API-only reads remain the preferred contract.
Every proposed direct exception requires the smallest grant plus exact owner,
live application/provider session binding and risk-clearance checks. Roles,
JWT claims and cookie presence alone cannot satisfy all three. RLS exceptions
must not rely on user-editable metadata or stale permissions. No new exception
is approved here. T006 tests anon, owner, other account, staff scope and runtime
roles on actual transports; T010 supplies current-session/revocation behavior.

## Baseline and migration reconciliation

The source baseline blob e804c7f335ec254b78ffe1869ae771faf76bb6fa defines the
same 24 public relation names observed in the capture. The source also contains
nullable-plan migration blob c3d3d2b02df8d16016abaceca39ff9b3de589a64, but only
20260829155420_remote_schema is recorded remotely, and the captured plan_name
column is still NOT NULL. The evidence file records this narrow comparison,
not full schema equivalence. No blind replay, history repair or production
migration is authorized. T004-T008 must preserve identity separation and
typed/versioned settings while reconciling additive changes; T013 retains the
separate production apply decision.

## Secret and audit boundary

Privileged connection strings/service-role keys remain server-only. Browser
Supabase code inspected at blob cb9ca4f15f8b79ce973869a3f7bbdd1e1edf6233 uses
public configuration, not proof of a built bundle's full secret scan.
The evidence retains only role/host/port configuration needed for the finding;
no DATABASE_URL value, password, JWT, OTP, customer record or storage object is
persisted. SQL captures metadata and zero-row SELECT probes. Audit/export
authorization requires actor, permission and resource scope; the five mapped
API exports must be tested under staff permissions, not merely hidden in UI.
T006/SEC-30 implementation tests must also inspect logs and built artifacts.

## Unresolved choices and closure owners

No session duration, risk threshold or recovery exception is invented.
G-SESSION/G-RECOVERY remain the downstream SEC-C/T010 decisions; T013 remains
production apply authorization. For SEC-B, configured Data API exposure is
observed; HTTP behavior is untested. Configured application postgres identity
is inferred; live application and migration identity remain unobserved.
Fitnest deployment owner must capture those identities safely, and source
owner must close non-API actions/exports and deployment SHA binding. Security
review must explicitly adjudicate these limitations in the contract decision.
No unknown is treated as denied, isolated, or accepted.

## No production writes and repeatability

This design task's delta is restricted to docs and tests. The separate
.github workflow is support CI outside the executor allowlist, not a task
scope expansion. Neither collector nor this proposal changes grants, schema,
customer data, provider state or acceptance receipts. Repeatability is
documented in sec-b-review-20261026.md: extract inventory and structure objects,
capture fresh migration history, assemble with project/source identity, retain
timestamps, and keep new probes separate. Tests do not run migrations and do
not relaunch SEC-A. Independent adoption must bind exact patch/head and review
the protected checks; this manifest never grants acceptance.

