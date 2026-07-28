// Advanced (CCO) — Analytical & quantitative chemistry.
// EDTA complexometric titration curve, Debye-Hückel activity, gravimetric
// factor and back-titration calculators.
import { h, card, theory, slider, select, plot, linspace, quiz, type TabDef } from './framework';
import { ANALYTICAL_QUIZ } from './questions3';

// α₄ (fraction of EDTA as Y⁴⁻) vs pH — standard textbook values.
const ALPHA4: Record<number, number> = {
  2: 3.7e-14, 3: 2.5e-11, 4: 3.6e-9, 5: 3.5e-7, 6: 2.2e-5,
  7: 4.8e-4, 8: 5.4e-3, 9: 5.2e-2, 10: 0.35, 11: 0.85, 12: 0.98,
};
const METALS = [
  { name: 'Ca²⁺', logKf: 10.7 }, { name: 'Mg²⁺', logKf: 8.7 },
  { name: 'Zn²⁺', logKf: 16.5 }, { name: 'Cu²⁺', logKf: 18.8 },
  { name: 'Fe³⁺', logKf: 25.1 }, { name: 'Ni²⁺', logKf: 18.6 },
];

function makeEDTA(): HTMLElement {
  let metal = METALS[0], pH = 10, C0 = 0.010; // M
  const V0 = 50.0, Ct = 0.010; // mL analyte, M titrant (equimolar)
  const canvas = h('canvas', { width: 480, height: 280 });
  const out = h('div', { class: 'result' });

  function draw(): void {
    const a4 = ALPHA4[Math.round(pH)] ?? 0.35;
    const Kcond = Math.pow(10, metal.logKf) * a4;
    const Veq = (C0 * V0) / Ct;
    const n0 = C0 * V0; // mmol metal
    const xs = linspace(0.01, Veq * 1.8, 300);
    const ys = xs.map(V => {
      const Vt = V0 + V;
      const nM = n0 - Ct * V;       // mmol free-ish metal
      const nMY = Math.min(Ct * V, n0); // mmol complex
      let M: number;
      if (V < Veq - 1e-6) {
        M = nM / Vt;                // excess metal region
      } else if (Math.abs(V - Veq) < 1e-6) {
        M = Math.sqrt((nMY / Vt) / Kcond); // at equivalence
      } else {
        const excessY = (Ct * V - n0) / Vt;
        M = (nMY / Vt) / (Kcond * excessY); // after equivalence
      }
      return -Math.log10(Math.max(M, 1e-30));
    });
    plot(canvas, [
      { xs, ys, color: '#e8590c', label: 'pM = −log[M]' },
      { xs: [Veq, Veq], ys: [0, 26], color: '#7c8798', dash: [4, 4] },
    ], { xLabel: 'V EDTA added (mL)', yLabel: 'pM', yMin: 0, yMax: 26,
      markers: [{ x: Veq, y: -Math.log10(Math.sqrt((n0 / (V0 + Veq)) / Kcond)), label: `equiv ${Veq.toFixed(0)} mL` }] });
    out.innerHTML =
      `α₄(Y⁴⁻) at pH ${Math.round(pH)} = <b>${a4.toExponential(1)}</b> · conditional constant K′ = α₄·K_f = <b class="big">10<sup>${Math.log10(Kcond).toFixed(1)}</sup></b><br>` +
      `Equivalence at V = <b>${Veq.toFixed(1)} mL</b>. ` +
      (Math.log10(Kcond) > 8
        ? 'K′ &gt; 10⁸ → the endpoint break is sharp; this titration is feasible.'
        : '<span class="trap">K′ is small here — raise the pH so α₄ (and the break) grow, or the endpoint is too gradual to use.</span>') +
      `<br><span class="muted">Lower the pH and watch the jump collapse: at low pH EDTA is protonated, K′ falls, and the curve flattens.</span>`;
  }

  const el = card('EDTA complexometric titration',
    select('metal ion', METALS.map(m => ({ value: m.name, label: `${m.name} (log K_f ${m.logKf})` })), v => { metal = METALS.find(m => m.name === v)!; draw(); }, metal.name),
    slider({ label: 'buffer pH', min: 3, max: 12, step: 1, value: pH, onInput: v => { pH = v; draw(); } }),
    slider({ label: 'analyte conc (M)', min: 0.001, max: 0.05, step: 0.001, value: C0, fmt: v => v.toFixed(3), onInput: v => { C0 = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

function makeActivity(): HTMLElement {
  const SALTS = [
    { name: 'NaCl (1:1)', zp: 1, zm: 1, nu: 2 },
    { name: 'CaCl₂ (2:1)', zp: 2, zm: 1, nu: 3, ionStr: 3 },
    { name: 'MgSO₄ (2:2)', zp: 2, zm: 2, nu: 2 },
    { name: 'Na₂SO₄ (1:2)', zp: 1, zm: 2, nu: 3 },
    { name: 'AlCl₃ (3:1)', zp: 3, zm: 1, nu: 4 },
  ];
  let salt = SALTS[0], c = 0.010;
  const out = h('div', { class: 'result' });
  function calc(): void {
    // ionic strength I = ½ Σ cᵢzᵢ² — cation/anion counts per formula unit
    const counts: Record<string, number> = {
      'NaCl (1:1)': 1, 'CaCl₂ (2:1)': 1, 'MgSO₄ (2:2)': 1, 'Na₂SO₄ (1:2)': 2, 'AlCl₃ (3:1)': 1,
    };
    const nCat = counts[salt.name];
    const nAn = salt.nu - nCat;
    const I = 0.5 * (nCat * c * salt.zp * salt.zp + nAn * c * salt.zm * salt.zm);
    const sqrtI = Math.sqrt(I);
    // Davies equation (valid to ~0.5 M)
    const logG = -0.51 * salt.zp * salt.zm * (sqrtI / (1 + sqrtI) - 0.3 * I);
    const gamma = Math.pow(10, logG);
    out.innerHTML =
      `Ionic strength I = ½Σcᵢzᵢ² = <b>${I.toExponential(2)} M</b> · √I = ${sqrtI.toFixed(3)}<br>` +
      `Davies eqn: log γ± = −0.51·z₊z₋·[√I/(1+√I) − 0.3I] → γ± = <b class="big">${gamma.toFixed(3)}</b><br>` +
      `<span class="muted">Effective (thermodynamic) activity a = γ±·c = ${(gamma * c).toExponential(2)} M. Higher-charge ions drop γ± fastest — the ionic atmosphere screens them, so a saturated salt actually raises the solubility of AgCl (the diverse-ion effect).</span>`;
  }
  const el = card('Ionic strength & activity (Debye–Hückel / Davies)',
    select('salt', SALTS.map(s => ({ value: s.name, label: s.name })), v => { salt = SALTS.find(s => s.name === v)!; calc(); }, salt.name),
    slider({ label: 'concentration (M)', min: 0.001, max: 0.5, step: 0.001, value: c, fmt: v => v.toFixed(3), onInput: v => { c = v; calc(); } }),
    out,
  );
  calc();
  return el;
}

function makeGravimetric(): HTMLElement {
  const num = (v: number, step = 0.001) => h('input', { type: 'number', value: v, step });
  const mPpt = num(0.2870), mmAnalyte = num(35.45, 0.01), mmPpt = num(143.3, 0.01), aFac = num(1), bFac = num(1);
  const gOut = h('div', { class: 'result' });
  const gCalc = () => {
    const p = Number(mPpt.value), mmA = Number(mmAnalyte.value), mmP = Number(mmPpt.value), a = Number(aFac.value), b = Number(bFac.value);
    if (p > 0 && mmA > 0 && mmP > 0 && b > 0) {
      const gf = (a * mmA) / (b * mmP);
      gOut.innerHTML = `Gravimetric factor = (a·M_analyte)/(b·M_ppt) = ${gf.toFixed(4)}<br>mass of analyte = ${p} × ${gf.toFixed(4)} = <b class="big">${(p * gf).toFixed(4)} g</b>`;
    }
  };
  [mPpt, mmAnalyte, mmPpt, aFac, bFac].forEach(i => i.addEventListener('input', gCalc));
  gCalc();
  const el = card('Gravimetric factor & back-titration',
    h('h3', {}, 'Gravimetric analysis'),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'precipitate mass (g)'), mPpt),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'M analyte (g/mol)'), mmAnalyte),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'M precipitate (g/mol)'), mmPpt),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'a (analyte per ppt)'), aFac),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'b (ppt units)'), bFac),
    gOut,
    h('h3', {}, 'Back-titration recipe'),
    h('ol', {},
      h('li', {}, 'Add a known EXCESS of reagent R to the analyte; let it react completely.'),
      h('li', {}, 'Titrate the leftover R with a standard titrant.'),
      h('li', {}, 'n(analyte) = n(R added) − n(R leftover), scaled by stoichiometry.'),
      h('li', {}, 'Used when the direct reaction is slow, or the analyte is a solid/gas (e.g. CaCO₃ in an antacid dissolved in excess HCl, back-titrated with NaOH).'),
    ),
  );
  return el;
}

function makeSeparations(): HTMLElement {
  let spot = 3.4, front = 5.0; // cm
  const out = h('div', { class: 'result' });
  function calc(): void {
    const rf = spot / front;
    out.innerHTML =
      `<span class="eq">R_f = (distance travelled by spot) / (distance travelled by solvent front)</span>` +
      `R_f = ${spot.toFixed(1)} / ${front.toFixed(1)} = <b class="big">${rf.toFixed(2)}</b><br>` +
      (rf > 0.9 ? '<span class="trap">R_f near 1 — the compound is too non-polar for this solvent (barely retained); use a less polar eluent.</span>'
        : rf < 0.15 ? '<span class="trap">R_f near 0 — too polar / strongly retained; use a more polar eluent.</span>'
          : 'A good R_f sits ~0.3–0.7. More polar compounds stick to the polar silica and travel less (lower R_f) in a given solvent.') +
      `<br><span class="muted">R_f is characteristic of a compound in a fixed system, so it aids identification. On normal-phase silica: polar spots low, non-polar spots high.</span>`;
  }
  const el = card('Separations — TLC R_f & chromatography',
    slider({ label: 'spot distance (cm)', min: 0, max: 6, step: 0.1, value: spot, fmt: v => v.toFixed(1), onInput: v => { spot = Math.min(v, front); calc(); } }),
    slider({ label: 'solvent front (cm)', min: 1, max: 8, step: 0.1, value: front, fmt: v => v.toFixed(1), onInput: v => { front = v; calc(); } }),
    out,
    h('h3', {}, 'Separation methods at a glance'),
    h('table', { class: 'ref-table', html: `
<tr><th>method</th><th>separates by</th><th>use</th></tr>
<tr><td>TLC</td><td>polarity (adsorption)</td><td>quick purity / reaction monitoring; R_f ID</td></tr>
<tr><td>column chromatography</td><td>polarity</td><td>preparative purification</td></tr>
<tr><td>GC</td><td>volatility / boiling point</td><td>volatile mixtures; retention time</td></tr>
<tr><td>HPLC</td><td>polarity (high-res)</td><td>quantitative analysis, non-volatiles</td></tr>
<tr><td>electrophoresis</td><td>charge / size</td><td>proteins, DNA</td></tr>
<tr><td>fractional distillation</td><td>boiling point</td><td>miscible liquids (ΔBP)</td></tr>
<tr><td>solvent extraction</td><td>partition coefficient K_D</td><td>pull a solute into the phase it prefers</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Solvent extraction: K_D = [A]_org/[A]_aq. Several small extractions remove more solute than one large one — a common quantitative-lab result.'),
  );
  calc();
  return el;
}

export const analyticalTab: TabDef = {
  id: 'analytical',
  label: 'Analytical & Quant.',
  group: 'Laboratory Skills',
  mount(root) {
    root.append(
      h('div', { class: 'cards' }, makeEDTA(), makeActivity(), makeGravimetric(), makeSeparations(), card('Quick quiz', quiz(ANALYTICAL_QUIZ, 5))),
      theory('Theory — analytical & quantitative chemistry (CCO PS1)', `
<h4>Complexometric (EDTA) titrations</h4>
<span class="eq">K′ = α₄·K_f &nbsp; (conditional formation constant)</span>
<ul>
<li>EDTA binds every metal 1:1 (hexadentate). α₄ = fraction as Y⁴⁻, rising with pH; buffer high so K′ is large.</li>
<li>Metal-ion indicators (Eriochrome Black T, murexide) are themselves weaker complexing agents: EDTA strips the metal at the endpoint, freeing the differently-coloured indicator.</li>
<li>Water hardness: titrate Ca²⁺+Mg²⁺ at pH 10 (total); mask Mg as Mg(OH)₂ at pH 12 for Ca²⁺ alone.</li>
</ul>
<h4>Activity & ionic strength</h4>
<span class="eq">I = ½Σcᵢzᵢ² &nbsp;·&nbsp; log γ± = −0.51 z₊z₋ √I  (limiting law) &nbsp;·&nbsp; a = γ±c</span>
<ul>
<li>Real equilibria use activities: K° = Π aᵢ^νᵢ. Adding an inert salt lowers γ±, so a sparingly-soluble salt dissolves MORE (diverse-ion/salt effect) — opposite to the common-ion effect.</li>
<li>Davies extends validity to ~0.5 M; below ~0.01 M the limiting law suffices.</li>
</ul>
<h4>Gravimetry</h4>
<ul>
<li>Convert analyte to a pure, insoluble, filterable precipitate of known formula; dry/ignite to constant mass.</li>
<li>Gravimetric factor scales precipitate mass → analyte mass. <span class="trap">Coprecipitation adds mass (result high); solubility losses on washing lower it.</span></li>
</ul>
<h4>Redox & other titrations</h4>
<ul>
<li>Permanganate — self-indicating (purple). Dichromate — needs an indicator. Iodometry — thiosulfate + starch (added near the end).</li>
<li>Back-titration for slow or solid analytes. Karl Fischer for water. Gran plots linearize weak endpoints.</li>
<li>Method of standard additions cancels matrix effects; internal standards correct instrument drift.</li>
</ul>
<h4>Separations</h4>
<ul>
<li>Chromatography splits mixtures between a stationary and mobile phase: TLC/column/HPLC by polarity, GC by volatility, electrophoresis by charge/size.</li>
<li>TLC: R_f = spot distance / solvent-front distance — characteristic in a fixed system. On silica, polar = low R_f.</li>
<li>Solvent extraction: partition coefficient K_D = [A]_org/[A]_aq; multiple small extractions beat one large one.</li>
<li>Electroanalytical: potentiometry and ion-selective/pH electrodes give Nernstian E ∝ log[ion].</li>
</ul>`, true),
    );
  },
};
