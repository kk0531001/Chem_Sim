# Answer key + explanation verification

plan2.md §1, "Verify every answer key + explanation pair". 853 MC + 119 written,
read by hand: does `a` point at the right option, and does `why` argue for that
option and get its arithmetic right?

Mechanical passes that run first, so the hand pass only reads what they can't
decide:

- `scripts/audit-content.mjs` check 7 — a `why` that computes a non-keyed
  option's value. Fires only when every option is a bare number (~160 MC).
- `scripts/check-keys.mjs` — a distractor that echoes the `why` more than the
  key does. Covers the ~690 prose-option MC. 13 flagged, all read, all correct.

## Verified by hand

| Bank | n | Date | Defects |
|---|---|---|---|
| quantum | 25 | 2026-08-14 | none |
| bonding | 25 | 2026-08-14 | none |
| stoich | 25 | 2026-08-14 | none |
| thermo1 | 25 | 2026-08-14 | none |
| thermo2 | 25 | 2026-08-14 | none |
| equilibrium | 25 | 2026-08-14 | none |
| gases | 25 | 2026-08-14 | gas-003 / gas-011 missing units; gas-011 stem said STP while gas-001 defines STP as 1 bar |
| aek | 25 | 2026-08-14 | none |
| nuclear | 25 | 2026-08-14 | none |
| organic1 | 25 | 2026-08-14 | none |
| organic2 | 25 | 2026-08-14 | og2-017 typo "tribromimates" |
| labdata | 25 | 2026-08-14 | lbd-008 `why` illustrated "nearest 0.01 mL" with a 0.05 reading |
| analytical | 25 | 2026-08-14 | ana-019 stem ungrammatical |
| spectroscopy | 25 | 2026-08-14 | spe-024 stem said "two compounds" with three nominal-60 options |
| advinorganic | 25 | 2026-08-14 | none |
| biophys | 25 | 2026-08-14 | none |
| periodicity | 25 | 2026-08-14 | none |
| polymers | 25 | 2026-08-14 | none |
| physchem | 27 | 2026-08-14 | none |
| organic3 | 26 | 2026-08-14 | og3-012 stem asked for a "site", keyed option is a method |
| coordchem | 26 | 2026-08-14 | none |
| labtech | 29 | 2026-08-14 | none |
| structure | 29 | 2026-08-14 | str-018 trap sentence described a different molecule (seven carbons) |
| bankPart1 | 110 | 2026-08-14 | p1-atomic-010 `why` quoted 0.35 shielding while its option claimed +1/step; p1-thermo-010 `why` assumed a doubling the stem never states |
| bankPart3 | 31 | 2026-08-14 | none |
| olympiadPaper1–5 (Part A) | 125 | 2026-08-14 | mock1-a-006 `why` called buffer capacity a number of moles; dilution changes concentration, not moles |

Every numeric `why` above was recomputed, not skimmed: th1-011 (−890.3 kJ),
th1-014 (0.557 J/g·K), th1-025 (−110.5 kJ), th2-011 (109 J/mol·K), th2-012
(1113 K), th2-016 (−11.4 kJ/mol), th2-023 (5.76 J/K), equ-008 (4×10⁻⁹),
equ-016 (1.8×10⁻⁹ M).

All 853 MC are verified. bankCCO and bankIntegrated contribute no MC.

## Remaining

The 119 written free-response problems (bankPart2, bankCCO, bankIntegrated,
and the Part B of olympiadPaper1-5).
