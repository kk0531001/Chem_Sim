// Shared topic metadata — one entry per page/module, used by the homepage
// teaser grid, the full Menu directory, and the breadcrumb/prev-next footer
// on each topic page. `group` must match the `group` field on each TabDef.
export interface TopicMeta {
  id: string; title: string; blurb: string; tag: string; group: string; wide?: boolean;
}

export const TOPICS: TopicMeta[] = [
  { id: 'sandbox', title: 'Particle Sandbox', tag: 'Playground', group: 'Playground', wide: true, blurb: 'Spawn atoms and watch molecules self-assemble by valence rules — then heat the box until they shake apart.' },
  { id: 'quantum', title: 'Quantum & Atomic Structure', tag: 'Foundations', group: 'Foundations', blurb: 'Real hydrogen orbitals, radial distributions, spectral series, and an electron-configuration builder.' },
  { id: 'periodicity', title: 'Periodicity', tag: 'Foundations', group: 'Foundations', blurb: 'Interactive trend curves with the IE/EA anomalies annotated, a Slater\'s-rules Z_eff calculator, and amphoterism.' },
  { id: 'bonding', title: 'Bonding, VSEPR & MO Theory', tag: 'Foundations', group: 'Foundations', blurb: 'Every VSEPR shape with lone-pair sketches, plus MO diagrams that explain why O₂ is magnetic.' },
  { id: 'stoich', title: 'Stoichiometry & Solutions', tag: 'Foundations', group: 'Foundations', blurb: 'Limiting reagents you can see, molarity and dilution tools, and the empirical-formula recipe.' },
  { id: 'thermo1', title: 'Thermodynamics I', tag: 'Physical', group: 'Physical Chemistry', blurb: 'Calorimetry mixing, Hess\'s law cycles, Born–Haber, and estimating ΔH from bond enthalpies.' },
  { id: 'thermo2', title: 'Thermodynamics II', tag: 'Physical', group: 'Physical Chemistry', blurb: 'Entropy as microstate counting, the ΔG = ΔH − TΔS spontaneity map, and the ΔG° ↔ K converter.' },
  { id: 'equilibrium', title: 'Chemical Equilibrium', tag: 'Physical', group: 'Physical Chemistry', blurb: 'A live N₂O₄ ⇌ 2NO₂ system you can shove around, an ICE solver, and the full Ksp toolkit.' },
  { id: 'aek', title: 'Acids, Redox & Kinetics', tag: 'Physical', group: 'Physical Chemistry', blurb: 'Titration curves with a working buret, buffer design, galvanic cells, Latimer diagrams, and rate laws.' },
  { id: 'gases', title: 'Gases, IMFs & Phases', tag: 'Physical', group: 'Physical Chemistry', blurb: 'A kinetic gas box, Maxwell–Boltzmann curves, draggable phase diagrams, Clausius–Clapeyron.' },
  { id: 'nuclear', title: 'Nuclear & Coordination', tag: 'Inorganic', group: 'Inorganic & Organic', blurb: 'Truly random decay against the exponential law, carbon dating, and crystal-field color prediction.' },
  { id: 'organic1', title: 'Organic I — Mechanisms', tag: 'Organic', group: 'Inorganic & Organic', blurb: 'The SN1 / SN2 / E1 / E2 decision engine, the pKa ladder, and carbocation stability.' },
  { id: 'organic2', title: 'Organic II & Symmetry', tag: 'Organic', group: 'Inorganic & Organic', blurb: 'Markovnikov predictions, EAS directing effects, the carbonyl map, Hückel aromaticity, and point groups.' },
  { id: 'polymers', title: 'Polymers', tag: 'Organic', group: 'Inorganic & Organic', blurb: 'Addition vs condensation, monomer↔polymer matching, and Mₙ/Mᵂ/PDI/degree-of-polymerization calculations.' },
  { id: 'labdata', title: 'Lab & Data', tag: 'Skills', group: 'Skills', blurb: 'Beer\'s law calibration, sig figs, uncertainty propagation + Q-test, qualitative tests, and titration technique.' },
  { id: 'analytical', title: 'Analytical & Quantitative', tag: 'Advanced · CCO', group: 'Advanced (CCO)', blurb: 'EDTA titration curves, Debye–Hückel activity, gravimetric factors, and separations — the core of CCO PS1.' },
  { id: 'spectroscopy', title: 'Spectroscopy & Synthesis', tag: 'Advanced · CCO', group: 'Advanced (CCO)', blurb: 'IR, ¹H-NMR splitting and mass-spec interpretation, plus named-reaction and pericyclic synthesis (PS2).' },
  { id: 'advinorganic', title: 'Advanced Inorganic', tag: 'Advanced · CCO', group: 'Advanced (CCO)', blurb: 'LFSE and term symbols, unit-cell packing and Bragg\'s law, radius-ratio rules and descriptive chemistry (PS3).' },
  { id: 'biophys', title: 'Physical & Biochemistry', tag: 'Advanced · CCO', group: 'Advanced (CCO)', blurb: 'Michaelis–Menten, Eyring transition-state theory, Boltzmann populations and bioenergetics (PS4).' },
  { id: 'qbank', title: 'Exam Question Bank', tag: 'Practice', group: 'Practice', wide: true, blurb: 'Original exam-format practice: Part I multiple choice, Part II & III written problems, and the four advanced CCO problem sets (PS1–PS4) with full worked solutions.' },
];
