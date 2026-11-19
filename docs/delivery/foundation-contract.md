# Foundation contract — B01-C / 001 setup

Status: implementation proposal under review, 2026-10-18. This contract does not
approve production migrations, resolve G-SESSION or certify the whole application.

## Runtime and first executable increment

The existing web application is Next.js 14.2.16 / React 18; the native skeleton is
Expo 51 / React Native 0.74.5. These are observations, not release recommendations.
Both application upgrades require their own compatibility/security qualification.
The native directory is currently absent from the root pnpm workspace; adding it
requires a separate dependency resolution and device build, not just a YAML edit.

For foundation tests, use Node **24.19.0**, pnpm **9.15.9**, Vitest **5.0.5** and
TypeScript **5.9.3**, pinned in the workflow/manifest. The existing production build
workflow is not silently migrated to this runtime. Supabase JS **2.110.7** and SSR
**0.5.2** are pinned to their existing resolved lockfile versions; this does not
certify SSR/session behavior or constitute an SDK upgrade.

Commands from the repository root:

```sh
pnpm install --frozen-lockfile --ignore-scripts --filter fitnest-monorepo --filter @fitnest/core
pnpm test:core
pnpm typecheck:core
```

The root `pnpm test` discovers core and web unit tests. Integration/e2e suffixes
are explicitly excluded from that unit command and must have separate jobs. Empty
unit suites fail. The package-local core test command resolves the root config.
Do not interpret unit-test success as database, browser or mobile acceptance.

## Module boundaries

- `@fitnest/core`: pure, deterministic functions/contracts. No framework, database,
  environment variable, network call, provider secret or implicit current time.
- Web/native: input, display and API clients. A client calculation is advisory;
  server authorization and authoritative pricing/calendar validation run again.
- Server domains: authenticated owner/permission, validated inputs, transaction,
  constraints, idempotency and a durable outbox event in the same transaction.
- Workers: claim persisted work, use bounded retries and idempotent effects,
  record outcomes, expose unresolved exceptions for operations. No fire-and-forget
  payment, reward, notification or meal-generation work in a request handler.

The D-058 time module is a pure executable foundation prototype. It receives an
explicit `Date` from the caller and returns Casablanca business date and ISO-week
boundaries. The route/transaction must supply the **server/database** instant.
One transaction uses one time anchor. Store UTC instants in `timestamptz`, use local
dates for consumption-day labels, and query half-open intervals `[start, end)`.
Do not add seven 24-hour periods to find the next local week; Ramadan transitions
produce 167/169-hour weeks. Native rendering still needs device qualification.
T012 remains incomplete: identity/referral/wallet scaffolding depends on the local
schema review; no ledger representation or unit scale is invented here.

## Proposed shared API and event conventions

These conventions are to be made concrete in each domain contract before coding
its route. Existing routes are not rewritten by this foundation change.

| Concern | Contract |
|---|---|
| Result | Versioned DTO; stable machine error code; request ID; FR/EN text in presentation layer; no SQL/provider errors returned |
| Authorization | Verified token plus live session, expiry/risk clearance, resource ownership and staff permission where applicable |
| Concurrent edit | Expected resource/config version; stale edit returns a conflict and the client reloads |
| Retryable mutation | Server-owned operation ID/idempotency key, bound to actor and canonical request; same key/different payload is rejected |
| Money | Explicit currency and integer minor units; server quote version; wallet unit is data, never a closed enum |
| Domain event | Event ID/type/version, aggregate ID/version, UTC occurrence time, correlation ID and minimal payload |
| Outbox | Persist with business commit; lease/attempt/next-attempt/outcome; unique consumer receipt; do not assume exactly-once network delivery |
| Unknown payment result | Reconcile provider state; do not repeat the charge because a request timed out |

Concrete constraints, event schemas, lock order and service ports belong to the
owning slice and are reviewed before its implementation is eligible. No generic
event bus or extra microservices are introduced just for these conventions.

## Environments and database ownership

Local/CI are disposable and use synthetic data. Staging has separate provider
sandbox credentials and deployment configuration. Production is never a test
fixture. `NEXT_PUBLIC_` contains only public configuration; service-role secrets
are server-only. `.env.example` holds placeholders, not functional credentials.

`supabase/migrations/` is the migration canon. Existing Drizzle scripts are legacy,
not an alternative migration path. Inventory the real schema and reconcile history
before drafting changes. Use additive nullable bridges and backfill verification;
do not relabel legacy timezone-less timestamps without establishing their meaning.
Do not delete legacy identity/customer rows on the basis of historical statements.

T013 requires the concrete migration diff, privileges/constraints, data impact,
local tests and restore/rollback procedure before explicit founder arbitration.
Application rollback must remain compatible with the previous schema while an
additive change is rolling out. Irreversible changes require a tested restore or
forward-repair procedure, not a fictional automatic down migration.

## Local Auth qualification (T003)

`supabase/config.toml` was generated by CLI **2.121.0** and configured with two
local test-phone OTPs. CLI preflight showed that it disables phone login without an
enabled provider; the config therefore uses an inert Twilio placeholder, with no
real credentials. Mapped test phones bypass SMS dispatch. The fixture command refuses a
cloud URL. Fixed codes must never be copied into a hosted project. Provider defaults
in this local fixture do not decide G-SESSION session lifetimes or device policy.

The `Identity foundation` workflow has a disposable Auth job separate from the
core job. It copies config into a temporary project, boots Supabase, tests wrong
OTP rejection and two separate identities, and removes the stack and credential
file. It intentionally does not copy legacy migrations: this qualifies Auth setup,
**not T008 database migration replay**. T008 will use the repository migrations.

Docker is absent in the current editing environment. The local Auth test is
therefore prepared but not claimed as passed. The CI result must be read before
closing T003. Session revocation, phone recycling, recovery and staff TOTP remain
separate acceptance obligations, even if phone OTP succeeds.

## Documentation checked

- [Vitest guide](https://vitest.dev/guide/): test discovery and supported runtime.
- [Supabase changelog](https://supabase.com/changelog): reviewed 2026-10-18;
  TLS cipher deprecation and PostgreSQL minor upgrades require deployment follow-up.
- CLI `init`, `start` and `stop` help at pinned version, rather than guessed flags.
