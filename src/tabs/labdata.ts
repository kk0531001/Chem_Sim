// Lab & data analysis: Beer-Lambert spectrophotometry, significant figures,
// glassware uncertainty, lab technique reference.
import { h, card, cardWithMissions, missionLadder, theory, slider, button, plot, pills, pageQuiz, atLevel, numberInput, numVal, type TabDef, ctlRow, task } from './framework';
import { topicPage } from './page';
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

  // The answer is read off THIS card's own fitted line, which carries fresh
  // noise on every regenerate, so the window is wide enough to survive any
  // calibration the button can produce (±1% on the slope, ±0.01 on the
  // intercept) while still rejecting a forgotten ×5 dilution factor.
  const beerMissions = missionLadder([
    {
      id: 'msn-lbd-01',
      prompt: 'Your unknown reads <b>A = 1.40</b> — far off the top of the calibration range, where the reading cannot be trusted. So you dilute it: <b>10.00 mL made up to 50.00 mL</b>, and the diluted sample reads <b>A = 0.28</b>. Use this card\'s calibration line to report the concentration of the <b>original</b> solution, in units of 10⁻³ M.',
      numeric: { label: 'original conc (×10⁻³ M)', placeholder: 'e.g. 0.50', step: 0.01, validate: n => n >= 1.38 && n <= 1.62 },
      hints: [
        'Set the slider to the diluted sample\'s absorbance and read the concentration the fit gives.',
        'That is the concentration of the DILUTED solution. 10.00 mL → 50.00 mL is a dilution factor of 5, so the original was five times more concentrated.',
      ],
      explain: 'A = 0.28 sits on the line at c ≈ 3.0×10⁻⁴ M, and the dilution factor 50.00/10.00 = 5 puts the original at <b>≈ 1.5×10⁻³ M</b>. Two things make this the standard move rather than a workaround. First, at A = 1.40 only 4% of the light reaches the detector, so the measurement is dominated by detector noise and stray light — and stray light biases high absorbances <em>low</em>, so the raw reading is not merely imprecise but systematically wrong. Second, the dilution is done with a pipet and a volumetric flask (±0.02 and ±0.08 mL), which adds well under 1% uncertainty — far cheaper than the error you are removing. <span class="trap">Never extrapolate a calibration line past its highest standard. Bring the sample to the line instead of stretching the line to the sample.</span>',
    },
  ]);

  const el = h('div', { class: 'cards' },
    // The pills group is FLATTENED into one section per card by topicPage, so
    // each card carries its own level (plan3 Phase 6) rather than the group
    // carrying one. The two "essentials" blocks are this module's exam-level
    // reference and belong to the contest page.
    atLevel('core', cardWithMissions('Beer\'s law: calibration curve → unknown', beerMissions,
      task('Read the unknown off the fitted line, then regenerate the noise and see how much the answer moves.'),
      slider({ label: 'unknown\'s A', min: 0.05, max: 1.5, step: 0.01, value: unknownA, fmt: v => v.toFixed(2), onInput: v => { unknownA = v; draw(); } }),
      button('new calibration data (fresh noise)', regenerate),
      canvas, out,
    )),
    theory('Spectrophotometry essentials', `
<ul>
<li>Blank (cuvette + solvent, no analyte) zeroes the instrument — corrects for cell and solvent absorption.</li>
<li>Choose λ<sub>max</sub> from the absorption spectrum; a solution's colour is the <b>complement</b> of what it absorbs (CuSO₄ absorbs orange-red ~620+ nm, looks blue).</li>
<li>Path length b is usually 1.00 cm; ε is compound- and wavelength-specific.</li>
<li>Kinetics by spectrophotometry: watch A vs t for a colored species — A is proportional to concentration, so all the rate-law analysis applies directly.</li>
<li><span class="trap">Fingerprints/bubbles on the cuvette and A outside ~0.1–1.0 are the classic error sources.</span></li>
</ul>`, false, 'contest'),
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

  const meas = numberInput({ value: 9.61, min: -1e6, max: 1e6, step: 0.01 });
  const acc = numberInput({ value: 9.81, min: -1e6, max: 1e6, step: 0.01 });
  const errOut = h('div', { class: 'result' });
  const errCalc = () => {
    const m = numVal(meas), a = numVal(acc);
    if (a !== 0) errOut.innerHTML = `% error = |measured − accepted| / accepted × 100 = <b>${(Math.abs(m - a) / Math.abs(a) * 100).toFixed(2)}%</b>`;
  };
  [meas, acc].forEach(i => i.addEventListener('input', errCalc));
  errCalc();

  return h('div', { class: 'cards' },
    atLevel('basics', card('Significant figures',
      task('Type the awkward cases — leading zeros, trailing zeros, a pH — and check your count against the rules below.'),
      ctlRow('number', input),
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
      ctlRow('measured', meas),
      ctlRow('accepted', acc),
      errOut,
    )),
    atLevel('basics', card('Glassware — precision you can claim',
      task('Before quoting any volume, find the piece of glassware in this table and let it fix your decimal places.'),
      h('table', { class: 'ref-table', html: `
<tr><th>glassware</th><th>typical uncertainty</th><th>use for</th></tr>
<tr><td>analytical balance</td><td>±0.0001 g</td><td>weighing by difference</td></tr>
<tr><td>volumetric pipet (25 mL)</td><td>±0.03 mL</td><td>delivering one exact volume</td></tr>
<tr><td>burette (50 mL)</td><td>±0.02 mL per reading</td><td>titration (record to 0.01 mL!)</td></tr>
<tr><td>volumetric flask (100 mL)</td><td>±0.08 mL</td><td>making standard solutions</td></tr>
<tr><td>graduated cylinder</td><td>±0.5–1 mL</td><td>rough volumes only</td></tr>
<tr><td>beaker/flask markings</td><td>±5%</td><td>never for measuring</td></tr>` }),
      h('p', { class: 'muted' }, 'A burette volume is a DIFFERENCE of two readings, so its uncertainty is about ±0.04 mL total. Report readings to two decimal places, estimating the last digit between graduations.'),
    )),
  );
}

// ================= TECHNIQUE =================
function makeTechnique(): HTMLElement {
  return h('div', { class: 'cards' },
    atLevel('core', card('Titration technique — which way each mistake pushes the answer',
      task('For each line, say which way the reported concentration moves before you read on.'),
      h('ul', {},
        h('li', { html: 'Rinse the burette <b>with the titrant</b> (water left inside would dilute it → volume reads high).' }),
        h('li', { html: '<span class="trap">The Erlenmeyer flask may be wet with distilled water — the moles of acid in the flask are unchanged, so NO error!</span> This is the one most often got wrong.' }),
        h('li', { html: 'Rinse the pipet with the analyte solution; let it drain by gravity — the last drop stays in (calibrated "to deliver").' }),
        h('li', { html: 'Remove the air bubble from the burette tip (bubble escaping mid-run → volume reads high → concentration overestimated).' }),
        h('li', { html: 'Read the bottom of the meniscus at eye level; record to 0.01 mL.' }),
        h('li', { html: 'The end point is the first PERMANENT faint colour change (lasting 30 s). Add dropwise near the endpoint, swirl constantly.' }),
        h('li', { html: 'Overshooting, wrong indicator (methyl orange for weak acid/strong base), and misreading the burette scale are the usual causes to check.' }),
      ),
    )),
    atLevel('core', card('General technique & error direction reasoning',
      task('Practise the drill: trace one mistake through the formula and state the direction of the final error.'),
      h('ul', {},
        h('li', { html: '<b>Weigh by difference</b>: (container + sample) − (container) — cancels container error and hygroscopic drift.' }),
        h('li', { html: '<b>Heat to constant mass</b>: repeat heat/cool/weigh until mass stops changing — otherwise hydrate water remains → mass reads high.' }),
        h('li', { html: '<b>Dilution</b>: add acid TO water (exothermic splatter). Let volumetric flasks cool before final fill (hot solution = expanded volume).' }),
        h('li', { html: '<b>Error direction drill</b>: trace the mistake through the formula. Example: unnoticed bubble in the burette → V(titrant) reads high → n(acid) calculated high → concentration reported HIGH.' }),
        h('li', { html: '<b>Crystallization vs evaporation</b>: evaporate to dryness traps impurities; cool slowly for pure crystals, wash with cold solvent.' }),
        h('li', { html: '<b>Filtration</b>: gravity for keeping the liquid, vacuum (Büchner) for keeping the solid; wet filter paper before adding.' }),
      ),
    )),
    theory('Accuracy vs precision & uncertainty propagation', `
<ul>
<li><b>Accuracy</b> = close to true value (systematic error moves it). <b>Precision</b> = reproducibility (random error spreads it). A miscalibrated balance is precise but inaccurate.</li>
<li>Systematic errors bias in ONE direction and don't shrink with averaging; random errors average out with repeated trials.</li>
<li>Adding/subtracting: absolute uncertainties add. Multiplying/dividing: RELATIVE (%) uncertainties add.</li>
<li>Which measurement limits your result? The one with the largest % uncertainty — improve that one first (usually the smallest-volume measurement).</li>
<li>Mean ± spread: report x̄ and note the range; discard an outlier only with a stated reason.</li>
</ul>`, true, 'contest'),
  );
}

// ================= UNCERTAINTY PROPAGATION + Q-TEST =================
function makeUncertainty(): HTMLElement {
  // propagation: result = (A*B)/C style — relative uncertainties add in quadrature (or linearly)
  const A = numberInput({ value: 25.00, min: 0.001, max: 100000, step: 0.01 });
  const dA = numberInput({ value: 0.03, min: 0, max: 1000, step: 0.01 });
  const B = numberInput({ value: 0.1000, min: 0.0001, max: 100000, step: 0.0001 });
  const dB = numberInput({ value: 0.0005, min: 0, max: 1000, step: 0.0001 });
  const C = numberInput({ value: 10.00, min: 0.001, max: 100000, step: 0.01 });
  const dC = numberInput({ value: 0.02, min: 0, max: 1000, step: 0.01 });
  const propOut = h('div', { class: 'result' });
  const propCalc = () => {
    const a = numVal(A), da = numVal(dA), b = numVal(B), db = numVal(dB), c = numVal(C), dc = numVal(dC);
    if (a && b && c) {
      const result = (a * b) / c;
      const relA = da / a, relB = db / b, relC = dc / c;
      const relLinear = relA + relB + relC;
      const relQuad = Math.sqrt(relA * relA + relB * relB + relC * relC);
      propOut.innerHTML =
        `concentration = (titrant volume × titrant concentration) ÷ sample volume = <b>${result.toPrecision(4)}</b> mol/L<br>` +
        `relative uncertainties: titrant volume ${(relA * 100).toFixed(2)}%, titrant concentration ${(relB * 100).toFixed(2)}%, sample volume ${(relC * 100).toFixed(2)}%<br>` +
        `linear sum (conservative): ±${(relLinear * 100).toFixed(2)}% → ±${(result * relLinear).toPrecision(2)}<br>` +
        `in quadrature (independent errors): ±${(relQuad * 100).toFixed(2)}% → <b>${result.toPrecision(4)} ± ${(result * relQuad).toPrecision(2)}</b><br>` +
        `<span class="muted">For × and ÷ the RELATIVE uncertainties combine; for + and − the ABSOLUTE ones do. The largest relative term dominates the answer, so that is the measurement to improve first.</span>`;
    }
  };
  [A, dA, B, dB, C, dC].forEach(i => i.addEventListener('input', propCalc));
  propCalc();

  // Q-test
  const vals = h('input', { type: 'text', value: '10.1, 10.2, 10.3, 10.9' });
  const qOut = h('div', { class: 'result' });
  const Q90: Record<number, number> = { 3: 0.941, 4: 0.765, 5: 0.642, 6: 0.560, 7: 0.507, 8: 0.468 };
  const qCalc = () => {
    const data = vals.value.split(/[,\s]+/).map(Number).filter(x => !isNaN(x)).sort((a, b) => a - b);
    const n = data.length;
    if (n < 3 || n > 8) { qOut.innerHTML = 'Enter 3–8 numbers.'; return; }
    const range = data[n - 1] - data[0];
    const gapLow = data[1] - data[0], gapHigh = data[n - 1] - data[n - 2];
    const suspect = gapHigh >= gapLow ? data[n - 1] : data[0];
    const gap = Math.max(gapLow, gapHigh);
    const Q = gap / range;
    const crit = Q90[n];
    qOut.innerHTML =
      `n = ${n}, suspect value = <b>${suspect}</b><br>` +
      `Q = gap/range = ${gap.toFixed(2)}/${range.toFixed(2)} = <b>${Q.toFixed(3)}</b> vs Q_crit(90%, n=${n}) = ${crit}<br>` +
      (Q > crit ? `<b style="color:#e8590c">Q &gt; Q_crit → reject ${suspect} as an outlier</b> (at 90% confidence).`
        : `<b>Q ≤ Q_crit → keep ${suspect}</b>; not a statistical outlier.`) +
      `<br><span class="muted">Never discard data without a stated test — the Q-test gives an objective rule.</span>`;
  };
  vals.addEventListener('input', qCalc);
  qCalc();

  // A choices mission, not a drive-the-sim one: the student has to commit to a
  // verdict before reading the calculator's, and the interesting part is the
  // reason, not the number — so the two "keep" options differ only in why.
  const qMissions = missionLadder([
    {
      id: 'msn-lbd-02',
      prompt: 'The card starts with four replicate titres: <b>10.1, 10.2, 10.3, 10.9 mL</b>. The last one is plainly the odd one out — your lab partner wants to drop it before averaging. Work out the Q-test yourself, then decide.',
      choices: [
        { label: 'Reject 10.9 — it is far from the others', value: 'reject-eyeball' },
        { label: 'Keep 10.9 — Q = 0.75 does not reach Q_crit = 0.765', value: 'keep-q' },
        { label: 'Keep 10.9 — the Q-test can never reject with only 4 points', value: 'keep-never' },
      ],
      validateChoice: v => v === 'keep-q',
      hints: [
        'Q = (gap between the suspect and its nearest neighbour) / (total range of the data).',
        'gap = 10.9 − 10.3 = 0.6; range = 10.9 − 10.1 = 0.8. Compare Q = 0.75 with Q_crit(90%, n = 4) = 0.765.',
      ],
      explain: 'Q = 0.6/0.8 = <b>0.750</b>, just under the critical 0.765 — so the value <b>stays in</b>, and the mean you report is 10.375 mL, not 10.20 mL. This is the whole point of having a test. "It looks wrong" is not a reason; a value that offends you is exactly the value you are most likely to discard for the wrong reasons, and a lab report that quietly deletes it is falsifying data. Two things worth carrying away: the test is weak at n = 4 (with only four points, an outlier has to be extreme to fail it — collect more replicates rather than arguing about one), and a value that survives the test but you still distrust should be investigated in the lab, not deleted at the desk — a lost drop, an air bubble or a misread meniscus is a <em>documented</em> reason to discard a run, and that reason belongs in the notebook.',
    },
  ]);

  return h('div', { class: 'cards' },
    atLevel('contest', card('Combining uncertainties',
      task('Enter three measurements with their uncertainties and find which one dominates the result.'),
      h('p', { class: 'muted' }, 'A worked titration: the concentration is (titrant volume × titrant concentration) ÷ sample volume, and each of the three carries an uncertainty of its own. δ, the Greek letter delta, means "the uncertainty in".'),
      ctlRow('titrant volume (mL) ± δ', A, dA),
      ctlRow('titrant concentration (mol/L) ± δ', B, dB),
      ctlRow('sample volume (mL) ± δ', C, dC),
      propOut,
    )),
    atLevel('contest', cardWithMissions('Testing an odd result — the Q-test', qMissions,
      task('Paste a small data set with one suspect value and check whether the Q-test actually lets you throw it out.'),
      ctlRow('values (comma-sep)', vals),
      qOut,
    )),
  );
}

// ================= QUALITATIVE FUNCTIONAL-GROUP TESTS =================
function makeQualTests(): HTMLElement {
  return h('div', { class: 'cards' },
    atLevel('contest', card('Qualitative functional-group tests',
      task('For each pair of similar groups, find the test that distinguishes them.'),
      h('table', { class: 'ref-table', html: `
<tr><th>test / reagent</th><th>positive result</th><th>detects</th></tr>
<tr><td>Tollens (Ag(NH₃)₂⁺)</td><td>silver mirror</td><td>aldehyde (not ketone)</td></tr>
<tr><td>Fehling's / Benedict's (Cu²⁺)</td><td>brick-red Cu₂O</td><td>aldehyde / reducing sugar</td></tr>
<tr><td>2,4-DNP (Brady's)</td><td>yellow-orange precipitate</td><td>aldehyde OR ketone (C=O)</td></tr>
<tr><td>Iodoform (I₂/NaOH)</td><td>yellow CHI₃ precipitate</td><td>methyl ketone or CH₃CH(OH)–</td></tr>
<tr><td>Lucas (ZnCl₂/HCl)</td><td>cloudiness: 3° fast, 2° slow, 1° none</td><td>alcohol class</td></tr>
<tr><td>Bromine water</td><td>orange → colourless</td><td>alkene/alkyne (C=C, C≡C)</td></tr>
<tr><td>Baeyer (cold dilute KMnO₄)</td><td>purple → brown MnO₂</td><td>alkene (also oxidizable groups)</td></tr>
<tr><td>FeCl₃</td><td>violet/blue colour</td><td>phenol</td></tr>
<tr><td>NaHCO₃</td><td>effervescence (CO₂)</td><td>carboxylic acid</td></tr>
<tr><td>Ceric ammonium nitrate</td><td>amber → red</td><td>alcohol</td></tr>` }),
      h('p', { class: 'muted' }, 'A carbonyl is a C=O group; unsaturation means a carbon–carbon double or triple bond. Strategy: 2,4-DNP first confirms a carbonyl, then Tollens or the iodoform test narrows aldehyde against methyl ketone. Bromine water and Baeyer both flag unsaturation; combine tests to pin the group down.'),
    )),
    atLevel('contest', card('Cation / anion & gas tests',
      task('Plan the order you would run these in to identify an unknown salt.'),
      h('ul', {},
        h('li', { html: '<b>Flame:</b> Li crimson, Na yellow, K lilac, Ca brick-red, Ba green, Cu blue-green.' }),
        h('li', { html: '<b>Halides + AgNO₃:</b> Cl⁻ white, Br⁻ cream, I⁻ yellow; AgCl dissolves in dilute NH₃.' }),
        h('li', { html: '<b>SO₄²⁻ + Ba²⁺:</b> white precipitate insoluble in acid. <b>CO₃²⁻ + acid:</b> CO₂ (limewater milky).' }),
        h('li', { html: '<b>NH₄⁺ + NaOH (warm):</b> NH₃ gas (damp red litmus → blue).' }),
        h('li', { html: '<b>Gas tests:</b> H₂ squeaky pop; O₂ relights glowing splint; CO₂ limewater milky.' }),
      ),
    )),
  );
}

export const labdataTab: TabDef = {
  id: 'labdata',
  mount(root, pageId) {
    root.append(topicPage(pageId ?? 'labdata', {
      sims: [pills([
        { label: 'Beer\'s law', el: makeBeer() },
        { label: 'Sig figs & error', el: makeSigFigs() },
        { label: 'Uncertainty & Q-test', el: makeUncertainty() },
        { label: 'Qual. analysis', el: makeQualTests() },
        { label: 'Technique', el: makeTechnique() },
      ])],
      quiz: pageQuiz(pageId ?? 'labdata', LABDATA_QUIZ),
      // Basics first; the exam-level material is one theory block per panel,
      // beside the tool it explains.
      theory: [
        theory('Basics — Lab & Data', `
<h3>What this is about</h3>
<p>A measurement is worth only as much as the care taken in reading it and reporting it. This block covers reading glassware, deciding how many digits to keep, and turning a light-absorption reading into a concentration.</p>
<h3>Reading glassware</h3>
<p>Water in a narrow glass tube curves upward where it touches the walls. That curved surface is the meniscus, and a burette or a pipette is read at the bottom of the curve. Keep your eye level with the mark while you read it. Looking down at the mark or up at it shifts the apparent position, an error called parallax.</p>
<p>A burette scale runs downward, so the volume delivered is the final reading minus the starting one. Take both readings to the same number of decimal places.</p>
<h3>Accuracy and precision are different things</h3>
<p>Accuracy is how close a measurement is to the true value. Precision is how close repeated measurements are to each other. A burette with a mis-set zero gives readings that agree closely and are all wrong, which is precise without being accurate. Scatter that averages out to the right answer is the opposite case.</p>
<h3>Significant figures</h3>
<p>The significant figures of a number are the digits that carry real information about the measurement. An answer must never look more certain than the data behind it.</p>
<p>Try 12.5 + 1.25. A calculator gives 13.75, but 12.5 was measured only to one decimal place, so the answer cannot claim two. Round it to 13.8. The rule for adding and subtracting is about decimal places: keep as many as the value that has the fewest. Multiplying and dividing use a different rule: keep as many significant figures as the value that has the fewest. So 2.0 × 3.15 = 6.3, not 6.30.</p>
<h3>Absorbance</h3>
<p>Shine light through a coloured solution and some of it is absorbed. The fraction that gets through is the transmittance, T. The absorbance is <span class="eq">A = −log T</span>. A solution that lets 10% of the light through has T = 0.10, and −log(0.10) = 1.00, so its absorbance is 1.00. An absorbance of 2 means only one hundredth of the light survived.</p>
<p>Different wavelengths are absorbed by different amounts. λmax is the wavelength at which a sample absorbs the most, the peak of its absorption curve. Measuring there gives the largest signal for a given amount of substance, so small differences in concentration are easiest to see.</p>
<h3>Beer's law and a calibration line</h3>
<p>Absorbance is proportional to how much absorbing substance the light passes through. Double the concentration and the absorbance doubles. Written out, <span class="eq">A = ε b c</span> where c is the concentration in mol/L, b is the path length through the sample in cm, and ε is the molar absorptivity, a constant for that substance at that wavelength. The path length is set by the width of the small clear cell the sample sits in, called a cuvette.</p>
<p>That proportionality is what makes the first card work. Measure several solutions of known concentration, called standards, plot absorbance against concentration, and the points fall on a straight line. Read an unknown's absorbance off that line to get its concentration. The line is only trustworthy over the range you measured, so a reading above the highest standard should be diluted and measured again.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Read a burette correctly, and say why eye level matters.</li>
<li>Apply the decimal-place rule to a sum and the significant-figure rule to a product.</li>
<li>Explain what absorbance measures, why λmax is chosen, and how a calibration line turns an absorbance into a concentration.</li>
</ul>`, true, 'basics'),
        theory('Core — Lab & Data', `
<h3>What this block adds</h3>
<p>Basics read a burette and gave the two significant-figure rules. Core carries those digits through a whole calculation and puts numbers on how good each piece of glassware is. It also works out which way a mistake pushes the answer.</p>
<h3>Significant figures across several steps</h3>
<p>Round once, at the very end. Rounding at every step lets small errors build up until they reach the last digit you report.</p>
<p>A burette reads 0.05 mL at the start and 22.40 mL at the end, so the volume delivered is 22.40 − 0.05 = 22.35 mL. Both readings carried two decimal places, so the difference keeps two. The base was 0.1000 M, so n = 0.1000 × 0.02235 = 2.235 × 10⁻³ mol. That is four significant figures, because both inputs had four. Dividing by a 25.00 mL sample gives 2.235 × 10⁻³ ÷ 0.02500 = 0.08940 M, still four.</p>
<p>Counted numbers and exact conversions never limit the answer. The 1000 in millilitres per litre is exact, and so is the 2 in a two-to-one mole ratio.</p>
<h3>Precision, accuracy and a set of repeats</h3>
<p>Precision is measured from your own results, by how far the repeats sit from one another. Accuracy needs a known value to compare against. A titration is repeated until the results agree, not until one of them looks right.</p>
<p>Four titres come in at 22.85, 22.35, 22.40 and 22.30 mL. A titre is the volume the burette delivered in one run, the final reading minus the starting one. The last three agree within 0.10 mL, while the first is half a millilitre away. Treat that first one as a rough trial, and the mean of the other three is 22.35 mL. Titres are normally accepted as concordant, meaning in agreement, when they fall within 0.10 mL of each other.</p>
<h3>What the glassware can promise</h3>
<p>A tolerance is the largest error the maker guarantees the item stays inside. Class A is the more accurate grade of volumetric glassware.</p>
<ul>
<li>A 25.00 mL Class A pipette is ±0.03 mL, about 0.1% of its volume.</li>
<li>A 250.0 mL Class A volumetric flask is ±0.12 mL, about 0.05%.</li>
<li>A 50 mL Class A burette is ±0.05 mL on a single reading, so a titre built from two readings carries about ±0.10 mL.</li>
<li>A 50 mL measuring cylinder is roughly ±0.4 mL, close to 1%.</li>
</ul>
<p>On a 22.35 mL titre the burette's ±0.10 mL is 0.10 ÷ 22.35 × 100 = 0.45%. That is why titres are planned to be reasonably large: the same absolute uncertainty is a smaller fraction of a bigger volume. It is also why a measuring cylinder never measures a sample.</p>
<h3>Beer's law with a calibration line</h3>
<p>Absorbance rises in proportion to concentration, so a set of standards plots as a straight line through the origin. The slope of that line is ε × b, and an unknown is read off the line.</p>
<p>Four standards at 2.0, 4.0, 6.0 and 8.0 × 10⁻⁵ mol/L give absorbances of 0.104, 0.210, 0.315 and 0.418 in a 1.00 cm cuvette. The slope is (0.418 − 0.104) ÷ (6.0 × 10⁻⁵) = 5.2 × 10³ L/mol. Since <span class="eq">A = ε b c</span> and b = 1.00 cm, the molar absorptivity ε is 5.2 × 10³ L/(mol·cm). An unknown reading 0.260 has c = 0.260 ÷ (5.2 × 10³) = 5.0 × 10⁻⁵ mol/L.</p>
<p>Read only inside the range you actually measured. A sample absorbing above the top standard is diluted by a known factor, measured again, and the factor applied.</p>
<h3>The end point and the equivalence point</h3>
<p>The equivalence point is where exactly enough titrant has been added to react with everything in the flask. It is a fact about the chemistry, and nothing on the bench announces it.</p>
<p>The end point is what you actually see: the drop at which the indicator changes colour and stays changed. A well-chosen indicator puts the two within one drop of each other, and the gap that remains between them is called the indicator error.</p>
<h3>Which way an error pushes the answer</h3>
<p>Work it out in two steps. Ask what the mistake does to the number you write down, then follow that number through the calculation.</p>
<ul>
<li>A burette rinsed with water and not with the solution it will hold delivers a slightly diluted solution. More volume is then needed to reach the end point, so the calculated concentration comes out too high.</li>
<li>An air bubble in the burette tip that leaves during the titration is recorded as delivered liquid. The titre is too large, so again the answer is too high.</li>
<li>A conical flask still wet with distilled water changes nothing. The water dilutes the sample, but it adds no acid and removes none, so the amount being titrated is unchanged.</li>
</ul>
<h3>What you should be able to do now</h3>
<ul>
<li>Carry significant figures through a multi-step calculation and round only at the end.</li>
<li>Pick out a rough trial from a set of titres and average only the concordant ones.</li>
<li>Quote a tolerance for a pipette, a flask and a burette, and turn it into a percentage.</li>
<li>Build a calibration line, get ε from its slope, and read an unknown concentration off it.</li>
<li>Say whether a named procedural error makes the result too high, too low or unaffected.</li>
</ul>`, true, 'core'),
      ],
    }));
  },
};
