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

export const SESSION_LIMITS = Object.freeze({
  accessTtlSeconds: 600,
  idleTtlSeconds: 30 * 24 * 60 * 60,
  absoluteTtlSeconds: 90 * 24 * 60 * 60,
  maxVerificationAttempts: 5,
});

export function isRiskSignal(signal) {
  return RISK_SIGNALS.includes(signal);
}

export function classifySendResult(dispatch) {
  if (!dispatch || typeof dispatch !== 'object' || dispatch.outcomeUnknown === true) return 'ambiguous';
  if (dispatch.outcomeUnknown !== undefined && dispatch.outcomeUnknown !== false) return 'ambiguous';
  if (dispatch.delivered === true) return 'sent';
  if (dispatch.delivered === false) return 'not_sent';
  return 'ambiguous';
}

export function shouldConsumeReservation(result) {
  if (CRITERION.otp.ambiguousSendConsumesReservation && result === 'ambiguous') {
    return true;
  }
  return result === 'sent';
}

export function allowRetry(result) {
  if (CRITERION.otp.blindRetryAllowed) {
    return true;
  }
  return result === 'not_sent';
}

export function canReserveBeforeSend(ledger, request) {
  const deny = { allowed: false, consumed: false };
  if (!ledger || !request || !Number.isSafeInteger(request.units) || request.units <= 0 ||
      !Number.isSafeInteger(ledger.quotaRemaining) || ledger.quotaRemaining < 0 ||
      typeof ledger.has !== 'function' || typeof request.idempotencyKey !== 'string' || !request.idempotencyKey.trim()) return deny;
  if (ledger.has(request.idempotencyKey) === true) return { allowed: true, consumed: false, replay: true };
  if (ledger.quotaRemaining < request.units) return deny;
  return { allowed: true, consumed: true };
}

export function verifyAttemptAllowed(attemptCount) {
  return Number.isSafeInteger(attemptCount) && attemptCount >= 0 && attemptCount < SESSION_LIMITS.maxVerificationAttempts;
}

export function accountLookupResponse() {
  if (CRITERION.otp.accountEnumerationAllowed) {
    return 'account_specific';
  }
  return 'generic';
}

export function sessionValid(session, now) {
  if (!session || !Number.isFinite(now) || now < 0 ||
      !['accessExpiresAt', 'absoluteExpiresAt', 'lastActivityAt'].every(key => Number.isFinite(session[key]) && session[key] >= 0)) return false;
  return session.lastActivityAt <= now && now < session.absoluteExpiresAt &&
    now < session.accessExpiresAt && now - session.lastActivityAt < SESSION_LIMITS.idleTtlSeconds;
}

export function canUnlockHistory(input) {
  if (!input || !isRiskSignal(input.riskSignal) || input.sessionValidation !== 'live' ||
      typeof input.accountId !== 'string' || !input.accountId || typeof input.action !== 'string' || !input.action ||
      !Number.isFinite(input.now) || !Number.isFinite(input.riskObservedAt) ||
      input.riskObservedAt < 0 || input.riskObservedAt > input.now) return false;
  // These are authoritative server records in this isolated reference, never browser assertions.
  const proof = input.independentProof;
  return !!proof && proof.factor === 'verified_email' && proof.previouslyVerified === true &&
    proof.accountAndActionBound === true && proof.used === false &&
    proof.accountId === input.accountId && proof.action === input.action &&
    Number.isFinite(proof.verifiedAt) && proof.verifiedAt >= 0 && proof.verifiedAt < input.riskObservedAt &&
    Number.isFinite(proof.expiresAt) && input.now < proof.expiresAt;
}

export function validationAvailable(check) {
  return check === 'live';
}

export function validationDeniesWhenUnavailable(input) {
  if (CRITERION.risk.unavailableValidationDenies && !validationAvailable(input?.sessionValidation)) {
    return 'deny';
  }
  return 'allow';
}

export function recoveryDecision(input) {
  if (!input || typeof input.bothFactorsLost !== 'boolean') return CRITERION.recovery.missingIndependentEvidence;
  if (input.bothFactorsLost) return input.independentEvidence?.sufficient === true ?
    CRITERION.recovery.bothFactorsLost : CRITERION.recovery.missingIndependentEvidence;
  return 'factor_based_recovery';
}

export function factorReplacementAllowed(replacedFactor, proofFactor) {
  const known = ['phone', 'verified_email'];
  return known.includes(replacedFactor) && known.includes(proofFactor) && replacedFactor !== proofFactor;
}

export function supportApprovalSufficient(input) {
  return input?.independentEvidence?.sufficient === true;
}

export function revokeRequiresProof() {
  return CRITERION.risk.singleAndBulkRevokeSameProof && CRITERION.risk.independentPreviouslyVerifiedProofRequired;
}

export function deliveryFactsProveOwnership(facts) {
  if (CRITERION.recovery.deliveryFactsSufficient) {
    return true;
  }
  return false;
}

export function newlyAddedEmailProvesOwnership(email) {
  if (CRITERION.recovery.newlyAddedEmailSufficient) {
    return true;
  }
  return false;
}

