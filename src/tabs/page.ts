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
import { h, card, folded } from './framework';
import { challengeLadder } from './challenge';
import { topicById, type Ref } from '../topics';
import { isBookmarked, toggleBookmark } from '../progress';

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
  // preventDefault because fold() moves this button onto a <summary>, where an
  // unhandled click is the toggle's default action — resetting a folded card
  // would otherwise close it.
  const btn = h('button', {
    type: 'button', class: 'btn btn-quiet card-reset',
    onclick: (e: Event) => { e.preventDefault(); resetControls(el); },
  }, 'Reset');
  btn.setAttribute('aria-label', `Reset ${el.querySelector('h2')?.textContent ?? 'this simulation'} to its starting values`);
  // Inside the h2, not after it: the card title already carries the rule under
  // the header, so the button rides on that line instead of pushing the
  // controls down by a row.
  el.querySelector('h2')?.append(btn);
  el.classList.add('has-reset');
}

/** Plain section header over an existing block (W3.1). No rail, no scroll-spy. */
function sectionHead(text: string): HTMLElement {
  return h('h2', { class: 'section-head' }, text);
}

// One line of "what is in here", shown on a folded block's summary. Long
// enough for a task() sentence, short enough to stay on one line at card width.
const HINT_MAX = 90;

function clip(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= HINT_MAX) return t;
  const cut = t.lastIndexOf(' ', HINT_MAX);
  return `${t.slice(0, cut > 40 ? cut : HINT_MAX)}…`;
}

/**
 * The hint for a block, taken from what the module already wrote: a simulation
 * states its job in `task()`, a composed card in its `.section-lede`. Derived
 * rather than passed in, so no call site has to keep a second summary in sync
 * with the sentence already on screen.
 */
function hintFor(el: HTMLElement, fallback = ''): string {
  const src = el.querySelector('.card-task, .section-lede')?.textContent ?? '';
  const first = src.split(/(?<=[.?!])\s/)[0] ?? '';
  return clip(first || fallback);
}

/**
 * Demote a block to a collapsed native <details> — the decluttering pass. Every
 * block except the hero simulation goes through here.
 *
 * The card is WRAPPED, not re-parented under the <summary>: it is a
 * `section.card` that needsReset(), labelCanvases() and auditTopicPages() all
 * select, and rehoming its children would break three passes to save one CSS
 * rule. The summary carries the title, so the card's own h2 is hidden by CSS
 * (`.card.folded > h2`) rather than removed — `nearestHeading()` still finds it
 * when labelling canvases. Only the Reset button rides up onto the summary line.
 *
 * Animation loops idle while folded: `playPause().playing()` reports false
 * inside a closed <details>, which is the gate all three animated tabs already
 * read — expanding resumes at the student's own play/pause choice.
 */
export function fold(el: HTMLElement, hint: string, name?: string): HTMLElement {
  const reset = el.querySelector<HTMLElement>('.card-reset');
  // Lifted before the title is read: addReset() appends it inside the h2, so
  // textContent would otherwise come back as "Diffusion boxReset".
  reset?.remove();
  // `name` is for the callers with no card to read a title off — the Question
  // Bank folds a block of prose, which has no h2 of its own.
  const title = name ?? (el.querySelector('h2')?.textContent?.trim() || 'Details');
  const summary = h('summary', { class: 'fold-head' },
    h('span', { class: 'fold-title' }, title),
    hint ? h('span', { class: 'fold-hint' }, hint) : null,
  );
  if (reset) summary.append(reset);
  if (el.matches('.card')) el.classList.add('folded');
  // Swap the empty <details> in FIRST, then move the card into it. The obvious
  // `el.replaceWith(fold(el))` throws HierarchyRequestError, because the
  // replacement contains the node being replaced. `replaceWith` is a no-op on a
  // parentless node, so this same order also works for a card built inline.
  const d = h('details', { class: 'fold' }, summary);
  el.replaceWith(d);
  d.append(el);
  return d;
}

/**
 * theory() already builds a <details>, so it only needs shutting and a hint —
 * no wrapper. Closed even when short (theory() auto-opens a brief block): the
 * page opens on the simulation, not on prose.
 */
function shutTheory(t: HTMLElement): void {
  t.removeAttribute('open');
  const s = t.querySelector('summary');
  if (!s || s.querySelector('.fold-hint')) return;
  s.append(h('span', { class: 'fold-hint' }, clip((t.textContent ?? '').slice(s.textContent?.length ?? 0))));
}

/** fold() for the two blocks a module is allowed not to have. */
function foldIf(el: HTMLElement | null, hint: string): HTMLElement | null {
  return el && fold(el, hint);
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
    // Module-level bookmark (E.5). It shares the question bookmark store —
    // module ids and question ids can't collide — so "saved" means one thing
    // across the site and the dashboard lists both from one read.
    const bmBtn = h('button', { type: 'button', class: 'topic-bookmark', 'aria-pressed': 'false' });
    const syncBm = (): void => {
      const on = isBookmarked(id);
      bmBtn.classList.toggle('on', on);
      bmBtn.setAttribute('aria-pressed', String(on));
      bmBtn.textContent = on ? 'Saved' : 'Save for later';
    };
    bmBtn.addEventListener('click', () => { toggleBookmark(id); syncBm(); });
    syncBm();
    frag.append(h('section', { class: 'topic-intro' },
      h('h2', { class: 'sr-only' }, `About ${meta.title}`),
      h('p', { html: meta.intro }),
      bmBtn,
    ));
  }
  // Learn · Practice · Prove (W3.1) — three words over the order the page
  // already had. "Learn" is omitted by the pills modules, whose theory sits
  // inside each panel next to the simulation it explains rather than up here.
  const theoryBlocks = Array.isArray(blocks.theory) ? blocks.theory : [blocks.theory];
  if (theoryBlocks.length) frag.append(sectionHead('Learn'));
  theoryBlocks.forEach(shutTheory);
  frag.append(...theoryBlocks);

  const sims = h('div', { class: 'cards' }, ...blocks.sims);
  frag.append(sectionHead('Practice'), sims);

  const rest = h('div', { class: 'cards' },
    fold(card('Quick quiz', blocks.quiz), 'Multiple choice, with the trap explained after each answer'),
    ...(blocks.extra ?? []).map(c => fold(c, hintFor(c))),
    foldIf(challengeLadder(id), 'Bronze to Platinum problems, each tier unlocking the next'),
    foldIf(meta && meta.refs.length ? references(meta.refs) : null,
      'Textbook chapters for this module, plus the official past-paper archives'),
  );
  frag.append(sectionHead('Prove'), rest);

  // Reset lands after the page is assembled so it sees cards built by either
  // layout (a plain run, or panels inside pills()).
  const simCards = Array.from(sims.querySelectorAll<HTMLElement>('section.card'));
  for (const c of simCards) {
    if (needsReset(c)) addReset(c);
  }

  // ONE hero per VIEW: the first simulation runs full-width and open, every
  // other sim folds. A topic page opens on one thing to do, not five stacked
  // instruments.
  //
  // A pills() layout is several views behind a tablist, so each PANEL gets its
  // own hero rather than the page getting one. Treating pills as a single view
  // and skipping it (the first version of this) left the seven multi-panel
  // modules showing two or three instruments at once — exactly what the hero is
  // for. A panel holding one card is already a hero and nothing folds.
  //
  // After the reset pass on purpose — addReset() needs the h2 before fold()
  // lifts the button onto the summary.
  const panels = Array.from(sims.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  const views: HTMLElement[][] = panels.length
    ? panels.map(p => Array.from(p.children).filter((c): c is HTMLElement => c.matches('section.card')))
    : [blocks.sims];
  for (const cards of views) {
    cards[0]?.classList.add('sim-hero');
    for (const c of cards.slice(1)) fold(c, hintFor(c));
  }
  // The pills modules keep their theory inside the panel, beside the simulation
  // it explains. Same treatment as a module-level block — it is prose either way.
  sims.querySelectorAll<HTMLElement>('details.theory').forEach(shutTheory);
  if (import.meta.env.DEV) {
    if (!sims.querySelector('.mission-ladder')) console.error(`[page contract] ${id}: no mission ladder on any simulation card`);
    // Every simulation card states its job in one imperative sentence. Checked
    // here rather than in the type because a card is assembled from a plain
    // children list — the type cannot see whether one of them is a task().
    for (const c of sims.querySelectorAll<HTMLElement>('section.card')) {
      if (!c.querySelector('.card-task')) {
        console.error(`[page contract] ${id}: sim card "${c.querySelector('h2')?.textContent?.trim()}" has no task() line`);
      }
    }
    if (!frag.querySelector('.theory')) console.error(`[page contract] ${id}: no theory block`);
    // ONE hero, everything else folded, and every folded animation actually
    // idle. The last clause is the one worth checking by machine: a sim that
    // keeps its rAF loop running behind a closed <details> looks completely
    // correct on screen and only shows up as a warm laptop.
    // A hidden tabpanel is not on screen, so its hero does not count against
    // the one-open rule — the reader sees one panel at a time.
    const open = Array.from(frag.querySelectorAll<HTMLElement>('section.card'))
      .filter(c => !folded(c) && !c.closest('[role="tabpanel"][hidden]') && !c.parentElement?.closest('section.card'));
    if (open.length > 1) {
      console.error(`[page contract] ${id}: ${open.length} blocks open at once — the page must open on ONE hero`);
    }
    for (const b of frag.querySelectorAll<HTMLElement>('.play-pause')) {
      if (b.closest('.fold') && !folded(b)) {
        console.error(`[page contract] ${id}: "${b.closest('.card')?.querySelector('h2')?.textContent?.trim()}" animates inside a fold that reports itself open`);
      }
    }
  }
  return frag;
}
