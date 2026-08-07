# ChemPrep — Roadmap

> "You've already built the platform. Now build the learning experience."

This is the working plan. It is ordered by **impact ÷ effort**, and it deviates
from the phase numbering in the original feedback in two places — both noted
inline, both because a dependency was hiding in the ordering.

**Phase D is the product-polish pass and the launch gate.** It was inserted
after C once the corpus work was underway, which pushed the four unstarted
feature phases down one letter (old D–H are now E–I; their headings record the
rename). Nothing in them changed but the letter.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Where the project actually is today

Verified against the source, not from memory. **This table is the snapshot from
the day the roadmap was written** — the accessibility and SEO rows were the
argument for Phase 0.3 and 0.2 and are no longer true. It is kept because the
two corrections below follow from it; for current state, read Phase D.

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
of the corpus (also what Phase C tiering and Phase F search will query).

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

That wiring landed: `quiz()` calls `recordAttempt` alongside `markSolved`
([framework.ts:435](src/tabs/framework.ts)), passing `toExamTopic(q.topic)` and
the chosen index.

**One boundary worth knowing before Phase E displays any of this.** Only
multiple choice records attempts. A written problem is self-marked with a
"solved" toggle in qbank.ts and challenge.ts, and a self-assessment is not a
graded answer — recording it would put an unverified verdict into
`accuracyByTopic()`, the same reason missions are barred from `recordAttempt`.
So **accuracy statistics describe the MC corpus only**, while the solved set
covers both. Phase E's dashboard has to say so, or a student reading "78% in
thermo" will think it includes the FRQs they worked through.

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
- [~] The remaining ~14–20 highest-impact gaps the audit identified.
      **`atomic` done** — it was the worst ratio in the corpus (4 Gold / 2
      Platinum of 84) and the two modules feeding it, `quantum` and
      `periodicity`, had no depth ladder at all above Silver. Four new Part II
      FRQs, `p2-atomic-007..010`, take it to **7 Gold / 3 Platinum of 88**:
      radiocarbon dating with an unsubtracted counter background (the age reads
      ~740 years too *young*, and the reference activity is already corrected —
      so the correction goes on one side of the ratio only); mass defect and
      the electron bookkeeping that quietly cancels for β⁻ and for the ⁵⁶Fe
      binding energy but costs 2mₑc² for β⁺ (²²Na: 2.843 MeV from atomic masses
      → 1.820 MeV measured positron endpoint) — `tier: 4`; the group-13
      ionization anomalies (Ga above Al by Slater, Z_eff 3.50 → 5.00; Tl above
      In by lanthanide contraction plus the relativistic 6s) with the Zr/Hf
      molar-volume payoff; and isotope abundances from a mass spectrum, with
      the 2pq cross-term and the M/M+2 test that separates one Cl (32%) from
      one Br (97%). The three nuclear items are the first in the corpus —
      `nuclear` maps to `atomic` and had contributed no Gold at all.
      Still open: `bonding` (4 Gold of 58), `states` (6 of 55), `stoich`
      (7 of 53), `kinetics` (a 25-item pool overall), and `lab`'s single
      Platinum against 46 Gold.
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

**Electrochemistry & Redox — done.** The first topic in this workflow where the
audit found **no errors at all** — and the finding is worth recording as a
negative result rather than glossed over. Every one of the 14 standard
potentials in `aek.ts`'s `COUPLES` table matches the literature; the galvanic
builder's electron count is the LCM of the two half-reactions (right, and not
obvious); ΔG° = −nFE°, log K = nE°/0.0592 and the Nernst term are all correct;
the Faraday calculator is right including the 22.7 L/mol molar volume at 1 bar;
and all four Latimer series were checked species by species against tabulated
values, with their disproportionation verdicts confirmed against real chemistry
(Cu⁺ yes, H₂O₂ yes, Cl₂ in base yes — the bleach reaction — MnO₂ in acid no).
Reading the 31 tagged questions turned up no chemistry errors either. One
cosmetic oddity noted and left alone: the `Couple` type's `ox`/`red` fields hold
the reduced and oxidised species respectively, i.e. backwards from their names —
but every use is internally consistent, so the rendered cell diagrams are
correct and renaming a field on a working structure is churn.

What redox actually lacked was **missions**: three cards, none of them with one,
the last unmissioned section in a tab whose other two sections have four and
four. Added one per card:

- `msn-aek-09` (galvanic builder) — kill a battery with concentration alone:
  build a real cell (E° ≥ 0.15 V) and drive E to zero with the log Q slider.
  The Zn/Cu default *cannot* be killed, and working out why is the mission:
  log K = nE°/0.0592 makes K = 10³⁷ there, so exactly two of the available
  pairs (Fe/Ni at 0.18 V and I₂/Fe³⁺ at 0.23 V) fall within the slider's reach.
  Both routes were checked offline before shipping.
- `msn-aek-10` (Faraday calculator) — plate 1.00 g of copper in exactly ten
  minutes, which needs ≈5.1 A. The payoff is the distinction the calculator
  cannot show on its own: current sets the *rate*, total charge sets the
  *amount*, and past a limiting current the deposit degrades because ions cannot
  diffuse in fast enough.
- `msn-aek-11` (Latimer card) — the same "tool with no question" gap the Q-test
  had in the lab pass. The card's caption states the electron-weighting rule and
  nothing in the corpus ever used it, so the mission asks for E°(MnO₄⁻/Mn²⁺)
  from the 3-electron and 2-electron steps: (3 × 1.70 + 2 × 1.23)/5 = **1.51 V**,
  which is exactly the value sitting in the galvanic builder's own couple list
  two cards up. The plain average, 1.465 V, is outside the accepted window —
  verified live that it is rejected.

Added 3 new Part II FRQs (`p2-redox-003..005`, one Platinum), all on ground the
topic's existing questions never touched:

- `p2-redox-003` (Platinum) — a full six-species Latimer diagram for manganese
  in acid: combine non-adjacent couples two ways, identify **both** species that
  disproportionate (MnO₄²⁻ and Mn³⁺) from the diagram alone, and write the
  balanced equation for the manganate disproportionation that turns green
  K₂MnO₄ into purple MnO₄⁻ plus brown MnO₂ the moment it is acidified.
- `p2-redox-004` — pH-dependence of a redox potential, which the corpus never
  addressed despite testing the Nernst equation five separate times.
  E(MnO₄⁻/Mn²⁺) = 1.51 − 0.0947·pH, so permanganate falls from 1.51 V to 0.85 V
  at pH 7 and its margin over Fe³⁺/Fe²⁺ (pH-independent, no protons in the
  equation) collapses from 0.74 V to 0.08 V. Part (d) explains the standard lab
  rule quantitatively: at 1.51 V permanganate sits above Cl₂/Cl⁻ at 1.36 V, so
  acidifying with HCl gives a titre that reads high — which is why the procedure
  says sulfuric acid.
- `p2-redox-005` — the chlor-alkali cell, where **thermodynamics loses to
  kinetics**: water oxidises at 1.23 V and chloride at 1.36 V, yet the cell makes
  chlorine, because oxygen evolution's overpotential reverses the order of the
  actual onset potentials. Then the industrial arithmetic — 914 kg Cl₂ and
  1032 kg NaOH per day at 30 kA and 96% current efficiency, in a fixed 1:2 mole
  ratio no plant can adjust — and 2420 kWh per tonne against a thermodynamic
  minimum of 1660, i.e. 68% voltage efficiency, with the rest going to the
  overpotential from part (c).

Also rewrote `mock1-a-009`, which duplicated `p1-redox-003` (both "subtract two
E° values"), into a balance in **basic** solution — a skill the corpus only ever
tested in acid. Redox moved from 5 Gold/3 Platinum to 7 Gold/4 Platinum (of 34).

`tsc --noEmit`, the build and the audit are clean, no console errors, and all
three missions (including the Latimer one rejecting the plain average), all
three FRQs and the rewritten mock question were exercised live. One rendering
bug caught in that pass: `.ref-table th` is uppercase-styled, which is right for
word headings and mangles formulas — the Latimer diagram rendered "MnO₄²⁻" as
"MNO₄²⁻", fixed by using `<td><b>` for those cells. The `.table-scroll` wrapper
added during the acids pass earned its keep immediately, holding this
eleven-cell diagram inside its card.

**Descriptive & Inorganic — done.** The first topic whose headline audit number
was actively misleading. `descriptive` showed 43 Gold going in, the second-best
ratio in the corpus — but `tier` is *derived* from module `difficulty`, and its
three modules (`nuclear`, `coordchem`, `advinorganic`) are tagged CCO/IChO, so
all 76 of their quiz questions inherit Gold without anyone having curated them.
The real state was 2 Part II FRQs (against equilibrium's 7 and atomic's 10) and
**zero missions and zero misconception fields across all three tabs**.

Manual read of all 101 descriptive-tagged questions found no calculation errors
— every LFSE, radius-ratio, magnetic-moment and unit-cell value checked out,
including `cco-ps3-003`'s three radius ratios and `int-cft-mag-*`'s spin-only
moments. Three defects of a different kind:

- **`coo-009` taught a distinction it then got wrong.** It asked which
  configuration shows "only a WEAK" Jahn–Teller effect, and the correct option
  was high-spin d⁵/d³ — configurations with *no* JT effect at all. Its `why`
  contradicted its own answer ("uneven t₂g occupation gives only a small
  distortion", then picked the two evenly-occupied sets). Rewritten to ask for
  **no** distortion, with the three-way split spelled out: strong = uneven e_g
  (points AT the ligands), weak = uneven t₂g (points BETWEEN them), none = both
  even. Genuinely weak cases (d¹, d², low-spin d⁴/d⁵, high-spin d⁶/d⁷) were not
  among the options and now appear in the explanation.
- **A duplicate the near-duplicate detector cannot see.** `p1-descriptive-001`
  and `mock1-a-019` both asked for potassium's flame colour in different words,
  so their Jaccard similarity is low and the audit passed them — four of the 101
  questions were flame tests. `mock1-a-019` is now the brown-ring test for
  nitrate, which nothing in the corpus covered. **Lesson for D.9: token overlap
  finds re-worded questions, not re-asked *facts*.**
- `mock4-a-018` duplicated `p1-descriptive-003` (limewater → CO₂, flagged at
  0.80). Rewritten into the trap the pair was hiding: SO₂ *also* turns limewater
  milky, so the test identifies an acidic gas, not CO₂. The new item adds the
  discriminating observation — SO₂ is a reductant and decolourises MnO₄⁻.

Added 5 new Part II FRQs (`p2-descriptive-003..007`, one Platinum), all on
ground the topic never touched — the corpus had nothing at all on lattice
energy, extraction thermodynamics, period-3 periodicity, or spinels:

- `p2-descriptive-003` — Born–Haber for NaCl (−787) and AgCl (−915), then the
  *residual* against the ionic model (2.7% vs 9.8%) as the measure of covalent
  character. Part (d) uses hydration enthalpies to show why the salt with the
  larger lattice energy is the insoluble one, and why solubility is a small
  difference between two numbers near 1000 kJ mol⁻¹.
- `p2-descriptive-004` (Platinum) — an Ellingham diagram from raw ΔH°/ΔS°.
  Carbon reduces ZnO above **1252 K (979 °C)** and Al₂O₃ only above **2311 K
  (2038 °C)**, both computed from the crossing of two lines; the payoff is that
  Hall–Héroult exists because 2038 °C is impractical, not because the reaction
  is forbidden. Part (a) turns on the one sign that matters — 2C + O₂ → 2CO
  makes more gas than it consumes, so its line slopes the other way.
- `p2-descriptive-005` — period 3 across and down: oxide acid–base character
  from polarising power, MgO vs Al₂O₃ separated experimentally rather than
  asserted, and three distinct fates for chlorides in water (dissolution,
  cation hydrolysis, covalent hydrolysis). Part (d) is the CCl₄/SiCl₄ pair:
  ΔH ≈ −360 kJ mol⁻¹ for CCl₄ hydrolysis and it still does not happen, because
  "stable" means two different things.
- `p2-descriptive-006` — why Fe₃O₄ is an inverse spinel and Mn₃O₄ a normal one,
  from octahedral site preference energies computed in the student's own hands
  (Fe²⁺ −0.133 Δₒ, Mn³⁺ −0.422 Δₒ, both d⁵ ions exactly 0). Part (d) predicts
  hausmannite's tetragonal distortion from the Mn³⁺ d⁴ e_g occupancy — the same
  Jahn–Teller rule as `coo-009`, now deciding a crystal structure. The LFSE
  card's own caption already name-dropped "spinel site preferences" and nothing
  tested it.
- `p2-descriptive-007` — [NiCl₄]²⁻ vs [Ni(CN)₄]²⁻: one d-count, two geometries,
  told apart by magnetism. Part (c) is the trap: [PtCl₄]²⁻ is square planar with
  the *same* weak-field ligand, because Δ grows down a group — geometry follows
  the size of Δ, not the ligand alone.

**Six missions, the first in any of the three tabs.** Two chosen specifically
because the obvious version was already satisfied by the card's default state:
the 18-electron counter opens on ferrocene (18 e⁻), so the goal is the *other*
magic number — build 16 e⁻ on Rh/Ir/Pt, i.e. Vaska's complex, and the open site
that makes catalysis possible; and the unit-cell card opens on copper and
already reproduces copper's density, so the goal is tungsten (BCC, 19.25 g/cm³),
where getting Z wrong is an error of exactly ×2. The others: the one d¹⁰ ion
that cannot be coloured; Fe³⁺ + CN⁻ driving a d⁵ ion from 5 unpaired to 1;
LFSE to its −2.4 Δₒ floor; and the d⁴–d⁷ window where high and low spin actually
differ — which is also the repair for `coo-009`, since the Jahn–Teller card is
the one place the three-way strong/weak/none split is visible.

`tsc --noEmit`, the build, the corpus audit and `test-router.mjs` are all clean,
no console errors on the three routes. All six missions were exercised live and
each was confirmed **unsolved at the card's default state** before being driven
to completion. Descriptive moved from 43 Gold/5 Platinum to 47/6 (of 106).

One verification note worth recording: `slider()` coalesces its callback into a
`requestAnimationFrame`, and rAF is paused while the preview pane is hidden — so
driving a slider and reading the readout in the same tick shows stale state and
looks like a broken handler. It is not. Selects call their handler synchronously;
sliders need a frame.

**Organic, part 1 — mechanisms & synthesis — done.** Covering `organic1`,
`organic2`, `organic3` and `polymers` (101 module questions) plus the organic
items in Part I/III and the mock papers. `spectroscopy` and `structure` are
part 2 and are untouched here.

Manual read found **no chemistry errors** — every mechanism call, Zaitsev/
Hofmann assignment, aromaticity count and stereocentre count checked out,
including the ones easiest to get wrong (`mock5-a-016`'s nine primary hydrogens
in 2-methylbutane, `og3-022`'s conrotatory 4n thermal closure, `og3-016`'s
migratory aptitude order). Three defects, all of wording or redundancy:

- **`pol-023` had a garbled stem** — "Which is a reducing behaviour NOT expected
  of a typical polyalkene", where "reducing" is meaningless. The answer was
  right and the question was not answerable as written. Restated, with a `why`
  that now closes the loop the original left open: the missing reactive site
  that makes polyethylene inert to acids and bases is the same one that makes
  it persist in the environment.
- **`pol-003` and `pol-015`** were both "spot the condensation polymer"
  (flagged at 0.60). `pol-015` now contrasts nylon-6 with nylon-6,6 — same
  amide linkage, and only one of them a condensation polymer, because the
  mechanism is decided by whether a small molecule is expelled and not by what
  the linkage looks like. Nothing in the corpus had tested ring-opening
  polymerisation.
- **`mock3-a-016` and `p1-organic-001`** were both "name this branched alkyl
  chain" (0.75). `mock3-a-016` is now a longest-chain error: 2-ethyl-3-
  methylpentane is a correctly drawn structure with an incorrectly chosen
  parent, and the answer is 3,4-dimethylhexane.

  *A first draft of this replacement was itself wrong* — it asked students to
  "correct" 3-ethyl-4-methylhexane, which is already correct: both numbering
  directions give the locant set {3,4}, and the tie is broken by giving the
  lower locant to the substituent cited first alphabetically, which is exactly
  what that name does. Caught by working the rule through rather than trusting
  the intuition that a name with two different substituents must have a lower
  alternative.

`p1-organic-007` / `mock4-a-017` stays flagged at 0.56 and is **deliberately
kept**: one is a 2° alcohol going to a ketone, the other a 1° alcohol stopped at
the aldehyde by limiting the oxidant. Same reagent, opposite teaching points.

Added 5 new Part II FRQs (`p2-organic-003..007`, one Platinum):

- `p2-organic-003` — kinetic vs thermodynamic control, from the 71:29 → 15:85
  temperature flip in butadiene hydrobromination, and part (c) asks for the
  experiment that *proves* equilibrium control (warm the isolated 1,2-adduct and
  watch it convert). Part (d) carries the same logic to the two enolates of
  2-methylcyclohexanone. The corpus mentioned LDA once and never tested this.
- `p2-organic-004` (Platinum) — a Hammett analysis: extract ρ ≈ +2.2 from five
  rate constants, then read the mechanism off it. Sign gives the charge type
  (negative, so hydroxide attack building the tetrahedral alkoxide), magnitude
  gives how much (more than twice the benzoic-acid reference, so a late TS
  resembling the intermediate), and part (d) is the σ⁻ scale — a single point
  off the line means the wrong substituent constant, whereas a *break* in slope
  means the rate-determining step has changed.
- `p2-organic-005` — enantiomeric excess, which the corpus never quantified.
  50% ee is 75:25 and not 50:50; a zero rotation has three distinct causes; a
  solvolysis giving 20% ee *inverted* is direct evidence for intimate ion pairs
  rather than free carbocations; and resolution works by making the difference
  diastereomeric.
- `p2-organic-006` — Carothers with real numbers. Nylon-6,6's repeat unit is
  226.31 g/mol; DP 100 needs p = 0.990 and DP 200 needs p = 0.995, so the last
  half-percent of conversion doubles the chain; and a 2% stoichiometric excess
  caps DP at 101 **even at complete conversion**. `pol-024` asserted the
  equation, nothing made a student use it.
- `p2-organic-007` — one Diels–Alder answering four questions: the s-cis
  conformational requirement (why cyclopentadiene is fast and (2Z,4Z)-hexa-2,4-
  diene is dead), the endo rule as kinetic control by secondary orbital overlap,
  the "ortho/para" regiochemistry rule, and the Woodward–Hoffmann classification
  with a 4n+2 thermal disrotatory closure worked through to a cis product.

**Six missions, the first in any of these four tabs.** The decision engine's is
the one that repays the effort: bulky bases give elimination on 1°, 2° and 3°
substrates, so find the substrate where a bulky base still substitutes — methyl,
because it has no β-hydrogen and elimination is not disfavoured but impossible.
The EAS mission hunts the one substituent that deactivates and still directs
ortho/para (the halogens, where induction sets the rate and resonance sets the
position — two effects that everywhere else point the same way). The radical
calculator asks for a case where the *least* reactive site gives the *major*
product: isobutane's 9×1 against 1×5 gives 64.3% primary, which is why radical
chlorination is preparatively useless; its follow-up asks why bromination
reverses this, with Hammond against three plausible-sounding distractors. The
two polymer missions drive PDI to exactly 1.00 (achievable only by living
polymerisation, or by a protein) and set up nylon-6,6 at DP 100.

`tsc --noEmit`, the build, the corpus audit and `test-router.mjs` are all clean,
no console errors. All six missions were exercised live and confirmed unsolved
at the default state first — two of them also confirmed to reject the near-miss
case (a bulky base on a *secondary* substrate, and –NO₂ as a deactivator that
directs meta). Near-duplicate pairs corpus-wide: 26 → 23. Organic moved from
89 Gold/6 Platinum to 93/7 (of 195).

**Organic, part 2 — spectroscopy & structure — done. Phase C.4 is now complete;
every exam topic has had a curation pass.**

This pass found something the previous eleven did not: a defect at the level of
the **module split**, not the question. `spectroscopy` and `structure` are two
separate modules teaching substantially the same material, and their banks had
drifted into testing the same facts in different words. Eight pairs, none of
which `auditCorpus` could see, because the two questions live in different
files and share almost no tokens:

| fact | spectroscopy | structure |
| --- | --- | --- |
| nitrogen rule | `spe-009` | `str-008` |
| M/M+2 1:1 ⇒ Br | `spe-010` | `str-009` |
| loss of 15 ⇒ CH₃ | `spe-017` | `str-012` |
| broad 2500–3300 ⇒ COOH | `spe-007` | `str-014` |
| triplet+quartet ⇒ ethyl | `spe-012` | `str-018` |
| ¹³C counts inequivalent C | `spe-011` | `str-021` |
| J is field-independent | `spe-015` | `str-022` |
| C=O near 1715 | `spe-004` | `str-003` |

Plus three questions in SPECTROSCOPY_QUIZ that were not spectroscopy at all and
re-asked `organic3`: `spe-021` (Diels–Alder s-cis, identical to `og3-023`),
`spe-023` (TBS removed by fluoride, identical to `og3-009`) and `spe-024`
(retrosynthesis disconnections, identical to `og3-001`/`og3-006`). And a third
degrees-of-unsaturation calculation, `str-023`, alongside `str-006` and
`str-007` — this one the audit *did* flag, at 0.60.

**The fix was to give the two modules different jobs**, since deleting a module
is a product decision and not mine to make (see "Deletions from the audit are
never automatic" in C.1). The line drawn: **spectroscopy teaches the
techniques** — what each measures, its instrument-level caveats, its newer
capabilities — and **structure teaches deduction** — given data, identify the
compound. Nine questions rewritten along that line, each replaced with material
absent from the whole corpus rather than merely reworded:

- spectroscopy gained ³J and the cis/trans alkene coupling (`spe-021`), why
  ¹³C integrals are untrustworthy — uneven NOE plus long quaternary T₁
  (`spe-023`), and exact-mass formula determination, C₃H₈O at 60.0575 against
  C₂H₄O₂ at 60.0211 (`spe-024`).
- structure gained the nitrogen rule used as a *constraint* alongside an IR
  observation (`str-008`), a 1:2:1 cluster meaning two bromines (`str-009`), the
  McLafferty rearrangement and what an even-mass fragment implies (`str-012`),
  telling 1- from 2-bromopropane by signal count (`str-018`), counting ¹³C
  signals across the C₈H₁₀ isomers as a symmetry measurement (`str-021`), the
  Karplus relation applied to a locked chair (`str-022`), and sulfur's ~4% M+2
  (`str-023`).

Two mistakes were caught mid-pass, both by checking rather than by intuition.
The first rewrite of `spe-023` was a DEPT-135 question — which would have
created a *new* duplicate with `str-027`, the very defect being fixed. And the
first draft of `str-021` asserted that para-xylene gives four ¹³C signals; it
gives **three** (1 methyl + 2 ring types), and *ortho*-xylene is the four-signal
isomer. Both counts were redone by hand for all four C₈H₁₀ isomers before the
question was rewritten.

Added 4 new Part II FRQs (`p2-organic-008..011`, one Platinum):

- `p2-organic-008` — IR as physics rather than a table: Hooke's law gives
  ν̄(C–D) = 2960√(0.923/1.714) = 2170 cm⁻¹, then hydrogen bonding lowers *k* and
  broadens the O–H band because an ensemble of aggregate geometries is being
  averaged, and the C=O/C=C comparison separates band **position** (bond order)
  from band **intensity** (dipole change).
- `p2-organic-009` (Platinum) — quantitative ¹H NMR: a real purity assay
  against an internal standard (89.2% from the integral ratio), why qNMR is a
  primary ratio method needing no authentic sample, the two conditions that make
  the integrals valid (5×T₁ delay, resolved signals), and what it is blind to
  (anything without a resolved proton — pair it with Karl Fischer and an ash).
- `p2-organic-010` — three C₈H₈O₂ isomers separated on IR position, singlet
  chemical shift and ¹³C count, ending with the fastest bench test (NaHCO₃)
  rather than another spectrum.
- `p2-organic-011` — a worked *wrong* answer. Every observation the student
  cites is true and the structure is still wrong; the question is about the
  procedural error of reasoning from a hypothesis backwards, and about absences
  being evidence.

**Five missions**, the first in either tab. Build aniline on the DoU sliders;
then a choice mission on why oxygen is absent from the DoU formula (valence, not
element — which also covers S and P for free); read a formula out of an M+1
peak of 7.7% at M⁺ 106 (7 carbons → C₇H₆O, benzaldehyde, DoU 5); find the IR
window where almost nothing absorbs, with the sting that a symmetric alkyne is
IR-inactive so an empty window proves nothing; and produce a septet from the six
equivalent protons of an isopropyl group.

One bug caught by the live check and not by the compiler: the mass-spec mission
was defined and its `tick()` wired, but the card was still built with `card()`
instead of `cardWithMissions()`, so the ladder existed and rendered nowhere.
`tsc` cannot see this — a `MissionLadderHandle` that is never appended is
type-correct. **Worth a rule: after adding a ladder, confirm it is on screen,
not merely that the build passes.** All five were then exercised live, each
confirmed unsolved at the card's default state, and three confirmed to reject a
near-miss (the alkene band, n = 3, and –NO₂).

`tsc --noEmit`, the build, the corpus audit and `test-router.mjs` are clean, no
console errors. Near-duplicate pairs corpus-wide: 23 → 22, though the real
reduction is the eight cross-module pairs the metric never counted. Organic
moved from 93 Gold/7 Platinum to 96/8 (of 199).

**A decision left for you.** The rewrites make the two modules teach different
things, but they remain two modules over one body of material, with two quizzes,
two challenge ladders and a shared prerequisite. `structure.ts` still opens with
a header comment describing itself as "Spectroscopy". Merging them into one
module with a technique half and a deduction half is defensible and would remove
a genuine source of drift; so is leaving them split, since 25 questions each is
a reasonable unit and the split now has a rationale. **This is a product call,
not an audit finding** — but if the answer is "merge", it is much cheaper to do
before Phase D.4 writes the page contract against 25 topic pages.

---

### C.4 complete — what the twelve passes found

Worth recording, because the pattern is the argument for D.9:

- **Chemistry errors are rare.** Two in the whole corpus: `periodicity.ts`'s
  Slater fill order (3d before 4s), and the `coo-009` Jahn–Teller question whose
  `why` contradicted its own answer. Both were found by re-deriving, never by
  reading.
- **Duplication is the common defect, and the detector misses the worst kind.**
  Jaccard similarity finds re-worded questions; it cannot find the same *fact*
  asked in different words (potassium's flame colour, the nitrogen rule in two
  modules). Every pass but one found at least one such pair. **D.9's duplicate
  check must key on the fact, not the string** — the practical version is a
  small hand-maintained tag per question, or an embedding, not a token metric.
- **Depth was thin exactly where the derived tier said it was thickest.** The
  three topics that looked best on `Gold` count — lab, descriptive, organic —
  were the three where Gold was inherited wholesale from a module's `difficulty`
  rather than earned. `tierOf()` is doing what it was designed to do; the
  reporting around it invites the wrong conclusion. An audit line distinguishing
  *derived* from *overridden* tiers would have saved this pass a day.
- **Missions were absent from precisely the tabs that most needed them** — 13 of
  25 had none, and every one of those was a CCO/IChO module where the
  simulations are the only thing making the abstraction concrete.

---

## Who does what, from here on

Phase D is the first phase run by two authors, so the boundary has to be written
down or it will be crossed silently.

| Author | Owns | Never touches |
| --- | --- | --- |
| **Codex (engineering)** | Routing, the tab framework, CSS and layout, the sidebar, the homepage shell, build/perf, filters, audit scripts, accessibility plumbing | The *text* of any question, `why`, `misconception`, mission copy, theory block, or worked solution |
| **Claude (content)** | Every question and its distractors, `why`, `misconception`, mission definitions and hints, theory prose, worked solutions, chemistry-value checks, references | Refactors that move files or rename the interfaces in `particle.ts` / `framework.ts` |

Two rules that make the split safe:

1. **Codex may add a field; only Claude may fill it with chemistry.** If D.4
   introduces `refs` or `intro` on `TopicMeta`, Codex ships the type, the
   renderer and an empty array — not placeholder prose that reads as finished
   and never gets revisited.
2. **No question id is ever renumbered, by either author** (Phase A.2). A
   mechanical refactor that renumbers ids to "tidy" them destroys user history
   and is the one change that cannot be undone from the app side.

---

## Phase D — Product polish (2–3 weeks) · **the launch gate**

> "This is the stage where good software becomes great software. Not 'fix bugs'
> — a polish pass, so that every page feels like it belongs in the same
> application."

Correct framing, and it goes here rather than after the feature phases: E, F and
G all *add* surface. Polishing 25 modules is cheaper than polishing 25 modules
plus a dashboard, a search index and four competition modes.

Three items on the reviewer's list are already owned by later phases. Build them
once, there, not twice:

| Reviewer item | Owner |
| --- | --- |
| 11 Search | **F** (client-side index over the registry) |
| 12 Progress bars, mastery, streak, bookmarks, review list | **E** (display layer over the attempt log) |
| 13 Competition relevance per topic | **G** (`comps` is a filter, never a copy) |
| 14 SEO, sitemap, canonical, structured data | **I.1** — *except* the canonical-URL work, which D.0 forces early |

### D.0 The "18 of 24 pages are broken" report — **[x] DONE** (commit a83495e)

The reviewer's *observation* is real and the *diagnosis* is wrong, so fix the
right thing. There is no mount failure, no lazy-`import()` rejection, no PixiJS
init crash: tabs are **statically** imported in [main.ts](src/main.ts) and
`mount()` is synchronous, so no chunk-load path exists to fail.

What actually happens, in eight lines of [router.ts](src/router.ts):

```ts
const m = clean.match(/^\/topic\/([a-z0-9]+)$/i);   // no hyphen in the class
if (m) return { kind: 'topic', id: m[1] };
return { kind: 'home' };                            // silent, and no URL rewrite
```

The topic ids are the internal short names — `thermo1`, `aek`, `labdata`,
`organic1`, `coordchem` — not slugified titles. So `/topic/thermodynamics-i`
fails the character class, falls through to `{ kind: 'home' }`, and
[main.ts:160](src/main.ts) renders the homepage while the URL stays exactly as
typed. The handful of pages that "worked" are the ones whose guessed slug
happened to equal the real id (`quantum`, `equilibrium`, `bonding`,
`periodicity`, `spectroscopy`, `polymers`). Same symptom, entirely different
cause — and note the second silent path at [main.ts:171](src/main.ts): a
*valid-charset* unknown id (`/topic/thermo9`) `replaceState`s to `/` with no
explanation either.

- [ ] Add `slug` to `TopicMeta` — the human-readable canonical URL
      (`thermodynamics-i`, `acids-redox-kinetics`, `lab-and-data`), plus
      `aliases: string[]` carrying the current bare id. `topics.ts` stays the
      single source; the router resolves slug → id through it.
- [ ] `parseRoute` accepts `[a-z0-9-]+` and gains a fourth kind: `notfound`.
      **A path that isn't a real topic must never resolve to `home`.**
- [ ] A real 404 view: "There's no topic at this URL", the nearest matches by
      string distance, and links to `/menu` and `/`. Renders inside the app
      shell, not the homepage.
- [ ] Legacy `/topic/thermo1` → `replaceState` to `/topic/thermodynamics-i`, so
      every page has exactly one canonical URL. This is also the `<link
      rel="canonical">` I.1 will need, which is why it comes early.
- [ ] Unit-test `parseRoute` against the full `TOPICS` list plus a fixture of
      wrong guesses (`thermodynamics-i`, `THERMO1`, `/topic/`, `/topic/x/y`).
      Cheap, and it is the exact class of bug that survives eyeballing.

### D.1 Fault tolerance in the tab layer — **[x] DONE** (same commit)

The reviewer's remedy is right even though the premise was wrong: `initTabs` in
[framework.ts:91](src/tabs/framework.ts) calls `def.mount(root)` with no guard.
Today one throw in one module propagates out of `showRoute` and leaves an empty
`<div class="tab-root">` with the sidebar item highlighted — the same "looks
loaded, isn't" failure, just from a different direction. It has not bitten yet
because every mount is synchronous; **D.10 makes them async, and then it will.**

- [ ] `try/catch` around `def.mount()` → render a `tab-error` card (module name,
      the message, a Retry that discards the cached root and re-mounts) and
      `console.error` the original.
- [ ] Distinguish *no tab selected* from *tab failed*. Homepage content is never
      the fallback for a failed mount.
- [ ] Add optional `onDestroy()` to `TabHandle` and call it on retry — Pixi
      canvases and `requestAnimationFrame` loops otherwise leak per attempt.
      `onShow`/`onHide` already exist and stay as they are.

### D.2 Navigation — sections, not a 25-item list — **[x] DONE**

Worth separating what the reviewer asked for from what is already true. The
domain taxonomy they proposed (Physical / Organic / Inorganic / Analytical /
Laboratory / Question Bank) **already exists** in `topics.ts` and `DEFS`; there
is no "Advanced Physical" bucket to break apart. The defect is presentational:
all eight groups render permanently expanded, so the sidebar is 25 buttons deep
and the grouping is invisible.

- [x] Collapsible groups in `initTabs` — native `<details>`/`<summary>` (free
      keyboard and screen-reader semantics, no JS focus management to get
      wrong), one open by default: the one containing the active topic.
- [x] Persist open/closed state in `localStorage` (`chemprep.nav.open`); the
      active group always auto-expands on navigation regardless of stored state.
      A corrupt or absent value falls back to the default and never throws —
      verified by writing `{not json` into the key and reloading.
- [x] Mobile: the sidebar becomes a drawer under ~900 px, closing on selection,
      `Escape`, or a backdrop click. Focus moves to the first control on open
      and returns to the toggle on close. Deliberately **not** a focus trap: a
      nav drawer is not a modal dialog, and a trap would mean reimplementing
      escape behaviour the browser already provides.
- [x] Item count per group in the summary row, derived from the `defs` runs
      rather than written down twice (1 · 4 · 7 · 4 · 3 · 3 · 2 · 1 = 25).

Two things worth keeping in mind for the rest of Phase D, both about the
preview pane rather than the app:

1. **The pane's synthetic key events carry an empty `key`.** A `keydown` arrives
   trusted, with `defaultPrevented: false`, and `key: ""` — so the UA performs
   no default action. Tab does not move focus and Enter does not toggle a
   `<summary>`. This is why keyboard *activation* cannot be verified there; what
   can be verified is that the control is focusable, that `:focus-visible`
   paints the ring (confirmed: 2px `--accent` on both `<summary>` and
   `.nav-item`), and that no handler of ours swallows the event. Native
   `<details>` owns the Enter/Space behaviour and we add no keydown handler to
   it. **Check real keyboard activation in a real browser before D.11 signs off
   on accessibility.**
2. **The pane resizes the viewport without dispatching `resize` or matchMedia
   `change`** (both probed, both zero, while `matches` flips correctly). So the
   breakpoint-crossing cleanup — closing a stranded open drawer when the window
   grows past 900 px — is implemented but unverified here. Every drawer style
   lives inside the `max-width` query, so a stranded `.nav-open` is invisible at
   desktop width; what it would leave wrong is `aria-expanded="true"` on a
   `display:none` control, and an unexpectedly open drawer on shrinking back.

**On splitting Organic into eleven modules** (Stereochemistry, Alkenes,
Carbonyls, …): don't. It contradicts this document's own filter — *depth in the
25 that exist beats a 26th* — and it would fragment three coherent quiz banks
into eleven thin ones. The underlying want is navigability, so serve that
instead: give each module in-page section anchors, and let the collapsed
sidebar group expand to show *sections within a module* rather than new modules.
Same discoverability, no content fragmentation, no new question banks to fill.

### D.3 Homepage order — **[x] DONE**

Current order is hero → stats → "Why it works" (01) → topic grid (02) → end.
Target, from the reviewer, with the sections that don't exist yet marked:

| # | Section | State |
| --- | --- | --- |
| 1 | Hero | exists |
| 2 | Why ChemSim | exists ("Why it works") — renumber |
| 3 | Interactive demo | **new** — one live sim above the fold-and-a-half, not a screenshot |
| 4 | Learning paths | **new**, but the data lands in **F**. Ship the section reading from a `PATHS` array; three hand-written paths are enough to launch |
| 5 | Competition modes | **new** — static explainer of CCC/USNCO/CCO/IChO scope until **G** makes it interactive |
| 6 | Topic categories | exists (the grid) — group it by domain instead of one flat run |
| 7 | Question statistics | exists (`stats`) — move down, and drive it from `CORPUS_COUNTS` rather than hard-coded numbers |
| 8 | Footer | exists |

Testimonials stay out until there are real ones. A fabricated testimonial is the
single fastest way to lose a student's trust in the chemistry. **None were
added.**

**Shipped.** Final order: hero → 01 Why it works → 02 Try one right now → 03
Three ways through → 04 Which competition → 05 The whole syllabus → 06 What is
actually in here → footer.

**The numbers were the real defect.** The old strip hard-coded four figures and
three were wrong: 18 modules (there are 25), 650+ questions (853), and "65+
simulations" / "90+ key equations", which nothing in the repo counts at all. The
hero paragraph then contradicted the strip directly above it. Every figure on
the page is now interpolated from `TOPICS.length` and `CORPUS_COUNTS`, and the
hero sentence is built from the same values, so the two cannot disagree again.
The two unsourceable stats were **deleted rather than re-guessed** — a stat with
no source of truth is not a stat. `CORPUS_COUNTS` gained `papers` so the mock
paper count comes from `OLYMPIAD_PAPERS.length` too. Live values: **25 modules ·
853 questions · 119 written problems · 5 mock papers**.

The interactive demo is a **small reimplementation** of the equilibrium sim, not
an import of `equilibrium.ts`. Importing the module would have pulled its
25-question bank, challenge ladder and seven mission definitions into the
landing page's chunk — precisely what D.10's budget exists to prevent — to draw
two curves whose physics is twenty lines either way. It starts stopped, runs
only while intersecting, and under `prefers-reduced-motion` integrates to a
settled frame instead of animating, with the disturb buttons jumping straight to
the new equilibrium.

`PATHS` and `pathTopics()` live in `src/topics.ts` as data. Each card's minutes
and difficulty badges are computed from the modules it points at — the badge row
is the union of its modules' levels, so a path can never claim a level none of
its modules carries. **The path ORDERING has not been content-reviewed**: it is
`TOPICS` order filtered by difficulty with `prereqs` respected, which is a
defensible first cut and not a taught sequence. Flagged in the source and due
before D.12.

The competition cards state only what `TopicMeta.difficulty` supports, plus a
derived "N of 25 modules are pitched at this level" (10 · 14 · 10 · 5). No exam
dates, formats, cutoffs or qualification rules — the repo has no source for any
of them.

One fix outside the order's scope but inside its acceptance criteria: the
homepage top bar did not wrap, so **the whole landing page scrolled sideways at
375 px**. Pre-existing, unrelated to the new sections, and now fixed with
`flex-wrap`. Verified: `scrollWidth === clientWidth` and no element extends past
the viewport at 375 px.

Verified live at 1280×800 and 375×812, no console errors. Note for anyone
re-checking this in the preview pane: scroll-driven behaviour is awkward there
because `#home` is the scroll container (not the document) and `rAF` is paused
while the pane is hidden, which freezes both the reveal transitions and the demo
loop — sections can look washed out and stalled when they are neither. Take a
screenshot to wake it, then re-read.

### D.4 The page contract — **[x] DONE**

"Every topic contains: introduction, theory, simulation, missions, misconception
boxes, quiz, gold/platinum challenge, references." Coverage before and after:

| Block | Was | Now |
| --- | --- | --- |
| Theory + quiz (25 Q) | 25 / 25 | 25 / 25 |
| Simulation | most | 23 / 23 study modules |
| **Missions** | the table below said 12/25 and was **stale** — C.4 had already added most of them; the real gap was 3 | 23 / 23 |
| **Misconception boxes** | **12 of 587** | **167 of 587**, every module ≥ 4 |
| **Reset button** | **3 tabs** | **78 cards** |
| **References** | **0 / 25** | 25 / 25 |
| Gold/Platinum challenge | C.2's ladder, unchanged | unchanged |

- [x] `topicPage()` — in **`src/tabs/page.ts`**, not framework.ts: it needs
      `challengeLadder()` and `TopicMeta`, and framework → challenge → registry →
      topics → framework is an import cycle between modules that build top-level
      constants. Renders intro · theory · sims · quiz · challenge · references in
      that fixed order, with the card `<h2>` level owned by `card()`.
- [x] **The type is the audit.** `sims` is a non-empty tuple and `quiz`/`theory`
      are required fields; `intro` and `refs` are required on `TopicMeta`. Six of
      the eight blocks are therefore a *compile error* to omit, which is stronger
      than a console warning and needed no script. Only the two blocks that are
      counts rather than presence needed checking at runtime.
- [x] `auditTopicPages()` in registry.ts, wired into main.ts's DEV block: intro
      length, 2–4 references, a registered 25-question bank, and ≥ 4
      misconception boxes per module. `topicPage()` itself checks the two things
      that only exist once a tab mounts — a mission ladder and a theory block.
- [x] **Reset without per-sim code.** A slider's or select's initial value is
      already in the DOM as `defaultValue`/`defaultSelected`, so `resetControls()`
      restores it and dispatches `input`/`change` — the card's own handler then
      recomputes through its normal path, mission meters included. `topicPage()`
      adds the button to every sim card that has a control and doesn't already
      have one, so the three bespoke resets (sandbox, equilibrium, nuclear —
      which carry state no control holds) are left alone.
- [x] **Content backfill:** 25 intros, 25 reference lists (2–4 textbooks each,
      chapters named rather than numbered so they survive an edition change),
      155 new misconception boxes, and mission ladders for the three tabs that
      genuinely lacked them (physchem, biophys, analytical) — each verified in
      the browser as reachable and *not* satisfied by the card's default state.
- [x] Two modules are exempt and say so in the audit: `sandbox` (a playground,
      no 25-question bank) and `qbank` (the exam bank itself, no simulation).
      Both still carry an intro and references.

**Not done, and deliberately:** the pills-based modules (aek, organic2, nuclear,
labdata, spectroscopy) keep one theory block *per panel*, beside the tool it
explains, rather than one hoisted to the top of the page. They pass `theory: []`
and the runtime check confirms the blocks exist. Hoisting them would separate
each explanation from its simulation to satisfy a type.

### D.5 References — **[x] DONE** (mostly landed with D.4)

- [x] `refs: Ref[]` on `TopicMeta`, rendered by one shared `references()` helper
      in page.ts. Data in topics.ts, per the single-source rule.
- [x] 2–4 per module from Atkins · Zumdahl · Clayden · Shriver & Atkins · Levine
      (plus Harris, Pavia, Miessler, Greenwood and Warren where those are the
      standard text for the area). **Chapters are named, never numbered** —
      numbering moves between editions and a stale "ch. 14" is worse than no
      pointer at all.
- [x] Archive links, in `ARCHIVES` in page.ts rather than copied into 25 `refs`
      arrays: the same links serve every module and none is topic-specific.
- [x] **Links only, never reproduction.**

**Two links, not three, and every one of them was fetched before shipping.** The
obvious guesses were wrong — `cheminst.ca/education/national-chemistry-
competitions/` 404s, the CCC/CCO archive really lives under `/discover/`, and
`ichosc.org` is the steering committee, which redirects to `icho.sk` for the
problems. USNCO is deliberately **unlinked**: acs.org answers 403 to automated
requests on every path, so its URL could not be verified and the reference
carries the search term instead. Add the link once a human has opened it.

### D.6 Simulation hardening — **[x] DONE**

"What happens if a student intentionally tries to break this?" — answered by
**driving every control on the site to its extremes and reading the output**,
rather than by re-reading 6 000 lines hoping to spot a division. The sweep is
the table:

| Probe | Result |
| --- | --- |
| Controls swept | **156** (every slider and number field outside the mission ladders) |
| Values per control | min · max · 0 · −1 · 1e9 · empty |
| Probes | **936** |
| Non-finite output before the fix | 2 sites |
| Non-finite output after | **0** |
| Unbounded numeric fields before / after | **20 / 0** |

- [x] Numerical: the sweep found exactly two failures, both in
      Clausius–Clapeyron and both the *same* root cause — an unbounded
      `<input type="number">`. A typed ΔH_vap of 10⁶ kJ/mol, and a T₁ of 1 K,
      each overflowed `exp()` and printed "P₂ = Infinity atm".
- [x] The fix is one shared `numberInput()` + `numVal()` in framework.ts, which
      also **deleted six copies of the same one-line `num()` helper**. Bounds
      live on the element, so `numVal()` clamps with no state of its own and the
      browser's validity UI comes free. Clamping is at READ time, not on
      keystroke: rewriting the field mid-edit makes it impossible to type "0.05"
      into a field whose minimum is 0.01.
- [x] **Bounding the inputs is not sufficient on its own** and the code says so:
      an exponential still overflows for legal-but-extreme inputs, so the
      Clausius readout tests `Number.isFinite` and explains itself instead of
      printing "Infinity".
- [x] Physical extremes: covered by the same sweep — every control's own min and
      max *are* T → its floor, [A] → its floor, pH 0/14, infinite dilution. Zero
      particles is the sandbox's default opening state, so it is exercised on
      every visit.
- [x] Presentation: all **28** `plot()` call sites carry both `xLabel` and
      `yLabel` (checked by parsing the calls, not by eye); `.card canvas` is
      already `max-width: 100%`.
- [x] `prefers-reduced-motion`: three simulations auto-played (the gas box, the
      live equilibrium, the sandbox). They are now play/pause-gated through a
      shared `playPause()` helper, and **the setting picks the starting state
      rather than suppressing the animation** — these sims *are* the lesson, so
      removing the motion would remove the content. Reduced motion opens paused
      on a real computed frame (verified: 3 643 drawn pixels, not an empty
      canvas); everyone else opens running. Nuclear already started stopped.
- [x] Missions: **68 total, 46 drive-the-sim, 0 of them without a `meter()`** —
      the B.1 rule re-verified across the D.4 backfill by parsing every
      `MissionDef`.
- [x] Reset: shipped in D.4, and the meters follow it because the card's own
      input handler is what re-runs.

**Note for anyone re-running the sweep.** It has to run as ONE synchronous pass
with `requestAnimationFrame` shimmed to call inline (with a re-entrancy guard —
the animation loops re-schedule from inside their own callback and will recurse
forever without it). The preview pane throttles both rAF and timers while it is
hidden, and every slider coalesces its redraw through rAF, so a queue driven by
`setInterval` stalls after ~30 of 936 probes and reports a clean run that never
happened.

### D.7 Visual and typographic consistency — **[x] DONE**

Counted first, so the work had a target rather than a taste: the stylesheet held
**42 distinct spacing values, 14 radii, 9 shadows and 9 transition durations**.

- [x] Scales as custom properties in `:root` — `--s-1…--s-8`, `--r-sm/md/lg/pill`,
      `--shadow-1/2/3`, `--t` / `--t-enter`.
- [x] **The 400 existing hard-coded spacing values were deliberately NOT
      mass-rewritten** to the nearest step. A mechanical sweep over spacing is a
      large invisible diff with a real chance of nudging a layout somebody tuned
      by hand, and what it would buy is prevention of *future* drift — which the
      tokens buy on their own. What was collapsed is the smaller, checkable set:
      **14 radii → 4 tokens, 9 shadows → 3, 9 durations → 2**, all of them
      visually interchangeable values whose inconsistency *was* the defect.
- [x] Lighter rules and softer shadows: the card shadow drops from
      `0 1px 4px/0.04` with a `0 4px 16px` hover to `--shadow-1/2`, and the card
      title's underline goes from `--rule` to the softer `--paper-3`.
- [x] Larger section titles: `.card h2` 17 → **19 px**. At 17 it carried less
      visual weight than the body copy beneath it, which is the wrong order for
      the only text naming what a simulation is.
- [x] Heading hierarchy is owned by `topicPage()` + `card()` (D.4), not per-tab.
- [x] **Equation spacing set once.** `.eq` was written twice — in `.theory` with
      a wash, an accent rule and 8/13 px padding, and again in `.result` with no
      padding and a different margin — so the same equation changed shape
      depending on which container it landed in. There is now one `.eq` that
      owns the box, and the two contexts override **colour only** (`.result`
      sits on a dark instrument panel).
- [x] Hover and collapse transitions ≤ 150 ms: every one of the 23 transitions
      is now `var(--t)` or `var(--t-enter)`, except one. `.bar-fill` keeps 0.3 s
      and says why in the source: it reports a *value* changing (a mission meter
      filling), not a hover state, and at 150 ms the fill reads as a jump. All of
      them are already killed by the existing `prefers-reduced-motion` block.
- [x] No block of prose over ~120 words without a figure or an equation —
      **measured in the browser across all 33 theory blocks**, walking each body
      and resetting the word count at every heading, equation, table or canvas.
      Two blocks failed (Electrochemistry essentials at 153 words, Coordination
      chemistry essentials at 130) and both were split with a sub-heading and an
      equation. Now 0 of 33; the worst is 115.

The first measurement pass scored **0 for every block** and was wrong — every
direct child of a theory body is a heading, list, table or equation, so a naive
walk counts nothing. The number above comes from counting the text *inside*
lists, so a 300-word `<ul>` cannot hide.

### D.8 Question bank navigation — **[x] DONE**

The registry already answered these queries; this was a UI over indexes that
exist, and no new index was added.

- [x] Two-level browse: domain → topic → tier, with per-topic solved counts.
      `EXAM_TOPIC_DOMAIN` in topicIds.ts is **written down, not derived** — the
      obvious derivation (union each exam topic's modules' `TopicMeta.group`) is
      fuzzy exactly where it matters, since `descriptive` reaches modules in
      three different groups and the answer would depend on which module came
      first. Twelve hand-maintained entries beat a derivation that is wrong in
      the interesting cases.
- [x] **Six of the seven filters shipped, not four.** The roadmap assumed
      `completed`/`incorrect`/`unattempted` needed Phase E; they don't —
      `isSolved` and `wrongQuestionIds` are Phase-A progress and already there.
      Only **bookmarked** needs a store nothing writes yet, and it sits behind
      `BOOKMARKS_AVAILABLE` rather than being faked.
- [x] "Not yet attempted" is an approximation and the source says so: it means
      neither solved nor outstanding-wrong, and the attempt log is deliberately
      capped, so a question answered wrong long ago can rotate out and reappear
      as unattempted. An honest approximation beats an unbounded log.
- [x] Filter state in the query string, both directions. Defaults are omitted
      rather than written as `any`, so a shared link carries the filters someone
      chose and not the ones they didn't.
- [x] Deleted qbank's hard-coded copy of the twelve exam topics (three labels
      had already drifted from `EXAM_TOPIC_LABEL`) — the exact drift the
      two-vocabulary rule exists to prevent.

**The browse counts lied in the first version, and fixing that changed the
design.** Browse counts the whole corpus via `query()`, but the drill-down
opened Part I — one 110-question bank — so "Stoichiometry · Gold 7" landed on a
page reading "0 questions", because those seven Gold items live in the module
quizzes and Part II. Either the browse had to shrink to one bank or the
destination had to widen to the corpus; the corpus is what the student was
promised, so drilling down now opens a **results view** that renders matching MC
through `quiz()` and matching written problems through `frqBrowser()`.

### D.9 Error audit — **[x] DONE** — `scripts/audit-content.mjs`

`npm run audit` = the content gate + the D.0 router test. It **exits non-zero**,
which is the difference between it and `audit-corpus.mjs`: that one is a report
to triage by hand, this one is a thing that can fail a build. Both now load the
corpus through the shared `scripts/corpus.mjs` (transpile-to-scratch via the TS
compiler API) instead of each carrying its own copy of the loader.

- [x] Structural: missing `why`, empty question/option, answer index out of
      range, duplicate id, FRQ with an unanswered sub-part. All clean.
- [x] KaTeX/mhchem parse failures at build time. `typesetMath` renders with
      `throwOnError: false` — correct at runtime, since a bad formula must not
      blank a page, but it means a malformed formula ships as red text nobody
      notices. The audit renders every `\(…\)`/`\[…\]`/`$$…$$` segment with
      `throwOnError: true`. All 972 items clean.
- [x] Tables without `.table-scroll` — **26 found, all fixed**. 17 were in the
      exam banks (`bankPart2` alone had 14), the rest in theory blocks in
      thermo1/aek/equilibrium/nuclear/organic1/organic3/polymers. Every one of
      them would have pushed the page sideways on a phone.
- [x] Missions without hints — **7 found, all written** (aek ×2, bonding ×2,
      equilibrium, gases, periodicity). Missions live in the tab modules, which
      can't be loaded outside a browser, so this check reads the source text
      between one `id: 'msn-…'` and the next.
- [x] No console errors on the routes checked in the dev server.

Two items from the original list were deliberately **not** built:

- **Near-duplicate by meaning.** C.4 already established that a token metric
  can't see the same fact asked in different words, and `audit-corpus.mjs`
  already has the Jaccard version for what it *can* catch. The real fix is a
  per-question fact tag — content work, not a script.
- **Unit and significant-figure checking.** Not decidable from an option string.
  A regex version flags hundreds of correct answers, so it would be turned off
  within a day. Stays part of the human read-through in D.12.

### D.10 Performance — **[x] DONE**

Was a single 1.74 MB chunk. Lazy `DEFS` imports landed with D.1; what remained
was that the **homepage** still dragged the whole corpus into the entry chunk.

- [x] `DEFS` entries are `() => import('./tabs/thermo1')`, mount is async, and a
      failed/slow mount renders in the tab layer rather than as homepage content
      (D.1).
- [x] Pixi confined to the sandbox chunk (387 kB, fetched only when the sandbox
      is opened).
- [x] **The homepage no longer imports the corpus.** `home.ts` wanted three
      numbers from `CORPUS_COUNTS`, which `registry.ts` derived from every bank
      — so `index.js` carried all 972 questions to render a landing page.
      `src/content/counts.ts` states the three numbers instead, and both
      `auditCorpus()` (dev) and `npm run audit` (CI-able) check them against the
      real arrays, so the stated figure cannot go stale silently. Entry chunk
      **1.16 MB → 600 kB**; the corpus is now its own 563 kB chunk that only the
      question bank and challenge ladder pull.
- [x] **The Supabase client is off the entry path too.** It was constructed at
      module load, so every visitor downloaded ~110 kB of auth machinery to read
      a lesson that never calls it. It now loads on demand: at startup only when
      there is a session to restore (an `sb-*-auth-token` in localStorage, or an
      OAuth/magic-link token in the URL), otherwise on the first sign-in click.
      `isCloudConfigured()` stays synchronous — the sign-in UI has to know
      whether to render at all, and the env vars answer that alone — and the
      auth-state listener moved to where the client is created, so both entry
      points attach it exactly once. Verified in the production build: the chunk
      is fetched on the click and not before.
- [x] **KaTeX fonts.** Every face ships three times (woff2/woff/ttf) and the
      stylesheet lists all three; nothing that can run this app has needed the
      last two since 2016. A build plugin drops them — 876 kB of deploy — and
      strips their `src()` entries so the CSS doesn't point at absent files. The
      two faces every formula uses (Main-Regular, Math-Italic) are preloaded;
      because asset names are hashed, that can only be done at bundle time,
      which is why it is a plugin and not two tags in index.html. The other 17
      faces stay: `@font-face` already fetches them only if a page uses them.
- [x] **Budget: first topic page under 400 kB of JS — 394 kB**, from 1.74 MB
      when Phase D opened.

### D.11 Accessibility, second pass — **[x] DONE**

Phase 0.3 did the first. The new surfaces got the same treatment:

- [x] Collapsible nav (native `<details>`/`<summary>`, keyboard-operable with no
      focus management to get wrong), 404 view, and the question-bank filters:
      every focusable control on those routes has an accessible name — checked
      in the browser, not by eye.
- [x] **Loading skeleton for lazily-imported tabs.** Between the click and the
      chunk arriving the panel was simply empty, which reads as a broken page —
      the exact impression D.0 existed to remove. Three shimmer bars plus a
      `role="status"` / `aria-busy` region announcing "Loading <module>…".
- [x] **Contrast audit on the dark instrument panels.** The canvas colours are
      written inline in each tab, so no stylesheet audit could see them. Seven
      failures found and fixed: `#5a6a7d` was being used for canvas *text* in
      bonding, gases and quantum at 3.36:1, and `#3a4a5d` for the gas box
      outline and the inactive energy levels at 2.05:1. Now `#8b9bb0` (6.57:1)
      for text and `#55627a` (3.03:1) for lines. The check is section 6 of
      `audit-content.mjs`, so it stays true: only `fillStyle` can paint text
      (`fillText` uses the fill colour), so a `strokeStyle` is always judged at
      the 3:1 graphic threshold, and the two backdrop colours are exempt.
- [x] **Responsive tables everywhere, not only where an overflow was noticed.**
      D.9 wrapped the 26 string-built tables; the 19 built with `h('table')`
      could not be wrapped by an audit, so `.ref-table` now carries its own
      `overflow-x` (`display:block; width:max-content; min-width:100%`). A table
      that overflows also gets `tabindex="0"` + `role="region"` from
      `markScrollableTables()` — a scroll container is unreachable by keyboard
      in Chrome otherwise — and only while it overflows, so tables that fit
      don't add ~20 dead tab stops per page. Re-runs on resize.
- [x] `prefers-reduced-motion` — already respected by the homepage reveal, the
      global CSS block, and every self-animating sim through `playPause()`.
      Verified at 375 px: no route scrolls the page horizontally.

### D.12 Launch readiness — **[~] mechanically green; two lines are the owner's**

Checked against the source and a browser walk of every route, not from memory.

- [x] **Every URL resolves to the page it names, or to a 404 that says so.**
      `scripts/test-router.mjs` — 172 checks over 25 topics and 48 URLs
      (slugs, legacy bare ids, casing, trailing slash, wrong guesses). Verified
      live: `/topic/nope-not-real` renders the 404 view, not the homepage.
- [x] **Every topic has all eight blocks of the D.4 contract.** `auditTopicPages()`
      clean: intro, 2–4 references, a 25-question quiz and ≥ 4 misconception
      boxes per module, 167 corpus-wide.
- [x] **Every simulation has missions and a reset.** Walked all 25 tabs in one
      session: 45 mission ladders and 79 reset buttons across them, and the only
      tab with no ladder is the question bank, which is contract-exempt because
      it is not a lesson.
- [ ] **Every question has been read once since it was written, with units and
      answer key verified.** C.4 read the corpus module by module; what is *not*
      claimable is that every question has been re-read since its last edit.
      The mechanical half is done and now enforced (`npm run audit`: structure,
      answer indexes, KaTeX, tables). Units and significant figures are not
      decidable by script — see D.9. **This line is a human pass, and it is the
      one thing between here and launch that cannot be automated.**

      Narrowed since, by the incident that proves the point. `per-009` shipped
      with `a` pointing at 10.9 while its own explanation derived 5.45 ≈ 5.5 —
      in range, valid KaTeX, all fields present, audit green, and a correct
      answer marked wrong for every student who gave it. Audit check 7 now
      catches that class: where all options are plain numbers, the explanation
      must state the keyed one to the option's own precision. It covers ~160 of
      853 MC and exits non-zero, so the human pass is now about units, sig figs
      and prose answers rather than arithmetic keys.
- [x] **Navigation is two clicks deep from anywhere.** Sidebar (grouped, always
      present) → module; or Home → All Topics → module. The 404 view also links
      straight to both.
- [x] **No console errors on any route.** Instrumented `console.error`/`warn`,
      `error` and `unhandledrejection`, then visited all 25 tabs plus home, menu
      and the 404: **zero**. `tsc --noEmit` clean, `npm run audit` clean.
- [x] **Performance budget.** Entry chunk 394 kB (was 1.74 MB when Phase D
      opened); corpus, Pixi and Supabase are all in on-demand chunks.
- [ ] **You would personally use this to prepare for the CCC, CCO or USNCO.**
      Not mine to tick.

Then, and only then, Phase I.2's feedback loops go in and the site goes to 25
real students.

---

## Phase E — Progress, visible — **[x] DONE**

Accounts already exist. This is the **display layer** over Phase A's attempt log —
which is why it must come after A, and why it's one week rather than three.

- [x] Dashboard route (`/progress`) — [progressPage.ts](src/progressPage.ts),
      lazily imported by main.ts because it reads the corpus. Four bands:
      instrument panel, weak topics, mastery, history (+ bookmarks when any).
- [x] Per-topic mastery bars **in the sidebar and on topic cards** —
      `progressStrip()` in [topics.ts](src/topics.ts) on the one shared card
      renderer, and `addNavMeter()` in [framework.ts](src/tabs/framework.ts) for
      the sidebar. Two different marks on purpose: the card has room for a bar
      plus `19/25`, the sidebar is a permanently-visible list of 25 and gets a
      2 px underline only — putting the fraction on all 25 rows would turn the
      one thing that has to stay scannable into a spreadsheet. Both count by id
      namespace rather than enumerating banks, and both are invisible at zero so
      a first visit isn't a wall of empty bars. The figure still reaches a
      screen reader: the nav item's `aria-label` carries it as text.
- [x] **Weak topics** — `weakTopics(3)`, each with a one-click practice set.
- [x] **Quiz history** — last 50, filterable to wrong-only, plus "retry the N
      you got wrong".
- [x] **Streak** — `streakDays()` was already there; `bestStreak()` is new, and
      walks the day KEYS rather than the attempt window so it survives the cap.
- [x] **Bookmarks** — `bookmarks` table + RLS ([SUPABASE_SETUP.md](SUPABASE_SETUP.md) §2c),
      buttons on every quiz question, every written problem, and every module.
- [x] Completed-lesson marking — **auto only**, see below.

**Three decisions that were not on the list.**

**1. The mastery list is keyed by exam topic, not module.** The roadmap asked
for per-topic bars and the obvious reading was "one row per module", but the
attempt log records `toExamTopic(q.topic)` — so `thermo1` and `thermo2` both
write into `thermo` and a per-module accuracy column would have printed the
same number twice and presented it as two measurements. Coverage and accuracy
now share one key (the twelve `ExamTopicId`s), and modules get a coverage bar on
their card, where there is nothing to be wrong about.

**2. "Practice these" and "retry the wrong ones" are LINKS, not features.** D.8's
results view already renders any corpus slice and already restores its filters
from the query string, so the dashboard opens
`/topic/qbank?part=results&status=wrong` and the work is done. What this cost
was one real fix: `navigate()` discarded the search string and `showRoute`'s
canonical `replaceState` stripped it again before the lazily-mounted tab could
read it. Both now carry it — that is the whole of the retry-wrong feature.

**3. Completed-lesson marking is automatic, with no manual override.** A module
is complete when its quiz bank is fully solved; the card says so. An explicit
toggle would be a second store answering a question the first one already
answers, and the two would disagree the moment a bank grew.

Also worth recording: **`MODULE_QUIZ_SIZE` in content/counts.ts** is the card
bars' denominator, stated rather than derived for the D.10 reason (the homepage
cannot import the banks to count them), and checked by `auditCorpus()` — five
banks are larger than 25, so a constant would have shown "27/25". Solved counts
come from `solvedWithPrefix()`, which counts by id namespace instead of
enumerating questions, for the same reason.

Verified: `tsc --noEmit` clean, `npm run audit` clean (172 router checks), zero
console errors across `/`, `/menu`, `/progress`, a topic, the question bank and
a 404, and no horizontal overflow at 375 px.

---

## Phase F — Smarter learning — **[x] DONE**

Every item here is a query against the Phase A registry.

- [x] **Search** — [search.ts](src/search.ts). A native `<dialog>`, `/` or
      ⌘/Ctrl-K from any route, scored substring match, no dependency.
- [x] **Learning paths** — the data already existed; what was missing was
      knowing where you are in one. Now: a completion bar, an n/m count, ticked
      steps and a Start/Continue button ([home.ts](src/home.ts)).
- [x] **Recommended next lesson** — [recommend.ts](src/recommend.ts), with
      eleven rules under test in `scripts/test-recommend.mjs`.
- [x] **Personalized review** — `reviewQueue()` + the question bank's `review`
      part. Oldest mistake first.
- [x] **Topic filtering** on the menu page — level, progress and area chips,
      with the filter state in the query string.

**What the corpus forced.** Search wants every question; the questions are a
566 kB on-demand chunk (D.10). Indexing at startup would have undone the
performance phase for a feature most visits never use, so module hits answer
instantly from the entry chunk and opening the overlay kicks off the corpus
import — question hits fill into the same list a moment later, with the status
line saying so. Entry chunk went 399 → 408 kB; the corpus stayed lazy.

**Three things that only showed up by running it.**

1. **Every page recommended the same module.** The weak-topic rule is correct
   and produced one answer for the whole site, so all 25 footers were identical
   — which reads as a broken card, not as advice. Gating it on having *finished*
   the current module fixed it and made the card mean something specific: you
   are done here, so go where you are weakest. Half a bank was tried first and
   was not strict enough — most modules sit above half for anyone who has been
   studying a while.
2. **`?q=` deep links died on the second visit.** Tabs mount once, so a link
   into a module already open re-showed the existing tab and no constructor ran.
   `quiz()` now registers a jump handler and `initTabs` calls it on re-show;
   both paths end in the same place.
3. **Closing search stranded focus on the hidden input**, so `/` silently
   stopped working — the shortcut ignores keys typed in a field and believed the
   user was in one. `<dialog>` only restores focus when there was somewhere to
   restore it to, and opening by keyboard means there usually isn't.

**Consolidation.** Four places were computing "how much of this module is
solved" and were on their way to four different answers; `moduleProgress()` /
`moduleCompletion()` in topics.ts are now the one definition, returning null
rather than zero for the sandbox and the question bank, because "no progress"
and "not a lesson" are different facts.

**Deliberately not built:** highlighting the matched substring in search results
(question prompts are authoring source — KaTeX, mhchem and inline HTML — and
highlighting inside that safely is more machinery than the feature is worth),
and fuzzy matching (a scored substring match over 972 items is not the thing
that limits this search).

---

## Phase G — Competition modes — **[x] DONE**

> "Support multiple Olympiads without duplicating lessons."

Correct instinct, and the `comps` field from Phase A is exactly how you avoid the
duplication. A mode is a **filter over shared content**, never a second copy.

- [x] Mode selector: All · CCC · USNCO · CCO · IChO in the sidebar,
      [mode.ts](src/mode.ts), persisted to localStorage.
- [x] Mode filters — recommendations, the challenge ladder, the question bank's
      competition filter, a "Beyond CCC" mark on cards and an opt-in
      on-syllabus-only filter on the menu.
- [x] Progress tracked per mode — the dashboard's fourth readout becomes
      "26% CCC ready", scoped through the registry's own `byComp` index.
- [x] Mode-specific exam simulation — [examRun.ts](src/tabs/examRun.ts), a new
      `Timed exam` part in the question bank.

**Marked, never hidden.** Out-of-scope modules stay in the directory with a
"Beyond CCC" chip; hiding them is an explicit filter the student turns on. A
mode is there to prioritise, and a directory that silently loses a third of its
entries reads as broken. The one place scope IS a hard filter is the
recommendation — being *sent* somewhere off-syllabus is wrong advice, while
browsing there deliberately is not.

**Scope is a module-level fact, never a per-question one.** `compsOf()` derives
a question's competitions from its module's difficulty, so every question in a
bank carries the same set: filtering a module's own quiz by competition would
either change nothing or empty it. What a mode legitimately says is
"coordination chemistry is not on the CCC syllabus".

**The bug the rules check caught.** `equilibrium` is pitched at CCC but lists
`thermo2` (USNCO-only) as a prerequisite, so the "go and finish the
prerequisite" rule — the most helpful one — sent CCC students off their own
syllabus. Rule 1 and the rule-4 fallback are both scope-checked now, and
`scripts/test-recommend.mjs` covers it in 13 rules.

**On the exam timings.** The repo has never stated an official exam duration,
and this did not start: the mock papers claim to match *structure and
difficulty*, never timing, and a made-up "60 minutes" beside a contest name
would be the first unverified exam fact in the codebase — and would look
authoritative. `ALLOWANCE` in examRun.ts is **practice pacing** (2.5 min per MC,
15 min per written problem) and every string says so. If real durations are ever
sourced, replace that one constant. The clock never blocks anything either: past
the budget it turns red, says "over by 3:20", and lets the student keep working,
because a timer that locks you out of the question you were mid-way through
teaches only not to use the timer.

Entry chunk 408 → 410 kB.

---

## Phase H — Explanations (1 week, gated) · *was "Phase 7", then Phase G*

Run the phases in the order given; **do not skip to the AI step.**

- [x] **H.1 — Handwritten alternate explanations.** `QuizQ.why2` (src/tabs/
      framework.ts) holds a second explanation that re-derives the answer by a
      *different route* — a drawing, a limiting case, a worked number, a
      reductio — rather than rewording `why`. A student who asks for it has read
      `why` and it did not land; more of the same prose is not an alternative.
      **Seeded on 23 questions, one per quiz bank** (the classic trap in each:
      `qua-013`, `bon-017`, `sto-014`, `th1-012`, `th2-015`, `equ-006`,
      `aek-007`, `gas-015`, `nuc-017`, `og1-019`, `og2-015`, `lbd-006`,
      `ana-009`, `spe-023`, `ain-012`, `bio-024`, `per-009`, `pol-024`,
      `phy-012`, `og3-022`, `coo-021`, `lbt-017`, `str-022`). That selection is
      a stand-in for data: **the moment the attempt log has real users in it,
      re-pick from `accuracyByTopic`/`wrongQuestionIds` instead of judgement**
      — hand-picking "the hard one" is exactly the guess the log exists to
      replace.
- [x] **H.2 — Misconception explanations.** Already covered in B.2.
- [x] **H.3 — "Explain differently" button.** Shipped as the *handwritten*
      version: the button appears only on questions that carry a `why2`, and
      reveals it. Offered whether the answer was right or wrong — a lucky guess
      is precisely the case where one explanation has not landed. **The
      model-backed version stays gated**, and now has a cheaper prerequisite
      than a backend: with I.2's analytics, click-through on this button *is*
      the demand measurement the gate was asking for.

**Engineering note:** the AI version is the only phase that adds a backend and a recurring
cost. An API key cannot ship in a Vite client bundle — it would be extracted
within a day of the repo or the deployed JS being read. It needs a Netlify
Function proxying the request, plus rate limiting per user, or the first person
who finds it runs up your bill. That is a real week of work and a real monthly
cost, for a feature whose demand is currently unmeasured. **Everything in Phases
B, C and D beats it on impact per hour.** Revisit after users exist.

---

## Phase I — Discoverability and users (ongoing) · *was "Phase 8", then Phase H*

### I.1 Make the site crawlable (half day)

`#app` starts `hidden` and every page is JS-constructed, so a crawler or a
no-JS visitor sees an empty document. Phase 0.2's OG tags fix link *unfurling*;
this fixes *search*. They are different problems and both are worth solving.

- [x] Build-time prerender: `scripts/prerender.mjs`, run after `vite build`,
      copies `dist/index.html` to `dist/topic/<slug>/index.html` for all 25
      modules plus `/menu`. No framework change, no SSR runtime — nothing here
      renders the app, it swaps `TOPICS` metadata into the head and body of the
      shell the bundle already produced, and the app boots on top of it.
- [x] Per-route `<title>`, `description`, canonical, `og:*` and `twitter:*`
- [x] `<noscript>` summary: per page its title, group, difficulty, estimate and
      `intro`, plus the full grouped topic list on every page so no prerendered
      URL is a dead end
- [x] `sitemap.xml` + `robots.txt` generated from `TOPICS` (`/progress`
      excluded from both — it is one signed-in user's history)

Three things here are less obvious than they look, and each is load-bearing:

- **The rewrites are generated, not assumed.** `prerender.mjs` prepends an
  explicit `200` rule per known slug to `dist/_redirects`, above the `/*`
  catch-all. Netlify would probably resolve `/topic/x` to `/topic/x/index.html`
  by itself, but that is the single behaviour the whole step depends on and it
  cannot be verified without deploying. Listing only slugs that exist keeps the
  router's own 404 for anything else — a blanket rule would turn an unknown
  topic into a hard Netlify 404.
- **`src/topics.ts` cannot simply be imported by a build script.**
  `renderTopicCard()` pulls in framework.ts, which imports KaTeX's stylesheet,
  and Node cannot load `.css`. `scripts/load-topics.mjs` transpiles it and
  stubs the DOM-facing imports (the same trick as `scripts/test-router.mjs`).
  That is also why this is a build step rather than a Vite plugin.
- **`SITE_URL` is defined once**, in `scripts/site-url.mjs`, imported by both
  vite.config.ts and prerender.mjs. Two copies would eventually disagree, and
  the symptom — a shared link unfurling with the wrong host — is invisible
  from inside the repo.

### I.2 Feedback loops — build before recruiting users

There is no point getting 50 users if nothing captures what they hit.

- [x] Helpful / Not helpful under every graded explanation — `helpfulBar()` in
      framework.ts, one verdict per question id, one-shot (it asks once and
      replaces itself; there is no running tally for an irritated reader to
      drive)
- [x] Feedback form and bug report — a native `<dialog>` from the sidebar,
      src/feedback.ts. **`textContent` only, per 0.5**: the submitted text is
      never interpolated into HTML and never read back into the page
- [x] Lightweight, privacy-respecting analytics — src/signals.ts: `view`
      (topic id + seconds, written on LEAVING, so one row says both "opened"
      and "abandoned after 4s") and `quiz` (the question a student stopped on
      + how many they answered)

All four land in ONE `signals` table (SQL and the queries it exists to answer
are in SUPABASE_SETUP.md). Four points that are not obvious:

- **It does not use the Supabase client.** progress.ts loads that lazily
  because it is ~110 kB of auth machinery (D.10), and logging a page view must
  not drag it in for a visitor who never signs in. PostgREST is plain HTTP: one
  `fetch`, the publishable key, insert-only by policy, `keepalive` so the last
  batch survives the page going away.
- **The table accepts rows from signed-out visitors**, unlike `solved` /
  `attempts` / `bookmarks`. Most readers never make an account and their
  experience is the thing worth measuring. There is no select policy at all, so
  nothing can read it back through the API.
- **Passive and deliberate signals are treated differently.** Do Not Track /
  Global Privacy Control silences `view` and `quiz`. It does NOT silence a
  pressed "Not helpful" or a submitted bug report — discarding those would
  throw away a message the reader chose to send.
- **The identifier is per-tab, not per-person**: a random id in
  sessionStorage, so one visit's rows group together and nothing follows anyone
  between visits. No user id, no cookie.

### I.3 Reach (after I.1 and I.2 are live)

- [ ] Chemistry teachers, olympiad Discords, relevant subreddits, school clubs
- [x] "CCC Study Guide" / "USNCO Study Guide" landing pages — `/guide/<slug>`,
      src/guides.ts (the prose) + src/guide.ts (the page). Assembled entirely
      from content that already exists: the in-scope modules, the corpus totals,
      the practice banks. Prerendered by I.1's pipeline with their own title and
      description, in the sitemap, and linked from the menu directory so they
      are not reachable only from Google.

      Three decisions in there worth keeping:

      - **The slug IS the search phrase** (`ccc-study-guide`), because that is
        the entire reason the page exists. `scripts/test-router.mjs` gates them
        like topic slugs — resolve, trailing slash, casing, no collisions, and
        an unknown guide slug still reaching the router's 404.
      - **No exam mechanics are stated.** No dates, scoring, time limits or
        eligibility: those change yearly, they are the organiser's to publish,
        and a study guide that quotes them wrongly is worse than one that
        doesn't. Each page links the official page instead and says so.
      - **The CTA sets competition mode, then opens the directory.** The page's
        one job is to hand a student the site already filtered to their contest
        — that is the thing a generic "study guide" article cannot do, and it
        costs one `setMode()` call.
      - src/guides.ts is **pure data with no value imports**, so
        scripts/prerender.mjs can load it in Node without stubbing anything.
        Adding a third guide (CCO, IChO) is one entry in `GUIDES`.
- [ ] Short explainer videos if the earlier items show real traffic

---

## Suggested six months

Adjusted for what already exists and for the Phase A dependency.

| Month | Focus |
| --- | --- |
| **1** | Phase 0 (week 1) → Phase A. Unglamorous; unblocks everything after it. |
| **2** | Phase B — missions and misconceptions. Biggest jump in *felt* quality. |
| **3** | Phase C — tier, cut, and write Gold/Platinum. Plus challenge mode. |
| **4** | **Phase D — product polish.** D.0/D.1 first (they are hours, not days), then the page contract. |
| **5** | Finish D (content backfill is the long pole) → D.12 gate → Phase E + I.1/I.2, then recruit the first 25–50 users. |
| **6** | Fix what they complain about. Phase F or G, whichever the feedback points at. |

Phase H stays parked unless the month 5–6 feedback demands it.

---

## The filter

> Before adding any feature, ask: **"Will this help an Olympiad student
> understand chemistry better, or solve harder problems?"**
> If yes, build it. If not, spend the time on something with greater
> educational impact.

Two things this filter should be pointed at first, because they are the ones
most likely to eat time without returning any:

- **Phase H's AI explanations** — real backend, real cost, unmeasured demand.
- **Any new topic module.** Coverage is close to complete at 25. Depth in the
  25 that exist beats a 26th.

The one measurement that matters more than anything else on this page: **get it
in front of 25 real students.** Twenty hours building the wrong feature is a
worse outcome than one hour reading feedback that redirects you.
