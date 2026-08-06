// Shared topic metadata — one entry per page/module, used by the homepage
// teaser grid, the full Menu directory, and the breadcrumb/prereq/next-lesson
// chrome on each topic page. `group` must match the `group` field on each
// TabDef. `difficulty` lists every exam level the module is pitched at, in
// increasing order (CCC < USNCO < CCO < IChO). `prereqs` are topic ids.
export interface TopicMeta {
  id: string; title: string; blurb: string; tag: string; group: string; wide?: boolean;
  slug: string; aliases?: readonly string[];
  icon: string; estMinutes: number; difficulty: string[]; prereqs: string[];
}

export const TOPICS: TopicMeta[] = [
  { id: 'sandbox', slug: 'particle-sandbox', aliases: ['sandbox'], title: 'Particle Sandbox', tag: 'Playground', group: 'Playground', wide: true, icon: 'flask', estMinutes: 20, difficulty: ['CCC'], prereqs: [],
    blurb: 'Spawn atoms and watch molecules self-assemble by valence rules — then heat the box until they shake apart.' },

  // ---- Foundations ----
  { id: 'quantum', slug: 'quantum-and-atomic-structure', aliases: ['quantum'], title: 'Quantum & Atomic Structure', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 45, difficulty: ['CCC'], prereqs: [],
    blurb: 'Real hydrogen orbitals, radial distributions, spectral series, and an electron-configuration builder.' },
  { id: 'periodicity', slug: 'periodicity', aliases: ['periodicity'], title: 'Periodicity', tag: 'Foundations', group: 'Foundations', icon: 'atom', estMinutes: 35, difficulty: ['CCC'], prereqs: ['quantum'],
    blurb: 'Interactive trend curves with the IE/EA anomalies annotated, a Slater\'s-rules Z_eff calculator, and amphoterism.' },
  { id: 'bonding', slug: 'bonding-vsepr-and-mo-theory', aliases: ['bonding'], title: 'Bonding, VSEPR & MO Theory', tag: 'Foundations', group: 'Foundations', icon: 'molecule', estMinutes: 45, difficulty: ['CCC', 'USNCO'], prereqs: ['quantum', 'periodicity'],
    blurb: 'Every VSEPR shape with lone-pair sketches, plus MO diagrams that explain why O₂ is magnetic.' },
  { id: 'stoich', slug: 'stoichiometry-and-solutions', aliases: ['stoich'], title: 'Stoichiometry & Solutions', tag: 'Foundations', group: 'Foundations', icon: 'scale', estMinutes: 35, difficulty: ['CCC'], prereqs: [],
    blurb: 'Limiting reagents you can see, molarity and dilution tools, and the empirical-formula recipe.' },

  // ---- Physical Chemistry ----
  { id: 'thermo1', slug: 'thermodynamics-i', aliases: ['thermo1'], title: 'Thermodynamics I', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 40, difficulty: ['CCC'], prereqs: ['stoich'],
    blurb: 'Calorimetry mixing, Hess\'s law cycles, Born–Haber, and estimating ΔH from bond enthalpies.' },
  { id: 'thermo2', slug: 'thermodynamics-ii', aliases: ['thermo2'], title: 'Thermodynamics II', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['thermo1'],
    blurb: 'Entropy as microstate counting, the ΔG = ΔH − TΔS spontaneity map, and the ΔG° ↔ K converter.' },
  { id: 'gases', slug: 'gases-imfs-and-phases', aliases: ['gases'], title: 'Gases, IMFs & Phases', tag: 'Physical', group: 'Physical Chemistry', icon: 'gas', estMinutes: 45, difficulty: ['USNCO'], prereqs: ['stoich'],
    blurb: 'A kinetic gas box, Maxwell–Boltzmann curves, draggable phase diagrams, Clausius–Clapeyron.' },
  { id: 'equilibrium', slug: 'chemical-equilibrium', aliases: ['equilibrium'], title: 'Chemical Equilibrium', tag: 'Physical', group: 'Physical Chemistry', icon: 'equilibrium', estMinutes: 45, difficulty: ['CCC', 'USNCO'], prereqs: ['thermo2'],
    blurb: 'A live N₂O₄ ⇌ 2NO₂ system you can shove around, an ICE solver, and the full Ksp toolkit.' },
  { id: 'aek', slug: 'acids-redox-and-kinetics', aliases: ['aek'], title: 'Acids, Redox & Kinetics', tag: 'Physical', group: 'Physical Chemistry', icon: 'bolt', estMinutes: 55, difficulty: ['USNCO'], prereqs: ['equilibrium'],
    blurb: 'Titration curves with a working buret, buffer design, galvanic cells, Latimer diagrams, and rate laws.' },
  { id: 'physchem', slug: 'advanced-physical-chemistry', aliases: ['physchem'], title: 'Advanced Physical Chemistry', tag: 'Physical', group: 'Physical Chemistry', icon: 'thermo', estMinutes: 50, difficulty: ['USNCO', 'CCO'], prereqs: ['equilibrium', 'thermo2'],
    blurb: 'van\'t Hoff and Clausius–Clapeyron, concentration cells, real gases (van der Waals / Z), heat capacities + Kirchhoff, catalysis, and coupled equilibria.' },
  { id: 'biophys', slug: 'physical-and-biochemistry', aliases: ['biophys'], title: 'Physical & Biochemistry', tag: 'Physical', group: 'Physical Chemistry', icon: 'dna', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['thermo2', 'aek'],
    blurb: 'Michaelis–Menten, Eyring transition-state theory, Boltzmann populations and bioenergetics (CCO PS4).' },

  // ---- Organic Chemistry ----
  { id: 'organic1', slug: 'organic-i-mechanisms', aliases: ['organic1'], title: 'Organic I — Mechanisms', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['bonding'],
    blurb: 'The SN1 / SN2 / E1 / E2 decision engine, the pKa ladder, and carbocation stability.' },
  { id: 'organic2', slug: 'organic-ii-and-symmetry', aliases: ['organic2'], title: 'Organic II & Symmetry', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 45, difficulty: ['USNCO', 'CCO'], prereqs: ['organic1'],
    blurb: 'Markovnikov predictions, EAS directing effects, the carbonyl map, Hückel aromaticity, and point groups.' },
  { id: 'organic3', slug: 'organic-iii-synthesis', aliases: ['organic3'], title: 'Organic III — Synthesis', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 50, difficulty: ['USNCO', 'CCO'], prereqs: ['organic2'],
    blurb: 'Retrosynthesis and multi-step planning, protecting groups, radical mechanisms + selectivity, rearrangements, and intro pericyclic reactions.' },
  { id: 'polymers', slug: 'polymers', aliases: ['polymers'], title: 'Polymers', tag: 'Organic', group: 'Organic Chemistry', icon: 'molecule', estMinutes: 30, difficulty: ['USNCO'], prereqs: ['organic1'],
    blurb: 'Addition vs condensation, monomer↔polymer matching, and Mₙ/Mᵂ/PDI/degree-of-polymerization calculations.' },

  // ---- Inorganic Chemistry ----
  { id: 'nuclear', slug: 'nuclear-and-coordination', aliases: ['nuclear'], title: 'Nuclear & Coordination', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'atom', estMinutes: 40, difficulty: ['USNCO'], prereqs: ['quantum'],
    blurb: 'Truly random decay against the exponential law, carbon dating, and crystal-field color prediction.' },
  { id: 'coordchem', slug: 'coordination-and-organometallic', aliases: ['coordchem'], title: 'Coordination & Organometallic', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'crystal', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['nuclear', 'bonding'],
    blurb: 'HSAB, the Jahn–Teller effect, ligand substitution + the trans effect, the chelate/macrocyclic effect, isomerism, and 18-electron counting.' },
  { id: 'advinorganic', slug: 'advanced-inorganic', aliases: ['advinorganic'], title: 'Advanced Inorganic', tag: 'Inorganic', group: 'Inorganic Chemistry', icon: 'crystal', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['bonding', 'nuclear'],
    blurb: 'LFSE and term symbols, unit-cell packing and Bragg\'s law, radius-ratio rules and descriptive chemistry (CCO PS3).' },

  // ---- Laboratory Skills ----
  { id: 'labdata', slug: 'lab-and-data', aliases: ['labdata'], title: 'Lab & Data', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 40, difficulty: ['CCC', 'USNCO'], prereqs: ['stoich'],
    blurb: 'Beer\'s law calibration, sig figs, uncertainty propagation + Q-test, qualitative tests, and titration technique.' },
  { id: 'labtech', slug: 'laboratory-techniques', aliases: ['labtech'], title: 'Laboratory Techniques', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 45, difficulty: ['CCC', 'USNCO'], prereqs: ['labdata'],
    blurb: 'Recrystallization, the distillation family, filtration, liquid–liquid extraction, drying agents, standard-solution & buffer prep, uncertainty, and safety.' },
  { id: 'analytical', slug: 'analytical-and-quantitative', aliases: ['analytical'], title: 'Analytical & Quantitative', tag: 'Skills', group: 'Laboratory Skills', icon: 'flask', estMinutes: 40, difficulty: ['CCO'], prereqs: ['equilibrium', 'labdata'],
    blurb: 'EDTA titration curves, Debye–Hückel activity, gravimetric factors, and separations — the core of CCO PS1.' },

  // ---- Spectroscopy ----
  { id: 'spectroscopy', slug: 'spectroscopy-and-synthesis', aliases: ['spectroscopy'], title: 'Spectroscopy & Synthesis', tag: 'Spectroscopy', group: 'Spectroscopy', icon: 'molecule', estMinutes: 50, difficulty: ['CCO', 'IChO'], prereqs: ['bonding', 'organic1'],
    blurb: 'IR, ¹H-NMR splitting and mass-spec interpretation, plus named-reaction and pericyclic synthesis (CCO PS2).' },
  { id: 'structure', slug: 'structure-determination', aliases: ['structure'], title: 'Structure Determination', tag: 'Spectroscopy', group: 'Spectroscopy', icon: 'molecule', estMinutes: 45, difficulty: ['CCO', 'IChO'], prereqs: ['spectroscopy'],
    blurb: 'Degrees of unsaturation, mass-spec isotope/fragment reading, an IR checklist, and combined IR+NMR+MS unknown-compound identification.' },

  // ---- Practice ----
  { id: 'qbank', slug: 'exam-question-bank', aliases: ['qbank'], title: 'Exam Question Bank', tag: 'Practice', group: 'Practice', wide: true, icon: 'book', estMinutes: 90, difficulty: ['CCC', 'USNCO', 'CCO'], prereqs: [],
    blurb: 'Original exam-format practice: Part I multiple choice, Part II & III written problems, and the four advanced CCO problem sets (PS1–PS4) with full worked solutions.' },
];

export const topicById = (id: string): TopicMeta | undefined => TOPICS.find(t => t.id === id);

const topicsBySlug = new Map<string, TopicMeta>();
for (const topic of TOPICS) {
  topicsBySlug.set(topic.slug, topic);
  for (const alias of topic.aliases ?? []) topicsBySlug.set(alias, topic);
}

export const topicBySlug = (slug: string): TopicMeta | undefined => topicsBySlug.get(slug);

// ---- shared card renderer (homepage teaser grid + menu directory) ----
import { h } from './tabs/framework';
import { topicIconSVG, CLOCK_ICON } from './icons';

export function difficultyBadges(diff: string[]): HTMLElement[] {
  return diff.map(d => h('span', { class: `badge badge-${d.toLowerCase()}` }, d));
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
    showPrereqs && prereqTitles.length
      ? h('p', { class: 'topic-prereq-line' }, `Prerequisite${prereqTitles.length > 1 ? 's' : ''}: ${prereqTitles.join(', ')}`)
      : null,
    h('button', {
      type: 'button', class: 'topic-open', 'aria-label': `Open module: ${t.title}`,
      onclick: (e: Event) => { e.stopPropagation(); onOpen(t.id); },
    }, 'Open module →'),
  );
}
