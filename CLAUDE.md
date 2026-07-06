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
  ({ id, label, mount }) registered in src/main.ts. Tabs mount lazily.
- Tabs with animation loops must gate on visibility via the `TabHandle`
  onShow/onHide callbacks (see equilibrium.ts, gases.ts, nuclear.ts).
- Use the shared helpers in src/tabs/framework.ts (h, card, theory, slider,
  select, pills, plot) instead of hand-rolling DOM or canvas-axis code.
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
