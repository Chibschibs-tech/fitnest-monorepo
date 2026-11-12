# Slice 4 — Mobile Foundation: the App the Subscriber Lives In

Requirement source for native delivery, not a release certificate. Product D IDs use docs/delivery/product-baseline.md. The LOT-09 contract/design packet precedes implementation; all user-story IDs below are retained.

**Aligned specification — 18 October 2026; D-033/053/056/059/061 and MC-08 applied.** Required before the first subscriber (D-040). Written under D-013, D-019, D-030, D-039, D-040, D-044, D-050, and the Calo catalogue sections C and E. Statuses: **[O]** observed on Calo, **[F]** FitNest's own choice, **[NC]** needs the founder.

**Scope:** a complete mobile app on both stores, on the same account and the same engine as the web (D-019), carrying the subscriber's life after payment. Its first screens are the three subscriber journeys of slice 002 — J2 personalisation, J3 day view, J4 preferences — and the handover from web payment (J6). Swap, skip and pause are the next slice, built on this one.

---

## Purpose

The subscriber lives in the app and only there (D-040): the web sells and hands over. Today the app is a skeleton. Without this slice, a person who paid on the web has nowhere to see their meals, and the kitchen has no one to cook for. This is the slice the launch waits on, and the one whose external delays — store accounts, review — are longest.

---

## Vocabulary

- **Handover** — the moment after web payment when the subscriber is sent to the app (slice 002 J6).
- **Same account** — the phone number verified on the web is the account in the app; there is no second registration (D-013).
- **Day view** — the subscriber's home: one consumption day at a time (Calo C01).

---

## User scenarios

**Handover after web payment**
Given a person who just paid on the web and received the confirmation WhatsApp with the app link
When they install and open the app
Then they sign in with the same phone number and OTP, and land on personalisation (J2) then their day view (J3), with the summary they saw on the web — plan, first delivery, address, slot — already there

**A subscriber opens the app before the first menu is published**
Given an active subscription whose delivery days fall in an unpublished week
When they open the day view
Then the days read "menu coming" with a publication date only if actually known; otherwise honest pending status, never an invented date or dish (slice 002 FR-G8)

**A subscriber personalises, skips, then comes back**
Given the personalisation flow (J2)
When they skip it
Then their menu still exists (D-037) and every step is reachable later from preferences (J4)

**A subscriber sees their day**
Given a published week and assignments
When they open the app
Then the day view shows the weekday, the week strip starting at the first delivery, the day's dishes with kcal and macros, ingredient-named warnings, the day totals against the target, the lock moment for that day ("modifiable jusqu'à lundi 05:00", D-044) and, once delivered, "livré à HH:MM" [O Calo C01, F for the lock moment]

**A delivery is confirmed**
Given the Delivery role confirms a delivery (slice 003 FR-L2)
When the event fires
Then the app shows "livré à HH:MM" on that day, the delivered meals lose their controls, and a deduplicated generic push is queued for an opted-in active installation (D-039) [O Calo C14, C16 for the push]

**A subscriber signs out and in on another phone**
Given the same phone number
When they sign in on a new device
Then proof of ownership resolves the same internal account; G-SESSION determines whether other sessions remain. No silent choice between 001 multi-device and this draft's old single-device rule.

---

## Functional requirements

### App and account
- **FR-M1** One app, iOS and Android, from one codebase, sharing the business logic package with the web (D-019).
- **FR-M2** Phone OTP resolves stable internal identity shared with web; no customer password or email sign-in. Bounded rotating sessions and risky-history proof follow 001/D-053. G-SESSION explicitly resolves one active session versus multiple revocable devices before session implementation.
- **FR-M3** Opaque short-lived limited-use relay opens sign-in or the appropriate store. No phone/session/health data in URL or pre-auth account display. Lost/expired link recovers through normal authentication to the same account (D-056).
- **FR-M4** Meals and Account are confirmed navigation entries; four entries were the recorded target, two destinations remain G-NAV. Do not invent Market or chat. WhatsApp help remains accessible from Account and recoverable errors.

### First screens (from slice 002)
- **FR-M5** **J2 personalisation** — skippable, resumable, steps as in slice 002 J2; allergens not re-asked; culturally calibrated copy.
- **FR-M6** **J3 day view** — as in slice 002 J3, plus the lock moment (D-044) and the delivered state. Renewal banner reads the subscription's actual auto-renew state and says one thing or the other, never both [F, corrects Calo C13].
- **FR-M7** **J4 preferences** — each category re-opens its J2 step; a hard change triggers regeneration per D-042 and tells the subscriber which days moved.
- **FR-M8** Account displays profile, cycle/subscription, consumption and delivery settings, date-of-action/effect history, wallet in days AND MAD and WhatsApp help. Bring native device/recovery, referral and wallet acceptance from 001 T033/T038/T045. Mutations belong to LOT-10 and remain full V1 obligations.

### Notifications
- **FR-N1** Push is opt-in with explanation and generic event content. Tokens are installation/session bound and detached on logout/revocation; authenticated API supplies details. Transactional WhatsApp/email remain separate channels (SEC-22/28).
- **FR-N2** Every notification is a row: type, subscriber, trigger event, sent at, channel. The delivered notification's trigger is the delivery confirmation event, immediately [O Calo C14].

### Reliability and offline
- **FR-Q1** Use minimal account-partitioned expiring offline cache with last-updated/stale state. No offline business mutation or claim that stale food compatibility is current. Purge on logout/account switch and recheck revocation when online (SEC-18/21).
- **FR-Q2** No server error code is ever shown to a subscriber; errors are sentences with a path — retry, or WhatsApp [F, corrects Calo C13 "status code 500"].

### Release
- **FR-X1** Store accounts (Apple, Google), signing, and a test distribution channel for the ~20 rehearsal contacts exist before the first subscriber. These are founder tasks with external delays; the slice tracks them as gates, like T013.
- **FR-X2** The app version and a minimum supported version are table values; an older app is told to update, in a sentence.

---

## Key entities

- **Device session** — account, device, created at, ended at.
- **Push token** — account, device, token, opted in at.
- **Notification** — type, account, trigger event, channel, sent at, delivered at.
- **App version policy** — minimum version, message.
- Everything else is slice 001 (account) and slice 002 (menu, assignment, preferences).

---

## Out of scope

- Swap, skip, pause, address and slot changes, cancellation — next slice, on top of this one
- Chat assistant (Calo C10) — the WhatsApp line plays this role at launch
- Rating meals or deliveries — V2
- Market, add-ons, à-la-carte — V2 (D-020)
- Loyalty points — no
- Web subscriber management remains out of scope; LOT-06 implements only the D-061 authenticated help/cancellation rescue.

---

## Clarifications and acceptance

- NC-1 remains G-NAV (remaining navigation destinations); no automatic adoption of the draft proposal.
- NC-2 is closed by D-033: **French and English**, not FR-only/Arabic launch. Every screen and recovery state is localized.
- NC-3 test/store distribution belongs to G-STORES; old 20/50-contact figures are rehearsal context, not a launch authorization.
- NC-4 is closed by D-059: upgraded React Native + Expo, real development/native builds on iOS and Android; not Expo Go as release proof.
- G-SESSION reconciles the remaining 001/004 device policy; G-MACROS governs target display; G-CUSTOMIZE and G-MUTATIONS stay in LOT-10.

Apply SEC-03/18–22/32. Verify signed native builds, bundle secrets, cache account changes, stale/offline state, links lost during installation, revoked push token, inaccessible backend, payment-pending/menu-preparing/menu-blocked states, FR/EN and supported old-client contracts. No empty success pages or fabricated meal data.

This slice alone is not full V1. Swap, skip, pause, address/slot, composition/cycle/target changes, payment methods/renewal and cancellation are LOT-10/07 release obligations. Phone recovery/device view, referral and wallet handoffs are explicitly retained. Native availability and D-061 rescue are prerequisites before the first paying subscriber.
