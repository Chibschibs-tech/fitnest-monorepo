// Isolated reference model, NOT a Supabase adapter or production authorization.
// All limits are explicit caller inputs; no policy value is silently approved.
import assert from 'node:assert/strict';
export function authorize({token,session,now,policy,resourceOwner,risk=false,proof}){
  for(const key of ['accessMs','idleMs','absoluteMs'])assert.ok(Number.isSafeInteger(policy[key])&&policy[key]>0,'Explicit finite policy required');
  if(!Number.isSafeInteger(now)||token?.verified!==true||!session||(session.unavailable!==undefined&&session.unavailable!==false)||typeof risk!=='boolean')return false;
  if(![token.issuedAt,token.expiresAt,session.createdAt,session.lastSeen].every(Number.isSafeInteger))return false;
  if(![token.accountId,token.sessionId,session.accountId,session.id,resourceOwner].every(x=>typeof x==='string'&&x.length>0))return false;
  if(token.expiresAt<=token.issuedAt||session.lastSeen<session.createdAt)return false;
  if(token.accountId!==session.accountId||token.sessionId!==session.id||resourceOwner!==session.accountId)return false;
  if(session.revoked!==false||now<token.issuedAt||now<session.createdAt||now<session.lastSeen)return false;
  if(now>=token.expiresAt||now-token.issuedAt>=policy.accessMs||now-session.createdAt>=policy.absoluteMs||now-session.lastSeen>=policy.idleMs)return false;
  if(risk&&!(proof?.kind==='previously_verified_email'&&proof.accountId===session.accountId&&proof.verifiedBeforeRisk===true&&proof.used===false&&Number.isSafeInteger(proof.expiresAt)&&now<proof.expiresAt))return false;
  return true;
}
export function revokeOwned(sessions,{caller,targetId,all=false,authorized}){
  if(authorized!==true||!Array.isArray(sessions)||typeof caller!=='string'||!caller.trim()||typeof all!=='boolean'||(!all&&(typeof targetId!=='string'||!targetId.trim())))return false;
  const targets=sessions.filter(s=>s&&(all?s.accountId===caller:s.id===targetId&&s.accountId===caller));
  if(!targets.length)return false;for(const s of targets)s.revoked=true;return true;
}
export function rotate(session,presented,next){
  if(!session||session.revoked!==false||![session.refresh,presented,next].every(x=>typeof x==='string'&&x.trim().length>0)||next===presented)return false;
  if(presented!==session.refresh){session.revoked=true;return false;}
  session.refresh=next;return true;
}
export class OtpBudget {
  constructor({limit,windowMs}){assert.ok(Number.isSafeInteger(limit)&&limit>0&&Number.isSafeInteger(windowMs)&&windowMs>0);this.limit=limit;this.windowMs=windowMs;this.entries=new Map();this.requests=new Map();}
  reserve(key,requestId,now){
    assert.ok(typeof key==='string'&&key&&typeof requestId==='string'&&requestId&&Number.isSafeInteger(now));
    const seen=this.requests.get(key)??new Set();
    if(seen.has(requestId))return false;
    const row=this.entries.get(key)??{start:now,ids:new Set()};
    if(now<row.start)return false;
    // A provider timeout remains reserved: no refund until independent reconciliation.
    if(row.ids.has(requestId))return false;
    if(now-row.start>=this.windowMs){row.start=now;row.ids=new Set();}
    if(row.ids.size>=this.limit)return false;
    row.ids.add(requestId);seen.add(requestId);this.requests.set(key,seen);this.entries.set(key,row);return true;
  }
}

