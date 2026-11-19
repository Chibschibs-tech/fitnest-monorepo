import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Offline triage, never a security acceptance authority or a live probe.
export function inspectInventory(v) {
  const fail = message => { throw new Error(message); };
  if (!v || v.project !== 'fitnest-db' || v.project_ref !== 'blboseqvdmpdrthipxdk'
    || typeof v.captured_at !== 'string' || !Number.isFinite(Date.parse(v.captured_at)))
    fail('Missing inventory identity/timestamp');
  const sections = ['roles','schemas','relations','columns','constraints','policies','functions',
    'sequences','column_grants','triggers','default_acl','migrations','publications','storage_buckets','api_role_settings'];
  for (const key of sections) if (!Array.isArray(v[key])) fail('Missing section: ' + key);
  const findings = [];
  const add = (kind, object, details) => findings.push({kind, object, details});
  const bool = (value, label) => { if (typeof value !== 'boolean') fail('Unknown boolean: ' + label); };
  const identities = new Set();
  function identity(kind, item, signature = '') {
    if (!item || typeof item.schema !== 'string' || !item.schema || typeof item.name !== 'string' || !item.name)
      fail('Invalid ' + kind + ' identity');
    const id = item.schema + '.' + item.name + signature;
    const key = kind + '/' + id;
    if (identities.has(key)) fail('Duplicate ' + kind + ': ' + id);
    identities.add(key); return id;
  }
  for (const required of ['anon', 'authenticated']) {
    const roles = v.roles.filter(r => r.name === required);
    if (roles.length !== 1) fail('Missing or duplicate client role: ' + required);
    for (const flag of ['superuser','bypass_rls','inherit','login']) bool(roles[0][flag], required+'/'+flag);
    if (roles[0].superuser || roles[0].bypass_rls) add('client_role_bypass', required, 'RLS cannot establish isolation for this role');
  }
  for (const r of v.relations) {
    const id = identity('relation', r);
    if (!['r','p','v','m'].includes(r.kind)) fail('Invalid relation kind');
    for (const p of ['anon','auth']) for (const a of ['select','insert','update','delete','truncate']) {
      const key = p + '_' + a; bool(r[key], id+'/'+key);
      if (r[key]) add('client_table_privilege', id, key);
    }
    bool(r.rls,id+'/rls'); bool(r.force_rls,id+'/force_rls');
    if (['r','p'].includes(r.kind) && !r.rls) add('rls_disabled',id,'Review reachability; metadata alone is not an HTTP exploit');
    if (['v','m'].includes(r.kind)) add('view_boundary',id,'Review security_invoker, owner, dependencies and effective grants');
  }
  if (!v.relations.some(r => r.schema === 'public')) fail('Public relation inventory is empty');
  for (const s of v.sequences) {
    const id = identity('sequence',s);
    for (const key of ['anon_usage','auth_usage','anon_update','auth_update']) {
      bool(s[key],id+'/'+key);
      if (s[key]) add('client_sequence_privilege',id,key);
    }
  }
  for (const f of v.functions) {
    if (typeof f.identity_arguments !== 'string') fail('Missing function signature');
    const id = identity('function', f, '('+f.identity_arguments+')');
    for (const key of ['security_definer','anon_execute','auth_execute']) bool(f[key],id+'/'+key);
    if (f.anon_execute || f.auth_execute)
      add(f.security_definer ? 'client_definer_function' : 'client_function',id,'Review body, owner, search_path and all reachable objects');
  }
  if (v.default_acl.length) add('default_privileges','migration_owners','Review global PUBLIC and per-creator defaults; table closure does not close future objects');
  if (v.column_grants.length) add('column_grants','columns','Object-level denial alone is insufficient');
  for (const b of v.storage_buckets) {
    if (typeof b.name !== 'string' || !b.name) fail('Missing bucket identity');
    bool(b.public,'bucket/'+b.name);
    if (b.public) add('public_bucket',b.name,'Check approved public media scope separately from private customer data');
  }
  if (v.publications.length) add('realtime_publication','public','Publication membership requires channel authorization and revocation tests');
  return {
    scope:'captured_metadata_only',capturedAt:v.captured_at,accepted:false,
    counts:Object.fromEntries(['relations','columns','constraints','policies','functions','sequences','triggers','publications','storage_buckets'].map(k=>[k,v[k].length])),
    findings,
    unknowns:['Configured Data API exposed schemas and enabled setting (absent SQL setting is unknown)',
      'Actual deployed application runtime and migration credential roles',
      'HTTP, GraphQL, Storage and Realtime reachability and cross-account authorization',
      'Disposable-stack migration replay and real-role writes/defaults',
      'Session revocation guarantees belong to SEC-C/T010']
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Supply a metadata JSON file');
  console.log(JSON.stringify(inspectInventory(JSON.parse(await readFile(process.argv[2],'utf8'))),null,2));
}

