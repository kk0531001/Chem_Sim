// Chemical bonding: VSEPR geometry explorer + MO diagrams for diatomics.
import { h, card, theory, select, type TabDef } from './framework';

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
  ctx.fillStyle = '#5a6a7d';
  ctx.fillText(piBelow ? 'π2p below σ2p (Z ≤ 7: s–p mixing)' : 'σ2p below π2p (O, F, Ne)', 10, 14);

  const mag = unpaired > 0 ? `paramagnetic (${unpaired} unpaired)` : 'diamagnetic';
  return `<b>${sp.label}</b>: bond order = (${bondingE}−${antiE})/2 = <b>${bo}</b> · <b>${mag}</b>` +
    (bo === 0 ? ' · not bound!' : '') +
    `<br><span class="muted">Higher bond order → shorter, stronger bond. Removing an e⁻ from O₂ (antibonding π*) strengthens the bond; adding one weakens it.</span>`;
}

export const bondingTab: TabDef = {
  id: 'bonding',
  label: 'Bonding & MO',
  mount(root) {
    // VSEPR card
    const shapeBox = h('div', {});
    const infoBox = h('div', { class: 'result' });
    const setShape = (code: string) => {
      const e = VSEPR.find(v => v.code === code)!;
      shapeBox.innerHTML = vseprSVG(e);
      infoBox.innerHTML = `<b>${e.code}</b> — electron geometry: <b>${e.eGeom}</b> · molecular shape: <b>${e.mGeom}</b><br>` +
        `bond angle: ${e.angle} · hybridization: ${e.hybrid}<br>examples: ${e.examples}<br>polarity: ${e.polar}` +
        (e.lp > 0 ? `<br><span class="muted">Lone pairs (yellow) repel more than bonds → they compress the bond angles.</span>` : '');
    };
    const vseprCard = card('VSEPR geometry explorer',
      select('shape class', VSEPR.map(v => ({ value: v.code, label: `${v.code} — ${v.mGeom}` })), setShape, 'AX₂E₂'),
      shapeBox, infoBox,
    );
    setShape('AX₂E₂');

    // MO card
    const moCanvas = h('canvas', { width: 380, height: 320 });
    const moOut = h('div', { class: 'result' });
    const setMO = (label: string) => {
      const sp = MO_SPECIES.find(s => s.label === label)!;
      moOut.innerHTML = moDiagram(moCanvas, sp);
    };
    const moCard = card('MO diagram — period 2 diatomics',
      select('species', MO_SPECIES.map(s => ({ value: s.label, label: s.label })), setMO, 'O₂'),
      moCanvas, moOut,
    );
    setMO('O₂');

    root.append(
      h('div', { class: 'cards' }, vseprCard, moCard),
      theory('Theory & key ideas — Lewis, VSEPR, valence bond, MO', `
<h4>Lewis structures & formal charge</h4>
<span class="eq">FC = valence e⁻ − nonbonding e⁻ − ½(bonding e⁻)</span>
<ul>
<li>Best structure: FC closest to zero; negative FC on the most electronegative atom.</li>
<li>Resonance: real molecule is the average (O₃ bond order 1.5; NO₃⁻ 1.33). Equivalent resonance = more stabilization.</li>
<li>Octet exceptions: e⁻-deficient (BF₃, BeCl₂), radicals (NO, NO₂), expanded octets only for period ≥3 (PCl₅, SF₆, XeF₄).</li>
</ul>
<h4>Bond properties</h4>
<ul>
<li>Bond order ↑ → length ↓, strength ↑. C–C 154 pm &gt; C=C 134 &gt; C≡C 120.</li>
<li>Polarity: ΔEN &gt; ~1.8 ionic, 0.4–1.8 polar covalent. Dipoles are vectors — symmetric shapes cancel (CO₂, CCl₄, XeF₄ nonpolar).</li>
</ul>
<h4>Valence bond / hybridization</h4>
<ul>
<li>Count σ-bonds + lone pairs on the atom: 2 → sp, 3 → sp², 4 → sp³.</li>
<li>σ bonds: head-on overlap (free rotation). π bonds: sideways p–p overlap (locks rotation → cis/trans isomers).</li>
<li>Double bond = 1σ + 1π; triple = 1σ + 2π. More s-character → shorter/stronger bond, more electronegative orbital (sp C–H is most acidic).</li>
</ul>
<h4>MO theory essentials</h4>
<span class="eq">bond order = (bonding e⁻ − antibonding e⁻) / 2</span>
<ul>
<li>π2p falls below σ2p for B₂, C₂, N₂ (s–p mixing); order flips for O₂, F₂.</li>
<li><span class="trap">The classic: O₂ is paramagnetic (2 unpaired π* electrons) — Lewis theory can't explain this, MO can.</span></li>
<li>B₂ paramagnetic, C₂ diamagnetic — the π-below-σ ordering is testable.</li>
<li>He₂, Ne₂: bond order 0 → don't exist.</li>
</ul>`, true),
    );
  },
};
