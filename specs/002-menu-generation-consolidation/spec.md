# Slice 2 — Menu Generation & Kitchen Consolidation

Full V1 requirement source, not an implementation certificate. Product D IDs use `docs/delivery/product-baseline.md`. Plan/contracts/tasks still require the LOT-04/08/11 design packets; no generation implementation is unblocked by importing this spec alone.

**Aligned specification — 18 October 2026, based on 5 September draft and D-052–065/MC-01–08.** Written against the capability map (§3 Menus, §4 Cuisine, §8 arbitration), the Calo report (§9.11, §9.12) and screen catalogue (S02–S07, C01, C03, C07, C08), under decisions D-005, D-009, D-011, D-020, D-035, D-037, D-038. Every rule below carries its status: **[O]** observed on Calo, **[M]** measured on Calo, **[D]** derived, **[F]** FitNest's own choice, **[NC]** needs the founder.

**Scope:** from a published weekly menu and an active subscription to (a) the meals each subscriber will receive on each consumption day and (b) the portions the kitchen must cook for each production date. The subscriber-facing swap, skip and pause are the next slice; this slice only guarantees that they have something to act on.

---

## Purpose

Nothing downstream of payment works without this slice. A subscriber cannot see, swap or skip a meal that was never assigned; the kitchen lead cannot cook from a list of subscriptions. Menu generation is the pivot between the subscription engine and everything operational (map §8: "one cannot swap, skip or move a dish that was never assigned").

Calo taught us two things we did not know on 26 August. First, generation is not a filter on a catalogue — it is a **four-tier constraint model** applied to a menu the kitchen has already composed [O, D-037]: allergens and hard exclusions remove dishes; soft exclusions keep them but warn, **by ingredient name**; taste, spice and favourites only rank. Second, the calorie target is **not** a generation constraint [O]: Calo displays 1116 / 2637 kcal without trying to close the gap — the reachable band comes from the composition, not the goal (C07). D-011 already made the target indicative; this slice keeps it out of the generator entirely.

---

## Vocabulary

- **Weekly menu** — what the kitchen offers for one consumption week: for each plan × meal type × weekday, an **ordered list** of dish sizes. Rank 1 is the default; the rest are what a swap can offer. Composed and published by the kitchen, never by the subscriber.
- **Assignment** — one row: this subscriber, this consumption date, this meal type, this dish size. It carries where it came from (generated, swapped, staff) and whether it is locked.
- **Dish size** — a dish in one portion size with its own kcal and macros [O, D-038]. V1 publishes one size per dish; the model carries several.
- **Exclusion category** — a group the subscriber can avoid (a protein, a carb, an ingredient family), with a strictness: hard or soft [O]. Dishes map to categories through their ingredients.
- **Production date** — the day the kitchen cooks. For consumption J, production is J−1 daytime and delivery J−1 evening. Use the Fitnest Casablanca contract (D-058); do not transpose Qatar time.
- **Cutoff** — the moment after which assignments for a consumption date are frozen and the production count is final.

---

## User scenarios

**The kitchen composes next week's menu**
Given the kitchen lead, signed in as staff
When she opens the coming week
Then she sees one cell per plan × meal type × weekday
And in each cell she orders the dishes the kitchen will offer, the first being the default
And a cell with no dish is visibly incomplete, and the menu cannot be published while one exists

**The kitchen publishes the menu**
Given a complete weekly menu
When the kitchen lead publishes it
Then every active subscription with consumption days in that week receives assignments
And the menu is no longer editable except through explicit staff actions that are recorded

**A new subscriber pays**
Given a person completing payment with a first delivery inside a published week
When payment succeeds
Then durable generation is requested for their eligible consumption days; the app shows payment confirmed/menu preparing until assignments are ready, or a blocked exception if impossible (D-059)
And days in unpublished weeks are shown as "menu coming", never empty or wrong [F, contrary to Calo which generates on demand after personalisation]

**A subscriber with an allergen**
Given a subscriber who declared an allergen in the tunnel
When assignments are generated
Then no dish containing that allergen is ever assigned, in any slot, whatever its rank in the menu
And if no safe whole-day assignment exists inside her plan, the day is blocked with a kitchen/support exception; there is no cross-plan generation fallback (D-064)

**A subscriber with a soft exclusion**
Given a subscriber who marked a category "avoid when possible"
When assignments are generated
Then the generator prefers dishes free of that category
And when a dish carrying it is assigned or offered, the subscriber sees a warning naming the **ingredient**, not the category [O, C03]

**A subscriber with no preferences at all**
Given a subscriber who skipped personalisation
When assignments are generated
Then they receive compatible dishes in menu rank order subject to all hard constraints and whole-day non-repetition
And nothing about their experience says something is missing [O, D-037]

**A subscriber changes a preference**
Given a subscriber editing preferences from their account
When they add a hard exclusion or an allergen
Then all their **unlocked** future assignments are regenerated under the new rules
And incompatible locked days open a food-safety incident stopping affected preparation/handover; no silent regeneration (D-054)

**The kitchen reads tomorrow's production**
Given a production date
When the kitchen lead opens the consolidation
Then she sees, per dish size, how many portions to cook, summed over every subscriber whose current assignment for the consumption date is that dish size
And the count reflects swaps and skips made before cutoff without anyone re-running anything [F]

**Cutoff passes**
Given a consumption date J and its cutoff
When the cutoff moment passes
Then every assignment for J is locked
And the consolidation for J is marked final with its moment
And later changes are refused unless an authorized logistics exception creates an audited amended version; hard safety remains non-overridable

---

## Functional requirements

### Menu authoring

- **FR-M1** A weekly menu is keyed by consumption week and contains one cell per active plan × active meal type × weekday. Plans, meal types and weekdays come from tables, never from code; **meal types are created and activated from the admin** (D-048), and the menu grid, the pricing grid and the swap tabs derive from the active set. The spec holds for any number of meal types.
- **FR-M2** Each cell holds an ordered list of dish sizes. Rank 1 is the default assignment. Lower ranks are the swap pool for that cell.
- **FR-M3** A recipe belongs to a plan only after validated nutrition meets that plan's stored D-065 bands. Distinct recipe adaptations are versioned. A current identical recipe cannot qualify for multiple disjoint bands (MC-05). Sharing across meal types still requires explicit type eligibility.
- **FR-M4** Menu states are draft, published and closed. Publication checks every required plan/type/date cell, validated food data and whole-day feasibility for affected subscribers. Candidate-count minimum is a content rule, never proof that every subscriber has a solution. Blocked days remain explicit exceptions (D-054/064).
- **FR-M5** Editing a published menu is a staff action that is recorded (who, when, which cell, before, after) and triggers regeneration for affected unlocked assignments only.

### Generation

- **FR-G1** Generation runs per subscriber and per consumption day, at these moments: subscription paid, menu published, renewal charged, and any change to the subscriber's hard constraints (FR-G6). It never runs on demand from the client surface.
- **FR-G2** Input per slot: the cell (plan, meal type, weekday), the subscriber's allergens, exclusion categories with strictness, spice ceiling, favourites, and the subscriber's size per meal type (one value in V1, D-038).
- **FR-G3** Tier 1 — **allergens**: any dish size whose ingredients carry one of the subscriber's allergens is removed. Tier 2 — **hard exclusions**: any dish size whose ingredients map to a hard-excluded category is removed. Tier 3 — **soft exclusions**: dishes are kept; each gets a warning list of the ingredient names that map to a soft-excluded category. Tier 4 — **ranking**: among what remains, the generator takes the highest-ranked dish in the cell, preferring no-warning over warning, then favourites, then within the spice ceiling. Ties resolve by cell rank. [O, D-037] **Never the same dish twice on one consumption day for one subscriber**, whatever the size (D-049).
- **FR-G4** Personal calorie targets are indicative and never force meal totals. Plan macro bands constrain recipe membership at publication (D-064/065), which constrains automatic candidates. Client macro target midpoint/rounding convention remains G-MACROS; no silent normalization.
- **FR-G5** Generate only from the subscribed plan for the same consumption day/type. Solve the full day across all quantities with hard filters and no repeated stable dish identity. If impossible, block the day with reason and kitchen/support ownership; never take another plan's dish automatically. Two options or a minimum count cannot guarantee feasibility (D-054/064).
- **FR-G6** Hard profile changes regenerate every affected unlocked day. Soft changes recompute warnings without moving dishes. Unsafe frozen assignments open an incident and stop affected preparation/handover; notify and resolve with traceability, never silently regenerate (D-042/054).
- **FR-G7** Every assignment records its source: `generated`, `swapped` (next slice), `staff`, and the moment. Regeneration never overwrites a `swapped` or `staff` assignment unless the dish is now excluded by a tier 1 or 2 rule; in that case the assignment is regenerated and the subscriber is told [F].
- **FR-G8** Create assignments only for chosen consumption days within published weeks; unpublished days show menu coming, running jobs show preparing, impossible days show blocked. Generation is durable, version-aware and idempotent per subscription/day/type/unit (SEC-17).

### Warnings and display

- **FR-W1** Warnings name actual ingredients in FR/EN; soft avoidance is never labelled allergy. Maintain the expanded food reference data with groups/substances/intolerances/cross-contact; nine historical tunnel selections are not the taxonomy limit (MC-01).
- **FR-W1b** The dish page, on the public site and in the app, carries: plan membership, size, kcal and macros, warning, components with kcal, the full ingredient list with the offending ingredient highlighted, extended nutrition (D-051).
- **FR-W2** The Meals tab shows, per day: the assigned dish sizes with kcal and macros, the day totals, and the target when one exists [O, C01]. The week strip starts at the first consumption date [O].
- **FR-W3** Swap candidates for a slot are **all published dish sizes for that day and meal type across all plans**, after tiers 1–2, with tier-3 warnings, grouped under one heading per plan with the subscriber's plan first [O Calo C03, D-043]. A per-plan surcharge for cross-plan picks is a table value, zero at launch. Multi-ingredient warnings collapse to "X & N more" [O]. This requirement defines the data the next slice consumes; the swap action itself is out of scope here.

### Consolidation

- **FR-K1** For consumption J, production and evening delivery both occur J−1 (D-058). Consolidate current eligible assignment units by recipe/portion version, excluding skipped/paused entitlement according to the accepted mutation contract; retain consumption and physical dates separately.
- **FR-K2** Before freeze, authorized consolidation reflects current assignments. Freeze atomically stores numbered immutable consolidation, picking and label versions; amended versions remain linked and require team acknowledgement. Stale documents cannot masquerade as latest (D-060).
- **FR-K3** Explicit cross-plan swaps count by the actually selected recipe/portion version. Automatic generation has no cross-plan fallback. Plan/type breakdowns reconcile to the same portion total.
- **FR-K4** The consolidation is readable per plan and per meal type as well as in total, because the kitchen cooks by dish, not by plan.

### Cutoff and freeze

- **FR-F1** The cutoff for consumption date J is derived from the delivery slot (D-044): the last-call window opens `offset_after_slot_end` after the **end of the delivery slot on J−2**, the same moment for every subscriber, and lasts `window_duration`; at its close, J is locked. Launch values 1 h and 6 h → with the 18–22 slot, J locks at **05:00 on J−1**. Both values are admin settings; a change applies only to days not yet locked. Before the window, J is editable as usual.
- **FR-F1b** The "time to choose your meals" WhatsApp message (D-039) is sent at the subscriber's **actual** delivery confirmation + `offset_after_slot_end` — the reminder follows the real delivery, the lock follows the slot. Delivery confirmation is an action of the **Delivery** staff role (D-050); it also stamps the "delivered at" time the subscriber sees and locks the delivered day's meals.
- **FR-F2** After cutoff, server mutations fail unless a dedicated default-deny logistics permission allows the scoped action with reason/audit and an amended acknowledged production version. No role or permission bypasses allergens, hard exclusions or food incidents (D-055).
- **FR-F3** The lock moment for each open day is displayed on the day view, in local time ("modifiable jusqu'à lundi 05:00") — Calo shows nothing, and the subscriber discovers the lock by its absence [F, deliberate deviation].

### Data discipline

- **FR-D1** Business values and references are data; typed security/safety state transitions and invariant enforcement remain code/database guarantees. Unknown permissions or incompatible food are refused, never configured away (D-057).
- **FR-D2** Ingredients, allergens, recipe components, sizes, costs and finished nutrition are versioned. Critical unknowns or missing validated finished declarations block publication. Raw contribution calculations are not a finished declaration; import creates drafts only (MC-01–07).
- **FR-D3** Every generation, regeneration, publication, freeze and staff override is an event with actor and moment, readable per subscriber (Calo's Activity History, C11) and per menu.

---

## Key entities

- **Plan** — an identifier-based offer with stored D-065 macro bands for membership and separately defined client target display.
- **Meal type** — breakfast, lunch, dinner, snack; rows.
- **Dish** — name, photo, description, ingredients. **Dish size** — a dish in one portion with kcal, protein, carbs, fat; extended nutrition (fibre, sugar, saturated fat, trans fat, cholesterol) **required from launch** — a dish size without a complete nutrition row cannot be published (D-041).
- **Ingredient** — name per language, allergens it carries, exclusion categories it maps to.
- **Allergen reference** — versioned groups, substances and cross-contact metadata; never limited to nine chips. **Exclusion category** — a selectable avoidance with a kind (protein, carb, taste) and, per subscriber, a strictness.
- **Weekly menu** — a week with a state. **Menu cell** — plan × meal type × weekday inside a menu. **Menu entry** — a dish size in a cell with a rank.
- **Assignment** — subscription × consumption date × meal type × unit ordinal → recipe/portion version; source, moment, locked-at, warnings.
- **Consolidation snapshot** — production date, per dish size count, frozen-at, amended flag.
- **Cutoff configuration** — `offset_after_slot_end`, `window_duration`, per delivery slot; admin settings.

---

## Out of scope for this slice

- The swap, skip and pause actions and their screens — next slice, built on FR-W3 and FR-F2
- Picking lists and labels — they consume the consolidation; separate feature
- Rotation rules and repetition avoidance across weeks — V2 (map §3)
- Multiple published sizes per dish — model ready, D-038
- Rating a delivered dish, add-ons, market — V2 / D-020
- Stock, raw material needs, waste — V2 (map §8)
- Discovery-week messaging around the first delivery — marketing slice

---

## Clarifications and acceptance

Cutoff D-044/058, regeneration D-042/054, own-plan blocking D-064, dynamic types D-048, two weeks D-045 and hard non-repetition D-049 are closed. G-FOOD supplies actual menu content, validated recipes and operating volumes. G-MACROS governs target display; G-MUTATIONS governs skip/pause effects. Do not import Calo dish counts as Fitnest quotas.

Apply SEC-12–17, DB-M01–20 as owned in the backlog: excluded whole day, repeated stable dish across sizes/versions, simultaneous generation and payment, stale job/profile version, swap/freeze race and post-freeze allergy incident. No application tests are claimed executed.

---

## Surfaces and journeys touched

The engine above has one input the subscriber fills (personalisation), one output the subscriber reads (the day view) and one authoring surface for the kitchen. The site and the app are two surfaces with two different journeys, and every parcours below names its surface. Calo's split, now verified on the website (report §17): the website carries acquisition, the public weekly menu and the tunnel; **the observed Calo website did not expose subscriber sign-in** — the subscriber's life is in the app. FitNest builds a complete mobile app from the start and the subscriber lives there only (D-040). J2–J4 are app journeys; J5 is web admin; J6 is the web-to-app handover.

### J1 — Public site: the week's menu, public
Per D-047, the site shows the published week's menu: filter by plan and meal type, one card per dish with photo, kcal and macros, no price per dish, a title that states its status (an overview of what a subscriber receives), and the named producers. It reads the published menu of this slice — never a separate list — so the empty-page problem disappears with the first publication. *(An earlier draft removed this page on the strength of an app observation; corrected 5 Sept, see decisions log.)*

### J2 — Post-payment personalisation, new · surface: app
Nothing in the current site collects what tiers 2–4 need. After payment succeeds, before the Meals view, the subscriber goes through a short, **skippable and resumable** flow modelled on Calo S02–S10 (catalogue section C): protein exclusions · carb exclusions · other ingredients · strictness per exclusion (hard / soft, S05 copy pattern *always avoid / avoid when possible — we'll warn you*) · spice ceiling · free note. Allergens are not re-asked: they come from the tunnel (D-011 tunnel graph). Skipping produces a subscriber with no preferences; generation still runs (FR-G3, D-037). Every answer is re-editable from the account (J4). Copy is written for Morocco: no phrase that suggests the kitchen needs the subscriber's help to get it right.

### J3 — Subscriber day view · surface: app
The subscriber's home after payment is one day at a time (catalogue C01): weekday as the title, the week strip starting at the first delivery, the day's dish sizes with kcal and macros, ingredient-named warnings where a soft exclusion is hit, the day totals against the target when one exists, and the cutoff moment for that day (FR-F3). Unpublished days read "menu coming". Delivered days read "delivered at HH:MM". No Swap or Customize control yet — the next slice adds them to this same view; this slice must leave the space for them without faking them.

### J4 — Account: meal preferences · surface: app
An entry in the account listing the same categories as Calo C08 — allergens, exclusions by kind, spice, size (read-only in V1) — each opening the corresponding step of J2 alone. Saving a hard change triggers FR-G6 and tells the subscriber which days were regenerated and which were locked.

### J5 — Staff: weekly menu authoring · surface: web, admin
For the kitchen lead, inside the admin surface (map §8: the admin panel is V1). A week grid — plans across, meal types and weekdays down — where each cell lists its dish sizes in rank order and can be reordered. Incomplete cells are visibly marked; publish is disabled until none remain. A second page per production date shows the consolidation (FR-K1–K4) with the unresolved slots on top. This is the first staff screen in the product and depends on the staff account model (D-026), which is not in slice 001 — see NC-7.

### J6 — Handover after web payment · surface: web, then WhatsApp and email
Verified on Calo (5 Sept): the subscriber lives in the app, and Calo has no handover gap because payment happens in the app. FitNest sells on the web and lives in the app (D-040), so there is a gap between payment and the first app open. It is closed by three touchpoints, none optional:
1. **Handover screen** right after payment: the full summary (plan, cycle, days, first consumption date, address, slot), store badges or QR, and the sentence *same phone number, no new account to create* (D-013). Never a bare "download the app".
2. **Transactional WhatsApp, automated on templates** (D-039): minimized order confirmation and opaque app link, delivery/reminder and renewal states. Avoid health data and detailed address in message payloads; authenticated surfaces show the full summary (SEC-28).
3. Subscriber management is native (D-040). The authenticated web rescue offers only one-line status, WhatsApp help and cancellation under the same rules (D-061).

### What this changes in the existing code
- The public menu page is rebuilt on the published weekly menu (D-047).
- Navigation: the four-entry target applies to the app; the site keeps a menu entry.
- The post-payment redirect on the web lands on the J6 handover screen; J2 then J3 open in the app.
- J3 is a new route wherever it lives; no existing page is reused.

---

## Needs clarification (additional)

- **~~NC-7~~ Staff surface dependency.** Closed by D-046 and D-050: a staff-accounts slice precedes this one with five roles — Administrator, Kitchen, Delivery, Support, Preparation/labelling — roles and permissions in tables.
- **~~NC-8~~ Where J2 lives on mobile.** Closed by D-040: J2 is an app journey; the mobile foundation precedes the first subscriber.
- **~~NC-9~~ Public menu page.** Closed by D-047: the site shows the published week's menu as Calo's does — filters, photo, kcal, macros, no price per dish — read from this slice's published dishes, with named producers.
- **~~NC-10~~ Where the subscriber lives.** Closed by D-040: app only. The web carries acquisition, plans, tunnel and the J6 handover; no web subscriber space. Consequence: the mobile foundation lands before the first subscriber.

## Integration dependencies

003 authorizes kitchen actions; LOT-04 validates food and import; LOT-05/07 supply entitlement/payment events; LOT-08 owns generation; LOT-11 owns physical delivery/documents; 004 renders states. Contract edges enable isolated fixture work, not a false claim that upstream runtime exists. Plans must include shared DTO/version rules, idempotency, indexes, lock scope, performance budget and degradation behavior.
