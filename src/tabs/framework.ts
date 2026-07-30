// Tab framework + shared DOM/plot helpers for the topic modules.
// Each tab is lazily mounted on first visit; onShow/onHide let tabs with
// animation loops pause when hidden.
import { isSolved, markSolved, recordAttempt, solvedOf, onProgressChange } from '../progress';
import { toExamTopic } from '../content/topicIds';
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
}

export interface TabDef {
  id: string;
  label: string;
  group?: string;
  mount: (root: HTMLElement) => TabHandle | void;
}

export interface TabsAPI {
  show: (id: string) => void;
  suspend: () => void; // pause the active tab's animation loops (leaving the app)
  resume: () => void;
  current: () => string | null;
}

// `onSelect` (optional) is called when a sidebar nav item is clicked, so the
// host can route through the History API — keeping the URL and the topic chrome
// (breadcrumb + prev/next footer) in sync. Falls back to a plain tab swap.
export function initTabs(defs: TabDef[], nav: HTMLElement, view: HTMLElement, onSelect?: (id: string) => void): TabsAPI {
  const roots = new Map<string, { root: HTMLElement; handle: TabHandle | void }>();
  const buttons = new Map<string, HTMLButtonElement>();
  let currentId: string | null = null;

  function show(id: string): void {
    if (id === currentId) return;
    if (currentId) {
      const prev = roots.get(currentId);
      prev?.handle?.onHide?.();
      if (prev) prev.root.style.display = 'none';
      const prevBtn = buttons.get(currentId);
      prevBtn?.classList.remove('active');
      prevBtn?.removeAttribute('aria-current');
    }
    let entry = roots.get(id);
    if (!entry) {
      const root = h('div', { class: 'tab-root' });
      view.appendChild(root);
      const def = defs.find(d => d.id === id)!;
      entry = { root, handle: def.mount(root) };
      roots.set(id, entry);
      typesetMath(root);
      labelCanvases(root);
    }
    entry.root.style.display = '';
    entry.handle?.onShow?.();
    labelCanvases(entry.root); // catches canvases the tab created after mount
    const btn = buttons.get(id);
    btn?.classList.add('active');
    // the active item is the current PAGE (each topic has its own URL), not
    // just a highlighted button — .active is a paint, aria-current is the fact
    btn?.setAttribute('aria-current', 'page');
    currentId = id;
  }

  // Sidebar items are grouped by chemistry domain. The group label is a real
  // element and each run of items is a role="group" pointing at it, so the
  // grouping is available to assistive tech and not just to the eye.
  let lastGroup = '';
  let groupBox: HTMLElement = nav;
  let groupIndex = 0;
  for (const def of defs) {
    const g = def.group ?? '';
    if (g && g !== lastGroup) {
      const labelId = `nav-group-${++groupIndex}`;
      nav.appendChild(h('div', { class: 'nav-group', id: labelId }, g));
      groupBox = h('div', { class: 'nav-group-items', role: 'group', 'aria-labelledby': labelId });
      nav.appendChild(groupBox);
      lastGroup = g;
    }
    const btn = h('button', {
      type: 'button', class: 'nav-item', onclick: () => (onSelect ?? show)(def.id),
    }, def.label);
    buttons.set(def.id, btn);
    groupBox.appendChild(btn);
  }

  return {
    show,
    suspend() { if (currentId) roots.get(currentId)?.handle?.onHide?.(); },
    resume() { if (currentId) roots.get(currentId)?.handle?.onShow?.(); },
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
}

let quizSeq = 0;

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
  const head = h('div', { class: 'quiz-head', tabindex: -1 }, progress, qEl);
  const optsEl = h('div', { class: 'quiz-opts' });
  const whyEl = h('div', { class: 'quiz-why', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const nextBtn = button('Next question', () => { i++; render(true); }, 'primary');
  const wrap = h('div', { class: 'quiz' }, head, optsEl, whyEl, nextBtn);
  onProgressChange(() => { if (i < qs.length) updateProgressLine(); });

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

  function render(moveFocus = false): void {
    answered = false;
    whyEl.innerHTML = '';
    whyEl.className = 'quiz-why';
    nextBtn.style.display = 'none';
    if (i >= qs.length) {
      setProgress('');
      qEl.innerHTML = `Done — score <b>${score}/${qs.length}</b> ` +
        (score === qs.length ? '— perfect!' : score >= Math.ceil(qs.length * 0.7) ? '— solid!' : '— review the theory panel and retry.');
      setOptsGrouped(false);
      optsEl.replaceChildren(button('Restart quiz', () => { i = 0; score = 0; render(true); }, 'primary'));
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
        whyEl.innerHTML = `<span class="sr-only">${right ? 'Correct. ' : 'Incorrect. '}</span>${q.why}`;
        whyEl.classList.add(right ? 'good' : 'bad');
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

  render();
  return wrap;
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
      el.innerHTML = String(v);
    } else {
      el.setAttribute(k, String(v));
    }
  }
  for (const c of children) if (c !== null && c !== undefined) el.append(c);
  return el;
}

export function card(title: string, ...children: (Node | string)[]): HTMLElement {
  return h('section', { class: 'card' }, h('h2', {}, title), ...children);
}

// Collapsible theory/reference block. `html` may contain markup.
export function theory(title: string, html: string, open = false): HTMLElement {
  const d = h('details', { class: 'theory' }, h('summary', {}, title), h('div', { html }));
  if (open) d.setAttribute('open', '');
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

export function button(label: string, onClick: () => void, cls = ''): HTMLButtonElement {
  return h('button', { type: 'button', class: `btn ${cls}`, onclick: onClick }, label);
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
    if (moveFocus) btns[i].focus();
  }
  activate(0);
  return h('div', {}, bar, body);
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

export function plot(canvas: HTMLCanvasElement, series: Series[], opts: PlotOpts = {}): void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, Hh = canvas.height;
  const padL = 46, padR = 10, padT = 10, padB = 30;
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
