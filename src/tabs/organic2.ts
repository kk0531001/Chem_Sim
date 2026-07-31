// Organic II: alkene addition (Markovnikov), EAS directing effects,
// carbonyl reaction map, molecular symmetry / point groups.
import { h, card, theory, select, pills, quiz, type TabDef } from './framework';
import { challengeLadder } from './challenge';
import { ORGANIC2_QUIZ } from './questions2';


// ---- alkene addition ----
const ADDITIONS: { alkene: string; reagent: string; major: string; why: string }[] = [
  { alkene: 'propene', reagent: 'HBr', major: '2-bromopropane', why: 'Markovnikov: H adds to the CH₂ end so Br ends up on the more substituted carbon — via the more stable 2° carbocation.' },
  { alkene: 'propene', reagent: 'HBr + peroxides (ROOR)', major: '1-bromopropane', why: 'Anti-Markovnikov: radical chain — Br• adds first to the LESS substituted carbon, making the more stable 2° radical. Only works for HBr.' },
  { alkene: 'propene', reagent: 'H₂O / H₂SO₄', major: 'propan-2-ol', why: 'Acid-catalyzed hydration = Markovnikov; carbocation intermediate → rearrangements possible.' },
  { alkene: 'propene', reagent: 'BH₃, then H₂O₂/OH⁻', major: 'propan-1-ol', why: 'Hydroboration-oxidation: anti-Markovnikov and syn addition — boron adds to the less hindered carbon (sterics, concerted, no cation).' },
  { alkene: '2-methylpropene', reagent: 'HCl', major: '2-chloro-2-methylpropane', why: 'Markovnikov via the 3° carbocation — much more stable than the 1° alternative.' },
  { alkene: '2-methylpropene', reagent: 'H₂O / H₂SO₄', major: 'tert-butanol', why: 'Markovnikov hydration through the 3° cation.' },
  { alkene: 'propene', reagent: 'Br₂', major: '1,2-dibromopropane (anti)', why: 'Bromonium ion intermediate → anti addition (trans product on rings). Decolorizes bromine water — the classic alkene test.' },
  { alkene: 'propene', reagent: 'H₂ / Pd', major: 'propane', why: 'Catalytic hydrogenation: syn addition on the metal surface. ΔH(hydrogenation) measures alkene stability.' },
  { alkene: 'propene', reagent: 'O₃, then Zn/H₂O', major: 'CH₃CHO + HCHO', why: 'Ozonolysis cleaves C=C completely → two carbonyls. Use the fragments to reverse-engineer the alkene position.' },
  { alkene: 'propene', reagent: 'KMnO₄ (cold, dilute)', major: 'propane-1,2-diol (syn)', why: 'Syn dihydroxylation; purple → brown MnO₂ is another alkene test. Hot KMnO₄ cleaves like ozonolysis but oxidizes further.' },
];

function makeAddition(): HTMLElement {
  const opts = ADDITIONS.map((a, i) => ({ value: String(i), label: `${a.alkene} + ${a.reagent}` }));
  const out = h('div', { class: 'result' });
  const set = (v: string) => {
    const a = ADDITIONS[Number(v)];
    out.innerHTML = `<b class="big">${a.major}</b><p>${a.why}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('Alkene addition predictor', select('reaction', opts, set, '0'), out,
      h('p', { class: 'muted' }, 'Markovnikov = "the rich get richer": H goes to the carbon that already has more H\'s, because that puts the + charge on the more substituted carbon.'),
    ),
    theory('Addition chemistry essentials', `
<ul>
<li>Regiochemistry decision = intermediate stability: carbocation (HX, H₂O/H⁺) → Markovnikov; radical (HBr/ROOR) → anti-Markovnikov; concerted (BH₃) → anti-Markovnikov by sterics.</li>
<li>Stereochemistry: bromonium → anti; H₂/Pd, BH₃, OsO₄/KMnO₄ → syn; carbocation paths → mixed.</li>
<li>Alkynes do everything twice; with 1 eq HX → Markovnikov vinyl halide; hydration gives enol → tautomerizes to ketone (Markovnikov) or aldehyde (hydroboration).</li>
<li>Diagnostic tests: Br₂ decolorized (C=C), cold KMnO₄ purple→brown (C=C), Ag(NH₃)₂⁺/Tollens (aldehyde: silver mirror).</li>
</ul>`),
  );
  set('0');
  return el;
}

// ---- EAS ----
const EAS_SUBS: { g: string; cls: string; dir: 'op' | 'm'; rate: string; note: string }[] = [
  { g: '–NH₂ / –NR₂', cls: 'strong activator', dir: 'op', rate: '≫ benzene', note: 'Lone pair donates by resonance. So reactive that bromination needs no catalyst (tribromination of aniline!).' },
  { g: '–OH / –OR', cls: 'strong activator', dir: 'op', rate: '≫ benzene', note: 'Resonance donation of the O lone pair into the ring.' },
  { g: '–NHC(O)R (amide)', cls: 'moderate activator', dir: 'op', rate: '> benzene', note: 'The carbonyl tames the N lone pair — used to mono-brominate aniline (protect, react, deprotect).' },
  { g: '–CH₃ / alkyl', cls: 'weak activator', dir: 'op', rate: '> benzene', note: 'Hyperconjugation. Toluene nitrates ~25× faster than benzene.' },
  { g: '–Cl / –Br', cls: 'weak DEACTIVATOR', dir: 'op', rate: '< benzene', note: 'The odd one: induction withdraws (deactivates) but lone-pair resonance still steers ortho/para.' },
  { g: '–CHO / –COR', cls: 'deactivator', dir: 'm', rate: '≪ benzene', note: 'Carbonyl withdraws by resonance — the ortho/para positions carry + charge in the intermediate, so attack goes meta.' },
  { g: '–COOH / –COOR', cls: 'deactivator', dir: 'm', rate: '≪ benzene', note: 'Same resonance withdrawal story.' },
  { g: '–CN', cls: 'deactivator', dir: 'm', rate: '≪ benzene', note: 'Strong π-withdrawal.' },
  { g: '–NO₂', cls: 'strong deactivator', dir: 'm', rate: '⋘ benzene', note: 'The benchmark meta director. Nitration then reduction (Sn/HCl) is the route to anilines.' },
  { g: '–NR₃⁺', cls: 'strong deactivator', dir: 'm', rate: '⋘ benzene', note: 'Pure induction — no lone pair to donate.' },
];

function easSVG(dir: 'op' | 'm'): string {
  const pos = [[100, 30], [160, 65], [160, 135], [100, 170], [40, 135], [40, 65]];
  const hot = dir === 'op' ? [1, 3, 5] : [2, 4]; // ortho(1,5), para(3) vs meta(2,4)
  let svg = `<svg viewBox="0 0 200 200" width="180" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<polygon points="${pos.map(p => p.join(',')).join(' ')}" fill="none" stroke="#9fb4c7" stroke-width="2"/>`;
  svg += `<circle cx="100" cy="100" r="40" fill="none" stroke="#9fb4c7" stroke-width="1.5"/>`;
  pos.forEach((p, i) => {
    if (i === 0) {
      svg += `<circle cx="${p[0]}" cy="${p[1]}" r="14" fill="#c05555"/><text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" fill="#fff" font-size="10" font-family="monospace">G</text>`;
    } else if (hot.includes(i)) {
      svg += `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="#7ae27a" opacity="0.85"/><text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" fill="#0b0e14" font-size="9" font-family="monospace">E⁺</text>`;
    }
  });
  svg += `</svg>`;
  return svg;
}

function makeEAS(): HTMLElement {
  const ring = h('div', {});
  const out = h('div', { class: 'result' });
  const set = (v: string) => {
    const s = EAS_SUBS[Number(v)];
    ring.innerHTML = easSVG(s.dir);
    out.innerHTML = `<b>${s.g}</b>: ${s.cls}, directs <b>${s.dir === 'op' ? 'ortho/para' : 'meta'}</b> (rate ${s.rate})<p>${s.note}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('EAS directing effects — where does the electrophile go?',
      select('substituent already on ring', EAS_SUBS.map((s, i) => ({ value: String(i), label: `${s.g} (${s.cls})` })), set, '0'),
      ring, out,
      h('p', { class: 'muted' }, 'Green = favored attack positions. Rule of thumb: lone pair on the attached atom → o/p director; positive/π-withdrawing attached atom → meta.'),
    ),
    theory('EAS essentials', `
<ul>
<li>Mechanism: E⁺ attacks the ring → arenium (σ) cation → lose H⁺ to rearomatize. Substituent effects act on that cation's stability.</li>
<li>Reagent pairs: Br₂/FeBr₃, Cl₂/AlCl₃, HNO₃/H₂SO₄ (NO₂⁺), SO₃/H₂SO₄, RCl/AlCl₃ (Friedel-Crafts alkylation — beware rearrangement + polyalkylation), RCOCl/AlCl₃ (acylation — clean, no rearrangement).</li>
<li>FC fails on strongly deactivated rings (nitrobenzene) and on anilines (Lewis acid grabs the N lone pair).</li>
<li>Multiple substituents: the strongest activator wins the vote; no substitution between two meta groups (sterics).</li>
<li>Synthesis-order puzzles: to get meta-bromonitrobenzene, nitrate FIRST then brominate... check each step's director!</li>
</ul>`),
  );
  set('0');
  return el;
}

// ---- carbonyl map ----
const CARBONYL: { combo: string; product: string; note: string }[] = [
  { combo: 'aldehyde/ketone + NaBH₄', product: '1°/2° alcohol', note: 'Mild hydride source; leaves esters and acids alone. LiAlH₄ reduces everything.' },
  { combo: 'aldehyde/ketone + RMgBr (Grignard)', product: '2°/3° alcohol (new C–C bond!)', note: 'Carbanion attacks the carbonyl carbon. Grignards are destroyed by any O–H/N–H — dry glassware, no alcohol solvents.' },
  { combo: 'ester + 2 RMgBr', product: '3° alcohol with two identical R groups', note: 'First equivalent makes a ketone that reacts faster than the ester — you can\'t stop at the ketone.' },
  { combo: 'aldehyde/ketone + ROH (H⁺ cat.)', product: 'hemiacetal → acetal', note: 'Acetals are base-stable protecting groups, removed by aqueous acid. Sugars live as cyclic hemiacetals.' },
  { combo: 'aldehyde/ketone + 1° amine', product: 'imine (C=N)', note: 'Via carbinolamine, loses water; pH ~4.5 optimum. 2° amine → enamine instead.' },
  { combo: 'acid chloride + alcohol / amine', product: 'ester / amide', note: 'Nucleophilic acyl substitution (addition–elimination). Reactivity: Cl > anhydride > ester ≈ acid > amide.' },
  { combo: 'ester + OH⁻ (saponification)', product: 'carboxylate + alcohol', note: 'Irreversible (carboxylate is a dead end for nucleophiles). Fischer esterification is the acid-catalyzed reverse.' },
  { combo: 'ketone + LDA, then R′X', product: 'α-alkylated ketone', note: 'Enolate chemistry: α-H (pKa ~20) removed by strong base; the carbanion attacks R′X by SN2.' },
  { combo: 'two aldehydes + base (aldol)', product: 'β-hydroxy aldehyde → enal', note: 'Enolate of one attacks the carbonyl of the other; heating dehydrates to the conjugated enone (E1cb).' },
];

function makeCarbonyl(): HTMLElement {
  const out = h('div', { class: 'result' });
  const set = (v: string) => {
    const c = CARBONYL[Number(v)];
    out.innerHTML = `<b class="big">${c.product}</b><p>${c.note}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('Carbonyl reaction map',
      select('reaction', CARBONYL.map((c, i) => ({ value: String(i), label: c.combo })), set, '0'),
      out,
      h('p', { class: 'muted' }, 'One idea unifies it all: a nucleophile attacks the δ+ carbonyl carbon. Aldehydes/ketones ADD; acid derivatives SUBSTITUTE (the leaving group departs).'),
    ),
    theory('Carbonyl & oxidation-level essentials', `
<ul>
<li>Oxidation ladder: alcohol → aldehyde → carboxylic acid (1°); alcohol → ketone, stop (2°); 3° won't oxidize. PCC stops at aldehyde; CrO₃/H⁺ (Jones) goes all the way.</li>
<li>Electrophilicity: aldehyde &gt; ketone (sterics + electronics). Acyl reactivity: Cl &gt; anhydride &gt; ester ≈ acid &gt; amide (worse leaving group = less reactive).</li>
<li>α-H acidity: pKa ≈ 20 (25 for esters, 9 for 1,3-dicarbonyls — the basis of malonic/acetoacetic ester syntheses).</li>
<li>Keto–enol tautomerism: catalyzed by acid or base; enol content tiny except 1,3-dicarbonyls (H-bonded enol).</li>
<li>Tollens (Ag mirror) and Fehling's distinguish aldehydes from ketones.</li>
</ul>`),
  );
  set('0');
  return el;
}

// ---- symmetry ----
const POINT_GROUPS: { mol: string; pg: string; elements: string; chiral: boolean; note: string }[] = [
  { mol: 'H₂O', pg: 'C₂ᵥ', elements: 'E, C₂, 2σᵥ', chiral: false, note: 'The starter example: one 2-fold axis, two mirror planes containing it.' },
  { mol: 'NH₃', pg: 'C₃ᵥ', elements: 'E, 2C₃, 3σᵥ', chiral: false, note: 'Trigonal pyramid — umbrella symmetry.' },
  { mol: 'CO₂', pg: 'D∞ₕ', elements: 'E, C∞, S∞, σₕ, i, …', chiral: false, note: 'Linear AND centrosymmetric. Has an inversion center → IR/Raman mutual exclusion.' },
  { mol: 'HCl', pg: 'C∞ᵥ', elements: 'E, C∞, ∞σᵥ', chiral: false, note: 'Linear without an inversion center.' },
  { mol: 'BF₃', pg: 'D₃ₕ', elements: 'E, 2C₃, 3C₂, σₕ, 2S₃, 3σᵥ', chiral: false, note: 'Trigonal planar: main axis plus 3 perpendicular C₂s plus the molecular plane.' },
  { mol: 'CH₄', pg: 'T_d', elements: 'E, 8C₃, 3C₂, 6S₄, 6σ_d', chiral: false, note: 'Full tetrahedral symmetry.' },
  { mol: 'SF₆', pg: 'O_h', elements: 'E, 8C₃, 6C₄, i, …', chiral: false, note: 'Full octahedral symmetry — the most symmetric common molecule.' },
  { mol: 'XeF₄', pg: 'D₄ₕ', elements: 'E, 2C₄, C₂, i, σₕ, …', chiral: false, note: 'Square planar. The lone pairs occupy the axial spots, leaving high symmetry.' },
  { mol: 'trans-1,2-dichloroethene', pg: 'C₂ₕ', elements: 'E, C₂, i, σₕ', chiral: false, note: 'Centrosymmetric → zero dipole moment; cis isomer (C₂ᵥ) is polar. Classic compare-and-contrast.' },
  { mol: 'H₂O₂ (gauche)', pg: 'C₂', elements: 'E, C₂ only', chiral: true, note: 'Only a proper rotation → chiral! The simplest chiral molecule by symmetry.' },
  { mol: 'CHFClBr', pg: 'C₁', elements: 'E only', chiral: true, note: 'No symmetry at all — 4 different groups on carbon.' },
  { mol: 'benzene', pg: 'D₆ₕ', elements: 'E, 2C₆, …, i, σₕ', chiral: false, note: 'The aromatic reference frame.' },
  { mol: 'ferrocene (staggered)', pg: 'D₅_d', elements: 'E, 2C₅, 5C₂, i, 2S₁₀, 5σ_d', chiral: false, note: 'Sandwich compound; staggered rings give the d subscript.' },
];

function makeSymmetry(): HTMLElement {
  const out = h('div', { class: 'result' });
  const set = (v: string) => {
    const p = POINT_GROUPS[Number(v)];
    out.innerHTML = `<b class="big">${p.pg}</b> — elements: ${p.elements}<br>` +
      `${p.chiral ? '<b style="color:#ff8a6f">CHIRAL</b> (no improper axis: no σ, no i, no Sₙ)' : 'achiral (has a mirror plane, inversion center, or Sₙ)'}<p>${p.note}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('Point group identifier',
      select('molecule', POINT_GROUPS.map((p, i) => ({ value: String(i), label: p.mol })), set, '0'),
      out,
      h('h3', {}, 'The decision flowchart'),
      h('ol', {},
        h('li', {}, 'Linear? → D∞ₕ (with i) or C∞ᵥ (without).'),
        h('li', {}, 'Multiple high-order axes? → T_d (tetrahedral), O_h (octahedral), I_h (icosahedral).'),
        h('li', {}, 'Find the highest Cₙ. Are there n C₂ axes perpendicular to it? → D family; else C family.'),
        h('li', {}, 'Horizontal mirror σₕ? → add h. Else n vertical mirrors? → add v (or d for D). Neither? bare Cₙ/Dₙ.'),
        h('li', {}, 'No rotation axis at all: σ → Cₛ; i → Cᵢ; nothing → C₁.'),
      ),
      h('p', { class: 'trap' }, 'Chirality test: a molecule is chiral iff it has NO improper operation (σ, i, or Sₙ). A bare Cₙ axis is fine — chiral molecules can still have rotational symmetry!'),
    ),
    theory('Symmetry & inorganic extras', `
<ul>
<li>Dipole moment: only groups Cₙ, Cₙᵥ, Cₛ, C₁ can be polar (the dipole must lie on every symmetry element).</li>
<li>Inversion center consequences: no dipole; IR-active and Raman-active vibrations are mutually exclusive.</li>
<li>Isoelectronic reasoning: CO/N₂/NO⁺/CN⁻ all 10 valence e⁻, same MO diagram; BF₃/CO₃²⁻/NO₃⁻ same shape.</li>
<li>Boranes & 3-center-2-electron bonds (B₂H₆); silicates build from SiO₄ tetrahedra; interhalogens follow VSEPR beautifully (ICl₄⁻ square planar).</li>
<li>HSAB: hard acids (H⁺, Al³⁺, Fe³⁺) pair with hard bases (F⁻, O²⁻); soft with soft (Ag⁺ + I⁻, Hg²⁺ + S²⁻). Predicts precipitates and ore compositions.</li>
</ul>`),
  );
  set('0');
  return el;
}

// ---- Hückel aromaticity checker + conformation ----
const RINGS: { name: string; pi: number; planar: boolean; verdict: string; note: string }[] = [
  { name: 'benzene', pi: 6, planar: true, verdict: 'aromatic', note: '6 π e⁻ = 4n+2 (n=1), planar, cyclic, fully conjugated.' },
  { name: 'cyclobutadiene', pi: 4, planar: true, verdict: 'antiaromatic', note: '4 π e⁻ = 4n → destabilized; distorts to a rectangle to escape it.' },
  { name: 'cyclooctatetraene', pi: 8, planar: false, verdict: 'nonaromatic', note: '8 π e⁻ would be antiaromatic, so it puckers into a tub — non-planar, so the rule does not apply.' },
  { name: 'cyclopentadienyl anion', pi: 6, planar: true, verdict: 'aromatic', note: '6 π e⁻ over 5 carbons — the anion is aromatic (the cation, 4 e⁻, is antiaromatic).' },
  { name: 'tropylium cation (C₇H₇⁺)', pi: 6, planar: true, verdict: 'aromatic', note: '6 π e⁻ over a 7-membered ring → a stable aromatic cation.' },
  { name: 'pyridine', pi: 6, planar: true, verdict: 'aromatic', note: 'N lone pair is in an sp² orbital in the plane, NOT the π system — 6 π e⁻ from the ring.' },
  { name: 'pyrrole', pi: 6, planar: true, verdict: 'aromatic', note: 'Here the N lone pair IS donated into the π system to reach 6 — so pyrrole N is a poor base.' },
  { name: 'cyclohexane', pi: 0, planar: false, verdict: 'nonaromatic', note: 'No π system (saturated); adopts the chair conformation instead.' },
];
function makeAromaticity(): HTMLElement {
  const out = h('div', { class: 'result' });
  const set = (name: string) => {
    const r = RINGS.find(x => x.name === name)!;
    const huckel = r.pi > 0 ? (r.pi - 2) % 4 === 0 ? '4n+2 ✓' : '4n (antiaromatic count)' : 'no π system';
    out.innerHTML = `<b class="big">${r.verdict}</b><br>π electrons = ${r.pi} (${huckel}) · planar: ${r.planar ? 'yes' : 'no'}<p>${r.note}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('Hückel aromaticity checker',
      select('ring system', RINGS.map(r => ({ value: r.name, label: r.name })), set, RINGS[0].name),
      out,
      h('p', { class: 'muted' }, 'Aromatic needs ALL of: cyclic, planar, fully conjugated, and 4n+2 π electrons. Fail planarity (COT) → nonaromatic; hit 4n while planar → antiaromatic (destabilized).'),
    ),
    card('Conformational analysis (chair cyclohexane)',
      h('ul', {},
        h('li', { html: 'Chair is the low-energy conformer; ring-flip interconverts axial ↔ equatorial.' }),
        h('li', { html: 'Bulky groups prefer <b>equatorial</b> to avoid 1,3-diaxial strain — the bigger the A-value, the stronger the preference (t-Bu ≈ 4.9 kcal/mol locks the ring).' }),
        h('li', { html: '<span class="trap">E2 on cyclohexanes needs the leaving group AXIAL (anti-periplanar to a β-H)</span> — read this directly off the chair.' }),
        h('li', { html: 'Newman projections: staggered (anti &lt; gauche) beats eclipsed; torsional + steric strain set the energy profile.' }),
      ),
    ),
  );
  set(RINGS[0].name);
  return el;
}

export const organic2Tab: TabDef = {
  id: 'organic2',
  label: 'Organic II',
  group: 'Organic Chemistry',
  mount(root) {
    root.append(pills([
      { label: 'Alkene addition', el: makeAddition() },
      { label: 'EAS (aromatics)', el: makeEAS() },
      { label: 'Carbonyls', el: makeCarbonyl() },
      { label: 'Aromaticity & conformation', el: makeAromaticity() },
      { label: 'Symmetry & inorganic', el: makeSymmetry() },
      { label: 'Quiz', el: h('div', { class: 'cards' }, card('Quick quiz', quiz(ORGANIC2_QUIZ, 5)), challengeLadder('organic2')) },
    ]));
  },
};
