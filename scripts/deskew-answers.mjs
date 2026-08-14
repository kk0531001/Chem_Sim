// One-time codemod: flatten the answer-position distribution.
//
//   node scripts/deskew-answers.mjs           # report only
//   node scripts/deskew-answers.mjs --write   # rewrite the question files
//
// WHY. Measured across the 853 four-option MC questions, the key sat at index
// 1 in 68% of them (index 0: 9%, index 2: 21%, index 3: 2%). Per module it ran
// as high as 93% (labtech). A student who always answers B scores 68% on this
// corpus without reading a single question, which makes the score meaningless
// long before any chemistry is at fault. It is the cheapest real defect in the
// content and the only one fixable without writing chemistry.
//
// HOW. For each question, swap the correct option into a position chosen by
// hashing its permanent id. Deterministic, so re-running produces no further
// diff; a swap rather than a shuffle, so the diff is two options per question
// rather than four.
//
// SAFETY. The edit is by AST span, not regex — option strings contain commas,
// apostrophes, HTML and mhchem, and a regex over them would be a slow-motion
// disaster. And the script proves itself against git HEAD: for all 853
// questions it asserts the TEXT of the correct answer is unchanged and the set
// of options is identical. A permutation satisfying both cannot have changed
// what any question asks or answers.
//
// Not idempotent in the sense of "safe to run twice with new content" — it is
// deterministic, so running it again moves nothing that has not changed. New
// questions written after this ran will be placed by the same hash rule; see
// AUTHORING.md.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { ROOT } from './corpus.mjs';

const WRITE = process.argv.includes('--write');
const FILES = ['questions1', 'questions2', 'questions3', 'questions4', 'questions5', 'questions6', 'questions7',
  // bankPart3 holds MC embedded in its lab scenarios — 31 of them, 27 keyed to
  // index 1. Easy to miss because the file is mostly free-response.
  'bankPart1', 'bankPart3', 'bankCCO', 'bankIntegrated', 'bankOlympiad',
  'olympiadPaper1', 'olympiadPaper2', 'olympiadPaper3', 'olympiadPaper4', 'olympiadPaper5'];

/** FNV-1a — same hash the app uses in progress.ts, for no reason but familiarity. */
const hash = s => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};

let moved = 0, seen = 0;
const before = new Map();

for (const name of FILES) {
  const path = join(ROOT, 'src/tabs', `${name}.ts`);
  const src = readFileSync(path, 'utf8');
  const sf = ts.createSourceFile(path, src, ts.ScriptTarget.ES2020, true);
  const edits = [];   // { start, end, text }

  const visit = node => {
    if (ts.isObjectLiteralExpression(node)) {
      const prop = k => node.properties.find(p =>
        ts.isPropertyAssignment(p) && (p.name.getText() === k || p.name.getText() === `'${k}'`));
      const idP = prop('id'), optsP = prop('opts'), aP = prop('a');
      if (idP && optsP && aP
          && ts.isStringLiteral(idP.initializer)
          && ts.isArrayLiteralExpression(optsP.initializer)
          && ts.isNumericLiteral(aP.initializer)) {
        const id = idP.initializer.text;
        const opts = optsP.initializer.elements;
        const a = Number(aP.initializer.text);
        if (opts.length >= 2 && a >= 0 && a < opts.length) {
          seen++;
          before.set(id, { correct: opts[a].getText(), all: opts.map(o => o.getText()).sort() });
          const target = hash(id) % opts.length;
          if (target !== a) {
            moved++;
            // Swap the two elements' source spans. Trailing commas and
            // whitespace live outside each element's own span, so exchanging
            // the element text alone keeps the array's formatting intact.
            const A = opts[a], B = opts[target];
            edits.push({ start: A.getStart(sf), end: A.getEnd(), text: B.getText() });
            edits.push({ start: B.getStart(sf), end: B.getEnd(), text: A.getText() });
            edits.push({ start: aP.initializer.getStart(sf), end: aP.initializer.getEnd(), text: String(target) });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (WRITE && edits.length) {
    let out = src;
    for (const e of edits.sort((x, y) => y.start - x.start)) {
      out = out.slice(0, e.start) + e.text + out.slice(e.end);
    }
    writeFileSync(path, out);
  }
  if (edits.length) console.log(`${name}.ts: ${edits.length / 3} question(s) repositioned`);
}

console.log(`\n${moved} of ${seen} questions move.`);

if (!WRITE) { console.log('\n(report only — pass --write to apply)'); process.exit(0); }

// ---- prove it ----
//
// Against git HEAD, not against an in-memory snapshot: the snapshot would be
// taken by the same code that does the edit, so a bug shared by both would
// verify itself. HEAD is independent of anything this script believes.
//
// An earlier version of this check compared `node.getText()` (raw source, with
// its escapes: 'O\\'s') against the decoded runtime value ("O's") and threw on
// a question that was perfectly fine. Decode both sides — `StringLiteral.text`
// is the decoded value, which is what the student sees.
const { execFileSync } = await import('node:child_process');
const textOf = n => (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : n.getText();

function readQuestions(source, path) {
  const sf = ts.createSourceFile(path, source, ts.ScriptTarget.ES2020, true);
  const out = new Map();
  const visit = node => {
    if (ts.isObjectLiteralExpression(node)) {
      const prop = k => node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText().replace(/'/g, '') === k);
      const idP = prop('id'), optsP = prop('opts'), aP = prop('a');
      if (idP && optsP && aP && ts.isStringLiteral(idP.initializer)
          && ts.isArrayLiteralExpression(optsP.initializer) && ts.isNumericLiteral(aP.initializer)) {
        const opts = optsP.initializer.elements.map(textOf);
        out.set(idP.initializer.text, { opts, a: Number(aP.initializer.text) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

let checked = 0, movedSeen = 0;
for (const name of FILES) {
  const rel = `src/tabs/${name}.ts`;
  const head = readQuestions(execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64e6 }), rel);
  const now = readQuestions(readFileSync(join(ROOT, rel), 'utf8'), rel);
  for (const [id, was] of head) {
    const is = now.get(id);
    if (!is) throw new Error(`${id}: disappeared from ${rel}`);
    checked++;
    if (was.opts[was.a] !== is.opts[is.a]) {
      throw new Error(`${id}: the correct answer CHANGED\n  was: ${was.opts[was.a]}\n  now: ${is.opts[is.a]}`);
    }
    if ([...was.opts].sort().join('\u0000') !== [...is.opts].sort().join('\u0000')) {
      throw new Error(`${id}: the option SET changed`);
    }
    if (was.a !== is.a) movedSeen++;
  }
}
console.log(`Verified ${checked} questions against HEAD: ${movedSeen} moved position, ` +
  `every one keeping the same correct answer and the same option set.`);
