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
  if (dispatch.delivered) {
    return 'sent';
  }
  if (dispatch.outcomeUnknown) {
    return 'ambiguous';
  }
  return 'not_sent';
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
  if (!CRITERION.otp.quotaBeforeSend) {
    return { allowed: true, consumed: false };
  }
  if (CRITERION.otp.idempotencyRequired && ledger.has(request.idempotencyKey)) {
    return { allowed: true, consumed: false, replay: true };
  }
  if (ledger.quotaRemaining < request.units) {
    return { allowed: false, consumed: false };
  }
  return { allowed: true, consumed: true };
}

export function verifyAttemptAllowed(attemptCount) {
  if (!CRITERION.otp.verificationAttemptsBounded) {
    return true;
  }
  return attemptCount < SESSION_LIMITS.maxVerificationAttempts;
}

export function accountLookupResponse() {
  if (CRITERION.otp.accountEnumerationAllowed) {
    return 'account_specific';
  }
  return 'generic';
}

export function sessionValid(session, now) {
  if (now >= session.absoluteExpiresAt) {
    return false;
  }
  if (now - session.lastActivityAt >= SESSION_LIMITS.idleTtlSeconds) {
    return false;
  }
  if (now >= session.accessExpiresAt) {
    return false;
  }
  return true;
}

export function canUnlockHistory(input) {
  if (!isRiskSignal(input.riskSignal)) {
    return true;
  }
  if (CRITERION.risk.phoneOtpAloneUnlocksHistory) {
    return true;
  }
  if (!CRITERION.risk.independentPreviouslyVerifiedProofRequired) {
    return true;
  }
  const proof = input.independentProof;
  if (!proof) {
    return false;
  }
  if (CRITERION.risk.proofAccountAndActionBound && !proof.accountAndActionBound) {
    return false;
  }
  if (CRITERION.risk.proofSingleUse && proof.used) {
    return false;
  }
  return true;
}

export function validationAvailable(check) {
  return check !== 'unavailable';
}

export function validationDeniesWhenUnavailable(input) {
  if (CRITERION.risk.unavailableValidationDenies && !validationAvailable(input.sessionValidation)) {
    return 'deny';
  }
  return 'allow';
}

export function recoveryDecision(input) {
  if (input.bothFactorsLost) {
    if (input.independentEvidence && input.independentEvidence.sufficient) {
      return CRITERION.recovery.bothFactorsLost;
    }
    return CRITERION.recovery.missingIndependentEvidence;
  }
  return 'factor_based_recovery';
}

export function factorReplacementAllowed(replacedFactor, proofFactor) {
  if (CRITERION.recovery.replaceFactorUsingSameFactor && replacedFactor === proofFactor) {
    return true;
  }
  return replacedFactor !== proofFactor;
}

export function supportApprovalSufficient(input) {
  if (CRITERION.recovery.supportApprovalAloneSufficient) {
    return true;
  }
  return Boolean(input.independentEvidence && input.independentEvidence.sufficient);
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
