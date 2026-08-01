# ChemPrep — Roadmap

> "You've already built the platform. Now build the learning experience."

This is the working plan. It is ordered by **impact ÷ effort**, and it deviates
from the phase numbering in the original feedback in two places — both noted
inline, both because a dependency was hiding in the ordering.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Where the project actually is today

Verified against the source, not from memory:

| Thing | State |
| --- | --- |
| Topic modules | 25 (`DEFS` in [main.ts](src/main.ts)), grouped into 8 domains |
| Quiz questions | ~590 across `questions1–7.ts` (25 per module) |
| Bank items | ~440 across `bankPart1/2/3`, `bankCCO`, `bankIntegrated`, `olympiadPaper1–5` |
| **User accounts** | **Already built** — Supabase auth (magic link + Google), RLS `solved` table, offline-first localStorage cache |
| Progress data | Binary "solved" set only. No attempt log, no timestamps, no correctness history |
| Routing | Real URLs, History API, deep-linkable topics |
| Equation rendering | KaTeX + mhchem everywhere |
| Accessibility | **0** `aria-*` or `role` attributes in `src/` |
| SEO / social | No meta description, no Open Graph tags, no favicon, no crawlable HTML |

Two corrections to the original phase plan follow from this table:

1. **Phase 4 is not "build user accounts."** Accounts, cloud sync, and RLS already
   ship. Phase 4 is really *"record richer progress data, then show it back."* That
   deletes roughly a week of planned work.
2. **Phases 4, 5, and 6 all depend on one refactor that isn't in the plan.**
   Quiz history, weak-topic tracking, recommendations, search, and competition
   modes every one of them needs questions to be *addressable entities with
   metadata*. Today a question is an anonymous object literal in one of 18 files,
   identified by a hash of its own prompt text. That refactor is Phase A below and
   it must come first.

---

## Phase 0 — This week's batch (~4 hrs total)

Small, unrelated, all worth doing before anyone else looks at the project.

### 0.1 Decide: public repo or private — **[x] DONE**

**Decision: the repository is private.** The `CLAUDE.md` attribution rule stays
as written; the site ships publicly, the source stays closed. Revisit only if the
repo is ever opened up — at that point the rule becomes its own disclosure and
should be deleted rather than kept.

### 0.2 Social + search metadata — **[x] DONE**

- [x] `<meta name="description">` + `<link rel="canonical">`
- [x] Full Open Graph set — `og:type`/`site_name`/`title`/`description`/`url`/
      `image` (+ `image:type`/`width`/`height`/`alt`) and `og:locale`
- [x] `twitter:card` = `summary_large_image` + title/description/image/alt
- [x] `public/favicon.svg` — the `.tile` mark inverted to flame-orange on the
      dark panel. The "25" superscript is dropped here because it muddies the
      "Ch" at 16px; the larger icons carry the full mark
- [x] `public/favicon-32.png` (PNG fallback), `public/apple-touch-icon.png`
      (180×180, kept clear of iOS's ~40px corner mask)
- [x] `public/og-image.png` — 1200×630, echoing the homepage hero so a shared
      link and the landing page read as the same product
- [x] `theme-color` + `color-scheme`

**Absolute URLs.** Social scrapers don't resolve relative `og:image` paths and
don't run JS, so the origin has to be in the served HTML. [index.html](index.html)
carries a `%SITE_URL%` placeholder that [vite.config.ts](vite.config.ts)
substitutes at build time from `VITE_SITE_URL` → Netlify's automatic `URL` →
a localhost fallback. **Set `VITE_SITE_URL` if a custom domain is added**;
otherwise Netlify's `URL` is already correct with no configuration.

Verified: `tsc --noEmit` clean, production build leaves zero `%SITE_URL%`
placeholders, all four assets serve with correct content types.

Also corrected while here: the homepage lede still claimed "Eighteen interactive
modules … 650+ exam-style questions". Actual counts are **25 modules, 854
multiple-choice questions, and 67 multi-part written problems** (212 worked
sub-parts). Copy and OG image now both say 25 / 850+ / 67 / 5 mock papers.

### 0.3 Accessibility pass — **[x] DONE**

Zero `aria` and zero `role` attributes existed before this. All of the below
landed; the notable judgement calls are recorded in the commit and in comments
at each site.

Two things worth knowing because they contradict what this section originally
said. First, **the quiz is deliberately not a `role="radiogroup"`** — a radio
group models a *revisable* selection with arrow-key movement and `aria-checked`,
whereas here the first click is final and immediately graded. It is a group of
buttons named by the question; what it actually needed was colour independence,
since `.correct`/`.wrong` were green and red and nothing else. Second,
`pills()` *is* the ARIA tabs pattern and now implements all of it including the
roving tabindex — and its panels are all mounted with the inactive ones `hidden`,
because `aria-controls` only means something if it resolves to an element in the
document and three of every four tabs previously pointed at a detached id.

Original checklist, for the record:

- [ ] `aria-label` on every icon-only button — `#brand`, quiz option buttons,
      sandbox controls
- [ ] `role="navigation"` + `aria-label` on `#sidenav`, `aria-current="page"` on
      the active nav item ([framework.ts](src/tabs/framework.ts) `initTabs`)
- [ ] `aria-hidden="true"` on decorative SVG; text alternatives for `<canvas>`
      figures (a `<figcaption>`-style summary of what the plot shows)
- [ ] Quiz: `role="radiogroup"` on `.quiz-opts`, `aria-live="polite"` on
      `.quiz-why` so screen readers announce the explanation
- [ ] Visible focus rings in [style.css](src/style.css) (check `:focus-visible`)
- [ ] Verify contrast on `--panel-text` against `--panel`

### 0.4 Correctness fixes — **[x] DONE**

These were chemistry errors in a chemistry teaching tool, which makes them worse
than ordinary bugs.

- [x] **`|ψ|²` mislabel** — the card read `Hydrogen orbital viewer |ψ|²
      (blue = ψ>0, red = ψ<0)`; those halves contradict each other, since a
      squared quantity has no sign. The renderer plots signed ψ. Retitled to
      "ψ, signed amplitude", and added a `.trap` note on why the sign is the
      point: bonding vs antibonding overlap depends on it, and squaring throws
      away exactly the information MO theory needs.
- [x] **`3d_{x²−y²}` drawn without its nodes** — was `psi: (x,z) => x*x*exp(-r/3)`,
      strictly non-negative, so it showed no nodal planes and no sign
      alternation: the very features the orbital exists to teach. Its angular
      part `x²−y²` collapses to `x²` in the x–z slice, so the orbital record now
      carries an optional `plane` and this one is drawn in **x–y**. Verified by
      scanning a ring around the nucleus in the rendered canvas: **4 sign
      changes at 46°/136°/226°/316°** (the x = ±y planes) where the old version
      had none.
- [x] **Ksp common-ion divergence** — `sCommon = (Ksp/C^n)^(1/m)/m` dropped the
      `n·s` the dissolving solid itself contributes. PbCl₂ at [Cl⁻] = 10⁻⁴ M
      reported **1.70×10³ M** against a true **1.62×10⁻² M** — a 10⁵× error.
      Now bisects the full `(m·s)^m(C + n·s)^n = Ksp`; the left side is strictly
      increasing in s and s can never exceed its pure-water value, so
      `[0, s_pure]` always brackets the root. Checked over all 7 salts × the
      full slider range: residuals at machine precision, monotone decreasing,
      never exceeding `s_pure`.
      **Turned into a teaching feature rather than just a fix:** the panel now
      shows the textbook shortcut *beside* the exact answer and says plainly
      when it has left its valid regime (`C ≫ s`). Knowing when an
      approximation breaks is the olympiad skill here.
- [x] **Magic `* 12`** — the unexplained factor in four force accumulations in
      [movement.ts](src/movement.ts) is now `FORCE_DT`, documented as the fixed
      force-integration timestep, deliberately decoupled from the frame `dt`
      (these springs are stiff enough that a long frame fed straight into the
      impulse blows them up). Pure rename, value unchanged.

### 0.5 Note the `innerHTML` policy (0 min now, saves you later)

103 `innerHTML` assignments across `src/`. Every one is author-written content
today, so there is no live vulnerability. The moment Phase 8 adds a feedback
form, a comment, or any user-supplied string that reaches the DOM, it becomes
one. Write the rule into `CLAUDE.md` now while it costs nothing:

> Author content may use `innerHTML`. Anything originating from a user — form
> input, Supabase row, URL parameter — uses `textContent` or is sanitized.

---

## Phase A — The content model (3–5 days) · **prerequisite for Phases 4, 5, and 6**

This is the keystone. Everything downstream is cheap once it exists and
expensive-to-impossible without it.

### A.1 The problem

`QuizQ` is `{ q, opts, a, why }` ([framework.ts:119](src/tabs/framework.ts)).
It carries no id, no topic, no difficulty, and no exam tag. Progress is keyed by
`qid(q.q)` — an FNV-1a hash of the prompt text ([progress.ts:33](src/progress.ts)).

Three consequences:

- **Editing a typo silently erases progress.** Change one character of a question
  and its hash changes; every user's "solved" record for it is orphaned, locally
  and in Supabase, with no error and no way to recover it.
- **Nothing can be queried.** "Show me hard equilibrium questions I got wrong" is
  unanswerable — there is no topic field on quiz questions, no difficulty field
  anywhere, and no record of wrong answers at all.
- **Nothing can be counted.** Weak-topic tracking, streaks, recommended-next, and
  competition filtering are all aggregations over data that isn't being recorded.

### A.2 The change — **[x] DONE**

Every question carries a permanent id, a topic, a difficulty tier and a
competition scope, and the registry indexes all three.

- [x] **`tier` (1 Bronze … 4 Platinum)** and **`comps`** — added as *optional
      overrides*, with `tierOf()` / `compsOf()` deriving a value for every
      question. See the note below on why derived rather than stored.
- [x] **`byTopic()` / `byModule()` / `byTier()` / `byComp()` / `query()` /
      `ladderFor()`** on the registry, all built once at load.
- [x] **The 125 olympiad Part A questions are tagged.** `scripts/classify-paper-topics.mjs`
      scores each question's text against per-topic keyword sets and prints the
      matched evidence for review; 17 cases the keywords got wrong or couldn't
      see are pinned in an explicit `OVERRIDES` table with a one-line reason
      each. Idempotent, and it refuses to write while anything is unclassified.
- `misconception?: string` is **not** here — it belongs to Phase B.2.

**Why tier and comps are derived, not stored on 919 questions.** Hand-tiering
919 items in one pass isn't something anyone does accurately, and a stored value
that merely restates the default goes stale the moment a module's `difficulty`
changes. The corpus already encodes difficulty *structurally*, so the derivation
reads it off: the first five of every quiz bank are documented warm-ups →
Bronze; a multi-part written problem is multi-step by construction → Gold, or
Platinum for the CCO sets and Integrated Challenges; anything else is a
single-answer MC scaled by its module's curated difficulty, **floored at Silver**
(past the warm-ups every bank is exam-style, so a CCC module's questions aren't
Bronze) and **capped at Gold** (a four-option MC cannot be "a full olympiad
problem"). Overrides exist for where that's wrong.

`comps` comes from `TopicMeta.difficulty` as an upward closure from the lowest
level listed: CCC content is fair game for a CCO student, but CCO content is out
of scope for CCC. That asymmetry is the point of a competition mode.

**The resulting distribution is itself a finding, and it confirms this
document's Phase C argument:**

| Tier | Count |
| --- | --- |
| Bronze | 115 (exactly the 23 × 5 warm-ups) |
| Silver | 550 |
| Gold | 230 |
| **Platinum** | **24** |

Scope: CCC 536 · USNCO 764 · CCO 919 · IChO 919 (correctly nested). The corpus is
overwhelmingly Silver and has **24 Platinum items across 919**. The gap is
Gold/Platinum, exactly as Phase C predicted — so that phase is a *writing* task
at the top of the ladder, not a tiering task.

Every question now carries an explicit permanent `id`. 919 of them, inserted by
`scripts/backfill-ids.mjs` across 17 files; `id` is **required** on `QuizQ`,
`BankMC` and `FRQ`, so a missing one is a compile error rather than a silent
gap. `quiz()` and the FRQ browser key progress on `q.id` instead of
`qid(question text)`, and `src/content/registry.ts` is the one flat indexed view
of the corpus (also what Phase C tiering and Phase E search will query).

Making `id` required paid for itself immediately: `qbank.ts` was re-mapping bank
questions field-by-field (`({ q, opts, a, why }) => ({ q, opts, a, why })`),
silently dropping the new fields — and it would have dropped any field added
later. That was the only compile error the change produced.

**Existing progress is migrated, not orphaned.** `migrateLegacyProgress()` in
the registry builds the legacy-hash → explicit-id map from the current question
text and calls `remapProgressIds()` once per browser. Verified by seeding a
returning user's records under the old hashes and doing a real page reload: all
records preserved, legacy keys gone, unrelated keys untouched, run-once flag set.
A question whose text changed between a user answering it and the migration
running won't match and is lost — unavoidable, and exactly the defect the
explicit ids remove going forward.

`auditCorpus()` runs in dev and fails loudly on the two content mistakes that
are invisible at runtime but corrupt progress: a duplicated id (two questions
sharing one record) and an `a` index outside its `opts` range.

**Vocabulary decision:** two distinct vocabularies, deliberately not merged.
`QuizQ.topic` is a `ModuleId` (`quantum`, `thermo1`, …), which each quiz bank
maps to 1:1 so it backfills with zero judgement. The exam banks keep their
existing coarser `ExamTopicId` (the 12 ids in CLAUDE.md) untouched — rewriting
332 values to a different vocabulary would be a semantic change disguised as a
refactor, and `qbank.ts` groups its UI by them. One hand-maintained
`MODULE_EXAM_TOPICS` table bridges them; the reverse direction is derived.

**True corpus counts** (structural, independently confirmed): **853
multiple-choice** (587 quiz + 110 Part I + 31 Part III + 125 olympiad Part A)
and **66 multi-part written problems** (212 worked sub-parts). Five quiz banks
hold more than the documented 25: PHYSCHEM 27, ORGANIC3 26, COORDCHEM 26,
LABTECH 29, STRUCTURE 29 — real extra questions, not a miscount.

**Known gap:** the 125 olympiad Part A questions have no topic anywhere in the
data, and a mock paper spans the whole syllabus, so it isn't derivable from
file or position. They will get ids but no topic and be excluded from
per-topic analytics until hand-tagged.

Original plan:

- [ ] Extend the type:
      ```ts
      interface QuizQ {
        id: string;        // explicit, stable, never derived from text
        q: string; opts: string[]; a: number; why: string;
        topic: TopicId;    // 'equilibrium' | 'organic' | …
        tier: 1|2|3|4;     // bronze → platinum (see Phase C)
        comps?: Comp[];    // ['ccc','usnco','cco','icho'] — Phase 6
        misconception?: string;  // Phase B.2
      }
      ```
      Make `id`/`topic`/`tier` required, `comps`/`misconception` optional, so
      `tsc --noEmit` enumerates every question still needing backfill.
- [ ] Backfill ids by script — `eq-001`, `org-047`. Deterministic, one-time,
      committed. Never regenerated.
- [ ] **Migration shim so no existing user loses progress:** keep `qid()`, build a
      one-time `legacyHash → newId` map at startup, rewrite matching localStorage
      and Supabase rows, then retire the shim after a release or two. Do this in
      the same commit as the id backfill or the window opens.
- [ ] `src/content/registry.ts` — imports every bank, exports one flat
      `ALL_QUESTIONS` array plus `byTopic()` / `byTier()` / `byComp()` indexes.
      Single source of truth, same discipline `topics.ts` already uses for modules.
- [ ] Guard against duplicate ids and out-of-range `a` at module load (a cheap
      assert catches a whole class of content bugs).

### A.3 Attempt tracking — **[x] DONE**

`recordAttempt()` appends every answer alongside the existing solved set, with
derived selectors (`accuracyByTopic`, `weakTopics`, `streakDays`,
`wrongQuestionIds`, `recentAttempts`) and `remapProgressIds()` as the A.2
migration hook. SQL in SUPABASE_SETUP.md §2b. Three findings worth carrying
forward, all now enforced by comments in the code:

- **The local log has to be capped.** At 149 bytes/row, 50 answers a day passes
  the ~5 MB localStorage quota inside two years, and exceeding it throws on
  every later write — progress would silently stop saving. So localStorage keeps
  a 1000-row window and *bounded aggregates* carry the statistics. Any lifetime
  statistic must come from an aggregate, never from counting the array.
- **`streakDays()` anchors its day-walk at local noon.** Subtracting a flat 24 h
  from local midnight lands on 23:00 the previous day across a spring-forward
  boundary, skipping a calendar day. Tested in five timezones across both 2026
  transitions: a midnight anchor turns a 10-day streak into 9 on every
  spring-forward, including the southern-hemisphere October shifts.
- **Attempts sync by upsert on a client-generated uuid**, because an append-only
  table has no natural key to deduplicate on and a retried push would otherwise
  duplicate rows.

Remaining wiring (needs A.2's ids first): `quiz()` still calls `markSolved`
only — it must also call `recordAttempt`, passing the question's `topic`.

Original plan, for the record:

- [ ] `attempts` table: `(user_id, question_id, correct, answered_at, chosen)`,
      same RLS pattern as `solved`. Keep `solved` as a derived view for now.
- [ ] Same offline-first shape as [progress.ts](src/progress.ts): localStorage is
      the always-on cache, Supabase syncs when signed in, absent env vars degrade
      cleanly and never crash. That contract is already right — extend it, don't
      redesign it.
- [ ] Record attempts from the click handler in `quiz()`
      ([framework.ts:152](src/tabs/framework.ts)) — one call site.
- [ ] Derived selectors, all pure functions over the log:
      `accuracyByTopic()`, `weakTopics()`, `streakDays()`, `recentHistory()`.

**Ship gate:** `tsc --noEmit` clean, and a signed-in test account's existing
progress survives the migration intact.

---

## Phase B — Make the simulations teach — **[x] DONE**

> "Not 'make prettier graphics.' Make them teach better."

Right now every simulation is *sliders with no goal*. A student moves a control,
watches something change, and learns nothing unless they already knew what to
look for. Missions invert that: state the goal, let them hunt for it.

### B.1 A shared mission framework — **[x] DONE**

`missionLadder(defs)` in [framework.ts](src/tabs/framework.ts) returns
`{ el, tick }`; `cardWithMissions()` pins the strip directly above the controls
of the card it belongs to. One helper, 21 missions, no bespoke implementations.

Four things worth knowing, because they were decisions rather than defaults:

- **A mission is graded three different ways, not one.** `check()` polls live
  sim state and auto-completes (the roadmap's original design), but a goal like
  "why didn't the equilibrium move?" has no state to poll — the student has
  already done the experiment and the question is what they concluded. Those get
  `choices` or `numeric` instead, and `check` is optional as a result.
- **`meter()` turned out to matter more than `check()`.** A pass/fail mission on
  a continuous slider is a guessing game; a live proximity read-out
  ("P/P₀ = 1.42 · target 2.00") makes it an experiment. Every drive-the-sim
  mission has one.
- **Missions write through `markSolved()`**, so they count toward completion
  alongside quiz questions. Ids are namespaced `msn-*` and are permanent, under
  the same rule as question ids. They deliberately do *not* call
  `recordAttempt()` — a mission is an open-ended experiment, and scoring it as
  a right/wrong answer would poison per-topic accuracy.
- **Ladders unlock sequentially**, which is what lets a later mission build on
  what an earlier one just demonstrated (the gases pair below is the clearest
  case).

Also fixed here: `isSolved(id) && !solved[i]` could never be true, because
`solved[]` is seeded from storage at construction — so a returning student's
completed missions rendered with their controls still live and no completion
message. Now painted from `solved[i]` itself.

### B.1a Chemistry corrections found while writing the missions

Missions are checkable claims about the simulation, which is a much harsher
test of a sim than a slider is. Writing them surfaced three defects in
[gases.ts](src/tabs/gases.ts)'s phase diagram, all now fixed and verified
against textbook values:

- **`classify()` contradicted its own drawn fusion line.** It short-circuited on
  `T <= Tt` and returned SOLID at *every* pressure below the triple-point
  temperature, erasing the high-pressure liquid region entirely — on the one
  card whose caption is "ice is less dense than water, so pressure melts it".
  The pressure-melting mission was unsolvable against it.
- **The fusion line was linear in log P**, which put water's melting point at
  **−2.7 °C at 1 atm**. Melting point shifts linearly in P, not log P
  (−0.0074 °C/atm for water), so it is now anchored correctly at 0 °C.
- **The vaporization curve was interpolated linearly in T**, putting water's
  boiling point at **0.1 atm instead of 1 atm** — a 90% error. It is
  Clausius–Clapeyron (log P linear in 1/T), anchored triple → normal bp →
  critical so the drawn curve passes through all three labelled points. Now
  within ~5% of tabulated vapor pressures from 25 °C to the critical point
  (25 °C: 0.0297 vs 0.0313 atm; 200 °C: 14.7 vs 15.3 atm), and CO₂ at 0 °C
  reads 34.5 atm against a true 34.9.

Verified with a 13-case region harness across both substances (dry ice at 1 atm,
liquid CO₂ above 5.1 atm, scCO₂, pressure-melted ice, steam at 150 °C).

Two defaults also moved, because a mission that is already solved when the page
loads is not a mission: the Ksp card opened with AgCl already suppressed **745×**
against a 100× goal (now starts at 23.6×), and the Clausius–Clapeyron card
opened at 0.33 atm, which *was* the Everest answer (now opens at 1 atm, on the
normal boiling point).

### B.2 Misconception boxes — **[x] DONE**

`.misconception` in [style.css](src/style.css) is a blue-slate note with an
inline SVG mark, deliberately distinct from all three colours already in play:
`.trap` orange (an exam gotcha), `.quiz-why.bad` red (you got this one wrong),
`.quiz-why.good` green. Optional `misconception` on `QuizQ`, surfaced under
`why` only on a **wrong** answer — a student who already has the right model
shouldn't be handed the wrong one to read.

All eight canonical items written, on ten questions:

| Misconception | Questions |
| --- | --- |
| Pressure shifts **position**, not **K** | `equ-023`, `equ-007` |
| A catalyst changes the *time*, not the *yield* | `equ-003`, `aek-019` |
| `ΔG°` is not `ΔG` | `th2-008` |
| Electronegativity ≠ electron affinity | `per-019` |
| Rate-law exponents come from experiment | `aek-010` |
| Strong ≠ concentrated | `aek-001` |
| Entropy is not "disorder" | `th2-001` |
| Inert gas at constant V → nothing happens | `equ-006` |

Each states the *wrong mental model* and why it fails, rather than restating the
right answer — `why` already does that. Where a claim needed a number it was
checked first: the "strong ≠ concentrated" box originally claimed 15 M acetic
acid reaches pH 1.2 (it is 1.78, and at 15 M the activity coefficients make the
simple calculation untrustworthy anyway), so it now contrasts 1 M acetic acid
(pH 2.4) with 0.001 M HCl (pH 3.0) — the weak acid being the more acidic
solution, computed exactly.

One rendering bug fixed: `.misconception` is a flex row, so the bare text nodes
and inline `<em>`/`<b>` tags in the copy each became a separate flex item and
stacked into narrow columns. The text is now wrapped in a single `<span>`, the
same shape `.mission-success` already used.

### B.3 Missions per simulation — **[x] DONE**

**21 missions across 6 tabs and 11 cards.**

| Tab | Missions |
| --- | --- |
| **Gases** (6) | Double P with temperature alone · why 27→54 °C *doesn't* double it · pressure-melt ice · put CO₂ in the supercritical region · boil water at 71 °C (Everest) · autoclave at 2 atm |
| **Equilibrium** (6) | Exceed 50% NO₂ without touching T · add argon at constant V · get K above 0.80 · break the 5% approximation · pH up *and* % ionization up · suppress AgCl 100× |
| **Thermo II** (2) | Read the crossover T off the graph · build an entropy-driven reaction crossing at 800 K |
| **Acids/Redox/Kinetics** (8) | Reach the equivalence point · choose the indicator · Henderson–Hasselbalch ratio at pH 5.0 · exceed buffer capacity · halve the half-life · t½ vs [A]₀ · **determine the order of an unknown run from data alone** · find Eₐ for "rate doubles per 10 °C" |
| **Quantum** (4) | Count 3s radial nodes · find the 1-radial/1-angular orbital · emit the 486 nm line · set up a UV absorption |
| **Sandbox** (2) | Make H₂O the most common molecule · dissociate it with temperature alone |

Every drive-the-sim mission was checked to be **reachable and not pre-solved**,
by replaying the simulation's own integrator offline rather than by eyeballing
it. Two examples of that paying off: the equilibrium ladder's first goal
confirmed that "+0.5 M N₂O₄" *lowers* the NO₂ fraction (45.7% → 40.0%) while
expanding raises it (→ 56.2%) — so the mission had to be written against the
fraction, not the concentration, and that contrast became the payoff text. And
`Eₐ = 53 kJ/mol` is the *only* slider position that satisfies the Arrhenius
mission (52 → ×1.977, 53 → ×2.003, 54 → ×2.029 against a ±0.02 window).

Two deviations from the list above, both because the sim didn't support the
original:

- **"Where ideal and real gas separate by 10%"** — there is no van der Waals
  curve in the gas box, and adding one is a new simulation rather than a
  mission. Replaced with three goals the existing cards *do* support, including
  the Kelvin-vs-Celsius pair, which targets a more common error anyway.
- **"Get >80% H₂O"** in the sandbox is now "make H₂O the most common molecule".
  An 80% threshold is meaningless without saying 80% *of what*, and any fixed
  count is hostage to which preset is loaded; "outnumbers everything else" is
  the claim that survives a different atom budget.

**"Determine the order from the traces alone"** needed a genuine unknown, so the
kinetics card carries a data table whose order is withheld — second order,
k = 0.08, chosen so the successive half-lives are 12.5 s then 25 s. The doubling
is readable straight off the table, which is the actual exam skill; the
explanation then confirms it by tabulating 1/[A] as a straight line.

Verification: `tsc --noEmit` clean, production build clean, no console errors on
any tab. Mission mechanics exercised in the browser end-to-end — auto-check,
wrong-then-right on a choices mission, a numeric mission correctly *rejecting*
the right number while the sim is in the wrong state, sequential unlocking, and
progress persisting across a reload. The sandbox's two predicates were unit-
checked separately (11 cases) because the pixi ticker can't be driven headlessly.

---

## Phase C — Question depth over question count (2–3 weeks) · **partially done**

> "I'd rather have 300 amazing questions than 2,000 average questions."

Important reframe: **you already have ~1,000 items.** This phase is a *curation
and upgrade* pass, not a writing sprint. The output is a smaller, better,
tiered bank — deletion is a legitimate result.

**Status: C.3 shipped in full. C.1 shipped as a read-only audit, not the
tag-and-prune pass originally scoped. C.2 shipped as a small, checked exemplar
batch, not the full Gold/Platinum layer.** Explicitly NOT done: deleting or
merging any existing question, and writing the remaining ~15 highest-impact
Gold/Platinum items the audit below identifies.

### C.1 Tier every question (uses `tier` from Phase A) — **[x] audited, not pruned**

| Tier | Meaning | Example |
| --- | --- | --- |
| **Bronze** | Single concept, direct application | "Calculate the pH of 0.1 M HCl" |
| **Silver** | Two concepts combined | "pH at the half-equivalence point of a weak acid" |
| **Gold** | Three concepts, multi-step | "Given a titration curve, identify the acid and its Ka" |
| **Platinum** | Full olympiad problem | "Unknown acid + titration curve + IR — identify it and justify" |

`tier` was already derived for every question by Phase A ([registry.ts](src/content/registry.ts)'s
`tierOf()`), so "tag all ~1,000 items" was already true going into this phase.
What C.1 actually needed was a read of what that derivation produces —
[scripts/audit-corpus.mjs](scripts/audit-corpus.mjs) transpiles every bank
with the TypeScript compiler API (no bundler, no runtime deps — every
inter-bank import is local and type-only except `bankIntegrated.ts`'s
`miniPlot()`, which is stubbed) and reports:

- [x] **Gold/Platinum coverage by exam topic** — the number that actually
      matters, since the challenge ladder and `qbank.ts` pool by the coarse
      `ExamTopicId`, not by module. Before this pass, three of the twelve
      topics had **zero Platinum items** despite each having 50–95 questions:
      **atomic** (2 Gold / 0 Platinum of 80), **states** (3/0 of 50), and
      **lab** (44 Gold but 0 Platinum of 95 — lab had plenty of Gold-tier MC
      from the CCO-pitched modules but no multi-part practical ever reached
      Platinum). `bonding`, `stoich` and `equilibrium` were thin but not
      empty (1 Platinum each, 2–5 Gold across ~50–55 questions). This is the
      gap list C.2 worked from.
- [x] **Near-duplicate detection** (Jaccard similarity on normalized question
      text, within each topic bucket) — 28 candidate pairs at similarity
      ≥0.55. Read through by hand: most are false positives from short,
      low-word-count prompts (e.g. two different sig-fig arithmetic questions
      that share only "correct sig figs"), and a few are the same *skill*
      tested with different molecules across the Part I bank and the mock
      papers (`p1-bonding-007` / `mock1-a-013`, both "which molecule is
      polar?" with different option sets) — legitimate reuse of a concept
      across separate practice banks, not a bug, but worth knowing about.
      **Nothing was deleted or merged** — that judgment call was left for a
      human pass, per the user's explicit instruction when this phase ran.
- [x] **Thin-explanation heuristic** (`why` under 35 characters) — 11 hits,
      almost all legitimate warm-ups or one-line arithmetic (`sto-001`:
      "Molar mass of water?") rather than actual weak content.
- [x] **Structural sanity** (duplicate ids, out-of-range answer index) — 0
      problems; this is the same check Phase A's `auditCorpus()` already runs
      in dev, confirmed clean here independently.
- [ ] Tag all ~1,000 existing items — **N/A, already true** (see above; this
      bullet described a state Phase A had already reached).
- [ ] Delete or merge weak duplicates. Target ~300–400 excellent items — **not
      done.** The audit surfaced candidates; removing content is a curation
      decision for a human to make with the report in hand, not something to
      automate.

### C.2 Write the Gold/Platinum layer — **[x] 6 exemplars written, not the full layer**

The distinguishing move: olympiads give you **evidence** and ask you to
**reason**, where most sites give you numbers and ask you to compute.

Per the user's explicit scope for this pass — establish the quality bar with
a handful of the *highest-impact* items rather than writing in bulk — six new
Part II FRQs went into [bankPart2.ts](src/tabs/bankPart2.ts), chosen directly
from the C.1 gap list:

- [x] **The three zero-Platinum topics, one each:** `p2-atomic-003`
      (identify an unknown period-3 element from an ionization-energy jump
      AND a photoelectron spectrum — two independent techniques that each
      pin down the answer alone, the redundancy being the point), `p2-states-003`
      (a molar mass computed two independent ways lands on 44.0 g/mol, which
      CO₂ and N₂O both share — the problem is realizing mass alone can't
      resolve the tie and picking an independent test), `p2-lab-001` (a
      gravimetric chloride determination with a planted coprecipitation
      error: compute the naive result, explain why a large precipitant
      excess is bad practice, correct the number, then redesign the
      procedure). All three carry an explicit `tier: 4` override — a
      deliberate use of the escape hatch documented on `QuizQ.tier`, since a
      hand-authored Platinum-caliber problem in an otherwise Gold-shaped bank
      (`p2-*` prefix) is exactly the sanctioned case for overriding the
      derived tier.
- [x] **Three Gold-tier additions for the thin topics:** `p2-bonding-003`
      (a Born–Haber cycle for MgO, plus a check-your-model question — the
      point-charge estimate for MgO agrees with experiment to ~2%, AgCl's
      disagrees by ~15%, and explaining that gap is Fajans' rules), `p2-stoich-003`
      (an antacid tablet by back-titration, with a "would this error read
      high or low" trap around un-boiled dissolved CO₂), `p2-equilibrium-003`
      (Kc for FeSCN²⁺ from Beer's-law calibration data plus an ICE table —
      the analytical/equilibrium synthesis the roadmap's own example calls
      for).
- [x] Data-first stems, experimental-design prompts, and "explain what's
      happening" reasoning parts — all six problems lean on at least one of
      these, per the distinguishing move above.
- [x] All original; no real exam content reproduced.
- [ ] The remaining ~14–20 highest-impact gaps the audit identified — not
      written. `atomic`, `states`, `bonding`, `stoich` and `equilibrium` each
      still have only one Platinum item, and `lab` has only one against 44
      Gold-tier questions; there is real room for more before this phase is
      actually complete.
- [ ] `miniPlot()`-embedded SVG figures — none of the six exemplars needed
      one; still unused for Phase C content.

### C.3 Challenge mode — **[x] DONE**

`ladderFor(module, comp)` already existed in [registry.ts](src/content/registry.ts)
from Phase A's registry work but had no caller anywhere in the UI — this
shipped that missing wiring, not new content.

- [x] **`challengeLadder(moduleId)`** in [challenge.ts](src/tabs/challenge.ts):
      one card, four tiers (Bronze → Silver → Gold → Platinum), pulled
      straight from `ladderFor()` so it can never drift from `tierOf()` /
      `compsOf()`. Mounted next to the "Quick quiz" card on all 23 topic tabs
      that have a quiz bank.
- [x] **Progressive unlock**: a tier is "solved" when every item in it has
      `isSolved(id)` true (module MC via the existing `quiz()` widget; FRQ
      items — which Gold and Platinum tiers often are — via a small
      single-item renderer with its own "mark as solved" button, since the
      Prev/Next FRQ browser in `qbank.ts` is built for paging through a large
      set, not showing a tier's handful of items at once). Empty tiers (most
      modules still have no Platinum of their own) are skipped rather than
      dead-ending the ladder — it falls through to whichever next tier
      actually has content.
- [x] **Re-renders on any progress change**, not just local interaction: the
      widget subscribes to `onProgressChange()`, so solving a tier's question
      elsewhere (the exam question bank, a shared topic pool) still unlocks
      the next rung here, matching how `ladderFor()` itself pools module and
      topic questions together.
- [x] The Platinum tier is visually and textually framed as the payoff
      ("— the payoff" in its heading), per the roadmap's own wording.
- [x] Verified live in the browser (equilibrium topic page): Bronze unlocked
      and interactive, Silver/Gold/Platinum correctly locked behind it with
      "Solve every Bronze question above to unlock." `tsc --noEmit` and
      `npm run build` both clean; no console errors.

### C.4 Topic-by-topic curation (ongoing)

C.1/C.2 above were a corpus-wide pass. Going forward, Phase C continues as a
**recurring per-topic workflow** — audit one topic in depth (weak/trivial/
repetitive/ambiguous questions, missing misconceptions, Gold/Platinum gaps,
missing experimental reasoning), upgrade it with a small batch of checked
Gold/Platinum exemplars, review its simulation and lesson content for
teaching quality, then verify. Deletions from the audit are never automatic —
they're a human call with the report in hand.

**Equilibrium — done.** [scripts/audit-corpus.mjs](scripts/audit-corpus.mjs)'s
per-topic breakdown, plus a manual read of all 53 equilibrium-tagged
questions (module quiz, Part I/II, mock papers, Integrated), found **no
chemistry errors** — every calculation checked out, including the existing
Platinum item's van't Hoff cycle. The gap was depth, not correctness: 6 Gold
/ 1 Platinum of 53. Added 5 new Part II FRQs (`p2-equilibrium-004..007`, one
Platinum) — reaching equilibrium from concentration-vs-time data, why the 5%
rule depends on x/C₀ and not on K's absolute size, the Mohr endpoint computed
quantitatively (residual [Cl⁻] ≈ 0.012% at the visible endpoint), and a
coupled Ksp×Kf equilibrium (AgCl dissolving in NH₃) with a real experimental-
safety trap about fulminating silver — bringing the topic to 9 Gold / 2
Platinum of 57. [equilibrium.ts](src/tabs/equilibrium.ts) got one new
mission (`msn-eq-07`, quantifying the Mohr endpoint on the existing
mixing-check calculator — previously the only card in the tab with zero
missions) and a caveat paragraph on the live sim: its forward/reverse rates
happen to equal the stoichiometric coefficients because N₂O₄⇌2NO₂ genuinely
is believed to be a single elementary step both ways, not because rate laws
in general can be read off a balanced equation — a real, if subtle,
over-generalization risk the sim didn't previously guard against. (One bug
caught in verification: the caveat's first draft passed raw `<sub>` HTML as
a plain string child, which `h()` renders as literal text rather than
markup — fixed by using the `html:` attribute, the same pattern every other
rich-text node in the codebase already uses.) `tsc --noEmit`, `npm run
build`, and the duplicate-id/answer-index audit are all clean; the new
mission and all five FRQs were exercised live in the browser.

**States of Matter & Gases — done.** Manual read of all 51 states-tagged
questions (module quiz, Part I/II, mock papers) found, again, **no chemistry
errors** — every gas-law, Graham's-law, phase-diagram and colligative
calculation checked out. [gases.ts](src/tabs/gases.ts) is the richest
simulation file in the corpus (5 sub-cards, 6 pre-existing missions) and
every formula was hand-verified: the Maxwell–Boltzmann distribution's
prefactor, the phase diagram's Clausius–Clapeyron/linear-in-P fusion curves
from the earlier Phase B fix (re-derived independently and still correct),
and both Clausius–Clapeyron missions' target temperatures (Everest ≈71°C,
autoclave ≈121°C) recomputed from scratch and matched to the displayed
values.

Added 4 new Part II FRQs (`p2-states-004..007`, one Platinum) targeting a
real, previously self-acknowledged gap: ROADMAP's own Phase B.3 notes record
that the "ideal vs. real gas" mission was dropped because "there is no van
der Waals curve in the gas box, and adding one is a new simulation" — so
`p2-states-004` fills that gap as a written problem instead (CO₂ at 1
mol/0.500 L/300 K, ideal vs. van der Waals, and a part isolating which
correction term — `a` or `b` — actually drives the ~25% deviation, since
they push in opposite directions and that is not obvious in advance).
The other three: `p2-states-005` derives ΔHvap from two vapor-pressure
data points and predicts a normal boiling point (the same mathematical
move as equilibrium's van't Hoff FRQs, applied to phase equilibrium
instead of chemical equilibrium); `p2-states-006` walks through supercritical
CO₂ decaffeination, including why the pressure-release step has to stay
above Tc to avoid a discrete boiling step — a real engineering subtlety,
verified by checking the release temperature (35°C) is deliberately kept
above CO₂'s 31.1°C critical point; `p2-states-007` uses osmotic pressure to
weigh a macromolecule (1.27×10⁶ g/mol) and computes what its freezing-point
depression would have been (2.93×10⁻⁵°C — unmeasurably small), the standard
reason osmometry is the practical technique for large solutes. States moved
from 3 Gold/1 Platinum to 6 Gold/2 Platinum (of 55).

One genuine mission gap found: the Maxwell–Boltzmann card had zero missions
despite two sliders and real physics. Added `msn-gases-07` — push CO₂'s
v<sub>rms</sub> above 550 m/s using temperature alone — which lands on a
teaching point nothing else in the corpus covers: light gases (He, H₂)
reach escape-relevant speeds far more easily than heavy ones at the same
temperature, which is *why* Earth's atmosphere is depleted in hydrogen and
helium over geological time. Verified live: selecting CO₂ and dragging T to
900 K auto-completed the mission with the correct explanation text.
`tsc --noEmit`, `npm run build`, and the duplicate-id/answer-index audit are
all clean; all four new FRQs and the new mission were exercised in the
browser.

**Atomic Structure — done.** This one turned up an actual bug, not just a
depth gap. Manual read of all 81 atomic-tagged questions (`quantum.ts` +
`periodicity.ts` module quizzes, Part I/II, mock papers) found two genuine
near-duplicate pairs — `p1-atomic-003`/`mock2-a-011` both asked for Cu's
exception configuration, and `p1-atomic-004`/`mock1-a-012` both ranked IE1
across Na/Mg/Al/Si — and, now that Phase A keys progress on explicit `id`
rather than a hash of the question text, it's safe to reword a shipped
question without orphaning anyone's progress. Revised the mock-paper copy of
each pair to test a different fact under the same id: `mock2-a-011` now asks
about Cr's analogous half-filled exception instead of repeating Cu, and
`mock1-a-012` now tests the P→S ionization-energy dip (Al/Si/P/S) instead of
repeating the Na/Mg/Al/Si ranking — which, pleasingly, is a fact the
periodicity theory block and trends chart already reference by name but no
question anywhere had actually tested.

**The bug:** [periodicity.ts](src/tabs/periodicity.ts)'s Slater's-rules
calculator filled `3d` before `4s4p` in its grouping order. For every
element up to Ca (Z ≤ 20) — the calculator's entire range — this is
backwards; real potassium and calcium are 4s¹/4s², not 3d¹/3d². Selecting K
or Ca showed "outermost group 3d" with a fabricated Zeff, contradicting both
real chemistry and this app's own `quantum.ts` electron-configuration
builder two clicks away, which has always used the correct order. Fixed by
reordering the fill sequence to match Madelung's rule; K now correctly shows
group 4s4p with Zeff = 2.20 (verified against Na's Zeff, also 2.20 — the
standard textbook value confirming the fix). Caught by tracing the fill
logic by hand for Z=19/20 before trusting the tool's own output, not by
eyeballing the UI.

That same fixed calculator turned out to have zero missions on it, alongside
periodicity.ts having no missions anywhere in the whole tab (unlike
quantum.ts's four and gases.ts's now-seven) — and the fix itself surfaces a
genuinely interesting, non-obvious result: Na's and K's valence-electron Zeff
are nearly identical (2.20 vs 2.20) despite K having 8 more protons, because
each added proton down a group is almost exactly cancelled by an added full
shell of shielding. Added `msn-per-01` to teach exactly that — a real
"driven by the newly-fixed tool" mission, verified live end to end.

Added 3 new Part II FRQs (`p2-atomic-004..006`, one Platinum):
`p2-atomic-004` gives two hydrogen emission wavelengths and asks the student
to identify the series and predict a third line — the Platinum move is part
(c), where assuming the Paschen series (n_f=3) for the given data produces a
literal negative number under a square root, proving the assignment wrong
rather than just asserting it. `p2-atomic-005` is the Slater's-rules
resolution of the "4s fills first but ionizes first" paradox (Zeff(4s)=3.75
vs Zeff(3d)=6.25 in Fe, hand-verified against the standard literature
treatment of this exact question) — a direct answer to a fact `quantum.ts`'s
own config-builder caption already states ("Cations lose 4s before 3d") but
never explains. `p2-atomic-006` is the photoelectric effect done
quantitatively (work function, stopping potential, threshold wavelength),
which the corpus previously only tested conceptually. Atomic Structure moved
from 2 Gold/1 Platinum to 4 Gold/2 Platinum (of 84) — still the thinnest
topic in the corpus by count, so a strong next candidate to revisit.
`tsc --noEmit`, `npm run build`, and the duplicate-id/answer-index audit are
all clean; the Slater's-rules fix, the new mission, both revised mock
questions, and all three new FRQs were exercised live in the browser.

**Bonding & Structure — done.** Manual read of all 58 bonding-tagged
questions found one more real duplicate: `p1-bonding-002` and `mock1-a-015`
both asked for CO₂'s carbon hybridization, nearly word-for-word. Revised
`mock1-a-015` to ask about formaldehyde's carbon (sp², not CO₂'s sp) instead
of repeating the fact. Also added two missing `misconception` annotations to
existing questions rather than writing new ones: `bon-013` (polar bonds vs.
polar molecule — CCl₄/CO₂/BF₃/XeF₄ all have polar bonds but cancel by
symmetry) and `bon-022` (the "π2p below σ2p" MO ordering is the exception for
B₂/C₂/N₂ specifically, from s–p mixing, not a universal rule — it flips back
at O₂).

[bonding.ts](src/tabs/bonding.ts)'s VSEPR table and MO-diagram engine were
both hand-verified extensively — every VSEPR angle/hybridization/example
against the standard chart, and the MO bond-order/paramagnetism logic traced
by hand for O₂, O₂⁻, B₂ and C₂ (all correct, including the unusually-written
but correct Hund's-rule unpaired-electron formula). No errors found, but the
whole tab had **zero missions** on either card despite bonding being the
module every other Foundations topic depends on. Added two: `msn-bon-01` on
the VSEPR card (find the two shape classes — AX₂E₃ and AX₄E₂ — that carry
lone pairs yet are still nonpolar, a genuine counter-example to "lone pairs
make things polar") and `msn-bon-02` on the MO card (of several even-electron
diatomics, which one is paramagnetic anyway — O₂, the single most famous
Lewis-theory failure). Both verified live, including wrong-then-right
feedback on the MO mission.

Added 2 new Part II FRQs (`p2-bonding-004..005`, one Platinum), both on
molecules absent from the corpus until now: `p2-bonding-004` walks through
CO's formal charges (−1 on carbon, +1 on oxygen — backwards from what
electronegativity alone predicts), why that nearly cancels CO's dipole and
even reverses its direction, and connects it to why CO binds hemoglobin
through carbon and is toxic; `p2-bonding-005` uses ozone's two identical
measured O–O bond lengths (127.8 pm each) as direct experimental proof of
resonance delocalization, and asks students to justify O₃'s polarity from
its bent shape despite the resonance averaging. Bonding moved from 3 Gold/1
Platinum to 4 Gold/2 Platinum (of 58). `tsc --noEmit`, `npm run build`, and
the duplicate-id/answer-index audit are all clean; both new missions and
both new FRQs were exercised live in the browser.

**Kinetics — done.** Unlike the other topics so far, kinetics has no
dedicated module — it's folded into `aek.ts` (Acids, Redox & Kinetics) and
its 23 questions are scattered across Part I, mock papers, Part II and CCO
PS4, tagged `topic: 'kinetics'` individually rather than inherited from a
module. Worth checking on exactly *because* it's easy for a shared tab to
get shortchanged — it turned out not to be: it already had the best
Gold/Platinum ratio of any topic before this pass (4/2 of 23), and manual
read of all of it (MC, both existing Part II FRQs, both CCO PS4 problems,
both mock-paper B-section FRQs) found **no chemistry errors**, including
re-deriving the Eyring-plot and competitive-inhibition numbers in
`cco-ps4-001/002` by hand.

Found one near-duplicate in scenario phrasing rather than a straight
content copy: `p1-kinetics-002` and `mock2-b-003` both used the same
"doubling [A] doubles the rate; doubling [B] does nothing" framing — the FRQ
adds real value beyond the MC (it also asks for *k* and a mechanistic
interpretation), so this wasn't a pure duplicate to fix by rewriting the
underlying fact, just overlapping wording. Reworded `mock2-b-003`'s prompt
into a data table (matching `p2-kinetics-001`'s style) with the same
first-order-in-A/zero-order-in-B result, removing the phrase-level overlap
without changing what it tests.

[aek.ts](src/tabs/aek.ts)'s kinetics section (`makeKinetics()`) was hand
audited in full — the integrated rate law formulas, the mystery-data
"determine the order from a table" mission (verified the buried second-order
data: half-life exactly doubles, 12.5 s then 25 s, k = 0.08 M⁻¹s⁻¹), and the
Arrhenius "rate doubles per 10°C" mission (Ea ≈ 53 kJ/mol at room
temperature, and the explain text's claimed ×7 at 150 kJ/mol and ×1.3 at 20
kJ/mol both check out exactly). All correct, and — a genuine first for this
workflow — this simulation already had 5 missions covering its controls
thoroughly, so no new mission was added here; the honest answer to "should
another mission be added?" was no.

Added 2 new Part II FRQs (`p2-kinetics-003..004`, one Platinum), both
introducing techniques absent from the rest of the corpus: `p2-kinetics-003`
derives N₂O₅'s real experimental first-order rate law from a proposed
3-step mechanism via the **steady-state approximation** — a different
technique from the pre-equilibrium method the existing theory block and
`p1-kinetics-005` already cover, so it's new territory rather than a
repeat, and ends by asking why a multi-step mechanism is chemically
necessary at all rather than a single step matching the overall equation.
`p2-kinetics-004` quantifies how much Ea a catalyst actually needs to lower
to explain a given rate boost (assuming unchanged A), then corrects the
intuitive-but-wrong objection that a "small" kJ/mol change can't explain a
large-fold rate change (it can — k depends exponentially on Ea/RT, not
linearly on Ea), and closes by showing a catalyst's *relative* speedup
shrinks at higher temperature even with the same absolute ΔEa. Kinetics
moved from 4 Gold/2 Platinum to 5 Gold/3 Platinum (of 25) — proportionally
now the strongest-covered topic in the whole corpus. `tsc --noEmit`,
`npm run build`, and the duplicate-id/answer-index audit are all clean; both
new FRQs and the reworded mock question were exercised live in the browser.

**Stoichiometry & Solutions — done.** Manual read of all 51 pre-existing
stoich-tagged questions found the same pattern once more: one genuine
duplicate, otherwise no chemistry errors. `sto-009` and `mock1-a-001` used
the *exact same percentages* (40.0% C, 6.7% H, 53.3% O) for the same
empirical-formula question. Reworded `mock1-a-001` to a different real
compound — oxalic acid, 26.7% C / 2.2% H / 71.1% O, empirical formula CHO₂
— rather than repeating CH₂O under different cosmetic wording.

[stoich.ts](src/tabs/stoich.ts) — the limiting-reagent visualizer, the
molarity/dilution calculators, and the %-yield tool — all checked out
correctly (reaction molar masses, the mol/coefficient limiting-reagent
logic, M₁V₁=M₂V₂, the >100%-yield trap). Like periodicity.ts and
bonding.ts before this pass, it had **zero missions anywhere** — notable
because this is the very first topic in the whole course (no prerequisites
in `topics.ts`). Added two: `msn-stoich-01` on the limiting-reagent card
(find mole amounts where *neither* reactant is left over — a perfectly
stoichiometric mixture — which doubles as the setup for the real lesson,
that industrial processes deliberately avoid this exact mixture by running
one reagent in excess) and `msn-stoich-02` on the molarity calculator (hit
a target concentration by solving backward for mass — deliberately
open-ended, since many mass/volume/molar-mass triples all work and the
point is the ratio, not memorizing one answer). Both verified live,
including the open-ended one accepting a self-chosen mass.

Added 2 new Part II FRQs (`p2-stoich-004..005`, one Platinum), both
patterns absent from the rest of the corpus: `p2-stoich-004` determines a
Zn/Mg alloy's composition from its total mass and the total moles of H₂
produced with excess HCl — two equations, two unknowns, and the part (d)
payoff is *why* the method works at all (same total mass, different molar
masses, therefore different moles of gas per gram — that's the second
independent equation). `p2-stoich-005` is "yields multiply, they don't
average": a 3-step synthesis where naively averaging the step yields
(84.3%) badly overstates the true compounding result (59.7%), a genuine and
costly real-world synthesis-planning mistake. Stoichiometry moved from 6
Gold/1 Platinum to 7 Gold/2 Platinum (of 53). `tsc --noEmit`, `npm run
build`, and the duplicate-id/answer-index audit are all clean; both new
missions and both new FRQs were exercised live in the browser.

**Thermodynamics — done.** The largest topic in the corpus (135 questions
before this pass) and the second to turn up a genuine defect. Manual read of
everything tagged `thermo` — the `thermo1`/`thermo2` module quizzes, the
`physchem`/`biophys` banks that also map onto this exam topic, Part I, Part
III, both Part II FRQs, five mock-paper items plus three mock B-section FRQs,
the two Integrated problems and `cco-ps4-003` — plus a hand-check of every
formula in [thermo1.ts](src/tabs/thermo1.ts) and [thermo2.ts](src/tabs/thermo2.ts)
(all three Hess cycles, all three bond-enthalpy reactions, the Born–Haber
solve, the microstate counting, the Gibbs crossover and the ΔG°↔K converter —
all correct).

**The bug:** `phy-011` had the **wrong answer keyed**. The question spells out
its own arithmetic — E = (0.0592/2)·log(1.0/0.01) — which is 0.0592 V, and the
`why` text derived exactly that, but `a` pointed at 0.0296 V. A student doing
the calculation correctly was told they were wrong, and then shown an
explanation that agreed with them. Fixed to `a: 0`, with the distractor set
rebuilt (0.0148 V replaces the now-duplicated value) and the `why` rewritten to
name the two slips — dropping n = 2, and forgetting log 100 = 2 — that happen
to cancel and produce the keyed-in wrong answer. This is the class of error
`auditCorpus()` structurally *cannot* catch: the index is in range, it is just
pointing at the wrong option. Only reading the chemistry finds it.

Two real duplicates, both fixed by rewriting the copy rather than deleting it:
`mock1-a-024` repeated `th2-025` with **the same four options in the same
order** (which is why the Jaccard scan missed it — the stems are worded
differently), and `mock4-b-001` repeated `p2-thermo-002` almost part for part
(same N₂O₄ ⇌ 2NO₂ system, same ΔH°/ΔS°, same ΔG° → T → K sequence).
`mock1-a-024` now computes ΔH − ΔU = Δn(gas)RT for 2CO + O₂ → 2CO₂, a
calculation nothing in the corpus had ever asked for numerically; `mock4-b-001`
becomes the contact process (ΔH° = −197.8 kJ/mol, ΔS° = −188 J/mol·K → ΔG° =
−141.8 kJ/mol, crossover 1052 K, K ≈ 7×10²⁴), which is the (−,−) sign case and
the *opposite* of the case `p2-thermo-002` teaches. Also fixed: `th2-020`'s
`why` contained a garbled half-edit ("589 vs… well, O₃ 239 > O₂ 205"), and
thermo1.ts's Born–Haber caption claimed NaCl gives U ≈ −786 kJ/mol while its
own calculator returns −788 — the value `mock5-b-003` uses.

Added 3 new Part II FRQs (`p2-thermo-003..005`, **two Platinum**), each using a
technique the corpus mentioned but never exercised:

- `p2-thermo-003` (Platinum) — a bomb calorimeter standardised against benzoic
  acid, then used on octane, then the ΔU → ΔH conversion. The corpus said
  "bomb measures ΔU, coffee-cup measures ΔH" in three places and never once
  made anyone convert between them. The trap is Δn(gas) = 8 − 12.5 = −4.5: the
  nine waters are *liquid* in a sealed bomb at 25 °C and contribute nothing.
  Verified end to end — 10.50 kJ/°C, ΔU = −5458 kJ/mol, ΔH = −5469 against a
  literature −5470.
- `p2-thermo-004` — Kirchhoff's law, which both the thermo1 theory block and
  `phy-018` name but no question had ever used. ΔCp = −45.46 J/mol·K moves the
  Haber ΔH° from −92.2 kJ/mol at 298 K to −110.5 at reactor temperature, ~20%
  more heat to remove than the table value suggests, and part (d) turns that
  back on the van't Hoff assumption that ΔH° is T-independent.
- `p2-thermo-005` (Platinum) — supercooled water freezing at −10 °C. ΔS_univ =
  +0.81 J/mol·K at 263 K and −0.80 at 283 K, from Kirchhoff-corrected ΔH and
  ΔS, and then the payoff: ΔG computed independently gives −213 J and +227 J,
  which are exactly −TΔS_univ. The point of the problem is that **ΔG is not a
  separate criterion** — it is the second law rewritten so only system
  properties appear, which is why it works only at constant T and P.

Thermo moved from 48 Gold/3 Platinum to 49 Gold/5 Platinum (of 138).

Three new missions. thermo1.ts had **four cards and no missions at all** —
the fourth tab in a row (after periodicity, bonding and stoich) to be in that
state, and by some distance the most-visited of them:

- `msn-th1-01` (calorimetry) — put ≥ 400 g of lead at 100 °C against water at
  20 °C and *still* keep the mixture below 25 °C. Maxing the lead slider is
  not enough (500 g of lead against the default 200 g of water lands at 25.7 °C
  and fails); the student has to raise the water mass, which is the whole
  lesson. Payoff: mc for 400 g of lead is 51 J/K against 1254 J/K for 300 g of
  water — the lighter substance wins thermally by 25×.
- `msn-th1-02` (bond enthalpies) — a numeric mission asking where the 92 kJ
  gap between the bond-sum estimate (−798) and the data-book value (−890) comes
  from. Answer ≈ 88 kJ, the condensation of 2 mol of water, because bond
  enthalpies are gas-phase quantities and therefore silently compute combustion
  to *steam*. That is the higher/lower heating value distinction, and the reason
  a condensing boiler can be quoted at over 100% efficiency. Accepts 78–98 kJ so
  ΔH_vap taken at either 25 °C or 100 °C is marked right.
- `msn-th2-03` (microstates) — push N until the even split outnumbers the
  all-on-one-side arrangement by 10³⁰. It takes **104 molecules**, which is the
  striking part; a single breath holds ~10²², for which the exponent is of
  order 10²¹. Checked offline first: N = 102 gives 10²⁹·⁶ and must *not* pass,
  N = 104 gives 10³⁰·², and the default N = 40 sits at 10¹¹·¹.

`tsc --noEmit`, `npm run build` and the duplicate-id/answer-index audit are all
clean, with no console errors. Verified live in the browser: both thermo1
missions (including wrong-then-right on the numeric one), the microstates
mission failing at N = 102 and completing at N = 104, all three new FRQs
rendering with their KaTeX and `.trap` markup intact, the rewritten
`mock4-b-001` and `mock1-a-024`, and `phy-011` now scoring 0.0592 V as correct.

**Laboratory — done.** The most lopsided topic in the corpus going in: 44 Gold
against a single Platinum in 96 questions, and — the real finding — **exactly
one multi-part written problem in the entire lab corpus** (`p2-lab-001`). Lab
is the one topic where an olympiad actually hands you a procedure and a page of
data, and 95 of its 96 items were one-line multiple choice. Manual read of all
of them (`labdata`, `labtech` and `analytical` module quizzes, 11 Part III
scenarios, 5 mock-paper items) plus a formula-by-formula check of all three
simulation files.

**The bug:** [labdata.ts](src/tabs/labdata.ts)'s qualitative-test table had the
ceric ammonium nitrate test **backwards** — listed as "red → amber" when the
reagent is amber and turns *red* on an alcohol. A student running the test
would have read a positive result as a negative one. Everything else in that
table (Tollens, Fehling's, 2,4-DNP, iodoform, Lucas, Baeyer, FeCl₃) checked out,
as did the flame colours and the halide precipitates.

**An inert control, which is its own kind of wrong.**
[labtech.ts](src/tabs/labtech.ts)'s TLC card had an "eluent polarity" slider
that changed nothing but the label text, sitting directly under a caption
asserting that "raising eluent polarity raises every R_f". The card told a
causal story and then refused to demonstrate it — the exact failure Phase B
exists to fix, hiding inside a tab that otherwise looks finished. The slider
now drives the plate, using the linear-solvent-strength relation (log k falls
linearly with % modifier, S ≈ 0.025/point) anchored on whatever spot/front the
student last measured, so setting the sliders to a real plate re-anchors the
model rather than fighting it. Verified across the range: 30% → R_f 0.64,
15% → 0.42, 5% → 0.28, 70% → 0.94 (which correctly trips the card's own
"R_f too high" warning). Also clamped the recrystallization card's hot-solubility
slider against its cold one — the pair could be crossed into a solubility curve
that *falls* with temperature.

`lbt-027` was a definitional repeat of `lbd-004` ("accuracy vs precision")
sitting in a CCO-pitched bank where `tierOf()` counts it as Gold. It now asks
whether a suspect titre may be discarded by the Q-test — filling a genuine hole,
since [labdata.ts](src/tabs/labdata.ts) ships a **Q-test calculator that no
question in the corpus referenced**.

Added 3 new Part II FRQs (`p2-lab-002..004`, one Platinum), quadrupling the
topic's written-problem count from 1 to 4:

- `p2-lab-002` — standardising NaOH against KHP, then propagating the
  uncertainty (the buret's 0.164% swamps the balance's 0.039%, so the answer
  is 0.1027 ± 0.0002 M and a fifth figure would be a lie), then the payoff:
  undried KHP carrying 0.4% moisture biases the result high by **more than
  twice** the random uncertainty just computed so carefully — and that bias
  propagates undiminished into every solution the NaOH is later used on.
- `p2-lab-003` (Platinum) — a spectrophotometric determination where nothing is
  clean: the calibration line has a real intercept (and forcing it through zero
  is explicitly the wrong fix, since that smears the offset into the slope), the
  sample reads A = 1.42 and must be diluted, and the triplicate results hit a
  Q-test at 0.947 against a critical 0.941 — a rejection so marginal the
  solution says so. Part (d) is the instrument reasoning the corpus never had:
  at A = 1.42 stray light makes high absorbances read systematically *low*, so
  the raw number is not merely imprecise but biased.
- `p2-lab-004` — recrystallization arithmetic with a trap worth more than the
  arithmetic: minimum solvent gives 90.0% recovery, 3× the solvent gives 70.0%,
  and a classmate who ice-crashes the flask "recovers" 4.7 g — more than the
  theoretical maximum, because the excess is occluded solvent and trapped
  impurity. Confirmed by a melting point that is depressed and broadened, which
  leads into what a melting point does and does not prove (purity, not identity
  — hence the mixed melting point).

Lab moved from 44 Gold/1 Platinum to 46 Gold/2 Platinum (of 99).

Three new missions; both `labdata.ts` and `labtech.ts` had none:

- `msn-lbd-01` (Beer's law) — the unknown reads A = 1.40, off the top of the
  range; dilute 10.00 → 50.00 mL, re-read 0.28, report the *original*
  concentration. The numeric window is deliberately wide enough to survive the
  card's own regenerated calibration noise while still rejecting the answer of
  a student who forgets the ×5.
- `msn-lbd-02` (Q-test) — the card opens on 10.1, 10.2, 10.3, 10.9, where the
  obvious outlier gives Q = 0.750 against Q_crit = 0.765 and therefore **stays
  in the average**. The two "keep" options differ only in their reason, so
  guessing the verdict is not enough.
- `msn-lbt-01` (TLC) — bring an R_f of 0.64 into the 0.30–0.50 window by
  changing the eluent alone, which only became possible once the slider was
  made real.

`tsc --noEmit`, `npm run build` and the audit are clean, no console errors.
Verified live: the eluent slider moving the spot in both directions with the
predicted magnitudes, all three missions (including wrong-then-right on both
graded ones), the four lab FRQs rendering with their data tables, and the
rewritten `lbt-027`. Two numeric claims written into the FRQ solutions were
caught and corrected during that check by recomputing them rather than trusting
the draft — the Q-test boundary value in `p2-lab-003(c)` and the direction of
the moisture bias in `p2-lab-002(c)`.

**Also noted, not acted on:** `analytical.ts` carries its own TLC R_f card,
duplicating `labtech.ts`'s — two calculators for the same quantity in the same
nav group. Merging is a content-deletion call, which this workflow leaves to a
human with the report in hand.

**Acids & Bases — done.** 4 Gold/2 Platinum of 57 going in, the thinnest Gold
layer in the corpus. Manual read of everything tagged `acids` (the `aek` module
quiz, 10 Part I, 4 Part III, 2 Part II, 14 mock-paper items, `cco-ps1-001` and
`int-echem-eq-003`) found no chemistry errors in the questions — but a real one
in the simulation.

**The bug: the titration curve was drawn wrong for every weak acid.** The
pre-equivalence branch of `pHat()` in [aek.ts](src/tabs/aek.ts) used
Henderson–Hasselbalch, which assumes [HA] and [A⁻] are just the amounts you
mixed. That fails wherever [H⁺] is not small compared with them — and at the
start of a titration [A⁻]<sub>mixed</sub> → 0, so it fails completely: the app
drew 0.10 M acetic acid starting at **pH 0.34** instead of its true **2.87**,
a spurious cliff at the left edge of every weak-acid curve, on the most-visited
simulation in the app. (The *live readout* at V = 0 was right, because a
separate special case handled exactly zero — so the number and the graph
disagreed with each other.) Replaced with the exact solution of
[H⁺]² + (K<sub>a</sub> + C<sub>A</sub>)[H⁺] − K<sub>a</sub>C<sub>HA</sub> = 0,
which covers the whole region including V = 0 and agrees with H–H to four
decimals mid-buffer, written in the rationalised form 2ac/(b + √(b²+4ac))
because the plain quadratic root subtracts two nearly equal numbers near
equivalence. Verified in the browser: the curve now starts at 2.87, and the
half-equivalence (pH = pK<sub>a</sub> = 4.74) and equivalence (8.72) markers are
unmoved.

Three genuine duplicates, all "mock paper repeats a module warm-up with the
same numbers", rewritten under their existing ids to test facts nothing else
covered: `mock2-a-006` (was the conjugate base of HSO₄⁻, identical to
`p1-acids-001`) now asks about the **levelling effect** — a classic that was
entirely absent from the corpus, including why ranking HCl/HBr/HClO₄ requires a
differentiating solvent; `mock2-a-007` (was the pH of a 0.10 M weak acid with
Ka = 10⁻⁵, identical to `aek-012` down to the numbers) now computes the pH of
0.10 M NaF from K<sub>b</sub> = K<sub>w</sub>/K<sub>a</sub>, a hydrolysis
calculation the corpus only ever asked qualitatively; `mock1-a-006` (was the pH
of 0.010 M HCl, identical to `aek-001`) now asks what tenfold dilution does to a
buffer's pH *and* its capacity — the same ratio-versus-moles distinction as the
strong-vs-concentrated misconception box.

Added 3 new Part II FRQs (`p2-acids-003..005`, one Platinum):

- `p2-acids-003` (Platinum) — **the problem this phase's own tier table names as
  the Platinum example** ("unknown acid + titration curve — identify it and
  justify"), and which the corpus did not have. An 11-point pH/volume data set:
  find the equivalence point (and why "where pH = 7" is wrong — this curve
  crosses 7 at 24.96 mL, before equivalence), get M = 180.2 g/mol, get
  pK<sub>a</sub> = 3.50 from half-equivalence, and identify aspirin against a
  five-acid table. The equivalence pH is then computed independently from
  K<sub>b</sub> and lands on 8.01, the measured value — three agreeing
  measurements is what makes it an identification rather than a guess. Part (e)
  is the sting: with methyl orange the endpoint reads ~22.2 mL, giving
  M ≈ 203 g/mol — within 2% of ibuprofen, so the wrong indicator yields a
  *plausible wrong identification from the same table*.
- `p2-acids-004` — the exact treatment of 10⁻⁸ M HCl. The corpus asserted "pH
  6.98, not 8" as a trap in three places and never derived it. Charge balance →
  quadratic → 6.98, then the number that makes it click: **90.5% of the H⁺ came
  from water**, and a closing part on where the correction stops mattering
  (~10⁻⁶ M, where water contributes 1%).
- `p2-acids-005` — blood's bicarbonate buffer, which works well at 1.3 units
  from its pK<sub>a</sub> because it is an **open** system. Same 2.0 mmol/L acid
  load costs 0.46 pH units closed and 0.04 open, computed both ways. Part (d)
  unpacks two nested layers of apparent constant: 6.1 vs the tabulated 6.35
  (37 °C and ionic strength 0.15 M), and why even 6.35 is not H₂CO₃'s
  pK<sub>a</sub> — it is written against *total* dissolved CO₂, of which only
  ~1/400 is hydrated, so the true value is near 3.6.

Acids moved from 4 Gold/2 Platinum to 6 Gold/3 Platinum (of 60).

**No new mission, deliberately.** The acid–base tab already carries four
(equivalence point, indicator choice, Henderson–Hasselbalch ratio, exceeding
buffer capacity) covering every control on both cards — the second time this
workflow's honest answer to "should another mission be added?" has been no.

One layout bug found and fixed in verification: the 11-column data table spilled
outside its card, because `.ref-table` is `width: 100%` with no escape hatch.
Added `.table-scroll` to [style.css](src/style.css) — a wrapper that scrolls the
*table* inside the card rather than letting the page scroll — and applied it.
Any future wide table gets the same treatment.

`tsc --noEmit`, `npm run build` and the audit are clean, no console errors, and
the curve fix, both rewritten mock questions and all three FRQs were exercised
live. Two solution numbers were recomputed and corrected during that check
rather than trusted: the exact [H⁺] at 10⁻⁶ M, and the whole of the pK′
explanation in `p2-acids-005(d)`, whose first draft had the hydration correction
running in the wrong direction.

**Not yet done:** redox, descriptive, organic. Repeat this workflow one at a
time. `redox` is the natural next one — 5 Gold/3 Platinum of 31, and it shares
`aek.ts` with the acid–base card just corrected, whose electrochemistry section
has had no audit and carries no missions at all.

---

## Phase D — Progress, visible (1 week) · *originally "Phase 4"*

Accounts already exist. This is the **display layer** over Phase A's attempt log —
which is why it must come after A, and why it's one week rather than three.

- [ ] Dashboard route (`/progress`) — topics covered, accuracy, attempt count
- [ ] Per-topic mastery bars in the sidebar and on topic cards
- [ ] **Weak topics** — `accuracyByTopic()` sorted ascending, top 3 surfaced
- [ ] **Quiz history** — recent attempts, filterable, with the ability to retry
      exactly the ones you got wrong
- [ ] **Streak** — consecutive days with ≥1 attempt, from `answered_at`
- [ ] **Bookmarks** — `bookmarks` table, same RLS pattern; bookmark button on
      topics and individual questions
- [ ] Completed-lesson marking (explicit, plus auto when the quiz is finished)

---

## Phase E — Smarter learning (1–2 weeks) · *originally "Phase 5"*

Every item here is a query against the Phase A registry.

- [ ] **Search** — client-side index over `TOPICS` + `ALL_QUESTIONS` titles and
      prompt text. Keyboard-first (`/` to focus, arrows, enter). No dependency
      needed at this size; a scored substring match is enough.
- [ ] **Learning paths** — ordered topic sequences ("CCC in 6 weeks", "Organic
      from scratch"). Data, not code: a new array in `topics.ts`.
- [ ] **Recommended next lesson** — currently strictly linear via `TOPICS` order
      in [main.ts](src/main.ts). Upgrade to consider prereqs met, weak topics,
      and completion.
- [ ] **Personalized review** — auto-built set from wrong answers, oldest-first.
      This is the highest-value item in the phase; it is what turns the attempt
      log into actual learning.
- [ ] **Topic filtering** on the menu page — by group, difficulty, and completion

---

## Phase F — Competition modes (1 week) · *originally "Phase 6"*

> "Support multiple Olympiads without duplicating lessons."

Correct instinct, and the `comps` field from Phase A is exactly how you avoid the
duplication. A mode is a **filter over shared content**, never a second copy.

- [ ] Mode selector: CCC · USNCO · CCO · IChO, persisted per user
- [ ] Mode filters: which questions appear, which tier is emphasized, which
      topics are in scope (IChO covers material CCC does not), and which
      recommendations surface
- [ ] Progress tracked per mode — "72% CCC-ready" is a far better motivator than
      a raw solved count
- [ ] Mode-specific exam simulation: correct question count, correct time limit,
      correct part structure. `bankOlympiad.ts` already has the shape for this.

---

## Phase G — Explanations (1 week, gated) · *originally "Phase 7"*

Run the phases in the order given; **do not skip to the AI step.**

- [ ] **G.1 — Handwritten alternate explanations.** A second `why2` on the
      questions students most often miss (Phase A's attempt log tells you which
      ones — that data does not exist until then, which is the whole argument for
      writing this by hand first).
- [ ] **G.2 — Misconception explanations.** Already covered in B.2.
- [ ] **G.3 — "Explain differently" button.** Gate on a real, observed request
      rate from G.1 usage.

**Engineering note:** this is the only phase that adds a backend and a recurring
cost. An API key cannot ship in a Vite client bundle — it would be extracted
within a day of the repo or the deployed JS being read. It needs a Netlify
Function proxying the request, plus rate limiting per user, or the first person
who finds it runs up your bill. That is a real week of work and a real monthly
cost, for a feature whose demand is currently unmeasured. **Everything in Phases
B and C beats it on impact per hour.** Revisit after users exist.

---

## Phase H — Discoverability and users (ongoing) · *originally "Phase 8"*

### H.1 Make the site crawlable (half day)

`#app` starts `hidden` and every page is JS-constructed, so a crawler or a
no-JS visitor sees an empty document. Phase 0.2's OG tags fix link *unfurling*;
this fixes *search*. They are different problems and both are worth solving.

- [ ] Build-time prerender: emit a static HTML shell per `/topic/:id` from the
      `TOPICS` metadata (title, blurb, group, difficulty) — a small Vite build
      script, no framework change, no SSR runtime
- [ ] Per-route `<title>` and `og:*` (a shared link to *one topic* should unfurl
      as that topic)
- [ ] `<noscript>` summary with the topic list
- [ ] `sitemap.xml` + `robots.txt` generated from `TOPICS`

### H.2 Feedback loops — build before recruiting users

There is no point getting 50 users if nothing captures what they hit.

- [ ] Helpful / Not helpful on every explanation (one table, question id + verdict)
- [ ] Feedback form and bug report — **`textContent` only, per 0.5**
- [ ] Lightweight, privacy-respecting analytics: which topics get opened, which
      get abandoned, which questions get skipped

### H.3 Reach (after H.1 and H.2 are live)

- [ ] Chemistry teachers, olympiad Discords, relevant subreddits, school clubs
- [ ] "CCC Study Guide" / "USNCO Study Guide" landing pages — real search demand,
      and they are assembled from content you already have
- [ ] Short explainer videos if the earlier items show real traffic

---

## Suggested six months

Adjusted for what already exists and for the Phase A dependency.

| Month | Focus |
| --- | --- |
| **1** | Phase 0 (week 1) → Phase A. Unglamorous; unblocks everything after it. |
| **2** | Phase B — missions and misconceptions. Biggest jump in *felt* quality. |
| **3** | Phase C — tier, cut, and write Gold/Platinum. Plus challenge mode. |
| **4** | Phase D + H.1/H.2, then recruit the first 25–50 users. |
| **5** | Fix what they complain about. Phase E if the feedback points there. |
| **6** | Phase F, then ChemPrep 2.0. |

Phase G stays parked unless month 4–5 feedback demands it.

---

## The filter

> Before adding any feature, ask: **"Will this help an Olympiad student
> understand chemistry better, or solve harder problems?"**
> If yes, build it. If not, spend the time on something with greater
> educational impact.

Two things this filter should be pointed at first, because they are the ones
most likely to eat time without returning any:

- **Phase G's AI explanations** — real backend, real cost, unmeasured demand.
- **Any new topic module.** Coverage is close to complete at 25. Depth in the
  25 that exist beats a 26th.

The one measurement that matters more than anything else on this page: **get it
in front of 25 real students.** Twenty hours building the wrong feature is a
worse outcome than one hour reading feedback that redirects you.
