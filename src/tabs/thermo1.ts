// Thermodynamics I: first law, calorimetry, Hess's law, bond enthalpies.
import { h, card, theory, slider, select, quiz, type TabDef } from './framework';
import { THERMO1_QUIZ } from './questions1';


const SUBSTANCES: { name: string; c: number }[] = [
  { name: 'water', c: 4.18 }, { name: 'ethanol', c: 2.44 }, { name: 'aluminum', c: 0.897 },
  { name: 'iron', c: 0.449 }, { name: 'copper', c: 0.385 }, { name: 'lead', c: 0.128 },
];

// ---- Hess's law examples ----
interface HessStep { eq: string; dH: number; op: string }
const HESS: { name: string; target: string; steps: HessStep[]; answer: number }[] = [
  {
    name: 'Formation of CO',
    target: 'C(s) + ½O₂(g) → CO(g)',
    steps: [
      { eq: 'C(s) + O₂(g) → CO₂(g)', dH: -393.5, op: 'keep as-is' },
      { eq: 'CO₂(g) → CO(g) + ½O₂(g)', dH: +283.0, op: 'reversed (sign flipped from −283.0)' },
    ],
    answer: -110.5,
  },
  {
    name: 'Formation of acetylene C₂H₂',
    target: '2C(s) + H₂(g) → C₂H₂(g)',
    steps: [
      { eq: '2 × [C(s) + O₂ → CO₂]', dH: 2 * -393.5, op: 'combustion of C, ×2' },
      { eq: 'H₂ + ½O₂ → H₂O(l)', dH: -285.8, op: 'combustion of H₂' },
      { eq: '2CO₂ + H₂O → C₂H₂ + 5/2 O₂', dH: +1299.6, op: 'combustion of C₂H₂ reversed' },
    ],
    answer: +226.7,
  },
  {
    name: 'Formation of methane',
    target: 'C(s) + 2H₂(g) → CH₄(g)',
    steps: [
      { eq: 'C(s) + O₂ → CO₂', dH: -393.5, op: 'combustion of C' },
      { eq: '2 × [H₂ + ½O₂ → H₂O(l)]', dH: 2 * -285.8, op: 'combustion of H₂, ×2' },
      { eq: 'CO₂ + 2H₂O → CH₄ + 2O₂', dH: +890.4, op: 'combustion of CH₄ reversed' },
    ],
    answer: -74.7,
  },
];

// ---- bond enthalpy estimator ----
const BOND_E: Record<string, number> = {
  'H–H': 436, 'Cl–Cl': 243, 'H–Cl': 431, 'N≡N': 945, 'N–H': 391,
  'C–H': 414, 'O=O': 498, 'C=O (CO₂)': 799, 'O–H': 463, 'C–C': 347, 'C=C': 611,
};
const BOND_RXNS: { name: string; broken: [string, number][]; formed: [string, number][] }[] = [
  { name: 'H₂ + Cl₂ → 2HCl', broken: [['H–H', 1], ['Cl–Cl', 1]], formed: [['H–Cl', 2]] },
  { name: 'N₂ + 3H₂ → 2NH₃', broken: [['N≡N', 1], ['H–H', 3]], formed: [['N–H', 6]] },
  { name: 'CH₄ + 2O₂ → CO₂ + 2H₂O', broken: [['C–H', 4], ['O=O', 2]], formed: [['C=O (CO₂)', 2], ['O–H', 4]] },
];

export const thermo1Tab: TabDef = {
  id: 'thermo1',
  label: 'Thermo I',
  group: 'Physical Chemistry',
  mount(root) {
    // ---- calorimetry mixer ----
    let sA = SUBSTANCES[3], sB = SUBSTANCES[0];
    let mA = 100, tA = 95, mB = 200, tB = 20;
    const calOut = h('div', { class: 'result' });
    const calCanvas = h('canvas', { width: 420, height: 120 });
    function calRedraw(): void {
      const Tf = (mA * sA.c * tA + mB * sB.c * tB) / (mA * sA.c + mB * sB.c);
      const q = mA * sA.c * (Tf - tA); // heat gained by A (negative if A cools)
      calOut.innerHTML =
        `T<sub>final</sub> = (m₁c₁T₁ + m₂c₂T₂)/(m₁c₁ + m₂c₂) = <b class="big">${Tf.toFixed(1)} °C</b><br>` +
        `q(${sA.name}) = ${q.toFixed(0)} J, q(${sB.name}) = ${(-q).toFixed(0)} J — equal and opposite (q₁ = −q₂)<br>` +
        `<span class="muted">Note how ${mA} g of ${sA.name} barely moves ${mB} g of water: water's c = 4.18 J/g·K is huge.</span>`;
      const ctx = calCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, 420, 120);
      const tempColor = (t: number) => `hsl(${Math.max(0, 240 - t * 2.4)}, 70%, 45%)`;
      const block = (x: number, t: number, label: string, w: number) => {
        ctx.fillStyle = tempColor(t);
        ctx.fillRect(x, 30, w, 60);
        ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(label, x + w / 2, 55);
        ctx.fillText(`${t.toFixed(0)}°C`, x + w / 2, 72);
      };
      block(30, tA, sA.name, 90);
      block(160, tB, sB.name, 120);
      block(320, Tf, 'mixed', 80);
      ctx.fillStyle = '#7d8fa3'; ctx.fillText('→', 302, 64);
    }
    const calCard = card('Calorimetry: mix two substances (q = mcΔT)',
      select('substance 1', SUBSTANCES.map(s => ({ value: s.name, label: `${s.name} (c=${s.c})` })), v => { sA = SUBSTANCES.find(s => s.name === v)!; calRedraw(); }, sA.name),
      slider({ label: 'mass 1 (g)', min: 10, max: 500, value: mA, onInput: v => { mA = v; calRedraw(); } }),
      slider({ label: 'T₁ (°C)', min: 0, max: 100, value: tA, onInput: v => { tA = v; calRedraw(); } }),
      select('substance 2', SUBSTANCES.map(s => ({ value: s.name, label: `${s.name} (c=${s.c})` })), v => { sB = SUBSTANCES.find(s => s.name === v)!; calRedraw(); }, sB.name),
      slider({ label: 'mass 2 (g)', min: 10, max: 500, value: mB, onInput: v => { mB = v; calRedraw(); } }),
      slider({ label: 'T₂ (°C)', min: 0, max: 100, value: tB, onInput: v => { tB = v; calRedraw(); } }),
      calCanvas, calOut,
    );
    calRedraw();

    // ---- Hess ----
    const hessBox = h('div', {});
    const setHess = (name: string) => {
      const ex = HESS.find(e => e.name === name)!;
      const sum = ex.steps.reduce((a, s) => a + s.dH, 0);
      hessBox.innerHTML =
        `<p><b>Target:</b> ${ex.target}</p>` +
        `<table class="ref-table"><tr><th>step</th><th>ΔH (kJ)</th><th>manipulation</th></tr>` +
        ex.steps.map(s => `<tr><td>${s.eq}</td><td>${s.dH > 0 ? '+' : ''}${s.dH.toFixed(1)}</td><td>${s.op}</td></tr>`).join('') +
        `</table><div class="result">Sum: ΔH = <b class="big">${sum > 0 ? '+' : ''}${sum.toFixed(1)} kJ/mol</b> (${sum < 0 ? 'exothermic' : 'endothermic'})</div>` +
        `<p class="muted">Rules: reverse a step → flip the sign. Multiply a step → multiply ΔH. Enthalpy is a state function, so the path doesn't matter.</p>`;
    };
    const hessCard = card("Hess's law worked examples",
      select('target reaction', HESS.map(e => ({ value: e.name, label: e.name })), setHess, HESS[0].name),
      hessBox,
    );
    setHess(HESS[0].name);

    // ---- bond enthalpies ----
    const bondBox = h('div', {});
    const setBondRxn = (name: string) => {
      const rx = BOND_RXNS.find(r => r.name === name)!;
      const sumB = rx.broken.reduce((a, [b, n]) => a + BOND_E[b] * n, 0);
      const sumF = rx.formed.reduce((a, [b, n]) => a + BOND_E[b] * n, 0);
      bondBox.innerHTML =
        `<table class="ref-table"><tr><th></th><th>bonds</th><th>energy (kJ)</th></tr>` +
        `<tr><td>broken (costs)</td><td>${rx.broken.map(([b, n]) => `${n}× ${b} (${BOND_E[b]})`).join(', ')}</td><td>+${sumB}</td></tr>` +
        `<tr><td>formed (pays back)</td><td>${rx.formed.map(([b, n]) => `${n}× ${b} (${BOND_E[b]})`).join(', ')}</td><td>−${sumF}</td></tr></table>` +
        `<div class="result">ΔH ≈ Σ(broken) − Σ(formed) = ${sumB} − ${sumF} = <b class="big">${sumB - sumF > 0 ? '+' : ''}${sumB - sumF} kJ/mol</b></div>` +
        `<p class="muted">Estimates only (~±10%): tabulated bond energies are averages over many molecules. Exothermic = the new bonds are stronger than the old ones.</p>`;
    };
    const bondCard = card('ΔH from bond enthalpies',
      select('reaction', BOND_RXNS.map(r => ({ value: r.name, label: r.name })), setBondRxn, BOND_RXNS[0].name),
      bondBox,
    );
    setBondRxn(BOND_RXNS[0].name);

    // ---- Born–Haber cycle (lattice energy) ----
    // Default: NaCl. ΔHf = ΔH_sub(Na) + ½D(Cl2) + IE(Na) − EA(Cl) − U_lattice
    let bhSub = 108, bhIE = 496, bhDiss = 122, bhEA = 349, bhHf = -411; // kJ/mol; Diss is ½ D(Cl2)
    const bhOut = h('div', { class: 'result' });
    const bhCalc = () => {
      // solve for lattice energy U (defined here as the exothermic value, reported negative)
      const U = bhHf - (bhSub + bhIE + bhDiss - bhEA);
      bhOut.innerHTML =
        `<span class="eq">ΔH_f = ΔH_sub + IE + ½D − EA + U_lattice</span>` +
        `Solving for lattice energy: U = ΔH_f − (ΔH_sub + IE + ½D − EA)<br>` +
        `U = ${bhHf} − (${bhSub} + ${bhIE} + ${bhDiss} − ${bhEA}) = <b class="big">${U.toFixed(0)} kJ/mol</b><br>` +
        `<span class="muted">The large negative lattice energy is the pay-off that makes ionic-solid formation favourable despite the endothermic sublimation and ionization steps. Higher ionic charge and smaller ions ⇒ more exothermic U (MgO ≫ NaCl).</span>`;
    };
    const bhCard = card('Born–Haber cycle — lattice energy',
      slider({ label: 'ΔH_sub metal (kJ/mol)', min: 50, max: 200, step: 1, value: bhSub, onInput: v => { bhSub = v; bhCalc(); } }),
      slider({ label: 'IE metal (kJ/mol)', min: 300, max: 900, step: 1, value: bhIE, onInput: v => { bhIE = v; bhCalc(); } }),
      slider({ label: '½ dissociation X₂ (kJ/mol)', min: 50, max: 250, step: 1, value: bhDiss, onInput: v => { bhDiss = v; bhCalc(); } }),
      slider({ label: 'EA nonmetal (kJ/mol)', min: 200, max: 400, step: 1, value: bhEA, onInput: v => { bhEA = v; bhCalc(); } }),
      slider({ label: 'ΔH_f salt (kJ/mol)', min: -700, max: -200, step: 1, value: bhHf, onInput: v => { bhHf = v; bhCalc(); } }),
      bhOut,
      h('p', { class: 'muted' }, 'Defaults are NaCl (U ≈ −786 kJ/mol). The cycle is just Hess\'s law drawn as a loop — the unmeasurable lattice energy falls out of the measurable steps.'),
    );
    bhCalc();

    root.append(
      h('div', { class: 'cards' }, calCard, hessCard, bondCard, bhCard, card('Quick quiz', quiz(THERMO1_QUIZ, 5))),
      theory('Theory & key equations — first law / enthalpy', `
<h4>First law</h4>
<span class="eq">ΔU = q + w &nbsp;·&nbsp; w = −P<sub>ext</sub>ΔV (work done ON the system is +)</span>
<ul>
<li>Gas expands → system does work → w &lt; 0. Constant volume: ΔU = q<sub>v</sub>. Constant pressure: ΔH = q<sub>p</sub>.</li>
<li>ΔH = ΔU + Δ(PV) = ΔU + Δn<sub>gas</sub>RT for reactions.</li>
</ul>
<h4>Calorimetry</h4>
<span class="eq">q = mcΔT (heating) &nbsp;·&nbsp; q = nΔH<sub>fus/vap</sub> (phase change, no ΔT!) &nbsp;·&nbsp; q<sub>cal</sub> = C<sub>cal</sub>ΔT</span>
<ul>
<li>Heating curve problems: sum each segment. Ice→steam: q₁(warm ice) + q₂(melt) + q₃(warm water) + q₄(boil) + q₅(warm steam).</li>
<li>Water: c = 4.18 J/g·K, ΔH<sub>fus</sub> = 6.01 kJ/mol, ΔH<sub>vap</sub> = 40.7 kJ/mol.</li>
<li><span class="trap">Bomb calorimeter measures ΔU (constant V), coffee-cup measures ΔH (constant P).</span></li>
</ul>
<h4>Enthalpies of formation</h4>
<span class="eq">ΔH°<sub>rxn</sub> = Σ nΔH°f(products) − Σ nΔH°f(reactants)</span>
<ul>
<li>ΔH°f = 0 for elements in their standard state: O₂(g), N₂(g), C(graphite), Br₂(l), Hg(l), S₈(s)… <span class="trap">not O(g), not C(diamond)</span>.</li>
<li>Three routes to ΔH: formation enthalpies (exact), Hess cycles (exact), bond enthalpies (estimate, gas phase only).</li>
<li><b>Born–Haber cycle:</b> a Hess loop for ionic solids — ΔH_f = ΔH_sub + IE + ½D − EA + U_lattice — lets you extract the unmeasurable lattice energy from measurable steps.</li>
<li><b>Kirchhoff's law:</b> ΔH is temperature-dependent — ΔH(T₂) = ΔH(T₁) + ΔC_p(T₂ − T₁), where ΔC_p = ΣC_p(products) − ΣC_p(reactants).</li>
</ul>`, true),
    );
  },
};
