import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
const json=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const snapshot=await json('docs/delivery/evidence/schema-inventory-2026-10-26.json');
const contract=await json('docs/delivery/contracts/S001-SEC-B.json');

test('captured columns and constraints belong to inventoried public relations',()=>{
 const names=new Set(snapshot.relations.filter(r=>r.schema==='public').map(r=>r.name));
 const seen=new Set();
 for(const col of snapshot.columns){
  assert.ok(names.has(col.table),'column outside relation inventory: '+col.table);
  const key=col.table+'.'+col.column;
  assert.ok(!seen.has(key),'duplicate column '+key);seen.add(key);
  assert.ok(Number.isInteger(col.ordinal)&&col.ordinal>0);
  assert.ok(['YES','NO'].includes(col.nullable));
 }
 for(const constraint of snapshot.constraints)
  assert.ok(names.has(constraint.table.replace(/^public\./,'')),'constraint outside relation inventory');
 for(const name of names)assert.ok(snapshot.columns.some(c=>c.table===name),'no column metadata for '+name);
});

test('SQL-role probes retain their narrow read-only meaning',()=>{
 assert.equal(snapshot.observer_role,'postgres');
 assert.equal(snapshot.role_probes.length,2);
 for(const role of ['anon','authenticated']){
  const probe=snapshot.role_probes.find(p=>p.role===role);
  assert.equal(probe.transaction,'READ ONLY');
  assert.equal(probe.query,'SELECT 1 FROM public.users LIMIT 0');
  assert.equal(probe.result_sqlstate,'42501');
 }
 assert.equal(contract.acceptance_claimed,false);
 assert.equal(contract.commands[0].satisfies_full_task,false);
});

test('source design acceptance and constitution gate are preserved literally',()=>{
 assert.equal(contract.source_plan_commit,'2854038dfe653289c326dd33650a311918f630ad');
 assert.equal(contract.preserved_sec_a_commit,'b8911d6c2d3a1343a22ba2aca462608ab0c9ec12');
 assert.equal(contract.source_task.kind,'contract');
 assert.deepEqual(contract.source_task.outputs,['ADR and isolated acceptance fixtures']);
 assert.deepEqual(contract.source_task.acceptance,['Actual schema/exposure and privilege inventory; record unresolved choices and no production writes.']);
 assert.ok(contract.merge_gates.includes('G-CONSTITUTION'));
});

test('missing exposure and role facts cannot become business choices or runtime success',()=>{
 for(const id of ['B-API-CONFIG','B-RUNTIME-ROLE','B-INTERFACES']){
  const gap=contract.contract_factual_gaps.find(g=>g.id===id);
  assert.ok(gap);assert.ok(['unknown','partial','observed_configuration_only'].includes(gap.state));
  assert.equal(gap.not_a_business_choice,true);assert.ok(gap.evidence_needed.length>20);
 }
 for(const proof of contract.downstream_runtime_verification)assert.equal(proof.completed,false);
 assert.ok(contract.downstream_runtime_verification.some(p=>p.owner.includes('T006')));
 assert.ok(contract.downstream_runtime_verification.some(p=>p.owner.includes('T010')));
 assert.ok(contract.downstream_runtime_verification.some(p=>p.owner==='G-T013'));
});

test('published collector remains metadata SELECTs and design outputs stay scoped',async()=>{
 const sql=(await readFile(new URL('tests/security/sec-b-inventory.sql',root),'utf8')).replace(/--[^\n]*/g,'');
 assert.ok(!/\b(insert|update|delete|truncate|grant|revoke|create|alter|drop|copy|call|do)\b\s+(?:into|on|table|schema|role|function|policy|all|public\.)/i.test(sql));
 assert.ok(sql.includes('pg_class'));assert.ok(sql.includes('has_table_privilege'));
 assert.ok(!/from\s+(?:public\.)?(users|sessions|orders|customers)\b/i.test(sql));
 for(const path of contract.allowed_paths)assert.ok(/^(docs|tests|specs)\//.test(path));
 assert.ok(contract.forbidden.includes('production writes'));
});


test('observed configuration remains distinct from transport and live-role proof',async()=>{
 const api=await json('docs/delivery/evidence/data-api-settings-20261026.json');
 assert.deepEqual(api.exposedSchemas,['public','graphql_public']);
 assert.equal(api.dataApiInstalled,true);
 assert.equal(api.automaticallyExposeNewTables,true);
 assert.equal(api.runtimeAcceptance,false);
 assert.ok(api.timestampPrecision.includes('approximate'));
 const role=await json('docs/delivery/evidence/runtime-role-config.json');
 assert.equal(role.inferredConfiguredDatabaseRole,'postgres');
 assert.equal(role.liveConnectionRoleObserved,false);
 assert.equal(role.migrationConnectionRoleObserved,false);
 assert.equal(role.credentialsRetained,false);
 assert.ok(!JSON.stringify(role).includes('postgresql://'));
});

test('source API inventory and baseline comparison bind exact source identities',async()=>{
 const map=await json('docs/delivery/evidence/source-channel-inventory-20261026.json');
 assert.equal(map.sourceCommit,'b8911d6c2d3a1343a22ba2aca462608ab0c9ec12');
 assert.equal(map.apiRouteCount,108);assert.equal(map.routes.length,108);
 assert.equal(new Set(map.routes.map(r=>r.path)).size,108);
 for(const r of map.routes){
  assert.match(r.blobSha,/^[a-f0-9]{40}$/);
  assert.match(r.path,/^apps\/web\/app\/api\/.+\/route\.ts$/);
  assert.ok(r.methods.length>0);
 }
 assert.equal(map.channels.find(c=>c.channel==='server actions').state,'unknown');
 assert.equal(map.channels.find(c=>c.channel==='exports').paths.length,5);
 assert.equal(map.runtimeAcceptance,false);
 const baseline=await json('docs/delivery/evidence/baseline-migration-review-20261026.json');
 assert.deepEqual(baseline.sourceBaseline.publicTables,
   snapshot.relations.filter(r=>r.schema==='public').map(r=>r.name).sort());
 assert.equal(baseline.productionReplayPerformed,false);
 assert.equal(snapshot.columns.find(c=>c.table==='meal_type_prices'&&c.column==='plan_name').nullable,baseline.observedPlanNameNullable);
 assert.ok(!baseline.observedMigrations.some(m=>m.version==='20260829160000'));
});

