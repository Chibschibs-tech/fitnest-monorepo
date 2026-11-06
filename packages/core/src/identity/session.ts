/** Server authorization contract. No JWT verification, database or implicit clock here.
 * The caller supplies cryptographically verified claims and an uncached, transactional
 * snapshot from the server. This module never grants ownership from a phone number.
 */
export type SessionPolicy = {
  version: number;
  absoluteSeconds: number;
  idleSeconds: number;
  stepUpSeconds: number;
};
export type VerifiedPrincipal = {
  userId: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
};
export type ProviderSession = {
  id: string;
  userId: string;
  createdAt: number;
  notAfter: number | null;
};
export type SessionClearance = {
  sessionId: string;
  accountId: string;
  userId: string;
  generation: number;
  clearedAt: number;
  expiresAt: number;
  lastActivityAt: number;
  revokedAt: number | null;
  proof: "enrollment" | "verified_email";
  stepUpAt: number | null;
  stepUpMethod: "verified_email" | null;
};
export type AccountSecurity = {
  id: string;
  authUserId: string;
  generation: number;
  suspended: boolean;
};
export type SessionDecision =
  | { allowed: true; accountId: string; sessionId: string; policyVersion: number }
  | { allowed: false; code: "configuration_invalid" | "authentication_required" | "proof_required" | "step_up_required" | "forbidden" };

const uuid = (x: unknown): x is string => typeof x === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
const instant = (x: unknown): x is number => Number.isSafeInteger(x) && Number(x) >= 0;
const positive = (x: unknown): x is number => Number.isSafeInteger(x) && Number(x) > 0;
const deny = (code: Extract<SessionDecision, { allowed: false }>["code"]): SessionDecision => ({ allowed: false, code });

export function validSessionPolicy(p: SessionPolicy): boolean {
  return Boolean(p && positive(p.version) && positive(p.absoluteSeconds) && positive(p.idleSeconds) && positive(p.stepUpSeconds)
    && p.idleSeconds <= p.absoluteSeconds && p.stepUpSeconds <= p.absoluteSeconds
    && Number.isSafeInteger(p.absoluteSeconds * 1000));
}

export function authorizeCustomerSession(input: {
  principal: VerifiedPrincipal | null;
  provider: ProviderSession | null;
  clearance: SessionClearance | null;
  account: AccountSecurity | null;
  policy: SessionPolicy;
  now: number;
  requestedAccountId?: string;
  sensitive?: boolean;
}): SessionDecision {
  const { principal: p, provider: s, clearance: c, account: a, policy, now } = input;
  if (!instant(now) || !validSessionPolicy(policy)) return deny("configuration_invalid");
  if (!p || !uuid(p.userId) || !uuid(p.sessionId) || !instant(p.issuedAt) || !instant(p.expiresAt)
    || p.issuedAt > now || p.expiresAt <= now || p.expiresAt <= p.issuedAt) return deny("authentication_required");
  if (!s || s.id !== p.sessionId || s.userId !== p.userId || !instant(s.createdAt) || s.createdAt > now
    || (s.notAfter !== null && (!instant(s.notAfter) || s.notAfter <= now))
    || now - s.createdAt >= policy.absoluteSeconds * 1000) return deny("authentication_required");
  if (!a || !uuid(a.id) || a.authUserId !== p.userId || !instant(a.generation) || a.suspended !== false) return deny("forbidden");
  if (input.requestedAccountId !== undefined && input.requestedAccountId !== a.id) return deny("forbidden");
  // New phone OTPs are not proof of ownership of an existing account's history.
  if (!c || c.sessionId !== s.id || c.accountId !== a.id || c.userId !== a.authUserId
    || c.generation !== a.generation || c.revokedAt !== null
    || !["enrollment", "verified_email"].includes(c.proof)
    || !instant(c.clearedAt) || c.clearedAt < s.createdAt || c.clearedAt > now
    || !instant(c.expiresAt) || c.expiresAt <= now || c.expiresAt <= c.clearedAt
    || !instant(c.lastActivityAt) || c.lastActivityAt < c.clearedAt || c.lastActivityAt > now
    || now - c.lastActivityAt >= policy.idleSeconds * 1000) return deny("proof_required");
  if (input.sensitive && (c.stepUpMethod !== "verified_email" || !instant(c.stepUpAt)
    || c.stepUpAt < c.clearedAt || c.stepUpAt > now || now - c.stepUpAt >= policy.stepUpSeconds * 1000)) return deny("step_up_required");
  return { allowed: true, accountId: a.id, sessionId: s.id, policyVersion: policy.version };
}

/** The same step-up is required for one other device and all other devices. */
export function authorizeSessionRevocation(input: Parameters<typeof authorizeCustomerSession>[0] & {
  target: { sessionId: string; accountId: string; userId: string };
}): SessionDecision {
  const self = input.target.sessionId === input.principal?.sessionId;
  const result = authorizeCustomerSession({ ...input, sensitive: !self });
  if (!result.allowed) return result;
  if (!uuid(input.target.sessionId) || input.target.accountId !== result.accountId
    || input.target.userId !== input.principal!.userId) return deny("forbidden");
  return result;
}
