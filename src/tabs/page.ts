// The page contract, second edition: a topic is a SEQUENCE OF ROUTED SECTIONS,
// not one scrolling page.
//
// Every block a module builds — the intro, each theory block, each simulation,
// the quiz, the challenge ladder, the references — becomes its own named route
// under `/topic/<slug>/<section>`, and exactly one of them is in the document
// at a time. Structure now enforces one-thing-per-view: there is no fold to
// leave open, no tablist to leave on the wrong panel, and no "hero" rule to
// get wrong, because there is only ever one thing on screen.
//
// WHAT ENFORCES THE CONTRACT IS STILL THE TYPE: `sims`, `quiz` and `theory` are
// required fields of a non-empty tuple type, and `intro` / `refs` are required
// on TopicMeta, so most of the blocks are a compile error to leave out. What
// the type cannot see — missions inside a sim, misconceptions inside a bank —
// is still checked by auditTopicPages(). What the ONE-HERO rule used to check
// is now checked by the host: one section mounted, nothing animating outside it
// (see the rAF guard in sectionHost.ts).
//
// Lives in its own file rather than framework.ts because it needs
// challengeLadder() and TopicMeta: framework → challenge → registry → topics →
// framework is a cycle, and a cycle whose modules build top-level constants is
// an initialisation-order bug waiting for someone at 3am.
import { h, card, copyLinkButton } from './framework';
import { challengeLadder } from './challenge';
import { topicById, type Ref } from '../topics';
import { isBookmarked, toggleBookmark, lastSection } from '../progress';
import { createSectionHost, type SectionSource } from '../sectionHost';
import type { SectionDef, Position } from '../spine';
import { navigate, onRouteChange, parseRoute } from '../router';

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
    r.href ? h('a', { href: r.href, target: '_blank', rel: 'noopener noreferrer' }, r.text) : h('span', {}, r.text),
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
  const btn = h('button', {
    type: 'button', class: 'btn btn-quiet card-reset',
    onclick: () => resetControls(el),
  }, 'Reset');
  btn.setAttribute('aria-label', `Reset ${el.querySelector('h2')?.textContent ?? 'this simulation'} to its starting values`);
  // Inside the h2, not after it: the card title already carries the rule under
  // the header, so the button rides on that line instead of pushing the
  // controls down by a row.
  el.querySelector('h2')?.append(btn);
  el.classList.add('has-reset');
}

// ---- turning a module's blocks into named sections -------------------------

interface Block extends SectionDef { el: HTMLElement }

/**
 * A section's slug is derived from its own heading, so the URL says what the
 * page is (`/topic/chemical-equilibrium/le-chatelier-box`) and REORDERING a
 * module's blocks cannot repoint anybody's bookmark — the guarantee an index
 * would not give.
 *
 * ponytail: renaming a card's title does change its URL. The blast radius is
 * small by construction — the spine falls back to the topic's first section
 * rather than 404ing — and the alternative is an explicit slug argument
 * threaded through all 25 modules. Upgrade path: add an optional slug to the
 * card helper the first time a rename actually matters.
 */
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function slugify(text: string): string {
  const s = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    // Formula digits FIRST. Stripping them instead turns
    // "N₂O₄ ⇌ 2NO₂" into "n-o-2no", which names nothing.
    .replace(/[₀-₉]/g, c => String(SUB.indexOf(c)))
    .replace(/[⁰-⁹]/g, c => String(SUP.indexOf(c)))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length <= 40) return s || 'section';
  // Cut at a word boundary — a slug ending mid-word reads like a truncation bug.
  const cut = s.slice(0, 41).lastIndexOf('-');
  return (cut > 12 ? s.slice(0, cut) : s.slice(0, 40)) || 'section';
}

function titleOf(el: HTMLElement, fallback: string): string {
  // Before addReset(), deliberately — otherwise every sim would be called
  // "Diffusion boxReset". The theory blocks carry a long subtitle after an
  // em dash that a stepper has no room for.
  const raw = el.querySelector('h2, summary')?.textContent?.trim() ?? '';
  return (raw.split(' — ')[0] || fallback).trim();
}

function block(el: HTMLElement, fallbackTitle: string, taken: Set<string>, forceSlug?: string): Block {
  const title = forceSlug ? fallbackTitle : titleOf(el, fallbackTitle);
  let slug = forceSlug ?? slugify(title);
  // Two cards with the same heading in one module is legal and happens; the
  // second gets a numbered slug rather than silently stealing the first's URL.
  for (let n = 2; taken.has(slug); n++) slug = `${forceSlug ?? slugify(title)}-${n}`;
  taken.add(slug);
  return { slug, title, el };
}

/**
 * Flatten the simulation region into one section per card.
 *
 * The `pills()` tablist is retired: a module that used it was already several
 * views behind a sub-navigation, and those views are now sections of the spine
 * like any other. Its panels are unwrapped in place, so acids/redox/kinetics
 * keeps each theory block next to the simulation it explains — as its own
 * section, in the same order the pills had them.
 */
function simBlocks(sims: readonly HTMLElement[], taken: Set<string>): Block[] {
  const out: Block[] = [];
  for (const node of sims) {
    const panels = Array.from(node.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    if (!panels.length) { out.push(block(node, 'Simulation', taken)); continue; }
    for (const panel of panels) {
      for (const child of Array.from(panel.children)) {
        if (child instanceof HTMLElement && child.matches('section.card, details.theory')) {
          out.push(block(child, 'Simulation', taken));
        }
      }
    }
  }
  return out;
}

// ---- the section navigation ------------------------------------------------

/**
 * Every jump between sections is a real `<a href>`, not a button: these are
 * pages, so cmd-click, middle-click and "copy link address" must all work, and
 * a crawler must be able to follow them. The click handler only takes over the
 * PLAIN left click, which is the one the History API should serve.
 */
function sectionLink(topicId: string, slug: string | null, text: string, cls: string): HTMLAnchorElement {
  return h('a', {
    class: cls,
    href: `/topic/${topicById(topicId)?.slug ?? topicId}${slug ? `/${slug}` : ''}`,
    onclick: (e: Event) => {
      const me = e as MouseEvent;
      if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button !== 0) return;
      e.preventDefault();
      navigate(slug ? { kind: 'topic', id: topicId, section: slug } : { kind: 'topic', id: topicId });
    },
  }, text) as HTMLAnchorElement;
}

/**
 * The stepper: every section of this topic, current one marked, each a direct
 * jump. It doubles as the "what is in this topic" overview that a single
 * scrolling page used to give you by scrolling.
 *
 * It is the ONLY sub-navigation on a topic page — it replaced the pills
 * tablist rather than joining it. Not the ARIA tabs pattern, deliberately:
 * these are links to pages, and promising tab semantics (arrow-key movement
 * within one document) for something that changes the URL would be a lie to a
 * screen-reader user.
 */
/**
 * The app scrolls inside the tab root, not the window — `window.scrollTo` is a
 * no-op here and `scrollIntoView` would move whichever ancestor it likes. Walk
 * up to whatever is actually doing the scrolling and put it back to the top.
 */
function scrollToTop(from: HTMLElement): void {
  for (let p = from.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) { p.scrollTop = 0; return; }
  }
  window.scrollTo({ top: 0 });
}

/**
 * Chip labels only: drop a trailing parenthetical.
 *
 * "Energy levels & spectral lines (Rydberg)" is a good card title and a bad
 * chip — two of them were wide enough to push the strip onto a third row. The
 * slug, the card's own heading and the document title all still come from the
 * FULL title, so nothing bookmarkable moves; the full text is on the chip's
 * `title` attribute. A strip that collides with another chip keeps its
 * parenthetical, because two identical chips is worse than one long one.
 */
function chipLabels(sections: readonly { title: string }[]): string[] {
  const short = sections.map(s => s.title.replace(/\s*\([^()]*\)\s*$/, '').trim() || s.title);
  const seen = new Map<string, number>();
  for (const t of short) seen.set(t, (seen.get(t) ?? 0) + 1);
  return short.map((t, i) => (seen.get(t)! > 1 ? sections[i].title : t));
}

function stepper(topicId: string, pos: Position): HTMLElement {
  const nav = h('nav', { class: 'section-steps', 'aria-label': 'Sections of this topic' });
  const labels = chipLabels(pos.sections);
  pos.sections.forEach((s, i) => {
    const current = s.slug === pos.current.slug;
    const a = sectionLink(topicId, s.slug, labels[i], `pill${current ? ' active' : ''}`);
    a.title = s.title;
    if (current) a.setAttribute('aria-current', 'page');
    nav.append(a);
  });
  return nav;
}

/**
 * The guided path: one step back, one step forward, and where you are.
 *
 * Both ends come from the spine, so the last section of a topic offers the NEXT
 * TOPIC and the very last section of the spine offers the menu instead. A
 * cross-topic step is named by its TOPIC ("← Acids, Batteries & Reaction Rates"), never
 * by a section title: it lands on that topic's entry point, and a button that
 * named a specific section would be promising a destination it does not go to.
 */
function sectionFooter(pos: Position): HTMLElement {
  const step = (ref: typeof pos.prev, dir: 'prev' | 'next') => {
    const arrow = dir === 'prev' ? '←' : '→';
    if (!ref) {
      // Only at the two ends of the whole spine. Forward, the honest offer is
      // the directory; backward there is simply nothing before the first page.
      return dir === 'next'
        ? h('a', { class: 'section-step next', href: '/menu', onclick: (e: Event) => { e.preventDefault(); navigate({ kind: 'menu' }); } },
            h('span', { class: 'section-step-label' }, 'Finished'),
            h('span', { class: 'section-step-title' }, 'Back to topics →'))
        : h('span', { class: 'section-step-blank' });
    }
    const label = ref.crossesTopic ? (dir === 'prev' ? 'Previous topic' : 'Next topic') : (dir === 'prev' ? 'Previous' : 'Next');
    const a = sectionLink(ref.topicId, ref.slug, '', `section-step ${dir}`);
    a.append(
      h('span', { class: 'section-step-label' }, label),
      h('span', { class: 'section-step-title' }, dir === 'prev' ? `${arrow} ${ref.title}` : `${ref.title} ${arrow}`),
    );
    // The arrow glyph alone says nothing, and the title alone says nothing
    // about direction — the accessible name has to carry both.
    a.setAttribute('aria-label', `${label}: ${ref.title}`);
    return a;
  };
  return h('nav', { class: 'section-foot', 'aria-label': 'Section navigation' },
    step(pos.prev, 'prev'),
    h('span', { class: 'section-pos' },
      `Section ${pos.indexInTopic + 1} of ${pos.topicLength}`,
      // Every section already has its own URL — this is the affordance, not
      // the feature. location.href is right because that IS the section link.
      copyLinkButton(() => location.href, 'link to this section')),
    step(pos.next, 'next'),
  );
}

export interface TopicPageBlocks {
  /**
   * The simulation / tool region in reading order: a run of cards, or a single
   * `pills()` wrapper containing them. At least one — a topic with nothing to
   * drive is a textbook, and this is not a textbook. Each card becomes its own
   * routed section.
   */
  sims: [HTMLElement, ...HTMLElement[]];
  /** The module's quiz body — `quiz(BANK, 5)`. Wrapped in its card here. */
  quiz: HTMLElement;
  /**
   * `theory(title, html)` — its own section, or several.
   *
   * An ARRAY, possibly empty, for the modules built out of `pills()`:
   * acids/redox/kinetics carries one theory block per panel, and those are
   * picked up from the panels instead, keeping each next to the simulation it
   * explains in the section order.
   */
  theory: HTMLElement | HTMLElement[];
  /** Blocks that belong after the quiz but before the challenge ladder. Rare. */
  extra?: HTMLElement[];
}

/**
 * Assemble one topic's sections and hand back the element to append.
 *
 * `id` is the TopicMeta id — the intro, the references and the challenge ladder
 * are all looked up from it, so a page can never disagree with the metadata the
 * menu and homepage show for the same module.
 *
 * The return value is still a fragment appended by the module, so no module
 * changed: what it contains is a single host element that swaps its one child
 * as the route changes.
 */
export function topicPage(id: string, blocks: TopicPageBlocks): DocumentFragment {
  const meta = topicById(id);
  const taken = new Set<string>();
  const sections: Block[] = [];

  // Held so the contents list can be appended once every section exists — the
  // overview has to be pushed FIRST (it is section 1) but cannot know what it
  // is a table of until last.
  let introEl: HTMLElement | null = null;
  let bmBtn: HTMLElement | null = null;

  if (meta) {
    // Module-level bookmark (E.5). It shares the question bookmark store —
    // module ids and question ids can't collide — so "saved" means one thing
    // across the site and the dashboard lists both from one read.
    const btn = h('button', { type: 'button', class: 'topic-bookmark', 'aria-pressed': 'false' });
    const syncBm = (): void => {
      const on = isBookmarked(id);
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Saved' : 'Save for later';
    };
    btn.addEventListener('click', () => { toggleBookmark(id); syncBm(); });
    syncBm();
    bmBtn = btn;
    introEl = h('section', { class: 'topic-intro' },
      h('h2', {}, `About ${meta.title}`),
      h('p', { html: meta.intro }),
    );
    sections.push(block(introEl, 'Overview', taken, 'overview'));
  }

  const theoryBlocks = Array.isArray(blocks.theory) ? blocks.theory : [blocks.theory];
  for (const t of theoryBlocks) {
    // theory() builds a <details>; as a section of its own there is nothing
    // left to collapse it for, so it opens.
    t.setAttribute('open', '');
    sections.push(block(t, 'Theory', taken));
  }

  const simSections = simBlocks(blocks.sims, taken);
  // Reset lands before the sections are handed over, and before addReset()
  // appends its button into the h2 that titleOf() reads.
  for (const s of simSections) {
    if (s.el.matches('section.card') && needsReset(s.el)) addReset(s.el);
    s.el.setAttribute('open', '');   // no-op on a card, opens a panel's theory
  }
  sections.push(...simSections);

  sections.push(block(card('Quick quiz', blocks.quiz), 'Quick quiz', taken, 'quiz'));
  for (const c of blocks.extra ?? []) sections.push(block(c, 'More', taken));
  const ladder = challengeLadder(id);
  if (ladder) sections.push(block(ladder, 'Challenge ladder', taken, 'challenge'));
  if (meta && meta.refs.length) sections.push(block(references(meta.refs), 'References', taken, 'references'));

  // The overview is the topic's contents page. Without this it is one paragraph
  // on a route of its own — the stepper above it is the only thing saying what
  // the module contains, and it is a scrolling strip of pills, not a list you
  // can read. Same links, laid out to be read.
  if (introEl) {
    const rest = sections.filter(s => s.el !== introEl);
    if (rest.length) {
      introEl.append(
        h('h3', {}, 'In this topic'),
        h('ol', { class: 'toc' }, ...rest.map(s =>
          h('li', {}, sectionLink(id, s.slug, s.title, 'toc-link')))),
      );
    }
    if (bmBtn) introEl.append(bmBtn);
  }

  // ---- host + routing ------------------------------------------------------
  // tabindex="-1" so a section change can put focus at the top of the new page
  // without adding it to the tab order.
  const container = h('div', { class: 'topic-sections', tabindex: '-1' });
  const navEl = h('div', { class: 'section-nav-slot' });
  const footEl = h('div', { class: 'section-foot-slot' });
  const host = createSectionHost(container);
  const byId = new Map(sections.map(s => [s.slug, s.el]));
  const source: SectionSource = {
    sections: sections.map(({ slug, title }) => ({ slug, title })),
    // Attached, not rebuilt: the blocks are built once by the module. The
    // section that is not the current route is out of the document, which is
    // what idles its animation loop (see folded() in framework.ts) — the loop
    // itself belongs to the tab and is cancelled by the tab's handle.
    mount: (slug, root) => { root.append(byId.get(slug)!); },
  };

  let first = true;
  function go(section: string | null): void {
    const at = host.current();
    if (at && at.topicId === id && at.slug === section) return;
    // A bare /topic/<slug> — the sidebar, a shared link, the next-lesson card —
    // reopens where this student left off rather than at the overview. Local
    // and per topic; a stale slug still falls through to the first section.
    const pos = host.show(id, section ?? lastSection(id), source);
    if (!pos) return;
    navEl.replaceChildren(stepper(id, pos));
    // On a phone the strip scrolls instead of wrapping, so the current pill has
    // to be brought to where the reader is looking.
    //
    // scrollLeft on the strip itself, NOT scrollIntoView: scrollIntoView also
    // adjusts every scrollable ancestor, and on a deep-linked cold load it
    // scrolled the tab body down far enough to hide the stepper it had just
    // centred. This can only ever move the strip.
    //
    // In a microtask, not a frame callback: on the first call this function
    // runs while the fragment is still detached (the module appends it only
    // once topicPage returns) and an unlaid-out element has no offsetLeft. A
    // microtask lands after that append and still before paint, where rAF
    // would never arrive at all in a background tab.
    queueMicrotask(() => {
      const strip = navEl.firstElementChild as HTMLElement | null;
      const cur = navEl.querySelector<HTMLElement>('[aria-current]');
      if (strip && cur) strip.scrollLeft = cur.offsetLeft - (strip.clientWidth - cur.clientWidth) / 2;
    });
    footEl.replaceChildren(sectionFooter(pos));
    // The module-level footer in main.ts is the NEXT LESSON recommendation
    // (F.3) — a whole card with a reason, which is the right thing to offer at
    // the end of a topic and noise in the middle of one. So it shows on the
    // last section, where the spine is crossing into another topic anyway, and
    // is out of the way everywhere else. Reached by id because it belongs to
    // the app shell, not to this page; missing on the sandbox, hence `?.`.
    const lessonFoot = document.getElementById('topic-footer');
    if (lessonFoot) lessonFoot.hidden = pos.indexInTopic < pos.topicLength - 1;
    // Canonicalise a bare or stale URL to the section actually on screen, so a
    // reload and the Resume link agree with what the student is looking at.
    if (pos.current.slug !== section) navigate({ kind: 'topic', id, section: pos.current.slug }, true);
    // A section IS a page: name it in the title so history and bookmarks are
    // legible. main.ts has already set the topic title by the time this runs.
    document.title = `${pos.current.title} — ${pos.topic.title} — ChemPrep`;
    // A new page starts at the top, with focus at the top of it — otherwise a
    // keyboard user's next Tab continues from wherever the old page's focus
    // was, and a screen reader is told nothing happened. Not on the first
    // mount: arriving at the topic, main.ts has already moved focus into
    // <main>, and stealing it from there would announce the section twice.
    if (!first) {
      scrollToTop(container);
      container.focus({ preventScroll: true });
    }
    first = false;
  }

  // No unsubscribe: a tab module mounts once and lives for the session, so this
  // is one listener per visited topic, each returning immediately for routes
  // that are not its own.
  onRouteChange(r => { if (r.kind === 'topic' && r.id === id) go(r.section ?? null); });
  const here = parseRoute(location.pathname);
  go(here.kind === 'topic' ? here.section ?? null : null);

  if (import.meta.env.DEV) {
    const simCards = simSections.filter(s => s.el.matches('section.card')).map(s => s.el);
    if (!simCards.some(c => c.querySelector('.mission-ladder'))) console.error(`[page contract] ${id}: no mission ladder on any simulation card`);
    // Every simulation card states its job in one imperative sentence. Checked
    // here rather than in the type because a card is assembled from a plain
    // children list — the type cannot see whether one of them is a task().
    for (const c of simCards) {
      if (!c.querySelector('.card-task')) {
        console.error(`[page contract] ${id}: sim card "${c.querySelector('h2')?.textContent?.trim()}" has no task() line`);
      }
    }
    if (!sections.some(s => s.el.matches('.theory') || s.el.querySelector('.theory'))) console.error(`[page contract] ${id}: no theory block`);
    // What the ONE-HERO rule used to say, now that it is structural: one
    // section on screen. The other half — nothing animating outside it — is
    // the rAF guard in sectionHost.ts.
    if (container.children.length !== 1) {
      console.error(`[page contract] ${id}: ${container.children.length} sections mounted at once — exactly one may be`);
    }
    if (sections.some(s => s.el.isConnected && s.slug !== host.current()?.slug)) {
      console.error(`[page contract] ${id}: a section that is not the current route is still in the document`);
    }
  }

  const frag = document.createDocumentFragment();
  frag.append(navEl, container, footEl);
  return frag;
}
