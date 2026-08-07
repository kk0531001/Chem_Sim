// Descriptive chemistry, nuclear chemistry, coordination chemistry.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, button, plot, linspace, pills, quiz, type TabDef, type TabHandle } from './framework';
import { topicPage } from './page';
import { NUCLEAR_QUIZ } from './questions2';


// ================= NUCLEAR =================
function makeNuclear(): { el: HTMLElement; setVisible: (v: boolean) => void; destroy: () => void } {
  const GRID = 22;
  let alive: boolean[] = [];
  let tHalf = 8, tElapsed = 0, running = false, visible = false;
  const histT: number[] = [], histN: number[] = [];
  const gridCanvas = h('canvas', { width: 308, height: 308 });
  const curveCanvas = h('canvas', { width: 440, height: 220 });
  const out = h('div', { class: 'result' });
  let frameId: number | null = null;

  function reset(): void {
    alive = new Array(GRID * GRID).fill(true);
    tElapsed = 0; histT.length = 0; histN.length = 0;
    running = true;
    draw();
  }
  function drawGrid(): void {
    const ctx = gridCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, 308, 308);
    const cell = 308 / GRID;
    for (let i = 0; i < alive.length; i++) {
      const x = (i % GRID) * cell, y = Math.floor(i / GRID) * cell;
      ctx.fillStyle = alive[i] ? '#6fc3ff' : '#2a2f3a';
      ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, cell * 0.32, 0, 7); ctx.fill();
    }
  }
  function draw(): void {
    drawGrid();
    const N = alive.filter(Boolean).length;
    const N0 = GRID * GRID;
    if (histT.length > 1) {
      const ts = linspace(0, Math.max(tElapsed, 1), 100);
      plot(curveCanvas, [
        { xs: histT, ys: histN, color: '#6fc3ff', label: 'simulated N' },
        { xs: ts, ys: ts.map(t => N0 * Math.pow(0.5, t / tHalf)), color: '#ffe27a', label: 'N₀·(½)^(t/t½)', dash: [4, 3] },
      ], { xLabel: 't (s)', yLabel: 'undecayed nuclei', yMin: 0 });
    }
    const halfLives = tElapsed / tHalf;
    out.innerHTML = `t = ${tElapsed.toFixed(1)} s = <b>${halfLives.toFixed(2)} half-lives</b> · ${N}/${N0} remain (${(100 * N / N0).toFixed(0)}%)` +
      `<br>λ = ln2/t½ = ${(Math.LN2 / tHalf).toFixed(3)} s⁻¹ · activity A = λN = ${(Math.LN2 / tHalf * N).toFixed(1)} decays/s` +
      `<br><span class="muted">Each dot decides independently — decay is perfectly random per nucleus yet perfectly predictable in bulk. First-order kinetics.</span>`;
  }
  let acc = 0;
  function frame(): void {
    if (visible && running) {
      const dt = 1 / 60;
      tElapsed += dt;
      acc += dt;
      const pDecay = 1 - Math.pow(0.5, dt / tHalf);
      for (let i = 0; i < alive.length; i++) {
        if (alive[i] && Math.random() < pDecay) alive[i] = false;
      }
      if (acc > 0.25) {
        acc = 0;
        histT.push(tElapsed); histN.push(alive.filter(Boolean).length);
        draw();
      }
      if (alive.every(a => !a)) running = false;
    }
    frameId = requestAnimationFrame(frame);
  }
  frame();
  reset();

  // C-14 dating calculator
  let frac = 25;
  const dateOut = h('div', { class: 'result' });
  const dateCalc = () => {
    const age = 5730 * Math.log2(100 / frac);
    dateOut.innerHTML = `${frac}% of original ¹⁴C → age = t½ · log₂(N₀/N) = <b>${age.toFixed(0)} years</b>`;
  };
  dateCalc();

  const el = h('div', { class: 'cards' },
    card('Radioactive decay — stochastic simulation',
      slider({ label: 't½ (s)', min: 2, max: 30, step: 1, value: tHalf, onInput: v => { tHalf = v; } }),
      button('restart', reset, 'primary'),
      h('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;margin-top:8px' }, gridCanvas, curveCanvas),
      out,
      h('h3', {}, 'Carbon-14 dating (t½ = 5730 y)'),
      slider({ label: '% ¹⁴C remaining', min: 1, max: 100, step: 1, value: frac, onInput: v => { frac = v; dateCalc(); } }),
      dateOut,
    ),
    theory('Nuclear chemistry essentials', `
<h4>Decay modes — what happens to (Z, A)</h4>
<div class="table-scroll"><table><tr><th>mode</th><th>emits</th><th>Z</th><th>A</th><th>when</th></tr>
<tr><td>alpha</td><td>⁴₂He</td><td>−2</td><td>−4</td><td>heavy nuclei (Z &gt; 83)</td></tr>
<tr><td>beta⁻</td><td>e⁻ (n→p)</td><td>+1</td><td>0</td><td>too many neutrons (above belt)</td></tr>
<tr><td>beta⁺ / EC</td><td>e⁺ (p→n)</td><td>−1</td><td>0</td><td>too many protons (below belt)</td></tr>
<tr><td>gamma</td><td>photon</td><td>0</td><td>0</td><td>excited nucleus relaxes</td></tr></table></div>
<ul>
<li>Balance nuclear equations by conserving both A (top) and Z (bottom).</li>
<li>Belt of stability: light nuclei want N ≈ Z; heavy nuclei want N/Z ≈ 1.5. Magic numbers (2, 8, 20, 28, 50, 82, 126) = extra stability.</li>
<li>Decay is first-order: N = N₀e^(−λt), t½ = ln2/λ — independent of temperature, pressure, bonding.</li>
<li>Mass defect → binding energy: E = Δmc². Fe-56 tops the curve; fusion gains below it, fission above.</li>
<li><span class="trap">After n half-lives, fraction left = (½)ⁿ — even for weird n like 2.5 (use 2^−n).</span></li>
</ul>`),
  );
  return {
    el,
    setVisible: v => { visible = v; },
    destroy: () => { if (frameId !== null) cancelAnimationFrame(frameId); },
  };
}

// ================= COORDINATION =================
const METALS = [
  { name: 'Ti³⁺', d: 1 }, { name: 'V³⁺', d: 2 }, { name: 'Cr³⁺', d: 3 },
  { name: 'Mn²⁺', d: 5 }, { name: 'Fe³⁺', d: 5 }, { name: 'Fe²⁺', d: 6 },
  { name: 'Co³⁺', d: 6 }, { name: 'Co²⁺', d: 7 }, { name: 'Ni²⁺', d: 8 },
  { name: 'Cu²⁺', d: 9 }, { name: 'Zn²⁺', d: 10 },
];
const LIGANDS = [
  { name: 'I⁻ (weakest)', f: 0.65 }, { name: 'Br⁻', f: 0.72 }, { name: 'Cl⁻', f: 0.80 },
  { name: 'F⁻', f: 0.9 }, { name: 'OH⁻', f: 0.94 }, { name: 'H₂O', f: 1.0 },
  { name: 'NH₃', f: 1.25 }, { name: 'en', f: 1.28 }, { name: 'NO₂⁻', f: 1.4 }, { name: 'CN⁻ (strongest)', f: 1.6 },
];

function makeCoordination(): HTMLElement {
  let metal = METALS[5], ligand = LIGANDS[5], geom: 'oct' | 'tet' = 'oct';
  const canvas = h('canvas', { width: 420, height: 240 });
  const out = h('div', { class: 'result' });
  let lastUnpaired = 0;

  const missions = missionLadder([
    {
      id: 'msn-nuc-01',
      prompt: 'Every complex you can build here is coloured except for one metal ion. Find the ion that cannot absorb visible light by a d–d transition, whatever ligand or geometry you give it.',
      meter: () => ({ label: `${metal.name} is d${metal.d}  ·  looking for a d-count with no possible d–d transition`, pct: metal.d === 10 ? 100 : 0 }),
      check: () => metal.d === 10,
      hints: [
        'A d–d transition needs an electron in a lower orbital AND a vacancy in an upper one. Which d-counts fail one of those two conditions?',
        'The list runs from d¹ to d¹⁰. Look at the end.',
      ],
      explain: 'Zn²⁺ is d¹⁰: every d orbital is full, so there is no vacancy to promote an electron into and no d–d absorption is possible at any Δ. The same holds at the other extreme, d⁰ (Sc³⁺, Ti⁴⁺) — no electron to promote. That is why zinc salts are white and copper salts are blue, and why the intense purple of MnO₄⁻ (a d⁰ ion!) cannot be a d–d band at all: it is a charge-transfer transition, an entirely different mechanism.',
    },
    {
      id: 'msn-nuc-02',
      prompt: 'Now build an octahedral complex of a <b>d⁵</b> ion with just <b>1 unpaired electron</b> — four fewer than the free ion has.',
      meter: () => ({ label: `d${metal.d}, ${lastUnpaired} unpaired  ·  target d⁵ with 1`, pct: metal.d === 5 ? Math.max(0, 100 - Math.abs(lastUnpaired - 1) * 25) : 0 }),
      check: () => metal.d === 5 && lastUnpaired === 1 && geom === 'oct',
      hints: [
        'Two ions in the list are d⁵. Pick either, then work on the ligand.',
        'Five electrons must be squeezed into the three t₂g orbitals, so Δₒ has to beat the pairing energy. Go to the strong-field end of the spectrochemical series.',
      ],
      explain: 'Fe³⁺ or Mn²⁺ with CN⁻ or NO₂⁻ goes low spin: t₂g⁵e_g⁰, one unpaired electron, μ = 1.73 BM instead of the high-spin 5.92 BM. Nothing about the metal changed — same ion, same d-count, same charge — only the ligand field. This is the single most direct evidence that Δₒ is real and that the spectrochemical series orders it: swap the ligand and the magnetic moment of the iron changes by a factor of three. Try Cl⁻ and then CN⁻ on the same ion and watch it switch.',
    },
  ]);

  function fill(): void {
    const d = metal.d;
    // base Δo scaled by ligand; tetrahedral Δt = 4/9 Δo, always high spin
    const delta = 240 * ligand.f * (geom === 'tet' ? 4 / 9 : 1); // arbitrary units
    const strong = geom === 'oct' && ligand.f >= 1.2; // low-spin threshold (illustrative)
    const lowSlots = geom === 'oct' ? 3 : 2;  // t2g / e
    const highSlots = geom === 'oct' ? 2 : 3; // eg / t2
    let lower = 0, upper = 0;
    if (strong) {
      lower = Math.min(d, lowSlots * 2);
      upper = d - lower;
    } else {
      // high spin: singly fill all 5, then pair starting from lower
      const singleLower = Math.min(d, lowSlots);
      const singleUpper = Math.min(Math.max(0, d - lowSlots), highSlots);
      const rem = Math.max(0, d - 5);
      const pairLower = Math.min(rem, lowSlots);
      const pairUpper = Math.max(0, rem - lowSlots);
      lower = singleLower + pairLower;
      upper = singleUpper + pairUpper;
    }
    const unpaired = countUnpaired(lower, lowSlots) + countUnpaired(upper, highSlots);
    lastUnpaired = unpaired;
    const mu = Math.sqrt(unpaired * (unpaired + 2));
    const cfseLow = geom === 'oct' ? -0.4 : -0.6;
    const cfseHigh = geom === 'oct' ? 0.6 : 0.4;
    const cfse = lower * cfseLow + upper * cfseHigh;

    // draw
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 420, 240);
    const yLow = 180, yHigh = 180 - delta * 0.45;
    const drawSet = (y: number, slots: number, e: number, label: string) => {
      const x0 = 120 - slots * 22;
      const inOrb = new Array(slots).fill(0);
      let rem2 = e;
      for (let o = 0; o < slots && rem2 > 0; o++) { inOrb[o] = 1; rem2--; }
      for (let o = 0; o < slots && rem2 > 0; o++) { inOrb[o] = 2; rem2--; }
      for (let o = 0; o < slots; o++) {
        const x = x0 + o * 46;
        ctx.strokeStyle = '#6fc3ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 34, y); ctx.stroke();
        ctx.fillStyle = '#e8e8e8'; ctx.font = '13px monospace';
        if (inOrb[o] >= 1) ctx.fillText('↑', x + 6, y - 3);
        if (inOrb[o] === 2) ctx.fillText('↓', x + 19, y - 3);
      }
      ctx.fillStyle = '#7d8fa3'; ctx.font = '11px monospace';
      ctx.fillText(label, x0 + slots * 46 + 8, y + 4);
    };
    drawSet(yLow, lowSlots, lower, geom === 'oct' ? 't₂g' : 'e');
    drawSet(yHigh, highSlots, upper, geom === 'oct' ? 'eg' : 't₂');
    ctx.strokeStyle = '#5a6a7d'; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(330, yLow); ctx.lineTo(330, yHigh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#ffe27a';
    ctx.fillText(geom === 'oct' ? 'Δo' : 'Δt', 337, (yLow + yHigh) / 2);

    // color estimate from Δo (only meaningful for octahedral aqua-like)
    const lambdaAbs = 620 / ligand.f; // nm, illustrative
    const shown = complement(lambdaAbs);
    out.innerHTML =
      `<b>${metal.name}</b> (d${metal.d}) + ${ligand.name}, ${geom === 'oct' ? 'octahedral' : 'tetrahedral'} → ` +
      `<b>${strong ? 'low spin' : 'high spin'}</b>${geom === 'tet' ? ' (tetrahedral is virtually always high spin: Δt = 4/9 Δo)' : ''}<br>` +
      `unpaired e⁻ = <b>${unpaired}</b> → ${unpaired ? `paramagnetic, μ = √(n(n+2)) = ${mu.toFixed(2)} BM` : 'diamagnetic'}<br>` +
      `CFSE = ${cfse.toFixed(1)} Δ${geom === 'oct' ? 'o' : 't'}<br>` +
      `absorbs ≈ ${lambdaAbs.toFixed(0)} nm → solution looks <span class="swatch" style="background:${shown.css}"></span> ${shown.name}` +
      `<br><span class="muted">Stronger ligand → bigger Δ → absorbs bluer light → complex looks more yellow/orange. d⁰ and d¹⁰ (${metal.d === 0 || metal.d === 10 ? 'like this one! ' : ''}Sc³⁺, Zn²⁺) are colorless — no d–d transition possible.</span>`;
    missions.tick();
  }
  const countUnpaired = (e: number, slots: number) => e <= slots ? e : 2 * slots - e;
  const complement = (nm: number): { name: string; css: string } => {
    if (nm < 430) return { name: 'yellow-green', css: '#aacc44' };
    if (nm < 490) return { name: 'orange/yellow', css: '#e8a03c' };
    if (nm < 560) return { name: 'red/purple', css: '#c04488' };
    if (nm < 590) return { name: 'violet', css: '#7744cc' };
    if (nm < 630) return { name: 'blue', css: '#3366dd' };
    return { name: 'green/blue-green', css: '#33aa88' };
  };

  const el = h('div', { class: 'cards' },
    cardWithMissions('Crystal field explorer', missions,
      select('metal ion', METALS.map(m => ({ value: m.name, label: `${m.name} (d${m.d})` })), v => { metal = METALS.find(m => m.name === v)!; fill(); }, metal.name),
      select('ligand', LIGANDS.map(l => ({ value: l.name, label: l.name })), v => { ligand = LIGANDS.find(l => l.name === v)!; fill(); }, ligand.name),
      select('geometry', [{ value: 'oct', label: 'octahedral (ML₆)' }, { value: 'tet', label: 'tetrahedral (ML₄)' }], v => { geom = v as 'oct' | 'tet'; fill(); }, 'oct'),
      canvas, out,
    ),
    theory('Coordination chemistry essentials', `
<ul>
<li>Coordination number & geometry: 6 → octahedral, 4 → tetrahedral or square planar (d⁸: Ni²⁺/Pd²⁺/Pt²⁺ with strong ligands), 2 → linear (Ag⁺).</li>
<li>Ligand denticity: en, ox²⁻ bidentate; EDTA hexadentate. <b>Chelate effect</b>: polydentate binding is entropy-favored (more free particles released).</li>
<li>Spectrochemical series: I⁻ &lt; Br⁻ &lt; Cl⁻ &lt; F⁻ &lt; OH⁻ &lt; H₂O &lt; NH₃ &lt; en &lt; NO₂⁻ &lt; CN⁻ ≈ CO.</li>
</ul>
<h4>Crystal-field splitting</h4>
<span class="eq">LFSE(oct) = (−0.4·n(t₂g) + 0.6·n(e_g))Δ₀ &nbsp;·&nbsp; low spin only when Δ₀ &gt; pairing energy</span>
<ul>
<li>t₂g (d<sub>xy</sub>, d<sub>xz</sub>, d<sub>yz</sub>) drops 0.4Δ₀; e_g (d<sub>z²</sub>, d<sub>x²−y²</sub>) rises 0.6Δ₀ — e_g points straight AT the ligands, which is why it costs more.</li>
<li>Low spin happens only for d⁴–d⁷ octahedral with strong-field ligands.</li>
</ul>
<h4>Isomerism and naming</h4>
<ul>
<li>Isomers: ionization ([CoBr(NH₃)₅]SO₄ vs [CoSO₄(NH₃)₅]Br), linkage (NO₂⁻ vs ONO⁻), cis/trans, fac/mer, and optical (Δ/Λ for tris-chelates).</li>
<li>Naming: ligands alphabetically, metal oxidation state in Roman numerals; -ate suffix if the complex is an anion (ferrate, cuprate).</li>
</ul>`),
  );
  fill();
  return el;
}

// ================= DESCRIPTIVE =================
function makeDescriptive(): HTMLElement {
  return h('div', { class: 'cards' },
    card('Flame tests & ion colors',
      h('table', { class: 'ref-table', html: `
<tr><th>species</th><th>color</th><th>species</th><th>color</th></tr>
<tr><td>Li⁺ flame</td><td>crimson</td><td>Cu²⁺(aq)</td><td>blue</td></tr>
<tr><td>Na⁺ flame</td><td>yellow-orange</td><td>Ni²⁺(aq)</td><td>green</td></tr>
<tr><td>K⁺ flame</td><td>lilac</td><td>Fe²⁺(aq)</td><td>pale green</td></tr>
<tr><td>Ca²⁺ flame</td><td>brick red</td><td>Fe³⁺(aq)</td><td>yellow-brown</td></tr>
<tr><td>Sr²⁺ flame</td><td>red</td><td>Cr₂O₇²⁻</td><td>orange</td></tr>
<tr><td>Ba²⁺ flame</td><td>apple green</td><td>CrO₄²⁻</td><td>yellow</td></tr>
<tr><td>Cu²⁺ flame</td><td>blue-green</td><td>MnO₄⁻</td><td>deep purple</td></tr>
<tr><td>I₂ in hexane</td><td>purple</td><td>Co²⁺(aq)</td><td>pink</td></tr>` }),
    ),
    card('Gas & ion identification tests',
      h('ul', {},
        h('li', { html: '<b>H₂</b>: squeaky pop with lit splint. <b>O₂</b>: relights glowing splint. <b>CO₂</b>: turns limewater milky.' }),
        h('li', { html: '<b>NH₃</b>: turns damp red litmus blue; white smoke with HCl.' }),
        h('li', { html: '<b>Cl⁻/Br⁻/I⁻</b> + AgNO₃: white/cream/yellow precipitate; AgCl dissolves in dilute NH₃.' }),
        h('li', { html: '<b>SO₄²⁻</b> + Ba²⁺: white precipitate insoluble in acid. <b>CO₃²⁻</b>: fizzes with acid.' }),
        h('li', { html: '<b>NH₄⁺</b>: warm with NaOH → ammonia smell. <b>Fe³⁺</b> + SCN⁻: blood red.' }),
        h('li', { html: '<b>Starch + I₂</b>: blue-black (iodometry endpoint).' }),
      ),
    ),
    card('Periodic patterns worth memorizing',
      h('ul', {},
        h('li', { html: 'Diagonal relationships: Li~Mg, Be~Al, B~Si.' }),
        h('li', { html: 'Amphoteric oxides/hydroxides: Al₂O₃, ZnO, BeO, PbO, SnO — dissolve in both acid and base.' }),
        h('li', { html: 'Oxide acidity: metal oxides basic → metalloid amphoteric → nonmetal oxides acidic (SO₃ + H₂O → H₂SO₄).' }),
        h('li', { html: 'Group 1/2 reactivity with water increases DOWN the group; halogen oxidizing power decreases down (Cl₂ displaces Br⁻ and I⁻).' }),
        h('li', { html: 'Common disproportionations: Cl₂ + OH⁻ → Cl⁻ + ClO⁻; Cu⁺ → Cu + Cu²⁺; H₂O₂ → H₂O + O₂.' }),
        h('li', { html: 'Thermal decomposition: carbonates → oxide + CO₂ (easier down = harder; small cations polarize more); nitrates of heavy metals → NO₂ + O₂.' }),
      ),
    ),
  );
}

export const nuclearTab: TabDef = {
  id: 'nuclear',
  mount(root): TabHandle {
    const nuc = makeNuclear();
    root.append(topicPage('nuclear', {
      sims: [pills([
        { label: 'Nuclear', el: nuc.el },
        { label: 'Coordination', el: makeCoordination() },
        { label: 'Descriptive', el: makeDescriptive() },
      ])],
      quiz: quiz(NUCLEAR_QUIZ, 5),
      // One theory block per panel, beside the tool it explains.
      theory: [],
    }));
    // pills swap DOM but the rAF loop lives on; gate on tab visibility
    return {
      onShow() { nuc.setVisible(true); },
      onHide() { nuc.setVisible(false); },
      onDestroy() { nuc.destroy(); },
    };
  },
};
