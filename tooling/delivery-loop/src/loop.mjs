import { createHash } from 'node:crypto';

// This module receives events from TRUSTED adapters. It does not authenticate
// GitHub, billing, approvals, or runner attestations. Never expose applyEvent as
// a public endpoint or let an implementation agent submit these events itself.
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const integer = value => Number.isSafeInteger(value) && value >= 0;
const strings = values => Array.isArray(values) && values.length > 0 && values.every(x => typeof x === 'string' && x.length > 0) && new Set(values).size === values.length;
const safePath = path => typeof path === 'string' && path.length > 0 && !path.startsWith('/') && !path.includes('\\') && !path.includes('\0') && path.split('/').every(p => p && p !== '.' && p !== '..');
const blockedPaths = path => path === '.env' || path.startsWith('.env.') || path.startsWith('.git/') || path.startsWith('.github/') || path.startsWith('supabase/') || path.startsWith('node_modules/') || path === 'AGENTS.md' || /(^|\/)(?:package(?:-lock)?\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(path);
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };

export function createState(task, policy) {
  requireValue(task && /^[A-Z0-9-]+$/.test(task.id), 'Invalid task id');
  requireValue(task.repository === 'Chibschibs-tech/fitnest-monorepo', 'Unexpected repository');
  requireValue(sha(task.baseSha), 'Current base commit must be resolved before starting');
  requireValue(strings(task.specRefs) && strings(task.acceptanceIds), 'Explicit specs and acceptance ids required');
  requireValue(strings(task.allowedFiles) && task.allowedFiles.every(p => safePath(p) && !blockedPaths(p)), 'Unsafe pilot file scope');
  requireValue(strings(task.protectedFiles) && task.protectedFiles.every(safePath), 'Protected test and control files required');
  requireValue(task.allowedFiles.every(p => !task.protectedFiles.includes(p)), 'Editable and protected scopes overlap');
  requireValue(task.dependsOn === undefined || (Array.isArray(task.dependsOn) && (task.dependsOn.length === 0 || strings(task.dependsOn))), 'Invalid dependencies');
  requireValue(policy && integer(policy.maxAttempts) && policy.maxAttempts > 0 && policy.maxAttempts <= 5, 'Invalid attempt cap');
  requireValue(integer(policy.maxCostMicros) && policy.maxCostMicros > 0, 'Invalid budget');
  requireValue(integer(policy.reservationMicros) && policy.reservationMicros > 0 && policy.reservationMicros <= policy.maxCostMicros, 'Invalid reservation');
  requireValue(integer(policy.attemptTimeoutMs) && policy.attemptTimeoutMs > 0 && policy.attemptTimeoutMs <= 3600000, 'Invalid timeout');
  requireValue(strings(policy.requiredChecks), 'Required checks cannot be empty');
  requireValue(strings(policy.productionApprovers), 'Production approver identities required');
  return {
    schemaVersion: 1, task: structuredClone(task), policy: structuredClone(policy),
    taskHash: hash(task), policyHash: hash(policy), revision: 0, status: 'queued',
    attempts: 0, spentMicros: 0, reservedMicros: 0, lease: null,
    acceptedSha: null, staging: null, approval: null, reason: null,
    history: [], processed: {}, lastTimestamp: 0
  };
}

function block(state, reason) { state.status = 'blocked'; state.reason = reason; }
function retry(state, reason) {
  if (state.attempts >= state.policy.maxAttempts) return block(state, `attempt_limit:${reason}`);
  if (state.spentMicros + state.policy.reservationMicros > state.policy.maxCostMicros) return block(state, `budget_limit:${reason}`);
  state.status = 'retry_ready'; state.reason = reason;
}
function evidenceValid(state, result) {
  if (!Array.isArray(result.checks) || result.checks.some(x => !x || typeof x.name !== 'string')) return false;
  if (new Set(result.checks.map(x => x.name)).size !== result.checks.length) return false;
  const passing = state.policy.requiredChecks.map(name => result.checks.find(x => x.name === name));
  if (passing.some(x => !x || x.status !== 'passed' || x.sha !== result.headSha || !x.runId)) return false;
  const covered = new Set(passing.flatMap(x => x.acceptanceIds ?? []));
  return state.task.acceptanceIds.every(id => covered.has(id));
}

export function applyEvent(previous, event) {
  requireValue(previous.taskHash === hash(previous.task) && previous.policyHash === hash(previous.policy), 'Task or policy changed during run');
  requireValue(event && typeof event.id === 'string' && /^evt-[A-Za-z0-9_-]{1,90}$/.test(event.id), 'Invalid event id');
  const eventHash = hash(event);
  if (Object.hasOwn(previous.processed, event.id)) {
    requireValue(previous.processed[event.id] === eventHash, 'Event id reused with different payload');
    return structuredClone(previous);
  }
  requireValue(event.taskId === previous.task.id, 'Event belongs to another task');
  requireValue(event.expectedRevision === previous.revision, 'Stale state revision');
  requireValue(integer(event.at) && event.at >= previous.lastTimestamp, 'Non-monotonic controller timestamp');
  requireValue(!['blocked', 'delivered'].includes(previous.status), 'Run is terminal; create an explicitly reconciled successor');
  const state = structuredClone(previous);
  const data = event.data ?? {};
  switch (event.type) {
    case 'start_attempt': {
      requireValue(['queued', 'retry_ready'].includes(state.status), 'An attempt is already active or task is no longer editable');
      requireValue(event.source === 'scheduler', 'Scheduler required');
      const dependencies = state.task.dependsOn ?? [];
      requireValue(Array.isArray(data.completedDependencies) && dependencies.every(id => data.completedDependencies.includes(id)), 'Dependencies are not delivered');
      if (state.attempts >= state.policy.maxAttempts) { block(state, 'attempt_limit'); break; }
      if (state.spentMicros + state.policy.reservationMicros > state.policy.maxCostMicros) { block(state, 'budget_limit'); break; }
      requireValue(typeof data.leaseId === 'string' && data.leaseId.length >= 16, 'Lease id required');
      state.attempts++; state.reservedMicros = state.policy.reservationMicros;
      state.lease = { id: data.leaseId, deadline: event.at + state.policy.attemptTimeoutMs };
      state.status = 'running'; state.reason = null;
      break;
    }
    case 'attempt_result': {
      requireValue(state.status === 'running' && event.source === 'trusted_runner', 'Trusted active runner required');
      requireValue(data.leaseId === state.lease.id, 'Lease mismatch');
      if (!integer(data.actualCostMicros) || !data.billingEvidenceId) { block(state, 'unknown_cost_requires_reconciliation'); break; }
      if (!Number.isSafeInteger(state.spentMicros + data.actualCostMicros)) { block(state, 'invalid_cost_overflow'); break; }
      state.spentMicros += data.actualCostMicros;
      const reservation = state.reservedMicros;
      state.reservedMicros = 0;
      if (event.at > state.lease.deadline) { block(state, 'late_result_requires_reconciliation'); break; }
      state.lease = null;
      if (data.actualCostMicros > reservation || state.spentMicros > state.policy.maxCostMicros) { block(state, 'actual_cost_exceeded_reserved_budget'); break; }
      if (data.baseSha !== state.task.baseSha || !sha(data.headSha) || data.headSha === data.baseSha) { block(state, 'invalid_commit_evidence'); break; }
      // changedFiles MUST be computed from git by the trusted runner, including
      // both sides of renames, symlink/submodule modes and untracked files.
      if (!strings(data.changedFiles) || data.changedFiles.some(path => !safePath(path) || blockedPaths(path) || state.task.protectedFiles.includes(path) || !state.task.allowedFiles.includes(path)) || data.unsafeFileModes !== false) { block(state, 'file_scope_violation'); break; }
      if (!evidenceValid(state, data)) { retry(state, 'checks_failed_or_incomplete'); break; }
      const review = data.review;
      if (!review || review.sha !== data.headSha || !review.runId || !review.identity || !data.implementationIdentity || review.identity === data.implementationIdentity || review.cleanContext !== true) { block(state, 'independent_review_required'); break; }
      if (!Array.isArray(review.findings)) { block(state, 'invalid_review_schema'); break; }
      if (review.verdict !== 'accept' || review.findings.length > 0) { retry(state, 'review_changes_requested'); break; }
      state.acceptedSha = data.headSha;
      state.status = 'ready_staging'; state.reason = null;
      break;
    }
    case 'expire_attempt': {
      requireValue(event.source === 'scheduler' && state.status === 'running', 'Active run required');
      requireValue(event.at > state.lease.deadline, 'Lease is still active');
      // A crash may have consumed provider credits. Never refund or replay blindly.
      block(state, 'expired_lease_cost_and_side_effects_must_be_reconciled');
      break;
    }
    case 'staging_result': {
      requireValue(event.source === 'deployment_service' && state.status === 'ready_staging', 'Staging is not ready');
      requireValue(data.sha === state.acceptedSha && data.environment === 'staging' && data.deploymentId, 'Staging evidence does not match accepted commit');
      if (data.deployed !== true || data.smokePassed !== true || data.acceptancePassed !== true) { block(state, 'staging_failed'); break; }
      state.staging = { deploymentId: data.deploymentId, sha: data.sha };
      state.status = 'ready_production'; break;
    }
    case 'approve_production': {
      requireValue(state.status === 'ready_production' && event.source === 'approval_service', 'Production gate is not ready');
      requireValue(state.policy.productionApprovers.includes(data.actor) && data.sha === state.acceptedSha && data.stagingDeploymentId === state.staging.deploymentId && data.approvalId, 'Approval must be authenticated and bound to this release');
      requireValue(integer(data.expiresAt) && data.expiresAt > event.at && data.expiresAt <= event.at + 86400000, 'Approval must expire within 24 hours');
      state.approval = { ...data }; state.status = 'production_authorized'; break;
    }
    case 'start_production': {
      requireValue(state.status === 'production_authorized' && event.source === 'deployment_service', 'Production approval required');
      requireValue(data.sha === state.acceptedSha && data.approvalId === state.approval.approvalId && data.deploymentId, 'Wrong release or approval');
      if (event.at >= state.approval.expiresAt) { block(state, 'approval_expired'); break; }
      state.productionDeploymentId = data.deploymentId; state.status = 'production_running'; break;
    }
    case 'production_result': {
      requireValue(state.status === 'production_running' && event.source === 'deployment_service', 'Production deployment is not active');
      requireValue(data.sha === state.acceptedSha && data.deploymentId === state.productionDeploymentId && data.environment === 'production', 'Wrong production evidence');
      if (data.deployed !== true || data.smokePassed !== true || data.businessChecksPassed !== true) { block(state, 'production_incident_requires_runbook'); break; }
      state.status = 'delivered'; break;
    }
    default: throw new Error('Unknown event');
  }
  state.revision++; state.lastTimestamp = event.at;
  state.processed[event.id] = eventHash;
  // Trusted adapters must submit only sanitized structured evidence, never keys
  // or raw model output. Retain it so a restart does not lose the audit trail.
  state.history.push({ revision: state.revision, id: event.id, type: event.type, source: event.source, at: event.at, eventHash, data: structuredClone(data), status: state.status, reason: state.reason });
  return state;
}
