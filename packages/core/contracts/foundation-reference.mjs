// B01-C foundation design reference fixture.
//
// This module is an isolated, executable design qualification for the B01-C
// protected-design criterion. It encodes synchronous pure decisions only; it
// performs no I/O, imports no application infrastructure, uses no clocks,
// writes no files, spawns no processes and makes no network calls. Inputs are
// treated as authoritative synthetic server records, never as client claims.
//
// Status: proposal. runtimeAcceptance=false. productionReady=false.
// No production writes, live authority or acceptance claim is implied.

export const CRITERION = Object.freeze({
  schemaVersion: 1,
  taskKey: 'B01-C',
  sourceSha: '2854038dfe653289c326dd33650a311918f630ad',
  status: 'proposal',
  runtimeAcceptance: false,
  productionReady: false,
  preservedGates: Object.freeze(['G-CONSTITUTION', 'G-RECOVERY', 'G-SESSION', 'G-T013']),
  api: Object.freeze({
    contractVersion: 1,
    actorAuthority: 'server',
    errorFields: Object.freeze(['version', 'requestId', 'code']),
    errorCodes: Object.freeze(['DENIED', 'CONFLICT', 'INVALID', 'UNAVAILABLE']),
    versioned: true,
    serverAuthorizationEveryChannel: true,
    oldClientCannotBypassRules: true,
    rawErrorsAllowed: false,
  }),
  outbox: Object.freeze({
    eventFields: Object.freeze([
      'eventId',
      'eventType',
      'eventVersion',
      'aggregateId',
      'aggregateVersion',
      'occurredAt',
      'correlationId',
      'payload',
    ]),
    lockOrder: 'tenant-rank-resource',
    sameTransaction: true,
    delivery: 'at-least-once',
    consumerReceiptsUnique: true,
    unknownExternalOutcome: 'reconcile',
  }),
  idempotency: Object.freeze({
    bindingFields: Object.freeze(['tenant', 'actor', 'operation', 'key', 'payloadHash']),
    decisions: Object.freeze(['create', 'replay', 'wait', 'reconcile', 'conflict', 'reject']),
  }),
});

const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isSafeNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

// authorize: true only when identity is verified, the session is live, the
// permission is known and granted, the API version is supported, and all
// tenant/actor/resource identities are nonempty server-derived safe strings.
// Cross-tenant access is unconditionally denied. Cross-owner access is allowed
// only when staffScopeGranted is explicitly true.
export function authorize(input) {
  if (!input || typeof input !== 'object') return false;

  const {
    identityVerified,
    sessionLive,
    permissionKnown,
    permissionGranted,
    actorTenant,
    resourceTenant,
    actorId,
    ownerId,
    staffScopeGranted,
    apiVersionSupported,
  } = input;

  if (
    !isNonEmptyString(actorTenant) ||
    !isNonEmptyString(resourceTenant) ||
    !isNonEmptyString(actorId) ||
    !isNonEmptyString(ownerId)
  ) {
    return false;
  }

  if (
    !SAFE_ID_RE.test(actorTenant) ||
    !SAFE_ID_RE.test(resourceTenant) ||
    !SAFE_ID_RE.test(actorId) ||
    !SAFE_ID_RE.test(ownerId)
  ) {
    return false;
  }

  if (identityVerified !== true) return false;
  if (sessionLive !== true) return false;
  if (apiVersionSupported !== true) return false;
  if (permissionKnown !== true) return false;
  if (permissionGranted !== true) return false;
  if (actorTenant !== resourceTenant) return false;
  if (actorId !== ownerId && staffScopeGranted !== true) return false;

  return true;
}

// idempotency: returns one of create|replay|wait|reconcile|conflict|reject.
// The idempotency key is bound to tenant, actor, operation, key and payloadHash.
// A fresh request (no existing record) creates. A completed binding replays, a
// pending binding waits and an unknown-provider-outcome binding reconciles. A
// reused key whose binding differs in any field (including the key itself)
// conflicts. Malformed input rejects. Unknown provider outcomes never authorize
// a duplicate effect.
export function idempotency(input) {
  if (!input || typeof input !== 'object') return 'reject';

  const { request, existing } = input;
  if (!request || typeof request !== 'object') return 'reject';

  const { tenant, actor, operation, key, payloadHash } = request;

  if (
    !isNonEmptyString(tenant) ||
    !isNonEmptyString(actor) ||
    !isNonEmptyString(operation) ||
    !isNonEmptyString(key) ||
    !isNonEmptyString(payloadHash)
  ) {
    return 'reject';
  }

  if (!SAFE_ID_RE.test(tenant) || !SAFE_ID_RE.test(actor) || !SAFE_ID_RE.test(operation)) {
    return 'reject';
  }

  if (existing === null || existing === undefined) return 'create';
  if (!existing || typeof existing !== 'object') return 'reject';

  if (
    existing.tenant !== tenant ||
    existing.actor !== actor ||
    existing.operation !== operation ||
    existing.key !== key ||
    existing.payloadHash !== payloadHash
  ) {
    return 'conflict';
  }

  const STATE_DECISION = {
    complete: 'replay',
    pending: 'wait',
    unknown: 'reconcile',
  };
  const decision = STATE_DECISION[existing.state];
  return typeof decision === 'string' ? decision : 'reject';
}

// outbox: returns deliver|skip|reconcile|reject.
// Delivery is allowed only after the business commit and outbox persistence
// have happened in the same transaction, the event identity/version is valid,
// no consumer receipt already exists, and the external outcome is not ambiguous.
export function outbox(input) {
  if (!input || typeof input !== 'object') return 'reject';

  const {
    businessCommitted,
    outboxPersisted,
    sameTransaction,
    eventId,
    eventVersion,
    consumerReceiptExists,
    externalOutcome,
  } = input;

  if (!isNonEmptyString(eventId) || !SAFE_ID_RE.test(eventId)) return 'reject';
  if (!Number.isSafeInteger(eventVersion) || eventVersion < 1) return 'reject';

  if (businessCommitted !== true || outboxPersisted !== true || sameTransaction !== true) {
    return 'reject';
  }

  if (consumerReceiptExists === true) return 'skip';

  if (externalOutcome === 'ambiguous' || externalOutcome === 'unknown') {
    return 'reconcile';
  }

  return 'deliver';
}

// environment: true only for a disposable local or CI qualification fixture that
// uses synthetic data, sandbox providers and credentials scoped to that exact
// environment. Production (or any other environment name) is not a fixture and
// is always false.
export function environment(input) {
  if (!input || typeof input !== 'object') return false;

  const { environment, syntheticData, providerMode, credentialsEnvironment } = input;

  if (environment !== 'local' && environment !== 'ci') return false;
  if (syntheticData !== true) return false;
  if (providerMode !== 'sandbox') return false;
  if (credentialsEnvironment !== environment) return false;

  return true;
}

// migration: returns "eligible" or "blocked". Eligible only when history is
// reconciled, isolated restore is tested, erasure replay is planned, the change
// is backward compatible, the change is not destructive, and production changes
// additionally have recorded founder approval. This fixture blocks destructive
// changes unconditionally.
export function migration(input) {
  if (!input || typeof input !== 'object') return 'blocked';

  const {
    historyReconciled,
    restoreTested,
    erasureReplayPlanned,
    backwardCompatible,
    destructive,
    production,
    founderApproved,
  } = input;

  if (historyReconciled !== true) return 'blocked';
  if (restoreTested !== true) return 'blocked';
  if (erasureReplayPlanned !== true) return 'blocked';
  if (backwardCompatible !== true) return 'blocked';
  if (destructive === true) return 'blocked';
  if (production === true && founderApproved !== true) return 'blocked';

  return 'eligible';
}

// lockOrder: returns unique [rank,id] tuples for a single tenant, sorted
// ascending by rank then id, or null for invalid or cross-tenant input.
// Ranks must be nonnegative safe integers and ids must be nonempty strings.
export function lockOrder(input) {
  if (!input || typeof input !== 'object') return null;

  const { tenant, locks } = input;
  if (!isNonEmptyString(tenant)) return null;
  if (!Array.isArray(locks) || locks.length === 0) return null;

  const seen = new Set();
  const tuples = [];

  for (const lock of locks) {
    if (!lock || typeof lock !== 'object') return null;
    if (lock.tenant !== tenant) return null;

    const id = lock.id;
    const rank = lock.rank;

    if (!isNonEmptyString(id)) return null;
    if (!isSafeNonNegativeInteger(rank)) return null;

    const signature = `${rank}\0${id}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    tuples.push([rank, id]);
  }

  tuples.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1].localeCompare(b[1]);
  });

  return tuples;
}

// apiError: returns exactly {version:1, requestId, code}. The allowed codes are
// DENIED, CONFLICT, INVALID and UNAVAILABLE; any unknown code is mapped to
// UNAVAILABLE. The internal error object is never reflected.
export function apiError(input) {
  if (!input || typeof input !== 'object') {
    return { version: 1, requestId: 'invalid', code: 'UNAVAILABLE' };
  }

  const { requestId, code, error } = input;
  const validCodes = CRITERION.api.errorCodes;
  const normalized = validCodes.includes(code) ? code : 'UNAVAILABLE';
  const rid = typeof requestId === 'string' ? requestId : 'invalid';

  // `error` is intentionally ignored so secrets, SQL, tokens, phones and health
  // data never leak through the API boundary.
  void error;

  return { version: 1, requestId: rid, code: normalized };
}
