// Shared topic metadata — one entry per page/module, used by the homepage
// teaser grid, the full Menu directory, and the breadcrumb/prereq/next-lesson
// chrome on each topic page. `group` must match the `group` field on each
// TabDef. `difficulty` lists every exam level the module is pitched at, in
// increasing order (HS < CCC < USNCO < CCO < IChO). `prereqs` are topic ids.
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
   * Which half of a split module this page is (plan3 Phase 6).
   *
   * Nine high-school modules are ONE module presented on TWO pages: the course
   * page (Basics + Core, grade 11–12, badge HS) and the contest page (the
   * contest reference, the advanced simulations, the challenge ladder). Every
   * other module is a single `'course'` page and nothing about it changes.
   *
   * The content model does NOT learn about the split — questions, skills, the
   * attempt log and `byModule` all stay keyed on the module. This field only
   * decides which blocks a page SHOWS.
   */
  layer: 'course' | 'contest';
  /**
   * On a contest page, the module id it is the contest half of — the id the
   * challenge ladder, the quiz bank and the references are looked up under.
   * Typed as a plain string rather than `ModuleId`: the contest PAGE owns no
   * questions, so it must not enter the id vocabulary (topicIds.ts).
   */
  parent?: string;
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

// The reading list of each SPLIT module (plan3 Phase 6). Named because both of
// that module's pages carry it — the contest page is a second view of the same
// module, so it reads from the same books. One array, referenced twice, rather
// than two copies that drift.
const QUANTUM_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Atomic structure and periodicity' },
  { text: ATKINS, chapter: 'Quantum theory, and Atomic structure and spectra' },
  { text: 'Levine, Quantum Chemistry (7th ed.)', chapter: 'The hydrogen atom — for the radial functions plotted here' },
];
const PERIODICITY_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Atomic structure and periodicity — periodic trends and the representative elements' },
  { text: SHRIVER, chapter: 'Atomic structure — Slater\'s rules, effective nuclear charge and periodic trends' },
];
const BONDING_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Bonding: general concepts, and Covalent bonding: orbitals' },
  { text: ATKINS, chapter: 'Molecular structure — valence bond and molecular orbital theory' },
  { text: SHRIVER, chapter: 'Molecular structure and bonding — homonuclear and heteronuclear diatomics' },
];
const STOICH_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Stoichiometry, and Types of chemical reactions and solution stoichiometry' },
  { text: HARRIS, chapter: 'Chemical measurements — moles, molarity and dilution' },
];
const THERMO1_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Thermochemistry' },
  { text: ATKINS, chapter: 'The First Law — enthalpy, thermochemistry and Hess\'s law' },
  { text: SHRIVER, chapter: 'The structures of simple solids — lattice enthalpy and the Born–Haber cycle' },
];
const EQUILIBRIUM_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Chemical equilibrium, and Solubility and complex ion equilibria' },
  { text: ATKINS, chapter: 'Chemical equilibrium — the response of equilibria to the conditions' },
  { text: HARRIS, chapter: 'Chemical equilibrium — Ksp, the common ion effect and systematic treatment' },
];
const AEK_REFS: Ref[] = [
  { text: ZUMDAHL, chapter: 'Acids and bases, Applications of aqueous equilibria, Electrochemistry, and Chemical kinetics' },
  { text: ATKINS, chapter: 'Chemical kinetics, and the electrochemistry sections of Chemical equilibrium' },
  { text: HARRIS, chapter: 'Acid–base titrations, and Buffers' },
];
const LABDATA_REFS: Ref[] = [
  { text: HARRIS, chapter: 'Experimental error; Statistics; Spectrophotometry' },
  { text: ZUMDAHL, chapter: 'Chemical foundations — measurement and significant figures' },
];
const LABTECH_REFS: Ref[] = [
  { text: 'Pavia et al., A Small Scale Approach to Organic Laboratory Techniques (4th ed.)', chapter: 'Crystallization; Distillation; Extraction; Drying agents' },
  { text: HARRIS, chapter: 'Sample preparation, and the gravimetric/volumetric technique chapters' },
];

export const TOPICS: TopicMeta[] = [
  { id: 'sandbox', slug: 'particle-sandbox', aliases: ['sandbox'], title: 'Particle Sandbox', tag: 'Playground', group: 'Playground', wide: true, icon: 'flask', estMinutes: 20, difficulty: ['CCC'], prereqs: [], layer: 'course',
    blurb: 'Spawn atoms and watch molecules self-assemble by valence rules — then heat the box until they shake apart.',
    intro: 'A box of atoms that move, stick together when they collide, and break apart when a collision is hard enough. By the end you can predict whether a given temperature leaves molecules intact or tears them into single atoms. Nothing here is scripted — every water molecule in the census formed on its own. <b>Heat is what breaks bonds.</b>',
    refs: [
      { text: ZUMDAHL, chapter: 'Chemical bonding: general concepts — bond energies and the molecular view of matter' },
      { text: ATKINS, chapter: 'Molecules in motion — the kinetic model of gases' },
    ] },

  // ---- Foundations ----
  { id: 'quantum', slug: 'quantum-and-atomic-structure', aliases: ['quantum', 'atomic-structure'], title: 'Atoms & Electrons', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 55, difficulty: ['HS'], prereqs: [], layer: 'course',
    blurb: 'Where an atom\'s electrons actually sit, and how to write any element\'s arrangement down.',
    intro: 'Electrons do not circle the nucleus, the dense centre of the atom, like planets. They occupy orbitals — regions of space where an electron is likely to be found. You will write down which orbitals an element\'s electrons fill, and read a line in hydrogen\'s light as an electron dropping to a lower energy level. <b>Orbitals are probabilities, not paths.</b>',
    refs: QUANTUM_REFS },
  { id: 'quantum-contest', slug: 'atoms-and-electrons-contest', aliases: ['quantum-contest'], title: 'Atoms & Electrons — Contest', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 25, difficulty: ['CCC'], prereqs: ['quantum'], layer: 'contest', parent: 'quantum',
    blurb: 'The same atom taken further: quantum numbers, nodes, and how far out the electron really sits.',
    intro: 'Do Atoms & Electrons first. A contest goes further into the same atom: the four quantum numbers that label an electron, the nodes where an orbital\'s wave changes sign, how far out the electron density really peaks, and the shielding that makes one element\'s ionisation energy break the trend.',
    refs: QUANTUM_REFS },
  { id: 'periodicity', slug: 'periodicity', aliases: ['periodicity'], title: 'Periodicity', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 45, difficulty: ['HS'], prereqs: ['quantum'], layer: 'course',
    blurb: 'Why atoms get smaller across a row and bigger down a column — and the places the pattern breaks.',
    intro: 'Atoms get smaller across a row of the periodic table and bigger down a column. The useful part is knowing why, because then you can spot where the pattern breaks. Ionisation energy — the energy needed to pull one electron off an atom — dips at boron and again at oxygen. You will <b>explain a trend, not just state it</b>.',
    refs: PERIODICITY_REFS },
  { id: 'periodicity-contest', slug: 'periodicity-contest', aliases: ['periodicity-contest'], title: 'Periodicity — Contest', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 25, difficulty: ['CCC'], prereqs: ['periodicity'], layer: 'contest', parent: 'periodicity',
    blurb: 'The places the periodic trends break, and the reason each one breaks.',
    intro: 'Do Periodicity first. A contest asks you to explain the places the trends break rather than list them: the dips in ionisation energy, the diagonal likenesses between lithium and magnesium, and the oxides that react with both acid and base.',
    refs: PERIODICITY_REFS },
  { id: 'bonding', slug: 'bonding-vsepr-and-mo-theory', aliases: ['bonding', 'vsepr', 'mo-theory'], title: 'Bonding & Molecular Shape', tag: 'Foundations', group: 'Foundations', icon: 'molecule', estMinutes: 55, difficulty: ['HS'], prereqs: ['quantum', 'periodicity'], layer: 'course',
    blurb: 'How atoms join, and how counting electron groups gives you a molecule\'s shape.',
    intro: 'A molecule\'s shape comes from the groups of electrons around its central atom, which push each other as far apart as they can. A bond is one such group: a pair of electrons shared between two atoms. You will draw a molecule, <b>read its shape off the group count</b>, and use that shape to say which liquid boils higher.',
    refs: BONDING_REFS },
  { id: 'bonding-contest', slug: 'bonding-and-molecular-shape-contest', aliases: ['bonding-contest'], title: 'Bonding & Molecular Shape — Contest', tag: 'Foundations', group: 'Foundations', icon: 'molecule', estMinutes: 25, difficulty: ['CCC', 'USNCO'], prereqs: ['bonding'], layer: 'contest', parent: 'bonding',
    blurb: 'Molecular orbital theory: bond order, and why liquid oxygen sticks to a magnet.',
    intro: 'Do Bonding & Molecular Shape first. A contest adds molecular orbital theory, which spreads electrons over the whole molecule instead of one bond at a time. It gives a bond order, and explains why liquid oxygen is pulled by a magnet.',
    refs: BONDING_REFS },
  { id: 'stoich', slug: 'stoichiometry-and-solutions', aliases: ['stoich', 'stoichiometry'], title: 'Moles & Solutions', tag: 'Foundations', group: 'Foundations', icon: 'scale', estMinutes: 45, difficulty: ['HS'], prereqs: [], layer: 'course',
    blurb: 'Counting atoms by weighing them, and working out how much a reaction can make.',
    intro: 'A mole is a count: 6.022 × 10²³ of something, the way a dozen is 12. Chemists count in moles because atoms are too small to weigh one at a time. You will turn a mass into moles, find which reactant runs out first, and work out how much is dissolved in each litre — always <b>balancing the equation first</b>.',
    refs: STOICH_REFS },
  { id: 'stoich-contest', slug: 'moles-and-solutions-contest', aliases: ['stoich-contest'], title: 'Moles & Solutions — Contest', tag: 'Foundations', group: 'Foundations', icon: 'scale', estMinutes: 25, difficulty: ['CCC'], prereqs: ['stoich'], layer: 'contest', parent: 'stoich',
    blurb: 'Net ionic equations, titration arithmetic, and concentrations in units other than moles per litre.',
    intro: 'Do Moles & Solutions first. A contest works the same arithmetic in less friendly forms: net ionic equations that show only the particles that change, titration calculations, back-titrations, and concentrations given as molality or parts per million rather than moles per litre.',
    refs: STOICH_REFS },

  // ---- Physical Chemistry ----
  { id: 'thermo1', slug: 'thermodynamics-i', aliases: ['thermo1'], title: 'Thermodynamics I', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 50, difficulty: ['HS'], prereqs: ['stoich'], layer: 'course',
    blurb: 'Measuring the heat a reaction gives out, and adding known reactions together to get one you cannot measure.',
    intro: 'Reactions give out heat or take it in. The enthalpy change, written ΔH, is that heat measured at ordinary open-air pressure. It depends only on where the reaction starts and finishes, never on the route between them. You will measure ΔH in an insulated cup, and <b>build a route from reactions you already know</b>.',
    refs: THERMO1_REFS },
  { id: 'thermo1-contest', slug: 'thermodynamics-i-contest', aliases: ['thermo1-contest'], title: 'Thermodynamics I — Contest', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 25, difficulty: ['CCC'], prereqs: ['thermo1'], layer: 'contest', parent: 'thermo1',
    blurb: 'The Born–Haber cycle: getting a lattice energy nobody can measure out of steps that can be.',
    intro: 'Do Thermodynamics I first. A contest adds the Born–Haber cycle, which builds an ionic solid from its elements one step at a time to get the lattice energy — the energy released when gaseous ions come together — a quantity nobody can measure directly.',
    refs: THERMO1_REFS },
  { id: 'thermo2', slug: 'thermodynamics-ii', aliases: ['thermo2'], title: 'Thermodynamics II', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['thermo1'], layer: 'course',
    blurb: 'Entropy as microstate counting, the ΔG = ΔH − TΔS spontaneity map, and the ΔG° ↔ K converter.',
    intro: 'Some reactions happen on their own and some do not, and this module tells them apart. Entropy (S) counts how many ways a system can arrange itself. Free energy combines it with heat as <b>ΔG = ΔH − TΔS</b>. After it you can find the temperature where a reaction switches direction and turn ΔG° into an equilibrium constant.',
    refs: [
      { text: ZUMDAHL, chapter: 'Spontaneity, entropy and free energy' },
      { text: ATKINS, chapter: 'The Second and Third Laws, and Chemical equilibrium' },
      { text: 'Levine, Physical Chemistry (6th ed.)', chapter: 'The second law of thermodynamics, and Material equilibrium' },
    ] },
  { id: 'gases', slug: 'gases-imfs-and-phases', aliases: ['gases', 'imfs', 'phases'], title: 'Gases, Liquids & Solids', tag: 'Physical', group: 'Physical Chemistry', icon: 'gas', estMinutes: 45, difficulty: ['USNCO'], prereqs: ['stoich'], layer: 'course',
    blurb: 'A kinetic gas box, Maxwell–Boltzmann curves, draggable phase diagrams, Clausius–Clapeyron.',
    intro: 'A gas is mostly empty space with particles flying free, and temperature alone sets their average energy of motion. This module links that picture to PV = nRT, and to what changes when particles pack close enough to form a liquid or a solid. You will read a phase diagram and say which real gas <b>strays furthest from ideal</b>.',
    refs: [
      { text: ZUMDAHL, chapter: 'Gases, and Liquids and solids' },
      { text: ATKINS, chapter: 'The properties of gases, Physical transformations of pure substances, and Molecules in motion' },
    ] },
  { id: 'equilibrium', slug: 'chemical-equilibrium', aliases: ['equilibrium'], title: 'Chemical Equilibrium', tag: 'Physical', group: 'Physical Chemistry', icon: 'equilibrium', estMinutes: 55, difficulty: ['HS'], prereqs: ['thermo1'], layer: 'course',
    blurb: 'Reactions that stop part-way — what settles, and what moves it.',
    intro: 'Many reactions stop before they finish. Products turn back into reactants as fast as they form, and the amounts stop changing. Here you push a real mixture of two gases and watch it settle again. You will predict which way it moves, and learn that <b>only a change of temperature changes K</b>, the settled ratio of products to reactants.',
    refs: EQUILIBRIUM_REFS },
  { id: 'equilibrium-contest', slug: 'chemical-equilibrium-contest', aliases: ['equilibrium-contest'], title: 'Chemical Equilibrium — Contest', tag: 'Physical', group: 'Physical Chemistry', icon: 'equilibrium', estMinutes: 25, difficulty: ['CCC', 'USNCO'], prereqs: ['equilibrium'], layer: 'contest', parent: 'equilibrium',
    blurb: 'How much of a solid will dissolve, and what a shared ion does to that amount.',
    intro: 'Do Chemical Equilibrium first. A contest adds solubility: Ksp, the equilibrium constant for a solid dissolving, how much of a salt will dissolve, and how a second source of one of its ions cuts that amount down.',
    refs: EQUILIBRIUM_REFS },
  { id: 'aek', slug: 'acids-redox-and-kinetics', aliases: ['aek', 'redox', 'kinetics'], title: 'Acids, Batteries & Reaction Rates', tag: 'Physical', group: 'Physical Chemistry', icon: 'bolt', estMinutes: 65, difficulty: ['HS'], prereqs: ['equilibrium'], layer: 'course',
    blurb: 'How acidic a solution is, which way electrons flow between two metals, and how fast a reaction goes.',
    intro: 'Three questions with one shape: how acidic is a solution, which way do electrons flow between two metals, and how fast does a reaction go? You get a burette, the tap-and-scale tube that adds liquid drop by drop. You will find the point where an acid is exactly neutralised, and <b>balance every equation before the arithmetic</b>.',
    refs: AEK_REFS },
  { id: 'aek-contest', slug: 'acids-batteries-and-reaction-rates-contest', aliases: ['aek-contest'], title: 'Acids, Batteries & Reaction Rates — Contest', tag: 'Physical', group: 'Physical Chemistry', icon: 'bolt', estMinutes: 25, difficulty: ['USNCO'], prereqs: ['aek'], layer: 'contest', parent: 'aek',
    blurb: 'Buffers, Latimer diagrams, and how much faster a reaction runs when you heat it.',
    intro: 'Do Acids, Batteries & Reaction Rates first. A contest adds buffers, mixtures that hold a steady acidity when acid is added; Latimer diagrams, which line up an element\'s oxidation states by voltage; and the Arrhenius equation for how much faster a reaction runs when it is heated.',
    refs: AEK_REFS },
  { id: 'physchem', slug: 'advanced-physical-chemistry', aliases: ['physchem'], title: 'Advanced Physical Chemistry', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 50, difficulty: ['USNCO', 'CCO'], prereqs: ['equilibrium', 'thermo2'], layer: 'course',
    blurb: 'van\'t Hoff and Clausius–Clapeyron, concentration cells, real gases (van der Waals / Z), heat capacities + Kirchhoff, catalysis, and coupled equilibria.',
    intro: 'The same thermodynamics and equilibrium as before, with the temperature dependence put back in and the ideal approximations taken out. Real gases deviate from PV = nRT, equilibrium constants move with temperature, and enthalpy changes with heat capacity. You will fit a straight line to ln K against 1/T, and <b>check the axes before the algebra</b>.',
    refs: [
      { text: ATKINS, chapter: 'The properties of gases (real gases), Chemical equilibrium (van\'t Hoff), and Chemical kinetics' },
      { text: 'Levine, Physical Chemistry (6th ed.)', chapter: 'Reaction equilibrium in ideal gas mixtures, and Real gases' },
      { text: ZUMDAHL, chapter: 'Chemical kinetics — catalysis and reaction mechanisms' },
    ] },
  { id: 'biophys', slug: 'physical-and-biochemistry', aliases: ['biophys'], title: 'Physical & Biochemistry', tag: 'Physical', group: 'Physical Chemistry', icon: 'dna', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['thermo2', 'aek'], layer: 'course',
    blurb: 'Michaelis–Menten, Eyring transition-state theory, Boltzmann populations and bioenergetics.',
    intro: 'Physical chemistry applied to living systems: enzymes, and the energy budget of a cell. Michaelis–Menten kinetics is derived from the steady-state approximation, so K_M comes as a ratio of rate constants. You will read an enzyme curve, split an activation barrier into heat and entropy terms with Eyring theory, and see how ATP <b>drives an unfavourable reaction by coupling</b>.',
    refs: [
      { text: ATKINS, chapter: 'Reaction dynamics — transition-state theory, and the enzyme kinetics section of Chemical kinetics' },
      { text: 'Nelson & Cox, Lehninger Principles of Biochemistry (8th ed.)', chapter: 'Enzymes, and Bioenergetics and biochemical reaction types' },
      { text: 'Levine, Physical Chemistry (6th ed.)', chapter: 'Statistical mechanics — the Boltzmann distribution' },
    ] },

  // ---- Organic Chemistry ----
  { id: 'organic1', slug: 'organic-i-mechanisms', aliases: ['organic1'], title: 'Organic I — Mechanisms', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['bonding'], layer: 'course',
    blurb: 'The SN1 / SN2 / E1 / E2 decision engine, the pKa ladder, and carbocation stability.',
    intro: 'Organic reactions become predictable once you stop memorising them and start asking three things: what is the nucleophile (the electron donor), what is the electrophile (the electron acceptor), and how good is the leaving group. After this module you can choose between the four substitution and elimination pathways for a given substrate and <b>get the stereochemistry right</b>.',
    refs: [
      { text: CLAYDEN, chapter: 'Acidity, basicity and pKa; Nucleophilic substitution at saturated carbon; Elimination reactions' },
      { text: ZUMDAHL, chapter: 'Organic and biological molecules' },
    ] },
  { id: 'organic2', slug: 'organic-ii-and-symmetry', aliases: ['organic2'], title: 'Organic II & Symmetry', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 45, difficulty: ['USNCO', 'CCO'], prereqs: ['organic1'], layer: 'course',
    blurb: 'Markovnikov predictions, EAS directing effects, the carbonyl map, Hückel aromaticity, and point groups.',
    intro: 'The reaction families that carry most of organic chemistry: alkenes adding an electrophile, benzene rings substituting one, and the carbonyl group C=O reacting with anything nucleophilic. After this module you can predict which product forms and <b>where a substituent directs the next one</b>, apply Hückel\'s 4n+2 rule for aromaticity, and assign a molecule\'s point group.',
    refs: [
      { text: CLAYDEN, chapter: 'Electrophilic addition to alkenes; Electrophilic aromatic substitution; Nucleophilic addition to the carbonyl group' },
      { text: ATKINS, chapter: 'Molecular symmetry — point groups and character tables' },
    ] },
  { id: 'organic3', slug: 'organic-iii-synthesis', aliases: ['organic3'], title: 'Organic III — Synthesis', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 50, difficulty: ['USNCO', 'CCO'], prereqs: ['organic2'], layer: 'course',
    blurb: 'Retrosynthesis and multi-step planning, protecting groups, radical mechanisms + selectivity, rearrangements, and intro pericyclic reactions.',
    intro: 'Synthesis is organic chemistry planned backwards. You look at the target molecule, find a bond a known reaction can make, break it on paper, and repeat until you reach something you can buy. After this module you can plan a multi-step route, protect a group that would otherwise react, and <b>check that every reagent survives the step before it</b>.',
    refs: [
      { text: CLAYDEN, chapter: 'Retrosynthetic analysis; Radical reactions; Pericyclic reactions' },
      { text: 'Warren & Wyatt, Organic Synthesis: The Disconnection Approach (2nd ed.)', chapter: 'The whole book is this module\'s method' },
    ] },
  { id: 'polymers', slug: 'polymers', aliases: ['polymers'], title: 'Polymers', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 30, difficulty: ['USNCO'], prereqs: ['organic1'], layer: 'course',
    blurb: 'Addition vs condensation, monomer↔polymer matching, and Mₙ/Mᵂ/PDI/degree-of-polymerization calculations.',
    intro: 'A polymer is one molecule built from thousands of small ones joined end to end, as in plastic bags and nylon. Two mechanisms make them: addition opens a C=C double bond and loses nothing, while condensation joins two ends and expels a small molecule. You will match monomer to polymer and <b>calculate chain length and its spread</b>.',
    refs: [
      { text: CLAYDEN, chapter: 'Polymerization' },
      { text: ZUMDAHL, chapter: 'Organic and biological molecules — polymers' },
      { text: 'Cowie & Arrighi, Polymers: Chemistry and Physics of Modern Materials (3rd ed.)', chapter: 'Molar masses and their distribution; Step-growth and chain-growth polymerization' },
    ] },

  // ---- Inorganic Chemistry ----
  { id: 'nuclear', slug: 'nuclear-and-coordination', aliases: ['nuclear'], title: 'Nuclear & Coordination', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'atom', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['quantum'], layer: 'course',
    blurb: 'Truly random decay against the exponential law, carbon dating, and crystal-field color prediction.',
    intro: 'Radioactive decay and the colours of metal complexes. An unstable nucleus decays at random, yet a whole sample follows an exponential curve — that is all a <b>half-life</b> is. A metal ion with molecules bonded around it splits its d orbitals, and the size of the split sets the colour. You will date a sample and predict a colour.',
    refs: [
      { text: ZUMDAHL, chapter: 'The nucleus: a chemist\'s view, and Transition metals and coordination chemistry' },
      { text: SHRIVER, chapter: 'd-Metal complexes: electronic structure and properties — crystal and ligand field theory' },
    ] },
  { id: 'coordchem', slug: 'coordination-and-organometallic', aliases: ['coordchem'], title: 'Coordination & Organometallic', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'crystal', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['nuclear', 'bonding'], layer: 'course',
    blurb: 'HSAB, the Jahn–Teller effect, ligand substitution + the trans effect, the chelate/macrocyclic effect, isomerism, and 18-electron counting.',
    intro: 'A complex is a metal ion with molecules or ions (ligands) bonded around it. This module is about predicting which of several possible complexes actually forms, and why. You will pair metals with donor atoms by hardness, explain the chelate effect as <b>entropy</b>, spot the d⁴ and d⁹ ions that distort, and count to eighteen electrons.',
    refs: [
      { text: SHRIVER, chapter: 'An introduction to coordination compounds; Coordination chemistry: reactions of complexes; d-Metal organometallic chemistry' },
      { text: 'Miessler, Fischer & Tarr, Inorganic Chemistry (5th ed.)', chapter: 'Coordination chemistry: reactions and mechanisms; Organometallic chemistry' },
    ] },
  { id: 'advinorganic', slug: 'advanced-inorganic', aliases: ['advinorganic'], title: 'Advanced Inorganic', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'crystal', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['bonding', 'nuclear'], layer: 'course',
    blurb: 'LFSE and term symbols, unit-cell packing and Bragg’s law, radius-ratio rules and descriptive chemistry.',
    intro: 'How solids are built, and how metal ions arrange their electrons. Ionic and metallic solids repeat one small unit cell, and counting the atoms in that cell gives density and packing efficiency. X-ray diffraction measures it, through <b>Bragg\'s law</b>. You will work out a structure from a unit cell, find a ligand-field stabilisation energy, and write a term symbol.',
    refs: [
      { text: SHRIVER, chapter: 'The structures of simple solids; d-Metal complexes: electronic structure and properties' },
      { text: ATKINS, chapter: 'Solids — crystal lattices, X-ray diffraction and Bragg\'s law' },
      { text: 'Greenwood & Earnshaw, Chemistry of the Elements (2nd ed.)', chapter: 'The reference for descriptive main-group chemistry' },
    ] },

  // ---- Laboratory Skills ----
  { id: 'labdata', slug: 'lab-and-data', aliases: ['labdata'], title: 'Lab & Data', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 50, difficulty: ['HS'], prereqs: ['stoich'], layer: 'course',
    blurb: 'How to read glassware, how many digits to keep, and how to turn a colour reading into a concentration.',
    intro: 'Every measurement carries an uncertainty, and this module is about knowing how big yours is. You will build a straight-line chart from readings of how much light a solution absorbs, and decide how many digits an answer is allowed to keep. <b>A systematic error shifts every reading the same way. A random one only widens the spread.</b>',
    refs: LABDATA_REFS },
  { id: 'labdata-contest', slug: 'lab-and-data-contest', aliases: ['labdata-contest'], title: 'Lab & Data — Contest', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 25, difficulty: ['CCC', 'USNCO'], prereqs: ['labdata'], layer: 'contest', parent: 'labdata',
    blurb: 'Combining uncertainties, testing an odd result, and identifying an unknown by bench tests.',
    intro: 'Do Lab & Data first. A contest adds the arithmetic of combining uncertainties from several measurements, a test for deciding whether an odd repeat may be discarded, and the bench tests that identify an unknown ion or gas by the colour or smell it gives.',
    refs: LABDATA_REFS },
  { id: 'labtech', slug: 'laboratory-techniques', aliases: ['labtech'], title: 'Laboratory Techniques', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 55, difficulty: ['HS'], prereqs: ['labdata'], layer: 'course',
    blurb: 'Purifying a substance at the bench: which method to reach for, and why it works.',
    intro: 'The bench methods for purifying a substance, and the reasoning behind picking one. Recrystallisation needs a solvent that dissolves the solid when hot and not when cold. Distillation separates by boiling point. Extraction moves a substance between two liquids that do not mix. You will choose a method and say why <b>acid goes into water, never the reverse</b>.',
    refs: LABTECH_REFS },
  { id: 'labtech-contest', slug: 'laboratory-techniques-contest', aliases: ['labtech-contest'], title: 'Laboratory Techniques — Contest', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 25, difficulty: ['CCC', 'USNCO'], prereqs: ['labtech'], layer: 'contest', parent: 'labtech',
    blurb: 'Chromatography: separating a mixture by how strongly each part sticks.',
    intro: 'Do Laboratory Techniques first. A contest adds chromatography, which separates a mixture by how strongly each component sticks to a solid while a liquid or gas carries it along, and the retention values used to report the result.',
    refs: LABTECH_REFS },
  { id: 'analytical', slug: 'analytical-and-quantitative', aliases: ['analytical'], title: 'Analytical & Quantitative', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 40, difficulty: ['CCO'], prereqs: ['equilibrium', 'labdata'], layer: 'course',
    blurb: 'EDTA titration curves, Debye–Hückel activity, gravimetric factors, and separations.',
    intro: 'Measuring how much of something is in a sample, when ideal equilibrium constants stop being enough. EDTA binds a metal ion one-to-one, but only its deprotonated form binds, so the working constant depends on pH. Ionic strength shifts constants too. You will <b>ask what pH and ionic strength are doing to a constant before you use it</b>.',
    refs: [
      { text: HARRIS, chapter: 'EDTA titrations; Activity and the systematic treatment of equilibrium; Gravimetric analysis' },
      { text: 'Skoog, West, Holler & Crouch, Fundamentals of Analytical Chemistry (9th ed.)', chapter: 'Complexation titrations; Gravimetric methods' },
    ] },

  // ---- Spectroscopy ----
  { id: 'spectroscopy', slug: 'spectroscopy-and-synthesis', aliases: ['spectroscopy'], title: 'Spectroscopy & Synthesis', tag: 'Spectroscopy', group: 'Spectroscopy', icon: 'molecule', estMinutes: 50, difficulty: ['CCO', 'IChO'], prereqs: ['bonding', 'organic1'], layer: 'course',
    blurb: 'IR, ¹H-NMR splitting and mass-spec interpretation, plus named-reaction and pericyclic synthesis.',
    intro: 'Three instruments that each answer one question about an unknown compound. Infrared says which functional groups are present, ¹H-NMR says which hydrogens sit next to which, and mass spectrometry says how heavy the molecule is and what pieces fall off it. You will read all three and combine them into a structure: <b>groups first, then connectivity</b>.',
    refs: [
      { text: PAVIA, chapter: 'Infrared spectroscopy; Nuclear magnetic resonance (parts one and two); Mass spectrometry' },
      { text: CLAYDEN, chapter: 'Determining organic structures; Proton NMR; Review of spectroscopic methods' },
    ] },
  { id: 'structure', slug: 'structure-determination', aliases: ['structure'], title: 'Structure Determination', tag: 'Spectroscopy', group: 'Spectroscopy', icon: 'molecule', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['spectroscopy'], layer: 'course',
    blurb: 'Degrees of unsaturation, mass-spec isotope/fragment reading, an IR checklist, and combined IR+NMR+MS unknown-compound identification.',
    intro: 'Working out an unknown compound\'s structure from its spectra, as a procedure rather than a flash of insight. Start from the molecular formula and count the rings and double bonds it must contain, take the functional groups from infrared, build the skeleton from NMR, then <b>check your structure against every piece of data</b>, including the unused ones.',
    refs: [
      { text: PAVIA, chapter: 'Combined structure problems, and the index of hydrogen deficiency' },
      { text: CLAYDEN, chapter: 'Determining organic structures; Review of spectroscopic methods' },
    ] },

  // ---- Practice ----
  { id: 'qbank', slug: 'exam-question-bank', aliases: ['qbank'], title: 'Exam Question Bank', tag: 'Practice', group: 'Practice', wide: true, icon: 'book', estMinutes: 90, difficulty: ['CCC', 'USNCO', 'CCO'], prereqs: [], layer: 'course',
    blurb: 'Original exam-format practice: Part I multiple choice, Part II & III written problems, and four advanced problem sets with full worked solutions.',
    intro: 'Practice questions in the same format as the real contests, with worked solutions. Sit a full-length mock paper under time, then use your results to find the topics worth going back to. <b>Every question is original</b> — written to match the format and difficulty of the real ones, never copied from them. Official past papers are linked, never reproduced.',
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
    // FIRST on purpose: home.ts's startTopic() resolves every "start here"
    // button through this run, so its head module is the site's front door.
    id: 'start-here',
    title: 'Start here',
    blurb: 'The eight modules to work through first, in the order they build on each other.',
    topicIds: ['stoich', 'quantum', 'periodicity', 'bonding', 'thermo1', 'equilibrium', 'aek', 'labdata'],
  },
  {
    id: 'ccc-foundation',
    title: 'CCC foundation',
    blurb: 'The core sequence, in prerequisite order: structure and bonding first, then the mole, then energy and equilibrium, finishing in the lab.',
    // The CONTEST pages of those nine modules (plan3 Phase 6): a contest run
    // starts where the course leaves off, and each of these lists its course
    // page as a prerequisite. Start here is the run of course pages.
    topicIds: ['quantum-contest', 'periodicity-contest', 'bonding-contest', 'stoich-contest',
      'thermo1-contest', 'equilibrium-contest', 'labdata-contest', 'aek-contest', 'labtech-contest'],
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
    blurb: 'The contest-level material, assuming the foundation run: rigorous thermodynamics and kinetics, coordination chemistry, and quantitative lab work.',
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
import { PAGE_QUESTION_IDS } from './content/pageQuestions';
import { solvedWithPrefix, solvedOf, onProgressChange } from './progress';
import { activeMode, inScope, onModeChange, MODE_SHORT } from './mode';

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
 *
 * A SPLIT module (plan3 Phase 6) is the exception: its two pages share one id
 * namespace, so the prefix count cannot tell them apart and would let a contest
 * answer fill the course page's bar. Those pages are counted from
 * `PAGE_QUESTION_IDS` — a generated list of ids, not the questions themselves,
 * so it is ~3 kB of strings and D.10 still holds.
 */
export function moduleProgress(id: string): { done: number; total: number } | null {
  const page = PAGE_QUESTION_IDS[id];
  if (page) return { done: solvedOf(page), total: page.length };
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

/** Is this module on the syllabus for the active competition mode (Phase G)? */
export function moduleInScope(id: string, m = activeMode()): boolean {
  const meta = topicById(id);
  return !meta || inScope(meta.difficulty, m);
}

/**
 * The "not on this syllabus" mark (Phase G).
 *
 * Out-of-scope modules are MARKED, NEVER HIDDEN. A student in CCC mode who
 * wants to read about coordination chemistry should be told it is beyond the
 * contest, not have the site pretend it doesn't exist — the mode is there to
 * prioritise, and a directory that silently loses a third of its entries reads
 * as broken. Hiding is offered as an explicit filter on the menu instead, where
 * the student is the one asking for it.
 */
function scopeMark(id: string): HTMLElement | null {
  const meta = topicById(id);
  if (!meta) return null;
  const mark = h('span', { class: 'topic-scope', hidden: 'true' });
  const paint = (): void => {
    const m = activeMode();
    const out = m !== 'all' && !inScope(meta.difficulty, m);
    mark.hidden = !out;
    if (out) mark.textContent = `Beyond ${MODE_SHORT[m]}`;
  };
  paint();
  onModeChange(paint);
  return mark;
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
      // The GROUP, not `t.tag`: the chip and the menu's Area filter were two
      // names for one thing ("SKILLS" against "Laboratory Skills"), which reads
      // as two taxonomies. `tag` stays as a search keyword.
      h('div', { class: 'topic-tag' }, t.group),
    ),
    h('h3', {}, t.title),
    h('p', {}, t.blurb),
    h('div', { class: 'topic-meta' },
      h('span', { class: 'meta-time', html: CLOCK_ICON }, ` ${t.estMinutes} min`),
      ...difficultyBadges(t.difficulty),
      scopeMark(t.id),
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
