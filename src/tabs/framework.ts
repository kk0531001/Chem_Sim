// Tab framework + shared DOM/plot helpers for the topic modules.
// Each tab is lazily mounted on first visit; onShow/onHide let tabs with
// animation loops pause when hidden.
import { isSolved, markSolved, unmarkSolved, recordAttempt, solvedOf, solvedWithPrefix, onProgressChange, isBookmarked, toggleBookmark } from '../progress';
import { toExamTopic, isExamTopicId, EXAM_TOPIC_LABEL } from '../content/topicIds';
import { signal, registerQuizReporter } from '../signals';
import { weakTopics } from '../progress';
import { recommendNext } from '../recommend';
import { navigate } from '../router';
import { CHEVRON_ICON } from '../icons';
import { ID_PREFIX } from '../content/topicIds';
import { MODULE_QUIZ_SIZE } from '../content/counts';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';
import renderMathInElement from 'katex/contrib/auto-render';

// Typeset LaTeX / mhchem (\ce{...}) inside an element. Delimiters: \( \) inline,
// \[ \] and $$ $$ display. Safe on content with no math (no-op) and on detached
// nodes. throwOnError keeps a malformed formula from blanking the whole page.
export function typesetMath(el: HTMLElement): void {
  try {
    renderMathInElement(el, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  } catch { /* ignore — never let math rendering break a tab */ }
}

// Auto-typeset a container and everything later inserted into it (reactive
// .result panels rebuilt on slider drags, quiz explanations, lazily-mounted
// tabs). Disconnects while typesetting so KaTeX's own DOM writes don't re-fire.
export function autoTypeset(...roots: HTMLElement[]): void {
  let scheduled = false;
  const pending = new Set<HTMLElement>();
  const flush = () => {
    scheduled = false;
    obs.disconnect();
    for (const el of pending) if (el.isConnected) typesetMath(el);
    pending.clear();
    for (const r of roots) obs.observe(r, { childList: true, subtree: true });
  };
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      const t = (m.target.nodeType === 1 ? m.target : m.target.parentElement) as HTMLElement | null;
      if (t) pending.add(t);
    }
    if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
  });
  for (const r of roots) { typesetMath(r); obs.observe(r, { childList: true, subtree: true }); }
}

export interface TabHandle {
  onShow?: () => void;
  onHide?: () => void;
  onDestroy?: () => void;
}

/**
 * `label` and `group` are the SIDEBAR's copy of a module's name, deliberately
 * shorter than its `TopicMeta.title` ("Bonding & MO" vs "Bonding, VSEPR & MO
 * Theory"). They live in the LAZY table in main.ts, not here, because a tab
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

// ---- quick-quiz widget: one question at a time, instant feedback ----
/**
 * `id` is EXPLICIT and PERMANENT — never derived from the question text.
 * Progress used to be keyed by a hash of `q`, which meant fixing a typo
 * silently orphaned every user's record for that question. Assign a new id
 * from scripts/backfill-ids.mjs; never renumber an existing one.
 *
 * `topic` is a ModuleId and optional only because the 125 olympiad Part A
 * questions span the whole syllabus and have no single topic. Everything else
 * carries one, and per-topic statistics skip the ones that don't.
 */
export interface QuizQ {
  id: string;
  topic?: string;
  /**
   * Difficulty tier (1 Bronze … 4 Platinum) and the competitions this question
   * is in scope for. Both are OPTIONAL OVERRIDES: `tierOf()` and `compsOf()` in
   * src/content/registry.ts derive a value for every question from where it
   * lives and its module's curated `difficulty`, so coverage is total without
   * 919 hand-tags. Set these only where the derived answer is wrong — a stored
   * value that merely restates the default is one more thing to go stale.
   */
  tier?: 1 | 2 | 3 | 4;
  comps?: readonly ('ccc' | 'usnco' | 'cco' | 'icho')[];
  q: string;
  opts: string[];
  a: number;
  why: string;
  /** Wrong-answer mental-model correction — shown below `why` when the student misses. */
  misconception?: string;
  /**
   * A SECOND, handwritten explanation of the same answer from a different angle
   * (ROADMAP H.1) — revealed by the "Explain it differently" button, right or
   * wrong. It must re-derive the answer by another route (picture, limiting
   * case, analogy, unit argument), not restate `why` in new words: a student
   * who presses that button has already read `why` and it did not land.
   *
   * Deliberately not AI-generated. H.3's model-backed version needs a proxy
   * function, a rate limiter and a monthly bill for demand nobody has measured
   * yet; a string on the questions that actually get missed costs nothing.
   */
  why2?: string;
}

let quizSeq = 0;

/**
 * "Was this explanation helpful?" (ROADMAP I.2) — one verdict per question id.
 *
 * A one-shot control: it asks once, records once, and replaces itself with the
 * acknowledgement. There is no undo and no second vote, because the value of
 * this data is in which explanations get flagged at all, not in a running
 * tally that one irritated reader can drive.
 */
export function helpfulBar(questionId: string): HTMLElement {
  const bar = h('div', { class: 'helpful' }, h('span', { class: 'helpful-q' }, 'Did this explanation help?'));
  const vote = (verdict: 'yes' | 'no') => () => {
    signal('explain', questionId, { note: verdict });
    bar.replaceChildren(h('span', { class: 'helpful-q' },
      verdict === 'yes' ? 'Thanks — noted.' : 'Thanks — this one is on the list to rewrite.'));
  };
  bar.append(
    h('button', { type: 'button', class: 'helpful-btn', onclick: vote('yes') }, 'Helpful'),
    h('button', { type: 'button', class: 'helpful-btn', onclick: vote('no') }, 'Not helpful'),
  );
  return bar;
}

/*
 * Accessibility notes on the pattern used here, because the obvious choice is
 * the wrong one.
 *
 * `role="radiogroup"` looks right and is wrong. A radio group models a
 * *revisable* choice: arrow keys move between options, only one is in the tab
 * order, and `aria-checked` tracks a selection the user can still change before
 * committing it. This quiz has none of that — the first click is final, it is
 * graded on the spot, and the option you pressed is not a "selection" but an
 * answer already scored. Announcing "radio button, 2 of 4, not checked" would
 * describe an interaction that does not exist here.
 *
 * So the options stay real <button>s (correct: each one is a distinct,
 * immediate action) inside a `role="group"` named by the question, which is
 * what gives the set its context. What the buttons then need is for the
 * *result* to survive the loss of colour: `.correct` / `.wrong` are green and
 * red backgrounds and nothing else, so each graded button also gets an
 * .sr-only suffix, and the verdict is prepended to the live explanation.
 */
/**
 * Every live quiz's "jump to this question id" handler (F.1).
 *
 * Bounded by construction: tabs mount at most once each, so this holds one
 * entry per quiz on the site (~30), not one per navigation. Question ids are
 * unique corpus-wide, so at most one entry can ever claim a given id.
 */
const QUIZZES: ((id: string, repaint: boolean) => boolean)[] = [];

/** Move whichever quiz owns this question id onto it. True if one did. */
export function focusQuestion(id: string): boolean {
  for (const jump of QUIZZES) if (jump(id, true)) return true;
  return false;
}

export function quiz(qs: QuizQ[], warmupCount = 0): HTMLElement {
  let i = 0, score = 0, answered = false;
  // Explicit ids, not qid(q.q). Keying progress on a hash of the prompt meant
  // that fixing a typo silently orphaned every user's record for the question.
  const ids = qs.map(q => q.id);
  const uid = `quiz-${++quizSeq}`;
  const progress = h('div', { class: 'quiz-progress' });
  const qEl = h('div', { class: 'quiz-q', id: `${uid}-q` });
  // Progress + question move together and take focus after "Next question", so
  // a screen reader reads "Question 7 of 25 · olympiad …" and then the new
  // question. That is why the progress line needs no live region of its own —
  // it is never announced out of context, and never mid-typing.
  // Bookmarking is a toggle button, not a link or a checkbox: aria-pressed is
  // what states "on", and the label has to change with it or a screen-reader
  // user hears "Bookmark" on a question that already is one.
  const bmBtn = h('button', { type: 'button', class: 'bookmark-btn', 'aria-pressed': 'false' });
  bmBtn.addEventListener('click', () => { toggleBookmark(ids[i]); syncBookmark(); });
  function syncBookmark(): void {
    const on = i < qs.length && isBookmarked(ids[i]);
    bmBtn.classList.toggle('on', on);
    bmBtn.setAttribute('aria-pressed', String(on));
    bmBtn.innerHTML = BOOKMARK_ICON + `<span class="sr-only">${on ? 'Bookmarked, click to remove' : 'Bookmark this question'}</span>`;
  }
  const head = h('div', { class: 'quiz-head', tabindex: -1 },
    h('div', { class: 'quiz-head-row' }, progress, bmBtn), qEl);
  const optsEl = h('div', { class: 'quiz-opts' });
  const whyEl = h('div', { class: 'quiz-why', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const nextBtn = button('Next question', () => { i++; render(true); }, 'primary');
  const wrap = h('div', { class: 'quiz' }, head, optsEl, whyEl, nextBtn);
  onProgressChange(() => { if (i < qs.length) updateProgressLine(); });

  /**
   * `?q=<id>` opens the quiz ON that question (ROADMAP F.1).
   *
   * `jump` is registered globally rather than read only at construction,
   * because TABS MOUNT ONCE. Searching for a question in a module you have
   * already opened re-shows the existing tab — no constructor runs, so a
   * link-time-only read landed on the page but not the question. Both paths now
   * end up here: a fresh mount jumps before its first paint (no flash of
   * question 1), and a re-show is driven by initTabs calling focusQuestion.
   *
   * The parameter is NOT cleared as the student advances. It records where the
   * link pointed, so a refresh lands in the same place; treating it as live
   * position would mean rewriting the URL on every "Next question".
   */
  const jump = (id: string, repaint: boolean): boolean => {
    const at = ids.indexOf(id);
    if (at < 0) return false;
    i = at;
    if (repaint) render(true);
    // After layout, or the scroll target has no position yet.
    requestAnimationFrame(() => wrap.scrollIntoView({ block: 'center', behavior: 'auto' }));
    return true;
  };
  QUIZZES.push(jump);

  // I.2: where students stop. Reported on leaving the page, not per question —
  // the interesting number is the LAST position reached, and one row per quiz
  // per visit says that. `reported` guards against a second identical row when
  // a tab is hidden and shown again without the student answering anything.
  let answeredCount = 0, reported = -1;
  registerQuizReporter(() => {
    if (answeredCount === 0 || answeredCount === reported) return null;
    reported = answeredCount;
    return { ref: ids[Math.min(i, qs.length - 1)], answered: answeredCount };
  });

  // Options are a named group while they are options; on the "Done" screen the
  // container holds a single Restart button and must not claim to be one.
  function setOptsGrouped(on: boolean): void {
    if (on) {
      optsEl.setAttribute('role', 'group');
      optsEl.setAttribute('aria-labelledby', `${uid}-q`);
    } else {
      optsEl.removeAttribute('role');
      optsEl.removeAttribute('aria-labelledby');
    }
  }

  /**
   * The end of a quiz is the one moment a student has nothing to do, so it has
   * to hand them the next thing rather than only offering the same 25 questions
   * again. Order of preference:
   *   1. their weakest exam topic — the bank, filtered to it;
   *   2. failing enough data for that (weakTopics needs 4 attempts in a topic),
   *      the ordinary next-lesson recommendation, which always has an answer.
   * Restart drops to quiet: it is available, but it is not the advice.
   */
  function doneActions(): (HTMLElement | string)[] {
    const restart = button('Restart quiz', () => { i = 0; score = 0; render(true); }, 'btn-quiet');
    const weak = weakTopics(1)[0];
    if (weak && isExamTopicId(weak.topic)) {
      const label = EXAM_TOPIC_LABEL[weak.topic];
      const go = button(`Practise ${label}`, () => navigate({ kind: 'topic', id: 'qbank' }, false,
        '?' + new URLSearchParams({ part: 'results', topic: weak.topic })), 'primary');
      return [h('p', { class: 'quiz-next-line' },
        `Weakest area so far: ${label} — ${Math.round(weak.accuracy * 100)}% of ${weak.seen} answered right.`),
        go, restart];
    }
    const rec = recommendNext(qs[0]?.topic ?? '');
    if (!rec) return [restart];
    return [h('p', { class: 'quiz-next-line' }, `Next: ${rec.topic.title} — ${rec.reason}.`),
      button(`Open ${rec.topic.title}`, () => navigate({ kind: 'topic', id: rec.topic.id }), 'primary'),
      restart];
  }

  function render(moveFocus = false): void {
    answered = false;
    whyEl.innerHTML = '';
    whyEl.className = 'quiz-why';
    nextBtn.style.display = 'none';
    syncBookmark();
    // Nothing to bookmark on the "Done" screen — it is not a question.
    bmBtn.hidden = i >= qs.length;
    if (i >= qs.length) {
      setProgress('');
      qEl.innerHTML = `Done — score <b>${score}/${qs.length}</b> ` +
        (score === qs.length ? '— perfect!' : score >= Math.ceil(qs.length * 0.7) ? '— solid!' : '— review the theory panel and retry.');
      setOptsGrouped(false);
      optsEl.replaceChildren(...doneActions());
      if (moveFocus) head.focus();
      return;
    }
    const q = qs[i];
    updateProgressLine();
    setOptsGrouped(true);
    qEl.innerHTML = q.q + (isSolved(ids[i]) ? ' <span class="solved-tag">✓ solved</span>' : '');
    optsEl.replaceChildren(...q.opts.map((o, j) => {
      const b = h('button', { type: 'button', class: 'quiz-opt' }, o);
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        answeredCount++;
        const right = j === q.a;
        if (right) { score++; b.classList.add('correct'); markSolved(ids[i]); }
        else {
          b.classList.add('wrong');
          (optsEl.children[q.a] as HTMLElement).classList.add('correct');
        }
        // Log the attempt whether it was right or wrong — the wrong ones are
        // the entire point (weak topics, personalised review). Topics are
        // normalised to the coarse exam vocabulary so that a module-tagged
        // quiz and an exam-bank question about the same chemistry land in the
        // same bucket instead of two half-populated ones.
        recordAttempt(ids[i], right, { topic: toExamTopic(q.topic), chosen: j });
        // The grading is over: keep the buttons focusable (so they can still be
        // read) but tell AT they no longer do anything, and spell out in text
        // what the red/green only shows visually.
        for (const el of Array.from(optsEl.children)) el.setAttribute('aria-disabled', 'true');
        srSuffix(optsEl.children[q.a], right ? 'correct answer, your answer' : 'correct answer');
        if (!right) srSuffix(b, 'your answer, incorrect');
        // aria-live on whyEl announces this; leading with the verdict means the
        // outcome is heard first and does not depend on the colour change.
        let whyHtml = `<span class="sr-only">${right ? 'Correct. ' : 'Incorrect. '}</span>${q.why}`;
        if (!right && q.misconception) {
          // The text goes in ONE span: .misconception is a flex row, so any
          // bare text nodes and inline tags in the copy would each become a
          // separate flex item and stack up as narrow columns.
          whyHtml += `<div class="misconception" role="note">${MISCON_ICON}<span><strong>Common misconception:</strong> ${q.misconception}</span></div>`;
        }
        whyEl.innerHTML = whyHtml;
        whyEl.classList.add(right ? 'good' : 'bad');
        if (q.why2) {
          // Offered whether or not they got it right: a lucky guess is exactly
          // the case where one explanation has not landed. Hidden until asked
          // for, because two explanations side by side read as noise to the
          // student who already understood the first.
          const alt = h('div', { class: 'why2', role: 'note', hidden: '' });
          alt.innerHTML = `<strong>Another way to see it:</strong> ${q.why2}`;
          const ask = button('Explain it differently', () => {
            alt.hidden = false;
            ask.remove();
            typesetMath(alt);
          }, 'why2-btn');
          whyEl.append(ask, alt);
        }
        whyEl.append(helpfulBar(ids[i]));
        typesetMath(whyEl);
        updateProgressLine();
        nextBtn.style.display = '';
      });
      return b;
    }));
    // Typeset any LaTeX/mhchem in the question and options now, rather than
    // depending on the rAF-based observer (which can flash raw \( … \)).
    typesetMath(qEl);
    typesetMath(optsEl);
    if (moveFocus) head.focus();
  }

  // Rewriting the text node is what triggers a live-region announcement, so
  // only touch it when the string actually changed (onProgressChange can fire
  // from a cloud sync with nothing new to say).
  function setProgress(s: string): void {
    if (progress.textContent !== s) progress.textContent = s;
  }

  function updateProgressLine(): void {
    if (i >= qs.length) return;
    const tier = warmupCount === 0 ? '' : i < warmupCount ? ' · warm-up' : ' · olympiad';
    const done = solvedOf(ids);
    setProgress(`Question ${i + 1} of ${qs.length}${tier} · score ${score} · ${done}/${qs.length} solved`);
  }

  jump(new URLSearchParams(location.search).get('q') ?? '', false);
  render();
  return wrap;
}

// ---- interactive simulation missions ----
const CHECK_ICON = '<svg class="mission-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.5 11.5 3 8l1.1-1.1 2.4 2.4 5.4-5.4L13 5.1z"/></svg>';
const BOOKMARK_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 2.5h8a.5.5 0 0 1 .5.5v10.2a.3.3 0 0 1-.47.25L8 10.6l-4.03 2.85a.3.3 0 0 1-.47-.25V3a.5.5 0 0 1 .5-.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';

const MISCON_ICON ='<svg class="miscon-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-.75 2.5h1.5v4.5h-1.5V7.5Z"/></svg>';

export interface MissionMeter {
  label: string;
  pct: number; // 0–100 proximity to goal
}

export interface MissionDef {
  id: string;
  prompt: string;
  hints?: string[];
  explain?: string;
  /** Live feedback while the student experiments (progress bar + label). */
  meter?: () => MissionMeter | null;
  /**
   * Reads the simulation's live state. Optional because a `choices` or
   * `numeric` mission asks the student to interpret what the sim shows rather
   * than to drive it to a particular state, so it has nothing to poll.
   */
  check?: () => boolean;
  /** If true, the student must click "Check my setup" — no auto-complete on tick. */
  verify?: boolean;
  /** Pick-one challenge (e.g. reaction order, phase name). */
  choices?: { label: string; value: string }[];
  validateChoice?: (value: string) => boolean;
  /** Typed numeric answer (e.g. node count, crossover T). */
  numeric?: { label: string; placeholder?: string; step?: number; validate: (n: number) => boolean };
}

export interface MissionLadderHandle {
  el: HTMLElement;
  tick: () => void;
}

/** Sequential mission ladder — one shared helper for every simulation tab. */
export function missionLadder(defs: MissionDef[]): MissionLadderHandle {
  const solved = defs.map(d => isSolved(d.id));
  const hintIdx = defs.map(() => 0);
  const announce = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });

  // ---- pager ----
  // One mission on screen at a time. A card with three missions stacked was
  // taller than the simulation it belonged to, which pushed the actual controls
  // below the fold — the ladder was crowding out the thing it teaches.
  const pageLabel = h('span', { class: 'mission-page-label' });
  const prevBtn = h('button', { type: 'button', class: 'btn mission-page-btn', 'aria-label': 'Previous mission' }, '‹');
  const nextBtn = h('button', { type: 'button', class: 'btn mission-page-btn', 'aria-label': 'Next mission' }, '›');
  const dots = h('div', { class: 'mission-dots' });
  const pager = h('div', { class: 'mission-pager' }, prevBtn, pageLabel, dots, nextBtn);
  let view = 0;

  const wrap = h('div', { class: 'mission-ladder', role: 'region', 'aria-label': 'Missions' }, announce, pager);

  interface Row {
    def: MissionDef;
    root: HTMLElement;
    meterWrap: HTMLElement;
    meterBar: HTMLElement;
    meterLabel: HTMLElement;
    hintBox: HTMLElement;
    feedback: HTMLElement;
    success: HTMLElement;
    verifyBtn: HTMLButtonElement | null;
    choiceBar: HTMLElement | null;
    numInput: HTMLInputElement | null;
  }
  const rows: Row[] = [];

  function firstOpen(): number {
    const i = solved.findIndex(s => !s);
    return i < 0 ? defs.length : i;
  }

  // Show a row as complete and retire its controls. Split out from setSolved
  // because a mission can also become solved WITHOUT being solved here — a
  // second tab, or a cloud sync landing, fires onProgressChange instead.
  function paintSolved(i: number): void {
    const r = rows[i];
    r.success.replaceChildren(
      h('span', { html: `${CHECK_ICON}<span><strong>Mission complete.</strong> ${defs[i].explain ?? ''}</span>` }),
      // Replay exists because a mission could previously complete itself: any
      // tick where check() happened to pass marked it solved, so a student who
      // simply dragged a slider across the target arrived at a finished mission
      // they never attempted. That is fixed going forward, but the stored
      // completions it already created are permanent without a way out.
      button('Replay', () => replay(i), 'mission-replay'),
    );
    r.success.hidden = false;
    r.meterWrap.hidden = true;
    typesetMath(r.success);
    if (r.verifyBtn) r.verifyBtn.disabled = true;
    if (r.choiceBar) for (const b of r.choiceBar.querySelectorAll('button')) b.disabled = true;
    if (r.numInput) r.numInput.disabled = true;
  }

  /** Put a solved mission back into play, and forget that it was solved. */
  function replay(i: number): void {
    const r = rows[i];
    solved[i] = false;
    unmarkSolved(defs[i].id);
    r.success.hidden = true;
    r.feedback.textContent = '';
    r.hintBox.hidden = true;
    r.hintBox.replaceChildren();
    hintIdx[i] = 0;
    if (r.verifyBtn) r.verifyBtn.disabled = false;
    if (r.choiceBar) for (const b of r.choiceBar.querySelectorAll('button')) b.disabled = false;
    if (r.numInput) { r.numInput.disabled = false; r.numInput.value = ''; }
    view = i;
    refreshLocks();
  }

  function setSolved(i: number): void {
    if (solved[i]) return;
    solved[i] = true;
    markSolved(defs[i].id);
    paintSolved(i);
    announce.textContent = `Mission complete: ${defs[i].prompt.replace(/<[^>]+>/g, '')}`;
    refreshLocks();
    // Stay on the mission just solved so its explanation can be read — the
    // explanation IS the teaching — but tell the reader where to go next.
    nextBtn.classList.toggle('mission-next-ready', i === view && view < defs.length - 1);
  }

  // Redraw one row's proximity meter. Separated from tick() so unlocking a
  // mission can fill its meter immediately — otherwise a newly opened mission
  // shows an empty bar until the student next touches a control, which on a
  // slider-driven tab means it looks broken until they guess what to move.
  function paintMeter(i: number): void {
    const r = rows[i];
    if (solved[i] || i > firstOpen()) { r.meterWrap.hidden = true; return; }
    const m = r.def.meter?.();
    if (!m) { r.meterWrap.hidden = true; return; }
    r.meterBar.style.width = `${Math.max(0, Math.min(100, m.pct))}%`;
    r.meterLabel.textContent = m.label;
    r.meterWrap.hidden = false;
  }

  function refreshLocks(): void {
    const open = firstOpen();
    rows.forEach((r, i) => {
      r.root.classList.toggle('mission-locked', !solved[i] && i > open);
      r.root.classList.toggle('mission-active', !solved[i] && i === open);
      r.root.classList.toggle('mission-solved', solved[i]);
      paintMeter(i);
    });
    paintPager();
  }

  /** Show only the mission being viewed, and update the pager chrome. */
  function paintPager(): void {
    view = Math.max(0, Math.min(defs.length - 1, view));
    rows.forEach((r, i) => { r.root.hidden = i !== view; });
    pageLabel.textContent = `Mission ${view + 1} of ${defs.length}`;
    prevBtn.disabled = view === 0;
    nextBtn.disabled = view === defs.length - 1;
    // A dot per mission: filled when solved, ringed for the one you are on.
    // Cheaper to read at a glance than the label, and it restores the sense of
    // a LADDER that showing one mission at a time would otherwise lose.
    dots.replaceChildren(...defs.map((_, i) => {
      const d = h('button', {
        type: 'button',
        class: `mission-dot${solved[i] ? ' done' : ''}${i === view ? ' current' : ''}`,
        'aria-label': `Mission ${i + 1}${solved[i] ? ', complete' : ''}`,
        'aria-current': i === view ? 'true' : 'false',
        onclick: () => { view = i; paintPager(); },
      });
      return d;
    }));
    // The pager is noise on a single-mission card.
    pager.hidden = defs.length < 2;
  }

  function wrongFeedback(i: number, msg: string): void {
    const r = rows[i];
    r.feedback.textContent = msg;
    r.root.classList.add('mission-shake');
    setTimeout(() => r.root.classList.remove('mission-shake'), 400);
  }

  defs.forEach((def, i) => {
    const meterWrap = h('div', { class: 'mission-meter-wrap' },
      h('div', { class: 'mission-meter-track' }, h('div', { class: 'mission-meter-fill' })),
      h('span', { class: 'mission-meter-label' }, ''),
    );
    const meterBar = meterWrap.querySelector('.mission-meter-fill') as HTMLElement;
    const meterLabel = meterWrap.querySelector('.mission-meter-label') as HTMLElement;
    const hintBox = h('div', { class: 'mission-hint', hidden: '' });
    const feedback = h('div', { class: 'mission-feedback', 'aria-live': 'polite' });
    const success = h('div', { class: 'mission-success', hidden: '' });
    const actions = h('div', { class: 'mission-actions' });

    let verifyBtn: HTMLButtonElement | null = null;
    let choiceBar: HTMLElement | null = null;
    let numInput: HTMLInputElement | null = null;

    if (def.verify || (!def.choices && !def.numeric)) {
      verifyBtn = button(def.verify ? 'Check my setup' : 'Check answer', () => {
        if (solved[i] || i > firstOpen()) return;
        feedback.textContent = '';
        if (def.check?.()) setSolved(i);
        else wrongFeedback(i, 'Not quite — adjust the controls and try again.');
      }, 'mission-check');
      actions.appendChild(verifyBtn);
    }

    if (def.choices?.length) {
      choiceBar = h('div', { class: 'mission-choices', role: 'group' });
      for (const c of def.choices) {
        const cb = button(c.label, () => {
          if (solved[i] || i > firstOpen()) return;
          feedback.textContent = '';
          if (def.validateChoice?.(c.value)) setSolved(i);
          else wrongFeedback(i, 'That choice doesn\'t match what the sim shows — try again.');
        }, 'mission-choice');
        choiceBar.appendChild(cb);
      }
      actions.appendChild(choiceBar);
    }

    if (def.numeric) {
      numInput = h('input', {
        type: 'number', class: 'mission-num', step: def.numeric.step ?? 1,
        placeholder: def.numeric.placeholder ?? '', autocomplete: 'off',
        'aria-label': def.numeric.label,
      });
      const numBtn = button('Submit', () => {
        if (solved[i] || i > firstOpen()) return;
        feedback.textContent = '';
        const n = Number(numInput!.value);
        if (!Number.isFinite(n)) { wrongFeedback(i, 'Enter a number.'); return; }
        if (def.numeric!.validate(n)) setSolved(i);
        else wrongFeedback(i, 'That value doesn\'t match — count again or re-read the prompt.');
      }, 'mission-check');
      actions.appendChild(h('label', { class: 'mission-num-row' },
        h('span', { class: 'ctl-label' }, def.numeric.label), numInput, numBtn));
    }

    if (def.hints?.length) {
      actions.appendChild(button('Hint', () => {
        if (solved[i] || i > firstOpen()) return;
        const hi = hintIdx[i];
        if (hi >= def.hints!.length) return;
        hintBox.hidden = false;
        hintBox.appendChild(h('p', {}, `Hint ${hi + 1}: ${def.hints![hi]}`));
        hintIdx[i]++;
        typesetMath(hintBox);
      }, 'mission-hint-btn'));
    }

    const promptEl = h('div', { class: 'mission-prompt', html: `<span class="mission-badge">Mission ${i + 1}</span> ${def.prompt}` });
    const root = h('div', { class: 'mission-strip' },
      promptEl, meterWrap, actions, hintBox, feedback, success,
    );
    rows.push({ def, root, meterWrap, meterBar, meterLabel, hintBox, feedback, success, verifyBtn, choiceBar, numInput });
    wrap.appendChild(root);
  });

  // Progress can also arrive from elsewhere — a cloud sync completing after
  // sign-in, or the same mission solved in another open tab.
  onProgressChange(() => {
    defs.forEach((d, i) => {
      if (!solved[i] && isSolved(d.id)) { solved[i] = true; paintSolved(i); }
    });
    refreshLocks();
  });

  /**
   * Repaint the live meters. It does NOT complete anything.
   *
   * It used to: any mission without `choices`/`numeric` was marked solved the
   * instant `check()` returned true on a tick. That sounds generous and is
   * actually the "missions are already finished" bug — a student dragging a
   * slider to see what it does sweeps THROUGH the target value, the tick fires
   * mid-drag, and the mission completes before they have understood, or even
   * read, what it asked. Measured on a clean profile: sweeping every control
   * once, as anyone exploring would, self-completed **16 of 68 missions** with
   * no answer ever submitted. Worse, completion is permanent, so every later
   * visit shows a mission the student never actually did.
   *
   * Completing a mission is now always a deliberate act — "Check answer", a
   * choice, or a submitted number. The meter still gives live feedback while
   * you experiment, which is the part that was genuinely useful.
   */
  function tick(): void {
    rows.forEach((_, i) => paintMeter(i));
  }

  prevBtn.addEventListener('click', () => { view--; paintPager(); });
  nextBtn.addEventListener('click', () => {
    view++;
    nextBtn.classList.remove('mission-next-ready');
    paintPager();
  });

  typesetMath(wrap);
  // Paint the missions this student already finished in an earlier session.
  // `solved` was read from storage at the top, so the test is on `solved[i]`
  // itself — testing `isSolved(id) && !solved[i]` can never fire, which left a
  // returning student looking at a solved mission with its controls still live.
  solved.forEach((s, i) => { if (s) paintSolved(i); });
  // Open on the first UNSOLVED mission: a returning student wants the one they
  // still owe, not a wall of things they already did.
  view = Math.min(firstOpen(), defs.length - 1);
  refreshLocks();
  tick();
  return { el: wrap, tick };
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
  return h('section', { class: 'card' }, h('h2', {}, title), brief, missions.el, ...rest);
}

// Append screen-reader-only text to an element, once.
function srSuffix(el: Element, text: string): void {
  if (el.querySelector('.sr-only')) return;
  el.appendChild(h('span', { class: 'sr-only' }, ` — ${text}`));
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
 * Does this reader want motion kept to a minimum?
 *
 * Read live rather than cached: the setting can change while the page is open,
 * and the cost is a matchMedia lookup. `matchMedia` is guarded because it is
 * absent in some test environments, and the default there is "no preference" —
 * the same thing an unset OS preference reports.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Is this element off-screen — collapsed, or not in the document at all? The
 * one place the site asks that question, so a loop cannot be gated on a stale
 * idea of what "hidden" means.
 *
 * Two cases, and a simulation's animation loop must idle in both:
 *  - `details:not([open])`: a <details> the module nested itself.
 *  - `!isConnected`: the section is not the current route, so topicPage() has
 *    it detached. The rAF loop belongs to the TAB (its handle cancels it when
 *    the topic is left), so between sections of one topic the loop stays alive
 *    and this is what makes it stop painting.
 *
 * Either way a loop that reads this picks up again on the next frame after the
 * block comes back — no toggle or route listener to wire up.
 */
export function folded(el: Element): boolean {
  return !el.isConnected || !!el.closest('details:not([open])');
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

// ---- text alternatives for <canvas> ----
//
// A <canvas> is opaque to assistive tech: whatever it paints, the element
// exposes nothing. Most plots in the app go through plot() below, which knows
// its own axes and series and labels itself precisely. This is the fallback for
// the hand-drawn ones (orbital viewer, MO diagram, decay grid, gas box): name
// them from the nearest preceding heading, which in this codebase is the
// enclosing card's <h2> — the same words a sighted reader uses to identify the
// figure. role="img" also stops AT from wandering into the element.
function nearestHeading(el: Element): string | null {
  let node: Element | null = el;
  while (node) {
    for (let s = node.previousElementSibling; s; s = s.previousElementSibling) {
      if (/^H[1-6]$/.test(s.tagName)) {
        const t = s.textContent?.trim();
        if (t) return t;
      }
    }
    if (node.classList.contains('tab-root')) break;
    node = node.parentElement;
  }
  return null;
}

export function labelCanvases(root: HTMLElement): void {
  for (const c of Array.from(root.querySelectorAll('canvas'))) {
    // never override a label the tab (or plot()) set deliberately
    if (c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby') ||
        c.hasAttribute('aria-hidden')) continue;
    const name = nearestHeading(c);
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', name ?? 'Figure');
  }
}

/**
 * A table that scrolls sideways inside its card is unreachable by keyboard
 * unless something can focus the scroll container (WCAG 2.1.1 — Firefox does
 * this for you, Chrome does not). Give one a tab stop only while it actually
 * overflows: an unconditional tabindex would add ~20 dead stops per page for
 * tables that fit.
 */
export function markScrollableTables(root: ParentNode = document): void {
  for (const t of Array.from(root.querySelectorAll<HTMLElement>('.ref-table, .table-scroll'))) {
    const scrolls = t.scrollWidth > t.clientWidth + 1;
    if (scrolls === t.hasAttribute('tabindex')) continue;
    if (scrolls) {
      t.setAttribute('tabindex', '0');
      t.setAttribute('role', 'region');
      if (!t.hasAttribute('aria-label')) t.setAttribute('aria-label', `${nearestHeading(t) ?? 'Data'} table, scrollable`);
    } else {
      t.removeAttribute('tabindex');
      t.removeAttribute('role');
    }
  }
}
// Overflow is a function of viewport width, so the pass has to re-run on resize
// — a table that fits on a laptop overflows the moment the window is narrowed.
let resizePass = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizePass);
  resizePass = setTimeout(() => markScrollableTables(), 150) as unknown as number;
});

// ---- tiny canvas plotting ----
export interface Series {
  xs: number[]; ys: number[]; color: string;
  label?: string; width?: number; dash?: number[];
}
export interface PlotOpts {
  xLabel?: string; yLabel?: string;
  xMin?: number; xMax?: number; yMin?: number; yMax?: number;
  markers?: { x: number; y: number; color?: string; label?: string }[];
  legend?: boolean;
}

// ---- responsive plots (W3.3) ----
//
// Below the mobile breakpoint the stylesheet lets a canvas fill its card, which
// on its own would just SCALE the bitmap — a 460 px plot squeezed into a 350 px
// card takes its 10 px tick labels down to 7.6 px, which is where a chart stops
// being readable on the device it matters most on.
//
// So the last plot() call is remembered per canvas and replayed at the new
// backing size. Replay rather than a redraw callback because plot() is the only
// thing that knows how to draw a plot: no call site changes, and a tab that
// redraws on its own (an animated sim) overwrites this on its next frame anyway.
const lastPlot = new WeakMap<HTMLCanvasElement, { series: Series[]; opts: PlotOpts; ratio: number }>();
const plotResize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(entries => {
  for (const e of entries) {
    const c = e.target as HTMLCanvasElement;
    const last = lastPlot.get(c);
    // clientWidth is 0 inside a collapsed card — leave the backing store alone
    // and let the next expand fire the observer again.
    const w = Math.round(c.clientWidth);
    if (!last || w < 120 || w === c.width) continue;
    c.width = w;
    c.height = Math.round(w * last.ratio);
    plot(c, last.series, last.opts);
  }
});

export function plot(canvas: HTMLCanvasElement, series: Series[], opts: PlotOpts = {}): void {
  if (!lastPlot.has(canvas)) plotResize?.observe(canvas);
  // The aspect ratio is fixed at the size the module authored, so a resize
  // changes how big the plot is and never what shape it is.
  lastPlot.set(canvas, { series, opts, ratio: (lastPlot.get(canvas)?.ratio ?? canvas.height / canvas.width) });
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, Hh = canvas.height;
  // padR carries the last x tick label, which is centred on the axis end: at
  // phone width a 4-digit tick ("3000") runs off the canvas with the desktop
  // 10 px, so narrow plots get enough room for half of one.
  const padL = 46, padR = W < 380 ? 22 : 10, padT = 10, padB = 30;
  ctx.clearRect(0, 0, W, Hh);

  let xMin = opts.xMin ?? Infinity, xMax = opts.xMax ?? -Infinity;
  let yMin = opts.yMin ?? Infinity, yMax = opts.yMax ?? -Infinity;
  if (opts.xMin === undefined || opts.xMax === undefined ||
      opts.yMin === undefined || opts.yMax === undefined) {
    for (const s of series) {
      for (let i = 0; i < s.xs.length; i++) {
        if (opts.xMin === undefined) xMin = Math.min(xMin, s.xs[i]);
        if (opts.xMax === undefined) xMax = Math.max(xMax, s.xs[i]);
        if (Number.isFinite(s.ys[i])) {
          if (opts.yMin === undefined) yMin = Math.min(yMin, s.ys[i]);
          if (opts.yMax === undefined) yMax = Math.max(yMax, s.ys[i]);
        }
      }
    }
  }
  if (!Number.isFinite(xMin)) { xMin = 0; xMax = 1; }
  if (!Number.isFinite(yMin)) { yMin = 0; yMax = 1; }
  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  if (xMin === xMax) { xMin -= 1; xMax += 1; }

  const X = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const Y = (y: number) => Hh - padB - ((y - yMin) / (yMax - yMin)) * (Hh - padT - padB);

  const MONO = '"SF Mono", Menlo, Consolas, monospace';
  // grid + ticks. Tick labels are text rendered as an image, so they owe the
  // same 4.5:1 as any other text: #64748f on the --panel background was 3.90:1,
  // #8b9bb0 (the axis-label colour already used below) is 6.52:1.
  ctx.font = `10px ${MONO}`;
  ctx.fillStyle = '#8b9bb0';
  ctx.strokeStyle = '#161d2b';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const xv = xMin + (i / 5) * (xMax - xMin);
    const yv = yMin + (i / 5) * (yMax - yMin);
    ctx.beginPath(); ctx.moveTo(X(xv), padT); ctx.lineTo(X(xv), Hh - padB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, Y(yv)); ctx.lineTo(W - padR, Y(yv)); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillText(fmtTick(xv), X(xv), Hh - padB + 14);
    ctx.textAlign = 'right';
    ctx.fillText(fmtTick(yv), padL - 5, Y(yv) + 3);
  }
  // axes — a graphical object you need in order to read the chart, so 3:1
  // applies: #2b3750 was 1.55:1 on the panel, #55627a is 3.00:1. The fainter
  // grid lines above are left alone; they're an aid, not load-bearing.
  ctx.strokeStyle = '#55627a';
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, Hh - padB); ctx.lineTo(W - padR, Hh - padB); ctx.stroke();
  if (opts.xLabel) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#8b9bb0';
    ctx.fillText(opts.xLabel, padL + (W - padL - padR) / 2, Hh - 4);
  }
  if (opts.yLabel) {
    ctx.save(); ctx.translate(11, padT + (Hh - padT - padB) / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.fillStyle = '#8b9bb0';
    ctx.fillText(opts.yLabel, 0, 0); ctx.restore();
  }

  // series
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const s of series) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width ?? 2.2;
    ctx.setLineDash(s.dash ?? []);
    if (s.width === 0) { ctx.setLineDash([]); continue; } // marker-only series
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < s.xs.length; i++) {
      if (!Number.isFinite(s.ys[i])) { started = false; continue; }
      const px = X(s.xs[i]), py = Y(s.ys[i]);
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
  }

  // markers
  for (const m of opts.markers ?? []) {
    ctx.fillStyle = m.color ?? '#ffd166';
    ctx.shadowColor = m.color ?? '#ffd166';
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(X(m.x), Y(m.y), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (m.label) {
      ctx.textAlign = 'left'; ctx.font = `11px ${MONO}`;
      ctx.fillText(m.label, X(m.x) + 8, Y(m.y) - 6);
    }
  }

  // legend
  if (opts.legend !== false && series.some(s => s.label)) {
    let ly = padT + 8;
    ctx.font = `11px ${MONO}`; ctx.textAlign = 'left';
    for (const s of series) {
      if (!s.label) continue;
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(W - padR - 126, ly - 3, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a8b6c8';
      ctx.fillText(s.label, W - padR - 116, ly);
      ly += 16;
    }
  }

  // ---- text alternative ----
  // Everything drawn above is invisible to assistive tech. The plot already
  // knows what it is showing, so describe it from that: axes, ranges, series
  // names and any called-out markers. Re-run on every redraw, so a slider drag
  // keeps the description honest instead of leaving a stale one behind.
  const parts: string[] = [];
  parts.push(
    opts.yLabel && opts.xLabel ? `Line chart of ${opts.yLabel} against ${opts.xLabel}.`
      : opts.yLabel ? `Line chart of ${opts.yLabel}.`
        : opts.xLabel ? `Line chart against ${opts.xLabel}.`
          : 'Line chart.',
  );
  parts.push(
    `Horizontal axis ${fmtTick(xMin)} to ${fmtTick(xMax)}, ` +
    `vertical axis ${fmtTick(yMin)} to ${fmtTick(yMax)}.`,
  );
  const names = series.map(s => s.label).filter((l): l is string => !!l);
  if (names.length) parts.push(`${names.length === 1 ? 'Series' : 'Series plotted'}: ${names.join(', ')}.`);
  const marked = (opts.markers ?? []).map(m => m.label).filter((l): l is string => !!l);
  if (marked.length) parts.push(`Marked: ${marked.join(', ')}.`);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', parts.join(' '));
}

function fmtTick(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 10000 || a < 0.01) return v.toExponential(0);
  if (a >= 100) return v.toFixed(0);
  if (a >= 1) return String(Math.round(v * 10) / 10);
  return String(Math.round(v * 100) / 100);
}

// Static SVG line plot returning a markup STRING — for embedding a graph inside
// HTML that is set via innerHTML (e.g. Question-Bank FRQ prompts, which can't run
// the canvas plot()). Styled for the dark .result / .figure panels.
export function miniPlot(
  series: { xs: number[]; ys: number[]; color?: string; dashed?: boolean; dots?: boolean }[],
  opts: { xLabel?: string; yLabel?: string; xMin?: number; xMax?: number; yMin?: number; yMax?: number } = {},
): string {
  const W = 340, H = 210, padL = 46, padR = 12, padT = 12, padB = 30;
  let xmin = opts.xMin ?? Infinity, xmax = opts.xMax ?? -Infinity;
  let ymin = opts.yMin ?? Infinity, ymax = opts.yMax ?? -Infinity;
  for (const s of series) for (let i = 0; i < s.xs.length; i++) {
    if (opts.xMin === undefined) xmin = Math.min(xmin, s.xs[i]);
    if (opts.xMax === undefined) xmax = Math.max(xmax, s.xs[i]);
    if (opts.yMin === undefined) ymin = Math.min(ymin, s.ys[i]);
    if (opts.yMax === undefined) ymax = Math.max(ymax, s.ys[i]);
  }
  if (!Number.isFinite(xmin)) { xmin = 0; xmax = 1; }
  if (!Number.isFinite(ymin)) { ymin = 0; ymax = 1; }
  if (xmin === xmax) { xmin -= 1; xmax += 1; }
  if (ymin === ymax) { ymin -= 1; ymax += 1; }
  const X = (x: number) => padL + ((x - xmin) / (xmax - xmin)) * (W - padL - padR);
  const Y = (y: number) => H - padB - ((y - ymin) / (ymax - ymin)) * (H - padT - padB);
  let out = '';
  for (let i = 0; i <= 4; i++) {
    const xv = xmin + (i / 4) * (xmax - xmin), yv = ymin + (i / 4) * (ymax - ymin);
    out += `<line x1="${X(xv).toFixed(1)}" y1="${padT}" x2="${X(xv).toFixed(1)}" y2="${H - padB}" stroke="#243049" stroke-width="0.5"/>`;
    out += `<line x1="${padL}" y1="${Y(yv).toFixed(1)}" x2="${W - padR}" y2="${Y(yv).toFixed(1)}" stroke="#243049" stroke-width="0.5"/>`;
    out += `<text x="${X(xv).toFixed(1)}" y="${H - padB + 12}" fill="#8b9bb0" font-size="9" text-anchor="middle" font-family="monospace">${fmtTick(xv)}</text>`;
    out += `<text x="${(padL - 5).toFixed(1)}" y="${(Y(yv) + 3).toFixed(1)}" fill="#8b9bb0" font-size="9" text-anchor="end" font-family="monospace">${fmtTick(yv)}</text>`;
  }
  // axes: #4a5670 was 2.51:1 on the dark panels these render on (needs 3:1)
  out += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="#55627a" stroke-width="1"/>`;
  out += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#55627a" stroke-width="1"/>`;
  for (const s of series) {
    const pts = s.xs.map((x, i) => `${X(x).toFixed(1)},${Y(s.ys[i]).toFixed(1)}`).join(' ');
    out += `<polyline points="${pts}" fill="none" stroke="${s.color ?? '#e8590c'}" stroke-width="2" stroke-linejoin="round"${s.dashed ? ' stroke-dasharray="4 4"' : ''}/>`;
    if (s.dots ?? !s.dashed) for (let i = 0; i < s.xs.length; i++)
      out += `<circle cx="${X(s.xs[i]).toFixed(1)}" cy="${Y(s.ys[i]).toFixed(1)}" r="2.6" fill="${s.color ?? '#e8590c'}"/>`;
  }
  if (opts.xLabel) out += `<text x="${(padL + (W - padL - padR) / 2).toFixed(1)}" y="${H - 3}" fill="#a8b6c8" font-size="10" text-anchor="middle">${opts.xLabel}</text>`;
  if (opts.yLabel) { const cy = padT + (H - padT - padB) / 2; out += `<text x="12" y="${cy.toFixed(1)}" fill="#a8b6c8" font-size="10" text-anchor="middle" transform="rotate(-90 12 ${cy.toFixed(1)})">${opts.yLabel}</text>`; }
  // role="img" + a name: without it AT reads the loose <text> nodes inside —
  // every tick value, in drawing order, with no indication they are axis
  // labels. With it the graph is one described object.
  const alt = attrEscape(
    opts.yLabel && opts.xLabel ? `Line graph of ${opts.yLabel} against ${opts.xLabel}, `
      + `horizontal axis ${fmtTick(xmin)} to ${fmtTick(xmax)}, vertical axis ${fmtTick(ymin)} to ${fmtTick(ymax)}.`
      : `Line graph, horizontal axis ${fmtTick(xmin)} to ${fmtTick(xmax)}, `
      + `vertical axis ${fmtTick(ymin)} to ${fmtTick(ymax)}.`,
  );
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${alt}" style="max-width:360px;width:100%;height:auto;margin:8px 0" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}

// Minimal escaping for a value going into a double-quoted SVG attribute.
function attrEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function linspace(a: number, b: number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a + ((b - a) * i) / (n - 1));
  return out;
}

// log-Γ for big factorials (microstates, statistics)
export function lnFactorial(n: number): number {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}
