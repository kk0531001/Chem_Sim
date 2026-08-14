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

Every numeric `why` above was recomputed, not skimmed: th1-011 (−890.3 kJ),
th1-014 (0.557 J/g·K), th1-025 (−110.5 kJ), th2-011 (109 J/mol·K), th2-012
(1113 K), th2-016 (−11.4 kJ/mol), th2-023 (5.76 J/K), equ-008 (4×10⁻⁹),
equ-016 (1.8×10⁻⁹ M).

## Remaining

gases, aek, nuclear, organic1, organic2, labdata, analytical, spectroscopy,
advinorganic, biophys, periodicity, polymers, physchem, organic3, coordchem,
labtech, structure — plus the exam banks (bankPart1/2/3, bankCCO,
bankIntegrated, bankOlympiad, olympiadPaper1–5).
