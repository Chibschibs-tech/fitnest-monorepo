# Constitutional alignment proposal — 24 October 2026

Target: fitnest-foundation-runtime. Source baseline: 2854038dfe653289c326dd33650a311918f630ad.

The pending constitution gate is a formal integration dependency. PR #5 explicitly records founder-arbitrated amendments dated 8 September 2026; these are preserved, not reopened as new product questions.

## Evidence

- PR #5 v4.3 constitution blob: 5863f764016f1cf123994ffe414e444591cc50b9.
- Canonical product decisions and their historical namespace separation: docs/delivery/product-baseline.md at the baseline above.
- Required five-article mapping: docs/delivery/governance.md at that same baseline.
- Identity verification and risk behavior: specs/001-identity-account-admission/spec.md, notably FR-006/007/038/040.

| Article | Consolidated rule | Authority |
|---|---|---|
| IV | Quantity-aware price cells; monthly reference, weekly fixed daily premium, quarterly percentage; server quote, frozen rule versions and invoice reconciliation | D-003/005/007/018 |
| V | Stable internal identity, bounded rotating sessions, prior independent email proof, no recovery shortcut; separate staff identity and mandatory TOTP | D-052/053/063 and 001 FR-006/007/038/040 |
| VIII | Server-created opaque payment session and processor-hosted card entry; explicit recurring amount/frequency, mandate, opt-out and idempotency | PR5; D-062 |
| X | French/English, native subscriber life, restricted web rescue | PR5; D-033/040/061 |
| XIV | Typed versioned settings; ownership, ledger, hard food safety and payment verification cannot be configured away | PR5; D-054/055/057 |

## Preserved limits

All 14 articles and historical amendment rows remain. The proposal is versioned 4.4.0 to make the alignment explicit; it does not claim a new founder ratification or a completed merge.

No live MAD grid, invoice tie-breaking rule, session duration, device-count limit, recovery-document threshold, payment provider, food validation or production migration is selected. G-SESSION, G-RECOVERY, G-COMMERCIAL, G-PSP, G-T013 and the remaining gates retain their existing meaning. Source backlog flags are not changed.

## Integration sequence

This proposal stays on its own branch while SEC-A's publication is under a controlled execution against the unchanged baseline. Do not move the target branch underneath that job. Before merge, review the diff, pass applicable repository checks and bind any successor execution baseline to attributable integration evidence. A documentation PR is not task acceptance, a database migration approval or V1 delivery.
