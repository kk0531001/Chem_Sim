// Competition mode (ROADMAP Phase G).
//
// "Support multiple Olympiads without duplicating lessons." A mode is a FILTER
// OVER SHARED CONTENT, never a second copy — which is what the `comps` field
// from Phase A already makes possible. Nothing in this file owns content; it
// owns one string.
//
// Kept deliberately dependency-light (topicIds only, which is tables and pure
// functions) so that topics.ts can import it without a cycle, and so the entry
// path pays almost nothing for it.
//
// PERSISTENCE IS LOCAL, like bookmarks before cloud sync: a mode is a
// per-device preference, not progress anyone would be upset to lose. Absent or
// unreadable storage falls back to 'all' and never throws.
import { COMPS, COMP_LABEL, compsForDifficulty, type Comp } from './content/topicIds';

/** 'all' is a real choice, not the absence of one: it means "show everything". */
export type Mode = Comp | 'all';

const LS_MODE = 'chemprep_mode_v1';
// Set alongside LS_MODE when the mode below was chosen FOR the reader rather
// than BY them, and cleared the moment they choose one or dismiss the note.
// It has to be persisted: the auto-default writes LS_MODE immediately (so it
// behaves like any stored mode afterwards), which would otherwise make the
// note vanish on the first reload.
const LS_AUTO = 'chemprep_mode_auto_v1';
// progress.ts's own keys, duplicated rather than imported. `read()` runs at
// module-evaluation time, and this file is deliberately dependency-light so
// the entry path pays almost nothing for it (D.10) — importing progress.ts
// here would drag its module init in front of this one for a two-line check.
const PROGRESS_KEYS = ['chemprep_solved_v1', 'chemprep_attempts_v1'];

export const MODE_LABEL: Record<Mode, string> = {
  all: 'All competitions',
  ...COMP_LABEL,
};

/** Short form, for chips and readouts where the full name doesn't fit. */
export const MODE_SHORT: Record<Mode, string> = {
  all: 'All', ccc: 'CCC', usnco: 'USNCO', cco: 'CCO', icho: 'IChO',
};

export const MODES: readonly Mode[] = ['all', ...COMPS];

let mode: Mode = read();
const listeners = new Set<(m: Mode) => void>();

/** Nothing solved and nothing attempted — i.e. this browser has never studied. */
function noProgressYet(): boolean {
  return PROGRESS_KEYS.every(k => {
    const raw = localStorage.getItem(k);
    return !raw || raw === '[]' || raw === '{}';
  });
}

/**
 * The stored mode, or a first-visit default of 'ccc' (plan3 3.4).
 *
 * 'all' is the right answer for someone who has been here before and never
 * chose otherwise, and the wrong one for a first-time visitor: it opens the
 * site on 25 modules of which most are contest material they have no use for.
 * A first visit is "no stored mode AND no progress" — both, because a reader
 * who cleared their mode but has a year of attempts is not new.
 *
 * The choice is PERSISTED immediately, so from the next paint on it behaves
 * exactly like a mode they picked; LS_AUTO is what remembers that they did
 * not pick it, and it is the only thing /menu's note depends on.
 */
function read(): Mode {
  try {
    const raw = localStorage.getItem(LS_MODE);
    if (raw && (MODES as readonly string[]).includes(raw)) return raw as Mode;
    if (!noProgressYet()) return 'all';
    localStorage.setItem(LS_MODE, 'ccc');
    localStorage.setItem(LS_AUTO, '1');
    return 'ccc';
  } catch {
    return 'all';
  }
}

/**
 * Is the reader looking at a level nobody chose, and have they not yet been
 * told? True only between the auto-default above and their first deliberate
 * act. Storage that throws answers "no": a note about a preference that
 * cannot be remembered would reappear on every page.
 */
export function isAutoMode(): boolean {
  try { return localStorage.getItem(LS_AUTO) === '1'; } catch { return false; }
}

/** Stop offering the note — the reader has seen it. */
export function dismissAutoMode(): void {
  try { localStorage.removeItem(LS_AUTO); } catch { /* ignore */ }
}

export function activeMode(): Mode { return mode; }

/** The active mode as a Comp, or undefined for 'all' — the shape every
 *  registry query wants (`query({ comp })`, `ladderFor(id, comp)`). */
export function activeComp(): Comp | undefined { return mode === 'all' ? undefined : mode; }

export function setMode(next: Mode): void {
  if (next === mode) return;
  mode = next;
  // Choosing a level is the reader taking over from the default, whatever
  // they chose — so the note has done its job either way.
  dismissAutoMode();
  try { localStorage.setItem(LS_MODE, next); } catch { /* ignore */ }
  for (const cb of listeners) cb(next);
}

export function onModeChange(cb: (m: Mode) => void): void { listeners.add(cb); }

/**
 * Is a module's material in scope for the active mode?
 *
 * Scope is decided at the MODULE level, never per question inside a module's
 * own quiz. `compsOf()` derives a question's competitions from its module's
 * difficulty, so every question in a bank carries the same set — filtering a
 * module quiz by competition would either change nothing or empty it, and
 * neither is a feature. What a mode legitimately says is "coordination
 * chemistry is not on the CCC syllabus", and that is a fact about the module.
 *
 * `difficulty` is TopicMeta's, passed in rather than looked up, so this file
 * never has to import topics.ts.
 */
export function inScope(difficulty: readonly string[], m: Mode = mode): boolean {
  return m === 'all' || compsForDifficulty(difficulty).includes(m);
}
