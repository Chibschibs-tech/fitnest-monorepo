// DESIGN REFERENCE ONLY. Trusted verifier facts are test inputs, never HTTP fields.
// No provider verification, token issuance, database concurrency or production auth.
const deny = () => { throw new Error('DENIED'); };
const bounded = (value) => Number.isSafeInteger(value) && value > 0;
const identifier = (value) => typeof value === 'string' && value.trim().length > 0;
const counter = (value) => Number.isSafeInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER;
const revision = (state, expected) => { if (!counter(state.revision) || !counter(expected) || state.revision !== expected) deny(); };
export function beginRecovery(state, facts, now) {
  revision(state, facts.expectedRevision);
  if (!counter(state.sessionEpoch) || !identifier(state.accountId) || !identifier(facts.accountId) ||
      !identifier(facts.proofId) || !identifier(facts.operationId) || !identifier(facts.challengeId)) deny();
  const proof = state.proofs.find(p => p.id === facts.proofId);
  if (!bounded(now) || !bounded(facts.expiresAt) || facts.expiresAt <= now ||
      !['active', 'recovery_pending'].includes(state.status) ||
      facts.passwordVerified !== true || facts.proofVerified !== true ||
      facts.accountId !== state.accountId || !facts.operationId || !facts.challengeId ||
      !proof || proof.accountId !== state.accountId || proof.purpose !== 'staff.mfa.recovery' ||
      proof.used !== false || !bounded(proof.expiresAt) || proof.expiresAt <= now ||
      !bounded(proof.enrolledAt) || proof.enrolledAt >= now) deny();
  // Production requires one transaction with account/proof locks and unique consumption.
  proof.used = true;
  state.status = 'recovery_pending';
  state.sessionEpoch++;
  state.revision++;
  state.challenge = { id: facts.challengeId, operationId: facts.operationId,
    accountId: state.accountId, expiresAt: facts.expiresAt };
  state.effects.push({ action: 'recovery_started', accountId: state.accountId,
    operationId: facts.operationId, occurredAt: now });
  return { staffSessionIssued: false, recoveryOnly: true };
}
export function completeRecovery(state, facts, now) {
  revision(state, facts.expectedRevision);
  if (!counter(state.sessionEpoch) || !identifier(state.accountId) || !identifier(facts.accountId) ||
      !identifier(facts.operationId) || !identifier(facts.challengeId) || !identifier(facts.newFactorId)) deny();
  const challenge = state.challenge;
  if (!bounded(now) || state.status !== 'recovery_pending' || !challenge ||
      !bounded(challenge.expiresAt) || challenge.expiresAt <= now ||
      challenge.accountId !== state.accountId || facts.accountId !== state.accountId ||
      facts.challengeId !== challenge.id || facts.operationId !== challenge.operationId ||
      facts.newFactorVerified !== true || !facts.newFactorId ||
      facts.newFactorId === state.factorId) deny();
  state.factorId = facts.newFactorId;
  for (const proof of state.proofs) proof.used = true;
  state.sessionEpoch++;
  state.status = 'active';
  state.challenge = null;
  state.revision++;
  state.effects.push({ action: 'recovery_completed', accountId: state.accountId,
    operationId: facts.operationId, occurredAt: now });
  return { staffSessionIssued: false, freshSignInRequired: true };
}
export function createBootstrap(facts) {
  if (facts.operatorAuthorized !== true || facts.existingBootstrap !== false ||
      !identifier(facts.manifestId) || !Array.isArray(facts.adminIds) || facts.adminIds.length !== 2 ||
      facts.adminIds.some(id => typeof id !== 'string' || !id.trim()) ||
      new Set(facts.adminIds).size !== 2) deny();
  return { manifestId: facts.manifestId, adminIds: [...facts.adminIds], enrolled: [],
    usedInvitations: [], revision: 0, status: 'open', effects: [] };
}
export function enrollBootstrap(state, facts, now) {
  revision(state, facts.expectedRevision);
  if (!identifier(facts.manifestId) || !identifier(facts.accountId) || !identifier(facts.invitationId) ||
      facts.invitationAccountId !== facts.accountId || facts.invitationManifestId !== state.manifestId ||
      state.status !== 'open' || facts.manifestId !== state.manifestId ||
      !state.adminIds.includes(facts.accountId) || state.enrolled.includes(facts.accountId) ||
      facts.invitationVerified !== true || facts.passwordEnrolled !== true ||
      facts.totpVerified !== true || !facts.invitationId ||
      state.usedInvitations.includes(facts.invitationId) || !bounded(now) ||
      !bounded(facts.invitationExpiresAt) || facts.invitationExpiresAt <= now) deny();
  state.enrolled.push(facts.accountId);
  state.usedInvitations.push(facts.invitationId);
  state.revision++;
  state.effects.push({ action: 'bootstrap_enrolled', accountId: facts.accountId, occurredAt: now });
  if (state.enrolled.length === 2) {
    state.status = 'sealed';
    state.effects.push({ action: 'bootstrap_sealed', occurredAt: now });
  }
  return { businessAuthorizationReady: state.status === 'sealed', staffSessionIssued: false };
}
export const knownPermissions = new Set([
  'settings.read','settings.write','settings.sensitive','staff.accounts.read',
  'staff.accounts.write','staff.accounts.invite','staff.accounts.deactivate',
  'staff.roles.read','staff.roles.write','audit.read','audit.export',
  'menu.dish.read','menu.dish.write','menu.nutrition.read','menu.nutrition.write',
  'menu.weekly.read','menu.weekly.compose','menu.publish','menu.consolidation.read',
  'menu.unresolved.read','delivery.round.read','delivery.confirm','delivery.fail',
  'delivery.correct','subscriber.read','subscriber.history.read','subscriber.pause_for',
  'subscriber.act.skip','subscriber.act.address','subscriber.act.slot','event.ledger.read',
  'preparation.picking.read','preparation.labels.read','logistics.post_cutoff'
]);
export function authorize(principal, request) {
  if (principal?.kind !== 'staff' || principal.status !== 'active' ||
      principal.tokenVerified !== true || principal.liveSession !== true ||
      principal.factorVerified !== true || principal.bootstrapComplete !== true ||
      principal.riskCleared !== true || principal.lifetimeValid !== true ||
      !counter(principal.sessionEpoch) || !counter(principal.currentEpoch) ||
      principal.sessionEpoch !== principal.currentEpoch ||
      !knownPermissions.has(request.permission) ||
      !Array.isArray(principal.grants) || !principal.grants.includes(request.permission) ||
      request.resourceInScope !== true || request.hardSafetyPassed !== true) return false;
  if (request.permission === 'logistics.post_cutoff')
    return request.explicitScopedLogisticsGrant === true &&
      typeof request.reason === 'string' && request.reason.trim().length > 0;
  return true;
}
