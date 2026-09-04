/**
 * The corpus in numbers, stated rather than derived — and this is the one place
 * in the project where that is the right trade.
 *
 * The homepage quotes these three figures in its lede and stat strip. Deriving
 * them from `registry.ts` (which is what it used to do) meant the landing page
 * statically imported every question bank: 1.16 MB of entry chunk so a visitor
 * who never opened a lesson could be told there are 853 questions in it.
 *
 * Staleness is what a stated number risks, so it is checked in two places
 * against the real arrays: `auditCorpus()` in dev, and `npm run audit` before
 * shipping. Update these when a bank grows; the audit will tell you if you
 * forget.
 */
export const CORPUS_COUNTS = { mc: 960, frq: 128, papers: 5 };

/**
 * How many questions each PAGE's quiz holds — the denominator of the progress
 * bar on every topic card (ROADMAP E.3).
 *
 * Here for the same reason as the counts above: topic cards render on the
 * homepage and the menu, neither of which may import the question banks. Five
 * banks are larger than the 25 the page contract asks for, so this cannot be a
 * constant — `auditTopicPages` only rejects banks that are too SMALL.
 *
 * Keyed by PAGE id, matching ID_PREFIX in topicIds.ts for the unsplit modules.
 * The nine split modules (plan3 Phase 6) have two entries each: the course page
 * runs the first 20 of the bank and the `-contest` page the rest, so the two
 * add up to the bank length — which is what `auditCorpus()` checks.
 *
 * Untyped on purpose: a `Record<QuizModuleId, number>` would pull topicIds into
 * the entry chunk to buy a check that `auditCorpus()` already performs against
 * the real banks — and the `-contest` page ids are deliberately not ModuleIds.
 */
export const MODULE_QUIZ_SIZE: Record<string, number> = {
  // Split modules: course page (20) + contest page (the rest of the bank).
  quantum: 20, 'quantum-contest': 18,
  periodicity: 20, 'periodicity-contest': 10,
  bonding: 20, 'bonding-contest': 26,
  stoich: 20, 'stoich-contest': 13,
  thermo1: 20, 'thermo1-contest': 10,
  equilibrium: 20, 'equilibrium-contest': 10,
  aek: 20, 'aek-contest': 24,
  labdata: 20, 'labdata-contest': 10,
  labtech: 20, 'labtech-contest': 15,
  // One page, one bank.
  thermo2: 25, gases: 35,
  physchem: 27, biophys: 25,
  organic1: 30, organic2: 30, organic3: 26, polymers: 25,
  nuclear: 25, coordchem: 26, advinorganic: 25,
  analytical: 25,
  spectroscopy: 25, structure: 29,
};

/**
 * How many of a SPLIT module's bank belong to its course page (plan3 Phase 6):
 * positions 1–10 Basics, 11–20 Core, 21+ the contest page.
 *
 * Here rather than next to `pageQuiz()` in tabs/ui/quiz.ts because
 * `auditCorpus()` checks the split and must not import the quiz widget to do
 * it. scripts/gen-page-questions.mjs mirrors the number; the audit catches
 * drift.
 */
export const COURSE_QUIZ_SIZE = 20;
