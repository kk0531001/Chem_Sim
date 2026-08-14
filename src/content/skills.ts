/**
 * The skill taxonomy — the level BELOW an exam topic (plan2 §10).
 *
 * "You are weak at equilibrium" is a label a student cannot act on. "You set up
 * ICE tables fine but miss Q vs K" is something they can fix this afternoon.
 * That is the only reason this layer exists, and it is why the ids are
 * `<examTopic>/<skill>`: the topic half must be an ExamTopicId so a skill can
 * never drift away from the twelve-topic vocabulary the attempt log and the
 * registry already agree on (CLAUDE.md, "Two topic vocabularies").
 *
 * Tagging is DELIBERATELY PARTIAL. An untagged question is absent from the
 * skill breakdown rather than bucketed as "other" (see accuracyBySkill), so a
 * half-tagged corpus reports less, never wrong. Tag a bank when you can name
 * its skills honestly; do not invent a skill to fill a gap.
 *
 * The labels are a MAP, not a de-hyphenating regex. These are terms of art and
 * the regex got three of eight wrong — "Le chatelier", "Q vs k", "Ice setup".
 * Chemistry names are not a string-formatting problem.
 */
import type { ExamTopicId } from './topicIds';

/** `<examTopic>/<skill>`, e.g. `equilibrium/q-vs-k`. */
export type SkillId = string;

export const SKILLS: Record<ExamTopicId, Record<string, string>> = {
  stoich: {
    'limiting-reagent': 'Limiting reagent',
    'empirical-formula': 'Empirical and molecular formulae',
    'solution-conc': 'Concentration and dilution',
    'net-ionic': 'Net ionic equations',
    'percent-composition': 'Percent composition',
  },
  states: {
    'gas-laws': 'Gas laws',
    'kmt': 'Kinetic molecular theory',
    'real-gases': 'Real gases and van der Waals',
    'imf': 'Intermolecular forces',
    'phase-behaviour': 'Phase diagrams and transitions',
    'colligative': 'Colligative properties',
  },
  thermo: {
    'enthalpy': 'Enthalpy and calorimetry',
    'hess': 'Hess’s law',
    'entropy': 'Entropy',
    'gibbs': 'Gibbs energy and spontaneity',
    'bond-energies': 'Bond energies',
    'state-functions': 'State functions and work',
  },
  kinetics: {
    'rate-laws': 'Rate laws and order',
    'integrated-rate': 'Integrated rate laws',
    'mechanisms': 'Mechanisms and the rate-determining step',
    'arrhenius': 'Arrhenius and temperature',
    'catalysis': 'Catalysis',
  },
  equilibrium: {
    'k-meaning': 'What K means',
    'k-expression': 'Writing K',
    'k-manipulation': 'Manipulating K',
    'ice-setup': 'ICE setup',
    'q-vs-k': 'Q vs K',
    'le-chatelier': 'Le Châtelier',
    'ksp': 'Ksp and solubility',
    'approximations': 'Approximations',
  },
  acids: {
    'strong-weak': 'Strong vs weak',
    'ph-calc': 'pH calculations',
    'buffers': 'Buffers',
    'titration-curves': 'Titration curves',
    'indicators': 'Indicators',
    'polyprotic': 'Polyprotic acids',
  },
  redox: {
    'oxidation-states': 'Oxidation states',
    'balancing': 'Balancing redox equations',
    'cell-potential': 'Cell potentials',
    'nernst': 'The Nernst equation',
    'electrolysis': 'Electrolysis and Faraday',
  },
  atomic: {
    'quantum-numbers': 'Quantum numbers and orbitals',
    'configuration': 'Electron configuration',
    'periodic-trends': 'Periodic trends',
    'spectra': 'Atomic spectra',
    'pes': 'Photoelectron spectroscopy',
  },
  bonding: {
    'lewis-vsepr': 'Lewis structures and VSEPR',
    'hybridisation': 'Hybridisation',
    'mo-theory': 'Molecular orbital theory',
    'polarity': 'Polarity and dipoles',
    'bond-properties': 'Bond order, length and strength',
  },
  descriptive: {
    'periodic-groups': 'Group chemistry',
    'coordination': 'Coordination compounds',
    'crystal-field': 'Crystal field theory',
    'solid-state': 'Solid state and lattices',
    'qualitative-analysis': 'Qualitative analysis',
    'nuclear': 'Nuclear chemistry',
  },
  organic: {
    'nomenclature': 'Nomenclature',
    'stereochemistry': 'Stereochemistry',
    'substitution-elimination': 'Substitution and elimination',
    'carbonyl': 'Carbonyl chemistry',
    'aromatic': 'Aromatic chemistry',
    'mechanisms': 'Mechanisms and intermediates',
    'synthesis': 'Synthesis and retrosynthesis',
    'polymers': 'Polymers',
  },
  lab: {
    'measurement': 'Measurement and uncertainty',
    'sig-figs': 'Significant figures',
    'separation': 'Separation and purification',
    'titration-technique': 'Titration technique',
    'spectroscopy-ir': 'IR spectroscopy',
    'spectroscopy-nmr': 'NMR spectroscopy',
    'spectroscopy-ms': 'Mass spectrometry',
    'structure-elucidation': 'Structure elucidation',
    'error-analysis': 'Error analysis',
  },
};

/** Every valid skill id, for the audit to check tags against. */
export const SKILL_IDS: ReadonlySet<SkillId> = new Set(
  Object.entries(SKILLS).flatMap(([topic, skills]) =>
    Object.keys(skills).map(s => `${topic}/${s}`)),
);

/** Display name for a skill id; falls back to the raw leaf rather than lying. */
export function skillLabel(id: SkillId): string {
  const [topic, leaf] = id.split('/');
  return (SKILLS as Record<string, Record<string, string> | undefined>)[topic]?.[leaf] ?? leaf ?? id;
}
