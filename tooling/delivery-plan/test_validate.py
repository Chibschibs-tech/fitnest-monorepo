import copy
import json
from pathlib import Path
import unittest
from validate import validate, readiness

ROOT=Path(__file__).resolve().parents[2]

class PlanningGuards(unittest.TestCase):
    def setUp(self):
        self.plan=json.loads((ROOT/'docs/delivery/backlog.json').read_text())

    def task(self,id):return next(t for t in self.plan['tasks'] if t['id']==id)
    def rejects(self,fragment):self.assertTrue(any(fragment in x for x in validate(self.plan)),validate(self.plan))

    def test_baseline_complete_but_never_dispatches(self):
        result=readiness(self.plan)
        self.assertTrue(result['valid'],result)
        self.assertEqual(result['automatic_eligible'],[])
        self.assertIn('S001-SEC-A',result['planning_ready'])
        self.assertNotIn('S001-T018',result['planning_ready'])

    def test_cycle_blocks_every_dispatch(self):
        self.task('B01-C')['depends_on']=[{'task':'B01-I','condition':'verified'}]
        self.rejects('dependency cycle')
        self.assertEqual(readiness(self.plan)['automatic_eligible'],[])

    def test_unknown_dependency(self):
        self.task('B01-C')['depends_on']=[{'task':'not-a-task','condition':'verified'}]
        self.rejects('missing dependency')

    def test_contract_does_not_substitute_runtime(self):
        self.task('B02-I')['depends_on']=[{'task':'B01-I','condition':'contract_accepted'}]
        self.rejects('contract edge must target contract')

    def test_no_capability_disappears(self):
        for t in self.plan['tasks']:t['capabilities']=[c for c in t['capabilities'] if c!='CAP-21']
        self.rejects('unowned capabilities: CAP-21')

    def test_no_security_requirement_disappears(self):
        for t in self.plan['tasks']:t['security']=[s for s in t['security'] if s!='SEC-04']
        self.rejects('unowned security requirements: SEC-04')

    def test_preserve_exact_48_task_ids(self):
        self.task('S001-T045')['legacy_id']='T044'
        self.rejects('48 unique legacy')

    def test_general_go_cannot_bypass_t013(self):
        self.task('S001-T018')['start_gates']=[]
        self.rejects('cannot bypass T013')

    def test_approval_needs_attribution(self):
        gate=next(g for g in self.plan['gates'] if g['id']=='G-T013')
        gate.update(status='approved',evidence=[{'kind':'approval','ref':'conversation:go','actor':'agent'}])
        self.rejects('founder approval required')

    def test_checked_box_is_not_evidence(self):
        self.task('B01-I')['status']='verified'
        self.rejects('commit-bound review and acceptance')

    def test_fabricated_completion_cannot_ignore_dependencies(self):
        t=self.task('B01-I');t['status']='verified'
        t['evidence']=[{'kind':k,'ref':'test:'+k,'commit':'a'*40} for k in ['review','acceptance']]
        self.rejects('progressed despite unmet')

    def test_scope_escape(self):
        self.task('B01-C')['allowed_paths']=['../other-client/']
        self.rejects('unsafe path')

    def test_invalid_cost(self):
        self.task('B01-C')['budget_usd']=float('nan')
        self.rejects('invalid budget_usd')

    def test_planning_mode_cannot_enable_execution(self):
        self.plan['automatic_dispatch_enabled']=True
        self.rejects('planning-only manifest cannot enable dispatch')

    def test_unknown_budget_does_not_become_free(self):
        self.plan['mode']='qualified';self.plan['automatic_dispatch_enabled']=True
        for g in self.plan['gates']:
            g.update(status='approved',evidence=[{'kind':'approval','actor':'test-founder','actor_role':'founder','ref':'fixture'}])
        self.assertEqual(readiness(self.plan)['automatic_eligible'],[])

    def test_wrong_repository_fails(self):
        self.plan['repository']='another-owner/other-client'
        self.rejects('wrong project repository')

if __name__=='__main__':unittest.main()
