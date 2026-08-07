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
export const CORPUS_COUNTS = { mc: 853, frq: 119, papers: 5 };

/**
 * How many questions each module's quiz bank holds — the denominator of the
 * progress bar on every topic card (ROADMAP E.3).
 *
 * Here for the same reason as the counts above: topic cards render on the
 * homepage and the menu, neither of which may import the question banks. Five
 * banks are larger than the 25 the page contract asks for, so this cannot be a
 * constant — `auditTopicPages` only rejects banks that are too SMALL.
 *
 * Keyed by module id, matching ID_PREFIX in topicIds.ts. Untyped on purpose:
 * a `Record<QuizModuleId, number>` would pull topicIds into the entry chunk to
 * buy a check that `auditCorpus()` already performs against the real banks.
 */
export const MODULE_QUIZ_SIZE: Record<string, number> = {
  quantum: 25, periodicity: 25, bonding: 25, stoich: 25,
  thermo1: 25, thermo2: 25, gases: 25, equilibrium: 25, aek: 25,
  physchem: 27, biophys: 25,
  organic1: 25, organic2: 25, organic3: 26, polymers: 25,
  nuclear: 25, coordchem: 26, advinorganic: 25,
  labdata: 25, labtech: 29, analytical: 25,
  spectroscopy: 25, structure: 29,
};
