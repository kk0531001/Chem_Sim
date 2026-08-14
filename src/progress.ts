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
import type { Database } from './database.types';

const LS_KEY = 'chemprep_solved_v1';
const LS_ATTEMPTS = 'chemprep_attempts_v1';
const LS_MIGRATED = 'chemprep_idmigration_v1';
const LS_BOOKMARKS = 'chemprep_bookmarks_v1';
// When this device last completed a sync. Compared against the account's reset
// marker to tell "I have offline progress worth uploading" from "I am holding
// data the user already deleted from another device". See honourRemoteReset().
const LS_SYNCED = 'chemprep_synced_at_v1';

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
let clientPromise: Promise<SupabaseClient<Database>> | null = null;
function cloud(): Promise<SupabaseClient<Database>> | null {
  if (!cloudConfigured) return null;
  clientPromise ??= import('@supabase/supabase-js').then(m => {
    const sb = m.createClient<Database>(url!, anon!);
    // One listener per client, attached where the client is created so both
    // entry points (restore-on-load and sign-in) get it exactly once.
    sb.auth.onAuthStateChange((_event, session) => {
      const wasSignedIn = !!user;
      user = session?.user ?? null;
      if (user && !wasSignedIn) void syncAll();
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
// Bookmarks hold BOTH question ids and module ids in one set. They never
// collide (question ids are `<prefix>-<nnn>`, module ids are bare words) and a
// bookmark means the same thing either way: "come back to this". A second
// store, a second table and a second sync path would buy nothing.
let bookmarks = new Set<string>();
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

function loadBookmarks(): void {
  try {
    const raw = localStorage.getItem(LS_BOOKMARKS);
    if (raw) bookmarks = new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
}
function saveBookmarks(): void {
  try { localStorage.setItem(LS_BOOKMARKS, JSON.stringify([...bookmarks])); } catch { /* ignore */ }
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
  // The fallback must still be a SYNTACTICALLY VALID uuid: attempts.id is a
  // `uuid` column, so anything else is rejected with 22P02 — and pushAttempts
  // sends the whole unsynced array in one call, so a single bad id would block
  // every other attempt in that batch from ever syncing, permanently.
  const b = new Array(16).fill(0).map(() => Math.floor(Math.random() * 256));
  b[6] = (b[6] & 0x0f) | 0x40;          // version 4
  b[8] = (b[8] & 0x3f) | 0x80;          // variant 1
  const hex = b.map(x => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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
 * Accuracy per SKILL — the sub-skill level under a topic.
 *
 * Two things make this different from `accuracyByTopic` and both are
 * deliberate.
 *
 * (1) It takes a resolver rather than reading a skill off the attempt. An
 * attempt stores a question id, not a skill, so nothing that has already been
 * written goes stale when a question is re-tagged or the taxonomy is renamed —
 * the join happens at read time, against the corpus as it is now. It also
 * keeps this file free of any dependency on the content registry.
 *
 * (2) It is a RECENT-WINDOW statistic, not a lifetime one, and the return type
 * says so. `topicStats` is a bounded aggregate that can back a lifetime figure;
 * there is no such aggregate for skills and adding one would mean a stored
 * counter per skill, which is exactly what this file's rules push back on. So
 * this reads the capped attempt log (MAX_ATTEMPTS) and reports what it is: the
 * last N answers. Do not present it as "all time".
 */
export function accuracyBySkill(
  skillOf: (questionId: string) => string | undefined,
): { skill: string; seen: number; correct: number; accuracy: number }[] {
  const acc = new Map<string, { seen: number; correct: number }>();
  for (const a of attempts) {
    const skill = skillOf(a.questionId);
    if (!skill) continue;                 // untagged: absent, never bucketed as "other"
    const e = acc.get(skill) ?? { seen: 0, correct: 0 };
    e.seen++;
    if (a.correct) e.correct++;
    acc.set(skill, e);
  }
  return [...acc]
    .map(([skill, e]) => ({ skill, ...e, accuracy: e.seen === 0 ? 0 : e.correct / e.seen }))
    .sort((x, y) => x.accuracy - y.accuracy);
}

/**
 * Weakest topics, worst first. `minSeen` guards against a single unlucky
 * answer branding a topic as weak — one wrong answer out of one is 0%
 * accuracy but says nothing.
 */
export function weakTopics(n = 3, minSeen = 4): { topic: string; accuracy: number; seen: number }[] {
  return [...topicStats]
    .filter(([, t]) => t.seen >= minSeen)
    .map(([topic, t]) => ({ topic, accuracy: t.correct / t.seen, seen: t.seen, rank: weaknessRank(t.correct, t.seen) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, n)
    .map(({ topic, accuracy, seen }) => ({ topic, accuracy, seen }));
}

/**
 * How confidently weak a score is — the UPPER bound of the Wilson score
 * interval for `correct/seen`. Lower value = weaker with more evidence behind
 * it, so sorting ascending puts the topic worth studying first.
 *
 * Raw accuracy was the wrong sort key: 1 correct of 4 (25%) outranked 12 of 40
 * (30%) and sent a student to a topic they had barely touched, on the strength
 * of three unlucky answers. `minSeen` alone cannot fix that — it only moves
 * where the noise starts.
 *
 * UPPER bound, not lower, and the direction is the whole subtlety. The lower
 * bound asks "how bad could this be", which small samples always answer
 * "very", and would have made the noise problem worse. The upper bound asks
 * "how good could this plausibly be" — a topic is confidently weak only when
 * even its optimistic reading is poor. 12/40 gives ~0.45, 1/4 gives ~0.70, so
 * the well-evidenced weakness now wins.
 *
 * z = 1.28 is the 80% one-sided level: this ranks a study list, it does not
 * publish a finding, and a stricter z just makes small samples inert.
 */
function weaknessRank(correct: number, seen: number): number {
  if (seen <= 0) return 1;
  const z = 1.28;
  const p = correct / seen;
  const z2 = z * z;
  const denom = 1 + z2 / seen;
  const centre = p + z2 / (2 * seen);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * seen)) / seen);
  return (centre + margin) / denom;
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

/**
 * The longest run of consecutive active days ever recorded, anywhere in the
 * log — the number `streakDays()` is measured against.
 *
 * Walks the day KEYS (which are kept for MAX_DAYS ≈ two years) rather than the
 * attempt window, so it survives the attempt cap. Same noon anchor as
 * `streakDays`, for the same daylight-saving reason.
 */
export function bestStreak(): number {
  const days = [...activeDays].sort();
  let best = 0, run = 0, prev = '';
  for (const d of days) {
    const expected = prev ? dayKey(new Date(prev + 'T12:00:00').getTime() + 864e5) : '';
    run = d === expected ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

/**
 * Answers per calendar day for the last `n` days, oldest first — the activity
 * sparkline.
 *
 * Counted from the retained attempt WINDOW, not the lifetime aggregates, which
 * hold no per-day counts. That window is capped (MAX_ATTEMPTS), so a student
 * who answered more than a thousand questions inside the span will see the
 * earliest days of it undercounted. The alternative is a per-day counter kept
 * forever; a sparkline is not worth new permanent state.
 */
export function dailyCounts(n = 30): { day: string; n: number }[] {
  const byDay = new Map<string, number>();
  for (const a of attempts) byDay.set(dayKey(a.at), (byDay.get(dayKey(a.at)) ?? 0) + 1);
  const out: { day: string; n: number }[] = [];
  const noon = new Date(dayKey(Date.now()) + 'T12:00:00').getTime();
  for (let i = n - 1; i >= 0; i--) {
    const day = dayKey(noon - i * 864e5);
    out.push({ day, n: byDay.get(day) ?? 0 });
  }
  return out;
}

/** Questions whose most recent answer was wrong — the personalised review set. */
/**
 * Per-QUESTION accuracy over the attempt window (plan2 §6).
 *
 * `seen` here is answers, not questions: a question answered three times
 * contributes three. That is the point — the interesting signal is a question
 * a student keeps coming back to and keeps getting wrong.
 *
 * Read the window, not a lifetime record. Unlike `topicStats`, this is NOT
 * kept as a bounded aggregate: a per-question counter over 972 questions is
 * exactly the unbounded growth MAX_ATTEMPTS exists to prevent, and "which
 * questions am I currently missing" is a question about recent work anyway.
 */
export function accuracyByQuestion(): Map<string, { seen: number; correct: number }> {
  const out = new Map<string, { seen: number; correct: number }>();
  for (const a of attempts) {
    const e = out.get(a.questionId) ?? { seen: 0, correct: 0 };
    e.seen++;
    if (a.correct) e.correct++;
    out.set(a.questionId, e);
  }
  return out;
}

/**
 * Questions missed REPEATEDLY and still outstanding, worst first.
 *
 * One wrong answer is a slip; the same question wrong twice is a gap in what
 * the student believes, and it is a different thing to show them than the
 * general review queue. Ordering is by wrong count, then by how recently it
 * last bit them.
 */
export function repeatedlyMissed(minWrong = 2): { id: string; wrong: number; seen: number; lastAt: number }[] {
  const agg = new Map<string, { wrong: number; seen: number; lastAt: number }>();
  for (const a of attempts) {
    const e = agg.get(a.questionId) ?? { wrong: 0, seen: 0, lastAt: 0 };
    e.seen++;
    if (!a.correct) { e.wrong++; e.lastAt = Math.max(e.lastAt, a.at); }
    agg.set(a.questionId, e);
  }
  return [...agg]
    .filter(([id, e]) => e.wrong >= minWrong && outstandingWrong.has(id))
    .map(([id, e]) => ({ id, ...e }))
    .sort((x, y) => y.wrong - x.wrong || y.lastAt - x.lastAt);
}

/**
 * Weakest SKILLS, worst first — the sub-topic sibling of `weakTopics`.
 *
 * `minSeen` matters more here than at topic level, because a skill bucket is
 * smaller: one unlucky answer out of one is 0% accuracy and says nothing at
 * all. Untagged questions are absent rather than pooled (see accuracyBySkill),
 * so a half-tagged corpus reports less, never wrong.
 */
export function weakSkills(
  skillOf: (questionId: string) => string | undefined,
  n = 3,
  minSeen = 4,
): { skill: string; accuracy: number; seen: number }[] {
  return accuracyBySkill(skillOf)
    .filter(r => r.seen >= minSeen)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n)
    .map(({ skill, accuracy, seen }) => ({ skill, accuracy, seen }));
}

/**
 * The review queue narrowed to one skill — "practise the thing you are
 * actually weak at" rather than "practise everything you got wrong".
 */
export function reviewQueueForSkill(
  skillOf: (questionId: string) => string | undefined,
  skill: string,
): string[] {
  return reviewQueue().filter(id => skillOf(id) === skill);
}

export function wrongQuestionIds(): string[] { return [...outstandingWrong]; }

/**
 * The same set, ordered OLDEST MISTAKE FIRST — the review queue (ROADMAP F.4).
 *
 * Order is the whole feature. Reviewing your most recent mistakes is just
 * re-reading the page you closed a minute ago; the ones worth returning to are
 * the ones you got wrong long enough ago to have forgotten why.
 *
 * A question's age is the time of its most recent WRONG answer. The attempt
 * window is capped, so some outstanding-wrong ids have no attempt left in it —
 * those sort oldest, which is not a fallback but the correct answer: falling
 * out of a 1000-attempt window is itself evidence that the mistake is old.
 */
export function reviewQueue(): string[] {
  const lastWrong = new Map<string, number>();
  // `attempts` is ascending by time, so the last write per id wins.
  for (const a of attempts) {
    if (!a.correct && outstandingWrong.has(a.questionId)) lastWrong.set(a.questionId, a.at);
  }
  return [...outstandingWrong].sort((x, y) => (lastWrong.get(x) ?? 0) - (lastWrong.get(y) ?? 0));
}

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

/**
 * How many solved questions came from one id namespace — `solvedOf` for
 * callers that must not load the questions to enumerate their ids.
 *
 * The topic cards need this: they render on the homepage, which is barred from
 * importing the corpus (ROADMAP D.10). Every question id is minted
 * `<namespace>-<nnn>` and `checkTables()` in topicIds.ts guarantees the
 * namespaces are unique, so the prefix identifies the bank on its own.
 */
export function solvedWithPrefix(prefix: string): number {
  let n = 0;
  const p = prefix + '-';
  for (const id of solved) if (id.startsWith(p)) n++;
  return n;
}
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

// ---- bookmarks ----
// Same shape as the solved set: local first, upsert/delete on the row when
// signed in, and a full merge on sign-in. Nothing here may throw when cloud
// sync is unconfigured.
export function isBookmarked(id: string): boolean { return bookmarks.has(id); }
export function bookmarkIds(): string[] { return [...bookmarks]; }
export function bookmarkCount(): number { return bookmarks.size; }

export function toggleBookmark(id: string): boolean {
  const on = !bookmarks.has(id);
  if (on) bookmarks.add(id); else bookmarks.delete(id);
  saveBookmarks();
  fire();
  if (user) {
    void cloud()?.then(sb => on
      ? sb.from('bookmarks').upsert({ user_id: user!.id, question_id: id })
      : sb.from('bookmarks').delete().match({ user_id: user!.id, question_id: id }))
      .then(res => { if (res?.error) console.warn('bookmark sync failed:', res.error.message); });
  }
  return on;
}

async function syncBookmarks(): Promise<void> {
  const sb = user ? await cloud() : null;
  if (!sb || !user) return;
  const { data, error } = await sb.from('bookmarks').select('question_id').eq('user_id', user.id);
  if (error) { console.warn('bookmark fetch failed:', error.message); return; }
  const remote = new Set((data ?? []).map(r => r.question_id));
  const localOnly = [...bookmarks].filter(id => !remote.has(id));
  for (const id of remote) bookmarks.add(id);
  saveBookmarks();
  fire();
  if (localOnly.length) {
    const { error: upErr } = await sb.from('bookmarks')
      .upsert(localOnly.map(question_id => ({ user_id: user!.id, question_id })));
    if (upErr) console.warn('bookmark push failed:', upErr.message);
  }
}

// ---- where the student was ---------------------------------------------
/**
 * The last module opened, so a reload can offer to continue it.
 *
 * DEVICE-LOCAL and deliberately not synced: "where I was" is a property of the
 * tab you left open, not of the account — pushing it to the cloud would mean a
 * phone opened at breakfast rewriting the laptop's Continue button.
 *
 * How far through the module the student is stays UNSTORED: it is already
 * recorded by the solved set, and `moduleProgress(id)` in topics.ts turns that
 * into done/total. A second copy of that number here would be one more thing
 * to keep in sync, and it would go stale the moment a question is answered
 * from search or from the question bank.
 *
 * What IS stored is which SECTION of each module was open, because nothing
 * else records it — a topic is a sequence of routed pages now, and "continue"
 * that dropped you back on the overview would be asking you to find your place
 * again. Kept per topic, not just for the last one, so re-entering any module
 * from the sidebar resumes it too. At most 25 short strings.
 */
const LS_LAST = 'chemprep_lasttopic_v1';
export interface LastTopic { id: string; at: number; section?: string }
interface LastStore { id: string; at: number; sections?: Record<string, string> }

function readLast(): LastStore | null {
  try {
    const raw = localStorage.getItem(LS_LAST);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<LastStore>;
    // Anything unparseable is treated as absent rather than repaired: the cost
    // is one forgotten place, and a corrupt value must never take the homepage
    // down with it.
    return typeof v?.id === 'string' && typeof v.at === 'number'
      ? { id: v.id, at: v.at, sections: typeof v.sections === 'object' && v.sections ? v.sections : {} }
      : null;
  } catch { return null; }
}

export function setLastTopic(id: string, section?: string): void {
  const prev = readLast();
  const sections = { ...prev?.sections };
  // A bare /topic/<slug> arrives here before the page canonicalises itself to
  // a section, so `section` is undefined for one call. Don't let that erase
  // the place we already know — the canonicalising navigation calls straight
  // back with the real slug.
  if (section) sections[id] = section;
  try { localStorage.setItem(LS_LAST, JSON.stringify({ id, at: Date.now(), sections })); } catch { /* ignore */ }
  fire();
}

export function lastTopic(): LastTopic | null {
  const v = readLast();
  return v ? { id: v.id, at: v.at, section: v.sections?.[v.id] } : null;
}

/** Which section of `id` the student had open, if they have opened it before. */
export function lastSection(id: string): string | null {
  return readLast()?.sections?.[id] ?? null;
}

// ---- auth ----
/**
 * Erase EVERYTHING the student has done: solved questions, simulation
 * missions, the attempt log and its aggregates, bookmarks, and the
 * resume-where-you-left-off markers. Irreversible.
 *
 * Missions need no special handling — `missionLadder` records them through
 * `markSolved` with `msn-…` ids, so they live in the solved set and go with it.
 *
 * ORDER MATTERS, and getting it backwards is the bug this function exists to
 * avoid. Clearing locally first and deleting in the cloud second means that a
 * sync firing in between — or a reload before the delete lands — repopulates
 * everything from the server, and the reset silently does nothing. So the
 * cloud rows go FIRST and are awaited; local state is only cleared once the
 * server has actually forgotten.
 *
 * If the cloud delete fails, local data is deliberately left ALONE and the
 * failure is returned. A half-reset that wipes this device while the server
 * still holds everything is worse than no reset: the next sign-in restores it
 * and the student cannot tell what happened.
 *
 * Deliberately NOT cleared, because none of it is progress: the competition
 * mode (`chemprep_mode_v1`, a preference), the open sidebar groups
 * (`chemprep.nav.open`, UI state), and the id-migration marker
 * (`chemprep_idmigration_v1`, a one-time schema flag).
 */
export interface ResetResult { cloud: 'skipped' | 'cleared' | 'failed'; error?: string }

export async function resetAllProgress(): Promise<ResetResult> {
  let cloudState: ResetResult['cloud'] = 'skipped';

  if (user) {
    const sb = await cloud();
    if (sb) {
      const uid = user.id;
      const results = await Promise.all([
        sb.from('solved').delete().eq('user_id', uid),
        sb.from('attempts').delete().eq('user_id', uid),
        sb.from('bookmarks').delete().eq('user_id', uid),
      ]);
      const failed = results.find(r => r.error);
      if (failed?.error) return { cloud: 'failed', error: failed.error.message };

      // Record the deletion itself, so the user's OTHER devices drop their
      // copies instead of pushing them back up. Written after the deletes
      // succeed: a marker without the deletes would clear other devices while
      // this account still held the rows.
      const { error: markErr } = await sb.from('progress_reset')
        .upsert({ user_id: uid, reset_at: new Date().toISOString() });
      if (markErr) console.warn('reset marker write failed:', markErr.message);

      cloudState = 'cleared';
    }
  }

  clearLocal();
  // This device is now in step with the account, so its next load must not
  // treat the marker it just wrote as somebody else's reset.
  markSynced();
  fire();
  return { cloud: cloudState };
}

/**
 * Drop every local trace of one person's progress. Used by resetAllProgress
 * (after it has cleared the cloud side) and by signOut (which must NOT touch
 * the cloud — the account keeps its rows).
 *
 * signOut needs it because syncWithRemote() pushes `localOnly` — the ids in
 * the local set that the account does not have — up under the CURRENT user's
 * id. Leave A's progress in memory across a sign-out and B's sign-in writes
 * A's solved questions into B's account. Same for the unsynced attempt queue.
 */
function clearLocal(): void {
  solved = new Set();
  bookmarks = new Set();
  attempts = [];
  totalAttempts = 0;
  topicStats = new Map();
  activeDays = new Set();
  outstandingWrong = new Set();

  for (const k of [LS_KEY, LS_ATTEMPTS, LS_BOOKMARKS, LS_LAST]) {
    try { localStorage.removeItem(k); } catch { /* private mode — in-memory reset still stands */ }
  }
}

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
  clearLocal();
  fire();
}

/**
 * Did the account get reset from another device since this one last synced?
 *
 * This has to run BEFORE any of the three syncs, because each of them merges by
 * union and then uploads whatever the account is missing — which, after a
 * reset, is everything this device still holds. Without the marker the reset
 * undoes itself on the next page load of any other signed-in device, while the
 * UI claims it deleted from all of them (progressPage.ts).
 *
 * Fails OPEN: a missing table, an offline fetch or an unreadable timestamp
 * leaves local data alone. Wrongly keeping progress is recoverable; wrongly
 * deleting it is not.
 */
async function honourRemoteReset(): Promise<void> {
  const sb = user ? await cloud() : null;
  if (!sb || !user) return;
  const { data, error } = await sb.from('progress_reset').select('reset_at').eq('user_id', user.id).maybeSingle();
  if (error) { console.warn('reset marker check failed:', error.message); return; }
  const resetAt = data?.reset_at ? Date.parse(data.reset_at) : NaN;
  if (!Number.isFinite(resetAt)) { markSynced(); return; }

  let lastSync = 0;
  try { lastSync = Number(localStorage.getItem(LS_SYNCED)) || 0; } catch { /* private mode */ }
  // No recorded sync means a fresh browser, which has nothing of its own to
  // protect — treat the reset as authoritative.
  if (resetAt > lastSync) clearLocal();
  markSynced();
}

function markSynced(): void {
  try { localStorage.setItem(LS_SYNCED, String(Date.now())); } catch { /* private mode */ }
}

/**
 * The one sync entry point. The reset check must complete first — see
 * honourRemoteReset — and the three merges are independent after that.
 */
async function syncAll(): Promise<void> {
  await honourRemoteReset();
  await Promise.all([syncWithRemote(), syncAttempts(), syncBookmarks()]);
}

// Merge remote rows with the local set, and push any local-only ids up so
// progress recorded while signed out (or on another device) isn't lost.
async function syncWithRemote(): Promise<void> {
  const sb = user ? await cloud() : null;
  if (!sb || !user) return;
  const { data, error } = await sb.from('solved').select('question_id').eq('user_id', user.id);
  if (error) { console.warn('sync (fetch) failed:', error.message); return; }
  const remote = new Set((data ?? []).map(r => r.question_id));
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
  loadBookmarks();
  fire();
  if (!cloudConfigured || !hasSessionToRestore()) return;
  const sb = await cloud();
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  user = data.session?.user ?? null;
  if (user) await syncAll();
}
