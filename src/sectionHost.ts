// One section on screen, and nothing else alive.
//
// The host owns a single slot. Entering a section tears down the one before it
// — teardown FIRST, then mount — so there is never a moment with two sections'
// worth of state running. A section that is not the current route is not in the
// DOM at all, which is the whole point of the routed split: there is no hidden
// node left for a rAF loop to keep painting into.
//
// "Not in the DOM" is necessary and not sufficient, though: a detached node
// whose loop still calls requestAnimationFrame in a closure keeps burning
// frames and looks completely correct on screen. installRafGuard() below is
// what turns that from an invisible warm laptop into a console error in dev.
import { resolve, type Position, type SectionDef } from './spine';

/** Stop everything this section started. Called before the next one mounts. */
export type Teardown = () => void;

/**
 * A topic's sections and how to build one. Supplied by the topic module, which
 * declares its blocks and their slugs in the same place it builds them —
 * see topicPage() (step 3). The host never invents or reorders sections.
 */
export interface SectionSource {
  sections: readonly SectionDef[];
  /**
   * Build the section into `root` (already emptied). Return a Teardown if the
   * section starts anything that outlives its DOM — a rAF loop, a timer, a
   * window listener. Returning nothing is correct for a static block.
   */
  mount(slug: string, root: HTMLElement, pos: Position): Teardown | void;
}

// ---- the dev leak guard ----------------------------------------------------

/**
 * Which mount owns the frames being registered right now. `gen` increments on
 * every mount and every leave, so a callback registered under an older
 * generation is, by definition, a section that outlived its unmount.
 */
let gen = 0;
let owner: { gen: number; name: string } | null = null;

interface RafHost {
  requestAnimationFrame(cb: (t: number) => void): number;
}

/**
 * Wrap requestAnimationFrame so a leaked loop reports itself.
 *
 * Ownership is stamped at REGISTRATION time and re-established around the
 * callback, so it propagates through the `frameId = requestAnimationFrame(loop)`
 * tail every animated tab uses — the loop keeps re-registering under the
 * generation that started it, and the first frame after its section unmounts is
 * caught. The leaked callback is dropped rather than run: in dev a leak should
 * be loud and dead, not loud and still painting.
 *
 * ponytail: covers loops started during mount and anything descending from
 * them. A loop first started by a later click is registered with no owner and
 * is not tracked. Attributing every frame to the mounted section instead would
 * catch those, at the cost of false-positives on the app's own one-shot frames
 * (framework's flush, scrollIntoView) — upgrade path if a click-started loop
 * ever leaks in practice.
 */
export function installRafGuard(win: RafHost, onLeak: (name: string) => void): void {
  const raf = win.requestAnimationFrame.bind(win);
  win.requestAnimationFrame = (cb: (t: number) => void): number => {
    const at = owner;
    if (!at) return raf(cb);
    return raf((t: number) => {
      if (at.gen !== gen) { onLeak(at.name); return; }
      const prev = owner;
      owner = at;
      try { cb(t); } finally { owner = prev; }
    });
  };
}

// Installed once, in dev only: the guard costs a closure per frame, and its job
// is to fail a developer's build-time attention, not a student's laptop.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  installRafGuard(window, name => console.error(
    `[sections] ${name} kept a requestAnimationFrame loop running after it was unmounted — ` +
    'its teardown returned, but never cancelled the frame handle',
  ));
}

// ---- the host --------------------------------------------------------------

export interface SectionHost {
  /**
   * Mount `slug` of `topicId`. A null or unknown slug lands on the topic's
   * first section — the caller can compare `pos.current.slug` with what it
   * asked for and replaceState to canonicalise the URL.
   *
   * Returns null when the topic is unknown or declares nothing: a real 404.
   */
  show(topicId: string, slug: string | null, source: SectionSource): Position | null;
  /** Leave the app entirely (homepage, menu, progress). Tears down, mounts nothing. */
  leave(): void;
  current(): { topicId: string; slug: string } | null;
}

export function createSectionHost(root: HTMLElement): SectionHost {
  let teardown: Teardown | null = null;
  let at: { topicId: string; slug: string } | null = null;

  function unmount(): void {
    // Order matters: the section's own teardown runs while its nodes are still
    // attached, so a handler that reads geometry or removes a listener from its
    // own element still can. Emptying first would be a subtler class of the
    // same bug this file exists to prevent.
    const t = teardown;
    teardown = null;
    at = null;
    gen++;
    if (t) t();
    root.replaceChildren();
  }

  return {
    show(topicId, slug, source) {
      const pos = resolve(topicId, slug, source.sections);
      if (!pos) return null;
      unmount();
      gen++;
      const name = `${topicId}/${pos.current.slug}`;
      owner = { gen, name };
      try {
        teardown = source.mount(pos.current.slug, root, pos) ?? null;
      } finally {
        owner = null;
      }
      at = { topicId, slug: pos.current.slug };
      return pos;
    },
    leave: unmount,
    current: () => at,
  };
}
