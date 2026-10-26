import test from 'node:test';
import assert from 'node:assert/strict';
import {authorize, policyValid, listDevices, revokePlan, refreshOutcome} from './session-reference.mjs';
const fixture = () => ({
  token:{verified:true,subject:'u1',sessionId:'s1',issuedAt:90,expiresAt:150},
  providerSession:{lookup:'live',id:'s1',subject:'u1'},
  session:{id:'s1',subject:'u1',accountId:'a1',revoked:false,riskClearance:'cleared',createdAt:0,lastActivityAt:90},
  policy:{accessTtlSeconds:60,idleTtlSeconds:30,absoluteTtlSeconds:200},
  now:100,ownerId:'a1',path:'api'
});
const records = () => [fixture().session,
  {...fixture().session,id:'s2'},
  {...fixture().session,id:'s3',subject:'u2',accountId:'a2',rawToken:'MUST_NOT_LEAK'}];
const request = (scope='one',targetId='s2') => ({
  scope,targetId,operationId:'op1',proof:{factor:'verified_email',previouslyVerified:true,used:false,
  accountId:'a1',action:scope==='all'?'revoke:all':'revoke:one:'+targetId,operationId:'op1',
  verifiedAt:1,riskObservedAt:80,challengeIssuedAt:95,challengeVerifiedAt:98,expiresAt:110}
});
test('live matching owner passes; no production policy defaults',()=>{
  assert.equal(authorize(fixture()),true);
  for(const p of [null,{}, {accessTtlSeconds:0,idleTtlSeconds:3,absoluteTtlSeconds:4},
    {accessTtlSeconds:5,idleTtlSeconds:3,absoluteTtlSeconds:4}]) assert.equal(policyValid(p),false);
});
for(const path of ['rest','rpc','graphql','realtime','storage','unknown',undefined])
test('direct path denied: '+path,()=>assert.equal(authorize({...fixture(),path}),false));
for(const [name,mutate] of [
  ['invalid token', x=>x.token.verified=false],['future issue',x=>x.token.issuedAt=101],
  ['expired JWT',x=>x.now=150],['missing provider',x=>x.providerSession=null],
  ['unavailable provider',x=>x.providerSession.lookup='unavailable'],
  ['provider owner mismatch',x=>x.providerSession.subject='u2'],
  ['provider session mismatch',x=>x.providerSession.id='s2'],
  ['revoked session',x=>x.session.revoked=true],['pending risk',x=>x.session.riskClearance='pending'],
  ['foreign owner',x=>x.ownerId='a2'],['foreign app subject',x=>x.session.subject='u2'],
  ['idle exact boundary',x=>x.now=120],['absolute boundary',x=>{x.policy.absoluteTtlSeconds=100;x.policy.idleTtlSeconds=90;}],
  ['future activity',x=>x.session.lastActivityAt=101],['invalid timestamp',x=>x.session.createdAt=NaN],
  ['unbounded policy',x=>x.policy.absoluteTtlSeconds=Infinity],
  ['JWT ttl too long',x=>x.token.expiresAt=151]
]) test(name,()=>{const x=fixture();mutate(x);assert.equal(authorize(x),false);});
test('device list owner scope and projection never exposes token',()=>{
  const output=listDevices(fixture(),records());
  assert.deepEqual(output.map(s=>s.id),['s1','s2']);
  assert.ok(output.every(s=>Object.keys(s).sort().join(',')==='createdAt,current,id,lastActivityAt'));
  assert.deepEqual(listDevices({...fixture(),ownerId:'a2'},records()),[]);
});
test('one and all have same successful step-up and scope to owner',()=>{
  assert.deepEqual(revokePlan(fixture(),records(),request()).targetIds,['s2']);
  assert.deepEqual(revokePlan(fixture(),records(),request('all')).targetIds,['s1','s2']);
  assert.equal(revokePlan(fixture(),records(),request('one','s3')),null);
});
for(const [name,mutate] of [
  ['not completed',p=>delete p.challengeVerifiedAt],
  ['missing risk time',p=>delete p.riskObservedAt],
  ['email added after risk',p=>p.verifiedAt=85],
  ['risk after challenge',p=>p.riskObservedAt=96],
  ['future completion',p=>p.challengeVerifiedAt=101],
  ['completion before issue',p=>p.challengeVerifiedAt=94],
  ['email established after challenge',p=>p.verifiedAt=96],
  ['unverified email',p=>p.previouslyVerified=false],['OTP only',p=>p.factor='phone'],
  ['consumed proof',p=>p.used=true],['expired proof',p=>p.expiresAt=100],
  ['wrong account',p=>p.accountId='a2'],['wrong action',p=>p.action='revoke:all'],
  ['wrong operation',p=>p.operationId='op2'],['malformed completion',p=>p.challengeVerifiedAt='98']
]) test('revoke rejects '+name,()=>{
  const r=request(); mutate(r.proof);assert.equal(revokePlan(fixture(),records(),r),null);
});
test('bulk cannot bypass proof, malformed records deny atomically',()=>{
  const r=request('all');delete r.proof.challengeVerifiedAt;
  assert.equal(revokePlan(fixture(),records(),r),null);
  assert.equal(revokePlan(fixture(),[...records(),records()[0]],request()),null);
  assert.equal(revokePlan(fixture(),[...records(),null],request('all')),null);
});
test('old and refreshed JWT cannot reopen application revoked session',()=>{
  const x=fixture(); x.session.revoked=true;
  assert.equal(authorize(x),false);x.token.issuedAt=99;x.token.expiresAt=159;
  assert.equal(authorize(x),false);
});
test('refresh exceptions only request full authorization recheck; unknown denies',()=>{
  for(const kind of ['rotated','reuse_interval','active_parent'])
    assert.equal(refreshOutcome({verified:true,kind}),'recheck_authorization');
  assert.equal(refreshOutcome({verified:true,kind:'replay_rejected'}),'revoke_app_session');
  for(const x of [null,{}, {verified:false,kind:'rotated'}, {verified:true,kind:'unknown'}])
    assert.equal(refreshOutcome(x),'deny');
});


