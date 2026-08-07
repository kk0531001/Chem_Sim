// Acceptance gate for ROADMAP Phase D.0 (docs/codex/D0-routing-slugs-404.md).
//
// Written BEFORE the implementation, deliberately: it fails today and passes
// only when slugs, alias resolution and the `notfound` route are all correct.
// Run it as the loop condition — `node scripts/test-router.mjs` exits 0 when
// D0 is done and non-zero, with the specific failures listed, when it isn't.
//
// Loads src/topics.ts and src/router.ts by transpiling them with the compiler
// API (same trick as audit-corpus.mjs) and stubbing the DOM-facing imports —
// TOPICS and parseRoute are pure data and pure logic, and neither needs a
// browser to be checked.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'test-router-'));

function transpile(srcPath, outName, rewrites = []) {
  let out = ts.transpileModule(readFileSync(join(ROOT, srcPath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  for (const [from, to] of rewrites) out = out.split(from).join(to);
  writeFileSync(join(scratch, outName), out);
}

// topics.ts pulls in h(), the icon set, the id prefixes, the bank sizes and the
// progress store for renderTopicCard(); none of them runs at module load, so a
// stub is enough to reach TOPICS. This test is about ROUTES — it must not start
// dragging in the app's real modules just because a card renderer grew.
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
// guides.ts imports nothing but a type, so it loads as-is.
transpile('src/guides.ts', 'guides.mjs');
transpile('src/router.ts', 'router.mjs', [
  ["'./topics'", "'./topics.mjs'"],
  ["'./guides'", "'./guides.mjs'"],
]);

const load = n => import(pathToFileURL(join(scratch, n)).href);

let topics, router, guides;
try {
  topics = await load('topics.mjs');
  guides = await load('guides.mjs');
  router = await load('router.mjs');
} catch (err) {
  console.error('FATAL: could not load topics.ts / router.ts —', err.message);
  process.exit(1);
}

const { TOPICS } = topics;
const { GUIDES } = guides;
const { parseRoute } = router;

const failures = [];
const fail = (what, detail) => failures.push(`${what}\n      ${detail}`);
let checks = 0;
const check = (cond, what, detail) => { checks++; if (!cond) fail(what, detail); };

// ---- 0. Is D0 even started? Report that clearly rather than as 200 failures.
const withoutSlug = TOPICS.filter(t => !t.slug);
if (withoutSlug.length === TOPICS.length) {
  console.error(`\n  D.0 NOT STARTED — no topic in src/topics.ts has a \`slug\`.`);
  console.error(`  See docs/codex/D0-routing-slugs-404.md for the slug table.\n`);
  process.exit(1);
}

// ---- 1. Metadata shape
for (const t of TOPICS) {
  check(!!t.slug, `topic "${t.id}" has no slug`, 'every TOPICS entry needs one');
  if (!t.slug) continue;
  check(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug),
    `slug "${t.slug}" is not kebab-case`, 'lowercase letters, digits and single hyphens only');
  // The requirement is that the bare id still RESOLVES, not that it literally
  // appears in `aliases` — for `periodicity` and `polymers` the slug already
  // is the id, and demanding a redundant self-alias there was a bug in this
  // gate (caught by Codex, 2026-08-02).
  check(t.slug === t.id || (Array.isArray(t.aliases) && t.aliases.includes(t.id)),
    `topic "${t.id}" is not reachable at its bare id`,
    'existing /topic/<id> links and bookmarks must keep resolving');
}

// ---- 2. No collisions anywhere in the URL namespace
// A topic may name itself more than once (slug === id, or a duplicated alias);
// only a name claimed by two DIFFERENT topics is a collision.
const seen = new Map();
for (const t of TOPICS) {
  for (const name of new Set([t.slug, ...(t.aliases ?? [])])) {
    if (!name) continue;
    const owner = seen.get(name);
    if (owner !== undefined && owner !== t.id) fail(`"${name}" is claimed by two topics`, `${owner} and ${t.id}`);
    else seen.set(name, t.id);
  }
  checks++;
}
for (const reserved of ['menu', 'topic', 'guide']) {
  check(!seen.has(reserved), `"${reserved}" used as a slug/alias`, 'collides with a reserved path');
}

// ---- 2b. Competition guides (I.3): they are entry points from search, so a
// broken guide URL is a broken ad. Same rules as topic slugs.
for (const g of GUIDES) {
  check(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.slug), `guide slug "${g.slug}" is not kebab-case`, 'lowercase, digits, single hyphens');
  check(!seen.has(g.slug), `guide slug "${g.slug}" collides with a topic`, 'one owner per URL');
  const r = parseRoute(`/guide/${g.slug}`);
  check(r.kind === 'guide' && r.slug === g.slug, `/guide/${g.slug} does not resolve`, `got ${JSON.stringify(r)}`);
  const trailing = parseRoute(`/guide/${g.slug}/`);
  check(trailing.kind === 'guide', `/guide/${g.slug}/ (trailing slash) does not resolve`, `got ${JSON.stringify(trailing)}`);
  const upper = parseRoute(`/guide/${g.slug.toUpperCase()}`);
  check(upper.kind === 'guide' && upper.slug === g.slug, `/guide/${g.slug.toUpperCase()} does not resolve`, `got ${JSON.stringify(upper)}`);
}
check(parseRoute('/guide/not-a-guide').kind === 'notfound',
  'an unknown guide slug does not 404', 'it must reach the router 404, not a blank page');

// ---- 3. Every slug and alias resolves to its own topic
for (const t of TOPICS) {
  for (const name of [t.slug, ...(t.aliases ?? [])]) {
    if (!name) continue;
    const r = parseRoute(`/topic/${name}`);
    check(r.kind === 'topic' && r.id === t.id,
      `/topic/${name} did not resolve to "${t.id}"`,
      `got ${JSON.stringify(r)}`);
  }
}

// ---- 4. The reported bug, by name
const reported = parseRoute('/topic/thermodynamics-i');
check(reported.kind === 'topic' && reported.id === 'thermo1',
  '/topic/thermodynamics-i does not load Thermodynamics I',
  `got ${JSON.stringify(reported)} — this is the exact URL from the bug report`);

// ---- 5. Tolerances that a typed URL needs
const t0 = TOPICS[0];
for (const [path, why] of [
  [`/topic/${t0.slug.toUpperCase()}`, 'uppercase'],
  [`/topic/${t0.slug}/`, 'trailing slash'],
]) {
  const r = parseRoute(path);
  check(r.kind === 'topic' && r.id === t0.id, `${path} (${why}) did not resolve`, `got ${JSON.stringify(r)}`);
}

// ---- 6. The two static routes
check(parseRoute('/').kind === 'home', '/ is not home', `got ${JSON.stringify(parseRoute('/'))}`);
check(parseRoute('/menu').kind === 'menu', '/menu is not menu', `got ${JSON.stringify(parseRoute('/menu'))}`);

// ---- 7. Unknown paths are notfound — never a silent homepage
const unknown = [
  '/topic/thermo9',          // valid charset, no such topic
  '/topic/thermodynamics-9',
  '/topic/',
  '/topic/a/b',
  '/nonsense',
  '/topic/%3Cscript%3E',
];
for (const path of unknown) {
  const r = parseRoute(path);
  check(r.kind === 'notfound', `${path} should be notfound`,
    `got ${JSON.stringify(r)}${r.kind === 'home' ? '  <-- THIS IS THE BUG: silent fallback to the homepage' : ''}`);
}

// ---- 8. The core invariant, stated once and directly
const homeOnly = ['/', '', '//'].map(p => parseRoute(p));
check(homeOnly.every(r => r.kind === 'home'), 'the root path must be home', JSON.stringify(homeOnly));
const shouldNotBeHome = [...unknown, '/topic/thermodynamics-i', '/menu'];
for (const path of shouldNotBeHome) {
  check(parseRoute(path).kind !== 'home',
    `${path} resolved to home`,
    'ONLY "/" may return home — a fallback to home anywhere else is the D.0 bug');
}

// ---- report
if (failures.length) {
  console.error(`\n  FAILED — ${failures.length} of ${checks} checks\n`);
  for (const f of failures) console.error(`  · ${f}`);
  console.error(`\n  Spec: docs/codex/D0-routing-slugs-404.md\n`);
  process.exit(1);
}
console.log(`  router: ${checks} checks passed (${TOPICS.length} topics, ${seen.size} URLs)`);
