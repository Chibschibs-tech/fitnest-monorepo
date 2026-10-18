"""Read-only Fitnest planning validator. Never dispatches a job or changes state."""
import argparse
import json
import math
import re
from pathlib import Path, PurePosixPath

STATUSES = {'planned', 'running', 'checking', 'review', 'blocked', 'contract_accepted', 'verified'}


def validate(plan):
    errors = []
    def check(ok, message):
        if not ok:
            errors.append(message)
    def index(items, label):
        ids = [x.get('id') for x in items]
        check(all(isinstance(i, str) and i for i in ids), label + ': missing id')
        check(len(ids) == len(set(ids)), label + ': duplicate id')
        return {x.get('id'): x for x in items}
    tasks = index(plan.get('tasks', []), 'tasks')
    gates = index(plan.get('gates', []), 'gates')
    caps = index(plan.get('capabilities', []), 'capabilities')
    lots = index(plan.get('lots', []), 'lots')
    sec = set(plan.get('security_ids', []))
    check(plan.get('schema_version') == 1, 'unsupported schema version')
    check(plan.get('repository') == 'Chibschibs-tech/fitnest-monorepo', 'wrong project repository')
    check(set(caps) == {f'CAP-{i:02}' for i in range(1,39)}, '38 capabilities must be retained')
    check(sec == {f'SEC-{i:02}' for i in range(1,33)}, '32 security IDs must be retained')
    check(set(lots) == {f'LOT-{i:02}' for i in range(17)} | {'LOT-X'}, 'full delivery lots must be retained')
    check(plan.get('mode') in {'planning_only','qualified'}, 'invalid execution mode')
    check(isinstance(plan.get('automatic_dispatch_enabled'), bool), 'dispatch flag must be boolean')
    check(not plan.get('automatic_dispatch_enabled') or plan.get('mode') == 'qualified', 'planning-only manifest cannot enable dispatch')
    check({'G-EXECUTOR','G-BUDGET'} <= set(plan.get('global_dispatch_gates', [])), 'mandatory dispatch gates missing')
    for gate_id in plan.get('global_dispatch_gates', []):
        check(gate_id in gates, 'unknown global gate: '+gate_id)
    for id, gate in gates.items():
        check(gate.get('status') in {'pending','approved','rejected'}, id+': invalid gate status')
        if gate.get('status') == 'approved':
            proof = gate.get('evidence', [])
            check(any(isinstance(e,dict) and e.get('kind') == 'approval' and e.get('actor') and e.get('ref') for e in proof), id+': approval evidence required')
            if id in {'G-T013','G-BUDGET','G-RELEASE'}:
                check(any(isinstance(e,dict) and e.get('actor_role') == 'founder' for e in proof), id+': founder approval required')
    for c in caps.values():
        check(c.get('scope') in {'V1','unresolved','explicitly_excluded'}, c['id']+': invalid scope')
        check(all(l in lots for l in c.get('lots',[])), c['id']+': unknown lot')
        if c.get('scope') == 'explicitly_excluded':
            check(bool(c.get('scope_decision_ref')), c['id']+': exclusion needs a decision')
    covered_cap, covered_sec, legacy = set(), set(), []
    for id,t in tasks.items():
        check(t.get('status') in STATUSES, id+': invalid status')
        check(t.get('lot') in lots, id+': unknown lot')
        check(t.get('kind') in {'contract','implementation','verification','handoff','gate'}, id+': invalid kind')
        for k in ['title','owner','outputs','acceptance','source_refs','allowed_paths']:
            check(bool(t.get(k)), id+': missing '+k)
        for path in t.get('allowed_paths',[]):
            p=PurePosixPath(path)
            check(not p.is_absolute() and '..' not in p.parts and path not in {'.','/','*','**'}, id+': unsafe path '+path)
        covered_cap.update(t.get('capabilities',[]));covered_sec.update(t.get('security',[]))
        check(set(t.get('capabilities',[])) <= set(caps), id+': unknown capability')
        check(set(t.get('security',[])) <= sec, id+': unknown security requirement')
        for e in t.get('depends_on',[]):
            check(e.get('task') in tasks, id+': missing dependency '+str(e.get('task')))
            check(e.get('condition') in {'verified','contract_accepted'}, id+': invalid dependency condition')
            if e.get('task') in tasks and e.get('condition') == 'contract_accepted':
                check(tasks[e['task']].get('kind') == 'contract', id+': contract edge must target contract task')
        for g in t.get('start_gates',[]) + t.get('merge_gates',[]):
            check(g in gates, id+': unknown gate '+g)
        for k in ['budget_usd','cost_estimate_usd','cost_reconciled_usd']:
            v=t.get(k)
            check(v is None or (type(v) in {int,float} and math.isfinite(v) and v>=0), id+': invalid '+k)
        check(type(t.get('attempts')) is int and t['attempts']>=0, id+': invalid attempts')
        check(t.get('max_attempts') is None or (type(t['max_attempts']) is int and t['max_attempts']>0), id+': invalid retry bound')
        if t.get('legacy_id'):
            legacy.append(t['legacy_id'])
            number=int(t['legacy_id'][1:])
            if 14 <= number <= 45:
                check('G-T013' in t.get('start_gates',[]), id+': user story cannot bypass T013')
        if t.get('status') in {'verified','contract_accepted'}:
            proof=t.get('evidence',[])
            kinds={e.get('kind') for e in proof if isinstance(e,dict) and e.get('ref') and re.fullmatch(r'[0-9a-f]{40}',e.get('commit',''))}
            check({'review','acceptance'} <= kinds, id+': commit-bound review and acceptance evidence required')
            if t['status']=='contract_accepted':check(t['kind']=='contract',id+': only contracts can be accepted')
    check(set(legacy)=={f'T{i:03}' for i in range(1,49)} and len(legacy)==48, 'exactly 48 unique legacy tasks required')
    check(covered_cap==set(caps), 'unowned capabilities: '+','.join(sorted(set(caps)-covered_cap)))
    check(covered_sec==sec, 'unowned security requirements: '+','.join(sorted(sec-covered_sec)))
    # Cycle detection includes contract edges: a contract must not wait for its consumer.
    visited,active=set(),[]
    def visit(id):
        if id in active:
            errors.append('dependency cycle: '+' -> '.join(active[active.index(id):]+[id]));return
        if id in visited:return
        active.append(id)
        for e in tasks[id].get('depends_on',[]):
            if e.get('task') in tasks:visit(e['task'])
        active.pop();visited.add(id)
    for id in tasks:visit(id)
    if not errors:
        for id,t in tasks.items():
            if t['status'] in {'running','checking','contract_accepted','verified'}:
                check(not blockers(t,tasks,gates), id+': progressed despite unmet dependency/start gate')
    return errors


def blockers(task,tasks,gates):
    missing=[]
    for e in task.get('depends_on',[]):
        status=tasks[e['task']]['status']
        allowed={'verified'} if e['condition']=='verified' else {'contract_accepted','verified'}
        if status not in allowed:missing.append(e['task']+':'+e['condition'])
    for g in task.get('start_gates',[]):
        if gates[g]['status']!='approved':missing.append(g)
    return missing


def readiness(plan):
    errors=validate(plan)
    if errors:return {'valid':False,'errors':errors,'planning_ready':[],'automatic_eligible':[]}
    tasks={t['id']:t for t in plan['tasks']};gates={g['id']:g for g in plan['gates']}
    ready=[];automatic=[];blocked={}
    for id,t in tasks.items():
        if t['status']!='planned':continue
        why=blockers(t,tasks,gates)
        if why:blocked[id]=why;continue
        ready.append(id)
        allgates=plan['global_dispatch_gates']+t['merge_gates']
        budget=t['budget_usd'];cost=t['cost_estimate_usd'];retry=t['max_attempts']
        if (plan['mode']=='qualified' and plan['automatic_dispatch_enabled']
            and all(gates[g]['status']=='approved' for g in allgates)
            and budget is not None and budget>0 and cost is not None and cost<budget
            and retry is not None and t['attempts']<retry
            and t.get('execution_mode')!='supervised_qualification'):
            automatic.append(id)
    return {'valid':True,'tasks':len(tasks),'capabilities':len(plan['capabilities']),'security_requirements':len(plan['security_ids']),
            'planning_ready':ready,'automatic_eligible':automatic,'blocked':blocked,
            'notice':'Planning eligibility is not implementation acceptance or an active scheduler.'}


def main():
    ap=argparse.ArgumentParser();ap.add_argument('manifest',nargs='?',default='docs/delivery/backlog.json');ap.add_argument('--summary',action='store_true');args=ap.parse_args()
    try:result=readiness(json.loads(Path(args.manifest).read_text()))
    except (KeyError,TypeError,ValueError,OSError) as exc:result={'valid':False,'errors':['Invalid manifest: '+str(exc)],'automatic_eligible':[]}
    if args.summary and result.get('valid'):
        result['blocked_count']=len(result.pop('blocked'))
    print(json.dumps(result,indent=2))
    return 0 if result['valid'] else 1

if __name__=='__main__':raise SystemExit(main())
