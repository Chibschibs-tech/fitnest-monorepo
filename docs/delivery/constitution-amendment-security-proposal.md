# Constitution amendment proposal following v4.3.0

Status: unratified review proposal. This document neither changes the constitution nor approves G-CONSTITUTION, G-SESSION or G-RECOVERY. No effective date or new constitution version is assigned.

## Provenance and integration order

Baseline: `.specify/memory/constitution.md` on branch `constitution-v4.3.0`, blob `5863f764016f1cf123994ffe414e444591cc50b9`, PR #5. At inspection PR #5 remains open. Main and delivery source `2854038dfe653289c326dd33650a311918f630ad` still contain v4.2.0 (blob `53e3c2a9a3439fb439b97b826849265a508cc3d2`). Preserve the v4.3.0 amendments to VIII, X and XIV when preparing the eventual constitutional diff. Recheck these refs before opening the PR; do not describe the branch as merged.

Authority for this proposal: that source's `docs/delivery/product-baseline.md`, `docs/delivery/governance.md`, and identity specification/research. The passages below are proposed normative replacements for conflicting clauses, not assertions of new founder approval. Unaffected clauses remain subject to review against the complete constitution.

## Article IV — price calculation and identity

Pricing uses the monthly reference daily price, a fixed daily premium for the weekly cycle, and the configured percentage discount for the quarterly cycle. The server calculates prices from stable plan and meal-type identifiers, quantities and versioned configuration; display labels never identify a commercial rule. Delivery charges follow the applicable cycle rules. TTC amounts use integer centimes and reconcile exactly with HT and tax amounts. A client preview cannot authorize a charge or become the price authority. Cache keys bind the relevant identity, inputs and configuration version.

This replaces the generic cycle-discount formula where it conflicts with these rules; it introduces no numerical price, premium, discount or rounding choice. Sources: D-003, D-005, D-007, D-008, D-018 and REPO-D025.

## Article V — identity, authentication and recovery

A stable internal customer identifier owns customer history and entitlements. A phone number is an authentication credential, not the enduring account identifier. Customer sign-in uses phone OTP without a customer password. Credential changes cannot merge accounts or reset trial/referral history. Verified email is unique and can supply independent recovery proof; it is not a new general password-based customer sign-in channel.

Customer sessions have finite access, inactivity and absolute lifetimes. Refresh credentials rotate and replay is detected. Revocation is enforced on the next server authorization, including exposed direct data paths; possession of an unexpired access token alone is insufficient. Server authorization verifies the live session, stable identity, resource ownership and required risk clearance. No positive authorization cache may extend access after revocation.

Risk-triggered access to historical data and sensitive credential changes require independent previously verified proof. An OTP to the same potentially compromised phone, an address, a plan or delivery facts cannot substitute for that proof. Changing a phone requires the independent prior proof and verification of the new phone; changing email requires reauthentication and confirmation of the new email. Single-device and bulk revocation use equivalent sensitive-action authorization. Recovery when both independent factors are lost requires an explicitly approved assisted process; absent it, access remains denied. Recovery actions are recorded and notified.

Staff authentication remains separate from customer authentication. Every staff member requires TOTP in addition to the staff password. Recovery is governed by the two designated administrators; SMS substitution and hidden bypasses are prohibited. Legacy public registration and legacy staff paths must not bypass these controls.

Sources: D-052, D-053, D-063 and 001 identity requirements. Access/inactivity/absolute durations, device concurrency and risk thresholds remain unresolved parameters, not implicit defaults. The contradiction between 001 revocable devices and 004 single-active-session language must be resolved explicitly.

## Article VIII — hosted payment and renewal consent

Retain v4.3.0's hosted payment processor card surface. Automatic renewal requires explicit acceptance of the amount, frequency and versioned terms, an available opt-out and a valid payment mandate. A trial does not renew automatically. Default-on presentation does not replace recorded consent. Due-date charging is idempotent. Sources: PR #5 and D-062.

## Article X — supported surfaces

Retain v4.3.0's French/English commitment. Subscriber life takes place in the native application. The web acquires, configures and takes payment, then hands off to native. After OTP, the narrow web rescue surface provides subscription status, WhatsApp help and cancellation under the same rules. It does not become a meals, preferences or wallet management portal. Sources: PR #5, D-033, D-040 and D-061.

## Article XIV — preserved constraints

Preserve typed, bounded, versioned and audited configuration. Ownership, ledger, food and payment invariants cannot be disabled by configuration. Retention remains purpose- and duration-limited. This proposal does not add retention durations or erase the existing v4.3.0 safeguards. Sources: PR #5 and D-057.

## Review package and remaining approvals

1. Review these four article amendments against the full v4.3.0 branch and existing governance baseline; resolve conflicts before constitutional ratification/merge.
2. Record finite session durations and bounds, device concurrency and risk signals in an identity ADR. Synthetic test durations are not proposed policy.
3. Record the assisted-recovery procedure, authorized staff, independent evidence, refusal/escalation, audit and notification rules for loss of both factors. No reference test authorizes support to bypass proof.
4. Select and verify the real session-revocation adapter in an isolated Supabase environment. Prove old access-token refusal, refresh replay, direct-path enforcement and unavailable-state refusal. Pure Node tests do not satisfy this evidence.
5. Bind live OTP supplier contracts, shared quota accounting, ambiguity reconciliation and approved spend bounds before paid delivery.

The executable reference and its limitations are in `specs/001-identity-account-admission/contracts/security-reference-review.md`. Files in this package stay within SEC-A/C's `specs/001-identity-account-admission/`, `docs/` and `tests/` scopes. The eventual `.specify/memory/constitution.md` edit requires the governance change scope; it is deliberately supplied here as a reviewable amendment proposal. No SEC task is marked accepted by this package.

