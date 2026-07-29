// Tab framework + shared DOM/plot helpers for the topic modules.
// Each tab is lazily mounted on first visit; onShow/onHide let tabs with
// animation loops pause when hidden.
import { qid, isSolved, markSolved, solvedOf, onProgressChange } from '../progress';
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
      buttons.get(currentId)?.classList.remove('active');
    }
    let entry = roots.get(id);
    if (!entry) {
      const root = h('div', { class: 'tab-root' });
      view.appendChild(root);
      const def = defs.find(d => d.id === id)!;
      entry = { root, handle: def.mount(root) };
      roots.set(id, entry);
      typesetMath(root);
    }
    entry.root.style.display = '';
    entry.handle?.onShow?.();
    buttons.get(id)?.classList.add('active');
    currentId = id;
  }

  let lastGroup = '';
  for (const def of defs) {
    const g = def.group ?? '';
    if (g && g !== lastGroup) {
      nav.appendChild(h('div', { class: 'nav-group' }, g));
      lastGroup = g;
    }
    const btn = h('button', { class: 'nav-item', onclick: () => (onSelect ?? show)(def.id) }, def.label);
    buttons.set(def.id, btn);
    nav.appendChild(btn);
  }

  return {
    show,
    suspend() { if (currentId) roots.get(currentId)?.handle?.onHide?.(); },
    resume() { if (currentId) roots.get(currentId)?.handle?.onShow?.(); },
    current: () => currentId,
  };
}

// ---- quick-quiz widget: one question at a time, instant feedback ----
export interface QuizQ { q: string; opts: string[]; a: number; why: string }

export function quiz(qs: QuizQ[], warmupCount = 0): HTMLElement {
  let i = 0, score = 0, answered = false;
  const ids = qs.map(q => qid(q.q));
  const progress = h('div', { class: 'quiz-progress' });
  const qEl = h('div', { class: 'quiz-q' });
  const optsEl = h('div', { class: 'quiz-opts' });
  const whyEl = h('div', { class: 'quiz-why' });
  const nextBtn = button('Next question', () => { i++; render(); }, 'primary');
  const wrap = h('div', { class: 'quiz' }, progress, qEl, optsEl, whyEl, nextBtn);
  onProgressChange(() => { if (i < qs.length) updateProgressLine(); });

  function render(): void {
    answered = false;
    whyEl.innerHTML = '';
    whyEl.className = 'quiz-why';
    nextBtn.style.display = 'none';
    if (i >= qs.length) {
      progress.textContent = '';
      qEl.innerHTML = `Done — score <b>${score}/${qs.length}</b> ` +
        (score === qs.length ? '— perfect!' : score >= Math.ceil(qs.length * 0.7) ? '— solid!' : '— review the theory panel and retry.');
      optsEl.replaceChildren(button('Restart quiz', () => { i = 0; score = 0; render(); }, 'primary'));
      return;
    }
    const q = qs[i];
    updateProgressLine();
    qEl.innerHTML = q.q + (isSolved(ids[i]) ? ' <span class="solved-tag">✓ solved</span>' : '');
    optsEl.replaceChildren(...q.opts.map((o, j) => {
      const b = h('button', { class: 'quiz-opt' }, o);
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        if (j === q.a) { score++; b.classList.add('correct'); markSolved(ids[i]); }
        else {
          b.classList.add('wrong');
          (optsEl.children[q.a] as HTMLElement).classList.add('correct');
        }
        whyEl.innerHTML = q.why;
        whyEl.classList.add(j === q.a ? 'good' : 'bad');
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
  }

  function updateProgressLine(): void {
    if (i >= qs.length) return;
    const tier = warmupCount === 0 ? '' : i < warmupCount ? ' · warm-up' : ' · olympiad';
    const done = solvedOf(ids);
    progress.textContent = `Question ${i + 1} of ${qs.length}${tier} · score ${score} · ${done}/${qs.length} solved`;
  }

  render();
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

export function slider(opts: {
  label: string; min: number; max: number; step?: number; value: number;
  fmt?: (v: number) => string; onInput: (v: number) => void;
}): HTMLElement {
  const fmt = opts.fmt ?? ((v: number) => String(v));
  const valEl = h('span', { class: 'ctl-val' }, fmt(opts.value));
  const input = h('input', {
    type: 'range', min: opts.min, max: opts.max,
    step: opts.step ?? 1, value: opts.value, autocomplete: 'off',
  });
  // The readout updates instantly (cheap); the heavy callback (canvas redraws,
  // innerHTML rebuilds) is coalesced to once per animation frame so fast drags
  // stay smooth instead of running the handler for every input event.
  let raf = 0;
  let pending = opts.value;
  input.addEventListener('input', () => {
    pending = Number(input.value);
    valEl.textContent = fmt(pending);
    if (raf === 0) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        opts.onInput(pending);
      });
    }
  });
  return h('label', { class: 'ctl' },
    h('span', { class: 'ctl-label' }, opts.label), input, valEl);
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
  return h('button', { class: `btn ${cls}`, onclick: onClick }, label);
}

// Sub-navigation pills inside a tab; returns container with panels swapped.
export function pills(sections: { label: string; el: HTMLElement }[]): HTMLElement {
  const bar = h('div', { class: 'pill-bar' });
  const body = h('div', {});
  const btns: HTMLButtonElement[] = [];
  sections.forEach((s, i) => {
    const b = h('button', { class: 'pill', onclick: () => activate(i) }, s.label);
    btns.push(b);
    bar.appendChild(b);
  });
  function activate(i: number): void {
    btns.forEach((b, j) => b.classList.toggle('active', i === j));
    body.replaceChildren(sections[i].el);
  }
  activate(0);
  return h('div', {}, bar, body);
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
  // grid + ticks
  ctx.font = `10px ${MONO}`;
  ctx.fillStyle = '#64748f';
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
  // axes
  ctx.strokeStyle = '#2b3750';
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
  out += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="#4a5670" stroke-width="1"/>`;
  out += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#4a5670" stroke-width="1"/>`;
  for (const s of series) {
    const pts = s.xs.map((x, i) => `${X(x).toFixed(1)},${Y(s.ys[i]).toFixed(1)}`).join(' ');
    out += `<polyline points="${pts}" fill="none" stroke="${s.color ?? '#e8590c'}" stroke-width="2" stroke-linejoin="round"${s.dashed ? ' stroke-dasharray="4 4"' : ''}/>`;
    if (s.dots ?? !s.dashed) for (let i = 0; i < s.xs.length; i++)
      out += `<circle cx="${X(s.xs[i]).toFixed(1)}" cy="${Y(s.ys[i]).toFixed(1)}" r="2.6" fill="${s.color ?? '#e8590c'}"/>`;
  }
  if (opts.xLabel) out += `<text x="${(padL + (W - padL - padR) / 2).toFixed(1)}" y="${H - 3}" fill="#a8b6c8" font-size="10" text-anchor="middle">${opts.xLabel}</text>`;
  if (opts.yLabel) { const cy = padT + (H - padT - padB) / 2; out += `<text x="12" y="${cy.toFixed(1)}" fill="#a8b6c8" font-size="10" text-anchor="middle" transform="rotate(-90 12 ${cy.toFixed(1)})">${opts.yLabel}</text>`; }
  return `<svg viewBox="0 0 ${W} ${H}" style="max-width:360px;width:100%;height:auto;margin:8px 0" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
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
