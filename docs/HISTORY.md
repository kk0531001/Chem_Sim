# ChemPrep — how it got here

A chronological account of the project, from a particle sandbox to a routed
olympiad-training site with cloud-synced progress. Written from the commit
record, not from memory, so the dates and numbers are the real ones.

For the *forward* plan see [ROADMAP.md](../ROADMAP.md). For the code map and
working rules see [README.md](../README.md) and [CLAUDE.md](../CLAUDE.md).

---

## Stage 1 — The sandbox (`ee23836`, 6 July 2026)

**34 files, 5,164 lines, one commit.**

The project starts as what its own README called a "Chemistry Engine": a live 2-D
particle simulation where atoms drift, collide, and bond according to valence
rules, with molecules emerging rather than being scripted.

The engine architecture set here is still the architecture today:

- A flat `particles` array and a `bonds` list in [`src/sim.ts`](../src/sim.ts).
  **No ECS, no physics library.** One function per physical process, one process
  per file — [`movement.ts`](../src/movement.ts) (springs, repulsion,
  thermostat, integration), [`reaction.ts`](../src/reaction.ts) (bond formation
  and breaking), [`render.ts`](../src/render.ts) (PixiJS drawing),
  [`molecules.ts`](../src/molecules.ts) (formula detection over the bond graph).
- All mutation goes through sim.ts helpers (`addBond`, `removeBond`,
  `spawnParticle`, `clearAll`) because they keep the id→particle and pair→bond
  maps in sync. Nothing else pushes to those arrays.
- `Particle` and `Bond` in [`particle.ts`](../src/particle.ts) are a locked
  contract: additive changes only.

Crucially, the same commit already contained a **tab framework** and 13 tab
modules (quantum, bonding, stoich, thermo1/2, gases, equilibrium, aek, nuclear,
organic1/2, labdata, sandbox). So the shape of the product — a sandbox *plus*
one interactive module per topic, each with a theory panel of real equations and
olympiad traps — was present from day one. Everything after this is expansion
and rigour, not redirection.

The shared helpers in [`framework.ts`](../src/tabs/framework.ts) (`h`, `card`,
`theory`, `slider`, `select`, `pills`, `plot`, `quiz`) date from here too, and
the rule that modules use them instead of hand-rolling DOM has held for the
whole project — which is why later cross-cutting work (KaTeX, accessibility,
attempt logging) could be done once in one file rather than 24 times.

---

## Stage 2 — A front door (`6f14f6b`, 10 July 2026)

**+2,032 lines.**

A homepage. Until now the app opened straight into the tool. This added
[`src/home.ts`](../src/home.ts): a landing page with scroll-reveal, figure
panels, and — the detail that gives the site its character — a **live miniature
of the actual simulation running in the hero**, hydrogen and oxygen finding each
other under the same valence rules the sandbox uses. The headline claim ("the
chemistry on this page is *actually running*") is literally true, which is the
whole pitch.

The app shell stays hidden until you enter from the homepage.

---

## Stage 3 — A visual language (`1c1752c`, 23 July 2026)

**+585 / −421 — the first commit that deleted nearly as much as it added.**

A deliberate design system rather than accumulated styling, named **"Lab
Journal"** and defined entirely as CSS variables in
[`style.css`](../src/style.css):

- **Paper and ink** reading surfaces (`--paper`, `--ink`, `--rule`) — the site
  reads like a lab notebook.
- **One accent** (`--accent`, flame orange). One. Not a palette.
- **Dark instrument panels** (`--panel`, `--panel-text`) reserved for canvases,
  SVG figures and numeric readouts — the "instruments" sit on dark, the prose on
  paper.
- Serif display type for headings; monospace **only** for numbers.
- **No emoji anywhere.** Every glyph is a text label or inline SVG.

Same commit: sliders got their callbacks coalesced into a
`requestAnimationFrame`, so dragging a control doesn't run an expensive canvas
redraw per input event. (That coalescing later caused a confusing false negative
while testing — worth knowing it's there.)

---

## Stage 4 — The attribution rule (`9a8552b`, 24 July 2026)

A one-line commit, noted because it shaped everything after: `CLAUDE.md` records
that commits carry no AI attribution trailers. Later, when the repo's visibility
came up, that rule became the first item on the roadmap — in a *public* repo it
is its own disclosure. It was resolved by making the repository **private**, and
the rule stands.

---

## Stage 5 — Depth: the CCO tier (`95a8f7c`, 27 July 2026)

**+1,079 lines.**

The first push past introductory material: advanced CCO-level modules, per-module
quiz banks, and the CCO problem sets (PS1–PS4) as multi-part free-response
problems with worked solutions.

This is where the **copyright rule** was set, and it has never been relaxed:
every question in the app is **original**, written to match the format and
difficulty of real CCC/CCO/USNCO papers. Real papers are only ever *linked*,
never reproduced.

---

## Stage 6 — From app to website (`b894952`, 28 July 2026)

**33 files, +1,566 lines.** Two large changes at once.

**Real URLs.** [`src/router.ts`](../src/router.ts) turned a tab-switcher into a
multi-page site over the History API: `/` (home), `/menu` (full directory),
`/topic/:id` (one page per module). Netlify needs `public/_redirects` for deep
links to resolve. [`src/topics.ts`](../src/topics.ts) became the *single* source
of topic metadata, feeding the homepage grid, the menu, and the
breadcrumb/prereq/next-lesson chrome — so a new module is added in one place.
The pattern (persistent sidebar + breadcrumb + prev/next) is the docs-site
convention, chosen so every module is bookmarkable and shareable and gets real
browser back/forward.

**Accounts and cloud sync.** [`src/progress.ts`](../src/progress.ts) plus a
Supabase `solved` table with row-level security, and
[`authWidget.ts`](../src/authWidget.ts) as the one shared sign-in UI (Google
OAuth or email magic link — passwords are never handled). Two constraints set
here still hold: cloud sync is **optional** (absent env vars, the app degrades to
local-only and must never crash), and only the publishable anon key is ever used.

This commit also introduced the defect that Phase A would later exist to fix:
progress was keyed by `qid()`, a hash of the question's own text.

---

## Stage 7 — Reorganised by chemistry, not by exam (`cc1e843`, 28 July 2026)

**25 files, +1,671 lines.**

Roughly 40 new subtopics, and — more consequentially — a re-taxonomy. The old
grouping (Inorganic & Organic / Advanced CCO / Skills) mixed *subject* with
*difficulty*. It was replaced with domain groups — Playground · Foundations ·
Physical · Organic · Inorganic · Laboratory Skills · Spectroscopy · Practice —
and difficulty moved to separate CCC < USNCO < CCO < IChO badges.

The point: a student looking for "the acids module" shouldn't have to know which
exam tier it was filed under. Because `topics.ts` was already the single source,
the sidebar, menu, homepage and prev/next chrome all followed automatically.

New in this stage: `physchem`, `organic3` (retrosynthesis and strategy, not just
reactions), `coordchem`, `labtech` (distillation, recrystallisation, extraction,
chromatography — the biggest content gap at the time), and `structure` (combined
IR + NMR + mass-spec unknowns, which is what olympiads actually ask).

A bug found and fixed here is worth recording: sidebar clicks called the tab
system's `show()` directly, bypassing the router, so the breadcrumb and
prev/next chrome didn't update. `initTabs()` gained an `onSelect` callback so
navigation always goes through the History API.

---

## Stage 8 — Real notation (`3d47b66`, 28 July 2026)

**+107 lines, and it changed how the whole site reads.**

KaTeX with the **mhchem** extension, so chemistry is written as chemistry:
`\ce{2H2 + O2 -> 2H2O}` renders properly, equilibrium arrows included.

The subtlety: modules rebuild `innerHTML` on every slider drag, so typesetting
can't be a one-time pass. `autoTypeset()` uses a MutationObserver, but that
flushes on `requestAnimationFrame`, which is throttled when nothing is painting.
So `quiz()` and the FRQ browser call `typesetMath()` **explicitly** after each
`innerHTML` assignment rather than trusting the observer — otherwise raw
`\( … \)` flashes on screen.

---

## Stage 9 — Thinking like a competitor (`1cf04f7` and `2f4f154`, 28 July 2026)

**+774 lines across two commits.**

The observation driving both: most sites ask *"calculate the pH."* Olympiads give
you an unknown acid, a titration curve, and an IR spectrum, and ask you to
*explain what's happening*.

**Integrated Challenges** ([`bankIntegrated.ts`](../src/tabs/bankIntegrated.ts))
— multi-topic, multi-step problems that deliberately span two areas:
Thermo+Equilibrium, Organic+Spectroscopy, Electrochem+Equilibrium, Crystal
Field+Magnetism. Experimental design, data interpretation, graph reading,
open-response reasoning.

**Olympiad Questions** ([`bankOlympiad.ts`](../src/tabs/bankOlympiad.ts)) — five
full-length **original** mock papers in `olympiadPaper1–5.ts`, each matching the
real contest shape (Part A = 25 multiple choice, Part B = written multi-part),
plus `OFFICIAL_PAPERS`: a **links-only** panel to the genuine CCC/CCO PDFs on
cheminst.ca, sorted by year, competition and part. Original questions, real
papers linked — never copied.

A technical constraint shaped these: the FRQ browser sets `innerHTML`, so it
cannot run the live canvas `plot()`. Hence `miniPlot()`, which returns an SVG
string, so problems can embed graphs and data tables.

---

## Stage 10 — The turn from building to engineering (`63ceaee`, 29 July 2026)

[**ROADMAP.md**](../ROADMAP.md). Not a feature — a plan, written after auditing
the source rather than from the feature wishlist. It changed the plan in two
places, both because a dependency was hiding in the ordering:

1. **"Build user accounts" was already done.** Auth, sync and RLS had shipped in
   Stage 6. That phase collapsed into "record richer data and display it," which
   deleted about a week of planned work.
2. **Three phases shared an unlisted prerequisite.** Quiz history, weak-topic
   tracking, recommendations, search and competition modes *all* need questions
   to be addressable entities with metadata. A question was an anonymous object
   literal identified by a hash of its own prompt. That refactor became Phase A
   and was promoted ahead of everything that depended on it.

The guiding filter, applied from here on: *will this help an olympiad student
understand chemistry better, or solve harder problems?*

---

## Stage 11 — Sharing, correctness, accessibility (29 July 2026)

Four commits working the roadmap's Phase 0 — the small, unglamorous, high-value
batch.

### `14db234` — Metadata (roadmap 0.2)

`index.html` had a `<title>` and nothing else, so every shared link unfurled
blank — on the one channel the growth plan depends on. Added a full Open Graph
set, `twitter:card`, a meta description and canonical link, and four icon assets
built from the existing `.tile` mark (flame orange on dark panel).

Social scrapers don't resolve relative `og:image` paths and don't run JS, so the
origin must be present in the served HTML. `index.html` carries a `%SITE_URL%`
placeholder that [`vite.config.ts`](../vite.config.ts) substitutes at build time
from `VITE_SITE_URL`, else Netlify's automatic `URL`, else localhost.

Also corrected the homepage lede, which still advertised "Eighteen interactive
modules … 650+ exam-style questions."

### `98b9f63` — Four correctness bugs (roadmap 0.4)

Chemistry errors in a chemistry teaching tool, which makes them worse than
ordinary bugs.

- **The orbital viewer claimed to show `|ψ|²` while colouring by the sign of ψ.**
  A squared quantity has no sign. Retitled to signed amplitude, with a note on
  why the sign is the point (bonding vs antibonding overlap) that squaring would
  discard.
- **`3d_{x²−y²}` was drawn with no nodes.** Its angular part `x²−y²` collapses to
  `x²` in the x–z slice — non-negative everywhere, so the render showed neither
  nodal plane nor any sign alternation: exactly the features the orbital exists
  to teach. Orbitals now carry an optional `plane` and this one draws in x–y.
  Verified by scanning a ring around the nucleus in the rendered canvas: four
  sign changes at 46°/136°/226°/316°, where the old version had none.
- **The Ksp common-ion solver diverged.** It dropped the `n·s` the dissolving
  solid itself contributes, valid only while `C ≫ s`. PbCl₂ at 10⁻⁴ M Cl⁻
  reported **1.70×10³ M** against a true **1.62×10⁻² M**; CaF₂ was out by 21×.
  Now bisects the full `(m·s)^m(C + n·s)^n = Ksp`. Rather than just clamping, the
  panel shows the textbook shortcut *beside* the exact answer and says when it
  has left its valid regime — knowing where an approximation breaks is the
  olympiad skill.
- An unexplained `* 12` in four force accumulations became a documented
  `FORCE_DT`.

### `50b7dd5` — An attempt log (roadmap A.3)

The solved set keeps only successes, which is the wrong half of the data: weak
topics, review and streaks are all aggregations over the answers a student got
**wrong**. `recordAttempt()` now logs every answer.

Three things this had to get right:

- **The local log is capped.** At 149 bytes a row, 50 answers a day passes the
  ~5 MB localStorage quota inside two years — and exceeding it throws on every
  later write, so progress would silently stop saving. localStorage keeps a
  1,000-row window; bounded aggregates carry the statistics.
- **`streakDays()` anchors its day-walk at local noon.** Subtracting a flat 24 h
  from local *midnight* lands on 23:00 the previous day across a spring-forward
  boundary, skipping a calendar day. Tested in five timezones across both 2026
  transitions: a midnight anchor turns a 10-day streak into 9 on every
  spring-forward, southern-hemisphere October shifts included.
- **Attempts sync by upsert on a client-generated uuid**, because an append-only
  table has no natural key to deduplicate on and a retried push would duplicate
  rows.

### `3ca94c0` — Accessibility (roadmap 0.3)

There were **zero** `aria` and zero `role` attributes in `src/` before this.
Landmarks, a skip link past 25 sidebar items, `aria-current="page"`, per-route
document titles and focus movement on navigation (in a JS-routed app nothing
otherwise tells a screen reader the page changed), canvas text alternatives
derived from the data `plot()` already has, and `aria-valuetext` on sliders so
the formatted quantity is announced instead of the raw number.

Two judgement calls contradicted the roadmap's own suggestions, correctly:

- **The quiz is deliberately not a `role="radiogroup"`.** A radio group models a
  *revisable* selection with arrow-key movement and `aria-checked`; here the
  first click is final and immediately graded. It is a group of buttons named by
  the question. What it actually needed was colour independence — `.correct` and
  `.wrong` were green and red and nothing else — so graded buttons carry
  screen-reader suffixes and the verdict leads the live explanation.
- **`pills()` *is* the ARIA tabs pattern**, so it got all of it including a
  roving tabindex. Its panels are now all mounted with the inactive ones
  `hidden`, because `aria-controls` only means something if it resolves to an
  element in the document — three of every four tabs had been pointing at a
  detached id.

Contrast was fixed by measurement, not by eye: `--ink-faint` was 2.96:1 on
paper, failing AA on every quiet label. The accent was **split** rather than
restyled — `--accent` stays the brand colour for fills, borders and large
display type (3.26:1 clears the 3:1 large-text bar), with `--accent-dark`
(4.82:1) as the text weight.

---

## Stage 12 — Permanent question ids (`09e19b5` + `697ecec`, 29 July 2026)

The keystone the roadmap was reordered around, in two commits: scaffolding, then
the write.

**The defect.** Progress was keyed by `qid(question text)`. Fixing a typo in a
shipped question changed its hash and silently orphaned every user's record for
it, locally *and* in Supabase, with no error and no recovery. It also meant
nothing could be queried — no topic or difficulty field existed on quiz
questions, so "show me hard equilibrium questions I got wrong" was unanswerable.

**The change.** `scripts/backfill-ids.mjs` inserted **919 explicit ids** across
17 files. `id` is **required** on `QuizQ`, `BankMC` and `FRQ`, so a missing one
is a compile error rather than a silent gap. The codemod derives ids from array
position, never from a counter over existing ids — which is what makes it
idempotent: a rerun reports zero new and never renumbers.

Requiring `id` paid for itself immediately. `qbank.ts` was rebuilding bank
questions field by field, `({ q, opts, a, why }) => ({ q, opts, a, why })`,
dropping the new fields — and it would have dropped any field added later. That
was the only compile error the change produced.

**Two vocabularies, deliberately not merged.** `QuizQ.topic` is a `ModuleId`
(`quantum`, `thermo1`), which each quiz bank maps to 1:1 so it backfills with no
judgement. The exam banks keep their coarser `ExamTopicId` — rewriting 332 values
to a different vocabulary would be a semantic change disguised as a refactor.
One `MODULE_EXAM_TOPICS` table bridges them, and attempts normalise onto the
coarse vocabulary so the same chemistry doesn't split across two sets of
half-populated buckets.

**Existing progress is migrated, not orphaned.** `migrateLegacyProgress()` builds
the legacy-hash → explicit-id map from current question text and calls
`remapProgressIds()` once per browser. Verified by seeding a returning user's
records under the old hashes and doing a real page reload: every record moved,
legacy keys gone, unrelated keys untouched.

[`src/content/registry.ts`](../src/content/registry.ts) is now the one flat
indexed view of the corpus — built for the migration, and what Phase C tiering
and Phase E search will query. `auditCorpus()` runs in dev and fails loudly on a
duplicated id or an answer index outside its `opts` range.

### Stage 12b — The metadata half

Ids alone fixed the defect but left the corpus unqueryable, so the same phase
finished with difficulty tiers and competition scope.

Both are **derived with optional overrides** rather than stored on 919
questions: hand-tiering 919 items in one pass isn't accurate, and a stored copy
of a default goes stale the moment a module's difficulty changes. The corpus
already encodes difficulty structurally — documented warm-ups, multi-part
written problems, module `difficulty` — so the derivation reads it off. `comps`
is an upward closure from the lowest level a module is pitched at, which is what
makes a competition mode *narrow* what you see instead of relabelling it.

The 125 untagged olympiad questions were classified by scoring their text
against per-topic keyword sets, with the matched evidence printed for review.
Seventeen the keywords got wrong or couldn't see are pinned in an explicit
override table with a reason each — including the systematic one worth
remembering: `/mole/` matches "**mole**cule", which had filed *"which molecule
is polar?"* under stoichiometry.

Two bugs surfaced only because the numbers were checked afterwards. The topic
index was keyed on the raw `topic` string, so `thermo1`/`thermo2` sat in
different buckets from `thermo` and a query for thermodynamics silently missed
50 module questions. And `ladderFor('coordchem', 'ccc')` returned 25 questions
for a module that isn't on the CCC syllabus at all, by pooling exam-bank
questions that merely shared its topic.

The resulting distribution is itself the useful output — **Bronze 115, Silver
550, Gold 230, Platinum 24** out of 919. The corpus is overwhelmingly Silver
with 24 Platinum items total, which confirms Phase C's premise: the gap is at
the top of the ladder, so that phase is a writing task, not a tiering task.

---

## Where it stands

| | |
| --- | --- |
| Source | ~11,500 lines of TypeScript + CSS, 64 modules |
| Dependencies | pixi.js, tweakpane, katex, @supabase/supabase-js — that's all |
| Topic modules | 24, in 8 domain groups |
| Multiple-choice questions | **853**, every one original |
| Written problems | **66**, with 212 worked sub-parts |
| Mock papers | 5 full-length originals, plus links to the real ones |
| Progress | solved set + full attempt log, offline-first, optional cloud sync |
| Accessibility | landmarks, keyboard patterns, AA contrast throughout |

### Things that have held from the start

- Flat arrays, one process per file, no ECS and no physics library.
- `topics.ts` as the single source of topic metadata.
- Shared helpers in `framework.ts` rather than per-module DOM — which is *why*
  KaTeX, accessibility and attempt logging were each one file to change.
- Every question original; real papers linked, never reproduced.
- Cloud sync optional, and never a crash without it.
- One accent, no emoji, paper for prose and dark panels for instruments.

### What the record suggests about the next mistake

Every bug in Stage 11 was of one kind: **something that looked right and was
never checked against a number.** A label that contradicted its own colour key.
An orbital that rendered without the nodes it exists to teach. An approximation
applied outside its regime, printing 1700 M in a teaching tool. A streak that
would quietly lose a day every spring.

None were found by a test suite, because there isn't one. They were found by
computing the value and comparing it against a textbook. That is the practice
worth keeping — and the argument for the content audit in
[ROADMAP.md](../ROADMAP.md), which has not yet been run.
