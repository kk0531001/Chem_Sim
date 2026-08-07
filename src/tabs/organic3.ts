// Organic III — synthesis & advanced mechanisms: retrosynthesis, protecting
// groups, radical mechanisms + selectivity, rearrangements, and an intro to
// pericyclic reactions (Woodward–Hoffmann).
import { h, card, cardWithMissions, missionLadder, theory, slider, select, quiz, type TabDef } from './framework';
import { topicPage } from './page';
import { ORGANIC3_QUIZ } from './questions6';

// ---- radical halogenation selectivity calculator ----
function makeRadicalSelectivity(): HTMLElement {
  // per-hydrogen relative reactivities (approximate, 25–127 °C)
  const HAL = {
    'Cl₂ (chlorination)': { p: 1, s: 3.8, t: 5 },
    'Br₂ (bromination)': { p: 1, s: 82, t: 1600 },
  };
  let hal: keyof typeof HAL = 'Cl₂ (chlorination)';
  let nP = 6, nS = 2, nT = 1; // e.g. 2-methylbutane-ish counts
  const out = h('div', { class: 'result' });
  // The card's own weights, so a mission can never disagree with the table.
  const share = (which: 'p' | 's' | 't'): number => {
    const r = HAL[hal];
    const w = { p: nP * r.p, s: nS * r.s, t: nT * r.t };
    const tot = w.p + w.s + w.t || 1;
    return (w[which] / tot) * 100;
  };

  const missions = missionLadder([
    {
      id: 'msn-og3-01',
      prompt: 'Keep the halogen on <b>chlorination</b>. Per hydrogen, a 1° site is the least reactive of the three — yet find a substrate where the <b>1° product is nonetheless the major one</b> (over 50%).',
      meter: () => ({ label: `1° product ${share('p').toFixed(1)}%  ·  target > 50% (chlorination)`, pct: hal.startsWith('Cl') ? Math.min(100, share('p') * 2) : 0 }),
      check: () => hal.startsWith('Cl') && share('p') > 50,
      hints: [
        'The product ratio multiplies two things. You cannot change the per-H rates, so change the other one.',
        'Isobutane, (CH₃)₃CH, has nine 1° hydrogens and a single 3° one. Try those counts.',
      ],
      explain: 'With nine 1° H and one 3° H, the weights are 9×1 = 9 against 1×5 = 5, so the 1° product wins with about 64% despite every individual 1° hydrogen being five times less reactive. <b>Product ratio = (number of hydrogens) × (per-H rate)</b>, and with chlorination the first factor routinely beats the second. This is why radical chlorination is nearly useless preparatively — it gives a mixture governed mostly by counting — and why "the most stable radical forms" is a statement about <em>per-hydrogen rate</em>, not about what comes out of the flask.',
    },
    {
      id: 'msn-og3-02',
      prompt: 'Leave those same counts alone and switch the halogen to <b>bromination</b>. The major product changes completely. What is the underlying reason?',
      choices: [
        { label: 'Br• abstraction is endothermic, so the TS is late and radical-like', value: 'hammond' },
        { label: 'Br₂ is a weaker bond, so it dissociates more easily', value: 'bde' },
        { label: 'Bromine atoms are larger and cannot reach 1° hydrogens', value: 'steric' },
        { label: 'Bromination runs at a lower temperature', value: 'temp' },
      ],
      validateChoice: v => v === 'hammond',
      explain: 'Abstraction of H by Br• is <b>endothermic</b>, so by Hammond\'s postulate its transition state comes late and closely resembles the carbon radical being formed. The TS therefore inherits nearly the full stability difference between a 3° and a 1° radical, and the per-H rates spread out to 1 : 82 : 1600. Cl• abstraction is exothermic, its TS is early and resembles the starting alkane, and the radical-stability difference is barely felt — hence 1 : 3.8 : 5. Same reaction type, same radicals, opposite synthetic usefulness, and the whole difference is <em>where along the reaction coordinate</em> the transition state sits. Sterics are not the cause: bromine is selective for the <em>most hindered</em> position.',
      hints: ['Compare the two rows of per-H rates: 1 : 3.8 : 5 against 1 : 82 : 1600. What makes one reaction able to tell the sites apart and the other not?'],
    },
  ]);

  function calc(): void {
    const r = HAL[hal];
    const wp = nP * r.p, ws = nS * r.s, wt = nT * r.t;
    const tot = wp + ws + wt || 1;
    const pct = (x: number) => ((x / tot) * 100).toFixed(1);
    out.innerHTML =
      `<span class="eq">\\(\\text{product \\%} = (\\text{number of H of that type}) \\times (\\text{per-H relative rate})\\)</span>` +
      `<div class="table-scroll"><table class="ref-table"><tr><th>site</th><th>#H</th><th>per-H rate</th><th>weight</th><th>% product</th></tr>` +
      `<tr><td>1° (primary)</td><td>${nP}</td><td>${r.p}</td><td>${wp.toFixed(0)}</td><td><b>${pct(wp)}%</b></td></tr>` +
      `<tr><td>2° (secondary)</td><td>${nS}</td><td>${r.s}</td><td>${ws.toFixed(0)}</td><td><b>${pct(ws)}%</b></td></tr>` +
      `<tr><td>3° (tertiary)</td><td>${nT}</td><td>${r.t}</td><td>${wt.toFixed(0)}</td><td><b>${pct(wt)}%</b></td></tr></table></div>` +
      (hal.startsWith('Br')
        ? '<span class="muted">Bromination is <b>highly selective</b> — the 3° product dominates even when 3° H are few, because Br• abstraction is endothermic → a late, radical-like TS (Hammond).</span>'
        : '<span class="muted">Chlorination is <b>nearly statistical</b> — with many 1° H, the 1° product often wins despite lower per-H reactivity. Its early TS barely distinguishes the sites.</span>');
    missions.tick();
  }
  const el = cardWithMissions('Radical halogenation — selectivity calculator', missions,
    select('halogen', Object.keys(HAL).map(k => ({ value: k, label: k })), v => { hal = v as keyof typeof HAL; calc(); }, hal),
    slider({ label: '# of 1° H', min: 0, max: 12, step: 1, value: nP, onInput: v => { nP = v; calc(); } }),
    slider({ label: '# of 2° H', min: 0, max: 12, step: 1, value: nS, onInput: v => { nS = v; calc(); } }),
    slider({ label: '# of 3° H', min: 0, max: 6, step: 1, value: nT, onInput: v => { nT = v; calc(); } }),
    out,
    h('p', { class: 'muted' }, 'Chain mechanism: initiation (X₂ → 2X• under hν/Δ), propagation (X• + RH → HX + R•; R• + X₂ → RX + X•), termination (radical + radical). NBS gives allylic/benzylic bromination at the resonance-stabilized position.'),
  );
  calc();
  return el;
}

// ---- retrosynthesis reference ----
function makeRetro(): HTMLElement {
  return card('Retrosynthesis & multi-step planning',
    h('p', {}, 'Reason BACKWARD from the target (TM): make a disconnection ⇒ synthons ⇒ their real reagent equivalents. Interleave FGIs (functional-group interconversions) to install the right handle for each key C–C bond.'),
    h('table', { class: 'ref-table', html: `
<tr><th>synthon (idealized)</th><th>reagent equivalent</th><th>forms</th></tr>
<tr><td>acyl cation R–C≡O⁺ (a¹)</td><td>acid chloride / anhydride</td><td>ketone (Friedel–Crafts, organometallic)</td></tr>
<tr><td>carbanion R⁻ (d¹)</td><td>Grignard / organolithium</td><td>C–C bond to C=O</td></tr>
<tr><td>acyl anion R–C(=O)⁻ (d¹, umpolung)</td><td>1,3-dithiane anion</td><td>reversed carbonyl polarity</td></tr>
<tr><td>enolate (d²)</td><td>ketone/ester + base (LDA)</td><td>aldol, alkylation, Claisen</td></tr>
<tr><td>+CH₂CH₂C=O (a³, Michael acceptor)</td><td>α,β-unsaturated carbonyl</td><td>1,4-addition (Michael)</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Worked disconnection — target a 2° alcohol R₂CH–OH: disconnect the C–OH bond ⇒ a carbanion synthon (RMgBr) + an aldehyde (R\'CHO). Forward: R\'CHO + RMgBr → R\'CH(OH)R after workup. Prefer disconnections at C–X to a heteroatom and at branch points; aim for maximum simplification and available starting materials.'),
  );
}

// ---- protecting groups ----
function makeProtecting(): HTMLElement {
  return card('Protecting groups (orthogonal deprotection)',
    h('table', { class: 'ref-table', html: `
<tr><th>group protected</th><th>protecting group</th><th>installed by</th><th>removed by</th></tr>
<tr><td>ketone / aldehyde</td><td>cyclic acetal (1,3-dioxolane)</td><td>diol, H⁺ (−H₂O)</td><td>aqueous acid</td></tr>
<tr><td>alcohol –OH</td><td>silyl ether (TMS, TBS)</td><td>R₃SiCl, base</td><td>fluoride (TBAF) — orthogonal to acid</td></tr>
<tr><td>alcohol –OH</td><td>benzyl ether (Bn)</td><td>BnBr, base</td><td>H₂ / Pd (hydrogenolysis)</td></tr>
<tr><td>amine –NH₂</td><td>Boc (t-butoxycarbonyl)</td><td>Boc₂O</td><td>mild acid (TFA)</td></tr>
<tr><td>amine –NH₂</td><td>Cbz (benzyloxycarbonyl)</td><td>Cbz-Cl</td><td>H₂ / Pd</td></tr>
<tr><td>carboxylic acid</td><td>methyl / t-Bu ester</td><td>MeOH/H⁺ ; isobutylene</td><td>base hydrolysis ; acid</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Install → do chemistry elsewhere → remove. "Orthogonal" sets are cleaved under mutually non-interfering conditions (e.g. acetal by acid, silyl by fluoride, Cbz by H₂) — essential in peptide and total synthesis. Classic case: reduce an ester next to a ketone by first protecting the ketone as an acetal.'),
  );
}

// ---- rearrangements ----
function makeRearrangements(): HTMLElement {
  return card('Rearrangements',
    h('table', { class: 'ref-table', html: `
<tr><th>rearrangement</th><th>substrate → product</th><th>driving force</th></tr>
<tr><td>1,2-hydride / alkyl shift</td><td>less-stable → more-stable carbocation</td><td>cation stability (SN1/E1 skeletal change)</td></tr>
<tr><td>pinacol</td><td>1,2-diol → ketone (H⁺, −H₂O)</td><td>1,2-shift to a stable oxocarbenium</td></tr>
<tr><td>Beckmann</td><td>oxime → amide (cyclic → lactam)</td><td>anti group migrates to N⁺</td></tr>
<tr><td>Baeyer–Villiger</td><td>ketone → ester (peracid, +O)</td><td>more-substituted group migrates to O</td></tr>
<tr><td>Hofmann / Curtius</td><td>amide/acyl azide → amine (−1 C)</td><td>R migrates to nitrene/electron-deficient N</td></tr>
<tr><td>[3,3] Claisen / Cope</td><td>allyl vinyl ether → γ,δ-unsat. carbonyl</td><td>concerted 6-membered TS (sigmatropic)</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Migratory aptitude (which group moves in a cationic 1,2-shift): aryl / H > more-substituted alkyl > methyl — the group that best stabilizes positive charge in the migration transition state migrates.'),
  );
}

// ---- pericyclic ----
function makePericyclic(): HTMLElement {
  return card('Intro to pericyclic reactions (Woodward–Hoffmann)',
    h('p', {}, 'Concerted, single-step reactions with a cyclic transition state and NO intermediate. Three families: cycloadditions, electrocyclizations, and sigmatropic shifts. Stereochemistry is set by orbital symmetry.'),
    h('table', { class: 'ref-table', html: `
<tr><th>reaction</th><th>example</th><th>rule</th></tr>
<tr><td>Diels–Alder [4+2]</td><td>diene (s-cis) + dienophile → cyclohexene</td><td>thermally allowed; suprafacial/suprafacial; endo preferred</td></tr>
<tr><td>electrocyclic, 4n e⁻</td><td>butadiene ⇌ cyclobutene</td><td>Δ conrotatory · hν disrotatory</td></tr>
<tr><td>electrocyclic, 4n+2 e⁻</td><td>hexatriene ⇌ cyclohexadiene</td><td>Δ disrotatory · hν conrotatory</td></tr>
<tr><td>[3,3] sigmatropic</td><td>Cope / Claisen</td><td>thermal, suprafacial, chair-like 6-membered TS</td></tr></table>` }),
    h('p', { class: 'muted' }, 'Diels–Alder needs an s-cis diene; electron-poor dienophiles (bearing –CN, –C=O) react faster (normal electron demand). Thermal vs photochemical always flip the con/disrotatory outcome — the essence of the Woodward–Hoffmann rules.'),
    h('p', { class: 'trap' }, 'A diene locked s-trans (e.g. in a ring) cannot do a Diels–Alder — both termini must reach the dienophile.'),
  );
}

export const organic3Tab: TabDef = {
  id: 'organic3',
  mount(root) {
    root.append(topicPage('organic3', {
      sims: [makeRetro(), makeProtecting(), makeRadicalSelectivity(), makeRearrangements(), makePericyclic()],
      quiz: quiz(ORGANIC3_QUIZ, 5),
      theory: theory('Theory — synthesis & advanced mechanisms', `
<h4>Retrosynthesis</h4>
<ul><li>Disconnect the target into synthons (idealized charged fragments) and their reagent equivalents; use FGIs to reach them. Maximize simplification; disconnect near heteroatoms and at branch points; end at cheap, available starting materials.</li>
<li>Umpolung (dithianes) reverses normal carbonyl polarity, enabling acyl-anion chemistry.</li></ul>
<h4>Protecting groups</h4>
<ul><li>Block a reactive site, do chemistry elsewhere, then deprotect. Acetals (ketones, acid-labile), silyl ethers (OH, fluoride-labile), Boc/Cbz (amines, acid/H₂). Choose ORTHOGONAL sets so each can be removed independently.</li></ul>
<h4>Radical mechanisms & selectivity</h4>
<span class="eq">\\(\\text{product \\%} = (\\#\\,\\text{H of that type}) \\times (\\text{per-H relative rate})\\)</span>
<ul><li>Chain: initiation → propagation (regenerates the radical) → termination. Radical stability 3° &gt; 2° &gt; 1° (allylic/benzylic extra by resonance).</li>
<li>Bromination is selective (late, endothermic TS — Hammond); chlorination is nearly statistical. NBS → allylic/benzylic bromination.</li></ul>
<h4>Rearrangements</h4>
<ul><li>1,2-shifts build a more stable cation (pinacol). Beckmann (oxime→amide), Baeyer–Villiger (ketone→ester), Hofmann/Curtius (amide→amine, one C shorter). Migratory aptitude: aryl/H &gt; alkyl &gt; methyl.</li></ul>
<h4>Selectivity vocabulary</h4>
<ul><li>Regioselectivity (Markovnikov/Zaitsev vs anti-Markovnikov/Hofmann), stereoselectivity (syn/anti, cis/trans, enantio), chemoselectivity (one functional group over another). Bulky bases and reagents flip many of these.</li></ul>
<h4>Pericyclic reactions</h4>
<ul><li>Concerted, cyclic TS, orbital-symmetry controlled. Diels–Alder [4+2] (thermal, s-cis diene, endo). Electrocyclic: 4n → Δ conrotatory / hν disrotatory; 4n+2 → the reverse. [3,3] sigmatropic (Cope/Claisen) via a chair TS.</li></ul>`),
    }));
  },
};
