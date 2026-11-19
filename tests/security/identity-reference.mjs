// S001-SEC-A isolated security reference model.
//
// Trust boundary: every helper in this file treats its inputs as authoritative
// synthetic SERVER records, never as browser/client assertions. These are pure
// decision fixtures. They make no production writes, touch no database, and
// prove no distributed atomicity or live provider delivery.

export const CRITERION = Object.freeze({
  schemaVersion: 1,
  taskKey: 'S001-SEC-A',
  sourceSha: '2854038dfe653289c326dd33650a311918f630ad',
  otp: Object.freeze({
    quotaBeforeSend: true,
    sharedAtomicAccountingRequired: true,
    idempotencyRequired: true,
    ambiguousSendConsumesReservation: true,
    blindRetryAllowed: false,
    verificationAttemptsBounded: true,
    accountEnumerationAllowed: false,
    providerQualified: false,
  }),
  risk: Object.freeze({
    stableInternalIdentity: true,
    phoneOtpAloneUnlocksHistory: false,
    independentPreviouslyVerifiedProofRequired: true,
    proofAccountAndActionBound: true,
    proofSingleUse: true,
    singleAndBulkRevokeSameProof: true,
    unavailableValidationDenies: true,
  }),
  recovery: Object.freeze({
    deliveryFactsSufficient: false,
    newlyAddedEmailSufficient: false,
    replaceFactorUsingSameFactor: false,
    bothFactorsLost: 'audited_assistance_without_automatic_unlock',
    missingIndependentEvidence: 'deny_history_and_identity_transfer',
    supportApprovalAloneSufficient: false,
  }),
});

export const RISK_SIGNALS = Object.freeze([
  'new_device',
  'changed_number',
  'missing_or_expired_session',
  'long_inactivity',
  'failed_otp_verification',
  'device_session_anomaly',
]);

// ILLUSTRATIVE AND UNRATIFIED reference limits only. These are NOT deployed
// defaults. Exact production durations/thresholds remain open under G-SESSION.
export const SESSION_LIMITS = Object.freeze({
  accessTtlSeconds: 600,
  idleTtlSeconds: 2592000, // illustrative (30 days), unratified
  absoluteTtlSeconds: 7776000, // illustrative (90 days), unratified
  maxVerificationAttempts: 5, // illustrative, unratified
});

export function isRiskSignal(signal) {
  return RISK_SIGNALS.includes(signal);
}

// classifies a synthetic provider dispatch record. Missing or malformed result,
// a missing strict delivered boolean, an invalid outcomeUnknown, or
// outcomeUnknown === true all yield 'ambiguous' even if delivered === true is
// also asserted. Otherwise strict true means 'sent', strict false 'not_sent'.
export function classifySendResult(dispatch) {
  if (!dispatch || typeof dispatch !== 'object') return 'ambiguous';
  const delivered = dispatch.delivered;
  const unknown = dispatch.outcomeUnknown;
  if (typeof delivered !== 'boolean') return 'ambiguous';
  if (unknown === true) return 'ambiguous';
  if (unknown !== undefined && typeof unknown !== 'boolean') return 'ambiguous';
  return delivered ? 'sent' : 'not_sent';
}

export function shouldConsumeReservation(result) {
  return result === 'sent' || result === 'ambiguous';
}

// allowRetry is true only for an explicit not_sent and means eligibility for
// further checks; it is not a send authorization.
export function allowRetry(result) {
  return result === 'not_sent';
}

// Decision fixture, not a shared ledger implementation. Requires a nonnegative
// safe-integer quotaRemaining, a positive safe-integer units, a nonempty trimmed
// idempotencyKey and a callable ledger.has. A prior-key match replays the old
// reservation even at zero quota; a fresh insufficient quota denies; a fresh
// sufficient quota reserves (allowed + consumed).
export function canReserveBeforeSend(ledger, request) {
  const deny = { allowed: false, consumed: false };
  if (
    !ledger ||
    typeof ledger !== 'object' ||
    !Number.isSafeInteger(ledger.quotaRemaining) ||
    ledger.quotaRemaining < 0 ||
    typeof ledger.has !== 'function' ||
    !request ||
    typeof request !== 'object' ||
    !Number.isSafeInteger(request.units) ||
    request.units <= 0 ||
    typeof request.idempotencyKey !== 'string' ||
    request.idempotencyKey.trim().length === 0
  ) {
    return deny;
  }
  if (ledger.has(request.idempotencyKey) === true) {
    return { allowed: true, consumed: false, replay: true };
  }
  if (ledger.quotaRemaining < request.units) {
    return deny;
  }
  return { allowed: true, consumed: true };
}

// Accepts only safe-integer counters from zero through maxVerificationAttempts-1.
// Malformed, negative and fractional counters deny.
export function verifyAttemptAllowed(attemptCount) {
  return (
    Number.isSafeInteger(attemptCount) &&
    attemptCount >= 0 &&
    attemptCount < SESSION_LIMITS.maxVerificationAttempts
  );
}

// Account existence is never enumerated: the response is always generic.
export function accountLookupResponse() {
  return 'generic';
}

// Requires a finite nonnegative server now and finite nonnegative
// accessExpiresAt/absoluteExpiresAt/lastActivityAt facts. Denies when
// lastActivityAt is after now, when now is not strictly before both expiries, or
// when the idle gap is not strictly below the illustrative idle limit. Missing or
// nonfinite facts deny.
export function sessionValid(session, now) {
  if (
    !session ||
    typeof session !== 'object' ||
    !Number.isFinite(now) ||
    now < 0 ||
    !['accessExpiresAt', 'absoluteExpiresAt', 'lastActivityAt'].every(
      (key) => Number.isFinite(session[key]) && session[key] >= 0,
    )
  ) {
    return false;
  }
  return (
    session.lastActivityAt <= now &&
    now < session.absoluteExpiresAt &&
    now < session.accessExpiresAt &&
    now - session.lastActivityAt < SESSION_LIMITS.idleTtlSeconds
  );
}

// A known risk plus a live session validation plus a matching, previously
// verified, account-and-action bound, single-use, unexpired email proof are all
// required. Phone-OTP-only, unknown risk and unavailable validation deny.
export function canUnlockHistory(input) {
  if (
    !input ||
    typeof input !== 'object' ||
    !isRiskSignal(input.riskSignal) ||
    input.sessionValidation !== 'live' ||
    typeof input.accountId !== 'string' ||
    input.accountId.length === 0 ||
    typeof input.action !== 'string' ||
    input.action.length === 0 ||
    !Number.isFinite(input.now) ||
    input.now < 0 ||
    !Number.isFinite(input.riskObservedAt) ||
    input.riskObservedAt < 0 ||
    input.riskObservedAt > input.now
  ) {
    return false;
  }
  const proof = input.independentProof;
  if (!proof || typeof proof !== 'object') return false;
  return (
    proof.factor === 'verified_email' &&
    proof.previouslyVerified === true &&
    proof.accountAndActionBound === true &&
    proof.used === false &&
    proof.accountId === input.accountId &&
    proof.action === input.action &&
    Number.isFinite(proof.verifiedAt) &&
    proof.verifiedAt >= 0 &&
    proof.verifiedAt < input.riskObservedAt &&
    Number.isFinite(proof.expiresAt) &&
    input.now < proof.expiresAt
  );
}

// True only for a live validation. Accepts either an object record
// ({ sessionValidation: 'live' }) or the legacy string 'live'. Any other value,
// including { sessionValidation: 'pending' }/'unavailable'/'unknown'/'failed'
// or missing/null/undefined, returns false. This helper is not sufficient
// authorization by itself.
export function validationAvailable(check) {
  if (check === 'live') return true;
  return Boolean(
    check !== null &&
      typeof check === 'object' &&
      check.sessionValidation === 'live',
  );
}

// Denies on missing/null/unknown/pending/failed/unavailable input; allows only
// for live (object record or legacy string). This helper is not sufficient
// authorization by itself.
export function validationDeniesWhenUnavailable(check) {
  return validationAvailable(check) ? 'allow' : 'deny';
}

// bothFactorsLost must be a literal boolean. Missing or malformed input denies
// history and identity transfer. Both lost with sufficient independent server
// evidence resolves to audited assistance without automatic unlock; without it,
// denies. bothFactorsLost === false may select factor_based_recovery as a route
// only, without granting historical access.
export function recoveryDecision(input) {
  if (!input || typeof input !== 'object' || typeof input.bothFactorsLost !== 'boolean') {
    return CRITERION.recovery.missingIndependentEvidence;
  }
  if (input.bothFactorsLost === true) {
    const evidence = input.independentEvidence;
    if (evidence !== null && typeof evidence === 'object' && evidence.sufficient === true) {
      return CRITERION.recovery.bothFactorsLost;
    }
    return CRITERION.recovery.missingIndependentEvidence;
  }
  return 'factor_based_recovery';
}

// True only for an independently checked server evidence record, never a
// support-only assertion or truthy text.
export function supportApprovalSufficient(input) {
  if (!input || typeof input !== 'object') return false;
  const evidence = input.independentEvidence;
  return evidence !== null && typeof evidence === 'object' && evidence.sufficient === true;
}

// Only differing known factor names are allowed; a factor is never replaced
// using that same factor.
export function factorReplacementAllowed(replacedFactor, proofFactor) {
  const known = ['phone', 'verified_email'];
  return (
    known.includes(replacedFactor) &&
    known.includes(proofFactor) &&
    replacedFactor !== proofFactor
  );
}

// Single and bulk disconnect share the same independent-proof requirement.
export const revokeRequiresProof =
  CRITERION.risk.singleAndBulkRevokeSameProof &&
  CRITERION.risk.independentPreviouslyVerifiedProofRequired;

// Delivery facts never prove ownership of prior history (D-053/SEC-04).
export const deliveryFactsProveOwnership = CRITERION.recovery.deliveryFactsSufficient;

// A newly added email never proves ownership of prior history.
export const newlyAddedEmailProvesOwnership = CRITERION.recovery.newlyAddedEmailSufficient;

const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,80}$/;

// PURE synthetic-server-record helper for the mandatory SEC-04 security
// notification on completed assisted recovery AND number replacement. Requires
// safe nonempty account/sourceEvent/trustedChannel IDs, a supported operation,
// same-account source event and channel, a previously verified channel, a
// recorded audit entry, and a channel established strictly before the risk was
// observed. Invalid, untrusted, newly added, wrong-account or malformed input
// returns null. Output carries no telephone, email, OTP, session token or
// history. Replays keep the same key; a different channel changes it. A supplier
// outage does not erase the pending intent and grants no historical access.
export function securityNotificationIntent(input) {
  if (!input || typeof input !== 'object') return null;
  const { accountId, sourceEventId, trustedChannelId, operation } = input;
  if (typeof accountId !== 'string' || !SAFE_ID_RE.test(accountId)) return null;
  if (typeof sourceEventId !== 'string' || !SAFE_ID_RE.test(sourceEventId)) return null;
  if (typeof trustedChannelId !== 'string' || !SAFE_ID_RE.test(trustedChannelId)) return null;
  if (operation !== 'recovery_completed' && operation !== 'phone_replaced') return null;
  if (input.sourceEventAccountId !== accountId) return null;
  if (input.channelAccountId !== accountId) return null;
  if (input.channelPreviouslyVerified !== true) return null;
  if (input.auditRecorded !== true) return null;
  const established = input.channelEstablishedAt;
  const observed = input.riskObservedAt;
  if (!Number.isFinite(established) || established < 0) return null;
  if (!Number.isFinite(observed) || observed < 0) return null;
  if (!(established < observed)) return null;
  return {
    accountId,
    sourceEventId,
    operation,
    channelId: trustedChannelId,
    idempotencyKey: JSON.stringify([
      accountId,
      sourceEventId,
      trustedChannelId,
      operation,
      'security_notice_v1',
    ]),
    state: 'pending',
    payload: { kind: 'account_security_change' },
  };
}
