// Acceptance gate for the plotting module extracted out of framework.ts
// (plan2 §7). 364 lines moved between files with nothing but a browser
// eyeball to say they still worked; this is that check, written after the
// fact because "add tests when extracting things" is the half of the job I
// skipped first time round.
//
// It drives the real plot() against a recording 2D context, so it asserts the
// things a screenshot cannot: that the data actually reaches the canvas, that
// the axis labels are drawn, and that degenerate input does not throw or
// produce NaN coordinates — which is what a flat series or a single point
// would have done through the old min/max maths.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = mkdtempSync(join(tmpdir(), 'test-plot-'));
writeFileSync(join(scratch, 'plot.mjs'), ts.transpileModule(
  readFileSync(join(ROOT, 'src/tabs/ui/plot.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText);

// A canvas context that records instead of painting.
function recorder() {
  const calls = [];
  const nums = [];
  const track = (name, args) => {
    calls.push(name);
    for (const a of args) if (typeof a === 'number') nums.push(a);
  };
  const ctx = new Proxy({}, {
    get(_t, k) {
      if (k === 'canvas') return { width: 600, height: 300 };
      if (k === 'measureText') return () => ({ width: 20 });
      if (typeof k === 'string' && /Style|Font|font|lineWidth|lineJoin|lineCap|textAlign|textBaseline|globalAlpha/.test(k)) return '';
      return (...args) => track(k, args);
    },
    set() { return true; },
  });
  return { ctx, calls, nums };
}
const canvasFor = rec => ({
  width: 600, height: 300, style: {},
  getBoundingClientRect: () => ({ width: 600, height: 300 }),
  getContext: () => rec.ctx,
  parentElement: null,
  setAttribute() {}, removeAttribute() {}, closest: () => null,
});
globalThis.devicePixelRatio = 1;
globalThis.ResizeObserver = class { observe() {} disconnect() {} };

const { plot, miniPlot, linspace, lnFactorial } = await import(pathToFileURL(join(scratch, 'plot.mjs')).href);

const fails = [];
const check = (name, cond) => { if (!cond) fails.push(name); };

// ---- 1. a normal series reaches the canvas ----
let rec = recorder();
const xs = linspace(0, 10, 50);
plot(canvasFor(rec), [{ xs, ys: xs.map(x => x * x), color: '#e8590c' }],
  { xLabel: 'time (s)', yLabel: 'distance (m)' });
check('draws line segments', rec.calls.filter(c => c === 'lineTo').length > 10);
check('draws the axis labels', rec.calls.includes('fillText'));
check('no NaN coordinates', rec.nums.every(Number.isFinite));

// ---- 2. degenerate input must not throw or emit NaN ----
// A flat series has ymin === ymax, and a single point has no range at all —
// both divide by zero in the obvious implementation.
for (const [name, series] of [
  ['a flat series', [{ xs: [0, 1, 2], ys: [5, 5, 5], color: '#fff' }]],
  ['a single point', [{ xs: [1], ys: [1], color: '#fff' }]],
  ['an empty series', [{ xs: [], ys: [], color: '#fff' }]],
]) {
  rec = recorder();
  let threw = null;
  try { plot(canvasFor(rec), series, { xLabel: 'x', yLabel: 'y' }); } catch (e) { threw = e; }
  check(`${name} does not throw`, !threw);
  check(`${name} emits no NaN`, rec.nums.every(Number.isFinite));
}

// ---- 3. miniPlot returns embeddable SVG ----
const svg = miniPlot([{ xs: [0, 1, 2], ys: [0, 1, 4] }], { xLabel: 'x', yLabel: 'y' });
check('miniPlot returns an <svg> string', typeof svg === 'string' && svg.startsWith('<svg'));
check('miniPlot has no unresolved NaN', !/NaN/.test(svg));
check('miniPlot survives a flat series', !/NaN/.test(miniPlot([{ xs: [0, 1], ys: [3, 3] }], {})));

// ---- 4. the maths helpers that came along ----
check('linspace hits both ends', linspace(0, 1, 5)[0] === 0 && linspace(0, 1, 5)[4] === 1);
check('lnFactorial(0) is 0', lnFactorial(0) === 0);
check('lnFactorial(5) ~ ln(120)', Math.abs(lnFactorial(5) - Math.log(120)) < 1e-6);

if (fails.length) {
  console.error(`plot gate: ${fails.length} failure(s):`);
  for (const f of fails) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('plot gate clean: series render, degenerate input safe, miniPlot embeddable.');
