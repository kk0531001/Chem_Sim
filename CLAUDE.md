# Chemistry Engine — working rules

Interactive 2D chemistry sandbox: TypeScript + Vite + PixiJS v8 + Tweakpane.
See README.md for the code map and roadmap.

## Commits

Never add `Co-Authored-By` trailers or any other Claude/Anthropic attribution
to commit messages in this repository. Commits are authored solely by the
repository owner.

## Locked interfaces

`Particle` and `Bond` in src/particle.ts are the contract every module depends
on. Do **not** rename or remove their fields. Additive changes only, and only
with a reason stated in the commit/summary.

## Architecture rules (from the project blueprint)

- Flat `particles` array + `bonds` list in src/sim.ts. No ECS, no physics
  library. One function per physical process, one process per file.
- All state mutation goes through sim.ts helpers (`addBond`, `removeBond`,
  `spawnParticle`, `clearAll`) — they keep the id→particle and pair→bond maps
  in sync. Never push to `particles`/`bonds` directly from other files.
- Tunable numbers live in `params` (sim.ts) and get a Tweakpane binding in
  ui.ts. Don't scatter magic constants in step functions unless they're truly
  fixed physics (spring stiffness etc., kept at the top of the file).
- New chemistry in the sandbox = a new step function called from the ticker in
  src/tabs/sandbox.ts, not a rewrite of existing ones.

## Pages & routing (src/router.ts)

- The app is a real multi-page site via the History API: `/` (home),
  `/menu` (full topic directory), `/topic/:id` (one page per module). Netlify
  needs public/_redirects (`/* /index.html 200`) for deep links to resolve.
- src/topics.ts is the SINGLE source of topic metadata (id/title/blurb/tag/
  group/icon/estMinutes/difficulty/prereqs) — used by the homepage teaser
  grid, the Menu directory, and the breadcrumb/prereq/next-lesson chrome in
  main.ts. Add a new module's entry there (and to DEFS in main.ts) — never
  duplicate the list. `renderTopicCard()` in topics.ts is the one card
  renderer shared by home.ts and menu.ts — extend it, don't fork it.
  Difficulty badges use the CCC < USNCO < CCO < IChO tiers (src/icons.ts has
  the matching line-art icon set, no emoji anywhere per house style).
- Topic pages show a breadcrumb (Home / group / title) and a prev/next footer
  driven by TOPICS array order — this is the docs-site pattern (MDN/Stripe
  Docs/Tailwind Docs: persistent sidebar + breadcrumb + prev/next), chosen
  deliberately over a single-page tab-switcher so each module is bookmarkable,
  shareable, and has real browser back/forward.

## Topic tabs (olympiad modules)

- Every study topic is a tab module in src/tabs/, exporting a `TabDef`
  ({ id, label, group, mount }) registered in src/main.ts. Tabs mount lazily
  and render as a grouped left-sidebar menu (initTabs returns a TabsAPI with
  show/suspend/resume used by the homepage ↔ app transitions in main.ts).
- src/home.ts is the landing page (scroll-reveal via IntersectionObserver).
  The app shell (#app) stays hidden until the user enters from the homepage.
- No emojis anywhere in the UI — use text labels or inline SVG (see MARK_SVG).
- Tabs with animation loops must gate on visibility via the `TabHandle`
  onShow/onHide callbacks (see equilibrium.ts, gases.ts, nuclear.ts).
- Use the shared helpers in src/tabs/framework.ts (h, card, theory, slider,
  select, pills, plot, quiz, missionLadder) instead of hand-rolling DOM or
  canvas-axis code.
- **Numeric input is always `numberInput({value, min, max, step})` read back
  through `numVal()`** — never a bare `<input type="number">` (D.6). A slider
  carries its limits in the DOM; a bare number field does not, and the one
  broken readout on the whole site was a typed value overflowing `exp()` to
  "Infinity atm". `numVal` clamps at read time (not on keystroke — that makes
  "0.05" untypable in a min-0.01 field) and always returns a finite number.
  Bounding is still not sufficient for an exponential: check `Number.isFinite`
  before printing anything you got from `Math.exp`.
- **A simulation that animates on its own is gated by `playPause()`**, whose
  starting state comes from `prefersReducedMotion()`. The setting picks whether
  it starts running — it never suppresses the animation, because in these
  modules the motion IS the content. Paused must still show a real computed
  frame, not an empty canvas.
- Every `plot()` call passes `xLabel` and `yLabel`. All 28 do; keep it that way.
- **The page contract** (ROADMAP D.4): a topic tab's `mount` appends exactly one
  `topicPage(id, { sims, quiz, theory })` from src/tabs/page.ts, which renders
  intro · theory · sims · quiz · challenge ladder · references in that order.
  Don't assemble a page by hand — the required fields (plus `intro`/`refs` on
  TopicMeta) are what make omitting a block a compile error rather than a
  silent gap. `topicPage` also adds the Reset button to every sim card that has
  a control; a card whose state is NOT in a control (particle box, integrator,
  decay clock) supplies its own and is skipped. `auditTopicPages()` in
  registry.ts covers what the type can't: reference count, bank size, and
  misconception coverage (≥ 4 per module, 167 corpus-wide).
- **Simulation missions** (ROADMAP Phase B) go through `missionLadder(defs)` +
  `cardWithMissions()` — one ladder per card, pinned above that card's controls,
  never a bespoke implementation. Call the returned `tick()` from wherever the
  card already recomputes (the slider `onInput` path, or the animation loop for
  tabs that have one). Three rules that are easy to get wrong:
  (1) mission ids are permanent and namespaced `msn-<tab>-<n>`, under the same
  no-renumbering rule as question ids, because they write through `markSolved`
  and count toward completion; (2) missions must NOT call `recordAttempt` — an
  open-ended experiment is not a graded answer and would distort per-topic
  accuracy; (3) before shipping a mission, confirm it is both **reachable** and
  **not already satisfied by the card's default state** — replay the sim's own
  maths offline rather than eyeballing it. Give every drive-the-sim mission a
  `meter()`, or a continuous slider turns the goal into a guessing game.
- Every topic tab has a quiz of at least 25 QuizQ entries (5 warm-ups, then 20+
  CCC/CCO/USNCO-style), stored in src/tabs/questions1.ts–questions7.ts
  (questions3/4 = Advanced-CCO banks; questions5 = periodicity + polymers;
  questions6 = physchem + organic3 + coordchem; questions7 = labtech +
  structure). Keep questions trap-focused and put the reasoning in `why`; pass
  the warm-up count as quiz(BANK, 5).
- Modules are grouped by CHEMISTRY DOMAIN, not exam tier. The nav-group /
  TopicMeta.group taxonomy (single source: topics.ts, mirrored by DEFS order in
  main.ts) is: Playground · Foundations · Physical Chemistry · Organic
  Chemistry · Inorganic Chemistry · Laboratory Skills · Spectroscopy · Practice.
  Difficulty is carried separately by the CCC/USNCO/CCO/IChO badges. When adding
  a module, set the same `group` string on both its TabDef and its TopicMeta and
  slot it into that group's run in BOTH topics.ts (menu/home/prev-next order)
  and main.ts DEFS (sidebar order). IChO-level CCO material now lives inside the
  domain groups: physchem/biophys (Physical), organic3 (Organic), coordchem/
  advinorganic (Inorganic), labtech/analytical (Lab Skills), spectroscopy/
  structure (Spectroscopy) — mirroring CCO problem sets 1–4.
- The Question Bank tab (src/tabs/qbank.ts) holds exam-format practice split
  by part: bankPart1.ts (Part I MC, 10 per topic), bankPart2.ts (Part II
  free-response FRQ with per-part worked solutions), bankPart3.ts (Part III
  lab scenarios), bankCCO.ts (advanced CCO problem sets PS1–PS4, reusing the
  FRQ type), and bankIntegrated.ts (Integrated Challenges — multi-topic,
  multi-step problems mixing two areas, e.g. Thermo+Equilibrium, Organic+
  Spectroscopy, Electrochem+Equilibrium, Crystal Field+Magnetism; reuses the
  ProblemSet/FRQ types with a theme picker), and bankOlympiad.ts (Olympiad
  Questions — five full-length ORIGINAL mock papers in olympiadPaper1–5.ts,
  each Part A = 25 MC + Part B = written FRQ, plus OFFICIAL_PAPERS: a
  LINKS-ONLY panel to the real CCC/CCO PDFs on cheminst.ca, sorted by year/
  competition/part). FRQ prompt/answer fields are HTML, so embed data tables
  and graphs via the `miniPlot()` SVG-string helper in framework.ts (the FRQ
  browser sets innerHTML and can't run the canvas plot()). All bank questions
  must be ORIGINAL — never copy real CCC/CCO/USNCO items (they are
  copyrighted); match format and difficulty only, and only ever LINK to real
  papers, never reproduce them. Topic ids: stoich, states, thermo, kinetics, equilibrium, acids,
  redox, atomic, bonding, descriptive, organic, lab.
- **Spacing, radius, shadow and duration come from the tokens in `:root`**
  (`--s-1…--s-8`, `--r-sm/md/lg/pill`, `--shadow-1/2/3`, `--t`, `--t-enter`) —
  D.7 collapsed 14 radii, 9 shadows and 9 durations into them. Existing
  hard-coded spacing was left alone on purpose, but new rules use the scale.
  Hover and collapse transitions are `var(--t)` (150 ms); anything longer needs
  a comment saying why it is not hover feedback.
- Visual language ("Lab Journal") is defined by CSS variables in src/style.css:
  paper/ink reading surfaces (--paper/--ink/--rule), ONE accent (--accent,
  flame orange), and dark instrument panels (--panel/--panel-text) reserved
  for canvases, SVG figures, and .result readouts. Serif display type
  (--serif) for headings; mono only for numbers. The sandbox tab is scoped
  dark under .sandbox-root. Keep canvas/inline drawing colors designed for
  dark backgrounds — canvases always sit on dark panels.
- Homepage figures use .figure (dark panel) + .fig-cap ("Fig. n — caption")
  — extend that pattern for any new illustrative content.
- Theory blocks: real equations, olympiad traps marked with class="trap".
  Chemistry content must be checked against textbook values (e.g. titration
  equivalence pH, E°cell, bond energies) before shipping.

## The content model (src/content/)

- Every question has an EXPLICIT PERMANENT `id` (919 of them), required on
  `QuizQ`/`BankMC`/`FRQ`. Never renumber one and never derive it from text —
  progress is keyed on it, so a changed id orphans a user's history. New
  questions get ids from `scripts/backfill-ids.mjs` (idempotent, dry-run by
  default).
- **Two topic vocabularies, deliberately.** `QuizQ.topic` is a `ModuleId`
  (`quantum`, `thermo1`); the exam banks use the coarser 12 `ExamTopicId`s.
  `toExamTopic()` in content/topicIds.ts is the ONE collapse between them —
  both the attempt log and the registry's topic index use it, so statistics and
  search can't disagree about what a topic is. Never key an index on the raw
  `topic` string: that splits `thermo1`/`thermo2` away from `thermo`.
- **`tier` and `comps` are DERIVED** (`tierOf()`, `compsOf()` in
  content/registry.ts) with optional per-question overrides. Don't bulk-store
  them: a stored copy of the default goes stale when a module's `difficulty`
  changes. `comps` is an upward closure from the lowest level in
  `TopicMeta.difficulty` — CCC content is in scope for CCO, not vice versa.
- src/content/registry.ts is the one flat view of the corpus (`ALL_MC`,
  `ALL_FRQ`, `byTopic`, `byModule`, `byTier`, `byComp`, `query`, `ladderFor`).
  Add a new bank there AND to `BANKS`/`QUIZ_BANKS`, or its questions silently
  vanish from every filtered view — `auditCorpus()` catches that in dev, along
  with duplicate ids and out-of-range answer indexes.

## Progress tracking (src/progress.ts)

- Solved questions are tracked by a stable content hash of the question text
  (`qid()`), cached in localStorage, and — when the user is signed in — synced
  to a Supabase `solved` table (per-user, row-level security).
- ALONGSIDE that, `recordAttempt()` appends to an attempt log (every answer,
  right or wrong) synced to an `attempts` table. All the progress statistics —
  `accuracyByTopic`, `weakTopics`, `streakDays`, `wrongQuestionIds`,
  `recentAttempts` — are derived reads over that log; add new stats as pure
  functions there rather than storing more counters. Three invariants worth not
  breaking: (1) the local attempt list is CAPPED (`MAX_ATTEMPTS`) because an
  unbounded log passes the ~5 MB localStorage quota in under two years, so any
  lifetime statistic must live in a bounded aggregate (`totalAttempts`,
  `topicStats`) and never be computed by counting the array; (2) each attempt
  carries a client-generated uuid and syncs by UPSERT, so a retried push cannot
  duplicate rows; (3) `streakDays()` anchors its day-walk at local NOON to
  survive daylight-saving transitions — anchoring at midnight silently
  truncates streaks every spring-forward.
- `remapProgressIds(map)` is the migration hook for giving questions explicit
  ids (ROADMAP Phase A.2): it rewrites the solved set, the attempt log and the
  outstanding-wrong set together. Editing a question's TEXT changes its `qid()`
  and orphans progress, which is the bug that motivates the explicit ids — so
  until that lands, avoid rewording shipped questions.
- Cloud sync is
  OPTIONAL: absent VITE_SUPABASE_URL/ANON_KEY env vars, the app degrades to
  local-only and must never crash. Auth is magic-link or Google OAuth only
  (never handle passwords directly). The anon key is publishable/client-safe;
  never use the service_role key. Setup steps live in SUPABASE_SETUP.md; keys
  go in .env (gitignored) and Netlify env vars.
- src/authWidget.ts is the ONE shared sign-in UI (Google + email magic-link),
  used both as the always-open sidebar panel (mountSidebarAccountPanel, called
  from main.ts) and the homepage "Sign in" popover (mountHomepageAccountWidget,
  called from home.ts). Don't duplicate this UI — extend authWidget.ts instead.
  See the quiz/FRQ progress integration in framework.ts / qbank.ts.

## Competition landing pages (src/guides.ts + src/guide.ts)

- `/guide/<slug>` (I.3). src/guides.ts is the prose and is **pure data with no
  value imports** — scripts/prerender.mjs loads it in Node, and every value
  import is another thing to stub there. src/guide.ts builds the DOM.
- The slug is the search phrase (`ccc-study-guide`), not the comp id. A new
  guide is one entry in `GUIDES`; the router, prerender, sitemap, `_redirects`
  and the router tests all derive from that array.
- **Never state exam mechanics** (dates, scoring, time limits, eligibility) on
  these pages. They change yearly and belong to the organiser — link the
  official page instead. Everything on the site is original practice; say so,
  and never imply a real paper is reproduced here.
- The page filters modules with `inScope` from mode.ts, the same rule the menu
  and the sidebar use. Don't re-implement "is this module on that syllabus".

## Feedback and analytics (src/signals.ts)

- All four feedback loops (I.2) write to ONE append-only `signals` table:
  `view` (topic + dwell seconds), `quiz` (where a student stopped),
  `explain` (the helpful/not-helpful verdict), `feedback` (the bug-report box).
  Add a new signal as a `kind`, not as a table.
- **Never route these through the Supabase client.** It is ~110 kB loaded
  lazily so a reader who never signs in never pays for it (D.10); logging a
  page view through it would undo that. signals.ts posts to PostgREST with a
  bare `fetch` + the publishable key, and the table is insert-only with no
  select policy.
- Passive signals (`view`, `quiz`) are suppressed under Do Not Track / Global
  Privacy Control. Deliberate ones (`explain`, `feedback`) are not — a reader
  who pressed "Not helpful" is sending a message, not being tracked.
- The identifier is a random per-TAB id in sessionStorage. Never key a signal
  on a user id, and never send anything free-text that the reader did not type
  into the feedback box themselves.
- Everything here is fire-and-forget: instrumentation must never surface an
  error to a student mid-question, and the UI acknowledges regardless of
  whether the row landed.

## Verifying changes

`npx tsc --noEmit` must pass (strict mode). To eyeball behavior: `npm run dev`,
load a preset, and check the molecule census panel — e.g. water synthesis
should yield mostly H₂O, air mostly N₂, and high temperature should dissociate
molecules into free atoms and radicals.

Note: the Launch preview panel's managed server has failed to bind a port in
this environment before; running Vite directly in the background and navigating
the preview tab to http://127.0.0.1:<port>/ (not `localhost`) worked.
