# B02-C Staff Identity and Secure Administration â€” Design Proposal

Status: **proposal** (not accepted). Task key: **B02-C**. Source SHA: `2854038dfe653289c326dd33650a311918f630ad`.
`runtimeAcceptance`: false. `productionReady`: false.

This document is the design proposal for slice 003 (`specs/003-staff-accounts-admin-shell/spec.md`). It preserves, unchanged, the accepted B01-C foundation design (`packages/core/contracts/foundation-design.md` and `.json`) and the accepted SEC baseline (`docs/delivery/adr-sec-a.md`, the five SEC-B evidence files, and `docs/delivery/adr-sec-c.md`). It authorizes no production writes, no migrations, no runtime authentication implementation, no message sends and no gate changes. It does not implement anything at runtime and does not assert production readiness or acceptance.

## 1. Scope and authority

Slice 003 delivers staff identity, roles/permissions and the empty admin shell, plus the single delivery-confirmation action. No business screen beyond delivery confirmation is built here; menus, consolidation and subscriber views arrive in slice 002 and later. Customer identity (slice 001) is out of scope and untouched.

This proposal is a **design contract**. The structural protected check and the model review alone cannot grant semantic task acceptance. Independent platform acceptance is required before any status change; `runtimeAcceptance` and `productionReady` remain false.

## 2. Source basis (exact references)

- Spec: `specs/003-staff-accounts-admin-shell/spec.md` â€” FR-S1â€“S4, FR-R1â€“R4, FR-A1â€“A4, FR-L1â€“L3.
- Product baseline: `docs/delivery/product-baseline.md` â€” D-026, D-046, D-050, D-052, D-055, D-057, D-058, D-060, D-063.
- Security requirements: `docs/delivery/security-requirements.md` â€” SEC-05, SEC-06, SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, SEC-15, SEC-27, SEC-29, SEC-30, SEC-32.
- Accepted foundation (B01-C): `packages/core/contracts/foundation-design.md` â€” API/error envelope, event and outbox schema, idempotency + lock order, server-time authority (`Africa/Casablanca`, `timestamptz`, half-open intervals), settings invariants, audit redaction, privilege separation.
- Accepted SEC baseline: SEC-A (`tests/security/identity-reference.mjs`, accepted at `b8911d6c2d3a1343a22ba2aca462608ab0c9ec12`), SEC-B evidence (`docs/delivery/evidence/*.json`), SEC-C (`tests/security/session-reference.mjs`).

## 3. Preserved upstream decisions

The following are ratified or accepted upstream and are preserved verbatim; this proposal neither changes nor re-litigates them:

- B01-C foundation: `contractVersion:1`, error envelope `{version, requestId, code}` with codes `DENIED|CONFLICT|INVALID|UNAVAILABLE`, outbox event fields, at-least-once delivery with unique consumer receipts and unknown-outcome reconciliation, idempotency binding `{tenant, actor, operation, key, payloadHash}`, deterministic lock order, server-side time authority, audit redaction `{health, otp, phone, token}`, and settings invariants (typed/bounded/versioned/audited; `canDisableInvariant:false`; `secretsInBusinessTables:false`).
- Gates: `G-CONSTITUTION`, `G-RECOVERY`, `G-SESSION`, `G-T013` remain unchanged.
- SEC-A invariants: `phoneOtpAloneUnlocksHistory=false`, independent previously verified email proof, single-use proofs, non-enumerating responses, no victim lockout.
- SEC-C invariants: verified token + live provider/application session + owner + risk clearance + bounded lifetime; direct channels default-deny; app-side revocation; refresh rechecks authorization.
- Product invariants: D-057 (ownership/ledger/food/payment invariants are not configurable), D-055 (no role overrides hard safety filters; post-cutoff logistics is a dedicated default-deny permission), D-058 (server `Africa/Casablanca` time; consumption/production/delivery dates distinct).

## 4. Identity boundary: staff vs customer

Staff identity is a distinct table from customers (D-026). Sign-in is email/password with mandatory TOTP for every role (D-052, FR-S1). There is no SMS second factor and no hidden bypass account. The customer phone-OTP path of slice 001 never authorizes a staff session; staff TOTP is not the customer OTP.

Key boundary rules:

- The same email appearing on a customer record and a staff record does **not** imply any link. The two tables share no identity join for authorization. A customer email is not the staff sign-in credential unless a staff account separately exists with that email.
- Deactivating a staff account never affects a customer record; deactivating a customer never affects a staff account.
- Legacy staff login (historical `REPO-D-052` temporary test admin) is closed; slice 003 replaces it (D-063). No new route falls back to founder/legacy/hardcoded test access (D-046).

## 5. Authentication, TOTP, recovery and bootstrap

### 5.1 Invitation (FR-S2, SEC-05)

- An Administrator creates a staff account with an email and one or more roles. This produces an **expiring, single-use invitation**. The account cannot sign in until password and TOTP are enrolled through the invitation.
- No public self-registration.
- Invitation acceptance is idempotent and atomic: the enrollment consumes the invitation, sets the password hash and enrolls the TOTP secret, then activates the account, all in one transaction. A replayed or expired invitation fails; concurrent acceptance yields exactly one enrollment.

### 5.2 TOTP (D-052, SEC-05)

- TOTP is mandatory for every role. The shared secret is generated server-side, shown once as a provisioning URI/secret, stored only in protected storage (never business tables, logs, exports or settings), and never returned by any read API.
- Enrollment binds the secret to the staff account before the account is usable.

### 5.3 Password reset and MFA recovery (FR-S3, SEC-05)

- Reset/recovery uses a **single-use, expiring proof**. Completing a reset revokes all affected sessions and emits an audit entry plus a security notification.
- Password reset alone must not silently bypass TOTP: after reset, sign-in still requires the enrolled TOTP (or the defined MFA recovery path).
- Reset-request responses are non-enumerating (a generic response regardless of whether the account exists), consistent with SEC-A's non-enumeration invariant.
- The versioned reset request, reset-proof exchange, completion response and the security-notification/audit events are specified in Â§13.10â€“13.12 so that single-use, expiry, session revocation and TOTP preservation can be type-checked and independently tested.

### 5.4 Bootstrap (FR-S2, D-052, SEC-05)

- Two named administrators are bootstrapped through the one-time state machine in Â§21. There is no permanent backdoor and no SMS second factor. Recovery follows Â§20 without a hidden account.

## 6. Roles and permission matrix

Roles and permissions are **rows** (configuration), not code (FR-R1). Five launch roles exist (D-050). Screens and actions check permissions, never role names.

Permission keys are namespaced `<domain>.<resource>.<action>`. The three spec examples â€” `menu.publish`, `delivery.confirm`, `subscriber.pause_for` â€” are literal; the remaining keys below are a **proposed** enumeration consistent with FR-R2 and are subject to ratification (see section 18). A permission is a capability row; adding a role is configuration, not development.

| Role | Permissions (proposed) | Notes |
|---|---|---|
| Administrator | `settings.read`, `settings.write`, `settings.sensitive`, `staff.accounts.read`, `staff.accounts.write`, `staff.accounts.invite`, `staff.accounts.deactivate`, `staff.roles.read`, `staff.roles.write`, `audit.read`, `audit.export`, **plus every domain permission below** | Every permission, including settings, prices, plans, meal types, cutoff parameters (D-044, D-048), staff accounts and roles. Subject to D-055/D-057 invariants. |
| Kitchen | `menu.dish.read`, `menu.dish.write`, `menu.nutrition.read`, `menu.nutrition.write`, `menu.weekly.read`, `menu.weekly.compose`, `menu.publish`, `menu.consolidation.read`, `menu.unresolved.read` | Dishes and nutrition sheets (D-041), weekly menu composition and publication, consolidation, unresolved-slot views. |
| Delivery | `delivery.round.read`, `delivery.confirm`, `delivery.fail`, `delivery.correct` | Assigned-round list, confirmation, delivery issues. Nothing else. `delivery.correct` is a separate correction permission (FR-L2). |
| Support | `subscriber.read`, `subscriber.history.read`, `subscriber.pause_for`, `subscriber.act.skip`, `subscriber.act.address`, `subscriber.act.slot`, `event.ledger.read` | Read subscriber account/history, act within the same rules as the subscriber, read the event ledger. |
| Preparation | `preparation.picking.read`, `preparation.labels.read` | Picking lists and labels, read-only. |

Dedicated default-deny logistics permission (D-055): `logistics.post_cutoff` â€” granted only through an explicit, scoped grant; never implied by Administrator. No role overrides hard safety filters.

Forbidden combinations (FR-R3, D-050): Kitchen may combine with Preparation; Delivery and Support are never combined with Administrator on one account.

## 7. Resource/scope matrix

A permission grants a capability; the server additionally enforces **resource scope and live identity** (FR-R1, SEC-06). The scope is not derived from the role name.

| Role | Capability scope | Enforced resource scope |
|---|---|---|
| Delivery | delivery actions on assigned round | `roundId` assigned to the staff account; useful time window; minimum necessary fields only (G-ROUND defines assignment ownership â€” unresolved). |
| Support | subscriber reads and actions | a specific subscriber account, subject to the same rules the subscriber would face; staff actor recorded distinctly. |
| Preparation | picking/labels | read-only; no write permission exists. |
| Kitchen | menu/nutrition | menu/nutrition domain only; no settings/staff/subscriber write. |
| Administrator | all capabilities | every resource, but invariants (D-055 logistics, D-057 settings) are code/database guarantees, not grants. |

## 8. Admin origin, cookie and session boundary

- The staff surface runs at its **own hostname/origin**, separate from the public site and the customer app (FR-A1). The exact hostname is an unresolved configuration decision (section 18).
- Session cookies are **host-scoped**, `Secure`, `HttpOnly`, and `SameSite` (site-locked). The public-site origin and the customer app cannot read or replay the staff cookie.
- CSRF protection: state-changing staff requests require an Origin/Referer check against the admin origin plus a same-site/CSRF token. `GET` has no business side effect.
- CORS is restrictive: no untrusted origin is reflected; the admin API is not reachable cross-origin from arbitrary sites.
- The staff session inherits the SEC-C boundary: a verified token plus a live provider/application session, owner check, risk clearance and bounded lifetime. Deactivation/role-change revocation applies at the next request (FR-S4, SEC-07). No legacy session protects a new route.
- Staff and customer sessions are separate cookie namespaces/domains; a customer session never authorizes a staff route and vice versa.

## 9. Navigation

Navigation entries are rows: `{ label, route, requiredPermission, order }` (FR-A2). The admin shell renders only entries whose `requiredPermission` is held by the signed-in staff account. A new screen registers itself by adding a navigation row; it does not touch navigation code. Reachability by URL is still denied server-side by the route's permission check (FR-R4).

## 10. Typed, audited settings

Settings follow D-057/SEC-11 and the B01-C settings obligation: typed, bounded, versioned and audited. A setting definition carries `{ key, type, bounds, unit, version, effectiveUse }`; a change records `{ value, unit, version, actor, changedAt, impact }`. Sensitive changes require reauthentication. No secret or safety invariant is administrable; changes cannot reopen frozen days; the previous rule version is recoverable.

## 11. Staff action audit and logistics

Staff events are append-only and restricted (FR-A4, SEC-30). Each row carries `{ actor, action, target, reason, occurredAt (server time), payload }` with minimal payload. Technical IDs are pseudonymized; `health/otp/phone/token` are redacted. Audit exports require an actor plus export permission and resource-scope evidence. Post-cutoff logistical actions require `logistics.post_cutoff` (D-055), not an Administrator bypass.

## 12. Delivery confirmation and adapter interfaces

Delivery confirmation is the one action built here.

- A driver lists only deliveries assigned to their round in the useful window (FR-L1). Consumption date J, production Jâˆ’1 daytime, and delivery Jâˆ’1 evening are distinct, using server `Africa/Casablanca` time (D-058).
- Confirmation uses an authorized resource scope, a server timestamp, a stable idempotency key and an atomic transition + outbox (FR-L2, SEC-10). The authoritative `delivery.confirmed` event drives both the first-delivery reward and the notification (SEC-27/28). Corrections require a separate permission and reason, append events, and never delete or double-credit.
- Failure records an authorized reason and exception owner; retry/compensation follow the accepted policy, not an invented credit; planned/prepared/delivered/failed are reconciled (FR-L3, D-060).

The delivery model/state and assignment are supplied through **LOT-11** as a versioned adapter interface. Fixture contracts may precede LOT-11 runtime, but FR-L1â€“3 cannot be marked delivered before real integration. The proposed versioned request/response/event DTOs for `listByRound`, `fail`, `correct` and `reconcile` are specified in Â§13.13â€“13.16 and are marked as **fixtures pending LOT-11 ratification**; `confirm` is Â§13.5.

## 13. Concrete versioned schemas

All DTOs are version `1` and reuse the B01-C envelope. Internal errors are never reflected; only `{version, requestId, code}` crosses the boundary.

### 13.1 API result envelope (B01-C)

```json
{ "version": 1, "requestId": "<server request id>", "code": "OK|DENIED|CONFLICT|INVALID|UNAVAILABLE", "data": "<domain DTO when authorized>" }
```

### 13.2 Error envelope (B01-C)

```json
{ "version": 1, "requestId": "<request id>", "code": "DENIED|CONFLICT|INVALID|UNAVAILABLE" }
```

### 13.3 Staff sign-in (POST `/v1/staff/auth/signin`)

Request:

```json
{ "version": 1, "email": "lead@fitnest.example", "password": "<secret>", "totpCode": "123456", "operationId": "op_..." }
```

Response (sets host-scoped cookies; no secret is returned):

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "staffAccountId": "sacc_...", "displayName": "Kitchen Lead", "roleKeys": ["kitchen", "preparation"], "permissions": ["menu.publish", "..."] } }
```

### 13.4 Invitation accept (POST `/v1/staff/auth/invitation/accept`)

Request:

```json
{ "version": 1, "invitationCode": "<opaque>", "email": "lead@fitnest.example", "password": "<secret>", "totpCode": "123456", "operationId": "op_..." }
```

Response:

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "staffAccountId": "sacc_...", "enrolled": true } }
```

Replay yields `{ "version": 1, "requestId": "req_...", "code": "CONFLICT" }` (non-enumerating generic).

### 13.5 Delivery confirm (POST `/v1/staff/delivery/confirm`)

Request:

```json
{ "version": 1, "deliveryId": "del_...", "idempotencyKey": "ik_...", "operationId": "op_..." }
```

Response:

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "deliveryId": "del_...", "status": "delivered", "actualDeliveredAt": "2026-10-31T20:05:00+01:00" } }
```

### 13.6 Setting update (PUT `/v1/staff/settings/{key}`)

Request:

```json
{ "version": 1, "value": 1800, "expectedVersion": 7, "reauth": { "operationId": "op_...", "proof": "..." } }
```

Response (stale version):

```json
{ "version": 1, "requestId": "req_...", "code": "CONFLICT" }
```

### 13.7 Staff event (audit) schema

```json
{ "eventId": "evt_...", "eventType": "staff.account.deactivate", "eventVersion": 1,
  "aggregateId": "sacc_...", "aggregateVersion": 4,
  "occurredAt": "2026-10-31T19:05:00Z", "correlationId": "op_...",
  "payload": { "action": "deactivate", "target": {"type":"staff_account","id":"sacc_..."}, "reason": "offboarding", "actorId": "sacc_admin_..." } }
```

### 13.8 Delivery confirmed event (authoritative)

```json
{ "eventId": "evt_...", "eventType": "delivery.confirmed", "eventVersion": 1,
  "aggregateId": "del_...", "aggregateVersion": 3,
  "occurredAt": "2026-10-31T19:05:00Z", "correlationId": "ik_...",
  "payload": { "deliveryId": "del_...", "subscriberId": "sub_...", "deliveryDate": "2026-10-31",
    "actualDeliveredAt": "2026-10-31T20:05:00+01:00", "confirmedBy": "sacc_...", "assignedRoundId": "rnd_..." } }
```

### 13.9 Outbox record (B01-C)

```json
{ "event": "<domain event above>", "lease": null, "attempts": 0, "nextAttemptAt": null, "outcome": "pending" }
```

### 13.10 Password reset request (POST `/v1/staff/auth/password-reset/request`)

Request:

```json
{ "version": 1, "email": "lead@fitnest.example", "operationId": "op_..." }
```

Response (non-enumerating generic â€” the same shape whether or not the account exists, per SEC-A):

```json
{ "version": 1, "requestId": "req_...", "code": "OK" }
```

The reset proof is never returned in the response; it is delivered out-of-band to the account's enrolled recovery channel and is bound to the account, single-use and expiring.

### 13.11 Password reset complete (POST `/v1/staff/auth/password-reset/complete`)

Request (the `resetProof` is single-use and expiring; `totpCode` is required so reset alone cannot drop MFA):

```json
{ "version": 1, "email": "lead@fitnest.example", "resetProof": "<opaque single-use>", "newPassword": "<secret>", "totpCode": "123456", "operationId": "op_..." }
```

Response (on success â€” session revocation, audit row and notification intent are committed in the same transaction as the proof consumption):

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "staffAccountId": "sacc_...", "sessionsRevoked": 3, "resetAt": "2026-10-31T19:05:00Z" } }
```

Expired, replayed or cross-account proof yields a generic `{ "version": 1, "requestId": "req_...", "code": "CONFLICT" }` (non-enumerating; no proof, password, TOTP secret or session detail leaks). A missing or wrong `totpCode` fails the completion with `DENIED`, never a silent TOTP drop.

### 13.12 Reset security-notification and audit events

Security notification intent (SEC-A/SEC-C shape â€” carries no phone, email, OTP, token, TOTP secret or password):

```json
{ "eventId": "evt_...", "eventType": "staff.security_change", "eventVersion": 1,
  "aggregateId": "sacc_...", "aggregateVersion": 5, "occurredAt": "2026-10-31T19:05:00Z",
  "correlationId": "op_...", "payload": { "kind": "account_security_change", "action": "password_reset", "actorId": "sacc_..." } }
```

Audit event (append-only, redacted, minimal payload):

```json
{ "eventId": "evt_...", "eventType": "staff.account.password_reset", "eventVersion": 1,
  "aggregateId": "sacc_...", "aggregateVersion": 5, "occurredAt": "2026-10-31T19:05:00Z",
  "correlationId": "op_...", "payload": { "action": "password_reset", "target": {"type": "staff_account", "id": "sacc_..."}, "sessionsRevoked": 3, "reason": "forgotten_password", "actorId": "sacc_..." } }
```

The MFA recovery protocol is specified in Â§20, separately from password reset. Recovery-code count, format and expiry parameters remain unresolved (Â§18); no default is silently enabled.

### 13.13 Delivery adapter `listByRound` â€” fixture, pending LOT-11

Request:

```json
{ "version": 1, "roundId": "rnd_...", "windowStart": "2026-10-31T18:00:00+01:00", "windowEnd": "2026-11-01T06:00:00+01:00" }
```

Response (minimum-necessary projection: contact/address/slot/bag/notes only, no health or payment data):

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "deliveries": [
  { "deliveryId": "del_...", "subscriberId": "sub_...", "deliveryDate": "2026-10-31", "slot": "18:00-22:00", "addressLine": "...", "bag": "A1", "notes": "..." }
] } }
```

### 13.14 Delivery adapter `fail` â€” fixture, pending LOT-11

Request:

```json
{ "version": 1, "deliveryId": "del_...", "idempotencyKey": "ik_...", "reason": "customer_absent", "operationId": "op_..." }
```

Response:

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "deliveryId": "del_...", "status": "failed", "failedAt": "2026-10-31T19:05:00+01:00", "reason": "customer_absent" } }
```

Event:

```json
{ "eventId": "evt_...", "eventType": "delivery.failed", "eventVersion": 1,
  "aggregateId": "del_...", "aggregateVersion": 4, "occurredAt": "2026-10-31T19:05:00Z",
  "correlationId": "ik_...", "payload": { "deliveryId": "del_...", "reason": "customer_absent", "failedBy": "sacc_...", "exceptionOwnerId": "exc_..." } }
```

### 13.15 Delivery adapter `correct` â€” fixture, pending LOT-11

Request:

```json
{ "version": 1, "deliveryId": "del_...", "idempotencyKey": "ik_...", "reason": "wrong_subscriber_marked", "correction": { "status": "delivered", "actualDeliveredAt": "2026-10-31T20:05:00+01:00" }, "operationId": "op_..." }
```

Response:

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "deliveryId": "del_...", "status": "delivered", "correctedAt": "2026-10-31T19:10:00+01:00" } }
```

Event (append-only â€” the original event is never deleted or rewritten):

```json
{ "eventId": "evt_...", "eventType": "delivery.corrected", "eventVersion": 1,
  "aggregateId": "del_...", "aggregateVersion": 5, "occurredAt": "2026-10-31T19:10:00Z",
  "correlationId": "ik_...", "payload": { "deliveryId": "del_...", "reason": "wrong_subscriber_marked", "previousStatus": "delivered", "newStatus": "delivered", "correctedBy": "sacc_...", "correctedAt": "2026-10-31T19:10:00+01:00" } }
```

### 13.16 Delivery adapter `reconcile` â€” fixture, pending LOT-11

Request:

```json
{ "version": 1, "roundId": "rnd_...", "deliveryDate": "2026-10-31" }
```

Response (read-only projection of the planned/prepared/delivered/failed breakdown, D-060):

```json
{ "version": 1, "requestId": "req_...", "code": "OK", "data": { "reconcile": { "planned": 120, "prepared": 118, "delivered": 115, "failed": 3, "unaccounted": 2 } } }
```

In this illustrative snapshot, unaccounted = planned - delivered - failed = 2; prepared is an overlapping progress count, not an additional terminal category. Final bucket semantics remain subject to LOT-11 ratification.

No state-mutating event is emitted by `reconcile`; it is a read projection. All five adapter DTOs above are versioned fixtures pending LOT-11 contract acceptance and G-ROUND assignment ownership; they are not accepted delivery contracts.


## 14. Permission checks per channel

Every channel enforces the same predicate: live identity + known granted permission + resource scope. UI hiding is not authorization; unknown permission denies.

| Channel | Guard | Unauthorized result |
|---|---|---|
| REST route (staff) | staff session (SEC-C boundary) + `requirePermission(p, scope)` | `DENIED` |
| Server actions | same server-side guard, not client metadata | `DENIED` |
| Exports/downloads | export permission + resource scope + actor evidence | `DENIED` |
| RPC | function-level permission + scope; unknown permission denies | `DENIED` |
| Realtime subscriptions | permission + scope filter on subscribe and each event | not subscribed / dropped |
| Navigation read | filtered to granted `requiredPermission` | entry absent |
| Settings/audit | `settings.*`/`audit.*` + reauth for sensitive | `DENIED`/`CONFLICT` |

## 15. Negative test cases

1. Anonymous, customer token, and other-staff token against every staff endpoint.
2. Forged or stale staff cookie; cookie replayed from the public-site origin.
3. Cross-origin CSRF POST from a third-party origin; `GET` to a mutating endpoint.
4. Expired and replayed invitation; concurrent invitation acceptance.
5. Expired, replayed and cross-account password-reset proof.
6. Reset that attempts to drop the TOTP requirement.
7. Sign-in without TOTP, with wrong/reused TOTP, and with SMS/phone OTP.
8. Deactivated account using a still-live session; deactivated account re-enabled without Administrator.
9. Non-admin self-escalation to Administrator; Delivery+Administrator and Support+Administrator combinations.
10. Unknown permission key; role-name-based access after a role rename.
11. Out-of-round delivery IDs; out-of-window listing; oversized delivery field projection.
12. Delivery confirm double-tap / concurrent retry; idempotency key reuse with a different payload.
13. Delivery correction without `delivery.correct`; correction that deletes the original event.
14. Delivery fail without a reason or on another round.
15. Support reading an out-of-scope subscriber; Preparation writing to picking/labels.
16. Setting out-of-bounds, wrong-type, stale-version; setting that reopens a frozen day or disables an invariant.
17. Audit export without export permission/actor; audit row UPDATE/DELETE.
18. Post-cutoff logistics action by an Administrator without `logistics.post_cutoff`.

## 16. Implementation / acceptance matrix

| Source ID | Requirement (source-grounded) | Design reference | Independent test | Negative cases |
|---|---|---|---|---|
| SEC-05 | all-staff TOTP; single-use expiring invitations/reset; protected secrets; two named administrators | Â§5, reqs `totp_mandatory_all_roles`, `invitation_single_use_expiry`, `reset_recovery_single_use` | enrollment/secret-never-read; invitation replay/concurrency; reset replay; bootstrap review | missing/reused TOTP; SMS factor; hidden account |
| SEC-06 | validate identity/permission/resource scope on every channel; unknown permission denies | Â§6â€“7, Â§14, reqs `every_channel_authorization`, `permission_not_role_names` | five-role Ã— resource matrix over REST/action/export/RPC/realtime with forged cookies | anonymous/customer/other-staff; unknown permission key |
| SEC-07 | role change/deactivation at next request; prevent self-escalation and forbidden combinations | Â§8, reqs `self_escalation_and_combination`, `deactivation_next_request` | pre-change token loses removed right; combination rejection | self-escalate; Delivery/Support+Administrator |
| SEC-08 | staff origin isolation; host-scoped Secure/HttpOnly cookies; CSRF/Origin; restrictive CORS; GET no side effect | Â§8, req `admin_origin_cookie_session` | cookie attribute + cross-origin replay; CSRF POST; GET-mutation | third-party origin; legacy session on new route |
| SEC-09 | drivers to rounds, preparation to picking/labels, support to necessary data | Â§7, reqs `delivery_round_scoping`, `support_scope_and_exports` | out-of-round ID and oversized export via direct download | other round; Preparation write; support out-of-scope |
| SEC-11 | type/bound/version/audit settings; reauthenticate sensitive; no secret in business tables; cannot reopen frozen days/disable invariant | Â§10, req `typed_audited_settings` | invalid/stale value rejection; old-version recovery; frozen-day reopen | invariant disable; secret in settings |
| D-026 | staff accounts separate from customers; email/password | Â§4, req `staff_identity_separation` | email collision independence; cross-table non-linkage | customer OTP to staff session |
| D-046 | all staff account types and permissions precede menu operations; no temporary/legacy access | req `no_legacy_temporary_access` | every new route enforces real staff identity | founder/legacy fallback |
| D-050 | five launch roles; Kitchen+Preparation allowed; Delivery/Support never +Administrator | Â§6, req `role_permission_matrix` | matrix-driven role-permission check; combination rules | forbidden combinations |
| D-052 | all-staff TOTP; recovery; two named admins; no SMS; no hidden bypass | Â§5, reqs `totp_mandatory_all_roles`, `invitation_single_use_expiry` | mandatory TOTP; bootstrap naming; recovery without hidden account | SMS/hidden bypass |
| D-055 | post-cutoff logistics dedicated default-deny permission; no role overrides hard filters | Â§11, req `staff_action_audit` | logistics permission requirement; hard-filter override denial | Administrator bypass |

## 17. Independent test plans by concern

### 17.1 Privilege escalation

Drive every staff endpoint with each role and assert only the D-050 permission set is honored. Attempt self-grant of Administrator, role reordering, and cross-account role edit as non-admin; assert denial. Capture a token before a role change, apply the change, and assert the next request loses the removed permission. Introduce an unknown permission key and assert universal denial.

### 17.2 Cookie confusion

Set a staff cookie on the staff origin and assert it is `Secure`, `HttpOnly`, `SameSite` and host-scoped. Assert the public site and customer app origins cannot read or replay it. Submit a CSRF `POST` from a third-party origin and assert rejection by Origin check. Assert `GET` to every mutation endpoint produces no state change and that no legacy session protects a new staff route.

### 17.3 Recovery bypass

Replay an accepted/expired invitation and a reset proof; assert single-use and expiry. Reset a password then sign in without TOTP; assert TOTP remains mandatory. Attempt to reuse a proof against a second account and assert denial. Assert reset emits a notification with no OTP/token/secret and revokes prior sessions.

### 17.4 Unauthorized delivery actions

Request another round's delivery IDs, an out-of-window list, and a confirm on an unassigned delivery; assert denial. Double-tap confirm and retry concurrently with the same idempotency key; assert exactly one transition and one outbox event. Correct without `delivery.correct`; assert denial. Fail without a reason or on another round; assert denial. Reconcile planned/prepared/delivered/failed and assert no invented credit or duplicate referral.

## 18. Assumptions and unresolved decisions

These choices are explicitly **not decided** by this proposal:

1. **G-ROUND** (assignment ownership): unresolved. This design does not assume all drivers see all daily deliveries; the `roundId` scope is a placeholder pending the G-ROUND decision (spec NC-1).
2. **LOT-11 delivery adapter**: the delivery model/state and assignment contract is not yet accepted. The adapter interface in Â§12 is a fixture; FR-L1â€“3 cannot be marked delivered before real integration.
3. **Exact staff origin hostname** and cookie `Domain`/`SameSite` policy value: unresolved configuration, not a design decision.
4. **Exact permission-key enumeration** beyond the three spec examples (`menu.publish`, `delivery.confirm`, `subscriber.pause_for`): the Â§6 keys are a proposal pending ratification.
5. **Session durations / device policy**: remain downstream of G-SESSION (SEC-C); not decided here.
6. **Invitation/reset expiry durations, TOTP issuer/label, recovery-code count and retention duration for staff events**: illustrative/unspecified; the exact values need founder/product ratification (D-057 requires retention to have a purpose and duration).
7. **Delivery correction permission key name** (`delivery.correct`) and the logistics permission key name (`logistics.post_cutoff`): proposed, pending ratification.

## 19. No production writes and acceptance scope

This proposal authorizes no production writes, no migrations, no runtime authentication implementation, no message sends and no gate changes. It does not implement TOTP, reset, bootstrap, role enforcement, cookie issuance or delivery confirmation at runtime. `runtimeAcceptance=false` and `productionReady=false`. The companion `B02-C.json` declares the requirements and their independent test plans. Structural validation of this document and the JSON is not semantic task acceptance; independent platform acceptance remains required.


## 20. Factor recovery protocol v1 (design reference)

This protocol handles loss of the TOTP factor. It is not password reset and it never turns a password/email/SMS into an MFA bypass. A pre-enrolled recovery proof plus independently verified current password is the proposed authentication basis. If either is unavailable, recovery remains blocked pending an explicitly reviewed exceptional recovery policy; Support or Administrator cannot mint substitute proof. No new business decision is implied by a successful reference test.

### State and trust boundary
Account states: active, recovery_pending, deactivated. Staff business authorization requires active + currently verified factor + current session epoch. A recovery transaction owns a separate opaque capability with only enroll/complete scope; it is not a staff session. Its record binds accountId, operationId, challengeId, policyVersion, expiry and revision. Recovery proof records are account-bound, purpose staff.mfa.recovery, pre-enrolled, expiring and single-use; store only protected proof verifiers. Never persist plaintext recovery codes in business/audit tables.

The executable reference consumes trusted verifier facts (passwordVerified, proofVerified, newFactorVerified, invitationVerified, operatorAuthorized) for isolated tests. These booleans are NOT HTTP fields or client claims. B02-I must derive them inside server/provider adapters and test forged client fields independently. The reference has no cryptography, provider calls, database, mutex or production token issuer.

### Versioned commands
- POST /v1/staff/auth/mfa-recovery/start: version=1, recoveryProof, password, operationId. The server resolves the account and proof, checks policy/expiry/active state, locks the account then proof, consumes the proof once, increments the session epoch (revokes all old sessions), and creates recovery_pending plus audit/notification intent in one transaction.
- Response: version, requestId, code and an opaque recovery-only capability. No staff cookie/session or historic business data. Failure responses are non-enumerating and reveal no proof/account state.
- POST /v1/staff/auth/mfa-recovery/enroll: version=1, recovery capability, operationId. Provision a replacement factor using a purpose-limited protected enrollment flow. No normal staff access.
- POST /v1/staff/auth/mfa-recovery/complete: version=1, recovery capability, operationId, newFactorCode. Verify the new factor bound to this transaction, then atomically replace the active factor, invalidate old factor and remaining recovery proofs, increment session epoch, consume the recovery capability, append audit and security-notification intent and set active. Return no session; require a fresh normal sign-in with password and new TOTP.

Each state change uses compare-and-set revision plus database transaction/unique consumption constraints. Idempotent response recovery is scoped to the already authenticated operation and must never expose proof or create a second effect. Concurrent and cross-account proof use fails. Rollback preserves the entire previous state and outbox; a partial external-provider outcome requires reconciliation before active status.

### Interruption and expiry
A failed or expired enrollment never restores normal access or reuses a consumed proof. Account remains recovery_pending and no business session is issued. A replacement recovery attempt requires a DIFFERENT valid pre-enrolled proof and the current password, supersedes the old challenge, and preserves revocation. If none remains, deny and raise the unresolved exceptional-recovery case. No hidden support override.
Deactivation wins over recovery: completion rechecks live account status and fails closed. The old TOTP factor cannot authorize recovery_pending.

Audit/notification payloads contain IDs, action, policyVersion and server time only; no password, email, OTP, raw proof, provisioning secret or session token. Notifications are outbox intents, not sends made by the design fixture.

## 21. Two-administrator bootstrap protocol v1 (design reference)

The first Administrator cannot invite itself through ordinary authenticated APIs. Provisioning therefore uses an explicit, audited deployment-time operator ceremony, separate from staff login. Before opening bootstrap: verify operator authority, an empty staff bootstrap state, and an approved manifest containing exactly two distinct named identities. Real names/contacts are configured securely; fixtures use synthetic IDs. The operator ceremony is not a permanent credential or a public endpoint.

Persist one manifest ID and its two intended identity bindings. State transitions: uninitialized -> open -> sealed. Bootstrap creates only those two Administrator invitations, expiring and single-use. Each individual proves its own invitation binding and completes password and TOTP enrollment. Until BOTH enrollments are verified and the manifest is sealed, neither account receives business authorization; partial onboarding remains usable solely for that person's enrollment.

For each enrollment, atomically consume invitation and record password/factor verification under manifest revision. On the second verified identity, atomically seal the manifest and activate precisely the two enrolled accounts. Persist a permanent sealed marker; ordinary provisioning cannot clear it. All later accounts use normal authenticated invitations. A third identity, reused invitation, duplicate identity, concurrent stale revision, wrong manifest or unauthorized operator is denied.

After interruption following the first enrollment, resume from persisted manifest and completed identity; do not recreate that account, reopen a consumed invitation or enable an emergency staff account. Expired invitation replacement requires the same authorized operator ceremony, same named identity/manifest and a newly audited single-use invitation; it does not reset prior completion or extend arbitrary staff privileges. After sealing, bootstrap-specific capabilities are revoked and cannot be used again. Disaster recovery is a separately reviewed operational procedure, not a reopen flag.

Database/provisioner integration tests must inject crashes before/after the sealing transaction and verify only one permanent completion, no partial active administrator and historical audit retention. The sequential reference checks represent transitions, not a claim of concurrent database correctness.

## 22. Canonical permission keys and executable evidence

The Â§6 matrix uses exactly menu.publish and subscriber.pause_for, matching the literal spec examples. menu.weekly.publish and subscriber.act.pause are NOT implicit aliases; requests/grants containing them fail unknown-permission validation. Renaming display labels does not change stable permission keys. Other proposed keys remain proposal data awaiting review; this does not reopen the five ratified launch roles or their prohibited combinations.

Administrator is not a runtime wildcard. Materialize its ordinary known grants; logistics.post_cutoff is never derived from role membership. Every request checks an explicit scoped logistics grant in addition to normal permission, live identity, resource scope, audit reason and hard safety constraints. The reference requires trusted riskCleared and lifetimeValid facts as well as a live session; deriving these facts from current server/provider state remains an integration obligation. The reference checks the core predicate only; all-channel, database and actual browser-origin enforcement remain B02-I integration obligations.

Run: node --test specs/003-staff-accounts-admin-shell/contracts/staff-reference.test.mjs

The reference suite exercises factor-recovery transitions, replay/stale revisions, bootstrap sealing, known permission keys and instant equivalence. It proves only these design-model examples. It does NOT prove provider MFA, atomic SQL, production secrets/cookies, deployment or complete B02-C semantic acceptance. Independent review and the qualified Ekwip acceptance path remain required.
