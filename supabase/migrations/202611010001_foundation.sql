-- B01-I foundation schema proposal
--
-- Additive, isolated `fitnest_foundation` schema for the shared foundation
-- runtime: typed/versioned settings, frozen-day snapshots, pseudonymized audit,
-- idempotency, a durable transactional outbox and per-event consumer
-- receipts/effects.
--
-- This is a schema proposal only. It is never applied to production by this
-- increment. Production migration application remains closed under G-T013.
--
-- Role creation and disposable-database boot are owned by the trusted harness,
-- NOT by this proposal. This file assumes the harness has already created two
-- distinct LOGIN roles in the clean disposable PostgreSQL 17 fixture:
--
--   * fitnest_foundation_runtime  -- application connection, never an owner,
--                                    never BYPASSRLS, subject to RLS.
--   * fitnest_foundation_migrator -- migration/owner connection.
--
-- The clean fixture has no Supabase client roles (anon/authenticated/
-- service_role) and no privileged PUBLIC surface, so this proposal references
-- only the two harness-created roles and revokes everything from PUBLIC.
-- Tenant isolation is enforced with per-transaction `app.tenant_id` (a custom
-- GUC) and row-level security; the runtime role must set it on every write.

CREATE SCHEMA IF NOT EXISTS fitnest_foundation;

-- ---------------------------------------------------------------------------
-- Settings: append-only history plus a current head pointer.
-- ---------------------------------------------------------------------------
CREATE TABLE fitnest_foundation.settings_versions (
    tenant_id  text        NOT NULL,
    key        text        NOT NULL,
    version    integer     NOT NULL CHECK (version >= 1),
    value      jsonb       NOT NULL,
    created_at timestamptz NOT NULL,
    actor_id   text        NOT NULL,
    PRIMARY KEY (tenant_id, key, version)
);

CREATE TABLE fitnest_foundation.settings_heads (
    tenant_id text    NOT NULL,
    key       text    NOT NULL,
    version   integer NOT NULL CHECK (version >= 1),
    PRIMARY KEY (tenant_id, key)
);

-- ---------------------------------------------------------------------------
-- Frozen days: immutable per-tenant snapshots of current setting versions.
-- ---------------------------------------------------------------------------
CREATE TABLE fitnest_foundation.frozen_days (
    tenant_id       text  NOT NULL,
    consumption_day date  NOT NULL,
    snapshot        jsonb NOT NULL,
    PRIMARY KEY (tenant_id, consumption_day)
);

-- ---------------------------------------------------------------------------
-- Audit: append-only, actor identity already pseudonymized.
-- ---------------------------------------------------------------------------
CREATE TABLE fitnest_foundation.audit (
    id          text        NOT NULL,
    tenant_id   text        NOT NULL,
    actor_hash  text        NOT NULL,
    action      text        NOT NULL,
    target      text,
    occurred_at timestamptz NOT NULL,
    reason      text,
    PRIMARY KEY (id)
);

-- ---------------------------------------------------------------------------
-- Idempotency: one record per tenant-scoped key, bound to actor/operation/
-- payload hash so a reused key with different payload is a conflict.
-- ---------------------------------------------------------------------------
CREATE TABLE fitnest_foundation.idempotency (
    key          text  NOT NULL,
    tenant_id    text  NOT NULL,
    actor_id     text  NOT NULL,
    operation    text  NOT NULL,
    payload_hash text  NOT NULL,
    state        text  NOT NULL,
    outcome      jsonb,
    PRIMARY KEY (tenant_id, key)
);

-- ---------------------------------------------------------------------------
-- Durable outbox: persisted with the business commit; bounded leases; at-least
-- once delivery; unknown provider outcomes are reconciled, never blindly retried.
-- ---------------------------------------------------------------------------
CREATE TABLE fitnest_foundation.outbox (
    event_id          text        NOT NULL,
    tenant_id         text        NOT NULL,
    event_type        text        NOT NULL,
    event_version     integer     NOT NULL CHECK (event_version >= 1),
    aggregate_id      text        NOT NULL,
    aggregate_version integer     NOT NULL CHECK (aggregate_version >= 1),
    occurred_at       timestamptz NOT NULL,
    correlation_id    text        NOT NULL,
    payload           jsonb       NOT NULL,
    state             text        NOT NULL,
    lease_id          text,
    worker_id         text,
    lease_until       timestamptz,
    attempts          integer     NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    PRIMARY KEY (event_id)
);

CREATE INDEX fitnest_foundation_outbox_claim_idx
    ON fitnest_foundation.outbox (tenant_id, state, lease_until);

-- ---------------------------------------------------------------------------
-- Consumer receipts (at-least-once) and effects (exactly-once per
-- event/recipient/channel).
-- ---------------------------------------------------------------------------
CREATE TABLE fitnest_foundation.consumer_receipts (
    event_id  text NOT NULL,
    recipient text NOT NULL,
    channel   text NOT NULL,
    PRIMARY KEY (event_id, recipient, channel)
);

CREATE TABLE fitnest_foundation.consumer_effects (
    event_id  text NOT NULL,
    recipient text NOT NULL,
    channel   text NOT NULL,
    PRIMARY KEY (event_id, recipient, channel)
);

-- ---------------------------------------------------------------------------
-- Privileges: runtime role only; no client role access.
-- ---------------------------------------------------------------------------
REVOKE ALL ON SCHEMA fitnest_foundation FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA fitnest_foundation FROM PUBLIC;

GRANT USAGE ON SCHEMA fitnest_foundation TO fitnest_foundation_runtime;

-- Append-only surfaces: the runtime role may select and insert only.
GRANT SELECT, INSERT ON fitnest_foundation.settings_versions TO fitnest_foundation_runtime;
GRANT SELECT, INSERT ON fitnest_foundation.frozen_days      TO fitnest_foundation_runtime;
GRANT SELECT, INSERT ON fitnest_foundation.audit            TO fitnest_foundation_runtime;
GRANT SELECT, INSERT ON fitnest_foundation.consumer_receipts TO fitnest_foundation_runtime;
GRANT SELECT, INSERT ON fitnest_foundation.consumer_effects TO fitnest_foundation_runtime;

-- Mutable surfaces: CAS head updates, idempotency transitions and outbox
-- claim/settle state transitions require UPDATE.
GRANT SELECT, INSERT, UPDATE ON fitnest_foundation.settings_heads TO fitnest_foundation_runtime;
GRANT SELECT, INSERT, UPDATE ON fitnest_foundation.idempotency    TO fitnest_foundation_runtime;
GRANT SELECT, INSERT, UPDATE ON fitnest_foundation.outbox         TO fitnest_foundation_runtime;

-- ---------------------------------------------------------------------------
-- Row-level security: tenant scope is the per-transaction `app.tenant_id`.
-- An unset (NULL) tenant matches no rows, so a missing scope fails closed.
-- ---------------------------------------------------------------------------
ALTER TABLE fitnest_foundation.settings_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.settings_heads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.frozen_days       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.audit             ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.idempotency       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.outbox            ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.consumer_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnest_foundation.consumer_effects  ENABLE ROW LEVEL SECURITY;

CREATE POLICY settings_versions_tenant ON fitnest_foundation.settings_versions
    FOR ALL TO fitnest_foundation_runtime
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY settings_heads_tenant ON fitnest_foundation.settings_heads
    FOR ALL TO fitnest_foundation_runtime
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY frozen_days_tenant ON fitnest_foundation.frozen_days
    FOR ALL TO fitnest_foundation_runtime
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY audit_tenant ON fitnest_foundation.audit
    FOR ALL TO fitnest_foundation_runtime
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY idempotency_tenant ON fitnest_foundation.idempotency
    FOR ALL TO fitnest_foundation_runtime
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY outbox_tenant ON fitnest_foundation.outbox
    FOR ALL TO fitnest_foundation_runtime
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- Receipts/effects carry no tenant_id; their scope is the parent event's tenant.
CREATE POLICY consumer_receipts_tenant ON fitnest_foundation.consumer_receipts
    FOR ALL TO fitnest_foundation_runtime
    USING (EXISTS (
        SELECT 1 FROM fitnest_foundation.outbox o
        WHERE o.event_id = consumer_receipts.event_id
          AND o.tenant_id = current_setting('app.tenant_id', true)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM fitnest_foundation.outbox o
        WHERE o.event_id = consumer_receipts.event_id
          AND o.tenant_id = current_setting('app.tenant_id', true)
    ));

CREATE POLICY consumer_effects_tenant ON fitnest_foundation.consumer_effects
    FOR ALL TO fitnest_foundation_runtime
    USING (EXISTS (
        SELECT 1 FROM fitnest_foundation.outbox o
        WHERE o.event_id = consumer_effects.event_id
          AND o.tenant_id = current_setting('app.tenant_id', true)
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM fitnest_foundation.outbox o
        WHERE o.event_id = consumer_effects.event_id
          AND o.tenant_id = current_setting('app.tenant_id', true)
    ));
