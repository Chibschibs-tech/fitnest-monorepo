# S001-SEC-C - Bounded sessions and immediate application revocation

Status: design proposal with isolated executable fixtures, not runtime acceptance.
Source plan: 2854038dfe653289c326dd33650a311918f630ad.
SEC-A PR134 / b8911d6c2d3a1343a22ba2aca462608ab0c9ec12 is preserved.

## Decision proposed

Keep Supabase as token issuer. Add a server-owned, non-public application session
record indexed by provider session_id and stable auth subject/account. Store creation
time, last authorized activity, revocation and risk-clearance state, never raw tokens.
A verified JWT alone, getUser alone, or a surviving auth.sessions row is insufficient.

Every domain API checks verified issuer/audience/signature/expiry, provider session
existence with matching subject, application revocation, absolute and idle bounds,
risk clearance and resource ownership. Server time is authoritative; absence,
lookup failure or malformed values deny. No positive cache may outlive revocation.
Successful authorized activity may advance idle time, never absolute creation time.
Refresh is followed by the same gate; it cannot clear a revoked or risky session.

The fixture's token.verified and providerSession.lookup are synthetic authoritative
server observations, not fields accepted from a request body. Production must build
them from real verification and a server-only database lookup. Exact issuer/audience,
key rotation and signature validation remain real-stack qualification requirements.

## Supported targeted revocation boundary

List only owner-scoped application records through the API, returning a minimal
projection. Targeted revocation writes application revocation state. No unsupported
signOut(session_id) and no direct writes to provider-owned auth tables are proposed.
Provider sign-out scopes are a separate supported operation, not the immediate
Fitnest revocation guarantee. A target's still-valid or refreshed provider token
continues to fail the application gate.

For single and bulk revoke, require a completed independent step-up against an
email established before the challenge. verifiedAt means historical email
verification; challengeVerifiedAt means successful completion of this fresh proof,
not merely dispatch. Bind proof to account, exact action/target and operation ID.
Reject absent, future, expired, consumed or wrong-action evidence. Phone OTP is
insufficient. Production must atomically recheck current ownership/liveness, consume
proof, apply all target revocations and append audit plus security notification intent.
The fixture is preflight only and does not claim transaction or concurrent replay safety.
Bulk serialization must define its linearization point against new sessions;
a session enrolled after a revoke cannot inherit stale clearance.

## Direct exposure

Default deny REST, GraphQL, RPC, realtime and storage domain access.
The fixture denies these channels by design, not by proving their deployed grants.
SEC-B/T006 must inventory every actual exposed legacy/new channel and test actual
anon/authenticated/runtime credentials. No direct exception can ship without the
same live-session/revocation/bounds/risk/owner predicate. Existing socket subscriptions,
download links and cached data need explicit invalidation tests; API denial alone is
not enough. No privileged client key; no authorization from user_metadata.

## Provider evidence and limits

Official sources consulted 2026-10-26:
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/docs/guides/auth/signout
- https://supabase.com/docs/reference/javascript/auth-signout

Provider settings are evaluated at refresh and cleanup is delayed. Therefore
application bounds are checked on each request. Refresh reuse permits a documented
reuse interval and current-parent recovery exception; unexpected replay terminates
the provider session. The model only classifies independently verified observations,
never implements or certifies provider refresh rotation.

The changelog markdown endpoint could not be rendered by the documentation fetcher
(unsupported content type). Pin and inspect the actual Auth/CLI/package versions
and applicable changelog before runtime integration. No provider behavior, deployed
configuration, database privilege or distributed atomicity was verified in this change.

## Unresolved decisions and acceptance split

G-SESSION remains open: access/idle/absolute durations, risk thresholds, single-active
004 versus multi-device 001 policy, maximum devices and eviction policy.
The model requires an explicit finite policy; its small test numbers are synthetic,
not recommended or approved production defaults. G-RECOVERY retains assisted
recovery evidence, review and retention decisions. G-CONSTITUTION and T013 remain
unchanged. This design does not implement T010/T031/T032 or activate any public route.

Design acceptance needs independent review of this ADR, contract, exact diff and
42 tests. Runtime qualification additionally needs a disposable pinned Auth stack:
two accounts/devices, old and refreshed JWT after targeted and bulk revocation,
idle/absolute exact boundaries without refresh, rotation plus both provider reuse
exceptions and non-parent replay, actual exposed paths/roles, concurrent proof
consumption, failed lookup, audit/outbox atomicity and absence of token/PII logs.
Record commit, versions, commands, observed denials and protected CI artifact hashes.
Do not mark full S001-SEC-C accepted from reference-model CI alone.

## Execution profile handoff

Run: node --test tests/security/session-reference.test.mjs.
Allowed change paths are the four SEC-C design/fixture files plus its dedicated CI
workflow only. Tests are product assertions; Ekwip must independently review and pin
their blobs as protected checks before adopting evidence. Contract status remains
proposal; no acceptance receipt is inserted or implied. Blocked existing dispatch
40243859069 is owned by Work Ekwip; no new dispatch is requested here.
Coordination: Ekwip PR45 and Fitnest work journal PR135.

