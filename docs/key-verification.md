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

| bankPart2 (written) | 75 | 2026-08-14 | 7 defects, all fixed |
| bankCCO (written) | 12 | 2026-08-14 | none |
| bankIntegrated (written) | 12 | 2026-08-14 | 2 defects, both fixed |
| olympiadPaper1–5 (Part B) | 20 | 2026-08-14 | none |

All 853 MC and all 119 written problems are verified. bankCCO and
bankIntegrated contribute no MC.

One cross-file inconsistency left deliberately: p2-bonding-003(c) and
p2-descriptive-003(c) quote different AgCl lattice-energy figures (−770/−905
vs Born–Landé −833 / Born–Haber −915). Both pairs are in the literature and
each argument is internally sound; reconciling them is a content decision, not
a correction.

## Difficulty tiers (plan2 §1)

`tierOf()` derives tiers structurally, and every non-warm-up MC landed on
Silver — so the Question Bank's difficulty filter read "Silver (110), Gold (0)"
on Part I and the tier told a student nothing. The whole corpus was re-read
against one bar: **a Gold MC must need chained reasoning, not one recalled fact
or one plug-in-the-formula step.**

| Tier | Count | How |
|---|---|---|
| Bronze | the 5 warm-ups of each quiz bank | derived |
| Silver | the remaining MC | derived |
| Gold | 129 MC (15%) + 95 written | explicit `tier: 3` override on MC; derived for written |
| Platinum | 24 CCO and Integrated problem sets | derived |

The overrides are per-question and explicit because the derivation cannot see
difficulty: nothing structural separates "compute ΔE from the 1/n² levels, then
convert to a wavelength" (qua-010) from "which orbital is spherical" (qua-002).

### Trivia: nothing removed, deliberately

All 853 MC were also read for questions testing arbitrary recall rather than
chemistry. Seven were nominated; none survived review. The nominations were
E/Z nomenclature (core stereochemistry, and the `why` is about CIP priority
beating "bigger group"), the FGI definition (a retrosynthesis concept, not
jargon), electronegativity scales (the question asks which is defined from
IE and EA — that is the definition, not the surname), the 5% approximation
rule, ΔEN bond-type cut-points, copolymer architecture names, and GHS
pictograms.

The bar is high on purpose. Question ids are permanent and progress is keyed on
them, so deleting a question orphans real history — a marginal trivia charge is
not worth that, and a fact a working chemist needs at hand is not trivia.

## Measurements that found nothing (plan2 §8)

Recorded because "we checked and it was fine" is a result, and re-checking
costs more than reading it:

- **progressPage rebuild.** `render()` replaces the whole page on every
  progress or mode change. That is 163 nodes, sub-millisecond, and it is gated
  on `!page.hidden` — a quiz elsewhere does not repaint it. Splitting render
  into per-section updates would add state for no measurable gain. The real
  defect in that file was a leaked resize listener, fixed separately.
- **Question-bank search.** 0.1–2.8 ms across 972 questions, with capped result
  lists. An earlier ~1000 ms reading was a measurement artifact: `setTimeout`
  is clamped to 1 s in a backgrounded page, so timing across one measures the
  clamp.
- **Animation loops.** All four `requestAnimationFrame` loops gate on
  visibility, folded state, or the play control.
- **Images.** The only raster assets are the two favicons and an 87 kB
  og-image, which no visitor's browser requests.

## "Upgrade weak explanations" — what the search actually found (plan2 §1)

Short is not the same as weak. 143 of 853 `why` fields are under 70 characters,
and reading them shows almost all are terse because the question is: "n = m/M =
44/44 = 1 mol" is a complete explanation of a one-step conversion, and padding
it would make the page longer without making it clearer.

Even among the Gold questions — where a thin explanation would be a real
defect, because the whole point of the tier is chained reasoning — the short
ones turn out to show their full working: `p1-thermo-004` fits the entire Hess
sum in 51 characters, `equ-013` both K transformations in 62.

So no bulk rewrite was done. The real upgrade to explanation quality this pass
was the misconception layer: 167 → 264 notes, including one on every Gold
question, each naming the wrong mental model behind a specific distractor
rather than restating the answer. That is the thing a student who got it wrong
did not already have.

## Skill tagging: what is left untagged, and why (plan2 §10)

842 of 853 MC carry a skill (99%), and all 81 taxonomy skills have at least one
question. An untagged question is absent from a student's breakdown rather than
mis-bucketed, so the eleven below are a deliberate outcome, not an oversight.

Four skills were added once the tagging showed what was actually missing —
`stoich/mole-concept`, `stoich/yield`, `acids/definitions` and
`atomic/quantum-foundations` — which absorbed seventeen questions between them.
The mole concept in particular was a real hole: it is the most basic skill in
the subject and the taxonomy had `stoich/net-ionic` but no home for "convert
grams to moles".

### The eleven, and why each stays untagged

- **Biochemistry (6)** — `bio-001` amino acids, `bio-004` ATP, `bio-005` base
  pairing, `bio-013` Boltzmann populations, `bio-016` secondary structure,
  `bio-023` allosteric feedback. **Decided: this is a product-model boundary,
  not a gap.** Biophys is enrichment content outside the CCC/CCO exam-topic
  taxonomy, so its questions do not contribute to exam-topic or skill weakness
  calculations — which is the honest behaviour, not a shortfall. No thirteenth
  exam topic; if real usage later justifies classifying this content it gets a
  third independent axis (exam topic → reporting, skills → mastery, domain →
  content), not a wider second one.
- **Isomerism as a definition (2)** — `og1-004`, `mock1-a-017`. The only
  isomerism skill is `organic/stereochemistry`, which is the one thing these
  two deliberately are not.
- **Three genuine one-offs** — `ana-008` (Debye–Hückel and ionic strength),
  `ain-009` (free-ion term symbols), `mock2-a-015` (identifying mixed ionic and
  covalent bonding).

Skills considered and rejected: activity/ionic strength, isomerism, term
symbols, bonding-type identification. One or two questions do not justify a
bucket in a list a student reads as a map of their own weaknesses — which is
also the test the four added skills passed and these four failed.

**The taxonomy is now frozen at 81 skills** (see CLAUDE.md). It stops being a
design question here and starts being infrastructure; the next thing that
should change it is evidence from real students, not another pass of
classification.
