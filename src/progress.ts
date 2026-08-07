// Progress tracking: a binary "solved" set plus a richer attempt log.
// localStorage is the always-on cache (instant, offline); when the user is
// signed in to Supabase, progress syncs to per-user `solved` / `attempts`
// tables (protected by row-level security) so it follows them across devices.
// If the Supabase env vars are absent the app degrades gracefully to
// local-only tracking and must never crash.
//
// Why an attempt log and not just the solved set: quiz history, weak-topic
// tracking, streaks and personalised review are all aggregations over
// *attempts* (including the wrong ones), and the solved set throws away
// everything except the final success. See ROADMAP.md Phase A.3.
import type { SupabaseClient, User } from '@supabase/supabase-js';

const LS_KEY = 'chemprep_solved_v1';
const LS_ATTEMPTS = 'chemprep_attempts_v1';
const LS_MIGRATED = 'chemprep_idmigration_v1';

// The one-time text-hash -> explicit-id rename (registry.ts's
// migrateLegacyProgress) needs the WHOLE question corpus in memory to build its
// map — half a megabyte that a first-time visitor has nothing to migrate with.
// The flag lives here, beside the keys it guards, so main.ts can ask whether the
// work is needed before importing the registry at all.
export function needsIdMigration(): boolean {
  try { return !localStorage.getItem(LS_MIGRATED); } catch { return false; }
}
export function markIdMigrationDone(): void {
  try { localStorage.setItem(LS_MIGRATED, new Date().toISOString()); } catch { /* ignore */ }
}

// The local attempt log is CAPPED. At 149 bytes/row a committed student
// (50/day) would pass the ~5 MB localStorage quota in under two years, and
// exceeding it throws on every write. So localStorage keeps only a recent
// window for the history UI, while the bounded aggregates below (per-topic
// counters, active-day set, outstanding-wrong set) carry the statistics and
// stay small no matter how long someone studies. Signed-in users keep their
// full history server-side.
const MAX_ATTEMPTS = 1000;   // ~150 KB
const MAX_DAYS = 800;        // streaks over two years, ~9 KB
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

const cloudConfigured = !!(url && anon);

/**
 * The Supabase client is LOADED ON DEMAND, not at startup (ROADMAP D.10).
 *
 * Reading a lesson needs no account, but the client was constructed at module
 * load, so every visitor downloaded ~110 kB of auth machinery to look at a
 * page that never calls it. Now it arrives with the first thing that actually
 * needs a network round-trip: signing in, or restoring a session that already
 * exists.
 *
 * `isCloudConfigured()` stays synchronous — the sign-in UI has to know whether
 * to render at all, and that is answerable from the env vars alone.
 */
let clientPromise: Promise<SupabaseClient> | null = null;
function cloud(): Promise<SupabaseClient> | null {
  if (!cloudConfigured) return null;
  clientPromise ??= import('@supabase/supabase-js').then(m => {
    const sb = m.createClient(url!, anon!);
    // One listener per client, attached where the client is created so both
    // entry points (restore-on-load and sign-in) get it exactly once.
    sb.auth.onAuthStateChange((_event, session) => {
      const wasSignedIn = !!user;
      user = session?.user ?? null;
      if (user && !wasSignedIn) { void syncWithRemote(); void syncAttempts(); }
      fire();
    });
    return sb;
  });
  return clientPromise;
}

/**
 * Is there a session to restore? Supabase keeps it under `sb-<ref>-auth-token`
 * in localStorage; an OAuth or magic-link return instead carries the token in
 * the URL. Either means load the client at startup — anything else means a
 * signed-out reader, who should never pay for it.
 */
function hasSessionToRestore(): boolean {
  try {
    if (location.hash.includes('access_token') || new URLSearchParams(location.search).has('code')) return true;
    return Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  } catch { return false; }
}

let solved = new Set<string>();
let user: User | null = null;
const listeners = new Set<() => void>();

// ---- attempt log state (see MAX_ATTEMPTS note above) ----
export interface Attempt {
  id: string;              // client-generated uuid; makes re-push idempotent
  questionId: string;
  topic: string | null;    // null until the content model carries topics
  correct: boolean;
  chosen: number | null;   // which option index was picked, when known
  at: number;              // epoch ms
  synced: boolean;         // pushed to Supabase yet?
}
let attempts: Attempt[] = [];                                  // capped window
let totalAttempts = 0;                                         // lifetime count, survives the cap
let topicStats = new Map<string, { seen: number; correct: number }>();
let activeDays = new Set<string>();                            // 'YYYY-MM-DD', local
let outstandingWrong = new Set<string>();                      // wrong, not since corrected

function fire(): void { for (const cb of listeners) cb(); }

// Local calendar day, not UTC — a streak should follow the user's own midnight.
function dayKey(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function loadLocal(): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) solved = new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
}
function saveLocal(): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...solved])); } catch { /* ignore */ }
}

// ---- attempt log persistence ----
interface AttemptStore {
  attempts: Attempt[];
  total: number;
  topics: Record<string, [seen: number, correct: number]>;
  days: string[];
  wrong: string[];
}

function loadAttempts(): void {
  try {
    const raw = localStorage.getItem(LS_ATTEMPTS);
    if (!raw) return;
    const s = JSON.parse(raw) as Partial<AttemptStore>;
    attempts = Array.isArray(s.attempts) ? s.attempts : [];
    totalAttempts = typeof s.total === 'number' ? s.total : attempts.length;
    topicStats = new Map(Object.entries(s.topics ?? {}).map(([t, v]) => [t, { seen: v[0], correct: v[1] }]));
    activeDays = new Set(s.days ?? []);
    outstandingWrong = new Set(s.wrong ?? []);
  } catch { /* corrupt or unavailable — start clean rather than crash */ }
}

function saveAttempts(): void {
  const store: AttemptStore = {
    attempts: attempts.slice(-MAX_ATTEMPTS),
    total: totalAttempts,
    topics: Object.fromEntries([...topicStats].map(([t, v]) => [t, [v.seen, v.correct]])),
    days: [...activeDays].sort().slice(-MAX_DAYS),
    wrong: [...outstandingWrong],
  };
  try {
    localStorage.setItem(LS_ATTEMPTS, JSON.stringify(store));
  } catch {
    // Quota exceeded (or storage disabled). Shed the history window — the
    // aggregates are what the product actually depends on — and retry once.
    try {
      attempts = attempts.slice(-100);
      localStorage.setItem(LS_ATTEMPTS, JSON.stringify({ ...store, attempts }));
    } catch { /* give up silently; in-memory state still works this session */ }
  }
}

// Stable content-based id: FNV-1a hash of the question text → base36.
export function qid(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// ---- attempts: recording ----

// Called once per answered question (right or wrong). `topic` is optional
// because the content model does not carry topics on every question yet;
// attempts without one still count toward totals and streaks, they just
// can't be bucketed by topic.
export function recordAttempt(
  questionId: string,
  correct: boolean,
  opts: { topic?: string; chosen?: number } = {},
): void {
  const at = Date.now();
  const a: Attempt = {
    id: newId(),
    questionId,
    topic: opts.topic ?? null,
    correct,
    chosen: opts.chosen ?? null,
    at,
    synced: false,
  };
  attempts.push(a);
  totalAttempts++;
  if (attempts.length > MAX_ATTEMPTS) attempts = attempts.slice(-MAX_ATTEMPTS);

  if (a.topic) {
    const t = topicStats.get(a.topic) ?? { seen: 0, correct: 0 };
    t.seen++;
    if (correct) t.correct++;
    topicStats.set(a.topic, t);
  }
  activeDays.add(dayKey(at));
  if (correct) outstandingWrong.delete(questionId);
  else outstandingWrong.add(questionId);

  saveAttempts();
  fire();
  void pushAttempts([a]);
}

// crypto.randomUUID needs a secure context; fall back so a plain-http
// deployment or an old browser records attempts instead of throwing.
function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* fall through */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- attempts: derived views (all pure reads over the state above) ----

/** Lifetime attempts, not just the retained window. */
export function attemptCount(): number { return totalAttempts; }

/** Most recent first. */
export function recentAttempts(limit = 50): Attempt[] {
  return attempts.slice(-limit).reverse();
}

export function accuracyByTopic(): Record<string, { seen: number; correct: number; accuracy: number }> {
  const out: Record<string, { seen: number; correct: number; accuracy: number }> = {};
  for (const [topic, { seen, correct }] of topicStats) {
    out[topic] = { seen, correct, accuracy: seen === 0 ? 0 : correct / seen };
  }
  return out;
}

/**
 * Weakest topics, worst first. `minSeen` guards against a single unlucky
 * answer branding a topic as weak — one wrong answer out of one is 0%
 * accuracy but says nothing.
 */
export function weakTopics(n = 3, minSeen = 4): { topic: string; accuracy: number; seen: number }[] {
  return [...topicStats]
    .filter(([, t]) => t.seen >= minSeen)
    .map(([topic, t]) => ({ topic, accuracy: t.correct / t.seen, seen: t.seen }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n);
}

/**
 * Consecutive active days ending today (or yesterday — the day isn't over
 * yet, so a streak shouldn't break until a day is fully missed). Returns 0
 * once the gap is larger than that.
 */
export function streakDays(): number {
  if (activeDays.size === 0) return 0;
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - 864e5);
  let cursor = activeDays.has(today) ? today : activeDays.has(yesterday) ? yesterday : null;
  if (cursor === null) return 0;
  let streak = 0;
  // Walk backwards a day at a time while the log has that day. The T12:00:00
  // anchor is deliberate and load-bearing: subtracting a flat 864e5 ms from
  // local MIDNIGHT lands on 23:00 the previous day across a spring-forward
  // boundary, skipping a calendar day and truncating the streak. Anchored at
  // noon, a ±1 h shift still lands inside the same day. Verified in
  // America/New_York, America/Los_Angeles, Europe/London, Australia/Sydney and
  // Pacific/Auckland across both 2026 transitions.
  for (let t = new Date(cursor + 'T12:00:00').getTime(); activeDays.has(dayKey(t)); t -= 864e5) streak++;
  return streak;
}

/** Questions whose most recent answer was wrong — the personalised review set. */
export function wrongQuestionIds(): string[] { return [...outstandingWrong]; }

/**
 * Rewrite every stored question id through `map`. This is the migration
 * mechanism for Phase A.2: when questions gain explicit ids, progress
 * recorded under the old text-hash ids has to follow, or every existing user
 * silently loses their history. Unmapped ids are left untouched, so running
 * this with a partial map is safe.
 */
export function remapProgressIds(map: Record<string, string>): number {
  let changed = 0;
  const remapSet = (s: Set<string>) => {
    const next = new Set<string>();
    for (const id of s) {
      const to = map[id];
      if (to && to !== id) changed++;
      next.add(to ?? id);
    }
    return next;
  };
  solved = remapSet(solved);
  outstandingWrong = remapSet(outstandingWrong);
  for (const a of attempts) {
    const to = map[a.questionId];
    if (to && to !== a.questionId) { a.questionId = to; a.synced = false; changed++; }
  }
  if (changed > 0) {
    saveLocal();
    saveAttempts();
    fire();
    void pushSolvedFull();
    void pushAttempts(attempts.filter(a => !a.synced));
  }
  return changed;
}

export function isSolved(id: string): boolean { return solved.has(id); }
export function solvedCount(): number { return solved.size; }
export function solvedOf(ids: string[]): number { return ids.reduce((n, id) => n + (solved.has(id) ? 1 : 0), 0); }
export function onProgressChange(cb: () => void): void { listeners.add(cb); }

export function markSolved(id: string): void {
  if (solved.has(id)) return;
  solved.add(id);
  saveLocal();
  fire();
  if (user) void cloud()?.then(sb => sb.from('solved').upsert({ user_id: user!.id, question_id: id }))
    .then(res => { if (res?.error) console.warn('sync (upsert) failed:', res.error.message); });
}

export function unmarkSolved(id: string): void {
  if (!solved.has(id)) return;
  solved.delete(id);
  saveLocal();
  fire();
  if (user) void cloud()?.then(sb => sb.from('solved').delete().match({ user_id: user!.id, question_id: id }))
    .then(res => { if (res?.error) console.warn('sync (delete) failed:', res.error.message); });
}

// ---- auth ----
export function isCloudConfigured(): boolean { return cloudConfigured; }
export function currentEmail(): string | null { return user?.email ?? null; }

export async function signInWithEmail(email: string): Promise<{ ok: boolean; msg: string }> {
  const sb = await cloud();
  if (!sb) return { ok: false, msg: 'Cloud sync is not configured.' };
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  return error
    ? { ok: false, msg: error.message }
    : { ok: true, msg: `Magic link sent to ${email}. Open it on any device to sign in.` };
}

// Redirects the browser to Google's consent screen; on success the user
// returns here already signed in (onAuthStateChange picks it up). Requires
// the Google provider to be enabled in Supabase (Authentication → Providers).
export async function signInWithGoogle(): Promise<{ ok: boolean; msg: string }> {
  const sb = await cloud();
  if (!sb) return { ok: false, msg: 'Cloud sync is not configured.' };
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return error ? { ok: false, msg: error.message } : { ok: true, msg: 'Redirecting to Google…' };
}

export async function signOut(): Promise<void> {
  const sb = await cloud();
  if (!sb) return;
  await sb.auth.signOut();
  user = null;
  fire();
}

// Merge remote rows with the local set, and push any local-only ids up so
// progress recorded while signed out (or on another device) isn't lost.
async function syncWithRemote(): Promise<void> {
  const sb = user ? await cloud() : null;
  if (!sb || !user) return;
  const { data, error } = await sb.from('solved').select('question_id').eq('user_id', user.id);
  if (error) { console.warn('sync (fetch) failed:', error.message); return; }
  const remote = new Set((data ?? []).map(r => r.question_id as string));
  const localOnly = [...solved].filter(id => !remote.has(id));
  for (const id of remote) solved.add(id);
  saveLocal();
  fire();
  if (localOnly.length) {
    const rows = localOnly.map(question_id => ({ user_id: user!.id, question_id }));
    const { error: upErr } = await sb.from('solved').upsert(rows);
    if (upErr) console.warn('sync (push) failed:', upErr.message);
  }
}

// Re-push the whole solved set (used after an id remap rewrote it).
async function pushSolvedFull(): Promise<void> {
  const sb = user && solved.size ? await cloud() : null;
  if (!sb || !user) return;
  const rows = [...solved].map(question_id => ({ user_id: user!.id, question_id }));
  const { error } = await sb.from('solved').upsert(rows);
  if (error) console.warn('solved re-push failed:', error.message);
}

// ---- attempts: remote sync ----
// Attempts are append-only, so unlike the solved set there is nothing to
// merge — but a retried push must not duplicate rows, which is why each
// attempt carries a client-generated uuid primary key and this upserts.
async function pushAttempts(rows: Attempt[]): Promise<void> {
  const sb = user && rows.length ? await cloud() : null;
  if (!sb || !user) return;
  const payload = rows.map(a => ({
    id: a.id,
    user_id: user!.id,
    question_id: a.questionId,
    topic: a.topic,
    correct: a.correct,
    chosen: a.chosen,
    answered_at: new Date(a.at).toISOString(),
  }));
  const { error } = await sb.from('attempts').upsert(payload);
  if (error) { console.warn('attempt sync failed:', error.message); return; }
  const pushed = new Set(rows.map(r => r.id));
  for (const a of attempts) if (pushed.has(a.id)) a.synced = true;
  saveAttempts();
}

// On sign-in, pull the recent remote window and rebuild the aggregates from
// the union of local and remote. Aggregates are recomputed rather than added
// to, so a device that already counted an attempt locally and then sees the
// same row come back from the server doesn't double-count it.
async function syncAttempts(): Promise<void> {
  const sb = user ? await cloud() : null;
  if (!sb || !user) return;
  const { data, error } = await sb
    .from('attempts')
    .select('id, question_id, topic, correct, chosen, answered_at')
    .eq('user_id', user.id)
    .order('answered_at', { ascending: false })
    .limit(MAX_ATTEMPTS);
  if (error) { console.warn('attempt fetch failed:', error.message); return; }

  const byId = new Map<string, Attempt>();
  for (const a of attempts) byId.set(a.id, a);
  for (const r of data ?? []) {
    const row = r as { id: string; question_id: string; topic: string | null; correct: boolean; chosen: number | null; answered_at: string };
    if (byId.has(row.id)) { byId.get(row.id)!.synced = true; continue; }
    byId.set(row.id, {
      id: row.id, questionId: row.question_id, topic: row.topic, correct: row.correct,
      chosen: row.chosen, at: Date.parse(row.answered_at), synced: true,
    });
  }
  const merged = [...byId.values()].sort((x, y) => x.at - y.at);
  const unsynced = merged.filter(a => !a.synced);

  attempts = merged.slice(-MAX_ATTEMPTS);
  // The remote window is authoritative for the aggregates only when it is not
  // truncated; if the server has more history than we fetched, keep whichever
  // lifetime total is larger rather than shrinking the user's counter.
  totalAttempts = Math.max(totalAttempts, merged.length);
  topicStats = new Map();
  activeDays = new Set();
  outstandingWrong = new Set();
  for (const a of merged) {
    if (a.topic) {
      const t = topicStats.get(a.topic) ?? { seen: 0, correct: 0 };
      t.seen++; if (a.correct) t.correct++;
      topicStats.set(a.topic, t);
    }
    activeDays.add(dayKey(a.at));
    if (a.correct) outstandingWrong.delete(a.questionId);
    else outstandingWrong.add(a.questionId);
  }
  saveAttempts();
  fire();
  await pushAttempts(unsynced);
}

export async function initProgress(): Promise<void> {
  loadLocal();
  loadAttempts();
  fire();
  if (!cloudConfigured || !hasSessionToRestore()) return;
  const sb = await cloud();
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  user = data.session?.user ?? null;
  if (user) { await syncWithRemote(); await syncAttempts(); }
}
