#!/usr/bin/env node
// backfill-ids.mjs — Roadmap Phase A codemod.
//
// Adds a stable, explicit `id` (and, for the per-module quiz banks, a `topic`)
// as the FIRST field of every question object literal in the content files.
//
//   node scripts/backfill-ids.mjs            # dry run (default) — changes nothing
//   node scripts/backfill-ids.mjs --write    # actually rewrite the files
//   node scripts/backfill-ids.mjs --verbose  # print every generated id
//
// Design rules, in priority order:
//
//  1. AN ID, ONCE WRITTEN, IS NEVER CHANGED. If a question object already has a
//     top-level `id`, the script leaves it completely alone. That makes the run
//     idempotent, and it is the whole point of the exercise: progress records
//     are keyed by these ids.
//  2. Surgical text insertion, never parse-and-reprint. Output is byte-identical
//     to the input apart from the inserted `id:`/`topic:` fields, so the dense
//     hand-authored formatting, alignment and comments all survive.
//  3. Fail loudly. Anything the script cannot account for (an unexpected token,
//     a missing `topic`, an unknown exam topic, a template literal it cannot
//     brace-match) throws instead of guessing.
//  4. Only DIRECT elements of a known array are treated as questions. This is
//     how nested `parts: [{ q, a }]` sub-parts are excluded structurally rather
//     than by pattern-matching — a naive `{ q:` regex would hit all 212 of them.
//
// The bank tables are read out of src/content/topicIds.ts so there is one
// source of truth; this script cannot import TypeScript, so it parses that
// file's fixed-shape tables as text (see the EXTRACTION CONTRACT comments there).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOPIC_IDS_TS = join(ROOT, 'src/content/topicIds.ts');

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const VERBOSE = argv.includes('--verbose');
for (const a of argv) {
  if (!['--write', '--verbose'].includes(a)) fail(`unknown flag: ${a}`);
}

function fail(msg) {
  console.error(`\n  backfill-ids: ${msg}\n`);
  process.exit(1);
}

// ===========================================================================
// 0. Read the vocabulary tables out of src/content/topicIds.ts
// ===========================================================================

function sliceBlock(src, startMarker, label) {
  const i = src.indexOf(startMarker);
  if (i < 0) fail(`could not find "${startMarker}" in src/content/topicIds.ts (${label})`);
  const j = src.indexOf('\n};', i);
  const k = src.indexOf('\n];', i);
  const end = j < 0 ? k : k < 0 ? j : Math.min(j, k);
  if (end < 0) fail(`could not find the end of ${label} in src/content/topicIds.ts`);
  return src.slice(i, end);
}

const vocabSrc = readFileSync(TOPIC_IDS_TS, 'utf8');

const EXAM_TOPIC_IDS = (() => {
  const block = sliceBlock(vocabSrc, 'export const EXAM_TOPIC_IDS', 'EXAM_TOPIC_IDS');
  const ids = [...block.matchAll(/'([a-z]+)'/g)].map(m => m[1]);
  if (ids.length !== 12) fail(`expected 12 exam topic ids, extracted ${ids.length}: ${ids.join(', ')}`);
  return new Set(ids);
})();

const ID_PREFIX = (() => {
  const block = sliceBlock(vocabSrc, 'export const ID_PREFIX', 'ID_PREFIX');
  const map = new Map();
  for (const m of block.matchAll(/^ {2}([A-Za-z][A-Za-z0-9]*): '([a-z0-9]{3})',$/gm)) map.set(m[1], m[2]);
  if (map.size !== 25) fail(`expected 25 ID_PREFIX entries, extracted ${map.size}`);
  return map;
})();

const BANKS = (() => {
  const block = sliceBlock(vocabSrc, 'export const BANKS', 'BANKS');
  const out = [...block.matchAll(
    /^ {2}\{ exportName: '([A-Z0-9_]+)', module: '([a-z0-9]+)', file: '([^']+)' \},$/gm,
  )].map(m => ({ exportName: m[1], module: m[2], file: m[3] }));
  if (out.length !== 23) fail(`expected 23 quiz banks in BANKS, extracted ${out.length}`);
  for (const b of out) if (!ID_PREFIX.has(b.module)) fail(`bank ${b.exportName} names module "${b.module}", which has no ID_PREFIX`);
  return out;
})();

const EXAM_BANKS = (() => {
  const block = sliceBlock(vocabSrc, 'export const EXAM_BANKS', 'EXAM_BANKS');
  const out = [...block.matchAll(
    /^ {2}\{ exportName: '(\w+)', file: '([^']+)', shape: '(mc|frq|sets|paper)', idPrefix: '([a-z0-9]+)' \},$/gm,
  )].map(m => ({ exportName: m[1], file: m[2], shape: m[3], idPrefix: m[4] }));
  if (out.length !== 10) fail(`expected 10 exam banks in EXAM_BANKS, extracted ${out.length}`);
  return out;
})();

// ===========================================================================
// 1. A minimal, string- and comment-aware scanner
// ===========================================================================
// `codeMask[i] === 1` means src[i] is real code: not inside a string, not
// inside a comment. Everything downstream only ever looks at masked-in
// characters, which is what makes brace matching safe in files stuffed with
// LaTeX (`\\(\\ce{...}\\)`), HTML (`<td>`) and apostrophes (`don\'t`).

function codeMask(src, label) {
  if (src.includes('`')) {
    fail(`${label} contains a template literal; this script cannot brace-match `
      + `\${…} interpolation. Inspect and extend the scanner before proceeding.`);
  }
  const mask = new Uint8Array(src.length);
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) fail(`${label}: unterminated block comment at ${i}`);
      i = end + 2;
      continue;
    }
    if (c === "'" || c === '"') {
      i++; // opening quote is not code
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === c) { i++; break; }
        if (src[i] === '\n') fail(`${label}: unterminated string literal near offset ${i}`);
        i++;
      }
      continue;
    }
    mask[i] = 1;
    i++;
  }
  return mask;
}

const PAIR = { '{': '}', '[': ']', '(': ')' };

function matchBracket(src, mask, open, label) {
  const want = PAIR[src[open]];
  if (!want) fail(`${label}: matchBracket called on '${src[open]}' at ${open}`);
  const stack = [want];
  let i = open + 1;
  while (i < src.length) {
    if (mask[i]) {
      const c = src[i];
      if (PAIR[c]) stack.push(PAIR[c]);
      else if (c === '}' || c === ']' || c === ')') {
        const expect = stack.pop();
        if (c !== expect) fail(`${label}: mismatched bracket at ${i} — expected '${expect}', got '${c}'`);
        if (stack.length === 0) return i;
      }
    }
    i++;
  }
  return fail(`${label}: unclosed '${src[open]}' opened at ${open}`);
}

function skipValue(src, mask, i, end, label) {
  while (i < end) {
    if (!mask[i]) { i++; continue; }
    const c = src[i];
    if (PAIR[c]) { i = matchBracket(src, mask, i, label) + 1; continue; }
    if (c === ',') return i;
    i++;
  }
  return end;
}

/** Top-level properties of the object literal spanning [open, close]. */
function objectProps(src, mask, open, close, label) {
  const props = new Map();
  let i = open + 1;
  let expectKey = true;
  while (i < close) {
    if (!mask[i]) { i++; continue; }
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === ',') { expectKey = true; i++; continue; }
    if (!expectKey) fail(`${label}: expected ',' before offset ${i} (found '${c}')`);
    const m = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*:/.exec(src.slice(i, close));
    if (!m) fail(`${label}: expected a plain property name at offset ${i}, saw "${src.slice(i, i + 40)}"`);
    let valStart = i + m[0].length;
    while (valStart < close && /\s/.test(src[valStart])) valStart++;
    props.set(m[1], { keyStart: i, valStart });
    expectKey = false;
    i = skipValue(src, mask, valStart, close, label);
  }
  return props;
}

function readString(src, at, label) {
  const q = src[at];
  if (q !== "'" && q !== '"') fail(`${label}: expected a string literal at offset ${at}, saw "${src.slice(at, at + 30)}"`);
  let out = '';
  let i = at + 1;
  while (i < src.length) {
    if (src[i] === '\\') { out += src[i + 1]; i += 2; continue; }
    if (src[i] === q) return out;
    out += src[i];
    i++;
  }
  return fail(`${label}: unterminated string at offset ${at}`);
}

/** Direct object-literal elements of the array literal opening at `open`. */
function directObjectElements(src, mask, open, label) {
  const close = matchBracket(src, mask, open, label);
  const out = [];
  let i = open + 1;
  while (i < close) {
    if (!mask[i]) { i++; continue; }
    const c = src[i];
    if (c === '{') {
      const end = matchBracket(src, mask, i, label);
      out.push({ open: i, close: end });
      i = end + 1;
      continue;
    }
    if (c === '[' || c === '(') { i = matchBracket(src, mask, i, label) + 1; continue; }
    if (c === ',' || /\s/.test(c)) { i++; continue; }
    fail(`${label}: array element at offset ${i} is not an object literal (found '${c}'). `
      + `Spreads and identifier references are not supported — handle it by hand.`);
  }
  return out;
}

/** Offset of the value-opening bracket of `export const NAME` (an `[` or `{`). */
function exportValueOpen(src, mask, name, label) {
  const re = new RegExp(`^export const ${name}\\b[^=\\n]*=\\s*`, 'm');
  const m = re.exec(src);
  if (!m) fail(`${label}: could not find "export const ${name}"`);
  let i = m.index + m[0].length;
  while (i < src.length && (!mask[i] || /\s/.test(src[i]))) i++;
  if (src[i] !== '[' && src[i] !== '{') fail(`${label}: ${name} is not an array or object literal`);
  return i;
}

function propArrayOpen(src, mask, props, key, label) {
  const p = props.get(key);
  if (!p) fail(`${label}: object is missing the "${key}" property`);
  if (src[p.valStart] !== '[') fail(`${label}: "${key}" is not an array literal`);
  return p.valStart;
}

// ===========================================================================
// 2. Insertion
// ===========================================================================

const pad3 = n => String(n).padStart(3, '0');

/**
 * Build the text to splice in immediately after an object literal's `{`,
 * matching the surrounding hand-written style: inline for one-line objects,
 * own-line (at the object's own field indent) for multi-line objects.
 */
function insertionFor(src, open, close, fields) {
  const body = src.slice(open, close + 1);
  const multiline = body.includes('\n');
  if (!multiline) {
    const inline = fields.map(([k, v]) => ` ${k}: '${v}',`).join('');
    // `{ q: …` -> `{ id: …, q: …`; also tolerate `{q: …`
    return { offset: open + 1, text: src[open + 1] === ' ' ? inline : `${inline} ` };
  }
  const m = /^[^\n]*\n([ \t]*)/.exec(src.slice(open));
  if (!m) fail(`multi-line object at ${open} has no following line to take indentation from`);
  const indent = m[1];
  const text = fields.map(([k, v]) => `\n${indent}${k}: '${v}',`).join('');
  return { offset: open + 1, text };
}

// ===========================================================================
// 3. Plan the edits
// ===========================================================================

// file -> { src, mask, edits: [{offset, text, id, kind}] }
const files = new Map();
function loadFile(rel) {
  let f = files.get(rel);
  if (!f) {
    const src = readFileSync(join(ROOT, rel), 'utf8');
    f = { rel, src, mask: codeMask(src, rel), edits: [] };
    // Sanity: the tokenizer stayed in sync if brackets balance across the file.
    let depth = 0;
    for (let i = 0; i < src.length; i++) {
      if (!f.mask[i]) continue;
      if (PAIR[src[i]]) depth++;
      else if (src[i] === '}' || src[i] === ']' || src[i] === ')') depth--;
      if (depth < 0) fail(`${rel}: bracket depth went negative at offset ${i} — scanner out of sync`);
    }
    if (depth !== 0) fail(`${rel}: brackets do not balance (depth ${depth}) — scanner out of sync`);
    files.set(rel, f);
  }
  return f;
}

const allIds = new Map();     // id -> "file:label"
const reserved = new Set();   // every id already present in the sources
const stats = [];             // per-bank report rows
const needsTopic = [];        // questions the script cannot topic-tag

function reserveExisting(f, els, label) {
  for (const el of els) {
    const props = objectProps(f.src, f.mask, el.open, el.close, label);
    const p = props.get('id');
    if (p) {
      const id = readString(f.src, p.valStart, label);
      if (reserved.has(id)) fail(`duplicate pre-existing id "${id}" (${label})`);
      reserved.add(id);
    }
  }
}

function allocate(base, label) {
  if (!reserved.has(base)) { reserved.add(base); return base; }
  // Only reachable if a question was inserted mid-array after a previous run.
  const m = /^(.*-)(\d{3,})$/.exec(base);
  if (!m) fail(`id "${base}" is taken and has no numeric tail to bump (${label})`);
  for (let n = Number(m[2]) + 1; n < Number(m[2]) + 2000; n++) {
    const cand = m[1] + pad3(n);
    if (!reserved.has(cand)) {
      console.warn(`  ! "${base}" was taken; allocated "${cand}" instead (${label}). `
        + `A question was inserted mid-array — expected, ids stay append-only.`);
      reserved.add(cand);
      return cand;
    }
  }
  return fail(`could not allocate an id near "${base}" (${label})`);
}

/**
 * Give one question object its `id` (and `topic`, when asked for).
 * Returns 'added' | 'skipped'.
 */
function tagQuestion(f, el, label, idOf, opts) {
  const props = objectProps(f.src, f.mask, el.open, el.close, label);
  for (const req of opts.require) {
    if (!props.has(req)) fail(`${label}: question object at offset ${el.open} has no "${req}" property`);
  }
  for (const banned of opts.forbid ?? []) {
    if (props.has(banned)) fail(`${label}: question object at offset ${el.open} unexpectedly has "${banned}"`);
  }

  const fields = [];
  const existing = props.get('id');
  let id;
  if (existing) {
    id = readString(f.src, existing.valStart, label);       // rule 1: never touch it
  } else {
    id = allocate(idOf(), label);
    fields.push(['id', id]);
  }
  const prev = allIds.get(id);
  if (prev) fail(`duplicate id "${id}" — ${prev} and ${label}`);
  allIds.set(id, label);

  if (opts.topic !== undefined && !props.has('topic')) fields.push(['topic', opts.topic]);

  if (opts.expectExamTopic) {
    const t = props.get('topic');
    if (!t) fail(`${label}: exam-bank question at offset ${el.open} has no "topic"`);
    const val = readString(f.src, t.valStart, label);
    if (!EXAM_TOPIC_IDS.has(val)) fail(`${label}: unknown exam topic "${val}" at offset ${el.open}`);
  }

  if (fields.length === 0) return { status: 'skipped', id };
  const ins = insertionFor(f.src, el.open, el.close, fields);
  f.edits.push({ ...ins, id, label });
  if (VERBOSE) console.log(`    + ${id.padEnd(22)} ${fields.map(x => x[0]).join('+')}`);
  return { status: 'added', id };
}

// ---- pass 1: reserve every id that already exists -------------------------
// Done for the whole corpus before any allocation, so a re-run can never mint
// an id that some other file already uses.

function eachQuestionGroup(cb) {
  // Quiz banks: `export const X_QUIZ: QuizQ[] = [ …questions… ]`
  for (const b of BANKS) {
    const f = loadFile(b.file);
    const open = exportValueOpen(f.src, f.mask, b.exportName, b.file);
    const els = directObjectElements(f.src, f.mask, open, `${b.file}:${b.exportName}`);
    cb({
      kind: 'quiz', f, els,
      label: `${b.file}:${b.exportName}`,
      bank: b.exportName,
      module: b.module,
      prefix: ID_PREFIX.get(b.module),
      grouping: 'flat',
      require: ['q', 'opts', 'a', 'why'],
      forbid: ['parts'],
      topic: b.module,
      expectExamTopic: false,
    });
  }

  for (const b of EXAM_BANKS) {
    const f = loadFile(b.file);
    const open = exportValueOpen(f.src, f.mask, b.exportName, b.file);

    if (b.shape === 'mc' || b.shape === 'frq') {
      if (f.src[open] !== '[') fail(`${b.file}: ${b.exportName} should be an array`);
      const els = directObjectElements(f.src, f.mask, open, `${b.file}:${b.exportName}`);
      cb({
        kind: b.shape, f, els,
        label: `${b.file}:${b.exportName}`,
        bank: b.exportName,
        prefix: b.idPrefix,
        grouping: 'byExamTopic',
        require: b.shape === 'mc' ? ['topic', 'q', 'opts', 'a', 'why'] : ['topic', 'title', 'prompt', 'parts'],
        forbid: b.shape === 'mc' ? ['parts'] : ['opts'],
        expectExamTopic: true,
      });
      continue;
    }

    if (b.shape === 'sets') {
      // ProblemSet[] — questions live one level down, in each set's `problems`.
      const setEls = directObjectElements(f.src, f.mask, open, `${b.file}:${b.exportName}`);
      for (const setEl of setEls) {
        const setProps = objectProps(f.src, f.mask, setEl.open, setEl.close, b.file);
        const idp = setProps.get('id');
        if (!idp) fail(`${b.file}: a ProblemSet has no "id" (needed to namespace its question ids)`);
        const setId = readString(f.src, idp.valStart, b.file);
        const ns = setId.startsWith(`${b.idPrefix}-`) ? setId : `${b.idPrefix}-${setId}`;
        const arr = propArrayOpen(f.src, f.mask, setProps, 'problems', `${b.file}:${setId}`);
        const els = directObjectElements(f.src, f.mask, arr, `${b.file}:${setId}.problems`);
        cb({
          kind: 'frq', f, els,
          label: `${b.file}:${b.exportName}[${setId}]`,
          bank: `${b.exportName} · ${setId}`,
          prefix: ns,
          grouping: 'flat',
          require: ['topic', 'title', 'prompt', 'parts'],
          forbid: ['opts'],
          expectExamTopic: true,
        });
      }
      continue;
    }

    if (b.shape === 'paper') {
      if (f.src[open] !== '{') fail(`${b.file}: ${b.exportName} should be an object`);
      const close = matchBracket(f.src, f.mask, open, b.file);
      const props = objectProps(f.src, f.mask, open, close, b.file);
      const paperIdP = props.get('id');
      if (!paperIdP) fail(`${b.file}: paper has no "id"`);
      const paperId = readString(f.src, paperIdP.valStart, b.file);
      if (paperId !== b.idPrefix) {
        fail(`${b.file}: paper id "${paperId}" does not match EXAM_BANKS idPrefix "${b.idPrefix}"`);
      }
      // Part A is QuizQ[] — multiple choice with NO topic field anywhere in the
      // data, and a mock paper spans the whole syllabus, so the topic is not
      // derivable. Add the id; report the gap loudly rather than guessing.
      const aOpen = propArrayOpen(f.src, f.mask, props, 'partA', b.file);
      cb({
        kind: 'paperA', f,
        els: directObjectElements(f.src, f.mask, aOpen, `${b.file}:partA`),
        label: `${b.file}:${b.exportName}.partA`,
        bank: `${b.exportName} · Part A`,
        prefix: `${b.idPrefix}-a`,
        grouping: 'flat',
        require: ['q', 'opts', 'a', 'why'],
        forbid: ['parts'],
        expectExamTopic: false,
      });
      const bOpen = propArrayOpen(f.src, f.mask, props, 'partB', b.file);
      cb({
        kind: 'frq', f,
        els: directObjectElements(f.src, f.mask, bOpen, `${b.file}:partB`),
        label: `${b.file}:${b.exportName}.partB`,
        bank: `${b.exportName} · Part B`,
        prefix: `${b.idPrefix}-b`,
        grouping: 'flat',
        require: ['topic', 'title', 'prompt', 'parts'],
        forbid: ['opts'],
        expectExamTopic: true,
      });
      continue;
    }

    fail(`${b.file}: unknown shape "${b.shape}"`);
  }
}

const groups = [];
eachQuestionGroup(g => { groups.push(g); reserveExisting(g.f, g.els, g.label); });

// ---- pass 2: allocate + plan insertions -----------------------------------

for (const g of groups) {
  if (VERBOSE) console.log(`\n  ${g.label}  (${g.els.length} questions)`);
  const perTopic = new Map();
  let added = 0;
  let skipped = 0;

  g.els.forEach((el, i) => {
    // The candidate id is computed EAGERLY, from the question's position only.
    // Position-derived numbering is what makes the script idempotent: it never
    // depends on how many ids were written on a previous run. The per-topic
    // counter therefore advances for already-tagged questions too, so a new
    // question can never be handed a number an old one is already using.
    let candidate;
    if (g.grouping === 'flat') {
      candidate = `${g.prefix}-${pad3(i + 1)}`;
    } else {
      // byExamTopic: number within (bank, exam topic), which keeps
      // `p1-stoich-001…010` readable and independent of neighbouring topics.
      const props = objectProps(g.f.src, g.f.mask, el.open, el.close, g.label);
      const tp = props.get('topic');
      if (!tp) fail(`${g.label}: question at offset ${el.open} has no "topic" to group its id by`);
      const t = readString(g.f.src, tp.valStart, g.label);
      const n = (perTopic.get(t) ?? 0) + 1;
      perTopic.set(t, n);
      candidate = `${g.prefix}-${t}-${pad3(n)}`;
    }
    const r = tagQuestion(g.f, el, g.label, () => candidate, {
      require: g.require,
      forbid: g.forbid,
      topic: g.topic,
      expectExamTopic: g.expectExamTopic,
    });
    if (r.status === 'added') added++; else skipped++;
    if (g.kind === 'paperA') needsTopic.push(r.id);
  });

  stats.push({ label: g.label, bank: g.bank, kind: g.kind, total: g.els.length, added, skipped });
}

// ===========================================================================
// 4. Report, then (only with --write) apply
// ===========================================================================

const W = Math.max(...stats.map(s => s.bank.length));
console.log(`\n${WRITE ? 'WRITE' : 'DRY RUN'} — ${WRITE ? 'rewriting' : 'no files will be modified'}\n`);
console.log(`  ${'bank'.padEnd(W)}  kind    total   +new   already`);
console.log(`  ${'-'.repeat(W)}  ------  -----  -----  -------`);
let tTotal = 0, tAdded = 0, tSkipped = 0;
for (const s of stats) {
  console.log(`  ${s.bank.padEnd(W)}  ${s.kind.padEnd(6)}  ${String(s.total).padStart(5)}  ${String(s.added).padStart(5)}  ${String(s.skipped).padStart(7)}`);
  tTotal += s.total; tAdded += s.added; tSkipped += s.skipped;
}
console.log(`  ${'-'.repeat(W)}  ------  -----  -----  -------`);
console.log(`  ${'TOTAL'.padEnd(W)}  ${''.padEnd(6)}  ${String(tTotal).padStart(5)}  ${String(tAdded).padStart(5)}  ${String(tSkipped).padStart(7)}`);

console.log(`\n  per-file edits:`);
for (const f of files.values()) {
  const n = f.edits.length;
  console.log(`    ${n === 0 ? '=' : '+'} ${f.rel.padEnd(32)} ${String(n).padStart(4)} insertion${n === 1 ? '' : 's'}`);
}

// Duplicate assertion (belt and braces — tagQuestion already checks each one).
if (allIds.size !== tTotal) fail(`id count ${allIds.size} != question count ${tTotal} — duplicate ids`);
console.log(`\n  ${allIds.size} distinct ids across ${tTotal} questions — no duplicates.`);

// ---- diff preview ---------------------------------------------------------

function applyEdits(f) {
  const sorted = [...f.edits].sort((a, b) => b.offset - a.offset);
  let out = f.src;
  for (const e of sorted) out = out.slice(0, e.offset) + e.text + out.slice(e.offset);
  return out;
}

function lineOf(src, offset) {
  const start = src.lastIndexOf('\n', offset - 1) + 1;
  let end = src.indexOf('\n', offset);
  if (end < 0) end = src.length;
  return { n: src.slice(0, start).split('\n').length, start, end, text: src.slice(start, end) };
}

const PREVIEW_PER_FILE = 2;
console.log(`\n  diff preview (first ${PREVIEW_PER_FILE} insertion${PREVIEW_PER_FILE === 1 ? '' : 's'} per file):`);
for (const f of files.values()) {
  if (f.edits.length === 0) { console.log(`\n  --- ${f.rel} (unchanged)`); continue; }
  console.log(`\n  --- ${f.rel}`);
  for (const e of f.edits.slice(0, PREVIEW_PER_FILE)) {
    const before = lineOf(f.src, e.offset);
    const patched = f.src.slice(0, e.offset) + e.text + f.src.slice(e.offset);
    const afterLines = patched.slice(before.start, before.start + before.text.length + e.text.length + 200).split('\n');
    const clip = s => (s.length > 148 ? `${s.slice(0, 145)}…` : s);
    console.log(`  @@ line ${before.n}`);
    console.log(`  - ${clip(before.text)}`);
    const shown = e.text.includes('\n') ? afterLines.slice(0, e.text.split('\n').length + 1) : [afterLines[0]];
    for (const l of shown) console.log(`  + ${clip(l)}`);
  }
}

// ---- warnings -------------------------------------------------------------

if (needsTopic.length) {
  console.log(`\n  WARNING — ${needsTopic.length} questions get an id but NO topic:`);
  console.log(`    olympiadPaper1–5 \`partA\` are typed \`QuizQ[]\` and carry no topic field.`);
  console.log(`    A mock paper spans the whole syllabus, so the topic is not derivable from`);
  console.log(`    position or file. They are left untagged ON PURPOSE: once \`topic\` becomes`);
  console.log(`    required on QuizQ, \`tsc --noEmit\` will enumerate exactly these ${needsTopic.length} items`);
  console.log(`    (${needsTopic[0]} … ${needsTopic[needsTopic.length - 1]}) for hand tagging.`);
}

if (!WRITE) {
  console.log(`\n  Dry run complete. Re-run with --write to apply.\n`);
  process.exit(0);
}

for (const f of files.values()) {
  if (f.edits.length === 0) continue;
  writeFileSync(join(ROOT, f.rel), applyEdits(f), 'utf8');
  console.log(`  wrote ${f.rel} (${f.edits.length} insertions)`);
}
console.log(`\n  Done. Re-run without --write: it must report 0 new ids.\n`);
