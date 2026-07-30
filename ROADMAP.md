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

## Phase B — Make the simulations teach (2 weeks)

> "Not 'make prettier graphics.' Make them teach better."

Right now every simulation is *sliders with no goal*. A student moves a control,
watches something change, and learns nothing unless they already knew what to
look for. Missions invert that: state the goal, let them hunt for it.

### B.1 A shared mission framework (2–3 days)

Per the `CLAUDE.md` rule that shared behaviour lives in `framework.ts`, this is
one helper, not 12 bespoke implementations.

- [ ] `mission({ prompt, check, hints, onSolve })` in
      [framework.ts](src/tabs/framework.ts):
      - `prompt` — the goal, in words
      - `check(state) => boolean` — polled on the tab's existing animation tick
      - `hints` — a ladder, revealed one at a time on request (never automatically)
      - success state writes through to the same progress system as quizzes, so
        missions count toward completion
- [ ] Missions render as a strip above the sim controls, one active at a time,
      with the goal always visible while the student experiments.

### B.2 Misconception boxes (1 day)

There is already a `class="trap"` convention in the theory blocks, so this is a
content-and-CSS extension of a pattern that exists, not new infrastructure.

- [ ] `.misconception` block in [style.css](src/style.css) — visually distinct
      from `.trap` (a trap is an exam gotcha; a misconception is a *wrong mental
      model*). Per house style: inline SVG warning mark, **no emoji**.
- [ ] Optional `misconception` field on `QuizQ`, surfaced after a wrong answer.
- [ ] Write the canonical set. Starting list:
      - Pressure shifts equilibrium **position**, it does not change **K**
      - A catalyst does not change yield, only the time to reach it
      - `ΔG°` is not `ΔG` — the sign of `ΔG°` does not decide spontaneity under
        arbitrary conditions
      - Electronegativity ≠ electron affinity
      - Rate law exponents come from experiment, not stoichiometry
      - Strong ≠ concentrated
      - Entropy is not "disorder"
      - Le Chatelier's "add inert gas at constant V" → nothing happens

### B.3 Missions per simulation (1 week)

2–4 each. Concrete, checkable, chemically meaningful.

- [ ] **Gases** — "Raise T until pressure doubles at fixed V." · "Find where the
      ideal-gas line and the real-gas curve separate by 10%."
- [ ] **Equilibrium** — "Build a buffer at pH 5.0 ± 0.1." · "Shift toward
      products without touching temperature." · "Add inert gas at constant V and
      explain why nothing moved."
- [ ] **Thermo** — "Find conditions where ΔG goes negative." · "Find the
      crossover T for this ΔH/ΔS pair."
- [ ] **Kinetics / AEK** — "Determine the order from the concentration traces
      alone." · "Halve the half-life."
- [ ] **Sandbox** — "Get >80% H₂O." · "Dissociate the sample without adding
      reactants." (temperature only)
- [ ] **Quantum** — "Find every radial node in 3s." (after the 0.4 fixes land)

---

## Phase C — Question depth over question count (2–3 weeks)

> "I'd rather have 300 amazing questions than 2,000 average questions."

Important reframe: **you already have ~1,000 items.** This phase is a *curation
and upgrade* pass, not a writing sprint. The output is a smaller, better,
tiered bank — deletion is a legitimate result.

### C.1 Tier every question (uses `tier` from Phase A)

| Tier | Meaning | Example |
| --- | --- | --- |
| **Bronze** | Single concept, direct application | "Calculate the pH of 0.1 M HCl" |
| **Silver** | Two concepts combined | "pH at the half-equivalence point of a weak acid" |
| **Gold** | Three concepts, multi-step | "Given a titration curve, identify the acid and its Ka" |
| **Platinum** | Full olympiad problem | "Unknown acid + titration curve + IR — identify it and justify" |

- [ ] Tag all ~1,000 existing items
- [ ] Expect a lopsided result — most existing questions are Bronze/Silver. That
      distribution *is* the finding: the gap is Gold/Platinum.
- [ ] Delete or merge weak duplicates. Target ~300–400 excellent items.

### C.2 Write the Gold/Platinum layer

The distinguishing move: olympiads give you **evidence** and ask you to
**reason**, where most sites give you numbers and ask you to compute.

- [ ] Data-first stems — a titration curve, an IR trace, a kinetics table,
      a cooling curve, and a question about what it *means*
- [ ] Reuse `miniPlot()` from [framework.ts](src/tabs/framework.ts) for embedded
      SVG figures (the FRQ browser sets `innerHTML` and cannot run canvas `plot()`)
- [ ] Experimental-design prompts — "design a procedure to determine X"
- [ ] "Explain what's happening" prompts with rubric-style model answers
- [ ] Keep the standing rule: **all original**. Match format and difficulty of
      real CCC/CCO/USNCO papers, never reproduce them; link only.

### C.3 Challenge mode (1–2 days — nearly free once C.1 is done)

- [ ] End-of-lesson ladder: Bronze → Silver → Gold → **Olympiad Challenge**,
      pulling from the registry filtered by `topic` + `tier`
- [ ] Unlock progressively; the Platinum item is the payoff, framed as such

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
