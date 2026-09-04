// One flat, indexed view of every question in the app.
//
// This exists for two reasons. The immediate one is the id migration below:
// progress used to be keyed by a hash of question text, and moving to explicit
// ids requires knowing BOTH keys for every question at once, which means
// somewhere has to enumerate the whole corpus. The lasting one is that search,
// topic filtering, tiering and the challenge ladder (ROADMAP phases C and E)
// are all queries over exactly this list.
//
// Importing every bank here pulls the whole corpus into whatever chunk reaches
// this module, so nothing on the entry path may import it — the homepage gets
// its three numbers from ./counts instead (ROADMAP D.10).
import { qid, remapProgressIds, needsIdMigration, markIdMigrationDone,
  dueForReview, weakSkills, weakTopics, accuracyByQuestion } from '../progress';
import type { QuizQ } from '../tabs/framework';
import type { FRQ } from '../tabs/bankPart2';
import {
  BANKS, COMPS, ID_PREFIX, EXAM_TOPIC_LABEL, ceilingRank, compRank, compsForDifficulty, isExamTopicId,
  isModuleId, toExamTopic,
  type Comp, type ExamTopicId, type QuizModuleId, type Tier,
} from './topicIds';
import { TOPICS, topicById } from '../topics';
import { CORPUS_COUNTS, MODULE_QUIZ_SIZE, COURSE_QUIZ_SIZE } from './counts';
import { PAGE_QUESTION_IDS } from './pageQuestions';
import { skillLabel } from './skills';

// ---- quiz banks (one per topic module) ----
import { QUANTUM_QUIZ, BONDING_QUIZ, STOICH_QUIZ, THERMO1_QUIZ, THERMO2_QUIZ, EQUILIBRIUM_QUIZ } from '../tabs/questions1';
import { GASES_QUIZ, AEK_QUIZ, NUCLEAR_QUIZ, ORGANIC1_QUIZ, ORGANIC2_QUIZ, LABDATA_QUIZ } from '../tabs/questions2';
import { ANALYTICAL_QUIZ, SPECTROSCOPY_QUIZ } from '../tabs/questions3';
import { INORGANIC_QUIZ, BIOPHYS_QUIZ } from '../tabs/questions4';
import { PERIODICITY_QUIZ, POLYMERS_QUIZ } from '../tabs/questions5';
import { PHYSCHEM_QUIZ, ORGANIC3_QUIZ, COORDCHEM_QUIZ } from '../tabs/questions6';
import { LABTECH_QUIZ, STRUCTURE_QUIZ } from '../tabs/questions7';

// ---- exam banks ----
import { PART1 } from '../tabs/bankPart1';
import { PART2 } from '../tabs/bankPart2';
import { PART3 } from '../tabs/bankPart3';
import { CCO_SETS } from '../tabs/bankCCO';
import { INTEGRATED_SETS } from '../tabs/bankIntegrated';
import { OLYMPIAD_PAPERS } from '../tabs/bankOlympiad';

/** Every module quiz bank, keyed by the module it belongs to. */
export const QUIZ_BANKS: Record<QuizModuleId, QuizQ[]> = {
  quantum: QUANTUM_QUIZ, bonding: BONDING_QUIZ, stoich: STOICH_QUIZ,
  thermo1: THERMO1_QUIZ, thermo2: THERMO2_QUIZ, equilibrium: EQUILIBRIUM_QUIZ,
  gases: GASES_QUIZ, aek: AEK_QUIZ, nuclear: NUCLEAR_QUIZ,
  organic1: ORGANIC1_QUIZ, organic2: ORGANIC2_QUIZ, labdata: LABDATA_QUIZ,
  analytical: ANALYTICAL_QUIZ, spectroscopy: SPECTROSCOPY_QUIZ,
  advinorganic: INORGANIC_QUIZ, biophys: BIOPHYS_QUIZ,
  periodicity: PERIODICITY_QUIZ, polymers: POLYMERS_QUIZ,
  physchem: PHYSCHEM_QUIZ, organic3: ORGANIC3_QUIZ, coordchem: COORDCHEM_QUIZ,
  labtech: LABTECH_QUIZ, structure: STRUCTURE_QUIZ,
};

/** Every multiple-choice question in the app: module quizzes + exam MC + mock Part A. */
export const ALL_MC: QuizQ[] = [
  ...Object.values(QUIZ_BANKS).flat(),
  ...(PART1 as QuizQ[]),
  ...(PART3 as unknown as QuizQ[]),
  ...OLYMPIAD_PAPERS.flatMap(p => p.partA),
];

/** Every multi-part written problem. */
export const ALL_FRQ: FRQ[] = [
  ...PART2,
  ...CCO_SETS.flatMap(s => s.problems),
  ...INTEGRATED_SETS.flatMap(s => s.problems),
  ...OLYMPIAD_PAPERS.flatMap(p => p.partB),
];

// The corpus in numbers lives in ./counts, stated rather than derived, so that
// the homepage can quote it without importing every question bank. auditCorpus()
// below checks it against the real arrays.
export { CORPUS_COUNTS };

// ---- tier and competition scope ------------------------------------------
//
// Both are DERIVED with an optional per-question override, rather than stored on
// all 919 questions. Two reasons. Hand-tiering 919 items in one pass is not
// something anyone does accurately, and a stored value that merely restates the
// default is a copy that goes stale the moment a module's difficulty changes.
// Deriving gives total coverage immediately and leaves an obvious place to
// refine individual questions.

/** Which quiz bank (hence which module) a question id belongs to. */
const MODULE_BY_PREFIX = new Map<string, QuizModuleId>();
for (const b of BANKS) MODULE_BY_PREFIX.set(ID_PREFIX[b.module], b.module);

function moduleOfId(id: string): QuizModuleId | undefined {
  return MODULE_BY_PREFIX.get(id.slice(0, 3));
}

/** The warm-up run at the head of every quiz bank — `quiz(BANK, 5)`. */
const WARMUP_COUNT = 5;
function isWarmup(id: string): boolean {
  const m = /^[a-z0-9]{3}-(\d{3})$/.exec(id);
  return !!m && moduleOfId(id) !== undefined && Number(m[1]) <= WARMUP_COUNT;
}

const difficultyOfId = (id: string): readonly string[] => {
  const mod = moduleOfId(id);
  return (mod && topicById(mod)?.difficulty) || [];
};

/**
 * Difficulty tier for any question in the corpus.
 *
 * The corpus already encodes difficulty structurally, so this reads it off
 * rather than guessing:
 *  - the first five of every quiz bank are explicitly warm-ups → Bronze;
 *  - a multi-part written problem is multi-step by construction → Gold, and
 *    Platinum for the CCO problem sets and Integrated Challenges, which are
 *    deliberately multi-topic;
 *  - otherwise a single-answer MC, scaled by how demanding its module is
 *    (`difficulty` in topics.ts), FLOORED AT SILVER and CAPPED AT GOLD.
 *
 * Both bounds on that last case are deliberate. The floor: past the warm-ups,
 * every quiz bank is documented as "CCC/CCO/USNCO-style", so a question in a
 * CCC-pitched module is still an exam question — without the floor, a
 * CCC-only module's whole bank collapsed into Bronze and became
 * indistinguishable from its own warm-ups. The floor covers the HS level for
 * the same reason: Bronze is the warm-ups, so an HS-only module still starts
 * at Silver. The cap: a four-option multiple choice cannot be "a full olympiad
 * problem", whatever it is about.
 *
 * The tier scale is anchored at CCC = Silver, so a competition rank is offset
 * by `compRank('ccc') - 1` before it is read as a tier — `hs` sits below the
 * contests and must not push every other level up a rung.
 */
export function tierOf(q: { id: string; tier?: Tier }): Tier {
  if (q.tier) return q.tier;
  const id = q.id;
  if (isWarmup(id)) return 1;
  if (id.startsWith('cco-') || id.startsWith('int-')) return 4;
  if (id.startsWith('p2-') || /^mock\d-b-/.test(id)) return 3;
  const base = moduleOfId(id) ? ceilingRank(difficultyOfId(id)) - (compRank('ccc') - 1) : 2; // exam banks have no module
  return Math.min(3, Math.max(2, base)) as Tier;
}

/**
 * Competitions a question is in scope for. Module questions inherit their
 * module's curated scope; exam-bank questions have no module, and the banks
 * they live in are pitched at everyone, so they default to all four.
 */
export function compsOf(q: { id: string; comps?: readonly Comp[] }): readonly Comp[] {
  if (q.comps) return q.comps;
  const mod = moduleOfId(q.id);
  return mod ? compsForDifficulty(difficultyOfId(q.id)) : COMPS;
}

// ---- query indexes --------------------------------------------------------

export type Indexable = QuizQ | FRQ;
const ALL: Indexable[] = [...ALL_MC, ...ALL_FRQ];

function group<K extends string | number>(keyOf: (q: Indexable) => K[]): Map<K, Indexable[]> {
  const out = new Map<K, Indexable[]>();
  for (const q of ALL) for (const k of keyOf(q)) {
    const list = out.get(k);
    if (list) list.push(q); else out.set(k, [q]);
  }
  return out;
}

// Built once at module load: the corpus is static, so rebuilding per query
// would be pure waste.
//
// The topic index is keyed on the NORMALISED exam topic, not the raw `topic`
// string. Keyed raw it produced two sets of buckets for the same chemistry —
// `thermo1` and `thermo2` alongside `thermo` — so a query for `thermo` silently
// missed 50 module questions. `toExamTopic` is the same collapse the attempt log
// uses, so search and statistics can't disagree about what a topic is.
const BY_TOPIC = group<ExamTopicId>(q => {
  const t = toExamTopic(q.topic);
  return t ? [t] : [];
});
const BY_MODULE = group<string>(q => (q.topic && isModuleId(q.topic) ? [q.topic] : []));
const BY_TIER = group<Tier>(q => [tierOf(q)]);
const BY_COMP = group<Comp>(q => [...compsOf(q)]);
// Sparse by design: only tagged questions appear, and a question tagged with
// two skills appears under both.
const BY_SKILL = group<string>(q => skillsOf(q));

/** By coarse exam topic (12 buckets) — what filtering and review want. */
export const byTopic = (t: ExamTopicId): Indexable[] => BY_TOPIC.get(t) ?? [];
/** By the finer module id, for "everything from this lesson". */
export const byModule = (m: string): Indexable[] => BY_MODULE.get(m) ?? [];
export const byTier = (t: Tier): Indexable[] => BY_TIER.get(t) ?? [];
/** By sub-skill (`equilibrium/q-vs-k`). Empty for an untagged skill, never null. */
export const bySkill = (s: string): Indexable[] => BY_SKILL.get(s) ?? [];
export const byComp = (c: Comp): Indexable[] => BY_COMP.get(c) ?? [];

// One id -> question lookup for the whole corpus. Progress stores ids and
// nothing else, so every feature that turns stored progress back into readable
// questions — the dashboard's history list, the review queue, search results —
// needs exactly this map. Built once here rather than three times by hand.
const BY_ID = new Map<string, Indexable>(ALL.map(q => [q.id, q]));

/** The question with this id, or undefined if it has been removed from a bank. */
export const questionById = (id: string): Indexable | undefined => BY_ID.get(id);

/**
 * Resolve stored ids to questions, in the order given, silently dropping any
 * that no longer exist. Progress outlives the corpus: a question deleted from a
 * bank leaves its id in someone's attempt log forever, and that must degrade to
 * a shorter list rather than a hole in the page.
 */
export function questionsByIds(ids: readonly string[]): Indexable[] {
  const out: Indexable[] = [];
  for (const id of ids) {
    const q = BY_ID.get(id);
    if (q) out.push(q);
  }
  return out;
}

/** Everything matching all the constraints given — the Phase C/E/F workhorse. */
export function query(f: {
  topic?: ExamTopicId; module?: string; tier?: Tier; comp?: Comp; mcOnly?: boolean;
} = {}): Indexable[] {
  let out: Indexable[] = f.topic ? byTopic(f.topic) : f.module ? byModule(f.module) : ALL;
  if (f.tier) out = out.filter(q => tierOf(q) === f.tier);
  if (f.comp) out = out.filter(q => compsOf(q).includes(f.comp!));
  if (f.mcOnly) out = out.filter(q => 'opts' in q);
  return out;
}

/**
 * The end-of-lesson ladder from ROADMAP C.3: Bronze → Silver → Gold →
 * Platinum for one module, respecting the active competition. Platinum rarely
 * exists per-module (24 in the whole corpus), so it falls back to the topic's
 * hardest available tier rather than returning nothing.
 */
export function ladderFor(module: string, comp?: Comp): Record<Tier, Indexable[]> {
  // If the MODULE itself is out of scope for this competition, the ladder is
  // empty — not "the exam-bank questions that happen to share its topic".
  // Without this guard, coordination chemistry (a CCO/IChO module) returned 25
  // questions in CCC mode via the shared `descriptive` topic, which reads as
  // "here is your CCC coordination-chemistry practice" for a topic that isn't
  // on the CCC syllabus at all.
  const meta = topicById(module);
  if (comp && meta && !compsForDifficulty(meta.difficulty).includes(comp)) {
    return { 1: [], 2: [], 3: [], 4: [] };
  }
  const examTopic = toExamTopic(module);
  const pool = [
    ...byModule(module),
    ...(examTopic ? byTopic(examTopic).filter(q => !isModuleId(q.topic ?? '')) : []),
  ];
  const scoped = comp ? pool.filter(q => compsOf(q).includes(comp)) : pool;
  return {
    1: scoped.filter(q => tierOf(q) === 1),
    2: scoped.filter(q => tierOf(q) === 2),
    3: scoped.filter(q => tierOf(q) === 3),
    4: scoped.filter(q => tierOf(q) === 4),
  };
}

/** Coverage summary — what the ladder and the competition modes have to work with. */
export function corpusBreakdown(): {
  byTier: Record<Tier, number>;
  byComp: Record<Comp, number>;
  byTopic: Record<string, number>;
  untopiced: number;
} {
  const t = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<Tier, number>;
  for (const [k, v] of BY_TIER) t[k] = v.length;
  const c = {} as Record<Comp, number>;
  for (const comp of COMPS) c[comp] = byComp(comp).length;
  const tp: Record<string, number> = {};
  for (const [k, v] of BY_TOPIC) tp[k] = v.length;
  return { byTier: t, byComp: c, byTopic: tp, untopiced: ALL.filter(q => !q.topic).length };
}

/**
 * The page contract (ROADMAP D.4), for the parts a type cannot state.
 *
 * `topicPage()` already makes six of the eight blocks a compile error to omit —
 * intro, theory, simulations, quiz, challenge and references are required
 * fields. What is left is everything that is a COUNT rather than a presence:
 * a bank of five questions still type-checks, and so does a page whose
 * misconception boxes were never written. Those are what this reads.
 *
 * Deliberately not a spreadsheet and not a mount harness: it is a pass over the
 * data the modules already export, so it stays true without anything being kept
 * in sync by hand. The two blocks it cannot see from here — a mission ladder
 * and a reset button, which exist only once a tab is mounted — are checked by
 * topicPage() itself when the page is built.
 */
const CONTRACT_EXEMPT = new Set(['sandbox', 'qbank']);

export function auditTopicPages(): { problems: string[]; misconceptions: number } {
  const problems: string[] = [];
  let misconceptions = 0;

  for (const topic of TOPICS) {
    // The playground and the exam bank are not lessons: neither has a 25-item
    // module quiz or a simulation, and pretending otherwise would mean either a
    // fake quiz bank or an audit that is permanently red.
    if (CONTRACT_EXEMPT.has(topic.id)) continue;
    const where = topic.id;
    // The nine contest pages ship with `intro: ''` until Prompt 16 writes them.
    // An empty intro renders nothing at all (see topicPage) rather than an empty
    // box, so this is a gap in the copy, not a broken page — and saying so nine
    // times would drown the audit's real findings until then.
    if (topic.intro.trim().length < 200 && !(topic.layer === 'contest' && !topic.intro)) {
      problems.push(`${where}: intro is too short to be an introduction`);
    }
    if (topic.refs.length < 2) problems.push(`${where}: ${topic.refs.length} reference(s), the contract asks for 2–4`);
    for (const r of topic.refs) if (!r.text.trim()) problems.push(`${where}: a reference with no text`);

    // A split module's bank is divided between its two PAGES (plan3 Phase 6):
    // the course page runs exactly the first COURSE_QUIZ_SIZE, the contest page
    // whatever is left — which has to be enough to be worth a page.
    const module = topic.parent ?? topic.id;
    const bank = (QUIZ_BANKS as Record<string, QuizQ[] | undefined>)[module];
    if (!bank) { problems.push(`${where}: no quiz bank registered in QUIZ_BANKS`); continue; }
    const split = `${module}-contest` in MODULE_QUIZ_SIZE;
    const pageBank = !split ? bank
      : topic.layer === 'contest' ? bank.slice(COURSE_QUIZ_SIZE) : bank.slice(0, COURSE_QUIZ_SIZE);
    if (!split && bank.length < 25) problems.push(`${where}: quiz has ${bank.length} questions, the contract asks for 25`);
    if (split && topic.layer === 'course' && pageBank.length !== COURSE_QUIZ_SIZE) {
      problems.push(`${where}: course page has ${pageBank.length} questions, the contract asks for exactly ${COURSE_QUIZ_SIZE}`);
    }
    if (split && topic.layer === 'contest' && pageBank.length < 5) {
      problems.push(`${where}: contest page has ${pageBank.length} questions, the contract asks for at least 5`);
    }
    // Counted per PAGE (the two slices partition the bank, so the corpus total
    // is unchanged) but the four-box floor stays a rule about the MODULE, and
    // is therefore checked once — on the course page. Splitting the floor as
    // well would demand eight boxes from a module that has five.
    misconceptions += pageBank.filter(q => q.misconception?.trim()).length;
    if (topic.layer === 'contest') continue;
    const withMiscon = bank.filter(q => q.misconception?.trim()).length;
    // Not every question earns one — a box on an arithmetic slip is noise — but
    // a whole module without any means nobody has read the bank for wrong
    // models yet.
    if (withMiscon < 4) problems.push(`${where}: ${withMiscon} misconception box(es) in ${bank.length} questions`);
  }

  return { problems, misconceptions };
}

/**
 * Fail fast in development on the two content mistakes that are invisible at
 * runtime but corrupt progress: a duplicated id (two questions sharing one
 * progress record) and an `a` index that doesn't point at a real option.
 */
export function auditCorpus(): string[] {
  const problems: string[] = [];
  // The homepage quotes CORPUS_COUNTS without importing the banks; if a bank
  // grew and nobody updated it, the landing page is now lying about the corpus.
  const real = { mc: ALL_MC.length, frq: ALL_FRQ.length, papers: OLYMPIAD_PAPERS.length };
  for (const k of ['mc', 'frq', 'papers'] as const) {
    if (CORPUS_COUNTS[k] !== real[k]) problems.push(`CORPUS_COUNTS.${k} says ${CORPUS_COUNTS[k]}, the corpus has ${real[k]} — update src/content/counts.ts`);
  }
  // The topic cards' progress bars read their denominator from MODULE_QUIZ_SIZE
  // (the homepage cannot import the banks to count them). A stale entry there
  // shows "26/25 solved" on a card, which is worse than showing nothing.
  // A split module (plan3 Phase 6) has TWO entries — its course page and its
  // `-contest` page — and the two must add up to the bank, because between them
  // they show all of it.
  for (const [module, bank] of Object.entries(QUIZ_BANKS)) {
    const contestPage = `${module}-contest`;
    const split = contestPage in MODULE_QUIZ_SIZE;
    const stated = split ? MODULE_QUIZ_SIZE[module] + MODULE_QUIZ_SIZE[contestPage] : MODULE_QUIZ_SIZE[module];
    if (stated !== bank.length) {
      problems.push(`MODULE_QUIZ_SIZE.${module}${split ? ' + .' + contestPage : ''} says ${stated ?? 'nothing'}, the bank has ${bank.length} — update src/content/counts.ts`);
    }
    if (split && MODULE_QUIZ_SIZE[module] !== COURSE_QUIZ_SIZE) {
      problems.push(`MODULE_QUIZ_SIZE.${module} is ${MODULE_QUIZ_SIZE[module]}, but a course page runs exactly ${COURSE_QUIZ_SIZE} questions`);
    }
    // The ids the page's progress bar counts have to BE the ids its quiz shows.
    for (const [page, slice] of [[module, bank.slice(0, COURSE_QUIZ_SIZE)], [contestPage, bank.slice(COURSE_QUIZ_SIZE)]] as const) {
      const listed = split ? PAGE_QUESTION_IDS[page] : undefined;
      if (listed && listed.join() !== slice.map(q => q.id).join()) {
        problems.push(`PAGE_QUESTION_IDS.${page} is stale — run node scripts/gen-page-questions.mjs`);
      }
    }
  }
  for (const page of Object.keys(MODULE_QUIZ_SIZE)) {
    const module = page.replace(/-contest$/, '');
    if (!(module in QUIZ_BANKS)) problems.push(`MODULE_QUIZ_SIZE has "${page}", which is not a module with a quiz bank`);
  }

  const seen = new Map<string, string>();
  for (const q of ALL_MC) {
    if (!q.id) { problems.push(`MC with no id: "${q.q.slice(0, 60)}"`); continue; }
    const prev = seen.get(q.id);
    if (prev) problems.push(`duplicate id ${q.id} (also "${prev.slice(0, 40)}")`);
    else seen.set(q.id, q.q);
    if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.opts.length) {
      problems.push(`${q.id}: answer index ${q.a} is outside 0..${q.opts.length - 1}`);
    }
  }
  for (const f of ALL_FRQ) {
    if (!f.id) { problems.push(`FRQ with no id: "${f.title}"`); continue; }
    const prev = seen.get(f.id);
    if (prev) problems.push(`duplicate id ${f.id} (also "${prev.slice(0, 40)}")`);
    else seen.set(f.id, f.title);
  }
  if (BANKS.length !== Object.keys(QUIZ_BANKS).length) {
    problems.push(`BANKS lists ${BANKS.length} banks but QUIZ_BANKS has ${Object.keys(QUIZ_BANKS).length}`);
  }
  // Metadata coverage. tier/comps are derived, so a gap here means a question's
  // id doesn't match any known namespace — i.e. a bank was added without being
  // registered, and it would silently vanish from every filtered view.
  for (const q of [...ALL_MC, ...ALL_FRQ]) {
    const tier = tierOf(q);
    if (!(tier >= 1 && tier <= 4)) problems.push(`${q.id}: derived tier ${tier} out of range`);
    if (compsOf(q).length === 0) problems.push(`${q.id}: in scope for no competition`);
    if (!q.topic) problems.push(`${q.id}: no topic`);
  }
  return problems;
}

// ---- one-time progress migration -------------------------------------------

/**
 * Move progress from the old text-hash keys onto the new explicit ids.
 *
 * Progress was keyed by `qid(question text)`. Now that `quiz()` keys on
 * `q.id`, every record an existing user already has would point at an id
 * nothing looks up any more — their history would appear to vanish. So build
 * the legacy → explicit map from the current text and rewrite the stored keys
 * once.
 *
 * Runs at most once per browser (guarded by a localStorage flag) because it is
 * a rename, not something that should re-run. It is still safe if it does:
 * `remapProgressIds` leaves ids it doesn't recognise untouched, so a second
 * pass finds nothing to do.
 *
 * A question whose text changed between a user answering it and this running
 * won't match, and that record is lost — unavoidable, and precisely the defect
 * explicit ids remove going forward.
 */
export function migrateLegacyProgress(): void {
  if (!needsIdMigration()) return;
  const map: Record<string, string> = {};
  for (const q of ALL_MC) map[qid(q.q)] = q.id;
  // qbank's FRQ browser hashed title + '|' + prompt
  for (const f of ALL_FRQ) map[qid(f.title + '|' + f.prompt)] = f.id;

  const moved = remapProgressIds(map);
  markIdMigrationDone();
  if (moved > 0) console.info(`[progress] migrated ${moved} record(s) to explicit question ids`);
}

/** A question's skills, always as an array — `skill` may be one or several. */
export function skillsOf(q: Indexable | { skill?: string | readonly string[] }): string[] {
  // FRQs carry no `skill` at all, so this reads it off defensively rather than
  // narrowing the union at every call site.
  const sk = (q as { skill?: string | readonly string[] }).skill;
  return sk === undefined ? [] : typeof sk === 'string' ? [sk] : [...sk];
}

/**
 * The corpus as a machine-readable graph (plan2 §10): module → exam topic →
 * skill → question ids, plus competition → topic → tier counts.
 *
 * Everything in it is DERIVED at call time from the same indexes the app
 * queries, so it cannot drift from what a student actually sees — which is the
 * whole reason it is a function and not a checked-in JSON file. It exists so
 * the relationships can be inspected, diffed between releases, and fed to
 * whatever chooses questions next, without any of those things re-deriving
 * `tierOf`/`compsOf`/`toExamTopic` for themselves and getting them subtly
 * different.
 */
export function contentGraph(): {
  modules: Record<string, { topic: ExamTopicId | null; skills: Record<string, string[]>; untagged: string[] }>;
  byCompTopicTier: Record<Comp, Partial<Record<ExamTopicId, Record<Tier, number>>>>;
  skillCoverage: { skill: string; questions: number }[];
} {
  const modules: Record<string, { topic: ExamTopicId | null; skills: Record<string, string[]>; untagged: string[] }> = {};
  for (const q of ALL_MC) {
    const mod = q.topic && isModuleId(q.topic) ? q.topic : '(exam banks)';
    const entry = modules[mod] ??= { topic: toExamTopic(q.topic) ?? null, skills: {}, untagged: [] };
    const skills = skillsOf(q);
    if (!skills.length) entry.untagged.push(q.id);
    for (const sk of skills) (entry.skills[sk] ??= []).push(q.id);
  }

  const byCompTopicTier = {} as Record<Comp, Partial<Record<ExamTopicId, Record<Tier, number>>>>;
  for (const c of COMPS) {
    byCompTopicTier[c] = {};
    for (const q of byComp(c)) {
      const t = toExamTopic(q.topic);
      if (!t) continue;
      const row = byCompTopicTier[c][t] ??= { 1: 0, 2: 0, 3: 0, 4: 0 };
      row[tierOf(q)]++;
    }
  }

  const skillCoverage = [...BY_SKILL].map(([skill, qs]) => ({ skill, questions: qs.length }))
    .sort((a, b) => b.questions - a.questions);

  return { modules, byCompTopicTier, skillCoverage };
}

/**
 * The single next question worth answering, with the reason why (plan2 §6).
 *
 * A student on the progress page can already see weak topics, weak skills and
 * a review queue and work out what to do. This answers it for them, in one
 * click, using exactly those three signals in the order that respects effort
 * already spent:
 *
 *   1. a mistake that is DUE — spaced, so it is one they have had time to
 *      forget rather than the page they just closed;
 *   2. an untouched question in their weakest SKILL — the sharpest target the
 *      corpus can express, and the reason the skill taxonomy exists;
 *   3. an untouched question in their weakest TOPIC, for the (common) case
 *      where nothing in that topic is skill-tagged yet;
 *   4. nothing — which is a real answer, not a failure. A student with no
 *      attempts logged has no evidence to reason from, and guessing would be
 *      worse than the ordinary "browse by topic".
 *
 * Every branch carries its `reason` for the same purpose recommend.ts states:
 * advice you can disagree with beats a card that silently reorders itself.
 */
export function nextQuestion(): { id: string; reason: string } | null {
  const skillOf = (id: string): readonly string[] | undefined => {
    const q = BY_ID.get(id);
    return q ? skillsOf(q) : undefined;
  };

  const due = dueForReview();
  if (due.length) {
    return { id: due[0], reason: 'you got this wrong, and it has been long enough to be worth another go' };
  }

  // "Untouched" is about ATTEMPTS, not the solved set: a question answered
  // wrong and never revisited is not new to the student.
  const answeredIds = accuracyByQuestion();
  const unattempted = (q: Indexable): boolean => !answeredIds.has(q.id);

  const [weakSkill] = weakSkills(skillOf, 1);
  if (weakSkill) {
    const pick = bySkill(weakSkill.skill).find(unattempted);
    if (pick) {
      return {
        id: pick.id,
        reason: `${skillLabel(weakSkill.skill)} is your weakest skill (${Math.round(weakSkill.accuracy * 100)}% of ${weakSkill.seen})`,
      };
    }
  }

  const [weakTopic] = weakTopics(1);
  if (weakTopic && isExamTopicId(weakTopic.topic)) {
    const pick = byTopic(weakTopic.topic).find(unattempted);
    if (pick) {
      return {
        id: pick.id,
        reason: `${EXAM_TOPIC_LABEL[weakTopic.topic]} is your weakest topic (${Math.round(weakTopic.accuracy * 100)}% of ${weakTopic.seen})`,
      };
    }
  }
  return null;
}
