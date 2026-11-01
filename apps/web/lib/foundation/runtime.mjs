// B01-I foundation runtime server adapter.
//
// createFoundation builds the shared foundation ports over an injected native
// PostgreSQL pool (`pg`). It exposes an HTTP `handler` for the settings/freeze/
// audit routes and trusted worker ports `claim`, `settle`, `reconcile` and
// `withLocks`. The worker ports are server-only and are never routed to client
// HTTP.
//
// Authority model: `authenticate` receives the actual Request and returns server
// facts. A client's actor/tenant/cookie assertions grant no authority; only the
// server-supplied facts are used. Every write uses one server clock anchor.

import { createHash, randomUUID } from 'node:crypto';

import {
  validateRequest,
  apiError,
  idempotency,
  lockOrder,
  redactTrace,
  OK_CODE,
} from '../../../../packages/core/src/foundation/runtime.mjs';

const MAX_LEASE_MS = 60 * 60 * 1000; // bounded worker lease (1 hour)

const SETTING_TYPES = Object.freeze({
  cutoffMinutes: Object.freeze({
    type: 'integer',
    min: 0,
    max: 1439,
    reauthenticate: true,
  }),
});

const FORBIDDEN_KEY_RE =
  /(secret|token|password|api[_-]?key|service[_-]?role|database[_-]?url|connection|credential|jwt|invariant|disable)/i;

function isForbiddenKey(key) {
  return FORBIDDEN_KEY_RE.test(key);
}

const STATUS = Object.freeze({
  OK: 200,
  INVALID: 400,
  DENIED: 403,
  CONFLICT: 409,
  UNAVAILABLE: 503,
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function actorHash(actorId) {
  return `actor_${sha256(`actor:${actorId}`).slice(0, 16)}`;
}

function advisoryKey(tenantId, resourceId) {
  const digest = createHash('sha256')
    .update(`${tenantId}\u0000${resourceId}`)
    .digest();
  return BigInt(`0x${digest.subarray(0, 8).toString('hex')}`);
}

class RouteError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function envelope(requestId, code, data) {
  const body = { version: 1, requestId, code };
  if (data !== undefined) body.data = data;
  return body;
}

function respond(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function createFoundation(deps) {
  const {
    pool,
    authenticate,
    clock,
    id,
    trace = () => {},
    environment: envConfig,
    workerTenantId,
  } = deps || {};

  if (!pool || typeof pool.connect !== 'function') {
    throw new TypeError('createFoundation requires an injected native PostgreSQL pool');
  }
  if (typeof authenticate !== 'function') {
    throw new TypeError('createFoundation requires an authenticate(request) function');
  }

  const now = () => {
    const value = typeof clock === 'function' ? clock() : new Date();
    if (value instanceof Date && Number.isFinite(value.getTime())) return value;
    if (Number.isFinite(value)) return new Date(value);
    throw new TypeError('clock must return a Date or a finite epoch');
  };

  const makeId = () => {
    const value = typeof id === 'function' ? id() : randomUUID();
    if (typeof value !== 'string' || value.length === 0) {
      throw new TypeError('id must return a nonempty string');
    }
    return value;
  };

  async function queryOne(client, text, params) {
    const result = await client.query(text, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async function queryAll(client, text, params) {
    const result = await client.query(text, params);
    return result.rows;
  }

  async function setTenant(client, tenantId) {
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
  }

  async function withTransaction(fn) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      try {
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } finally {
      client.release();
    }
  }

  function deny(requestId, status = STATUS.DENIED) {
    return respond(status, apiError({ requestId, code: 'DENIED' }));
  }

  function invalid(requestId) {
    return respond(STATUS.INVALID, apiError({ requestId, code: 'INVALID' }));
  }

  function unavailable(requestId) {
    return respond(STATUS.UNAVAILABLE, apiError({ requestId, code: 'UNAVAILABLE' }));
  }

  // --- HTTP routes -------------------------------------------------------

  async function postSettings(request, requestId, facts) {
    if (!facts.permissions.includes('settings:write')) return deny(requestId);

    let body;
    try {
      body = await request.json();
    } catch {
      return invalid(requestId);
    }

    const allowedFields = [
      'version',
      'key',
      'value',
      'expectedVersion',
      'reason',
      'idempotencyKey',
    ];
    if (
      !validateRequest(body, {
        allowedFields,
        requiredFields: ['version', 'key', 'value'],
        versions: [1],
      })
    ) {
      return invalid(requestId);
    }

    const { key, value, expectedVersion, reason, idempotencyKey } = body;

    if (!isNonEmptyString(key)) return invalid(requestId);
    if (isForbiddenKey(key)) return deny(requestId);

    const typeInfo = SETTING_TYPES[key];
    if (typeInfo) {
      if (
        typeInfo.type === 'integer' &&
        !(Number.isInteger(value) && value >= typeInfo.min && value <= typeInfo.max)
      ) {
        return invalid(requestId);
      }
      if (typeInfo.reauthenticate && facts.reauthenticated !== true) {
        return deny(requestId);
      }
    } else if (
      value === undefined ||
      typeof value === 'function' ||
      typeof value === 'symbol'
    ) {
      return invalid(requestId);
    }

    if (
      expectedVersion !== undefined &&
      !(Number.isSafeInteger(expectedVersion) && expectedVersion >= 0)
    ) {
      return invalid(requestId);
    }
    if (reason !== undefined && typeof reason !== 'string') return invalid(requestId);
    if (
      idempotencyKey !== undefined &&
      (typeof idempotencyKey !== 'string' || idempotencyKey.length === 0)
    ) {
      return invalid(requestId);
    }

    const anchor = now();
    const operation = 'settings.write';
    const payloadHash = sha256(
      JSON.stringify({ key, value, expectedVersion: expectedVersion ?? null }),
    );

    try {
      const data = await withTransaction(async (client) => {
        await setTenant(client, facts.tenantId);

        if (idempotencyKey) {
          const row = await queryOne(
            client,
            `SELECT tenant_id, actor_id, operation, key, payload_hash, state, outcome
             FROM fitnest_foundation.idempotency
             WHERE tenant_id = $1 AND key = $2`,
            [facts.tenantId, idempotencyKey],
          );
          const record = row
            ? {
                tenantId: row.tenant_id,
                actorId: row.actor_id,
                operation: row.operation,
                key: row.key,
                payloadHash: row.payload_hash,
                state: row.state,
                outcome: row.outcome,
              }
            : null;
          const decision = idempotency(record, {
            tenantId: facts.tenantId,
            actorId: facts.actorId,
            operation,
            key: idempotencyKey,
            payloadHash,
          });
          if (decision.action === 'replay') {
            if (decision.outcome && typeof decision.outcome === 'object') {
              return decision.outcome;
            }
          }
          if (['wait', 'reconcile', 'conflict'].includes(decision.action)) {
            throw new RouteError('CONFLICT', STATUS.CONFLICT);
          }
        }

        const head = await queryOne(
          client,
          `SELECT version FROM fitnest_foundation.settings_heads
           WHERE tenant_id = $1 AND key = $2 FOR UPDATE`,
          [facts.tenantId, key],
        );
        const currentVersion = head ? head.version : 0;
        const expected = expectedVersion === undefined ? currentVersion : expectedVersion;

        if (head === null && expected !== 0) {
          throw new RouteError('CONFLICT', STATUS.CONFLICT);
        }
        if (head !== null && expected !== currentVersion) {
          throw new RouteError('CONFLICT', STATUS.CONFLICT);
        }

        const nextVersion = currentVersion + 1;
        const eventId = makeId();
        const auditId = makeId();
        const correlationId = makeId();
        const storedValue = JSON.stringify(value);

        await client.query(
          `INSERT INTO fitnest_foundation.settings_versions
             (tenant_id, key, version, value, created_at, actor_id)
           VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
          [facts.tenantId, key, nextVersion, storedValue, anchor, facts.actorId],
        );
        await client.query(
          `INSERT INTO fitnest_foundation.settings_heads (tenant_id, key, version)
           VALUES ($1, $2, $3)
           ON CONFLICT (tenant_id, key) DO UPDATE SET version = EXCLUDED.version`,
          [facts.tenantId, key, nextVersion],
        );
        await client.query(
          `INSERT INTO fitnest_foundation.audit
             (id, tenant_id, actor_hash, action, target, occurred_at, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            auditId,
            facts.tenantId,
            actorHash(facts.actorId),
            'settings.write',
            key,
            anchor,
            reason ?? null,
          ],
        );
        if (idempotencyKey) {
          await client.query(
            `INSERT INTO fitnest_foundation.idempotency
               (key, tenant_id, actor_id, operation, payload_hash, state, outcome)
             VALUES ($1, $2, $3, $4, $5, 'complete', $6::jsonb)
             ON CONFLICT (tenant_id, key)
             DO UPDATE SET state = 'complete', outcome = EXCLUDED.outcome`,
            [
              idempotencyKey,
              facts.tenantId,
              facts.actorId,
              operation,
              payloadHash,
              JSON.stringify({ key, value, version: nextVersion }),
            ],
          );
        }
        await client.query(
          `INSERT INTO fitnest_foundation.outbox
             (event_id, tenant_id, event_type, event_version, aggregate_id,
              aggregate_version, occurred_at, correlation_id, payload, state, attempts)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'pending', 0)`,
          [
            eventId,
            facts.tenantId,
            'setting.updated',
            1,
            key,
            nextVersion,
            anchor,
            correlationId,
            JSON.stringify({ key, value, version: nextVersion }),
          ],
        );

        return { key, value, version: nextVersion };
      });

      return respond(STATUS.OK, envelope(requestId, OK_CODE, data));
    } catch (error) {
      if (error instanceof RouteError) {
        return respond(error.status, apiError({ requestId, code: error.code }));
      }
      trace(
        redactTrace({
          event: 'settings.write',
          code: 'UNAVAILABLE',
          requestId,
          actorId: facts.actorId,
          tenantId: facts.tenantId,
        }),
      );
      return unavailable(requestId);
    }
  }

  async function getSettings(request, requestId, facts, url) {
    if (!facts.permissions.includes('settings:read')) return deny(requestId);

    const key = url.searchParams.get('key');
    const consumptionDay = url.searchParams.get('consumptionDay');

    if (!isNonEmptyString(key)) return invalid(requestId);
    if (consumptionDay !== null && !/^\d{4}-\d{2}-\d{2}$/.test(consumptionDay)) {
      return invalid(requestId);
    }

    try {
      const data = await withTransaction(async (client) => {
        await setTenant(client, facts.tenantId);

        if (consumptionDay) {
          const frozen = await queryOne(
            client,
            `SELECT snapshot FROM fitnest_foundation.frozen_days
             WHERE tenant_id = $1 AND consumption_day = $2::date`,
            [facts.tenantId, consumptionDay],
          );
          if (frozen) {
            const snapshot = frozen.snapshot;
            const entry =
              snapshot && typeof snapshot === 'object' ? snapshot[key] : undefined;
            if (entry && typeof entry === 'object') {
              return { key, value: entry.value, version: entry.version };
            }
            return null;
          }
        }

        const head = await queryOne(
          client,
          `SELECT version FROM fitnest_foundation.settings_heads
           WHERE tenant_id = $1 AND key = $2`,
          [facts.tenantId, key],
        );
        if (!head) return null;

        const row = await queryOne(
          client,
          `SELECT value, version FROM fitnest_foundation.settings_versions
           WHERE tenant_id = $1 AND key = $2 AND version = $3`,
          [facts.tenantId, key, head.version],
        );
        if (!row) return null;

        return { key, value: row.value, version: row.version };
      });

      return respond(STATUS.OK, envelope(requestId, OK_CODE, data));
    } catch (error) {
      trace(
        redactTrace({
          event: 'settings.read',
          code: 'UNAVAILABLE',
          requestId,
          actorId: facts.actorId,
          tenantId: facts.tenantId,
        }),
      );
      return unavailable(requestId);
    }
  }

  async function postFreeze(request, requestId, facts) {
    if (!facts.permissions.includes('settings:write')) return deny(requestId);

    let body;
    try {
      body = await request.json();
    } catch {
      return invalid(requestId);
    }

    if (
      !validateRequest(body, {
        allowedFields: ['version', 'consumptionDay', 'reason'],
        requiredFields: ['version', 'consumptionDay'],
        versions: [1],
      })
    ) {
      return invalid(requestId);
    }

    const { consumptionDay, reason } = body;
    if (typeof consumptionDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(consumptionDay)) {
      return invalid(requestId);
    }
    if (reason !== undefined && typeof reason !== 'string') return invalid(requestId);

    const anchor = now();

    try {
      const data = await withTransaction(async (client) => {
        await setTenant(client, facts.tenantId);

        const existing = await queryOne(
          client,
          `SELECT snapshot FROM fitnest_foundation.frozen_days
           WHERE tenant_id = $1 AND consumption_day = $2::date FOR UPDATE`,
          [facts.tenantId, consumptionDay],
        );
        if (existing) {
          return { consumptionDay, snapshot: existing.snapshot };
        }

        const rows = await queryAll(
          client,
          `SELECT v.key, v.version, v.value
           FROM fitnest_foundation.settings_versions v
           JOIN fitnest_foundation.settings_heads h
             ON h.tenant_id = v.tenant_id AND h.key = v.key AND h.version = v.version
           WHERE v.tenant_id = $1`,
          [facts.tenantId],
        );
        const snapshot = {};
        for (const row of rows) {
          snapshot[row.key] = { value: row.value, version: row.version };
        }

        const auditId = makeId();
        await client.query(
          `INSERT INTO fitnest_foundation.frozen_days (tenant_id, consumption_day, snapshot)
           VALUES ($1, $2::date, $3::jsonb)`,
          [facts.tenantId, consumptionDay, JSON.stringify(snapshot)],
        );
        await client.query(
          `INSERT INTO fitnest_foundation.audit
             (id, tenant_id, actor_hash, action, target, occurred_at, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            auditId,
            facts.tenantId,
            actorHash(facts.actorId),
            'settings.freeze',
            consumptionDay,
            anchor,
            reason ?? null,
          ],
        );

        return { consumptionDay, snapshot };
      });

      return respond(STATUS.OK, envelope(requestId, OK_CODE, data));
    } catch (error) {
      if (error instanceof RouteError) {
        return respond(error.status, apiError({ requestId, code: error.code }));
      }
      trace(
        redactTrace({
          event: 'settings.freeze',
          code: 'UNAVAILABLE',
          requestId,
          actorId: facts.actorId,
          tenantId: facts.tenantId,
        }),
      );
      return unavailable(requestId);
    }
  }

  async function getAudit(request, requestId, facts) {
    if (!facts.permissions.includes('audit:read')) return deny(requestId);

    try {
      const entries = await withTransaction(async (client) => {
        await setTenant(client, facts.tenantId);
        const rows = await queryAll(
          client,
          `SELECT id, tenant_id, actor_hash, action, target, occurred_at, reason
           FROM fitnest_foundation.audit
           WHERE tenant_id = $1
           ORDER BY occurred_at ASC`,
          [facts.tenantId],
        );
        return rows.map((row) => ({
          id: row.id,
          tenantId: row.tenant_id,
          actorHash: row.actor_hash,
          action: row.action,
          target: row.target,
          occurredAt: row.occurred_at,
          reason: row.reason,
        }));
      });

      return respond(STATUS.OK, envelope(requestId, OK_CODE, { entries }));
    } catch (error) {
      trace(
        redactTrace({
          event: 'audit.read',
          code: 'UNAVAILABLE',
          requestId,
          actorId: facts.actorId,
          tenantId: facts.tenantId,
        }),
      );
      return unavailable(requestId);
    }
  }

  const handler = async (request) => {
    const requestId = makeId();
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const method = request.method.toUpperCase();

    const facts = await authenticate(request);
    if (!facts || typeof facts !== 'object') return deny(requestId);

    const { actorId, tenantId, permissions } = facts;
    if (
      !isNonEmptyString(actorId) ||
      !isNonEmptyString(tenantId) ||
      facts.sessionValid !== true ||
      facts.riskCleared !== true ||
      facts.lifetimeValid !== true ||
      !Array.isArray(permissions)
    ) {
      return deny(requestId);
    }

    if (path === '/settings' && method === 'POST') {
      return postSettings(request, requestId, facts);
    }
    if (path === '/settings' && method === 'GET') {
      return getSettings(request, requestId, facts, url);
    }
    if (path === '/freeze' && method === 'POST') {
      return postFreeze(request, requestId, facts);
    }
    if (path === '/audit' && method === 'GET') {
      return getAudit(request, requestId, facts);
    }

    // Unknown HTTP port: deny access.
    return respond(STATUS.DENIED, apiError({ requestId, code: 'DENIED' }));
  };

  // --- Trusted worker ports ---------------------------------------------

  async function claim({ workerId, leaseMs }) {
    if (!isNonEmptyString(workerId)) return null;
    if (!Number.isSafeInteger(leaseMs) || leaseMs <= 0 || leaseMs > MAX_LEASE_MS) {
      return null;
    }
    const leaseId = makeId();
    const anchor = now();
    const leaseUntil = new Date(anchor.getTime() + leaseMs);

    try {
      return await withTransaction(async (client) => {
        await setTenant(client, workerTenantId);

        const row = await queryOne(
          client,
          `SELECT event_id, event_type, event_version, aggregate_id,
                  aggregate_version, occurred_at, correlation_id, payload, attempts
           FROM fitnest_foundation.outbox
           WHERE state IN ('pending', 'failed')
             AND (lease_until IS NULL OR lease_until <= $1)
           ORDER BY occurred_at ASC
           FOR UPDATE SKIP LOCKED
           LIMIT 1`,
          [anchor],
        );
        if (!row) return null;

        await client.query(
          `UPDATE fitnest_foundation.outbox
           SET lease_id = $1, worker_id = $2, lease_until = $3, attempts = attempts + 1
           WHERE event_id = $4`,
          [leaseId, workerId, leaseUntil, row.event_id],
        );

        return {
          eventId: row.event_id,
          leaseId,
          workerId,
          eventType: row.event_type,
          eventVersion: row.event_version,
          aggregateId: row.aggregate_id,
          aggregateVersion: row.aggregate_version,
          occurredAt: row.occurred_at,
          correlationId: row.correlation_id,
          payload: row.payload,
          attempts: row.attempts + 1,
        };
      });
    } catch {
      return null;
    }
  }

  async function settle({ eventId, leaseId, workerId, recipient, channel, outcome }) {
    if (![eventId, leaseId, workerId, recipient, channel].every(isNonEmptyString)) {
      return { action: 'denied' };
    }
    if (!['delivered', 'ambiguous', 'failed'].includes(outcome)) {
      return { action: 'denied' };
    }

    const anchor = now();

    try {
      return await withTransaction(async (client) => {
        await setTenant(client, workerTenantId);

        const row = await queryOne(
          client,
          `SELECT event_id, state FROM fitnest_foundation.outbox
           WHERE event_id = $1 AND lease_id = $2 AND worker_id = $3
             AND lease_until >= $4
           FOR UPDATE`,
          [eventId, leaseId, workerId, anchor],
        );
        if (!row) return { action: 'denied' };

        if (outcome === 'ambiguous') {
          await client.query(
            `UPDATE fitnest_foundation.outbox
             SET state = 'ambiguous', lease_until = NULL
             WHERE event_id = $1`,
            [eventId],
          );
          return { action: 'reconcile' };
        }

        if (outcome === 'failed') {
          await client.query(
            `UPDATE fitnest_foundation.outbox
             SET state = 'failed', lease_id = NULL, worker_id = NULL, lease_until = NULL
             WHERE event_id = $1`,
            [eventId],
          );
          return { action: 'applied' };
        }

        const existing = await queryOne(
          client,
          `SELECT event_id FROM fitnest_foundation.consumer_effects
           WHERE event_id = $1 AND recipient = $2 AND channel = $3`,
          [eventId, recipient, channel],
        );
        if (existing) return { action: 'replay' };

        await client.query(
          `INSERT INTO fitnest_foundation.consumer_effects (event_id, recipient, channel)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [eventId, recipient, channel],
        );
        await client.query(
          `INSERT INTO fitnest_foundation.consumer_receipts (event_id, recipient, channel)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [eventId, recipient, channel],
        );
        await client.query(
          `UPDATE fitnest_foundation.outbox SET state = 'delivered' WHERE event_id = $1`,
          [eventId],
        );

        return { action: 'applied' };
      });
    } catch {
      return { action: 'denied' };
    }
  }

  async function reconcile({
    eventId,
    leaseId,
    workerId,
    recipient,
    channel,
    providerState,
  }) {
    if (![eventId, leaseId, workerId, recipient, channel].every(isNonEmptyString)) {
      return { action: 'denied' };
    }
    if (!['delivered', 'absent'].includes(providerState)) {
      return { action: 'denied' };
    }

    try {
      return await withTransaction(async (client) => {
        await setTenant(client, workerTenantId);

        const row = await queryOne(
          client,
          `SELECT event_id, state FROM fitnest_foundation.outbox
           WHERE event_id = $1 AND lease_id = $2 AND worker_id = $3
           FOR UPDATE`,
          [eventId, leaseId, workerId],
        );
        if (!row) return { action: 'denied' };

        if (providerState === 'delivered') {
          const existing = await queryOne(
            client,
            `SELECT event_id FROM fitnest_foundation.consumer_effects
             WHERE event_id = $1 AND recipient = $2 AND channel = $3`,
            [eventId, recipient, channel],
          );
          if (existing) return { action: 'replay' };

          await client.query(
            `INSERT INTO fitnest_foundation.consumer_effects (event_id, recipient, channel)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [eventId, recipient, channel],
          );
          await client.query(
            `INSERT INTO fitnest_foundation.consumer_receipts (event_id, recipient, channel)
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [eventId, recipient, channel],
          );
          await client.query(
            `UPDATE fitnest_foundation.outbox SET state = 'delivered' WHERE event_id = $1`,
            [eventId],
          );
          return { action: 'applied' };
        }

        // providerState === 'absent': permit a new bounded claim.
        await client.query(
          `UPDATE fitnest_foundation.outbox
           SET state = 'failed', lease_id = NULL, worker_id = NULL, lease_until = NULL
           WHERE event_id = $1`,
          [eventId],
        );
        return { action: 'released' };
      });
    } catch {
      return { action: 'denied' };
    }
  }

  async function withLocks(tenantId, resources, callback) {
    if (!isNonEmptyString(tenantId)) {
      throw new TypeError('withLocks requires a nonempty tenantId');
    }
    if (!Array.isArray(resources)) {
      throw new TypeError('withLocks requires a resources array');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('withLocks requires a callback');
    }

    const locks = lockOrder(
      resources.map((resource) => ({
        tenantId,
        rank: resource && resource.rank,
        resourceId: resource && (resource.resourceId ?? resource.id),
      })),
    );
    if (locks === null) {
      throw new Error('withLocks: invalid or mixed-tenant lock resources');
    }

    return withTransaction(async (client) => {
      await setTenant(client, tenantId);
      for (const lock of locks) {
        await client.query('SELECT pg_advisory_xact_lock($1::bigint)', [
          advisoryKey(lock.tenantId, lock.resourceId),
        ]);
      }
      return callback(client);
    });
  }

  return { handler, claim, settle, reconcile, withLocks };
}

export default createFoundation;
