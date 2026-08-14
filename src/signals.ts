// Feedback loops (ROADMAP I.2) — the things that capture what a real student
// hits, so that recruiting users produces information rather than silence.
//
// FOUR kinds of row in ONE `signals` table:
//   view      ref = topic id     n = seconds spent      "opened, and abandoned after 4s"
//   quiz      ref = question id  n = answered so far    "everyone stops at question 12"
//   explain   ref = question id  note = yes | no        the helpful / not-helpful verdict
//   feedback  ref = path         note = free text       the bug report form
// Four tables would be four RLS policies and four insert paths for what is one
// append-only stream that nobody queries from the client.
//
// This does NOT go through the Supabase client. progress.ts loads that lazily
// because it is ~110 kB of auth machinery (D.10), and logging "a page was
// opened" must not drag it in for a visitor who never signs in. PostgREST is
// plain HTTP: one fetch, the publishable anon key, insert-only by policy.
//
// Privacy (I.2 asks for "lightweight, privacy-respecting"):
//   · no user id, no cookie, no fingerprint — a random per-TAB id from
//     sessionStorage, which dies with the tab and cannot follow anyone
//   · nothing free-text is collected except what someone typed into the
//     feedback box on purpose
//   · Do Not Track / Global Privacy Control silences the passive analytics.
//     Deliberate acts — pressing "Not helpful", sending a bug report — are
//     still sent, because suppressing those would just discard the message the
//     user chose to send.
//
// WRITE-ONLY, and that is a security property, not an accident (revamp.md S1).
// The `note` column holds the one genuinely user-authored string on the site —
// whatever someone typed into the feedback box. It can never reach anyone's
// DOM: the table has an insert policy and deliberately NO select policy
// (SUPABASE_SETUP.md §2d), this module exports no reader, and nothing else in
// src/ imports anything from it but `signal`/`flush`/`viewTopic`/
// `reportQuizzes`/`registerQuizReporter`. Adding a read path here would put
// attacker-authored text in front of the ~108 innerHTML call sites in the app,
// so if one is ever added it must escape at that point — not downstream.
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = !!(url && anon);

export type SignalKind = 'view' | 'quiz' | 'explain' | 'feedback';

/** Passive measurement the visitor did not ask for. `explain`/`feedback` are
 *  things they pressed a button to say, so they are not "tracking". */
const PASSIVE: SignalKind[] = ['view', 'quiz'];

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1' || nav.msDoNotTrack === '1';
}

/** Per-tab, not per-person: sessionStorage is cleared when the tab closes. It
 *  exists only so one visit's rows can be read as one visit. */
function sessionId(): string {
  try {
    let id = sessionStorage.getItem('cp-session');
    if (!id) sessionStorage.setItem('cp-session', id = crypto.randomUUID());
    return id;
  } catch { return 'anon'; }
}

interface Row { kind: SignalKind; ref: string; n: number | null; note: string | null; session: string }
let pending: Row[] = [];
let timer: number | undefined;

/**
 * Queue one signal. Never throws, never blocks, never reports failure to the
 * user: this is instrumentation, and a student mid-question must not see a
 * network error because a page-view row did not land.
 */
export function signal(kind: SignalKind, ref: string, opts: { n?: number; note?: string } = {}): void {
  if (!configured) return;
  if (PASSIVE.includes(kind) && optedOut()) return;
  pending.push({
    kind,
    ref: ref.slice(0, 200),
    n: opts.n ?? null,
    // Matches the length check on the column. Truncating here keeps a long
    // paste from being rejected wholesale — half a bug report beats none.
    note: opts.note?.slice(0, 2000) ?? null,
    session: sessionId(),
  });
  // Batched, so a student clicking through a quiz is a few requests rather than
  // one per interaction. Short enough that leaving the page rarely races it —
  // and flush() runs on pagehide anyway.
  clearTimeout(timer);
  timer = setTimeout(flush, 2000) as unknown as number;
}

/** Send whatever is queued. Safe to call at any time, including on unload. */
export function flush(): void {
  if (!pending.length) return;
  const rows = pending;
  pending = [];
  clearTimeout(timer);
  // keepalive lets the request outlive the page — the whole point at pagehide.
  // Its body limit is 64 kB, far above anything this queue holds.
  void fetch(`${url}/rest/v1/signals`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: anon!,
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  }).catch(() => { /* instrumentation is never worth an error to the reader */ });
}

// ---- topic dwell time ------------------------------------------------------
//
// One row per visit to a topic, written when the student LEAVES it, carrying
// how long they stayed. That answers both of I.2's questions with one row:
// a row existing means the topic was opened, and a small `n` means it was
// abandoned. Writing a row on open as well would double the volume to learn
// nothing that is not already in the timestamp.
let openTopic: { id: string; at: number } | null = null;

export function viewTopic(id: string | null): void {
  if (openTopic && openTopic.id !== id) {
    const seconds = Math.round((Date.now() - openTopic.at) / 1000);
    signal('view', openTopic.id, { n: seconds });
    openTopic = null;
  }
  if (id && !openTopic) openTopic = { id, at: Date.now() };
}

// ---- quiz progress ---------------------------------------------------------
//
// Where students STOP. Each live quiz registers a reporter; they are all polled
// when the page goes away or the topic changes. Registration is bounded the
// same way `QUIZZES` in framework.ts is: tabs mount at most once each.
type QuizReporter = () => { ref: string; answered: number } | null;
const reporters: QuizReporter[] = [];

export function registerQuizReporter(r: QuizReporter): void { reporters.push(r); }

/** Report every quiz that was actually engaged with, then forget the position
 *  so the same quiz is not reported twice from one visit. */
export function reportQuizzes(): void {
  for (const r of reporters) {
    const at = r();
    if (at) signal('quiz', at.ref, { n: at.answered });
  }
}

// `pagehide` rather than `unload`: unload is not fired at all on mobile Safari
// and blocks the back/forward cache everywhere else.
if (configured) {
  addEventListener('pagehide', () => { viewTopic(null); reportQuizzes(); flush(); });
  // A tab hidden for good (phone locked, app switched) may never fire pagehide.
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
}
