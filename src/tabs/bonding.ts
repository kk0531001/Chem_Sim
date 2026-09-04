// Chemical bonding: VSEPR geometry explorer + MO diagrams for diatomics.
import { h, cardWithMissions, missionLadder, theory, select, quiz, type TabDef, task } from './framework';
import { topicPage } from './page';
import { BONDING_QUIZ } from './questions1';


// ---- VSEPR ----
interface VseprEntry {
  code: string; domains: number; lp: number;
  eGeom: string; mGeom: string; angle: string; hybrid: string;
  examples: string; polar: string;
  pos: [number, number][]; lpPos: [number, number][]; // unit circle coords for 2D sketch
}
const A = (deg: number): [number, number] => [Math.cos((deg - 90) * Math.PI / 180), Math.sin((deg - 90) * Math.PI / 180)];
const VSEPR: VseprEntry[] = [
  { code: 'AX₂', domains: 2, lp: 0, eGeom: 'linear', mGeom: 'linear', angle: '180°', hybrid: 'sp', examples: 'CO₂, BeCl₂, HCN', polar: 'nonpolar if X identical', pos: [A(90), A(270)], lpPos: [] },
  { code: 'AX₃', domains: 3, lp: 0, eGeom: 'trigonal planar', mGeom: 'trigonal planar', angle: '120°', hybrid: 'sp²', examples: 'BF₃, SO₃, NO₃⁻, CO₃²⁻', polar: 'nonpolar if X identical', pos: [A(0), A(120), A(240)], lpPos: [] },
  { code: 'AX₂E', domains: 3, lp: 1, eGeom: 'trigonal planar', mGeom: 'bent', angle: '<120° (~118°)', hybrid: 'sp²', examples: 'SO₂, O₃, NO₂⁻', polar: 'polar', pos: [A(120), A(240)], lpPos: [A(0)] },
  { code: 'AX₄', domains: 4, lp: 0, eGeom: 'tetrahedral', mGeom: 'tetrahedral', angle: '109.5°', hybrid: 'sp³', examples: 'CH₄, SO₄²⁻, NH₄⁺', polar: 'nonpolar if X identical', pos: [A(0), A(105), A(215), A(325)], lpPos: [] },
  { code: 'AX₃E', domains: 4, lp: 1, eGeom: 'tetrahedral', mGeom: 'trigonal pyramidal', angle: '~107°', hybrid: 'sp³', examples: 'NH₃, PCl₃, H₃O⁺', polar: 'polar', pos: [A(120), A(215), A(325)], lpPos: [A(0)] },
  { code: 'AX₂E₂', domains: 4, lp: 2, eGeom: 'tetrahedral', mGeom: 'bent', angle: '~104.5°', hybrid: 'sp³', examples: 'H₂O, OF₂, H₂S', polar: 'polar', pos: [A(215), A(325)], lpPos: [A(35), A(145)] },
  { code: 'AX₅', domains: 5, lp: 0, eGeom: 'trigonal bipyramidal', mGeom: 'trigonal bipyramidal', angle: '90° / 120°', hybrid: 'sp³d', examples: 'PCl₅, PF₅', polar: 'nonpolar if X identical', pos: [A(0), A(180), A(90), A(210), A(330)], lpPos: [] },
  { code: 'AX₄E', domains: 5, lp: 1, eGeom: 'trigonal bipyramidal', mGeom: 'seesaw', angle: '<90° / <120°', hybrid: 'sp³d', examples: 'SF₄', polar: 'polar', pos: [A(0), A(180), A(90), A(210)], lpPos: [A(330)] },
  { code: 'AX₃E₂', domains: 5, lp: 2, eGeom: 'trigonal bipyramidal', mGeom: 'T-shaped', angle: '~90°', hybrid: 'sp³d', examples: 'ClF₃, BrF₃', polar: 'polar', pos: [A(0), A(180), A(90)], lpPos: [A(210), A(330)] },
  { code: 'AX₂E₃', domains: 5, lp: 3, eGeom: 'trigonal bipyramidal', mGeom: 'linear', angle: '180°', hybrid: 'sp³d', examples: 'XeF₂, I₃⁻', polar: 'nonpolar', pos: [A(0), A(180)], lpPos: [A(90), A(210), A(330)] },
  { code: 'AX₆', domains: 6, lp: 0, eGeom: 'octahedral', mGeom: 'octahedral', angle: '90°', hybrid: 'sp³d²', examples: 'SF₆', polar: 'nonpolar if X identical', pos: [A(0), A(60), A(120), A(180), A(240), A(300)], lpPos: [] },
  { code: 'AX₅E', domains: 6, lp: 1, eGeom: 'octahedral', mGeom: 'square pyramidal', angle: '~90°', hybrid: 'sp³d²', examples: 'BrF₅, IF₅', polar: 'polar', pos: [A(0), A(60), A(120), A(240), A(300)], lpPos: [A(180)] },
  { code: 'AX₄E₂', domains: 6, lp: 2, eGeom: 'octahedral', mGeom: 'square planar', angle: '90°', hybrid: 'sp³d²', examples: 'XeF₄, ICl₄⁻', polar: 'nonpolar', pos: [A(45), A(135), A(225), A(315)], lpPos: [A(0), A(180)] },
];

function vseprSVG(e: VseprEntry): string {
  const R = 70, cx = 100, cy = 95;
  let out = `<svg viewBox="0 0 200 190" width="230" xmlns="http://www.w3.org/2000/svg">`;
  for (const [ux, uy] of e.pos) {
    out += `<line x1="${cx}" y1="${cy}" x2="${cx + ux * R}" y2="${cy + uy * R}" stroke="#9fb4c7" stroke-width="2.5"/>`;
  }
  for (const [ux, uy] of e.lpPos) {
    const lx = cx + ux * R * 0.62, ly = cy + uy * R * 0.62;
    out += `<ellipse cx="${lx}" cy="${ly}" rx="15" ry="9" transform="rotate(${Math.atan2(uy, ux) * 180 / Math.PI} ${lx} ${ly})" fill="#ffe27a" opacity="0.25"/>` +
      `<circle cx="${lx - uy * 4}" cy="${ly + ux * 4}" r="2.2" fill="#ffe27a"/>` +
      `<circle cx="${lx + uy * 4}" cy="${ly - ux * 4}" r="2.2" fill="#ffe27a"/>`;
  }
  for (const [ux, uy] of e.pos) {
    out += `<circle cx="${cx + ux * R}" cy="${cy + uy * R}" r="13" fill="#4a7dbd"/>` +
      `<text x="${cx + ux * R}" y="${cy + uy * R + 4}" text-anchor="middle" fill="#fff" font-size="11" font-family="monospace">X</text>`;
  }
  out += `<circle cx="${cx}" cy="${cy}" r="16" fill="#c05555"/>` +
    `<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#fff" font-size="12" font-family="monospace">A</text></svg>`;
  return out;
}

// ---- MO diagrams for period-2 homonuclear diatomics ----
interface MOSpecies { label: string; valenceE: number; zAvg: number }
const MO_SPECIES: MOSpecies[] = [
  { label: 'B₂', valenceE: 6, zAvg: 5 }, { label: 'C₂', valenceE: 8, zAvg: 6 },
  { label: 'N₂', valenceE: 10, zAvg: 7 }, { label: 'N₂⁺', valenceE: 9, zAvg: 7 },
  { label: 'O₂', valenceE: 12, zAvg: 8 }, { label: 'O₂⁺', valenceE: 11, zAvg: 8 },
  { label: 'O₂⁻ (superoxide)', valenceE: 13, zAvg: 8 }, { label: 'O₂²⁻ (peroxide)', valenceE: 14, zAvg: 8 },
  { label: 'F₂', valenceE: 14, zAvg: 9 }, { label: 'Ne₂ (unbound!)', valenceE: 16, zAvg: 10 },
];

function moDiagram(canvas: HTMLCanvasElement, sp: MOSpecies): string {
  // orbital list bottom-up; for Z<=7 the π2p set sits BELOW σ2p (s–p mixing)
  const piBelow = sp.zAvg <= 7;
  type MO = { name: string; y: number; slots: number; bonding: number }; // bonding +1, anti −1
  const list: MO[] = piBelow ? [
    { name: 'σ2s', y: 0, slots: 2, bonding: 1 }, { name: 'σ*2s', y: 1, slots: 2, bonding: -1 },
    { name: 'π2p', y: 2, slots: 4, bonding: 1 }, { name: 'σ2p', y: 3, slots: 2, bonding: 1 },
    { name: 'π*2p', y: 4, slots: 4, bonding: -1 }, { name: 'σ*2p', y: 5, slots: 2, bonding: -1 },
  ] : [
    { name: 'σ2s', y: 0, slots: 2, bonding: 1 }, { name: 'σ*2s', y: 1, slots: 2, bonding: -1 },
    { name: 'σ2p', y: 2, slots: 2, bonding: 1 }, { name: 'π2p', y: 3, slots: 4, bonding: 1 },
    { name: 'π*2p', y: 4, slots: 4, bonding: -1 }, { name: 'σ*2p', y: 5, slots: 2, bonding: -1 },
  ];
  // fill electrons (Hund within degenerate π pairs)
  let e = sp.valenceE;
  let bondingE = 0, antiE = 0, unpaired = 0;
  const fills: number[] = [];
  for (const mo of list) {
    const take = Math.min(mo.slots, e);
    fills.push(take); e -= take;
    if (mo.bonding > 0) bondingE += take; else antiE += take;
    if (mo.slots === 4) unpaired += take <= 2 ? take % 3 === 0 ? 0 : (take === 1 ? 1 : 2) : 4 - take;
    else unpaired += take === 1 ? 1 : 0;
  }
  const bo = (bondingE - antiE) / 2;

  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '11px monospace';
  const Y = (lvl: number) => H - 30 - lvl * ((H - 55) / 5);
  list.forEach((mo, i) => {
    const y = Y(mo.y);
    const anti = mo.bonding < 0;
    const nOrb = mo.slots / 2;
    const totalW = nOrb * 34;
    const x0 = W / 2 - totalW / 2;
    // electron arrows per orbital (Hund)
    const inOrb: number[] = new Array(nOrb).fill(0);
    let rem = fills[i];
    for (let o = 0; o < nOrb && rem > 0; o++) { inOrb[o] = 1; rem--; }
    for (let o = 0; o < nOrb && rem > 0; o++) { inOrb[o] = 2; rem--; }
    for (let o = 0; o < nOrb; o++) {
      const x = x0 + o * 34;
      ctx.strokeStyle = anti ? '#ff8a6f' : '#6fc3ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 26, y); ctx.stroke();
      ctx.fillStyle = '#e8e8e8';
      if (inOrb[o] >= 1) ctx.fillText('↑', x + 4, y - 3);
      if (inOrb[o] === 2) ctx.fillText('↓', x + 14, y - 3);
    }
    ctx.fillStyle = anti ? '#ff8a6f' : '#6fc3ff';
    ctx.textAlign = 'left';
    ctx.fillText(mo.name, x0 + totalW + 10, y + 4);
    ctx.textAlign = 'start';
  });
  ctx.fillStyle = '#8b9bb0';
  ctx.fillText(piBelow ? 'π2p below σ2p (Z ≤ 7: s–p mixing)' : 'σ2p below π2p (O, F, Ne)', 10, 14);

  const mag = unpaired > 0 ? `paramagnetic (${unpaired} unpaired)` : 'diamagnetic';
  return `<b>${sp.label}</b>: bond order = (${bondingE}−${antiE})/2 = <b>${bo}</b> · <b>${mag}</b>` +
    (bo === 0 ? ' · not bound!' : '') +
    `<br><span class="muted">Higher bond order → shorter, stronger bond. Removing an e⁻ from O₂ (antibonding π*) strengthens the bond; adding one weakens it.</span>`;
}

export const bondingTab: TabDef = {
  id: 'bonding',
  mount(root) {
    // VSEPR card
    const shapeBox = h('div', {});
    const infoBox = h('div', { class: 'result' });
    let curShape = 'AX₂E₂';
    const vseprMissions = missionLadder([
      {
        id: 'msn-bon-01',
        prompt: 'Most shapes with lone pairs on the central atom are polar. Find one of the <b>two</b> shape classes here that has lone pairs on the central atom yet is still NONPOLAR overall.',
        hints: [
          'Step through the shapes and watch the polarity label — but ask why, not just which: do the bond dipoles cancel?',
          'A dipole cancels when the arrangement is symmetric. Where do three lone pairs sit in a trigonal bipyramid, and two in an octahedron?',
        ],
        meter: () => ({ label: `current: ${curShape} — ${VSEPR.find(v => v.code === curShape)!.polar}, ${VSEPR.find(v => v.code === curShape)!.lp} lone pair(s)`, pct: 0 }),
        choices: [
          { label: 'AX₂E₃ (linear, e.g. XeF₂)', value: 'AX₂E₃' },
          { label: 'AX₃E (trigonal pyramidal, e.g. NH₃)', value: 'AX₃E' },
          { label: 'AX₂E₂ (bent, e.g. H₂O)', value: 'AX₂E₂' },
          { label: 'AX₄E₂ (square planar, e.g. XeF₄)', value: 'AX₄E₂' },
        ],
        validateChoice: v => v === 'AX₂E₃' || v === 'AX₄E₂',
        explain: 'Both <b>AX₂E₃</b> (XeF₂, I₃⁻ — linear, 3 lone pairs) and <b>AX₄E₂</b> (XeF₄, ICl₄⁻ — square planar, 2 lone pairs) are nonpolar despite carrying lone pairs. <span class="trap">Lone pairs don\'t automatically make a molecule polar</span> — what matters is whether the overall arrangement (bonds AND lone pairs together) is symmetric enough for every dipole contribution to cancel. In both cases the lone pairs sit at symmetric, opposing positions rather than breaking the symmetry.',
      },
    ]);
    const setShape = (code: string) => {
      curShape = code;
      const e = VSEPR.find(v => v.code === code)!;
      shapeBox.innerHTML = vseprSVG(e);
      infoBox.innerHTML = `<b>${e.code}</b> — electron geometry: <b>${e.eGeom}</b> · molecular shape: <b>${e.mGeom}</b><br>` +
        `bond angle: ${e.angle} · hybridization: ${e.hybrid}<br>examples: ${e.examples}<br>polarity: ${e.polar}` +
        (e.lp > 0 ? `<br><span class="muted">Lone pairs (yellow) repel more than bonds → they compress the bond angles.</span>` : '');
      vseprMissions.tick();
    };
    const vseprCard = cardWithMissions('VSEPR geometry explorer', vseprMissions,
      task('Work down the AXₙEₘ list and note how each added lone pair bends the shape away from the electron geometry.'),
      select('shape class', VSEPR.map(v => ({ value: v.code, label: `${v.code} — ${v.mGeom}` })), setShape, 'AX₂E₂'),
      shapeBox, infoBox,
    );
    setShape('AX₂E₂');

    // MO card
    const moCanvas = h('canvas', { width: 380, height: 320 });
    const moOut = h('div', { class: 'result' });
    let curMO = 'O₂';
    const moMissions = missionLadder([
      {
        id: 'msn-bon-02',
        prompt: 'Every species below has an EVEN number of valence electrons — normally a strong hint that all of them pair up. Which one is paramagnetic anyway — the single most famous example of Lewis theory failing where MO theory succeeds?',
        hints: [
          'Build each diagram and count unpaired electrons in the filled orbitals — don\'t judge from the Lewis structure.',
          'Look for a species whose last two electrons land in a degenerate π* pair: Hund\'s rule then puts one in each.',
        ],
        meter: () => ({ label: `current: ${curMO}`, pct: 0 }),
        choices: [
          { label: 'O₂ (12 valence e⁻)', value: 'O₂' },
          { label: 'F₂ (14 valence e⁻)', value: 'F₂' },
          { label: 'N₂ (10 valence e⁻)', value: 'N₂' },
          { label: 'C₂ (8 valence e⁻)', value: 'C₂' },
        ],
        validateChoice: v => v === 'O₂',
        explain: '<b>O₂.</b> With an even electron count, a Lewis structure (O=O, all electrons in pairs) predicts diamagnetic — but O₂\'s last two electrons land in a doubly-degenerate π* pair, and Hund\'s rule puts one in each, unpaired, exactly like the p-orbital filling you already know from atoms. Liquid O₂ visibly clings to a magnet; nothing in Lewis theory can produce that, because Lewis theory has no concept of degenerate orbitals to spread electrons across in the first place.',
      },
    ]);
    const setMO = (label: string) => {
      curMO = label;
      const sp = MO_SPECIES.find(s => s.label === label)!;
      moOut.innerHTML = moDiagram(moCanvas, sp);
      moMissions.tick();
    };
    const moCard = cardWithMissions('MO diagram — period 2 diatomics', moMissions,
      task('Fill each diatomic in turn and read the bond order and the unpaired electrons straight off the diagram.'),
      select('species', MO_SPECIES.map(s => ({ value: s.label, label: s.label })), setMO, 'O₂'),
      moCanvas, moOut,
    );
    setMO('O₂');
    root.append(topicPage('bonding', {
      sims: [vseprCard, moCard],
      quiz: quiz(BONDING_QUIZ, 10),
      theory: [
        theory('Basics — Bonding & Molecular Shape', `
<h3>What this is about</h3>
<p>Atoms stick together by sharing or by transferring electrons, and the way they do it fixes the shape of the molecule. This block covers how to tell the two kinds of bond apart, and how to predict a shape from a simple count.</p>
<h3>Valence electrons and the octet</h3>
<p>The valence electrons are the electrons in an atom's outermost shell, and they are the only ones that take part in bonding. Most main-group atoms, the ones in the tall columns at the left and right of the table, are stable once they have eight valence electrons, the number a full s and p set holds. Carbon starts with four valence electrons, so it needs four more and forms four bonds. Nitrogen starts with five and forms three. Oxygen starts with six and forms two.</p>
<h3>Sharing or handing over</h3>
<p>Electronegativity is how strongly an atom pulls on the electrons of a bond. Take the difference between the two atoms' values, written ΔEN. Below about 0.4 the electrons are shared evenly and the bond is nonpolar covalent. Between about 0.4 and 1.8 one atom pulls harder, and the bond is polar covalent, meaning one end carries a small negative charge. Above about 1.8 the pull is so one-sided that the electron is handed over instead of shared, and the bond is ionic.</p>
<p>Work a case through. Sodium is 0.93 on the Pauling scale and chlorine is 3.16, so ΔEN = 3.16 − 0.93 = 2.23. That is well past 1.8, so sodium gives its electron up and sodium chloride is a lattice, a repeating grid, of Na⁺ and Cl⁻ ions. A gap of only 0.5 would have left the bond polar covalent.</p>
<h3>Sigma and pi bonds</h3>
<p>The first bond between two atoms is always a sigma bond, made by two orbitals overlapping head-on along the line joining the nuclei. Any further bond between the same two atoms is a pi bond, made by p orbitals overlapping sideways above and below that line. A double bond is therefore one sigma plus one pi, and a triple bond is one sigma plus two pi.</p>
<h3>Counting groups gives the shape</h3>
<p>Electrons repel one another, so groups of electrons around a central atom spread as far apart as they can get. A group is one bond or one lone pair. A double or triple bond still counts as a single group, because it points in one direction.</p>
<p>Take carbon dioxide, O=C=O. Carbon has two groups here, the two double bonds, and no lone pairs. Two groups get furthest apart by sitting at 180°, so CO₂ is linear. The rule is the same count every time: two groups give a linear shape, three give a flat triangle with 120° angles, called trigonal planar, and four give a tetrahedron with angles near 109.5°, called tetrahedral.</p>
<h3>Lone pairs bend the shape</h3>
<p>A lone pair is a pair of valence electrons that is not shared with another atom. It still takes up a position and still pushes the other groups away, but it does not show in the drawn shape. Water has four groups around its oxygen, two bonds and two lone pairs, so those groups sit at the corners of a tetrahedron. Only the two bonds are visible, so water is called bent rather than tetrahedral, and its angle is about 104.5°. Ammonia, NH₃, has four groups with one lone pair instead of two, and the three visible bonds make a squashed pyramid called trigonal pyramidal, at about 107°.</p>
<p>The first card lists these arrangements as AXₙEₘ, where X is a bonded atom and E is a lone pair. Watch the angle close up a little each time an E replaces an X.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Count valence electrons and say how many bonds a main-group atom will form.</li>
<li>Use an electronegativity difference to call a bond nonpolar covalent, polar covalent or ionic.</li>
<li>Count electron groups on a central atom to predict a shape, and say how a lone pair changes it.</li>
</ul>`, true),
        theory('Core — Bonding & Molecular Shape', `
<h3>What this block adds</h3>
<p>Basics counted electron groups and read a shape off that count. Core draws the structure the count comes from, checks it with formal charge, and follows the shape through to polarity and to boiling point.</p>
<h3>Drawing a Lewis structure</h3>
<p>A Lewis structure shows every valence electron as either a bonding pair or a lone pair. Draw one by counting the electrons available, then handing them out until every atom is full.</p>
<p>Take methanal, CH₂O. Carbon brings 4 valence electrons, each hydrogen 1 and oxygen 6, so 12 are available. Put carbon in the middle and single-bond it to both hydrogens and the oxygen, using 6 electrons in three bonds. Place the other 6 on oxygen as three lone pairs, and carbon is left with only 6. Move one oxygen lone pair into a second carbon–oxygen bond. Now carbon has 8 and oxygen has 8, with two lone pairs left on oxygen.</p>
<h3>Formal charge checks the structure</h3>
<p>Formal charge is the charge an atom would carry if every bond were shared perfectly evenly. It is a bookkeeping test, not a real charge you could measure.</p>
<p>Carbon has 4 valence electrons, no lone pairs and 8 bonding electrons, so its formal charge is 4 − 0 − 4 = 0. Oxygen has 6, 4 and 4, giving 6 − 4 − 2 = 0. The better drawing is the one whose formal charges sit closest to zero. In general:</p>
<p><span class="eq">formal charge = valence electrons − lone-pair electrons − ½(bonding electrons)</span></p>
<h3>Groups, shapes and angles</h3>
<p>Count the groups on the central atom, where a group is one lone pair or one bond of any order. Two groups give a linear shape at 180°, three a trigonal planar shape at 120°, and four a tetrahedral shape at 109.5°.</p>
<p>A lone pair spreads out more than a bonding pair, so it squeezes the remaining angles closed. Ammonia has four groups with one lone pair and is trigonal pyramidal at 107°. Water has two lone pairs and is bent at 104.5°. Methanal's carbon carries three groups and no lone pairs, so it is trigonal planar, with a measured H–C–H angle of 116°.</p>
<h3>Sigma and pi bonds</h3>
<p>The first bond between two atoms is a sigma bond, from head-on overlap along the line joining the nuclei. Any extra bond in the same pair is a pi bond, from sideways overlap above and below that line.</p>
<p>Methanal has three sigma bonds and one pi bond, the pi being half of the C=O. A pi bond locks the two atoms against twisting. A C=C double bond therefore has a fixed geometry, while a C–C single bond turns freely.</p>
<h3>Polarity needs the shape as well as the bonds</h3>
<p>A polar bond has a slightly negative end and a slightly positive end. It acts like an arrow, so a molecule is polar only if those arrows fail to cancel.</p>
<p>Carbon dioxide has two polar C=O bonds, each with ΔEN = 3.44 − 2.55 = 0.89. The molecule is linear, so the two arrows point exactly opposite and cancel, and CO₂ is nonpolar. Water has two O–H bonds with ΔEN = 3.44 − 2.20 = 1.24. It is bent at 104.5°, so its arrows add up and water is polar. Methanal is polar for the same reason: nothing points against its C=O arrow.</p>
<h3>Forces between molecules set the boiling point</h3>
<p>Boiling pulls molecules apart without breaking anything inside them. A boiling point therefore measures the attraction between molecules, not the bonds within one.</p>
<ul>
<li>Dispersion forces act between all molecules. They come from the momentary uneven spread of electrons, and they grow with the electron count. Down the halogens the boiling point climbs: F₂ at −188 °C, Cl₂ at −34 °C, Br₂ at 59 °C and I₂ at 184 °C.</li>
<li>Dipole–dipole forces act between polar molecules, whose positive ends attract their neighbours' negative ends. Propane and ethanal both weigh about 44 g/mol, but nonpolar propane boils at −42 °C and polar ethanal at 20 °C.</li>
<li>Hydrogen bonding is the strongest of the three. It needs a hydrogen attached to nitrogen, oxygen or fluorine, plus a lone pair on an N, O or F atom nearby. Water boils at 100 °C. H₂S is heavier, has no hydrogen bonding, and boils at −60 °C.</li>
</ul>
<h3>What you should be able to do now</h3>
<ul>
<li>Draw a Lewis structure for a small molecule, with lone pairs and multiple bonds in place.</li>
<li>Work out a formal charge and use it to choose between two candidate structures.</li>
<li>Predict shape and angle from a group count, including the squeeze a lone pair applies.</li>
<li>Count sigma and pi bonds, and judge polarity from shape plus ΔEN.</li>
<li>Name the strongest force between molecules of a substance and rank boiling points with it.</li>
</ul>`, true),
        theory('Exam-level reference — Bonding & Molecular Shape', `
<h3>Lewis structures & formal charge</h3>
<span class="eq">FC = valence e⁻ − nonbonding e⁻ − ½(bonding e⁻)</span>
<ul>
<li>Best structure: FC closest to zero; negative FC on the most electronegative atom.</li>
<li>Resonance: real molecule is the average (O₃ bond order 1.5; NO₃⁻ 1.33). Equivalent resonance = more stabilization.</li>
<li>Octet exceptions: e⁻-deficient (BF₃, BeCl₂), radicals (NO, NO₂), expanded octets only for period ≥3 (PCl₅, SF₆, XeF₄).</li>
</ul>
<h3>Bond properties</h3>
<ul>
<li>Bond order ↑ → length ↓, strength ↑. C–C 154 pm &gt; C=C 134 &gt; C≡C 120.</li>
<li>Polarity: ΔEN &gt; ~1.8 ionic, 0.4–1.8 polar covalent. Dipoles are vectors — symmetric shapes cancel (CO₂, CCl₄, XeF₄ nonpolar).</li>
<li><b>Fajans' rules:</b> covalent character in an "ionic" bond grows with a small, highly-charged cation and a large, polarizable anion (why AgI and AlCl₃ are quite covalent). Bonding is a continuum, not a switch.</li>
</ul>
<h3>Valence bond / hybridization</h3>
<ul>
<li>Count σ-bonds + lone pairs on the atom: 2 → sp, 3 → sp², 4 → sp³.</li>
<li>σ bonds: head-on overlap (free rotation). π bonds: sideways p–p overlap (locks rotation → cis/trans isomers).</li>
<li>Double bond = 1σ + 1π; triple = 1σ + 2π. More s-character → shorter/stronger bond, more electronegative orbital (sp C–H is most acidic).</li>
</ul>
<h3>MO theory essentials</h3>
<span class="eq">bond order = (bonding e⁻ − antibonding e⁻) / 2</span>
<ul>
<li>π2p falls below σ2p for B₂, C₂, N₂ (s–p mixing); order flips for O₂, F₂.</li>
<li><span class="trap">The classic: O₂ is paramagnetic (2 unpaired π* electrons) — Lewis theory can't explain this, MO can.</span></li>
<li>B₂ paramagnetic, C₂ diamagnetic — the π-below-σ ordering is testable.</li>
<li>He₂, Ne₂: bond order 0 → don't exist.</li>
</ul>`),
      ],
    }));
  },
};
