import { readFile, writeFile, mkdir, mkdtemp, copyFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createState } from './loop.mjs';
import { initializeStore, transact } from './store.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const workspace = await mkdtemp(join(tmpdir(), 'fitnest-loop-demo-'));
const logDirectory = join(root, 'runtime', `demo-${Date.now()}`);
await mkdir(logDirectory, { recursive: true });
const run = (command, args) => spawnSync(command, args, { cwd: workspace, encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024 });
const git = args => {
  const r = run('git', args);
  if (r.status !== 0) throw new Error(`Git demo failed: ${r.stderr}`);
  return r.stdout.trim();
};
const commit = message => { git(['add', '.']); git(['-c', 'user.name=Fitnest local demonstration', '-c', 'user.email=demo@localhost.invalid', 'commit', '-m', message]); return git(['rev-parse', 'HEAD']); };
let state;
const statePath = join(logDirectory, 'state.json');
const dispatch = async (type, source, data) => {
  state = await transact(statePath, { id: `evt-${state.revision + 1}`, taskId: state.task.id, expectedRevision: state.revision, at: Date.now(), type, source, data });
  console.log(`${state.revision}: ${state.status}${state.reason ? ` (${state.reason})` : ''}`);
};
try {
  await mkdir(join(workspace, 'fixtures')); await mkdir(join(workspace, 'test'));
  await copyFile(join(root, 'test/recipe-cost.test.mjs'), join(workspace, 'test/recipe-cost.test.mjs'));
  await writeFile(join(workspace, 'fixtures/recipe-cost.mjs'), 'export function calculateRecipeCost() { return {status: "incomplete"}; }\n');
  git(['init', '-b', 'pilot']);
  const baseSha = commit('Initial local fixture and protected acceptance suite');
  const task = { ...JSON.parse(await readFile(join(root, 'examples/pilot.json'))), baseSha };
  const policy = JSON.parse(await readFile(join(root, 'examples/policy.json')));
  state = createState(task, policy); await initializeStore(statePath, state);
  const correct = await readFile(join(root, 'fixtures/recipe-cost.mjs'), 'utf8');
  const bad = correct.replace("if (line.priceMinor === null || line.priceMinor === undefined) throw new Error('price_unknown');", "line.priceMinor ??= '0'; // intentional defect in local simulation");
  const attempts = [];
  for (const [index, implementation] of [bad, correct].entries()) {
    const leaseId = `demo-lease-${index}-abcdefghijklmnop`;
    await dispatch('start_attempt', 'scheduler', { leaseId, completedDependencies: [] });
    await writeFile(join(workspace, 'fixtures/recipe-cost.mjs'), implementation);
    const headSha = commit(`Scripted candidate ${index + 1}`);
    const syntax = run(process.execPath, ['--check', 'fixtures/recipe-cost.mjs']);
    const acceptance = run(process.execPath, ['--test', 'test/recipe-cost.test.mjs']);
    await writeFile(join(logDirectory, `attempt-${index + 1}.tap`), acceptance.stdout + acceptance.stderr);
    const passed = syntax.status === 0 && acceptance.status === 0;
    const changedFiles = git(['diff', '--name-only', baseSha, headSha]).split('\n').filter(Boolean);
    const modes = git(['ls-files', '-s']).split('\n');
    const unsafeFileModes = modes.some(line => /^(120000|160000)\s/.test(line));
    await dispatch('attempt_result', 'trusted_runner', {
      leaseId, baseSha, headSha, changedFiles, unsafeFileModes,
      actualCostMicros: 0, billingEvidenceId: 'local-simulation:no-provider-called',
      implementationIdentity: 'scripted-fixture-writer',
      checks: [
        { name: 'syntax', sha: headSha, status: syntax.status === 0 ? 'passed' : 'failed', runId: `local-syntax-${index}`, acceptanceIds: [] },
        { name: 'acceptance', sha: headSha, status: acceptance.status === 0 ? 'passed' : 'failed', runId: `local-acceptance-${index}`, acceptanceIds: passed ? task.acceptanceIds : [] }
      ],
      review: { identity: 'deterministic-demo-reviewer', cleanContext: true, runId: `fixture-review-${index}`, sha: headSha, verdict: passed ? 'accept' : 'changes_requested', findings: passed ? [] : ['acceptance_failed'] }
    });
    attempts.push({ attempt: index + 1, headSha, syntaxExit: syntax.status, acceptanceExit: acceptance.status, state: state.status });
  }
  const report = { mode: 'local-scripted-demonstration', actualLlmCalls: 0, actualProviderCostUsd: 0, githubWrites: 0, deployments: 0, realAcceptanceCommandsExecuted: true, reviewer: 'deterministic simulation, not an LLM evaluation', attempts, finalStatus: state.status, journal: resolve(statePath) };
  await writeFile(join(logDirectory, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (state.status !== 'ready_staging' || attempts[0].acceptanceExit === 0 || attempts[1].acceptanceExit !== 0) process.exitCode = 1;
} finally {
  await rm(workspace, { recursive: true, force: true });
}
