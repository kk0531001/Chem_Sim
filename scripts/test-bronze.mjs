// The Bronze floor (plan3 3.1): every module a beginner is sent to first must
// open with at least ten tier-1 questions.
//
// Exists because nothing else fails when that floor breaks. `auditCorpus()`
// checks counts and ids, `auditTopicPages()` checks bank SIZE, and a bank can
// satisfy both while holding five Bronze questions and twenty exam-style ones
// — which is exactly the state plan3 was written to fix. Being a count rather
// than a presence, it is invisible to the type system too.
//
// The Bronze rule is `tierOf()` in src/content/registry.ts: an explicit
// `tier: 1` wins, and failing that the first five of a bank are warm-ups. That
// is mirrored here rather than imported, because registry.ts pulls topics.ts,
// progress.ts and the whole app graph to answer a question about two fields.
import { QUIZ_BANKS } from './corpus.mjs';

/** Modules the "Start here" run sends a beginner through, plus lab technique. */
const FLOOR = 10;
const MODULES = ['stoich', 'quantum', 'periodicity', 'bonding', 'thermo1', 'equilibrium', 'labdata', 'labtech'];

const WARMUPS = 5;
const isBronze = (q, i) => q.tier === 1 || (q.tier === undefined && i < WARMUPS);

const problems = [];
for (const m of MODULES) {
  const bank = QUIZ_BANKS[m];
  if (!bank) { problems.push(`${m}: no quiz bank`); continue; }
  const bronze = bank.filter(isBronze);
  if (bronze.length < FLOOR) {
    problems.push(`${m}: ${bronze.length} Bronze question(s), the floor is ${FLOOR}`);
  }
  // A Bronze run that is not at the FRONT of the bank is not a Basics stage:
  // quiz(BANK, 10) shows the first ten, whatever their tier.
  const head = bank.slice(0, FLOOR).filter(isBronze).length;
  if (head < FLOOR) {
    problems.push(`${m}: only ${head} of the first ${FLOOR} questions are Bronze — ` +
      'quiz(BANK, 10) would put an exam-style question inside the Basics stage');
  }
  console.log(`  ${m.padEnd(12)} ${String(bronze.length).padStart(2)} Bronze of ${bank.length}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`\nBronze floor clean: all ${MODULES.length} modules open with ${FLOOR}+ tier-1 questions.`);
