import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beginRecovery, completeRecovery, createBootstrap, enrollBootstrap, authorize } from './staff-reference.mjs';

const now = 1000;
const account = () => ({ accountId:'staff-a', status:'active', factorId:'old-factor',
  sessionEpoch:2, revision:0, challenge:null, effects:[],
  proofs:[{id:'proof-a', accountId:'staff-a', purpose:'staff.mfa.recovery',
    enrolledAt:100, expiresAt:2000, used:false},
    {id:'proof-b', accountId:'staff-a', purpose:'staff.mfa.recovery',
    enrolledAt:100, expiresAt:2000, used:false}] });
const start = () => ({expectedRevision:0, accountId:'staff-a', proofId:'proof-a',
  passwordVerified:true, proofVerified:true, operationId:'op-a', challengeId:'challenge-a', expiresAt:1500});
const finish = () => ({expectedRevision:1, accountId:'staff-a', operationId:'op-a',
  challengeId:'challenge-a', newFactorId:'new-factor', newFactorVerified:true});
const unchangedDenial = (state, action) => { const before=structuredClone(state);
  assert.throws(action,/DENIED/); assert.deepEqual(state,before); };

for (const [name, delta] of Object.entries({
  'missing password':{passwordVerified:false}, 'unverified proof':{proofVerified:false},
  'missing proof':{proofId:'missing'}, 'cross-account':{accountId:'staff-b'},
  'stale revision':{expectedRevision:9}, 'expired challenge':{expiresAt:now}
})) test('recovery start denies '+name, () => {
  const s=account(); unchangedDenial(s,()=>beginRecovery(s,{...start(),...delta},now));
});
for (const [name, mutate] of [
  ['expired proof',s=>s.proofs[0].expiresAt=now],
  ['wrong purpose',s=>s.proofs[0].purpose='password-reset'],
  ['foreign proof',s=>s.proofs[0].accountId='staff-b'],
  ['not pre-enrolled',s=>s.proofs[0].enrolledAt=now],
  ['consumed proof',s=>s.proofs[0].used=true],
  ['deactivated account',s=>s.status='deactivated']
]) test('recovery start rejects '+name,()=>{const s=account();mutate(s);
  unchangedDenial(s,()=>beginRecovery(s,start(),now));});

test('recovery revokes sessions immediately and issues no staff session',()=>{
  const s=account(); const result=beginRecovery(s,start(),now);
  assert.equal(s.status,'recovery_pending');assert.equal(s.sessionEpoch,3);
  assert.equal(s.proofs[0].used,true);assert.equal(result.staffSessionIssued,false);
});
test('same proof and stale concurrent start cannot produce a second effect',()=>{
  const s=account();beginRecovery(s,start(),now);
  unchangedDenial(s,()=>beginRecovery(s,start(),now));
  unchangedDenial(s,()=>beginRecovery(s,{...start(),expectedRevision:1},now));
  assert.equal(s.effects.length,1);
});
for(const [name,delta] of Object.entries({
  'unverified new factor':{newFactorVerified:false}, 'old factor':{newFactorId:'old-factor'},
  'wrong account':{accountId:'staff-b'}, 'wrong operation':{operationId:'other'},
  'wrong challenge':{challengeId:'other'}, 'stale revision':{expectedRevision:0}
})) test('recovery completion denies '+name,()=>{
  const s=account();beginRecovery(s,start(),now);
  unchangedDenial(s,()=>completeRecovery(s,{...finish(),...delta},now));
});
test('expired enrollment remains restricted; a different proof supersedes it',()=>{
  const s=account();beginRecovery(s,start(),now);
  unchangedDenial(s,()=>completeRecovery(s,finish(),1500));
  assert.equal(s.status,'recovery_pending');
  beginRecovery(s,{...start(),expectedRevision:1,proofId:'proof-b',
    challengeId:'challenge-b',operationId:'op-b',expiresAt:1900},1600);
  unchangedDenial(s,()=>completeRecovery(s,{...finish(),expectedRevision:2},1600));
  completeRecovery(s,{...finish(),expectedRevision:2,challengeId:'challenge-b',operationId:'op-b'},1600);
  assert.equal(s.factorId,'new-factor');
});
test('deactivation wins over an existing recovery challenge',()=>{
  const s=account();beginRecovery(s,start(),now);s.status='deactivated';
  unchangedDenial(s,()=>completeRecovery(s,finish(),now));
});
test('completion invalidates old proofs/factor and requires fresh sign-in',()=>{
  const s=account();beginRecovery(s,start(),now);const r=completeRecovery(s,finish(),now);
  assert.equal(s.status,'active');assert.equal(s.factorId,'new-factor');assert.equal(s.sessionEpoch,4);
  assert.ok(s.proofs.every(p=>p.used));assert.equal(s.challenge,null);
  assert.equal(r.staffSessionIssued,false);assert.equal(r.freshSignInRequired,true);
  unchangedDenial(s,()=>completeRecovery(s,{...finish(),expectedRevision:2},now));
  for (const effect of s.effects) assert.deepEqual(Object.keys(effect).sort(),
    ['accountId','action','occurredAt','operationId'].sort());
});

const manifest=()=>({operatorAuthorized:true,existingBootstrap:false,manifestId:'manifest-1',adminIds:['admin-a','admin-b']});
const enrollment=(id='admin-a',rev=0)=>({expectedRevision:rev,manifestId:'manifest-1',
  accountId:id,invitationAccountId:id,invitationManifestId:'manifest-1',
  invitationId:'invite-'+id,invitationVerified:true,
  passwordEnrolled:true,totpVerified:true,invitationExpiresAt:2000});
for(const [name,delta] of Object.entries({
  'unauthorized operator':{operatorAuthorized:false},
  'existing bootstrap':{existingBootstrap:true}, 'duplicate identity':{adminIds:['a','a']},
  'third identity':{adminIds:['a','b','c']},'single identity':{adminIds:['a']}
})) test('bootstrap creation denies '+name,()=>assert.throws(()=>createBootstrap({...manifest(),...delta}),/DENIED/));
for(const [name,delta] of Object.entries({
  'third account':{accountId:'admin-c'},'wrong manifest':{manifestId:'other'},
  'unverified invitation':{invitationVerified:false},'missing password':{passwordEnrolled:false},
  'missing TOTP':{totpVerified:false},'expired invitation':{invitationExpiresAt:now}
})) test('bootstrap enrollment denies '+name,()=>{const s=createBootstrap(manifest());
  unchangedDenial(s,()=>enrollBootstrap(s,{...enrollment(),...delta},now));});
test('partial bootstrap cannot authorize business access and persists for resumption',()=>{
  let s=createBootstrap(manifest());const r=enrollBootstrap(s,enrollment(),now);
  assert.equal(r.businessAuthorizationReady,false);assert.equal(s.status,'open');
  s=JSON.parse(JSON.stringify(s)); // persisted-state resumption, not a real crash/DB proof
  unchangedDenial(s,()=>enrollBootstrap(s,enrollment(),now));
  unchangedDenial(s,()=>enrollBootstrap(s,enrollment('admin-a',1),now));
  const done=enrollBootstrap(s,enrollment('admin-b',1),now);
  assert.equal(done.businessAuthorizationReady,true);assert.equal(done.staffSessionIssued,false);
  assert.equal(s.status,'sealed');assert.deepEqual(s.enrolled,['admin-a','admin-b']);
  assert.equal(s.effects.filter(e=>e.action==='bootstrap_sealed').length,1);
  unchangedDenial(s,()=>enrollBootstrap(s,enrollment('admin-c',2),now));
  unchangedDenial(s,()=>enrollBootstrap(s,enrollment('admin-b',2),now));
});

const principal=()=>({kind:'staff',status:'active',tokenVerified:true,liveSession:true,
  factorVerified:true,bootstrapComplete:true,riskCleared:true,lifetimeValid:true,sessionEpoch:3,currentEpoch:3,grants:['menu.publish']});
const request=()=>({permission:'menu.publish',resourceInScope:true,hardSafetyPassed:true});
test('canonical permission authorizes independently of role display name',()=>{
  assert.equal(authorize({...principal(),roleDisplayName:'renamed'},request()),true);
});
for(const [name,delta] of Object.entries({
  customer:{kind:'customer'},pending:{status:'recovery_pending'},inactive:{status:'deactivated'},
  token:{tokenVerified:false},session:{liveSession:false},factor:{factorVerified:false},
  bootstrap:{bootstrapComplete:false},risk:{riskCleared:false},lifetime:{lifetimeValid:false},revoked:{currentEpoch:4},ungranted:{grants:[]}
})) test('authorization denies '+name,()=>assert.equal(authorize({...principal(),...delta},request()),false));
for(const permission of ['menu.weekly.publish','subscriber.act.pause','unknown','*'])
  test('unknown or alias permission denies: '+permission,()=>{
    assert.equal(authorize({...principal(),grants:[permission]},{...request(),permission}),false);
  });
test('scope and hard safety checks remain mandatory',()=>{
  assert.equal(authorize(principal(),{...request(),resourceInScope:false}),false);
  assert.equal(authorize(principal(),{...request(),hardSafetyPassed:false}),false);
});
test('Administrator name cannot imply logistics grant',()=>{
  const p={...principal(),roleDisplayName:'Administrator'};
  const r={...request(),permission:'logistics.post_cutoff',explicitScopedLogisticsGrant:true,reason:'amendment'};
  assert.equal(authorize(p,r),false);
  p.grants=['logistics.post_cutoff'];
  assert.equal(authorize(p,{...r,explicitScopedLogisticsGrant:false}),false);
  assert.equal(authorize(p,{...r,reason:''}),false);
  assert.equal(authorize(p,r),true);
});
test('delivery actualDeliveredAt and authoritative event examples represent the same instant',()=>{
  const doc=readFileSync(new URL('./staff-design.md',import.meta.url),'utf8');
  const section=doc.split('### 13.8 Delivery confirmed event (authoritative)')[1].split('### 13.9')[0];
  const event=JSON.parse(section.match(/```json\s*([\s\S]*?)```/)[1]);
  assert.equal(Date.parse(event.occurredAt),Date.parse(event.payload.actualDeliveredAt));
});

for (const value of [undefined, NaN, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
  test('invalid revision and epoch fail closed: '+String(value), () => {
    const s=account();s.revision=value;
    unchangedDenial(s,()=>beginRecovery(s,{...start(),expectedRevision:value},now));
    const t=account();t.sessionEpoch=value;
    unchangedDenial(t,()=>beginRecovery(t,start(),now));
    const u=account();beginRecovery(u,start(),now);u.sessionEpoch=value;
    unchangedDenial(u,()=>completeRecovery(u,finish(),now));
    const b=createBootstrap(manifest());b.revision=value;
    unchangedDenial(b,()=>enrollBootstrap(b,{...enrollment(),expectedRevision:value},now));
  });
}
for (const value of [undefined, NaN, -1, '2000']) {
  test('stored challenge expiry rejects '+String(value),()=>{
    const s=account();beginRecovery(s,start(),now);s.challenge.expiresAt=value;
    unchangedDenial(s,()=>completeRecovery(s,finish(),now));
  });
}
test('stored challenge must belong to recovering account',()=>{
  const s=account();beginRecovery(s,start(),now);s.challenge.accountId='staff-b';
  unchangedDenial(s,()=>completeRecovery(s,finish(),now));
});
for (const value of [undefined, 1, {}, '', ' ']) {
  for (const field of ['accountId','proofId','operationId','challengeId'])
    test('start rejects malformed '+field+': '+JSON.stringify(value),()=>{
      const s=account();unchangedDenial(s,()=>beginRecovery(s,{...start(),[field]:value},now));
    });
  for (const field of ['accountId','operationId','challengeId','newFactorId'])
    test('completion rejects malformed '+field+': '+JSON.stringify(value),()=>{
      const s=account();beginRecovery(s,start(),now);
      unchangedDenial(s,()=>completeRecovery(s,{...finish(),[field]:value},now));
    });
  for (const field of ['manifestId','accountId','invitationId'])
    test('bootstrap rejects malformed '+field+': '+JSON.stringify(value),()=>{
      const s=createBootstrap(manifest());
      unchangedDenial(s,()=>enrollBootstrap(s,{...enrollment(),[field]:value},now));
    });
  test('bootstrap creation rejects malformed manifest: '+JSON.stringify(value),()=>
    assert.throws(()=>createBootstrap({...manifest(),manifestId:value}),/DENIED/));
}
test('verified invitation for A cannot enroll B',()=>{
  const s=createBootstrap(manifest());
  unchangedDenial(s,()=>enrollBootstrap(s,{...enrollment('admin-b'),invitationAccountId:'admin-a'},now));
});
test('verified invitation from another manifest cannot enroll',()=>{
  const s=createBootstrap(manifest());
  unchangedDenial(s,()=>enrollBootstrap(s,{...enrollment(),invitationManifestId:'other'},now));
});
test('missing invitation bindings deny even with verified=true',()=>{
  const s=createBootstrap(manifest());const f=enrollment();delete f.invitationAccountId;
  unchangedDenial(s,()=>enrollBootstrap(s,f,now));
  const g=enrollment();delete g.invitationManifestId;
  unchangedDenial(s,()=>enrollBootstrap(s,g,now));
});
for (const value of [undefined, null, '', 'false', 0]) test('proof consumption state must explicitly be false: '+String(value),()=>{
  const s=account();s.proofs[0].used=value;
  unchangedDenial(s,()=>beginRecovery(s,start(),now));
});