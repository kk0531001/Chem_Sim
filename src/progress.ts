// Solved-question progress tracking.
// localStorage is the always-on cache (instant, offline); when the user is
// signed in to Supabase, progress syncs to a per-user `solved` table (protected
// by row-level security) so it follows them across devices. If the Supabase
// env vars are absent the app degrades gracefully to local-only tracking.
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const LS_KEY = 'chemprep_solved_v1';
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

let solved = new Set<string>();
let user: User | null = null;
const listeners = new Set<() => void>();

function fire(): void { for (const cb of listeners) cb(); }

function loadLocal(): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) solved = new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
}
function saveLocal(): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...solved])); } catch { /* ignore */ }
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

export function isSolved(id: string): boolean { return solved.has(id); }
export function solvedCount(): number { return solved.size; }
export function solvedOf(ids: string[]): number { return ids.reduce((n, id) => n + (solved.has(id) ? 1 : 0), 0); }
export function onProgressChange(cb: () => void): void { listeners.add(cb); }

export function markSolved(id: string): void {
  if (solved.has(id)) return;
  solved.add(id);
  saveLocal();
  fire();
  if (supabase && user) {
    supabase.from('solved').upsert({ user_id: user.id, question_id: id }).then(({ error }) => {
      if (error) console.warn('sync (upsert) failed:', error.message);
    });
  }
}

export function unmarkSolved(id: string): void {
  if (!solved.has(id)) return;
  solved.delete(id);
  saveLocal();
  fire();
  if (supabase && user) {
    supabase.from('solved').delete().match({ user_id: user.id, question_id: id }).then(({ error }) => {
      if (error) console.warn('sync (delete) failed:', error.message);
    });
  }
}

// ---- auth ----
export function isCloudConfigured(): boolean { return supabase !== null; }
export function currentEmail(): string | null { return user?.email ?? null; }

export async function signInWithEmail(email: string): Promise<{ ok: boolean; msg: string }> {
  if (!supabase) return { ok: false, msg: 'Cloud sync is not configured.' };
  const { error } = await supabase.auth.signInWithOtp({
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
  if (!supabase) return { ok: false, msg: 'Cloud sync is not configured.' };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return error ? { ok: false, msg: error.message } : { ok: true, msg: 'Redirecting to Google…' };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
  user = null;
  fire();
}

// Merge remote rows with the local set, and push any local-only ids up so
// progress recorded while signed out (or on another device) isn't lost.
async function syncWithRemote(): Promise<void> {
  if (!supabase || !user) return;
  const { data, error } = await supabase.from('solved').select('question_id').eq('user_id', user.id);
  if (error) { console.warn('sync (fetch) failed:', error.message); return; }
  const remote = new Set((data ?? []).map(r => r.question_id as string));
  const localOnly = [...solved].filter(id => !remote.has(id));
  for (const id of remote) solved.add(id);
  saveLocal();
  fire();
  if (localOnly.length) {
    const rows = localOnly.map(question_id => ({ user_id: user!.id, question_id }));
    const { error: upErr } = await supabase.from('solved').upsert(rows);
    if (upErr) console.warn('sync (push) failed:', upErr.message);
  }
}

export async function initProgress(): Promise<void> {
  loadLocal();
  fire();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  user = data.session?.user ?? null;
  if (user) await syncWithRemote();
  supabase.auth.onAuthStateChange((_event, session) => {
    const wasSignedIn = !!user;
    user = session?.user ?? null;
    if (user && !wasSignedIn) void syncWithRemote();
    fire();
  });
}
