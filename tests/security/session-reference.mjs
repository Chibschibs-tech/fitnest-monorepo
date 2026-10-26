// S001-SEC-C isolated decision model; authoritative synthetic SERVER facts only.
// No JWT verification, database atomicity or provider behavior is proved here.
const id = v => typeof v === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(v);
const time = v => Number.isSafeInteger(v) && v >= 0;
export function policyValid(p) {
  return !!p && ['accessTtlSeconds','idleTtlSeconds','absoluteTtlSeconds'].every(k =>
    Number.isSafeInteger(p[k]) && p[k] > 0) &&
    p.accessTtlSeconds <= p.absoluteTtlSeconds && p.idleTtlSeconds <= p.absoluteTtlSeconds;
}
export function authorize({ token, providerSession, session, policy, now, ownerId, path } = {}) {
  if (!policyValid(policy) || !time(now) || !id(ownerId)) return false;
  // Direct channels stay closed until SEC-B/T006 prove a complete live-session predicate.
  if (path !== 'api') return false;
  if (!token || token.verified !== true || !id(token.subject) || !id(token.sessionId) ||
      !time(token.issuedAt) || !time(token.expiresAt) || token.issuedAt > now ||
      token.expiresAt <= token.issuedAt || now >= token.expiresAt ||
      token.expiresAt - token.issuedAt > policy.accessTtlSeconds) return false;
  if (!providerSession || providerSession.lookup !== 'live' ||
      providerSession.id !== token.sessionId || providerSession.subject !== token.subject) return false;
  if (!session || session.id !== token.sessionId || session.subject !== token.subject ||
      session.accountId !== ownerId || session.revoked !== false ||
      session.riskClearance !== 'cleared' || !time(session.createdAt) ||
      !time(session.lastActivityAt) || session.createdAt > session.lastActivityAt ||
      session.lastActivityAt > now || session.createdAt > token.issuedAt) return false;
  return now - session.createdAt < policy.absoluteTtlSeconds &&
    now - session.lastActivityAt < policy.idleTtlSeconds;
}
export function listDevices(input, records) {
  if (!authorize(input) || !Array.isArray(records)) return [];
  return records.filter(s => s && id(s.id) && s.accountId === input.ownerId &&
    s.subject === input.token.subject && s.revoked === false &&
    time(s.createdAt) && time(s.lastActivityAt) &&
    s.createdAt <= s.lastActivityAt && s.lastActivityAt <= input.now)
    .map(s => ({ id: s.id, createdAt: s.createdAt, lastActivityAt: s.lastActivityAt,
      current: s.id === input.token.sessionId }));
}
// Pure preflight; production must recheck+consume proof+revoke+audit atomically.
export function revokePlan(input, records, request) {
  if (!authorize(input) || !Array.isArray(records) || !request ||
      !['one','all'].includes(request.scope) || !id(request.operationId)) return null;
  if (request.scope === 'one' && !id(request.targetId)) return null;
  const action = request.scope === 'one' ? 'revoke:one:' + request.targetId : 'revoke:all';
  const p = request.proof;
  if (!p || p.factor !== 'verified_email' || p.previouslyVerified !== true ||
      p.used !== false || p.accountId !== input.ownerId || p.action !== action ||
      p.operationId !== request.operationId || !time(p.verifiedAt) ||
      !time(p.challengeIssuedAt) || !time(p.challengeVerifiedAt) || !time(p.expiresAt) ||
      p.verifiedAt >= p.challengeIssuedAt || p.challengeVerifiedAt < p.challengeIssuedAt || p.challengeVerifiedAt > input.now ||
      input.now >= p.expiresAt) return null;
  // Fail the entire batch on malformed/duplicate records; never silently partially revoke.
  if (records.some(s => !s || !id(s.id) || !id(s.accountId) || !id(s.subject) ||
      typeof s.revoked !== 'boolean') || new Set(records.map(s=>s.id)).size !== records.length) return null;
  const owned = records.filter(s => s.accountId === input.ownerId && s.subject === input.token.subject);
  const targets = request.scope === 'all' ? owned : owned.filter(s=>s.id === request.targetId);
  if (targets.length === 0) return null;
  return { operationId: request.operationId, accountId: input.ownerId,
    targetIds: targets.map(s=>s.id).sort(), consumeProof: true,
    atomicAuditRequired: true, providerMutation: false };
}
// Do not infer exceptions from elapsed time alone: observe the real provider result.
// Reuse interval and active-parent exception must be qualified on pinned Auth.
export function refreshOutcome(observation) {
  if (!observation || observation.verified !== true) return 'deny';
  if (observation.kind === 'rotated' || observation.kind === 'reuse_interval' ||
      observation.kind === 'active_parent') return 'recheck_authorization';
  if (observation.kind === 'replay_rejected') return 'revoke_app_session';
  return 'deny';
}


