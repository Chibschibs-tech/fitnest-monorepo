import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CommunicationsReference} from './communications-reference.mjs';
const model=()=>new CommunicationsReference();
const p=()=>({proofId:'proof_one',accountId:'account_one',purpose:'risk_recovery',operationId:'operation_one',emailRef:'email_one',emailVerifiedAt:10,proofCompletedAt:25,challengeCompleted:true,expiresAt:100,used:false});
const req=()=>({version:1,proofId:'proof_one',accountId:'account_one',purpose:'risk_recovery',operationId:'operation_one'});
const ctx=()=>({proofExchangeAuthenticated:true,now:30,accountId:'account_one',operationId:'operation_one',emailRef:'email_one',emailVerified:true,emailUnique:true,riskStartedAt:20});
const n=()=>({version:1,eventId:'event_one',accountId:'account_one',recipientRef:'recipient_one',channel:'email',locale:'fr',templateVersion:1,kind:'renewal_due',sourceVersion:3});
const tc=()=>({event:{id:'event_one',accountId:'account_one',kind:'renewal_due',version:3},recipient:{ref:'recipient_one',accountId:'account_one',active:true,allowedChannels:['email','whatsapp','push'],pushOptIn:true,currentSession:true,currentInstallation:true},providerApproved:true,privacyApproved:true,reviewedTemplates:['renewal_due:fr:1','renewal_due:en:1','admission:fr:1'],maxAttempts:2,subscription:{version:3,status:'active',autoRenew:true,trial:false,validMandate:true,versionedAcceptance:true},dispatchMode:'automatic'});
const denied=f=>assert.throws(f,/DENIED/);
test('N01 valid prior independent email proof consumes once and exposes no proof',()=>{const m=model();m.registerProof(p());const result=m.consumeProof(req(),ctx());assert.equal(result.consumed,true);assert.equal('proofId' in result,false);denied(()=>m.consumeProof(req(),ctx()));});
for(const [name,patch] of Object.entries({wrongAccount:{accountId:'account_two'},wrongPurpose:{purpose:'number_change'},wrongOperation:{operationId:'operation_two'},unknownProof:{proofId:'proof_missing'},unknownVersion:{version:2}})){
 test('N01 '+name,()=>{const m=model();m.registerProof(p());denied(()=>m.consumeProof({...req(),...patch},ctx()));assert.equal(m.consumeProof(req(),ctx()).consumed,true);});
}
for(const [name,patch] of Object.entries({expired:{now:100},future:{now:9},newEmail:{riskStartedAt:10},unverified:{emailVerified:false},sharedEmail:{emailUnique:false},recipientMismatch:{emailRef:'email_other'},untrusted:{proofExchangeAuthenticated:false}})){
 test('N01 '+name,()=>{const m=model();m.registerProof(p());denied(()=>m.consumeProof(req(),{...ctx(),...patch}));});
}
test('N01 concurrent-equivalent serialized consumers have one winner',()=>{const m=model();m.registerProof(p());const results=[1,2].map(()=>{try{return m.consumeProof(req(),ctx()).consumed}catch{return false}});assert.deepEqual(results,[true,false]);});
const hook=()=>({version:1,hookId:'hook_one',accountId:'account_one',purpose:'customer_phone_otp'});
const hc=()=>({signatureValid:true,fresh:true,accountId:'account_one',sharedQuotaAllowed:true,cooldownSatisfied:true,attemptBudgetAllowed:true,spendPolicyAllowed:true});
test('N02 trusted hook never sends/authenticates and replay deduplicates',()=>{const m=model();assert.deepEqual(m.validateOtpHook(hook(),hc()),{status:'validated_only',providerSend:false,authenticatesAccount:false});assert.equal(m.validateOtpHook(hook(),hc()).status,'duplicate');});
for(const field of ['signatureValid','fresh','sharedQuotaAllowed','cooldownSatisfied','attemptBudgetAllowed','spendPolicyAllowed']){
 test('N02 rejects '+field,()=>denied(()=>model().validateOtpHook(hook(),{...hc(),[field]:false})));
}
test('N02 unknown purpose rejects before effect',()=>denied(()=>model().validateOtpHook({...hook(),purpose:'marketing'},hc())));
test('N03 repeated claim has one in-flight effect',()=>{const m=model();assert.equal(m.claim(n(),tc()).status,'claimed_design_only');assert.equal(m.claim(n(),tc()).status,'duplicate');});
test('N03 different channel and recipient have separate keys',()=>{const m=model();const a=m.claim(n(),tc());const b=m.claim({...n(),channel:'whatsapp'},tc());const t=tc();t.recipient.ref='recipient_two';const c=m.claim({...n(),recipientRef:'recipient_two'},t);assert.equal(new Set([a.key,b.key,c.key]).size,3);});
test('N03 unknown outcome requires reconciliation before repeat',()=>{const m=model(),a=m.claim(n(),tc());m.settle({version:1,key:a.key,attempt:a.attempt,outcome:'unknown'},{authenticatedProviderEvidence:true,key:a.key,attempt:a.attempt,outcome:'unknown'});assert.equal(m.claim(n(),tc()).status,'reconcile_required');m.settle({version:1,key:a.key,attempt:a.attempt,outcome:'sent'},{authenticatedProviderEvidence:true,key:a.key,attempt:a.attempt,outcome:'sent'});assert.equal(m.claim(n(),tc()).status,'duplicate');});
test('N03 confirmed absence alone permits bounded retry',()=>{const m=model();for(let attempt=1;attempt<=2;attempt++){const a=m.claim(n(),tc());assert.equal(a.attempt,attempt);m.settle({version:1,key:a.key,attempt,outcome:'not_sent'},{authenticatedProviderEvidence:true,key:a.key,attempt,outcome:'not_sent'});}assert.equal(m.claim(n(),tc()).status,'retry_exhausted');});
test('N03 unauthenticated or wrong-attempt callback rejects',()=>{const m=model(),a=m.claim(n(),tc());denied(()=>m.settle({version:1,key:a.key,attempt:1,outcome:'sent'},{authenticatedProviderEvidence:false,key:a.key,attempt:1,outcome:'sent'}));denied(()=>m.settle({version:1,key:a.key,attempt:2,outcome:'sent'},{authenticatedProviderEvidence:true,key:a.key,attempt:2,outcome:'sent'}));});
test('N03 same dedup tuple changed template conflicts',()=>{const m=model(),t=tc();m.claim(n(),t);t.reviewedTemplates.push('renewal_due:fr:2');denied(()=>m.claim({...n(),templateVersion:2},t));});
for(const field of ['pushOptIn','currentSession','currentInstallation','active']){
 test('N04 push refuses '+field,()=>{const t=tc();t.recipient[field]=false;denied(()=>model().claim({...n(),channel:'push'},t));});
}
test('N04 current push permits synthetic claim only',()=>assert.equal(model().claim({...n(),channel:'push'},tc()).providerSend,false));
for(const [field,value] of Object.entries({status:'cancelled',autoRenew:false,trial:true,validMandate:false,versionedAcceptance:false,version:4})){
 test('N05 actual renewal '+field+' refuses stale message',()=>{const t=tc();t.subscription[field]=value;denied(()=>model().claim(n(),t));});
}
test('N05 cancellation after no-send is rechecked before retry',()=>{const m=model(),a=m.claim(n(),tc());m.settle({version:1,key:a.key,attempt:1,outcome:'not_sent'},{authenticatedProviderEvidence:true,key:a.key,attempt:1,outcome:'not_sent'});const t=tc();t.subscription.autoRenew=false;denied(()=>m.claim(n(),t));});
test('N06 admission manual authorization is distinct from automatic transactions',()=>{const a={...n(),kind:'admission'},t=tc();t.event.kind='admission';denied(()=>model().claim(a,t));t.dispatchMode='manual';denied(()=>model().claim(a,t));t.manualAdmissionAuthorized=true;assert.equal(model().claim(a,t).status,'claimed_design_only');});
for(const field of ['phone','token','health','history','email','payload','otp']){
 test('N07 rejects extra '+field,()=>denied(()=>model().claim({...n(),[field]:'sensitive'},tc())));
}
test('N07 rejects unsupported locale and unreviewed template',()=>{denied(()=>model().claim({...n(),locale:'ar'},tc()));denied(()=>model().claim({...n(),templateVersion:2},tc()));});
test('N07 English reviewed template supported',()=>assert.equal(model().claim({...n(),locale:'en'},tc()).providerSend,false));
test('recipient-account mismatch denies',()=>{const t=tc();t.recipient.accountId='account_two';denied(()=>model().claim(n(),t));});
test('provider/privacy release gates default deny',()=>{for(const field of ['providerApproved','privacyApproved']){const t=tc();delete t[field];denied(()=>model().claim(n(),t));}});
test('event identity/version mismatch denies',()=>{const t=tc();t.event.version=2;denied(()=>model().claim(n(),t));});
test('unknown schema version denies',()=>denied(()=>model().claim({...n(),version:2},tc())));

test('N01 email history and current challenge completion are distinct',()=>{const m=model();m.registerProof(p());assert.equal(m.consumeProof(req(),ctx()).consumed,true);});
test('N01 uncompleted or future current challenge cannot authorize',()=>{const m=model();denied(()=>m.registerProof({...p(),challengeCompleted:false}));m.registerProof({...p(),proofCompletedAt:40});denied(()=>m.consumeProof(req(),ctx()));});
test('N01 future risk timestamp denies',()=>{const m=model();m.registerProof(p());denied(()=>m.consumeProof(req(),{...ctx(),riskStartedAt:40}));});
test('N02 hook ID collision with other account denies',()=>{const m=model();m.validateOtpHook(hook(),hc());denied(()=>m.validateOtpHook({...hook(),accountId:'account_two'},{...hc(),accountId:'account_two'}));});
test('N03 receipt cannot relabel unknown provider evidence as no-send',()=>{const m=model(),a=m.claim(n(),tc());denied(()=>m.settle({version:1,key:a.key,attempt:1,outcome:'not_sent'},{authenticatedProviderEvidence:true,key:a.key,attempt:1,outcome:'unknown'}));assert.equal(m.claim(n(),tc()).status,'duplicate');});
test('N01 completed proof from before risk cannot clear new risk',()=>{const m=model();m.registerProof({...p(),proofCompletedAt:15});denied(()=>m.consumeProof(req(),ctx()));});
