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
  select, pills, plot, quiz) instead of hand-rolling DOM or canvas-axis code.
- Every topic tab has a quiz of 25 QuizQ entries (5 warm-ups, then 20
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

## Progress tracking (src/progress.ts)

- Solved questions are tracked by a stable content hash of the question text
  (`qid()`), cached in localStorage, and — when the user is signed in — synced
  to a Supabase `solved` table (per-user, row-level security). Cloud sync is
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

## Verifying changes

`npx tsc --noEmit` must pass (strict mode). To eyeball behavior: `npm run dev`,
load a preset, and check the molecule census panel — e.g. water synthesis
should yield mostly H₂O, air mostly N₂, and high temperature should dissociate
molecules into free atoms and radicals.

Note: the Launch preview panel's managed server has failed to bind a port in
this environment before; running Vite directly in the background and navigating
the preview tab to http://127.0.0.1:<port>/ (not `localhost`) worked.
