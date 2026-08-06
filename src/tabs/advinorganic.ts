// Advanced (CCO) — Coordination/CFT + solid-state + descriptive inorganic.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, pills, quiz, type TabDef } from './framework';
import { topicPage } from './page';
import { INORGANIC_QUIZ } from './questions4';

// ================= LFSE / CFT =================
function makeLFSE(): HTMLElement {
  let d = 6, strong = false, geom: 'oct' | 'tet' = 'oct';
  const out = h('div', { class: 'result' });
  // calc() is the only writer; the missions read it rather than re-deriving the
  // fill rules, so a change to the model can never disagree with the goals.
  let lastLfse = 0;

  const missions = missionLadder([
    {
      id: 'msn-ain-01',
      prompt: 'Find the one setting of the three controls that drives the LFSE to its most negative possible value, <b>−2.4 Δₒ</b>.',
      meter: () => ({ label: `LFSE = ${lastLfse.toFixed(1)} Δ  ·  target −2.4 Δₒ`, pct: Math.min(100, (Math.abs(lastLfse) / 2.4) * 100) }),
      check: () => geom === 'oct' && Math.abs(lastLfse + 2.4) < 1e-9,
      hints: [
        'Only the octahedral case can be low spin, and only a low-spin arrangement keeps electrons out of the destabilised e_g set.',
        'You want every electron in t₂g and none in e_g. How many electrons does t₂g hold?',
      ],
      explain: 'Low-spin d⁶ is t₂g⁶e_g⁰ — six electrons, each stabilised by 0.4 Δₒ, and nothing in the upper set: 6(−0.4) = −2.4 Δₒ. This is the deepest ligand-field well available to a first-row metal, and it is why low-spin d⁶ ions such as Co(III) and Fe(II)-with-cyanide are both thermodynamically stable and kinetically inert.',
    },
    {
      id: 'msn-ain-02',
      prompt: 'Now sweep the d-electron slider with the field switch set to <b>strong</b>, then back to <b>weak</b>. For several d-counts the readout does not change at all. Which counts have a genuinely different low-spin option?',
      choices: [
        { label: 'd¹–d³ only', value: 'low' },
        { label: 'd⁴–d⁷ only', value: 'mid' },
        { label: 'd⁸–d¹⁰ only', value: 'high' },
        { label: 'every d-count from d¹ to d⁹', value: 'all' },
      ],
      validateChoice: v => v === 'mid',
      explain: 'Below d⁴ there is nothing to decide: the first three electrons go into three separate t₂g orbitals whatever the field strength. From d⁸ up, t₂g is full and the remaining electrons have nowhere but e_g. Only d⁴–d⁷ face a real choice — pair up in t₂g, or climb to e_g — so only there does the ligand field get to pick, and only there do high- and low-spin differ in LFSE, magnetic moment and colour.',
      hints: ['Try d³ and d⁸ first, and watch whether the configuration line moves when you flip the switch.'],
    },
  ]);

  function calc(): void {
    // octahedral: t2g (−0.4), eg (+0.6); tetrahedral: e (−0.6), t2 (+0.4)
    const lowCap = geom === 'oct' ? 6 : 4;   // t2g holds 6, e holds 4
    const lowStab = geom === 'oct' ? -0.4 : -0.6;
    const highStab = geom === 'oct' ? 0.6 : 0.4;
    const lowSlots = geom === 'oct' ? 3 : 2;
    const highSlots = geom === 'oct' ? 2 : 3;
    let low: number, high: number;
    const lowSpin = strong && geom === 'oct';
    if (lowSpin) { low = Math.min(d, lowCap); high = d - low; }
    else {
      // high spin: singly fill all 5 first, then pair from the lower set
      const singleLow = Math.min(d, lowSlots);
      const singleHigh = Math.min(Math.max(0, d - lowSlots), highSlots);
      const rem = Math.max(0, d - 5);
      const pairLow = Math.min(rem, lowSlots);
      const pairHigh = Math.max(0, rem - lowSlots);
      low = singleLow + pairLow; high = singleHigh + pairHigh;
    }
    const lfse = low * lowStab + high * highStab;
    lastLfse = lfse;
    const unpaired = countUnpaired(low, lowSlots) + countUnpaired(high, highSlots);
    const mu = Math.sqrt(unpaired * (unpaired + 2));
    out.innerHTML =
      `Config: ${geom === 'oct' ? 't₂g' : 'e'}<sup>${low}</sup>${geom === 'oct' ? 'e_g' : 't₂'}<sup>${high}</sup> · ` +
      `<b>${lowSpin ? 'low spin' : 'high spin'}</b>${geom === 'tet' ? ' (tetrahedral is essentially always high spin: Δ_t ≈ 4/9 Δ_o)' : ''}<br>` +
      `LFSE = ${low}(${lowStab}) + ${high}(+${highStab}) = <b class="big">${lfse.toFixed(1)} Δ${geom === 'oct' ? 'o' : 't'}</b><br>` +
      `unpaired e⁻ = <b>${unpaired}</b> → μ = √(n(n+2)) = <b>${mu.toFixed(2)} BM</b> (${unpaired ? 'paramagnetic' : 'diamagnetic'})`;
    missions.tick();
  }
  const countUnpaired = (e: number, slots: number) => (e <= slots ? e : 2 * slots - e);
  const el = cardWithMissions('Ligand-field stabilization energy (LFSE)', missions,
    slider({ label: 'd electrons', min: 0, max: 10, step: 1, value: d, onInput: v => { d = v; calc(); } }),
    select('field strength', [{ value: 'weak', label: 'weak field (high spin)' }, { value: 'strong', label: 'strong field (low spin, oct only)' }], v => { strong = v === 'strong'; calc(); }, 'weak'),
    select('geometry', [{ value: 'oct', label: 'octahedral' }, { value: 'tet', label: 'tetrahedral' }], v => { geom = v as 'oct' | 'tet'; calc(); }, 'oct'),
    out,
    h('p', { class: 'muted' }, 'LFSE peaks at d³ and d⁸ (weak field) and at d⁶ low-spin (−2.4 Δₒ). It underlies hydration-enthalpy double-humps and spinel site preferences.'),
  );
  calc();
  return el;
}

// ================= SOLID STATE =================
const CELLS = {
  sc: { name: 'Simple cubic', Z: 1, rel: '2r = a', pack: 52, cn: 6 },
  bcc: { name: 'Body-centred cubic', Z: 2, rel: '4r = a√3', pack: 68, cn: 8 },
  fcc: { name: 'Face-centred cubic', Z: 4, rel: '4r = a√2', pack: 74, cn: 12 },
};
function makeSolidState(): HTMLElement {
  let cell: keyof typeof CELLS = 'fcc', a = 361, M = 63.55; // pm, g/mol (Cu)
  const out = h('div', { class: 'result' });
  let lastDensity = 0;

  // The card opens on copper (FCC, 361 pm, 63.55) and already reproduces
  // copper's density, so a "build copper" mission would be solved before the
  // student touched anything. Tungsten needs all three controls moved.
  const missions = missionLadder([
    {
      id: 'msn-ain-03',
      prompt: 'Tungsten has M = 183.8 g/mol, a body-centred cubic lattice with a = 316.5 pm, and a measured density of <b>19.25 g/cm³</b>. Set the controls to reproduce it (within 0.3).',
      meter: () => ({
        label: cell === 'bcc' ? `ρ = ${lastDensity.toFixed(2)} g/cm³  ·  target 19.25` : `lattice is ${CELLS[cell].name} — tungsten is body-centred cubic`,
        pct: cell === 'bcc' ? Math.max(0, 100 - Math.abs(lastDensity - 19.25) * 12) : 0,
      }),
      check: () => cell === 'bcc' && M > 180 && M < 188 && Math.abs(lastDensity - 19.25) < 0.3,
      hints: [
        'Three controls, three given numbers. Start with the lattice type — it fixes Z, and Z multiplies the whole density.',
        'The edge slider steps in whole pm, so 316 or 317 is as close as you can get to 316.5. Either lands inside the tolerance.',
      ],
      explain: 'ρ = ZM/(N_A a³) with Z = 2 for BCC: (2 × 183.8)/(6.022×10²³ × (3.165×10⁻⁸)³) = 19.25 g/cm³ ✓. Now switch the lattice to FCC and watch the density leap to ~38 g/cm³ — denser than any element that exists. Z is the whole difference, so assuming the wrong lattice does not give a slightly wrong answer, it gives one off by a factor of two. Getting Z right is the entire skill in a unit-cell calculation.',
    },
  ]);

  function calc(): void {
    const c = CELLS[cell];
    const aCm = a * 1e-10; // pm → cm
    const vol = Math.pow(aCm, 3);
    const density = (c.Z * M) / (6.022e23 * vol);
    lastDensity = density;
    // radius from edge
    const r = cell === 'sc' ? a / 2 : cell === 'bcc' ? (a * Math.sqrt(3)) / 4 : (a * Math.sqrt(2)) / 4;
    out.innerHTML =
      `<b>${c.name}</b>: Z = ${c.Z} atoms/cell · coordination number ${c.cn} · packing ${c.pack}%<br>` +
      `atom radius from ${c.rel}: r = <b>${r.toFixed(1)} pm</b><br>` +
      `density ρ = ZM/(N_A·a³) = <b class="big">${density.toFixed(2)} g/cm³</b><br>` +
      `<span class="muted">FCC and HCP both reach the 74% closest-packing limit. Compute Z from corner(⅛)/face(½)/edge(¼)/body(1) sharing.</span>`;
    missions.tick();
  }
  const el = cardWithMissions('Unit cell — density, radius, packing', missions,
    select('lattice', Object.entries(CELLS).map(([k, v]) => ({ value: k, label: v.name })), v => { cell = v as keyof typeof CELLS; calc(); }, cell),
    slider({ label: 'edge a (pm)', min: 200, max: 600, step: 1, value: a, onInput: v => { a = v; calc(); } }),
    slider({ label: 'molar mass (g/mol)', min: 1, max: 250, step: 0.5, value: M, fmt: v => v.toFixed(1), onInput: v => { M = v; calc(); } }),
    out,
    h('h3', {}, 'Bragg\'s law & radius ratio'),
    h('p', { html: '<span class="eq" style="font-family:var(--mono)">nλ = 2d sin θ</span> — larger interplanar spacing d ⇒ smaller diffraction angle θ.' }),
    h('table', { class: 'ref-table', html: `
<tr><th>r₊/r₋</th><th>coordination</th><th>geometry</th></tr>
<tr><td>0.155–0.225</td><td>3</td><td>trigonal planar</td></tr>
<tr><td>0.225–0.414</td><td>4</td><td>tetrahedral</td></tr>
<tr><td>0.414–0.732</td><td>6</td><td>octahedral</td></tr>
<tr><td>0.732–1.000</td><td>8</td><td>cubic</td></tr>` }),
  );
  calc();
  return el;
}

// ================= DESCRIPTIVE =================
function makeDescriptive(): HTMLElement {
  return h('div', { class: 'cards' },
    card('Advanced descriptive inorganic',
      h('h3', {}, 'Periodic patterns'),
      h('ul', {},
        h('li', { html: '<b>Amphoterism:</b> Al, Zn, Sn, Pb, Be oxides/hydroxides dissolve in both acid and base ([Al(OH)₄]⁻).' }),
        h('li', { html: '<b>Inert-pair effect:</b> heavy p-block favours the (group−2) oxidation state — Tl⁺, Pb²⁺, Bi³⁺ more stable than the group max.' }),
        h('li', { html: '<b>Diagonal relationships:</b> Li~Mg, Be~Al, B~Si (similar charge/radius ratios).' }),
        h('li', { html: '<b>Lanthanide contraction:</b> poor 4f shielding shrinks radii, making 4d/5d congeners (Zr/Hf) nearly identical in size.' }),
      ),
      h('h3', {}, 'Reactive nonmetal / p-block'),
      h('ul', {},
        h('li', { html: 'Interhalogens (ClF₃, IF₅, ICl) follow VSEPR; larger central halogen bonds more smaller ones.' }),
        h('li', { html: 'Boranes use 3-centre-2-electron bonds (B₂H₆ bridging H); Wade\'s rules count skeletal electron pairs.' }),
        h('li', { html: 'Oxoacid strength rises with terminal oxygens: HClO < HClO₂ < HClO₃ < HClO₄.' }),
        h('li', { html: 'Silicates build from SiO₄ tetrahedra; sharing corners gives chains, sheets (mica), and 3-D frameworks (quartz).' }),
      ),
    ),
    card('HSAB & metal extraction',
      h('ul', {},
        h('li', { html: '<b>Hard–Soft Acid–Base:</b> hard acids (H⁺, Al³⁺, Fe³⁺) bind hard bases (F⁻, O-donors); soft acids (Ag⁺, Hg²⁺, Pt²⁺) bind soft bases (I⁻, S, P, CN⁻).' }),
        h('li', { html: 'Explains ore types: hard Mg/Al as oxides/carbonates; soft Cu/Ag/Hg as sulfides.' }),
        h('li', { html: 'Ellingham diagrams (ΔG° vs T for oxides) show which reductant reduces which oxide, and the crossover temperature.' }),
        h('li', { html: 'Carbon reduces many metal oxides only above the T where the C/CO line drops below the metal-oxide line.' }),
      ),
      h('h3', {}, '18-electron rule'),
      h('p', { html: 'Low-oxidation-state organometallics (metal carbonyls, metallocenes) are most stable at 18 valence electrons — count metal d-electrons + 2 per L donor.' }),
    ),
  );
}

export const advInorganicTab: TabDef = {
  id: 'advinorganic',
  mount(root) {
    root.append(topicPage('advinorganic', {
      sims: [pills([
        { label: 'Crystal field (LFSE)', el: h('div', { class: 'cards' }, makeLFSE()) },
        { label: 'Solid state', el: h('div', { class: 'cards' }, makeSolidState()) },
        { label: 'Descriptive', el: makeDescriptive() },
      ])],
      quiz: quiz(INORGANIC_QUIZ, 5),
      theory: theory('Theory — coordination, solid-state & descriptive (CCO PS3)', `
<h4>Crystal / ligand field</h4>
<span class="eq">LFSE(oct) = (−0.4·n_t₂g + 0.6·n_e_g)Δ_o &nbsp;·&nbsp; Δ_t ≈ (4/9)Δ_o</span>
<ul>
<li>Low spin only for d⁴–d⁷ octahedral strong-field (Δ_o &gt; pairing energy). Tetrahedral ⇒ almost always high spin.</li>
<li>Jahn–Teller distortion for unevenly-filled degenerate sets (high-spin d⁴, d⁹) — Cu²⁺ elongation.</li>
<li>Colour: d–d transitions (weak, Laporte-forbidden) vs charge-transfer (intense — MnO₄⁻, CrO₄²⁻). d⁰ and d¹⁰ are colourless from d–d.</li>
<li>Free-ion ground terms by Hund: d² ³F, d³ ⁴F, d⁵ ⁶S, etc. (max S then max L).</li>
</ul>
<h4>Solid state</h4>
<ul>
<li>Z per cell: SC 1, BCC 2, FCC 4. Packing: SC 52%, BCC 68%, FCC/HCP 74%. ρ = ZM/(N_A a³).</li>
<li>Touching directions: SC edge (2r=a), BCC body diagonal (4r=a√3), FCC face diagonal (4r=a√2).</li>
<li>Bragg nλ = 2d sinθ. Radius ratio sets the coordination number and structure type (NaCl vs CsCl vs ZnS).</li>
<li>Defects: Schottky (paired vacancies, lowers ρ), Frenkel (ion to interstitial). Band theory: metal/semiconductor/insulator by gap size.</li>
</ul>
<h4>Descriptive & bonding models</h4>
<ul>
<li>Amphoterism, inert-pair effect, diagonal relationships, lanthanide contraction, HSAB, 18-electron rule, Ellingham diagrams.</li>
</ul>`),
    }));
  },
};
