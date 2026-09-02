# Chemistry Engine — CCC Olympiad Trainer

An interactive chemistry learning environment built for Chemistry Olympiad (CCC /
USNCO-style) preparation. A live particle sandbox plus **12 topic tabs**, each with
interactive simulations, a 🎯 instant-feedback quiz (25 questions per topic —
5 warm-ups then 20 olympiad-style, 300 questions total), and a theory panel of
key equations and olympiad traps.

Built with **TypeScript + Vite + PixiJS v8 + Tweakpane**, following the
"appropriately simple" architecture: a flat particle array, a bond list, and one
function per physical process. No ECS, no physics-engine black box.

## Pages

The site is a real multi-page app with proper URLs and browser back/forward:

- **`/`** — homepage (hero, live sim, stats, module teaser grid, feature rows)
- **`/menu`** — the full topic directory, grouped by category with a search box
- **`/topic/:id`** — one page per module, with a breadcrumb (Home / group /
  title) and a prev/next footer for moving through the syllabus in order
- **`/guide/:slug`** — a study guide per competition (`/guide/ccc-study-guide`,
  `/guide/usnco-study-guide`): what the contest is, how to work through the site
  for it, and the modules in scope. The button on each sets competition mode.

Every page is bookmarkable and shareable, and reloading on any URL lands you
back on the same page (Netlify config in `public/_redirects`).

`npm run build` also runs `scripts/prerender.mjs`, which writes a static HTML
shell for every topic, every competition guide and `/menu` — per-page title, description, canonical
and Open Graph tags, plus a `<noscript>` summary — along with `sitemap.xml` and
`robots.txt`. The app boots on top of those files unchanged; they exist so that
a crawler, or a link unfurl, sees the topic instead of an empty document.

## Run it

```bash
npm install
npm run dev     # open http://localhost:5173
```

## Progress tracking

Solved questions are recorded automatically — answer a quiz question correctly,
or hit **Mark as solved** on a free-response problem, and it's saved. The
sidebar shows your solved count and each quiz shows an `X/25 solved` tally with
a `✓ solved` tag on questions you've already done.

By default this is stored **locally in the browser** (works offline, no setup).
To sync across devices, connect a free Supabase project — sign in with a
one-click magic-link email or "Continue with Google", available both from the
homepage (top-right) and inside the app sidebar. See
[SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the one-time setup (including
optional Google OAuth). Without keys configured the app runs fine in
local-only mode.

## The tabs

| Tab | Interactive tools |
|---|---|
| **Sandbox** | the original emergent-chemistry particle sim (valence bonding, presets, census) |
| **Quantum** | hydrogen orbital viewer (real wavefunctions), radial distributions, Rydberg level diagram, e⁻ configuration builder with Cr/Cu exceptions |
| **Periodicity** | interactive trend curves (IE/radius/EA/EN) with the Be→B and N→O anomalies annotated, a Slater's-rules Z_eff calculator, and diagonal/amphoterism reference |
| **Bonding & MO** | VSEPR explorer (all 13 AXₘEₙ classes with sketches), MO diagrams for period-2 diatomics (bond order, paramagnetism, π/σ ordering flip) |
| **Stoichiometry** | limiting-reagent visualizer with bars, molarity & dilution calculators, % yield |
| **Thermo I** | calorimetry mixer (q = mcΔT), Hess's law worked examples, ΔH from bond enthalpies, Born–Haber lattice-energy cycle |
| **Thermo II** | microstate counter (S = k ln W), ΔG = ΔH − TΔS explorer with spontaneity crossover, ΔG° ↔ K converter |
| **Equilibrium** | live N₂O₄ ⇌ 2NO₂ kinetic sim with Le Chatelier perturbation buttons (add, compress, heat), ICE-table solver with 5% rule check, Ksp solver (common-ion, Q vs Ksp precipitate check) |
| **Acids · Redox · Kinetics** | titration curve simulator (weak/strong, buffer region, indicators), buffer designer & shock test, galvanic cell builder with Nernst slider, Faraday electrolysis calculator, Latimer diagram + disproportionation, integrated rate law plots + Arrhenius |
| **Gases & Phases** | kinetic gas box (PV = nRT), Maxwell–Boltzmann curves, draggable phase diagrams (H₂O & CO₂), Clausius–Clapeyron vapor pressure/boiling tool, colligative calculator |
| **Nuclear & Coord.** | stochastic decay sim vs. exponential law, C-14 dating, crystal field explorer (high/low spin, CFSE, color), descriptive-chem reference tables |
| **Organic I** | SN1/SN2/E1/E2 decision engine with energy profiles, pKa ladder ("who deprotonates whom"), carbocation stability |
| **Organic II** | alkene addition predictor (Markovnikov & anti-), EAS directing-effect visualizer, carbonyl reaction map, Hückel aromaticity checker + chair-conformation notes, point-group identifier |
| **Polymers** | monomer↔polymer explorer (addition vs condensation), Mₙ/Mᵂ/PDI/degree-of-polymerization calculator, Carothers equation |
| **Lab & Data** | Beer's law calibration-curve simulator, sig-fig counter + calculation rules, uncertainty propagation + Q-test calculators, qualitative functional-group / ion / gas test tables, titration technique & error-direction reference |
| **Analytical & Quantitative** (CCO) | EDTA complexometric titration curves (conditional K′ vs pH), Debye–Hückel/Davies activity, gravimetric-factor & back-titration calculators, TLC Rf + separations reference |
| **Spectroscopy & Synthesis** (CCO) | IR band finder, ¹H-NMR n+1 splitting predictor + shift table, mass-spec DoU/nitrogen-rule/isotope calculator, named-reaction & pericyclic map |
| **Advanced Inorganic** (CCO) | LFSE + term symbols + Jahn–Teller, unit-cell density/radius/packing + Bragg's law + radius-ratio rules, HSAB & descriptive chemistry |
| **Physical & Biochemistry** (CCO) | Michaelis–Menten + Lineweaver–Burk with inhibitors, Eyring transition-state plots, Boltzmann populations, bioenergetics & protein/nucleic-acid reference |
| **Question Bank** | original exam-format practice: Part I multiple choice (110, 12 topics), Part II free response (22), Part III lab scenarios (25), and the four advanced **CCO problem sets** PS1–PS4 (Nov–Jan) with worked solutions; topic filter + shuffle |

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

> **For the current plan — phases, sequencing, and open decisions — see
> [plan3.md](plan3.md); [ROADMAP.md](ROADMAP.md) is the record of Phases 0–I,
> kept as history. For how the project got here, stage by stage, see
> [docs/HISTORY.md](docs/HISTORY.md).** The list below is the original
> *simulation engine* roadmap, kept for historical context; most of it has
> shipped.

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
