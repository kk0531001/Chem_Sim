// Polymers — monomer↔polymer explorer, MW/PDI/DP calculator, and the
// addition-vs-condensation reference. (IChO area 12.)
import { h, card, cardWithMissions, missionLadder, theory, select, quiz, numberInput, numVal, type TabDef } from './framework';
import { topicPage } from './page';
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
  const mn = numberInput({ value: 20000, min: 100, max: 10000000, step: 100 });
  const mw = numberInput({ value: 30000, min: 100, max: 10000000, step: 100 });
  const mrep = numberInput({ value: 104, min: 1, max: 100000 });
  const out = h('div', { class: 'result' });
  let lastPdi = 0, lastDp = 0;

  const missions = missionLadder([
    {
      id: 'msn-pol-01',
      prompt: 'The card opens on PDI = 1.50, a typical radical-polymerised sample. Set the two averages so the <b>PDI is exactly 1.00</b>.',
      meter: () => ({ label: `PDI = ${lastPdi.toFixed(2)}  ·  target 1.00`, pct: lastPdi > 0 ? Math.max(0, 100 - Math.abs(lastPdi - 1) * 100) : 0 }),
      check: () => Math.abs(lastPdi - 1) < 0.005,
      hints: [
        'PDI = M̄w/M̄n. What relationship between the two averages makes their ratio one?',
        'Try setting M̄w equal to M̄n — any equal pair will do.',
      ],
      explain: 'PDI = 1 requires M̄w = M̄n, and the two averages coincide only when <b>every chain has exactly the same length</b> — the weight average over-counts long chains, so any spread at all pushes M̄w above M̄n. PDI can never fall below 1. Real chain-growth polymers land near 1.5–2.0 (termination is random), step-growth near 2.0, and only <b>living</b> polymerisations — where every chain starts at the same moment and none terminates — approach 1.02–1.05. Nature does better than any of them: a protein has PDI exactly 1.000, because its length is transcribed rather than left to statistics.',
    },
    {
      id: 'msn-pol-02',
      prompt: 'Nylon-6,6 has a repeat unit of <b>226 g/mol</b>. Set the card up for a nylon-6,6 sample with a degree of polymerisation of <b>100</b>.',
      meter: () => ({ label: `DP = ${lastDp.toFixed(0)}  ·  target 100 with repeat unit 226`, pct: Math.abs(numVal(mrep) - 226) < 1 ? Math.max(0, 100 - Math.abs(lastDp - 100)) : 0 }),
      check: () => Math.abs(numVal(mrep) - 226) < 1 && Math.abs(lastDp - 100) < 0.5,
      hints: [
        'Two boxes matter here: the repeat-unit mass and one of the averages. DP = M̄n/M(repeat).',
        'Rearrange: M̄n = DP × M(repeat) = 100 × 226.',
      ],
      explain: 'M̄n = 100 × 226 = <b>22 600 g/mol</b> — a hundred repeat units, each one a diamine and a diacid joined with two molecules of water expelled. Now put that beside the Carothers equation below the readout: DP = 1/(1−p), so DP = 100 demands <b>p = 0.990</b>. Ninety-nine percent of every amine and acid group in the pot must have found a partner to reach a chain of only a hundred units, and pushing to DP 200 needs 99.5%. Step-growth molar mass lives entirely in the last fraction of a percent of conversion — which is why nylon is polymerised for hours under vacuum, stripping water to drag the equilibrium forward.',
    },
  ]);

  const calc = () => {
    const Mn = numVal(mn), Mw = numVal(mw), Mr = numVal(mrep);
    if (Mn > 0 && Mw > 0 && Mr > 0) {
      const pdi = Mw / Mn;
      const dp = Mn / Mr;
      lastPdi = pdi; lastDp = dp;
      out.innerHTML =
        `PDI = Mᵂ/Mₙ = <b class="big">${pdi.toFixed(2)}</b> ${pdi < 1 ? '<span class="trap">(PDI &lt; 1 is impossible — Mᵂ ≥ Mₙ always)</span>' : pdi < 1.1 ? '(very narrow distribution)' : '(broad distribution)'}<br>` +
        `degree of polymerization = Mₙ/M_repeat = <b>${dp.toFixed(0)}</b> repeat units per chain<br>` +
        `<span class="muted">Mᵂ weights larger chains more, so Mᵂ ≥ Mₙ; equal only for perfectly uniform chains (PDI = 1).</span>`;
    }
    missions.tick();
  };
  [mn, mw, mrep].forEach(i => i.addEventListener('input', calc));
  calc();
  const el = cardWithMissions('Molar mass, PDI & degree of polymerization', missions,
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
  mount(root) {
    root.append(topicPage('polymers', {
      sims: [makeExplorer(), makeMW()],
      quiz: quiz(POLYMERS_QUIZ, 5),
      theory: theory('Theory — polymers (IChO area 12)', `
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
</ul>`),
    }));
  },
};
