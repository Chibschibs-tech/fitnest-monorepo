// Design-only synchronous reference. Trusted context is an adapter obligation, not HTTP input.
// No network, secrets, providers, authentication implementation or persistent transaction proof.
import { createHash } from 'node:crypto';
const fail = () => { throw new Error('DENIED'); };
const exact = (o, keys) => o && typeof o === 'object' && !Array.isArray(o) && Object.keys(o).length === keys.length && keys.every(k=>Object.hasOwn(o,k));
const id = x => typeof x === 'string' && /^[a-z][a-z0-9_]{1,79}$/.test(x);
const integer = x => Number.isSafeInteger(x) && x >= 0;
const purpose = x => ['email_verification','risk_recovery','number_change'].includes(x);
export class CommunicationsReference {
  #proofs = new Map(); #hooks = new Map(); #effects = new Map();
  registerProof(record) {
    if (!exact(record,['proofId','accountId','purpose','operationId','emailRef','emailVerifiedAt','proofCompletedAt','challengeCompleted','expiresAt','used']) ||
      ![record.proofId,record.accountId,record.operationId,record.emailRef].every(id) || !purpose(record.purpose) ||
      !integer(record.emailVerifiedAt) || !integer(record.proofCompletedAt) || record.challengeCompleted!==true || record.proofCompletedAt<record.emailVerifiedAt || !integer(record.expiresAt) || record.expiresAt<=record.proofCompletedAt || record.used!==false ||
      this.#proofs.has(record.proofId)) fail();
    this.#proofs.set(record.proofId,structuredClone(record));
  }
  consumeProof(request, trusted) {
    if (!exact(request,['version','proofId','accountId','purpose','operationId']) || request.version!==1 ||
      trusted?.proofExchangeAuthenticated!==true || !integer(trusted.now)) fail();
    const p=this.#proofs.get(request.proofId);
    if(!p || p.used || p.accountId!==request.accountId || p.purpose!==request.purpose || p.operationId!==request.operationId ||
      trusted.accountId!==p.accountId || trusted.operationId!==p.operationId || trusted.emailRef!==p.emailRef ||
      trusted.emailVerified!==true || trusted.emailUnique!==true ||
      trusted.now<p.proofCompletedAt || trusted.now>=p.expiresAt) fail();
    if(p.purpose!=='email_verification' && (!integer(trusted.riskStartedAt) || p.emailVerifiedAt>=trusted.riskStartedAt || p.proofCompletedAt<trusted.riskStartedAt || trusted.riskStartedAt>trusted.now)) fail();
    p.used=true;
    return {version:1,accountId:p.accountId,purpose:p.purpose,operationId:p.operationId,consumed:true};
  }
  validateOtpHook(request,trusted) {
    if(!exact(request,['version','hookId','accountId','purpose']) || request.version!==1 ||
      !id(request.hookId)||!id(request.accountId)||request.purpose!=='customer_phone_otp'||
      trusted?.signatureValid!==true||trusted.fresh!==true||trusted.accountId!==request.accountId||
      trusted.sharedQuotaAllowed!==true||trusted.cooldownSatisfied!==true||trusted.attemptBudgetAllowed!==true||
      trusted.spendPolicyAllowed!==true) fail();
    const fingerprint=JSON.stringify([request.accountId,request.purpose]);
    if(this.#hooks.has(request.hookId)) { if(this.#hooks.get(request.hookId)!==fingerprint)fail(); return {status:'duplicate',providerSend:false}; }
    this.#hooks.set(request.hookId,fingerprint);
    return {status:'validated_only',providerSend:false,authenticatesAccount:false};
  }
  claim(n,t) {
    const keys=['version','eventId','accountId','recipientRef','channel','locale','templateVersion','kind','sourceVersion'];
    if(!exact(n,keys)||n.version!==1||![n.eventId,n.accountId,n.recipientRef].every(id)||
      !['email','whatsapp','push'].includes(n.channel)||!['fr','en'].includes(n.locale)||
      !Number.isSafeInteger(n.templateVersion)||n.templateVersion<1||!Number.isSafeInteger(n.sourceVersion)||n.sourceVersion<1||
      !['subscription_confirmed','delivery_confirmed','renewal_due','security_change','admission'].includes(n.kind)) fail();
    if(t?.event?.id!==n.eventId||t.event.accountId!==n.accountId||t.event.kind!==n.kind||t.event.version!==n.sourceVersion||
      t.recipient?.ref!==n.recipientRef||t.recipient.accountId!==n.accountId||t.recipient.active!==true||
      !t.recipient.allowedChannels?.includes(n.channel)||t.providerApproved!==true||t.privacyApproved!==true||
      !t.reviewedTemplates?.includes(n.kind+':'+n.locale+':'+n.templateVersion)||
      !Number.isSafeInteger(t.maxAttempts)||t.maxAttempts<1||t.maxAttempts>10) fail();
    if(n.channel==='push'&&(t.recipient.pushOptIn!==true||t.recipient.currentSession!==true||t.recipient.currentInstallation!==true)) fail();
    if(n.kind==='admission'&&(t.dispatchMode!=='manual'||t.manualAdmissionAuthorized!==true)) fail();
    if(n.kind==='renewal_due'&&(t.subscription?.version!==n.sourceVersion||t.subscription.status!=='active'||
      t.subscription.autoRenew!==true||t.subscription.trial!==false||t.subscription.validMandate!==true||
      t.subscription.versionedAcceptance!==true)) fail();
    const key=JSON.stringify([n.eventId,n.channel,n.recipientRef]);
    const fingerprint=createHash('sha256').update(JSON.stringify(keys.map(k=>n[k]))).digest('hex');
    const old=this.#effects.get(key);
    if(old&&old.fingerprint!==fingerprint) fail();
    if(old&&old.status!=='not_sent') return {key,status:old.status==='unknown'?'reconcile_required':'duplicate',attempt:old.attempt,providerSend:false};
    if(old&&old.attempt>=t.maxAttempts) return {key,status:'retry_exhausted',attempt:old.attempt,providerSend:false};
    const record={fingerprint,status:'in_flight',attempt:(old?.attempt??0)+1};
    this.#effects.set(key,record);
    return {key,status:'claimed_design_only',attempt:record.attempt,providerSend:false};
  }
  settle(receipt,trusted) {
    if(!exact(receipt,['version','key','attempt','outcome'])||receipt.version!==1||
      trusted?.authenticatedProviderEvidence!==true||trusted.key!==receipt.key||trusted.attempt!==receipt.attempt||trusted.outcome!==receipt.outcome||
      !['sent','not_sent','unknown'].includes(receipt.outcome)) fail();
    const record=this.#effects.get(receipt.key);
    if(!record||record.attempt!==receipt.attempt) fail();
    if(record.status==='sent') { if(receipt.outcome!=='sent')fail(); return {status:'sent'}; }
    if(!['in_flight','unknown'].includes(record.status))fail();
    // not_sent requires affirmative provider evidence that no effect occurred; timeout is unknown.
    record.status=receipt.outcome;
    return {status:record.status};
  }
}
