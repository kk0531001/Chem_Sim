// Laboratory Skills — practical techniques: recrystallization, the distillation
// family, filtration, liquid–liquid extraction, drying agents, standard-solution
// and buffer preparation, uncertainty, and safety.
import { h, card, theory, slider, plot, linspace, quiz, type TabDef } from './framework';
import { challengeLadder } from './challenge';
import { LABTECH_QUIZ } from './questions7';

// ---- recrystallization: solubility curve + recovery ----
function makeRecryst(): HTMLElement {
  let sHot = 30, sCold = 4, vol = 100, mass = 25; // g/100mL hot, cold; mL; g dissolved
  const canvas = h('canvas', { width: 480, height: 260 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    const Ts = linspace(0, 100, 60);
    // exponential-ish solubility rising from sCold(0°C) to sHot(100°C)
    const sol = Ts.map(t => sCold * Math.pow(sHot / sCold, t / 100));
    plot(canvas, [{ xs: Ts, ys: sol, color: '#e8590c', label: 'solubility g/100mL' }],
      { xLabel: 'temperature (°C)', yLabel: 'g / 100 mL',
        markers: [{ x: 100, y: sHot, label: 'hot' }, { x: 0, y: sCold, label: 'cold' }] });
    const dissolvedCold = sCold * vol / 100;
    const recovered = Math.max(0, mass - dissolvedCold);
    const pct = mass > 0 ? (recovered / mass) * 100 : 0;
    out.innerHTML =
      `Cold solubility loss = ${sCold} g/100 mL × ${vol} mL = <b>${dissolvedCold.toFixed(2)} g</b> stays dissolved.<br>` +
      `Max recovery = ${mass} − ${dissolvedCold.toFixed(2)} = <b class="big">${recovered.toFixed(2)} g (${pct.toFixed(0)}%)</b><br>` +
      (mass > sHot * vol / 100
        ? '<span class="trap">You are trying to dissolve more than the hot solvent can hold — use more solvent or you won\'t fully dissolve it.</span>'
        : 'Good: it all dissolves hot, then most crystallizes cold. Use the <b>minimum</b> hot solvent and cool slowly (ice bath) for pure crystals.') +
      `<br><span class="muted">Ideal solvent: high hot / low cold solubility; impurities either stay dissolved cold or are removed by hot filtration (+ charcoal for colour).</span>`;
  }
  const el = card('Recrystallization — solubility & % recovery',
    slider({ label: 'hot solubility (g/100 mL)', min: 5, max: 60, step: 1, value: sHot, onInput: v => { sHot = v; draw(); } }),
    slider({ label: 'cold solubility (g/100 mL)', min: 0.5, max: 20, step: 0.5, value: sCold, fmt: v => v.toFixed(1), onInput: v => { sCold = Math.min(v, sHot); draw(); } }),
    slider({ label: 'solvent volume (mL)', min: 20, max: 200, step: 5, value: vol, onInput: v => { vol = v; draw(); } }),
    slider({ label: 'mass to purify (g)', min: 1, max: 40, step: 1, value: mass, onInput: v => { mass = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ---- distillation family + steam distillation calc ----
function makeDistillation(): HTMLElement {
  const num = (v: number, step = 1) => h('input', { type: 'number', value: v, step });
  const pOrg = num(15, 1), mOrg = num(150, 1), mWat = num(18, 0.1), pTot = num(760, 1);
  const out = h('div', { class: 'result' });
  function calc(): void {
    const po = Number(pOrg.value), mo = Number(mOrg.value), mw = Number(mWat.value), pt = Number(pTot.value);
    const pw = pt - po; // water partial pressure at the boil
    if (pw > 0 && po > 0 && mw > 0) {
      const orgPerWater = (po * mo) / (pw * mw);
      out.innerHTML =
        `<span class="eq">boils when \\(P_{water} + P_{organic} = P_{total}\\) &nbsp;·&nbsp; mass ratio \\(= (P\\cdot M)\\) ratio</span>` +
        `If the mixture boils at P_total = ${pt} torr with P_organic = ${po} torr, then P_water = <b>${pw} torr</b>.<br>` +
        `mass(organic)/mass(water) in distillate = (P_org·M_org)/(P_water·M_water) = <b class="big">${orgPerWater.toFixed(3)}</b><br>` +
        `<span class="muted">Even a barely-volatile organic (small P) with a high M carries over appreciably. The mixture boils below 100 °C — gentle on heat-sensitive natural products.</span>`;
    }
  }
  [pOrg, mOrg, mWat, pTot].forEach(i => i.addEventListener('input', calc));
  const el = card('Distillation — simple / fractional / steam / vacuum',
    h('table', { class: 'ref-table', html: `
<tr><th>method</th><th>when to use</th><th>key idea</th></tr>
<tr><td>simple distillation</td><td>ΔBP &gt; ~25–30 °C, one volatile component</td><td>one vapor–liquid equilibrium</td></tr>
<tr><td>fractional distillation</td><td>close boiling points (miscible liquids)</td><td>column = many theoretical plates</td></tr>
<tr><td>steam distillation</td><td>water-immiscible, heat-sensitive high-boilers</td><td>P_total = ΣP; boils &lt; 100 °C</td></tr>
<tr><td>vacuum distillation</td><td>compound decomposes before its BP</td><td>lower P → lower BP</td></tr></table>` }),
    h('h3', {}, 'Steam distillation calculator'),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'P_organic at boil (torr)'), pOrg),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'M_organic (g/mol)'), mOrg),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'M_water (g/mol)'), mWat),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'P_total (torr)'), pTot),
    out,
    h('p', { class: 'trap' }, 'Azeotropes (e.g. 95.6% ethanol/water) cannot be separated further by distillation — the vapor has the same composition as the liquid.'),
  );
  calc();
  return el;
}

// ---- liquid-liquid extraction: multiple-extraction efficiency ----
function makeExtraction(): HTMLElement {
  let K = 4, Vaq = 50, Vorg = 30, n = 3;
  const canvas = h('canvas', { width: 480, height: 240 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    // fraction remaining after n extractions of Vorg/n each:
    const fracRemaining = (nExt: number) => {
      const vEach = (Vorg) / nExt; // total organic split into nExt portions
      return Math.pow(Vaq / (Vaq + K * vEach), nExt);
    };
    const ns = [1, 2, 3, 4, 5, 6];
    const remaining = ns.map(fracRemaining);
    plot(canvas, [{ xs: ns, ys: remaining.map(r => r * 100), color: '#e8590c', label: '% solute left in water' }],
      { xLabel: 'number of extractions (same total solvent)', yLabel: '% remaining', yMin: 0 });
    const single = fracRemaining(1), multi = fracRemaining(n);
    out.innerHTML =
      `<span class="eq">fraction left after \\(n\\) equal extractions \\(= \\left[\\frac{V_{aq}}{V_{aq} + K(V_{org}/n)}\\right]^n\\) &nbsp;·&nbsp; \\(K = [A]_{org}/[A]_{aq}\\)</span>` +
      `One ${Vorg} mL extraction leaves <b>${(single * 100).toFixed(1)}%</b> in water; ${n} × ${(Vorg / n).toFixed(1)} mL leaves <b class="big">${(multi * 100).toFixed(1)}%</b>.<br>` +
      `<span class="muted">Splitting the same solvent into more, smaller portions always extracts more. In an acid/base extraction you can also switch a compound between layers by (de)protonating it (e.g. wash out RCOOH with NaHCO₃).</span>`;
  }
  const el = card('Liquid–liquid extraction — multiple extractions win',
    slider({ label: 'partition coeff K = org/aq', min: 0.5, max: 20, step: 0.5, value: K, fmt: v => v.toFixed(1), onInput: v => { K = v; draw(); } }),
    slider({ label: 'aqueous volume (mL)', min: 10, max: 100, step: 5, value: Vaq, onInput: v => { Vaq = v; draw(); } }),
    slider({ label: 'total organic solvent (mL)', min: 10, max: 100, step: 5, value: Vorg, onInput: v => { Vorg = v; draw(); } }),
    slider({ label: 'split into n extractions', min: 1, max: 6, step: 1, value: n, onInput: v => { n = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ---- standard solution & buffer prep ----
function makeStandardBuffer(): HTMLElement {
  const num = (v: number, step = 0.001) => h('input', { type: 'number', value: v, step });
  // standard solution
  const molarity = num(0.1000, 0.001), volFlask = num(250, 1), molarMass = num(204.22, 0.01);
  const sOut = h('div', { class: 'result' });
  const sCalc = () => {
    const M = Number(molarity.value), V = Number(volFlask.value), MM = Number(molarMass.value);
    const g = M * (V / 1000) * MM;
    sOut.innerHTML = `mass to weigh = M × V × M_r = ${M} × ${(V / 1000).toFixed(4)} L × ${MM} = <b class="big">${g.toFixed(4)} g</b><br>` +
      `<span class="muted">Weigh accurately (analytical balance), dissolve, then dilute to the mark in a Class-A volumetric flask. KHP (M = 204.22) is a common primary standard.</span>`;
  };
  [molarity, volFlask, molarMass].forEach(i => i.addEventListener('input', sCalc));
  // buffer
  let pKa = 4.76, pH = 5.0, Cbuf = 0.10, Vbuf = 500;
  const bOut = h('div', { class: 'result' });
  const bCalc = () => {
    const ratio = Math.pow(10, pH - pKa); // [A-]/[HA]
    const fA = ratio / (1 + ratio);
    const nTotal = Cbuf * (Vbuf / 1000);
    bOut.innerHTML =
      `<span class="eq">\\(\\text{pH} = \\text{p}K_a + \\log([\\text{A}^-]/[\\text{HA}])\\)</span>` +
      `[A⁻]/[HA] = 10^(pH−pKa) = <b>${ratio.toFixed(2)}</b> → mole fraction A⁻ = ${(fA * 100).toFixed(0)}%<br>` +
      `For ${Vbuf} mL of ${Cbuf} M total buffer: n(A⁻) = <b>${(nTotal * fA).toFixed(4)} mol</b>, n(HA) = <b>${(nTotal * (1 - fA)).toFixed(4)} mol</b>.<br>` +
      (Math.abs(pH - pKa) > 1
        ? '<span class="trap">|pH − pKa| &gt; 1 — poor buffer capacity here; pick an acid whose pKa is within 1 unit of the target pH.</span>'
        : 'Good: pH is within ±1 of pKa, so buffer capacity is high.');
  };
  const el = card('Standard-solution & buffer preparation',
    h('h3', {}, 'Standard solution from a primary standard'),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'target molarity (M)'), molarity),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'flask volume (mL)'), volFlask),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'molar mass (g/mol)'), molarMass),
    sOut,
    h('h3', {}, 'Buffer recipe (Henderson–Hasselbalch)'),
    slider({ label: 'weak-acid pKa', min: 2, max: 11, step: 0.01, value: pKa, fmt: v => v.toFixed(2), onInput: v => { pKa = v; bCalc(); } }),
    slider({ label: 'target pH', min: 2, max: 12, step: 0.1, value: pH, fmt: v => v.toFixed(1), onInput: v => { pH = v; bCalc(); } }),
    slider({ label: 'total buffer conc (M)', min: 0.01, max: 1, step: 0.01, value: Cbuf, fmt: v => v.toFixed(2), onInput: v => { Cbuf = v; bCalc(); } }),
    slider({ label: 'buffer volume (mL)', min: 50, max: 1000, step: 10, value: Vbuf, onInput: v => { Vbuf = v; bCalc(); } }),
    bOut,
  );
  sCalc(); bCalc();
  return el;
}

// ---- chromatography: TLC Rf + method choice ----
function makeChromatography(): HTMLElement {
  let spot = 3.2, front = 5.0, polarity = 30; // cm, cm, % polar eluent
  const out = h('div', { class: 'result' });
  function calc(): void {
    const rf = front > 0 ? spot / front : 0;
    // qualitative: more polar eluent pushes spots up (higher Rf) on normal-phase silica
    const advice = rf > 0.85
      ? '<span class="trap">R_f too high (&gt;0.85) — the eluent is too polar / compound barely retained; use a LESS polar solvent.</span>'
      : rf < 0.15
        ? '<span class="trap">R_f too low (&lt;0.15) — too strongly retained; use a MORE polar solvent.</span>'
        : 'Good target: R_f ≈ 0.3–0.5 for TLC monitoring (well-separated, resolvable spots).';
    out.innerHTML =
      `<span class="eq">\\(R_f =\\) (distance spot travelled) / (distance solvent front travelled)</span>` +
      `R_f = ${spot.toFixed(1)} / ${front.toFixed(1)} = <b class="big">${rf.toFixed(2)}</b> &nbsp;(with ${polarity}% polar eluent)<br>` +
      advice +
      `<br><span class="muted">Normal-phase silica is polar: polar compounds stick (low R_f), non-polar ones run with the front. Raising eluent polarity raises every R_f. Visualize under UV (254 nm) or with a stain (KMnO₄, ninhydrin, I₂). R_f is characteristic in a fixed system — an ID handle.</span>`;
  }
  const el = card('Chromatography — TLC, column & method choice',
    slider({ label: 'spot distance (cm)', min: 0, max: 6, step: 0.1, value: spot, fmt: v => v.toFixed(1), onInput: v => { spot = Math.min(v, front); calc(); } }),
    slider({ label: 'solvent front (cm)', min: 1, max: 8, step: 0.1, value: front, fmt: v => v.toFixed(1), onInput: v => { front = v; calc(); } }),
    slider({ label: 'eluent polarity (% polar)', min: 0, max: 100, step: 5, value: polarity, fmt: v => `${v}%`, onInput: v => { polarity = v; calc(); } }),
    out,
    h('table', { class: 'ref-table', html: `
<tr><th>method</th><th>separates by</th><th>use</th></tr>
<tr><td>TLC</td><td>polarity (adsorption)</td><td>quick purity / reaction monitoring; R_f ID</td></tr>
<tr><td>column (flash)</td><td>polarity</td><td>preparative purification of a mixture</td></tr>
<tr><td>GC</td><td>volatility / boiling point</td><td>volatile mixtures; retention time</td></tr>
<tr><td>HPLC</td><td>polarity (high-res)</td><td>quantitative analysis, non-volatiles</td></tr>
<tr><td>ion-exchange / size-exclusion</td><td>charge / size</td><td>proteins, ions, polymers</td></tr>
<tr><td>electrophoresis</td><td>charge / size</td><td>DNA, proteins</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Reverse-phase (C18) inverts the rule: the stationary phase is non-polar, so polar compounds elute first. Column chromatography = a long TLC — load, elute with increasing polarity, collect fractions, check each by TLC.'),
  );
  calc();
  return el;
}

// ---- reference: filtration, drying agents, uncertainty, safety ----
function makeReference(): HTMLElement {
  const num = (v: number, step = 0.001) => h('input', { type: 'number', value: v, step });
  const a = num(10.00, 0.01), ea = num(0.02, 0.01), b = num(5.00, 0.01), eb = num(0.01, 0.01);
  const uOut = h('div', { class: 'result' });
  const uCalc = () => {
    const A = Number(a.value), sa = Number(ea.value), B = Number(b.value), sb = Number(eb.value);
    if (A && B) {
      const R = A / B;
      const relR = Math.sqrt(Math.pow(sa / A, 2) + Math.pow(sb / B, 2));
      uOut.innerHTML = `R = A/B = ${R.toFixed(4)}; relative uncertainties add in quadrature → σR/R = √((σA/A)² + (σB/B)²) = ${(relR * 100).toFixed(2)}% → R = <b class="big">${R.toFixed(3)} ± ${(relR * R).toFixed(3)}</b>`;
    }
  };
  [a, ea, b, eb].forEach(i => i.addEventListener('input', uCalc));
  const el = card('Filtration · drying agents · uncertainty · safety',
    h('h3', {}, 'Filtration: gravity vs vacuum'),
    h('table', { class: 'ref-table', html: `
<tr><th>method</th><th>use it to…</th></tr>
<tr><td>gravity (fluted paper, hot funnel)</td><td>remove insoluble junk from a HOT solution without crystallizing product</td></tr>
<tr><td>vacuum (Büchner / Hirsch)</td><td>collect a solid fast and dry it (recrystallized product, precipitate)</td></tr></table>` }),
    h('h3', {}, 'Drying agents'),
    h('table', { class: 'ref-table', html: `
<tr><th>agent</th><th>notes</th></tr>
<tr><td>MgSO₄ (anhydrous)</td><td>fast, high capacity, neutral — general workhorse</td></tr>
<tr><td>Na₂SO₄</td><td>mild, slow, lower capacity; safe for delicate compounds</td></tr>
<tr><td>CaCl₂</td><td>cheap but forms adducts with alcohols/amines — avoid there</td></tr>
<tr><td>K₂CO₃</td><td>basic — for amines, not for acids</td></tr>
<tr><td>molecular sieves (3Å/4Å)</td><td>trap water by size; give very dry solvents</td></tr></table>` }),
    h('h3', {}, 'Uncertainty propagation'),
    h('p', { class: 'muted' }, 'Sums/differences: add ABSOLUTE uncertainties in quadrature. Products/quotients: add RELATIVE uncertainties in quadrature.'),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'A'), a),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'σA'), ea),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'B'), b),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'σB'), eb),
    uOut,
    h('h3', {}, 'Lab safety essentials'),
    h('ul', {},
      h('li', {}, 'Dilute acid by adding ACID to WATER (never the reverse) — the process is strongly exothermic.'),
      h('li', {}, 'Know the GHS pictograms: flame (flammable), flame-over-circle (oxidizer), corrosion (corrosive), skull (acute toxicity), health hazard (carcinogen/sensitizer).'),
      h('li', {}, 'Keep oxidizers away from organics/fuels; store incompatibles separately; use a fume hood for volatiles.'),
      h('li', {}, 'Goggles and gloves; never pipette by mouth; add reagents slowly; know where the eyewash/shower and extinguishers are.'),
    ),
  );
  uCalc();
  return el;
}

export const labTechTab: TabDef = {
  id: 'labtech',
  label: 'Lab Techniques',
  group: 'Laboratory Skills',
  mount(root) {
    root.append(
      h('div', { class: 'cards' },
        makeRecryst(), makeDistillation(), makeExtraction(), makeChromatography(), makeStandardBuffer(), makeReference(),
        card('Quick quiz', quiz(LABTECH_QUIZ, 5)),
        challengeLadder('labtech'),
      ),
      theory('Theory — laboratory techniques', `
<h4>Recrystallization</h4>
<ul><li>Dissolve in the MINIMUM hot solvent; hot-filter (+ charcoal) to drop insoluble/coloured impurities; cool slowly to grow pure crystals; collect by vacuum filtration; wash with cold solvent.</li>
<li>Ideal solvent: high hot solubility, low cold solubility. Recovery = mass − (cold solubility × volume).</li></ul>
<h4>Distillation family</h4>
<ul><li><b>Simple</b>: large ΔBP. <b>Fractional</b>: close BPs — a column gives many plates. <b>Steam</b>: immiscible + heat-sensitive; boils where P_water + P_organic = P_total (below 100 °C); mass ratio = (P·M) ratio. <b>Vacuum</b>: lowers BP to avoid decomposition.</li>
<li><span class="trap">Azeotropes have identical vapor/liquid composition and can't be split by ordinary distillation.</span></li></ul>
<h4>Filtration</h4>
<ul><li>Gravity (fluted paper, hot funnel): keep a hot solution dissolved while removing solids. Vacuum (Büchner): fast collection + drying of a solid.</li></ul>
<h4>Liquid–liquid extraction</h4>
<span class="eq">\\(K = [A]_{org}/[A]_{aq}\\) &nbsp;·&nbsp; \\(\\text{fraction left} = \\left[V_{aq}/(V_{aq} + K V_{org})\\right]^n\\)</span>
<ul><li>Several small extractions beat one big one. Acid/base extractions move a compound between layers by (de)protonation. Check densities to identify the layers; keep both until sure.</li></ul>
<h4>Drying agents</h4>
<ul><li>MgSO₄ (fast, neutral), Na₂SO₄ (mild), CaCl₂ (not with OH/NH), K₂CO₃ (basic), molecular sieves (very dry). Swirl until the solid "swims" freely, then filter.</li></ul>
<h4>Chromatography</h4>
<ul><li>Separates by differential partition between stationary and mobile phases: TLC/column by polarity (normal-phase silica → polar = low R_f), GC by volatility, HPLC by polarity (high-res), electrophoresis by charge/size.</li></ul>
<h4>Preparing solutions</h4>
<ul><li>Primary standard (pure, stable, known formula: KHP, Na₂CO₃, K₂Cr₂O₇) → weigh accurately, dilute to the mark. Secondary standards (NaOH, HCl) must be standardized by titration.</li>
<li>Buffer: pH = pKa + log([A⁻]/[HA]); choose pKa within ±1 of the target pH for good capacity.</li></ul>
<h4>Uncertainty & safety</h4>
<ul><li>Accuracy (closeness to true) ≠ precision (reproducibility). Sums add absolute σ in quadrature; products add relative σ in quadrature. Report the correct sig figs.</li>
<li>Acid to water; know GHS pictograms; segregate incompatibles; goggles/gloves/fume hood; know emergency equipment.</li></ul>`, true),
    );
  },
};
