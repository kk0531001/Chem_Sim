// The page contract (ROADMAP D.4).
//
// Every topic page is: introduction · theory · simulations (each with its
// missions and a reset) · quiz (with misconception boxes) · challenge ladder ·
// references — in that order, with those heading levels. `topicPage()` is the
// one place that order exists, so a module cannot silently omit a block.
//
// WHAT ENFORCES THE CONTRACT IS THE TYPE, not an audit script: `sims`, `quiz`
// and `theory` are required fields of a non-empty tuple type, and `intro` /
// `refs` are required on TopicMeta. Six of the eight blocks are therefore a
// compile error to leave out. Only the two that are counts rather than
// presence — missions inside a sim, misconceptions inside a bank — need the
// runtime check in auditTopicPages().
//
// Lives in its own file rather than framework.ts because it needs
// challengeLadder() and TopicMeta: framework → challenge → registry → topics →
// framework is a cycle, and a cycle whose modules build top-level constants is
// an initialisation-order bug waiting for someone at 3am.
import { h, card } from './framework';
import { challengeLadder } from './challenge';
import { topicById, type Ref } from '../topics';

/**
 * The official problem archives, shown under every module's reading list.
 *
 * Here rather than in each module's `refs`, because they are the same three
 * links for all 25 modules and none of them is topic-specific — a per-topic
 * copy would be 75 links to keep alive instead of 3.
 *
 * EVERY URL HERE WAS FETCHED AND CONFIRMED, and the list is short for exactly
 * that reason. The obvious guesses were wrong: `cheminst.ca/education/
 * national-chemistry-competitions/` 404s, and the CCC archive actually lives
 * under `/discover/`. USNCO is deliberately absent — acs.org returns 403 to
 * automated requests on every path, so its URL could not be verified, and an
 * unverified link is worse than no link. Add it once someone has opened it in
 * a real browser.
 */
const ARCHIVES: readonly Ref[] = [
  { text: 'Canadian Chemistry Contest & Olympiad — past papers with solutions (Chemical Institute of Canada)', href: 'https://www.cheminst.ca/discover/canadian-chemistry-contest/', chapter: 'Parts A, B and C, 2014 onward' },
  { text: 'IChO International Information Centre — every International Chemistry Olympiad since 1968', href: 'https://www.icho.sk/', chapter: 'Preparatory problems and competition problems' },
];

/** One shared renderer for a module's reading list (D.5). */
export function references(refs: readonly Ref[]): HTMLElement {
  const item = (r: Ref) => h('li', {},
    r.href ? h('a', { href: r.href, target: '_blank', rel: 'noopener' }, r.text) : h('span', {}, r.text),
    r.chapter ? h('span', { class: 'ref-chapter' }, ` — ${r.chapter}`) : null,
  );
  return card('References',
    h('p', { class: 'section-lede' },
      'Where to read this properly. Chapter names rather than numbers, because the numbering moves between editions.'),
    h('ul', { class: 'ref-list' }, ...refs.map(item)),
    h('h3', {}, 'Official past papers'),
    h('ul', { class: 'ref-list' }, ...ARCHIVES.map(item)),
    h('p', { class: 'muted' },
      'Linked, never reproduced — past papers are copyrighted by the bodies that set them. The Question Bank\'s own questions are all original.'),
  );
}

/**
 * Restore every control in a card to the value it was built with, and tell the
 * card's own handlers about it.
 *
 * No per-simulation reset code: the initial value of a slider, number box or
 * <select> is already in the DOM as `defaultValue` / `defaultSelected`, which
 * is exactly what the platform keeps a form reset for. Dispatching `input` and
 * `change` then runs the same handler a student's drag would, so the readouts,
 * canvases and mission meters recompute through the normal path.
 *
 * A simulation carrying state that is NOT in a control — a particle box, an
 * integrator, a decay clock — needs its own reset button, and the three that do
 * (sandbox, equilibrium, nuclear) keep it; `topicPage` leaves those cards alone.
 */
export function resetControls(scope: HTMLElement): void {
  for (const el of scope.querySelectorAll('input')) {
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = el.defaultChecked;
    else el.value = el.defaultValue;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  for (const sel of scope.querySelectorAll('select')) {
    const preset = Array.from(sel.options).find(o => o.defaultSelected) ?? sel.options[0];
    if (preset) sel.value = preset.value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// A card gets a reset only if there is something to reset and nothing already
// doing it. `.mission-ladder` inputs don't count: a mission's own answer box is
// not part of the simulation's state, and wiping it on reset would look like
// the ladder had forgotten the student's work.
function needsReset(el: HTMLElement): boolean {
  if (el.querySelector('.card-reset') || /reset/i.test(el.querySelector('.btn')?.textContent ?? '')) return false;
  return Array.from(el.querySelectorAll('input, select')).some(c => !c.closest('.mission-ladder'));
}

function addReset(el: HTMLElement): void {
  // The card's own input handler runs on every dispatched event, and that
  // handler is what calls missions.tick() — so the meters follow the reset
  // without this knowing anything about them. Solved missions stay solved:
  // they are progress, not card state.
  const btn = h('button', { type: 'button', class: 'btn card-reset', onclick: () => resetControls(el) }, 'Reset');
  btn.setAttribute('aria-label', `Reset ${el.querySelector('h2')?.textContent ?? 'this simulation'} to its starting values`);
  // Inside the h2, not after it: the card title already carries the rule under
  // the header, so the button rides on that line instead of pushing the
  // controls down by a row.
  el.querySelector('h2')?.append(btn);
  el.classList.add('has-reset');
}

export interface TopicPageBlocks {
  /**
   * The simulation / tool region in reading order: a run of cards, or a single
   * `pills()` wrapper containing them. At least one — a topic page with nothing
   * to drive is a textbook, and this is not a textbook.
   */
  sims: [HTMLElement, ...HTMLElement[]];
  /** The module's quiz body — `quiz(BANK, 5)`. Wrapped in its card here. */
  quiz: HTMLElement;
  /**
   * `theory(title, html)`, rendered directly under the intro.
   *
   * An ARRAY, possibly empty, for the multi-topic modules built out of
   * `pills()`: acids/redox/kinetics carries one theory block per panel, sitting
   * beside the simulation it explains, and hoisting those into one block at the
   * top would separate each from what it describes. Those pass `[]` here and
   * the DEV check below verifies the blocks exist somewhere on the page — the
   * one block of the eight whose presence the type cannot prove.
   */
  theory: HTMLElement | HTMLElement[];
  /** Cards that belong after the quiz but before the challenge ladder. Rare. */
  extra?: HTMLElement[];
}

/**
 * Assemble one topic page. `id` is the TopicMeta id — the intro, the references
 * and the challenge ladder are all looked up from it, so a page can never
 * disagree with the metadata the menu and homepage show for the same module.
 */
export function topicPage(id: string, blocks: TopicPageBlocks): DocumentFragment {
  const meta = topicById(id);
  const frag = document.createDocumentFragment();

  if (meta) {
    frag.append(h('section', { class: 'topic-intro' },
      h('h2', { class: 'sr-only' }, `About ${meta.title}`),
      h('p', { html: meta.intro }),
    ));
  }
  frag.append(...(Array.isArray(blocks.theory) ? blocks.theory : [blocks.theory]));

  const sims = h('div', { class: 'cards' }, ...blocks.sims);
  frag.append(sims);

  const rest = h('div', { class: 'cards' },
    card('Quick quiz', blocks.quiz),
    ...(blocks.extra ?? []),
    challengeLadder(id),
    meta && meta.refs.length ? references(meta.refs) : null,
  );
  frag.append(rest);

  // Reset lands after the page is assembled so it sees cards built by either
  // layout (a plain run, or panels inside pills()).
  for (const c of sims.querySelectorAll<HTMLElement>('section.card')) {
    if (needsReset(c)) addReset(c);
  }
  if (import.meta.env.DEV) {
    if (!sims.querySelector('.mission-ladder')) console.error(`[page contract] ${id}: no mission ladder on any simulation card`);
    if (!frag.querySelector('.theory')) console.error(`[page contract] ${id}: no theory block`);
  }
  return frag;
}
