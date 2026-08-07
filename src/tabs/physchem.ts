// Physical Chemistry — advanced topics: van't Hoff (K vs T), Clausius–Clapeyron,
// concentration cells, real gases (van der Waals / Z), heat capacities +
// Kirchhoff, catalysis energy profile, and coupled/complex equilibria.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, plot, linspace, quiz, numberInput, numVal, type TabDef, ctlRow, task } from './framework';
import { topicPage } from './page';
import { PHYSCHEM_QUIZ } from './questions6';

const R = 8.314; // J/mol·K

// ---- van't Hoff: ln K vs 1/T ----
function makeVantHoff(): HTMLElement {
  let dH = -60, dS = -20, T = 298; // kJ/mol, J/mol·K, K
  const canvas = h('canvas', { width: 480, height: 280 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    const Ts = linspace(250, 600, 120);
    const invT = Ts.map(t => 1000 / t);            // 1000/T for readable axis
    const lnK = Ts.map(t => -(dH * 1000) / (R * t) + dS / R);
    const lnKnow = -(dH * 1000) / (R * T) + dS / R;
    const Know = Math.exp(lnKnow);
    plot(canvas, [
      { xs: invT, ys: lnK, color: '#e8590c', label: 'ln K' },
    ], { xLabel: '1000/T (K⁻¹)', yLabel: 'ln K',
      markers: [{ x: 1000 / T, y: lnKnow, label: `${T} K` }] });
    out.innerHTML =
      `<span class="eq">\\(\\ln K = -\\Delta H^\\circ/RT + \\Delta S^\\circ/R\\) &nbsp; (slope of \\(\\ln K\\) vs \\(1/T\\) is \\(-\\Delta H^\\circ/R\\))</span>` +
      `At T = <b>${T} K</b>: ln K = ${lnKnow.toFixed(2)} → K = <b class="big">${Know < 1e-3 || Know > 1e4 ? Know.toExponential(2) : Know.toFixed(3)}</b><br>` +
      (dH < 0
        ? 'ΔH° &lt; 0 (exothermic): the line slopes <b>up</b> to the right, so K <b>falls</b> as T rises — heat is a product.'
        : 'ΔH° &gt; 0 (endothermic): the line slopes <b>down</b>, so K <b>grows</b> with T — heat drives it forward.') +
      `<br><span class="muted">The two-point form ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁) lets you get ΔH° from K at two temperatures.</span>`;
    missions.tick();
  }
  // Crossover temperature: ln K = 0 when ΔH°/T = ΔS°, i.e. T = ΔH°/ΔS°.
  // ΔH° is in kJ/mol and ΔS° in J/mol·K, hence the factor of 1000.
  const Tcross = (): number => (dS !== 0 ? (dH * 1000) / dS : NaN);
  const inWindow = (): boolean => { const t = Tcross(); return dH > 0 && dS > 0 && t >= 250 && t <= 600; };

  const missions = missionLadder([
    {
      id: 'msn-physchem-01',
      prompt: 'The card opens on an exothermic reaction: its K only <b>falls</b> as you heat it. Set ΔH° and ΔS° so that the reaction is instead one whose K <b>passes 1</b> somewhere inside the plotted window — a crossover temperature between <b>250 and 600 K</b>.',
      meter: () => {
        const t = Tcross();
        if (!(dH > 0 && dS > 0)) return { label: 'both ΔH° and ΔS° must be positive · crossover undefined', pct: 0 };
        const dist = t < 250 ? 250 - t : t > 600 ? t - 600 : 0;
        return { label: `crossover T = ${t.toFixed(0)} K · target 250–600 K`, pct: Math.max(0, 100 - dist / 4) };
      },
      check: inWindow,
      hints: [
        'ln K = 0 when the two terms cancel: ΔH°/RT = ΔS°/R. Solve that for T.',
        'T(crossover) = ΔH°/ΔS°. With ΔH° in kJ/mol and ΔS° in J/mol·K that is 1000·ΔH°/ΔS° — so ΔH° = +60 with ΔS° = +150 puts it at 400 K.',
      ],
      explain: 'K crosses 1 exactly where ΔG° changes sign, at <b>T = ΔH°/ΔS°</b> — the same crossover temperature as the spontaneity map in Thermodynamics II, seen from the equilibrium side. It only exists when ΔH° and ΔS° share a sign: an endothermic, entropy-driven reaction (both positive) is switched <em>on</em> by heating, and an exothermic, entropy-losing one (both negative) is switched <em>off</em>. When the signs differ there is no crossover at all — the reaction has K > 1 at every temperature, or K < 1 at every temperature.',
    },
    {
      id: 'msn-physchem-02',
      prompt: 'A reaction is measured twice: <b>K = 4.0 at 300 K</b> and <b>K = 0.50 at 400 K</b>. Report ΔH° in kJ/mol, sign included.',
      numeric: { label: 'ΔH° (kJ/mol)', placeholder: '±0.0', step: 0.1, validate: n => Math.abs(n + 20.7) < 1.5 },
      hints: [
        'Two-point van\'t Hoff: ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁). Keep R in J/mol·K and convert at the end.',
        'ln(0.50/4.0) = −2.079, and 1/400 − 1/300 = −8.333×10⁻⁴ K⁻¹.',
      ],
      explain: 'ΔH° = −2.079 × 8.314 / (−8.333×10⁻⁴) × (−1) = <b>−20.7 kJ/mol</b>. The sign was readable before any arithmetic: K <em>fell</em> when the reaction was heated, so heat behaves as a product and the reaction is exothermic. <span class="trap">The most common slip here is dropping the minus sign on (1/T₂ − 1/T₁) and reporting +20.7 — a reaction that the data say gets worse on heating cannot have a positive ΔH°.</span>',
    },
  ]);

  const el = cardWithMissions('van\'t Hoff — how K depends on temperature', missions,
    task('Flip the sign of ΔH° and watch which way heating moves K.'),
    slider({ label: 'ΔH° (kJ/mol)', min: -120, max: 120, step: 5, value: dH, onInput: v => { dH = v; draw(); } }),
    slider({ label: 'ΔS° (J/mol·K)', min: -150, max: 150, step: 5, value: dS, onInput: v => { dS = v; draw(); } }),
    slider({ label: 'temperature T (K)', min: 250, max: 600, step: 5, value: T, onInput: v => { T = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ---- Clausius–Clapeyron two-point solver ----
function makeClausius(): HTMLElement {
  // Bounded: a typed ΔH_vap of 1e6 overflowed exp() and printed "P₂ = Infinity
  // atm". The lower bound on the temperatures is 20 K rather than 1 K for the
  // same reason — 1/T blows up near zero, and no liquid this equation describes
  // has a reference point down there (helium boils at 4.2 K and is not a
  // Clausius–Clapeyron problem).
  const P1 = numberInput({ value: 1.0, min: 0.001, max: 500, step: 0.01 });
  const T1 = numberInput({ value: 353, min: 20, max: 2000 });
  const dHv = numberInput({ value: 35.0, min: 0.5, max: 500, step: 0.5 });
  const T2 = numberInput({ value: 373, min: 20, max: 2000 });
  const out = h('div', { class: 'result' });
  const canvas = h('canvas', { width: 480, height: 240 });
  function calc(): void {
    const p1 = numVal(P1), t1 = numVal(T1), dh = numVal(dHv) * 1000, t2 = numVal(T2);
    if (p1 > 0 && t1 > 0 && t2 > 0 && dh > 0) {
      const p2 = p1 * Math.exp(-(dh / R) * (1 / t2 - 1 / t1));
      // curve of P vs T
      const Ts = linspace(Math.min(t1, t2) - 20, Math.max(t1, t2) + 20, 100);
      const Ps = Ts.map(t => p1 * Math.exp(-(dh / R) * (1 / t - 1 / t1)));
      plot(canvas, [{ xs: Ts, ys: Ps, color: '#e8590c', label: 'P(T)' }],
        { xLabel: 'T (K)', yLabel: 'P (atm)',
          markers: [{ x: t1, y: p1, label: 'ref' }, { x: t2, y: p2, label: Number.isFinite(p2) ? `${p2.toFixed(3)} atm` : 'off scale' }] });
      // Bounding the fields is not enough on its own: this is an exponential,
      // and a legal ΔH_vap with a legal pair of temperatures far apart still
      // overflows to Infinity. Say so rather than printing "Infinity atm".
      out.innerHTML =
        `<span class="eq">\\(\\ln(P_2/P_1) = -(\\Delta H_{vap}/R)(1/T_2 - 1/T_1)\\)</span>` +
        (Number.isFinite(p2)
          ? `P₂ at ${t2} K = <b class="big">${p2.toFixed(4)} atm</b><br>`
          : `P₂ at ${t2} K is <b class="big">beyond floating point</b> — that combination of ΔH_vap and temperature gap makes the exponential overflow. Real ΔH_vap values sit near 20–50 kJ/mol.<br>`) +
        `<span class="muted">Vapor pressure rises steeply (exponentially) with T. Set P₂ = 1 atm and solve for T₂ to get the normal boiling point.</span>`;
    }
  }
  [P1, T1, dHv, T2].forEach(i => i.addEventListener('input', calc));
  const el = card('Clausius–Clapeyron — vapor pressure vs temperature',
    task('Enter one known vapour pressure and predict a second temperature, then check what raising ΔH_vap does to the slope.'),
    ctlRow('P₁ (atm)', P1),
    ctlRow('T₁ (K)', T1),
    ctlRow('ΔH_vap (kJ/mol)', dHv),
    ctlRow('T₂ (K)', T2),
    canvas, out,
  );
  calc();
  return el;
}

// ---- concentration cell ----
function makeConcCell(): HTMLElement {
  let cHigh = 1.0, cLow = 0.01, n = 2;
  const out = h('div', { class: 'result' });
  function calc(): void {
    const E = (0.05916 / n) * Math.log10(cHigh / cLow);
    out.innerHTML =
      `<span class="eq">\\(E_{cell} = (0.0592/n)\\log(C_{cathode}/C_{anode})\\) &nbsp; (\\(E^\\circ = 0\\))</span>` +
      `E_cell = (0.0592/${n})·log(${cHigh}/${cLow}) = <b class="big">${E.toFixed(4)} V</b><br>` +
      `The <b>concentrated</b> half-cell is the <b>cathode</b> (Mⁿ⁺ is reduced/plated there); the dilute side is the anode (metal dissolves). ` +
      `The cell runs until the two concentrations equalize (E → 0).<br>` +
      `<span class="muted">Driven entirely by the entropy of dilution — no net chemical change, just transport of ions down the gradient.</span>`;
  }
  const el = card('Concentration cell EMF',
    task('Widen the gap between the two concentrations and watch a cell built from identical electrodes produce a voltage.'),
    select('electrons transferred n', [1, 2, 3].map(v => ({ value: String(v), label: `n = ${v}` })), v => { n = Number(v); calc(); }, String(n)),
    slider({ label: 'concentrated side (M)', min: 0.01, max: 2, step: 0.01, value: cHigh, fmt: v => v.toFixed(2), onInput: v => { cHigh = v; calc(); } }),
    slider({ label: 'dilute side (M)', min: 0.001, max: 1, step: 0.001, value: cLow, fmt: v => v.toFixed(3), onInput: v => { cLow = Math.min(v, cHigh); calc(); } }),
    out,
  );
  calc();
  return el;
}

// ---- real gases: van der Waals & compression factor Z ----
function makeRealGas(): HTMLElement {
  const GASES = [
    { name: 'Ideal', a: 0, b: 0 },
    { name: 'He', a: 0.0346, b: 0.0238 },
    { name: 'N₂', a: 1.370, b: 0.0387 },
    { name: 'CO₂', a: 3.640, b: 0.0427 },
    { name: 'H₂O(g)', a: 5.536, b: 0.0305 },
  ]; // a in L²·bar/mol², b in L/mol
  let gas = GASES[2], T = 300;
  const canvas = h('canvas', { width: 480, height: 280 });
  const out = h('div', { class: 'result' });
  const Rbar = 0.083145; // L·bar/mol·K
  function draw(): void {
    // Z = PVm/RT as a function of P for 1 mol. Solve vdW for Vm at each P.
    const Ps = linspace(1, 400, 120); // bar
    const Zs = Ps.map(P => {
      // van der Waals: P = RT/(Vm−b) − a/Vm². Solve for Vm by iteration from ideal guess.
      let Vm = Rbar * T / P;
      for (let k = 0; k < 60; k++) {
        Vm = Rbar * T / (P + gas.a / (Vm * Vm)) + gas.b;
      }
      return (P * Vm) / (Rbar * T);
    });
    plot(canvas, [
      { xs: Ps, ys: Zs, color: '#e8590c', label: gas.name },
      { xs: [1, 400], ys: [1, 1], color: '#7c8798', dash: [4, 4], label: 'ideal (Z=1)' },
    ], { xLabel: 'P (bar)', yLabel: 'Z = PVm/RT', yMin: 0.5, yMax: 1.6 });
    out.innerHTML =
      `<span class="eq">\\(\\left(P + a/V_m^2\\right)(V_m - b) = RT\\) &nbsp;·&nbsp; \\(Z = PV_m/RT\\)</span>` +
      `${gas.name}: a = ${gas.a} L²·bar/mol², b = ${gas.b} L/mol<br>` +
      'Dip below Z = 1 at moderate P → <b>attractions</b> (a) dominate; rise above 1 at high P → the <b>excluded volume</b> b dominates. ' +
      'Z → 1 for all gases as P → 0.<br>' +
      `<span class="muted">At the Boyle temperature the two corrections cancel and Z ≈ 1 over a wide low-pressure range. Raise T to flatten the dip.</span>`;
  }
  const el = card('Real gases — van der Waals & the compression factor',
    task('Find the temperature at which Z stops dipping below 1 — that is attraction losing to molecular volume.'),
    select('gas', GASES.map(g => ({ value: g.name, label: g.name })), v => { gas = GASES.find(g => g.name === v)!; draw(); }, gas.name),
    slider({ label: 'temperature (K)', min: 150, max: 600, step: 10, value: T, onInput: v => { T = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ---- heat capacities & Kirchhoff ----
function makeHeatCap(): HTMLElement {
  const MODELS = [
    { name: 'monatomic (He, Ar)', cv: 1.5, note: '3 translational modes' },
    { name: 'diatomic, 300 K (N₂, O₂)', cv: 2.5, note: '3 trans + 2 rot' },
    { name: 'diatomic, high T', cv: 3.5, note: '+ vibration switches on' },
    { name: 'nonlinear polyatomic', cv: 3.0, note: '3 trans + 3 rot' },
  ];
  let m = MODELS[0];
  const out = h('div', { class: 'result' });
  const dCp = numberInput({ value: -20, min: -500, max: 500 });
  const dH1 = numberInput({ value: -285, min: -5000, max: 5000 });
  const T1 = numberInput({ value: 298, min: 1, max: 3000 });
  const T2 = numberInput({ value: 373, min: 1, max: 3000 });
  const kOut = h('div', { class: 'result' });
  function calc(): void {
    const cv = m.cv, cp = cv + 1, gamma = cp / cv;
    out.innerHTML =
      `<span class="eq">\\(C_v = (f/2)R\\) &nbsp;·&nbsp; \\(C_p - C_v = R\\) &nbsp;·&nbsp; \\(\\gamma = C_p/C_v\\)</span>` +
      `${m.name}: Cv = ${cv}R = <b>${(cv * R).toFixed(1)} J/mol·K</b>, Cp = ${cp}R = <b>${(cp * R).toFixed(1)}</b>, γ = <b class="big">${gamma.toFixed(3)}</b><br>` +
      `<span class="muted">${m.note}. Equipartition gives ½R per active quadratic degree of freedom. Adiabatic reversible: PVγ = const.</span>`;
  }
  function kcalc(): void {
    const dcp = numVal(dCp), dh1 = numVal(dH1), t1 = numVal(T1), t2 = numVal(T2);
    const dh2 = dh1 + (dcp / 1000) * (t2 - t1);
    kOut.innerHTML =
      `<span class="eq">Kirchhoff: \\(\\Delta H(T_2) = \\Delta H(T_1) + \\Delta C_p\\,(T_2 - T_1)\\)</span>` +
      `ΔH(${t2} K) = ${dh1} + (${dcp}/1000)(${t2} − ${t1}) = <b class="big">${dh2.toFixed(2)} kJ/mol</b><br>` +
      `<span class="muted">Use this to shift a tabulated 298 K enthalpy to reaction temperature (ΔCp = Cp(products) − Cp(reactants)).</span>`;
  }
  [dCp, dH1, T1, T2].forEach(i => i.addEventListener('input', kcalc));
  const el = card('Heat capacities & Kirchhoff\'s law',
    task('Compare the three gas models against equipartition, then use Kirchhoff below to move a ΔH to another temperature.'),
    select('gas model', MODELS.map(x => ({ value: x.name, label: x.name })), v => { m = MODELS.find(x => x.name === v)!; calc(); }, m.name),
    out,
    h('h3', {}, 'Kirchhoff — enthalpy at another temperature'),
    ctlRow('ΔH at T₁ (kJ/mol)', dH1),
    ctlRow('ΔCp (J/mol·K)', dCp),
    ctlRow('T₁ (K)', T1),
    ctlRow('T₂ (K)', T2),
    kOut,
  );
  calc(); kcalc();
  return el;
}

// ---- catalysis energy profile ----
function makeCatalysis(): HTMLElement {
  let Ea = 100, EaCat = 55, dHrxn = -40, T = 298; // kJ/mol
  const canvas = h('canvas', { width: 480, height: 260 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    // reaction-coordinate profiles (schematic bell over a baseline)
    const xs = linspace(0, 1, 200);
    const bump = (peak: number) => xs.map(x => {
      const base = dHrxn * (x < 0.5 ? 0 : (x - 0.5) / 0.5) * 0; // keep baseline flat-ish
      const prod = dHrxn * Math.min(Math.max((x - 0.35) / 0.3, 0), 1);
      const g = peak * Math.exp(-Math.pow((x - 0.5) / 0.16, 2));
      return prod + g + base;
    });
    plot(canvas, [
      { xs, ys: bump(Ea), color: '#7c8798', label: `uncat. Ea=${Ea}` },
      { xs, ys: bump(EaCat), color: '#e8590c', label: `cat. Ea=${EaCat}` },
    ], { xLabel: 'reaction coordinate', yLabel: 'energy (kJ/mol)' });
    const ratio = Math.exp(((Ea - EaCat) * 1000) / (R * T));
    out.innerHTML =
      `<span class="eq">\\(k = A\\,e^{-E_a/RT}\\) &nbsp;→&nbsp; \\(k_{cat}/k = e^{(E_a - E_{a,cat})/RT}\\)</span>` +
      `Rate speed-up at ${T} K = e^((${Ea}−${EaCat})×1000 / (8.314×${T})) = <b class="big">${ratio.toExponential(2)}×</b><br>` +
      'The catalyst lowers <b>Ea</b> (new pathway) but leaves ΔH_rxn, ΔG and K unchanged — the two wells are at the same heights.<br>' +
      `<span class="muted">It lowers the barrier for forward AND reverse equally, so equilibrium is reached faster, never shifted.</span>`;
  }
  const el = card('Catalysis — lowering the activation barrier',
    task('Drop the catalysed barrier and read the rate ratio — and confirm ΔH_rxn never moves.'),
    slider({ label: 'uncatalyzed Ea (kJ/mol)', min: 40, max: 160, step: 5, value: Ea, onInput: v => { Ea = v; EaCat = Math.min(EaCat, v); draw(); } }),
    slider({ label: 'catalyzed Ea (kJ/mol)', min: 10, max: 140, step: 5, value: EaCat, onInput: v => { EaCat = v; draw(); } }),
    slider({ label: 'ΔH_rxn (kJ/mol)', min: -100, max: 60, step: 5, value: dHrxn, onInput: v => { dHrxn = v; draw(); } }),
    slider({ label: 'temperature (K)', min: 250, max: 500, step: 10, value: T, onInput: v => { T = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ---- complex (stepwise) equilibria: metal-ammine speciation ----
function makeComplexEq(): HTMLElement {
  // Cu(II)–ammine successive log K's (typical textbook values)
  const logK = [4.1, 3.5, 2.9, 2.1];
  let pNH3 = 3; // p[NH3] = -log[NH3]
  const canvas = h('canvas', { width: 480, height: 280 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    // cumulative β_i = 10^(sum logK), fraction α_i = β_i[L]^i / Σ
    const betas = [1];
    let s = 0;
    for (const lk of logK) { s += lk; betas.push(Math.pow(10, s)); }
    const xs = linspace(0, 6, 120); // p[NH3]
    const sub = ['', '₁', '₂', '₃', '₄'];
    const series = betas.map((_, i) => ({
      xs, color: ['#7c8798', '#f59f00', '#e8590c', '#c92a2a', '#5c7cfa'][i],
      label: i === 0 ? 'Cu²⁺' : `Cu(NH₃)${sub[i]}`,
      ys: xs.map(p => {
        const L = Math.pow(10, -p);
        const denom = betas.reduce((acc, b, j) => acc + b * Math.pow(L, j), 0);
        return (betas[i] * Math.pow(L, i)) / denom;
      }),
    }));
    plot(canvas, series, { xLabel: 'p[NH₃] = −log[NH₃]', yLabel: 'fraction α', yMin: 0, yMax: 1 });
    const L = Math.pow(10, -pNH3);
    const denom = betas.reduce((acc, b, j) => acc + b * Math.pow(L, j), 0);
    const fracs = betas.map((b, i) => (b * Math.pow(L, i)) / denom);
    const dominant = fracs.indexOf(Math.max(...fracs));
    out.innerHTML =
      `<span class="eq">\\(\\beta_n = K_1 K_2 \\cdots K_n\\) &nbsp;·&nbsp; \\(\\alpha_n = \\beta_n[L]^n / \\sum_j \\beta_j[L]^j\\)</span>` +
      `log K₁–K₄ = ${logK.join(', ')}. At [NH₃] = ${L.toExponential(1)} M the dominant species is <b>${dominant === 0 ? 'Cu²⁺' : `Cu(NH₃)${dominant}²⁺`}</b> (α = ${fracs[dominant].toFixed(2)}).<br>` +
      `<span class="muted">Successive constants decrease (K₁ > K₂ > …) — statistical + charge/steric factors. Overall β₄ = 10^(${logK.reduce((a, b) => a + b, 0).toFixed(1)}). Raise [NH₃] (lower p[NH₃]) to push toward the deep-blue tetraammine.</span>`;
  }
  const el = card('Complex equilibria — stepwise formation & speciation',
    task('Sweep the free-ligand concentration and find the point where each complex in turn is the dominant species.'),
    slider({ label: 'p[NH₃] (−log[NH₃])', min: 0, max: 6, step: 0.1, value: pNH3, fmt: v => v.toFixed(1), onInput: v => { pNH3 = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

export const physChemTab: TabDef = {
  id: 'physchem',
  mount(root) {
    root.append(topicPage('physchem', {
      sims: [makeVantHoff(), makeClausius(), makeConcCell(), makeRealGas(), makeHeatCap(), makeCatalysis(), makeComplexEq()],
      quiz: quiz(PHYSCHEM_QUIZ, 5),
      theory: theory('Theory — advanced physical chemistry', `
<h3>Temperature dependence of K (van't Hoff)</h3>
<span class="eq">\\(\\ln K = -\\Delta H^\\circ/RT + \\Delta S^\\circ/R\\) &nbsp;·&nbsp; \\(\\ln(K_2/K_1) = -(\\Delta H^\\circ/R)(1/T_2 - 1/T_1)\\)</span>
<ul>
<li>A plot of ln K vs 1/T is linear: slope = −ΔH°/R, intercept = ΔS°/R. Exothermic → K falls with T; endothermic → K rises.</li>
<li>The same equation with Ksp explains why most salts (endothermic dissolution) get more soluble on heating.</li>
</ul>
<h3>Clausius–Clapeyron</h3>
<span class="eq">\\(\\ln(P_2/P_1) = -(\\Delta H_{vap}/R)(1/T_2 - 1/T_1)\\)</span>
<ul>
<li>Vapor pressure grows exponentially with T; the normal boiling point is where P = 1 atm.</li>
<li>Assumes ΔH_vap constant and vapor ideal with negligible liquid volume. Trouton's rule: ΔS_vap ≈ 85 J/mol·K for many liquids.</li>
</ul>
<h3>Concentration cells</h3>
<span class="eq">\\(E = (RT/nF)\\ln(C_{cathode}/C_{anode}) = (0.0592/n)\\log(C_{high}/C_{low})\\) at 25 °C, \\(E^\\circ = 0\\)</span>
<ul>
<li>Identical electrodes; EMF comes purely from the concentration (entropy) gradient. The concentrated side is reduced (cathode).</li>
<li>Runs until the concentrations equalize. Basis of pH/ion-selective electrodes.</li>
</ul>
<h3>Real gases</h3>
<span class="eq">\\(\\left(P + an^2/V^2\\right)(V - nb) = nRT\\) &nbsp;·&nbsp; \\(Z = PV_m/RT\\)</span>
<ul>
<li>a: intermolecular attraction (lowers P); b: excluded molecular volume. <span class="trap">Z &lt; 1 attractions dominate; Z &gt; 1 size dominates; Z → 1 as P → 0.</span></li>
<li>Boyle temperature: a and b cancel, gas near-ideal over a wide low-P range. Critical constants: Tc = 8a/27Rb, Pc = a/27b².</li>
</ul>
<h3>Heat capacities</h3>
<span class="eq">\\(C_v = (f/2)R\\) &nbsp;·&nbsp; \\(C_p - C_v = R\\) (ideal gas) &nbsp;·&nbsp; \\(\\gamma = C_p/C_v\\)</span>
<ul>
<li>Equipartition: ½R per active quadratic mode. Monatomic Cv = 3/2R (γ = 5/3); diatomic 5/2R at 300 K (γ = 7/5); vibration adds R at high T.</li>
<li>Kirchhoff: ΔH(T₂) = ΔH(T₁) + ΔCp(T₂ − T₁). Adiabatic reversible: PVγ = const, TV^(γ−1) = const.</li>
</ul>
<h3>Catalysis</h3>
<ul>
<li>Provides a lower-Ea pathway; k ratio = e^(ΔEa/RT) — huge. Does NOT change ΔH, ΔG, or K; speeds forward and reverse equally.</li>
<li>Homogeneous (same phase), heterogeneous (surface adsorption), enzymatic (Michaelis–Menten). Selectivity and turnover number matter.</li>
</ul>
<h3>Complex / coupled equilibria</h3>
<ul>
<li>Add reactions → multiply K's (e.g. Ka·Kb = Kw). Stepwise formation: overall βₙ = K₁K₂…Kₙ; successive K's decrease.</li>
<li>Speciation (fraction αₙ) shifts with free-ligand concentration — the basis of buffer, EDTA, and metal-ammine chemistry.</li>
</ul>`),
    }));
  },
};
