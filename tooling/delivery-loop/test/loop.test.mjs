import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createState, applyEvent } from '../src/loop.mjs';
import { initializeStore, transact } from '../src/store.mjs';

const task = { ...JSON.parse(await readFile(new URL('../examples/pilot.json', import.meta.url))), baseSha: 'a'.repeat(40) };
const policy = { ...JSON.parse(await readFile(new URL('../examples/policy.json', import.meta.url))), productionApprovers: ['fixture-founder'] };
const fresh = () => createState(task, policy);
const event = (state, type, source, data = {}, override = {}) => ({ id: `evt-${state.revision + 1}`, taskId: task.id, expectedRevision: state.revision, at: state.lastTimestamp + 1, type, source, data, ...override });
const start = state => applyEvent(state, event(state, 'start_attempt', 'scheduler', { leaseId: `lease-${state.revision}-abcdefghijklmno`, completedDependencies: [] }));
const result = state => ({ leaseId: state.lease.id, baseSha: task.baseSha, headSha: 'b'.repeat(40), actualCostMicros: 100000, billingEvidenceId: `meter-${state.attempts}`, implementationIdentity: 'fixture-coder', changedFiles: ['fixtures/recipe-cost.mjs'], unsafeFileModes: false, checks: policy.requiredChecks.map(name => ({ name, sha: 'b'.repeat(40), status: 'passed', runId: `run-${name}`, acceptanceIds: task.acceptanceIds })), review: { identity: 'fixture-reviewer', cleanContext: true, runId: 'review-1', sha: 'b'.repeat(40), verdict: 'accept', findings: [] } });
const complete = (state, overrides = {}) => applyEvent(state, event(state, 'attempt_result', 'trusted_runner', { ...result(state), ...overrides }));
const ready = () => complete(start(fresh()));
const staged = () => { const s = ready(); return applyEvent(s, event(s, 'staging_result', 'deployment_service', { sha: s.acceptedSha, environment: 'staging', deploymentId: 'staging-1', deployed: true, smokePassed: true, acceptancePassed: true })); };
const approved = () => { const s = staged(); return applyEvent(s, event(s, 'approve_production', 'approval_service', { sha: s.acceptedSha, actor: 'fixture-founder', stagingDeploymentId: 'staging-1', approvalId: 'approval-1', expiresAt: 1000 })); };

test('successful complete evidence reaches staging, never delivery directly', () => { assert.equal(ready().status, 'ready_staging'); });
test('a failing check is corrected in a new counted attempt', () => {
  let s = start(fresh()); s = complete(s, { checks: [] });
  assert.equal(s.status, 'retry_ready');
  s = complete(start(s));
  assert.equal(s.status, 'ready_staging'); assert.equal(s.attempts, 2); assert.equal(s.spentMicros, 200000);
});
test('attempt limit stops endless repair', () => {
  let s = fresh();
  for (let i = 0; i < 3; i++) s = complete(start(s), { checks: [] });
  assert.equal(s.status, 'blocked'); assert.match(s.reason, /attempt_limit/);
  assert.throws(() => start(s), /terminal/);
});
test('budget is reserved before running and cannot silently exceed allowance', () => {
  const s = createState(task, { ...policy, maxCostMicros: 300000 });
  const done = complete(start(s), { checks: [], actualCostMicros: 300000 });
  assert.equal(done.status, 'blocked'); assert.match(done.reason, /budget_limit/);
  const over = complete(start(fresh()), { actualCostMicros: 300001 });
  assert.equal(over.status, 'blocked'); assert.equal(over.spentMicros, 300001);
});
test('unknown cost holds reservation and blocks instead of billing zero', () => {
  const s = complete(start(fresh()), { actualCostMicros: undefined });
  assert.equal(s.status, 'blocked'); assert.equal(s.reservedMicros, 300000);
});
test('identical event replay is idempotent; changed payload is refused', () => {
  const s = fresh(), e = event(s, 'start_attempt', 'scheduler', { leaseId: 'lease-abcdefghijklmnop', completedDependencies: [] });
  const once = applyEvent(s, e); assert.deepEqual(applyEvent(once, e), once);
  assert.throws(() => applyEvent(once, { ...e, at: 2 }), /reused/);
});
test('stale revisions and concurrent starts are refused', () => {
  const s = start(fresh());
  assert.throws(() => applyEvent(s, event(s, 'start_attempt', 'scheduler', {}, { expectedRevision: 0 })), /Stale/);
  assert.throws(() => start(s), /already active/);
});
test('production cannot be called before authenticated approval of the exact release', () => {
  const s = staged();
  assert.throws(() => applyEvent(s, event(s, 'start_production', 'deployment_service', { sha: s.acceptedSha })), /approval/);
  assert.throws(() => applyEvent(s, event(s, 'approve_production', 'approval_service', { sha: 'c'.repeat(40), actor: 'fixture-founder' })), /authenticated/);
});
test('expired approval does not authorize a release', () => {
  const s = approved();
  const next = applyEvent(s, event(s, 'start_production', 'deployment_service', { sha: s.acceptedSha, approvalId: 'approval-1', deploymentId: 'prod-1' }, { at: 1001 }));
  assert.equal(next.status, 'blocked'); assert.equal(next.reason, 'approval_expired');
});
test('successful production smoke and business checks are required for delivery', () => {
  let s = approved();
  s = applyEvent(s, event(s, 'start_production', 'deployment_service', { sha: s.acceptedSha, approvalId: 'approval-1', deploymentId: 'prod-1' }));
  const payload = { sha: s.acceptedSha, deploymentId: 'prod-1', environment: 'production', deployed: true, smokePassed: true, businessChecksPassed: true };
  assert.equal(applyEvent(s, event(s, 'production_result', 'deployment_service', payload)).status, 'delivered');
  assert.equal(applyEvent(s, event(s, 'production_result', 'deployment_service', { ...payload, businessChecksPassed: false })).status, 'blocked');
});
test('protected or unexpected paths and unsafe modes stop the run', () => {
  for (const path of ['.github/workflows/ci.yml', '.env', '../outside', 'test/recipe-cost.test.mjs', 'src/other.mjs']) {
    const s = complete(start(fresh()), { changedFiles: [path] });
    assert.equal(s.reason, 'file_scope_violation');
  }
  assert.equal(complete(start(fresh()), { unsafeFileModes: true }).status, 'blocked');
});
test('old commit check results cannot validate new code', () => {
  const s = start(fresh()), checks = result(s).checks;
  checks[0].sha = 'c'.repeat(40);
  assert.equal(complete(s, { checks }).status, 'retry_ready');
});
test('missing acceptance coverage and duplicate check names fail', () => {
  const s = start(fresh()), checks = result(s).checks.map(x => ({ ...x, acceptanceIds: [] }));
  assert.equal(complete(s, { checks }).status, 'retry_ready');
  assert.equal(complete(s, { checks: [...result(s).checks, result(s).checks[0]] }).status, 'retry_ready');
});
test('implementation identity cannot approve its own change', () => {
  const s = start(fresh()); const review = { ...result(s).review, identity: 'fixture-coder' };
  assert.equal(complete(s, { review }).reason, 'independent_review_required');
});
test('review rejection and findings both request correction', () => {
  const s = start(fresh());
  assert.equal(complete(s, { review: { ...result(s).review, verdict: 'changes_requested' } }).status, 'retry_ready');
  assert.equal(complete(s, { review: { ...result(s).review, findings: ['incorrect rounding'] } }).status, 'retry_ready');
});
test('expired lease and late result require reconciliation, never automatic replay', () => {
  const s = start(fresh());
  const expired = applyEvent(s, event(s, 'expire_attempt', 'scheduler', {}, { at: s.lease.deadline + 1 }));
  assert.equal(expired.status, 'blocked'); assert.equal(expired.reservedMicros, 300000);
  const late = applyEvent(s, event(s, 'attempt_result', 'trusted_runner', result(s), { at: s.lease.deadline + 1 }));
  assert.equal(late.status, 'blocked'); assert.equal(late.spentMicros, 100000);
});
test('dependencies and unverified base block starting', () => {
  assert.throws(() => createState({ ...task, baseSha: null }, policy), /base commit/);
  const s = createState({ ...task, dependsOn: ['FOUNDATION-001'] }, policy);
  assert.throws(() => start(s), /Dependencies/);
});
test('task or policy cannot be rewritten mid-run', () => {
  const s = fresh(); s.policy.maxAttempts = 999;
  assert.throws(() => start(s), /changed/);
});
test('invalid and unexpected event sources are refused', () => {
  const s = fresh();
  assert.throws(() => applyEvent(s, event(s, 'start_attempt', 'coder', {})), /Scheduler/);
  assert.throws(() => applyEvent(s, event(s, 'start_attempt', 'scheduler', {}, { id: '__proto__' })), /event id/);
});
test('file journal survives reload and deduplicates a replay', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fitnest-loop-test-'));
  try {
    const path = join(dir, 'state.json'); const s = fresh();
    await initializeStore(path, s);
    const e = event(s, 'start_attempt', 'scheduler', { leaseId: 'lease-abcdefghijklmnop', completedDependencies: [] });
    await transact(path, e);
    const loaded = JSON.parse(await readFile(path, 'utf8'));
    assert.equal(loaded.attempts, 1);
    assert.equal((await transact(path, e)).attempts, 1);
    const completed = await transact(path, event(loaded, 'attempt_result', 'trusted_runner', result(loaded)));
    assert.equal(completed.status, 'ready_staging');
    const restored = JSON.parse(await readFile(path, 'utf8'));
    assert.deepEqual(restored.history.at(-1).data.checks, result(loaded).checks);
    assert.equal(restored.history.at(-1).data.review.sha, restored.acceptedSha);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('existing lock and existing state are not overwritten', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fitnest-loop-test-'));
  try {
    const path = join(dir, 'state.json'); await initializeStore(path, fresh());
    await assert.rejects(() => initializeStore(path, fresh()), /EEXIST/);
    await mkdir(`${path}.lock`);
    await assert.rejects(() => transact(path, event(fresh(), 'start_attempt', 'scheduler')), /EEXIST/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
