# Slice 3 — Staff Accounts & Admin Shell

Requirements aligned from the supplied draft; implementation unverified. Product D IDs use docs/delivery/product-baseline.md. LOT-02 first prepares the permission matrix, auth/recovery and API contracts; delivery adapters require LOT-11 contract acceptance.

**Aligned specification — 18 October 2026; D-052/055/057/058/060 applied.** Prerequisite of slice 002 (menu authoring, J5) and of the admin panel (D-024). Written under D-057, D-017, D-026, D-046, D-050. Statuses: **[O]** observed on Calo, **[F]** FitNest's own choice, **[NC]** needs the founder.

**Scope:** staff identity, roles and permissions, and the empty admin surface into which every staff screen will be placed. No business screen is built here — slice 002 brings the first (menu composition, consolidation). Customer identity is slice 001 and stays untouched.

---

## Purpose

Every operational screen needs someone signed in with a role: the kitchen composes and publishes menus, the delivery role confirms deliveries — the event that sends the day's WhatsApp message and locks the delivered meals (D-039, D-044, D-050) — support acts for a subscriber, the administrator changes settings that are all in tables (D-057). Slice 001 built customer identity by phone and OTP (D-013) and explicitly excluded staff (D-026). Nothing in the product can be operated until this exists, and it is small.

---

## Vocabulary

- **Staff account** — a person who works for FitNest, in a table separate from customers, signing in with email and password (D-026).
- **Role** — a named set of permissions, a row. Five at launch (D-050): Administrator, Kitchen, Delivery, Support, Preparation. A role is configuration; adding one is not a development.
- **Permission** — a capability a role grants, a row (e.g. `menu.publish`, `delivery.confirm`, `subscriber.pause_for`). Screens and actions check permissions, never role names.
- **Admin shell** — the web surface for staff: sign-in, navigation, the frame every staff screen lives in.

---

## User scenarios

**The founder creates the first accounts**
Given the founder signed in as Administrator
When they create a staff account with an email and one or more roles
Then the person receives an invitation to set their password
And the account cannot sign in until the password is set

**The kitchen lead signs in**
Given a staff account holding Kitchen and Preparation
When they sign in with email, password and TOTP on the separate admin web surface
Then they see only the navigation entries their permissions allow
And a screen they are not permitted to see is not reachable by URL either

**A delivery person confirms a delivery**
Given a staff account holding Delivery
When they mark a subscriber's delivery for day J as delivered
Then the moment is stamped, the subscriber's day J shows "delivered at HH:MM", the delivered meals lock, and the transactional message is queued (D-039)
And this account cannot open menus, settings or subscriber details

**Support acts for a subscriber**
Given a staff account holding Support
When they pause or skip on behalf of a subscriber
Then the action is recorded in the subscriber's event history with the staff actor (slice 002 FR-D3), distinguishable from an action the subscriber took

**A role changes**
Given the Administrator edits the permissions of a role
When they save
Then every account holding that role gets the new set at its next request, without redeployment

**A person leaves**
Given the Administrator deactivates a staff account
When that person tries to sign in
Then they cannot; existing sessions lose access on the next request, and past actions keep attribution under the retention policy

---

## Functional requirements

### Identity
- **FR-S1** Staff identity is separate from customers; sign-in uses email/password plus mandatory TOTP for every role. Protect password/MFA secrets; enforce strength, bounded sessions and recovery policy. Same email does not implicitly link to a customer (D-026/052).
- **FR-S2** Administrator invitation is expiring and single-use, with account/password/TOTP enrollment before access. No public self-registration. Bootstrap two named administrators through a documented one-time procedure; no permanent backdoor.
- **FR-S3** Password reset/recovery uses single-use expiring proof and defined MFA recovery. Revoke affected sessions and audit/notify security changes. Password reset alone must not silently bypass TOTP.
- **FR-S4** Deactivate staff and revoke existing authorization at the next request. Preserve historical actor references under retention policy; no deletion erases audit.

### Roles and permissions
- **FR-R1** Roles and grants are rows; accounts may hold permitted combinations. Each server action enforces permission plus resource scope and live identity. Unknown permissions deny. Security invariants are code/database guarantees, not editable grants (D-057).
- **FR-R2** Launch roles and their permission sets (D-050):
  - **Administrator** — every permission, including settings, prices, plans, meal types, cutoff parameters (D-044, D-048), staff accounts and roles.
  - **Kitchen** — dishes and nutrition sheets (D-041), weekly menu composition and publication, consolidation, unresolved-slot views.
  - **Delivery** — the day's delivery list for their round, delivery confirmation, delivery issues. Nothing else.
  - **Support** — read a subscriber's account and history, act for them (pause, skip, address, slot) within the same rules as the subscriber, read the event ledger.
  - **Preparation** — picking lists and labels, read-only.
- **FR-R3** At launch the kitchen lead holds Kitchen and Preparation; Delivery and Support are never combined with Administrator on one account [F, D-050].
- **FR-R4** Authorize all APIs, actions, exports, RPC and realtime; UI hiding is not authorization. Role edits cannot self-escalate or bypass forbidden combinations. Revocation/role changes apply to existing sessions at the next request.

### Admin shell
- **FR-A1** A web surface at its own address, separate from the public site and from the customer app, with sign-in, a navigation built from the account's permissions, and a frame (header with the signed-in person and role, sign-out).
- **FR-A2** Navigation entries are rows tied to permissions, so a new screen registers itself without touching navigation code.
- **FR-A3** Typed/bounded versioned settings show value/unit/version/actor/time and change impact. Reauthenticate sensitive changes; no secret or safety invariant is administrable. Changes cannot reopen frozen days (D-057).
- **FR-A4** Record staff action, target, reason, actor and server time in restricted immutable history; minimize payloads and audit exports. Logistical post-cutoff actions need dedicated permission, not Administrator bypass (D-055).

### Delivery confirmation (the one action built here)
- **FR-L1** Driver sees only deliveries explicitly assigned to their round in the useful time window, with minimum necessary contact/address/slot/bag/notes data. Consumption and physical delivery dates are distinct (D-058). G-ROUND defines assignment ownership before implementation.
- **FR-L2** Confirm delivery with authorized resource scope, server timestamp, stable idempotency key and atomic transition/outbox. UI shows actual delivery time; first-delivery reward and notifications consume the same authoritative event. Corrections require separate permission/reason and append events; no deletion or duplicate referral credit (SEC-10/27).
- **FR-L3** Failure records an authorized reason and exception owner; retry/compensation follow the accepted policy, not an invented credit. Reconcile planned/prepared/delivered/failed (D-060).

---

## Key entities

- **Staff account** — email, password hash, display name, active flag, roles.
- **Role** — name, description. **Permission** — key, description. **Role permission** — the link.
- **Navigation entry** — label, route, required permission, order.
- **Setting definition/version** — key, validated type/bounds, immutable version, actor/time and effective use.
- **Delivery** — subscriber, delivery date, address, slot, assigned to, status, confirmed at, confirmed by, failure reason.
- **Staff event** — actor, action, target, moment, payload.

---

## Out of scope

- Any business screen beyond delivery confirmation: menus, consolidation, subscriber views come with slice 002 and later slices.
- Round planning and route optimisation — the Delivery role receives a list; who builds it is a later slice.
- Customer phone-OTP authentication belongs to 001; staff TOTP is mandatory in this slice.
- Customer identity — slice 001, unchanged.

---

## Operational shell and dependencies

The first operational landing is the prioritized exception queue (D-060), implemented with LOT-13: severity, owner, deadline, state, safe scoped action and history. No global retry-all button. LOT-11 supplies delivery model/state and assignment contract; fixture contracts may precede its runtime, but FR-L1–3 cannot be marked delivered before real integration.

NC-1 is G-ROUND: do not assume all drivers see all daily deliveries because launch may have one driver. NC-2 is closed by D-055: Support follows customer rules unless explicitly granted scoped logistics exception; no hard safety override exists.

SEC-05–11 plus SEC-29/30/32 must be covered. Test every role against direct APIs, other driver's delivery, restricted exports, session deactivation, reset/invitation replay, self-escalation and cross-origin mutations. Separate admin origin and host-scoped protected cookies are required. No legacy session protects a new route. No tests are reported as passed by this specification.
