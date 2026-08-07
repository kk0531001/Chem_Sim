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

function read(): Mode {
  try {
    const raw = localStorage.getItem(LS_MODE);
    return raw && (MODES as readonly string[]).includes(raw) ? raw as Mode : 'all';
  } catch {
    return 'all';
  }
}

export function activeMode(): Mode { return mode; }

/** The active mode as a Comp, or undefined for 'all' — the shape every
 *  registry query wants (`query({ comp })`, `ladderFor(id, comp)`). */
export function activeComp(): Comp | undefined { return mode === 'all' ? undefined : mode; }

export function setMode(next: Mode): void {
  if (next === mode) return;
  mode = next;
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
