// Acceptance gate for the cloud-sync data-integrity rules in src/progress.ts.
//
// Same trick as test-spine.mjs: transpile the TS, stub what touches the world
// (localStorage, the lazy supabase import, import.meta.env) and then drive the
// real code. These three rules are the ones where a regression silently
// corrupts or resurrects a student's progress rather than throwing, so none of
// them is visible in a browser until it has already happened to someone.
//
//   1. signOut() drops the local caches. syncWithRemote pushes "ids the
//      account is missing" under the CURRENT user id, so leaving A's set in
//      memory writes A's progress into B's account on a shared browser.
//   2. A reset recorded on another device wins over stale local data — that is
//      the whole point of the progress_reset marker (migration 0005).
//   3. The newId() fallback for non-secure contexts is a VALID uuid. attempts.id
//      is a uuid column, and pushAttempts sends the batch in one call, so one
//      bad id blocks every unsynced attempt for that user forever.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'test-sync-'));

// ---- the world ----
const store = new Map();
// A Proxy, not a plain object: hasSessionToRestore() looks for the supabase
// token with Object.keys(localStorage), which a methods-only stub answers with
// its own method names.
const api = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  key: i => [...store.keys()][i] ?? null,
  clear: () => store.clear(),
};
globalThis.localStorage = new Proxy(api, {
  get: (t, k) => (k === 'length' ? store.size : (k in t ? t[k] : store.get(k))),
  ownKeys: () => [...store.keys()],
  getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
});
globalThis.location = { hash: '', search: '', origin: 'https://example.test' };
// No crypto.randomUUID: this is exactly the non-secure-context case rule 3 is about.
Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });

// A Supabase stand-in. `rows` is the account's server state; `resetAt` is the
// marker row. Records what was written so the test can assert on pushes.
const server = { solved: new Set(), resetAt: null, pushed: [], deleted: [] };
let sessionUser = { id: 'user-a', email: 'a@example.test' };

writeFileSync(join(scratch, 'supabase.mjs'), `
const server = globalThis.__server;
const table = name => ({
  select() { return this; },
  eq(col, val) { this._eq = [col, val]; return this; },
  order() { return this; },
  limit() { return this; },
  maybeSingle() {
    if (name === 'progress_reset') {
      return Promise.resolve({ data: server.resetAt ? { reset_at: server.resetAt } : null, error: null });
    }
    return Promise.resolve({ data: null, error: null });
  },
  then(res) {
    const data = name === 'solved' ? [...server.solved].map(question_id => ({ question_id })) : [];
    return Promise.resolve({ data, error: null }).then(res);
  },
  upsert(rows) {
    server.pushed.push({ table: name, rows });
    if (name === 'solved') for (const r of [].concat(rows)) server.solved.add(r.question_id);
    if (name === 'progress_reset') server.resetAt = [].concat(rows)[0].reset_at;
    return Promise.resolve({ error: null });
  },
  delete() { return { eq: () => { server.deleted.push(name); if (name === 'solved') server.solved.clear();
                                  return Promise.resolve({ error: null }); },
                     match: () => Promise.resolve({ error: null }) }; },
});
export function createClient() {
  return {
    from: table,
    auth: {
      onAuthStateChange() {},
      getSession: () => Promise.resolve({ data: { session: globalThis.__session ? { user: globalThis.__session } : null } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}
`);
globalThis.__server = server;
globalThis.__session = sessionUser;

let src = ts.transpileModule(readFileSync(join(ROOT, 'src/progress.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
src = src.split('import.meta.env').join('({ VITE_SUPABASE_URL: "https://x.supabase.co", VITE_SUPABASE_ANON_KEY: "anon" })')
         .split("'@supabase/supabase-js'").join("'./supabase.mjs'");
writeFileSync(join(scratch, 'progress.mjs'), src);

const P = await import(pathToFileURL(join(scratch, 'progress.mjs')).href);

const fails = [];
const check = (name, cond) => { if (!cond) fails.push(name); };

// ---- 1. sign-out clears local progress ----
store.set('sb-x-auth-token', '{}');           // so initProgress restores a session
P.markSolved('qua-001');
P.markSolved('qua-002');
check('setup: marks are local', P.solvedCount() === 2);
await P.signOut();
check('signOut clears the solved set', P.solvedCount() === 0);
check('signOut clears localStorage', localStorage.getItem('chemprep_solved_v1') === null);

// ---- 2. a reset from another device beats stale local data ----
store.clear();
store.set('sb-x-auth-token', '{}');
globalThis.__session = sessionUser;
server.solved.clear();
P.markSolved('sto-001');
P.markSolved('sto-002');
// This device last synced an hour ago; the account was reset a minute ago.
localStorage.setItem('chemprep_synced_at_v1', String(Date.now() - 3600_000));
server.resetAt = new Date(Date.now() - 60_000).toISOString();
server.pushed.length = 0;
await P.initProgress();
check('a remote reset clears stale local progress', P.solvedCount() === 0);
check('a remote reset stops the stale push', !server.pushed.some(p => p.table === 'solved'));

// ---- 2b. and does NOT eat progress made since that reset ----
store.clear();
store.set('sb-x-auth-token', '{}');
server.solved.clear();
server.resetAt = new Date(Date.now() - 3600_000).toISOString();   // reset an hour ago
localStorage.setItem('chemprep_synced_at_v1', String(Date.now() - 60_000));  // synced since
P.markSolved('equ-001');
server.pushed.length = 0;
await P.initProgress();
check('progress made after the reset survives', P.isSolved('equ-001'));

// ---- 3. the newId fallback is a real uuid ----
P.recordAttempt('qua-001', true, { topic: 'quantum', chosen: 0 });
const id = P.recentAttempts(1)[0]?.id ?? '';
check('newId fallback is a valid uuid v4',
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id));

if (fails.length) {
  console.error(`sync gate: ${fails.length} failure(s):`);
  for (const f of fails) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('sync gate clean: sign-out isolation, remote-reset precedence, uuid fallback.');
