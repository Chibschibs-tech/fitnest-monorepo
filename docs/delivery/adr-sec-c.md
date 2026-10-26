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
email established before the server-recorded risk event, itself no later than the challenge. verifiedAt means historical email
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
51 tests. Runtime qualification additionally needs a disposable pinned Auth stack:
two accounts/devices, old and refreshed JWT after targeted and bulk revocation,
idle/absolute exact boundaries without refresh, rotation plus both provider reuse
exceptions and non-parent replay, actual exposed paths/roles, concurrent proof
consumption, failed lookup, audit/outbox atomicity and absence of token/PII logs.
Record commit, versions, commands, observed denials and protected CI artifact hashes.
S001-SEC-C is a contract task: its source outputs are ADR and isolated acceptance
fixtures. Its design contract can be accepted after attributable independent review,
protected fixture CI at the exact commit, scope review and a registered contract receipt.
Reference CI alone is insufficient because it supplies neither independent review nor
integration/acceptance. Provider-backed runtime certification belongs to T006/T010/
T029/T031/T032; absence of those later runtime proofs does not silently redefine
SEC-C as an implementation task. Design acceptance never certifies runtime or clears
G-SESSION/G-RECOVERY/T013. See contract.acceptanceScope and designObligations.

## Execution profile handoff

Run: node --test tests/security/session-reference.test.mjs.
Executor allowedFiles are the five SEC-C docs/tests files, including the supplemental
obligations manifest. The dedicated CI workflow is separate supporting infrastructure,
not a task output or executor-allowed change. Tests are product assertions; Ekwip must independently review and pin
their blobs as protected checks before adopting evidence. Contract status remains
proposal; no acceptance receipt is inserted or implied. Blocked existing dispatch
40243859069 is owned by Work Ekwip; no new dispatch is requested here.
Coordination: Ekwip PR45 and Fitnest work journal PR135.



## Source-to-proof coverage

The contract maps SEC-C-01 through SEC-C-08 to SEC-03/04/29, accepted SEC-A,
the clarification gates and consuming task IDs. The six composed synthetic scenarios
exercise targeted/bulk plans, old and refreshed credentials, unchanged unrelated devices,
absolute expiry despite refreshed credentials, refresh exceptions with revoked/risky
application records, replay denial and foreign session identifiers. The harness changes
synthetic records explicitly; it does not substitute for a real database transaction.

For contract acceptance, the independent reviewer must review requirement coverage
and the fixtures themselves, not just the test count. Ekwip pins the reviewed test/model
blobs before adopting the exact CI result, records the review and integration links,
then writes the attributable contract receipt through its normal acceptance mechanism.
The profileHandoff is a proposal, never a self-registered policy or self-issued receipt.

## Atomic audit and notification transaction

Proposed server transaction for T029/T031, not implemented by this design fixture:
lock the owning account/session enrollment boundary; reread token-linked provider
and application state, owner, time bounds and risk; validate the completed proof;
atomically claim its unique proof/operation ID; choose and lock scoped targets;
mark targets revoked; append the audit record and generic notification outbox intent;
commit. A failed prerequisite or database error rolls back every effect. Return
success only after commit. Same operation retry returns its committed outcome;
reuse of the proof for a different operation is denied.

Use a consistent account-before-session lock order. Bulk revocation linearizes at
the locked target selection and commit. Enrollment competes on that same account
boundary; a subsequently enrolled session begins without inherited risk clearance.
Absolute lifetime always retains its original server creation time. No preflight
result can be applied later without repeating these checks inside the transaction.

Audit fields proposed: operation ID, stable account/actor ID, action, target session
IDs, proof reference (not proof contents), server timestamp and result. Notification
outbox carries a generic account-security event to a previously trusted channel,
keyed by operation/account/channel for deduplication. Neither audit nor outbox stores
raw tokens, OTP, email, phone, health or delivery history. Restrict audit reads to
authorized staff scope; never expose it through client direct access. Provider send
runs after commit with deduplication and bounded retries; delivery failure cannot
undo revocation or silently discard the pending intent.

The fixture emits required-effect flags and simulates subsequent authorization.
It does not prove concurrent consumption, transaction isolation, audit/outbox
durability or notification delivery. T029/T031 qualify those runtime guarantees
using actual database roles and failure/race injection; their absence is not a
hidden claim of runtime success in this prerequisite design contract.

## No production writes

This task proposes design and executes isolated in-memory fixtures only. It changes
no provider-owned auth table, deployed application route, production policy, schema,
service or acceptance receipt. SEC-A accepted code and receipt remain untouched.
The executor candidate scope is exact docs/tests deltas including both SEC-C JSON
contracts and ADR/model/tests; any specs delta would require explicit scope review.
The dedicated CI workflow is supporting infrastructure, excluded from executor
candidate allowedFiles and reviewed separately.

The independent reviewer must inspect the exact patch and command environment,
rather than treating this statement or JSON flags as an attestation. No new budget,
gate approval or production authorization follows from a contract receipt. Runtime
integration and any production operation retain the consuming task's controls.

