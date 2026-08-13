// Acceptance gate for the section router (src/sectionHost.ts + the /topic/
// <slug>/<section> route). Two things here are easy to fake and are therefore
// tested directly rather than eyeballed:
//
//   1. TEARDOWN, NOT DETACH. Leaving a section must actually stop its rAF loop.
//      A cancel that never fires because the closure still holds a live handle
//      leaves a detached node painting forever, and looks perfect on screen.
//      The leaky section below is exactly that bug; the guard must catch it.
//   2. COLD DEEP-LINK. /topic/chemical-equilibrium/practice with no prior
//      in-app state must land on that section with its neighbours resolved.
//      That is the path prerender and the Resume link depend on.
//
// Same transpile-and-stub harness as test-router.mjs — the host's only DOM
// dependency is root.replaceChildren(), so a five-line fake node is enough.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'test-sections-'));

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
  ["'./tabs/framework'", "'./stub.mjs'"], ["'./icons'", "'./stub.mjs'"],
  ["'./content/topicIds'", "'./stub.mjs'"], ["'./content/counts'", "'./stub.mjs'"],
  ["'./progress'", "'./stub.mjs'"], ["'./mode'", "'./stub.mjs'"],
]);
transpile('src/guides.ts', 'guides.mjs');
transpile('src/spine.ts', 'spine.mjs', [["'./topics'", "'./topics.mjs'"]]);
transpile('src/router.ts', 'router.mjs', [["'./topics'", "'./topics.mjs'"], ["'./guides'", "'./guides.mjs'"]]);
// import.meta.env is Vite's, not Node's — and the DEV auto-install would grab
// the real window anyway. This test installs the guard on its own fake.
transpile('src/sectionHost.ts', 'sectionHost.mjs', [
  ["'./spine'", "'./spine.mjs'"],
  ['import.meta.env.DEV', 'false'],
]);

const load = n => import(pathToFileURL(join(scratch, n)).href);
const { TOPICS } = await load('topics.mjs');
const { parseRoute, routeToPath } = await load('router.mjs');
const { createSectionHost, installRafGuard } = await load('sectionHost.mjs');

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const eq = (got, want, msg) => ok(Object.is(got, want), `${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

// ---- fakes -----------------------------------------------------------------
const fakeRoot = () => {
  const node = { kids: [], replaceChildren: () => { node.kids.length = 0; }, append: (...k) => node.kids.push(...k) };
  return node;
};
// A hand-pumped rAF: nothing runs until frame() is called, so "did this loop
// keep running after unmount" is a question with an exact answer. It implements
// cancelAnimationFrame properly, because the difference between cancelling and
// merely flagging a loop dead is one of the things under test.
function fakeWin() {
  let q = new Map();
  let seq = 0;
  return {
    requestAnimationFrame(cb) { q.set(++seq, cb); return seq; },
    cancelAnimationFrame(id) { q.delete(id); },
    frame() { const due = [...q.values()]; q.clear(); for (const cb of due) cb(0); return due.length; },
    pending: () => q.size,
  };
}

const SECTIONS = [
  { slug: 'overview', title: 'Overview' },
  { slug: 'simulation', title: 'Le Chatelier box' },
  { slug: 'practice', title: 'Practice' },
];

// ---- 1. route shape --------------------------------------------------------
{
  const eqTopic = TOPICS.find(t => t.id === 'equilibrium');
  ok(!!eqTopic, 'equilibrium topic exists');
  const r = parseRoute(`/topic/${eqTopic.slug}/practice`);
  eq(r.kind, 'topic', 'sectioned URL is a topic route');
  eq(r.id, 'equilibrium', 'sectioned URL resolves the topic');
  eq(r.section, 'practice', 'sectioned URL carries the section slug');
  eq(parseRoute(`/topic/${eqTopic.slug}/PRACTICE/`).section, 'practice', 'uppercase + trailing slash tolerated');
  eq(parseRoute(`/topic/${eqTopic.slug}`).section, undefined, 'bare topic URL has no section');
  // A bookmark from before sections existed must still work, unchanged.
  eq(parseRoute(`/topic/${eqTopic.id}`).id, 'equilibrium', 'legacy bare-id link still resolves');
  eq(routeToPath({ kind: 'topic', id: 'equilibrium', section: 'practice' }),
    `/topic/${eqTopic.slug}/practice`, 'round-trips back to the same path');
  eq(routeToPath({ kind: 'topic', id: 'equilibrium' }), `/topic/${eqTopic.slug}`, 'no section, no trailing segment');
  // An unknown section must NOT 404 the topic — the spine falls back.
  eq(parseRoute(`/topic/${eqTopic.slug}/renamed-away`).kind, 'topic', 'unknown section stays on the topic');
  // But an unknown topic is still a 404, with or without a section.
  eq(parseRoute('/topic/no-such-topic/practice').kind, 'notfound', 'unknown topic 404s');
}

// ---- 2. COLD DEEP-LINK: no prior in-app state ------------------------------
{
  const eqTopic = TOPICS.find(t => t.id === 'equilibrium');
  const route = parseRoute(`/topic/${eqTopic.slug}/practice`);
  const root = fakeRoot();
  const host = createSectionHost(root);
  let built = null;
  const pos = host.show(route.id, route.section ?? null, {
    sections: SECTIONS,
    mount: slug => { built = slug; root.append(slug); },
  });
  ok(!!pos, 'cold deep-link resolves a position');
  eq(built, 'practice', 'cold deep-link mounts the section named in the URL, not the first one');
  eq(pos.current.slug, 'practice', 'position points at the deep-linked section');
  eq(pos.indexInTopic, 2, 'position indicator: section 3 of 3');
  eq(pos.topicLength, 3, 'position indicator total');
  eq(pos.sections.length, 3, 'stepper has every section of this topic');
  eq(pos.prev.slug, 'simulation', 'Prev resolved against the spine on a cold load');
  const nextTopic = TOPICS[TOPICS.findIndex(t => t.id === 'equilibrium') + 1];
  eq(pos.next.topicId, nextTopic.id, 'Next crosses to the following topic on a cold load');
  eq(pos.next.title, nextTopic.title, 'boundary Next is named by topic');
  eq(host.current().slug, 'practice', 'host knows where it is');

  // Same host, unknown slug (a stale bookmark): topic-first, not a blank page.
  const stale = host.show('equilibrium', 'gone', { sections: SECTIONS, mount: s => { built = s; } });
  eq(built, 'overview', 'a stale section slug lands on the first section');
  eq(stale.current.slug, 'overview', 'and reports it, so the caller can canonicalise the URL');
}

// ---- 3. TEARDOWN, NOT DETACH ----------------------------------------------
{
  const win = fakeWin();
  const leaks = [];
  installRafGuard(win, name => leaks.push(name));
  const root = fakeRoot();
  const host = createSectionHost(root);

  // A CORRECT section: the real tabs' pattern — hold the handle, cancel it on
  // teardown. A flag alone ("live = false") is NOT this, and would still leave
  // one queued frame to fire after unmount; the guard treats that as a leak.
  let goodFrames = 0;
  const good = {
    sections: SECTIONS,
    mount: () => {
      let id = 0;
      const loop = () => { goodFrames++; id = win.requestAnimationFrame(loop); };
      id = win.requestAnimationFrame(loop);
      return () => win.cancelAnimationFrame(id);
    },
  };
  // The BUG: unmount detaches the node and never stops the loop.
  let badFrames = 0;
  const bad = {
    sections: SECTIONS,
    mount: () => { const loop = () => { badFrames++; win.requestAnimationFrame(loop); }; win.requestAnimationFrame(loop); },
  };

  host.show('equilibrium', 'simulation', good);
  win.frame(); win.frame();
  eq(goodFrames, 2, 'a mounted section animates');
  eq(leaks.length, 0, 'a mounted section is not reported as a leak');

  host.show('equilibrium', 'practice', bad);
  const after = goodFrames;
  win.frame(); win.frame();
  eq(goodFrames, after, 'the previous section stopped painting the moment it was left');
  eq(leaks.length, 0, 'a section that really cancels its loop is never reported');
  eq(root.kids.length, 0, 'and its DOM is gone');

  eq(badFrames, 2, 'the leaky section ran while it was mounted');
  host.leave();
  win.frame();
  eq(badFrames, 2, 'the leaky loop is stopped dead the first frame after unmount');
  eq(leaks.length, 1, 'the leaky loop is REPORTED — detaching the node is not teardown');
  ok(String(leaks[0]).includes('practice'), `the report names the guilty section: got ${leaks[0]}`);
  win.frame();
  eq(win.pending(), 0, 'and it does not re-register: no live rAF loop outside the mounted section');
}

// ---- 4. one section at a time ---------------------------------------------
{
  const root = fakeRoot();
  const host = createSectionHost(root);
  const order = [];
  const src = {
    sections: SECTIONS,
    mount: slug => { order.push(`mount:${slug}`); root.append(slug); return () => order.push(`teardown:${slug}`); },
  };
  host.show('equilibrium', 'overview', src);
  host.show('equilibrium', 'practice', src);
  eq(order.join(' '), 'mount:overview teardown:overview mount:practice',
    'the outgoing section is torn down BEFORE the next one mounts');
  eq(root.kids.length, 1, 'exactly one section is in the DOM');
  host.leave();
  eq(host.current(), null, 'leaving the app mounts nothing');
  eq(root.kids.length, 0, 'and leaves nothing behind');
  eq(host.show('no-such-topic', 'overview', src), null, 'an unknown topic is a real 404');
}

if (fails.length) {
  console.error(`test-sections: ${fails.length} failure(s)`);
  for (const f of fails) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('test-sections: ok (routing, cold deep-link, teardown, leak guard)');
