// Advanced (CCO) — Advanced thermo/kinetics + biochemistry.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, plot, linspace, pills, quiz, type TabDef } from './framework';
import { topicPage } from './page';
import { BIOPHYS_QUIZ } from './questions4';

// ================= ENZYME KINETICS =================
function makeMM(): HTMLElement {
  let Vmax = 100, Km = 2.0, inhib: 'none' | 'comp' | 'noncomp' = 'none', I = 2;
  const mmCanvas = h('canvas', { width: 460, height: 240 });
  const lbCanvas = h('canvas', { width: 460, height: 240 });
  const out = h('div', { class: 'result' });
  function draw(): void {
    // competitive: Km' = Km(1+[I]/Ki); noncompetitive: Vmax' = Vmax/(1+[I]/Ki)
    const Ki = 2;
    const factor = 1 + (inhib === 'none' ? 0 : I / Ki);
    const KmApp = inhib === 'comp' ? Km * factor : Km;
    const VmaxApp = inhib === 'noncomp' ? Vmax / factor : Vmax;
    const S = linspace(0.01, 20, 300);
    const v = S.map(s => (VmaxApp * s) / (KmApp + s));
    plot(mmCanvas, [{ xs: S, ys: v, color: '#e8590c', label: 'v' },
      { xs: [0, 20], ys: [VmaxApp, VmaxApp], color: '#7c8798', dash: [4, 4] }],
      { xLabel: '[S]', yLabel: 'rate v', yMin: 0, yMax: Vmax * 1.05,
        markers: [{ x: KmApp, y: VmaxApp / 2, label: `Km=${KmApp.toFixed(1)}, v=Vmax/2` }] });
    // Lineweaver-Burk
    const inv = linspace(-1 / KmApp, 2, 120).filter(x => Math.abs(x) > 1e-6);
    plot(lbCanvas, [{ xs: inv, ys: inv.map(x => (KmApp / VmaxApp) * x + 1 / VmaxApp), color: '#e8590c', label: '1/v vs 1/[S]' },
      { xs: [-2, 2], ys: [0, 0], color: '#7c8798', dash: [3, 3] },
      { xs: [0, 0], ys: [-0.05, 0.06], color: '#7c8798', dash: [3, 3] }],
      { xLabel: '1/[S]', yLabel: '1/v' });
    out.innerHTML =
      `Michaelis–Menten: v = V_max[S]/(K_M+[S]). At [S]=K_M, v = V_max/2.<br>` +
      (inhib === 'comp' ? `<b>Competitive inhibitor:</b> apparent K_M rises to ${KmApp.toFixed(1)} (weaker apparent binding); V_max unchanged — beatable with more substrate.`
        : inhib === 'noncomp' ? `<b>Non-competitive inhibitor:</b> V_max falls to ${VmaxApp.toFixed(0)}; K_M unchanged — cannot be overcome by adding substrate.`
          : `<b>No inhibitor.</b> Lineweaver–Burk: slope K_M/V_max, y-int 1/V_max, x-int −1/K_M.`) +
      `<br><span class="muted">Catalytic efficiency k_cat/K_M rates the enzyme; ~10⁸–10⁹ M⁻¹s⁻¹ is diffusion-limited ("catalytically perfect").</span>`;
    missions.tick();
  }
  // The card's own inhibition model, read back for the missions: Ki is fixed at
  // 2, competitive inhibition raises apparent K_M by (1 + [I]/Ki).
  const kmApparent = (): number => (inhib === 'comp' ? Km * (1 + I / 2) : Km);

  const missions = missionLadder([
    {
      id: 'msn-biophys-01',
      prompt: 'Leave K_M at its opening value of <b>2.0</b> and use an inhibitor to push the <b>apparent</b> K_M to 6.0 or above — without moving V_max at all.',
      meter: () => ({
        label: inhib === 'comp'
          ? `apparent K_M = ${kmApparent().toFixed(1)} · target ≥ 6.0 (K_M itself must stay 2.0)`
          : 'no competitive inhibitor selected',
        pct: inhib === 'comp' && Math.abs(Km - 2) < 0.05 ? Math.min(100, (kmApparent() / 6) * 100) : 0,
      }),
      check: () => inhib === 'comp' && Math.abs(Km - 2) < 0.05 && kmApparent() >= 6,
      hints: [
        'Only one of the two inhibitor types leaves V_max where it is. Which curve still reaches the same plateau, just later?',
        'Competitive inhibition scales K_M by (1 + [I]/K_i), and K_i here is 2 — so [I] = 4 gives a factor of 3, taking the apparent K_M to exactly 6.0.',
      ],
      explain: 'A competitive inhibitor binds the <b>active site</b>, so it competes with substrate: at any fixed [S] less enzyme is available, but flooding the enzyme with substrate still wins in the end — V_max is untouched and only the apparent K_M rises, by (1 + [I]/K_i). On the Lineweaver–Burk plot that is the signature: the lines share a y-intercept (1/V_max) and fan out in slope. <span class="trap">"K_M went up" does not mean the enzyme changed; K_M is a property of the enzyme–substrate pair, and what the inhibitor moves is the <em>apparent</em> value.</span>',
    },
    {
      id: 'msn-biophys-02',
      prompt: 'A drug slows an enzyme, and adding far more substrate does not restore the original maximum rate. Which kind of inhibition is that?',
      choices: [
        { label: 'Competitive', value: 'comp' },
        { label: 'Non-competitive', value: 'noncomp' },
        { label: 'Either — more substrate always wins', value: 'either' },
      ],
      validateChoice: v => v === 'noncomp',
      hints: ['Switch the card between the two inhibitor types and watch which one moves the dashed V_max line.'],
      explain: 'Non-competitive. The inhibitor binds somewhere other than the active site, so substrate cannot displace it: every enzyme molecule it touches is out of service whatever [S] is, and V_max falls to V_max/(1 + [I]/K_i) while K_M stays put. On the Lineweaver–Burk plot the lines then share an <em>x</em>-intercept (−1/K_M) and differ in y-intercept — the mirror image of the competitive case you just built.',
    },
  ]);

  const el = cardWithMissions('Enzyme kinetics — Michaelis–Menten & Lineweaver–Burk', missions,
    slider({ label: 'V_max', min: 20, max: 200, step: 5, value: Vmax, onInput: v => { Vmax = v; draw(); } }),
    slider({ label: 'K_M', min: 0.3, max: 8, step: 0.1, value: Km, fmt: v => v.toFixed(1), onInput: v => { Km = v; draw(); } }),
    select('inhibitor', [{ value: 'none', label: 'none' }, { value: 'comp', label: 'competitive' }, { value: 'noncomp', label: 'non-competitive' }], v => { inhib = v as typeof inhib; draw(); }, 'none'),
    slider({ label: '[I] (if any)', min: 0, max: 10, step: 0.5, value: I, fmt: v => v.toFixed(1), onInput: v => { I = v; draw(); } }),
    mmCanvas, lbCanvas, out,
  );
  draw();
  return el;
}

// ================= EYRING / TST =================
function makeEyring(): HTMLElement {
  let dH = 60, dS = -20; // kJ/mol, J/mol/K
  const canvas = h('canvas', { width: 460, height: 240 });
  const out = h('div', { class: 'result' });
  const kB = 1.381e-23, hP = 6.626e-34, R = 8.314;
  function draw(): void {
    const Ts = linspace(280, 400, 120);
    // Eyring: k = (kB T/h) exp(-dH‡/RT) exp(dS‡/R)
    const ks = Ts.map(T => (kB * T / hP) * Math.exp(-dH * 1000 / (R * T)) * Math.exp(dS / R));
    // Eyring plot: ln(k/T) vs 1/T is linear, slope -dH‡/R
    const xs = Ts.map(T => 1 / T);
    const ys = Ts.map((T, i) => Math.log(ks[i] / T));
    plot(canvas, [{ xs, ys, color: '#e8590c', label: 'ln(k/T) vs 1/T' }],
      { xLabel: '1/T (K⁻¹)', yLabel: 'ln(k/T)' });
    const k298 = (kB * 298 / hP) * Math.exp(-dH * 1000 / (R * 298)) * Math.exp(dS / R);
    const dG = dH - 298 * dS / 1000;
    out.innerHTML =
      `<span class="eq">k = (k_B T/h)·e^(−ΔH‡/RT)·e^(ΔS‡/R) &nbsp; ΔG‡ = ΔH‡ − TΔS‡</span>` +
      `At 298 K: ΔG‡ = ${dG.toFixed(1)} kJ/mol → k ≈ <b class="big">${k298.toExponential(2)} s⁻¹</b><br>` +
      `Eyring plot ln(k/T) vs 1/T: slope = −ΔH‡/R, intercept gives ΔS‡. ` +
      (dS < -10 ? '<b>ΔS‡ &lt; 0</b> → an ordered, associative transition state (bimolecular).'
        : dS > 10 ? '<b>ΔS‡ &gt; 0</b> → a looser, dissociative transition state.'
          : 'ΔS‡ ≈ 0 → little ordering change.') +
      `<br><span class="muted">Arrhenius lumps everything into A and Eₐ; Eyring/transition-state theory separates the enthalpy and entropy of activation.</span>`;
  }
  const el = card('Transition-state theory (Eyring)',
    slider({ label: 'ΔH‡ (kJ/mol)', min: 20, max: 150, step: 1, value: dH, onInput: v => { dH = v; draw(); } }),
    slider({ label: 'ΔS‡ (J/mol·K)', min: -120, max: 80, step: 2, value: dS, onInput: v => { dS = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ================= BOLTZMANN =================
function makeBoltzmann(): HTMLElement {
  let dE = 5, T = 298; // kJ/mol, K
  const out = h('div', { class: 'result' });
  const canvas = h('canvas', { width: 460, height: 220 });
  const R = 8.314;
  function draw(): void {
    const Ts = linspace(50, 1500, 200);
    const ratio = Ts.map(t => Math.exp(-dE * 1000 / (R * t)));
    plot(canvas, [{ xs: Ts, ys: ratio, color: '#e8590c', label: 'N_upper/N_lower' }],
      { xLabel: 'T (K)', yLabel: 'population ratio', yMin: 0, yMax: 1 });
    const r = Math.exp(-dE * 1000 / (R * T));
    out.innerHTML =
      `<span class="eq">N₂/N₁ = (g₂/g₁)·e^(−ΔE/RT)</span>` +
      `At ΔE = ${dE} kJ/mol and T = ${T} K: N_upper/N_lower = <b class="big">${r.toExponential(2)}</b> (g₁=g₂ assumed)<br>` +
      `<span class="muted">This distribution underlies reaction rates (fraction above Eₐ), spectroscopic intensities, and heat capacities. As T→∞ the ratio → 1 (levels equally populated).</span>`;
  }
  const el = card('Boltzmann distribution — populating energy levels',
    slider({ label: 'ΔE (kJ/mol)', min: 1, max: 40, step: 1, value: dE, onInput: v => { dE = v; draw(); } }),
    slider({ label: 'T (K)', min: 100, max: 1200, step: 10, value: T, onInput: v => { T = v; draw(); } }),
    canvas, out,
  );
  draw();
  return el;
}

// ================= BIOCHEMISTRY =================
function makeBiochem(): HTMLElement {
  return h('div', { class: 'cards' },
    card('Amino acids, proteins & nucleic acids',
      h('h3', {}, 'Amino acids'),
      h('ul', {},
        h('li', { html: '20 α-amino acids; at physiological pH exist as <b>zwitterions</b> (NH₃⁺/COO⁻).' }),
        h('li', { html: 'Isoelectric point pI = ½(pKa1+pKa2) for neutral side chains; net charge zero at pI.' }),
        h('li', { html: 'Side chains: nonpolar, polar, acidic (Asp/Glu), basic (Lys/Arg/His) — govern folding and catalysis.' }),
      ),
      h('h3', {}, 'Protein structure'),
      h('ul', {},
        h('li', { html: '1° = sequence · 2° = α-helix/β-sheet (backbone H-bonds) · 3° = full fold · 4° = subunits.' }),
        h('li', { html: 'The peptide bond is planar and rigid (~40% double-bond character from resonance).' }),
        h('li', { html: 'Denaturation disrupts non-covalent interactions; the sequence is unchanged.' }),
      ),
      h('h3', {}, 'Nucleic acids'),
      h('ul', {},
        h('li', { html: 'A–T (2 H-bonds), G–C (3 H-bonds); antiparallel double helix. RNA uses uracil, ribose.' }),
      ),
    ),
    card('Bioenergetics & metabolism',
      h('ul', {},
        h('li', { html: '<b>ATP</b> hydrolysis ΔG°′ ≈ −31 kJ/mol; couples to drive endergonic steps (free energies add).' }),
        h('li', { html: 'Electron transport: NADH→O₂, E°′ ≈ +1.14 V, ΔG = −nFE°′ ≪ 0 — powers chemiosmotic ATP synthesis.' }),
        h('li', { html: 'Glucose (aldohexose) cyclizes to a pyranose <b>hemiacetal</b>; α/β anomers interconvert (mutarotation).' }),
        h('li', { html: 'Rate-limiting enzymes are allosterically feedback-inhibited by downstream products.' }),
        h('li', { html: 'Enzymes lower Eₐ (stabilize the TS) but never change K or ΔG° — catalysts, not thermodynamic levers.' }),
      ),
      h('h3', {}, 'Michaelis–Menten summary'),
      h('p', { html: 'v = V_max[S]/(K_M+[S]); K_M = [S] at ½V_max; k_cat/K_M measures catalytic efficiency. Competitive inhibitors raise apparent K_M; non-competitive lower V_max.' }),
    ),
  );
}

export const biophysTab: TabDef = {
  id: 'biophys',
  mount(root) {
    root.append(topicPage('biophys', {
      sims: [pills([
        { label: 'Enzyme kinetics', el: h('div', { class: 'cards' }, makeMM()) },
        { label: 'Eyring (TST)', el: h('div', { class: 'cards' }, makeEyring()) },
        { label: 'Boltzmann', el: h('div', { class: 'cards' }, makeBoltzmann()) },
        { label: 'Biochemistry', el: makeBiochem() },
      ])],
      quiz: quiz(BIOPHYS_QUIZ, 5),
      theory: theory('Theory — advanced thermo/kinetics & biochemistry (CCO PS4)', `
<h3>Advanced kinetics</h3>
<ul>
<li><b>Steady-state approximation:</b> d[intermediate]/dt ≈ 0 → eliminate intermediates from the rate law (basis of Michaelis–Menten).</li>
<li><b>Lindemann:</b> "unimolecular" gas reactions are 2nd order at low P (activation-limited), 1st order at high P.</li>
<li><b>Transition-state theory (Eyring):</b> k = (k_B T/h)e^(−ΔG‡/RT); ΔS‡ &lt; 0 signals an ordered/associative TS.</li>
<li>Chain reactions (initiation/propagation/termination); catalysis lowers Eₐ for both directions equally.</li>
</ul>
<h3>Statistical / advanced thermo</h3>
<span class="eq">N₂/N₁ = (g₂/g₁)e^(−ΔE/RT) &nbsp;·&nbsp; ΔG = ΔG° + RT ln Q</span>
<ul>
<li>Boltzmann populations feed rates, spectroscopic intensities and heat capacities.</li>
<li>Chemical potential μ and activities generalize "concentration"; coupling adds free energies.</li>
</ul>
<h3>Biochemistry</h3>
<ul>
<li>Amino-acid zwitterions and pI; protein 1°–4° structure; peptide-bond planarity; denaturation.</li>
<li>Enzyme kinetics (Michaelis–Menten, inhibitor types, k_cat/K_M); allosteric feedback regulation.</li>
<li>Bioenergetics: ATP coupling, redox chain E°′, sugar hemiacetals/mutarotation. Enzymes never shift equilibrium.</li>
</ul>`),
    }));
  },
};
