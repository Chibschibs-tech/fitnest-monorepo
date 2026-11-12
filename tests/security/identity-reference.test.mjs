import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  CRITERION,
  RISK_SIGNALS,
  SESSION_LIMITS,
  isRiskSignal,
  classifySendResult,
  shouldConsumeReservation,
  allowRetry,
  canReserveBeforeSend,
  verifyAttemptAllowed,
  accountLookupResponse,
  sessionValid,
  canUnlockHistory,
  validationAvailable,
  validationDeniesWhenUnavailable,
  recoveryDecision,
  factorReplacementAllowed,
  supportApprovalSufficient,
  revokeRequiresProof,
  deliveryFactsProveOwnership,
  newlyAddedEmailProvesOwnership,
  securityNotificationIntent,
} from './identity-reference.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CONTRACT_PATH = resolve(here, '../../docs/delivery/contracts/S001-SEC-A.json');
const OBLIGATIONS_PATH = resolve(here, '../../docs/delivery/contracts/S001-SEC-A-obligations.json');
const ADR_PATH = resolve(here, '../../docs/delivery/adr-sec-a.md');

const EXPECTED_TOP_LEVEL_KEYS = [
  'schemaVersion',
  'taskKey',
  'sourceSha',
  'criterion',
  'status',
  'authority',
  'otp',
  'risk',
  'recovery',
  'unresolved',
  'verification',
];

const EXPECTED_UNRESOLVED = [
  ['session_durations', 'G-SESSION'],
  ['device_concurrency', 'G-SESSION'],
  ['risk_signals', 'G-SESSION'],
  ['assisted_recovery_evidence', 'G-RECOVERY'],
  ['live_provider_and_budget', 'G-PROVIDERS'],
];

const EXPECTED_OBLIGATIONS = [
  ['challenge_expiry_single_use', ['SEC-01']],
  ['multi_instance_quota', ['SEC-02']],
  ['otp_ambiguity_idempotency', ['SEC-02']],
  ['verification_attempt_bounds', ['SEC-02']],
  ['non_enumerating_responses', ['SEC-02']],
  ['bounded_sessions', ['FR-038']],
  ['prior_proof_risk', ['SEC-04', 'D-053']],
  ['recovery_audit_notification', ['SEC-04']],
  ['number_change_notification', ['SEC-04']],
  ['unresolved_choices', ['D-053']],
  ['no_production_writes', ['S001-SEC-A']],
];

function loadJson(path) {
  const raw = readFileSync(path, 'utf8');
  assert.ok(raw.charCodeAt(0) !== 0xfeff, `${path} must not carry a BOM`);
  assert.ok(Buffer.byteLength(raw, 'utf8') <= 131072, `${path} must be <= 131072 bytes`);
  return JSON.parse(raw);
}

const validHistoryInput = () => ({
  riskSignal: 'new_device',
  sessionValidation: 'live',
  accountId: 'acct_1',
  action: 'read_history',
  now: 2000,
  riskObservedAt: 1000,
  independentProof: {
    factor: 'verified_email',
    previouslyVerified: true,
    accountAndActionBound: true,
    used: false,
    accountId: 'acct_1',
    action: 'read_history',
    verifiedAt: 500,
    expiresAt: 3000,
  },
});

const validNotificationInput = () => ({
  accountId: 'acct_1',
  sourceEventId: 'evt_rec_1',
  trustedChannelId: 'ch_email_1',
  operation: 'recovery_completed',
  sourceEventAccountId: 'acct_1',
  channelAccountId: 'acct_1',
  channelPreviouslyVerified: true,
  auditRecorded: true,
  channelEstablishedAt: 1000,
  riskObservedAt: 2000,
});

test('contract JSON has exactly the required top-level shape with no extra keys', () => {
  const contract = loadJson(CONTRACT_PATH);
  assert.deepEqual(Object.keys(contract), EXPECTED_TOP_LEVEL_KEYS);
  assert.deepEqual(Object.keys(contract.authority), [
    'productionWritesAuthorized',
    'gatesApproved',
    'budgetApproved',
    'taskAccepted',
  ]);
  assert.deepEqual(Object.keys(contract.otp), [
    'quotaBeforeSend',
    'sharedAtomicAccountingRequired',
    'idempotencyRequired',
    'ambiguousSendConsumesReservation',
    'blindRetryAllowed',
    'verificationAttemptsBounded',
    'accountEnumerationAllowed',
    'providerQualified',
  ]);
  assert.deepEqual(Object.keys(contract.risk), [
    'stableInternalIdentity',
    'phoneOtpAloneUnlocksHistory',
    'independentPreviouslyVerifiedProofRequired',
    'proofAccountAndActionBound',
    'proofSingleUse',
    'singleAndBulkRevokeSameProof',
    'unavailableValidationDenies',
  ]);
  assert.deepEqual(Object.keys(contract.recovery), [
    'deliveryFactsSufficient',
    'newlyAddedEmailSufficient',
    'replaceFactorUsingSameFactor',
    'bothFactorsLost',
    'missingIndependentEvidence',
    'supportApprovalAloneSufficient',
  ]);
  assert.deepEqual(Object.keys(contract.verification), [
    'referenceModelOnly',
    'distributedAtomicityProven',
    'providerBehaviorProven',
    'noProductionWritesAttested',
    'independentReviewRequired',
    'fullAcceptanceClaimed',
  ]);
});

test('contract JSON fixed values match the frozen reference model exactly', () => {
  const contract = loadJson(CONTRACT_PATH);
  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.taskKey, 'S001-SEC-A');
  assert.equal(contract.sourceSha, '2854038dfe653289c326dd33650a311918f630ad');
  assert.equal(
    contract.criterion,
    'OTP abuse/risk/recovery design; record unresolved choices and no production writes.',
  );
  assert.equal(contract.status, 'proposal');
  assert.deepEqual(contract.otp, CRITERION.otp);
  assert.deepEqual(contract.risk, CRITERION.risk);
  assert.deepEqual(contract.recovery, CRITERION.recovery);
  assert.equal(contract.authority.productionWritesAuthorized, false);
  assert.equal(contract.authority.gatesApproved, false);
  assert.equal(contract.authority.budgetApproved, false);
  assert.equal(contract.authority.taskAccepted, false);
  assert.equal(contract.recovery.bothFactorsLost, 'audited_assistance_without_automatic_unlock');
  assert.equal(contract.recovery.missingIndependentEvidence, 'deny_history_and_identity_transfer');
  assert.equal(contract.verification.referenceModelOnly, true);
  assert.equal(contract.verification.distributedAtomicityProven, false);
  assert.equal(contract.verification.providerBehaviorProven, false);
  assert.equal(contract.verification.noProductionWritesAttested, false);
  assert.equal(contract.verification.independentReviewRequired, true);
  assert.equal(contract.verification.fullAcceptanceClaimed, false);
});

test('contract JSON records exactly five unresolved choices with correct ids, gates and status', () => {
  const contract = loadJson(CONTRACT_PATH);
  assert.equal(contract.unresolved.length, EXPECTED_UNRESOLVED.length);
  contract.unresolved.forEach((entry, i) => {
    const [expectedId, expectedGate] = EXPECTED_UNRESOLVED[i];
    assert.deepEqual(Object.keys(entry), ['id', 'gate', 'status', 'proposal', 'remainingEvidence']);
    assert.equal(entry.id, expectedId);
    assert.equal(entry.gate, expectedGate);
    assert.equal(entry.status, 'unratified');
  });
});

test('each unresolved proposal and remainingEvidence is source-grounded prose within 20..4000 chars', () => {
  const contract = loadJson(CONTRACT_PATH);
  for (const entry of contract.unresolved) {
    for (const field of ['proposal', 'remainingEvidence']) {
      const text = entry[field];
      assert.equal(typeof text, 'string');
      assert.ok(text.length >= 20, `${entry.id}.${field} too short (${text.length})`);
      assert.ok(text.length <= 4000, `${entry.id}.${field} too long (${text.length})`);
    }
  }
});

test('obligations contract has the required top-level shape and metadata', () => {
  const ob = loadJson(OBLIGATIONS_PATH);
  assert.deepEqual(Object.keys(ob), [
    'schemaVersion',
    'taskKey',
    'sourceSha',
    'criterion',
    'status',
    'designDocument',
    'obligations',
    'unresolvedGateIds',
    'runtimeAcceptance',
  ]);
  assert.equal(ob.schemaVersion, 1);
  assert.equal(ob.taskKey, 'S001-SEC-A');
  assert.equal(ob.sourceSha, '2854038dfe653289c326dd33650a311918f630ad');
  assert.equal(ob.criterion, 'OTP abuse/risk/recovery design; record unresolved choices and no production writes.');
  assert.equal(ob.status, 'proposal');
  assert.equal(ob.designDocument, 'docs/delivery/adr-sec-a.md');
  assert.equal(ob.runtimeAcceptance, false);
  assert.deepEqual(ob.unresolvedGateIds, ['G-BUDGET', 'G-PROVIDERS', 'G-RECOVERY', 'G-SESSION']);
});

test('obligations list has exactly the required ids with minimal normative sourceRefs', () => {
  const ob = loadJson(OBLIGATIONS_PATH);
  assert.equal(ob.obligations.length, EXPECTED_OBLIGATIONS.length);
  const adr = readFileSync(ADR_PATH, 'utf8');
  ob.obligations.forEach((entry, i) => {
    const [expectedId, minimalRefs] = EXPECTED_OBLIGATIONS[i];
    assert.deepEqual(Object.keys(entry), ['id', 'sourceRefs', 'designSection', 'verification']);
    assert.equal(entry.id, expectedId);
    assert.ok(Array.isArray(entry.sourceRefs) && entry.sourceRefs.length > 0);
    assert.equal(new Set(entry.sourceRefs).size, entry.sourceRefs.length, `${entry.id} sourceRefs not unique`);
    for (const ref of minimalRefs) {
      assert.ok(entry.sourceRefs.includes(ref), `${entry.id} missing normative sourceRef ${ref}`);
    }
    assert.ok(Array.isArray(entry.verification) && entry.verification.length > 0);
    assert.equal(new Set(entry.verification).size, entry.verification.length, `${entry.id} verification not unique`);
    assert.ok(entry.designSection.startsWith('## '), `${entry.id} designSection missing ## prefix`);
    assert.ok(
      adr.includes(entry.designSection),
      `${entry.id} designSection heading missing from ADR`,
    );
  });
});

test('criterion freezes the agreed OTP abuse/risk/recovery invariants', () => {
  assert.equal(CRITERION.schemaVersion, 1);
  assert.equal(CRITERION.taskKey, 'S001-SEC-A');
  assert.equal(CRITERION.otp.quotaBeforeSend, true);
  assert.equal(CRITERION.otp.sharedAtomicAccountingRequired, true);
  assert.equal(CRITERION.otp.idempotencyRequired, true);
  assert.equal(CRITERION.otp.ambiguousSendConsumesReservation, true);
  assert.equal(CRITERION.otp.blindRetryAllowed, false);
  assert.equal(CRITERION.otp.verificationAttemptsBounded, true);
  assert.equal(CRITERION.otp.accountEnumerationAllowed, false);
  assert.equal(CRITERION.otp.providerQualified, false);
  assert.equal(CRITERION.risk.stableInternalIdentity, true);
  assert.equal(CRITERION.risk.phoneOtpAloneUnlocksHistory, false);
  assert.equal(CRITERION.risk.independentPreviouslyVerifiedProofRequired, true);
  assert.equal(CRITERION.risk.proofAccountAndActionBound, true);
  assert.equal(CRITERION.risk.proofSingleUse, true);
  assert.equal(CRITERION.risk.singleAndBulkRevokeSameProof, true);
  assert.equal(CRITERION.risk.unavailableValidationDenies, true);
  assert.equal(CRITERION.recovery.deliveryFactsSufficient, false);
  assert.equal(CRITERION.recovery.newlyAddedEmailSufficient, false);
  assert.equal(CRITERION.recovery.replaceFactorUsingSameFactor, false);
  assert.equal(CRITERION.recovery.bothFactorsLost, 'audited_assistance_without_automatic_unlock');
  assert.equal(CRITERION.recovery.missingIndependentEvidence, 'deny_history_and_identity_transfer');
  assert.equal(CRITERION.recovery.supportApprovalAloneSufficient, false);
});

test('criterion and signal tables are immutable', () => {
  assert.equal(Object.isFrozen(CRITERION), true);
  assert.equal(Object.isFrozen(CRITERION.otp), true);
  assert.equal(Object.isFrozen(CRITERION.risk), true);
  assert.equal(Object.isFrozen(CRITERION.recovery), true);
  assert.equal(Object.isFrozen(RISK_SIGNALS), true);
  assert.equal(Object.isFrozen(SESSION_LIMITS), true);
});

test('known risk signals cover the spec risk classes and only those', () => {
  for (const signal of [
    'new_device',
    'changed_number',
    'missing_or_expired_session',
    'long_inactivity',
    'failed_otp_verification',
    'device_session_anomaly',
  ]) {
    assert.equal(isRiskSignal(signal), true, `${signal} should be a known signal`);
  }
  assert.equal(isRiskSignal('normal_return'), false);
  assert.equal(isRiskSignal(''), false);
  assert.equal(isRiskSignal(null), false);
  assert.equal(isRiskSignal(undefined), false);
});

test('classifySendResult: sent, not_sent and ambiguous outcomes', () => {
  assert.equal(classifySendResult({ delivered: true }), 'sent');
  assert.equal(classifySendResult({ delivered: false }), 'not_sent');
  assert.equal(classifySendResult({ delivered: true, outcomeUnknown: false }), 'sent');
  assert.equal(classifySendResult({ delivered: false, outcomeUnknown: false }), 'not_sent');
});

test('classifySendResult: missing/malformed/invalid input is ambiguous', () => {
  assert.equal(classifySendResult(undefined), 'ambiguous');
  assert.equal(classifySendResult(null), 'ambiguous');
  assert.equal(classifySendResult('sent'), 'ambiguous');
  assert.equal(classifySendResult({}), 'ambiguous');
  assert.equal(classifySendResult({ delivered: 'yes' }), 'ambiguous');
  assert.equal(classifySendResult({ delivered: 1 }), 'ambiguous');
  assert.equal(classifySendResult({ delivered: true, outcomeUnknown: 'yes' }), 'ambiguous');
  assert.equal(classifySendResult({ delivered: true, outcomeUnknown: 1 }), 'ambiguous');
});

test('classifySendResult: outcomeUnknown true is ambiguous even with delivered true', () => {
  assert.equal(classifySendResult({ delivered: true, outcomeUnknown: true }), 'ambiguous');
  assert.equal(classifySendResult({ delivered: false, outcomeUnknown: true }), 'ambiguous');
});

test('shouldConsumeReservation is true for sent and ambiguous, false otherwise', () => {
  assert.equal(shouldConsumeReservation('sent'), true);
  assert.equal(shouldConsumeReservation('ambiguous'), true);
  assert.equal(shouldConsumeReservation('not_sent'), false);
  assert.equal(shouldConsumeReservation('whatever'), false);
});

test('allowRetry is true only for explicit not_sent', () => {
  assert.equal(allowRetry('not_sent'), true);
  assert.equal(allowRetry('sent'), false);
  assert.equal(allowRetry('ambiguous'), false);
});

test('canReserveBeforeSend: invalid requests deny without consuming', () => {
  const ledger = { quotaRemaining: 10, has: () => false };
  assert.deepEqual(canReserveBeforeSend(null, { idempotencyKey: 'k', units: 1 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend(ledger, null), { allowed: false, consumed: false });
  assert.deepEqual(canReserveBeforeSend(ledger, { idempotencyKey: 'k', units: 0 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend(ledger, { idempotencyKey: 'k', units: -1 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend(ledger, { idempotencyKey: 'k', units: 1.5 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend(ledger, { idempotencyKey: '', units: 1 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend(ledger, { idempotencyKey: '   ', units: 1 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend({ quotaRemaining: -1, has: () => false }, { idempotencyKey: 'k', units: 1 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend({ quotaRemaining: 1.5, has: () => false }, { idempotencyKey: 'k', units: 1 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend({ quotaRemaining: 10 }, { idempotencyKey: 'k', units: 1 }), {
    allowed: false,
    consumed: false,
  });
});

test('canReserveBeforeSend: prior-key match replays even at zero quota', () => {
  const ledger = { quotaRemaining: 0, has: (key) => key === 'k1' };
  assert.deepEqual(canReserveBeforeSend(ledger, { idempotencyKey: 'k1', units: 1 }), {
    allowed: true,
    consumed: false,
    replay: true,
  });
});

test('canReserveBeforeSend: fresh quota reserve or deny', () => {
  const empty = { quotaRemaining: 0, has: () => false };
  assert.deepEqual(canReserveBeforeSend(empty, { idempotencyKey: 'k2', units: 1 }), {
    allowed: false,
    consumed: false,
  });
  const full = { quotaRemaining: 2, has: () => false };
  assert.deepEqual(canReserveBeforeSend(full, { idempotencyKey: 'k3', units: 1 }), {
    allowed: true,
    consumed: true,
  });
  assert.deepEqual(canReserveBeforeSend(full, { idempotencyKey: 'k4', units: 3 }), {
    allowed: false,
    consumed: false,
  });
  assert.deepEqual(canReserveBeforeSend(full, { idempotencyKey: 'k5', units: 2 }), {
    allowed: true,
    consumed: true,
  });
});

test('verifyAttemptAllowed accepts safe-integer counters below the bound only', () => {
  assert.equal(verifyAttemptAllowed(0), true);
  assert.equal(verifyAttemptAllowed(SESSION_LIMITS.maxVerificationAttempts - 1), true);
  assert.equal(verifyAttemptAllowed(SESSION_LIMITS.maxVerificationAttempts), false);
  assert.equal(verifyAttemptAllowed(-1), false);
  assert.equal(verifyAttemptAllowed(1.5), false);
  assert.equal(verifyAttemptAllowed('3'), false);
  assert.equal(verifyAttemptAllowed(null), false);
  assert.equal(verifyAttemptAllowed(undefined), false);
});

test('account lookup never enumerates existence', () => {
  assert.equal(accountLookupResponse(), 'generic');
  assert.equal(accountLookupResponse(), 'generic');
});

test('sessionValid accepts a live bounded session', () => {
  const now = 1_000_000;
  const active = {
    accessExpiresAt: now + 60,
    absoluteExpiresAt: now + 10_000,
    lastActivityAt: now,
  };
  assert.equal(sessionValid(active, now), true);
});

test('sessionValid denies expired, future-activity, idle and malformed facts', () => {
  const now = 1_000_000;
  const active = {
    accessExpiresAt: now + 60,
    absoluteExpiresAt: now + 10_000,
    lastActivityAt: now,
  };
  assert.equal(sessionValid({ ...active, accessExpiresAt: now - 1 }, now), false);
  assert.equal(sessionValid({ ...active, absoluteExpiresAt: now - 1 }, now), false);
  assert.equal(sessionValid({ ...active, lastActivityAt: now + 1 }, now), false);
  assert.equal(sessionValid({ ...active, lastActivityAt: now - SESSION_LIMITS.idleTtlSeconds }, now), false);
  assert.equal(sessionValid(null, now), false);
  assert.equal(sessionValid(active, -1), false);
  assert.equal(sessionValid(active, NaN), false);
  assert.equal(sessionValid({ accessExpiresAt: now, absoluteExpiresAt: now, lastActivityAt: now }, now), false);
});

test('canUnlockHistory grants only with a full matching server proof', () => {
  assert.equal(canUnlockHistory(validHistoryInput()), true);
});

test('canUnlockHistory denies phone-OTP-only, unknown risk and unavailable validation', () => {
  const base = validHistoryInput();
  assert.equal(canUnlockHistory({ ...base, independentProof: null }), false);
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, factor: 'phone' } }),
    false,
  );
  assert.equal(canUnlockHistory({ ...base, riskSignal: 'normal_return' }), false);
  assert.equal(canUnlockHistory({ ...base, sessionValidation: 'unavailable' }), false);
  assert.equal(canUnlockHistory({ ...base, sessionValidation: 'pending' }), false);
});

test('canUnlockHistory denies wrong, missing, new, expired, used and unverified proof', () => {
  const base = validHistoryInput();
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, previouslyVerified: false } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, accountAndActionBound: false } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, used: true } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, accountId: 'other' } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, action: 'other' } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, verifiedAt: 1500 } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ ...base, independentProof: { ...base.independentProof, expiresAt: 1500 } }),
    false,
  );
  assert.equal(canUnlockHistory({ ...base, now: 500 }), false);
});

test('validationAvailable is true only for live', () => {
  assert.equal(validationAvailable('live'), true);
  assert.equal(validationAvailable('pending'), false);
  assert.equal(validationAvailable('unavailable'), false);
  assert.equal(validationAvailable('unknown'), false);
  assert.equal(validationAvailable('failed'), false);
  assert.equal(validationAvailable(null), false);
  assert.equal(validationAvailable(undefined), false);
});

test('validationAvailable accepts the object record or the legacy string', () => {
  assert.equal(validationAvailable({ sessionValidation: 'live' }), true);
  assert.equal(validationAvailable({ sessionValidation: 'live', extra: 'x' }), true);
  assert.equal(validationAvailable({ sessionValidation: 'pending' }), false);
  assert.equal(validationAvailable({ sessionValidation: 'unavailable' }), false);
  assert.equal(validationAvailable({ sessionValidation: 'unknown' }), false);
  assert.equal(validationAvailable({ sessionValidation: 'failed' }), false);
  assert.equal(validationAvailable({}), false);
  assert.equal(validationAvailable({ sessionValidation: 'Live' }), false);
});

test('validationDeniesWhenUnavailable denies except for live', () => {
  assert.equal(validationDeniesWhenUnavailable('live'), 'allow');
  assert.equal(validationDeniesWhenUnavailable({ sessionValidation: 'live' }), 'allow');
  assert.equal(validationDeniesWhenUnavailable('unavailable'), 'deny');
  assert.equal(validationDeniesWhenUnavailable('pending'), 'deny');
  assert.equal(validationDeniesWhenUnavailable('failed'), 'deny');
  assert.equal(validationDeniesWhenUnavailable('unknown'), 'deny');
  assert.equal(validationDeniesWhenUnavailable(null), 'deny');
  assert.equal(validationDeniesWhenUnavailable(undefined), 'deny');
  assert.equal(validationDeniesWhenUnavailable({ sessionValidation: 'pending' }), 'deny');
  assert.equal(validationDeniesWhenUnavailable({}), 'deny');
});

test('recoveryDecision requires a literal boolean bothFactorsLost', () => {
  assert.equal(recoveryDecision(null), 'deny_history_and_identity_transfer');
  assert.equal(recoveryDecision(undefined), 'deny_history_and_identity_transfer');
  assert.equal(recoveryDecision({ bothFactorsLost: 'true' }), 'deny_history_and_identity_transfer');
  assert.equal(recoveryDecision({ bothFactorsLost: 1 }), 'deny_history_and_identity_transfer');
  assert.equal(
    recoveryDecision({ bothFactorsLost: true, independentEvidence: { sufficient: true } }),
    'audited_assistance_without_automatic_unlock',
  );
  assert.equal(
    recoveryDecision({ bothFactorsLost: true, independentEvidence: { sufficient: false } }),
    'deny_history_and_identity_transfer',
  );
  assert.equal(recoveryDecision({ bothFactorsLost: true }), 'deny_history_and_identity_transfer');
  assert.equal(
    recoveryDecision({ bothFactorsLost: true, independentEvidence: { sufficient: 'true' } }),
    'deny_history_and_identity_transfer',
  );
  assert.equal(recoveryDecision({ bothFactorsLost: false }), 'factor_based_recovery');
});

test('support approval alone is never sufficient recovery evidence', () => {
  assert.equal(supportApprovalSufficient(null), false);
  assert.equal(supportApprovalSufficient('approved'), false);
  assert.equal(supportApprovalSufficient({ supportApproved: true }), false);
  assert.equal(supportApprovalSufficient({ independentEvidence: { sufficient: true } }), true);
  assert.equal(supportApprovalSufficient({ independentEvidence: { sufficient: 'true' } }), false);
});

test('a factor is never replaced using only that same factor', () => {
  assert.equal(factorReplacementAllowed('phone', 'phone'), false);
  assert.equal(factorReplacementAllowed('verified_email', 'verified_email'), false);
  assert.equal(factorReplacementAllowed('phone', 'verified_email'), true);
  assert.equal(factorReplacementAllowed('verified_email', 'phone'), true);
  assert.equal(factorReplacementAllowed('phone', 'email'), false);
  assert.equal(factorReplacementAllowed('sms', 'verified_email'), false);
});

test('single and bulk device revoke require the same independent proof', () => {
  assert.equal(revokeRequiresProof, true);
});

test('delivery facts and a newly added email are never ownership proof', () => {
  assert.equal(deliveryFactsProveOwnership, false);
  assert.equal(newlyAddedEmailProvesOwnership, false);
});

test('securityNotificationIntent emits the exact privacy-safe pending intent', () => {
  const out = securityNotificationIntent(validNotificationInput());
  assert.deepEqual(out, {
    accountId: 'acct_1',
    sourceEventId: 'evt_rec_1',
    operation: 'recovery_completed',
    channelId: 'ch_email_1',
    idempotencyKey: JSON.stringify(['acct_1', 'evt_rec_1', 'ch_email_1', 'recovery_completed', 'security_notice_v1']),
    state: 'pending',
    payload: { kind: 'account_security_change' },
  });
  assert.deepEqual(Object.keys(out.payload), ['kind']);
  const payloadSerialized = JSON.stringify(out.payload).toLowerCase();
  for (const forbidden of ['phone', 'email', 'otp', 'token', 'history']) {
    assert.equal(payloadSerialized.includes(forbidden), false, `payload leaked ${forbidden}`);
  }
});

test('securityNotificationIntent supports phone_replaced with the same shape', () => {
  const out = securityNotificationIntent({ ...validNotificationInput(), operation: 'phone_replaced' });
  assert.equal(out.operation, 'phone_replaced');
  assert.equal(out.state, 'pending');
  assert.deepEqual(out.payload, { kind: 'account_security_change' });
});

test('securityNotificationIntent denies malformed, untrusted, newly added, wrong-account inputs', () => {
  const base = validNotificationInput();
  assert.equal(securityNotificationIntent(null), null);
  assert.equal(securityNotificationIntent({}), null);
  assert.equal(securityNotificationIntent({ ...base, accountId: '' }), null);
  assert.equal(securityNotificationIntent({ ...base, accountId: 'bad id!' }), null);
  assert.equal(securityNotificationIntent({ ...base, operation: 'password_reset' }), null);
  assert.equal(securityNotificationIntent({ ...base, sourceEventAccountId: 'other' }), null);
  assert.equal(securityNotificationIntent({ ...base, channelAccountId: 'other' }), null);
  assert.equal(securityNotificationIntent({ ...base, channelPreviouslyVerified: false }), null);
  assert.equal(securityNotificationIntent({ ...base, auditRecorded: false }), null);
  assert.equal(securityNotificationIntent({ ...base, channelEstablishedAt: 2000, riskObservedAt: 1000 }), null);
  assert.equal(securityNotificationIntent({ ...base, channelEstablishedAt: -1 }), null);
  assert.equal(securityNotificationIntent({ ...base, riskObservedAt: -1 }), null);
});

test('notification replays keep the same key while a different channel changes it', () => {
  const a = securityNotificationIntent(validNotificationInput());
  const b = securityNotificationIntent(validNotificationInput());
  assert.equal(a.idempotencyKey, b.idempotencyKey);
  const c = securityNotificationIntent({ ...validNotificationInput(), trustedChannelId: 'ch_email_2' });
  assert.notEqual(a.idempotencyKey, c.idempotencyKey);
  assert.equal(c.channelId, 'ch_email_2');
});

test('supplier outage does not erase the pending intent or grant historical access', () => {
  const out = securityNotificationIntent(validNotificationInput());
  assert.equal(out.state, 'pending');
  assert.deepEqual(out.payload, { kind: 'account_security_change' });
  assert.equal('history' in out.payload, false);
  assert.equal(canUnlockHistory(validHistoryInput()), true);
  assert.equal(canUnlockHistory({ ...validHistoryInput(), independentProof: null }), false);
});
