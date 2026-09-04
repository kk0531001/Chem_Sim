// Thermodynamics I: first law, calorimetry, Hess's law, bond enthalpies.
import { h, card, cardWithMissions, missionLadder, theory, slider, select, pageQuiz, atLevel, type TabDef, task } from './framework';
import { topicPage } from './page';
import { THERMO1_QUIZ } from './questions1';


const SUBSTANCES: { name: string; c: number }[] = [
  { name: 'water', c: 4.18 }, { name: 'ethanol', c: 2.44 }, { name: 'aluminum', c: 0.897 },
  { name: 'iron', c: 0.449 }, { name: 'copper', c: 0.385 }, { name: 'lead', c: 0.128 },
];

// ---- Hess's law examples ----
interface HessStep { eq: string; dH: number; op: string }
const HESS: { name: string; target: string; steps: HessStep[]; answer: number }[] = [
  {
    name: 'Formation of CO',
    target: 'C(s) + ½O₂(g) → CO(g)',
    steps: [
      { eq: 'C(s) + O₂(g) → CO₂(g)', dH: -393.5, op: 'keep as-is' },
      { eq: 'CO₂(g) → CO(g) + ½O₂(g)', dH: +283.0, op: 'reversed (sign flipped from −283.0)' },
    ],
    answer: -110.5,
  },
  {
    name: 'Formation of acetylene C₂H₂',
    target: '2C(s) + H₂(g) → C₂H₂(g)',
    steps: [
      { eq: '2 × [C(s) + O₂ → CO₂]', dH: 2 * -393.5, op: 'combustion of C, ×2' },
      { eq: 'H₂ + ½O₂ → H₂O(l)', dH: -285.8, op: 'combustion of H₂' },
      { eq: '2CO₂ + H₂O → C₂H₂ + 5/2 O₂', dH: +1299.6, op: 'combustion of C₂H₂ reversed' },
    ],
    answer: +226.8,
  },
  {
    name: 'Formation of methane',
    target: 'C(s) + 2H₂(g) → CH₄(g)',
    steps: [
      { eq: 'C(s) + O₂ → CO₂', dH: -393.5, op: 'combustion of C' },
      { eq: '2 × [H₂ + ½O₂ → H₂O(l)]', dH: 2 * -285.8, op: 'combustion of H₂, ×2' },
      { eq: 'CO₂ + 2H₂O → CH₄ + 2O₂', dH: +890.4, op: 'combustion of CH₄ reversed' },
    ],
    answer: -74.7,
  },
];

// ---- bond enthalpy estimator ----
const BOND_E: Record<string, number> = {
  'H–H': 436, 'Cl–Cl': 243, 'H–Cl': 431, 'N≡N': 945, 'N–H': 391,
  'C–H': 414, 'O=O': 498, 'C=O (CO₂)': 799, 'O–H': 463, 'C–C': 347, 'C=C': 611,
};
const BOND_RXNS: { name: string; broken: [string, number][]; formed: [string, number][] }[] = [
  { name: 'H₂ + Cl₂ → 2HCl', broken: [['H–H', 1], ['Cl–Cl', 1]], formed: [['H–Cl', 2]] },
  { name: 'N₂ + 3H₂ → 2NH₃', broken: [['N≡N', 1], ['H–H', 3]], formed: [['N–H', 6]] },
  { name: 'CH₄ + 2O₂ → CO₂ + 2H₂O', broken: [['C–H', 4], ['O=O', 2]], formed: [['C=O (CO₂)', 2], ['O–H', 4]] },
];

export const thermo1Tab: TabDef = {
  id: 'thermo1',
  mount(root, pageId) {
    // ---- calorimetry mixer ----
    let sA = SUBSTANCES[3], sB = SUBSTANCES[0];
    let mA = 100, tA = 95, mB = 200, tB = 20;
    const calOut = h('div', { class: 'result' });
    const calCanvas = h('canvas', { width: 420, height: 120 });
    const finalT = () => (mA * sA.c * tA + mB * sB.c * tB) / (mA * sA.c + mB * sB.c);
    // The mission's setup conditions, checked in one place so the meter and the
    // pass/fail test can never disagree about what "set it up like this" means.
    const calSetUp = () => sA.name === 'lead' && tA >= 95 && mA >= 400 && sB.name === 'water' && tB <= 20;

    const calMissions = missionLadder([
      {
        id: 'msn-th1-01',
        prompt: 'Water is a thermal sponge. Set substance 1 to <b>lead at 100 °C</b> with a mass of <b>at least 400 g</b>, substance 2 to <b>water at 20 °C</b> — and still keep the final temperature <b>below 25 °C</b>. Nearly half a kilogram of boiling-hot metal, and the water barely notices.',
        meter: () => {
          if (!calSetUp()) return { label: 'set ≥ 400 g of lead at 100 °C against water at ≤ 20 °C', pct: 0 };
          const Tf = finalT();
          return { label: `T_final = ${Tf.toFixed(1)} °C · target below 25 °C`, pct: Math.max(0, Math.min(100, 100 - (Tf - 25) * 8)) };
        },
        check: () => calSetUp() && finalT() < 25,
        hints: [
          'You control the water mass too — and it is the water\'s heat capacity that is doing the work here.',
          'c(water)/c(lead) = 4.18/0.128 ≈ 33. One gram of water soaks up as much heat per degree as 33 g of lead, so make the water heavy: 400 g of lead at 100 °C needs only about 185 g of water to stay under 25 °C.',
        ],
        explain: 'Heat capacity, not mass, decides who wins a thermal argument. With 400 g of lead (mc = 51 J/K) against 300 g of water (mc = 1254 J/K), the water outweighs the lead <em>thermally</em> by 25× even though it is lighter on the balance — so the mixture settles almost exactly at the water\'s starting temperature. This is why water, not a metal, is the coolant in car engines and nuclear reactors, why a lead sinker at 100 °C is far less dangerous than 100 °C water, and why coastal cities have milder climates than inland ones: the ocean absorbs enormous amounts of heat for a very small change in its own temperature.',
      },
    ]);

    function calRedraw(): void {
      const Tf = finalT();
      const q = mA * sA.c * (Tf - tA); // heat gained by A (negative if A cools)
      calOut.innerHTML =
        `T<sub>final</sub> = (m₁c₁T₁ + m₂c₂T₂)/(m₁c₁ + m₂c₂) = <b class="big">${Tf.toFixed(1)} °C</b><br>` +
        `q(${sA.name}) = ${q.toFixed(0)} J, q(${sB.name}) = ${(-q).toFixed(0)} J — equal and opposite (q₁ = −q₂)<br>` +
        `<span class="muted">Note how ${mA} g of ${sA.name} barely moves ${mB} g of water: water's c = 4.18 J/g·K is huge.</span>`;
      const ctx = calCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, 420, 120);
      const tempColor = (t: number) => `hsl(${Math.max(0, 240 - t * 2.4)}, 70%, 45%)`;
      const block = (x: number, t: number, label: string, w: number) => {
        ctx.fillStyle = tempColor(t);
        ctx.fillRect(x, 30, w, 60);
        ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(label, x + w / 2, 55);
        ctx.fillText(`${t.toFixed(0)}°C`, x + w / 2, 72);
      };
      block(30, tA, sA.name, 90);
      block(160, tB, sB.name, 120);
      block(320, Tf, 'mixed', 80);
      ctx.fillStyle = '#7d8fa3'; ctx.fillText('→', 302, 64);
      calMissions.tick();
    }
    const calCard = cardWithMissions('Mixing hot and cold (q = mcΔT)', calMissions,
      task('Mix two substances and watch where the final temperature lands — push the specific heats apart and see which one moves further.'),
      select('substance 1', SUBSTANCES.map(s => ({ value: s.name, label: `${s.name} (c=${s.c})` })), v => { sA = SUBSTANCES.find(s => s.name === v)!; calRedraw(); }, sA.name),
      slider({ label: 'mass 1 (g)', min: 10, max: 500, value: mA, onInput: v => { mA = v; calRedraw(); } }),
      slider({ label: 'T₁ (°C)', min: 0, max: 100, value: tA, onInput: v => { tA = v; calRedraw(); } }),
      select('substance 2', SUBSTANCES.map(s => ({ value: s.name, label: `${s.name} (c=${s.c})` })), v => { sB = SUBSTANCES.find(s => s.name === v)!; calRedraw(); }, sB.name),
      slider({ label: 'mass 2 (g)', min: 10, max: 500, value: mB, onInput: v => { mB = v; calRedraw(); } }),
      slider({ label: 'T₂ (°C)', min: 0, max: 100, value: tB, onInput: v => { tB = v; calRedraw(); } }),
      calCanvas, calOut,
    );
    calRedraw();

    // ---- Hess ----
    const hessBox = h('div', {});
    const setHess = (name: string) => {
      const ex = HESS.find(e => e.name === name)!;
      const sum = ex.steps.reduce((a, s) => a + s.dH, 0);
      hessBox.innerHTML =
        `<p><b>Target:</b> ${ex.target}</p>` +
        `<div class="table-scroll"><table class="ref-table"><tr><th>step</th><th>ΔH (kJ)</th><th>manipulation</th></tr>` +
        ex.steps.map(s => `<tr><td>${s.eq}</td><td>${s.dH > 0 ? '+' : ''}${s.dH.toFixed(1)}</td><td>${s.op}</td></tr>`).join('') +
        `</table></div><div class="result">Sum: ΔH = <b class="big">${sum > 0 ? '+' : ''}${sum.toFixed(1)} kJ/mol</b> (${sum < 0 ? 'exothermic' : 'endothermic'})</div>` +
        `<p class="muted">Rules: reverse a step and its sign flips. Multiply a step and its ΔH is multiplied too. Enthalpy depends only on where you start and where you finish, so the route between them does not matter.</p>`;
    };
    const hessCard = card("Adding reactions together — Hess's law",
      task('Read each worked cycle and check which equations were reversed or doubled before they were added.'),
      select('target reaction', HESS.map(e => ({ value: e.name, label: e.name })), setHess, HESS[0].name),
      hessBox,
    );
    setHess(HESS[0].name);

    // ---- bond enthalpies ----
    const bondBox = h('div', {});
    const setBondRxn = (name: string) => {
      const rx = BOND_RXNS.find(r => r.name === name)!;
      const sumB = rx.broken.reduce((a, [b, n]) => a + BOND_E[b] * n, 0);
      const sumF = rx.formed.reduce((a, [b, n]) => a + BOND_E[b] * n, 0);
      bondBox.innerHTML =
        `<div class="table-scroll"><table class="ref-table"><tr><th></th><th>bonds</th><th>energy (kJ)</th></tr>` +
        `<tr><td>broken (costs)</td><td>${rx.broken.map(([b, n]) => `${n}× ${b} (${BOND_E[b]})`).join(', ')}</td><td>+${sumB}</td></tr>` +
        `<tr><td>formed (pays back)</td><td>${rx.formed.map(([b, n]) => `${n}× ${b} (${BOND_E[b]})`).join(', ')}</td><td>−${sumF}</td></tr></table></div>` +
        `<div class="result">ΔH ≈ Σ(broken) − Σ(formed) = ${sumB} − ${sumF} = <b class="big">${sumB - sumF > 0 ? '+' : ''}${sumB - sumF} kJ/mol</b></div>` +
        `<p class="muted">Estimates only (~±10%): tabulated bond energies are averages over many molecules. Exothermic = the new bonds are stronger than the old ones.</p>`;
    };
    // A numeric mission, not a drive-the-sim one: the card has no slider to
    // move, and the question is what the discrepancy MEANS, not what state to
    // reach. Accepts 78–98 kJ so that ΔH_vap taken at 100 °C (40.7 → 81 kJ) and
    // at 25 °C (44 → 88 kJ) are both marked right.
    const bondMissions = missionLadder([
      {
        id: 'msn-th1-02',
        prompt: 'Select <b>CH₄ + 2O₂ → CO₂ + 2H₂O</b>. The bond sum gives about −798 kJ/mol, but a data book lists methane\'s enthalpy of combustion — the heat given out when one mole of it burns completely — as <b>−890 kJ/mol</b>. Almost the whole 92 kJ gap is one physical step the bond-enthalpy method cannot see: the steam this sum produces turning into liquid water. Condensing one mole of steam releases about <b>44 kJ</b>. How much energy (in kJ) does that release for this reaction as written?',
        numeric: { label: 'energy released (kJ)', placeholder: 'e.g. 40', step: 1, validate: n => n >= 78 && n <= 98 },
        hints: [
          'Bond enthalpies are tabulated for gas-phase species only. Which product is not a gas at 25 °C?',
          'The bond sum has produced two moles of water VAPOUR. The data-book value is quoted with liquid water. Condensing water releases about 44 kJ for every mole, so how many moles are there here?',
        ],
        explain: '<b>≈ 88 kJ — the condensation of 2 mol of water</b> (2 × 44 kJ/mol at 25 °C). Bond enthalpies only ever describe gas-phase molecules, so the −798 kJ/mol estimate is really the enthalpy of combustion to <em>steam</em>; the tabulated −890 kJ/mol collects the extra heat given up when that steam condenses. −798 − 88 = −886, and the residual 4 kJ is the averaging error the card already warns about — real gas-phase combustion of methane is −802 kJ/mol. This is not a technicality: it is the difference between the <b>higher and lower heating value</b> of a fuel. A condensing domestic boiler is called that precisely because it recovers this 88 kJ, which is why its efficiency can be quoted above 100% — the figure is being measured against the lower (steam) value.',
      },
    ]);

    const bondCard = cardWithMissions('Estimating heat from bond strengths', bondMissions,
      task('Choose a reaction and count the bonds broken against the bonds formed to get ΔH from the table alone.'),
      select('reaction', BOND_RXNS.map(r => ({ value: r.name, label: r.name })), setBondRxn, BOND_RXNS[0].name),
      bondBox,
    );
    setBondRxn(BOND_RXNS[0].name);

    // ---- Born–Haber cycle (lattice energy) ----
    // Default: NaCl. ΔHf = ΔH_sub(Na) + ½D(Cl2) + IE(Na) − EA(Cl) − U_lattice
    let bhSub = 108, bhIE = 496, bhDiss = 122, bhEA = 349, bhHf = -411; // kJ/mol; Diss is ½ D(Cl2)
    const bhOut = h('div', { class: 'result' });
    const bhCalc = () => {
      // solve for lattice energy U (defined here as the exothermic value, reported negative)
      const U = bhHf - (bhSub + bhIE + bhDiss - bhEA);
      bhOut.innerHTML =
        `<span class="eq">ΔH_f = ΔH_sub + IE + ½D − EA + U_lattice</span>` +
        `Solving for lattice energy: U = ΔH_f − (ΔH_sub + IE + ½D − EA)<br>` +
        `U = ${bhHf} − (${bhSub} + ${bhIE} + ${bhDiss} − ${bhEA}) = <b class="big">${U.toFixed(0)} kJ/mol</b><br>` +
        `<span class="muted">The large negative lattice energy is the pay-off that makes ionic-solid formation favourable despite the endothermic sublimation and ionisation steps. Higher ionic charge and smaller ions ⇒ more exothermic U (MgO ≫ NaCl).</span>`;
    };
    const bhCard = card('Born–Haber cycle — lattice energy',
      task('The lattice energy, U_lattice, is the energy released when free gaseous ions come together into one mole of the solid, and it cannot be measured directly. Adjust each measured step of the NaCl cycle and watch the lattice energy that has to close the loop.'),
      slider({ label: 'ΔH_sub, turning the solid metal into gas (kJ/mol)', min: 50, max: 200, step: 1, value: bhSub, onInput: v => { bhSub = v; bhCalc(); } }),
      slider({ label: 'IE, ionisation energy of the metal atom (kJ/mol)', min: 300, max: 900, step: 1, value: bhIE, onInput: v => { bhIE = v; bhCalc(); } }),
      slider({ label: '½D, splitting half a mole of X₂ into atoms (kJ/mol)', min: 50, max: 250, step: 1, value: bhDiss, onInput: v => { bhDiss = v; bhCalc(); } }),
      slider({ label: 'EA, electron affinity of the non-metal atom (kJ/mol)', min: 200, max: 400, step: 1, value: bhEA, onInput: v => { bhEA = v; bhCalc(); } }),
      slider({ label: 'ΔH_f, enthalpy of formation of the salt (kJ/mol)', min: -700, max: -200, step: 1, value: bhHf, onInput: v => { bhHf = v; bhCalc(); } }),
      bhOut,
      h('p', { class: 'muted' }, 'Defaults are NaCl, whose measured steps return U ≈ −788 kJ/mol. The cycle is just Hess\'s law drawn as a loop — the unmeasurable lattice energy falls out of the measurable steps.'),
    );
    bhCalc();
    root.append(topicPage(pageId ?? 'thermo1', {
      // Hess's law is not in the Phase 6 table; it is Core material by the
      // same reading as the Core theory block, which teaches it.
      sims: [atLevel('basics', calCard), atLevel('core', hessCard),
        atLevel('core', bondCard), atLevel('contest', bhCard)],
      quiz: pageQuiz(pageId ?? 'thermo1', THERMO1_QUIZ),
      theory: [
        theory('Basics — Thermodynamics I', `
<h3>What this is about</h3>
<p>Every reaction and every change of state moves energy around as heat. This block covers how that heat is measured, which way it flows, and what the sign of an enthalpy change means.</p>
<h3>Heat always flows from hot to cold</h3>
<p>Put a hot block against a cold one and energy moves from the hot one to the cold one. It never runs the other way on its own. The two settle at a single shared temperature, and that state is thermal equilibrium. The system is whatever you are studying, and the surroundings are everything else.</p>
<h3>Specific heat capacity</h3>
<p>Specific heat capacity, written c, is the energy needed to warm one gram of a substance by one degree. Its units are joules per gram per kelvin, J/g·K. Water's value is 4.18 J/g·K, which is unusually large. Lead's is 0.128 J/g·K, so the same heat warms a gram of lead about 33 times as much as a gram of water.</p>
<p>Here is the sum. Warming 100 g of water by 10 °C takes 100 × 4.18 × 10 = 4180 J, or about 4.2 kJ. Written in general that is <span class="eq">q = m c ΔT</span> where q is the heat in joules, m is the mass in grams, c is the specific heat capacity, and ΔT is the temperature change. A degree Celsius and a kelvin are the same size, so ΔT is the same number in either.</p>
<h3>Mixing two substances</h3>
<p>Drop hot metal into cool water in an insulated cup and no heat escapes to the room. Whatever the water gains, the metal loses, so the heat gained by one is the heat lost by the other with the sign flipped. Setting those two q = mcΔT expressions against each other gives one final temperature shared by both. That is the calculation the first card solves for you.</p>
<p>The answer is usually surprising. A large mass of lead barely shifts a smaller mass of water, because the product m × c decides the outcome and water's c is so much bigger.</p>
<h3>Enthalpy and its sign</h3>
<p>ΔH, the enthalpy change, is the heat taken in by the system while the pressure is held constant, which is what an open beaker does. A reaction that gives out heat is exothermic, so the system loses energy and ΔH is negative. A reaction that takes heat in is endothermic and ΔH is positive. Burning methane is exothermic. A cold pack dissolving its salt is endothermic.</p>
<p>The sign is written from the system's point of view, not yours. A beaker that feels hot to the hand is losing energy, so its ΔH is negative.</p>
<h3>Melting and boiling take heat with no rise in temperature</h3>
<p>Pulling particles apart costs energy. Melting ice, boiling water and evaporating a solvent are all endothermic. Freezing, condensing and crystallising give that same energy back and are exothermic.</p>
<p>While ice is melting the temperature stays at 0 °C, even though heat is still going in. All of that energy is spent breaking the solid apart rather than speeding the particles up. Melting one mole of ice takes 6.01 kJ, and q = mcΔT cannot be used during the melt because there is no ΔT to put in it.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Use q = mcΔT to find a heat, a mass or a temperature change, with the right units.</li>
<li>Give the sign of ΔH for an exothermic and an endothermic change, and sort melting, freezing, boiling and burning into the two.</li>
<li>Explain why the substance with the larger m × c moves less in temperature when two substances are mixed.</li>
</ul>`, true, 'basics'),
        theory('Core — Thermodynamics I', `
<h3>What this block adds</h3>
<p>Basics used q = mcΔT on a single substance and gave the sign of ΔH. Core runs that equation on both substances at once and turns a measured heat into an enthalpy change per mole. It also finds ΔH for a reaction that was never carried out.</p>
<h3>Two substances, one final temperature</h3>
<p>Inside an insulated container the heat one substance loses is exactly the heat the other gains. Setting the two q = mcΔT expressions equal leaves one unknown, the shared final temperature.</p>
<p>Drop 50.0 g of copper at 100.0 °C into 100.0 g of water at 20.0 °C. Copper's specific heat capacity is 0.385 J/g·K. The copper loses 50.0 × 0.385 × (100.0 − T) and the water gains 100.0 × 4.18 × (T − 20.0). Setting those equal gives 1925 − 19.25T = 418T − 8360, so T = 23.5 °C.</p>
<p>The copper cools by 76.5 degrees while the water warms by only 3.5. The product m × c decides that split, and the water's is more than twenty times larger.</p>
<h3>From a measured heat to an enthalpy change per mole</h3>
<p>A calorimeter is an insulated container that lets a reaction's heat warm a known mass of liquid. Measure the temperature rise, work out q, then divide by the moles that reacted.</p>
<p>Mix 50.0 mL of 1.00 M hydrochloric acid with 50.0 mL of 1.00 M sodium hydroxide, both starting at 21.0 °C. The temperature rises to 27.8 °C. The mixture masses about 100.0 g and behaves like water, so c = 4.18 J/g·K. That gives q = 100.0 × 4.18 × 6.8 = 2840 J. The acid supplied 0.0500 L × 1.00 mol/L = 0.0500 mol of H⁺, and the mixture warmed, so the reaction gave that heat out.</p>
<p>That works out at −2840 ÷ 0.0500 = −56 800 J/mol, or −56.8 kJ per mole of water formed. The minus sign comes from the mixture heating up, not from the arithmetic. Written in general, with n the moles the value is quoted per:</p>
<p><span class="eq">ΔH = −q ÷ n</span></p>
<h3>Reading an energy diagram</h3>
<p>An energy diagram places the reactants and the products on a vertical energy scale. Nothing else on the axis matters, because only the difference between the two levels is measurable.</p>
<p>In an exothermic reaction the products sit below the reactants, and ΔH is the downward gap, written with a minus sign. In an endothermic reaction the products sit above and ΔH is positive. Burning methane drops a long way at −890 kJ/mol, while melting ice climbs a short way at +6.01 kJ/mol.</p>
<h3>Hess's law</h3>
<p>The enthalpy change of a reaction depends only on the substances you start and finish with, never on the route between them. So known equations can be reversed, scaled and added until they sum to the equation you want.</p>
<p>Carbon monoxide cannot be made cleanly from carbon and oxygen, so ΔH for C(s) + ½O₂(g) → CO(g) is found indirectly. Two combustions are known: C(s) + O₂(g) → CO₂(g) at −393.5 kJ/mol, and CO(g) + ½O₂(g) → CO₂(g) at −283.0 kJ/mol. Reverse the second, which flips its sign to +283.0, then add the two. CO₂ appears on both sides and cancels, leaving C(s) + ½O₂(g) → CO(g) with ΔH = −393.5 + 283.0 = −110.5 kJ/mol.</p>
<p>Two rules do all the work here. Reversing an equation reverses the sign of its ΔH, and multiplying an equation through by a number multiplies ΔH by that same number.</p>
<h3>Estimating ΔH from bond enthalpies</h3>
<p>A bond enthalpy is the energy needed to break one mole of a particular bond in the gas phase. Breaking bonds always costs energy and making them always releases it.</p>
<p>For H₂(g) + Cl₂(g) → 2HCl(g), breaking one H–H bond at 436 kJ/mol and one Cl–Cl bond at 242 kJ/mol costs 678 kJ. Making two H–Cl bonds at 431 kJ/mol each releases 862 kJ. So ΔH = 678 − 862 = −184 kJ/mol, against a measured −184.6. In general:</p>
<p><span class="eq">ΔH ≈ Σ(bonds broken) − Σ(bonds formed)</span></p>
<p>Σ is the Greek capital letter sigma, and it means "add up all of". So this says: add up every bond broken, add up every bond formed, and subtract the second total from the first.</p>
<p>This route gives an estimate rather than an exact answer. A tabulated bond enthalpy is an average taken over many different molecules, and the method only works for gases.</p>
<h3>What you should be able to do now</h3>
<ul>
<li>Find a shared final temperature by setting one substance's heat loss equal to the other's heat gain.</li>
<li>Turn a calorimeter temperature rise into ΔH per mole, with the correct sign and units.</li>
<li>Sketch and read an energy diagram for an exothermic and an endothermic change.</li>
<li>Combine two known reactions by Hess's law, reversing and scaling the ΔH values as you go.</li>
<li>Estimate ΔH from bond enthalpies, and say why the answer is only an estimate.</li>
</ul>`, true, 'core'),
        theory('Contest reference — Thermodynamics I', `
<h3>First law</h3>
<span class="eq">ΔU = q + w &nbsp;·&nbsp; w = −P<sub>ext</sub>ΔV (work done ON the system is +)</span>
<ul>
<li>Gas expands → system does work → w &lt; 0. Constant volume: ΔU = q<sub>v</sub>. Constant pressure: ΔH = q<sub>p</sub>.</li>
<li>ΔH = ΔU + Δ(PV) = ΔU + Δn<sub>gas</sub>RT for reactions.</li>
</ul>
<h3>Calorimetry</h3>
<span class="eq">q = mcΔT (heating) &nbsp;·&nbsp; q = nΔH<sub>fus/vap</sub> (phase change, no ΔT!) &nbsp;·&nbsp; q<sub>cal</sub> = C<sub>cal</sub>ΔT</span>
<ul>
<li>Heating curve problems: sum each segment. Ice→steam: q₁(warm ice) + q₂(melt) + q₃(warm water) + q₄(boil) + q₅(warm steam).</li>
<li>Water: c = 4.18 J/g·K, ΔH<sub>fus</sub> = 6.01 kJ/mol, ΔH<sub>vap</sub> = 40.7 kJ/mol.</li>
<li><span class="trap">Bomb calorimeter measures ΔU (constant V), coffee-cup measures ΔH (constant P).</span></li>
</ul>
<h3>Enthalpies of formation</h3>
<span class="eq">ΔH°<sub>rxn</sub> = Σ nΔH°f(products) − Σ nΔH°f(reactants)</span>
<ul>
<li>ΔH°f = 0 for elements in their standard state: O₂(g), N₂(g), C(graphite), Br₂(l), Hg(l), S₈(s)… <span class="trap">not O(g), not C(diamond)</span>.</li>
<li>Three routes to ΔH: formation enthalpies (exact), Hess cycles (exact), bond enthalpies (estimate, gas phase only).</li>
<li><b>Born–Haber cycle:</b> a Hess loop for ionic solids — ΔH_f = ΔH_sub + IE + ½D − EA + U_lattice — lets you extract the unmeasurable lattice energy from measurable steps.</li>
<li><b>Kirchhoff's law:</b> ΔH is temperature-dependent — ΔH(T₂) = ΔH(T₁) + ΔC_p(T₂ − T₁), where ΔC_p = ΣC_p(products) − ΣC_p(reactants).</li>
</ul>`, false, 'contest'),
      ],
    }));
  },
};
