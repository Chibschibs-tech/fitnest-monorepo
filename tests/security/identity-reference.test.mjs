import test from 'node:test';import assert from 'node:assert/strict';
import {authorize,revokeOwned,rotate,OtpBudget} from './identity-reference.mjs';
// Values below are synthetic test vectors, not proposed launch policy.
const input=()=>({token:{verified:true,accountId:'A',sessionId:'S',issuedAt:100,expiresAt:500},session:{id:'S',accountId:'A',createdAt:100,lastSeen:150,refresh:'R1',revoked:false},now:200,policy:{accessMs:400,idleMs:100,absoluteMs:1000},resourceOwner:'A'});
test('owner, token, live session and every time bound are independently necessary',()=>{
  assert.equal(authorize(input()),true);
  for(const alter of [x=>x.token.verified=false,x=>x.session=null,x=>x.session.unavailable=true,x=>x.resourceOwner='B',x=>x.token.sessionId='OTHER',x=>x.session.revoked=true,x=>x.now=500,x=>x.now=250,x=>x.policy.absoluteMs=100,x=>x.now=99]){const x=input();alter(x);assert.equal(authorize(x),false);}
  assert.throws(()=>authorize({...input(),policy:{}}));
});
test('malformed dates and identities fail closed',()=>{
  for(const alter of [x=>delete x.token.issuedAt,x=>x.session.lastSeen=NaN,x=>x.token.expiresAt=Infinity,x=>x.session.createdAt=undefined,x=>x.token.accountId=x.session.accountId=x.resourceOwner=undefined,x=>x.token.expiresAt=99]){const x=input();alter(x);assert.equal(authorize(x),false);}
});
test('risk needs independent previously verified account-bound unexpired email proof',()=>{
  const x=input();x.risk=true;assert.equal(authorize(x),false);
  for(const kind of ['phone_otp','delivery_address','last_delivery','unverified_email'])assert.equal(authorize({...x,proof:{kind}}),false);
  const proof={kind:'previously_verified_email',accountId:'A',verifiedBeforeRisk:true,used:false,expiresAt:201};assert.equal(authorize({...x,proof}),true);
  for(const patch of [{accountId:'B'},{used:true},{expiresAt:200},{verifiedBeforeRisk:false}])assert.equal(authorize({...x,proof:{...proof,...patch}}),false);
});
test('single and bulk disconnect require the same authorization and preserve other owners',()=>{
  const x=input(),other={...x.session,id:'T',accountId:'B'},sessions=[x.session,other];
  for(const all of [false,true])assert.equal(revokeOwned(sessions,{caller:'A',targetId:'S',all,authorized:false}),false);
  assert.equal(revokeOwned(sessions,{caller:'A',targetId:'T',authorized:true}),false);
  assert.equal(revokeOwned(sessions,{caller:'A',all:true,authorized:true}),true);assert.equal(other.revoked,false);assert.equal(authorize(x),false);
});
test('refresh reuse revokes the session and still-valid old access cannot authorize',()=>{
  const x=input();assert.equal(rotate(x.session,'R1','R2'),true);assert.equal(rotate(x.session,'R1','R3'),false);assert.equal(authorize(x),false);
});

test('malformed booleans cannot authorize access or revoke a session',()=>{
  for(const value of ['false',1,{},null,undefined]){
    const x=input();x.token.verified=value;assert.equal(authorize(x),false);
    const y=input();assert.equal(revokeOwned([y.session],{caller:'A',targetId:'S',authorized:value}),false);assert.equal(y.session.revoked,false);
  }
  for(const value of ['false',null,undefined]){const x=input();x.session.revoked=value;assert.equal(authorize(x),false);}
  assert.equal(authorize({...input(),risk:'false'}),false);
  assert.equal(revokeOwned([input().session],{caller:undefined,all:true,authorized:true}),false);
});

test('independent proof must have a finite integer expiry',()=>{
  const x={...input(),risk:true};
  for(const expiresAt of [Infinity,NaN,undefined,'201',201.5])assert.equal(authorize({...x,proof:{kind:'previously_verified_email',accountId:'A',verifiedBeforeRisk:true,used:false,expiresAt}}),false);
});

test('refresh rotation requires existing and presented nonempty identifiers',()=>{
  assert.equal(rotate({revoked:false},undefined,'new'),false);
  for(const value of [undefined,null,'', ' ',1]){
    assert.equal(rotate({...input().session,refresh:value},value,'R2'),false);
    assert.equal(rotate(input().session,value,'R2'),false);
    assert.equal(rotate(input().session,'R1',value),false);
  }
});
test('concurrent calls respect reference quota and ambiguous sends remain consumed',async()=>{
  const budget=new OtpBudget({limit:2,windowMs:1000});
  const results=await Promise.all(Array.from({length:10},(_,i)=>Promise.resolve().then(()=>budget.reserve('phone:A','req'+i,100))));
  assert.equal(results.filter(Boolean).length,2);assert.equal(budget.reserve('phone:A','req0',101),false);assert.equal(budget.reserve('phone:A','retry-timeout',102),false);
  assert.equal(budget.reserve('phone:A','next-window',1100),true);
  assert.equal(budget.reserve('phone:A','req0',1101),false);
});

