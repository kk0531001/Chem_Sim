# Chemistry Engine — CCC Olympiad Trainer

An interactive chemistry learning environment built for Chemistry Olympiad (CCC /
USNCO-style) preparation. A live particle sandbox plus **12 topic tabs**, each with
interactive simulations, a 🎯 instant-feedback quiz (25 questions per topic —
5 warm-ups then 20 olympiad-style, 300 questions total), and a theory panel of
key equations and olympiad traps.

Built with **TypeScript + Vite + PixiJS v8 + Tweakpane**, following the
"appropriately simple" architecture: a flat particle array, a bond list, and one
function per physical process. No ECS, no physics-engine black box.

## Run it

```bash
npm install
npm run dev     # open http://localhost:5173
```

## The tabs

| Tab | Interactive tools |
|---|---|
| **Sandbox** | the original emergent-chemistry particle sim (valence bonding, presets, census) |
| **Quantum** | hydrogen orbital viewer (real wavefunctions), radial distributions, Rydberg level diagram, e⁻ configuration builder with Cr/Cu exceptions |
| **Bonding & MO** | VSEPR explorer (all 13 AXₘEₙ classes with sketches), MO diagrams for period-2 diatomics (bond order, paramagnetism, π/σ ordering flip) |
| **Stoichiometry** | limiting-reagent visualizer with bars, molarity & dilution calculators, % yield |
| **Thermo I** | calorimetry mixer (q = mcΔT), Hess's law worked examples, ΔH from bond enthalpies |
| **Thermo II** | microstate counter (S = k ln W), ΔG = ΔH − TΔS explorer with spontaneity crossover, ΔG° ↔ K converter |
| **Equilibrium** | live N₂O₄ ⇌ 2NO₂ kinetic sim with Le Chatelier perturbation buttons (add, compress, heat), ICE-table solver with 5% rule check, Ksp solver (common-ion, Q vs Ksp precipitate check) |
| **Acids · Redox · Kinetics** | titration curve simulator (weak/strong, buffer region, indicators), buffer designer & shock test, galvanic cell builder with Nernst slider, Faraday electrolysis calculator, integrated rate law plots + Arrhenius |
| **Gases & Phases** | kinetic gas box (PV = nRT), Maxwell–Boltzmann curves, draggable phase diagrams (H₂O & CO₂), Clausius–Clapeyron vapor pressure/boiling tool, colligative calculator |
| **Nuclear & Coord.** | stochastic decay sim vs. exponential law, C-14 dating, crystal field explorer (high/low spin, CFSE, color), descriptive-chem reference tables |
| **Organic I** | SN1/SN2/E1/E2 decision engine with energy profiles, pKa ladder ("who deprotonates whom"), carbocation stability |
| **Organic II** | alkene addition predictor (Markovnikov & anti-), EAS directing-effect visualizer, carbonyl reaction map, point-group identifier |
| **Lab & Data** | Beer's law calibration-curve simulator with noisy standards and unknown, sig-fig counter + calculation rules, glassware uncertainty table, titration technique & error-direction reference |
| **Question Bank** | original exam-format practice split by part: Part I multiple choice (110, filterable by 12 topics), Part II multi-part free response with worked solutions (22), Part III laboratory scenarios (25); topic filter + shuffle |

## What you can do

- **Concept presets** (left panel) load a scenario plus an explanation of the
  chemistry it demonstrates: covalent bonding (H₂), valence (H₂O), multiple bonds
  (N≡N, O=O), carbon skeletons (organic soup), and thermal dissociation /
  equilibrium (crank the temperature).
- **Temperature slider** — a velocity-rescaling thermostat. Hot systems break
  bonds (higher-order bonds resist longer, a crude activation-energy analogue);
  cool systems let molecules survive. Slide it back and forth to watch
  equilibrium shift.
- **Add atoms** — spawn H, C, N, O and watch what forms. Yellow pips on an atom
  show its open valence slots.
- **Molecule census** (right panel) — live count of every molecular species,
  identified by Hill-notation formula and named when known (including reactive
  intermediates like the methyl and hydroxyl radicals).

## The chemistry model

| Rule | Implementation |
|---|---|
| Valence | H:1 C:4 N:3 O:2 bond slots; a double bond consumes two |
| Bond formation | close + slow-enough collision + free valence on both atoms |
| Bond order | isolated bonded pairs upgrade single → double → triple (O=O, N≡N) |
| Exothermic bonding | atoms lose kinetic energy when they bond |
| Dissociation | bonds snap when overstretched, plus a temperature-scaled random break |
| Molecule identity | connected components over the bond graph → Hill formula → name table |

## Code map

| File | Responsibility |
|---|---|
| [src/elements.ts](src/elements.ts) | element table: radius, color, valence, mass |
| [src/particle.ts](src/particle.ts) | `Particle` and `Bond` interfaces (the locked core) |
| [src/sim.ts](src/sim.ts) | state: particle/bond arrays, spawn, add/remove bond, params |
| [src/movement.ts](src/movement.ts) | integration, walls, bond springs, repulsion, thermostat |
| [src/reaction.ts](src/reaction.ts) | bond formation, order upgrades, dissociation |
| [src/molecules.ts](src/molecules.ts) | molecule detection, Hill formulas, naming |
| [src/render.ts](src/render.ts) | PixiJS: atoms, bond lines (1/2/3 parallel strokes), labels |
| [src/presets.ts](src/presets.ts) | sandbox concept scenarios + explanations |
| [src/ui.ts](src/ui.ts) | Tweakpane panel, census panel |
| [src/main.ts](src/main.ts) | tab registration |
| [src/tabs/framework.ts](src/tabs/framework.ts) | tab system + shared helpers (h, card, slider, select, pills, canvas plot) |
| [src/tabs/*.ts](src/tabs) | one module per topic tab; each exports a `TabDef` with lazy `mount()` and optional `onShow`/`onHide` for pausing animation loops |

## Roadmap — toward "all of chemistry"

Each of these is an additive module on the same particle/bond core, in rough order
of payoff:

1. **Kinetics & equilibrium instrumentation** — plot species counts over time;
   demonstrate rate vs. temperature (Arrhenius) and Le Chatelier quantitatively.
2. **Electronegativity & polarity** — per-element χ values; color bonds by
   polarity, give polar molecules weak dipole attraction (hydrogen bonding →
   water droplets, surface tension).
3. **States of matter** — with attraction in place, low temperature produces
   solids/liquids; melting and boiling emerge for free.
4. **Energy diagrams** — activation-energy barrier per reaction, reaction-energy
   profile drawn live as collisions succeed or fail.
5. **More elements** — Na, Cl, and friends: ionic bonding (electron transfer,
   +/− charges, lattices) contrasted with covalent.
6. **Organic module** — functional-group detection over the bond graph
   (–OH, –COOH, C=O, –NH₂), name more molecules, isomer awareness.
7. **Quantum module** (separate view, same app) — interactive orbital
   visualizations (s/p/d), electron-in-a-box, why valence *is* what it is.
   This is a renderer/UI module, not a change to the simulation core.
