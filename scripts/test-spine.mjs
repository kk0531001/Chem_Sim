// Acceptance gate for the paginated-sections spine (src/spine.ts).
//
// Same trick as test-router.mjs: transpile the TS with the compiler API and
// stub the DOM-facing imports. resolve() is pure, so this is the whole check —
// if it passes, Prev/Next, the stepper and the position indicator are all
// correct by construction, because they read nothing else.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'test-spine-'));

function transpile(srcPath, outName, rewrites = []) {
  let out = ts.transpileModule(readFileSync(join(ROOT, srcPath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  for (const [from, to] of rewrites) out = out.split(from).join(to);
  writeFileSync(join(scratch, outName), out);
}

writeFileSync(join(scratch, 'stub.mjs'),
  'export const h = () => ({});\nexport const topicIconSVG = () => "";\nexport const CLOCK_ICON = "";\n' +
  'export const ID_PREFIX = {};\nexport const MODULE_QUIZ_SIZE = {};\n' +
  'export const solvedWithPrefix = () => 0;\nexport const onProgressChange = () => {};\n' +
  'export const activeMode = () => "all";\nexport const inScope = () => true;\n' +
  'export const onModeChange = () => {};\nexport const MODE_SHORT = {};\n');

transpile('src/topics.ts', 'topics.mjs', [
  ["'./tabs/framework'", "'./stub.mjs'"],
  ["'./icons'", "'./stub.mjs'"],
  ["'./content/topicIds'", "'./stub.mjs'"],
  ["'./content/counts'", "'./stub.mjs'"],
  ["'./progress'", "'./stub.mjs'"],
  ["'./mode'", "'./stub.mjs'"],
]);
transpile('src/spine.ts', 'spine.mjs', [["'./topics'", "'./topics.mjs'"]]);

const load = n => import(pathToFileURL(join(scratch, n)).href);
const { TOPICS } = await load('topics.mjs');
const { resolve, firstSection } = await load('spine.mjs');

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const eq = (got, want, msg) => ok(Object.is(got, want), `${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

const S = [
  { slug: 'overview', title: 'Overview' },
  { slug: 'titration', title: 'Titration curve' },
  { slug: 'practice', title: 'Practice' },
];

// A topic in the middle of the spine, so both boundaries have a neighbour.
const midIdx = Math.floor(TOPICS.length / 2);
const mid = TOPICS[midIdx];
ok(TOPICS.length > 2, 'spine needs at least three topics to test boundaries');

// ---- inside a topic --------------------------------------------------------
{
  const p = resolve(mid.id, 'titration', S);
  eq(p.current.slug, 'titration', 'middle section resolves to itself');
  eq(p.indexInTopic, 1, 'indexInTopic');
  eq(p.topicLength, 3, 'topicLength');
  eq(p.prev.slug, 'overview', 'prev inside topic');
  eq(p.prev.crossesTopic, false, 'prev inside topic does not cross');
  eq(p.next.slug, 'practice', 'next inside topic');
  eq(p.next.title, 'Practice', 'next button is titled by SECTION inside a topic');
  eq(p.sections.length, 3, 'stepper gets the whole list');
}

// ---- topic boundaries ------------------------------------------------------
{
  const last = resolve(mid.id, 'practice', S);
  eq(last.next.topicId, TOPICS[midIdx + 1].id, 'last section links to the NEXT topic');
  eq(last.next.slug, null, 'cross-topic link has no section slug (entry point)');
  eq(last.next.title, TOPICS[midIdx + 1].title, 'cross-topic button is titled by TOPIC');
  eq(last.next.crossesTopic, true, 'crossesTopic flagged');

  const first = resolve(mid.id, 'overview', S);
  eq(first.prev.topicId, TOPICS[midIdx - 1].id, 'first section links back to the previous topic');
  eq(first.prev.crossesTopic, true, 'back across a boundary is flagged too');
}

// ---- ends of the spine -----------------------------------------------------
{
  const veryFirst = resolve(TOPICS[0].id, 'overview', S);
  eq(veryFirst.prev, null, 'no prev at the start of the spine');
  const veryLast = resolve(TOPICS[TOPICS.length - 1].id, 'practice', S);
  eq(veryLast.next, null, 'no next at the end of the spine — the footer offers "Back to topics"');
}

// ---- fallbacks -------------------------------------------------------------
{
  eq(resolve(mid.id, null, S).current.slug, 'overview', 'bare topic URL lands on the first section');
  eq(resolve(mid.id, 'renamed-away', S).current.slug, 'overview', 'a stale slug falls back, it does not 404');
  eq(resolve('no-such-topic', 'overview', S), null, 'unknown topic is a real 404');
  eq(resolve(mid.id, 'overview', []), null, 'a topic with no sections is a real 404');
  eq(firstSection(S).slug, 'overview', 'firstSection');
  eq(firstSection([]), null, 'firstSection of nothing');
}

// ---- the spine is a single walk -------------------------------------------
// Every topic reachable by following `next` from the first, in TOPICS order.
{
  const walk = [];
  let t = TOPICS[0].id;
  for (let n = 0; n < TOPICS.length + 5 && t; n++) {
    walk.push(t);
    t = resolve(t, 'practice', S)?.next?.topicId ?? null;
  }
  eq(walk.join(','), TOPICS.map(x => x.id).join(','), 'walking next() visits every topic exactly once, in order');
}

if (fails.length) {
  console.error(`test-spine: ${fails.length} failure(s)`);
  for (const f of fails) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`test-spine: ok (${TOPICS.length} topics in the spine)`);
