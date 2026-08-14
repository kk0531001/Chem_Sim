// Canvas and SVG plotting for the topic modules — extracted from framework.ts
// (plan2 §7), which had grown to 1083 lines across six unrelated concerns.
//
// This is the easiest 260 of them to lift out: nothing here touches the tab
// shell, the DOM builders or the progress store, so it moves as a leaf with no
// import cycle to reason about. framework.ts re-exports every name, exactly as
// it already does for ui/quiz.ts — the split is about what you have to open to
// edit a plot, not about churning 30 call sites.

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

