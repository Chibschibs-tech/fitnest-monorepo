// DESIGN REFERENCE ONLY: trusted facts are supplied by test adapters, not client fields.
// Pure state transitions; no SQL/provider/crypto/timezone implementation or acceptance receipt.
const fail=(code='DENIED')=>{throw new Error(code);};
const id=x=>typeof x==='string'&&x.trim().length>0;
const count=x=>Number.isSafeInteger(x)&&x>=0&&x<Number.MAX_SAFE_INTEGER;
const instant=x=>Number.isSafeInteger(x)&&x>=0;
const sameKeys=(o,keys)=>o&&Object.keys(o).every(k=>keys.includes(k));
function authority(context,delivery,permission,now) {
  if (!id(delivery.roundId)||!context||context.kind!=='staff'||context.live!==true||context.factorVerified!==true||
      context.riskCleared!==true||context.lifetimeValid!==true||!id(context.actorId)||
      context.assignmentPolicyAccepted!==true||!id(context.assignmentVersion)||
      !Array.isArray(context.permissions)||!context.permissions.includes(permission)||
      !Array.isArray(context.assignedRoundIds)||!context.assignedRoundIds.includes(delivery.roundId)||
      !instant(now)||!instant(context.windowStart)||!instant(context.windowEnd)||
      context.windowStart>=context.windowEnd||now<context.windowStart||now>=context.windowEnd) fail();
}
function revision(delivery,expected) {
  if (!count(delivery.revision)||!count(expected)||delivery.revision!==expected) fail('CONFLICT');
}
const deliveryFor=(state,deliveryId)=>{
  if(!id(deliveryId))fail();const d=state.deliveries.find(x=>x.id===deliveryId);if(!d)fail();return d;
};
const nextEvent=(state,eventType,delivery,actorId,now,payload)=>{
  if(!count(state.nextEvent)||!id(state.projectId))fail('INVALID');
  const event={eventVersion:1,eventId:state.projectId+':event:'+state.nextEvent++,
    eventType,aggregateId:delivery.id,aggregateVersion:delivery.revision,
    occurredAt:now,actorId,correlationId:state.projectId+':operation:'+state.nextEvent,payload};
  state.events.push(event);state.outbox.push({eventId:event.eventId,status:'pending'});return event;
};
export function listAssigned(state,context,now) {
  if(!context||context.assignmentPolicyAccepted!==true)fail();
  const result=[];
  for(const delivery of state.deliveries) {
    if(!context.assignedRoundIds?.includes(delivery.roundId))continue;
    authority(context,delivery,'delivery.round.read',now);
    result.push({version:1,deliveryId:delivery.id,roundId:delivery.roundId,
      consumptionDate:delivery.consumptionDate,productionDate:delivery.productionDate,
      deliveryDate:delivery.deliveryDate,status:delivery.status,productionVersion:delivery.productionVersion});
  }
  // Validate even an empty result; no unauthenticated or out-of-window successful query.
  authority(context,{roundId:context.assignedRoundIds?.[0]},'delivery.round.read',now);
  return result;
}
export function transition(state,context,command,now) {
  if(!id(state.projectId)||!command||command.version!==1||!count(command.expectedRevision)||!id(command.idempotencyKey)||
      !sameKeys(command,['version','operation','deliveryId','idempotencyKey','expectedRevision','reason','targetStatus']))fail('INVALID');
  if(!['confirm','fail','correct'].includes(command.operation))fail('INVALID');
  const delivery=deliveryFor(state,command.deliveryId);
  authority(context,delivery,'delivery.'+command.operation,now);
  if(command.operation!=='confirm'&&!id(command.reason))fail('INVALID');
  if(command.operation==='correct'&&context.correctionPolicyAccepted!==true)fail();
  const binding=JSON.stringify([state.projectId,context.actorId,command.operation,command.idempotencyKey]);
  const payload=JSON.stringify([command.version,command.deliveryId,command.expectedRevision,command.reason??null,command.targetStatus??null]);
  const prior=state.idempotency.find(x=>x.binding===binding);
  if(prior){
    if(prior.payload!==payload)fail('CONFLICT');
    if(prior.status==='pending')fail('WAIT');
    if(prior.status==='unknown')fail('RECONCILE');
    if(prior.status!=='complete'||!id(prior.eventId)||
        !state.events.some(e=>e.eventId===prior.eventId&&e.aggregateId===delivery.id))fail('INVALID');
    return {state:structuredClone(state),eventId:prior.eventId,replayed:true};
  }
  revision(delivery,command.expectedRevision);
  if(command.operation!=='correct'&&delivery.status!=='prepared')fail('CONFLICT');
  if(command.operation==='correct'&&(!['delivered','failed'].includes(delivery.status)||
      !['delivered','failed'].includes(command.targetStatus)))fail('INVALID');
  const target=command.operation==='confirm'?'delivered':command.operation==='fail'?'failed':command.targetStatus;
  if(target==='failed'&&!id(context.exceptionOwnerId))fail();
  if(target==='delivered'&&(!count(delivery.productionVersion)||!count(delivery.acknowledgedProductionVersion)||delivery.safetyBlocked!==false||
      delivery.acknowledgedProductionVersion!==delivery.productionVersion))fail();
  const copy=structuredClone(state), changed=deliveryFor(copy,delivery.id);
  const previousStatus=changed.status;changed.status=target;changed.revision++;
  const event=nextEvent(copy,'delivery.'+(command.operation==='confirm'?'confirmed':command.operation==='fail'?'failed':'corrected'),
    changed,context.actorId,now,{previousStatus,status:target,reason:command.reason??null,
      productionVersion:changed.productionVersion,assignmentVersion:context.assignmentVersion,
      exceptionOwnerId:target==='failed'?context.exceptionOwnerId:null});
  copy.idempotency.push({binding,payload,eventId:event.eventId,status:'complete'});
  return {state:copy,eventId:event.eventId,replayed:false};
}
export function blockUnsafeChange(state,deliveryId,expectedRevision,sourceVersion,now) {
  const delivery=deliveryFor(state,deliveryId);revision(delivery,expectedRevision);
  if(!id(sourceVersion)||!instant(now))fail('INVALID');
  const copy=structuredClone(state),changed=deliveryFor(copy,deliveryId);
  changed.safetyBlocked=true;changed.revision++;
  nextEvent(copy,'operations.safety_blocked',changed,'trusted-safety-evaluator',now,{sourceVersion});
  // No recipe regeneration, preparation restart or automatic incident closure.
  return copy;
}
export function amendLogistics(state,context,command,now) {
  const delivery=deliveryFor(state,command?.deliveryId);
  authority(context,delivery,'logistics.post_cutoff',now);
  revision(delivery,command.expectedRevision);
  if(command.version!==1||context.explicitScopedLogisticsGrant!==true||
      context.logisticsPolicyAccepted!==true||!id(command.reason)||
      !count(delivery.productionVersion)||delivery.safetyBlocked!==false)fail();
  const copy=structuredClone(state),changed=deliveryFor(copy,delivery.id);
  changed.productionVersion++;changed.revision++;
  nextEvent(copy,'operations.production_amended',changed,context.actorId,now,
    {reason:command.reason,productionVersion:changed.productionVersion,requiresAcknowledgement:true});
  return copy;
}
export function acknowledge(state,context,command,now) {
  const delivery=deliveryFor(state,command?.deliveryId);
  authority(context,delivery,'preparation.acknowledge',now);revision(delivery,command.expectedRevision);
  if(command.version!==1||!count(command.productionVersion)||
      command.productionVersion!==delivery.productionVersion||delivery.safetyBlocked!==false)fail();
  const copy=structuredClone(state),changed=deliveryFor(copy,delivery.id);
  changed.acknowledgedProductionVersion=command.productionVersion;changed.revision++;
  nextEvent(copy,'operations.production_acknowledged',changed,context.actorId,now,{productionVersion:command.productionVersion});
  return copy;
}
export function consumeConfirmedEvent(state,eventId,consumer,outcome) {
  if(!id(eventId)||!['reward','notification'].includes(consumer)||!['applied','unknown'].includes(outcome))fail('INVALID');
  const event=state.events.find(e=>e.eventId===eventId);
  if(!event||event.eventType!=='delivery.confirmed')fail();
  const old=state.receipts.find(x=>x.eventId===eventId&&x.consumer===consumer);
  if(old?.status==='unknown')fail('RECONCILE');
  if(old?.status==='applied')return {state:structuredClone(state),applied:false};
  if(old)fail('INVALID');
  const copy=structuredClone(state);
  copy.receipts.push({eventId,consumer,status:outcome});
  return {state:copy,applied:outcome==='applied'};
}
export function reconcile(rows) {
  const ids=new Set();let prepared=0,delivered=0,failed=0,notPrepared=0;
  for(const row of rows) {
    if(!id(row.id)||ids.has(row.id)||!['planned','prepared','delivered','failed'].includes(row.status))fail('INVALID');
    ids.add(row.id);
    if(row.status==='planned')notPrepared++;else prepared++;
    if(row.status==='delivered')delivered++;if(row.status==='failed')failed++;
  }
  return {version:1,planned:rows.length,prepared,delivered,failed,notPrepared,
    unresolvedPrepared:prepared-delivered-failed,unaccounted:rows.length-delivered-failed};
}
