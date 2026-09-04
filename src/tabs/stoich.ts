// Stoichiometry, reactions, solution chemistry: limiting reagent visualizer,
// molarity/dilution tools.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, quiz, numberInput, numVal, type TabDef, ctlRow, task } from './framework';
import { topicPage } from './page';
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
  mount(root) {
    // ---- limiting reagent ----
    let rx = REACTIONS[1];
    let molA = 2, molB = 3;
    const controls = h('div', {});
    const barsBox = h('div', { class: 'bars' });
    const out = h('div', { class: 'result' });

    const limMissions = missionLadder([
      {
        id: 'msn-stoich-01',
        prompt: 'For the default reaction (N₂ + 3H₂ → 2NH₃), find amounts of N₂ and H₂ where <b>neither is left over</b> — a perfectly stoichiometric mixture.',
        meter: () => {
          const [ra, rb] = rx.reactants;
          const rA = molA / ra.coef, rB = molB / rb.coef;
          return { label: `${ra.f}: mol/coef = ${rA.toFixed(2)} · ${rb.f}: mol/coef = ${rB.toFixed(2)} — match these exactly`, pct: Math.max(0, 100 - Math.abs(rA - rB) / Math.max(rA, rB, 0.01) * 200) };
        },
        check: () => {
          const [ra, rb] = rx.reactants;
          const rA = molA / ra.coef, rB = molB / rb.coef;
          return rx.name === REACTIONS[1].name && molA > 0.5 && molB > 0.5 && Math.abs(rA - rB) < 0.03;
        },
        hints: ['The mole RATIO you choose has to match the coefficient ratio exactly: 1 N₂ for every 3 H₂.', 'Try 2 mol N₂ and 6 mol H₂.'],
        explain: 'Any pair of moles matching the coefficient ratio (2:6, 1:3, 5:15…) leaves nothing over — both bars empty out to exactly zero excess at the same time. Real industrial processes almost never run this exact "stoichiometric mixture": they deliberately feed in an excess of whichever reagent is cheaper, to drive the more expensive one as close to complete conversion as possible.',
      },
    ]);

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
      limMissions.tick();
    }

    function rebuildControls(): void {
      const [ra, rb] = rx.reactants;
      controls.replaceChildren(
        slider({ label: `mol ${ra.f}`, min: 0, max: 10, step: 0.1, value: molA, fmt: v => `${v.toFixed(1)} mol (${(v * ra.M).toFixed(0)} g)`, onInput: v => { molA = v; recompute(); } }),
        slider({ label: `mol ${rb.f}`, min: 0, max: 10, step: 0.1, value: molB, fmt: v => `${v.toFixed(1)} mol (${(v * rb.M).toFixed(0)} g)`, onInput: v => { molB = v; recompute(); } }),
      );
      recompute();
    }

    const limCard = cardWithMissions('Limiting reagent visualizer', limMissions,
      task('Pick a reaction, then change the two starting amounts until the reactant that runs out first changes over.'),
      select('reaction', REACTIONS.map(r => ({ value: r.name, label: r.name })), name => {
        rx = REACTIONS.find(r => r.name === name)!;
        rebuildControls();
      }, rx.name),
      controls, barsBox, out,
      h('p', { class: 'muted' }, 'Divide moles by coefficient — smallest ratio loses. The blue portion of each reactant bar is what remains.'),
    );
    rebuildControls();

    // ---- solution calculators ----
    const m1 = numberInput({ value: 6, min: 0.001, max: 20, step: 0.01 });
    const v1 = numberInput({ value: 50, min: 0.1, max: 10000, step: 0.01 });
    const m2 = numberInput({ value: 0.5, min: 0.001, max: 20, step: 0.01 });
    const dilOut = h('div', { class: 'result' });
    const dilCalc = () => {
      const vals = [numVal(m1), numVal(v1), numVal(m2)];
      if (vals.every(v => v > 0)) {
        const v2 = (vals[0] * vals[1]) / vals[2];
        dilOut.innerHTML = `V₂ = M₁V₁/M₂ = <b>${v2.toFixed(1)} mL</b> total → add <b>${(v2 - vals[1]).toFixed(1)} mL</b> of water to the ${vals[1]} mL stock.`;
      }
    };
    [m1, v1, m2].forEach(i => i.addEventListener('input', dilCalc));
    dilCalc();

    const gIn = numberInput({ value: 58.44, min: 0.001, max: 100000, step: 0.01 });
    const mmIn = numberInput({ value: 58.44, min: 1, max: 5000, step: 0.01 });
    const vIn = numberInput({ value: 250, min: 0.1, max: 100000, step: 0.01 });
    const molOut = h('div', { class: 'result' });

    const molMissions = missionLadder([
      {
        id: 'msn-stoich-02',
        prompt: 'Using the molarity tool below, find a mass/volume combination that makes exactly <b>0.100 M</b> — any molar mass, any volume, your choice.',
        meter: () => {
          const g = numVal(gIn), mm = numVal(mmIn), v = numVal(vIn);
          if (!(g > 0 && mm > 0 && v > 0)) return { label: 'enter mass, molar mass and volume', pct: 0 };
          const conc = (g / mm) / (v / 1000);
          return { label: `current: ${conc.toFixed(4)} M · target 0.100 M`, pct: Math.max(0, 100 - Math.abs(conc - 0.100) / 0.100 * 100) };
        },
        check: () => {
          const g = numVal(gIn), mm = numVal(mmIn), v = numVal(vIn);
          if (!(g > 0 && mm > 0 && v > 0)) return false;
          const conc = (g / mm) / (v / 1000);
          return Math.abs(conc - 0.100) / 0.100 < 0.02;
        },
        verify: true,
        hints: [
          'n = mass/molar mass, then concentration = n/(volume in liters). Pick a volume first, then solve backward for the mass.',
          'For NaCl (M = 58.44) in 250 mL: you need 0.0250 mol, so mass ≈ 1.46 g.',
        ],
        explain: 'Many different (mass, molar mass, volume) triples all give 0.100 M — molarity only cares about the ratio of moles to liters, not the specific numbers that produced it. Solving "backward" from a target concentration to a required mass is the single most common lab-prep calculation there is.',
      },
    ]);

    const molCalc = () => {
      const g = numVal(gIn), mm = numVal(mmIn), v = numVal(vIn);
      if (g > 0 && mm > 0 && v > 0) {
        const n = g / mm;
        molOut.innerHTML = `n = m/M = ${n.toFixed(4)} mol → concentration = n/V = <b>${(n / (v / 1000)).toFixed(3)} mol/L</b>`;
      }
      molMissions.tick();
    };
    [gIn, mmIn, vIn].forEach(i => i.addEventListener('input', molCalc));
    molCalc();

    const solCard = cardWithMissions('Solution chemistry tools', molMissions,
      task('Work one solution both ways: make a molarity from a weighed solid, then dilute it to a target concentration.'),
      h('h3', {}, 'Molarity: dissolve a solid'),
      ctlRow('mass (g)', gIn),
      ctlRow('molar mass (g/mol)', mmIn),
      ctlRow('final volume (mL)', vIn),
      molOut,
      h('h3', {}, 'Dilution: M₁V₁ = M₂V₂'),
      ctlRow('stock M₁ (mol/L)', m1),
      ctlRow('stock V₁ (mL)', v1),
      ctlRow('target M₂ (mol/L)', m2),
      dilOut,
    );

    // ---- % yield / empirical ----
    const actualIn = numberInput({ value: 12.5, min: 0, max: 100000, step: 0.01 });
    const theoIn = numberInput({ value: 15.8, min: 0.001, max: 100000, step: 0.01 });
    const yOut = h('div', { class: 'result' });
    const yCalc = () => {
      const a = numVal(actualIn), t = numVal(theoIn);
      if (a >= 0 && t > 0) yOut.innerHTML = `% yield = actual/theoretical × 100 = <b>${((a / t) * 100).toFixed(1)}%</b>` + (a > t ? ' <span class="trap">(>100% means product is wet/impure or you made an error)</span>' : '');
    };
    [actualIn, theoIn].forEach(i => i.addEventListener('input', yCalc));
    yCalc();
    const yieldCard = card('Percent yield',
      task('Enter an actual and a theoretical mass to see the yield, then follow the recipe below to turn mass percents into a formula.'),
      ctlRow('actual (g)', actualIn),
      ctlRow('theoretical (g)', theoIn),
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
    root.append(topicPage('stoich', {
      sims: [limCard, solCard, yieldCard],
      quiz: quiz(STOICH_QUIZ, 10),
      theory: [
        theory('Basics — Moles & Solutions', `
<h3>What this is about</h3>
<p>Chemistry counts atoms, but atoms are far too small to count one at a time. This block shows how a mass you can weigh on a balance becomes a number of particles you can compare.</p>
<h3>The mole is a count</h3>
<p>A mole is a fixed number of things, the way a dozen is 12. That number is Avogadro's number, 6.022 × 10²³ particles in every mole. One mole of water is 6.022 × 10²³ water molecules. One mole of iron is 6.022 × 10²³ iron atoms.</p>
<h3>Molar mass turns grams into moles</h3>
<p>The molar mass is the mass in grams of one mole of a substance. You find it by adding the atomic masses in the formula, read off the periodic table. Water is H₂O, so its molar mass is 2(1.008) + 15.999 = 18.02 g/mol. Weigh out 18.02 g of water and you are holding one mole of it.</p>
<p>Now a worked number. You have 44.0 g of carbon dioxide, CO₂. One mole of CO₂ weighs 12.011 + 2(15.999) = 44.01 g, so 44.0 ÷ 44.01 = 1.00 mol. The same sum written in general is <span class="eq">n = m ÷ M</span> where n is the amount in moles, m is the mass in grams, and M is the molar mass in g/mol.</p>
<h3>A balanced equation is a recipe in moles</h3>
<p>Atoms are never created or destroyed in a reaction. A balanced equation therefore has the same count of each atom on both sides. Burning hydrogen is written 2H₂ + O₂ → 2H₂O, which gives four H and two O on the left and four H and two O on the right. The numbers in front are the coefficients, and they are a ratio of moles, not of grams.</p>
<p>Never compare masses directly. Two grams of H₂ and two grams of O₂ are not equal amounts, because the two molecules do not weigh the same.</p>
<h3>Which reactant runs out first</h3>
<p>Start with 2 mol N₂ and 3 mol H₂, following N₂ + 3H₂ → 2NH₃. Divide each amount by its own coefficient: N₂ gives 2 ÷ 1 = 2, and H₂ gives 3 ÷ 3 = 1. The smaller answer belongs to the reactant that runs out first, so hydrogen is the limiting reagent here. Everything the reaction can make is set by that one reactant, and the extra nitrogen is left over.</p>
<p>The first card draws exactly this. Each bar shows how much of a reactant was used up and how much remains.</p>
<h3>Molarity measures concentration</h3>
<p>Molarity is the number of moles of dissolved substance in one litre of solution. Dissolve 1 mol of table salt and make the total volume up to 2 L, and the molarity is 1 ÷ 2 = 0.5 mol/L, written 0.5 M. In general <span class="eq">c = n ÷ V</span> where c is the molarity in mol/L and V is the volume of the finished solution in litres. That volume is the whole solution, not the water you started with.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Add atomic masses to get a molar mass, then turn a mass in grams into moles with n = m ÷ M.</li>
<li>Balance a simple equation and read its coefficients as a ratio of moles.</li>
<li>Divide moles by coefficients to find the reactant that runs out first, and work out a molarity from moles and litres.</li>
</ul>`, true),
        theory('Core — Moles & Solutions', `
<h3>What this block adds</h3>
<p>Basics turned a mass into moles and found the reactant that runs out first. Core does the whole journey: grams in, grams out, with the leftover, the yield and the concentrations included.</p>
<h3>Coefficients convert moles of one substance into moles of another</h3>
<p>A balanced equation fixes the ratio in which substances react. That ratio is the only bridge from one substance's amount to another's.</p>
<p>Burn methane, CH₄ + 2O₂ → CO₂ + 2H₂O, starting from 8.00 g of CH₄. Its molar mass is 12.011 + 4(1.008) = 16.04 g/mol, so n = 8.00 ÷ 16.04 = 0.499 mol. The equation gives one CO₂ for every CH₄, so 0.499 mol of CO₂ forms. CO₂ has a molar mass of 44.01 g/mol, so that is 0.499 × 44.01 = 22.0 g.</p>
<p>Grams never convert to grams directly. Every route goes through moles. The same three steps written in general:</p>
<p><span class="eq">n(A) = m(A) ÷ M(A) &nbsp;→&nbsp; n(B) = n(A) × (coefficient B ÷ coefficient A) &nbsp;→&nbsp; m(B) = n(B) × M(B)</span></p>
<h3>The limiting reagent, and what is left behind</h3>
<p>The reactant that runs out first sets everything the reaction can make. The other is in excess, and the unused part stays in the flask.</p>
<p>Mix 10.0 g of N₂ with 3.00 g of H₂ for N₂ + 3H₂ → 2NH₃. That is 10.0 ÷ 28.01 = 0.357 mol of N₂ and 3.00 ÷ 2.016 = 1.488 mol of H₂. Divide each by its own coefficient: N₂ gives 0.357 and H₂ gives 0.496, so nitrogen runs out first. The reaction makes 2 × 0.357 = 0.714 mol of NH₃, which is 0.714 × 17.03 = 12.2 g.</p>
<p>Now the leftover. Hydrogen used = 3 × 0.357 = 1.071 mol. That leaves 1.488 − 1.071 = 0.417 mol, or 0.417 × 2.016 = 0.841 g of H₂. In general, leftover moles = starting moles − (moles of limiting reagent × coefficient ratio).</p>
<h3>Percent yield</h3>
<p>The mass the equation predicts is the theoretical yield. A real reaction loses product to side reactions and to spills, so the mass collected is smaller.</p>
<p>If the ammonia above is dried and weighs 10.5 g, the yield is 10.5 ÷ 12.2 × 100 = 86.1%. Both figures are for the same substance, and the theoretical one always comes from the limiting reagent. Written in general:</p>
<p><span class="eq">percent yield = (actual yield ÷ theoretical yield) × 100</span></p>
<h3>Solutions: amount, dilution and ions</h3>
<p>Molarity connects a volume you can measure to an amount in moles. Rearranging c = n ÷ V gives the working form.</p>
<p>Take 250.0 mL of 0.400 M glucose. In litres that is 0.2500 L, so n = 0.400 × 0.2500 = 0.100 mol. Written in general, with V in litres:</p>
<p><span class="eq">n = c V</span></p>
<p>Adding water adds no solute, so the moles stay fixed while the volume grows. Dilute 25.0 mL of 6.00 M hydrochloric acid down to 0.500 M and the new volume is 25.0 × 6.00 ÷ 0.500 = 300 mL. Any volume unit will do, as long as both sides use the same one.</p>
<p><span class="eq">c₁V₁ = c₂V₂</span></p>
<p>A salt splits into ions when it dissolves, and each ion has a concentration of its own. Sodium sulfate, Na₂SO₄, releases two Na⁺ and one SO₄²⁻ per formula unit. A 0.10 M solution is therefore 0.20 M in Na⁺ and 0.10 M in SO₄²⁻.</p>
<h3>Empirical formula from percentages</h3>
<p>The empirical formula is the simplest whole-number ratio of the atoms in a compound. Percentages by mass give that ratio once they are turned into moles.</p>
<p>A compound is 52.14% carbon, 13.13% hydrogen and 34.73% oxygen. Take a 100 g sample, so each percentage becomes a mass in grams. The moles are 52.14 ÷ 12.011 = 4.341, 13.13 ÷ 1.008 = 13.03 and 34.73 ÷ 15.999 = 2.171. Divide all three by the smallest, 2.171, to get 2.00, 6.00 and 1.00, so the formula is C₂H₆O.</p>
<p>A ratio sometimes lands on 1.5 or 1.33 instead. Multiply every figure by 2 or by 3 until all of them are whole. The molecular formula is the empirical formula scaled by (molar mass ÷ empirical formula mass).</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Run a mass through to a mass: grams to moles, moles to moles by the coefficient ratio, then back to grams.</li>
<li>Find the limiting reagent, the mass of product, and how much excess reactant is left over.</li>
<li>Work out a percent yield from a collected mass and a predicted one.</li>
<li>Use n = cV and c₁V₁ = c₂V₂, and give the concentration of each ion in a dissolved salt.</li>
<li>Turn a percentage composition into an empirical formula, then into a molecular formula.</li>
</ul>`, true),
        theory('Exam-level reference — Moles & Solutions', `
<h3>The mole highway</h3>
<span class="eq">grams ⇄(÷M) moles ⇄(×ratio) moles ⇄(×M) grams &nbsp;·&nbsp; n = CV (solutions) &nbsp;·&nbsp; n = PV/RT (gases)</span>
<h3>Reaction types to recognize instantly</h3>
<ul>
<li><b>Precipitation:</b> soluble — all NO₃⁻, Group 1, NH₄⁺, most Cl⁻/Br⁻/I⁻ (except Ag⁺, Pb²⁺, Hg₂²⁺), most SO₄²⁻ (except Ba²⁺, Pb²⁺, Ca²⁺, Sr²⁺). Insoluble — most OH⁻, S²⁻, CO₃²⁻, PO₄³⁻.</li>
<li><b>Acid–base:</b> H⁺ + OH⁻ → H₂O; carbonate + acid → CO₂ + H₂O (fizzing).</li>
<li><b>Redox:</b> assign oxidation states; oxidation = e⁻ loss (OS up). Balance half-reactions: balance atoms, then O with H₂O, H with H⁺, charge with e⁻ (in base: add OH⁻ to both sides at the end).</li>
</ul>
<h3>Net ionic equations</h3>
<ul>
<li>Split only strong electrolytes (strong acids: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄; soluble salts; strong bases). Weak acids, solids, liquids, gases stay together.</li>
<li><span class="trap">Trap: spectator ions must have identical form and state on both sides.</span></li>
</ul>
<h3>Titration stoichiometry</h3>
<span class="eq">C₁V₁/a = C₂V₂/b (a, b = coefficients) — don't forget diprotic acids need 2 OH⁻!</span>
<h3>Concentration units</h3>
<ul>
<li>Molarity M = mol/L solution (changes with T); molality m = mol/kg solvent (T-independent — use for colligative).</li>
<li>ppm = mg solute / kg solution ≈ mg/L in dilute water.</li>
</ul>`),
      ],
    }));
  },
};
