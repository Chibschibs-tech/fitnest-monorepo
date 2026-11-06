# B04-C — food data contract and isolated reference
Status: partial design proposal. Runtime acceptance, production readiness and food certification are false.

## Authority and scope
Source: Chibschibs-tech/fitnest-monorepo at 46599153870b62421ff20568b0dd8679222a297b; semantic plan 2854038dfe653289c326dd33650a311918f630ad. B04-C depends on B01-C contract acceptance; G-CONSTITUTION remains its merge gate.

The schema map comes from the preserved 2026-10-26 SEC-B capture, not a live database inspection. B04-C.json records the exact capture blob and gaps in meals, compose_components and meal_plans. No migration, privileged connection, production write or external call is performed here.

This increment converts six product requirements into concrete DTO constraints and executable design fixtures. It is not full B04-C semantic acceptance: actual import transport, server recalculation, evidence qualification, DB-M database fixtures, persistence and complete-day feasibility remain outstanding.

## Measurement contract
All nine required nutrition fields are present with explicit unit, basis and evidence. States remain distinct: unknown, known, known_zero, trace and bounded. Unknown carries a reason and null evidence and cannot carry a numeric value. Known zero requires evidence; null/missing never becomes zero. Trace records a positive upper bound; bounded records ordered nonnegative lower/upper bounds.

Raw-per-100g measurements may exist in ingredient drafts, but finished recipe review requires a single consistent finished basis. Unknown or mixed/raw finished declaration blocks review. Trace and bounded states preserve uncertainty; they are not automatically certified acceptable for a dietary or safety decision.

The reference validates structure and bounds only. It does not calculate nutrient energy, convert raw contributions into a finished declaration, determine allergen safety or supply dietary advice. Synthetic test recipes deliberately use toy nutrient values, not real or physically validated food data.

## Quantities and versions
Raw net quantity, purchased gross quantity/yield and independently measured finished batch weight remain separate. The narrow sourcing fixture checks rawNet=purchaseGross*yield within its explicit floating tolerance; it does not imply cooking yield, nutrient retention or a generic portion multiplier.

Ingredient/component versions and recipe versions are append-only. Recipe rows reference exact kind/id/version entries; a missing, duplicate or substituted version cannot resolve. Snapshots are cloned and deep-frozen in this reference, including the MAD integer-centime costing evidence. Real persistence requires immutable database records, scoped authorization and transactional writes. Renaming a recipe never changes stable dish identity; one launch portion per dish is checked against a supplied authoritative registry.

## Taxonomy and inherited hazards
Allergen groups, substances, intolerances, preferences and cross-contact are distinct kinds. IDs are references, not UI labels or a nine-chip enumeration. Cross-contact references substances. Missing assessment evidence stays unresolved even when the row array is empty.

A recipe must retain each resolved ingredient/component taxonomy row with the same identity, kind, evidence and links; removing or relabelling an inherited substance as a preference blocks review. This conservative propagation check is not an allergen completeness assessment. Food-lead review and source evidence remain required by G-FOOD.

## Spreadsheet boundary and review
importDraft always creates state=draft and a canonical SHA-256 candidate digest. Imported status/published/approved/serverValidated flags cannot authorize publication; unknown candidate fields fail strict validation.

reviewForPublication requires independent trusted server facts: verified identity, active staff, live session, verified TOTP, risk clearance, bounded lifetime, actor, food.publish permission, exact recipe scope and matching review digest. These arguments are synthetic fixtures representing server records. They must never be deserialized from a client request as authority. The implementation must derive them from actual authorization and session checks.

The result eligible_for_domain_review is deliberately preliminary. It does not publish, certify food or claim acceptance. Before actual publication, the server must expand referenced quantities/components, recalculate and reconcile evidence on the correct basis, validate finished nutrition and inherited hazards, review the exact draft/version, then persist the publication and audit atomically. No test here stands in for these missing runtime steps.

## Macro bands
RATIFIED_BANDS preserves D-065 exactly:
- Low Carb: protein25–35, carbs10–20, fat40–50.
- Balanced: protein20–35, carbs40–55, fat20–30.
- Protein Power: protein40–50, carbs35–40, fat10–25.

These are reference snapshots of ratified bands, not business keys keyed on a translated plan name. Production uses plan identifiers and stored band versions. macroBandMembership accepts explicit stored bands and performs component-wise inclusive range checks only, without normalizing the input or band midpoints. Test shares may sum to90 or75 to expose that limited check; such inputs are not physically validated calorie declarations. wholeDayFeasible is always null. Band matching alone proves neither valid calorie reconciliation nor complete-day feasibility for all quantities. G-MACROS stays unresolved for the display/rounding convention.

## Verification and remaining delivery
Run: node --test specs/food/contracts/food-reference.test.mjs.

52 synthetic reference tests passed locally after independent review corrections: mandatory live authorization facts, inherited taxonomy evidence/propagation, and strict calendar timestamp round-trip. This result is design-model evidence only. Root still needs to bind published files to the exact commit, obtain independent final review and submit the partial result to Ekwip without claiming runtime or complete contract acceptance.

No changes to SEC-A/B/C, B01-C, backlog dependencies, orchestration, profiles or production gates. G-FOOD, G-MACROS and G-T013 remain explicit.
