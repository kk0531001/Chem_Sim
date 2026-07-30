// Canonical id vocabulary for ChemPrep content (Roadmap Phase A).
//
// This file is the SINGLE source of truth for:
//   · which module ids exist            (ModuleId)
//   · which coarse exam topics exist    (ExamTopicId)
//   · how the two relate                (MODULE_EXAM_TOPICS + derived inverse)
//   · which quiz banks exist and where  (BANKS)
//   · which exam banks exist and where  (EXAM_BANKS)
//   · the short prefix used to mint stable question ids (ID_PREFIX)
//
// It has NO imports on purpose: scripts/backfill-ids.mjs parses this file as
// text (it cannot import TypeScript), so the tables below are written one entry
// per line in a fixed, machine-readable shape. If you reformat them, read the
// EXTRACTION CONTRACT comments first.
//
// See ./README.md for the vocabulary decision and the id rules.

// ---------------------------------------------------------------------------
// 1. Module ids — the fine-grained vocabulary
// ---------------------------------------------------------------------------

// Every route under /topic/:id. Mirrors TOPICS in src/topics.ts and DEFS in
// src/main.ts; those two remain the source of truth for module *metadata*,
// this union is the source of truth for the *id spelling*.
export type ModuleId =
  | 'sandbox'
  | 'quantum' | 'periodicity' | 'bonding' | 'stoich'
  | 'thermo1' | 'thermo2' | 'gases' | 'equilibrium' | 'aek' | 'physchem' | 'biophys'
  | 'organic1' | 'organic2' | 'organic3' | 'polymers'
  | 'nuclear' | 'coordchem' | 'advinorganic'
  | 'labdata' | 'labtech' | 'analytical'
  | 'spectroscopy' | 'structure'
  | 'qbank';

// `sandbox` is a simulation and `qbank` is a container for the exam banks;
// neither owns a quiz bank, so neither can carry questions tagged with it.
export type QuizModuleId = Exclude<ModuleId, 'sandbox' | 'qbank'>;

export const MODULE_IDS: readonly ModuleId[] = [
  'sandbox',
  'quantum', 'periodicity', 'bonding', 'stoich',
  'thermo1', 'thermo2', 'gases', 'equilibrium', 'aek', 'physchem', 'biophys',
  'organic1', 'organic2', 'organic3', 'polymers',
  'nuclear', 'coordchem', 'advinorganic',
  'labdata', 'labtech', 'analytical',
  'spectroscopy', 'structure',
  'qbank',
];

// ---------------------------------------------------------------------------
// 2. Exam topic ids — the coarse vocabulary already used by the exam banks
// ---------------------------------------------------------------------------

// These strings are ALREADY in the data: bankPart1/2/3, bankCCO,
// bankIntegrated and olympiadPaper*.partB each carry `topic: <one of these>`,
// and qbank.ts groups its UI by them. Do not rename them — the value is
// load-bearing in existing code.
export type ExamTopicId =
  | 'stoich' | 'states' | 'thermo' | 'kinetics' | 'equilibrium' | 'acids'
  | 'redox' | 'atomic' | 'bonding' | 'descriptive' | 'organic' | 'lab';

export const EXAM_TOPIC_IDS: readonly ExamTopicId[] = [
  'stoich', 'states', 'thermo', 'kinetics', 'equilibrium', 'acids',
  'redox', 'atomic', 'bonding', 'descriptive', 'organic', 'lab',
];

// Human labels, for filter chips and progress readouts.
export const EXAM_TOPIC_LABEL: Record<ExamTopicId, string> = {
  stoich: 'Stoichiometry',
  states: 'States of Matter & Gases',
  thermo: 'Thermodynamics',
  kinetics: 'Kinetics',
  equilibrium: 'Equilibrium',
  acids: 'Acids & Bases',
  redox: 'Redox & Electrochemistry',
  atomic: 'Atomic Structure',
  bonding: 'Bonding & Structure',
  descriptive: 'Descriptive & Inorganic',
  organic: 'Organic',
  lab: 'Laboratory',
};

// `stoich`, `equilibrium` and `bonding` are spelled the same in both unions.
// That is a coincidence of naming, not an identity — never pass one where the
// other is expected without going through the maps below.
export type AnyTopicId = ModuleId | ExamTopicId;

// ---------------------------------------------------------------------------
// 3. How the two vocabularies relate
// ---------------------------------------------------------------------------

// ONE hand-maintained direction (module -> exam topics), because a module can
// legitimately span several exam topics: `aek` is literally "Acids, Redox &
// Kinetics". The first entry is the PRIMARY exam topic — use it when a single
// value is needed (a badge, a one-line summary). The inverse index is derived,
// so there is nothing to keep in sync.
export const MODULE_EXAM_TOPICS: Record<QuizModuleId, readonly ExamTopicId[]> = {
  quantum: ['atomic'],
  periodicity: ['atomic'],
  bonding: ['bonding'],
  stoich: ['stoich'],
  thermo1: ['thermo'],
  thermo2: ['thermo'],
  gases: ['states'],
  equilibrium: ['equilibrium'],
  aek: ['acids', 'redox', 'kinetics'],
  physchem: ['thermo', 'kinetics'],
  biophys: ['thermo', 'kinetics'],
  organic1: ['organic'],
  organic2: ['organic'],
  organic3: ['organic'],
  polymers: ['organic'],
  nuclear: ['atomic', 'descriptive'],
  coordchem: ['descriptive', 'bonding'],
  advinorganic: ['descriptive', 'bonding'],
  labdata: ['lab'],
  labtech: ['lab'],
  analytical: ['lab', 'acids', 'redox'],
  spectroscopy: ['organic', 'bonding'],
  structure: ['organic', 'bonding'],
};

export function examTopicsOf(m: QuizModuleId): readonly ExamTopicId[] {
  return MODULE_EXAM_TOPICS[m];
}

/** The single exam topic that best summarises a module. */
export function primaryExamTopicOf(m: QuizModuleId): ExamTopicId {
  return MODULE_EXAM_TOPICS[m][0]!;
}

/** Derived inverse: which modules teach the material behind an exam topic. */
export function modulesForExamTopic(t: ExamTopicId): QuizModuleId[] {
  return (Object.keys(MODULE_EXAM_TOPICS) as QuizModuleId[])
    .filter(m => MODULE_EXAM_TOPICS[m].includes(t));
}

export function isModuleId(s: string): s is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(s);
}
export function isExamTopicId(s: string): s is ExamTopicId {
  return (EXAM_TOPIC_IDS as readonly string[]).includes(s);
}

// ---------------------------------------------------------------------------
// 4. Id prefixes
// ---------------------------------------------------------------------------

// Three characters, unique across all modules, permanent. Used to mint quiz
// question ids: `<prefix>-<NNN>` (e.g. quantum question 1 -> `qua-001`).
// Adding a module means adding a prefix here; NEVER change an existing one —
// the ids already written into the question files depend on it.
//
// EXTRACTION CONTRACT (backfill-ids.mjs): one `<moduleId>: '<prefix>',` per line.
export const ID_PREFIX: Record<ModuleId, string> = {
  sandbox: 'sbx',
  quantum: 'qua',
  periodicity: 'per',
  bonding: 'bon',
  stoich: 'sto',
  thermo1: 'th1',
  thermo2: 'th2',
  gases: 'gas',
  equilibrium: 'equ',
  aek: 'aek',
  physchem: 'phy',
  biophys: 'bio',
  organic1: 'og1',
  organic2: 'og2',
  organic3: 'og3',
  polymers: 'pol',
  nuclear: 'nuc',
  coordchem: 'coo',
  advinorganic: 'ain',
  labdata: 'lbd',
  labtech: 'lbt',
  analytical: 'ana',
  spectroscopy: 'spe',
  structure: 'str',
  qbank: 'qbk',
};

// ---------------------------------------------------------------------------
// 5. Bank registry
// ---------------------------------------------------------------------------

/** A per-module quiz bank: `QuizQ[]`, consumed by exactly one topic tab. */
export interface QuizBankSpec {
  /** The exported binding name, e.g. `QUANTUM_QUIZ`. */
  readonly exportName: string;
  /** The module whose tab renders it — becomes each question's `topic`. */
  readonly module: QuizModuleId;
  /** Repo-relative source path. */
  readonly file: string;
}

// EXTRACTION CONTRACT (backfill-ids.mjs): one
// `{ exportName: '…', module: '…', file: '…' },` per line, in this order.
export const BANKS: readonly QuizBankSpec[] = [
  { exportName: 'QUANTUM_QUIZ', module: 'quantum', file: 'src/tabs/questions1.ts' },
  { exportName: 'BONDING_QUIZ', module: 'bonding', file: 'src/tabs/questions1.ts' },
  { exportName: 'STOICH_QUIZ', module: 'stoich', file: 'src/tabs/questions1.ts' },
  { exportName: 'THERMO1_QUIZ', module: 'thermo1', file: 'src/tabs/questions1.ts' },
  { exportName: 'THERMO2_QUIZ', module: 'thermo2', file: 'src/tabs/questions1.ts' },
  { exportName: 'EQUILIBRIUM_QUIZ', module: 'equilibrium', file: 'src/tabs/questions1.ts' },
  { exportName: 'AEK_QUIZ', module: 'aek', file: 'src/tabs/questions2.ts' },
  { exportName: 'GASES_QUIZ', module: 'gases', file: 'src/tabs/questions2.ts' },
  { exportName: 'NUCLEAR_QUIZ', module: 'nuclear', file: 'src/tabs/questions2.ts' },
  { exportName: 'ORGANIC1_QUIZ', module: 'organic1', file: 'src/tabs/questions2.ts' },
  { exportName: 'ORGANIC2_QUIZ', module: 'organic2', file: 'src/tabs/questions2.ts' },
  { exportName: 'LABDATA_QUIZ', module: 'labdata', file: 'src/tabs/questions2.ts' },
  { exportName: 'ANALYTICAL_QUIZ', module: 'analytical', file: 'src/tabs/questions3.ts' },
  { exportName: 'SPECTROSCOPY_QUIZ', module: 'spectroscopy', file: 'src/tabs/questions3.ts' },
  { exportName: 'INORGANIC_QUIZ', module: 'advinorganic', file: 'src/tabs/questions4.ts' },
  { exportName: 'BIOPHYS_QUIZ', module: 'biophys', file: 'src/tabs/questions4.ts' },
  { exportName: 'PERIODICITY_QUIZ', module: 'periodicity', file: 'src/tabs/questions5.ts' },
  { exportName: 'POLYMERS_QUIZ', module: 'polymers', file: 'src/tabs/questions5.ts' },
  { exportName: 'PHYSCHEM_QUIZ', module: 'physchem', file: 'src/tabs/questions6.ts' },
  { exportName: 'ORGANIC3_QUIZ', module: 'organic3', file: 'src/tabs/questions6.ts' },
  { exportName: 'COORDCHEM_QUIZ', module: 'coordchem', file: 'src/tabs/questions6.ts' },
  { exportName: 'LABTECH_QUIZ', module: 'labtech', file: 'src/tabs/questions7.ts' },
  { exportName: 'STRUCTURE_QUIZ', module: 'structure', file: 'src/tabs/questions7.ts' },
];

/**
 * Shape of an exam bank's exported value, which decides where the codemod
 * looks for question objects:
 *   `mc`    — flat `BankMC[]`  (already has `topic`)
 *   `frq`   — flat `FRQ[]`     (already has `topic`; nested `parts` are NOT questions)
 *   `sets`  — `ProblemSet[]`, questions live in each set's `problems: FRQ[]`
 *   `paper` — a single `OlympiadPaper` object with `partA: QuizQ[]` + `partB: FRQ[]`
 */
export type ExamBankShape = 'mc' | 'frq' | 'sets' | 'paper';

export interface ExamBankSpec {
  readonly exportName: string;
  readonly file: string;
  readonly shape: ExamBankShape;
  /** Id namespace for this bank, e.g. `p1` -> `p1-stoich-003`. Permanent. */
  readonly idPrefix: string;
}

// EXTRACTION CONTRACT (backfill-ids.mjs): one
// `{ exportName: '…', file: '…', shape: '…', idPrefix: '…' },` per line.
export const EXAM_BANKS: readonly ExamBankSpec[] = [
  { exportName: 'PART1', file: 'src/tabs/bankPart1.ts', shape: 'mc', idPrefix: 'p1' },
  { exportName: 'PART2', file: 'src/tabs/bankPart2.ts', shape: 'frq', idPrefix: 'p2' },
  { exportName: 'PART3', file: 'src/tabs/bankPart3.ts', shape: 'mc', idPrefix: 'p3' },
  { exportName: 'CCO_SETS', file: 'src/tabs/bankCCO.ts', shape: 'sets', idPrefix: 'cco' },
  { exportName: 'INTEGRATED_SETS', file: 'src/tabs/bankIntegrated.ts', shape: 'sets', idPrefix: 'int' },
  { exportName: 'paper1', file: 'src/tabs/olympiadPaper1.ts', shape: 'paper', idPrefix: 'mock1' },
  { exportName: 'paper2', file: 'src/tabs/olympiadPaper2.ts', shape: 'paper', idPrefix: 'mock2' },
  { exportName: 'paper3', file: 'src/tabs/olympiadPaper3.ts', shape: 'paper', idPrefix: 'mock3' },
  { exportName: 'paper4', file: 'src/tabs/olympiadPaper4.ts', shape: 'paper', idPrefix: 'mock4' },
  { exportName: 'paper5', file: 'src/tabs/olympiadPaper5.ts', shape: 'paper', idPrefix: 'mock5' },
];

export function bankForModule(m: QuizModuleId): QuizBankSpec | undefined {
  return BANKS.find(b => b.module === m);
}

// ---------------------------------------------------------------------------
// 6. Load-time integrity checks
// ---------------------------------------------------------------------------
// Competitions and difficulty tiers
// ---------------------------------------------------------------------------

/** The four exams the app trains for, in increasing order of demand. */
export type Comp = 'ccc' | 'usnco' | 'cco' | 'icho';
export const COMPS: readonly Comp[] = ['ccc', 'usnco', 'cco', 'icho'] as const;
export const COMP_LABEL: Record<Comp, string> = {
  ccc: 'Canadian Chemistry Contest',
  usnco: 'U.S. National Chemistry Olympiad',
  cco: 'Canadian Chemistry Olympiad',
  icho: 'International Chemistry Olympiad',
};

/** `difficulty` in topics.ts uses these display labels; this is the bridge. */
const COMP_OF_LABEL: Record<string, Comp> = { CCC: 'ccc', USNCO: 'usnco', CCO: 'cco', IChO: 'icho' };
export const compRank = (c: Comp): number => COMPS.indexOf(c) + 1;

/**
 * Difficulty tiers, the Bronze→Platinum ladder from ROADMAP Phase C.
 *
 * 1 Bronze   — single concept, direct application
 * 2 Silver   — two concepts combined
 * 3 Gold     — three concepts, multi-step
 * 4 Platinum — a full olympiad problem
 */
export type Tier = 1 | 2 | 3 | 4;
export const TIER_LABEL: Record<Tier, string> = {
  1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum',
};

/**
 * Which competitions a module's content is IN SCOPE for.
 *
 * `TopicMeta.difficulty` already lists the levels each module is pitched at, so
 * this needs one mapping rather than 919 hand-tags. The semantics are an upward
 * closure from the LOWEST level listed: content pitched at CCC is also fair game
 * for a USNCO/CCO/IChO student (it's foundational), but CCO-level material is
 * out of scope for CCC. That asymmetry is the whole point of a competition mode
 * — it should narrow what you're shown, not just relabel it.
 */
export function compsForDifficulty(difficulty: readonly string[]): Comp[] {
  const ranks = difficulty.map(d => COMP_OF_LABEL[d]).filter(Boolean).map(compRank);
  if (ranks.length === 0) return [...COMPS];
  const floor = Math.min(...ranks);
  return COMPS.filter(c => compRank(c) >= floor);
}

/**
 * Collapse either topic vocabulary onto the coarse exam one.
 *
 * Quiz banks tag by ModuleId ('aek', 'physchem'); the exam banks tag by the 12
 * ExamTopicIds ('acids', 'thermo'). Left as-is, the same chemistry splits across
 * two sets of buckets — `thermo1`/`thermo2` questions would be invisible to a
 * query for `thermo`. Exam topics are tested FIRST so the three ids that spell
 * identically in both ('stoich', 'bonding', 'equilibrium') resolve to
 * themselves. Returns undefined for an unrecognised string rather than
 * inventing a bucket.
 *
 * This is the single definition — the attempt log and the registry's topic index
 * both use it, so statistics and search always agree on what a topic is.
 */
export function toExamTopic(t: string | undefined): ExamTopicId | undefined {
  if (!t) return undefined;
  if (isExamTopicId(t)) return t;
  if (isModuleId(t) && t !== 'sandbox' && t !== 'qbank') return primaryExamTopicOf(t);
  return undefined;
}

/** The most demanding level a module is pitched at — the base for its tier. */
export function ceilingRank(difficulty: readonly string[]): number {
  const ranks = difficulty.map(d => COMP_OF_LABEL[d]).filter(Boolean).map(compRank);
  return ranks.length ? Math.max(...ranks) : 1;
}

// ---------------------------------------------------------------------------

// Cheap and total: catches a copy-pasted prefix or a bank added to only one of
// the two tables, at import time rather than in a user's progress data.
function checkTables(): void {
  const prefixes = new Set<string>();
  for (const m of MODULE_IDS) {
    const p = ID_PREFIX[m];
    if (!/^[a-z0-9]{3}$/.test(p)) throw new Error(`ID_PREFIX[${m}] must be 3 lowercase alphanumerics, got "${p}"`);
    if (prefixes.has(p)) throw new Error(`duplicate ID_PREFIX "${p}" (at module "${m}")`);
    prefixes.add(p);
  }
  const seenModules = new Set<string>();
  const seenExports = new Set<string>();
  for (const b of BANKS) {
    if (seenModules.has(b.module)) throw new Error(`two quiz banks claim module "${b.module}"`);
    if (seenExports.has(b.exportName)) throw new Error(`duplicate bank export "${b.exportName}"`);
    seenModules.add(b.module);
    seenExports.add(b.exportName);
  }
  const namespaces = new Set<string>();
  for (const b of EXAM_BANKS) {
    if (namespaces.has(b.idPrefix)) throw new Error(`duplicate exam-bank idPrefix "${b.idPrefix}"`);
    namespaces.add(b.idPrefix);
  }
  for (const p of prefixes) {
    if (namespaces.has(p)) throw new Error(`id namespace "${p}" is used by both a module and an exam bank`);
  }
}
checkTables();
