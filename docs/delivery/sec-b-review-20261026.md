# S001-SEC-B - current evidence and execution contract

## What changed

Refreshed the actual `fitnest-db` metadata on 2026-10-26 at 18:27:55 UTC
(19:27:55 Africa/Casablanca), and added Storage/Realtime metadata plus real
read-only SQL-role denial probes. The 18 October snapshot remains historical
evidence. No production schema/data/grant change was made.

The snapshot is a composite of separate read-only metadata calls and migration
listing during this session, not an atomic database dump. Its source commit
identifies reviewed code, not the deployed application SHA. No customer rows,
session values, passwords, keys or storage objects were read.

## Observations

| Surface | Observation | Limit |
|---|---|---|
| public | 24 tables; RLS enabled, client SELECT/INSERT/UPDATE/DELETE/TRUNCATE false; 261 columns, 59 constraints | Does not establish server authorization |
| public routines/views | No public functions, views, materialized views or custom triggers found | Other configured exposed schemas remain to be confirmed |
| sequences | 23 grant USAGE and UPDATE to both client roles | Still a follow-up for reviewed T006 migration; no HTTP exploit asserted |
| creator defaults | Client sequence/function defaults remain; supabase_admin table defaults include client grants | New-object privileges must be explicit for each creator |
| Storage | No buckets or policies observed | Managed tables retain grants; RLS and HTTP paths are separate controls |
| Realtime | No public publication membership or policies observed | Managed realtime.subscription has client SELECT with RLS off; exposure/channel behavior untested |
| migrations | Only 20260829155420_remote_schema registered | No blind replay or production apply |
| SQL role anon | SELECT 1 FROM public.users LIMIT 0 returned 42501 | No rows requested; proves only this SQL role/table operation |
| SQL role authenticated | Same read-only query returned 42501 | Does not exercise JWT, account ownership or HTTP routing |

For both denial probes the transaction was READ ONLY with SET LOCAL ROLE.
The permission error is the expected evidence; its GRANT hint was not followed.

The observer role is postgres with BYPASSRLS. This is the MCP metadata connection,
**not evidence of the deployed application's database role**. The inspected
`apps/web/lib/db.ts` blob `b0b09ce6efae95707f80ecff04382bb8b65fd1a2`
uses a pg Pool from DATABASE_URL. The browser/server Supabase clients use public
configuration (blobs `cb9ca4f15f8b79ce973869a3f7bbdd1e1edf6233` and
`d4d8fd314ff23a3cd2082713ab9829c1db5e8936`). Source alone does not tell whether
these clients are activated in the deployment, or the runtime role encoded in
its secret. Inspect it from the application connection without printing secrets.

## Repeatability and checks

- SQL collector: `tests/security/sec-b-inventory.sql` (metadata only). Supply a
  read-only connection and bounded statement timeout. Capture configuration from
  the actual deployed control plane separately.
- Evidence: `docs/delivery/evidence/schema-inventory-2026-10-26.json`.
- Offline analysis: `node tests/security/sec-b-inventory.mjs docs/delivery/evidence/schema-inventory-2026-10-26.json`.
- Regression suite: `node --test tests/security/sec-b-inventory.test.mjs`.
  12/12 passed locally on Node v24.11.1. Cases include unknown privileges,
  missing/duplicate objects, wrong project, RLS/table/column regressions,
  callable definer and invoker functions, client BYPASSRLS, views, public
  buckets, publications and absent API configuration.
- The analyzer always emits `accepted:false`. Passing offline tests validates
  the analyzer, not deployed authorization, migration safety or full SEC-B.
- Docker is installed locally but its Linux daemon is unavailable. No
  disposable migration replay or real HTTP/GraphQL/Storage/Realtime write,
  cross-account or revoked-token test was executed.

## Work Ekwip handoff

Use `docs/delivery/contracts/S001-SEC-B.json` as the proposed task contract.
The parent plan source remains `2854038dfe653289c326dd33650a311918f630ad`.
Register test/source blob pins in the platform's protected verifier separately;
this product PR does not change qualification or acceptance policy. Do not use
SEC-A's protected check for SEC-B.

Remaining evidence: deployed Data API exposure, actual application/migration
roles, exhaustive application interface mapping, reviewed baseline diff,
disposable integration tests and independent acceptance. Missing SQL
`pgrst.db_schemas` remains UNKNOWN. Existing public table denial must not be
"repaired" with broad grants. Storage and Realtime managed objects require their
own review; do not blindly revoke their platform permissions.

SEC-A remains untouched at accepted commit
`b8911d6c2d3a1343a22ba2aca462608ab0c9ec12` (PR #134).
This work neither completes T004-T008 nor authorizes T013. Old-token denial
belongs to SEC-C/T010. No version of the application is declared testable by this
metadata-only increment.

Official guidance consulted 2026-10-26:
[Data API security](https://supabase.com/docs/guides/api/securing-your-api)
(grants and RLS are distinct; PostgREST pre-request hooks do not cover other
products), and [Supabase changelog](https://supabase.com/changelog).


## Rebuilding the composite snapshot

The SQL file produces **two separate result objects** named `inventory` and
`structure`; neither is directly accepted by the analyzer. For a new capture:

1. Confirm the target project is `fitnest-db`, ref `blboseqvdmpdrthipxdk`.
   Record the reviewed product commit separately from the deployed application
   commit. Do not copy a previous capture timestamp or assert deployment parity.
2. Run the collector using a read-only connection with a statement timeout.
   Export the JSON value of the first row's `inventory` field into
   `inventory.json`, and the JSON value of the second result's `structure`
   field into `structure.json`. These files must contain the objects themselves,
   without connector wrappers, markdown fences, or SQL-result array envelopes.
3. In the same capture session, use the read-only migration listing tool, or
   `SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version`.
   Save its array of version/name objects as `migrations.json`. A failed or
   unavailable listing is UNKNOWN; never substitute an empty array or old list.
4. Assemble the three captures with the script below. Supply the exact reviewed
   commit as the fourth argument. The timestamp remains the database's first
   metadata query timestamp; the composite is not an atomic dump.
5. Run the analyzer on the output. Retain separately timestamped real-role probe
   results, deployed API configuration, and runtime-role evidence if obtained.
   Do not copy the two 26 October denial observations into a fresh capture.

Save this standalone assembly snippet as a temporary `assemble-sec-b.cjs`
outside the published evidence directory:

```js
const fs = require('node:fs');
const [inventoryPath, structurePath, migrationsPath, sourceCommit, outputPath] =
  process.argv.slice(2);
if (!outputPath || !/^[a-f0-9]{40}$/.test(sourceCommit || ''))
  throw new Error('Usage: node assemble-sec-b.cjs inventory.json structure.json migrations.json SOURCE_SHA output.json');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const inventory = read(inventoryPath);
const structure = read(structurePath);
const migrations = read(migrationsPath);
if (!inventory || Array.isArray(inventory) || !inventory.captured_at ||
    !structure || Array.isArray(structure) || !Array.isArray(structure.columns) ||
    !Array.isArray(migrations))
  throw new Error('Export normalized inventory/structure objects and migrations array');
const snapshot = {
  ...inventory, ...structure,
  project: 'fitnest-db',
  project_ref: 'blboseqvdmpdrthipxdk',
  source_commit: sourceCommit,
  source_commit_scope: 'reviewed code; deployment not asserted',
  migrations,
  role_probes: [],
  limitations: [
    'Composite capture from separate read-only queries, not an atomic dump',
    'Data API configuration and application runtime role require separate evidence',
    'No runtime or task acceptance is implied by this assembly'
  ]
};
fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2) + '\n', {flag: 'wx'});
```

Example (replace SOURCE_SHA with the observed 40-character reviewed commit):

```text
node assemble-sec-b.cjs inventory.json structure.json migrations.json SOURCE_SHA new-snapshot.json
node tests/security/sec-b-inventory.mjs new-snapshot.json
```

The dedicated `SEC-B inventory regression` workflow is delivery-support CI,
outside the current SEC-B task's docs/tests/specs output scope. It must be
reviewed as such, not silently added to the registered executor's task allowlist.
It exercises only offline analysis on the exact checked-out commit. It does not
register a protected Ekwip verifier or claim full SEC-B acceptance.

