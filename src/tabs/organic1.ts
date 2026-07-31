// Organic I: substrate/mechanism decision engine (SN1/SN2/E1/E2),
// pKa ladder, carbocation stability.
import { h, card, theory, select, plot, linspace, quiz, type TabDef } from './framework';
import { challengeLadder } from './challenge';
import { ORGANIC1_QUIZ } from './questions2';


// ---- SN/E decision engine ----
type Sub = 'methyl' | 'primary' | 'secondary' | 'tertiary' | 'benzylic';
type Reag = 'strongNu' | 'strongBase' | 'bulkyBase' | 'weak';
type Solv = 'aprotic' | 'protic';

const SUBSTRATES: { value: Sub; label: string }[] = [
  { value: 'methyl', label: 'methyl (CH₃–X)' },
  { value: 'primary', label: 'primary (RCH₂–X)' },
  { value: 'secondary', label: 'secondary (R₂CH–X)' },
  { value: 'tertiary', label: 'tertiary (R₃C–X)' },
  { value: 'benzylic', label: '2° benzylic/allylic' },
];
const REAGENTS: { value: Reag; label: string }[] = [
  { value: 'strongNu', label: 'strong Nu, weak base (I⁻, CN⁻, RS⁻, N₃⁻)' },
  { value: 'strongBase', label: 'strong Nu & base (HO⁻, MeO⁻, EtO⁻)' },
  { value: 'bulkyBase', label: 'bulky base (t-BuO⁻, LDA)' },
  { value: 'weak', label: 'weak Nu/base (H₂O, ROH — solvolysis)' },
];
const SOLVENTS: { value: Solv; label: string }[] = [
  { value: 'aprotic', label: 'polar aprotic (DMSO, DMF, acetone)' },
  { value: 'protic', label: 'polar protic (H₂O, ROH)' },
];

function decide(sub: Sub, reag: Reag, solv: Solv, heat: boolean): { verdict: string; why: string[] } {
  const why: string[] = [];
  if (sub === 'methyl') {
    if (reag === 'weak') return { verdict: 'No reaction (very slow)', why: ['Methyl can\'t ionize (no SN1/E1 — methyl cation is hopeless) and a weak nucleophile barely attacks.', 'Needs a decent nucleophile for SN2.'] };
    why.push('Methyl: backside attack is wide open, and there\'s no β-hydrogen — elimination impossible.');
    return { verdict: 'SN2', why };
  }
  if (sub === 'primary') {
    if (reag === 'bulkyBase') return { verdict: 'E2', why: ['Normally 1° + strong base → SN2, but t-BuO⁻ is too fat to reach the backside carbon.', 'It grabs a β-H instead → Hofmann (less substituted) alkene.'] };
    if (reag === 'weak') return { verdict: 'No reaction (very slow)', why: ['1° carbocations don\'t form (no SN1/E1) and weak nucleophiles need help.'] };
    why.push('1° substrate: SN2 backside attack is fast; 1° carbocation is out of the question.');
    if (solv === 'aprotic') why.push('Polar aprotic solvent leaves the nucleophile "naked" → SN2 even faster.');
    return { verdict: 'SN2', why };
  }
  if (sub === 'tertiary') {
    if (reag === 'strongNu') return { verdict: 'SN1 (+ some E1)', why: ['SN2 is impossible — three R groups block the backside.', 'A good, non-basic nucleophile captures the 3° carbocation after slow ionization.'] };
    if (reag === 'strongBase' || reag === 'bulkyBase') return { verdict: 'E2', why: ['3° blocks SN2, and a strong base doesn\'t wait for ionization — it rips off a β-H in one concerted step.', 'Zaitsev product (more substituted alkene) dominates; bulky bases give more Hofmann.'] };
    return {
      verdict: heat ? 'E1 (major) + SN1' : 'SN1 (major) + E1',
      why: ['Solvolysis: 3° C–X ionizes to a stable carbocation (slow, rate = k[RX] — unimolecular).',
        heat ? 'Heat favors elimination: ΔS > 0 for E1 (two products from one), so −TΔS wins at high T.' : 'The weak nucleophile then attacks the flat carbocation from either face → racemization.'],
    };
  }
  if (sub === 'benzylic') {
    if (reag === 'weak') return { verdict: 'SN1', why: ['Benzylic/allylic cation is resonance-stabilized — ionization is easy even though the carbon is only 2°.'] };
    if (reag === 'strongNu' && solv === 'aprotic') return { verdict: 'SN2', why: ['Resonance also stabilizes the SN2 transition state; strong Nu + aprotic → clean SN2.'] };
    if (reag === 'bulkyBase' || reag === 'strongBase') return { verdict: 'E2', why: ['Strong base + 2° substrate → concerted anti-periplanar elimination; conjugated alkene product is extra stable.'] };
    return { verdict: 'SN1/SN2 competition', why: ['Benzylic substrates genuinely do both — conditions tip the balance.'] };
  }
  // secondary
  if (reag === 'strongNu') {
    return solv === 'aprotic'
      ? { verdict: 'SN2', why: ['2° + strong non-basic Nu + polar aprotic = textbook SN2 (single step, backside attack, inversion).'] }
      : { verdict: 'SN2 (slower)', why: ['Protic solvent H-bonds the nucleophile and slows it, but SN2 still wins with a good Nu.'] };
  }
  if (reag === 'strongBase') return { verdict: 'E2 (major) + SN2', why: ['2° + strong base: elimination usually beats substitution (backside is half-blocked).', 'Anti-periplanar H required — watch for stereochemistry on cyclohexanes (both groups axial!).'] };
  if (reag === 'bulkyBase') return { verdict: 'E2', why: ['Bulky base can\'t reach the 2° backside at all → pure elimination, Hofmann-leaning.'] };
  return {
    verdict: heat ? 'E1 + SN1 (heat favors E1)' : 'SN1 + E1 (slow)',
    why: ['2° solvolysis: ionization possible but slow; expect racemization (SN1) plus alkenes (E1).', 'Look for carbocation rearrangements (hydride/methyl shifts to a more stable cation)!'],
  };
}

function energyProfile(canvas: HTMLCanvasElement, oneStep: boolean): void {
  const xs = linspace(0, 1, 200);
  const ys = xs.map(x => oneStep
    ? 0.2 + 0.65 * Math.exp(-Math.pow((x - 0.5) / 0.16, 2))
    : 0.2 + 0.75 * Math.exp(-Math.pow((x - 0.35) / 0.1, 2)) + 0.45 * Math.exp(-Math.pow((x - 0.72) / 0.09, 2)) + (x > 0.45 && x < 0.62 ? 0.18 : 0) * Math.exp(-Math.pow((x - 0.53) / 0.07, 2)));
  plot(canvas, [{ xs, ys, color: '#6fc3ff' }], {
    xLabel: 'reaction coordinate', yLabel: 'energy', yMin: 0, yMax: 1.1, legend: false,
    markers: oneStep
      ? [{ x: 0.5, y: 0.85, label: '1 TS: concerted (SN2/E2)' }]
      : [{ x: 0.35, y: 0.95, label: 'TS1: ionization (slow)' }, { x: 0.53, y: 0.4, color: '#ff8a6f', label: 'carbocation!' }],
  });
}

// ---- pKa ladder ----
const PKAS: { acid: string; conj: string; pka: number }[] = [
  { acid: 'HCl', conj: 'Cl⁻', pka: -7 },
  { acid: 'H₃O⁺', conj: 'H₂O', pka: -1.7 },
  { acid: 'RCOOH (acetic)', conj: 'RCOO⁻', pka: 4.8 },
  { acid: 'H₂CO₃', conj: 'HCO₃⁻', pka: 6.3 },
  { acid: 'NH₄⁺', conj: 'NH₃', pka: 9.2 },
  { acid: 'phenol', conj: 'PhO⁻', pka: 10.0 },
  { acid: 'RSH (thiol)', conj: 'RS⁻', pka: 10.6 },
  { acid: 'H₂O', conj: 'HO⁻', pka: 15.7 },
  { acid: 'ROH (ethanol)', conj: 'RO⁻', pka: 16 },
  { acid: 'alkyne (RC≡CH)', conj: 'acetylide', pka: 25 },
  { acid: 'H₂', conj: 'H⁻', pka: 36 },
  { acid: 'NH₃ (as acid)', conj: 'NH₂⁻', pka: 38 },
  { acid: 'alkene (=CH)', conj: 'vinyl anion', pka: 44 },
  { acid: 'alkane (CH₄)', conj: 'CH₃⁻', pka: 50 },
];

export const organic1Tab: TabDef = {
  id: 'organic1',
  label: 'Organic I',
  group: 'Organic Chemistry',
  mount(root) {
    // decision engine
    let sub: Sub = 'secondary', reag: Reag = 'strongBase', solv: Solv = 'protic', heat = false;
    const verdictOut = h('div', { class: 'result' });
    const profCanvas = h('canvas', { width: 440, height: 220 });
    function update(): void {
      const { verdict, why } = decide(sub, reag, solv, heat);
      verdictOut.innerHTML = `<b class="big">${verdict}</b><ul>${why.map(w => `<li>${w}</li>`).join('')}</ul>`;
      energyProfile(profCanvas, !(verdict.includes('SN1') || verdict.includes('E1')));
    }
    const deciderCard = card('SN1 / SN2 / E1 / E2 decision engine',
      select('substrate', SUBSTRATES, v => { sub = v as Sub; update(); }, sub),
      select('nucleophile/base', REAGENTS, v => { reag = v as Reag; update(); }, reag),
      select('solvent', SOLVENTS, v => { solv = v as Solv; update(); }, solv),
      select('temperature', [{ value: 'rt', label: 'room temperature' }, { value: 'heat', label: 'heated (Δ)' }], v => { heat = v === 'heat'; update(); }, 'rt'),
      verdictOut, profCanvas,
    );
    update();

    // pKa ladder
    let a1 = 2, a2 = 7;
    const ladderOut = h('div', { class: 'result' });
    const ladderCalc = () => {
      const A = PKAS[a1], B = PKAS[a2];
      const [donor, acceptorConj] = A.pka < B.pka ? [A, B] : [B, A];
      const dpka = Math.abs(A.pka - B.pka);
      ladderOut.innerHTML =
        `<b>${donor.acid}</b> (pKa ${donor.pka}) protonates <b>${acceptorConj.conj}</b> (conj. acid pKa ${acceptorConj.pka})<br>` +
        `Equilibrium lies to the side of the <b>weaker acid</b> (higher pKa): K ≈ 10^${dpka.toFixed(1)}<br>` +
        `<span class="muted">Rule: an acid is deprotonated by the conjugate base of any acid with a higher pKa. That's why NaOH (H₂O: 15.7) deprotonates phenol (10) but NaHCO₃ (H₂CO₃: 6.3) does not.</span>`;
    };
    const ladderCard = card('pKa ladder — who deprotonates whom?',
      select('acid 1', PKAS.map((p, i) => ({ value: String(i), label: `${p.acid} (pKa ${p.pka})` })), v => { a1 = Number(v); ladderCalc(); }, String(a1)),
      select('acid 2', PKAS.map((p, i) => ({ value: String(i), label: `${p.acid} (pKa ${p.pka})` })), v => { a2 = Number(v); ladderCalc(); }, String(a2)),
      ladderOut,
      h('h3', {}, 'Why is one acid stronger? (CARDIO checklist)'),
      h('ul', {},
        h('li', { html: '<b>C</b>harge: positive species more acidic.' }),
        h('li', { html: '<b>A</b>tom: down a group, size wins (HI > HCl; RSH > ROH). Across a row, electronegativity wins (HF > H₂O > NH₃ > CH₄).' }),
        h('li', { html: '<b>R</b>esonance: delocalized conjugate base = stronger acid (carboxylic acid ≫ alcohol).' }),
        h('li', { html: '<b>D</b>ipole induction: EWGs nearby stabilize the anion (CF₃COOH pKa 0.2 vs CH₃COOH 4.8); effect fades with distance.' }),
        h('li', { html: '<b>O</b>rbital: more s-character = more stable anion (sp C–H pKa 25 vs sp³ ~50).' }),
      ),
    );
    ladderCalc();

    // carbocation stability
    const cationCard = card('Carbocation stability (drives SN1/E1 and rearrangements)',
      h('p', { html: '<b>3° > 2° ≫ 1° > methyl</b> — each alkyl group donates electron density (hyperconjugation + induction).' }),
      h('p', { html: 'Resonance beats substitution: <b>benzylic ≈ allylic ≈ 3°</b>. Adjacent lone pairs help enormously (oxocarbenium in acetal chemistry).' }),
      h('p', { html: '<span class="trap">Never form a carbocation next to a carbonyl or on a vinyl/aryl carbon — destabilized.</span>' }),
      h('p', { html: '<b>Rearrangements:</b> a 2° cation adjacent to a 3° center does a hydride (or methyl) shift → watch for "unexpected" SN1/E1 products. If a shift can make a more stable cation, it will.' }),
    );

    root.append(
      h('div', { class: 'cards' }, deciderCard, ladderCard, cationCard, card('Quick quiz', quiz(ORGANIC1_QUIZ, 5)), challengeLadder('organic1')),
      theory('Theory — organic bonding, stereochem quick hits, mechanism summary', `
<h4>The four mechanisms at a glance</h4>
<table><tr><th></th><th>rate law</th><th>stereo</th><th>substrate</th><th>needs</th></tr>
<tr><td><b>SN2</b></td><td>k[RX][Nu]</td><td>inversion (backside)</td><td>Me &gt; 1° &gt; 2° (never 3°)</td><td>strong Nu, aprotic best</td></tr>
<tr><td><b>SN1</b></td><td>k[RX]</td><td>racemization</td><td>3° &gt; 2° (+benzylic/allylic)</td><td>weak Nu, protic, stable cation</td></tr>
<tr><td><b>E2</b></td><td>k[RX][B]</td><td>anti-periplanar H required</td><td>3° &gt; 2° &gt; 1°</td><td>strong base</td></tr>
<tr><td><b>E1</b></td><td>k[RX]</td><td>Zaitsev alkene</td><td>3° &gt; 2°</td><td>weak base, heat</td></tr></table>
<ul>
<li>Leaving group quality = weak base: I⁻ &gt; Br⁻ &gt; Cl⁻ ≫ F⁻; TsO⁻ excellent; HO⁻ terrible (protonate it first!).</li>
<li>Zaitsev (more substituted alkene) vs Hofmann (bulky base → less substituted). E2 on cyclohexanes: leaving group must be axial.</li>
<li>Alkene stability: tetra &gt; tri &gt; cis-di &lt; trans-di ordering — trans &gt; cis; more substitution = more stable (hyperconjugation).</li>
</ul>
<h4>Stereochemistry quick hits</h4>
<ul>
<li>Chiral center: 4 different groups. n centers → up to 2ⁿ stereoisomers (meso compounds reduce the count).</li>
<li>Enantiomers: identical physical properties except optical rotation & chiral environments. Diastereomers differ in everything.</li>
<li>R/S: rank by atomic number, lowest priority away, trace 1→2→3. <span class="trap">If the lowest priority points toward you, reverse the answer.</span></li>
<li>SN2 flips R↔S only if the leaving group and nucleophile have the same priority rank — check, don't assume.</li>
</ul>`, true),
    );
  },
};
