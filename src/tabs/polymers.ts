// Polymers — monomer↔polymer explorer, MW/PDI/DP calculator, and the
// addition-vs-condensation reference. (IChO area 12.)
import { h, card, theory, select, quiz, type TabDef } from './framework';
import { POLYMERS_QUIZ } from './questions5';

interface Poly { name: string; type: 'addition' | 'condensation'; monomer: string; link: string; use: string; byproduct: string }
const POLYMERS: Poly[] = [
  { name: 'Polyethylene (PE)', type: 'addition', monomer: 'ethene, CH₂=CH₂', link: 'C–C backbone', use: 'films, bottles, bags', byproduct: 'none' },
  { name: 'Polypropylene (PP)', type: 'addition', monomer: 'propene, CH₂=CHCH₃', link: 'C–C backbone', use: 'containers, fibres (tacticity matters)', byproduct: 'none' },
  { name: 'PVC', type: 'addition', monomer: 'vinyl chloride, CH₂=CHCl', link: 'C–C backbone', use: 'pipes, insulation', byproduct: 'none' },
  { name: 'Polystyrene (PS)', type: 'addition', monomer: 'styrene, CH₂=CHC₆H₅', link: 'C–C backbone', use: 'packaging, foam', byproduct: 'none' },
  { name: 'PTFE (Teflon)', type: 'addition', monomer: 'tetrafluoroethene, CF₂=CF₂', link: 'C–C backbone', use: 'non-stick, inert coatings', byproduct: 'none' },
  { name: 'PET (polyester)', type: 'condensation', monomer: 'ethylene glycol + terephthalic acid', link: 'ester (–CO–O–)', use: 'bottles, fibres', byproduct: 'water' },
  { name: 'Nylon-6,6 (polyamide)', type: 'condensation', monomer: 'hexamethylenediamine + adipic acid', link: 'amide (–CO–NH–)', use: 'fibres, engineering plastic', byproduct: 'water' },
  { name: 'Bakelite', type: 'condensation', monomer: 'phenol + formaldehyde', link: 'cross-linked network', use: 'thermoset, electrical fittings', byproduct: 'water' },
  { name: 'Kevlar (aramid)', type: 'condensation', monomer: 'p-phenylenediamine + terephthaloyl chloride', link: 'aromatic amide', use: 'high-strength fibre, armour', byproduct: 'HCl' },
  { name: 'Protein (natural)', type: 'condensation', monomer: 'amino acids', link: 'peptide (amide)', use: 'biopolymer', byproduct: 'water' },
];

function makeExplorer(): HTMLElement {
  const out = h('div', { class: 'result' });
  const set = (name: string) => {
    const p = POLYMERS.find(x => x.name === name)!;
    out.innerHTML =
      `<b class="big">${p.name}</b> — ${p.type === 'addition' ? 'addition (chain-growth)' : 'condensation (step-growth)'}<br>` +
      `monomer(s): ${p.monomer}<br>linkage: ${p.link} · uses: ${p.use}<br>` +
      `by-product: <b>${p.byproduct}</b>` +
      (p.type === 'addition'
        ? '<br><span class="muted">Chain-growth: the C=C opens and adds; no small molecule lost; high MW reached early even at low conversion.</span>'
        : '<br><span class="muted">Step-growth: any two ends couple, expelling a small molecule; high MW needs near-complete conversion and 1:1 stoichiometry.</span>');
  };
  const el = card('Monomer ↔ polymer explorer',
    select('polymer', POLYMERS.map(p => ({ value: p.name, label: p.name })), set, POLYMERS[0].name),
    out,
    h('p', { class: 'muted' }, 'To find a monomer from a repeat unit: for addition polymers restore the C=C; for condensation polymers split the ester/amide linkage and add back the lost H₂O/HCl.'),
  );
  set(POLYMERS[0].name);
  return el;
}

function makeMW(): HTMLElement {
  const num = (v: number, step = 1) => h('input', { type: 'number', value: v, step });
  const mn = num(20000, 100), mw = num(30000, 100), mrep = num(104, 1);
  const out = h('div', { class: 'result' });
  const calc = () => {
    const Mn = Number(mn.value), Mw = Number(mw.value), Mr = Number(mrep.value);
    if (Mn > 0 && Mw > 0 && Mr > 0) {
      const pdi = Mw / Mn;
      const dp = Mn / Mr;
      out.innerHTML =
        `PDI = Mᵂ/Mₙ = <b class="big">${pdi.toFixed(2)}</b> ${pdi < 1 ? '<span class="trap">(PDI &lt; 1 is impossible — Mᵂ ≥ Mₙ always)</span>' : pdi < 1.1 ? '(very narrow distribution)' : '(broad distribution)'}<br>` +
        `degree of polymerization = Mₙ/M_repeat = <b>${dp.toFixed(0)}</b> repeat units per chain<br>` +
        `<span class="muted">Mᵂ weights larger chains more, so Mᵂ ≥ Mₙ; equal only for perfectly uniform chains (PDI = 1).</span>`;
    }
  };
  [mn, mw, mrep].forEach(i => i.addEventListener('input', calc));
  calc();
  const el = card('Molar mass, PDI & degree of polymerization',
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'Mₙ (number-avg)'), mn),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'Mᵂ (weight-avg)'), mw),
    h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'M of repeat unit'), mrep),
    out,
    h('h3', {}, 'Carothers equation (step-growth)'),
    h('p', { html: 'DP = 1/(1−p) where p = fraction of end-groups reacted. p = 0.99 gives DP ≈ 100 only — so step-growth needs very high conversion and exact 1:1 stoichiometry for long chains.' }),
  );
  return el;
}

export const polymersTab: TabDef = {
  id: 'polymers',
  label: 'Polymers',
  group: 'Organic Chemistry',
  mount(root) {
    root.append(
      h('div', { class: 'cards' }, makeExplorer(), makeMW(), card('Quick quiz', quiz(POLYMERS_QUIZ, 5))),
      theory('Theory — polymers (IChO area 12)', `
<h4>Two mechanisms</h4>
<table><tr><th></th><th>addition (chain-growth)</th><th>condensation (step-growth)</th></tr>
<tr><td>monomer</td><td>has C=C (vinyl)</td><td>two reactive groups (diol+diacid, diamine+diacid)</td></tr>
<tr><td>by-product</td><td>none</td><td>small molecule (H₂O, HCl)</td></tr>
<tr><td>MW vs conversion</td><td>high MW early</td><td>high MW only near 100% conversion</td></tr>
<tr><td>examples</td><td>PE, PP, PVC, PS, PTFE</td><td>PET, nylon, Bakelite, Kevlar, proteins</td></tr></table>
<ul>
<li>Addition sub-types by chain end: radical (peroxide/AIBN), cationic (electron-rich monomer), anionic (electron-poor monomer).</li>
<li>Carothers: DP = 1/(1−p) for step-growth — stoichiometric balance and high conversion are essential.</li>
</ul>
<h4>Structure → properties</h4>
<ul>
<li><b>Tacticity:</b> isotactic/syndiotactic chains pack into crystallites (strong, high-melting); atactic is amorphous/soft.</li>
<li><b>Cross-linking:</b> none → thermoplastic (remeltable, recyclable); cross-linked → thermoset (Bakelite) or elastomer (vulcanized rubber).</li>
<li><b>Molar mass:</b> Mₙ (number-avg), Mᵂ (weight-avg), PDI = Mᵂ/Mₙ ≥ 1; DP = Mₙ/M_repeat.</li>
<li><b>Copolymers:</b> block, alternating, random, graft — each gives distinct material behaviour (SBS block rubber).</li>
</ul>
<h4>Biopolymer link</h4>
<ul>
<li>Proteins (amino acids, peptide bonds), polysaccharides (sugars, glycosidic bonds), nucleic acids — all natural condensation polymers.</li>
<li>Deduce the monomer from a backbone repeat: reverse the linkage and restore the lost small molecule (or the C=C).</li>
</ul>`, true),
    );
  },
};
