// Tab framework + shared DOM/plot helpers for the topic modules.
// Each tab is lazily mounted on first visit; onShow/onHide let tabs with
// animation loops pause when hidden.

export interface TabHandle {
  onShow?: () => void;
  onHide?: () => void;
}

export interface TabDef {
  id: string;
  label: string;
  mount: (root: HTMLElement) => TabHandle | void;
}

export function initTabs(defs: TabDef[], nav: HTMLElement, view: HTMLElement): void {
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
    }
    entry.root.style.display = '';
    entry.handle?.onShow?.();
    buttons.get(id)?.classList.add('active');
    currentId = id;
  }

  for (const def of defs) {
    const btn = h('button', { class: 'tab-btn', onclick: () => show(def.id) }, def.label);
    buttons.set(def.id, btn);
    nav.appendChild(btn);
  }
  show(defs[0].id);
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
  input.addEventListener('input', () => {
    const v = Number(input.value);
    valEl.textContent = fmt(v);
    opts.onInput(v);
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

  // grid + ticks
  ctx.font = '10px monospace';
  ctx.fillStyle = '#5a6a7d';
  ctx.strokeStyle = '#1c2430';
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
  ctx.strokeStyle = '#3a4a5d';
  ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, Hh - padB); ctx.lineTo(W - padR, Hh - padB); ctx.stroke();
  if (opts.xLabel) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#7d8fa3';
    ctx.fillText(opts.xLabel, padL + (W - padL - padR) / 2, Hh - 4);
  }
  if (opts.yLabel) {
    ctx.save(); ctx.translate(11, padT + (Hh - padT - padB) / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.fillStyle = '#7d8fa3';
    ctx.fillText(opts.yLabel, 0, 0); ctx.restore();
  }

  // series
  for (const s of series) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width ?? 1.8;
    ctx.setLineDash(s.dash ?? []);
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < s.xs.length; i++) {
      if (!Number.isFinite(s.ys[i])) { started = false; continue; }
      const px = X(s.xs[i]), py = Y(s.ys[i]);
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // markers
  for (const m of opts.markers ?? []) {
    ctx.fillStyle = m.color ?? '#ffe27a';
    ctx.beginPath(); ctx.arc(X(m.x), Y(m.y), 4, 0, Math.PI * 2); ctx.fill();
    if (m.label) {
      ctx.textAlign = 'left'; ctx.font = '11px monospace';
      ctx.fillText(m.label, X(m.x) + 7, Y(m.y) - 5);
    }
  }

  // legend
  if (opts.legend !== false && series.some(s => s.label)) {
    let ly = padT + 6;
    ctx.font = '11px monospace'; ctx.textAlign = 'left';
    for (const s of series) {
      if (!s.label) continue;
      ctx.fillStyle = s.color;
      ctx.fillRect(W - padR - 130, ly - 4, 14, 3);
      ctx.fillStyle = '#9fb4c7';
      ctx.fillText(s.label, W - padR - 112, ly);
      ly += 15;
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
