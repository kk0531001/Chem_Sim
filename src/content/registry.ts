// One flat, indexed view of every question in the app.
//
// This exists for two reasons. The immediate one is the id migration below:
// progress used to be keyed by a hash of question text, and moving to explicit
// ids requires knowing BOTH keys for every question at once, which means
// somewhere has to enumerate the whole corpus. The lasting one is that search,
// topic filtering, tiering and the challenge ladder (ROADMAP phases C and E)
// are all queries over exactly this list.
//
// Importing every bank here is deliberate and costs nothing today: the build
// already emits a single chunk containing all of them.
import { qid, remapProgressIds } from '../progress';
import type { QuizQ } from '../tabs/framework';
import type { FRQ } from '../tabs/bankPart2';
import { BANKS, type QuizModuleId } from './topicIds';

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

export const CORPUS_COUNTS = { mc: ALL_MC.length, frq: ALL_FRQ.length };

/**
 * Fail fast in development on the two content mistakes that are invisible at
 * runtime but corrupt progress: a duplicated id (two questions sharing one
 * progress record) and an `a` index that doesn't point at a real option.
 */
export function auditCorpus(): string[] {
  const problems: string[] = [];
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
  return problems;
}

// ---- one-time progress migration -------------------------------------------

const MIGRATED_KEY = 'chemprep_idmigration_v1';

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
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return;
  } catch {
    return; // storage unavailable — nothing persisted to migrate
  }
  const map: Record<string, string> = {};
  for (const q of ALL_MC) map[qid(q.q)] = q.id;
  // qbank's FRQ browser hashed title + '|' + prompt
  for (const f of ALL_FRQ) map[qid(f.title + '|' + f.prompt)] = f.id;

  const moved = remapProgressIds(map);
  try { localStorage.setItem(MIGRATED_KEY, new Date().toISOString()); } catch { /* ignore */ }
  if (moved > 0) console.info(`[progress] migrated ${moved} record(s) to explicit question ids`);
}
