# Feature Specification: Identity, Account & Admission

**Slice**: 001. **Baseline**: 2026-10-18 synchronization from 99d5e2f. **Status**: aligned design; implementation not verified.

Product D references use [the supplied product baseline](../../docs/delivery/product-baseline.md), not colliding historical REPO-D entries. All 53 FR numbers and FR-011a/016a are retained. Superseded wording remains available in Git history, not as competing active instructions.

## Scope and settled clarifications

001 owns customer identity, acquisition attribution, admission and foundational wallet/cohort contracts. UI implementation here is web acquisition/queue/checkout (D-030); native device/referral/wallet screens are explicitly handed to 004/LOT-10 under D-040, not removed from V1. Staff uses separate 003 with mandatory MFA. No new legacy staff guard is allowed.

Settled: queue positions never expire; dormant admission after four weeks is silently reactivable without requeue; data model supports N subscriptions and V1 exposes one active subscription; weekly cap bounds a manual admission; disabling the queue admits all remaining accounts and preserves dates. Manual admission notices and automated transactional messages are different capabilities.

Amendments: D-053 supersedes unlimited sessions and recycled-number equivalence; D-063 adds verified-email uniqueness and no legacy account merge. D-057 versioned settings cannot disable invariants. D-058 fixes server-time Casablanca weeks. Session concurrency between 001 and 004 remains G-SESSION. Formal constitution integration is tracked separately, never represented as already passed.

## User scenarios and minimum acceptance

| Story | Journey | Evidence |
|---|---|---|
| US1 | Phone OTP → account with permanent acquisition → queue or direct admission | Same verified principal retried creates one account; bad/own attribution does not block claim; risk-gated claimant gets no previous history |
| US2 | Wait, receive manual notice, admission, dormancy/reactivation, queue switch | Cap-zero honest state; concurrent last-place admissions cannot exceed cap; switch/retry never loses accounts or duplicates notices |
| US3 | Return, refresh, list/revoke devices and recover | Normal return has no SMS; expired/risky access needs proof; revoked access fails API and every exposed data interface; individual revocation cannot bypass proof |
| US4 | Referral recorded at claim, rewarded at first actual completed delivery | No signup/payment reward; duplicate delivery and cap-minus-one concurrency produce at most permitted reward; billing dates never move |
| US5 | Verified email at payment summary | Claim without email works; payment waits for account-bound email verification; verified-email conflict reveals no other account |
| US6 | Native wallet balance and history | Balance equals immutable ledger grouped by unit; cross-account reads denied; no web subscriber wallet screen is shipped |

## Requirements
- **FR-001**: Customers have a stable internal identity. Phone is the sign-in identifier; initial creation requires phone OTP. Current number control alone does not prove ownership of historical data after a risk signal (D-053).
- **FR-002**: No customer password exists anywhere in the product.
- **FR-003**: One currently assigned normalized phone maps uniquely to an account shared across web and app. Number recycling never silently transfers history. Identity remains stable independently of phone history (D-053/063).
- **FR-004**: OTP verifies current number control, not each request. Silent rotating refresh supports comfortable returns within bounded idle/absolute session limits (D-053).
- **FR-005**: Avoid unnecessary SMS on normal refresh. A new device, missing/expired session or changed number may require OTP; risky access also requires independent proof before historical data. Low SMS volume is a quality objective, never a security bypass.
- **FR-006**: No email is required at claim. Capture and verify email at the payment summary before payment under D-013/053; verification is tied to the authenticated account.
- **FR-007**: Verified email supports invoices, communication and independent recovery proof; it is unique per account and does not become an email/password sign-in mechanism. Unverified email is not identity proof.
- **FR-008**: Biometric or device-level sign-in may be offered as convenience on top of phone identity, never instead of it.
- **FR-009**: Queued people see their position and an explicitly conditional estimated week using remaining weekly capacity. A zero cap shows admissions temporarily paused and no invented date.
- **FR-010**: The number of people admitted per week is a configured value that can be changed without releasing a new version of any client.
- **FR-011**: Every claim receives a response within 48 hours. The response is a capacity message, never a refusal.
- **FR-011a**: The 48-hour response is a capacity message; it never expires a claim by itself (queue positions never expire, FR-036).
- **FR-012**: Admission is an explicit, recorded event. A person is either queued or admitted; there is no ambiguous middle state.
- **FR-013**: Only an admitted person can begin configuring a subscription.
- **FR-014**: A queue is an honest product state, not a rejection. Provide capacity/paused status and a useful next step; do not hide real network failures as success. D-040/061 govern shipped web capabilities.
- **FR-015**: Admission notices are sent manually at launch. The system must record that a notice is due and that it was sent; it does not need to send it automatically.
- **FR-016**: When a person arrives through a referral link, the referring account is recorded on their account at the moment of claiming, permanently.
- **FR-016a**: Referral attribution happens only at claim time. An account that claimed without a referral link can never gain a referrer afterwards (consequence of FR-031).
- **FR-017**: A referral reward is issued only after the referred person's first delivery is completed — never at signup, never at payment.
- **FR-018**: Referral rewards are issued as days credited to the referrer's wallet. They never alter a billing date.
- **FR-019**: The reward amount depends on the billing cycle the referred person subscribed to.
- **FR-020**: A person may earn rewards from at most 5 referrals. The cap is a configured value.
- **FR-021**: One reward per referred phone number, ever. A phone number that has already generated a reward cannot generate another.
- **FR-022**: Referral is available only to people with an active subscription.
- **FR-023**: Every account has a wallet with a balance.
- **FR-024**: Every movement in or out of the wallet is recorded as an entry that is never modified or deleted, with its reason, its source, and its acquisition moment.
- **FR-025**: Expose wallet balances and paginated immutable history through the shared authorized API and native subscriber app. Do not create a web subscriber wallet portal (D-040).
- **FR-026**: Referral rewards, service credits, and refunds all land in the wallet.
- **FR-027**: A gifted day is worth the beneficiary's current subscription rate at the moment it is used.
- **FR-028**: Each account permanently records: the date the place was claimed, the date of admission, the date of first subscription, the date of first completed delivery, and the acquisition source. *Per D-058 (2026-09-08): every one of these dates is recorded at **server clock** — a client clock is never trusted — and week-based computations (FR-032 cohorts, FR-042 weekly cap) use ISO weeks in **Africa/Casablanca**.*
- **FR-029**: Acquisition source distinguishes at minimum: referral (with the referring account), partnership, and direct.
- **FR-030**: Each subscription permanently records its billing cycle at the time of purchase, and the date it ended, if it ended.
- **FR-031**: These values are historical record. Once written they are never overwritten by later activity.
- **FR-032**: It must be possible to reconstruct, for any calendar week, which accounts **subscribed for the first time** that week, and how many of them still hold an active subscription 4, 8 and 12 weeks later.
- **FR-033**: A subscription records the price that applied when it was purchased, and the date until which that price is guaranteed.
- **FR-034**: The guarantee date is set when the subscription is created and is never recalculated afterwards.
- **FR-035**: The system can identify, at any time, which subscriptions are approaching the end of their guaranteed price. *Assumed deferral (founder, 2026-08-30): slice 001 captures the datum (`price_guaranteed_until`, write-once at creation); the surveillance query itself belongs to the analytics slice — see Out of scope.*
- **FR-036**: A queue position never expires. An admission not followed by a first subscription within **4 weeks** becomes **dormant**: the person can reactivate it without re-entering the queue, and no expiration or dormancy notification is ever sent. A dormant admission is still an admission (FR-012's two states hold); it only requires reactivation before subscription configuration can begin.
- **FR-037**: The account model supports **N subscriptions per account**; the V1 interface exposes exactly one active subscription. For cohort reconstruction (FR-032), an account counts as active in a given week if it holds at least one active subscription.
- **FR-038**: Sessions have short access tokens, rotating refresh with reuse detection and finite idle/absolute lifetime. The technical ADR specifies durations and behavior. Risky or long-inactive access requires independent previously verified email before historical data; absent proof fails closed into assisted recovery (D-053).
- **FR-039**: A revoked session loses authorized server access on the next request, including exposed direct data paths. Revocation cannot erase previously copied/offline data; cache removal and reconnection checks are separate controls.
- **FR-040**: The account holder can see and revoke owned device sessions. A newly verified risky device must supply the same independent proof to revoke one other device or all others; one-at-a-time revocation must not bypass recovery protection. Session-count conflict with 004 is tracked as G-SESSION, not silently decided.
- **FR-041**: Losing a phone is recoverable through OTP plus the independent proof required by D-053. If proof is unavailable, use the audited assisted procedure; no promise of universal OTP-only or support-free recovery.
- **FR-042**: Admission is a **manual staff act, bounded by the configured weekly cap** (FR-010). The cap bounds; it never admits anyone by itself. The event recorded (Article IX) is the **effective admission of a person**, never the opening of a slot: a week with a cap of 8 and 5 admissions records 5 admissions. Admission counts are **funnel metrics of the admission device**, not customer cohorts — cohorts are keyed on first subscription (FR-032).
- **FR-043**: A **partnership arrival is identified by a link or code per partner**, using the same attribution mechanic as the referral link but pointing to a partner rather than a customer account. Partners are configurable data. Attribution happens at claim time and is permanent (FR-016, FR-031 apply identically). Attribution must work through a **QR code AND a short hand-typable code** — a partner like Fitpass distributes a physical card, not a web link.
- **FR-044**: Record phone history so identity continuity, trial and referral eligibility survive number changes. Self-service number-change UI remains a later capability, but safe recovery and recycled-number handling are V1 release prerequisites.
- **FR-045**: The wallet ledger carries **unit-typed entries**: days and dirhams (MAD) coexist in the same append-only history, each entry carrying its unit. No conversion between units ever happens inside the wallet; a day is valued only at the moment of consumption.
- **FR-046**: **Consumption order: days are drawn down before dirhams.** A day is harder to value and to refund than an amount — it is spent while its reference rate is known.
- **FR-047**: At consumption, a day is worth the **TTC daily price of the beneficiary's active subscription at that moment, cycle discount included** — never the plan's daily price outside its cycle. If the beneficiary has no active subscription when they attempt to consume a day, the operation is **impossible**: a day never converts into money.
- **FR-048**: The queue is **activatable and deactivatable at any time, by configuration** — no release, no migration (Article XIV).
- **FR-049**: The journey works in **both modes**. Queue active: claim a place, position, wait, explicit admission. Queue disabled: account creation then direct access to subscription configuration — no waiting screen, no position displayed.
- **FR-050**: **On deactivation, every person still in the queue becomes admitted.** Nobody remains stuck in a state that no longer exists.
- **FR-051**: `admitted_at` is recorded in **both modes** — immediately at account creation when the queue is disabled — so the admission-funnel record stays continuous across the switch (Article IX: unrecoverable data is captured from day one). FR-013 holds unchanged in both modes: only an admitted person can configure a subscription; with the queue disabled, admission is simply immediate.
- **FR-052**: Account existence, admission and active subscription are distinct. Admission gates configuration only; wallet and future one-off eligibility remain account capabilities. Actual V1 web exposure remains acquisition/checkout/rescue, with subscriber management in the app.
- **FR-053**: The **unit of a wallet entry is data, not a code enumeration**. Adding a unit (today: days, dirhams; tomorrow: points) requires no migration and no release (Article XIV). Every entry carries its acquisition moment — a future expiration mechanism depends on it. No points mechanics of any kind — accumulation, rate, conversion, tier — are built in this slice (Article III).

## Recovery and ownership

Do not replace an identity factor using only that factor. Changing phone requires independent prior proof plus verification of the new phone. Changing email requires reauthentication and confirmation of the new email. Address, plan and last delivery are never sufficient recovery evidence. Accounts without paid subscriptions still have sensitive history/admission/wallet. If email service is absent, the proof-dependent path is unavailable, not weakened to OTP-only historical access.

## Success criteria

- SC-001: claim normally completes in under two minutes.
- SC-002: at least 95% of ordinary same-device returns require no SMS, within the security policy.
- SC-003: target fewer than two post-signup OTP sends per account/quarter; report rather than disable safeguards to meet it.
- SC-004: acquisition and claim dates are complete; cohorts by first paid subscription reconstruct active membership at +4/+8/+12 weeks in Casablanca.
- SC-005: claims receive a capacity response within 48 hours; an estimate is conditional, zero capacity never fabricates an admission date. Actual failures have a recovery action.
- SC-006: a person proving ownership on both surfaces reaches the same internal account; recycled number alone does not satisfy this criterion.
- SC-007: wallet balance equals ledger sums by unit, no update/delete/truncate by application roles.
- SC-008: every reward traces to one verified first delivery and does not change billing dates.
- SC-009: old revoked session cannot authorize a subsequent server request, including any exposed direct path; offline data already copied is outside this guarantee.

## Out of scope and dependencies

Payment, subscription pricing, delivery execution, food generation and native subscriber UI have their own lots; 001 defines their write contracts. Staff identity is 003 and precedes exposing staff actions. Wallet spending belongs to billing/mutations. No points, Express Shop, affiliation discount implementation or biometric sign-in is added. Legacy data disposal requires schema inventory and a separate reviewed migration; historical no-real-client assumptions must be rechecked before destructive work.

Apply SEC-01–04/26/27 and transversal SEC-06/08/29–32. [tasks.md](tasks.md) preserves T001–T048 and T013; `docs/delivery/backlog.json` carries cross-slice dependencies. A complete first claim is an internal milestone, not the full Fitnest V1.
