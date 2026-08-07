// Phase D.9 content gate: the mistakes that are invisible until a student hits
// them in the browser. Unlike audit-corpus.mjs (a report to triage by hand),
// this one EXITS NON-ZERO — run it before shipping content.
//
//   node scripts/audit-content.mjs
//
// Not checked here, deliberately:
//   - same fact asked twice in different words. C.4 established that a token
//     metric cannot see it (audit-corpus.mjs has the Jaccard version); the real
//     fix is a per-question fact tag, which is content work, not a script.
//   - units and significant figures on numeric answers. Not mechanically
//     decidable from an option string, and a regex version flags hundreds of
//     correct answers. Stays a human pass.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
import 'katex/contrib/mhchem';
import { ALL_MC, ALL_FRQ, OLYMPIAD_PAPERS, ROOT } from './corpus.mjs';

const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

// ---- 1. structural: fields a question cannot work without ----
const seen = new Map();
for (const q of ALL_MC) {
  const where = q.id || `(no id) "${q.q.slice(0, 50)}"`;
  if (!q.id) fail(where, 'no id');
  else if (seen.has(q.id)) fail(where, `duplicate id (also "${seen.get(q.id).slice(0, 40)}")`);
  else seen.set(q.id, q.q);
  if (!q.q?.trim()) fail(where, 'empty question text');
  if (!Array.isArray(q.opts) || q.opts.length < 2) fail(where, 'fewer than two options');
  else if (q.opts.some(o => !o?.toString().trim())) fail(where, 'an empty option');
  if (!Number.isInteger(q.a) || q.a < 0 || q.a >= (q.opts?.length ?? 0)) {
    fail(where, `answer index ${q.a} outside 0..${(q.opts?.length ?? 0) - 1}`);
  }
  if (!q.why?.trim()) fail(where, 'no `why` — the explanation is the point of the question');
}
for (const f of ALL_FRQ) {
  const where = f.id || `(no id) "${f.title}"`;
  if (!f.id) fail(where, 'no id');
  else if (seen.has(f.id)) fail(where, 'duplicate id');
  else seen.set(f.id, f.title ?? '');
  if (!f.title?.trim()) fail(where, 'no title');
  if (!f.prompt?.trim()) fail(where, 'no prompt');
  if (!f.parts?.length) fail(where, 'no sub-parts');
  f.parts?.forEach((p, i) => {
    if (!p.q?.trim()) fail(where, `part ${i + 1} has no question`);
    if (!p.a?.trim()) fail(where, `part ${i + 1} has no worked answer`);
  });
}

// ---- 2. KaTeX / mhchem parse failures ----
// framework.ts renders with throwOnError:false, so a malformed formula ships as
// red text nobody notices. Here it throws, which is the whole point.
const DELIMS = [
  [/\\\[([\s\S]*?)\\\]/g, true],
  [/\$\$([\s\S]*?)\$\$/g, true],
  [/\\\(([\s\S]*?)\\\)/g, false],
];
function checkMath(where, field, html) {
  if (typeof html !== 'string') return;
  for (const [re, display] of DELIMS) {
    for (const m of html.matchAll(re)) {
      try {
        katex.renderToString(m[1], { throwOnError: true, displayMode: display });
      } catch (err) {
        fail(where, `KaTeX error in ${field}: ${String(err.message).split('\n')[0]}`);
      }
    }
  }
}
for (const q of ALL_MC) {
  checkMath(q.id, 'q', q.q);
  q.opts?.forEach((o, i) => checkMath(q.id, `opts[${i}]`, o));
  checkMath(q.id, 'why', q.why);
  checkMath(q.id, 'misconception', q.misconception);
}
for (const f of ALL_FRQ) {
  checkMath(f.id, 'prompt', f.prompt);
  f.parts?.forEach((p, i) => { checkMath(f.id, `part ${i + 1} q`, p.q); checkMath(f.id, `part ${i + 1} a`, p.a); });
}

// ---- 3. tables that will overflow their card ----
// A wide <table> inside a question card pushes the page sideways on mobile
// unless it sits in .table-scroll (style.css).
function checkTables(where, field, html) {
  if (typeof html !== 'string' || !html.includes('<table')) return;
  // ponytail: substring test, not a DOM parse — every table in the corpus is
  // written as one flat string with its wrapper adjacent. Parse with a real
  // HTML parser if tables ever get built up across concatenated fragments.
  for (const m of html.matchAll(/<table/g)) {
    const before = html.slice(0, m.index);
    const open = (before.match(/class="table-scroll"/g) ?? []).length;
    const closed = (before.match(/<\/table>/g) ?? []).length;
    if (open <= closed) fail(where, `<table> in ${field} is not wrapped in .table-scroll`);
  }
}
for (const q of ALL_MC) { checkTables(q.id, 'q', q.q); checkTables(q.id, 'why', q.why); }
for (const f of ALL_FRQ) {
  checkTables(f.id, 'prompt', f.prompt);
  f.parts?.forEach((p, i) => { checkTables(f.id, `part ${i + 1} q`, p.q); checkTables(f.id, `part ${i + 1} a`, p.a); });
}

// ---- 4. missions without hints ----
// Missions live in the tab modules, which import pixi/DOM and can't be loaded
// here, so this reads the source text. ponytail: a mission's fields are always
// written between its own `id:` and the next one — no parse needed.
const TABS = join(ROOT, 'src/tabs');
for (const file of readdirSync(TABS).filter(f => f.endsWith('.ts'))) {
  const src = readFileSync(join(TABS, file), 'utf8');
  const chunks = src.split(/id: '(msn-[a-z0-9-]+)'/);
  for (let i = 1; i < chunks.length; i += 2) {
    const [id, body] = [chunks[i], chunks[i + 1] ?? ''];
    if (!/\bhints:\s*\[/.test(body)) fail(id, `mission in ${file} has no hints`);
    if (!/\bprompt:/.test(body)) fail(id, `mission in ${file} has no prompt`);
  }
}

// ---- 5. the homepage's stated corpus counts ----
// src/content/counts.ts is stated, not derived, so the landing page can quote
// it without importing every bank (D.10). That trade is only safe if something
// checks it.
const countsSrc = readFileSync(join(ROOT, 'src/content/counts.ts'), 'utf8');
const stated = Object.fromEntries(
  [...countsSrc.matchAll(/(mc|frq|papers):\s*(\d+)/g)].map(m => [m[1], Number(m[2])]),
);
const realCounts = { mc: ALL_MC.length, frq: ALL_FRQ.length, papers: OLYMPIAD_PAPERS.length };
for (const k of ['mc', 'frq', 'papers']) {
  if (stated[k] !== realCounts[k]) {
    fail('src/content/counts.ts', `CORPUS_COUNTS.${k} says ${stated[k]}, the corpus has ${realCounts[k]}`);
  }
}

// ---- 6. canvas contrast on the dark instrument panels ----
// Every canvas in the app sits on the dark panel, and the colours are written
// inline in each tab rather than as CSS variables, so nothing in a stylesheet
// audit sees them. Text needs 4.5:1, meaningful graphics 3:1 (WCAG AA).
// Only `fillStyle` can produce text — `fillText` paints with the fill colour —
// so a `strokeStyle` is always a line and always judged at 3:1.
const PANEL_BG = '#0e131c';
// Colours that ARE the background: the plot's gridlines and the orbital plot's
// own backdrop. A contrast rule on a background against itself is nonsense.
const BACKDROP = new Set(['#161d2b', '#0b0e14']);
const luminance = hex => {
  const ch = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
for (const file of readdirSync(TABS).filter(f => f.endsWith('.ts'))) {
  const lines = readFileSync(join(TABS, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    const m = /(fillStyle|strokeStyle)\s*=\s*.(#[0-9a-fA-F]{6})/.exec(line);
    if (!m || BACKDROP.has(m[2].toLowerCase())) return;
    const isText = m[1] === 'fillStyle' && lines.slice(i, i + 4).some(l => /fillText/.test(l));
    const need = isText ? 4.5 : 3;
    const r = contrast(m[2].toLowerCase(), PANEL_BG);
    if (r < need) fail(`${file}:${i + 1}`, `${m[2]} is ${r.toFixed(2)}:1 on the panel, ${isText ? 'canvas text' : 'a graphic'} needs ${need}:1`);
  });
}

// ---- report ----
console.log(`Checked ${ALL_MC.length} MC + ${ALL_FRQ.length} written problems.`);
if (!problems.length) {
  console.log('Content audit clean.');
  process.exit(0);
}
console.error(`\n${problems.length} problem(s):`);
for (const p of problems) console.error('  ' + p);
process.exit(1);
