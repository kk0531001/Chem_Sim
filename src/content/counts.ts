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
