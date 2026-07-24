# Chemistry Engine — working rules

Interactive 2D chemistry sandbox: TypeScript + Vite + PixiJS v8 + Tweakpane.
See README.md for the code map and roadmap.

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
  CCC/CCO/USNCO-style), stored in src/tabs/questions1.ts and questions2.ts.
  Keep questions trap-focused and put the reasoning in `why`; pass the
  warm-up count as quiz(BANK, 5).
- The Question Bank tab (src/tabs/qbank.ts) holds exam-format practice split
  by part: bankPart1.ts (Part I MC, 10 per topic), bankPart2.ts (Part II
  free-response FRQ with per-part worked solutions), bankPart3.ts (Part III
  lab scenarios). All bank questions must be ORIGINAL — never copy real
  CCC/CCO/USNCO items (they are copyrighted); match format and difficulty
  only. Topic ids: stoich, states, thermo, kinetics, equilibrium, acids,
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

## Verifying changes

`npx tsc --noEmit` must pass (strict mode). To eyeball behavior: `npm run dev`,
load a preset, and check the molecule census panel — e.g. water synthesis
should yield mostly H₂O, air mostly N₂, and high temperature should dissociate
molecules into free atoms and radicals.

Note: the Launch preview panel's managed server has failed to bind a port in
this environment before; running Vite directly in the background and navigating
the preview tab to http://127.0.0.1:<port>/ (not `localhost`) worked.
