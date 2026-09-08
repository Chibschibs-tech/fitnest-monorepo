# Feature Specification: Identity, Account & Admission

**Feature Branch**: `001-identity-account-admission`

**Created**: 2026-08-29

**Status**: Draft

**Input**: `docs/slice-01-identity-account-admission.md` (founder-authored slice description, customer model only)

**Constitution check**: written against Constitution v4.1.0 — Articles V (customer identity), VII (wallet), IX (cohort instrumentation), XII (traceability). The staff model (Article V, STAFF) is explicitly out of scope and is a separate feature.

## Clarifications

### Session 2026-08-29

- Q: Does a queue position expire, and what happens to an admission not followed by a subscription? → A: **B, N = 4 weeks.** The queue position never expires. An admission not followed by a subscription within 4 weeks becomes dormant, reactivable without re-entering the queue. Dormancy is silent: no expiration notification is ever sent — a courtesy must not become a threat. (FR-036)
- Q: Can one account hold more than one active subscription? → A: **C.** The account model supports N subscriptions per account; the V1 interface exposes exactly one. Article I applied to accounts: not built, but not expensive to add. (FR-037)
- Q: How long does a verified session last before a new code is required? → A: **A.** No calendar expiration. A session lives until sign-out, device change, or revocation. Direct consequence: revocation is the session's only security mechanism, so it must exist in this slice. (FR-038–041)
- Q: Is admission automatic (first N in the queue) or a manual staff act within the configured weekly cap? → A: **B — manual under a configured cap.** The cap bounds; it never admits. Article IX precision: the recorded event is the effective admission of a person, not the opening of a slot — if a week's cap is 8 and 5 people are admitted, that week's cohort counts 5. (FR-042)
- Q: How is a partnership arrival identified at the moment of claiming? → A: **A — a link/code per partner, same attribution mechanic as the referral link.** Partners are configurable data; attribution happens at claim time and is permanent, like every acquisition source. (FR-043)
- Q: Can a customer change their phone number themselves in this slice? → A: **C — the model keeps a history of phone numbers, but no customer-facing change flow is built in this slice.** Founder principle recorded for the later feature: an identity factor is never changed by relying on itself (see "Identity-factor change principle" below). Dependency noted: transactional email sending does not exist yet. (FR-044)
- Q: Does the wallet ledger carry unit-typed entries (days and dirhams in one history) or is everything converted to money at issuance? → A: **A — typed entries.** Days and dirhams live in the same append-only ledger; a day is valued only at consumption. Founder precisions: days are consumed before dirhams (a day is harder to value and refund than an amount); a day is worth the TTC daily price of the beneficiary's **active** subscription at the moment of consumption, cycle discount included — never the plan's ex-cycle price; with no active subscription, consuming a day is impossible — a day never converts into money. (FR-045–047)
- Founder correction (not a question): **the queue is a temporary operating mode, not a permanent product state.** It is switchable by configuration at any time; the journey works in both modes; deactivation admits everyone still queued; `admitted_at` is recorded in both modes (immediate when disabled). One-off purchase (Express Shop) never depended on the queue or admission in either mode. (FR-048–051)
- Founder correction (2026-08-30): **the customer cohort is defined by the date of first subscription, not by admission.** An account without a subscription belongs to no cohort. `claimed_at`/`admitted_at` measure the admission device's conversion funnel (relevant while the queue exists, valueless after); `first_delivery_at` measures the payment-to-first-service delay and triggers the referral reward (FR-017). Reason: the queue is temporary — anchoring retention on a date that will cease to exist would make pre- and post-switch cohorts incomparable. (FR-032 rewritten, FR-042 rephrased)
- Founder correction (2026-08-30): **three account states are distinct** — having an account, being admitted, holding an active subscription. Express Shop customers will buy without ever subscribing; the queue protects kitchen capacity, not the sale of stocked goods. A non-admitted account is a fully valid account; admission gates only subscription configuration. (FR-052; FR-014 rephrased)
- Precision on partner attribution (Q2): a partner like Fitpass distributes a **physical card** — attribution must work by **QR code AND a short hand-typable code**, not only a web link. (FR-043 updated)

### Session 2026-09-08 (founder arbitrations)

- **D-030 — web-only slice**: mobile mirror work is out of this slice; `apps/mobile` stays a viewer skeleton. Multi-surface guarantees hold by construction (shared contracts, `@fitnest/core`, one `auth.users` per phone). US3/SC-006 verified web ↔ web until the mobile-parity slice.
- **D-053 — verified email unique, recovery proof**: no fusion between legacy `users` and `customer_accounts` ever; a **verified** email is **unique per account** and serves as **recovery proof**. Unverified email stays non-identifying and non-unique. FR-038/FR-040 amended; the former "email is not unique" assumption is superseded. Email verification depends on transactional email (not built): the uniqueness constraint ships now, the proof path activates later.
- **D-057 — versioned parameters vs invariants**: every configured value is typed, bounded, and versioned with an immutable change history; ledger immutability is an invariant no setting can disable.
- **D-058 — server clock, Africa/Casablanca**: every admission/cohort date is recorded at server clock; ISO-week boundaries (weekly cap, cohorts) are computed in Africa/Casablanca.
- Wallet anticipation (loyalty, nothing built): the **entry unit is data, not a code enumeration** — adding a unit (tomorrow: points) requires no migration and no release; every entry keeps its acquisition moment (a future expiration mechanism depends on it); **no points mechanics of any kind are built** (Article III). (FR-053, FR-024)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor claims a place (Priority: P1)

A person who has never used FitNest enters their phone number, confirms the one-time code sent to it, and from that moment holds an account and a position in the admission queue. They are told when to expect an answer. No password is created; no email is asked.

**Why this priority**: This is the gateway to the entire product. Without claiming, there is no account, no queue, no cohort data — and cohort data is the one thing that can never be recovered later (Article IX). It is also the moment acquisition source is captured.

**Independent Test**: With a fresh phone number, complete the claim flow end to end. Verify an account exists anchored to that number, a queue position is visible, the claim date and acquisition source are recorded, and no password or email was required.

**Acceptance Scenarios**:

1. **Given** a person who has never used FitNest, **When** they enter their phone number and confirm the code sent to it, **Then** an account exists and they hold a position in the queue, **And** they are told when to expect an answer.
1bis. **Given** the queue mode is disabled, **When** a person creates their account (phone + code), **Then** they reach subscription configuration directly — no waiting screen, no position — **And** their admission date is recorded immediately (FR-049, FR-051).
2. **Given** a person entering a phone number that already has an account, **When** they confirm the code, **Then** they reach the existing account and its existing queue state — no duplicate account, no new queue position.
3. **Given** a person who enters a wrong or expired code, **When** they retry, **Then** they can request a new code and the claim resumes without losing entered state.

---

### User Story 2 - A queued person waits without ever being rejected (Priority: P1)

A person holding a queue position opens FitNest at any time and sees their position and the week they can expect to be admitted. They never see a rejection, an error, or an empty catalogue. When capacity opens for them, they are notified, the moment of admission is recorded, and they can begin configuring a subscription.

**Why this priority**: The queue is the product's central promise about quality while it is active, not a failure state. The admission event is a funnel date that cannot be recovered later (Article IX) — though customer cohorts are keyed on first subscription, not on admission (FR-032).

**Independent Test**: Queue an account, verify the waiting view (position + expected week, no dead end). Admit the account through the admission mechanism, verify the admission moment is recorded, the person can now start configuring, and an admission notice is recorded as due/sent.

**Acceptance Scenarios**:

1. **Given** a person still in the queue, **When** they open FitNest, **Then** they see their position and the week they can expect, **And** they are never shown a rejection or an empty state.
2. **Given** a person holding a queue position, **When** capacity opens for them, **Then** they are notified and can begin configuring a subscription, **And** the moment of admission is recorded.
3. **Given** a queued (not yet admitted) person, **When** they attempt to configure a subscription, **Then** the configuration is not reachable and their queue status is shown instead.
4. **Given** the weekly admission rate is changed in configuration, **Then** the new rate applies without any client release.

---

### User Story 3 - A verified person returns and crosses surfaces (Priority: P2)

Someone who verified their phone on a device opens FitNest again later: they are still signed in, and no new code is sent. The same person signs in on the other surface (website ↔ mobile app) with the same phone number: it is the same account, the same history.

**Why this priority**: Session longevity is an explicit requirement — every avoidable code is a recurring cost (FR-004, FR-005). Cross-surface unity is constitutional (Article V).

**Independent Test**: Verify a number on one device, close and reopen — signed in, zero SMS sent. Sign in on the second surface with the same number — same account id, same queue/wallet history visible.

**Acceptance Scenarios**:

1. **Given** someone who verified their phone on this device, **When** they open FitNest again, **Then** they are still signed in, **And** no new code is sent.
2. **Given** someone with an account created in the app, **When** they sign in on the website with the same phone number, **Then** it is the same account, with the same history.
3. **Given** someone whose session is lost or who signs in from a new device, **When** they enter their phone number, **Then** exactly one new code is sent and verification restores access to the same account.

---

### User Story 4 - A person arrives through a friend's link (Priority: P2)

A person opens a referral link from an existing subscriber and claims a place. Their account permanently records who referred them, at the moment of claiming. The referrer is not rewarded yet. Only after the referred person's first delivery is completed does the referrer receive their reward — as days in their wallet — and nothing about the referrer's billing date changes.

**Why this priority**: Referral attribution happens at claim time and is permanent (Article IX: acquisition source is unrecoverable). The reward mechanics protect the billing invariant (Article VII).

**Independent Test**: Claim through a referral link, verify the referring account is recorded permanently and no reward exists. Complete the referred person's first delivery, verify the reward lands in the referrer's wallet as days, sized by the referred person's billing cycle, and the referrer's billing date is unchanged.

**Acceptance Scenarios**:

1. **Given** a person opening a referral link from an existing subscriber, **When** they claim a place, **Then** their account permanently records who referred them, **And** the referrer is not rewarded yet.
2. **Given** a subscriber who joined through a referral link, **When** their first delivery is completed, **Then** the referrer receives their reward as days in their wallet, **And** nothing about the referrer's billing date changes.
3. **Given** a referrer who already earned rewards from 5 referrals (configured cap), **When** a sixth referred person completes a first delivery, **Then** no further reward is issued.
4. **Given** a phone number that has already generated a referral reward once, **When** the same number is involved in any later referral, **Then** no reward is generated, ever.
5. **Given** a person without an active subscription, **When** they attempt to share a referral, **Then** referral is not available to them.

---

### User Story 5 - A person subscribes for the first time and supplies email (Priority: P2)

An admitted person configures a subscription. At the point of payment they must supply an email address, which is stored against their existing account. Email serves invoices and communication; it never identifies the person.

**Why this priority**: Email-before-payment is constitutional (Article V) and gates the payment step of a later slice; the account behaviour it depends on is built here.

**Independent Test**: With an admitted account holding no email, walk to the point of payment: email is demanded and stored on the same account; the account is still anchored to the phone number.

**Acceptance Scenarios**:

1. **Given** an admitted person configuring a subscription, **When** they reach the point of payment, **Then** they must supply an email address, **And** it is stored against their existing account.
2. **Given** an account created without email, **When** the person uses FitNest without subscribing, **Then** no email is ever demanded.

---

### User Story 6 - A person sees their wallet (Priority: P3)

Every account has a wallet. The person can see their balance and the full history of movements — each with its reason and source. Entries are never modified or deleted.

**Why this priority**: The wallet is a shared spine (Article I) that referral rewards, service credits, and refunds all depend on. In this slice it is written by referral rewards and read by the account holder; spending it belongs to later slices.

**Independent Test**: Issue a wallet entry (e.g. a referral reward), verify the balance reflects it, the history lists it with reason and source, and no operation can alter or remove a past entry.

**Acceptance Scenarios**:

1. **Given** an account with wallet movements, **When** the person opens their wallet, **Then** they see the balance and the history of movements with reasons and sources.
2. **Given** any past wallet entry, **When** any later activity occurs, **Then** that entry is unchanged — corrections are new compensating entries.

---

### Edge Cases

- A person claims with a number that already holds a queue position or an account: the flow resolves to the existing account and existing position — claiming is idempotent per phone number.
- A wrong, expired, or too-often-retried one-time code: the person can request a fresh code after a cooldown; repeated failures never lock the phone number permanently, and rate limiting keeps SMS volume bounded.
- A referral link opened by someone who already has an account: no re-attribution — the referring account is recorded only at the moment of claiming (FR-016), and an existing account's acquisition source never changes (FR-031).
- Self-referral (a person opening their own link): no attribution, no reward.
- The referrer's subscription becomes inactive between the referred person's signup and their first completed delivery: reward eligibility is evaluated per FR-022 — referral is available only to people with an active subscription. The evaluation moment is at reward issuance.
- A queued person is admitted while the app is closed: the admission notice is recorded as due (FR-015); on next open the person sees their admitted state regardless of whether the notice was already sent.
- The weekly admission capacity is lowered after expectations were shown: queue positions may shift outward; the person continues to see an honest expected week, never a rejection.
- A phone number is recycled by the operator and claimed by a new person: the code proves current control of the number; what happens to the previous account's data is a staff-level concern, out of this slice's scope, but the design must not fuse two people's history silently. Documented as an assumption below.
- A person returns after their admission went dormant (4+ weeks without subscribing): they see their admitted state with a reactivation step, never a rejection and never a message blaming them for the delay (FR-036).
- A person loses their phone: verifying the number on a new device restores the same account, and the device list lets them revoke the lost phone's session themselves (FR-040, FR-041). No support intervention is required.
- The queue mode is deactivated while people are waiting: every queued person becomes admitted at that moment, their `admitted_at` is recorded, and the next time they open FitNest they reach configuration directly (FR-050).
- The queue mode is re-activated later: working rule — nobody already admitted is demoted, admission is a recorded event, not a revocable right (FR-012, FR-031); only new claims enter the queue. *Founder note: flagged for later re-arbitration; the working rule stands until then.*
- A person attempts to consume wallet days without an active subscription: the operation is impossible and says so — days are never converted to money (FR-047).
- Device change with biometric sign-in enabled: biometrics never substitute for phone identity (FR-008) — a new device requires one code, then may re-enable biometrics.
- Wallet entry sources must remain valid when their origin disappears (e.g. a referral reward whose referred account is later deleted): the ledger entry is immutable and self-describing.

## Requirements *(mandatory)*

Functional requirement numbering follows the founder's slice document verbatim (FR-001 … FR-035) so that cross-references in the decisions log and future clarifications stay stable.

### Identity

- **FR-001**: A phone number is the sole identity anchor for customers. Account creation requires a phone number and a one-time code sent to it.
- **FR-002**: No customer password exists anywhere in the product.
- **FR-003**: One phone number is one account, shared across website and mobile app. The same person signing in on either surface reaches the same account and the same history.
- **FR-004**: The one-time code **verifies the number**. It is not the session mechanism. A verified device holds a long-lived session and is not challenged again on return.
- **FR-005**: A new code is sent only when the session is lost, the device changes, or the number changes. Code volume must stay low by design; every avoidable code is a recurring cost.
- **FR-006**: Email is not required to create an account. It is required before a subscription can be paid for.
- **FR-007**: Email is used for invoices and service communication. It is never the identity anchor and never replaces the phone number.
- **FR-008**: Biometric or device-level sign-in may be offered as convenience on top of phone identity, never instead of it.

### Queue and admission

*The queue is a **temporary operating mode**, not a permanent product state (founder correction, 2026-08-29). It is active while kitchen capacity is being mastered. FR-009–015 describe behaviour while the mode is active; FR-048–051 govern both modes and the transition between them.*

- **FR-009**: A person who claims a place enters a queue and can see their position and the week they can expect to be admitted.
- **FR-010**: The number of people admitted per week is a configured value that can be changed without releasing a new version of any client.
- **FR-011**: Every claim receives a response within 48 hours. The response is a capacity message, never a refusal.
- **FR-012**: Admission is an explicit, recorded event. A person is either queued or admitted; there is no ambiguous middle state.
- **FR-013**: Only an admitted person can begin configuring a subscription.
- **FR-014**: A queued person who opens FitNest sees their queue status. They are never shown an empty catalogue, an error, or a dead end. Their account is fully valid in every other respect (FR-052) — the queue withholds subscription configuration, nothing else.
- **FR-015**: Admission notices are sent manually at launch. The system must record that a notice is due and that it was sent; it does not need to send it automatically.

### Referral

- **FR-016**: When a person arrives through a referral link, the referring account is recorded on their account at the moment of claiming, permanently.
- **FR-017**: A referral reward is issued only after the referred person's first delivery is completed — never at signup, never at payment.
- **FR-018**: Referral rewards are issued as days credited to the referrer's wallet. They never alter a billing date.
- **FR-019**: The reward amount depends on the billing cycle the referred person subscribed to.
- **FR-020**: A person may earn rewards from at most 5 referrals. The cap is a configured value.
- **FR-021**: One reward per referred phone number, ever. A phone number that has already generated a reward cannot generate another.
- **FR-022**: Referral is available only to people with an active subscription.

### Wallet

- **FR-023**: Every account has a wallet with a balance.
- **FR-024**: Every movement in or out of the wallet is recorded as an entry that is never modified or deleted, with its reason, its source, and its acquisition moment.
- **FR-025**: A person can see their balance and the history of movements.
- **FR-026**: Referral rewards, service credits, and refunds all land in the wallet.
- **FR-027**: A gifted day is worth the beneficiary's current subscription rate at the moment it is used.

### Cohort instrumentation

This is the only requirement in the whole product that cannot be recovered later (Article IX). If it is not captured from the first subscriber, the retention curve is permanently lost. It cannot be deferred to a later slice.

*Founder correction (2026-08-30): the **customer cohort is keyed on the date of first subscription** — the moment the person becomes a customer and revenue begins. An account without a subscription belongs to no cohort. The other captured dates measure other things: `claimed_at`/`admitted_at` are the conversion funnel of the admission device (meaningful while the queue exists, valueless after its deactivation); `first_delivery_at` is the payment-to-first-service delay and the trigger of the referral reward (FR-017).*

- **FR-028**: Each account permanently records: the date the place was claimed, the date of admission, the date of first subscription, the date of first completed delivery, and the acquisition source. *Per D-058 (2026-09-08): every one of these dates is recorded at **server clock** — a client clock is never trusted — and week-based computations (FR-032 cohorts, FR-042 weekly cap) use ISO weeks in **Africa/Casablanca**.*
- **FR-029**: Acquisition source distinguishes at minimum: referral (with the referring account), partnership, and direct.
- **FR-030**: Each subscription permanently records its billing cycle at the time of purchase, and the date it ended, if it ended.
- **FR-031**: These values are historical record. Once written they are never overwritten by later activity.
- **FR-032**: It must be possible to reconstruct, for any calendar week, which accounts **subscribed for the first time** that week, and how many of them still hold an active subscription 4, 8 and 12 weeks later.

### Launch pricing

- **FR-033**: A subscription records the price that applied when it was purchased, and the date until which that price is guaranteed.
- **FR-034**: The guarantee date is set when the subscription is created and is never recalculated afterwards.
- **FR-035**: The system can identify, at any time, which subscriptions are approaching the end of their guaranteed price. *Assumed deferral (founder, 2026-08-30): slice 001 captures the datum (`price_guaranteed_until`, write-once at creation); the surveillance query itself belongs to the analytics slice — see Out of scope.*

### Requirements added by clarification (session 2026-08-29)

- **FR-036**: A queue position never expires. An admission not followed by a first subscription within **4 weeks** becomes **dormant**: the person can reactivate it without re-entering the queue, and no expiration or dormancy notification is ever sent. A dormant admission is still an admission (FR-012's two states hold); it only requires reactivation before subscription configuration can begin.
- **FR-037**: The account model supports **N subscriptions per account**; the V1 interface exposes exactly one active subscription. For cohort reconstruction (FR-032), an account counts as active in a given week if it holds at least one active subscription.
- **FR-038**: A verified session has **no calendar expiration**. It ends only by explicit sign-out, device change, or revocation. *Amended per D-053 (2026-09-08): where the account holds a **verified email**, that email serves as an additional **recovery proof** for session-recovery operations, consistent with the identity-factor change principle; accounts without a verified email fall back to phone-OTP-only recovery.*
- **FR-039**: Every session is **revocable server-side with immediate effect**.
- **FR-040**: A person can **see the devices connected to their account and disconnect any one of them**. *Amended per D-053 (2026-09-08): disconnecting **all other** sessions from a newly-verified device is corroborated by the verified email when one exists. This path stays dormant until transactional email exists; until then, phone OTP alone governs recovery (known, bounded limit).*
- **FR-041**: **Losing a phone is recoverable without support**: verifying the number on a new device restores the account, and from that device every other session can be revoked.
- **FR-042**: Admission is a **manual staff act, bounded by the configured weekly cap** (FR-010). The cap bounds; it never admits anyone by itself. The event recorded (Article IX) is the **effective admission of a person**, never the opening of a slot: a week with a cap of 8 and 5 admissions records 5 admissions. Admission counts are **funnel metrics of the admission device**, not customer cohorts — cohorts are keyed on first subscription (FR-032).
- **FR-043**: A **partnership arrival is identified by a link or code per partner**, using the same attribution mechanic as the referral link but pointing to a partner rather than a customer account. Partners are configurable data. Attribution happens at claim time and is permanent (FR-016, FR-031 apply identically). Attribution must work through a **QR code AND a short hand-typable code** — a partner like Fitpass distributes a physical card, not a web link.
- **FR-044**: The account model **records the history of phone numbers** an account has been anchored to. **No customer-facing number-change flow is built in this slice** — the change operation belongs to a later feature. The history itself is FR-031-grade, non-reconstructible data: without it, a number change silently breaks two rules already written — one referral reward per phone number (FR-021) and one trial day per phone number (D-014).
- **FR-045**: The wallet ledger carries **unit-typed entries**: days and dirhams (MAD) coexist in the same append-only history, each entry carrying its unit. No conversion between units ever happens inside the wallet; a day is valued only at the moment of consumption.
- **FR-046**: **Consumption order: days are drawn down before dirhams.** A day is harder to value and to refund than an amount — it is spent while its reference rate is known.
- **FR-047**: At consumption, a day is worth the **TTC daily price of the beneficiary's active subscription at that moment, cycle discount included** — never the plan's daily price outside its cycle. If the beneficiary has no active subscription when they attempt to consume a day, the operation is **impossible**: a day never converts into money.
- **FR-048**: The queue is **activatable and deactivatable at any time, by configuration** — no release, no migration (Article XIV).
- **FR-049**: The journey works in **both modes**. Queue active: claim a place, position, wait, explicit admission. Queue disabled: account creation then direct access to subscription configuration — no waiting screen, no position displayed.
- **FR-050**: **On deactivation, every person still in the queue becomes admitted.** Nobody remains stuck in a state that no longer exists.
- **FR-051**: `admitted_at` is recorded in **both modes** — immediately at account creation when the queue is disabled — so the admission-funnel record stays continuous across the switch (Article IX: unrecoverable data is captured from day one). FR-013 holds unchanged in both modes: only an admitted person can configure a subscription; with the queue disabled, admission is simply immediate.
- **FR-052**: Three account states are **distinct and independently meaningful**: (1) having an account, (2) being admitted, (3) holding an active subscription. Admission gates **only** subscription configuration (FR-013). A non-admitted account is a fully valid account — it signs in, holds a wallet, carries its history, and must be able to use any capability that is not subscription configuration (e.g. future one-off purchase, which never depends on admission).
- **FR-053**: The **unit of a wallet entry is data, not a code enumeration**. Adding a unit (today: days, dirhams; tomorrow: points) requires no migration and no release (Article XIV). Every entry carries its acquisition moment — a future expiration mechanism depends on it. No points mechanics of any kind — accumulation, rate, conversion, tier — are built in this slice (Article III).

### Identity-factor change principle *(recorded for the later feature — not built here)*

**An identity factor is never changed by relying on itself.**

- Changing the phone number: verification by code on the **registered email**, THEN a code on the new number.
- Changing the email: verification by code on the **registered phone number**, THEN confirmation on the new email.

Known limit: email being optional before subscription, this mechanism only covers subscribers. Accounts without email remain assisted-change only — and an account without a subscription presents no hijacking stake.

Dependency created: **transactional email sending, which does not exist yet** in the product. It becomes a prerequisite of the number-change feature, not of this slice.

Permanent residual case: loss of both factors. Assisted procedure with elements of proof (address, plan, last delivery) — a business procedure, not a software feature.

### Clarifications resolved in-spec

- **FR-011a**: The 48-hour response is a capacity message; it never expires a claim by itself (queue positions never expire, FR-036).
- **FR-016a**: Referral attribution happens only at claim time. An account that claimed without a referral link can never gain a referrer afterwards (consequence of FR-031).

### Key Entities

- **Person**: identified by phone number. Holds optional email (mandatory before payment), queue state, admission date, acquisition source, referring person where applicable, and the cohort dates of FR-028. One phone number, one person, both surfaces.
- **Queue position**: a person's place in the admission queue, with the week they are expected to be admitted. Ends with an explicit, recorded admission event.
- **Wallet**: a balance belonging to a person. Derived at all times from its entries.
- **Wallet entry**: an immutable record of one movement — amount, unit, reason, source, acquisition moment. Never modified or deleted; corrections are compensating entries. The unit is data, not a code enumeration (FR-053): days and dirhams today, extensible without migration or release.
- **Referral**: the permanent link between a referring person and a referred person, created at claim time, carrying the state of its reward (pending → issued / never-eligible).
- **Partner**: a configurable entity (partnership acquisition source) owning one or more attribution links/codes. No reward mechanics in this slice.
- **Admission notice**: the record that an admission message is due for a person and whether it was sent (manual at launch, FR-015).
- **Connected device / session**: a verified device holding a long-lived session. Listed to the account holder, individually disconnectable, and revocable server-side with immediate effect (FR-038–041).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can claim a place — from landing to holding a visible queue position — in under 2 minutes, providing nothing but their phone number and the received code.
- **SC-002**: At least 95% of returns by an already-verified person on the same device complete with **zero** SMS sent.
- **SC-003**: Average SMS volume per account stays below 2 codes per account per quarter after signup (signup verification excluded) — sessions are long-lived by design.
- **SC-004**: 100% of accounts created from launch onward carry a claim date and an acquisition source; for any calendar week since launch, the retention reconstruction of FR-032 — cohorts keyed on first-subscription week, still-active at 4, 8, 12 weeks — is computable without manual data archaeology.
- **SC-005**: 100% of claims receive a response within 48 hours, and no queued person is ever shown a rejection, an error state, or an empty catalogue.
- **SC-006**: The same phone number used on web and mobile resolves to the same account with the same history in 100% of cases.
- **SC-007**: At any moment, every wallet balance equals exactly the sum of its ledger entries, and no historical entry has ever been modified or deleted.
- **SC-008**: Zero referral rewards are issued at signup or at payment; 100% of issued rewards trace to a completed first delivery of the referred person, and no referrer's billing date ever moves as a result of a reward.
- **SC-009**: A session revoked — from the device list or server-side — loses all access immediately: no request made after the revocation succeeds with the old session.

## Assumptions

- **Fresh identity base.** The product has never launched and no real customer exists (founder-confirmed, 2026-08-29). The existing `users` rows, `sessions`, the email-anchored `waitlist` table and the all-NULL `customers` table are test artefacts. This spec designs the customer identity model as new; the disposal of those tables is arbitrated separately (the `customers` table's fate is explicitly out of this spec, per the slice document).
- **The legacy `waitlist` table is not this queue.** The production `waitlist` table is anchored on a unique email — incompatible with phone-anchored identity. The admission queue of this slice is a new capability; the old table is a candidate for the same cleanup as `customers`. Surfaced here so nobody "reuses" it silently.
- **Acquisition-source intent predates this spec.** The previous registration route attempted to record an `acquisition_source` (against a column that never existed). FR-028/FR-029 are the correct, specified version of that intent (founder note, 2026-08-29).
- ~~Wallet entries are typed by unit~~ — promoted from assumption to requirement by founder clarification (FR-045–047).
- ~~Email is not unique across accounts~~ — **superseded by D-053 (2026-09-08)**: an **unverified** email identifies nothing and is not unique; a **verified** email is unique per account and serves as recovery proof (FR-038/FR-040 as amended). Identity anchoring still applies to the phone number only (FR-007 unchanged: email never identifies for sign-in).
- **Recycled phone numbers** are treated as the same identity anchor: control of the number is what the code proves. Untangling a genuinely recycled number is a manual staff operation, out of scope here.
- **Referral eligibility (FR-022) is evaluated at reward issuance**, i.e. when the referred person's first delivery completes. If the referrer's subscription is inactive at that moment, the reward is not issued (it does not queue up waiting for reactivation).
- **Queue position semantics**: position is informative (position N, expected week W) and monotonic in spirit — capacity changes may move the expected week; the display never promises a date, only a week.
- **Notifications at launch are manual** (FR-015, D-016): the system records due/sent; no automated SMS/WhatsApp sending is built in this slice.

## Traceability *(Article XII)*

Every rule below carries its surface, its market where it derives from a Calo observation, and its status (**measured** / **derived** / **assumed**). "Decided" marks founder decisions recorded in `docs/decisions-log.md`.

| Rules | Surface | Market | Status / Source |
|---|---|---|---|
| FR-001–003, FR-006–007 (phone anchor, no password, email at payment) | both | Calo app (settings: OTP mandatory, biometrics optional) | **measured** on Calo app; adopted by D-013 |
| FR-004–005 (OTP verifies, long session, low SMS volume) | both | — | **decided** — Article V v4.1.0 amendment + founder requirement (SMS cost); consistent with Calo app behaviour (no re-challenge observed), **derived** |
| FR-008 (biometrics as convenience) | both | Calo app | **measured** (biometrics toggle optional, OTP locked mandatory) |
| FR-009–015 (queue & admission) | both | — | **decided** — deliberate FitNest deviation: capacity-constrained launch is not an observed Calo mechanic. Manual notices per D-016 |
| FR-016–022 (referral) | both | — | **decided** — no referral observation exists in the Calo report; cap of 5, reward-after-first-delivery, cycle-dependent size are founder decisions, **assumed** pending live data |
| FR-023–027 (wallet, append-only, day value) | both | — | **decided** — Article VII; day valuation per D-015 |
| FR-028–032 (cohort instrumentation) | both | — | **decided** — Article IX (constitutionally unrecoverable) |
| FR-033–035 (launch price guarantee) | both | — | **decided** — founder slice document; interacts with Article IV frozen pricing (price frozen per subscription is already in production schema) |
| FR-036–053 + identity-factor change principle (queue permanence, dormant admission, N-subscription model, session lifetime & revocation, manual admission under cap, partner attribution links incl. QR/short code, phone-number history, unit-typed wallet ledger & day valuation, queue as switchable operating mode, cohort keyed on first subscription, three account states, unit-as-data) | both | — | **decided** — founder clarification session 2026-08-29/30 (recorded in Clarifications above) |

**Contradiction check** (Article XII: surface, don't arbitrate): no contradiction found between this slice and `calo-reverse-engineering-report.md` or `decisions-log.md`. Two touch-points worth naming: (1) FR-005 adds "the number changes" to Article V's session-loss/device-change list — an extension, not a conflict; (2) FR-019 (reward size depends on the referred person's cycle) and FR-027/D-015 (a gifted day is valued at the beneficiary's rate at use) are distinct rules — size at issuance vs value at redemption — and coexist.

## Out of scope for this slice

- Staff accounts, passwords, and roles — separate feature (Article V, STAFF)
- Subscription configuration, pricing, and payment (the email-before-payment behaviour is specified here; the payment itself is not)
- Delivery zones, slots, and addresses
- Menu, meals, and swaps
- Body profile, goals, and calorie targets
- Corporate accounts and company codes — the account model must not make these harder to add (Article I spine principle), but they are not built here
- Removal of the legacy `customers` and `waitlist` tables — separate cleanup, arbitrated after this spec
- Customer-facing phone-number and email change flows — later feature, governed by the identity-factor change principle above (its transactional-email dependency does not gate this slice)
- Automated sending of admission notices (recorded due/sent only, FR-015)
- Spending wallet days against a subscription — the ledger model, consumption order, and valuation rules are specified here (FR-045–047) so the ledger is built right; the redemption flow itself belongs to the pricing/billing slice
- Express Shop and one-off purchase (Article III, deferred) — announced from the start and never dependent on the queue or admission, in either queue mode; the account model must serve it (FR-052)
- Loyalty points mechanics — no accumulation, rate, conversion, or tier is built (Article III); the wallet's unit-as-data design (FR-053) is the only accommodation
- Biometric sign-in — deferred out of V1 (founder, 2026-08-30): OTP + long-lived session suffice; Article V and FR-008 declare it optional (MAY), no task builds it
- Mobile screens — **web-only slice (D-030, founder 2026-09-08)**: `apps/mobile` remains a viewer skeleton; mobile parity is a dedicated later slice consuming the same contracts and `@fitnest/core`
- FR-035 surveillance query (subscriptions approaching the end of their guaranteed price) — **assumed deferral, not a gap** (founder, 2026-08-30): the `price_guaranteed_until` datum is captured from day one (Article XIV — the data requirement), the query ships with the analytics slice; no subscription approaches its guarantee end within six months of launch

*The slice document's NC-1…NC-4 were resolved by the founder on 2026-08-29 — see Clarifications above and FR-036–041.*
