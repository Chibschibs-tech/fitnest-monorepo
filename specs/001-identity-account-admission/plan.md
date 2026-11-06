# Implementation Plan — Identity, Account & Admission

Baseline 2026-10-18; base commit 99d5e2f. [Spec](spec.md), [security](../../docs/delivery/security-requirements.md), [full backlog](../../docs/delivery/backlog.json).

## Architecture and delivery boundary

TypeScript strict, Next.js acquisition/queue/checkout, shared versioned contracts and server domain modules, Supabase Auth/PostgreSQL with migrations as single canon. Native React Native/Expo screens are delivered by 004/LOT-09/10; web-only 001 does not authorize a web subscriber portal. Separate 003 staff permissions/TOTP precede any new staff route. Durable workers handle operational side effects; runtime secrets never enter client bundles.

001 covers stable identity, admission, attribution, append-only wallet foundation and cohort contracts. T001–T048 retain their identifiers. T033/T038/T045 become explicit native UI handoffs, remaining acceptance obligations in full V1. Delivery reward integration uses a verified delivery event, not an arbitrary account-only manual success declaration.

## Execution order and gates

1. T001–T003 establish compatible pinned test tooling and isolated local auth fixtures.
2. S001-SEC-A/B/C prepare threat model, exposed-schema inventory, supported revocation/recovery ADR and tests. G-SESSION resolves the 001/004 device-count conflict. Suggested duration proposal for ADR review: access 10 minutes, inactivity 30 days, absolute 90 days; these are not already approved settings and must be qualified for the actual provider/plan.
3. T004–T012 draft schema/triggers/policies/seeds, exercise local migrations, build reusable boundaries and time contracts. Safe staff guard depends on 003; no interim legacy route is exposed. Correct auth/RLS design precedes new public client access.
4. T013 presents the concrete migration files, diff, data impact, local test results and restore/rollback procedure to the founder. **Explicit approval remains required; no 001 phases 3–8 begin before it passes.** General permission to develop is not a production-apply decision.
5. After that gate, implement stories and their negative/concurrency tests under the dependency manifest, then T046–T048 verify cohorts and CI. Contract acceptance allows fixture work; it is not integrated-runtime proof.

## Data and contracts

See data-model.md for proposed tables and unresolved migration design. The live schema must be inventoried before changing legacy bridge columns; old statements of no real customers are historical, not a present deletion authorization. All financial amounts have exact units; transaction/idempotency keys and locks are explicit. No SQL is run by this baseline PR.

Guard validates token, live session/time bounds, risk clearance, owner and permission. API-only domain access is the preferred least-exposure design; every exposed direct exception requires the same guarantees. Verified-email service is a public-auth prerequisite; unavailable proof cannot fall back to disclosure.

## Performance and operational budget

Qualify 5,000 subscriber records and 500 active concurrent users, with mixed claim/day-read/publication/renewal workload. Proposed initial API day-read p95 target: 500 ms in staging; report environment, payload, throughput, error rate and queue lag. This is a target, not measured capacity. Each implementation PR states calls per screen, indexes/query plan, lock scope, pagination, retry limits and recovery path. Queue positions are queried in batches with stable ordering; paginated wallet/history avoid unbounded payloads; large queue-disable transitions need a measured atomic design.

## Constitution check — evidence pending

No PASS stamp is granted merely for a design. I/III/VI/XII: scope and source traceability preserved. II: proposed migration and T013. IV/V/VIII/X/XIV: alignment tracked in governance.md and constitution PR #5. VII/IX: append-only ledger and immutable cohort tests required. XI: strict types, real database integration CI, secrets/dependency checks and review required. XIII: unresolved arbitration remains explicit. Staff legacy exception is retired for new delivery; historic test access is separately inventoried.

## Required proof

SEC-01–04, SEC-26/27 and SEC-06/08/29–32 are integrated, not certified. Quickstart specifies the acceptance run. Admission cap and referral cap tests use concurrent real transactions; revoked JWT tests include direct APIs; protected individual/bulk disconnects share proof requirements. T013 and public-release gates stay separate from local checks.
