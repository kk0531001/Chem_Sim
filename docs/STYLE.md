# STYLE.md — writing for a student who has not met the topic yet

Applies to **every piece of student-facing prose**: `intro` / `blurb` in
topics.ts, `theory()` blocks, quiz `why` / `why2` / `misconception`, mission and
`task()` lines, FRQ prompts and solutions, homepage and guide copy.

**Reader:** a grade 11 student meeting the topic for the first time, with
decent algebra and no chemistry vocabulary beyond the last unit. Some will go
on to olympiad level. Serve both by being *concrete*, not by being *easy*.

Two registers, and only two:

| Register | Where | Rules |
| --- | --- | --- |
| **Basics** | intros, blurbs, Basics theory blocks, tier 1–2 `why`, missions, homepage | all nine rules below, all of the time |
| **Exam-level reference** | theory blocks titled "Exam-level reference", tier 3–4 `why` / `misconception`, CCO/olympiad bank solutions | rules 1, 2, 5, 7, 8 still apply; rules 3, 4, 9 relax |

Every example below is real current text from this repo. No emoji, per house
style.

## 1. Define the term in the sentence that first uses it

Not a later sentence, not a glossary link, not "as you know". Everyday words,
then the technical word, then move on.

> **Before** — `src/tabs/questions1.ts:11` (`qua-005`)
> "ℓ sets the shape family (0 = s, 1 = p, 2 = d…); n sets size/energy, mℓ
> orientation, ms spin."

> **After**
> "Each electron is labelled by four numbers. ℓ, the angular momentum quantum
> number, sets the orbital's shape: ℓ = 0 is a sphere (s), ℓ = 1 is a dumbbell
> (p). The other three set size (n), direction (mℓ) and spin (ms)."

> **Before** — `src/topics.ts`, `stoich` intro
> "The mole is the unit conversion the whole subject is built on."

> **After**
> "A mole is just a count: 6.022 × 10²³ of something, the way a dozen is 12.
> Chemists count in moles because atoms are far too small to count one at a
> time."

Never undefined in Basics text: mole, molar mass, molarity, orbital, node,
valence, oxidation state, enthalpy, entropy, equilibrium constant, buffer,
nucleophile, spectator ion, domain (VSEPR).

## 2. Worked number first, general formula second

One concrete calculation the reader can follow on a calculator, then the
equation, named as "the same sum written in general".

> **Before** — `src/tabs/stoich.ts:194`, theory block
> "grams ⇄(÷M) moles ⇄(×ratio) moles ⇄(×M) grams · n = CV (solutions) ·
> n = PV/RT (gases)"

> **After**
> "44 g of CO₂ is one mole. One CO₂ has 12.0 + 2(16.0) = 44.0 g in every mole,
> so 44 ÷ 44.0 = 1.00 mol. Written in general: n = m / M, where m is the mass
> in grams and M is the molar mass in g/mol."

The general form still ships. It goes second, as shorthand for a sum the
student has already done once.

## 3. One idea per sentence

No semicolon joining two clauses, no em-dash joining a third. Aim under 20
words. A sentence over 25 words is almost always two sentences.

> **Before** — `src/topics.ts`, `periodicity` intro (58 words, one sentence)
> "The periodic trends are worth almost nothing as slogans and almost
> everything as explanations, so this module spends its time on the places the
> slogan fails: the dip at B and at O in first ionisation energy, chlorine's
> electron affinity beating fluorine's, the d-block contraction that makes Zr
> and Hf nearly the same size."

> **After**
> "Atoms get smaller across a row and bigger down a column. The useful part is
> knowing why, because then you can spot where the pattern breaks. Ionisation
> energy dips at boron and again at oxygen. Chlorine holds an added electron
> more tightly than fluorine does. This module explains each break rather than
> listing it."

Semicolons are fine between list items that already contain commas. They are
not fine for welding two sentences together.

## 4. No exam culture in Basics text

Banned in Basics: *olympiad, marks, CCC, USNCO, CCO, IChO, PS4, trap, classic,
exam rewards, high-yield*. Allowed in blocks titled "Exam-level reference" and
in questions tiered 3–4.

> **Before** — `src/topics.ts`, `stoich` intro
> "stoichiometry is where olympiad marks are most often lost to bookkeeping
> rather than chemistry"

> **After**
> "Most mistakes here are bookkeeping, not chemistry. Balance the equation
> first, convert to moles second, and never compare masses directly."

> **Before** — `src/tabs/questions1.ts:31` (`qua-020`, `why`)
> "Cl, not F! F's compact 2p shell suffers strong electron–electron repulsion
> when gaining an electron. A classic counter-trend fact."

> **After**
> "Chlorine, not fluorine. Fluorine's 2p shell is small, so an extra electron
> arrives crowded and is repelled by the ones already there. Chlorine releases
> 349 kJ/mol on gaining an electron; fluorine only 328 kJ/mol."

The `.trap` CSS class stays in Exam-level blocks. The word does not appear in
Basics prose.

## 5. No cleverness that assumes the joke

A nickname or punchline only lands for a reader who already knows the
material. For everyone else it is one more thing to decode.

> **Before** — `src/tabs/stoich.ts:194` — heading "The mole highway"
> **After** — heading "Converting between grams, moles and particles"

> **Before** — `src/tabs/questions1.ts:44` (`bon-007`)
> "O₂ has 2 unpaired electrons in its degenerate π* orbitals — liquid O₂ sticks
> to a magnet. MO theory's signature win."

> **After**
> "O₂ has two unpaired electrons, one in each of its two π* orbitals.
> Unpaired electrons make a molecule magnetic, and liquid oxygen really does
> stick to a magnet. A Lewis structure gives O₂ no unpaired electrons at all,
> which is why molecular orbital theory is needed here."

> **Before** — `src/tabs/questions1.ts:23` (`qua-016`)
> "Only frequency raises KE = hν − φ. This killed the wave model."

> **After**
> "Only frequency raises the kinetic energy, through KE = hν − φ. Treating
> light as a continuous wave predicts the opposite, which is why the photon
> picture was needed."

("Killed the wave model" is also untrue: light still has wave behaviour.
Cleverness and inaccuracy tend to arrive together.)

## 6. The three-step `why` for Bronze (tier 1–2) questions

Exactly this order, 2–4 sentences, no more:

**(a)** what the question is really asking · **(b)** the rule in plain words ·
**(c)** the arithmetic or the reasoning step.

> **Before** — `src/tabs/questions1.ts:84` (`sto-006`)
> "Ratios: H₂ 4/2 = 2, O₂ 1/1 = 1 → O₂ limiting, extent = 1 → 2 mol H₂O, 2 mol
> H₂ left over."

> **After**
> "This is asking which reactant runs out first. Divide each amount by its
> coefficient in the balanced equation, and the smallest answer is the one
> that runs out. H₂ gives 4 ÷ 2 = 2 and O₂ gives 1 ÷ 1 = 1, so oxygen runs out
> first. One mole of O₂ makes 2 mol H₂O, leaving 2 mol H₂ unused."

> **Before** — `src/tabs/questions1.ts:80` (`sto-003`)
> "n = m/M = 44 g ÷ 44 g/mol = 1 mol."

> **After**
> "This is asking you to turn a mass into a number of moles. Divide the mass in
> grams by the molar mass, the mass of one mole. CO₂ is 12.0 + 2(16.0) = 44.0
> g/mol, so 44 ÷ 44.0 = 1.00 mol."

Step (a) is the one writers skip, and the one a beginner needs: a wrong answer
is usually a misread question rather than bad arithmetic. `misconception` is
separate and comes after — name the wrong belief, say what it predicts, say
what actually happens.

## 7. Symbols: spell out on first use, no LaTeX

First appearance gets symbol, name, and meaning in one breath:

> "ΔH, the enthalpy change — the heat given out or taken in at constant
> pressure"
> "Z_eff, the effective nuclear charge — the pull an outer electron actually
> feels once inner electrons have screened part of the nucleus"
> "Ksp, the solubility product — the equilibrium constant for a solid dissolving"

> **Before** — `src/tabs/stoich.ts:198`
> "assign oxidation states; oxidation = e⁻ loss (OS up)"

> **After**
> "Oxidation is loss of electrons, which pushes the oxidation state up."

Unicode subscripts, superscripts and arrows as the corpus already does: H₂O,
SO₄²⁻, 1s²2s²2p⁶, ⇌, →, ×, ≈, ≥. **No LaTeX in prose** — no `$`, no `\frac`,
no `^{}`. Write fractions as `13.6(1/4 − 1/9)` or with `÷`. One symbol means
one quantity per page: `M` is currently molar mass in one theory heading and
molarity in another.

## 8. Titles are plain nouns, not term lists

A title names the thing. It does not list the syllabus.

| Before | After |
| --- | --- |
| Quantum & Atomic Structure | Atoms & Electrons |
| Bonding, VSEPR & MO Theory | Bonding & Molecular Shape |
| Acids, Redox & Kinetics | Acids, Batteries & Reaction Rates |
| Stoichiometry & Solutions | Moles & Solutions |
| Gases, IMFs & Phases | Gases, Liquids & Solids |
| "Theory & key equations — stoichiometry / reactions / solutions" | "Basics" + "Exam-level reference" |

Same for `h3` headings: "Reaction types to recognize instantly" becomes "Four
reactions worth recognising on sight". Slugs are URLs and never change — add
the old title to `aliases`.

## 9. Reading-level check

A Basics paragraph should score **Flesch–Kincaid grade 10 or lower**.
Exam-level reference text is exempt.

How to check, with no tooling added to the repo: paste the paragraph into any
free readability checker (hemingwayapp.com, readabilityformulas.com, or the
readability statistics in Word and Google Docs). Score the *paragraph*, not the
page — chemical formulas distort a document-level score.

Above 10, the fix is almost always rule 3 (split the sentences), not shorter
words. Keep "paramagnetic". Lose the 58-word sentence. The `stoich` intro
rewritten under rules 1–4:

> "A mole is just a count: 6.022 × 10²³ of something, the way a dozen is 12.
> Chemists count in moles because atoms are far too small to weigh one at a
> time. This module covers the four moves you will use constantly: mass to
> moles, finding which reactant runs out first, percent yield, and working a
> formula out from lab data."

(52 words, four sentences, grade 8.)

---

## Before you ship a paragraph

1. Every technical term is defined in the sentence that first uses it.
2. A worked number appears before every general formula.
3. No sentence over 25 words; none joined by a semicolon.
4. No exam words in Basics text: olympiad, marks, CCC, CCO, PS4, trap, classic.
5. No nickname, joke or bit of history that assumes prior knowledge.
6. Bronze `why` follows asking → rule → arithmetic, in 2–4 sentences.
7. Every symbol spelled out on first use; no LaTeX; unicode sub/superscripts.
8. Headings and titles are plain nouns, not term lists.
9. Flesch–Kincaid grade 10 or lower for Basics.
10. Chemistry checked against a textbook: numbers, units, signs, exceptions.
11. No emoji; inline SVG or a text label instead.
12. Read it out loud once. If you run out of breath, rule 3 was broken.
