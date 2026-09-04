// Laboratory Skills — practical techniques: recrystallization, the distillation
// family, filtration, liquid–liquid extraction, drying agents, standard-solution
// and buffer preparation, uncertainty, and safety.
import { h, card, cardWithMissions, missionLadder, theory, slider, plot, linspace, pageQuiz, atLevel, numberInput, numVal, type TabDef, ctlRow, task } from './framework';
import { topicPage } from './page';
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
        : 'Good: it all dissolves hot, then most of it crystallises cold. Use the <b>smallest</b> volume of hot solvent that will take it, and cool slowly in an ice bath for pure crystals.') +
      `<br><span class="muted">The best solvent dissolves the compound freely when hot and barely at all when cold. The impurities either stay dissolved in the cold liquid, or are caught by filtering the hot solution before it cools.</span>`;
  }
  const el = card('Recrystallisation — solubility and how much you get back',
    task('Narrow the gap between the hot and the cold solubility, and watch how much of the solid you can recover collapse.'),
    // Clamped against each other: hot < cold would draw a solubility curve that
    // FALLS with temperature, which is not the chemistry this card is about.
    slider({ label: 'hot solubility (g/100 mL)', min: 5, max: 60, step: 1, value: sHot, onInput: v => { sHot = Math.max(v, sCold); draw(); } }),
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
  const pOrg = numberInput({ value: 15, min: 0.1, max: 760 });
  const mOrg = numberInput({ value: 150, min: 1, max: 2000 });
  const mWat = numberInput({ value: 18, min: 1, max: 500, step: 0.1 });
  const pTot = numberInput({ value: 760, min: 1, max: 2000 });
  const out = h('div', { class: 'result' });
  function calc(): void {
    const po = numVal(pOrg), mo = numVal(mOrg), mw = numVal(mWat), pt = numVal(pTot);
    const pw = pt - po; // water partial pressure at the boil
    if (pw > 0 && po > 0 && mw > 0) {
      const orgPerWater = (po * mo) / (pw * mw);
      out.innerHTML =
        `<span class="eq">boils when \\(P_{water} + P_{organic} = P_{total}\\) &nbsp;·&nbsp; mass ratio \\(= (P\\cdot M)\\) ratio</span>` +
        `If the mixture boils at a total pressure of ${pt} torr with the organic contributing ${po} torr, water must contribute the rest: <b>${pw} torr</b>.<br>` +
        `mass of organic ÷ mass of water in what comes over = (${po} × ${mo}) ÷ (${pw} × ${mw}) = <b class="big">${orgPerWater.toFixed(3)}</b><br>` +
        `<span class="muted">Even a substance that barely evaporates carries over in useful amounts if its molar mass is large. The mixture boils below 100 °C, which is gentle on anything heat would spoil.</span>`;
    }
  }
  [pOrg, mOrg, mWat, pTot].forEach(i => i.addEventListener('input', calc));
  const el = card('Distillation — four ways to separate liquids',
    task('Pick the right method for a given pair of liquids, then use the calculator below on a steam distillation.'),
    h('table', { class: 'ref-table', html: `
<tr><th>method</th><th>when to use</th><th>key idea</th></tr>
<tr><td>simple distillation</td><td>boiling points more than about 25 °C apart</td><td>one boil-and-condense step</td></tr>
<tr><td>fractional distillation</td><td>boiling points close together</td><td>the column repeats that step many times over</td></tr>
<tr><td>steam distillation</td><td>a substance that does not mix with water and is spoilt by heat</td><td>the two vapour pressures add up, so the mixture boils below 100 °C</td></tr>
<tr><td>vacuum distillation</td><td>a substance that falls apart before it boils</td><td>lower the pressure and it boils at a lower temperature</td></tr></table>` }),
    h('h3', {}, 'Steam distillation calculator'),
    h('p', { class: 'muted' }, 'A vapour pressure is the pressure the vapour above a liquid pushes with; the liquid boils once that pressure matches the pressure of the room. It is measured here in torr, an old unit in which ordinary air pressure is 760.'),
    ctlRow('vapour pressure of the organic at the boil (torr)', pOrg),
    ctlRow('molar mass of the organic (g/mol)', mOrg),
    ctlRow('molar mass of water (g/mol)', mWat),
    ctlRow('total pressure above the flask (torr)', pTot),
    out,
    h('p', { class: 'muted' }, 'Some pairs stick at one fixed composition, such as 95.6% ethanol in water. That mixture is called an azeotrope, and distillation cannot take it further, because its vapour has exactly the same composition as its liquid.'),
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
      `<span class="muted">Splitting the same volume of solvent into more, smaller portions always extracts more. You can also move a compound from one layer to the other by adding or removing an H⁺: washing with sodium hydrogencarbonate turns an organic acid into its salt, which then prefers the water.</span>`;
  }
  const el = card('Liquid–liquid extraction — multiple extractions win',
    task('Hold the total solvent volume fixed and split it into more portions to see how much more you recover.'),
    slider({ label: 'partition coefficient K — concentration in the organic layer ÷ in the water', min: 0.5, max: 20, step: 0.5, value: K, fmt: v => v.toFixed(1), onInput: v => { K = v; draw(); } }),
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
  // standard solution
  const molarity = numberInput({ value: 0.1000, min: 0.0001, max: 20, step: 0.001 });
  const volFlask = numberInput({ value: 250, min: 1, max: 20000 });
  const molarMass = numberInput({ value: 204.22, min: 1, max: 5000, step: 0.01 });
  const sOut = h('div', { class: 'result' });
  const sCalc = () => {
    const M = numVal(molarity), V = numVal(volFlask), MM = numVal(molarMass);
    const g = M * (V / 1000) * MM;
    sOut.innerHTML = `mass to weigh = concentration × volume × molar mass = ${M} × ${(V / 1000).toFixed(4)} L × ${MM} = <b class="big">${g.toFixed(4)} g</b><br>` +
      `<span class="muted">Weigh it on an analytical balance, dissolve it, then make the volume up to the mark in a Class A volumetric flask. Potassium hydrogen phthalate, molar mass 204.22 g/mol, is a common primary standard: a solid pure and stable enough that its weighed mass can be trusted.</span>`;
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
      `For ${Vbuf} mL at ${Cbuf} mol/L of the two together: conjugate base = <b>${(nTotal * fA).toFixed(4)} mol</b>, weak acid = <b>${(nTotal * (1 - fA)).toFixed(4)} mol</b>.<br>` +
      (Math.abs(pH - pKa) > 1
        ? '<span class="trap">The target pH is more than 1 unit from the pKa, so this buffer holds very little. Pick an acid whose pKa is within 1 unit of the pH you want.</span>'
        : 'Good: the pH is within 1 unit of the pKa, so the buffer has plenty in reserve on both sides.');
  };
  const el = card('Making up a solution of known concentration',
    task('Work out the mass to weigh for a solution of known concentration, then design a buffer at a pH away from the pKa and check the ratio it needs.'),
    h('h3', {}, 'Standard solution from a primary standard'),
    ctlRow('target concentration (mol/L)', molarity),
    ctlRow('flask volume (mL)', volFlask),
    ctlRow('molar mass (g/mol)', molarMass),
    sOut,
    h('h3', {}, 'Buffer recipe'),
    h('p', { class: 'muted' }, 'A buffer is a mixture of a weak acid and its conjugate base, the ion left after that acid gives up its H⁺. Added acid is mopped up by the base and added base by the acid, so the pH barely moves. The ratio of the two is what sets the pH: pH = pKa + log([base] ÷ [acid]).'),
    slider({ label: 'pKa of the weak acid (larger = weaker)', min: 2, max: 11, step: 0.01, value: pKa, fmt: v => v.toFixed(2), onInput: v => { pKa = v; bCalc(); } }),
    slider({ label: 'target pH', min: 2, max: 12, step: 0.1, value: pH, fmt: v => v.toFixed(1), onInput: v => { pH = v; bCalc(); } }),
    slider({ label: 'total concentration of the two together (mol/L)', min: 0.01, max: 1, step: 0.01, value: Cbuf, fmt: v => v.toFixed(2), onInput: v => { Cbuf = v; bCalc(); } }),
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

  // The eluent slider used to be inert: it relabelled the readout without
  // moving the spot, which is exactly the causal claim the caption makes
  // ("raising eluent polarity raises every R_f"). It now drives the plate.
  //
  // Model: retention factor k = (1 − R_f)/R_f, and log k falls linearly with
  // the % polar modifier (the linear-solvent-strength relation), S ≈ 0.025 per
  // percentage point — a factor of 10 in k per 40 points of modifier, which is
  // the right order for silica/hexane–ethyl acetate. The compound's retention
  // is anchored on whatever was last MEASURED (spot, front, φ), so setting the
  // sliders to a real plate re-anchors the model instead of fighting it.
  const S = 0.025;
  const kFromPlate = () => (spot > 0.05 ? (front - spot) / spot : 1e4);
  let kRef = kFromPlate(), phiRef = polarity;
  const reanchor = () => { kRef = kFromPlate(); phiRef = polarity; };

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
      `<br><span class="muted">Normal-phase silica is polar: polar compounds stick (low R_f), non-polar ones run with the front. Raising eluent polarity raises every R_f — move the eluent slider and watch the spot climb. Visualize under UV (254 nm) or with a stain (KMnO₄, ninhydrin, I₂). R_f is characteristic in a fixed system — an ID handle.</span>`;
    tlcMissions.tick();
  }

  const spotCtl = slider({
    label: 'spot distance (cm)', min: 0, max: 6, step: 0.1, value: spot, fmt: v => v.toFixed(1),
    onInput: v => { spot = Math.min(v, front); reanchor(); calc(); },
  });
  // Written to directly when the eluent moves the spot, rather than dispatching
  // a synthetic input event: the slider's own callback is rAF-coalesced, so a
  // round trip would paint one frame of stale R_f on every eluent change.
  const spotInput = spotCtl.querySelector('input') as HTMLInputElement;
  const spotVal = spotCtl.querySelector('.ctl-val') as HTMLElement;
  const setSpot = (v: number) => {
    spot = Math.max(0, Math.min(front, Math.round(v * 10) / 10));
    spotInput.value = String(spot);
    spotInput.setAttribute('aria-valuetext', spot.toFixed(1));
    spotVal.textContent = spot.toFixed(1);
  };

  const tlcMissions = missionLadder([
    {
      id: 'msn-lbt-01',
      prompt: 'The plate as loaded runs at <b>R_f = 0.64</b> in a 30% polar eluent — too far up the plate to be told apart from an impurity running just behind it. Without touching the plate, change the <b>eluent</b>, the solvent creeping up it, until the spot sits in the useful <b>0.30–0.50</b> window.',
      meter: () => {
        const rf = front > 0 ? spot / front : 0;
        return { label: `R_f = ${rf.toFixed(2)} · target 0.30–0.50`, pct: Math.max(0, Math.min(100, 100 - Math.abs(rf - 0.40) * 250)) };
      },
      check: () => { const rf = front > 0 ? spot / front : 0; return polarity < 30 && rf >= 0.30 && rf <= 0.50; },
      hints: [
        'On normal-phase silica the stationary phase is the polar one. Which way must the eluent go to make the compound stick MORE?',
        'Less polar eluent → lower R_f. Somewhere around 10–20% polar lands in the window.',
      ],
      explain: 'A <b>less</b> polar eluent (≈10–20%) drops the R_f into the window. The logic is a competition: silica is polar and holds the compound; the eluent pulls it off by competing for those same polar sites. A stronger (more polar) eluent competes better, so everything runs higher. That is why a TLC is optimised by changing the <em>solvent</em>, not the plate — and why the target is 0.3–0.5 rather than "as high as possible". Near R_f = 0.9 every compound is bunched against the front and nothing separates; near 0.1 the spots are streaky and slow. The 0.3–0.5 window is also what you transfer to a column: a compound at R_f ≈ 0.35 on TLC elutes in a convenient number of column volumes in the same solvent system.',
    },
  ]);

  const el = cardWithMissions('Chromatography — TLC, column and method choice', tlcMissions,
    task('TLC is thin-layer chromatography: a drop of the mixture is placed near the bottom of a coated plate and a solvent, the eluent, creeps up past it. R_f is how far the spot travelled as a fraction of how far the eluent got. Change the eluent polarity, watch R_f move, and find the polarity that puts the spot in the useful 0.3–0.5 window.'),
    spotCtl,
    slider({ label: 'solvent front (cm)', min: 1, max: 8, step: 0.1, value: front, fmt: v => v.toFixed(1), onInput: v => { front = v; spot = Math.min(spot, front); reanchor(); calc(); } }),
    slider({
      label: 'eluent polarity (% polar)', min: 0, max: 100, step: 5, value: polarity, fmt: v => `${v}%`,
      onInput: v => {
        polarity = v;
        const k = kRef * Math.pow(10, -S * (polarity - phiRef));
        setSpot((1 / (1 + k)) * front);
        reanchor();
        calc();
      },
    }),
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
  const a = numberInput({ value: 10.00, min: 0.001, max: 100000, step: 0.01 });
  const ea = numberInput({ value: 0.02, min: 0, max: 1000, step: 0.01 });
  const b = numberInput({ value: 5.00, min: 0.001, max: 100000, step: 0.01 });
  const eb = numberInput({ value: 0.01, min: 0, max: 1000, step: 0.01 });
  const uOut = h('div', { class: 'result' });
  const uCalc = () => {
    const A = numVal(a), sa = numVal(ea), B = numVal(b), sb = numVal(eb);
    if (A && B) {
      const R = A / B;
      const relR = Math.sqrt(Math.pow(sa / A, 2) + Math.pow(sb / B, 2));
      uOut.innerHTML = `result R = A ÷ B = ${R.toFixed(4)}. The two percentage uncertainties combine in quadrature: σR/R = √((σA/A)² + (σB/B)²) = ${(relR * 100).toFixed(2)}%, so R = <b class="big">${R.toFixed(3)} ± ${(relR * R).toFixed(3)}</b>`;
    }
  };
  [a, ea, b, eb].forEach(i => i.addEventListener('input', uCalc));
  const el = card('Filtration · drying agents · uncertainty · safety',
    task('Choose the filtration method and drying agent for a workup you have actually done.'),
    h('h3', {}, 'Filtration: gravity vs vacuum'),
    h('table', { class: 'ref-table', html: `
<tr><th>method</th><th>use it to…</th></tr>
<tr><td>gravity (fluted paper, hot funnel)</td><td>take undissolved solids out of a HOT solution before the product crystallises</td></tr>
<tr><td>vacuum (Büchner / Hirsch)</td><td>collect a solid fast and dry it (recrystallized product, precipitate)</td></tr></table>` }),
    h('h3', {}, 'Drying agents'),
    h('table', { class: 'ref-table', html: `
<tr><th>agent</th><th>notes</th></tr>
<tr><td>MgSO₄ (anhydrous)</td><td>fast, high capacity, neutral — general workhorse</td></tr>
<tr><td>Na₂SO₄</td><td>mild, slow, lower capacity; safe for delicate compounds</td></tr>
<tr><td>CaCl₂</td><td>cheap but forms adducts with alcohols/amines — avoid there</td></tr>
<tr><td>K₂CO₃</td><td>basic — for amines, not for acids</td></tr>
<tr><td>molecular sieves (3Å/4Å)</td><td>trap water by size; give very dry solvents</td></tr></table>` }),
    h('h3', {}, 'Combining uncertainties'),
    h('p', { class: 'muted' }, 'σ, the Greek letter sigma, means "the uncertainty in". Adding or subtracting two measurements combines their uncertainties as they stand. Multiplying or dividing combines them as percentages instead. "In quadrature" means squaring each, adding, and taking the square root.'),
    ctlRow('measurement on top, A', a),
    ctlRow('its uncertainty σA', ea),
    ctlRow('measurement underneath, B', b),
    ctlRow('its uncertainty σB', eb),
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
  mount(root, pageId) {
    root.append(topicPage(pageId ?? 'labtech', {
      sims: [atLevel('basics', makeRecryst()), atLevel('core', makeDistillation()),
        atLevel('core', makeExtraction()), atLevel('contest', makeChromatography()),
        atLevel('core', makeStandardBuffer()), atLevel('core', makeReference())],
      quiz: pageQuiz(pageId ?? 'labtech', LABTECH_QUIZ),
      theory: [
        theory('Basics — Laboratory Techniques', `
<h3>What this is about</h3>
<p>A pure compound almost never comes straight out of a reaction flask. This block covers the everyday ways of separating what you want from everything else that came with it.</p>
<h3>Recrystallisation</h3>
<p>Most solids dissolve far better in hot solvent than in cold, and recrystallisation lives on that gap. Dissolve the crude solid in the smallest amount of near-boiling solvent that will take it, then let the flask cool slowly. The compound comes back out as crystals. The impurities were only ever present in small amounts, so they stay dissolved in the cold liquid and are poured away.</p>
<p>You never recover all of it, because the cold solvent still holds some. Say 25 g of solid is recrystallised from 100 mL of a solvent whose cold solubility is 4 g per 100 mL. Then 4 g stays dissolved and 25 − 4 = 21 g crystallises, a recovery of 21 ÷ 25 = 84%. In general, recovery = mass used − (cold solubility × volume of solvent). The first card lets you drag those numbers and watch the recovery collapse as the hot and cold solubilities close up.</p>
<h3>Filtration</h3>
<p>Filtration separates a solid from the liquid around it by pouring the mixture through a porous paper. Gravity filtration lets the liquid drain under its own weight, which is gentle and suits a hot solution you want to keep dissolved. Vacuum filtration pulls the liquid through a Büchner funnel using reduced pressure underneath. It is far quicker and leaves the solid drier, which is what a freshly crystallised product needs.</p>
<h3>Distillation</h3>
<p>Distillation separates liquids by boiling point, the temperature at which a liquid turns to vapour. Heat a mixture and the lower-boiling liquid is over-represented in the vapour, so condensing that vapour gives a sample richer in it. One round of this is a simple distillation, and it works when the boiling points are far apart.</p>
<p>When the boiling points are close, one round is not enough. A fractional distillation sends the vapour up a packed column, where it condenses and re-boils many times on the way. Each repeat enriches the vapour a little further, which is what separates liquids only a few degrees apart.</p>
<h3>Extraction between two solvents</h3>
<p>Shake a solution with a second solvent that will not mix with the first, such as water against an organic solvent, and the two settle into separate layers. A dissolved compound splits itself between them. The partition coefficient is the ratio of its concentration in one layer to its concentration in the other once they have settled, and it is fixed for that compound with that pair of solvents. A compound that dissolves better in the organic layer builds up there, so running the layers apart carries it away from anything that prefers the water.</p>
<p>Splitting the solvent into several smaller portions and extracting more than once recovers more than pouring it all in at once.</p>
<h3>Drying an organic layer</h3>
<p>An organic layer that has touched water carries some dissolved water away with it. A drying agent is a salt that contains no water of its own and readily takes water up. Anhydrous means exactly that, no water. Stir anhydrous magnesium sulfate, MgSO₄, into the wet layer and it traps the dissolved water as a solid hydrate. Filter that solid off before evaporating the solvent, or the water goes straight back into the product.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Say which property each of recrystallisation, distillation and extraction separates on.</li>
<li>Work out a recrystallisation recovery from a cold solubility and a solvent volume.</li>
<li>Choose gravity or vacuum filtration for a given job, and say what a drying agent removes.</li>
</ul>`, true, 'basics'),
        theory('Core — Laboratory Techniques', `
<h3>What this block adds</h3>
<p>Basics named what each technique separates on. Core is about choosing between them and setting the numbers: which solvent, how many extractions, and what mass to weigh out.</p>
<h3>Choosing a recrystallisation solvent</h3>
<p>A good solvent dissolves the compound freely when hot and barely at all when cold. It must also boil below the compound's melting point, or the compound oils out instead of crystallising.</p>
<p>Benzoic acid in water is the standard case. Water holds 6.8 g per 100 mL at 95 °C and only 0.29 g per 100 mL at 20 °C. Dissolve 5.0 g of crude benzoic acid in 75 mL of near-boiling water and let it cool. The cold liquid keeps 0.29 × 0.75 = 0.22 g, so 5.0 − 0.22 = 4.8 g crystallises, a recovery of 96%.</p>
<p>The impurities behave the other way round. They either stay dissolved in the cold liquid, or never dissolve in the hot solvent.</p>
<h3>Filtering without losing the product</h3>
<p>Hot gravity filtration through fluted paper removes the insoluble impurities while the solution is still hot. Fluting increases the paper's area, so the liquid runs through before it crystallises in the funnel. The crystals themselves are collected later by vacuum filtration in a Büchner funnel, then washed with a little ice-cold solvent.</p>
<h3>Simple or fractional distillation</h3>
<p>A simple distillation gives one round of enrichment, which is enough when the boiling points are far apart. A useful working line is a gap of about 25 °C.</p>
<p>Diethyl ether boils at 34.6 °C and toluene at 111 °C, a gap of 76 °C, so a simple distillation separates them. Ethanol boils at 78.4 °C and water at 100 °C, a gap of only 22 °C, so that pair needs a fractional column. The column supplies many condense-and-reboil cycles in one pass.</p>
<p>Set the thermometer bulb level with the side arm, so it reads the vapour going over. A steady reading means one substance is distilling. A rising one means the mixture is coming over together.</p>
<h3>Extraction: which layer, and how many times</h3>
<p>The layers stack in order of density. Water is 1.00 g/mL, so diethyl ether at 0.71 g/mL floats on top while dichloromethane at 1.33 g/mL sinks below.</p>
<p>Splitting the solvent into portions recovers more. Suppose 1.00 g of a compound sits in 100 mL of water and dissolves four times better in the organic solvent. One extraction with 100 mL leaves 100 ÷ (100 + 4 × 100) = 0.20 of it behind, so 0.80 g is recovered. Two extractions of 50 mL each leave (100 ÷ (100 + 4 × 50))² = 0.111 behind. That recovers 0.89 g from the same total volume.</p>
<p>To tell the layers apart, add a few drops of water and watch which one grows. Keep every layer until the product is in hand.</p>
<h3>Drying the organic layer</h3>
<p>Add anhydrous magnesium sulfate a little at a time and swirl. Damp solid clumps and sticks to the glass. The layer is dry once fresh crystals swim freely and the solution is clear. Filter the drying agent off before removing the solvent.</p>
<h3>Preparing a standard solution</h3>
<p>A standard solution is one whose concentration is accurately known. It is made from a primary standard: a solid that is pure, stable in air and of known formula, such as anhydrous sodium carbonate.</p>
<p>To make 250.0 mL of 0.1000 M sodium carbonate, n = 0.1000 × 0.2500 = 0.02500 mol. Its molar mass is 2(22.990) + 12.011 + 3(15.999) = 105.99 g/mol, so the mass needed is 0.02500 × 105.99 = 2.650 g. Weigh it accurately and dissolve it in a little water. Transfer everything to a 250.0 mL volumetric flask with the rinsings, make up to the mark, and invert to mix.</p>
<p>Sodium hydroxide cannot be used this way. It takes up water and carbon dioxide from the air, so a weighed mass is not all NaOH. Its solutions must be checked against a primary standard.</p>
<h3>Working safely</h3>
<p>Add acid to water and never the other way round. The heat released can boil a small volume of water and throw it out. Wear goggles from the moment anyone in the room starts work. Use a fume hood for anything volatile or toxic. Never heat a closed vessel, and never point a heated tube at a person.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Judge a recrystallisation solvent from its hot and cold solubilities, and calculate the recovery.</li>
<li>Choose simple or fractional distillation from the gap between two boiling points.</li>
<li>Identify the organic layer from a density, and show that two small extractions beat one large one.</li>
<li>Weigh out and make up a standard solution, and say why sodium hydroxide is not a primary standard.</li>
<li>State the safety rules for heating, diluting acid and handling volatile substances.</li>
</ul>`, true, 'core'),
        theory('Contest reference — Laboratory Techniques', `
<h3>Recrystallization</h3>
<ul><li>Dissolve in the MINIMUM hot solvent; hot-filter (+ charcoal) to drop insoluble/coloured impurities; cool slowly to grow pure crystals; collect by vacuum filtration; wash with cold solvent.</li>
<li>Ideal solvent: high hot solubility, low cold solubility. Recovery = mass − (cold solubility × volume).</li></ul>
<h3>Distillation family</h3>
<ul><li><b>Simple</b>: large ΔBP. <b>Fractional</b>: close BPs — a column gives many plates. <b>Steam</b>: immiscible + heat-sensitive; boils where P_water + P_organic = P_total (below 100 °C); mass ratio = (P·M) ratio. <b>Vacuum</b>: lowers BP to avoid decomposition.</li>
<li><span class="trap">Azeotropes have identical vapor/liquid composition and can't be split by ordinary distillation.</span></li></ul>
<h3>Filtration</h3>
<ul><li>Gravity (fluted paper, hot funnel): keep a hot solution dissolved while removing solids. Vacuum (Büchner): fast collection + drying of a solid.</li></ul>
<h3>Liquid–liquid extraction</h3>
<span class="eq">\\(K = [A]_{org}/[A]_{aq}\\) &nbsp;·&nbsp; \\(\\text{fraction left} = \\left[V_{aq}/(V_{aq} + K V_{org})\\right]^n\\)</span>
<ul><li>Several small extractions beat one big one. Acid/base extractions move a compound between layers by (de)protonation. Check densities to identify the layers; keep both until sure.</li></ul>
<h3>Drying agents</h3>
<ul><li>MgSO₄ (fast, neutral), Na₂SO₄ (mild), CaCl₂ (not with OH/NH), K₂CO₃ (basic), molecular sieves (very dry). Swirl until the solid "swims" freely, then filter.</li></ul>
<h3>Chromatography</h3>
<ul><li>Separates by differential partition between stationary and mobile phases: TLC/column by polarity (normal-phase silica → polar = low R_f), GC by volatility, HPLC by polarity (high-res), electrophoresis by charge/size.</li></ul>
<h3>Preparing solutions</h3>
<ul><li>Primary standard (pure, stable, known formula: KHP, Na₂CO₃, K₂Cr₂O₇) → weigh accurately, dilute to the mark. Secondary standards (NaOH, HCl) must be standardized by titration.</li>
<li>Buffer: pH = pKa + log([A⁻]/[HA]); choose pKa within ±1 of the target pH for good capacity.</li></ul>
<h3>Uncertainty & safety</h3>
<ul><li>Accuracy (closeness to true) ≠ precision (reproducibility). Sums add absolute σ in quadrature; products add relative σ in quadrature. Report the correct sig figs.</li>
<li>Acid to water; know GHS pictograms; segregate incompatibles; goggles/gloves/fume hood; know emergency equipment.</li></ul>`, false, 'contest'),
      ],
    }));
  },
};
