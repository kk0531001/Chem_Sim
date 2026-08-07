// Rules check for the next-lesson recommendation (ROADMAP F.3).
//
// Exists because recommendNext() is the one piece of Phase F that is pure
// branching over user state: every rule is invisible until it fires on the
// wrong module, and none of them is caught by tsc. Loaded the same way
// test-router.mjs loads topics.ts — transpile with the compiler API and stub
// the imports — so it needs no bundler and no browser.
//
// The progress store is stubbed with a settable map, which is the whole point:
// the rules are a function of "how much of each module is solved", and that is
// exactly what a real session makes hard to arrange on purpose.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'test-recommend-'));

function transpile(srcPath, outName, rewrites = []) {
  let out = ts.transpileModule(readFileSync(join(ROOT, srcPath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  for (const [from, to] of rewrites) out = out.split(from).join(to);
  writeFileSync(join(scratch, outName), out);
}

// The progress store, stubbed: `solved` is a module id -> count map the tests
// set directly, and `weak` is the weakTopics() answer.
writeFileSync(join(scratch, 'progress.mjs'), `
export const state = { solved: {}, weak: [] };
export const solvedWithPrefix = p => state.solved[p] ?? 0;
export const weakTopics = () => state.weak;
export const onProgressChange = () => {};
`);
writeFileSync(join(scratch, 'stub.mjs'),
  'export const h = () => ({});\nexport const topicIconSVG = () => "";\nexport const CLOCK_ICON = "";\n' +
  'export const MODE_SHORT = {};\nexport const onModeChange = () => {};\n');
// Competition mode, stubbed so the rules can be exercised in each one.
writeFileSync(join(scratch, 'mode.mjs'), `
import { compsForDifficulty } from './topicIds.mjs';
export const state = { mode: 'all' };
export const activeMode = () => state.mode;
export const activeComp = () => (state.mode === 'all' ? undefined : state.mode);
export const inScope = (d, m = state.mode) => m === 'all' || compsForDifficulty(d).includes(m);
export const onModeChange = () => {};
export const MODE_SHORT = { all: 'All', ccc: 'CCC', usnco: 'USNCO', cco: 'CCO', icho: 'IChO' };
`);

transpile('src/content/topicIds.ts', 'topicIds.mjs');
transpile('src/content/counts.ts', 'counts.mjs');
transpile('src/topics.ts', 'topics.mjs', [
  ["'./tabs/framework'", "'./stub.mjs'"],
  ["'./icons'", "'./stub.mjs'"],
  ["'./content/topicIds'", "'./topicIds.mjs'"],
  ["'./content/counts'", "'./counts.mjs'"],
  ["'./progress'", "'./progress.mjs'"],
  ["'./mode'", "'./mode.mjs'"],
]);
transpile('src/recommend.ts', 'recommend.mjs', [
  ["'./topics'", "'./topics.mjs'"],
  ["'./content/topicIds'", "'./topicIds.mjs'"],
  ["'./content/counts'", "'./counts.mjs'"],
  ["'./progress'", "'./progress.mjs'"],
  ["'./mode'", "'./mode.mjs'"],
]);

const load = n => import(pathToFileURL(join(scratch, n)).href);

let recommend, progress, topicIds, counts, modeMod, topicsMod;
try {
  [recommend, progress, topicIds, counts, modeMod, topicsMod] = await Promise.all(
    ['recommend.mjs', 'progress.mjs', 'topicIds.mjs', 'counts.mjs', 'mode.mjs', 'topics.mjs'].map(load));
} catch (err) {
  console.error('FATAL: could not load recommend.ts —', err.message);
  process.exit(1);
}

const { recommendNext, completion } = recommend;
const { state } = progress;
const { ID_PREFIX } = topicIds;
const { MODULE_QUIZ_SIZE } = counts;

let failures = 0;
function check(name, fn) {
  state.solved = {};
  state.weak = [];
  modeMod.state.mode = 'all';
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}
const eq = (got, want, what) => {
  if (got !== want) throw new Error(`${what}: expected ${want}, got ${got}`);
};
/** Mark a module as `frac` complete, by id. */
const setDone = (id, frac) => { state.solved[ID_PREFIX[id]] = Math.round(MODULE_QUIZ_SIZE[id] * frac); };

console.log('recommendNext:');

check('a brand-new visitor gets the next module in sequence, not a lecture about prerequisites', () => {
  // coordchem's prereqs are unmet, but EVERYTHING is unmet for a new visitor —
  // rule 1 must stay silent or it fires on all 25 modules.
  const r = recommendNext('coordchem');
  eq(r.reason, 'next in the sequence', 'reason');
});

check('an unmet prerequisite of the current module wins once the student has started', () => {
  setDone('quantum', 1);              // something is started
  const r = recommendNext('coordchem'); // prereqs: bonding, nuclear (both at 0)
  if (!['bonding', 'nuclear'].includes(r.topic.id)) {
    throw new Error(`expected a coordchem prerequisite, got ${r.topic.id}`);
  }
  if (!r.reason.includes('builds on it')) throw new Error(`reason was "${r.reason}"`);
});

check('a prerequisite at half its bank counts as met', () => {
  setDone('quantum', 1);
  setDone('bonding', 0.5);
  setDone('nuclear', 0.5);
  const r = recommendNext('coordchem');
  if (r.reason.includes('builds on it')) throw new Error('still nagging about a met prerequisite');
});

check('mid-module, sequence beats the weak topic', () => {
  // The gate that stops all 25 modules showing the same card: until you have
  // FINISHED the module you are ON, "next" means the next one. 0.8 is the
  // interesting case — well past halfway, still not done.
  setDone('quantum', 0.8);
  state.weak = [{ topic: 'organic', accuracy: 0.41, seen: 17 }];
  const r = recommendNext('quantum');
  if (r.reason.includes('weakest topic')) throw new Error('redirected away from a module still in progress');
});

check('a weak topic beats sequence order once the current module is done', () => {
  setDone('quantum', 1);
  setDone('bonding', 1);
  setDone('periodicity', 1);
  // organic1 sits far from quantum in TOPICS order; only weakness should reach it
  state.weak = [{ topic: 'organic', accuracy: 0.41, seen: 17 }];
  const r = recommendNext('quantum');
  eq(r.topic.group, 'Organic Chemistry', 'recommended group');
  if (!r.reason.includes('weakest topic')) throw new Error(`reason was "${r.reason}"`);
  if (!r.reason.includes('41%')) throw new Error(`reason omits the figure: "${r.reason}"`);
});

check('a weak topic whose modules are all finished is skipped, not recommended again', () => {
  setDone('quantum', 1);
  for (const id of ['organic1', 'organic2', 'organic3', 'polymers', 'spectroscopy', 'structure']) setDone(id, 1);
  state.weak = [{ topic: 'organic', accuracy: 0.41, seen: 17 }];
  const r = recommendNext('quantum');
  eq(r.reason.includes('weakest topic'), false, 'fell through to a finished module');
});

check('a weak topic is not recommended past an unmet prerequisite', () => {
  setDone('stoich', 1);
  // coordchem is weak-adjacent (descriptive) but its own prereqs are untouched
  state.weak = [{ topic: 'descriptive', accuracy: 0.3, seen: 20 }];
  const r = recommendNext('stoich');
  if (r.topic.id === 'coordchem') throw new Error('recommended a module whose prerequisites are unmet');
});

check('completed modules are never the recommendation while unfinished ones remain', () => {
  setDone('quantum', 1);
  setDone('periodicity', 1);
  const r = recommendNext('quantum');
  if (completion(r.topic.id) >= 1) throw new Error(`recommended finished module ${r.topic.id}`);
});

check('the footer is never empty, even with the whole site finished', () => {
  for (const id of Object.keys(MODULE_QUIZ_SIZE)) setDone(id, 1);
  const r = recommendNext('quantum');
  if (!r || !r.topic) throw new Error('returned nothing');
  if (!r.reason) throw new Error('recommendation without a reason');
});

check('every module produces a recommendation with a reason', () => {
  setDone('quantum', 1);
  state.weak = [{ topic: 'thermo', accuracy: 0.5, seen: 10 }];
  for (const id of Object.keys(MODULE_QUIZ_SIZE)) {
    const r = recommendNext(id);
    if (!r) throw new Error(`${id}: no recommendation`);
    if (!r.reason) throw new Error(`${id}: no reason`);
    if (r.topic.id === id) throw new Error(`${id}: recommended itself`);
  }
});

check('the sandbox and the question bank are never recommended as a lesson', () => {
  setDone('quantum', 1);
  for (const id of Object.keys(MODULE_QUIZ_SIZE)) {
    if (id === 'quantum') continue;
    setDone(id, 1);
  }
  // everything with a bank is finished; rule 4 may fall back to a neighbour,
  // but rules 1-3 must never pick a module that has no quiz at all
  setDone('quantum', 0.2);
  const r = recommendNext('bonding');
  if (['sandbox', 'qbank'].includes(r.topic.id)) throw new Error(`recommended ${r.topic.id}`);
});

check('in CCC mode, an off-syllabus module is never recommended', () => {
  modeMod.state.mode = 'ccc';
  setDone('quantum', 1);
  // coordchem/advinorganic/physchem etc. are CCO/IChO-pitched; in CCC mode the
  // recommendation must not send a student to any of them.
  const offSyllabus = Object.keys(MODULE_QUIZ_SIZE).filter(id => {
    const t = topicsMod.topicById(id);
    return t && !modeMod.inScope(t.difficulty, 'ccc');
  });
  if (!offSyllabus.length) throw new Error('test is vacuous — no module is off the CCC syllabus');
  for (const id of Object.keys(MODULE_QUIZ_SIZE)) {
    const r = recommendNext(id);
    if (r && offSyllabus.includes(r.topic.id)) {
      throw new Error(`from ${id}, recommended off-syllabus module ${r.topic.id}`);
    }
  }
});

check('switching mode changes the recommendation, not the data', () => {
  setDone('quantum', 1);
  setDone('bonding', 1);
  setDone('nuclear', 1);
  state.weak = [{ topic: 'descriptive', accuracy: 0.35, seen: 20 }];
  modeMod.state.mode = 'all';
  const anyMode = recommendNext('quantum');
  modeMod.state.mode = 'ccc';
  const cccMode = recommendNext('quantum');
  if (!anyMode || !cccMode) throw new Error('a mode must never empty the footer');
  // Both must still be real recommendations with reasons; only the pick differs.
  if (!anyMode.reason || !cccMode.reason) throw new Error('recommendation without a reason');
  if (!modeMod.inScope(cccMode.topic.difficulty, 'ccc')) {
    throw new Error(`CCC mode picked ${cccMode.topic.id}, which is off the CCC syllabus`);
  }
});

if (failures) {
  console.error(`\n  ${failures} recommendation rule(s) broken.`);
  process.exit(1);
}
console.log(`\n  recommend: all checks passed`);
