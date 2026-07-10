// Stoichiometry, reactions, solution chemistry: limiting reagent visualizer,
// molarity/dilution tools.
import { h, card, theory, slider, select, quiz, type TabDef } from './framework';
import { STOICH_QUIZ } from './questions1';


interface RxSpecies { f: string; coef: number; M: number }
interface Reaction { name: string; reactants: RxSpecies[]; products: RxSpecies[] }
const REACTIONS: Reaction[] = [
  { name: '2H₂ + O₂ → 2H₂O', reactants: [{ f: 'H₂', coef: 2, M: 2.02 }, { f: 'O₂', coef: 1, M: 32.0 }], products: [{ f: 'H₂O', coef: 2, M: 18.02 }] },
  { name: 'N₂ + 3H₂ → 2NH₃', reactants: [{ f: 'N₂', coef: 1, M: 28.01 }, { f: 'H₂', coef: 3, M: 2.02 }], products: [{ f: 'NH₃', coef: 2, M: 17.03 }] },
  { name: 'CH₄ + 2O₂ → CO₂ + 2H₂O', reactants: [{ f: 'CH₄', coef: 1, M: 16.04 }, { f: 'O₂', coef: 2, M: 32.0 }], products: [{ f: 'CO₂', coef: 1, M: 44.01 }, { f: 'H₂O', coef: 2, M: 18.02 }] },
  { name: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂', reactants: [{ f: 'Fe₂O₃', coef: 1, M: 159.7 }, { f: 'CO', coef: 3, M: 28.01 }], products: [{ f: 'Fe', coef: 2, M: 55.85 }, { f: 'CO₂', coef: 3, M: 44.01 }] },
  { name: '2Al + 3Cl₂ → 2AlCl₃', reactants: [{ f: 'Al', coef: 2, M: 26.98 }, { f: 'Cl₂', coef: 3, M: 70.9 }], products: [{ f: 'AlCl₃', coef: 2, M: 133.3 }] },
];

export const stoichTab: TabDef = {
  id: 'stoich',
  label: 'Stoichiometry',
  group: 'Foundations',
  mount(root) {
    // ---- limiting reagent ----
    let rx = REACTIONS[1];
    let molA = 2, molB = 3;
    const controls = h('div', {});
    const barsBox = h('div', { class: 'bars' });
    const out = h('div', { class: 'result' });

    function recompute(): void {
      const [ra, rb] = rx.reactants;
      const extent = Math.min(molA / ra.coef, molB / rb.coef);
      const limiting = molA / ra.coef <= molB / rb.coef ? ra : rb;
      const usedA = extent * ra.coef, usedB = extent * rb.coef;
      const maxMol = Math.max(molA, molB, ...rx.products.map(p => extent * p.coef), 0.001);
      const bar = (label: string, used: number, left: number, made: number) => {
        const w = (v: number) => `${(v / maxMol) * 100}%`;
        return h('div', { class: 'bar-row' },
          h('span', { class: 'bar-label' }, label),
          h('div', { class: 'bar-track' },
            h('div', { class: 'bar-fill', style: `width:${w(used + left + made)};background:${made ? '#3d7a4f' : '#7a3d3d'}` }),
            h('div', { class: 'bar-fill', style: `width:${w(left + made)};background:${made ? '#3d7a4f' : '#3d5a7a'};position:absolute;top:0;left:0` }),
          ),
          h('span', { class: 'bar-val' }, made ? `${made.toFixed(2)} mol made` : `${left.toFixed(2)} mol left`),
        );
      };
      barsBox.replaceChildren(
        bar(ra.f, usedA, molA - usedA, 0),
        bar(rb.f, usedB, molB - usedB, 0),
        ...rx.products.map(p => bar(p.f, 0, 0, extent * p.coef)),
      );
      const gramsProd = rx.products.map(p => `${(extent * p.coef * p.M).toFixed(1)} g ${p.f}`).join(' + ');
      out.innerHTML = `Limiting reagent: <b>${limiting.f}</b> · extent of reaction = ${extent.toFixed(3)} mol<br>` +
        `Yield: <b>${rx.products.map(p => `${(extent * p.coef).toFixed(2)} mol ${p.f}`).join(' + ')}</b> (${gramsProd})<br>` +
        `Excess left over: ${(molA - usedA).toFixed(2)} mol ${ra.f}, ${(molB - usedB).toFixed(2)} mol ${rb.f}`;
    }

    function rebuildControls(): void {
      const [ra, rb] = rx.reactants;
      controls.replaceChildren(
        slider({ label: `mol ${ra.f}`, min: 0, max: 10, step: 0.1, value: molA, fmt: v => `${v.toFixed(1)} mol (${(v * ra.M).toFixed(0)} g)`, onInput: v => { molA = v; recompute(); } }),
        slider({ label: `mol ${rb.f}`, min: 0, max: 10, step: 0.1, value: molB, fmt: v => `${v.toFixed(1)} mol (${(v * rb.M).toFixed(0)} g)`, onInput: v => { molB = v; recompute(); } }),
      );
      recompute();
    }

    const limCard = card('Limiting reagent visualizer',
      select('reaction', REACTIONS.map(r => ({ value: r.name, label: r.name })), name => {
        rx = REACTIONS.find(r => r.name === name)!;
        rebuildControls();
      }, rx.name),
      controls, barsBox, out,
      h('p', { class: 'muted' }, 'Divide moles by coefficient — smallest ratio loses. The blue portion of each reactant bar is what remains.'),
    );
    rebuildControls();

    // ---- solution calculators ----
    const num = (val: number, step = 0.01) => h('input', { type: 'number', value: val, step });
    const m1 = num(6), v1 = num(50), m2 = num(0.5);
    const dilOut = h('div', { class: 'result' });
    const dilCalc = () => {
      const vals = [Number(m1.value), Number(v1.value), Number(m2.value)];
      if (vals.every(v => v > 0)) {
        const v2 = (vals[0] * vals[1]) / vals[2];
        dilOut.innerHTML = `V₂ = M₁V₁/M₂ = <b>${v2.toFixed(1)} mL</b> total → add <b>${(v2 - vals[1]).toFixed(1)} mL</b> of water to the ${vals[1]} mL stock.`;
      }
    };
    [m1, v1, m2].forEach(i => i.addEventListener('input', dilCalc));
    dilCalc();

    const gIn = num(58.44), mmIn = num(58.44), vIn = num(250);
    const molOut = h('div', { class: 'result' });
    const molCalc = () => {
      const g = Number(gIn.value), mm = Number(mmIn.value), v = Number(vIn.value);
      if (g > 0 && mm > 0 && v > 0) {
        const n = g / mm;
        molOut.innerHTML = `n = m/M = ${n.toFixed(4)} mol → concentration = n/V = <b>${(n / (v / 1000)).toFixed(3)} mol/L</b>`;
      }
    };
    [gIn, mmIn, vIn].forEach(i => i.addEventListener('input', molCalc));
    molCalc();

    const solCard = card('Solution chemistry tools',
      h('h3', {}, 'Molarity: dissolve a solid'),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'mass (g)'), gIn),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'molar mass (g/mol)'), mmIn),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'final volume (mL)'), vIn),
      molOut,
      h('h3', {}, 'Dilution: M₁V₁ = M₂V₂'),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'stock M₁ (mol/L)'), m1),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'stock V₁ (mL)'), v1),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'target M₂ (mol/L)'), m2),
      dilOut,
    );

    // ---- % yield / empirical ----
    const actualIn = num(12.5), theoIn = num(15.8);
    const yOut = h('div', { class: 'result' });
    const yCalc = () => {
      const a = Number(actualIn.value), t = Number(theoIn.value);
      if (a >= 0 && t > 0) yOut.innerHTML = `% yield = actual/theoretical × 100 = <b>${((a / t) * 100).toFixed(1)}%</b>` + (a > t ? ' <span class="trap">(>100% means product is wet/impure or you made an error)</span>' : '');
    };
    [actualIn, theoIn].forEach(i => i.addEventListener('input', yCalc));
    yCalc();
    const yieldCard = card('Percent yield',
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'actual (g)'), actualIn),
      h('div', { class: 'ctl' }, h('span', { class: 'ctl-label' }, 'theoretical (g)'), theoIn),
      yOut,
      h('h3', {}, 'Empirical formula recipe'),
      h('ol', {},
        h('li', {}, 'Assume 100 g → mass % becomes grams.'),
        h('li', {}, 'Convert each to moles (÷ atomic mass).'),
        h('li', {}, 'Divide all by the smallest.'),
        h('li', {}, 'Multiply to clear fractions (×2 for .5, ×3 for .33/.67, ×4 for .25/.75).'),
        h('li', {}, 'Molecular formula = empirical × (molar mass ÷ empirical mass).'),
      ),
    );

    root.append(
      h('div', { class: 'cards' }, limCard, solCard, yieldCard, card('Quick quiz', quiz(STOICH_QUIZ, 5))),
      theory('Theory & key equations — stoichiometry / reactions / solutions', `
<h4>The mole highway</h4>
<span class="eq">grams ⇄(÷M) moles ⇄(×ratio) moles ⇄(×M) grams &nbsp;·&nbsp; n = CV (solutions) &nbsp;·&nbsp; n = PV/RT (gases)</span>
<h4>Reaction types to recognize instantly</h4>
<ul>
<li><b>Precipitation:</b> soluble — all NO₃⁻, Group 1, NH₄⁺, most Cl⁻/Br⁻/I⁻ (except Ag⁺, Pb²⁺, Hg₂²⁺), most SO₄²⁻ (except Ba²⁺, Pb²⁺, Ca²⁺, Sr²⁺). Insoluble — most OH⁻, S²⁻, CO₃²⁻, PO₄³⁻.</li>
<li><b>Acid–base:</b> H⁺ + OH⁻ → H₂O; carbonate + acid → CO₂ + H₂O (fizzing).</li>
<li><b>Redox:</b> assign oxidation states; oxidation = e⁻ loss (OS up). Balance half-reactions: balance atoms, then O with H₂O, H with H⁺, charge with e⁻ (in base: add OH⁻ to both sides at the end).</li>
</ul>
<h4>Net ionic equations</h4>
<ul>
<li>Split only strong electrolytes (strong acids: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄; soluble salts; strong bases). Weak acids, solids, liquids, gases stay together.</li>
<li><span class="trap">Trap: spectator ions must have identical form and state on both sides.</span></li>
</ul>
<h4>Titration stoichiometry</h4>
<span class="eq">C₁V₁/a = C₂V₂/b (a, b = coefficients) — don't forget diprotic acids need 2 OH⁻!</span>
<h4>Concentration units</h4>
<ul>
<li>Molarity M = mol/L solution (changes with T); molality m = mol/kg solvent (T-independent — use for colligative).</li>
<li>ppm = mg solute / kg solution ≈ mg/L in dilute water.</li>
</ul>`, true),
    );
  },
};
