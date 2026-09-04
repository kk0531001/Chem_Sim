// Quantum mechanics & atomic structure: hydrogen orbital viewer,
// energy levels / spectral series, electron configuration builder.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, plot, quiz, type TabDef, task } from './framework';
import { topicPage } from './page';
import { QUANTUM_QUIZ } from './questions1';


// ---- hydrogen wavefunctions (a0 = 1, unnormalized — shape is what matters) ----
// psi takes the two IN-PLANE coordinates of whichever slice the orbital is
// drawn in (x–z for all but 3d_x²−y², which is degenerate in that slice — see
// its entry below). Values are SIGNED: the viewer colours by sign, so these
// must not be squared.
type OrbitalId = '1s' | '2s' | '2pz' | '2px' | '3s' | '3pz' | '3dz2' | '3dxz' | '3dx2y2';

const ORBITALS: Record<OrbitalId, { n: number; l: number; psi: (a: number, b: number) => number; desc: string; plane?: string }> = {
  '1s':     { n: 1, l: 0, psi: (x, z) => Math.exp(-r(x, z)), desc: 'spherical, no nodes' },
  '2s':     { n: 2, l: 0, psi: (x, z) => (2 - r(x, z)) * Math.exp(-r(x, z) / 2), desc: '1 radial node (sign flips at r = 2a₀)' },
  '2pz':    { n: 2, l: 1, psi: (x, z) => z * Math.exp(-r(x, z) / 2), desc: '1 angular node (xy-plane)' },
  '2px':    { n: 2, l: 1, psi: (x, z) => x * Math.exp(-r(x, z) / 2), desc: 'same shape as 2p𝑧, rotated 90°' },
  '3s':     { n: 3, l: 0, psi: (x, z) => { const rr = r(x, z); return (27 - 18 * rr + 2 * rr * rr) * Math.exp(-rr / 3); }, desc: '2 radial nodes' },
  '3pz':    { n: 3, l: 1, psi: (x, z) => { const rr = r(x, z); return rr === 0 ? 0 : (6 - rr) * z * Math.exp(-rr / 3); }, desc: '1 radial + 1 angular node' },
  '3dz2':   { n: 3, l: 2, psi: (x, z) => (3 * z * z - (x * x + z * z)) * Math.exp(-r(x, z) / 3), desc: 'two lobes + torus; 2 angular (conical) nodes' },
  '3dxz':   { n: 3, l: 2, psi: (x, z) => x * z * Math.exp(-r(x, z) / 3), desc: '4 lobes between axes; 2 angular nodes' },
  // Drawn in the x–y plane, unlike every other orbital here. Its angular part
  // is x²−y², which in the x–z slice (y = 0) collapses to x² — non-negative
  // everywhere, so that slice shows neither of the orbital's nodal planes nor
  // its alternating lobe signs, i.e. exactly the features it exists to teach.
  '3dx2y2': { n: 3, l: 2, plane: 'x–y', psi: (x, y) => (x * x - y * y) * Math.exp(-r(x, y) / 3), desc: '4 lobes ON the axes with alternating sign; 2 angular nodes (the planes x = ±y)' },
};
const r = (x: number, z: number) => Math.hypot(x, z);

function drawOrbital(canvas: HTMLCanvasElement, id: OrbitalId): void {
  const orb = ORBITALS[id];
  const N = canvas.width;
  const extent = orb.n === 1 ? 6 : orb.n === 2 ? 16 : 32; // a0 units, half-width
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(N, N);
  // find max |psi| for normalization
  let maxA = 0;
  const vals = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = ((i / (N - 1)) * 2 - 1) * extent;   // horizontal in-plane axis
      const b = ((j / (N - 1)) * 2 - 1) * extent;   // vertical in-plane axis
      const v = orb.psi(a, b);
      vals[j * N + i] = v;
      maxA = Math.max(maxA, Math.abs(v));
    }
  }
  for (let k = 0; k < N * N; k++) {
    const v = vals[k] / maxA;
    const a = Math.pow(Math.abs(v), 0.6); // gamma boost so faint lobes show
    const o = k * 4;
    if (v >= 0) { img.data[o] = 90; img.data[o + 1] = 170; img.data[o + 2] = 255; }
    else { img.data[o] = 255; img.data[o + 1] = 110; img.data[o + 2] = 90; }
    img.data[o + 3] = Math.min(255, a * 290);
  }
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, N, N);
  ctx.putImageData(img, 0, 0);
  // nucleus + scale note
  ctx.fillStyle = '#ffe27a';
  ctx.beginPath(); ctx.arc(N / 2, N / 2, 2, 0, 7); ctx.fill();
  ctx.fillStyle = '#8b9bb0'; ctx.font = '10px monospace';
  ctx.fillText(`${extent * 2} a₀ across · ${orb.plane ?? 'x–z'} slice`, 6, N - 8);
}

// ---- energy levels / Rydberg ----
function levelDiagram(canvas: HTMLCanvasElement, ni: number, nf: number): string {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const E = (n: number) => -13.606 / (n * n);
  const Y = (e: number) => 24 + (H - 60) * (e / -13.606); // 0 eV top
  ctx.font = '11px monospace';
  for (let n = 1; n <= 6; n++) {
    const y = Y(E(n));
    ctx.strokeStyle = n === ni || n === nf ? '#ffe27a' : '#55627a';
    ctx.lineWidth = n === ni || n === nf ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(W - 20, y); ctx.stroke();
    ctx.fillStyle = '#7d8fa3';
    ctx.textAlign = 'right';
    ctx.fillText(`n=${n}  ${E(n).toFixed(2)} eV`, 66, y + 3);
  }
  ctx.fillStyle = '#8b9bb0'; ctx.textAlign = 'left';
  ctx.fillText('E = 0 (ionized)', 70, 14);

  const hi = Math.max(ni, nf), lo = Math.min(ni, nf);
  const dE = Math.abs(E(hi) - E(lo));
  const lambda = 1239.8 / dE; // nm
  const emit = ni > nf;
  // arrow
  const x = 70 + (W - 90) * 0.55;
  ctx.strokeStyle = '#6fc3ff'; ctx.fillStyle = '#6fc3ff'; ctx.lineWidth = 2;
  const y1 = Y(E(ni)), y2 = Y(E(nf));
  ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
  const dir = y2 > y1 ? 1 : -1;
  ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 5, y2 - 8 * dir); ctx.lineTo(x + 5, y2 - 8 * dir); ctx.fill();

  const series = lo === 1 ? 'Lyman (UV)' : lo === 2 ? 'Balmer (visible)' : lo === 3 ? 'Paschen (IR)' : '—';
  const visible = lambda >= 380 && lambda <= 750;
  const color = !visible ? null : lambda < 450 ? 'violet/blue' : lambda < 495 ? 'blue' : lambda < 570 ? 'green' : lambda < 590 ? 'yellow' : lambda < 620 ? 'orange' : 'red';
  return `${emit ? 'Emission' : 'Absorption'}: n=${ni} → n=${nf} · ΔE = ${dE.toFixed(3)} eV · ` +
    `λ = <b>${lambda.toFixed(0)} nm</b> · series: ${series}${color ? ` · appears <b>${color}</b>` : lambda < 380 ? ' · UV' : ' · IR'}`;
}

// ---- electron configuration ----
const SUBSHELLS: { label: string; cap: number }[] = [
  { label: '1s', cap: 2 }, { label: '2s', cap: 2 }, { label: '2p', cap: 6 },
  { label: '3s', cap: 2 }, { label: '3p', cap: 6 }, { label: '4s', cap: 2 },
  { label: '3d', cap: 10 }, { label: '4p', cap: 6 },
];
const SYMBOLS = ['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'];

function electronConfig(Z: number): { fills: number[]; note: string } {
  const fills = SUBSHELLS.map(() => 0);
  let e = Z;
  for (let i = 0; i < SUBSHELLS.length && e > 0; i++) {
    fills[i] = Math.min(SUBSHELLS[i].cap, e);
    e -= fills[i];
  }
  let note = '';
  const i4s = SUBSHELLS.findIndex(s => s.label === '4s');
  const i3d = SUBSHELLS.findIndex(s => s.label === '3d');
  if (Z === 24) { fills[i4s] = 1; fills[i3d] = 5; note = 'Exception! Half-filled 3d⁵ is extra stable → [Ar] 4s¹ 3d⁵'; }
  if (Z === 29) { fills[i4s] = 1; fills[i3d] = 10; note = 'Exception! Filled 3d¹⁰ is extra stable → [Ar] 4s¹ 3d¹⁰'; }
  return { fills, note };
}

function configHTML(Z: number): string {
  const { fills, note } = electronConfig(Z);
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const supN = (n: number) => String(n).split('').map(d => sup[+d]).join('');
  let cfg = '';
  fills.forEach((f, i) => { if (f > 0) cfg += `${SUBSHELLS[i].label}${supN(f)} `; });
  // orbital boxes with Hund's rule
  let boxes = '';
  fills.forEach((f, i) => {
    if (f === 0) return;
    const nOrb = SUBSHELLS[i].cap / 2;
    const arr: string[] = [];
    for (let o = 0; o < nOrb; o++) {
      const up = f > o ? '↑' : '';
      const down = f > o + nOrb ? '↓' : '';
      arr.push(`<span style="border:1px solid #2a3546;padding:1px 5px;margin:1px;display:inline-block;min-width:26px;text-align:center">${up}${down}</span>`);
    }
    boxes += `<div style="margin:3px 0"><span style="color:#7d8fa3;display:inline-block;width:26px">${SUBSHELLS[i].label}</span>${arr.join('')}</div>`;
  });
  return `<p class="big"><b>${SYMBOLS[Z - 1]}</b> (Z=${Z}): ${cfg}</p>${note ? `<p class="trap">${note}</p>` : ''}${boxes}
  <p class="muted">Boxes fill by Hund's rule: one ↑ in each degenerate orbital before pairing. Cations lose 4s before 3d (Fe²⁺ = [Ar]3d⁶, not 4s²3d⁴).</p>`;
}

export const quantumTab: TabDef = {
  id: 'quantum',
  mount(root) {
    // orbital viewer
    const orbCanvas = h('canvas', { width: 320, height: 320 });
    const orbDesc = h('p', { class: 'muted' });
    let curOrb: OrbitalId = '2pz';

    const orbMissions = missionLadder([
      {
        id: 'msn-qua-01',
        prompt: 'Select <b>3s</b> in the viewer and count its <b>radial nodes</b> — the spheres where the wavefunction changes sign.',
        numeric: { label: 'radial nodes in 3s', placeholder: '0', step: 1, validate: n => curOrb === '3s' && n === 2 },
        hints: [
          'Radial nodes = n − ℓ − 1. For 3s, n = 3 and ℓ = 0.',
          'On the picture, count how many times the colour flips as you travel straight outward from the nucleus.',
        ],
        explain: '<b>2.</b> n − ℓ − 1 = 3 − 0 − 1. Travelling outward from the nucleus the sign goes blue → red → blue, so you cross two spherical surfaces where ψ = 0. This is exactly why 3s penetrates so close to the nucleus and sits below 3p in a multi-electron atom.',
      },
      {
        id: 'msn-qua-02',
        prompt: 'Now find the orbital in this list with <b>exactly one radial node and exactly one angular node</b>. Select it.',
        meter: () => {
          const o = ORBITALS[curOrb];
          return { label: `${curOrb}: ${o.n - o.l - 1} radial, ${o.l} angular · want 1 and 1`, pct: ((o.n - o.l - 1 === 1 ? 50 : 0) + (o.l === 1 ? 50 : 0)) };
        },
        check: () => curOrb === '3pz',
        hints: [
          'One angular node means ℓ = 1, so it is a p orbital. One radial node then needs n − ℓ − 1 = 1.',
          'n − 1 − 1 = 1 gives n = 3.',
        ],
        explain: '<b>3p.</b> The angular node is the flat plane through the nucleus that every p orbital has; the radial node is the spherical shell that splits each lobe into an inner and an outer piece. Total nodes always come to n − 1 = 2. <span class="trap">A common slip is counting the nucleus itself as a node, or forgetting that the two are different kinds of surface.</span>',
      },
    ]);

    const drawOrb = (id: string) => {
      curOrb = id as OrbitalId;
      drawOrbital(orbCanvas, curOrb);
      const o = ORBITALS[curOrb];
      orbDesc.textContent = `n=${o.n}, ℓ=${o.l} · radial nodes = n−ℓ−1 = ${o.n - o.l - 1} · angular nodes = ℓ = ${o.l} · ${o.desc}`;
      orbMissions.tick();
    };
    const orbCard = cardWithMissions('Hydrogen orbital viewer — ψ, signed amplitude (blue = ψ > 0, red = ψ < 0)', orbMissions,
      task('Step through the orbitals and count the nodes, watching where the wavefunction changes sign.'),
      select('orbital', Object.keys(ORBITALS).map(k => ({ value: k, label: k.replace('z2', ' z²').replace('x2y2', ' x²−y²') })), drawOrb, '2pz'),
      orbCanvas, orbDesc,
      h('p', { class: 'trap' }, 'This plots ψ itself, not |ψ|². The two colours are the SIGN of the wavefunction — and sign is the whole point: bonding vs antibonding overlap depends on it. |ψ|² would be positive everywhere and the nodes would be the only structure left. Squaring loses exactly the information you need for MO theory.'),
    );
    drawOrb('2pz');

    // radial distribution
    const radCanvas = h('canvas', { width: 460, height: 240 });
    const drawRadial = () => {
      const xs: number[] = [], s1: number[] = [], s2: number[] = [], s3: number[] = [];
      for (let rr = 0.01; rr < 25; rr += 0.05) {
        xs.push(rr);
        s1.push(Math.pow(rr * Math.exp(-rr), 2) * 4);
        s2.push(Math.pow(rr * (2 - rr) * Math.exp(-rr / 2), 2) / 8);
        s3.push(Math.pow(rr * rr * Math.exp(-rr / 2), 2) / 24);
      }
      plot(radCanvas, [
        { xs, ys: s1, color: '#6fc3ff', label: '1s' },
        { xs, ys: s2, color: '#ffe27a', label: '2s' },
        { xs, ys: s3, color: '#ff8a6f', label: '2p' },
      ], { xLabel: 'r / a₀', yLabel: '4πr²|ψ|² (radial probability)' });
    };
    drawRadial();
    const radCard = card('Radial distribution — where the electron actually is',
      task('Compare the 2s curve with 2p and find the inner lobe that makes 2s the lower-energy orbital.'),
      radCanvas,
      h('p', {}, '2s has a small inner lobe that penetrates close to the nucleus — closer than 2p. That penetration is why 2s is lower in energy than 2p in multi-electron atoms (it feels a larger Z_eff).'),
    );

    // energy levels
    const lvlCanvas = h('canvas', { width: 460, height: 300 });
    const lvlOut = h('div', { class: 'result' });
    let ni = 3, nf = 2;
    const lambdaNm = () => {
      const E = (n: number) => -13.606 / (n * n);
      return 1239.8 / Math.abs(E(Math.max(ni, nf)) - E(Math.min(ni, nf)));
    };

    const lvlMissions = missionLadder([
      {
        id: 'msn-qua-03',
        prompt: 'The diagram opens on the red 656 nm line. Find the transition that emits the <b>blue-green 486 nm</b> Balmer line instead.',
        meter: () => ({ label: `n=${ni} → n=${nf} · λ = ${lambdaNm().toFixed(0)} nm · target 486 nm`, pct: Math.max(0, 100 - Math.abs(lambdaNm() - 486) / 3) }),
        check: () => ni === 4 && nf === 2,
        hints: [
          'Balmer means the electron lands on n = 2. Emission means it starts higher up.',
          '656 nm was 3 → 2. A bluer photon carries more energy, so it must fall from further away.',
        ],
        explain: '<b>4 → 2.</b> The Balmer series all end on n = 2; going 3 → 2, 4 → 2, 5 → 2 gives 656, 486 and 434 nm — red, blue-green, violet. The lines crowd together toward the short-wavelength end because the levels themselves converge as −13.6/n².',
      },
      {
        id: 'msn-qua-04',
        prompt: 'Now set up an <b>absorption</b> that takes an ultraviolet photon (λ below 380 nm).',
        meter: () => ({ label: `${nf > ni ? 'absorption' : 'emission'} · λ = ${lambdaNm().toFixed(0)} nm · want absorption below 380 nm`, pct: (nf > ni ? 50 : 0) + (lambdaNm() < 380 ? 50 : 0) }),
        check: () => nf > ni && lambdaNm() < 380,
        hints: [
          'Absorption means the electron ends up HIGHER than it started — so the final n must exceed the initial n.',
          'Only transitions involving n = 1 are energetic enough to be ultraviolet. Start there.',
        ],
        explain: 'Anything starting from n = 1 — the <b>Lyman</b> series, 122 nm and shorter. This is why cold hydrogen gas is invisible to the eye but opaque in the UV: at room temperature essentially every atom sits in n = 1, so the only absorptions available are Lyman ones. Balmer <em>absorption</em> lines need the n = 2 level populated first, which takes a stellar atmosphere.',
      },
    ]);

    const redraw = () => { lvlOut.innerHTML = levelDiagram(lvlCanvas, ni, nf); lvlMissions.tick(); };
    const lvlCard = cardWithMissions('Energy levels & spectral lines (Rydberg)', lvlMissions,
      task('Choose a starting and ending level and read off the wavelength — then find the jumps that land in the visible.'),
      slider({ label: 'initial n', min: 1, max: 6, value: ni, onInput: v => { ni = v; redraw(); } }),
      slider({ label: 'final n', min: 1, max: 6, value: nf, onInput: v => { nf = v; redraw(); } }),
      lvlCanvas, lvlOut,
    );
    redraw();

    // configuration builder
    const cfgOut = h('div', {});
    const setZ = (Z: number) => { cfgOut.innerHTML = configHTML(Z); };
    const cfgCard = card('Electron configuration builder (H → Kr)',
      task('Sweep Z through the first four rows and stop at Cr and Cu, where the filling order breaks.'),
      slider({ label: 'Z', min: 1, max: 36, value: 26, onInput: setZ }),
      cfgOut,
    );
    setZ(26);
    root.append(topicPage('quantum', {
      sims: [orbCard, radCard, lvlCard, cfgCard],
      quiz: quiz(QUANTUM_QUIZ, 10),
      theory: [
        theory('Basics — Atoms & Electrons', `
<h3>What this is about</h3>
<p>An atom is a dense central nucleus, made of positively charged protons and uncharged neutrons, with electrons around it. An electron is a very light particle carrying a negative charge, and an atom's chemistry is decided by where its electrons sit. This block covers the language used to describe those positions: shells, subshells, orbitals and the four quantum numbers.</p>
<h3>Orbitals, subshells and shells</h3>
<p>An orbital is a region around the nucleus where one particular electron is likely to be found. Each orbital holds at most two electrons. Orbitals of the same shape and energy are grouped into a subshell, and the subshells lying at a similar distance from the nucleus make up a shell.</p>
<p>Shells are numbered n = 1, 2, 3 and so on, and a larger n means a bigger shell further out. Shell n contains n² orbitals. For n = 2 that is 2² = 4 orbitals, one 2s and three 2p. Four orbitals at two electrons each hold 8 electrons, which is 2n².</p>
<h3>The shapes: s, p and d</h3>
<p>An s orbital is a sphere centred on the nucleus. A p orbital is a pair of lobes on opposite sides of the nucleus, shaped like a dumbbell, and there are three of them pointing along three directions at right angles. Most d orbitals have four lobes. A p subshell holds three orbitals at two electrons each, so a full p subshell holds 3 × 2 = 6 electrons. An s subshell holds 2 and a d subshell holds 5 × 2 = 10.</p>
<h3>The four quantum numbers</h3>
<p>Every electron in an atom is labelled by four numbers.</p>
<ul>
<li>n, the principal quantum number, sets the size and the energy of the orbital.</li>
<li>ℓ, the angular momentum quantum number, sets the shape. ℓ = 0 is a sphere (s), ℓ = 1 a dumbbell (p), ℓ = 2 a d orbital.</li>
<li>mℓ, the magnetic quantum number, sets which direction the orbital points. It runs from −ℓ to +ℓ, which is why there are three p orbitals.</li>
<li>ms, the spin quantum number, is +½ or −½ and separates the two electrons that share one orbital.</li>
</ul>
<p>No two electrons in one atom may carry all four numbers the same. That single rule is why an orbital stops at two electrons.</p>
<h3>Nodes: where the electron is never found</h3>
<p>A node is a surface on which the chance of finding the electron drops to zero. The wave that describes the electron changes sign as it crosses one, which is the blue-to-red switch shown in the first card. A 1s orbital has no node. A 2s orbital has one, a hollow spherical shell inside it. A 2p orbital has one as well, the flat plane through the nucleus that separates its two lobes. Counting nodes is the quickest way to tell two orbitals apart on screen.</p>
<h3>Filling the orbitals up</h3>
<p>Electrons go into the lowest-energy orbitals available, and that lowest arrangement is called the ground state. Sodium has 11 electrons. Two fill 1s, two fill 2s and six fill 2p, which uses ten of them and matches a neon atom exactly. The eleventh has to start the next shell, so it goes into 3s and the arrangement is written 1s²2s²2p⁶3s¹, shortened to [Ne]3s¹. That list of occupied orbitals is the atom's electron configuration. Those superscripts are electron counts, not powers.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Say how many orbitals and how many electrons a given shell or subshell holds.</li>
<li>Name the shape that each of s, p and d stands for, and say which quantum number sets it.</li>
<li>Write the ground-state arrangement of electrons for a light element, and count the nodes in a simple orbital.</li>
</ul>`, true),
        theory('Core — Atoms & Electrons', `
<h3>What this block adds</h3>
<p>Basics named the parts of an atom and wrote one configuration out in full. Core turns that into a system: the filling order up to krypton, the configurations of ions, and how the table's layout follows from both.</p>
<h3>How many electrons a shell holds</h3>
<p>Shell n contains n² orbitals and every orbital holds two electrons, so a shell holds 2n² electrons. That gives 2, 8, 18 and 32 for the first four shells.</p>
<p>Those totals come from the subshells inside. Shell 3 has one 3s orbital, three 3p orbitals and five 3d orbitals, which is 9 orbitals and so 18 electrons. The 2, 8, 18 pattern is just 2n² written out.</p>
<h3>The filling order up to krypton</h3>
<p>Electrons enter the lowest available orbital first. Up to shell 3 that order follows the shell numbers. But 4s lies slightly lower in energy than 3d, so 4s fills first.</p>
<p>The order as far as krypton is 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p. Bromine has 35 electrons, so filling in that order gives 1s²2s²2p⁶3s²3p⁶4s²3d¹⁰4p⁵. Argon accounts for the first 18, so the short form is [Ar]3d¹⁰4s²4p⁵, with the subshells collected by shell number. Adding the superscripts gives 18 + 10 + 2 + 5 = 35, and that check is worth doing every time.</p>
<h3>Core electrons and valence electrons</h3>
<p>The valence electrons are those in the outermost shell, meaning the highest n present. Everything below is core, and core electrons take no part in bonding.</p>
<p>Bromine's highest shell is n = 4, holding 4s²4p⁵, so bromine has 7 valence electrons. The 3d¹⁰ set counts as core even though it filled last. For a main-group element the group number gives the count directly. Groups 1 and 2 give 1 and 2, and groups 13 to 18 give the group number minus 10, so group 17 gives 7.</p>
<h3>The blocks of the table</h3>
<p>The shape of the periodic table is the filling order drawn out. The two columns on the left are the s block, because their last electron enters an s orbital. The six columns on the right are the p block, and the ten in the middle are the d block.</p>
<p>That lets you read a configuration off a position. Sulfur sits in period 3, in the fourth column of the p block, so its outer shell is 3s²3p⁴ and the configuration is [Ne]3s²3p⁴.</p>
<h3>Configurations of ions</h3>
<p>A positive ion is made by removing electrons from the outermost shell, which is not always the subshell that filled last. For a d-block atom the 4s electrons leave before the 3d electrons do.</p>
<p>Iron is [Ar]3d⁶4s². Taking away the two 4s electrons gives Fe²⁺ = [Ar]3d⁶, and taking one more from 3d gives Fe³⁺ = [Ar]3d⁵. Negative ions fill the gaps instead: chlorine is [Ne]3s²3p⁵, so Cl⁻ is [Ne]3s²3p⁶, the same arrangement as an argon atom.</p>
<h3>Light arrives in packets</h3>
<p>Light travels in packets called photons, and one photon carries an energy fixed by its wavelength. A short wavelength means a large energy per photon.</p>
<p>Sodium colours a flame orange at a wavelength of 589 nm, which is 589 × 10⁻⁹ m. Planck's constant, the number linking a photon's energy to its frequency, is h = 6.626 × 10⁻³⁴ J·s. The speed of light is c = 2.998 × 10⁸ m/s. The energy is (6.626 × 10⁻³⁴ × 2.998 × 10⁸) ÷ (589 × 10⁻⁹) = 3.37 × 10⁻¹⁹ J. One mole of those photons carries 203 kJ. Written in general, with λ the wavelength in metres:</p>
<p><span class="eq">E = hc ÷ λ</span></p>
<h3>Absorbing and emitting</h3>
<p>An electron may only sit at certain energies, so only certain energy gaps exist inside an atom. A photon is absorbed only when its energy matches a gap exactly, and the electron then jumps up.</p>
<p>It falls back sooner or later, emitting a photon of that same energy. So the wavelength an atom absorbs and the wavelength it emits for one particular jump are identical. A sodium lamp glows at 589 nm, and sodium vapour in front of a white lamp removes that same colour.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Say how many electrons a shell or subshell holds, and where 2, 8, 18 comes from.</li>
<li>Write the full and shortened configuration of any element up to krypton, and check it against Z.</li>
<li>Separate core from valence electrons, and get the valence count from the group number.</li>
<li>Write the configuration of a common cation or anion, taking 4s electrons out before 3d.</li>
<li>Turn a wavelength into a photon energy, and say why absorption and emission share a wavelength.</li>
</ul>`, true),
        theory('Exam-level reference — Atoms & Electrons', `
<h3>Quantum numbers</h3>
<ul>
<li><b>n</b> = 1,2,3… (size/energy) · <b>ℓ</b> = 0…n−1 (shape: s,p,d,f) · <b>m<sub>ℓ</sub></b> = −ℓ…+ℓ (orientation) · <b>m<sub>s</sub></b> = ±½</li>
<li>Nodes: total = n−1; angular = ℓ; radial = n−ℓ−1. <span class="trap">Classic trap: "how many radial nodes in 4d?" → 4−2−1 = 1.</span></li>
<li>Pauli: no two electrons share all four quantum numbers. Hund: maximize parallel spins in degenerate orbitals.</li>
</ul>
<h3>Hydrogen-like energies & light</h3>
<span class="eq">E<sub>n</sub> = −13.6 · Z²/n² eV &nbsp;&nbsp; ΔE = hc/λ &nbsp;&nbsp; λ(nm) ≈ 1240/ΔE(eV)</span>
<span class="eq">1/λ = R<sub>H</sub>(1/n₁² − 1/n₂²), R<sub>H</sub> = 1.097×10⁷ m⁻¹</span>
<ul>
<li>Lyman → n=1 (UV), Balmer → n=2 (visible: 656 red, 486 blue-green, 434, 410 nm), Paschen → n=3 (IR).</li>
<li>de Broglie: λ = h/mv. Heisenberg: Δx·Δp ≥ ħ/2. Photoelectric: KE = hν − φ (intensity ↑ = more e⁻, not faster e⁻).</li>
</ul>
<h3>Multi-electron atoms & periodic trends</h3>
<ul>
<li>Z<sub>eff</sub> ≈ Z − S (shielding). Penetration order within a shell: s &gt; p &gt; d &gt; f.</li>
<li>Across a period: Z<sub>eff</sub> ↑ → radius ↓, IE ↑, EA ↑ (more negative), electronegativity ↑. Down a group: all reverse.</li>
<li><span class="trap">IE exceptions:</span> Be→B drops (new 2p subshell); N→O drops (pairing repulsion in 2p⁴). Same pattern in period 3 (Mg→Al, P→S).</li>
<li>Successive IEs jump hugely once you break into a core shell — use the jump to identify the group.</li>
<li>Isoelectronic series: more protons = smaller (O²⁻ &gt; F⁻ &gt; Na⁺ &gt; Mg²⁺).</li>
<li>PES (photoelectron spectroscopy): each peak = one subshell; peak height ∝ number of electrons; higher binding energy = closer to nucleus.</li>
</ul>`),
      ],
    }));
  },
};
