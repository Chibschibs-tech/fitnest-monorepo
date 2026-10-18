# Full V1 acceptance and screen coverage

This is a test specification, not a report of passing application tests. Run against exact versioned code, schema, settings and synthetic fixtures. Requirements derive from the supplied Calo catalogue, D-001–065, MC-01–08 and the food-data review. Competitor behavior is observation; Fitnest decisions prevail.

## Food/database acceptance

| ID | Situation | Required result | Primary owner |
|---|---|---|---|
| DB-M01 | Unknown/duplicate ingredient in import | Row/field error; no substitution by zero | LOT-04 |
| DB-M02 | Missing cost vs explicitly documented zero | Missing remains incomplete; known zero requires evidence | LOT-04 |
| DB-M03 | Grams with litre cost, absent/present density | Reject dimension mismatch, then calculate with explicit density and yield | LOT-04 |
| DB-M04 | Ingredient/price corrected after recipe validation | Old snapshot unchanged; new version/current price distinct | LOT-04 |
| DB-M05 | Child insert/delete races parent validation | No validated parent becomes mutable or incomplete | LOT-04 |
| DB-M06 | Component belongs to another recipe | Composite relationship constraint rejects it | LOT-04 |
| DB-M07 | Mustard inside sauce with matching customer allergy | Trace through component to dish; never assign incompatible portion | LOT-04/08 |
| DB-M08 | Ambiguous historical wheat/shellfish values | Preserve raw source, no invented taxonomy mapping, explicit unresolved handling | LOT-04 |
| DB-M09 | Raw estimate exists, finished declaration absent | Publication blocked | LOT-04 |
| DB-M10 | Recipe outside plan/type | Menu publication rejects it; cross-plan swap only through its explicit contract | LOT-04/10 |
| DB-M11 | Several options but no compatible complete day | Block with diagnostic, no cross-plan generation fallback | LOT-08 |
| DB-M12 | Two versions/sizes of same stable dish in one day | Reject repetition across every quantity/type | LOT-08 |
| DB-M13 | Two swaps or swap vs freeze | One coherent committed version, no lost mutation/repetition | LOT-10/11 |
| DB-M14 | Monday consumption, Sunday delivery and time transition | Civil dates and cutoff follow versioned Casablanca rule | LOT-01/08/11 |
| DB-M15 | Unsafe allergy/recipe correction after freeze | Incident stops affected preparation/handover; preserve original document | LOT-11 |
| DB-M16 | Same file/job replay | No duplicate recipe version, assignment or document | LOT-04/08 |
| DB-M17 | Client A reads B's day or supplier cost | Denial through API and any exposed direct path | LOT-01/04/08 |
| DB-M18 | Legacy publication path or stale production document | No bypass; outdated document cannot authorize current handover | LOT-04/11 |
| DB-M19 | Production, picking and labels | Exact reconciliation to frozen assignment units; no double counting | LOT-11 |
| DB-M20 | Concurrent publication and day consultations under load | Measure latency and queue lag while preserving DB-M04–19 invariants | LOT-14 |

## Calo reference to Fitnest coverage

The source catalogue's market/surface labels remain attached to each observation. No QAR prices, competitor provider, dish quota or assumed backend behavior becomes a Fitnest requirement. These are reference IDs, not a pixel-copy brief.

| Reference screens | Fitnest treatment | Coverage |
|---|---|---|
| T01 | Zone first, full address later | CAP-03 |
| T02 | Market not in V1; subscription product | D-020/024 |
| T03–T10 | Conditional goals/body metrics, nullable target and corrected allergy reference | CAP-07 |
| T11–T12 | Identifier-based plans/quantities and monetary floor | CAP-08 |
| T13–T14 | Dish reassurance/favourites use shared validated data | CAP-02/14 |
| T15–T19 | Chosen weekdays/cycle/start date/explicit slot/address | CAP-03/08 |
| T20/P01 | VAT-inclusive quote, coupon/wallet and selected PSP; Tap is only a competitor observation | CAP-09/10/11 |
| S01–S10 | Native skippable/resumable preferences; server-event generation | CAP-14/18 |
| I01 | No-subscription native state and conversion entry | CAP-13 |
| I02–I04 | Shop/bundles/retail filters deferred | D-020/024 |
| I05/C10 | Human WhatsApp support; no forced chat SDK or LLM assistant | CAP-37 |
| I06–I07/C04 | Native account plus complete subscriber mutations | CAP-13/23/24/27 |
| C01/C15 | Day, dishes, extended nutrition and indicative target | CAP-19 |
| C01 Customize observation | Retained as explicit contract clarification, not silently excluded | CAP-21/G-CUSTOMIZE |
| C02/C05 | Skip/address/slot/pause/resume with approved monetary/date effects | CAP-22 |
| C03 | Deliberate cross-plan swap; initial generation stays own-plan | CAP-20 |
| C06/C12 | Fitnest days/MAD and first-delivery referral; no competitor 20% or QAR rules | CAP-25/26 |
| C07/C08/C19 | Targets/preferences/plan change, D-065 bands preserved | CAP-14/23 |
| C09 | Help tied to actual product; no invented required video format | CAP-13/37 |
| C11 | Distinct action time/effective date in history | CAP-27 |
| C13/C18 | Mandate, payment methods, truthful recurring state | CAP-24/33 |
| C14/C16 | Authorized deduplicated delivery/reminder push | CAP-33 |
| C17 | Rich dish detail included; Add more/cart excluded V1 | CAP-15/19 |
| W01/W02 | Brand site and public menu share published source | CAP-01/02 |
| W03 | Historical competitor landing, no extra Fitnest surface implied | D-040/047 |

## End-to-end release cases

| ID | Path | Evidence |
|---|---|---|
| E2E-01 | Zone → OTP/admission → server draft/quote → verified email → test payment → activation → native handover → assigned day → delivery → history | Same owner/quote/paid amount; real server states, no success fallback |
| E2E-02 | Eat healthy and skipped metrics | Nullable target renders correctly everywhere; no fabricated body data |
| E2E-03 | Validated food → two published weeks → own-plan generation | Impossible whole day is blocked and assigned to operations |
| E2E-04 | Swap races another swap/freeze | Safe unique day, one committed version, rejected conflict visible |
| E2E-05 | Hard profile change before/after freeze | Open days regenerate; frozen unsafe scope is stopped by incident |
| E2E-06 | Skip/pause/resume/composition/cycle/address/slot changes | Action/effect dates, charges/credits, production and renewal match approved policy |
| E2E-07 | Missing mandate, declined/late webhook, timeout and concurrent cancellation | No duplicate charge, invalid activation or misleading renewal message |
| E2E-08 | Delivery double tap/retry/correction/reconfirmation | One first-delivery reward and deduplicated communications |
| E2E-09 | Every staff role and resource boundary | Complete legitimate mission; deny other resources; deactivate at next request |
| E2E-10 | Offline/account change/revocation/expired relay/old notification | No cross-account leakage; stale data explicit; recovery available |
| E2E-11 | Freeze/amendment/ack/picking/labels | Matching quantities and current version; stale document rejected |
| E2E-12 | End-of-day reconciliation | Planned/prepared/delivered/failed and financial effects agree without hidden manual repair |
| E2E-13 | Isolated restore and worker replay | No accidental real messages/charges; dedupe/erasure/recovery proven |

## Qualification targets and definition of done

Qualify **5,000 subscribers and 500 active concurrent users**. Use staged 50/100/250/500 traffic and a separately specified arrival-rate test so slowdown cannot artificially reduce load. Combine day reads, pre-cutoff swaps, publication/generation and renewal events; check database invariants after the run. Record environment, payload, think time, DB/query/queue metrics and Morocco device/network measurements.

Initial targets from the architecture review, to fix in LOT-14's protocol: day API p95 <=500 ms/p99 <=1.5 s; durable mutation p95 <=800 ms excluding provider time; useful native content <=2.5 s for 95% of the protocol; unexpected failures <0.5%. Generation deadline, job age, RTO/RPO and availability budget must be set against kitchen operations before qualification. These are targets, not measured capacity or vendor guarantees.

A capability is done when its behavior/errors, FR/EN, owner/role tests, migration/compatibility, exact-commit review, real integration, observability, recovery and costs are evidenced. Release requires all confirmed V1 CAPs, explicit resolution of scope ambiguities, no blocking identity/payment/permission/food defect, operational rehearsal, restore proof, qualified suppliers and available native app. Lesser residual risks have an owner, deadline and attributable acceptance.
