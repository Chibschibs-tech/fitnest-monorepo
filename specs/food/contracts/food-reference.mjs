import { createHash } from 'node:crypto';

// Design-only reference. Context arguments model trusted server records, not client assertions.
export const NUTRIENTS = Object.freeze({kcal:'kcal',protein:'g',carbs:'g',fat:'g',fibre:'g',sugar:'g',saturatedFat:'g',transFat:'g',cholesterol:'mg'});
const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x) && [Object.prototype,null].includes(Object.getPrototypeOf(x));
const text = x => typeof x === 'string' && x.trim().length > 0 && x.length <= 200;
const positive = x => Number.isFinite(x) && x > 0;
const nonnegative = x => Number.isFinite(x) && x >= 0;
const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x,k));
const integer = x => Number.isSafeInteger(x) && x > 0;
const freeze = x => { if (x && typeof x === 'object') {Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const canonical = x => Array.isArray(x) ? x.map(canonical) : plain(x) ? Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])) : x;
export const digest = x => createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const safeClone = x => {try {const s=JSON.stringify(x);if(!s || s.length>100000)return null;return JSON.parse(s);}catch{return null;}};

export function validMeasurement(m, unit) {
  if (!plain(m) || m.unit !== unit || !['per100g_raw','per100g_finished','per_portion_finished'].includes(m.basis)) return false;
  const base=['state','unit','basis','evidenceRef'];
  if(m.state==='unknown') return exact(m,[...base,'reason']) && m.evidenceRef===null && text(m.reason);
  if(!text(m.evidenceRef))return false;
  if(m.state==='known')return exact(m,[...base,'value']) && positive(m.value);
  if(m.state==='known_zero')return exact(m,[...base,'value']) && m.value===0;
  if(m.state==='trace')return exact(m,[...base,'upper']) && positive(m.upper);
  if(m.state==='bounded')return exact(m,[...base,'lower','upper']) && nonnegative(m.lower) && positive(m.upper) && m.lower<m.upper;
  return false;
}
export function validWeights(w) {
  return exact(w,['basis','rawNetGrams','purchaseGrossGrams','purchaseYieldRatio','finishedWeightGrams','rawEvidenceRef','purchaseEvidenceRef','finishedEvidenceRef']) && w.basis==='batch' &&
    [w.rawNetGrams,w.purchaseGrossGrams,w.finishedWeightGrams].every(positive) && positive(w.purchaseYieldRatio) && w.purchaseYieldRatio<=1 &&
    Math.abs(w.rawNetGrams-w.purchaseGrossGrams*w.purchaseYieldRatio)<=1e-8*Math.max(1,w.rawNetGrams) &&
    [w.rawEvidenceRef,w.purchaseEvidenceRef,w.finishedEvidenceRef].every(text);
}
export function validTaxonomy(rows) {
  if(!Array.isArray(rows))return false;
  const ids=new Set();
  return rows.every(r=>{
    if(!exact(r,['id','kind','evidenceRef','relatedIds']) || !text(r.id) || ids.has(r.id) || !['allergen_group','substance','intolerance','preference','cross_contact'].includes(r.kind) || !text(r.evidenceRef) || !Array.isArray(r.relatedIds) || !r.relatedIds.every(text))return false;
    ids.add(r.id);return true;
  }) && rows.every(r=>r.relatedIds.every(id=>ids.has(id) && id!==r.id)) && rows.every(r=>r.kind!=='cross_contact' || (r.relatedIds.length>0 && r.relatedIds.every(id=>rows.find(x=>x.id===id).kind==='substance')));
}
export function validRecipe(r) {
  if(!exact(r,['schemaVersion','recipeId','version','dishId','portionSizeId','ingredients','components','nutrition','weights','cost','taxonomy','taxonomyEvidenceRef']))return false;
  if(r.schemaVersion!==1 || !text(r.recipeId) || !integer(r.version) || !text(r.dishId) || !text(r.portionSizeId))return false;
  const refs=a=>Array.isArray(a) && a.every(x=>exact(x,['id','version','netGrams']) && text(x.id) && integer(x.version) && positive(x.netGrams));
  if(!refs(r.ingredients) || !refs(r.components) || r.ingredients.length+r.components.length===0)return false;
  if(!exact(r.nutrition,Object.keys(NUTRIENTS)) || !Object.entries(NUTRIENTS).every(([k,u])=>validMeasurement(r.nutrition[k],u)))return false;
  if(!validWeights(r.weights) || !validTaxonomy(r.taxonomy) || !(r.taxonomyEvidenceRef===null || text(r.taxonomyEvidenceRef)))return false;
  return exact(r.cost,['currency','unit','amount','sourceRef','capturedAt']) && r.cost.currency==='MAD' && r.cost.unit==='centime' && Number.isSafeInteger(r.cost.amount) && r.cost.amount>=0 && text(r.cost.sourceRef) && typeof r.cost.capturedAt==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.cost.capturedAt) && Number.isFinite(Date.parse(r.cost.capturedAt)) && new Date(r.cost.capturedAt).toISOString()===r.cost.capturedAt;
}
export function appendVersion(history,next) {
  if(!Array.isArray(history) || !validRecipe(next) || !history.every(validRecipe))return null;
  if(history.some((x,i)=>x.recipeId!==next.recipeId || x.version!==i+1) || next.version!==history.length+1)return null;
  if(history.some(x=>x.dishId!==next.dishId))return null;
  return freeze(safeClone([...history,next]));
}
export function importDraft(row) {
  if(!plain(row) || !text(row.importId) || !text(row.rowId) || !plain(row.candidate))return null;
  const candidate=safeClone(row.candidate);if(!candidate)return null;
  // Imported status/publish/validation flags cannot set lifecycle state.
  return freeze({schemaVersion:1,importId:row.importId,rowId:row.rowId,state:'draft',candidate,candidateDigest:digest(candidate)});
}
export function reviewForPublication(draft,server,registry,catalog) {
  if(!exact(draft,['schemaVersion','importId','rowId','state','candidate','candidateDigest']) || draft.schemaVersion!==1 || draft.state!=='draft' || !text(draft.importId) || !text(draft.rowId) || !validRecipe(draft.candidate))return {decision:'reject',reason:'invalid_draft'};
  if(!plain(server) || server.identityVerified!==true || server.active!==true || server.liveSession!==true || server.totpVerified!==true || server.riskClear!==true || server.lifetimeBounded!==true || !text(server.actorId) || server.permission!=='food.publish' || server.recipeScope!==draft.candidate.recipeId)return {decision:'deny',reason:'authorization'};
  if(server.reviewedDigest!==draft.candidateDigest || draft.candidateDigest!==digest(draft.candidate))return {decision:'reject',reason:'stale_review'};
  const resolved=resolveRecipeReferences(draft.candidate,catalog);
  if(!resolved)return {decision:'blocked',reason:'unresolved_version_reference'};
  if(!text(draft.candidate.taxonomyEvidenceRef) || resolved.some(e=>!text(e.taxonomyEvidenceRef)))return {decision:'blocked',reason:'taxonomy_evidence_required'};
  if(resolved.some(e=>e.taxonomy.some(row=>!draft.candidate.taxonomy.some(r=>r.id===row.id && digest(r)===digest(row)))))return {decision:'blocked',reason:'inherited_taxonomy_unreconciled'};
  const ns=Object.values(draft.candidate.nutrition);
  if(ns.some(n=>n.state==='unknown' || n.basis==='per100g_raw') || new Set(ns.map(n=>n.basis)).size!==1)return {decision:'blocked',reason:'finished_evidence_required'};
  if(!Array.isArray(registry) || registry.some(x=>!exact(x,['dishId','portionSizeId']) || !text(x.dishId) || !text(x.portionSizeId)))return {decision:'reject',reason:'invalid_registry'};
  if(registry.some(x=>x.dishId===draft.candidate.dishId && x.portionSizeId!==draft.candidate.portionSizeId))return {decision:'blocked',reason:'one_launch_portion'};
  return freeze({decision:'eligible_for_domain_review',recipeId:draft.candidate.recipeId,version:draft.candidate.version,candidateDigest:draft.candidateDigest,runtimeAcceptance:false,foodCertified:false});
}
export const RATIFIED_BANDS=freeze({low_carb:{protein:[25,35],carbs:[10,20],fat:[40,50]},balanced:{protein:[20,35],carbs:[40,55],fat:[20,30]},protein_power:{protein:[40,50],carbs:[35,40],fat:[10,25]}});
export function macroBandMembership(shares,storedBands) {
  const keys=['protein','carbs','fat'];
  if(!exact(shares,keys) || !exact(storedBands,keys) || !keys.every(k=>nonnegative(shares[k]) && shares[k]<=100 && Array.isArray(storedBands[k]) && storedBands[k].length===2 && storedBands[k].every(nonnegative) && storedBands[k][0]<=storedBands[k][1] && storedBands[k][1]<=100))return null;
  // Input is already evidenced kcal shares. Never normalize or infer a complete-day solution.
  return {matches:keys.every(k=>shares[k]>=storedBands[k][0] && shares[k]<=storedBands[k][1]),wholeDayFeasible:null};
}
export function validFoodEntity(e) {
  return exact(e,['kind','id','version','nutrition','taxonomy','taxonomyEvidenceRef']) && ['ingredient','component'].includes(e.kind) && text(e.id) && integer(e.version) && exact(e.nutrition,Object.keys(NUTRIENTS)) && Object.entries(NUTRIENTS).every(([k,u])=>validMeasurement(e.nutrition[k],u)) && validTaxonomy(e.taxonomy) && (e.taxonomyEvidenceRef===null || text(e.taxonomyEvidenceRef));
}
export function appendFoodEntityVersion(history,next) {
  if(!Array.isArray(history) || !validFoodEntity(next) || !history.every(validFoodEntity) || history.some((x,i)=>x.kind!==next.kind || x.id!==next.id || x.version!==i+1) || next.version!==history.length+1)return null;
  return freeze(safeClone([...history,next]));
}
export function resolveRecipeReferences(recipe,catalog) {
  if(!validRecipe(recipe) || !Array.isArray(catalog) || !catalog.every(validFoodEntity))return null;
  const keys=catalog.map(e=>JSON.stringify([e.kind,e.id,e.version]));if(new Set(keys).size!==keys.length)return null;
  const refs=[...recipe.ingredients.map(x=>({...x,kind:'ingredient'})),...recipe.components.map(x=>({...x,kind:'component'}))];
  const resolved=refs.map(r=>catalog.find(e=>e.kind===r.kind && e.id===r.id && e.version===r.version));
  return resolved.every(Boolean) ? freeze(safeClone(resolved)) : null;
}
