// B01-I foundation runtime — deterministic core exports.
//
// This module is the shared, pure foundation contract for the Fitnest runtime.
// It contains no framework, database, environment variable, network call,
// provider secret or implicit current time. Inputs are treated as authoritative
// server records, never as client claims. All time authority is delegated to the
// accepted D-058 core/time utility, which maps an explicit server instant to
// Casablanca business dates and ISO-week boundaries.

import { businessDate, businessIsoWeek } from '../time/index.ts';

export { businessDate, businessIsoWeek };

export const ERROR_CODES = Object.freeze([
  'DENIED',
  'CONFLICT',
  'INVALID',
  'UNAVAILABLE',
]);

export const OK_CODE = 'OK';

// Server-authoritative facts that a client can never assert on its own behalf.
// Attempting to send any of these through a request body is an injection attempt
// and is rejected regardless of the declared field allow-list.
const INJECTION_KEYS = Object.freeze([
  'actorId',
  'tenantId',
  'actor',
  'tenant',
  'permissions',
  'sessionValid',
  'riskCleared',
  'lifetimeValid',
  'reauthenticated',
]);

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// validateRequest(value, {allowedFields, requiredFields, versions}) -> boolean.
// Accepts a single plain object body. Rejects arrays, unknown keys, missing
// required fields, actor/tenant injection attempts and unsupported versions.
export function validateRequest(value, options) {
  const opts = isPlainObject(options) ? options : {};
  const allowedFields = Array.isArray(opts.allowedFields) ? opts.allowedFields : [];
  const requiredFields = Array.isArray(opts.requiredFields) ? opts.requiredFields : [];
  const versions = Array.isArray(opts.versions) ? opts.versions : [1];

  if (!isPlainObject(value) || Array.isArray(value)) return false;

  const allowed = new Set(allowedFields);
  const injection = new Set(INJECTION_KEYS);

  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) return false;
    if (injection.has(key)) return false;
  }

  for (const field of requiredFields) {
    if (!Object.prototype.hasOwnProperty.call(value, field)) return false;
  }

  if (
    Object.prototype.hasOwnProperty.call(value, 'version') &&
    !versions.includes(value.version)
  ) {
    return false;
  }

  return true;
}

// apiError({requestId, code, error}) -> exactly {version, requestId, code}.
// The internal error object is never reflected, so SQL, tokens, phones and
// health data cannot leak through the API boundary. Unknown codes are
// normalized to UNAVAILABLE.
export function apiError(input) {
  const requestId =
    isPlainObject(input) && typeof input.requestId === 'string'
      ? input.requestId
      : 'invalid';
  const code =
    isPlainObject(input) && ERROR_CODES.includes(input.code)
      ? input.code
      : 'UNAVAILABLE';
  return { version: 1, requestId, code };
}

function toEpoch(value) {
  return value instanceof Date ? value.getTime() : value;
}

// inInterval(instant, start, end) uses the half-open interval [start, end).
export function inInterval(instant, start, end) {
  const i = toEpoch(instant);
  const s = toEpoch(start);
  const e = toEpoch(end);
  if (![i, s, e].every(Number.isFinite)) return false;
  return i >= s && i < e;
}

const DAY_LABEL_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDayLabel(label) {
  if (typeof label !== 'string') {
    throw new RangeError('A valid YYYY-MM-DD consumption day is required');
  }
  const match = DAY_LABEL_RE.exec(label);
  if (!match) {
    throw new RangeError('A valid YYYY-MM-DD consumption day is required');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('A valid YYYY-MM-DD consumption day is required');
  }
  return date;
}

function formatDayLabel(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
}

// physicalDates(consumptionDay) -> {consumptionDay, productionDay, deliveryDay}.
// Production and delivery are both J-1 (the calendar day before consumption) and
// are always returned as separate, independent fields; they are never conflated
// into a single value.
export function physicalDates(consumptionDay) {
  const day = parseDayLabel(consumptionDay);
  const previous = new Date(day);
  previous.setUTCDate(previous.getUTCDate() - 1);
  const prior = formatDayLabel(previous);
  return {
    consumptionDay,
    productionDay: prior,
    deliveryDay: prior,
  };
}

// lockOrder([{tenantId, rank, resourceId}]) -> sorted unique locks or null.
// Validates a single tenant, nonempty tenant/resource ids and nonnegative safe
// integer ranks, deduplicates identical (tenantId, rank, resourceId) entries and
// returns the remaining locks sorted by tenant, then rank, then resource. Mixed
// tenants or any malformed lock return null.
export function lockOrder(locks) {
  if (!Array.isArray(locks) || locks.length === 0) return null;

  const first = locks[0];
  if (!isPlainObject(first) || typeof first.tenantId !== 'string' || first.tenantId.length === 0) {
    return null;
  }
  const tenantId = first.tenantId;

  const seen = new Set();
  const ordered = [];

  for (const lock of locks) {
    if (!isPlainObject(lock)) return null;
    if (lock.tenantId !== tenantId) return null;
    if (typeof lock.tenantId !== 'string' || lock.tenantId.length === 0) return null;
    if (!Number.isSafeInteger(lock.rank) || lock.rank < 0) return null;
    if (typeof lock.resourceId !== 'string' || lock.resourceId.length === 0) return null;

    const signature = `${lock.tenantId}\u0000${lock.rank}\u0000${lock.resourceId}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    ordered.push({
      tenantId: lock.tenantId,
      rank: lock.rank,
      resourceId: lock.resourceId,
    });
  }

  ordered.sort((a, b) => {
    if (a.tenantId !== b.tenantId) return a.tenantId < b.tenantId ? -1 : 1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.resourceId === b.resourceId) return 0;
    return a.resourceId < b.resourceId ? -1 : 1;
  });

  return ordered;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

// idempotency(record, binding) -> {action, outcome?}.
// binding = {tenantId, actorId, operation, key, payloadHash}. A fresh request
// creates; a matching completed record replays; a matching pending record waits;
// a matching unknown record reconciles; any binding mismatch conflicts. The
// stored outcome is carried when the record reports one.
export function idempotency(record, binding) {
  if (!isPlainObject(binding)) return { action: 'conflict' };

  const { tenantId, actorId, operation, key, payloadHash } = binding;
  if (
    ![tenantId, actorId, operation, key, payloadHash].every(isNonEmptyString)
  ) {
    return { action: 'conflict' };
  }

  if (record === null || record === undefined) return { action: 'create' };
  if (!isPlainObject(record)) return { action: 'conflict' };

  if (
    record.tenantId !== tenantId ||
    record.actorId !== actorId ||
    record.operation !== operation ||
    record.key !== key ||
    record.payloadHash !== payloadHash
  ) {
    return { action: 'conflict' };
  }

  const ACTION_BY_STATE = {
    complete: 'replay',
    pending: 'wait',
    unknown: 'reconcile',
  };
  const action = ACTION_BY_STATE[record.state];
  if (action === undefined) return { action: 'conflict' };

  const result = { action };
  if (record.outcome !== undefined && record.outcome !== null) {
    result.outcome = record.outcome;
  }
  return result;
}

// environment(config) -> boolean. Only a disposable local or CI fixture with
// synthetic data, a sandbox provider, credentials scoped to that exact named
// environment and the foundation_fixture database qualifies. Production and
// staging never qualify.
export function environment(config) {
  if (!isPlainObject(config)) return false;

  const name =
    typeof config.name === 'string' ? config.name : config.environment;
  if (name !== 'local' && name !== 'ci') return false;
  if (config.syntheticData !== true) return false;
  if (config.providerMode !== 'sandbox') return false;
  if (config.credentialsEnvironment !== name) return false;
  if (config.databaseName !== 'foundation_fixture') return false;

  return true;
}

// migration({canonical, applied, nullableMatches, backwardCompatible,
// restoreVerified, erasuresReplayed, environment}) -> {localAllowed,
// productionAllowed}. Exact history is required for a local apply and this
// library never executes a production migration, so productionAllowed is always
// false. localAllowed additionally excludes production/staging environments.
export function migration(input) {
  const blocked = { localAllowed: false, productionAllowed: false };
  if (!isPlainObject(input)) return blocked;

  const {
    canonical,
    applied,
    nullableMatches,
    backwardCompatible,
    restoreVerified,
    erasuresReplayed,
    environment: env,
  } = input;

  const disposable = env === 'local' || env === 'ci';
  const localAllowed =
    canonical === true &&
    applied === true &&
    nullableMatches === true &&
    backwardCompatible === true &&
    restoreVerified === true &&
    erasuresReplayed === true &&
    disposable;

  return { localAllowed, productionAllowed: false };
}

// Deterministic, dependency-free pseudonym used to redact technical identities.
function pseudonym(prefix, value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `${prefix}_${hex}`;
}

// redactTrace(record) preserves safe event/code/requestId fields and
// pseudonymizes actor/tenant IDs. Raw nested payloads, errors, health, OTP,
// phone, token, SQL and stack values are never carried through the boundary.
export function redactTrace(record) {
  if (!isPlainObject(record)) return null;

  const safe = {};
  if (typeof record.event === 'string') safe.event = record.event;
  if (typeof record.code === 'string') safe.code = record.code;
  if (typeof record.requestId === 'string') safe.requestId = record.requestId;

  const actor = pseudonym('actor', record.actorId);
  const tenant = pseudonym('tenant', record.tenantId);
  if (actor !== null) safe.actorId = actor;
  if (tenant !== null) safe.tenantId = tenant;

  return safe;
}
