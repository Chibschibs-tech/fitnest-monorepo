# S001-SEC-B — actual schema and privilege inventory

Read-only inspection of `fitnest-db`, 2026-10-18 at 14:41 UTC. Evidence:
[metadata snapshot](evidence/schema-inventory-2026-10-18.json),
[repeatable queries](../../tooling/security/schema-inventory.sql).
No customer rows, passwords, session values or provider credentials were read.
No migration, grant change or data mutation was applied.

## Findings and required implementation

| Evidence | Consequence | Required follow-up |
|---|---|---|
| 24 public tables, 261 columns, 59 constraints; RLS enabled on every table | Existing table closure must be preserved | T006 defaults deny; explicit reviewed exception only |
| No effective SELECT/INSERT/UPDATE/DELETE/TRUNCATE privileges for `anon`/`authenticated`; no column grants or public RLS policies | The examined client roles cannot directly access these tables | Do not add broad grants/policies to silence the informational advisor |
| No public views/functions/custom triggers | No such bypass observed in this schema snapshot | Inventory again after every migration, including SECURITY DEFINER and invoker views |
| 23 public sequences grant USAGE and UPDATE to both client roles | Table grants alone do not close every SQL object | Revoke unneeded sequence grants/defaults in a reviewed migration; qualify runtime inserts and sequence ownership first |
| `supabase_admin` default table grants include client roles; default function EXECUTE and sequence privileges also include them | Future objects created by a different owner could become reachable | Inventory actual migration owner; make every migration's grants explicit; test effective privileges including PUBLIC inheritance |
| Only `20260829155420_remote_schema` is registered remotely | The repository's `20260829160000...` migration is not recorded | Reconcile before replay/push; do not mark a migration applied without checking its exact effects |
| Live `meal_type_prices.plan_name` remains NOT NULL | The nullable-plan migration's intended effect is absent | Confirm business usage/impact before separately approving the change |
| `users.id`, `subscriptions.user_id` are legacy integers; `users.auth_id` is nullable UUID | New account UUIDs need a deliberate bridge | Additive FK/backfill plan; never substitute UUIDs into legacy integer relationships |
| Legacy subscription/session dates are timestamp WITHOUT time zone | An automatic cast can silently shift historical dates | Establish original timezone semantics, then test an explicit conversion plan |

The sequence finding does **not** prove an anonymous HTTP exploit: no public RPC
was found and effective API exposure still needs a route test. The table snapshot
does **not** certify application authorization: a server using owner/service-role
access can bypass RLS and must enforce access itself.

Supabase's `rls_enabled_no_policy` advisor returned 24 informational findings.
For intentionally server-only tables, absence of a policy is expected; opening
policies just to clear the warning would be a regression.
[Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Acceptance still required before closing security gates

1. Confirm deployed Data API exposed schemas, storage permissions and the actual
   application runtime database role. The SQL role settings did not reveal the
   API schema configuration; do not infer it from the absence of a setting.
2. Replay reviewed migrations on disposable PostgreSQL/Supabase with matching
   roles and qualify denied operations through real client roles/API paths.
3. Compare repository dump against the live structure; no blind repair/push.
4. Prove old JWT denial after revocation for every supported domain path, including
   any approved direct data exception; this belongs to S001-SEC-C/T010.

This inventory is evidence for review, not approval of T004–T008 or T013.
