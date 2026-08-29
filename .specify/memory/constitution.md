<!--
Sync Impact Report (v4.1.0)
- Version change: 4.0.0 → 4.1.0 (MINOR: Article V materially expanded — the
  founder's previous arbitration extended a customer-designed model to staff;
  corrected)
- Modified principles:
  - Article V — Identity & Account, restructured into three populations:
    - CUSTOMERS: phone remains the anchor; the OTP is clarified as a number
      VERIFICATION mechanism, not a session mechanism — long-lived sessions on
      verified devices, re-challenge only on session loss or device change.
    - STAFF (new): separate table and lifecycle, credentials + password,
      SMS never used for internal sessions, roles as data, no hardcoded or
      committed credentials, at least two administrative accounts at all times.
    - CORPORATE: unchanged (customer account + company code).
- Added sections: none
- Removed sections: none (v4.0.0's "No password exists anywhere in the
  product" is superseded: passwords exist for STAFF only)
- Follow-up notes:
  - Migration draft B (identity purge/rebuild) is invalidated: users.password
    and the sessions table migrate to the staff model instead of being dropped.
    New draft deferred to the slice-1 spec (cohort/wallet columns land there).
  - SMS provider: open question recorded in docs/decisions-log.md — blocks
    implementation, not specification.

Previous report (v4.0.0):
- Version change: 3.0.0 → 4.0.0 (MAJOR: full rewrite; scope premise corrected,
  Article II inverted, Article I redefines one-off purchase as deferred)
- Scope change: "mobile-only repository consuming an externally-owned database"
  (false premise of v1–v3) → single monorepo, one database, two surfaces
  (apps/web, apps/mobile), shared business logic in packages/core.
- Modified principles:
  - Article I — Product Truth: one-off purchase is no longer unconstitutional;
    it is a deferred separate order type the architecture must accommodate
    without rework. Adds the daily basket floor concept (monetary, per plan).
  - Article II — was "Backend Authority" (no migrations from this repository),
    now "Schema Discipline": the project owns its schema; migrations are
    proposed → reviewed → applied, never self-granted by an agent; Supabase
    migrations are the single canon; types generated, never hand-maintained;
    entities linked by identifier, never by title.
  - Article III — Scope Discipline: recast from forbidden to deferred-but-
    accommodatable; Calo-parity rule kept with recorded-deviation escape hatch.
  - Article VIII — Payments: unchanged in substance; adds the eliminating
    criterion (recurring tokenised charging).
  - Old Article IV (Mobile Experience) → Article X (Experience Standards),
    now mobile-first on both surfaces; adds delivery-zone-before-configuration.
  - Old Article V (Language & Copy) and VI (Brand) folded into Article X.
  - Old Article VII (Accounts) → absorbed into Article V (Identity & Account).
  - Old Article XI (Quality Gates) → Article XI, extends critical paths to
    identity and wallet ledger; mandates the full Spec-Kit flow and specs/
    artefact layout.
  - Old Article X (Governance) → Article XIII, unchanged in substance.
- Added sections:
  - Article IV — Pricing Engine (TTC-inclusive amounts, integer centimes,
    VAT by subtraction at one point, frozen VAT rate, per plan × meal-type
    cell pricing, monetary basket floor, server-authoritative preview)
  - Article V — Identity & Account (phone + OTP sole anchor, no passwords,
    email nullable until payment)
  - Article VI — Subscription Configuration (server-persisted draft, atomic
    creation, Mifflin-St Jeor, nullable target)
  - Article VII — Wallet (append-only ledger, rewards never shift billing)
  - Article IX — Cohort Instrumentation (unrecoverable-from-day-one fields)
  - Article XII — Traceability (surface/market/status on every rule,
    calo-reverse-engineering-report.md and decisions-log.md as instruments)
- Removed sections: none (all prior content superseded or absorbed)
- Follow-up TODOs:
  - Article XII instruments do not exist yet: calo-reverse-engineering-report.md
    and decisions-log.md are referenced but absent from the repository.
  - supabase/migrations/ (the declared single canon) does not exist; current
    migrations live in packages/db/migrations. Consolidation decision pending.
  - Conflicts between this constitution and existing code are reported
    separately (see conversation report of 2026-08-29); nothing corrected.
-->

# FitNest Constitution

**Version:** 4.1.0
**Ratified:** 26 August 2026
**Last Amended:** 29 August 2026
**Scope:** The entire FitNest product — one repository, one database, two surfaces (`apps/web`, `apps/mobile`), shared business logic in `packages/core`.

This document supersedes all previous versions. It replaces v3.0.0 in full.

**Why MAJOR:** v1–v3 were written on the false premise of a mobile-only repository consuming a database it did not own. That premise produced Article II (no migrations from this repository), which is untenable now that the project is correctly understood as a single monorepo owning its own schema, and Article I, which made one-off purchase unconstitutional rather than deferred. Both are replaced.

---

## Article I — Product Truth

FitNest sells a **recurring meal plan subscription**, not individual meals.

A subscription is configured along three axes — plan (from the active catalogue), meal composition (meal types per day), and delivery rhythm (days per week, subject to a minimum) — and is committed over a billing cycle. Cycles and their pricing are defined by data, not by code.

**A subscription is never sold as a basket.** It is configured, not assembled: no per-dish selection, no per-item checkout, no "add this meal to my order" inside the subscription flow.

**One-off purchase is a separate order type.** Express Shop and upsells are not built in V1, but the architecture must accommodate them without rework. Identity, account, wallet, pricing, and delivery are shared spines serving both order types. A design choice that makes one-off purchase or upsell expensive to add later is a defect, not a scope decision.

Both surfaces render the catalogue, the available cycles, and the configuration rules exactly as the database returns them. Therefore:

- No hardcoded plan names, cycle durations, minimum-day thresholds, delivery-fee rules, VAT rates, discount values, or basket floors anywhere in application code.
- No plan-specific or cycle-specific branching. Every plan and every cycle renders through the same generic path.
- Adding a plan, adding a billing cycle, changing the minimum days per week, or making delivery free on a cycle must require zero code changes and zero app store releases.

---

## Article II — Schema Discipline

The project owns its schema. This is not a prohibition on migrations; it is a discipline about how they happen.

- **Production Supabase is the reference state.** Every migration starts from the introspected existing schema, never from a schema reconstructed from memory or from an outdated declaration file.
- **A migration is proposed, reviewed, then applied.** Never generated and applied in the same movement. Never applied by an implementation agent on its own initiative.
- **A business rule discovered during implementation halts the task and is escalated.** It is not resolved in code. Inventing a table, a column, or a default to unblock yourself is a violation.
- **Supabase migrations are the single canon.** No second schema declaration system. TypeScript types are generated from the database, never hand-maintained in parallel.
- **Entities are linked by identifier, never by title.** No lookup, join, or repricing keyed on a plan name or any other human-readable label. A rename must never change behaviour.

---

## Article III — Scope Discipline

Deferred until explicitly reopened: Express Shop, upsells, custom macro plan builder, extended referral mechanics, gamification, in-app chat.

**Deferred means not built. It does not mean impossible.** Article I governs what the architecture must remain able to accept. A spec that builds a deferred feature is non-compliant; a design that makes a deferred feature costly to add later is equally non-compliant.

Nothing is built that Calo does not have, unless the deviation is a recorded decision with a stated reason.

---

## Article IV — Pricing Engine

All prices stored and displayed are **VAT-inclusive (TTC)**. The pre-tax amount is derived, never the reverse.

```
prix_jour     = Σ price(plan, meal_type)      -- per plan × meal-type cell
prix_semaine  = prix_jour × days_per_week
prix_plan     = prix_semaine × weeks(cycle) × (1 − cycle discount)
total         = prix_plan + delivery_fee
```

- **All amounts are integer centimes.** No floating point anywhere in the pricing engine.
- **VAT is decomposed at exactly one point, at the end:** `HT = round(total / 1.10)`, then `VAT = total − HT`. VAT is computed by **subtraction, never multiplication**, so the three invoice lines always reconcile to the displayed total.
- The payment summary shows a **single TTC amount**. The HT / VAT / TTC breakdown appears only on the invoice.
- The VAT rate is a configured value, and the rate applied is **frozen on each subscription** at the moment of sale.
- Prices are differentiated **per (plan × meal type) cell**, not per plan globally.
- A **daily basket floor in monetary value**, configured per plan. No composition constraint: three breakfasts or four snacks pass if the amount is sufficient.
- **The client never computes an authoritative price.** Preview is a debounced server call, cached per configuration, with a skeleton while loading. A local number is never displayed as final.
- The total sent to payment is recomputed and frozen server-side. Where preview and server disagree, the server wins and the interface updates before confirmation.

---

## Article V — Identity & Account

**CUSTOMERS**

- Phone number is the identity anchor, verified by one-time code at
  signup. No password.
- The one-time code VERIFIES the number. It is not the session
  mechanism: a verified device holds a long-lived session and is not
  re-challenged on every return. A new code is sent only when the
  session is lost or the device changes.
- One phone number is one account, shared across web and mobile.
- Email is nullable at account creation, mandatory before payment. It
  serves invoices and communication, never identification.
- Biometric or device sign-in may be layered on as convenience.

**STAFF**

- Staff accounts are separate from customer accounts, in their own
  table, with their own lifecycle. A staff member is granted a role,
  changes role, and is revoked — none of which applies to a customer.
- Staff authenticate with credentials and a password. SMS is not a
  session mechanism for internal use.
- Roles are data. No hardcoded email, no auto-regenerating account, no
  credential of any kind committed to the repository.
- At least two staff accounts hold administrative rights at all times,
  so that losing one device never locks the business out of its own
  back office.

**CORPORATE**

- FitNest Pro accounts are standard customer accounts carrying a company
  code attribute. No parallel auth path.

---

## Article VI — Subscription Configuration

- The in-progress configuration is a **server-persisted draft** attached to the account, resumable on any surface. Never an object in browser local storage.
- Subscription creation is **atomic**: it either succeeds entirely or fails visibly. A partial state that leaves the customer with a confirmation and no subscription is a critical defect.
- Calorie target = `BMR (Mifflin-St Jeor) × activity multiplier`. **The goal never modifies the value** — it determines which questions are asked.
- The target is **indicative and never blocks** validation. `target_kcal` is nullable; the "eat healthy" branch collects no metrics and produces no target. Every screen rendering it needs a null path.
- On goals with a target weight, equality is rejected: strictly below or strictly above according to direction. Write the message from the behaviour, not from Calo's looser copy.

---

## Article VII — Wallet

- Every account has a wallet: a balance plus an **append-only ledger**. Entries are never modified or deleted.
- Referral rewards, service credits, and refunds all land in the wallet. They **never shift a billing date**.
- A gifted day is worth the beneficiary's current subscription rate.

---

## Article VIII — Payments

Meal delivery is a physical good. Apple In-App Purchase and Google Play Billing are **not required and must not be integrated**.

The payment processor is a Moroccan gateway, **not yet selected**. No processor SDK, brand name, or vendor-specific data model appears anywhere in this repository until that decision is made. The eliminating criterion is support for **recurring tokenised charging**.

The client never talks to a processor directly. It calls a FitNest server endpoint that returns an opaque payment session. Card data, PAN and CVV never touch application code or local storage. Subscription activation is confirmed server-side; a local success callback alone never activates anything.

Legal pages — terms of sale, privacy policy, refund and cancellation terms — are a **blocking dependency** of this feature, not a follow-up task.

---

## Article IX — Cohort Instrumentation

This is the only requirement in the product that **cannot be recovered later**. If it is not captured from the first subscriber, the retention curve is permanently lost.

Each account permanently records: claim date, admission date, first subscription date, first completed delivery date, acquisition source, and referring account where applicable. Each subscription permanently records its billing cycle at purchase and its end date.

These are historical record. Once written, they are never overwritten by later activity.

---

## Article X — Experience Standards

- **Mobile-first on both surfaces.** 95% of traffic is mobile.
- One decision per screen in the subscription flow. Never a single long scrolling form.
- Bottom sheets, not centre modals. Minimum 44pt touch targets. Sticky, thumb-reachable primary action.
- **Delivery zone is resolved before configuration**, not at checkout. Nobody builds a full basket to discover they cannot be served.
- Read-tolerant offline: menus and the active subscription render from last-known state. Writes may fail loudly; reads never show a blank screen.
- All user-facing copy is French. Code, comments, commits, specs, and this document are English.
- Brand: structural green `#005033`; graphic orange `#E0633A` for graphic elements only, never text; accessible orange `#B8481F` for buttons and labels; white background. No dark mode in V1.
- No health or certification claim that cannot be substantiated. Macros are displayed on every dish; a dish without macro data is a data error, not a rendering edge case.

---

## Article XI — Quality Gates

- Tests are mandatory on critical paths: pricing, subscription creation, identity, wallet ledger.
- Every feature is developed on its own branch, with a pull request and a green CI (lint, typecheck, tests) before merge.
- TypeScript strict. Dependency versions pinned; `latest` is forbidden.
- The Spec-Kit flow is mandatory for every feature: constitution → specify → clarify → plan → tasks → analyze → implement.
- Feature artefacts live in `specs/NNN-name/`. Ad-hoc markdown files at the repository root are deprecated in favour of `specs/` and `docs/`.

---

## Article XII — Traceability

- **Every business rule carries its surface** (web or mobile), **its market** where it derives from a Calo observation, and **its status**: measured, derived, or assumed.
- **Never combine readings from different markets or different sessions** in one calculation.
- Every proposal is checked against `calo-reverse-engineering-report.md` before being written. Where a new observation contradicts an existing measurement, surface the contradiction rather than arbitrating silently.
- Calo runs different flows on web and app. Never transpose an observation from one surface to the other without saying so.
- A decision is recorded in `decisions-log.md` before work continues.

---

## Article XIII — Governance

1. This constitution supersedes any conflicting instruction in a spec, plan, or task file.
2. `/speckit.plan` must state, for each article, whether the plan complies or requires an exception.
3. A requested exception halts the workflow and is escalated. An agent never grants itself an exception.
4. Amendments are made by editing this file, with a dated entry below. They are never made implicitly by an implementation choice.
5. Where this document and existing code disagree, this document wins and the code is a defect.

---

## Amendment Log

| Date | Version | Change |
|---|---|---|
| 2026-08-26 | 4.0.0 | Full rewrite for monorepo scope. Article II inverted from prohibition to migration discipline. Article I no longer forbids one-off purchase. Article III recast as deferred, not impossible. Pricing, identity, wallet, cohort and traceability articles added from locked decisions. |
| 2026-08-29 | 4.1.0 | Article V restructured into CUSTOMERS / STAFF / CORPORATE. The OTP verifies the number and is not the session mechanism. Staff accounts get their own table, credential + password auth, roles as data, and a two-admin floor. Corrects the founder's earlier arbitration that extended the customer model to staff. |
