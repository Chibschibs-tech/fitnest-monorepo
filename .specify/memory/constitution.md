<!--
Sync Impact Report — v4.4.0 (2026-10-24)
Consolidates governance.md's five-article alignment from existing D-003/005/007/018,
D-033/040/052/053/057/059/061/062/063 and related recorded invariants. Ports PR5's
founder-arbitrated v4.3 text (blob 5863f764016f1cf123994ffe414e444591cc50b9).
No new prices, session durations, provider, recovery evidence or production authority.
All historical reports and amendment rows are retained. G-CONSTITUTION is not
self-approved by this proposal; T013 and every other unresolved gate remain intact.
-->

<!--
Sync Impact Report (v4.2.0)
- Version change: 4.1.0 → 4.2.0 (MINOR: new Article XIV — Evolvability)
- Added sections:
  - Article XIV — Evolvability: the product gains and reshapes capabilities
    continuously across all surfaces; no design may assume the current feature
    set is final. Five principles: business rules live in data (a new plan,
    cycle, coupon type, delivery zone, or partner is a row, not a release);
    every surface consumes the same shared engine (per-surface reimplementation
    is a defect); capabilities are added by extension, not rewrite; data that
    cannot be reconstructed later is captured from day one even if unconsumed;
    deferred is not forbidden (Article III governs what is built, XIV governs
    what must remain possible).
- Modified principles: none (Article XIV generalises the spirit already present
  in Articles I, III and IX without changing their text)
- Removed sections: none
- Follow-up notes:
  - Conflicts between Article XIV and existing web code (hardcoded cycle
    durations, day minimums, delivery fees, meal minimums) reported separately
    on 2026-08-30; nothing corrected.
  - First application: the admission queue is specified as a switchable
    operating mode (spec 001, FR-048–051).

Previous report (v4.1.0)
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

<!--
Sync Impact Report — v4.3.0 (2026-09-08)
Amended: Article VIII (the server creates the payment session; card details
are entered on the processor's hosted surface, never on a FitNest surface);
Article X (user-facing copy served in French AND English — D-033); Article XIV
(versioned parameters vs non-disablable invariants — D-057).
Bump: MINOR (4.2.0 → 4.3.0). No article removed or renumbered.
Downstream: spec 001 already amended on branch 001-identity-account-admission
(D-053/D-057/D-058/D-059); templates unaffected. Known code divergence:
user-facing copy is currently FR-or-EN per page, bilingual serving becomes
the standard going forward (Article XIII.5: code is the defect).
-->

# FitNest Constitution

**Version:** 4.4.0
**Ratified:** 26 August 2026
**Last Amended:** 24 October 2026
**Status:** Proposed consolidation of already recorded founder decisions; merge and gate evidence remain separate.
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

All stored and displayed commercial amounts are **VAT-inclusive (TTC) integer centimes**. Invoice net and tax are derived from the frozen total and applied VAT version, never calculated independently.

- Price cells are identified by plan and meal-type IDs. Quantities contribute to the daily calculation; display labels never select a pricing rule (D-003/005).
- The monthly cycle supplies the reference daily price. The weekly rule adds a configured flat daily premium; the quarterly rule applies a configured percentage discount. Cycle identities, durations and rule parameters are data, not branches keyed on plan/cycle names (D-006/007).
- Delivery is charged on the weekly cycle and included from the monthly cycle, through configured cycle rules. Trial pricing remains explicit reference data; a trial never silently inherits recurring billing (D-008/014/062).
- A configured monetary basket floor governs validity; no arbitrary meal-type combination replaces it (D-009/010).
- The server calculates the preview using identity, configuration and rule versions. Preview is debounced and cached in that context; the client cannot select authoritative discounts or totals (D-018).
- The server recomputes and freezes the accepted quote before payment. Applied prices, discount/cycle rules, delivery and VAT versions remain attributable to the sale.
- The payment summary shows one TTC total. The invoice derives HT once with the agreed rounding contract and calculates VAT as `TTC - HT`, so all lines reconcile exactly. No floating-point commercial arithmetic.
- The recorded VAT assumption is reference data, not a legal certification. The live MAD grid, rounding fixtures, eligibility and stacking rules remain subject to G-COMMERCIAL; this article does not fabricate them.

---

## Article V — Identity & Account

**CUSTOMERS**

- A stable internal customer identity owns history, subscriptions and wallet entries. A phone number is a verified entry credential; changing or recovering it never transfers ownership merely because another party controls that number (D-053/063).
- Phone OTP verifies the number; it is not the session mechanism. Customers have no password. Ordinary same-device returns use bounded sessions without another SMS.
- Access tokens are short-lived. Refresh is rotating with replay detection; idle and absolute bounds and immediate server-side revocation are enforced. Exact lifetimes, device concurrency and risk thresholds require the G-SESSION ADR; unlimited sessions are not an acceptable fallback.
- After inactivity or risk, phone OTP alone cannot unlock historical data. Require an independent previously verified email proof bound to the account and action. Unavailable validation denies access.
- Email may be absent at initial claim, but is required and verified before payment and remains unique. A newly supplied email, delivery knowledge, a support assertion or the challenged factor alone does not establish ownership.
- When independent factors are unavailable, follow audited assisted recovery under G-RECOVERY; do not silently unlock history, merge identities or invent an evidence threshold.
- Number recovery is recorded and notified. Trial eligibility retains phone-number history. Legacy identities are not merged into customer_accounts or admitted through an alternate public registration route.
- Device or biometric convenience never bypasses these server-side ownership checks.

**STAFF**

- Staff and customer identities, account lifecycles, authentication and authorization are separate. Customer OTP or a customer session never establishes a staff identity.
- Staff authenticate with email/password and **mandatory TOTP for every staff type** (D-026/052). No SMS second factor or hidden bypass account.
- At least two named administrators and an audited recovery procedure prevent operational lockout without weakening authentication.
- Roles and permissions are data and deny by default. Delivery and Support cannot combine Administrator; Kitchen may combine Preparation (D-050). No hardcoded/auto-regenerating staff account or repository credential.

**CORPORATE**

FitNest Pro uses the ordinary customer identity with a company-code attribute, not a parallel authentication path.

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

The client never talks to a processor directly. **The FitNest server creates the payment session**; the client receives only an opaque reference to it. **Card details are entered on the processor's own hosted surface — never on a FitNest surface.** Card data, PAN and CVV never touch application code or local storage. Subscription activation is confirmed server-side; a local success callback alone never activates anything.

Recurring charging requires explicit amount/frequency, versioned acceptance, a valid recurring mandate and a one-gesture opt-out. A trial does not renew automatically. Due-date idempotency, server-confirmed payment state and billing reconciliation prevent duplicate or fictitious activation (D-062). Cancellation/refund effects and the live processor remain separately gated; no defaults are invented here.

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
- Subscriber life is in the native app. The website acquires, configures and takes payment, then hands over. Its authenticated rescue exit is limited to one-line subscription status, WhatsApp help and cancellation under the app's rules; it is not a web meals, wallet or preferences portal (D-040/061).
- All user-facing copy is served in **French and English** (D-033). Code, comments, commits, specs, and this document are English.
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

## Article XIV — Evolvability

The product will gain and reshape capabilities continuously across all
surfaces — web, mobile, admin, and whatever comes next. No design may
assume the current feature set is final.

- **Business rules live in data, never in code.** Adding a plan, a
  billing cycle, a coupon type, a delivery zone, or a partner is a row,
  not a release.
- **Every surface consumes the same shared engine.** A rule is
  implemented once and served everywhere. A rule reimplemented per
  surface is a defect, not a variation.
- **Capabilities are added by extension, not by rewrite.** A design that
  requires touching unrelated code to add an adjacent capability has
  failed this article.
- **Data that cannot be reconstructed later is captured from day one**,
  even when the feature that consumes it is not built yet. Absence of a
  feature is never a reason to discard a fact.
- **Deferred is not forbidden.** A feature listed as out of scope must
  remain cheap to add. Article III governs what is built; this article
  governs what must remain possible.
- **Configured values are versioned parameters; guarantees are
  invariants** (D-057). Every setting is typed, bounded, and versioned
  with an immutable change history — who changed it, when, to what.
  Invariants — append-only ledgers, write-once historical dates,
  deny-by-default access — are never expressible as settings, and no
  configuration can disable them.
- Ownership, ledger integrity, hard food compatibility and payment verification are non-disableable invariants. No role or setting bypasses them. Every retained datum has an attributable purpose and bounded retention policy (D-054/055/057).

---

## Amendment Log

| Date | Version | Change |
|---|---|---|
| 2026-08-26 | 4.0.0 | Full rewrite for monorepo scope. Article II inverted from prohibition to migration discipline. Article I no longer forbids one-off purchase. Article III recast as deferred, not impossible. Pricing, identity, wallet, cohort and traceability articles added from locked decisions. |
| 2026-08-29 | 4.1.0 | Article V restructured into CUSTOMERS / STAFF / CORPORATE. The OTP verifies the number and is not the session mechanism. Staff accounts get their own table, credential + password auth, roles as data, and a two-admin floor. Corrects the founder's earlier arbitration that extended the customer model to staff. |
| 2026-08-30 | 4.2.0 | Article XIV — Evolvability added: business rules in data, one shared engine for all surfaces, extension over rewrite, unrecoverable data captured from day one, deferred stays cheap to add. First applied to the admission queue, specified as a switchable operating mode. |
| 2026-09-08 | 4.3.0 | Article VIII: the server creates the payment session and card details are entered on the processor's hosted surface, never on a FitNest surface. Article X: user-facing copy served in French and English (D-033). Article XIV: versioned parameters (typed, bounded, immutable change history) distinguished from non-disablable invariants (D-057). |
| 2026-10-24 | 4.4.0 (proposed) | Consolidate the recorded quantity/cycle pricing, stable identity and bounded recovery, staff TOTP, explicit recurring consent, native subscriber/web rescue boundary and non-disableable safety/ownership invariants. Port PR5 v4.3 without losing history. No operational values or production authority granted. |
