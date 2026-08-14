// Answer key vs explanation, for PROSE options.
//
//   node scripts/check-keys.mjs          # the flagged list
//   node scripts/check-keys.mjs --all    # every question with its scores
//
// audit-content.mjs check 7 already covers the numeric case (a `why` that
// computes some option's value but not the keyed one — the per-009 bug). That
// rule is deliberately narrow: it only fires when every option is a bare
// number, about 160 of 853 MC. This covers the other ~690.
//
// THE SIGNAL. A `why` explains why the KEY is right, so it should echo the
// key's own words more than any distractor's. When a distractor out-echoes the
// key, one of two things is true: the key index is wrong, or the `why` is
// arguing for the wrong option. Both are the same defect to a student.
//
// It is a ranking, not a verdict — a `why` can legitimately spend its words on
// the trap it is warning against ("NOT 1-butene, which would be…"). So this
// prints a worklist and exits 0; audit-content.mjs stays the gate.
import { ALL_MC } from './corpus.mjs';

const strip = s => String(s).replace(/<\/?[a-z][^>]*>/gi, ' ').replace(/\s+/g, ' ').trim();

// Grammar words carry no evidence about which option a sentence is defending.
const STOP = new Set(('the a an of in to is are and or by with for from as at it its that this than then so'
  + ' be been was were will would can could may might not no only always never all both each every'
  + ' more most less least same different other another which what when where why how but if because'
  + ' has have had does do did they them their there here into onto over under out up down about'
  + ' one two three both also just still even much many any some none such per via').split(' '));

const words = s => new Set(strip(s).toLowerCase()
  .replace(/[^a-z0-9₀-₉⁰-⁹\s-]/g, ' ').split(/\s+/)
  .filter(w => w.length > 3 && !STOP.has(w)));

const rows = [];
for (const q of ALL_MC) {
  if (!q.why || !Array.isArray(q.opts)) continue;
  // Numeric-option questions belong to audit-content.mjs check 7, not here.
  if (q.opts.every(o => /^[^a-z]*$/i.test(strip(o)))) continue;

  const why = words(q.why);
  const score = o => [...words(o)].filter(w => why.has(w)).length;
  const key = score(q.opts[q.a]);
  const best = q.opts.map((o, i) => ({ i, o: strip(o), s: score(o) }))
    .filter(x => x.i !== q.a).sort((a, b) => b.s - a.s)[0];
  if (!best) continue;

  // A distractor beating the key by 2+ content words is the pattern. One word
  // ahead is noise: options differ in length and the margin means nothing.
  if (best.s - key >= 2) {
    rows.push({ id: q.id, q: strip(q.q), key: strip(q.opts[q.a]), keyScore: key,
      rival: best.o, rivalScore: best.s });
  }
}

rows.sort((a, b) => (b.rivalScore - b.keyScore) - (a.rivalScore - a.keyScore));

console.log(`${rows.length} of ${ALL_MC.length} MC questions: a distractor echoes the explanation`);
console.log('more than the keyed answer does. Read each one — is `a` pointing at the right option?\n');
for (const r of rows) {
  console.log(`${r.id}  (+${r.rivalScore - r.keyScore})  ${r.q.slice(0, 70)}`);
  console.log(`    key[${r.keyScore}]:   ${r.key.slice(0, 70)}`);
  console.log(`    rival[${r.rivalScore}]: ${r.rival.slice(0, 70)}\n`);
}
