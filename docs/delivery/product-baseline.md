# Fitnest V1 product baseline

Updated 2026-10-18. This consolidates the founder's supplied decision journal through 2026-09-11; it does not create a new business model. Implementation and release are not certified by this document.

## Authority and reference namespaces

In the delivery package and newly aligned specs, **D-xxx means the supplied product journal**, summarized below. `REPO-D-xxx` means the historical `docs/decisions-log.md` entry at 99d5e2f. Their numbers collide; do not silently substitute them. FR IDs are always scoped by slice.

| Historical repository entry | Product entry with the same number | Treatment |
|---|---|---|
| REPO-D-023 missing migration history | D-023 capability map | Preserve both; schema inspection is still required |
| REPO-D-024 hardcoded plan names | D-024 V1 scope | Preserve warning; never use plan labels as keys |
| REPO-D-025 affiliation discounts, including (a)/(b)/(c) | D-025 partner acquisition | Preserve identity-aware pricing input, frozen applied discount and no affiliation/coupon stacking; affiliation remains future work |
| REPO-D-026 subscription bridge columns | D-026 staff identity | Preserve the bridge/write obligations in 001 contracts |
| REPO-D-027 fabricated delivery fallback removed | D-027 subscription cohort | Preserve honest errors and cohort definitions |
| REPO-D-052 legacy closure and temporary test admin | D-052 all-staff TOTP | Historical test-only exception does not authorize new production legacy routes |
| REPO-D-053 verified email | D-053 bounded sessions and recovery | Apply both; remove the stale unlimited-session/OTP-only-risk fallback |
| REPO-D-058/059/063 narrower implementation notes | D-058/059/063 full product decisions | Preserve implementation history and apply the full later requirements |

The raw historical log remains append-only. Calo evidence is subordinate to explicit Fitnest decisions; the original capability map was not recovered. CAP IDs are a reconstruction, not a claim that the original file was found.

## Decisions

| ID | Current rule |
|---|---|
| D-001 | Spec Kit: constitution, specify, clarify, plan, tasks, analyze, implement. |
| D-002 | 10% VAT is the recorded commercial assumption; accountant validation remains required, not a legal certification. |
| D-003 | Commercial prices are VAT-inclusive integer centimes; derive invoice net and tax with exact reconciliation. |
| D-004 | Show one VAT-inclusive total at checkout; the invoice carries the breakdown. |
| D-005 | Price cells use plan and meal-type identifiers; quantities contribute to the server calculation. Never key rules on plan names. |
| D-006 | Cycles are 1, 4 and 12 weeks plus a trial day; durations are reference data. |
| D-007 | Monthly is the reference daily price, weekly adds a fixed daily premium, quarterly applies a percentage discount. |
| D-008 | Delivery is paid on the weekly cycle and included from the monthly cycle. |
| D-009 | At least five consumption days per week. |
| D-010 | Use a monetary basket floor, not an imposed combination of meal types. |
| D-011 | Calorie target is indicative (Mifflin multiplied by activity); the goal does not alter it or force meal generation to reach it. |
| D-012 | Eat-healthy skips unnecessary body metrics; skipped weight/target remain absent, not fabricated. |
| D-013 | Customers enter through phone OTP; email is required at the payment summary. Apply verified-email proof from D-053. |
| D-014 | Trial is once per phone-number history, subject to lead time, and never renews automatically. |
| D-015 | Gift days are valued at the beneficiary's active subscription VAT-inclusive daily rate at consumption, including cycle discount. No active subscription means no day redemption and no conversion to MAD. |
| D-016 | Admission notices are manual at launch; this is distinct from D-039 transactional automation. |
| D-017 | Supabase migrations are the only schema canon; remove Drizzle rather than maintain two schemas. |
| D-018 | Price previews are server-calculated, debounced and cached by identity/configuration/version. |
| D-019 | One Fitnest product repository and shared business engine for site, app and staff surfaces. |
| D-020 | One-off purchases, Express Shop and add-ons are future capabilities; keep shared foundations extensible without building them in V1. |
| D-021 | Subscription configuration is a server-persisted account draft, resumable without browser-local state as authority. |
| D-022 | Every competitor observation retains surface, market and observed/derived/assumed status. |
| D-023 | A capability map precedes slice decomposition; the original map was unavailable, so CAP-01–38 is an explicitly reconstructed coverage register. |
| D-024 | V1 includes complete subscriptions, client/staff administration, coupons, referrals, analytics, menu operations, preparation and delivery. Shop, advanced stock, ratings, points and chat assistant are outside V1. |
| D-025 | Capture partner attribution at claim from link, QR or short code; preserve the acquisition fact. |
| D-026 | Staff accounts are separate from customers and use email/password; D-052 adds mandatory TOTP. |
| D-027 | Retention cohorts start at first paid subscription; claim, admission and first delivery are separate funnel/service timestamps. |
| D-028 | Wallet entries carry their units: days and MAD in an immutable ledger. |
| D-029 | Constitution v4.2 was ratified. PR #5 proposes v4.3; its integration is tracked separately, never assumed merged. |
| D-030 | 001 has web-only implementation scope and a separate native slice. Preserve the 48 current task IDs and explicit founder gate T013; D-040 limits which web screens ship. |
| D-031 | Named Calo captures are evidence references, not an instruction to copy the competitor backend. |
| D-032 | Cycle-discount research is closed by D-007; do not reopen it from older Calo notes. |
| D-033 | Launch copy is French and English. |
| D-034 | Minimum five days is confirmed; it is not an open question. |
| D-035 | Configuration start dates use a two-day lead time and 28-day horizon, as configurable values. |
| D-036 | The observed 450 QAR basket was L1 D1; it is historical Qatar evidence, not a Fitnest MAD price. |
| D-037 | Allergens and always-avoid exclusions are hard filters; avoid-when-possible retains named-ingredient warnings; spice and favourites rank. Zero preferences is valid. |
| D-038 | One published portion size per dish at launch; the model supports size-specific recipes and nutrition without a generic multiplier. |
| D-039 | Automate transactional WhatsApp and email (confirmation, delivery, renewal/failure); push is opt-in. Manual admission notices remain D-016. |
| D-040 | Subscriber life is in the native app. The website acquires, configures and takes payment, then hands over; D-061 adds a narrow rescue exit. |
| D-041 | Extended nutrition is required: kcal, protein, carbs, fat, fibre, sugar, saturated fat, trans fat and cholesterol. Unknown is not zero. |
| D-042 | Hard preference changes regenerate affected unlocked days. Soft changes recompute warnings without moving meals. D-054 handles frozen-day safety incidents. |
| D-043 | User-initiated swap sees published candidates of the same consumption day and meal type across plans, own plan first; cross-plan surcharge is stored and zero at launch. The old generation fallback is superseded by D-064. |
| D-044 | For consumption day J, the last-call window starts one hour after the slot end on J−2 and lasts six hours. With 18–22 delivery this freezes at 05:00 J−1; versioned settings govern future unlocked days. |
| D-045 | Maintain a rolling two weeks of published menus; later days explicitly show menu coming. |
| D-046 | All staff account types and permissions precede menu operations. No new operational route relies on temporary founder/legacy access. |
| D-047 | The public weekly menu reads the same published source, filters by plan/type, and has no per-dish sale price. |
| D-048 | Meal types are created/activated in administration, not a fixed code enumeration. |
| D-049 | No repeated stable dish identity in one subscriber consumption day, across all types, quantities, sizes and versions. This is a hard constraint. |
| D-050 | Five launch roles: Administrator, Kitchen, Delivery, Support and Preparation. Kitchen may combine Preparation; Delivery and Support cannot combine Administrator. |
| D-051 | Dish details include components, ingredients, extended nutrition and appropriately named warnings. Preferences are not labelled allergens. |
| D-052 | All staff use TOTP in V1, with recovery and two named administrators. No SMS second factor and no hidden bypass account. |
| D-053 | Stable internal customer identity, bounded sessions, short access tokens, rotating refresh with replay detection and immediate server revocation. After inactivity/risk, require independent previously verified email before historical data. Record and notify number recovery; delivery facts alone prove nothing. |
| D-054 | Test whole-day compatibility on publication, subscription, profile and recipe changes. Impossible days are blocked with a traced resolution. After freeze, unsafe changes stop preparation/handover through an incident; never silently regenerate or override safety. |
| D-055 | Post-cutoff logistics require a dedicated default-deny permission, scope, reason, audit and amended production version. No role overrides hard safety filters. |
| D-056 | Handover links are opaque, short-lived and limited-use, with no phone, session or health data. Authenticate before account disclosure; missing links recover through normal sign-in to the same account. |
| D-057 | Business settings are typed, bounded, versioned and audited. Ownership, ledger integrity, hard food filters and payment verification are non-disableable invariants. Retention has a purpose and duration. |
| D-058 | Consumption date J, production J−1 daytime, delivery J−1 evening are distinct. Use server time and IANA Africa/Casablanca, including date/time transitions. |
| D-059 | Retain upgraded React Native/Expo native builds, Next.js separated public/staff surfaces, PostgreSQL/Supabase, TypeScript modular backend and separate durable worker. Shared versioned contracts; no client database secrets or pricing. Qualify 500 active concurrent users and 5,000 subscribers. No Kubernetes/microservices V1 rewrite. |
| D-060 | Staff landing is a prioritized exception queue with owner, deadline and safe actions. Freeze yields numbered consolidation/picking/labels; amendments require acknowledgement. Reconcile planned/prepared/delivered/failed. |
| D-061 | Web rescue after OTP shows one-line subscription status, WhatsApp help and cancellation under the app's rules. No meals or preferences web portal. |
| D-062 | Auto-renew defaults on only with explicit amount/frequency, versioned acceptance, one-gesture opt-out, valid recurring mandate and no trial renewal. States and due-date idempotency prevent duplicate charges; messages read actual renewal state. |
| D-063 | Close legacy public registration/guest identity server-side, no merge of legacy users with customer_accounts. Verified email is unique. Replace legacy staff login with 003 and track remaining legacy exposure. |
| D-064 | Automatic generation stays in the subscriber's plan; dish membership must satisfy stored plan macro bands. Cross-plan selection is only a deliberate safe swap. Impossible own-plan days remain blocked. |
| D-065 | Stored kcal-share bands (protein/carbs/fat): Low Carb 25–35/10–20/40–50%; Balanced 20–35/40–55/20–30%; Protein Power 40–50/35–40/10–25%. Do not silently normalize midpoint targets; MC clarification remains open. |

## Meals corrections (2026-09-11)

| ID | Current clarification |
|---|---|
| MC-01 | Separate allergen groups, substances, intolerances, preferences and cross-contact. Nine old UI chips do not limit the food reference data; wheat/gluten and crustaceans/molluscs are not interchangeable. |
| MC-02 | Distinguish unknown, trace, bounded and known-zero measurements. Preserve units, basis and evidence; unresolved critical values block validation. |
| MC-03 | Separate raw net quantity, purchase yield and measured finished weight. Raw contributions are not a validated finished-product declaration. |
| MC-04 | Recipes reference ingredient/component versions and frozen costing evidence; corrections create versions and an impact analysis. |
| MC-05 | Test all quantities and the complete day inside the plan. Two candidates are not a feasibility proof; current D-065 bands do not allow one identical recipe to qualify for two plans. |
| MC-06 | Menus are indexed by consumption date with production/delivery J−1 and Casablanca server cutoffs; maintain two published weeks. |
| MC-07 | Spreadsheets create drafts. Server import validates/recalculates, then authorized review publishes. No cell or legacy route bypasses completeness checks. |
| MC-08 | Keep both day and MAD wallet entries; correct days-only screen descriptions. |

## Scope boundaries

The first end-to-end rehearsal is an integration milestone, not the final V1. V1 still includes every CAP entry in `backlog.json`; CAP-21 Customize is explicitly unresolved, not silently removed. Marketing's healthy food and healthy habits vision informs brand/content/partnerships; it does not authorize a sports-booking or social-network feature.

Formal constitution alignment remains a merge prerequisite in `governance.md`. Open operational/content inputs are in `clarifications.md`. No launch date, production migration, provider spend or new pricing grid is approved by the presence of this baseline.
