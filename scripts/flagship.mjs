// Candidate list for the "ChemSim 200-300" — the curated flagship set.
//
//   node scripts/flagship.mjs               # the shortlist + coverage
//   node scripts/flagship.mjs --ids         # just the ids, for curating
//   node scripts/flagship.mjs --gaps        # topics/skills the set underserves
//
// This SCORES, it does not decide. The brief is "questions that collectively
// demonstrate the platform at its best", and half of that — whether an
// explanation actually teaches, whether a distractor is tempting rather than
// merely wrong — is a judgement no script makes. What a script can do is narrow
// 853 to a few hundred defensible candidates and show what the set is missing,
// so the human pass is curation rather than a blank page.
//
// Deliberately NOT a `flagship: true` field on the questions. The content model
// is frozen; a selection is a view over it, and a view that lives in a script
// can be re-derived when the corpus changes instead of going stale in 300
// places.
//
// KNOWN CIRCULARITY, and it matters when reading the ranking. Two of the
// heaviest terms — `tier` and `misconception` — were set by earlier passes over
// this same corpus, and misconceptions were written for the Gold set
// specifically. So the shortlist is 129 Gold + 31, and the score is largely
// re-reading a judgement already made rather than testing it independently.
//
// Scoring on the terms that were NOT set by those passes (worked arithmetic,
// explanation length, why2, absence of a length tell) gives 46 questions, of
// which only 57% are Gold — so about twenty non-Gold questions carry the marks
// of a good flagship item and were never tiered as such. Those are worth a
// human look before the ranking below is trusted: qua-013, th2-015, phy-012,
// qua-018, equ-006, spe-021, ain-025, bio-020, bio-025, per-006 among them.
//
// The honest use of this file is therefore the --gaps view, not the ordering.
import { ALL_MC, ALL_FRQ } from './corpus.mjs';

const plain = s => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const NUM = /\d/;

// Warm-ups are the first five of each quiz bank; tierOf calls them Bronze.
const isWarmup = id => /-(00[1-5])$/.test(id) && !/^(p1|p3|mock|int|cco)/.test(id);

function score(q) {
  const why = plain(q.why);
  const opts = (q.opts ?? []).map(plain);
  const reasons = [];
  let s = 0;

  // multi-step reasoning — the tier was set by a full corpus re-read
  if (q.tier === 3) { s += 4; reasons.push('Gold'); }
  if (q.tier === 4) { s += 5; reasons.push('Platinum'); }

  // the explanation layer: a misconception names the wrong MODEL behind a
  // specific distractor, which is the thing a drill question does not have
  if (q.misconception) { s += 3; reasons.push('misconception'); }
  if (q.why2) { s += 2; reasons.push('why2'); }

  // meaningful calculation — arithmetic carried through the explanation
  if (NUM.test(why) && why.length > 90) { s += 2; reasons.push('worked calc'); }

  // conceptual discrimination: options of comparable weight, so the answer
  // cannot be picked off by shape. Length-clueing is the measurable half.
  if (opts.length >= 4) {
    const len = opts.map(o => o.length);
    const key = len[q.a];
    const spread = Math.max(...len) - Math.min(...len);
    if (key !== Math.max(...len) && spread < 40) { s += 2; reasons.push('no length tell'); }
  }

  // an explanation with something to teach beyond the answer
  if (why.length > 140) { s += 1; reasons.push('substantial why'); }

  // skill-tagged: it can carry mastery reporting, which is the platform's point
  if (q.skill) { s += 1; reasons.push('skill-tagged'); }

  if (isWarmup(q.id)) { s -= 6; reasons.push('warm-up'); }
  return { s, reasons };
}

const scored = ALL_MC.map(q => ({ q, ...score(q) })).sort((a, b) => b.s - a.s);
const frq = ALL_FRQ.map(f => ({ f, parts: f.parts?.length ?? 0 }));

const CUT = 8;
const shortlist = scored.filter(x => x.s >= CUT);

// Group by the COARSE exam topic, not the raw `topic` string. Raw mixes two
// vocabularies — `organic1` is a module id, `organic` is an ExamTopicId — and
// reading the two in one column invents gaps that are not there: `organic 1/25`
// looked like "organic chemistry is unrepresented" when it meant "bankPart1's
// ten organic questions are mostly not flagship-grade", which is expected of
// exam-paced Part I MC. Organic is in fact 39/190 across the whole corpus.
//
// The collapse is the same one the attempt log and the registry already use, so
// this cannot disagree with the rest of the app about what a topic is.
const EXAM_OF = {
  quantum: 'atomic', periodicity: 'atomic', bonding: 'bonding',
  stoich: 'stoich', thermo1: 'thermo', thermo2: 'thermo', physchem: 'thermo',
  gases: 'states', equilibrium: 'equilibrium', aek: 'acids', biophys: 'kinetics',
  nuclear: 'descriptive', coordchem: 'descriptive', advinorganic: 'descriptive',
  organic1: 'organic', organic2: 'organic', organic3: 'organic', polymers: 'organic',
  labdata: 'lab', labtech: 'lab', analytical: 'lab', spectroscopy: 'lab', structure: 'lab',
};
const examTopicOf = q => EXAM_OF[q.topic] ?? q.topic ?? '?';
const bucket = (arr, key) => arr.reduce((m, x) => (m[key(x)] = (m[key(x)] ?? 0) + 1, m), {});

if (process.argv.includes('--ids')) {
  console.log(shortlist.map(x => x.q.id).join('\n'));
} else if (process.argv.includes('--gaps')) {
  const have = bucket(shortlist, x => examTopicOf(x.q));
  const all = bucket(ALL_MC, q => examTopicOf(q));
  console.log('exam topic          shortlist / corpus');
  for (const [t, n] of Object.entries(all).sort((a, b) => (have[b[0]] ?? 0) - (have[a[0]] ?? 0))) {
    const h = have[t] ?? 0;
    console.log(`  ${t.padEnd(18)} ${String(h).padStart(3)} / ${String(n).padStart(3)}` + (h === 0 ? '   <- NOTHING' : h < 5 ? '   <- thin' : ''));
  }
  const skills = new Set(shortlist.flatMap(x => typeof x.q.skill === 'string' ? [x.q.skill] : (x.q.skill ?? [])));
  console.log(`\nskills represented: ${skills.size} of 81`);
} else {
  console.log(`${shortlist.length} MC candidates at score >= ${CUT}, from ${ALL_MC.length}`);
  console.log(`plus ${frq.length} written problems (every one is multi-part by construction)\n`);
  const byTier = bucket(shortlist, x => `tier ${x.q.tier ?? 2}`);
  console.log('tier spine:', byTier);
  console.log('\ntop 25 by score:\n');
  for (const x of shortlist.slice(0, 25)) {
    console.log(`  [${x.s}] ${x.q.id.padEnd(18)} ${plain(x.q.q).slice(0, 58)}`);
    console.log(`       ${x.reasons.join(' · ')}`);
  }
  console.log(`\nRun with --gaps to see what the set underserves, --ids to curate.`);
}
