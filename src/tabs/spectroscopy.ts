// Advanced (CCO) — Spectroscopy (IR / NMR / MS) + advanced organic synthesis.
import { h, card, theory, select, pills, quiz, type TabDef } from './framework';
import { SPECTROSCOPY_QUIZ } from './questions3';

// ================= IR =================
const IR_BANDS: { group: string; range: string; note: string }[] = [
  { group: 'O–H (alcohol)', range: '3200–3550 (broad)', note: 'Broad, rounded — hydrogen bonding. Sharper and thinner when dilute/free.' },
  { group: 'O–H (carboxylic acid)', range: '2500–3300 (very broad)', note: 'Extremely broad hump over the C–H region — the acid dimer.' },
  { group: 'N–H (amine)', range: '3300–3500', note: '1° amine: two bands (sym+asym); 2° amine: one band; 3° amine: none.' },
  { group: 'C–H (sp³)', range: '2850–2960', note: 'Just below 3000 cm⁻¹.' },
  { group: 'C–H (sp², =C–H)', range: '3020–3100', note: 'Just above 3000 — alkene/aromatic.' },
  { group: 'C≡C / C≡N', range: '2100–2260', note: 'Weak but distinctive triple-bond stretch in an otherwise empty region.' },
  { group: 'C=O (carbonyl)', range: '1670–1780', note: 'Strong and diagnostic. Acid chloride ~1800 > ester ~1740 > ketone ~1715 > amide ~1650.' },
  { group: 'C=C (alkene)', range: '1620–1680', note: 'Weak; conjugation lowers it.' },
  { group: 'C=C (aromatic)', range: '1450–1600', note: 'Several sharp ring-stretch bands.' },
  { group: 'C–O', range: '1050–1300', note: 'Strong; alcohols, ethers, esters.' },
];

function makeIR(): HTMLElement {
  const out = h('div', { class: 'result' });
  const set = (g: string) => {
    const b = IR_BANDS.find(x => x.group === g)!;
    out.innerHTML = `<b class="big">${b.range} cm⁻¹</b><p>${b.group} — ${b.note}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('IR functional-group band finder',
      select('functional group', IR_BANDS.map(b => ({ value: b.group, label: b.group })), set, IR_BANDS[6].group),
      out,
      h('p', { class: 'muted' }, 'Read an IR left→right: check 3000 first (O–H/N–H, and sp² vs sp³ C–H), then the triple-bond window (~2200), then the carbonyl (~1700), then the fingerprint (<1500).'),
    ),
    theory('IR interpretation strategy', `
<ul>
<li>Carbonyl present? A strong 1700-ish band means C=O — then use the exact position and other bands to tell acid/ester/ketone/amide apart.</li>
<li>Broad O–H (3200–3550) = alcohol; very broad (2500–3300) over C–H = carboxylic acid.</li>
<li>The fingerprint region (&lt;1500 cm⁻¹) is unique per molecule but hard to assign band-by-band — use it to confirm identity against a reference.</li>
<li>Symmetric stretches with no dipole change are IR-inactive (e.g. the C≡C of a symmetric alkyne) — they show in Raman instead.</li>
</ul>`),
  );
  set(IR_BANDS[6].group);
  return el;
}

// ================= NMR =================
const NMR_SHIFTS: { env: string; ppm: string }[] = [
  { env: 'TMS (reference)', ppm: '0' }, { env: 'R–CH₃', ppm: '0.9' },
  { env: 'R–CH₂–R', ppm: '1.3' }, { env: 'C–CH near C=O', ppm: '2.1–2.6' },
  { env: 'R–CH₂–X (halide)', ppm: '3.4–3.8' }, { env: 'R–O–CH (ether/alcohol)', ppm: '3.3–4.0' },
  { env: 'vinyl =CH', ppm: '4.6–6.0' }, { env: 'aromatic Ar–H', ppm: '6.5–8.0' },
  { env: 'aldehyde CHO', ppm: '9.5–10.0' }, { env: 'carboxylic acid COOH', ppm: '10–12' },
];

function makeNMR(): HTMLElement {
  const nInput = h('input', { type: 'number', value: '2', min: '0', max: '9', step: '1' });
  const splitOut = h('div', { class: 'result' });
  const PATTERN = ['singlet', 'doublet', 'triplet', 'quartet', 'quintet', 'sextet', 'septet', 'octet', 'nonet', '10-plet'];
  const RATIO = ['1', '1:1', '1:2:1', '1:3:3:1', '1:4:6:4:1', '1:5:10:10:5:1', '1:6:15:20:15:6:1'];
  const splitCalc = () => {
    const n = Math.max(0, Math.min(9, Math.round(Number(nInput.value))));
    splitOut.innerHTML = `n = ${n} neighbouring H → n+1 = <b class="big">${n + 1} lines</b> (${PATTERN[n]})` +
      (n < RATIO.length ? `<br>intensity ratio ${RATIO[n]} (Pascal\'s triangle)` : '') +
      `<br><span class="muted">The n+1 rule assumes the neighbours are equivalent. Non-equivalent neighbours give more complex (multiplet) patterns with different J values.</span>`;
  };
  nInput.addEventListener('input', splitCalc);
  splitCalc();

  const shiftRows = NMR_SHIFTS.map(s => `<tr><td>${s.env}</td><td>${s.ppm}</td></tr>`).join('');
  const el = h('div', { class: 'cards' },
    card('¹H NMR — n+1 splitting predictor',
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'equivalent neighbours n'), nInput),
      splitOut,
      h('h3', {}, 'Characteristic ¹H chemical shifts'),
      h('table', { class: 'ref-table', html: `<tr><th>environment</th><th>δ (ppm)</th></tr>${shiftRows}` }),
    ),
    theory('Reading a ¹H NMR spectrum — three questions', `
<ol>
<li><b>How many signals?</b> = number of chemically distinct H environments (use molecular symmetry).</li>
<li><b>How big (integration)?</b> = relative number of H in each environment (the ethyl 3:2 ratio, etc.).</li>
<li><b>What shape (splitting)?</b> = n+1 from equivalent neighbours. A clean triplet+quartet (3:2) is the ethyl fingerprint; a doublet+septet is isopropyl.</li>
</ol>
<ul>
<li>Chemical shift is field-independent (ppm); coupling constant J is a fixed through-bond energy in Hz.</li>
<li>Deshielding (higher δ) comes from nearby electronegative atoms and π-systems (aromatic ring current, carbonyl).</li>
<li>O–H/N–H protons are variable and exchange with D₂O (their peak vanishes on a D₂O shake).</li>
<li>¹³C NMR: one signal per inequivalent carbon; DEPT distinguishes CH₃/CH₂/CH/quaternary.</li>
</ul>`),
  );
  return el;
}

// ================= MS =================
function makeMS(): HTMLElement {
  const formula = h('input', { type: 'text', value: 'C4H8O' });
  const out = h('div', { class: 'result' });
  function parse(f: string): Record<string, number> | null {
    const counts: Record<string, number> = {};
    const re = /([A-Z][a-z]?)(\d*)/g;
    let m: RegExpExecArray | null, matched = false;
    while ((m = re.exec(f)) !== null) {
      if (!m[1]) continue;
      matched = true;
      counts[m[1]] = (counts[m[1]] ?? 0) + (m[2] ? parseInt(m[2]) : 1);
    }
    return matched ? counts : null;
  }
  const MASS: Record<string, number> = { C: 12, H: 1.008, N: 14.003, O: 15.995, Cl: 34.969, Br: 78.918, S: 31.972, F: 18.998, P: 30.974 };
  const calc = () => {
    const c = parse(formula.value.trim());
    if (!c) { out.innerHTML = 'Enter a formula like C4H8O or C6H5Cl.'; return; }
    const C = c.C ?? 0, H = c.H ?? 0, N = c.N ?? 0, X = (c.Cl ?? 0) + (c.Br ?? 0) + (c.F ?? 0);
    const dou = (2 * C + 2 + N - H - X) / 2;
    let M = 0; for (const [el, n] of Object.entries(c)) M += (MASS[el] ?? 0) * n;
    const nominal = Math.round(M);
    const nitrogenOdd = nominal % 2 === 1;
    const halogenNote = c.Cl ? 'Cl present → M+2 peak ~⅓ of M (³⁵Cl:³⁷Cl ≈ 3:1).' :
      c.Br ? 'Br present → M+2 peak ≈ M (⁷⁹Br:⁸¹Br ≈ 1:1).' : 'No Cl/Br → no strong M+2 isotope cluster.';
    out.innerHTML =
      `Molecular ion M⁺ ≈ <b class="big">${nominal}</b> (exact ${M.toFixed(3)})<br>` +
      `Degrees of unsaturation = (2·${C}+2+${N}−${H}−${X})/2 = <b>${dou}</b> ${dou < 0 || dou % 1 !== 0 ? '<span class="trap">(non-integer/negative → check the formula or charge)</span>' : dou === 0 ? '(saturated, acyclic)' : `(${dou} ring(s) and/or π bond(s))`}<br>` +
      `Nitrogen rule: odd M⁺ ⇒ odd number of N. Here M⁺ is ${nitrogenOdd ? 'ODD → expect an odd N count' : 'even → even (or zero) N count'}.<br>` +
      `<span class="muted">${halogenNote} Common losses from M⁺: −15 (CH₃), −18 (H₂O), −28 (CO/C₂H₄), −29 (CHO/C₂H₅), −45 (COOH).</span>`;
  };
  formula.addEventListener('input', calc);
  calc();
  const el = h('div', { class: 'cards' },
    card('Mass spec — DoU, nitrogen rule, isotopes',
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'molecular formula'), formula),
      out,
    ),
    theory('Mass spectrometry essentials', `
<ul>
<li><b>Molecular ion (M⁺):</b> the intact molecule minus one electron → gives molar mass. The base peak (100%) is the most abundant fragment, not necessarily M⁺.</li>
<li><b>Degrees of unsaturation</b> = (2C+2+N−H−X)/2 — each ring or π bond counts one; a benzene ring is 4.</li>
<li><b>Nitrogen rule:</b> odd nominal M⁺ ⇒ odd number of nitrogen atoms.</li>
<li><b>Isotope clusters:</b> Cl gives M:M+2 ≈ 3:1; Br ≈ 1:1; the ¹³C contribution to M+1 is ~1.1% per carbon (counts the carbons!).</li>
<li><b>Fragmentation</b> favours stable cations (allylic, benzylic, 3°, acylium) and neutral-loss of small stable molecules.</li>
</ul>`),
  );
  return el;
}

// ================= ADVANCED SYNTHESIS =================
const REACTIONS: { name: string; does: string }[] = [
  { name: 'Grignard (RMgX + C=O)', does: 'Forms a new C–C bond; aldehyde→2° alcohol, ketone→3° alcohol, ester→3° alcohol (2 R added), CO₂→carboxylic acid. Destroyed by any O–H/N–H.' },
  { name: 'Wittig (ylide + C=O)', does: 'Ph₃P=CR₂ + aldehyde/ketone → alkene + Ph₃P=O. Positions the C=C exactly where the carbonyl was.' },
  { name: 'Aldol condensation', does: 'Enolate attacks a second carbonyl → β-hydroxy carbonyl; heat/base dehydrates to the conjugated enone (E1cb).' },
  { name: 'Claisen condensation', does: 'Ester enolate attacks a second ester → β-keto ester (e.g. ethyl acetoacetate). Needs an α-H and a full equivalent of base.' },
  { name: 'Diels–Alder [4+2]', does: 's-cis diene + dienophile → cyclohexene. Thermally allowed (6 π e⁻), suprafacial, endo-selective, stereospecific.' },
  { name: 'Friedel–Crafts acylation', does: 'ArH + RCOCl/AlCl₃ → aryl ketone. No rearrangement (acylium is stable); fails on strongly deactivated rings.' },
  { name: 'Michael addition', does: 'A stabilized nucleophile (enolate) adds 1,4 to an α,β-unsaturated carbonyl — conjugate addition, forming a 1,5-dicarbonyl.' },
  { name: 'Reductive amination', does: 'Aldehyde/ketone + amine → imine, then NaBH₃CN reduces it to an amine. The workhorse C–N bond-forming route.' },
  { name: 'Ozonolysis (O₃ then Zn)', does: 'Cleaves C=C into two carbonyls — a retro-diagnostic for locating double bonds.' },
];

function makeSynthesis(): HTMLElement {
  const out = h('div', { class: 'result' });
  const set = (name: string) => {
    const r = REACTIONS.find(x => x.name === name)!;
    out.innerHTML = `<b>${r.name}</b><p>${r.does}</p>`;
  };
  const el = h('div', { class: 'cards' },
    card('Named-reaction & synthesis map',
      select('reaction', REACTIONS.map(r => ({ value: r.name, label: r.name })), set, REACTIONS[0].name),
      out,
      h('p', { class: 'muted' }, 'Retrosynthesis: identify the target\'s key C–C bonds, disconnect (⇒) to synthons, and map each disconnection to a forward reaction above.'),
    ),
    theory('Advanced synthesis & pericyclic reactions', `
<h4>Pericyclic reactions (Woodward–Hoffmann)</h4>
<ul>
<li><b>Cycloadditions:</b> count π electrons. 4n+2 (e.g. 6, Diels–Alder) → thermal supra-supra allowed; 4n (e.g. 2+2) → photochemical only.</li>
<li><b>Electrocyclic:</b> 6 π e⁻ thermal = disrotatory; photochemical = conrotatory (rules invert with electron count and with light).</li>
<li><b>Sigmatropic:</b> [3,3] shifts (Cope, Claisen) proceed through a chair-like 6-membered TS.</li>
</ul>
<h4>Protecting groups</h4>
<ul>
<li>Alcohols → silyl ethers (TBS), removed by F⁻ (TBAF); or acetals for carbonyls, removed by aqueous acid.</li>
<li>Amines → carbamates (Boc, removed by acid; Cbz, removed by hydrogenation).</li>
<li>Protect, do the incompatible step, deprotect — essential when a reagent (Grignard, LiAlH₄) would attack an unprotected group.</li>
</ul>
<h4>Strategy</h4>
<ul>
<li>Match oxidation-state changes to reagents; control regio-/stereochemistry (Markovnikov vs anti-Markovnikov, syn vs anti addition).</li>
<li>Enolate chemistry (aldol, Claisen, Michael, malonic/acetoacetic ester) builds most C–C bonds in multistep synthesis.</li>
<li><b>Amines & diazonium:</b> reductive amination and the Gabriel synthesis make amines; aryl diazonium salts (ArN₂⁺, from ArNH₂ + HNO₂/0 °C) undergo substitution (→ ArOH, ArCN, ArX via Sandmeyer) and azo coupling (→ dyes).</li>
<li><b>Classic rearrangements:</b> carbocation (hydride/methyl shifts), pinacol (1,2-diol → ketone), Beckmann (oxime → amide), Hofmann/Curtius (→ amine with loss of one carbon).</li>
</ul>`),
  );
  set(REACTIONS[0].name);
  return el;
}

export const spectroscopyTab: TabDef = {
  id: 'spectroscopy',
  label: 'Spectroscopy & Synthesis',
  group: 'Advanced (CCO)',
  mount(root) {
    root.append(pills([
      { label: 'IR', el: makeIR() },
      { label: '¹H NMR', el: makeNMR() },
      { label: 'Mass spec', el: makeMS() },
      { label: 'Synthesis', el: makeSynthesis() },
      { label: 'Quiz', el: h('div', { class: 'cards' }, card('Quick quiz — spectroscopy & synthesis', quiz(SPECTROSCOPY_QUIZ, 5))) },
    ]));
  },
};
