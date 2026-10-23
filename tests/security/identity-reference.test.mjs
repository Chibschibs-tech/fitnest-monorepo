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
  validationDeniesWhenUnavailable,
  recoveryDecision,
  factorReplacementAllowed,
  supportApprovalSufficient,
  revokeRequiresProof,
  deliveryFactsProveOwnership,
  newlyAddedEmailProvesOwnership,
} from './identity-reference.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CONTRACT_PATH = resolve(here, '../../docs/delivery/contracts/S001-SEC-A.json');

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

function loadContract() {
  const raw = readFileSync(CONTRACT_PATH, 'utf8');
  assert.ok(raw.charCodeAt(0) !== 0xfeff, 'contract JSON must not carry a BOM');
  assert.ok(Buffer.byteLength(raw, 'utf8') <= 65536, 'contract JSON must be <= 65536 bytes');
  return JSON.parse(raw);
}

test('contract JSON has exactly the required object shape with no extra keys', () => {
  const contract = loadContract();

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
  const contract = loadContract();

  assert.equal(contract.schemaVersion, CRITERION.schemaVersion);
  assert.equal(contract.taskKey, CRITERION.taskKey);
  assert.equal(contract.sourceSha, CRITERION.sourceSha);
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
  const contract = loadContract();

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
  const contract = loadContract();

  for (const entry of contract.unresolved) {
    for (const field of ['proposal', 'remainingEvidence']) {
      const text = entry[field];
      assert.equal(typeof text, 'string');
      assert.ok(text.length >= 20, `${entry.id}.${field} too short (${text.length})`);
      assert.ok(text.length <= 4000, `${entry.id}.${field} too long (${text.length})`);
      assert.ok(!/<replace/.test(text), `${entry.id}.${field} still contains a placeholder`);
    }
  }
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

test('OTP quota is checked and reserved before any send', () => {
  const emptyLedger = { quotaRemaining: 0, has: () => false };
  const result = canReserveBeforeSend(emptyLedger, { idempotencyKey: 'k1', units: 1 });
  assert.equal(result.allowed, false);
  assert.equal(result.consumed, false);

  const fullLedger = { quotaRemaining: 1, has: () => false };
  const allowed = canReserveBeforeSend(fullLedger, { idempotencyKey: 'k2', units: 1 });
  assert.equal(allowed.allowed, true);
  assert.equal(allowed.consumed, true);
});

test('idempotency key replays the same reservation without consuming again', () => {
  const ledger = { quotaRemaining: 0, has: (key) => key === 'k1' };
  const result = canReserveBeforeSend(ledger, { idempotencyKey: 'k1', units: 1 });
  assert.equal(result.allowed, true);
  assert.equal(result.consumed, false);
  assert.equal(result.replay, true);
});

test('ambiguous send consumes the reservation and forbids blind retry', () => {
  const result = classifySendResult({ delivered: false, outcomeUnknown: true });
  assert.equal(result, 'ambiguous');
  assert.equal(shouldConsumeReservation(result), true);
  assert.equal(allowRetry(result), false);

  assert.equal(allowRetry(classifySendResult({ delivered: true })), false);
  assert.equal(allowRetry(classifySendResult({ delivered: false })), true);
});

test('verification attempts are bounded', () => {
  assert.equal(verifyAttemptAllowed(0), true);
  assert.equal(verifyAttemptAllowed(SESSION_LIMITS.maxVerificationAttempts - 1), true);
  assert.equal(verifyAttemptAllowed(SESSION_LIMITS.maxVerificationAttempts), false);
});

test('account lookup never enumerates existence', () => {
  assert.equal(accountLookupResponse(), 'generic');
});

test('sessions enforce short access token and finite idle/absolute lifetime', () => {
  const now = 1_000_000;
  const active = {
    accessExpiresAt: now + 60,
    absoluteExpiresAt: now + 10_000,
    lastActivityAt: now,
  };
  assert.equal(sessionValid(active, now), true);
  assert.equal(sessionValid({ ...active, accessExpiresAt: now - 1 }, now), false);
  assert.equal(sessionValid({ ...active, lastActivityAt: now - SESSION_LIMITS.idleTtlSeconds - 1 }, now), false);
  assert.equal(sessionValid({ ...active, absoluteExpiresAt: now - 1 }, now), false);
});

test('risk signal plus phone OTP alone never unlocks history', () => {
  assert.equal(canUnlockHistory({ riskSignal: 'new_device', independentProof: null }), false);
  assert.equal(canUnlockHistory({ riskSignal: 'new_device', independentProof: { accountAndActionBound: true, used: false } }), true);
  assert.equal(canUnlockHistory({ riskSignal: null, independentProof: null }), true);
});

test('independent proof must be account/action bound and single-use', () => {
  assert.equal(
    canUnlockHistory({ riskSignal: 'changed_number', independentProof: { accountAndActionBound: false, used: false } }),
    false,
  );
  assert.equal(
    canUnlockHistory({ riskSignal: 'changed_number', independentProof: { accountAndActionBound: true, used: true } }),
    false,
  );
});

test('unavailable session validation denies access', () => {
  assert.equal(validationDeniesWhenUnavailable({ sessionValidation: 'unavailable' }), 'deny');
  assert.equal(validationDeniesWhenUnavailable({ sessionValidation: 'live' }), 'allow');
});

test('both factors lost yields audited assistance, never automatic unlock', () => {
  assert.equal(
    recoveryDecision({ bothFactorsLost: true, independentEvidence: { sufficient: true } }),
    'audited_assistance_without_automatic_unlock',
  );
  assert.equal(
    recoveryDecision({ bothFactorsLost: true, independentEvidence: null }),
    'deny_history_and_identity_transfer',
  );
  assert.equal(recoveryDecision({ bothFactorsLost: false, independentEvidence: null }), 'factor_based_recovery');
});

test('a factor is never replaced using only that same factor', () => {
  assert.equal(factorReplacementAllowed('phone', 'phone'), false);
  assert.equal(factorReplacementAllowed('phone', 'verified_email'), true);
});

test('support approval alone is not sufficient recovery evidence', () => {
  assert.equal(supportApprovalSufficient({ independentEvidence: null }), false);
  assert.equal(supportApprovalSufficient({ independentEvidence: { sufficient: true } }), true);
});

test('single and bulk device revoke require the same independent proof', () => {
  assert.equal(revokeRequiresProof(), true);
});

test('delivery facts and a newly added email are never ownership proof', () => {
  assert.equal(deliveryFactsProveOwnership({ address: 'x', plan: 'x', lastDelivery: 'x' }), false);
  assert.equal(newlyAddedEmailProvesOwnership({ verifiedAt: null }), false);
});

test('known risk signals cover the spec risk classes', () => {
  for (const signal of ['new_device', 'changed_number', 'missing_or_expired_session', 'long_inactivity', 'failed_otp_verification', 'device_session_anomaly']) {
    assert.equal(isRiskSignal(signal), true);
  }
  assert.equal(isRiskSignal('normal_return'), false);
});

test('criterion and signal tables are immutable', () => {
  assert.equal(Object.isFrozen(CRITERION), true);
  assert.equal(Object.isFrozen(RISK_SIGNALS), true);
  assert.equal(Object.isFrozen(SESSION_LIMITS), true);
});
