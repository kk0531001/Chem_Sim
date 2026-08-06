// Acid-base (titration curves), electrochemistry (galvanic cells + Nernst),
// kinetics (integrated rate laws + Arrhenius). Three pill sections.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, pills, plot, linspace, quiz, type TabDef } from './framework';
import { challengeLadder } from './challenge';
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
    if (nb < na) {
      // Exact pre-equivalence treatment, NOT Henderson–Hasselbalch.
      //
      // H–H assumes [HA] and [A⁻] equal the amounts you mixed, which fails
      // wherever [H⁺] is not small compared with them — and at the very start of
      // the titration [A⁻]mixed → 0, so it fails completely: the old code drew
      // 0.10 M acetic acid starting at pH 0.34 instead of its true 2.87, a
      // spurious cliff at the left edge of every weak-acid curve.
      //
      // Solving [H⁺]² + (Ka + C_A)[H⁺] − Ka·C_HA = 0 covers the whole region
      // including Vb = 0, and agrees with H–H to 4 decimals mid-buffer. Written
      // in the rationalised form 2ac/(b + √(b²+4ac)) because the plain
      // quadratic root subtracts two nearly equal numbers near equivalence.
      const cHA = (na - nb) / Vt, cA = nb / Vt;
      const b = Ka + cA;
      const x = (2 * Ka * cHA) / (b + Math.sqrt(b * b + 4 * Ka * cHA));
      return -Math.log10(x);
    }
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
    titrMissions.tick();
  }

  const titrMissions = missionLadder([
    {
      id: 'msn-aek-01',
      prompt: 'Keep the <b>weak acid</b> at pK<sub>a</sub> 4.74 and open the buret until you are exactly at the <b>equivalence point</b>.',
      meter: () => ({ label: strong ? 'switch back to the weak acid' : `${(vbFrac * 200).toFixed(1)}% of the way to equivalence · pH ${pHat(vbFrac * 2 * Veq()).toFixed(2)}`, pct: strong ? 0 : Math.max(0, 100 - Math.abs(vbFrac * 200 - 100) * 4) }),
      check: () => !strong && Math.abs(pKa - 4.74) < 0.03 && Math.abs(vbFrac - 0.5) < 0.0026,
      hints: ['Equivalence is where the moles of added base equal the moles of acid you started with — 100% on the buret readout, not the middle of the slider\'s travel.'],
      explain: 'At equivalence every HA has become A⁻. The pH there is <b>8.72</b>, not 7 — A⁻ is the conjugate base of a weak acid, so it hydrolyses and leaves the solution basic.',
    },
    {
      id: 'msn-aek-02',
      prompt: 'You are standing at that equivalence point. A lab partner reaches for <b>methyl orange</b> (range 3.1–4.4). Which indicator should actually be used here?',
      choices: [
        { label: 'Phenolphthalein (8.2–10)', value: 'phen' },
        { label: 'Methyl orange (3.1–4.4)', value: 'mo' },
        { label: 'Either — both change colour', value: 'both' },
      ],
      validateChoice: v => v === 'phen',
      explain: 'Phenolphthalein. An indicator has to change colour <em>on the steep part of the curve, straddling the equivalence pH</em> — here 8.72. Methyl orange would finish changing near pH 4, far out in the buffer region where the curve is nearly flat, so it would signal an endpoint after only about half the acid had been neutralised. <span class="trap">The indicator is chosen from the equivalence pH, never from habit.</span>',
      hints: ['Compare each indicator\'s range with the pH you just measured at equivalence.'],
    },
  ]);

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
  // Opens on physiological pH, where the tool picks the phosphate pair that
  // actually buffers blood — and leaves the pH-5.0 mission something to do.
  let targetPH = 7.4;
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
    bufMissions.tick();
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
    bufMissions.tick();
  }
  const bufMissions = missionLadder([
    {
      id: 'msn-aek-03',
      prompt: 'Design a buffer at <b>pH 5.0</b>. Set the target there, then work out the <b>[base]/[acid] ratio</b> Henderson–Hasselbalch requires for the pair the tool selects.',
      numeric: { label: '[base]/[acid]', placeholder: 'e.g. 0.75', step: 0.01, validate: n => Math.abs(targetPH - 5.0) < 0.05 && Math.abs(n - 1.82) < 0.12 },
      hints: [
        'pH = pKₐ + log([A⁻]/[HA]). Solve it for the ratio.',
        'The tool picks acetate, pKₐ 4.74. So the ratio is 10^(5.00 − 4.74).',
      ],
      explain: '10^(5.00 − 4.74) = 10^0.26 ≈ <b>1.82</b>, so you need slightly more base than acid. Two things worth noticing: the ratio is what sets the pH, <em>not</em> the absolute concentrations — diluting this buffer 10× leaves the pH essentially unchanged while gutting its capacity. And a buffer is strongest at pH = pKₐ, where the ratio is 1, so acetate is a good but not perfect choice for pH 5.0.',
    },
    {
      id: 'msn-aek-04',
      prompt: 'Now break it. Using the shock test below, add enough strong base to <b>exceed the buffer\'s capacity</b> entirely.',
      meter: () => ({ label: `${addX >= 0 ? `+${addX.toFixed(3)} mol NaOH` : `${(-addX).toFixed(3)} mol HCl`} · the buffer holds 0.100 mol of each`, pct: Math.min(100, (Math.abs(addX) / 0.10) * 100) }),
      check: () => Math.abs(addX) >= 0.10,
      explain: 'Past 0.100 mol the acid component is entirely consumed, there is nothing left to neutralise further additions, and the pH runs away exactly as unbuffered water would. <span class="trap">Capacity is set by the number of MOLES of each component, not by the pH the buffer holds.</span> That is why a buffer\'s concentration matters even though its pH does not depend on it.',
    },
  ]);

  const bufferCard = cardWithMissions('Buffer designer & shock test', bufMissions,
    slider({ label: 'target pH', min: 2.5, max: 11.5, step: 0.1, value: targetPH, fmt: v => v.toFixed(1), onInput: v => { targetPH = v; designCalc(); } }),
    designOut,
    h('h3', {}, 'Hit the buffer with strong acid/base'),
    slider({ label: 'mol added', min: -0.12, max: 0.12, step: 0.005, value: addX, fmt: v => v >= 0 ? `${v.toFixed(3)} NaOH` : `${(-v).toFixed(3)} HCl`, onInput: v => { addX = v; shockCalc(); } }),
    shockOut,
  );
  designCalc();
  shockCalc();

  return h('div', { class: 'cards' },
    cardWithMissions('Titration simulator: acid + NaOH', titrMissions, controls, curveCanvas, liveOut, out),
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

  // Hoisted out of recompute() so the missions can read the same live cell the
  // readout describes, rather than recomputing it from the couples themselves.
  const cellPair = () => {
    const cat = c1.E >= c2.E ? c1 : c2;
    const an = c1.E >= c2.E ? c2 : c1;
    return { cat, an, E0: cat.E - an.E, n: lcm(cat.n, an.n) };
  };
  const cellE = () => { const { E0, n } = cellPair(); return E0 - (0.0592 / n) * logQ; };

  function recompute(): void {
    const { cat, an, E0, n } = cellPair();
    const dG = -n * 96485 * E0 / 1000;
    out.innerHTML =
      `Cathode (reduction): <b>${cat.label}</b> · Anode (oxidation): <b>${an.label}</b><br>` +
      `<span class="eq">E°cell = E°cathode − E°anode = ${cat.E.toFixed(2)} − (${an.E.toFixed(2)}) = <b class="big">${E0.toFixed(2)} V</b></span>` +
      `n = ${n} e⁻ · ΔG° = −nFE° = <b>${dG.toFixed(0)} kJ/mol</b> · K = 10^(${(n * E0 / 0.0592).toFixed(1)})<br>` +
      `Cell diagram: ${an.ox} | ${an.red} ‖ ${cat.red} | ${cat.ox}<br>` +
      `<span class="muted">Electrons flow anode → cathode through the wire; anions flow toward the anode in the salt bridge. "An Ox, Red Cat."</span>`;
    const E = cellE();
    nernstOut.innerHTML = `Nernst: E = E° − (0.0592/n)·log Q = ${E0.toFixed(2)} − (0.0592/${n})·(${logQ}) = <b>${E.toFixed(3)} V</b>` +
      `<br>${logQ > 0 ? 'Products built up → E drops below E°.' : logQ < 0 ? 'Reactant-rich → E above E°.' : 'Standard conditions → E = E°.'} Battery dies when Q = K (E = 0).`;
    cellMissions.tick();
  }

  const cellMissions = missionLadder([
    {
      id: 'msn-aek-09',
      prompt: 'Kill a battery with concentration alone. Build a <b>real</b> cell (E° of at least 0.15 V) and then use the log Q slider to drive its actual voltage <b>down to zero or below</b>. The Zn/Cu cell it opens on cannot be killed — part of the mission is working out which pairs can.',
      meter: () => {
        const { E0 } = cellPair();
        if (E0 < 0.15) return { label: `E° = ${E0.toFixed(2)} V — pick two different couples with E° ≥ 0.15 V`, pct: 0 };
        const E = cellE();
        return { label: `E° = ${E0.toFixed(2)} V · E = ${E.toFixed(3)} V · target ≤ 0`, pct: Math.max(0, Math.min(100, (1 - E / E0) * 100)) };
      },
      check: () => cellPair().E0 >= 0.15 && cellE() <= 0,
      hints: [
        'The slider reaches log Q = 8. How much voltage can (0.0592/n)·8 actually cancel?',
        'At n = 2 that is only 0.24 V, so you need a cell whose E° is under about 0.24 V. Two of the listed pairs qualify — try Fe²⁺/Fe against Ni²⁺/Ni.',
      ],
      explain: 'E = 0 is the definition of a <b>flat battery</b>: it is the point where Q has climbed all the way to K and there is no thermodynamic push left, even though plenty of reactants remain in the cell. The reason so few pairs on this list can be killed within log Q = 8 is the same fact from the other direction — log K = nE°/0.0592, so the Zn/Cu cell has K = 10³⁷, and you would have to build up Zn²⁺ over Cu²⁺ by a factor of 10³⁷ to stop it. <span class="trap">A large E° is not just "more voltage"; it is an exponentially more complete reaction.</span> That is exactly why a good battery holds a nearly constant voltage until it is almost entirely spent, rather than fading in proportion to how much charge you have drawn.',
    },
  ]);

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
    farMissions.tick();
  }
  const plateMass = () => ((amps * mins * 60) / 96485 / plate.n) * plate.M;
  const farMissions = missionLadder([
    {
      id: 'msn-aek-10',
      prompt: 'A plating line has to lay down <b>1.00 g of copper in exactly 10 minutes</b> (±2%). Select the copper bath, set the time, and find the current that does it.',
      meter: () => {
        if (plate.name !== 'Cu from Cu²⁺') return { label: 'select the Cu from Cu²⁺ bath', pct: 0 };
        if (mins !== 10) return { label: `time is ${mins} min — the mission asks for 10`, pct: 0 };
        const m = plateMass();
        return { label: `${m.toFixed(3)} g in 10 min · target 1.00 g`, pct: Math.max(0, 100 - Math.abs(m - 1) * 200) };
      },
      check: () => plate.name === 'Cu from Cu²⁺' && mins === 10 && Math.abs(plateMass() - 1.0) <= 0.02,
      hints: [
        'Work backwards: grams → moles of Cu → moles of electrons → coulombs → amps.',
        '1.00 g / 63.55 = 0.01573 mol Cu, ×2 electrons = 0.03147 mol e⁻, ×96485 = 3036 C. Over 600 s that is about 5.1 A.',
      ],
      explain: 'About <b>5.1 A</b>. Everything in electroplating is this one chain — grams → moles → moles of electrons → coulombs → amps — and the only place it can go wrong is forgetting that copper needs <em>two</em> electrons per atom. Two consequences worth carrying: current sets the <b>rate</b> and total charge sets the <b>amount</b>, so doubling the current halves the time for the same deposit; and in a real bath you cannot simply keep raising the current, because past a limiting value the copper ions near the surface are consumed faster than they can diffuse in, and the deposit turns from a smooth bright layer into a rough, powdery, poorly adherent one. Plating quality is a rate problem, not just a stoichiometry problem.',
    },
  ]);
  const faradayCard = cardWithMissions('Electrolysis / Faraday calculator', farMissions,
    select('product', PLATE.map(p => ({ value: p.name, label: `${p.name} (n=${p.n})` })), v => { plate = PLATE.find(p => p.name === v)!; farCalc(); }, plate.name),
    slider({ label: 'current (A)', min: 0.1, max: 20, step: 0.1, value: amps, fmt: v => v.toFixed(1), onInput: v => { amps = v; farCalc(); } }),
    slider({ label: 'time (min)', min: 1, max: 240, step: 1, value: mins, onInput: v => { mins = v; farCalc(); } }),
    farOut,
  );
  farCalc();

  // ---- Latimer diagram & disproportionation ----
  // A Latimer diagram is a chain of species with the reduction potential (V)
  // between each adjacent pair. A species disproportionates if E°(right) > E°(left).
  const LATIMERS: { name: string; species: string[]; potentials: number[] }[] = [
    { name: 'Copper (acid)', species: ['Cu²⁺', 'Cu⁺', 'Cu'], potentials: [0.16, 0.52] },
    { name: 'Oxygen (acid)', species: ['O₂', 'H₂O₂', 'H₂O'], potentials: [0.70, 1.76] },
    { name: 'Chlorine (basic)', species: ['ClO⁻', 'Cl₂', 'Cl⁻'], potentials: [0.40, 1.36] },
    { name: 'Manganese (acid)', species: ['MnO₄⁻', 'MnO₂', 'Mn²⁺'], potentials: [1.70, 1.23] },
  ];
  let lat = LATIMERS[0];
  const latOut = h('div', { class: 'result' });
  function latCalc(): void {
    const sp = lat.species, po = lat.potentials;
    // check each middle species for disproportionation: E°(to its right) > E°(to its left)
    const dispro: string[] = [];
    for (let i = 1; i < sp.length - 1; i++) {
      const left = po[i - 1];  // potential for (i-1 -> i), i is product (reduced)
      const right = po[i];     // potential for (i -> i+1), i is reactant (oxidized... )
      if (right > left) dispro.push(sp[i]);
    }
    const chain = sp.map((s, i) => i < po.length ? `${s} —(${po[i].toFixed(2)} V)→` : s).join(' ');
    latOut.innerHTML =
      `<span style="font-family:var(--mono);font-size:12px">${chain}</span><br>` +
      (dispro.length
        ? `<b style="color:#e8590c">${dispro.join(', ')} disproportionates</b> — the potential on its right exceeds the one on its left, so it oxidizes and reduces itself.`
        : `<b>No species disproportionates</b> here (each right-hand potential ≤ the left). The reverse — comproportionation — may instead be favourable.`) +
      `<br><span class="muted">Rule: a species disproportionates when E°(species→more reduced) &gt; E°(more oxidized→species). Cu⁺ is the classic case: 2Cu⁺ → Cu + Cu²⁺.</span>`;
  }
  // The card states the weighting rule in its own caption but nothing in the
  // corpus ever made anyone use it — and manganese is the case where a plain
  // average visibly fails, because the two steps carry 3 and 2 electrons.
  const latMissions = missionLadder([
    {
      id: 'msn-aek-11',
      prompt: 'Switch to <b>Manganese (acid)</b>. The diagram gives you MnO₄⁻ → MnO₂ (3 electrons) and MnO₂ → Mn²⁺ (2 electrons). Combine them to get E° for the <b>non-adjacent</b> couple MnO₄⁻/Mn²⁺, in volts.',
      numeric: { label: 'E°(MnO₄⁻/Mn²⁺) in V', placeholder: 'e.g. 1.23', step: 0.01, validate: n => Math.abs(n - 1.51) <= 0.03 },
      hints: [
        'Potentials are intensive, so they do not add — but ΔG° = −nFE° does. Add the ΔG° values and convert back.',
        'E° = (n₁E₁ + n₂E₂)/(n₁ + n₂) = (3 × 1.70 + 2 × 1.23)/5. The plain average, 1.465 V, is not the answer.',
      ],
      explain: '(3 × 1.70 + 2 × 1.23)/5 = 7.56/5 = <b>1.51 V</b> — and you can check it without leaving this tab: the galvanic cell builder two cards up lists MnO₄⁻/Mn²⁺ at exactly +1.51 V. The plain average would have given 1.465 V, wrong by 45 mV, which at n = 5 is a factor of 40 in K.<br>The reason for the weighting is that free energies are additive and potentials are not: ΔG°<sub>total</sub> = ΔG°₁ + ΔG°₂ becomes −(n₁+n₂)FE°<sub>total</sub> = −n₁FE°₁ − n₂FE°₂, and F cancels. <span class="trap">Whenever you are tempted to add or average potentials, convert to ΔG° first — that is also why you never multiply E° by a stoichiometric coefficient.</span>',
    },
  ]);

  const latCard = cardWithMissions('Latimer diagram & disproportionation', latMissions,
    select('element series', LATIMERS.map(l => ({ value: l.name, label: l.name })), v => { lat = LATIMERS.find(l => l.name === v)!; latCalc(); }, lat.name),
    latOut,
    h('p', { class: 'muted' }, 'Potentials are intensive — to get E° for a non-adjacent couple, weight by electron count: E° = Σ(nᵢE°ᵢ)/Σnᵢ, never a plain average.' ),
  );
  latCalc();

  const el = h('div', { class: 'cards' },
    cardWithMissions('Galvanic cell builder', cellMissions,
      select('half-cell 1', COUPLES.map(c => ({ value: c.label, label: c.label })), v => { c1 = COUPLES.find(c => c.label === v)!; recompute(); }, c1.label),
      select('half-cell 2', COUPLES.map(c => ({ value: c.label, label: c.label })), v => { c2 = COUPLES.find(c => c.label === v)!; recompute(); }, c2.label),
      out,
      slider({ label: 'log Q', min: -8, max: 8, step: 0.5, value: 0, onInput: v => { logQ = v; recompute(); } }),
      nernstOut,
    ),
    faradayCard,
    latCard,
    theory('Electrochemistry essentials', `
<span class="eq">E°cell = E°cat − E°an &nbsp;·&nbsp; ΔG° = −nFE° &nbsp;·&nbsp; E = E° − (0.0592/n)logQ (25 °C) &nbsp;·&nbsp; log K = nE°/0.0592</span>
<ul>
<li>More positive E° = better oxidizing agent (gets reduced). F₂ strongest oxidizer; Li strongest reducing agent.</li>
<li><span class="trap">Never multiply E° by stoichiometric coefficients — potentials are intensive!</span> (But n in ΔG° = −nFE° does use the electron count.)</li>
<li>Galvanic: spontaneous, cathode +. Electrolytic: driven, cathode −, need E &gt; |E°cell| applied.</li>
<li>Electrolysis stoichiometry: mol e⁻ = It/F (F = 96485 C/mol). Charge → moles → grams plated.</li>
<li>Electrolysis of aqueous salts: water may be reduced (−0.83 V) instead of Na⁺, or oxidized (+1.23 V) instead of F⁻/SO₄²⁻. Overpotential makes Cl₂ possible from brine.</li>
<li>Concentration cells: same couple both sides, E° = 0, driven purely by the concentration difference.</li>
<li><b>Latimer diagrams</b> chain species by reduction potential; a species disproportionates when the potential to its right exceeds the one to its left. <b>Frost diagrams</b> plot nΔE° vs oxidation state — the lowest point is most stable, and a species above the line joining its neighbours disproportionates.</li>
</ul>`, true),
  );
  recompute();
  return el;
}
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// ================= KINETICS =================
function makeKinetics(): HTMLElement {
  const K0 = 0.15, A00 = 1.0;
  let order: 0 | 1 | 2 = 1, k = K0, A0 = A00;
  const cCanvas = h('canvas', { width: 460, height: 230 });
  const linCanvas = h('canvas', { width: 460, height: 230 });
  const out = h('div', { class: 'result' });
  const halfLife = () => (order === 0 ? A0 / (2 * k) : order === 1 ? Math.LN2 / k : 1 / (k * A0));

  // A run with the order deliberately withheld. Second order, k = 0.08, so the
  // successive half-lives are 12.5 s then 25 s — the doubling is the tell, and
  // it is readable straight off the table without any curve fitting.
  const MYSTERY = [0, 10, 20, 40, 60, 80].map(t => ({ t, A: 1 / (1 + 0.08 * t) }));
  const mysteryTable = h('div', {
    html: '<h3>Unknown sample — what order is it?</h3>'
      + '<table class="ref-table"><tr><th>t (s)</th>'
      + MYSTERY.map(p => `<th>${p.t}</th>`).join('')
      + '</tr><tr><td>[A] (M)</td>'
      + MYSTERY.map(p => `<td>${p.A.toFixed(3)}</td>`).join('')
      + '</tr></table><p class="muted">Reading an order off raw data is the single most common kinetics task on an olympiad paper. Don\'t guess from the shape of the decay — every order looks like "a curve going down". Test something quantitative.</p>',
  });

  const kinMissions = missionLadder([
    {
      id: 'msn-aek-05',
      prompt: 'Leave the order at <b>1</b> and <b>halve the half-life</b> from its starting value of 4.62 s.',
      meter: () => ({ label: order === 1 ? `t½ = ${halfLife().toFixed(2)} s · target 2.31 s` : 'set the order back to 1', pct: order === 1 ? Math.max(0, 100 - Math.abs(halfLife() - 2.31) * 30) : 0 }),
      check: () => order === 1 && Math.abs(halfLife() - Math.LN2 / (2 * K0)) < 0.05,
      hints: ['For first order, t½ = 0.693/k. Only one control appears in that expression.'],
      explain: 'Double k, from 0.15 to 0.30 s⁻¹. Notice what you did <em>not</em> have to touch: [A]₀ is absent from t½ = 0.693/k entirely.',
    },
    {
      id: 'msn-aek-06',
      prompt: 'Still at first order, drag <b>[A]₀</b> across its whole range and watch t½. What happens to it?',
      choices: [
        { label: 'Nothing — t½ is unchanged', value: 'same' },
        { label: 'It doubles when [A]₀ doubles', value: 'up' },
        { label: 'It halves when [A]₀ doubles', value: 'down' },
      ],
      validateChoice: v => v === 'same',
      explain: 'Unchanged — and that independence is the <b>signature of first order</b>. It is why radioactive decay has a quotable half-life at all. Zero order (t½ = [A]₀/2k) and second order (t½ = 1/k[A]₀) both depend on concentration, in opposite directions.',
    },
    {
      id: 'msn-aek-07',
      prompt: 'Now the real thing. The table below is a run whose order was <b>not</b> recorded. Determine it from the data alone.',
      choices: [
        { label: 'Zero order', value: '0' },
        { label: 'First order', value: '1' },
        { label: 'Second order', value: '2' },
      ],
      validateChoice: v => v === '2',
      hints: [
        'Find how long the first half of the sample took to disappear (1.000 → 0.500). Then find how long the NEXT half took (0.500 → 0.250).',
        'The first half-life is about 12.5 s and the second about 25 s. Constant would mean first order. Shrinking would mean zero order. What does doubling mean?',
      ],
      explain: 'Second order. The half-life <b>doubles</b> each time, which only 1/[A] = 1/[A]₀ + kt produces — each successive half-life is twice the last, so the tail drags on far longer than a first-order decay. Confirm it by tabulating 1/[A]: 1.00, 1.80, 2.60, 4.20, 5.80, 7.40 — a straight line of slope 0.08, so k = 0.08 M⁻¹s⁻¹.',
    },
  ]);

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
    const tHalf = halfLife();
    out.innerHTML =
      `<table class="ref-table"><tr><th>order</th><th>rate law</th><th>integrated</th><th>linear plot</th><th>t½</th></tr>` +
      `<tr><td>0</td><td>rate = k</td><td>[A] = [A]₀ − kt</td><td>[A] vs t</td><td>[A]₀/2k</td></tr>` +
      `<tr><td>1</td><td>rate = k[A]</td><td>ln[A] = ln[A]₀ − kt</td><td>ln[A] vs t</td><td>0.693/k (constant!)</td></tr>` +
      `<tr><td>2</td><td>rate = k[A]²</td><td>1/[A] = 1/[A]₀ + kt</td><td>1/[A] vs t</td><td>1/(k[A]₀)</td></tr></table>` +
      `Current: order ${order}, t½ = <b>${tHalf.toFixed(2)} s</b>. ` +
      (order === 1 ? 'Half-life independent of concentration — the radioactive-decay signature.' :
        order === 2 ? 'Half-life doubles each half-life — decays with a long tail.' :
          'Concentration hits zero at t = [A]₀/k.');
    kinMissions.tick();
  }

  // Arrhenius
  let Ea = 75, T1 = 298, T2 = 308;
  const arrOut = h('div', { class: 'result' });
  const rateRatio = () => Math.exp((-Ea * 1000 / 8.314) * (1 / T2 - 1 / T1));

  const arrMissions = missionLadder([
    {
      id: 'msn-aek-08',
      prompt: 'Everyone repeats that "reaction rates double for every 10 °C". Leave T₁ at 298 K and T₂ at 308 K, and find the activation energy that makes that <b>exactly</b> true.',
      meter: () => ({ label: T1 === 298 && T2 === 308 ? `Eₐ = ${Ea} kJ/mol → rate ×${rateRatio().toFixed(2)} · target ×2.00` : 'put T₁ back to 298 K and T₂ to 308 K', pct: T1 === 298 && T2 === 308 ? Math.max(0, 100 - Math.abs(rateRatio() - 2) * 120) : 0 }),
      check: () => T1 === 298 && T2 === 308 && Math.abs(rateRatio() - 2) < 0.02,
      hints: [
        'Set ln(k₂/k₁) = ln 2 and solve the Arrhenius expression for Eₐ.',
        'It lands somewhere in the low fifties of kJ/mol.',
      ],
      explain: 'About <b>53 kJ/mol</b> — and that is the whole basis of the rule of thumb. It is not a law, it is one particular activation energy at one particular temperature. Now drag Eₐ to 150 kJ/mol and the same 10 °C gives roughly ×7; drop it to 20 kJ/mol and you get ×1.3. <span class="trap">The same 10 °C also matters far less at high temperature: the rule quietly assumes you are near room temperature.</span>',
    },
  ]);

  const arrCalc = () => {
    const ratio = rateRatio();
    arrOut.innerHTML =
      `<span class="eq">ln(k₂/k₁) = −(E<sub>a</sub>/R)(1/T₂ − 1/T₁)</span>` +
      `k(${T2} K) / k(${T1} K) = <b class="big">${ratio.toFixed(2)}×</b><br>` +
      `<span class="muted">The "rate doubles per 10 °C" rule of thumb is exactly true only when E<sub>a</sub> ≈ 53 kJ/mol near room T. Plot ln k vs 1/T → slope = −E<sub>a</sub>/R.</span>`;
    arrMissions.tick();
  };

  const el = h('div', { class: 'cards' },
    cardWithMissions('Integrated rate laws — find the order from the straight line', kinMissions,
      select('order', [{ value: '0', label: '0th order' }, { value: '1', label: '1st order' }, { value: '2', label: '2nd order' }],
        v => { order = Number(v) as 0 | 1 | 2; draw(); }, '1'),
      slider({ label: 'k', min: 0.02, max: 1, step: 0.01, value: k, fmt: v => v.toFixed(2), onInput: v => { k = v; draw(); } }),
      slider({ label: '[A]₀ (M)', min: 0.2, max: 2, step: 0.1, value: A0, fmt: v => v.toFixed(1), onInput: v => { A0 = v; draw(); } }),
      cCanvas, linCanvas, out, mysteryTable,
    ),
    cardWithMissions('Arrhenius: temperature sensitivity', arrMissions,
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
  mount(root) {
    root.append(pills([
      { label: 'Acid–Base & Titration', el: makeAcidBase() },
      { label: 'Electrochemistry', el: makeElectro() },
      { label: 'Kinetics', el: makeKinetics() },
      { label: 'Quiz', el: h('div', { class: 'cards' }, card('Quick quiz — all three topics', quiz(AEK_QUIZ, 5)), challengeLadder('aek')) },
    ]));
  },
};
