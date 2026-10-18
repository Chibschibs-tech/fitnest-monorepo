# Bounded clarifications and launch inputs

These are the remaining questions, not a request to reconfirm settled D decisions. Each is a tracked gate. Work outside the affected scope continues. No agent may fill a business gap by inventing a default and calling it approved.

| Gate | Owner | Concrete resolution needed | Blocking scope |
|---|---|---|---|
| G-CONSTITUTION | Architecture + founder | Integrate PR #5 and explicit amendments in governance.md; preserve history | Merge of dependent behavior |
| G-SESSION | Security + product | ADR for access/idle/absolute limits and risk signals; explicitly reconcile 001 device list vs 004 single active session. Suggested approach for review: multiple revocable devices with bounded sessions; not ratified | Session implementation/UX |
| G-RECOVERY | Security + support | Verified email proof and assisted recovery evidence when both factors lost; no delivery-knowledge shortcut | Risky history access and public auth launch |
| G-COMMERCIAL | Product + finance | Real MAD grid, floor, weekly fee/premium, coupon eligibility/stacking/limits and invoice rounding fixtures | Live prices and monetary coupon implementation |
| G-PSP | Payments + founder | Provider selected, test recurring mandate/webhook/refund credentials and reconciliation contract | Provider-specific payment and launch |
| G-MUTATIONS | Product + finance + operations | Price/date/credit effects for skip/pause/resume, composition/cycle changes, cancellation and refund. Agree before/at/after cutoff examples | Subscriber mutation implementation |
| G-CUSTOMIZE | Product + kitchen | Decide precise component-removal capability, food recalculation and price/production effects; retain CAP-21 until decided | Customize task only |
| G-NAV | Product + UX | Fix remaining navigation destinations with full V1 IA; no invented Market/chat | Final mobile navigation, not core contracts |
| G-MACROS | Product + food lead | Explain midpoint/rounding convention without silently normalizing or changing D-065 bands | Client macro target display only |
| G-FOOD | Food lead | Validated pilot recipes, portions, allergens/cross-contact, costs, processes, packaging, shelf life and images | Food data acceptance and launch |
| G-ROUND | Operations | Assignment, visibility window, correction ownership and useful driver fields | Delivery implementation |
| G-PROVIDERS | Operations + engineering | OTP/WhatsApp/email suppliers, credentials in secret manager, templates, consent and failure runbooks | Live communications; synthetic contracts can proceed |
| G-STORES | Founder + release | Legal entity, store ownership, signing, test distribution and store review | Native public release |
| G-T013 | Founder | Review actual migration diff, local tests, impact, rollback/restore and explicit production-apply decision | 001 phases 3–8 as written; production schema apply |
| G-PRIVACY | Responsible legal owner | Applicable tax/recurring-payment/privacy requirements, retention, processor/location inventory and handling procedures | Public release |
| G-BUDGET | Founder + orchestrator | Approved Fitnest per-task/project ceiling, retry limits and provider billing reconciliation | Paid executor dispatch |
| G-EXECUTOR | Platform engineering + QA | Qualify correct repo/branch, sandbox, credentials, costs, test failures, bounded retries and PR evidence end to end | Automatic dispatch only |
| G-RELEASE | Founder + domain owners | Full V1 acceptance, load/restore proofs, store availability, operating capacity and launch decision | Real customer launch |

Existing clear decisions remain closed: five days, 1/4/12-week cycles, FR/EN, own-plan generation, all-staff TOTP, server pricing, Casablanca dates, manual admission messages, automated transactional messages. T013 is not cleared by a general request to start development.
