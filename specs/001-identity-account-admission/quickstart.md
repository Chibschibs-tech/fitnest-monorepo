# Validation runbook — 001

Status: acceptance plan only; no application test execution is claimed by the baseline synchronization. Record exact commit, runtime/dependency versions, local database reset/migration output and test results in the implementation PR. Use synthetic accounts and test providers, never production credentials.

## Before user stories

T001–T003 must provision the selected pinned runner and local Supabase. S001-SEC-B inventories existing schema; S001-SEC-C proves session design. T004–T008 draft/apply migrations locally only and verify actual database roles. Present the concrete evidence at T013; no phases 3–8 implementation starts before that gate. Do not mark this runbook passed because a mock returned success.

## Acceptance matrix

| Scenario | Required result |
|---|---|
| OTP concurrent verify, replay, expiry and distributed quota | One valid consumption; no duplicated identity, enumeration or SMS budget bypass |
| Fresh claim in queue/direct mode; repeated cleared claim | One account, immutable source, correct admission timestamp |
| Recycled number/risky new device | No historical account disclosure before independent proof |
| Verified email collision and reused challenge | Generic rejection; no overwrite or disclosure; payment waits for verification |
| Queue cap zero/lowered/mid-week | Honest paused/conditional estimate with remaining capacity, no division by zero |
| Two admissions for one remaining weekly place | Exactly one succeeds, cap preserved transactionally |
| Queue disable concurrent with claim and retry | Every applicable account admitted once with notice and audit |
| Dormancy four weeks and reactivation | No claim expiry/requeue or blame notification |
| Revoked access token still cryptographically valid | API plus every exposed direct data/RPC/realtime path denies it |
| Single/bulk disconnect from risky new device | Same independent-proof rule, no one-by-one bypass |
| Finite idle/absolute expiry and refresh replay | Matches accepted ADR, including documented provider replay exceptions |
| Staff deactivation, role change, fake cookie and cross-origin mutation | Existing credentials fail next request when unauthorized |
| Referral at claim/payment/actual first delivery | Reward only on authoritative completed delivery |
| Duplicate delivery and simultaneous referrals at cap-minus-one | No duplicate or over-cap reward; no billing-date shift |
| Correction/reconfirmation | Historical event retained, no second reward, compensation separately traced |
| Wallet read/immutability/privileges | Own balances by unit; runtime cannot UPDATE/DELETE/TRUNCATE or alter triggers |
| Day redemption without active subscription | Refused, no day-to-money conversion (integrated billing acceptance) |
| Cohorts +4/+8/+12 weeks across pause/end/renewal | Reconstructed from first-paid-subscription and historical validity intervals |
| Web/native scope | Web acquisition/queue/payment/rescue only; native handoff obligations T033/038/045 verified by mobile release |
| FR/EN and errors | Both locales, honest pending/failure states with recovery action |

Finish with strict type checking, unit/integration CI against provisioned local database and application build. Full V1 then runs payment→activation→menu→freeze→preparation→delivery→wallet/notifications and load/restore gates in the full backlog. This slice alone cannot authorize launch.
