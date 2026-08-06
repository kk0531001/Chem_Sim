// Spectroscopy — structure determination: degrees of unsaturation, mass-spec
// interpretation (isotopes, nitrogen rule, fragment losses), an IR functional-
// group checklist, combined IR+NMR+MS unknowns, and reference tables.
import { h, card, theory, slider, quiz, type TabDef } from './framework';
import { challengeLadder } from './challenge';
import { STRUCTURE_QUIZ } from './questions7';

// ---- molecular formula / DoU analyzer ----
function makeFormula(): HTMLElement {
  let C = 4, H = 8, N = 0, O = 1, X = 0;
  const out = h('div', { class: 'result' });
  function draw(): void {
    const dou = (2 * C + 2 + N - H - X) / 2;
    // nominal mass (most abundant isotopes)
    const mass = C * 12 + H * 1 + N * 14 + O * 16 + X * 35; // X≈Cl for parity demo
    const nRuleOdd = mass % 2 === 1;
    out.innerHTML =
      `<span class="eq">\\(\\text{DoU} = \\dfrac{2C + 2 + N - H - X}{2}\\)</span>` +
      `DoU = (2·${C} + 2 + ${N} − ${H} − ${X})/2 = <b class="big">${dou}</b> ` +
      (dou < 0 ? '<span class="trap">Negative → impossible formula (too many H). Check your counts.</span>'
        : dou === 0 ? '→ saturated (no rings or π bonds).'
          : dou >= 4 ? '→ 4+ often means a benzene ring (3 π + 1 ring).'
            : `→ ${dou} ring(s) and/or π bond(s).`) +
      `<br>Nominal mass ≈ <b>${mass}</b>. Nitrogen rule: an ${nRuleOdd ? 'ODD' : 'EVEN'} M⁺ mass ⇒ ${N % 2 === 1 ? 'consistent with an ODD number of N (✓)' : 'zero or an EVEN number of N (✓)'}.<br>` +
      `<span class="muted">Each ring or π bond removes 2 H from the saturated C_nH_(2n+2) formula. Oxygen doesn\'t affect DoU; N adds +1, halogen subtracts 1 in the numerator.</span>`;
  }
  const el = card('Molecular formula → degrees of unsaturation',
    slider({ label: 'carbons (C)', min: 1, max: 20, step: 1, value: C, onInput: v => { C = v; draw(); } }),
    slider({ label: 'hydrogens (H)', min: 0, max: 42, step: 1, value: H, onInput: v => { H = v; draw(); } }),
    slider({ label: 'nitrogens (N)', min: 0, max: 4, step: 1, value: N, onInput: v => { N = v; draw(); } }),
    slider({ label: 'oxygens (O)', min: 0, max: 6, step: 1, value: O, onInput: v => { O = v; draw(); } }),
    slider({ label: 'halogens (X)', min: 0, max: 4, step: 1, value: X, onInput: v => { X = v; draw(); } }),
    out,
  );
  draw();
  return el;
}

// ---- mass spec toolkit ----
function makeMassSpec(): HTMLElement {
  let m1 = 4.4; // M+1 % relative to M
  const cOut = h('div', { class: 'result' });
  function cCalc(): void {
    const nC = Math.round(m1 / 1.1);
    cOut.innerHTML =
      `M+1 ≈ 1.1% × (number of C). Observed M+1 = ${m1.toFixed(1)}% → about <b class="big">${nC} carbon(s)</b>.<br>` +
      `<span class="muted">Each ¹³C (1.1% natural abundance) adds one mass unit — a rough carbon count from the isotope peak.</span>`;
  }
  const el = card('Mass spectrometry toolkit',
    h('h3', {}, 'Carbon count from the M+1 peak'),
    slider({ label: 'M+1 intensity (% of M)', min: 0, max: 22, step: 0.1, value: m1, fmt: v => v.toFixed(1), onInput: v => { m1 = v; cCalc(); } }),
    cOut,
    h('h3', {}, 'Isotope patterns (M / M+2)'),
    h('table', { class: 'ref-table', html: `
<tr><th>M+2 : M ratio</th><th>indicates</th></tr>
<tr><td>≈ 1 : 1</td><td>one Br (⁷⁹Br/⁸¹Br ≈ 50:50)</td></tr>
<tr><td>≈ 1 : 3</td><td>one Cl (³⁵Cl/³⁷Cl ≈ 24:76)</td></tr>
<tr><td>~4% of M</td><td>one S (³⁴S)</td></tr>
<tr><td>odd M⁺ mass</td><td>odd number of N (nitrogen rule)</td></tr></table>` }),
    h('h3', {}, 'Common neutral losses (M − fragment)'),
    h('table', { class: 'ref-table', html: `
<tr><th>Δm</th><th>lost fragment</th></tr>
<tr><td>15</td><td>•CH₃ (methyl)</td></tr>
<tr><td>17 / 18</td><td>•OH / H₂O</td></tr>
<tr><td>28</td><td>CO or C₂H₄ (or N₂)</td></tr>
<tr><td>29</td><td>•CHO or •C₂H₅</td></tr>
<tr><td>31</td><td>•OCH₃</td></tr>
<tr><td>45</td><td>•COOH / •OC₂H₅</td></tr>
<tr><td>77 / 91</td><td>C₆H₅⁺ (phenyl) / C₇H₇⁺ (tropylium, benzylic)</td></tr>
<tr><td>43</td><td>CH₃CO⁺ (acylium) or C₃H₇⁺</td></tr></table>` }),
    h('p', { class: 'muted' }, 'The base peak (100%) is the most stable/abundant fragment (often acylium or tropylium), not necessarily M⁺.'),
  );
  cCalc();
  return el;
}

// ---- IR checklist ----
function makeIRChecklist(): HTMLElement {
  const BANDS = [
    { id: 'oh_broad', label: 'broad 3200–3550 (rounded)', group: 'O–H alcohol' },
    { id: 'oh_acid', label: 'very broad 2500–3300', group: 'O–H carboxylic acid (+ C=O ~1710)' },
    { id: 'nh', label: '3300–3500 (1–2 bands)', group: 'N–H amine/amide (2 bands = 1° amine)' },
    { id: 'ch', label: '2850–3100', group: 'C–H (>3000 = sp²/aromatic, <3000 = sp³)' },
    { id: 'triple', label: '2100–2260 (sharp, weak)', group: 'C≡C / C≡N' },
    { id: 'co', label: '1670–1780 (strong)', group: 'C=O carbonyl' },
    { id: 'cc', label: '1450–1680', group: 'C=C alkene / aromatic ring' },
    { id: 'cofinger', label: '1050–1300 (strong)', group: 'C–O (alcohol/ether/ester)' },
  ];
  const out = h('div', { class: 'result' });
  const state: Record<string, boolean> = {};
  function draw(): void {
    const on = BANDS.filter(b => state[b.id]);
    out.innerHTML = on.length
      ? 'Likely groups present:<ul>' + on.map(b => `<li><b>${b.group}</b> — ${b.label} cm⁻¹</li>`).join('') + '</ul>' +
        (state.co && state.oh_acid ? '<span class="muted">Broad O–H + carbonyl ⇒ carboxylic acid.</span>' :
         state.co && !state.oh_broad && !state.oh_acid && !state.nh ? '<span class="muted">Carbonyl with no O–H/N–H ⇒ ketone, aldehyde, or ester (check C–O + a δ 9.7 NMR peak for aldehyde).</span>' : '')
      : '<span class="muted">Toggle the bands you see in the IR spectrum to list the functional groups they imply.</span>';
  }
  const boxes = BANDS.map(b => {
    const cb = h('input', { type: 'checkbox' });
    cb.addEventListener('change', () => { state[b.id] = cb.checked; draw(); });
    return h('label', { class: 'ctl' }, h('span', { class: 'ctl-label' }, `${b.label} — ${b.group}`), cb);
  });
  const el = card('IR band checklist → functional groups', ...boxes, out);
  draw();
  return el;
}

// ---- combined unknowns ----
function unknown(title: string, data: string, answer: string): HTMLElement {
  const ans = h('div', { class: 'result', html: answer });
  ans.style.display = 'none';
  const btn = h('button', { class: 'btn primary', onclick: () => { ans.style.display = ans.style.display === 'none' ? '' : 'none'; } }, 'Show / hide solution');
  return h('div', { class: 'card', style: 'background:transparent;box-shadow:none;padding:0' },
    h('h3', {}, title), h('div', { html: data }), btn, ans);
}

function makeCombined(): HTMLElement {
  return card('Combined IR + NMR + MS unknowns',
    h('p', { class: 'muted' }, 'Strategy: (1) molecular formula from MS → degrees of unsaturation; (2) IR → functional groups; (3) ¹H NMR shifts, integration & splitting → assemble the skeleton; (4) check against the formula.'),
    unknown('Unknown A',
      'MS: M⁺ = 58 (even → 0 or even N). IR: strong 1715 cm⁻¹, no O–H/N–H. ¹H NMR: singlet, 6H, δ 2.1.',
      'C₃H₆O (M = 58), DoU = 1 = one C=O (IR 1715, no O–H). A 6H singlet with no coupling = two equivalent CH₃ on the carbonyl. ⇒ <b>acetone, CH₃COCH₃</b>.'),
    unknown('Unknown B',
      'MS: M⁺ = 60, broad M-region. IR: very broad 2500–3300 + strong 1710 cm⁻¹. ¹H NMR: δ 11.4 (1H, s), δ 2.1 (3H, s).',
      'C₂H₄O₂ (M = 60), DoU = 1. Broad O–H (2500–3300) + C=O = carboxylic acid; downfield 1H (δ 11.4) = COOH, 3H singlet = CH₃. ⇒ <b>acetic acid, CH₃COOH</b>.'),
    unknown('Unknown C',
      'MS: M⁺ = 106, base peak m/z 105, fragment 77. IR: strong 1685 cm⁻¹, C–H > 3000. ¹H NMR: δ 7.4–8.1 (5H, m), δ 9.9 (1H, s).',
      'C₇H₆O (M = 106), DoU = 5 (a ring + carbonyl). 5H aromatic multiplet = monosubstituted ring; δ 9.9 = aldehyde CHO; fragment 77 = phenyl; loss of 1 → 105 = benzoyl cation C₆H₅CO⁺; conjugated C=O ~1685. ⇒ <b>benzaldehyde, C₆H₅CHO</b>.'),
    unknown('Unknown D',
      'MS: M⁺ = 112 with M+2 ≈ ⅓ of M. IR: aromatic C–H (>3000), ring bands ~1580–1600, no C=O. ¹H NMR: multiplet, 5H, δ 7.2–7.4.',
      'M+2 ≈ ⅓ M ⇒ one <b>chlorine</b> (³⁵Cl/³⁷Cl ≈ 3:1). M = 112 = C₆H₅Cl (77 + 35). Aromatic-only H, no carbonyl. ⇒ <b>chlorobenzene, C₆H₅Cl</b>. Read the isotope doublet first — it hands you the halogen.'),
  );
}

// ---- NMR reference ----
function makeNMRRef(): HTMLElement {
  return card('¹H NMR reference (shifts, splitting, patterns)',
    h('table', { class: 'ref-table', html: `
<tr><th>δ (ppm)</th><th>proton type</th></tr>
<tr><td>0.9–1.5</td><td>alkyl C–H (CH₃, CH₂)</td></tr>
<tr><td>2.1–2.6</td><td>α to C=O; benzylic</td></tr>
<tr><td>3.3–4.0</td><td>C–H next to O/N/halogen (–OCH₃ ~3.8)</td></tr>
<tr><td>4.5–6.5</td><td>vinyl =C–H</td></tr>
<tr><td>6.5–8.0</td><td>aromatic</td></tr>
<tr><td>9.5–10</td><td>aldehyde CHO</td></tr>
<tr><td>10–12 (broad)</td><td>carboxylic acid O–H</td></tr></table>` }),
    h('ul', {},
      h('li', {}, 'n+1 rule: n equivalent neighbours → n+1 lines. Integration = relative H count.'),
      h('li', {}, 'Signature patterns: 3H triplet + 2H quartet = ethyl; 9H singlet = t-Bu; 6H doublet = isopropyl; 3H singlet ~3.8 = OCH₃.'),
      h('li', {}, 'Coupling constant J is field-independent: trans-alkene J 12–18 Hz > cis 6–12 Hz (Karplus links ³J to dihedral angle).'),
      h('li', {}, '¹³C: number of signals = inequivalent carbons (symmetry probe); DEPT sorts CH/CH₂/CH₃/quaternary.'),
    ),
  );
}

export const structureTab: TabDef = {
  id: 'structure',
  mount(root) {
    root.append(
      h('div', { class: 'cards' },
        makeFormula(), makeMassSpec(), makeIRChecklist(), makeNMRRef(), makeCombined(),
        card('Quick quiz', quiz(STRUCTURE_QUIZ, 5)),
        challengeLadder('structure'),
      ),
      theory('Theory — structure determination', `
<h4>Step 1 — molecular formula & DoU</h4>
<span class="eq">\\(\\text{DoU} = \\dfrac{2C + 2 + N - H - X}{2}\\)</span>
<ul><li>From MS (M⁺, isotopes, M+1 carbon count) or combustion analysis. Each ring/π bond = 1 DoU; 4 often means a benzene ring. Nitrogen rule: odd M⁺ ⇒ odd number of N.</li></ul>
<h4>Step 2 — mass spectrometry</h4>
<ul><li>M⁺ = molar mass; base peak = most abundant fragment. Isotopes: Br → 1:1 M/M+2, Cl → 3:1, S → M+2 ~4%. M+1 ≈ 1.1%×(#C).</li>
<li>Diagnostic losses: 15 (CH₃), 17/18 (OH/H₂O), 28 (CO), 29 (CHO/C₂H₅), 45 (COOH); 77 phenyl, 91 tropylium, 43 acylium.</li></ul>
<h4>Step 3 — infrared (functional groups)</h4>
<ul><li>O–H alcohol (broad 3200–3550), acid (very broad 2500–3300), N–H (3300–3500, two bands = 1° amine), C–H (±3000 = sp²/sp³), C≡ (2100–2260), C=O (1670–1780, strong), C=C (1450–1680), C–O (1050–1300).</li>
<li>Carbonyl position: acid chloride ~1800 &gt; ester ~1740 &gt; ketone ~1715 &gt; amide ~1650; conjugation lowers it.</li></ul>
<h4>Step 4 — NMR (the skeleton)</h4>
<ul><li>¹H: chemical shift = environment, integration = #H, n+1 splitting = neighbours, J = geometry. ¹³C/DEPT = carbon count and CH multiplicity.</li>
<li>Assemble fragments consistent with the formula and DoU; verify every atom and every degree of unsaturation is accounted for.</li></ul>`, true),
    );
  },
};
