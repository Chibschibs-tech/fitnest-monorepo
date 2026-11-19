import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inspectInventory} from './sec-b-inventory.mjs';
const source=JSON.parse(await readFile(new URL('../../docs/delivery/evidence/schema-inventory-2026-10-26.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(source);
test('captured public tables remain closed; sequence grants remain visible',()=>{
 const r=inspectInventory(source);
 assert.equal(r.accepted,false);
 assert.equal(source.relations.filter(x=>x.schema==='public').length,24);
 assert.equal(r.counts.columns,261); assert.equal(r.counts.sequences,23);
 assert.equal(r.findings.filter(x=>x.kind==='client_sequence_privilege').length,92);
 assert.equal(r.findings.filter(x=>x.kind==='client_table_privilege'&&x.object.startsWith('public.')).length,0);
});
test('missing privileges cannot be interpreted as denial',()=>{
 const v=clone();delete v.relations[0].anon_select;
 assert.throws(()=>inspectInventory(v),/Unknown boolean/);
});
test('missing sections and empty public inventory fail closed',()=>{
 const v=clone();delete v.functions;assert.throws(()=>inspectInventory(v),/Missing section/);
 const d=clone();d.relations=[];assert.throws(()=>inspectInventory(d),/empty/);
});
test('duplicate relation or sequence cannot conceal incomplete inventory',()=>{
 for(const key of ['relations','sequences']){const v=clone();v[key].push(v[key][0]);assert.throws(()=>inspectInventory(v),/Duplicate/);}
});
test('wrong project cannot be evaluated as Fitnest evidence',()=>{
 const v=clone();v.project_ref='unrelated';assert.throws(()=>inspectInventory(v),/identity/);
});
test('table access and RLS regression are distinct findings',()=>{
 const v=clone();v.relations[0].anon_select=true;v.relations[0].rls=false;
 const f=inspectInventory(v).findings;
 assert.ok(f.some(x=>x.kind==='client_table_privilege'&&x.object==='public.cart_items'));
 assert.ok(f.some(x=>x.kind==='rls_disabled'&&x.object==='public.cart_items'));
});
test('callable SECURITY DEFINER RPC is flagged with tables closed',()=>{
 const v=clone();v.functions=[{schema:'public',name:'fixture_only',identity_arguments:'',security_definer:true,anon_execute:true,auth_execute:false}];
 assert.ok(inspectInventory(v).findings.some(x=>x.kind==='client_definer_function'));
});
test('client role bypass is flagged independent of relation RLS',()=>{
 const v=clone();v.roles.find(x=>x.name==='authenticated').bypass_rls=true;
 assert.ok(inspectInventory(v).findings.some(x=>x.kind==='client_role_bypass'));
});
test('column privileges and invoker functions remain reviewable',()=>{
 const v=clone();v.column_grants=[{table_name:'users',column_name:'id',grantee:'anon'}];
 v.functions=[{schema:'public',name:'fixture_only',identity_arguments:'',security_definer:false,anon_execute:true,auth_execute:false}];
 const f=inspectInventory(v).findings;
 assert.ok(f.some(x=>x.kind==='column_grants'));assert.ok(f.some(x=>x.kind==='client_function'));
});
test('views, public buckets and publications require separate review',()=>{
 const v=clone();v.relations[0].kind='v';v.storage_buckets=[{name:'fixture_public',public:true}];
 v.publications=[{publication:'fixture',schema:'public',table:'users'}];
 const f=inspectInventory(v).findings;
 for(const kind of ['view_boundary','public_bucket','realtime_publication'])assert.ok(f.some(x=>x.kind===kind));
});
test('missing SQL API settings never mean no exposed schemas',()=>{
 const v=clone();v.api_role_settings=[];
 const r=inspectInventory(v);assert.equal(r.accepted,false);
 assert.ok(r.unknowns.some(x=>x.includes('Data API')&&x.includes('unknown')));
});
test('metadata and reported role probes never certify integration',()=>{
 const v=clone();v.role_probes=[{role:'anon',result_sqlstate:'42501'}];
 const r=inspectInventory(v);assert.equal(r.accepted,false);
 assert.ok(r.unknowns.some(x=>x.includes('HTTP')));assert.ok(r.unknowns.some(x=>x.includes('migration replay')));
});

