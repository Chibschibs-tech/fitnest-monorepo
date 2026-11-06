# Independent product review — 31 October 2026

Disposition: suitable for publication as a reviewed design reference and product preparation packet. No B02-C task acceptance, production readiness, provider MFA, SQL concurrency or deployed-runtime certification is granted.

## Final checks reproduced by independent reviewer
- B02 reference suite: 132 tests passed, zero failures. Sequential design-model examples only.
- Foundation source verifier: 13 static checks passed. Eight source Git blobs and the PR149 workflow blob recompute correctly. CI/install/Docker/Auth/live receipts remain unknown.
- Preparation JSON parses. B01-I has 11 obligations and preserves B01-C contract_accepted plus T001/T002/T003 verified. Next B04-C/B11-C/B12-C each preserve B01-C dependency and G-CONSTITUTION. Source graph assertions were compared with the supplied pinned-source context, not a new live ledger read.

Commands reproduced:
- node --test specs/003-staff-accounts-admin-shell/contracts/staff-reference.test.mjs
- node verify-source.mjs (foundation evidence folder with its source-snapshot.json)

## Findings corrected before this disposition
1. Recovery completion now requires a bounded valid stored challenge expiry and matching account binding. Missing/NaN expiry and foreign stored account deny without mutation.
2. Revision and epoch counters must be nonnegative safe integers capable of increment. Matching malformed revisions no longer authorize a transition.
3. Bootstrap verifies invitationAccountId and invitationManifestId against the enrolling account and persisted manifest. A verified invitation for A cannot enroll B.
4. Command identifiers must be nonempty strings. Malformed identifier regressions assert unchanged state.
5. Authorization requires explicit trusted riskCleared/lifetimeValid facts; absence or false denies. Real risk/time/provider verification remains an integration obligation.
6. Root spotcheck: proof.used must be strictly false. Missing/null/string/numeric states deny; five regressions added.

## Reviewed B02 bytes (SHA-256)
| File under specs/003-staff-accounts-admin-shell/contracts/ | SHA-256 |
|---|---|
| B02-C.json | ab07f030fc44266b5bab9fc390beaf36a10cae02d15f11b2bee56de17d60a3cd |
| staff-design.md | 05d9f7d92ffbafcca34b7cf918660ae2a5436a3e6dd851f270ac30b5a3a30ef8 |
| staff-reference.mjs | 7f8a4db222676f7d802421d72dbab1ed77efc6f3edcb4e35e79cf7a805d1579c |
| staff-reference.test.mjs | e4634cb4d813dd71747c40931f2cf48403938ffb2578e4d8dc71dc2df179aad7 |

## Remaining evidence boundaries
Trusted verification facts are fixtures, never client claims. Production adapters, transactional proof consumption/outbox, crash/concurrency behavior, origin/cookies, every-channel authorization and real deployment remain unproved. The model is not a complete input-validation or authentication library. Full B02-C semantic qualification still belongs to the reviewed platform acceptance path.

Foundation report is static-only and must not grant receipts. Reuse PR149; reconcile T002 .env.example scope through Ekwip. Preparation matrices contain not_run cases, not executed tests, and do not open B01-I prerequisites. SEC-A/B/C and B01-C files are untouched by this review.
