// The Bronze floor and the Core band (plan3 3.1 and Phase 6.3): every module a
// beginner is sent to first must open with ten tier-1 questions, and the next
// ten must be the Core band the course page's second stage runs.
//
// Exists because nothing else fails when either breaks. `auditCorpus()` checks
// counts and ids, `auditTopicPages()` checks bank SIZE, and a bank can satisfy
// both while holding five Bronze questions and twenty exam-style ones — which
// is exactly the state plan3 was written to fix. Being an ORDER rather than a
// presence, it is invisible to the type system too.
//
// The Bronze rule is `tierOf()` in src/content/registry.ts: an explicit
// `tier: 1` wins, and failing that the first five of a bank are warm-ups. That
// is mirrored here rather than imported, because registry.ts pulls topics.ts,
// progress.ts and the whole app graph to answer a question about two fields.
//
// Positions 11–20 must carry an EXPLICIT `tier: 2`. Derived is not enough: a
// course page's module now carries difficulty ['HS'], whose derived tier is
// already 2, so an untagged contest question would pass by accident.
import { QUIZ_BANKS } from './corpus.mjs';

/** The nine high-school modules split into a course page and a contest page. */
const MODULES = ['stoich', 'quantum', 'periodicity', 'bonding', 'thermo1',
  'equilibrium', 'aek', 'labdata', 'labtech'];

const FLOOR = 10;
const CORE_END = 20;
const WARMUPS = 5;
const isBronze = (q, i) => q.tier === 1 || (q.tier === undefined && i < WARMUPS);

// docs/STYLE.md rule 4: contest vocabulary is banned from Basics-register text,
// which is everything the course page shows. Acronyms are matched case- and
// word-sensitively — "account", "accommodate" and "according" all contain
// "cco".
const BANNED = [
  /\bolympiad\b/i, /\bmarks\b/i, /\btrap\b/i, /\bclassic\b/i,
  /\bhigh-yield\b/i, /\bexam\b/i, /\bPS4\b/,
  /\bCCC\b/, /\bCCO\b/, /\bUSNCO\b/, /\bIChO\b/,
];
const textOf = q => [q.q, ...(q.opts ?? []), q.why ?? '', q.why2 ?? '', q.misconception ?? ''].join(' | ');

const problems = [];
for (const m of MODULES) {
  const bank = QUIZ_BANKS[m];
  if (!bank) { problems.push(`${m}: no quiz bank`); continue; }

  const bronze = bank.filter(isBronze);
  if (bronze.length < FLOOR) {
    problems.push(`${m}: ${bronze.length} Bronze question(s), the floor is ${FLOOR}`);
  }
  // A Bronze run that is not at the FRONT of the bank is not a Basics stage:
  // the course page shows the first ten as stage one, whatever their tier.
  const head = bank.slice(0, FLOOR).filter(isBronze).length;
  if (head < FLOOR) {
    problems.push(`${m}: only ${head} of the first ${FLOOR} questions are Bronze — ` +
      'the Basics stage of the course page would contain an exam-style question');
  }

  const core = bank.slice(FLOOR, CORE_END);
  if (core.length < CORE_END - FLOOR) {
    problems.push(`${m}: only ${core.length} questions after the Bronze ten; the Core band needs ${CORE_END - FLOOR}`);
  }
  const notTwo = core.filter(q => q.tier !== 2).map(q => q.id);
  if (notTwo.length) {
    problems.push(`${m}: positions ${FLOOR + 1}-${CORE_END} must carry an explicit tier: 2 — ${notTwo.join(', ')}`);
  }

  const dirty = bank.slice(0, CORE_END)
    .filter(q => BANNED.some(re => re.test(textOf(q))))
    .map(q => `${q.id} (${BANNED.filter(re => re.test(textOf(q))).map(re => String(re)).join(' ')})`);
  if (dirty.length) {
    problems.push(`${m}: contest vocabulary inside positions 1-${CORE_END} — ${dirty.join('; ')}`);
  }

  console.log(`  ${m.padEnd(12)} ${String(bronze.length).padStart(2)} Bronze, ` +
    `${core.filter(q => q.tier === 2).length} Core, of ${bank.length}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`\nBronze floor clean: all ${MODULES.length} modules open with ${FLOOR} tier-1 then ${CORE_END - FLOOR} tier-2 questions.`);
