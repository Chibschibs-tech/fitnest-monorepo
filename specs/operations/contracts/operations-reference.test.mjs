import test from 'node:test';
import assert from 'node:assert/strict';
import {listAssigned,transition,blockUnsafeChange,amendLogistics,acknowledge,consumeConfirmedEvent,reconcile} from './operations-reference.mjs';
const state=()=>({projectId:'fixture',nextEvent:0,events:[],outbox:[],idempotency:[],receipts:[],deliveries:[
  {id:'d1',roundId:'r1',status:'prepared',revision:0,productionVersion:1,acknowledgedProductionVersion:1,safetyBlocked:false,
    consumptionDate:'2026-11-02',productionDate:'2026-11-01',deliveryDate:'2026-11-01',phone:'PRIVATE',health:'PRIVATE'},
  {id:'d2',roundId:'r2',status:'prepared',revision:0,productionVersion:1,acknowledgedProductionVersion:1,safetyBlocked:false}]});
const ctx=()=>({kind:'staff',live:true,factorVerified:true,riskCleared:true,lifetimeValid:true,
  actorId:'driver1',assignmentPolicyAccepted:true,assignmentVersion:'assign-v1',assignedRoundIds:['r1'],
  windowStart:100,windowEnd:200,permissions:['delivery.round.read','delivery.confirm','delivery.fail','delivery.correct',
    'logistics.post_cutoff','preparation.acknowledge'],
  exceptionOwnerId:'operations-on-duty',correctionPolicyAccepted:true,explicitScopedLogisticsGrant:true,logisticsPolicyAccepted:true});
const cmd=()=>({version:1,operation:'confirm',deliveryId:'d1',idempotencyKey:'key1',expectedRevision:0});
function unchanged(s,fn,code=/DENIED|INVALID|CONFLICT/){const old=structuredClone(s);assert.throws(fn,code);assert.deepEqual(s,old);}
test('assigned list omits unrelated round and sensitive fields',()=>{
  const rows=listAssigned(state(),ctx(),150);assert.equal(rows.length,1);assert.equal(rows[0].deliveryId,'d1');
  assert.equal('phone'in rows[0],false);assert.equal('health'in rows[0],false);
  assert.notEqual(rows[0].consumptionDate,rows[0].deliveryDate);
});
for(const [name,delta] of Object.entries({
  anonymous:{kind:'anonymous'},customer:{kind:'customer'},inactive:{live:false},factor:{factorVerified:false},
  risk:{riskCleared:false},expiredSession:{lifetimeValid:false},unacceptedAssignment:{assignmentPolicyAccepted:false},
  unknownAssignment:{assignmentVersion:''},otherRound:{assignedRoundIds:['r2']},permission:{permissions:[]}
}))test('scope/auth rejects '+name,()=>{const s=state();unchanged(s,()=>transition(s,{...ctx(),...delta},cmd(),150));});
for(const now of [99,200,NaN,undefined])test('useful window denies '+String(now),()=>{
  const s=state();unchanged(s,()=>transition(s,ctx(),cmd(),now));
});
test('useful window includes start and excludes end',()=>{
  assert.equal(transition(state(),ctx(),cmd(),100).state.deliveries[0].status,'delivered');
  assert.throws(()=>listAssigned(state(),ctx(),200),/DENIED/);
});
test('empty list still requires valid principal and window',()=>{
  const s=state();s.deliveries=[];assert.throws(()=>listAssigned(s,{...ctx(),live:false},150),/DENIED/);
  assert.throws(()=>listAssigned(s,ctx(),200),/DENIED/);assert.deepEqual(listAssigned(s,ctx(),150),[]);
});
test('confirm appends authoritative event/outbox and retry has no duplicate',()=>{
  const s=state(),before=structuredClone(s);const first=transition(s,ctx(),cmd(),150);
  assert.deepEqual(s,before);assert.equal(first.state.events.length,1);assert.equal(first.state.outbox.length,1);
  const retry=transition(first.state,ctx(),cmd(),151);assert.equal(retry.replayed,true);
  assert.equal(retry.eventId,first.eventId);assert.deepEqual(retry.state,first.state);
  unchanged(first.state,()=>transition(first.state,ctx(),{...cmd(),idempotencyKey:'different',expectedRevision:1},151));
});
test('same key different payload conflicts',()=>{
  const first=transition(state(),ctx(),cmd(),150);
  unchanged(first.state,()=>transition(first.state,ctx(),{...cmd(),reason:'changed'},151),/CONFLICT/);
});
test('replay rechecks current scope',()=>{
  const first=transition(state(),ctx(),cmd(),150);
  unchanged(first.state,()=>transition(first.state,{...ctx(),assignedRoundIds:['r2']},cmd(),151));
});
test('same key cannot silently bind to another delivery',()=>{
  const s=state();s.deliveries[1].roundId='r1';
  const first=transition(s,ctx(),cmd(),150);
  unchanged(first.state,()=>transition(first.state,ctx(),{...cmd(),deliveryId:'d2'},151),/CONFLICT/);
});
test('stale concurrent revision does not create a second effect',()=>{
  const first=transition(state(),ctx(),cmd(),150);
  unchanged(first.state,()=>transition(first.state,ctx(),{...cmd(),operation:'fail',reason:'absent'},151));
});
test('failure records reason and does not create compensation',()=>{
  const out=transition(state(),ctx(),{...cmd(),operation:'fail',reason:'absent'},150).state;
  assert.equal(out.deliveries[0].status,'failed');assert.equal(out.events[0].eventType,'delivery.failed');
  assert.equal(out.events[0].payload.reason,'absent');assert.deepEqual(out.receipts,[]);
});
test('correction appends and retains original event',()=>{
  const first=transition(state(),ctx(),cmd(),150);
  const corrected=transition(first.state,ctx(),{...cmd(),operation:'correct',expectedRevision:1,reason:'record error',targetStatus:'failed'},151).state;
  assert.equal(corrected.events.length,2);assert.deepEqual(corrected.events[0],first.state.events[0]);
  assert.equal(corrected.events[1].eventType,'delivery.corrected');assert.equal(corrected.deliveries[0].status,'failed');
  assert.throws(()=>consumeConfirmedEvent(corrected,corrected.events[1].eventId,'reward','applied'),/DENIED/);
});
test('correction requires separate permission, accepted policy and reason',()=>{
  const s=transition(state(),ctx(),cmd(),150).state;
  const correction={...cmd(),operation:'correct',expectedRevision:1,reason:'error',targetStatus:'failed'};
  for(const c of [{...ctx(),permissions:['delivery.confirm']},{...ctx(),correctionPolicyAccepted:false}])
    unchanged(s,()=>transition(s,c,correction,151));
  unchanged(s,()=>transition(s,ctx(),{...correction,reason:''},151));
});
test('unsafe frozen change blocks handover without regeneration',()=>{
  const before=state(),blocked=blockUnsafeChange(before,'d1',0,'recipe-v2',150);
  assert.equal(before.deliveries[0].safetyBlocked,false);assert.equal(blocked.deliveries[0].safetyBlocked,true);
  assert.equal(blocked.deliveries[0].productionVersion,1);
  unchanged(blocked,()=>transition(blocked,{...ctx(),roleName:'Administrator'},{...cmd(),expectedRevision:1},151));
  unchanged(blocked,()=>amendLogistics(blocked,ctx(),{version:1,deliveryId:'d1',expectedRevision:1,reason:'urgent'},151));
});
test('missing safety or production version cannot authorize handover',()=>{
  for(const field of ['safetyBlocked','productionVersion','acknowledgedProductionVersion']){
    const s=state();delete s.deliveries[0][field];unchanged(s,()=>transition(s,ctx(),cmd(),150));
  }
});
test('amendment requires explicit scoped logistics grant and policy',()=>{
  const s=state(),command={version:1,deliveryId:'d1',expectedRevision:0,reason:'slot amendment'};
  for(const c of [{...ctx(),explicitScopedLogisticsGrant:false,roleName:'Administrator'},
    {...ctx(),logisticsPolicyAccepted:false},{...ctx(),permissions:['delivery.confirm']}])
    unchanged(s,()=>amendLogistics(s,c,command,150));
});
test('amended production version must be acknowledged before handover',()=>{
  const amended=amendLogistics(state(),ctx(),{version:1,deliveryId:'d1',expectedRevision:0,reason:'slot amendment'},150);
  assert.equal(amended.deliveries[0].productionVersion,2);
  unchanged(amended,()=>transition(amended,ctx(),{...cmd(),expectedRevision:1},151));
  unchanged(amended,()=>acknowledge(amended,ctx(),{version:1,deliveryId:'d1',expectedRevision:1,productionVersion:1},151));
  const ack=acknowledge(amended,ctx(),{version:1,deliveryId:'d1',expectedRevision:1,productionVersion:2},151);
  assert.equal(transition(ack,ctx(),{...cmd(),expectedRevision:2},152).state.deliveries[0].status,'delivered');
});
test('unique consumer receipt prevents duplicate reward and allows distinct notification',()=>{
  const first=transition(state(),ctx(),cmd(),150);let out=consumeConfirmedEvent(first.state,first.eventId,'reward','applied');
  assert.equal(out.applied,true);out=consumeConfirmedEvent(out.state,first.eventId,'reward','applied');
  assert.equal(out.applied,false);assert.equal(out.state.receipts.length,1);
  out=consumeConfirmedEvent(out.state,first.eventId,'notification','applied');assert.equal(out.state.receipts.length,2);
});
test('unknown external outcome requires reconciliation, not retry',()=>{
  const first=transition(state(),ctx(),cmd(),150);
  const unknown=consumeConfirmedEvent(first.state,first.eventId,'reward','unknown').state;
  unchanged(unknown,()=>consumeConfirmedEvent(unknown,first.eventId,'reward','applied'),/RECONCILE/);
});
test('reconciliation retains planned not prepared and unresolved prepared',()=>{
  const rows=Array.from({length:120},(_,i)=>({id:'d'+i,status:i<115?'delivered':i<118?'failed':'planned'}));
  assert.deepEqual(reconcile(rows),{version:1,planned:120,prepared:118,delivered:115,failed:3,notPrepared:2,unresolvedPrepared:0,unaccounted:2});
  rows[119].status='prepared';assert.equal(reconcile(rows).unresolvedPrepared,1);assert.equal(reconcile(rows).unaccounted,2);
});
test('reconciliation rejects duplicate IDs and unknown states',()=>{
  assert.throws(()=>reconcile([{id:'x',status:'planned'},{id:'x',status:'failed'}]),/INVALID/);
  assert.throws(()=>reconcile([{id:'x',status:'unknown'}]),/INVALID/);
});

for(const [status,error] of [[undefined,/INVALID/],['pending',/WAIT/],['unknown',/RECONCILE/],['other',/INVALID/]])
  test('idempotency state failclosed: '+String(status),()=>{
    const s=transition(state(),ctx(),cmd(),150).state;s.idempotency[0].status=status;
    unchanged(s,()=>transition(s,ctx(),cmd(),151),error);
  });
test('complete idempotency record requires stored event identity',()=>{
  const s=transition(state(),ctx(),cmd(),150).state;s.idempotency[0].eventId='missing';
  unchanged(s,()=>transition(s,ctx(),cmd(),151),/INVALID/);
});
test('same key changing expected revision conflicts',()=>{
  const s=transition(state(),ctx(),cmd(),150).state;
  unchanged(s,()=>transition(s,ctx(),{...cmd(),expectedRevision:1},151),/CONFLICT/);
});
test('authoritative event contains nonempty correlation identity',()=>{
  const e=transition(state(),ctx(),cmd(),150).state.events[0];
  assert.equal(typeof e.correlationId,'string');assert.ok(e.correlationId.length>0);
});
for(const status of [undefined,null,'pending','corrupt'])test('malformed consumer state cannot duplicate effect: '+String(status),()=>{
  const first=transition(state(),ctx(),cmd(),150);const s=first.state;
  s.receipts.push({eventId:first.eventId,consumer:'reward',status});
  unchanged(s,()=>consumeConfirmedEvent(s,first.eventId,'reward','applied'),/INVALID/);
});
test('failure cannot omit exception owner',()=>{
  const s=state();unchanged(s,()=>transition(s,{...ctx(),exceptionOwnerId:undefined},{...cmd(),operation:'fail',reason:'absent'},150));
});