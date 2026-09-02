// Tab framework + shared DOM/plot helpers for the topic modules.
// Each tab is lazily mounted on first visit; onShow/onHide let tabs with
// animation loops pause when hidden.
import { solvedWithPrefix, onProgressChange } from '../progress';
import { CHEVRON_ICON } from '../icons';
import { ID_PREFIX } from '../content/topicIds';
import { MODULE_QUIZ_SIZE } from '../content/counts';
import 'katex/dist/katex.min.css';

/**
 * KaTeX is LOADED ON DEMAND, not at startup — the same trade as the Supabase
 * client (D.10), for the same reason.
 *
 * home.ts, menu.ts and guide.ts import `h` from this file, and a static
 * `import renderMathInElement` put all of KaTeX plus mhchem into the ENTRY
 * chunk. A first-time reader landing on a page with no equations on it was
 * downloading the whole maths renderer to look at a grid of topic cards.
 *
 * The import starts on the first typeset request and is shared from then on.
 * The CSS stays static: it is small, and loading it late makes formulas
 * reflow after they have already painted.
 */
type Renderer = (el: HTMLElement, opts: Record<string, unknown>) => void;
let katexPromise: Promise<Renderer> | null = null;
function katex(): Promise<Renderer> {
  katexPromise ??= Promise.all([
    import('katex/contrib/auto-render'),
    // @ts-expect-error mhchem ships no types; it is imported for its side
    // effect (registering \ce) and nothing reads its exports.
    import('katex/contrib/mhchem'),
  ]).then(([m]) => m.default as Renderer);
  return katexPromise;
}

// The quiz widget and the mission ladder live in ./ui/quiz. They are
// re-exported here so every existing `from './framework'` import still works —
// the split (revamp.md E1) was about what you have to open to edit them, not
// about moving call sites. See the header of ui/quiz.ts for why the resulting
// import cycle is safe and what would break it.
// Plotting lives in ./ui/plot (plan2 §7). Re-exported for the same reason
// ui/quiz is: the split is about what you open to edit a plot, not about
// rewriting every `from './framework'` in 30 tab modules.
// Accessibility and motion helpers live in ./ui/a11y (plan2 §7). Imported for
// use here AND re-exported, so tab modules keep their single framework import.
import { labelCanvases, markScrollableTables, folded, prefersReducedMotion } from './ui/a11y';
export { labelCanvases, markScrollableTables, folded, prefersReducedMotion } from './ui/a11y';
export { plot, miniPlot, linspace, lnFactorial } from './ui/plot';
export type { Series, PlotOpts } from './ui/plot';
export { quiz, focusQuestion, helpfulBar, missionLadder } from './ui/quiz';
export type { QuizQ, MissionDef, MissionMeter, MissionLadderHandle } from './ui/quiz';
import type { MissionLadderHandle } from './ui/quiz';
import { focusQuestion } from './ui/quiz';

// Typeset LaTeX / mhchem (\ce{...}) inside an element. Delimiters: \( \) inline,
// \[ \] and $$ $$ display. Safe on content with no math (no-op) and on detached
// nodes. throwOnError keeps a malformed formula from blanking the whole page.
export function typesetMath(el: HTMLElement): Promise<void> {
  return katex().then(render => {
    // The element can be torn down while the import is in flight (a tab
    // switched away, a quiz advanced) — typesetting a detached node is wasted
    // work, not an error.
    if (!el.isConnected) return;
    render(el, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  }).catch(() => { /* never let math rendering break a tab */ });
}

// Auto-typeset a container and everything later inserted into it (reactive
// .result panels rebuilt on slider drags, quiz explanations, lazily-mounted
// tabs). Disconnects while typesetting so KaTeX's own DOM writes don't re-fire.
export function autoTypeset(...roots: HTMLElement[]): void {
  let scheduled = false;
  const pending = new Set<HTMLElement>();
  // typesetMath is ASYNC now (KaTeX is imported on demand), so the observer has
  // to stay disconnected until the render has actually written its DOM —
  // reconnecting synchronously would let KaTeX's own writes re-fire the
  // observer and typeset its output forever.
  const flush = async () => {
    scheduled = false;
    obs.disconnect();
    const els = [...pending];
    pending.clear();
    try {
      await Promise.all(els.filter(el => el.isConnected).map(el => typesetMath(el)));
    } finally {
      // `finally`, not a plain tail call: an observer left disconnected stops
      // typesetting EVERY later insertion on the page, so no failure path may
      // skip the reconnect.
      for (const r of roots) obs.observe(r, { childList: true, subtree: true });
    }
  };
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      const t = (m.target.nodeType === 1 ? m.target : m.target.parentElement) as HTMLElement | null;
      if (t) pending.add(t);
    }
    if (!scheduled) { scheduled = true; requestAnimationFrame(() => void flush()); }
  });
  // Same ordering on the first pass: typeset, then start watching.
  const watch = (): void => {
    for (const r of roots) obs.observe(r, { childList: true, subtree: true });
  };
  void Promise.all(roots.map(r => typesetMath(r))).then(watch, watch);
}

export interface TabHandle {
  onShow?: () => void;
  onHide?: () => void;
  onDestroy?: () => void;
}

/**
 * `label` and `group` are the SIDEBAR's copy of a module's name, deliberately
 * shorter than its `TopicMeta.title` ("Bonding & Shape" vs "Bonding &
 * Molecular Shape"). They live in the LAZY table in main.ts, not here, because a tab
 * file's own module is only fetched when the tab is first opened — reading a
 * label off it would mean loading all 25 modules to draw the nav. Both are
 * optional so a tab module can export a bare `{ id, mount }`.
 *
 * `mount` may return a promise: that is how a lazily-imported tab reports its
 * handle. initTabs keeps its error boundary either way.
 */
export interface TabDef {
  id: string;
  label?: string;
  group?: string;
  mount: (root: HTMLElement) => TabHandle | void | Promise<TabHandle | void>;
}

export interface TabsAPI {
  show: (id: string) => void;
  suspend: () => void; // pause the active tab's animation loops (leaving the app)
  resume: () => void;
  current: () => string | null;
}

const NAV_OPEN_KEY = 'chemprep.nav.open';

/**
 * Which sidebar groups the student left open, or null for "never set".
 *
 * Anything unparseable is treated as never-set rather than repaired: the cost
 * of the default is one extra click, and the same defensive posture as
 * progress.ts means a corrupt value can never take the sidebar down with it.
 */
function readOpenGroups(): string[] | null {
  try {
    const raw = localStorage.getItem(NAV_OPEN_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : null;
  } catch {
    return null;
  }
}

// `onSelect` (optional) is called when a sidebar nav item is clicked, so the
// host can route through the History API — keeping the URL and the topic chrome
// (breadcrumb + prev/next footer) in sync. Falls back to a plain tab swap.
/**
 * The sidebar's half of the Phase E mastery bars.
 *
 * A nav item is ~180 px of a permanently-visible list of 25, so it gets a
 * 2 px underline and nothing else — the fraction and the full bar live on the
 * topic card, where there is room to read them. Putting "19/25" on all 25 rows
 * would turn the one piece of navigation that must stay scannable into a
 * spreadsheet.
 *
 * Counted by id namespace (`solvedWithPrefix` + `MODULE_QUIZ_SIZE`) rather than
 * by enumerating the bank, exactly as the topic cards do: the sidebar is built
 * at startup and must not pull in the corpus.
 *
 * The underline is decorative — `aria-label` carries the same figure as text,
 * and drops back to the plain label at zero so a screen reader isn't told
 * "0 of 25 solved" twenty-five times on a first visit.
 */
function addNavMeter(btn: HTMLButtonElement, id: string, label: string): void {
  const prefix = ID_PREFIX[id as keyof typeof ID_PREFIX];
  const total = MODULE_QUIZ_SIZE[id];
  if (!prefix || !total) return;   // sandbox and qbank own no quiz bank

  const fill = h('span', { class: 'nav-item-fill' });
  const meter = h('span', { class: 'nav-item-meter', 'aria-hidden': 'true' }, fill);
  btn.appendChild(meter);
  const paint = (): void => {
    const done = Math.min(solvedWithPrefix(prefix), total);
    meter.hidden = done === 0;
    fill.style.width = `${Math.round((done / total) * 100)}%`;
    btn.classList.toggle('done', done === total);
    if (done === 0) btn.removeAttribute('aria-label');
    else btn.setAttribute('aria-label', `${label}, ${done} of ${total} solved`);
  };
  paint();
  onProgressChange(paint);
}

export function initTabs(defs: TabDef[], nav: HTMLElement, view: HTMLElement, onSelect?: (id: string) => void): TabsAPI {
  interface TabEntry {
    root: HTMLElement;
    handle?: TabHandle;
    failed?: boolean;
  }
  const roots = new Map<string, TabEntry>();
  const buttons = new Map<string, HTMLButtonElement>();
  let currentId: string | null = null;
  // Assigned once the nav is built, below; show() may run before that only if
  // a caller shows a tab without a sidebar, so the no-op default is the safe
  // starting value rather than a bug to guard against.
  let revealInNav: (id: string) => void = () => {};

  function runLifecycle(id: string, phase: 'onShow' | 'onHide' | 'onDestroy', handle?: TabHandle): void {
    try {
      handle?.[phase]?.();
    } catch (err) {
      console.error(`[tab] ${phase} failed: ${id}`, err);
    }
  }

  function renderTabError(def: TabDef, id: string, err: unknown, retry: () => void): HTMLElement {
    const message = document.createElement('p');
    message.className = 'tab-error-message';
    message.textContent = err instanceof Error ? err.message : String(err);
    return h('section', { class: 'tab-error', role: 'alert', 'aria-labelledby': `tab-error-${id}` },
      h('h2', { id: `tab-error-${id}` }, `Couldn't load ${def.label}`),
      message,
      h('div', { class: 'tab-error-actions' },
        button('Retry', retry, 'primary'),
        h('a', { href: '/menu', class: 'tab-error-menu-link' }, 'Back to all topics'),
      ),
    );
  }

  function show(id: string): void {
    if (id === currentId) return;
    if (currentId) {
      const prev = roots.get(currentId);
      runLifecycle(currentId, 'onHide', prev?.handle);
      if (prev) prev.root.style.display = 'none';
      const prevBtn = buttons.get(currentId);
      prevBtn?.classList.remove('active');
      prevBtn?.removeAttribute('aria-current');
    }
    let entry = roots.get(id);
    if (!entry) {
      const def = defs.find(d => d.id === id)!;
      // Every tab page gets its h1 HERE, not in topicPage(), because two tabs
      // (the sandbox and the question bank) are exempt from the page contract
      // and build their own layout — so a heading added there would leave
      // exactly those two pages nameless. Visually hidden: the design carries
      // the title in the breadcrumb above (docs-site pattern), but a document
      // whose outline starts at h2 has no name to announce or to index.
      const root = h('div', { class: 'tab-root' }, h('h1', { class: 'sr-only' }, def.label));
      view.appendChild(root);
      const retry = () => {
        const failed = roots.get(id);
        runLifecycle(id, 'onDestroy', failed?.handle);
        roots.delete(id);
        failed?.root.remove();
        currentId = null;   // show() early-returns on id === currentId
        show(id);
      };
      // A lazily-imported tab resolves its handle a network round-trip later,
      // so failure can arrive as a rejection rather than a throw. Both land in
      // the same error card — an import that 404s after a redeploy must not
      // leave a blank panel.
      const failMount = (err: unknown): void => {
        console.error(`[tab] mount failed: ${id}`, err);
        const e = roots.get(id);
        if (!e) return;                          // retried or destroyed meanwhile
        e.failed = true;
        e.handle = undefined;
        e.root.replaceChildren(renderTabError(def, id, err, retry));
        buttons.get(id)?.classList.remove('active');
        buttons.get(id)?.removeAttribute('aria-current');
      };
      const settle = (handle: TabHandle | void): void => {
        const e = roots.get(id);
        if (!e || e.failed) return;
        e.handle = handle ?? undefined;
        typesetMath(e.root);
        labelCanvases(e.root);
        markScrollableTables(e.root);
        // show() already ran its onShow before the module landed, with nothing
        // to call. Fire it now if this tab is still the one on screen.
        if (currentId === id) runLifecycle(id, 'onShow', e.handle);
      };
      try {
        const mounted = def.mount(root);
        if (mounted instanceof Promise) {
          entry = { root };
          roots.set(id, entry);
          // A lazily-imported module arrives a chunk-fetch later. Until it does
          // the panel is empty, which reads as "this page is broken" — the exact
          // impression D.0 was about. role="status" (not "alert") so a screen
          // reader hears it once, politely, and aria-busy marks the region as
          // still filling in.
          const skeleton = h('div', { class: 'tab-loading', role: 'status', 'aria-busy': 'true' },
            h('span', { class: 'tab-loading-bar' }),
            h('span', { class: 'tab-loading-bar' }),
            h('span', { class: 'tab-loading-bar' }),
            h('span', { class: 'sr-only' }, `Loading ${def.label ?? id}\u2026`),
          );
          root.appendChild(skeleton);
          mounted.then(() => skeleton.remove(), () => skeleton.remove());
          mounted.then(settle, failMount);
        } else {
          entry = { root, handle: mounted ?? undefined };
          roots.set(id, entry);
          typesetMath(root);
          labelCanvases(root);
        }
      } catch (err) {
        entry = { root };
        roots.set(id, entry);
        failMount(err);
      }
    }
    const activeEntry = entry!;
    activeEntry.root.style.display = '';
    // Track the failed tab as current anyway. Leaving currentId null here means
    // the NEXT show() skips its hide-the-previous branch entirely, and the error
    // card stays on screen stacked above the tab you navigated to. What a failed
    // tab must not do is claim the sidebar (no .active, no aria-current) or run
    // onShow — not "leave no trace of being displayed".
    currentId = id;
    if (activeEntry.failed) return;
    runLifecycle(id, 'onShow', activeEntry.handle);
    labelCanvases(activeEntry.root); // catches canvases the tab created after mount
    markScrollableTables(activeEntry.root);  // measurable only now the root is displayed
    const btn = buttons.get(id);
    btn?.classList.add('active');
    // the active item is the current PAGE (each topic has its own URL), not
    // just a highlighted button — .active is a paint, aria-current is the fact
    btn?.setAttribute('aria-current', 'page');
    revealInNav(id);
    currentId = id;
    // A `?q=` deep link into an ALREADY-MOUNTED tab: no constructor runs, so
    // nothing else would move the quiz onto the linked question. On a first
    // mount this is a no-op — the tab is still importing — and quiz() handles
    // it itself before its first paint.
    const linked = new URLSearchParams(location.search).get('q');
    if (linked) focusQuestion(linked);
  }

  // Sidebar items are grouped by chemistry domain, each group a native
  // <details>. <details>/<summary> is keyboard-operable, announced as a
  // disclosure, and has no focus management to get wrong — a hand-rolled
  // div+click disclosure would have to reimplement all three and would get one
  // of them wrong. The group label is the <summary> and each run of items is a
  // role="group" pointing at it, so the grouping reaches assistive tech and not
  // just the eye.
  const groupEls = new Map<string, HTMLDetailsElement>();
  const groupOfItem = new Map<string, string>();
  const stored = readOpenGroups();

  // Collect into ordered runs first: `defs` is already in group order (main.ts
  // DEFS mirrors topics.ts), and building from runs means the count in each
  // summary is derived rather than written down twice.
  const runs: { name: string; items: TabDef[] }[] = [];
  for (const def of defs) {
    const g = def.group ?? '';
    const last = runs[runs.length - 1];
    if (last && last.name === g) last.items.push(def);
    else runs.push({ name: g, items: [def] });
  }

  runs.forEach((run, i) => {
    const labelId = `nav-group-${i + 1}`;
    const box = h('div', { class: 'nav-group-items', role: 'group', 'aria-labelledby': labelId });
    for (const def of run.items) {
      const btn = h('button', {
        type: 'button', class: 'nav-item', onclick: () => (onSelect ?? show)(def.id),
      }, def.label);
      addNavMeter(btn, def.id, def.label ?? def.id);
      buttons.set(def.id, btn);
      groupOfItem.set(def.id, run.name);
      box.appendChild(btn);
    }
    if (!run.name) { nav.appendChild(box); return; }

    // First visit (nothing stored) starts everything closed; show() then opens
    // the active topic's group, so the student lands on exactly one open
    // section rather than the wall of 25 this replaces.
    const open = stored ? stored.includes(run.name) : false;
    const details = h('details', { class: 'nav-group', open: open || undefined },
      h('summary', { class: 'nav-group-head', id: labelId },
        h('span', { class: 'nav-group-chevron', html: CHEVRON_ICON }),
        h('span', { class: 'nav-group-name' }, run.name),
        h('span', { class: 'nav-group-n' }, String(run.items.length)),
      ),
      box,
    ) as HTMLDetailsElement;
    details.addEventListener('toggle', persistOpenGroups);
    groupEls.set(run.name, details);
    nav.appendChild(details);
  });

  function persistOpenGroups(): void {
    const open = [...groupEls.entries()].filter(([, d]) => d.open).map(([name]) => name);
    try { localStorage.setItem(NAV_OPEN_KEY, JSON.stringify(open)); } catch { /* storage unavailable — the nav still works, it just won't remember */ }
  }

  /** Open the group holding `id` and bring the item into view. */
  revealInNav = (id: string) => {
    const g = groupOfItem.get(id);
    const details = g ? groupEls.get(g) : undefined;
    // The active topic's group is open whatever the stored state says: a cold
    // load of /topic/thermodynamics-ii must not land you on a collapsed sidebar
    // with no indication of where you are.
    if (details && !details.open) { details.open = true; persistOpenGroups(); }
    buttons.get(id)?.scrollIntoView({ block: 'nearest' });
  };
  if (currentId) revealInNav(currentId); // show() may already have run

  return {
    show,
    suspend() { if (currentId) runLifecycle(currentId, 'onHide', roots.get(currentId)?.handle); },
    resume() { if (currentId) runLifecycle(currentId, 'onShow', roots.get(currentId)?.handle); },
    current: () => currentId,
  };
}

/**
 * The one-sentence brief for a simulation card: what to DO with it.
 *
 * A card title names the physics ("Maxwell–Boltzmann speed distribution"); it
 * does not tell a student who has never seen the plot which slider to move or
 * what they are supposed to notice. Imperative, one sentence, no hedging — it
 * is an instruction, not a summary of the theory block.
 *
 * Pass it anywhere in the card's children; `cardWithMissions` hoists it to sit
 * directly under the title, above the mission ladder.
 */
export function task(text: string): HTMLElement {
  return h('p', { class: 'card-task' }, text);
}

/** Card with missions pinned above the simulation controls. */
export function cardWithMissions(title: string, missions: MissionLadderHandle, ...children: (Node | string)[]): HTMLElement {
  const [brief, rest] = takeTask(children);
  return h('section', { class: 'card' }, h('h2', {}, title), brief, foldMissions(missions), ...rest);
}

const MISSION_OPEN_KEY = 'chemprep_missions_open_v1:';

/**
 * The ladder, folded to one line until the student asks for it (plan3 §1.5).
 *
 * A sim card was a task line, a mission box with its pager, meter, hint and
 * check buttons, then the controls, the readout and the caption — and the part
 * that teaches, the simulation, started below the fold. The missions are still
 * the first thing under the brief; they are just one line of it until opened.
 *
 * This is PRESENTATION ONLY. Mission ids, tick(), meter(), markSolved and
 * recordAttempt are untouched — a folded ladder still ticks (its meters are
 * simply not on screen), and nothing here can complete a mission.
 *
 * The open/closed bit is per card, keyed on the FIRST MISSION ID (permanent and
 * namespaced, unlike a card title) and kept in sessionStorage: a fold is a
 * this-sitting preference, not progress, so it must not outlive the tab or sync
 * anywhere. Storage can throw (Safari private mode), and a card that cannot
 * remember its fold is still a working card.
 */
function foldMissions(missions: MissionLadderHandle): HTMLElement {
  const id = missions.ids[0] ?? '';
  const key = MISSION_OPEN_KEY + id;
  missions.el.id = `missions-${id}`;
  const text = h('span', { class: 'mission-fold-text' });
  const action = h('span', { class: 'mission-fold-action' });
  // A real button with aria-expanded — this is a disclosure, and the arrow-key
  // and Enter/Space behaviour comes free with the element.
  const toggle = h('button', {
    type: 'button', class: 'mission-fold-btn', 'aria-controls': missions.el.id,
  }, text, action);

  const summary = (): string => {
    const at = missions.el.querySelector('.mission-page-label')?.textContent?.trim() || 'Missions';
    const prompt = missions.el.querySelector('.mission-strip:not([hidden]) .mission-prompt');
    // textContent, so the prompt's markup (\ce{}, <b>, <span class=badge>) is
    // never re-inserted as HTML into this line. The badge repeats the pager's
    // "Mission n", so it comes off the front.
    const words = (prompt?.textContent ?? '').replace(/^\s*Mission\s+\d+\s*/, '').replace(/\s+/g, ' ').trim();
    return words ? `${at} · ${words.length > 60 ? words.slice(0, 60).trimEnd() + '…' : words}` : at;
  };

  let open = false;
  const setOpen = (next: boolean): void => {
    open = next;
    missions.el.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    action.textContent = open ? 'Hide' : 'Show';
    if (!open) text.textContent = summary();
    else text.textContent = 'Missions';
    try { sessionStorage.setItem(key, open ? '1' : '0'); } catch { /* fold just won't be remembered */ }
  };

  let stored: string | null = null;
  try { stored = sessionStorage.getItem(key); } catch { /* ignore */ }
  toggle.addEventListener('click', () => setOpen(!open));
  const wrap = h('div', { class: 'mission-fold' }, toggle, missions.el);
  // The summary reads the ladder's own DOM, which missionLadder() has already
  // painted by the time it hands the handle over.
  setOpen(stored === '1');
  return wrap;
}


// ---- hyperscript-style element builder ----
type Attrs = Record<string, string | number | boolean | EventListener | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K, attrs: Attrs = {}, ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined) continue;
    if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2), v as EventListener);
    } else if (k === 'class') {
      el.className = String(v);
    } else if (k === 'html') {
      // The app's one HTML escape hatch, and it is safe only because of an
      // invariant that is not visible from here (revamp.md S2): every string
      // that reaches it is a build-time TypeScript literal — question prose,
      // computed SVG, numbers. Audited: no innerHTML site in src/ is fed by
      // localStorage, a URL parameter, or a typed query (search.ts and
      // feedback.ts contain no innerHTML at all), and the sole user-authored
      // string on the site — the feedback `note` — is write-only by database
      // policy (see the header comment in signals.ts).
      //
      // So the rule for anything added later: a string that a user or a server
      // could author does NOT come through `html:`. Pass it as a text child,
      // which is escaped, or escape it at its source. Sanitising here instead
      // would be the wrong place — it would silently mangle the chemistry
      // markup this key exists to render.
      el.innerHTML = String(v);
    } else {
      el.setAttribute(k, String(v));
    }
  }
  for (const c of children) if (c !== null && c !== undefined) el.append(c);
  return el;
}

export function card(title: string, ...children: (Node | string | null | undefined)[]): HTMLElement {
  const [brief, rest] = takeTask(children);
  return h('section', { class: 'card' }, h('h2', {}, title), brief, ...rest);
}

/**
 * Pull a `task()` line out of a card's children so it can be placed directly
 * under the title, wherever the call site happened to pass it. Hoisting rather
 * than adding a parameter keeps the brief next to the controls it describes in
 * the source, and means no call site can accidentally file it below the canvas.
 */
type Child = Node | string | null | undefined;
function takeTask(children: Child[]): [Child, Child[]] {
  const rest = [...children];
  const at = rest.findIndex(c => c instanceof HTMLElement && c.classList.contains('card-task'));
  return at < 0 ? [null, rest] : [rest.splice(at, 1)[0], rest];
}

// Collapsible theory/reference block. `html` may contain markup.
//
// A short block opens itself. Collapsing three sentences buys no scroll and
// costs a click, and the panel-per-pill modules are mostly short blocks — the
// long module-level ones (which are the reason the control exists) stay shut.
const THEORY_AUTO_OPEN = 700;   // chars of markup, not of prose — close enough
/**
 * A "Show solution" disclosure: the button and the panel it reveals.
 *
 * Written three times before this (challenge.ts, qbank.ts, structure.ts) and
 * the copies had already diverged — two relabelled on toggle and one said
 * "Show / hide solution" forever, leaving the control's state invisible. Only
 * one of the three carried `aria-expanded`. That is what duplicated DOM costs:
 * not the lines, the drift.
 *
 * Returns both nodes rather than a wrapper, because the three call sites lay
 * them out differently and a wrapper would have been the fourth thing to
 * diverge.
 */
/**
 * A copy-this-link button (plan2 §12).
 *
 * The URLs already existed — a question is `?q=<id>` on the bank and a section
 * is its own path — so sharing was possible and invisible. This is only the
 * affordance.
 *
 * Feedback goes in the button's own label rather than a toast: a copy that
 * silently succeeds is indistinguishable from one that silently failed, and
 * clipboard writes DO fail (insecure origin, denied permission, an older
 * browser). On failure it says so instead of lying.
 */
export function copyLinkButton(url: () => string, what = 'link'): HTMLElement {
  const label = `Copy ${what}`;
  const btn = h('button', { type: 'button', class: 'btn btn-quiet copy-link' }, label);
  // The manual fallback. Telling someone to press Ctrl-C with nothing selected
  // is worse than saying nothing, so the failure path puts the real URL on
  // screen and selects it — then the instruction is true.
  const field = h('input', { class: 'copy-link-fallback', readonly: '', 'aria-label': what, hidden: '' }) as HTMLInputElement;
  const wrap = h('span', { class: 'copy-link-wrap' }, btn, field);
  let revert: ReturnType<typeof setTimeout> | undefined;
  const reset = (): void => { btn.textContent = label; field.hidden = true; };
  btn.addEventListener('click', () => {
    clearTimeout(revert);
    const href = url();
    const manual = (): void => {
      field.value = href;
      field.hidden = false;
      field.select();
      btn.textContent = 'Copy this:';
    };
    // Clipboard writes fail on an insecure origin, with the permission denied,
    // or in an older browser — all three land on the same honest fallback.
    if (!navigator.clipboard) { manual(); return; }
    void navigator.clipboard.writeText(href)
      .then(() => { btn.textContent = 'Copied'; revert = setTimeout(reset, 2000); })
      .catch(manual);
  });
  return wrap;
}

export function solutionToggle(html: string): { btn: HTMLButtonElement; panel: HTMLElement } {
  const panel = h('div', { class: 'result', html });
  panel.style.display = 'none';
  const btn = h('button', { type: 'button', class: 'btn btn-quiet', 'aria-expanded': 'false' }, 'Show solution');
  btn.addEventListener('click', () => {
    const open = panel.style.display === 'none';
    panel.style.display = open ? '' : 'none';
    btn.textContent = open ? 'Hide solution' : 'Show solution';
    btn.setAttribute('aria-expanded', String(open));
  });
  return { btn, panel };
}

export function theory(title: string, html: string, open = false): HTMLElement {
  const d = h('details', { class: 'theory' }, h('summary', {}, title), h('div', { html }));
  if (open || html.length <= THEORY_AUTO_OPEN) d.setAttribute('open', '');
  return d;
}

let ctlSeq = 0;

export function slider(opts: {
  label: string; min: number; max: number; step?: number; value: number;
  fmt?: (v: number) => string; onInput: (v: number) => void;
}): HTMLElement {
  const fmt = opts.fmt ?? ((v: number) => String(v));
  const labelId = `ctl-${++ctlSeq}`;
  const valEl = h('span', { class: 'ctl-val' }, fmt(opts.value));
  // Two things a bare range input gets wrong here:
  //  - the wrapping <label> would fold the live value into the control's NAME,
  //    so it renames itself on every drag; aria-labelledby pins the name to the
  //    label text only.
  //  - the slider announces its raw `value` (0.001) while the readout shows the
  //    formatted quantity ("1.0 mM"); aria-valuetext makes AT read what is on
  //    screen, units and all.
  const input = h('input', {
    type: 'range', min: opts.min, max: opts.max,
    step: opts.step ?? 1, value: opts.value, autocomplete: 'off',
    'aria-labelledby': labelId, 'aria-valuetext': fmt(opts.value),
  });
  // The readout updates instantly (cheap); the heavy callback (canvas redraws,
  // innerHTML rebuilds) is coalesced to once per animation frame so fast drags
  // stay smooth instead of running the handler for every input event.
  let raf = 0;
  let pending = opts.value;
  input.addEventListener('input', () => {
    pending = Number(input.value);
    valEl.textContent = fmt(pending);
    input.setAttribute('aria-valuetext', fmt(pending));
    if (raf === 0) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        opts.onInput(pending);
      });
    }
  });
  return h('label', { class: 'ctl' },
    h('span', { class: 'ctl-label', id: labelId }, opts.label), input, valEl);
}

/**
 * A caption + control row — the `.ctl` pattern that slider(), select() and
 * numberInput() already produce, for the rows that are assembled by hand.
 *
 * Exists because 46 of those rows were built as `h('div', { class: 'ctl' }, …)`,
 * and a <div> does not associate its caption with anything: every one of those
 * controls announced as an unnamed edit box. A <label> wrapping ONE control
 * names it implicitly, which is why that is the shape used whenever it can be.
 *
 * ponytail: a row with several controls stays a <div> and names each of them
 * with the row caption — implicit association would only reach the first. That
 * makes "A ± δA" the name of both the value and its uncertainty, which is
 * coarse; per-control names would mean every call site passing two strings, and
 * no call site has asked for that yet.
 */
export function ctlRow(label: string, ...controls: (Node | string | null)[]): HTMLElement {
  const fields = controls.filter((c): c is HTMLElement =>
    c instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(c.tagName));
  const implicit = fields.length <= 1;
  if (!implicit) {
    for (const f of fields) if (!f.getAttribute('aria-label')) f.setAttribute('aria-label', label);
  }
  return h(implicit ? 'label' : 'div', { class: 'ctl' },
    h('span', { class: 'ctl-label' }, label), ...controls);
}

export function select(
  label: string,
  options: { value: string; label: string }[],
  onChange: (v: string) => void,
  initial?: string,
): HTMLElement {
  const sel = h('select', { autocomplete: 'off' });
  for (const o of options) {
    const opt = h('option', { value: o.value }, o.label);
    if (o.value === initial) opt.setAttribute('selected', '');
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => onChange(sel.value));
  return h('label', { class: 'ctl' }, h('span', { class: 'ctl-label' }, label), sel);
}

/**
 * A bounded numeric field (ROADMAP D.6).
 *
 * Sliders carry their limits in the DOM and cannot be driven outside them; a
 * bare `<input type="number">` cannot be driven outside them by the *mouse*,
 * but nothing stops a student typing 1e6 into it. That is not hypothetical:
 * sweeping every control on the site to its extremes found exactly one broken
 * readout, and it was a typed ΔH_vap overflowing exp() to "P₂ = Infinity atm".
 *
 * The bounds live on the element (`min`/`max`), so `numVal()` needs no state to
 * clamp with, and the browser's own validity UI comes along free. Clamping is
 * at READ time rather than on every keystroke: rewriting the field mid-edit
 * makes it impossible to type "0.05" into a field whose minimum is 0.01,
 * because the intermediate "0" would be snapped first.
 */
export function numberInput(opts: { value: number; min: number; max: number; step?: number }): HTMLInputElement {
  return h('input', {
    type: 'number', value: opts.value, min: opts.min, max: opts.max,
    step: opts.step ?? 1, autocomplete: 'off',
  });
}

/**
 * The value of a `numberInput`, clamped to its own bounds and guaranteed
 * finite. An empty or half-typed field reads as the minimum rather than NaN.
 */
export function numVal(el: HTMLInputElement): number {
  const lo = Number(el.min), hi = Number(el.max);
  const raw = Number(el.value);
  if (!Number.isFinite(raw)) return Number.isFinite(lo) ? lo : 0;
  return Math.min(Number.isFinite(hi) ? hi : raw, Math.max(Number.isFinite(lo) ? lo : raw, raw));
}

export function button(label: string, onClick: () => void, cls = ''): HTMLButtonElement {
  return h('button', { type: 'button', class: `btn ${cls}`, onclick: onClick }, label);
}



/**
 * Play/pause for a simulation that would otherwise animate the moment you open
 * the page (ROADMAP D.6).
 *
 * The rule this encodes: a decorative animation should be suppressed under
 * `prefers-reduced-motion`, but these simulations ARE the lesson — suppressing
 * them outright would remove the content. So the setting decides the *starting*
 * state only. Reduced motion opens paused, showing a real, computed frame with
 * a Play button; everyone else opens running. Either way the student controls it
 * from then on, which is also what an animation-sensitive reader needs mid-page.
 *
 * `onChange` fires with the new state so a paused sim can still redraw once.
 */
export function playPause(onChange: (playing: boolean) => void): { el: HTMLButtonElement; playing: () => boolean } {
  let playing = !prefersReducedMotion();
  const btn = h('button', { type: 'button', class: 'btn play-pause' }, '');
  const paint = () => {
    btn.textContent = playing ? 'Pause' : 'Play';
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pause the simulation' : 'Play the simulation');
  };
  btn.addEventListener('click', () => { playing = !playing; paint(); onChange(playing); });
  paint();
  // A FOLDED card is not playing. Reported here rather than by each loop,
  // because `visible && play.playing()` is already the one gate all three
  // animated tabs consult — a second flag would be a second thing to forget.
  // The student's own choice is untouched, so expanding resumes where it was.
  return { el: btn, playing: () => playing && !folded(btn) };
}

let pillSeq = 0;

// Sub-navigation pills inside a tab; returns container with panels swapped.
//
// Unlike the quiz options, this one IS the ARIA tabs pattern — one of a set of
// choices that swaps a panel and is freely revisable — so it gets the whole
// pattern rather than half of it: tablist/tab/tabpanel roles, aria-selected,
// a single tab stop with arrow-key movement between the pills (a roving
// tabindex), and Home/End. Implementing the roles without the keyboard
// behaviour would be worse than leaving them off, because it would promise a
// interaction model the widget doesn't honour.
export function pills(sections: { label: string; el: HTMLElement }[]): HTMLElement {
  const uid = `pills-${++pillSeq}`;
  const bar = h('div', { class: 'pill-bar', role: 'tablist' });
  const body = h('div', {});
  const btns: HTMLButtonElement[] = [];
  sections.forEach((s, i) => {
    const b = h('button', {
      type: 'button', class: 'pill', role: 'tab',
      id: `${uid}-tab-${i}`, 'aria-controls': `${uid}-panel-${i}`,
      'aria-selected': 'false', tabindex: -1,
      onclick: () => activate(i),
    }, s.label);
    b.addEventListener('keydown', e => {
      const last = sections.length - 1;
      let to = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = i === 0 ? last : i - 1;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = last;
      if (to < 0) return;
      e.preventDefault();
      activate(to, true);
    });
    btns.push(b);
    bar.appendChild(b);
  });
  // Every panel is mounted up front with the inactive ones `hidden`, rather
  // than swapped in one at a time. `aria-controls` only means something if it
  // resolves to an element that is actually in the document, and a detached
  // panel resolves to nothing — swapping would leave every unselected tab
  // pointing at an id that isn't there. (Safe because style.css carries a
  // `[hidden] { display: none !important }` guard, so a panel's own display
  // rules can't un-hide it.)
  sections.forEach((s, i) => {
    s.el.id = `${uid}-panel-${i}`;
    s.el.setAttribute('role', 'tabpanel');
    s.el.setAttribute('aria-labelledby', `${uid}-tab-${i}`);
    s.el.hidden = true;
    body.appendChild(s.el);
  });

  function activate(i: number, moveFocus = false): void {
    btns.forEach((b, j) => {
      const on = i === j;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    sections.forEach((s, j) => { s.el.hidden = j !== i; });
    labelCanvases(sections[i].el);
    markScrollableTables(sections[i].el);   // a panel just un-hidden can be measured
    if (moveFocus) btns[i].focus();
  }
  activate(0);
  // `.pills` matters for layout: topicPage puts the simulation region in a
  // flex-wrap `.cards` row, and a pill group is a full-width block in it, not
  // a card sitting beside another card.
  return h('div', { class: 'pills' }, bar, body);
}



// Overflow is a function of viewport width, so the pass has to re-run on resize
// — a table that fits on a laptop overflows the moment the window is narrowed.
let resizePass = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizePass);
  resizePass = setTimeout(() => markScrollableTables(), 150) as unknown as number;
});
