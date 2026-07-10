// Acid-base (titration curves), electrochemistry (galvanic cells + Nernst),
// kinetics (integrated rate laws + Arrhenius). Three pill sections.
import { h, card, theory, slider, select, pills, plot, linspace, quiz, type TabDef } from './framework';
import { AEK_QUIZ } from './questions2';


const Kw = 1e-14;

// ================= ACID-BASE =================
function makeAcidBase(): HTMLElement {
  let Ca = 0.1, Va = 25, Cb = 0.1, pKa = 4.74, strong = false;

  const curveCanvas = h('canvas', { width: 500, height: 300 });
  const out = h('div', { class: 'result' });

  function pHat(Vb: number): number {
    const na = Ca * Va, nb = Cb * Vb; // mmol
    const Vt = Va + Vb;
    if (strong) {
      if (nb < na) return -Math.log10((na - nb) / Vt);
      if (nb > na) return 14 + Math.log10((nb - na) / Vt);
      return 7;
    }
    const Ka = Math.pow(10, -pKa);
    if (Vb === 0) {
      const c = na / Vt;
      const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * c)) / 2;
      return -Math.log10(x);
    }
    if (nb < na) return pKa + Math.log10(nb / (na - nb)); // buffer region
    if (nb === na) {
      const c = na / Vt;
      const Kb = Kw / Ka;
      return 14 + Math.log10(Math.sqrt(Kb * c));
    }
    return 14 + Math.log10((nb - na) / Vt); // excess strong base
  }

  const Veq = () => (Ca * Va) / Cb;
  let vbFrac = 0.35; // current buret position, as a fraction of 2·Veq
  const liveOut = h('div', { class: 'result' });

  function phenColor(p: number): string {
    if (p < 8.2) return '#e8e8e810'; // colorless
    if (p > 10) return '#e858b8';
    return `rgba(232, 88, 184, ${(p - 8.2) / 1.8})`;
  }
  function moColor(p: number): string {
    if (p < 3.1) return '#e84545';
    if (p > 4.4) return '#e8c545';
    return '#e88a45';
  }

  function liveUpdate(): void {
    const Vb = vbFrac * 2 * Veq();
    const p = Math.min(14, Math.max(0, pHat(Vb)));
    const pct = (Vb / Veq()) * 100;
    const stage = pct < 2 ? 'initial acid' : pct < 90 ? (strong ? 'excess acid' : 'buffer region') :
      pct < 99.5 ? 'approaching equivalence — pH climbing fast' :
        pct <= 100.5 ? 'EQUIVALENCE POINT' : 'excess strong base';
    liveOut.innerHTML =
      `Buret reads <b>${Vb.toFixed(2)} mL</b> (${pct.toFixed(0)}% to equivalence) → pH = <b class="big">${p.toFixed(2)}</b> · ${stage}<br>` +
      `flask color — phenolphthalein: <span class="swatch" style="background:${phenColor(p)}"></span>` +
      `${p < 8.2 ? ' colorless' : p > 10 ? ' pink' : ' first blush of pink'} · ` +
      `methyl orange: <span class="swatch" style="background:${moColor(p)}"></span>` +
      `${p < 3.1 ? ' red' : p > 4.4 ? ' yellow' : ' orange (transition)'}`;
  }

  function draw(): void {
    const vmax = Veq() * 2;
    const xs = linspace(0.001, vmax, 400);
    const ys = xs.map(pHat).map(p => Math.min(14, Math.max(0, p)));
    const VbNow = vbFrac * vmax;
    plot(curveCanvas, [
      { xs, ys, color: '#6fc3ff', label: 'pH' },
      { xs: [0, vmax], ys: [7, 7], color: '#5a6a7d', dash: [3, 4] },
      // indicator ranges
      { xs: [0, vmax], ys: [8.2, 8.2], color: '#d86fd8', dash: [2, 5], width: 1 },
      { xs: [0, vmax], ys: [4.4, 4.4], color: '#e2a24a', dash: [2, 5], width: 1 },
    ], {
      xLabel: 'V base added (mL)', yLabel: 'pH', yMin: 0, yMax: 14,
      markers: [
        { x: Veq(), y: Math.min(14, Math.max(0, pHat(Veq()))), label: `equivalence pH ${pHat(Veq()).toFixed(1)}` },
        ...(!strong ? [{ x: Veq() / 2, y: pKa, color: '#7ae27a', label: `½-equiv: pH = pKa = ${pKa.toFixed(1)}` }] : []),
        { x: VbNow, y: Math.min(14, Math.max(0, pHat(VbNow))), color: '#ff5577', label: 'you are here' },
      ],
    });
    const eqPH = pHat(Veq());
    out.innerHTML =
      `Equivalence at V = <b>${Veq().toFixed(1)} mL</b>, pH = <b>${eqPH.toFixed(2)}</b> ` +
      (strong ? '(= 7: neutral salt)' : `(&gt;7: A⁻ is a weak base — <span class="trap">weak-acid titrations never end at 7</span>)`) +
      `<br>Indicator choice: phenolphthalein (pink dashes, 8.2–10) fits weak-acid/strong-base; methyl orange (orange dashes, 3.1–4.4) fits strong-acid titrations.` +
      (!strong ? `<br>Buffer region: flat zone around ½-equivalence where pH = pKa ± 1 (max buffer capacity at pH = pKa).` : '');
    liveUpdate();
  }

  const controls = h('div', {},
    select('acid type', [
      { value: 'weak', label: 'weak acid (choose pKa)' },
      { value: 'strong', label: 'strong acid (HCl)' },
    ], v => { strong = v === 'strong'; draw(); }, 'weak'),
    slider({ label: 'pKa (weak)', min: 2, max: 10, step: 0.05, value: pKa, fmt: v => v.toFixed(2), onInput: v => { pKa = v; draw(); } }),
    slider({ label: 'acid conc (M)', min: 0.01, max: 0.5, step: 0.01, value: Ca, fmt: v => v.toFixed(2), onInput: v => { Ca = v; draw(); } }),
    slider({ label: 'acid volume (mL)', min: 5, max: 50, step: 1, value: Va, onInput: v => { Va = v; draw(); } }),
    slider({ label: 'base conc (M)', min: 0.01, max: 0.5, step: 0.01, value: Cb, fmt: v => v.toFixed(2), onInput: v => { Cb = v; draw(); } }),
    slider({ label: 'open the buret', min: 0, max: 1, step: 0.002, value: vbFrac, fmt: v => `${(v * 200).toFixed(0)}%·Veq`, onInput: v => { vbFrac = v; draw(); } }),
  );
  draw();

  // ---- buffer designer ----
  const SYSTEMS = [
    { name: 'formic acid / formate', pka: 3.75 },
    { name: 'acetic acid / acetate', pka: 4.74 },
    { name: 'H₂CO₃ / HCO₃⁻', pka: 6.35 },
    { name: 'H₂PO₄⁻ / HPO₄²⁻', pka: 7.20 },
    { name: 'NH₄⁺ / NH₃', pka: 9.25 },
    { name: 'HCO₃⁻ / CO₃²⁻', pka: 10.33 },
  ];
  let targetPH = 5.0;
  const designOut = h('div', { class: 'result' });
  function designCalc(): void {
    const best = SYSTEMS.reduce((a, b) => Math.abs(a.pka - targetPH) <= Math.abs(b.pka - targetPH) ? a : b);
    const ratio = Math.pow(10, targetPH - best.pka);
    const total = 0.20; // M
    const base = total * ratio / (1 + ratio);
    const inRange = Math.abs(targetPH - best.pka) <= 1;
    designOut.innerHTML =
      `Best system: <b>${best.name}</b> (pKa ${best.pka}) ${inRange ? '✓' : '<span class="trap">— no listed pKa within ±1 of target; buffer will be weak</span>'}<br>` +
      `[base]/[acid] = 10^(pH−pKa) = <b>${ratio.toPrecision(3)}</b><br>` +
      `Recipe for 1 L of 0.20 M total buffer: <b>${base.toFixed(3)} mol conjugate base + ${(total - base).toFixed(3)} mol acid</b><br>` +
      `<span class="muted">Or: start with ${total.toFixed(2)} mol of the acid and add ${base.toFixed(3)} mol NaOH — partial neutralization makes the same buffer.</span>`;
  }
  let addX = 0.01;
  const shockOut = h('div', { class: 'result' });
  function shockCalc(): void {
    const pka0 = 4.74; // acetate buffer
    const nA = 0.10 + addX, nHA = 0.10 - addX; // adding NaOH converts HA→A⁻
    const buffered = nHA > 0 && nA > 0 ? pka0 + Math.log10(nA / nHA) : NaN;
    const water = addX > 0 ? 14 + Math.log10(addX) : addX < 0 ? -Math.log10(-addX) : 7;
    shockOut.innerHTML =
      `Add ${addX >= 0 ? `${addX.toFixed(3)} mol NaOH` : `${(-addX).toFixed(3)} mol HCl`} to 1 L of 0.10 M / 0.10 M buffer (pKa ${pka0.toFixed(2)}):<br>` +
      (Number.isFinite(buffered)
        ? `buffered pH: ${pka0.toFixed(2)} → <b>${buffered.toFixed(2)}</b> (Δ = ${(buffered - pka0).toFixed(2)})`
        : `<b class="trap">buffer capacity exceeded — one component is used up!</b>`) +
      `<br>same addition to pure water: pH 7.00 → <b>${water.toFixed(2)}</b>` +
      `<br><span class="muted">The buffer math is just moles: strong base converts HA → A⁻ one-for-one, then Henderson–Hasselbalch.</span>`;
  }
  const bufferCard = card('Buffer designer & shock test',
    slider({ label: 'target pH', min: 2.5, max: 11.5, step: 0.1, value: targetPH, fmt: v => v.toFixed(1), onInput: v => { targetPH = v; designCalc(); } }),
    designOut,
    h('h3', {}, 'Hit the buffer with strong acid/base'),
    slider({ label: 'mol added', min: -0.12, max: 0.12, step: 0.005, value: addX, fmt: v => v >= 0 ? `${v.toFixed(3)} NaOH` : `${(-v).toFixed(3)} HCl`, onInput: v => { addX = v; shockCalc(); } }),
    shockOut,
  );
  designCalc();
  shockCalc();

  return h('div', { class: 'cards' },
    card('Titration simulator: acid + NaOH', controls, curveCanvas, liveOut, out),
    bufferCard,
    theory('Acid–base essentials', `
<span class="eq">pH = −log[H⁺] · pH + pOH = 14 (25 °C) · K<sub>a</sub>K<sub>b</sub> = K<sub>w</sub> · pK<sub>a</sub> + pK<sub>b</sub> = 14</span>
<span class="eq">Henderson–Hasselbalch: pH = pK<sub>a</sub> + log([A⁻]/[HA]) — buffers only!</span>
<ul>
<li>Strong acids: HCl, HBr, HI, HNO₃, H₂SO₄ (1st proton), HClO₄. Strong bases: group 1 hydroxides, Ca/Sr/Ba(OH)₂.</li>
<li>Structure → acidity: more electronegative/larger atom bonded to H, more resonance in conjugate base, more EWGs → stronger. Oxyacids: more O's → stronger (HClO₄ ≫ HClO).</li>
<li>Salt pH: cation of weak base (NH₄⁺, Al³⁺, transition metals) → acidic; anion of weak acid → basic; both → compare Ka vs Kb.</li>
<li>Polyprotic: treat one proton at a time; [second anion] ≈ K<sub>a2</sub> for a weak diprotic acid solution.</li>
<li><span class="trap">Very dilute acid (10⁻⁸ M HCl) → pH ≈ 6.98, not 8! Water's autoionization dominates.</span></li>
<li>Buffer capacity ∝ concentrations; works within pK<sub>a</sub> ± 1. Choose an acid whose pK<sub>a</sub> ≈ target pH.</li>
</ul>`, true),
  );
}

// ================= ELECTROCHEMISTRY =================
interface Couple { label: string; E: number; n: number; ox: string; red: string }
const COUPLES: Couple[] = [
  { label: 'Li⁺/Li (−3.04)', E: -3.04, n: 1, ox: 'Li', red: 'Li⁺' },
  { label: 'Mg²⁺/Mg (−2.37)', E: -2.37, n: 2, ox: 'Mg', red: 'Mg²⁺' },
  { label: 'Al³⁺/Al (−1.66)', E: -1.66, n: 3, ox: 'Al', red: 'Al³⁺' },
  { label: 'Zn²⁺/Zn (−0.76)', E: -0.76, n: 2, ox: 'Zn', red: 'Zn²⁺' },
  { label: 'Fe²⁺/Fe (−0.44)', E: -0.44, n: 2, ox: 'Fe', red: 'Fe²⁺' },
  { label: 'Ni²⁺/Ni (−0.26)', E: -0.26, n: 2, ox: 'Ni', red: 'Ni²⁺' },
  { label: '2H⁺/H₂ (0.00)', E: 0.0, n: 2, ox: 'H₂', red: 'H⁺' },
  { label: 'Cu²⁺/Cu (+0.34)', E: 0.34, n: 2, ox: 'Cu', red: 'Cu²⁺' },
  { label: 'I₂/2I⁻ (+0.54)', E: 0.54, n: 2, ox: 'I⁻', red: 'I₂' },
  { label: 'Fe³⁺/Fe²⁺ (+0.77)', E: 0.77, n: 1, ox: 'Fe²⁺', red: 'Fe³⁺' },
  { label: 'Ag⁺/Ag (+0.80)', E: 0.8, n: 1, ox: 'Ag', red: 'Ag⁺' },
  { label: 'O₂/H₂O (+1.23)', E: 1.23, n: 4, ox: 'H₂O', red: 'O₂' },
  { label: 'Cl₂/2Cl⁻ (+1.36)', E: 1.36, n: 2, ox: 'Cl⁻', red: 'Cl₂' },
  { label: 'MnO₄⁻/Mn²⁺ (+1.51)', E: 1.51, n: 5, ox: 'Mn²⁺', red: 'MnO₄⁻' },
];

function makeElectro(): HTMLElement {
  let c1 = COUPLES[3], c2 = COUPLES[7]; // Zn / Cu — Daniell cell
  let logQ = 0;
  const out = h('div', { class: 'result' });
  const nernstOut = h('div', { class: 'result' });

  function recompute(): void {
    const cat = c1.E >= c2.E ? c1 : c2;
    const an = c1.E >= c2.E ? c2 : c1;
    const E0 = cat.E - an.E;
    const n = lcm(cat.n, an.n);
    const dG = -n * 96485 * E0 / 1000;
    out.innerHTML =
      `Cathode (reduction): <b>${cat.label}</b> · Anode (oxidation): <b>${an.label}</b><br>` +
      `<span class="eq">E°cell = E°cathode − E°anode = ${cat.E.toFixed(2)} − (${an.E.toFixed(2)}) = <b class="big">${E0.toFixed(2)} V</b></span>` +
      `n = ${n} e⁻ · ΔG° = −nFE° = <b>${dG.toFixed(0)} kJ/mol</b> · K = 10^(${(n * E0 / 0.0592).toFixed(1)})<br>` +
      `Cell diagram: ${an.ox} | ${an.red} ‖ ${cat.red} | ${cat.ox}<br>` +
      `<span class="muted">Electrons flow anode → cathode through the wire; anions flow toward the anode in the salt bridge. "An Ox, Red Cat."</span>`;
    const E = E0 - (0.0592 / n) * logQ;
    nernstOut.innerHTML = `Nernst: E = E° − (0.0592/n)·log Q = ${E0.toFixed(2)} − (0.0592/${n})·(${logQ}) = <b>${E.toFixed(3)} V</b>` +
      `<br>${logQ > 0 ? 'Products built up → E drops below E°.' : logQ < 0 ? 'Reactant-rich → E above E°.' : 'Standard conditions → E = E°.'} Battery dies when Q = K (E = 0).`;
  }

  // ---- Faraday electrolysis calculator ----
  const PLATE = [
    { name: 'Ag from Ag⁺', M: 107.87, n: 1, gas: false },
    { name: 'Cu from Cu²⁺', M: 63.55, n: 2, gas: false },
    { name: 'Zn from Zn²⁺', M: 65.38, n: 2, gas: false },
    { name: 'Cr from Cr³⁺', M: 52.0, n: 3, gas: false },
    { name: 'Al from Al³⁺ (molten)', M: 26.98, n: 3, gas: false },
    { name: 'Au from Au³⁺', M: 196.97, n: 3, gas: false },
    { name: 'H₂ gas from 2H⁺', M: 2.016, n: 2, gas: true },
    { name: 'O₂ gas from 2H₂O', M: 32.0, n: 4, gas: true },
  ];
  let plate = PLATE[1], amps = 2.5, mins = 30;
  const farOut = h('div', { class: 'result' });
  function farCalc(): void {
    const molE = (amps * mins * 60) / 96485;
    const mol = molE / plate.n;
    farOut.innerHTML =
      `mol e⁻ = It/F = (${amps.toFixed(1)} A × ${(mins * 60).toFixed(0)} s) / 96485 = <b>${molE.toPrecision(3)} mol</b><br>` +
      `mol product = mol e⁻ / ${plate.n} = ${mol.toPrecision(3)} mol → <b class="big">${(mol * plate.M).toPrecision(3)} g</b>` +
      (plate.gas ? ` = <b>${(mol * 22.7).toPrecision(3)} L at STP</b> (22.7 L/mol at 1 bar; 22.4 at 1 atm)` : '') +
      `<br><span class="muted">Same charge deposits DIFFERENT moles of different metals — divide by the electron count n. Ag (n=1) plates 3× the moles of Al (n=3).</span>`;
  }
  const faradayCard = card('Electrolysis / Faraday calculator',
    select('product', PLATE.map(p => ({ value: p.name, label: `${p.name} (n=${p.n})` })), v => { plate = PLATE.find(p => p.name === v)!; farCalc(); }, plate.name),
    slider({ label: 'current (A)', min: 0.1, max: 20, step: 0.1, value: amps, fmt: v => v.toFixed(1), onInput: v => { amps = v; farCalc(); } }),
    slider({ label: 'time (min)', min: 1, max: 240, step: 1, value: mins, onInput: v => { mins = v; farCalc(); } }),
    farOut,
  );
  farCalc();

  const el = h('div', { class: 'cards' },
    card('Galvanic cell builder',
      select('half-cell 1', COUPLES.map(c => ({ value: c.label, label: c.label })), v => { c1 = COUPLES.find(c => c.label === v)!; recompute(); }, c1.label),
      select('half-cell 2', COUPLES.map(c => ({ value: c.label, label: c.label })), v => { c2 = COUPLES.find(c => c.label === v)!; recompute(); }, c2.label),
      out,
      slider({ label: 'log Q', min: -8, max: 8, step: 0.5, value: 0, onInput: v => { logQ = v; recompute(); } }),
      nernstOut,
    ),
    faradayCard,
    theory('Electrochemistry essentials', `
<span class="eq">E°cell = E°cat − E°an &nbsp;·&nbsp; ΔG° = −nFE° &nbsp;·&nbsp; E = E° − (0.0592/n)logQ (25 °C) &nbsp;·&nbsp; log K = nE°/0.0592</span>
<ul>
<li>More positive E° = better oxidizing agent (gets reduced). F₂ strongest oxidizer; Li strongest reducing agent.</li>
<li><span class="trap">Never multiply E° by stoichiometric coefficients — potentials are intensive!</span> (But n in ΔG° = −nFE° does use the electron count.)</li>
<li>Galvanic: spontaneous, cathode +. Electrolytic: driven, cathode −, need E &gt; |E°cell| applied.</li>
<li>Electrolysis stoichiometry: mol e⁻ = It/F (F = 96485 C/mol). Charge → moles → grams plated.</li>
<li>Electrolysis of aqueous salts: water may be reduced (−0.83 V) instead of Na⁺, or oxidized (+1.23 V) instead of F⁻/SO₄²⁻. Overpotential makes Cl₂ possible from brine.</li>
<li>Concentration cells: same couple both sides, E° = 0, driven purely by the concentration difference.</li>
</ul>`, true),
  );
  recompute();
  return el;
}
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// ================= KINETICS =================
function makeKinetics(): HTMLElement {
  let order: 0 | 1 | 2 = 1, k = 0.15, A0 = 1.0;
  const cCanvas = h('canvas', { width: 460, height: 230 });
  const linCanvas = h('canvas', { width: 460, height: 230 });
  const out = h('div', { class: 'result' });

  function conc(t: number): number {
    if (order === 0) return Math.max(0, A0 - k * t);
    if (order === 1) return A0 * Math.exp(-k * t);
    return 1 / (1 / A0 + k * t);
  }
  function draw(): void {
    const tMax = order === 1 ? 5 / k : order === 0 ? A0 / k : 8 / (k * A0);
    const ts = linspace(0, tMax, 300);
    plot(cCanvas, [{ xs: ts, ys: ts.map(conc), color: '#6fc3ff', label: '[A]' }],
      { xLabel: 't (s)', yLabel: '[A] (M)', yMin: 0 });
    const lin = order === 0 ? ts.map(conc) : order === 1 ? ts.map(t => Math.log(conc(t))) : ts.map(t => 1 / conc(t));
    plot(linCanvas, [{ xs: ts, ys: lin, color: '#7ae27a', label: order === 0 ? '[A]' : order === 1 ? 'ln[A]' : '1/[A]' }],
      { xLabel: 't (s)', yLabel: order === 0 ? '[A] — linear!' : order === 1 ? 'ln[A] — linear!' : '1/[A] — linear!' });
    const tHalf = order === 0 ? A0 / (2 * k) : order === 1 ? Math.LN2 / k : 1 / (k * A0);
    out.innerHTML =
      `<table class="ref-table"><tr><th>order</th><th>rate law</th><th>integrated</th><th>linear plot</th><th>t½</th></tr>` +
      `<tr><td>0</td><td>rate = k</td><td>[A] = [A]₀ − kt</td><td>[A] vs t</td><td>[A]₀/2k</td></tr>` +
      `<tr><td>1</td><td>rate = k[A]</td><td>ln[A] = ln[A]₀ − kt</td><td>ln[A] vs t</td><td>0.693/k (constant!)</td></tr>` +
      `<tr><td>2</td><td>rate = k[A]²</td><td>1/[A] = 1/[A]₀ + kt</td><td>1/[A] vs t</td><td>1/(k[A]₀)</td></tr></table>` +
      `Current: order ${order}, t½ = <b>${tHalf.toFixed(2)} s</b>. ` +
      (order === 1 ? 'Half-life independent of concentration — the radioactive-decay signature.' :
        order === 2 ? 'Half-life doubles each half-life — decays with a long tail.' :
          'Concentration hits zero at t = [A]₀/k.');
  }

  // Arrhenius
  let Ea = 75, T1 = 298, T2 = 308;
  const arrOut = h('div', { class: 'result' });
  const arrCalc = () => {
    const ratio = Math.exp((-Ea * 1000 / 8.314) * (1 / T2 - 1 / T1));
    arrOut.innerHTML =
      `<span class="eq">ln(k₂/k₁) = −(E<sub>a</sub>/R)(1/T₂ − 1/T₁)</span>` +
      `k(${T2} K) / k(${T1} K) = <b class="big">${ratio.toFixed(2)}×</b><br>` +
      `<span class="muted">The "rate doubles per 10 °C" rule of thumb is exactly true only when E<sub>a</sub> ≈ 53 kJ/mol near room T. Plot ln k vs 1/T → slope = −E<sub>a</sub>/R.</span>`;
  };

  const el = h('div', { class: 'cards' },
    card('Integrated rate laws — find the order from the straight line',
      select('order', [{ value: '0', label: '0th order' }, { value: '1', label: '1st order' }, { value: '2', label: '2nd order' }],
        v => { order = Number(v) as 0 | 1 | 2; draw(); }, '1'),
      slider({ label: 'k', min: 0.02, max: 1, step: 0.01, value: k, fmt: v => v.toFixed(2), onInput: v => { k = v; draw(); } }),
      slider({ label: '[A]₀ (M)', min: 0.2, max: 2, step: 0.1, value: A0, fmt: v => v.toFixed(1), onInput: v => { A0 = v; draw(); } }),
      cCanvas, linCanvas, out,
    ),
    card('Arrhenius: temperature sensitivity',
      slider({ label: 'Ea (kJ/mol)', min: 10, max: 200, step: 1, value: Ea, onInput: v => { Ea = v; arrCalc(); } }),
      slider({ label: 'T₁ (K)', min: 250, max: 400, step: 1, value: T1, onInput: v => { T1 = v; arrCalc(); } }),
      slider({ label: 'T₂ (K)', min: 250, max: 400, step: 1, value: T2, onInput: v => { T2 = v; arrCalc(); } }),
      arrOut,
      theory('Kinetics essentials', `
<ul>
<li>Rate = −(1/a)d[A]/dt — divide by the coefficient. <span class="trap">Rate of NH₃ formation is ⅔ the rate of H₂ consumption in N₂+3H₂→2NH₃.</span></li>
<li>Method of initial rates: double [A], rate ×4 → 2nd order in A. Orders come from experiment, never from coefficients (unless elementary).</li>
<li>Mechanisms: rate law = slow (rate-determining) step's molecularity. Intermediates must not appear in the final rate law — substitute using the fast pre-equilibrium.</li>
<li>Valid mechanism: steps sum to overall reaction AND predicted rate law matches experiment.</li>
<li>Catalyst: lowers E<sub>a</sub> for forward AND reverse equally; appears in rate law if in the slow step; K unchanged.</li>
<li>Collision theory: rate ∝ collisions × orientation factor × e^(−Ea/RT).</li>
</ul>`),
    ),
  );
  draw();
  arrCalc();
  return el;
}

export const aekTab: TabDef = {
  id: 'aek',
  label: 'Acids · Redox · Kinetics',
  group: 'Physical Chemistry',
  mount(root) {
    root.append(pills([
      { label: 'Acid–Base & Titration', el: makeAcidBase() },
      { label: 'Electrochemistry', el: makeElectro() },
      { label: 'Kinetics', el: makeKinetics() },
      { label: 'Quiz', el: h('div', { class: 'cards' }, card('Quick quiz — all three topics', quiz(AEK_QUIZ, 5))) },
    ]));
  },
};
