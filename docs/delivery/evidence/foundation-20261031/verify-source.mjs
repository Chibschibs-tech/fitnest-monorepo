import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const snapshot = JSON.parse(readFileSync(new URL('./source-snapshot.json', import.meta.url)));
const checks = [];
const check = (id, task, predicate, detail) => checks.push({id,task,status:predicate?'pass':'fail',evidenceKind:'static_source_inspection',detail});
const source = p => snapshot.files[p].content;
const json = p => JSON.parse(source(p));
for (const [path,file] of Object.entries(snapshot.files)) {
  const bytes=Buffer.from(file.content);
  const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  assert.equal(blob,file.sha,'Transport must preserve exact Git blob: '+path);
}
const root=json('package.json'),core=json('packages/core/package.json'),web=json('apps/web/package.json');
check('pinned-test-runner','S001-T001',root.devDependencies.vitest==='5.0.5','Root Vitest is exactly 5.0.5, not a semver range.');
check('root-test-command','S001-T001',root.scripts.test==='vitest run','Root pnpm test resolves to vitest run; this does not execute Vitest.');
check('core-test-command','S001-T001',core.scripts.test==='vitest run --config ../../vitest.config.ts packages/core','Core command uses Vitest and explicit workspace config.');
check('empty-suite-fails','S001-T001',/passWithNoTests:\s*false/.test(source('vitest.config.ts')),'An empty suite is not configured as success.');
check('pinned-sdk','S001-T002',web.dependencies['@supabase/supabase-js']==='2.110.7' && web.dependencies['@supabase/ssr']==='0.5.2','SDK dependency versions are pinned in web manifest; lockfile/install not executed here.');
const env=source('.env.example');
check('public-placeholders','S001-T002',/^NEXT_PUBLIC_SUPABASE_URL=http:\/\/127\.0\.0\.1:54321$/m.test(env)&&/^NEXT_PUBLIC_SUPABASE_ANON_KEY=replace_with_local_anon_key$/m.test(env),'URL/anon placeholders use local development values.');
check('server-key-placeholder','S001-T002',/^SUPABASE_SERVICE_ROLE_KEY=replace_with_local_service_role_key$/m.test(env)&&!/^NEXT_PUBLIC_.*SERVICE_ROLE/m.test(env),'Service role placeholder is server-only; no client bundle inspection claimed.');
const config=source('supabase/config.toml');
check('two-local-otp-fixtures','S001-T003',/\[auth.sms.test_otp\]\s*212600000001 = "123456"\s*212600000002 = "234567"/.test(config),'Two configured fixed phone fixtures; no SMS/provider invocation performed.');
check('local-only-warning','S001-T003',config.includes('LOCAL FIXTURES ONLY')&&config.includes('Never deploy remotely'),'Fixture configuration explicitly forbids remote deployment.');
const authTest=source('tooling/auth/local-auth.test.mjs');
check('auth-test-local-boundary','S001-T003',authTest.includes('assert.equal(config.API_URL, "http://127.0.0.1:54321"')&&authTest.includes('redirect: "error"'),'Auth test restricts URL to local stack and refuses redirects.');
check('auth-test-negative-and-isolation','S001-T003',authTest.includes('Wrong OTP must be refused')&&authTest.includes('assert.notEqual(first.data.user.id, second.data.user.id)'),'Test source covers wrong OTP and distinct fixture identities; execution remains unknown.');
const wf=source('.github/workflows/identity-foundation.yml');
check('isolated-boot-workflow','S001-T003',wf.includes('supabase@2.121.0 start')&&wf.includes('cp supabase/config.toml')&&wf.includes('node --test tooling/auth/local-auth.test.mjs'),'Workflow boots a disposable Auth stack with pinned CLI; it does not copy product migrations.');
const proposed=snapshot.proposedWorkflow;
const bytes=Buffer.from(proposed.content);
assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),proposed.sha);
check('existing-pr149-covers-public-commands','S001-T001',proposed.content.includes('working-directory: packages/core')&&(proposed.content.match(/run: pnpm test\n/g)||[]).length===2,'PR149 workflow proposal includes root/core public commands; its blob is exact, head commit/CI not provided by connector.');
const report={
 schemaVersion:1, observedOn:'2026-10-31',repository:snapshot.repository,sourceCommit:snapshot.commit,
 scope:'T001/T002/T003 existing-implementation evidence, static only',
 executionOrigin:'Work Fitnest local source verifier', acceptanceGranted:false,runtimeAcceptance:false,
 exactSourceBlobs:Object.fromEntries(Object.entries(snapshot.files).map(([p,f])=>[p,f.sha])),
 taskSource:{path:snapshot.taskSource.path,blob:snapshot.taskSource.sha},
 checks,summary:{passed:checks.filter(c=>c.status==='pass').length,failed:checks.filter(c=>c.status==='fail').length},
 runtimeChecks:[
 {id:'root-pnpm-test',status:'unknown',reason:'Not executed locally; dedicated GitHub connector exposes no CI logs/checks.'},
 {id:'core-pnpm-test',status:'unknown',reason:'Not executed locally; must bind to exact tested commit.'},
 {id:'core-typecheck',status:'unknown',reason:'Not executed during this review.'},
 {id:'frozen-lockfile-install',status:'unknown',reason:'Manifest pins alone do not prove installability.'},
 {id:'supabase-boot-and-otp',status:'unknown',reason:'Docker/Auth not started during this review; CI evidence unavailable.'},
 {id:'full-product-migrations',status:'unknown',reason:'Existing Auth-only fixture does not copy/run product migrations.'},
 {id:'acceptance-receipts',status:'unknown',reason:'No live receipt ledger read; this report must not grant acceptance.'}
 ],
 existingProposal:{pullRequest:149,url:'https://github.com/Chibschibs-tech/fitnest-monorepo/pull/149',ref:proposed.ref,workflowBlob:proposed.sha,headCommit:null,ciStatus:'unknown',action:'Verify existing proposal and bind results; do not manufacture a new patch.'},
 platformHandoff:[
 {id:'T002-SCOPE',owner:'Work Ekwip',status:'open',detail:'Task requires .env.example but allowed_paths omits it. Reconcile contract/profile scope without weakening checks.'},
 {id:'RECOGNIZE-EXISTING',owner:'Work Ekwip',status:'pending',detail:'Recognize verified existing implementation only after exact commit CI/runtime evidence and normal protected checks.'}
 ],
 productChanges:[],preserved:['SEC-A','SEC-B','SEC-C','B01-C'],
 reproduction:'node verify-source.mjs (requires source-snapshot.json alongside it)'
};
writeFileSync(new URL('./foundation-evidence-20261031.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary));
if(report.summary.failed)process.exitCode=1;
