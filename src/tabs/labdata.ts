// Lab & data analysis: Beer-Lambert spectrophotometry, significant figures,
// glassware uncertainty, lab technique reference.
import { h, card, theory, slider, button, plot, pills, quiz, type TabDef } from './framework';
import { LABDATA_QUIZ } from './questions2';


// ================= BEER'S LAW =================
function makeBeer(): HTMLElement {
  const EPS_TRUE = 940; // L/mol/cm — hidden "true" molar absorptivity
  const b = 1; // cm
  let standards: { c: number; A: number }[] = [];
  let unknownA = 0.45;
  const canvas = h('canvas', { width: 470, height: 270 });
  const out = h('div', { class: 'result' });

  function regenerate(): void {
    standards = [1, 2, 4, 6, 8].map(x => {
      const c = x * 1e-4;
      return { c, A: EPS_TRUE * b * c + (Math.random() - 0.5) * 0.02 };
    });
    draw();
  }

  function fit(): { slope: number; intercept: number } {
    const n = standards.length;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const p of standards) { sx += p.c; sy += p.A; sxx += p.c * p.c; sxy += p.c * p.A; }
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    return { slope, intercept: (sy - slope * sx) / n };
  }

  function draw(): void {
    const { slope, intercept } = fit();
    const cUnknown = (unknownA - intercept) / slope;
    plot(canvas, [
      { xs: [0, 9e-4], ys: [intercept, intercept + slope * 9e-4], color: '#5a6a7d', dash: [4, 3], label: 'fit' },
      { xs: standards.map(p => p.c), ys: standards.map(p => p.A), color: '#6fc3ff', width: 0, label: 'standards' },
    ], {
      xLabel: 'concentration (M)', yLabel: 'absorbance A', yMin: 0,
      markers: [
        ...standards.map(p => ({ x: p.c, y: p.A, color: '#6fc3ff' })),
        { x: cUnknown, y: unknownA, color: '#ff5577', label: 'unknown' },
      ],
    });
    out.innerHTML =
      `<span class="eq">A = εbc (Beer–Lambert) &nbsp;·&nbsp; A = −log(I/I₀) = −log T</span>` +
      `calibration fit: A = <b>${slope.toFixed(0)}</b>·c ${intercept >= 0 ? '+' : '−'} ${Math.abs(intercept).toFixed(3)} → ε ≈ <b>${(slope / b).toFixed(0)} L·mol⁻¹·cm⁻¹</b> (true value ${EPS_TRUE})<br>` +
      `unknown with A = ${unknownA.toFixed(2)} → c = <b class="big">${cUnknown.toExponential(2)} M</b><br>` +
      (unknownA > 1 ? `<span class="trap">A &gt; 1 means &lt;10% of light gets through — outside the reliable linear range. Dilute the sample and re-measure!</span><br>` : '') +
      `<span class="muted">A = 1 → 10% transmitted; A = 2 → 1%. Measure at λmax: maximum sensitivity and the flattest response to wavelength error.</span>`;
  }

  const el = h('div', { class: 'cards' },
    card('Beer\'s law: calibration curve → unknown',
      slider({ label: 'unknown\'s A', min: 0.05, max: 1.5, step: 0.01, value: unknownA, fmt: v => v.toFixed(2), onInput: v => { unknownA = v; draw(); } }),
      button('new calibration data (fresh noise)', regenerate, 'primary'),
      canvas, out,
    ),
    theory('Spectrophotometry essentials', `
<ul>
<li>Blank (cuvette + solvent, no analyte) zeroes the instrument — corrects for cell and solvent absorption.</li>
<li>Choose λ<sub>max</sub> from the absorption spectrum; a solution's color is the <b>complement</b> of what it absorbs (CuSO₄ absorbs orange-red ~620+ nm, looks blue).</li>
<li>Path length b is usually 1.00 cm; ε is compound- and wavelength-specific.</li>
<li>Kinetics by spectrophotometry: watch A vs t for a colored species — A is proportional to concentration, so all the rate-law analysis applies directly.</li>
<li><span class="trap">Fingerprints/bubbles on the cuvette and A outside ~0.1–1.0 are the classic error sources.</span></li>
</ul>`),
  );
  regenerate();
  return el;
}

// ================= SIG FIGS & ERROR =================
function countSigFigs(s: string): { n: number; note: string } | null {
  const t = s.trim();
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return null;
  const mantissa = t.replace(/[eE][+-]?\d+$/, '').replace(/^[+-]/, '');
  const hasDot = mantissa.includes('.');
  const digits = mantissa.replace('.', '');
  const stripped = digits.replace(/^0+/, '');
  if (stripped === '') return { n: 1, note: 'a bare zero counts as 1 sig fig' };
  if (hasDot) {
    return { n: stripped.length, note: 'leading zeros never count; trailing zeros DO count because there\'s a decimal point' };
  }
  const noTrail = stripped.replace(/0+$/, '');
  if (noTrail.length !== stripped.length) {
    return { n: noTrail.length, note: `ambiguous! trailing zeros without a decimal point may or may not be significant — write ${Number(t).toExponential()} to be explicit. Minimum reading: ${noTrail.length}` };
  }
  return { n: stripped.length, note: 'all non-zero digits (and zeros between them) count' };
}

function makeSigFigs(): HTMLElement {
  const input = h('input', { type: 'text', value: '0.03040' });
  const sfOut = h('div', { class: 'result' });
  const sfCalc = () => {
    const r = countSigFigs(input.value);
    sfOut.innerHTML = r ? `<b class="big">${r.n} significant figures</b><br>${r.note}` : 'enter a number (scientific notation like 3.20e4 works)';
  };
  input.addEventListener('input', sfCalc);
  sfCalc();

  const meas = h('input', { type: 'number', value: '9.61', step: '0.01' });
  const acc = h('input', { type: 'number', value: '9.81', step: '0.01' });
  const errOut = h('div', { class: 'result' });
  const errCalc = () => {
    const m = Number(meas.value), a = Number(acc.value);
    if (a !== 0) errOut.innerHTML = `% error = |measured − accepted| / accepted × 100 = <b>${(Math.abs(m - a) / Math.abs(a) * 100).toFixed(2)}%</b>`;
  };
  [meas, acc].forEach(i => i.addEventListener('input', errCalc));
  errCalc();

  return h('div', { class: 'cards' },
    card('Sig fig counter',
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'number'), input),
      sfOut,
      h('h3', {}, 'Rules for calculations'),
      h('ul', {},
        h('li', { html: '<b>× and ÷</b>: answer gets the FEWEST sig figs of any input (4.56 × 1.4 = 6.4).' }),
        h('li', { html: '<b>+ and −</b>: answer gets the fewest DECIMAL PLACES (12.11 + 18.0 = 30.1).' }),
        h('li', { html: '<b>logs</b>: sig figs of the number → decimal places of the log. pH 4.74 has 2 sig figs (the 4 before the point only sets the power of ten).' }),
        h('li', { html: 'Exact numbers (counts, definitions like 1000 mL/L, stoichiometric coefficients) have infinite sig figs.' }),
        h('li', { html: '<span class="trap">Round only at the END — carry extra digits through intermediate steps.</span>' }),
      ),
      h('h3', {}, 'Percent error'),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'measured'), meas),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'accepted'), acc),
      errOut,
    ),
    card('Glassware — precision you can claim',
      h('table', { class: 'ref-table', html: `
<tr><th>glassware</th><th>typical uncertainty</th><th>use for</th></tr>
<tr><td>analytical balance</td><td>±0.0001 g</td><td>weighing by difference</td></tr>
<tr><td>volumetric pipet (25 mL)</td><td>±0.03 mL</td><td>delivering one exact volume</td></tr>
<tr><td>buret (50 mL)</td><td>±0.02 mL per reading</td><td>titration (record to 0.01 mL!)</td></tr>
<tr><td>volumetric flask (100 mL)</td><td>±0.08 mL</td><td>making standard solutions</td></tr>
<tr><td>graduated cylinder</td><td>±0.5–1 mL</td><td>rough volumes only</td></tr>
<tr><td>beaker/flask markings</td><td>±5%</td><td>never for measuring</td></tr>` }),
      h('p', { class: 'muted' }, 'A buret volume is a DIFFERENCE of two readings, so its uncertainty is about ±0.04 mL total. Report readings to two decimal places, estimating the last digit between graduations.'),
    ),
  );
}

// ================= TECHNIQUE =================
function makeTechnique(): HTMLElement {
  return h('div', { class: 'cards' },
    card('Titration technique — the classic exam questions',
      h('ul', {},
        h('li', { html: 'Rinse the buret <b>with the titrant</b> (water left inside would dilute it → volume reads high).' }),
        h('li', { html: '<span class="trap">The Erlenmeyer flask may be wet with distilled water — moles of analyte are unchanged, so NO error!</span> The single most-tested titration concept.' }),
        h('li', { html: 'Rinse the pipet with the analyte solution; let it drain by gravity — the last drop stays in (calibrated "to deliver").' }),
        h('li', { html: 'Remove the air bubble from the buret tip (bubble escaping mid-run → volume reads high → concentration overestimated).' }),
        h('li', { html: 'Read the bottom of the meniscus at eye level; record to 0.01 mL.' }),
        h('li', { html: 'Endpoint = first PERMANENT faint color change (30 s). Add dropwise near the endpoint, swirl constantly.' }),
        h('li', { html: 'Overshooting, wrong indicator (methyl orange for weak acid/strong base), and misreading the buret scale are the standard error-analysis answers.' }),
      ),
    ),
    card('General technique & error direction reasoning',
      h('ul', {},
        h('li', { html: '<b>Weigh by difference</b>: (container + sample) − (container) — cancels container error and hygroscopic drift.' }),
        h('li', { html: '<b>Heat to constant mass</b>: repeat heat/cool/weigh until mass stops changing — otherwise hydrate water remains → mass reads high.' }),
        h('li', { html: '<b>Dilution</b>: add acid TO water (exothermic splatter). Let volumetric flasks cool before final fill (hot solution = expanded volume).' }),
        h('li', { html: '<b>Error direction drill</b>: trace the mistake through the formula. Example: unnoticed bubble in buret → V(titrant) reads high → n(acid) calculated high → concentration reported HIGH.' }),
        h('li', { html: '<b>Crystallization vs evaporation</b>: evaporate to dryness traps impurities; cool slowly for pure crystals, wash with cold solvent.' }),
        h('li', { html: '<b>Filtration</b>: gravity for keeping the liquid, vacuum (Büchner) for keeping the solid; wet filter paper before adding.' }),
      ),
    ),
    theory('Accuracy vs precision & uncertainty propagation', `
<ul>
<li><b>Accuracy</b> = close to true value (systematic error moves it). <b>Precision</b> = reproducibility (random error spreads it). A miscalibrated balance is precise but inaccurate.</li>
<li>Systematic errors bias in ONE direction and don't shrink with averaging; random errors average out with repeated trials.</li>
<li>Adding/subtracting: absolute uncertainties add. Multiplying/dividing: RELATIVE (%) uncertainties add.</li>
<li>Which measurement limits your result? The one with the largest % uncertainty — improve that one first (usually the smallest-volume measurement).</li>
<li>Mean ± spread: report x̄ and note the range; discard an outlier only with a stated reason.</li>
</ul>`, true),
  );
}

export const labdataTab: TabDef = {
  id: 'labdata',
  label: 'Lab & Data',
  group: 'Skills',
  mount(root) {
    root.append(pills([
      { label: 'Beer\'s law', el: makeBeer() },
      { label: 'Sig figs & error', el: makeSigFigs() },
      { label: 'Technique', el: makeTechnique() },
      { label: 'Quiz', el: h('div', { class: 'cards' }, card('Quick quiz', quiz(LABDATA_QUIZ, 5))) },
    ]));
  },
};
