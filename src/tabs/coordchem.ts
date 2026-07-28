// Inorganic — coordination & organometallic chemistry: HSAB, Jahn–Teller,
// ligand substitution (labile/inert + trans effect), the chelate/macrocyclic
// effect, isomerism, and 18-electron counting.
import { h, card, theory, slider, select, quiz, type TabDef } from './framework';
import { COORDCHEM_QUIZ } from './questions6';

// ---- Jahn-Teller predictor ----
function makeJahnTeller(): HTMLElement {
  // For octahedral: t2g (3 orbitals) then eg (2 orbitals). Strong JT = uneven eg.
  let d = 9, spin: 'high' | 'low' = 'high';
  const out = h('div', { class: 'result' });
  function occ(d: number, spin: string): { t2g: number; eg: number } {
    // fill order high-spin: t2g up to 3, eg up to 2, then pair t2g, then eg
    if (spin === 'high') {
      const t2gSingles = Math.min(d, 3);
      const egSingles = Math.min(Math.max(d - 3, 0), 2);
      const rest = Math.max(d - 5, 0);
      const t2gPairs = Math.min(rest, 3);
      const egPairs = Math.max(rest - 3, 0);
      return { t2g: t2gSingles + t2gPairs, eg: egSingles + egPairs };
    } else {
      // low-spin: fill t2g fully (6) first
      const t2g = Math.min(d, 6);
      const eg = Math.max(d - 6, 0);
      return { t2g, eg };
    }
  }
  function verdict(d: number, spin: string): string {
    const { t2g, eg } = occ(d, spin);
    // strong JT: uneven eg occupancy (1 or 3 electrons in eg)
    const egUneven = eg % 2 === 1;
    // weak JT: uneven t2g occupancy
    const t2gUneven = t2g % 3 !== 0;
    if (egUneven) return `<b class="big">STRONG</b> Jahn–Teller distortion (uneven e_g — orbitals point AT the ligands). t₂g<sup>${t2g}</sup>e_g<sup>${eg}</sup>. Typical of d⁹ (Cu²⁺) and high-spin d⁴ (Mn³⁺): tetragonal elongation.`;
    if (t2gUneven) return `<b>weak</b> Jahn–Teller distortion (uneven t₂g — orbitals point BETWEEN ligands). t₂g<sup>${t2g}</sup>e_g<sup>${eg}</sup>. Small effect, often not observed.`;
    return `<b>no</b> Jahn–Teller distortion — symmetric occupation. t₂g<sup>${t2g}</sup>e_g<sup>${eg}</sup>.`;
  }
  function draw(): void {
    out.innerHTML = verdict(d, spin) +
      `<br><span class="muted">The theorem: a non-linear complex in a degenerate electronic state distorts to lift the degeneracy and lower its energy. e_g points along the M–L axes, so uneven e_g gives the big effect.</span>`;
  }
  const el = card('Jahn–Teller distortion predictor (octahedral)',
    slider({ label: 'd-electron count', min: 0, max: 10, step: 1, value: d, fmt: v => `d${v}`, onInput: v => { d = v; draw(); } }),
    select('spin state', [{ value: 'high', label: 'high-spin' }, { value: 'low', label: 'low-spin' }], v => { spin = v as 'high' | 'low'; draw(); }, spin),
    out,
  );
  draw();
  return el;
}

// ---- 18-electron counter ----
function makeElectronCount(): HTMLElement {
  // covalent (neutral) method
  const METALS: Record<string, number> = { Cr: 6, Mn: 7, Fe: 8, Co: 9, Ni: 10, Mo: 6, W: 6, Rh: 9, Ir: 9, Pt: 10 };
  // ligand covalent-method electron donations
  const LIGANDS: { name: string; e: number }[] = [
    { name: 'CO', e: 2 }, { name: 'PR₃ (phosphine)', e: 2 }, { name: 'H (hydride)', e: 1 },
    { name: 'Cl / Br (X)', e: 1 }, { name: 'CH₃ / R (alkyl)', e: 1 }, { name: 'NH₃ / H₂O', e: 2 },
    { name: 'η²-alkene', e: 2 }, { name: 'η³-allyl', e: 3 }, { name: 'η⁵-Cp', e: 5 }, { name: 'η⁶-arene', e: 6 },
    { name: '=O / =CR₂ (double)', e: 2 },
  ];
  let metal = 'Fe', charge = 0;
  const counts: Record<string, number> = { CO: 0, 'η⁵-Cp': 2 };
  const out = h('div', { class: 'result' });
  const ligRows = h('div', {});
  function compute(): void {
    let total = METALS[metal] - charge; // covalent method: subtract complex charge
    let terms = `${metal}(${METALS[metal]})${charge ? ` − charge ${charge}` : ''}`;
    for (const L of LIGANDS) {
      const n = counts[L.name] || 0;
      if (n > 0) { total += n * L.e; terms += ` + ${n}×${L.name}(${L.e})`; }
    }
    out.innerHTML =
      `<span class="eq">covalent (neutral) count: metal group e⁻ − charge + Σ ligand donations</span>` +
      `${terms} = <b class="big">${total} e⁻</b><br>` +
      (total === 18 ? '<b>18 electrons</b> — coordinatively saturated & typically stable (e.g. Fe(Cp)₂, Ni(CO)₄, Cr(CO)₆).'
        : total === 16 ? '16 electrons — common for square-planar d⁸ (Pt/Pd/Rh/Ir); a reactive open site for catalysis.'
          : total < 18 ? `${18 - total} e⁻ short — unsaturated; can bind more ligands or do oxidative addition.`
            : `${total - 18} e⁻ over 18 — unusual; expect lability or non-innocent bonding.`);
  }
  function rebuild(): void {
    ligRows.replaceChildren(...LIGANDS.map(L =>
      slider({ label: `# ${L.name} (${L.e}e)`, min: 0, max: 6, step: 1, value: counts[L.name] || 0, onInput: v => { counts[L.name] = v; compute(); } })));
  }
  const el = card('18-electron rule — electron counter',
    select('metal (group e⁻, covalent method)', Object.keys(METALS).map(m => ({ value: m, label: `${m} (${METALS[m]})` })), v => { metal = v; compute(); }, metal),
    select('complex charge', ['-2', '-1', '0', '1', '2'].map(c => ({ value: c, label: c })), v => { charge = Number(v); compute(); }, '0'),
    ligRows, out,
    h('p', { class: 'muted' }, 'Set the sliders to your complex. Ferrocene = Fe + 2×η⁵-Cp = 8 + 10 = 18. Ni(CO)₄ = 10 + 8 = 18. Cr(CO)₆ = 6 + 12 = 18.'),
  );
  rebuild();
  compute();
  return el;
}

// ---- HSAB reference ----
function makeHSAB(): HTMLElement {
  return card('HSAB — hard & soft acids and bases',
    h('p', {}, '"Hard likes hard, soft likes soft." Hard = small, high charge, low polarizability (ionic bonding); soft = large, polarizable (covalent bonding).'),
    h('table', { class: 'ref-table', html: `
<tr><th></th><th>hard</th><th>borderline</th><th>soft</th></tr>
<tr><td>acids (metals)</td><td>H⁺, Li⁺, Na⁺, Mg²⁺, Al³⁺, Ti⁴⁺, Cr³⁺, Fe³⁺</td><td>Fe²⁺, Co²⁺, Ni²⁺, Cu²⁺, Zn²⁺, Pb²⁺</td><td>Cu⁺, Ag⁺, Au⁺, Hg²⁺, Pd²⁺, Pt²⁺, Cd²⁺</td></tr>
<tr><td>bases (donors)</td><td>F⁻, OH⁻, O²⁻, NH₃, H₂O, NO₃⁻, CO₃²⁻</td><td>Br⁻, N₃⁻, pyridine, SO₃²⁻</td><td>I⁻, R₂S, R₃P, CN⁻, CO, H⁻</td></tr></table>` }),
    h('ul', {},
      h('li', {}, 'Predicts stability/solubility: soft–soft Ag⁺–I⁻ → AgI is very insoluble; hard–soft Ag⁺–F⁻ mismatch → AgF soluble.'),
      h('li', {}, 'High-oxidation-state (hard) metals pair with hard O/F donors (MnO₄⁻, CrO₄²⁻); low-oxidation-state metals with soft CO/phosphines.'),
      h('li', {}, 'Explains biological targeting: soft Hg²⁺/Cd²⁺/Pb²⁺ bind soft protein thiols (–SH).'),
    ),
  );
}

// ---- ligand substitution + chelate ----
function makeSubstitution(): HTMLElement {
  return card('Ligand substitution, lability & the chelate effect',
    h('h3', {}, 'Labile vs inert (kinetic)'),
    h('ul', {},
      h('li', {}, 'Inert (slow exchange): d³ and low-spin d⁶ (e.g. Cr³⁺, Co³⁺, Pt²⁺) — high crystal-field activation energy.'),
      h('li', {}, 'Labile (fast): d⁰, d¹⁰, high-spin d⁴–d⁷, and ions with small CFSE.'),
      h('li', {}, 'Mechanisms: associative (A, higher-coordinate TS), dissociative (D), or interchange (Iₐ/I_d).'),
    ),
    h('h3', {}, 'The trans effect (square-planar Pt(II))'),
    h('p', {}, 'A ligand labilizes the group TRANS to it. Series (weak → strong): H₂O < NH₃ < Cl⁻ < Br⁻ < I⁻ < NO₂⁻ < PR₃ ≈ CO ≈ CN⁻ ≈ C₂H₄.'),
    h('p', { class: 'muted' }, 'Used to build cisplatin selectively: Cl⁻ out-directs NH₃, so the second NH₃ enters trans to a Cl, giving the cis isomer.'),
    h('h3', {}, 'Chelate & macrocyclic effects'),
    h('ul', {},
      h('li', {}, 'Chelate effect: polydentate ligands bind more strongly — mainly ENTROPY (more free particles released). [Ni(en)₃]²⁺ ≫ [Ni(NH₃)₆]²⁺.'),
      h('li', {}, 'Five-membered chelate rings are the most stable (low strain, good bite angle).'),
      h('li', {}, 'Macrocyclic effect: preorganized cyclic ligands (crown ethers, porphyrins, EDTA) bind even tighter than open-chain analogues.'),
    ),
  );
}

// ---- isomerism ----
function makeIsomerism(): HTMLElement {
  return card('Advanced coordination — isomerism',
    h('table', { class: 'ref-table', html: `
<tr><th>type</th><th>description</th><th>example</th></tr>
<tr><td>geometric</td><td>cis / trans, fac / mer</td><td>[Pt(NH₃)₂Cl₂], [Co(NH₃)₃Cl₃]</td></tr>
<tr><td>optical</td><td>non-superimposable mirror images (Δ/Λ)</td><td>[Co(en)₃]³⁺</td></tr>
<tr><td>linkage</td><td>ambidentate ligand binds via different atoms</td><td>NO₂⁻ (nitro) vs ONO⁻ (nitrito); SCN⁻/NCS⁻</td></tr>
<tr><td>ionization</td><td>swap coordinated vs counter-ion</td><td>[Co(NH₃)₅Br]SO₄ vs [Co(NH₃)₅SO₄]Br</td></tr>
<tr><td>coordination</td><td>ligand distribution between two metals</td><td>[Co(NH₃)₆][Cr(CN)₆] vs [Cr(NH₃)₆][Co(CN)₆]</td></tr>
<tr><td>hydrate</td><td>water inside vs outside the sphere</td><td>[Cr(H₂O)₆]Cl₃ vs [Cr(H₂O)₅Cl]Cl₂·H₂O</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Nomenclature: ligands alphabetical, prefixes di/tri (bis/tris for complex names), oxidation state in Roman numerals; the whole complex ion is named as one word.'),
  );
}

export const coordChemTab: TabDef = {
  id: 'coordchem',
  label: 'Coordination & Organometallic',
  group: 'Inorganic Chemistry',
  mount(root) {
    root.append(
      h('div', { class: 'cards' },
        makeHSAB(), makeJahnTeller(), makeSubstitution(), makeIsomerism(), makeElectronCount(),
        card('Quick quiz', quiz(COORDCHEM_QUIZ, 5)),
      ),
      theory('Theory — coordination & organometallic chemistry', `
<h4>HSAB</h4>
<ul><li>Hard–hard (ionic) and soft–soft (covalent) pairings are most stable. Rationalizes solubility (AgI ≪ AgF), oxidation-state/ligand matching, and toxicology (soft metals → thiols).</li></ul>
<h4>Jahn–Teller</h4>
<ul><li>A degenerate ground state distorts to lift degeneracy. STRONG for uneven e_g (d⁹ Cu²⁺, HS d⁴ Mn³⁺) — tetragonal elongation; WEAK for uneven t₂g.</li></ul>
<h4>Ligand substitution</h4>
<ul><li>Labile vs inert is KINETIC: d³ and low-spin d⁶ are inert (high CFAE). Associative / dissociative / interchange mechanisms.</li>
<li>Trans effect (Pt II): a strong trans-director (CN⁻, CO, C₂H₄ &gt; halides &gt; NH₃) labilizes the ligand opposite it — used to make cis/trans isomers selectively.</li></ul>
<h4>Chelate & macrocyclic effects</h4>
<span class="eq">chelate stability is entropy-driven: more free particles released on binding</span>
<ul><li>Polydentate &gt; monodentate; 5-membered rings optimal; preorganized macrocycles (EDTA, porphyrin, crown) bind tightest.</li></ul>
<h4>Isomerism</h4>
<ul><li>Geometric (cis/trans, fac/mer), optical (Δ/Λ), linkage (ambidentate), ionization, coordination, hydrate.</li></ul>
<h4>Organometallic — the 18-electron rule</h4>
<span class="eq">covalent count: metal group e⁻ − charge + Σ ligand donations (CO 2, H/X/R 1, η⁵-Cp 5, η⁶-arene 6)</span>
<ul><li>18 e⁻ = saturated/stable (Fe(Cp)₂, Ni(CO)₄, Cr(CO)₆). 16 e⁻ square-planar d⁸ are catalytically reactive.</li>
<li>M–CO synergic bonding: σ-donation + π-backbonding into CO π* (lowers ν(CO), strengthens M–C). Oxidative addition +2 oxidation state / +2 e⁻; reductive elimination reverses it — the heart of homogeneous catalysis.</li></ul>`, true),
    );
  },
};
