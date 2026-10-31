# B12-C — verified email and transactional communications

Status: proposal. Version 1. Runtime acceptance and production readiness are false. This packet prepares the product contract; it registers no platform profile and sends no message.

## Authority and scope
Source plan 2854038dfe653289c326dd33650a311918f630ad, accepted-foundation base 46599153870b62421ff20568b0dd8679222a297b. D-016/033/039/053/056/062 and SEC-02/04/22/28/30 apply. B01-C contract acceptance is the task prerequisite. SEC-A and SEC-C remain authoritative and unchanged.

The executable reference is a synchronous in-memory specification with synthetic IDs. It does not prove database concurrency, cryptographic signatures, provider behaviour or production auth. A trusted context means data resolved and validated by a server adapter. Never deserialize these flags from client input.

## 1. Email proof exchange
The wire token exchange is authenticated before this model is called; proofId is only its internal opaque lookup reference. registerProof is a fixture seed/trusted-store operation, never a public endpoint. A trusted proof record binds accountId, purpose, operationId and unique emailRef. emailVerifiedAt records the historical independent email verification. proofCompletedAt is the completion of the current challenge, with challengeCompleted=true from the trusted proof store. expiresAt bounds the completed proof; now must be at or after proofCompletedAt and before expiry. Risk recovery and number change require emailVerifiedAt strictly before riskStartedAt, and riskStartedAt cannot be in the future. The current challenge must complete at or after the risk start and before use; historical email verification must precede risk. Unverified/shared email and another account/operation/purpose deny without consuming a legitimate proof.

Consumption and the protected operation must commit atomically in the eventual implementation. A synthetic Map models the one-winner rule only. Actual integration must test simultaneous transactions, rollback, expired evidence, new email after risk and wrong-account token exchange. No proof here grants a customer session or historical-data access: accepted SEC-A/C live identity, risk and revocation guards still apply.

Assisted recovery with lost factors remains G-RECOVERY. Delivery details and phone possession are never substitutes. Secret generation, storage, expiry policy and transport integrate with the accepted identity design, not a new standalone auth system.

## 2. OTP hook boundary
The hook contract accepts only customer_phone_otp with a fresh authenticated signature and shared number/IP/context quota, cooldown, attempts and spend-policy evidence. The synthetic hook has no number or OTP: those remain in the protected provider adapter and are excluded from logs and ordinary outbox payloads.

Duplicate hook IDs are deduplicated. Validation returns validated_only and providerSend=false; it authenticates nobody. Real signature parsing, constant-time validation, key rotation, persistent replay cache and distributed abuse/timeout tests remain required. Provider errors must be non-enumerating and cannot lock a victim out permanently. No production SMS configuration is introduced.

## 3. Minimal notification envelope
The exact allowlist is declared in B12-C.json. It contains only opaque event/account/recipient references, kind, channel, locale, sourceVersion and templateVersion. No free-text payload, contact, phone, email address, token, OTP, health, history or arbitrary URL is allowed. Account and recipient references resolve only server-side and are not rendered into generic notification text. Technical logs pseudonymize these references; the reference emits no logging.

A trusted template registry maps kind + fr/en + templateVersion to reviewed generic content. Unknown locale/version denies, rather than generating or guessing copy. Sensitive details require authenticated owner-scoped retrieval in the app. Handover links must use D-056/SEC-19 opaque expiry/use limits; no such link is fabricated here.

The template registry and recipient resolver are distinct from the public DTO. Allowed channels are current purpose-specific policy evidence, not inferred marketing consent. Push additionally requires live opt-in, session and installation binding. Revocation detaches tokens and prevents dispatch.

## 4. Outbox and provider outcomes
Use the B01 transaction/outbox infrastructure; do not create another scheduler. The business event and outbox intent commit together. Each event/channel/recipient tuple has a unique consumer row. Its immutable fingerprint covers all envelope fields, so a retry cannot silently change the template or account. Different channels/recipients have distinct effects.

State transitions are in B12-C.json. Claimed work is in_flight before a provider call. Only a verified result sets sent. A timeout, disconnect or crash after a possible call is unknown, never not_sent. Unknown work is reconciled using authenticated provider lookup/callback whose outcome, attempt and dedup key exactly match the evidence, and a correlated provider idempotency key. It cannot be resent merely because a lease expired. Positive evidence of no effect allows a bounded retry; current eligibility is rechecked first. Sent is terminal. Invalid, mismatched-attempt and contradictory callbacks deny.

The example maxAttempts range 1..10 is a synthetic model safety bound, not a ratified production retry schedule. Release requires a versioned retry/backoff/dead-letter/alert policy and provider-specific idempotency/reconciliation capabilities. If the provider cannot resolve ambiguity, preserve unknown and escalate; never invent success or automatically retry.

Immediately before the actual provider boundary, recheck the recipient binding, consent/session and subscription state. Serialize the relevant claim/state version or use an equivalent transaction fence. The synchronous reference has no actual send; staging must demonstrate cancellation/revocation races and crash points. If a change occurs after the provider has accepted a generic message, record that ordering truthfully; no promise can retract an already accepted message.

## 5. Renewal, admission and language
renewal_due requires the actual active subscription version, autoRenew enabled, non-trial, valid recurring mandate and versioned acceptance. A delayed old event after cancellation/opt-out denies. Trial never renews automatically. This packet does not implement charging or reinterpret payment failure. Additional renewal-success/failure kinds must have their own authoritative event/state contracts before use; they are not silently treated as renewal_due.

D-016 launch admission notices stay manual. Even an eligible admission envelope requires trusted manual dispatch authorization; generic automatic workers cannot grant it. Other transactional notices follow D-039. Marketing is outside this contract.

Both French and English reviewed template selections are supported. No default fallback invents untranslated or unreviewed text.

## 6. Acceptance and remaining decisions
Run: node --test specs/communications/contracts/communications-reference.test.mjs.

The cases cover N01..N07: purpose/account/operation replay, trusted hook limits, effect deduplication, unknown outcome reconciliation, push revocation, stale renewal/trial/mandate, manual admission and payload/locale denial. The model explicitly returns providerSend=false.

Before runtime acceptance require independent semantic review, PostgreSQL concurrent consumption/outbox tests, provider adapter callback/ambiguity tests, current-state race tests, owner-scoped history retrieval, and exact CI/deployed artifact evidence. No such runtime evidence is claimed here.

G-PROVIDERS, G-PRIVACY and G-RECOVERY remain open. Provider choices, approved copy, sender domains, secret-manager references, retention purpose/durations and assisted recovery need their existing decision owners. Synthetic tests can proceed without those production decisions. No platform profile/receipt/gate has been altered.
