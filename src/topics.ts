// Shared topic metadata — one entry per page/module, used by the homepage
// teaser grid, the full Menu directory, and the breadcrumb/prereq/next-lesson
// chrome on each topic page. `group` must match the `group` field on each
// TabDef. `difficulty` lists every exam level the module is pitched at, in
// increasing order (CCC < USNCO < CCO < IChO). `prereqs` are topic ids.
/**
 * One reading-list entry (ROADMAP D.5). `chapter` names the chapter rather
 * than numbering it: the numbering moves between editions, so "the chapter on
 * the Second Law" stays true where "ch. 3" quietly stops being.
 */
export interface Ref { text: string; chapter?: string; href?: string }

export interface TopicMeta {
  id: string; title: string; blurb: string; tag: string; group: string; wide?: boolean;
  slug: string; aliases?: readonly string[];
  icon: string; estMinutes: number; difficulty: string[]; prereqs: string[];
  /**
   * The opening paragraph of the topic page — what the module is for and what
   * the student should be able to do at the end of it. Required, not optional:
   * the page contract (D.4) is enforced by this type, and an optional field is
   * a block a module can silently omit. May contain inline markup.
   */
  intro: string;
  /** 2–4 textbook references. Required for the same reason as `intro`. */
  refs: Ref[];
}

// Books cited more than once. Editions are named where the content differs
// between them; chapters are named, never numbered (see Ref).
const ATKINS = "Atkins & de Paula, Physical Chemistry (11th ed.)";
const ZUMDAHL = 'Zumdahl, Chemistry (10th ed.)';
const CLAYDEN = 'Clayden, Greeves & Warren, Organic Chemistry (2nd ed.)';
const SHRIVER = 'Weller et al., Inorganic Chemistry (Shriver & Atkins, 7th ed.)';
const HARRIS = 'Harris, Quantitative Chemical Analysis (10th ed.)';
const PAVIA = 'Pavia et al., Introduction to Spectroscopy (5th ed.)';

export const TOPICS: TopicMeta[] = [
  { id: 'sandbox', slug: 'particle-sandbox', aliases: ['sandbox'], title: 'Particle Sandbox', tag: 'Playground', group: 'Playground', wide: true, icon: 'flask', estMinutes: 20, difficulty: ['CCC'], prereqs: [],
    blurb: 'Spawn atoms and watch molecules self-assemble by valence rules — then heat the box until they shake apart.',
    intro: 'A box of atoms obeying three rules: they move, they bond when they meet and both have a free valence, and a hot enough collision breaks a bond again. Nothing here is scripted — every H₂O in the census formed because two H atoms happened to find an O with slots free. Play with it until the link between <b>temperature and bond survival</b> is obvious in your hands rather than in a graph: at low T the box fills with molecules, at high T it is a plasma of radicals, and the crossover is where ΔH of the bond and the mean kinetic energy are comparable.',
    refs: [
      { text: ZUMDAHL, chapter: 'Chemical bonding: general concepts — bond energies and the molecular view of matter' },
      { text: ATKINS, chapter: 'Molecules in motion — the kinetic model of gases' },
    ] },

  // ---- Foundations ----
  { id: 'quantum', slug: 'quantum-and-atomic-structure', aliases: ['quantum'], title: 'Quantum & Atomic Structure', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 45, difficulty: ['CCC'], prereqs: [],
    blurb: 'Real hydrogen orbitals, radial distributions, spectral series, and an electron-configuration builder.',
    intro: 'Everything else on this site rests on where the electrons are. This module builds that picture from the hydrogen atom outwards: the four quantum numbers and what each one controls, the radial distribution functions that show why a 3s electron penetrates closer to the nucleus than a 3p, the Balmer and Lyman series as arithmetic on 1/n², and the aufbau/Hund/Pauli rules that turn all of it into an electron configuration. The two things to leave with are that <b>orbitals are probability distributions, not paths</b>, and that penetration and shielding — not n alone — set orbital energies in every atom but hydrogen.',
    refs: [
      { text: ZUMDAHL, chapter: 'Atomic structure and periodicity' },
      { text: ATKINS, chapter: 'Quantum theory, and Atomic structure and spectra' },
      { text: 'Levine, Quantum Chemistry (7th ed.)', chapter: 'The hydrogen atom — for the radial functions plotted here' },
    ] },
  { id: 'periodicity', slug: 'periodicity', aliases: ['periodicity'], title: 'Periodicity', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 35, difficulty: ['CCC'], prereqs: ['quantum'],
    blurb: 'Interactive trend curves with the IE/EA anomalies annotated, a Slater\'s-rules Z_eff calculator, and amphoterism.',
    intro: 'The periodic trends are worth almost nothing as slogans and almost everything as explanations, so this module spends its time on the places the slogan fails: the dip at B and at O in first ionisation energy, chlorine\'s electron affinity beating fluorine\'s, the d-block contraction that makes Zr and Hf nearly the same size. A Slater\'s-rules calculator lets you put a number on Z_eff instead of waving at "more protons", and the amphoterism panel covers the oxide-acidity trend that CCC and USNCO ask about every year. Aim to be able to <b>predict a trend and name the exception in the same sentence</b>.',
    refs: [
      { text: ZUMDAHL, chapter: 'Atomic structure and periodicity — periodic trends and the representative elements' },
      { text: SHRIVER, chapter: 'Atomic structure — Slater\'s rules, effective nuclear charge and periodic trends' },
    ] },
  { id: 'bonding', slug: 'bonding-vsepr-and-mo-theory', aliases: ['bonding'], title: 'Bonding, VSEPR & MO Theory', tag: 'Foundations', group: 'Foundations', icon: 'molecule', estMinutes: 45, difficulty: ['CCC', 'USNCO'], prereqs: ['quantum', 'periodicity'],
    blurb: 'Every VSEPR shape with lone-pair sketches, plus MO diagrams that explain why O₂ is magnetic.',
    intro: 'Two models of the same thing, and the exam rewards knowing when each one earns its keep. VSEPR predicts geometry quickly and correctly for main-group molecules — provided you count <i>domains</i> rather than bonds and remember that lone pairs are fatter than bonding pairs. Molecular-orbital theory costs more and pays for it in the cases VSEPR and Lewis structures get wrong: O₂ is paramagnetic, B₂ is paramagnetic, and the s–p mixing that makes N₂ and O₂ order their orbitals differently. Work through the MO builder until <b>bond order and unpaired-electron count</b> come out of a diagram you drew rather than a table you memorised.',
    refs: [
      { text: ZUMDAHL, chapter: 'Bonding: general concepts, and Covalent bonding: orbitals' },
      { text: ATKINS, chapter: 'Molecular structure — valence bond and molecular orbital theory' },
      { text: SHRIVER, chapter: 'Molecular structure and bonding — homonuclear and heteronuclear diatomics' },
    ] },
  { id: 'stoich', slug: 'stoichiometry-and-solutions', aliases: ['stoich'], title: 'Stoichiometry & Solutions', tag: 'Foundations', group: 'Foundations', icon: 'scale', estMinutes: 35, difficulty: ['CCC'], prereqs: [],
    blurb: 'Limiting reagents you can see, molarity and dilution tools, and the empirical-formula recipe.',
    intro: 'The mole is the unit conversion the whole subject is built on, and stoichiometry is where olympiad marks are most often lost to bookkeeping rather than chemistry. This module drills the four moves that matter — mass ↔ moles ↔ particles, limiting reagent, percent yield, and empirical formula from combustion data — with a bar chart that shows you the leftover reagent instead of asking you to trust the arithmetic. The habit to build here: <b>write the balanced equation first, convert to moles second, and never compare masses directly</b>.',
    refs: [
      { text: ZUMDAHL, chapter: 'Stoichiometry, and Types of chemical reactions and solution stoichiometry' },
      { text: HARRIS, chapter: 'Chemical measurements — moles, molarity and dilution' },
    ] },

  // ---- Physical Chemistry ----
  { id: 'thermo1', slug: 'thermodynamics-i', aliases: ['thermo1'], title: 'Thermodynamics I', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 40, difficulty: ['CCC'], prereqs: ['stoich'],
    blurb: 'Calorimetry mixing, Hess\'s law cycles, Born–Haber, and estimating ΔH from bond enthalpies.',
    intro: 'Enthalpy is a state function, and essentially every ΔH problem is that one sentence applied carefully: any route from reactants to products gives the same answer, so pick the route whose numbers you have. This module covers calorimetry (where the sign errors live), Hess\'s law cycles, Born–Haber cycles for ionic lattices, and bond-enthalpy estimates — including <b>why the bond-enthalpy answer is only an estimate</b>: tabulated bond enthalpies are averages over many molecules, and they apply to gas-phase species only.',
    refs: [
      { text: ZUMDAHL, chapter: 'Thermochemistry' },
      { text: ATKINS, chapter: 'The First Law — enthalpy, thermochemistry and Hess\'s law' },
      { text: SHRIVER, chapter: 'The structures of simple solids — lattice enthalpy and the Born–Haber cycle' },
    ] },
  { id: 'thermo2', slug: 'thermodynamics-ii', aliases: ['thermo2'], title: 'Thermodynamics II', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['thermo1'],
    blurb: 'Entropy as microstate counting, the ΔG = ΔH − TΔS spontaneity map, and the ΔG° ↔ K converter.',
    intro: 'Entropy is introduced here as microstate counting (S = k ln W) rather than as "disorder", because the counting version is the one that survives contact with an exam question about a spontaneous process that gets more ordered. From there: the ΔG = ΔH − TΔS map with its four sign quadrants and the crossover temperature, and the ΔG° = −RT ln K bridge that connects this module to every equilibrium problem on the site. The distinction to guard hardest is <b>ΔG° (standard state, fixes K) versus ΔG (current composition, decides direction now)</b> — they are equal only when Q = 1.',
    refs: [
      { text: ZUMDAHL, chapter: 'Spontaneity, entropy and free energy' },
      { text: ATKINS, chapter: 'The Second and Third Laws, and Chemical equilibrium' },
      { text: 'Levine, Physical Chemistry (6th ed.)', chapter: 'The second law of thermodynamics, and Material equilibrium' },
    ] },
  { id: 'gases', slug: 'gases-imfs-and-phases', aliases: ['gases'], title: 'Gases, IMFs & Phases', tag: 'Physical', group: 'Physical Chemistry', icon: 'gas', estMinutes: 45, difficulty: ['USNCO'], prereqs: ['stoich'],
    blurb: 'A kinetic gas box, Maxwell–Boltzmann curves, draggable phase diagrams, Clausius–Clapeyron.',
    intro: 'Gases are the one system where a microscopic model and a macroscopic law can be held in view at once, so this module runs them side by side: a live particle box with its Maxwell–Boltzmann speed distribution, and PV = nRT with the corrections that show where it fails. Watch what raising T does to the <b>shape</b> of the distribution, not just its mean — that same tail is why kinetics and vapour pressure are exponential in T. The rest of the module is intermolecular forces (which gas deviates most, and why), phase diagrams including water\'s negative-slope fusion line, and Clausius–Clapeyron.',
    refs: [
      { text: ZUMDAHL, chapter: 'Gases, and Liquids and solids' },
      { text: ATKINS, chapter: 'The properties of gases, Physical transformations of pure substances, and Molecules in motion' },
    ] },
  { id: 'equilibrium', slug: 'chemical-equilibrium', aliases: ['equilibrium'], title: 'Chemical Equilibrium', tag: 'Physical', group: 'Physical Chemistry', icon: 'equilibrium', estMinutes: 45, difficulty: ['CCC', 'USNCO'], prereqs: ['thermo2'],
    blurb: 'A live N₂O₄ ⇌ 2NO₂ system you can shove around, an ICE solver, and the full Ksp toolkit.',
    intro: 'Le Chatelier\'s principle is easy to recite and easy to misapply, so the simulation here lets you shove a real N₂O₄ ⇌ 2NO₂ system and watch it re-equilibrate: add product, compress the box, change T, and see which of those moves K itself and which only moves Q. <b>Only temperature changes K.</b> Alongside that sit the ICE-table machinery, the small-x approximation with an explicit test for when it is allowed, and solubility — Ksp, the common-ion effect, and selective precipitation.',
    refs: [
      { text: ZUMDAHL, chapter: 'Chemical equilibrium, and Solubility and complex ion equilibria' },
      { text: ATKINS, chapter: 'Chemical equilibrium — the response of equilibria to the conditions' },
      { text: HARRIS, chapter: 'Chemical equilibrium — Ksp, the common ion effect and systematic treatment' },
    ] },
  { id: 'aek', slug: 'acids-redox-and-kinetics', aliases: ['aek'], title: 'Acids, Redox & Kinetics', tag: 'Physical', group: 'Physical Chemistry', icon: 'bolt', estMinutes: 55, difficulty: ['USNCO'], prereqs: ['equilibrium'],
    blurb: 'Titration curves with a working buret, buffer design, galvanic cells, Latimer diagrams, and rate laws.',
    intro: 'The three highest-yield quantitative areas on any olympiad paper, in one module because they share a skeleton: an equilibrium constant, a logarithmic scale, and a curve whose shape encodes the chemistry. Titrate with a working buret and read the four landmark points (initial, half-equivalence where pH = pKa, equivalence — which is <b>not</b> pH 7 for a weak acid — and excess titrant); design a buffer with Henderson–Hasselbalch and then test its capacity; build a galvanic cell and get the sign of E°cell and the direction of electron flow right; then extract a rate law from data and see how a mechanism\'s rate-determining step produces it.',
    refs: [
      { text: ZUMDAHL, chapter: 'Acids and bases, Applications of aqueous equilibria, Electrochemistry, and Chemical kinetics' },
      { text: ATKINS, chapter: 'Chemical kinetics, and the electrochemistry sections of Chemical equilibrium' },
      { text: HARRIS, chapter: 'Acid–base titrations, and Buffers' },
    ] },
  { id: 'physchem', slug: 'advanced-physical-chemistry', aliases: ['physchem'], title: 'Advanced Physical Chemistry', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 50, difficulty: ['USNCO', 'CCO'], prereqs: ['equilibrium', 'thermo2'],
    blurb: 'van\'t Hoff and Clausius–Clapeyron, concentration cells, real gases (van der Waals / Z), heat capacities + Kirchhoff, catalysis, and coupled equilibria.',
    intro: 'CCO-level physical chemistry: the same laws as Thermo I/II and Equilibrium, but with the temperature dependence put back in and the ideal approximations taken out. van\'t Hoff for K(T) and Clausius–Clapeyron for p(T) are the same linear-plot trick applied twice; Kirchhoff\'s law does it for ΔH when ΔCp ≠ 0. Then real gases through van der Waals and the compression factor Z, concentration cells (E° = 0, and the cell still runs), catalysis as a lowered Ea with the equilibrium untouched, and coupled equilibria where the answer needs two constants multiplied. Most marks here are lost to <b>a linearisation plotted against the wrong variable</b> — check the axes before the algebra.',
    refs: [
      { text: ATKINS, chapter: 'The properties of gases (real gases), Chemical equilibrium (van\'t Hoff), and Chemical kinetics' },
      { text: 'Levine, Physical Chemistry (6th ed.)', chapter: 'Reaction equilibrium in ideal gas mixtures, and Real gases' },
      { text: ZUMDAHL, chapter: 'Chemical kinetics — catalysis and reaction mechanisms' },
    ] },
  { id: 'biophys', slug: 'physical-and-biochemistry', aliases: ['biophys'], title: 'Physical & Biochemistry', tag: 'Physical', group: 'Physical Chemistry', icon: 'dna', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['thermo2', 'aek'],
    blurb: 'Michaelis–Menten, Eyring transition-state theory, Boltzmann populations and bioenergetics (CCO PS4).',
    intro: 'Where physical chemistry meets biology, which is the flavour of CCO problem set 4 and of a good deal of IChO. Michaelis–Menten comes out of the steady-state approximation rather than being handed to you, so K_M is a ratio of rate constants and only equals a dissociation constant in a limit worth knowing. Eyring theory then re-reads the Arrhenius activation energy as ΔH‡ and ΔS‡ — the entropy of activation is why a bimolecular association can be slow with a small barrier. Finish with Boltzmann population ratios and ATP-coupled bioenergetics, where <b>an unfavourable reaction is driven by coupling, not by being redefined as favourable</b>.',
    refs: [
      { text: ATKINS, chapter: 'Reaction dynamics — transition-state theory, and the enzyme kinetics section of Chemical kinetics' },
      { text: 'Nelson & Cox, Lehninger Principles of Biochemistry (8th ed.)', chapter: 'Enzymes, and Bioenergetics and biochemical reaction types' },
      { text: 'Levine, Physical Chemistry (6th ed.)', chapter: 'Statistical mechanics — the Boltzmann distribution' },
    ] },

  // ---- Organic Chemistry ----
  { id: 'organic1', slug: 'organic-i-mechanisms', aliases: ['organic1'], title: 'Organic I — Mechanisms', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['bonding'],
    blurb: 'The SN1 / SN2 / E1 / E2 decision engine, the pKa ladder, and carbocation stability.',
    intro: 'Organic chemistry becomes predictable once you stop learning reactions and start learning what makes a nucleophile, an electrophile and a leaving group. This module builds that: the pKa ladder (which tells you what deprotonates what, and therefore which base you are allowed to use), carbocation stability through hyperconjugation and resonance — including the <b>hydride and alkyl shifts</b> that quietly change the product — and the four-way SN1/SN2/E1/E2 decision, driven here by an engine you can interrogate substrate by substrate. Stereochemistry is part of the answer, not a footnote: SN2 inverts, SN1 racemises with a bias, E2 needs anti-periplanar geometry.',
    refs: [
      { text: CLAYDEN, chapter: 'Acidity, basicity and pKa; Nucleophilic substitution at saturated carbon; Elimination reactions' },
      { text: ZUMDAHL, chapter: 'Organic and biological molecules' },
    ] },
  { id: 'organic2', slug: 'organic-ii-and-symmetry', aliases: ['organic2'], title: 'Organic II & Symmetry', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 45, difficulty: ['USNCO', 'CCO'], prereqs: ['organic1'],
    blurb: 'Markovnikov predictions, EAS directing effects, the carbonyl map, Hückel aromaticity, and point groups.',
    intro: 'The reaction families that carry most of an olympiad organic paper. Electrophilic addition to alkenes with the Markovnikov outcome derived from carbocation stability rather than memorised (and the anti-Markovnikov exceptions — HBr/peroxides, hydroboration — explained by what the mechanism actually does). Electrophilic aromatic substitution with the ortho/para versus meta directing logic, including the halogens\' split personality: deactivating by induction, ortho/para-directing by resonance. Then the carbonyl as one continuous map of nucleophilic addition and substitution, Hückel\'s 4n+2 rule applied to the traps (cyclopentadienyl anion, tropylium cation), and enough molecular symmetry to assign a point group.',
    refs: [
      { text: CLAYDEN, chapter: 'Electrophilic addition to alkenes; Electrophilic aromatic substitution; Nucleophilic addition to the carbonyl group' },
      { text: ATKINS, chapter: 'Molecular symmetry — point groups and character tables' },
    ] },
  { id: 'organic3', slug: 'organic-iii-synthesis', aliases: ['organic3'], title: 'Organic III — Synthesis', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 50, difficulty: ['USNCO', 'CCO'], prereqs: ['organic2'],
    blurb: 'Retrosynthesis and multi-step planning, protecting groups, radical mechanisms + selectivity, rearrangements, and intro pericyclic reactions.',
    intro: 'Synthesis is the part of organic chemistry that is planned backwards. This module works in disconnections: look at the target, find the bond a known reaction can make, and write the synthons and their real reagent equivalents. Around that sit the tools a multi-step route needs — protecting groups (and the discipline of removing them), umpolung, radical chain mechanisms with their selectivity rules, carbocation and pinacol-type rearrangements, and an introduction to pericyclic reactions. The recurring exam trap is <b>a reagent that does not survive an earlier step</b>: check functional-group compatibility at every stage of a route, not only at the end.',
    refs: [
      { text: CLAYDEN, chapter: 'Retrosynthetic analysis; Radical reactions; Pericyclic reactions' },
      { text: 'Warren & Wyatt, Organic Synthesis: The Disconnection Approach (2nd ed.)', chapter: 'The whole book is this module\'s method' },
    ] },
  { id: 'polymers', slug: 'polymers', aliases: ['polymers'], title: 'Polymers', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 30, difficulty: ['USNCO'], prereqs: ['organic1'],
    blurb: 'Addition vs condensation, monomer↔polymer matching, and Mₙ/Mᵂ/PDI/degree-of-polymerization calculations.',
    intro: 'A polymer question is usually two questions: what mechanism made this chain, and what does its length distribution imply. Chain-growth (addition) polymerisation opens a C=C, loses nothing, and reaches high molar mass early; step-growth (condensation) couples any two ends, expels a small molecule, and needs conversion above 99% for a chain of even a hundred units — the Carothers equation, DP = 1/(1−p), is the whole story. On the measurement side, M̄w ≥ M̄n always, PDI = M̄w/M̄n is never below 1, and <b>a PDI of exactly 1 means every chain is identical</b>, which statistics never achieves and a ribosome does.',
    refs: [
      { text: CLAYDEN, chapter: 'Polymerization' },
      { text: ZUMDAHL, chapter: 'Organic and biological molecules — polymers' },
      { text: 'Cowie & Arrighi, Polymers: Chemistry and Physics of Modern Materials (3rd ed.)', chapter: 'Molar masses and their distribution; Step-growth and chain-growth polymerization' },
    ] },

  // ---- Inorganic Chemistry ----
  { id: 'nuclear', slug: 'nuclear-and-coordination', aliases: ['nuclear'], title: 'Nuclear & Coordination', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'atom', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['quantum'],
    blurb: 'Truly random decay against the exponential law, carbon dating, and crystal-field color prediction.',
    intro: 'Radioactive decay is the cleanest first-order process in chemistry, and the simulation here decays each nucleus by an independent random draw — so the exponential law emerges from the statistics instead of being assumed. Watch a small sample and the curve is visibly noisy; that is the physical meaning of a half-life being a statistical statement about a population, not a promise about one nucleus. The module covers decay modes and the band of stability, activity and dating calculations, binding energy per nucleon, and then crystal-field splitting: why octahedral complexes are coloured, and how Δ_o and ligand-field strength predict which colour.',
    refs: [
      { text: ZUMDAHL, chapter: 'The nucleus: a chemist\'s view, and Transition metals and coordination chemistry' },
      { text: SHRIVER, chapter: 'd-Metal complexes: electronic structure and properties — crystal and ligand field theory' },
    ] },
  { id: 'coordchem', slug: 'coordination-and-organometallic', aliases: ['coordchem'], title: 'Coordination & Organometallic', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'crystal', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['nuclear', 'bonding'],
    blurb: 'HSAB, the Jahn–Teller effect, ligand substitution + the trans effect, the chelate/macrocyclic effect, isomerism, and 18-electron counting.',
    intro: 'Coordination chemistry at CCO and IChO level is mostly about predicting which of several plausible complexes actually forms, and why. The tools: HSAB for pairing metals with donor atoms, the chelate and macrocyclic effects (which are largely <b>entropy</b>, and stating that is usually the mark), Jahn–Teller distortion for the d⁴ and d⁹ ions that will not stay octahedral, substitution mechanisms with the trans effect deciding which ligand leaves in a square-planar Pt complex, and the isomer count for a given formula. Organometallics adds the 18-electron rule — a strong guide for mid-transition-metal carbonyls, and one whose exceptions (early metals, d⁸ square planar) are worth knowing by name.',
    refs: [
      { text: SHRIVER, chapter: 'An introduction to coordination compounds; Coordination chemistry: reactions of complexes; d-Metal organometallic chemistry' },
      { text: 'Miessler, Fischer & Tarr, Inorganic Chemistry (5th ed.)', chapter: 'Coordination chemistry: reactions and mechanisms; Organometallic chemistry' },
    ] },
  { id: 'advinorganic', slug: 'advanced-inorganic', aliases: ['advinorganic'], title: 'Advanced Inorganic', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'crystal', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['bonding', 'nuclear'],
    blurb: 'LFSE and term symbols, unit-cell packing and Bragg\'s law, radius-ratio rules and descriptive chemistry (CCO PS3).',
    intro: 'Solid-state and electronic-structure inorganic chemistry, the material of CCO problem set 3. Unit cells first — counting atoms per cell, packing efficiency, tetrahedral and octahedral hole occupancy, and the radius-ratio rule with an honest note about how often it fails — then Bragg\'s law as the experiment that measures all of it. On the electronic side, ligand-field stabilisation energy for high- and low-spin configurations, and term symbols, where the arithmetic is unforgiving but mechanical. Descriptive chemistry sits alongside because a CCO paper will happily ask you to <b>predict a product rather than compute one</b>.',
    refs: [
      { text: SHRIVER, chapter: 'The structures of simple solids; d-Metal complexes: electronic structure and properties' },
      { text: ATKINS, chapter: 'Solids — crystal lattices, X-ray diffraction and Bragg\'s law' },
      { text: 'Greenwood & Earnshaw, Chemistry of the Elements (2nd ed.)', chapter: 'The reference for descriptive main-group chemistry' },
    ] },

  // ---- Laboratory Skills ----
  { id: 'labdata', slug: 'lab-and-data', aliases: ['labdata'], title: 'Lab & Data', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 40, difficulty: ['CCC', 'USNCO'], prereqs: ['stoich'],
    blurb: 'Beer\'s law calibration, sig figs, uncertainty propagation + Q-test, qualitative tests, and titration technique.',
    intro: 'Every experimental mark on a paper comes down to the same question: how well do you know the number you just wrote down? This module covers the Beer–Lambert calibration curve and where linearity fails, significant figures done by rule rather than by feel, uncertainty propagation (add absolute uncertainties for sums, relative for products), and Dixon\'s Q-test for the outlier you would like to discard. Plus the technique details examiners actually award: rinsing the buret with titrant but the flask with water only, and why <b>a systematic error moves the mean while a random one only widens the spread</b>.',
    refs: [
      { text: HARRIS, chapter: 'Experimental error; Statistics; Spectrophotometry' },
      { text: ZUMDAHL, chapter: 'Chemical foundations — measurement and significant figures' },
    ] },
  { id: 'labtech', slug: 'laboratory-techniques', aliases: ['labtech'], title: 'Laboratory Techniques', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 45, difficulty: ['CCC', 'USNCO'], prereqs: ['labdata'],
    blurb: 'Recrystallization, the distillation family, filtration, liquid–liquid extraction, drying agents, standard-solution & buffer prep, uncertainty, and safety.',
    intro: 'The bench techniques, and the reasoning behind choosing one over another. Recrystallisation works only with a solvent whose solubility curve is steep, and the classic exam question is why the crop was lost (too much solvent, cooled too fast, washed with warm solvent). Distillation splits into simple, fractional, vacuum and steam according to boiling-point gap and thermal stability. Extraction is repeated small portions beating one large one — that result is worth deriving once. Add drying agents, standard-solution and buffer preparation, and the safety reasoning (<b>acid into water, never the reverse</b>) that a lab-scenario question expects you to state.',
    refs: [
      { text: 'Pavia et al., A Small Scale Approach to Organic Laboratory Techniques (4th ed.)', chapter: 'Crystallization; Distillation; Extraction; Drying agents' },
      { text: HARRIS, chapter: 'Sample preparation, and the gravimetric/volumetric technique chapters' },
    ] },
  { id: 'analytical', slug: 'analytical-and-quantitative', aliases: ['analytical'], title: 'Analytical & Quantitative', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 40, difficulty: ['CCO'], prereqs: ['equilibrium', 'labdata'],
    blurb: 'EDTA titration curves, Debye–Hückel activity, gravimetric factors, and separations — the core of CCO PS1.',
    intro: 'Quantitative analysis as CCO problem set 1 poses it, where the equilibrium constants you learned earlier stop being ideal. EDTA binds every metal 1:1, but only the fully deprotonated Y⁴⁻ form binds, so the useful constant is the conditional one, K′ = α₄K_f — which is why the pH of the buffer decides whether the titration works at all. Debye–Hückel then replaces concentration with activity, and the correction is large enough at ordinary ionic strengths to change an answer. Finish with gravimetric factors and separation methods. The habit worth building: <b>ask what the ionic strength and the pH are doing to your constant before you use it</b>.',
    refs: [
      { text: HARRIS, chapter: 'EDTA titrations; Activity and the systematic treatment of equilibrium; Gravimetric analysis' },
      { text: 'Skoog, West, Holler & Crouch, Fundamentals of Analytical Chemistry (9th ed.)', chapter: 'Complexation titrations; Gravimetric methods' },
    ] },

  // ---- Spectroscopy ----
  { id: 'spectroscopy', slug: 'spectroscopy-and-synthesis', aliases: ['spectroscopy'], title: 'Spectroscopy & Synthesis', tag: 'Spectroscopy', group: 'Spectroscopy', icon: 'molecule', estMinutes: 50, difficulty: ['CCO', 'IChO'], prereqs: ['bonding', 'organic1'],
    blurb: 'IR, ¹H-NMR splitting and mass-spec interpretation, plus named-reaction and pericyclic synthesis (CCO PS2).',
    intro: 'Three instruments, three different questions. IR answers "which functional groups?" — and the carbonyl region is worth reading finely, since conjugation lowers the C=O stretch and ring strain raises it. ¹H-NMR answers "what is next to what?": chemical shift for environment, integration for how many, and the n+1 rule for neighbours, with the coupling constant J telling you cis from trans. Mass spectrometry answers "how heavy, and what falls off?", including the isotope patterns that give away Cl and Br at a glance. The interpretation order that saves time: <b>degrees of unsaturation first, then IR for groups, then NMR for connectivity</b>.',
    refs: [
      { text: PAVIA, chapter: 'Infrared spectroscopy; Nuclear magnetic resonance (parts one and two); Mass spectrometry' },
      { text: CLAYDEN, chapter: 'Determining organic structures; Proton NMR; Review of spectroscopic methods' },
    ] },
  { id: 'structure', slug: 'structure-determination', aliases: ['structure'], title: 'Structure Determination', tag: 'Spectroscopy', group: 'Spectroscopy', icon: 'molecule', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['spectroscopy'],
    blurb: 'Degrees of unsaturation, mass-spec isotope/fragment reading, an IR checklist, and combined IR+NMR+MS unknown-compound identification.',
    intro: 'The unknown-compound problem, which is the highest-value single question type in olympiad organic chemistry — and which is a procedure, not an inspiration. Start from the molecular formula and compute degrees of unsaturation; read the M and M+2 peaks for halogens and the nitrogen rule for N; take the functional groups from IR; build the skeleton from ¹H-NMR shifts, integrals and splitting; and only then propose a structure and <b>check it back against every piece of data, including the ones you did not use</b>. This module runs that loop on worked unknowns until the order becomes automatic.',
    refs: [
      { text: PAVIA, chapter: 'Combined structure problems, and the index of hydrogen deficiency' },
      { text: CLAYDEN, chapter: 'Determining organic structures; Review of spectroscopic methods' },
    ] },

  // ---- Practice ----
  { id: 'qbank', slug: 'exam-question-bank', aliases: ['qbank'], title: 'Exam Question Bank', tag: 'Practice', group: 'Practice', wide: true, icon: 'book', estMinutes: 90, difficulty: ['CCC', 'USNCO', 'CCO'], prereqs: [],
    blurb: 'Original exam-format practice: Part I multiple choice, Part II & III written problems, and the four advanced CCO problem sets (PS1–PS4) with full worked solutions.',
    intro: 'Practice under exam conditions, in exam format. Part I is multiple choice by topic; Part II is free response with per-part worked solutions; Part III is lab scenarios; the CCO sets PS1–PS4 mirror the advanced problem sets; Integrated Challenges deliberately cross two areas at once; and the Olympiad Questions section holds five full-length original mock papers. <b>Every question here is original</b> — written to match the format and difficulty of real CCC/CCO/USNCO items, never copied from them. The real past papers are linked, as PDFs on the hosting bodies\' own sites, and never reproduced.',
    refs: [
      // No href on the USNCO line: acs.org answers 403 to every automated
      // request, so the URL could not be checked, and a reference that 404s is
      // worse than one the reader searches for. The two archives that WERE
      // verified are linked from `references()` on every module page.
      { text: 'American Chemical Society — the U.S. National Chemistry Olympiad exams and study materials', chapter: 'Search "ACS Chemistry Olympiad"' },
      { text: 'Chemical Institute of Canada — official CCC and CCO past papers', href: 'https://www.cheminst.ca/discover/canadian-chemistry-contest/', chapter: 'Also linked paper by paper under "Olympiad Questions"' },
    ] },
];

/**
 * An ordered run of existing modules, for the homepage's learning-path cards.
 *
 * Data, not code: a path is only a list of topic ids, and everything shown on
 * its card — titles, minutes, difficulty badges — is looked up from TOPICS at
 * render time. Nothing here duplicates module metadata, so a path can never
 * quietly disagree with the module it points at.
 *
 * ORDERING IS A CURRICULUM DECISION AND HAS NOT BEEN CONTENT-REVIEWED. The
 * order below is TOPICS order filtered by `difficulty`, with `prereqs`
 * respected — a defensible first cut, not a taught sequence. Review before
 * launch (ROADMAP D.12).
 */
export interface LearningPath {
  id: string; title: string; blurb: string; topicIds: readonly string[];
}

export const PATHS: readonly LearningPath[] = [
  {
    id: 'ccc-foundation',
    title: 'CCC foundation',
    blurb: 'The core sequence, in prerequisite order: structure and bonding first, then the mole, then energy and equilibrium, finishing in the lab.',
    topicIds: ['quantum', 'periodicity', 'bonding', 'stoich', 'thermo1', 'equilibrium', 'labdata'],
  },
  {
    id: 'organic-run',
    title: 'Organic, end to end',
    blurb: 'Mechanisms before synthesis, and structure determination last — you can only confirm a product once you know what it should be.',
    topicIds: ['organic1', 'organic2', 'organic3', 'polymers', 'spectroscopy', 'structure'],
  },
  {
    id: 'cco-advanced',
    title: 'CCO / IChO advanced',
    blurb: 'The olympiad-level material, assuming the foundation run: rigorous thermodynamics and kinetics, coordination chemistry, and quantitative lab work.',
    topicIds: ['thermo2', 'physchem', 'biophys', 'coordchem', 'advinorganic', 'analytical'],
  },
];

export const topicById = (id: string): TopicMeta | undefined => TOPICS.find(t => t.id === id);

/** Modules of a path, in path order, skipping any id that no longer exists. */
export const pathTopics = (p: LearningPath): TopicMeta[] =>
  p.topicIds.map(topicById).filter((t): t is TopicMeta => t !== undefined);

const topicsBySlug = new Map<string, TopicMeta>();
for (const topic of TOPICS) {
  topicsBySlug.set(topic.slug, topic);
  for (const alias of topic.aliases ?? []) topicsBySlug.set(alias, topic);
}

export const topicBySlug = (slug: string): TopicMeta | undefined => topicsBySlug.get(slug);

// ---- shared card renderer (homepage teaser grid + menu directory) ----
import { h } from './tabs/framework';
import { topicIconSVG, CLOCK_ICON } from './icons';
import { ID_PREFIX } from './content/topicIds';
import { MODULE_QUIZ_SIZE } from './content/counts';
import { solvedWithPrefix, onProgressChange } from './progress';

export function difficultyBadges(diff: string[]): HTMLElement[] {
  return diff.map(d => h('span', { class: `badge badge-${d.toLowerCase()}` }, d));
}

/**
 * How much of a module's quiz bank is solved — the ONE definition.
 *
 * Four things ask this question (the card strips and sidebar meters, the menu's
 * progress filter, the next-lesson rules, and the learning-path bars) and they
 * were on their way to four slightly different answers. It lives here because
 * this file already holds the three tables it needs.
 *
 * Returns null for anything that has no bank to measure — the sandbox and the
 * question bank. That is deliberately not `{done: 0, total: 0}`: "no progress"
 * and "not a lesson" are different facts, and callers that conflate them end up
 * hiding the sandbox behind a progress filter that never applied to it.
 *
 * Counted by ID NAMESPACE rather than by enumerating the bank's questions,
 * because every one of those callers renders on the entry path and the corpus
 * must stay out of it (D.10).
 */
export function moduleProgress(id: string): { done: number; total: number } | null {
  const prefix = ID_PREFIX[id as keyof typeof ID_PREFIX];
  const total = MODULE_QUIZ_SIZE[id];
  if (!prefix || !total) return null;
  return { done: Math.min(solvedWithPrefix(prefix), total), total };
}

/** Fraction of a module's bank solved, 0–1. Modules with no bank give 0. */
export function moduleCompletion(id: string): number {
  const p = moduleProgress(id);
  return p ? p.done / p.total : 0;
}

/**
 * The card's progress strip (ROADMAP E.3) — how much of this module's quiz is
 * solved, and a "Complete" mark once all of it is.
 *
 * Counted by ID NAMESPACE rather than by enumerating the bank's questions:
 * these cards render on the homepage and the menu, which are barred from
 * importing the corpus (D.10). `solvedWithPrefix` + `MODULE_QUIZ_SIZE` answer
 * it from two small tables instead of 1.16 MB of questions.
 *
 * A module with nothing solved shows NOTHING, not an empty bar — a first
 * visitor would otherwise meet a wall of twenty-five zeroes, which reads as a
 * debt rather than an invitation. The strip appears when there is progress to
 * report, and updates in place because the cards are built before
 * `initProgress()` has finished loading.
 */
function progressStrip(id: string): HTMLElement | null {
  const total = moduleProgress(id)?.total;
  if (!total) return null;   // sandbox and qbank have no quiz bank

  const strip = h('div', { class: 'topic-progress', hidden: 'true' });
  const paint = (): void => {
    const done = moduleProgress(id)!.done;
    strip.hidden = done === 0;
    if (done === 0) return;
    strip.replaceChildren(
      h('div', { class: 'pbar', role: 'img', 'aria-label': `${done} of ${total} questions solved` },
        h('div', { class: 'pbar-fill', style: `width:${Math.max(Math.round((done / total) * 100), 2)}%` })),
      done === total
        ? h('span', { class: 'topic-progress-done' }, 'Complete')
        : h('span', { class: 'topic-progress-count' }, `${done}/${total}`),
    );
  };
  paint();
  onProgressChange(paint);
  return strip;
}

export function renderTopicCard(
  t: TopicMeta, onOpen: (id: string) => void, extraClass = '', style = '', showPrereqs = false,
): HTMLElement {
  const prereqTitles = t.prereqs.map(id => topicById(id)?.title).filter(Boolean);
  // The whole card stays clickable for the mouse, but the card itself can't be
  // the control: an <article onclick> is invisible to the keyboard and to AT,
  // and it can't legally become a <button> either (its <h3> and <p> aren't
  // allowed inside one). So "Open module" — which was a decorative <span> —
  // becomes the real button, named with the module it opens rather than 25
  // identical "Open module" labels. The card lifts on :focus-within so the
  // keyboard gets the same affordance the mouse does.
  return h('article', { class: `topic-card${t.wide ? ' span2' : ''}${extraClass}`, style, onclick: () => onOpen(t.id) },
    h('div', { class: 'topic-card-top' },
      h('span', { class: 'topic-icon', html: topicIconSVG(t.icon) }),
      h('div', { class: 'topic-tag' }, t.tag),
    ),
    h('h3', {}, t.title),
    h('p', {}, t.blurb),
    h('div', { class: 'topic-meta' },
      h('span', { class: 'meta-time', html: CLOCK_ICON }, ` ${t.estMinutes} min`),
      ...difficultyBadges(t.difficulty),
    ),
    progressStrip(t.id),
    showPrereqs && prereqTitles.length
      ? h('p', { class: 'topic-prereq-line' }, `Prerequisite${prereqTitles.length > 1 ? 's' : ''}: ${prereqTitles.join(', ')}`)
      : null,
    h('button', {
      type: 'button', class: 'topic-open', 'aria-label': `Open module: ${t.title}`,
      onclick: (e: Event) => { e.stopPropagation(); onOpen(t.id); },
    }, 'Open module →'),
  );
}
