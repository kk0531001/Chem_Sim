// Emit full question context for a set of ids, as a self-contained dossier a
// reviewer can judge without the repo.
//
//   node scripts/q4-dossier.mjs og3-016 coo-023 ...
//   node scripts/q4-dossier.mjs --risk 4      # every id review-q4 flags at >= N
//
// Includes the CURRENT options, which is what a student sees, plus the
// baseline text so a reviewer can see what changed and judge the change rather
// than the question in the abstract.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.Q4_BASE || 'f6c84af';
const FILES = ['questions1', 'questions2', 'questions3', 'questions4', 'questions5', 'questions6', 'questions7',
  'bankPart1', 'bankPart3', 'bankCCO', 'bankIntegrated', 'bankOlympiad',
  'olympiadPaper1', 'olympiadPaper2', 'olympiadPaper3', 'olympiadPaper4', 'olympiadPaper5'];

const txt = n => (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : n.getText();
const strip = s => String(s).replace(/<\/?(?:b|i|em|strong|sub|sup|span|br|small|code|u)\b[^>]*>/gi, '')
  .replace(/<span class="trap">/g, '').replace(/\s+/g, ' ').trim();

function read(src, path) {
  const sf = ts.createSourceFile(path, src, ts.ScriptTarget.ES2020, true);
  const out = new Map();
  const visit = n => {
    if (ts.isObjectLiteralExpression(n)) {
      const p = k => n.properties.find(x => ts.isPropertyAssignment(x) && x.name.getText().replace(/'/g, '') === k);
      const id = p('id'), o = p('opts'), a = p('a'), w = p('why'), q = p('q'), m = p('misconception');
      if (id && o && a && ts.isStringLiteral(id.initializer)
          && ts.isArrayLiteralExpression(o.initializer) && ts.isNumericLiteral(a.initializer)) {
        out.set(id.initializer.text, {
          opts: o.initializer.elements.map(txt), a: Number(a.initializer.text),
          why: w ? txt(w.initializer) : '', q: q ? txt(q.initializer) : '',
          misconception: m ? txt(m.initializer) : '',
        });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

const riskArg = process.argv.indexOf('--risk');
let wanted = process.argv.slice(2).filter(a => !a.startsWith('--') && !/^\d+$/.test(a));
if (riskArg > -1) {
  const min = Number(process.argv[riskArg + 1] || 4);
  const flagged = JSON.parse(execFileSync('node', [join(ROOT, 'scripts/review-q4.mjs'), '--json'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64e6 }));
  wanted = [...new Set(flagged.filter(r => r.risk >= min).map(r => r.id))];
}
const want = new Set(wanted);

const now = new Map(), base = new Map();
for (const f of FILES) {
  const rel = `src/tabs/${f}.ts`;
  for (const [id, v] of read(readFileSync(join(ROOT, rel), 'utf8'), rel)) now.set(id, { ...v, file: f });
  try {
    const b = read(execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64e6 }), rel);
    for (const [id, v] of b) base.set(id, v);
  } catch { /* file may not exist at baseline */ }
}

let i = 0;
for (const id of wanted) {
  const n = now.get(id);
  if (!n) { console.log(`\n### ${id} — NOT FOUND\n`); continue; }
  const b = base.get(id);
  console.log(`\n---\n\n### ${++i}. ${id}   (${n.file}.ts)\n`);
  console.log(`**Question.** ${strip(n.q)}\n`);
  console.log('**Options as they ship now:**\n');
  n.opts.forEach((o, k) => {
    const isKey = k === n.a;
    const isNew = b && !b.opts.includes(o);
    console.log(`  ${k}. ${strip(o)}${isKey ? '   <-- KEYED AS CORRECT' : ''}${isNew ? '   [REWRITTEN THIS SESSION]' : ''}`);
  });
  if (b) {
    const changed = n.opts.filter(o => !b.opts.includes(o));
    if (changed.length) {
      console.log('\n**Previously, those options read:**\n');
      b.opts.forEach(o => { if (!n.opts.includes(o)) console.log(`  - ${strip(o)}`); });
    }
  }
  console.log(`\n**Stated explanation (\`why\`).** ${strip(n.why)}\n`);
  if (n.misconception) console.log(`**Stated misconception note.** ${strip(n.misconception)}\n`);
}
console.log(`\n---\n\n${i} question(s).`);
