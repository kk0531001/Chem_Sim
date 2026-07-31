// Question Bank — Part II: multi-part free-response problems in USNCO Part II /
// CCC Part B-C style. All problems are original. Each part reveals a full
// worked solution.

export interface FRQ {
  id: string;        // explicit and permanent — see QuizQ in framework.ts
  topic: string;     // an ExamTopicId (the coarse 12), not a ModuleId
  tier?: 1 | 2 | 3 | 4;   // optional override; see tierOf() in content/registry.ts
  comps?: readonly ('ccc' | 'usnco' | 'cco' | 'icho')[];   // optional override
  title: string;
  prompt: string; // HTML — the stem / given data
  parts: { q: string; a: string }[];   // sub-parts deliberately have no ids
}

export const PART2: FRQ[] = [
  // ================= STOICHIOMETRY =================
  {
    id: 'p2-stoich-001',
    topic: 'stoich',
    title: 'Combustion analysis of a sugar',
    prompt: 'A 0.300 g sample of a compound containing only C, H and O is burned completely, producing 0.440 g of CO₂ and 0.180 g of H₂O. A separate experiment gives a molar mass of about 180 g/mol.',
    parts: [
      { q: '(a) Find the moles of C and H in the sample.', a: 'C: 0.440 g ÷ 44.01 g/mol = 0.0100 mol C. H: 0.180 g ÷ 18.02 g/mol = 0.00999 mol H₂O → <b>0.0200 mol H</b>. Every C ends up in CO₂ and every H in H₂O — that\'s the whole trick of combustion analysis.' },
      { q: '(b) Show that the compound contains oxygen and find its moles.', a: 'Mass of C = 0.0100 × 12.01 = 0.120 g; mass of H = 0.0200 × 1.008 = 0.0202 g. Together: 0.140 g < 0.300 g → the missing 0.160 g is O → 0.160/16.00 = <b>0.0100 mol O</b>. (Never assume O — always find it by difference.)' },
      { q: '(c) Determine the empirical and molecular formulas.', a: 'C : H : O = 0.0100 : 0.0200 : 0.0100 = 1 : 2 : 1 → empirical <b>CH₂O</b> (30.03 g/mol). 180 ÷ 30 = 6 → molecular formula <b>C₆H₁₂O₆</b> — glucose.' },
    ],
  },
  {
    id: 'p2-stoich-002',
    topic: 'stoich',
    title: 'Sodium carbonate and acid',
    prompt: 'A 1.06 g sample of pure Na₂CO₃ (M = 106.0 g/mol) is dissolved in water and titrated with 0.500 M HCl to complete neutralization:<br>Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂',
    parts: [
      { q: '(a) What volume of the HCl solution is required?', a: 'n(Na₂CO₃) = 1.06/106.0 = 0.0100 mol → n(HCl) = 2 × 0.0100 = 0.0200 mol → V = 0.0200/0.500 = <b>40.0 mL</b>. The 2:1 ratio is the whole question — diprotic bases need double.' },
      { q: '(b) What volume of CO₂ is released at STP (22.4 L/mol)?', a: 'n(CO₂) = n(Na₂CO₃) = 0.0100 mol → V = 0.0100 × 22.4 = <b>0.224 L = 224 mL</b>.' },
      { q: '(c) Write the net ionic equation.', a: '<b>CO₃²⁻ + 2H⁺ → H₂O + CO₂(g)</b>. Na⁺ and Cl⁻ are spectators; carbonate stays together (weak base), HCl splits (strong acid).' },
    ],
  },
  {
    id: 'p2-stoich-003',
    topic: 'stoich',
    title: 'An antacid tablet by back-titration',
    prompt: 'A 0.5000 g antacid tablet (assume its only acid-neutralizing ingredient is CaCO₃, M = 100.09 g/mol) is crushed and treated with 50.00 mL of 0.2000 M HCl — a known excess:<br>CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)<br>The leftover (unreacted) HCl is then titrated with 0.1000 M NaOH, requiring 12.20 mL to reach the phenolphthalein endpoint.',
    parts: [
      { q: '(a) Find the mass percent of CaCO₃ in the tablet.', a: 'n(HCl) initial = 0.05000 × 0.2000 = 10.00 mmol. n(NaOH) = n(HCl excess) = 0.01220 × 0.1000 = 1.220 mmol. n(HCl reacted with CaCO₃) = 10.00 − 1.220 = 8.780 mmol → n(CaCO₃) = 8.780/2 = 4.390 mmol. mass = 4.390×10⁻³ mol × 100.09 g/mol = 0.4394 g → %CaCO₃ = 0.4394/0.5000 × 100 = <b>87.9%</b>.' },
      { q: '(b) The student forgot to gently boil the solution to expel dissolved CO₂ before titrating the excess acid — some CO₂ stayed in solution as carbonic acid and also consumed NaOH (CO₂ + 2NaOH → Na₂CO₃ + H₂O). Would the calculated %CaCO₃ come out too high or too low? Explain.', a: '<span class="trap">Too LOW.</span> The extra NaOH consumed by dissolved CO₂ makes the measured "excess HCl" look bigger than it really was. Since n(HCl reacted with CaCO₃) = initial − (measured excess), an artificially inflated excess makes the reacted amount — and therefore the calculated CaCO₃ — come out smaller than the true value.' },
      { q: '(c) What is the standard fix for this error?', a: 'Gently <b>boil the acidified solution for a minute or two</b> to drive off the dissolved CO₂ before titrating the remaining acid, then cool it back to room temperature and titrate — a standard step in every carbonate back-titration procedure, precisely because CO₂ solubility is what part (b) exploits.' },
    ],
  },
  {
    id: 'p2-stoich-004',
    topic: 'stoich',
    tier: 4, // two unknowns, one gas-volume measurement, simultaneous equations from mole-mass relationships — the Platinum move
    title: 'What is this alloy made of? (a mixture, solved by simultaneous equations)',
    prompt: 'A 2.50 g sample of a zinc–magnesium alloy is dissolved in excess HCl:<br>Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)<br>Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)<br>' +
      'All of the H₂ produced is collected over water at 25 °C, where the total pressure is 748 torr and water\'s vapor pressure is 23.8 torr. The collected gas occupies 1.64 L. (R = 0.08206 L·atm/mol·K; M: Zn = 65.38, Mg = 24.31)',
    parts: [
      { q: '(a) Find the partial pressure of the dry H₂, and the total moles of H₂ collected.', a: 'Dalton: P(H₂) = 748 − 23.8 = 724.2 torr = 0.9529 atm. n = PV/RT = (0.9529 × 1.64)/(0.08206 × 298) = <b>0.0639 mol</b>.' },
      { q: '(b) Let x = mass of Zn and y = mass of Mg in the sample. Write the two equations that x and y must satisfy (one from total mass, one from total moles of H₂), and solve for x and y.', a: 'Mass: x + y = 2.50. Moles of H₂ (each metal makes exactly 1 mol H₂ per mol metal, from the 1:1 ratios above): x/65.38 + y/24.31 = 0.0639. Solving the pair simultaneously: <b>x ≈ 1.51 g Zn, y ≈ 0.99 g Mg</b>.' },
      { q: '(c) Express the alloy composition as mass percent.', a: '%Zn = 1.51/2.50 × 100 ≈ <b>60.3%</b>; %Mg = 0.99/2.50 × 100 ≈ <b>39.7%</b>.' },
      { q: '(d) Why does this method work even though both metals produce exactly the same gas — how does the measurement distinguish between "more Zn" and "more Mg"?', a: 'It works because Zn and Mg have <span class="trap">different molar masses, so the same MASS of each metal produces a different NUMBER OF MOLES of H₂</span> (lighter Mg produces more moles of gas per gram than heavier Zn). The total mass alone can\'t separate the two metals — infinitely many (x, y) split 2.50 g — but pairing it with the total mole count of gas produced gives a second, independent equation, and two equations pin down two unknowns exactly.' },
    ],
  },
  {
    id: 'p2-stoich-005',
    topic: 'stoich',
    title: 'Yields multiply, they don\'t average',
    prompt: 'A three-step synthesis is planned: 2A → B (85% yield), B + C → D (90% yield, C in large excess), D → 2E (78% yield). The chemist starts with 5.00 mol of A.',
    parts: [
      { q: '(a) Find the actual moles of B, then D, then E obtained at each step.', a: 'B: theoretical = 5.00/2 = 2.50 mol → actual = 2.50 × 0.85 = <b>2.125 mol</b>. D: theoretical = 2.125 mol (1:1) → actual = 2.125 × 0.90 = <b>1.9125 mol</b>. E: theoretical = 1.9125 × 2 = 3.825 mol → actual = 3.825 × 0.78 = <b>2.98 mol</b>.' },
      { q: '(b) Find the overall percent yield of the whole sequence (actual mol E ÷ mol E if every step were 100%), and show it equals the product of the three step yields.', a: 'Theoretical maximum E (100% every step) = (5.00/2) × 1 × 2 = 5.00 mol. Overall yield = 2.98/5.00 × 100 = <b>59.7%</b>. Check: 0.85 × 0.90 × 0.78 = 0.5967 = <b>59.7%</b> ✓ — overall yield is the product of the step yields.' },
      { q: '(c) A colleague argues it\'s simpler to just average the three percentages — (85 + 90 + 78)/3 = 84.3% — "since yield is yield." Explain why this overstates the true result, using the numbers above.', a: '<span class="trap">84.3% versus the true 59.7% is a large, costly overstatement.</span> Averaging treats each step\'s loss as independent of the others, but each step\'s loss actually applies to an <em>already-shrunken</em> amount carried over from the step before — losses compound multiplicatively, not additively. A route with many even-slightly-lossy steps can have a shockingly low overall yield despite every individual step "looking fine" on its own — exactly why synthetic chemists count the number of steps in a route, not just each step\'s yield, when planning a synthesis.' },
    ],
  },

  // ================= STATES OF MATTER & GASES =================
  {
    id: 'p2-states-001',
    topic: 'states',
    title: 'Identifying a gas from PVT data',
    prompt: 'A 0.500 g sample of a pure gas occupies 245 mL at 25.0 °C and 1.00 atm. (R = 0.08206 L·atm/mol·K)',
    parts: [
      { q: '(a) Calculate the moles of gas and its molar mass.', a: 'n = PV/RT = (1.00 × 0.245)/(0.08206 × 298.2) = 0.245/24.47 = <b>0.0100 mol</b> → M = 0.500 g / 0.0100 mol = <b>50.0 g/mol</b>.' },
      { q: '(b) The gas contains only C, H and Cl, with one Cl per molecule. Suggest a formula.', a: 'M − Cl = 50.0 − 35.45 = 14.55 for CₓHᵧ → CH₂ fits (14.03) → <b>CH₃Cl (50.5 g/mol)</b>, chloromethane — within experimental error.' },
      { q: '(c) Calculate the density of this gas at STP and compare it with air (≈1.29 g/L).', a: 'd = M/22.4 = 50.5/22.4 ≈ <b>2.25 g/L</b> — about 1.7× denser than air, so it accumulates in low, poorly ventilated spaces. Density comparisons at the same T, P are just molar-mass comparisons.' },
    ],
  },
  {
    id: 'p2-states-002',
    topic: 'states',
    title: 'Hydrogen collected over water',
    prompt: 'Zinc reacts with excess hydrochloric acid: Zn + 2HCl → ZnCl₂ + H₂. The hydrogen is collected over water at 25.0 °C. The total pressure is 760.0 torr and the collected volume is 500.0 mL. (P°(H₂O, 25 °C) = 23.8 torr)',
    parts: [
      { q: '(a) Find the partial pressure of the dry hydrogen.', a: 'Dalton: P(H₂) = 760.0 − 23.8 = <b>736.2 torr = 0.9687 atm</b>. Gas collected over water is always wet — skipping this correction inflates every later number.' },
      { q: '(b) Calculate the moles of H₂ collected.', a: 'n = PV/RT = (0.9687 × 0.5000)/(0.08206 × 298.2) = 0.4844/24.47 = <b>0.0198 mol</b>.' },
      { q: '(c) What mass of zinc reacted? (M = 65.4)', a: '1:1 ratio → n(Zn) = 0.0198 mol → m = 0.0198 × 65.4 = <b>1.30 g</b>.' },
    ],
  },
  {
    id: 'p2-states-003',
    topic: 'states',
    tier: 4, // molar mass alone can't resolve a mass-twin pair — needs a second independent line of evidence, the Platinum move
    title: 'A molar mass with two possible identities',
    prompt: 'A colorless gas X is collected in a 1.00 L flask at 25.0 °C; the pressure reads 1.00 atm and the gas has mass 1.80 g. (R = 0.08206 L·atm/mol·K)<br>' +
      'Separately, 250 mL of X effuses through a pinhole in 74.0 s; under identical conditions, 250 mL of O₂ (M = 32.00) takes 63.0 s.',
    parts: [
      { q: '(a) Use the ideal gas law to find the molar mass of X.', a: 'n = PV/RT = (1.00 × 1.00)/(0.08206 × 298) = 1.00/24.45 = <b>0.0409 mol</b> → M = 1.80/0.0409 ≈ <b>44.0 g/mol</b>.' },
      { q: '(b) Use the effusion data (Graham\'s law) to find M independently, and confirm it agrees with part (a).', a: 'Same volume, so rate ∝ 1/t: t_X/t_(O₂) = √(M_X/M_(O₂)) → M_X = M_(O₂)(t_X/t_(O₂))² = 32.00 × (74.0/63.0)² = 32.00 × 1.376 ≈ <b>44.0 g/mol</b> — the two independent methods agree.' },
      { q: '(c) Two real, common gases share this molar mass almost exactly: CO₂ (44.01 g/mol) and N₂O (44.01 g/mol). Propose ONE simple chemical test that distinguishes them, and state the expected result for each.', a: 'Bubble the gas through <b>limewater, Ca(OH)₂(aq)</b>: CO₂ reacts (CO₂ + Ca(OH)₂ → CaCO₃(s) + H₂O) and turns it milky; N₂O is a comparatively unreactive, stable linear molecule under these conditions and <b>does not</b> turn limewater milky. (Other valid tests: N₂O supports combustion of a glowing splint even better than O₂ in some setups, or IR/mass spectrometry would show different fragmentation — any test that distinguishes the two is acceptable.)' },
      { q: '(d) A student argues "X must be CO₂, because 44.0 g/mol is the molar mass of CO₂." What is wrong with that reasoning?', a: 'Molar mass is a <span class="trap">many-to-one</span> property: many different substances can share (or nearly share) the same value — CO₂ and N₂O both land at 44.01 g/mol purely by coincidence of their atomic compositions (44 = 12+2×16 for CO₂, 44 = 2×14+16 for N₂O). Matching a molar mass narrows the candidates but can never uniquely identify a substance on its own; identity requires an independent, structure- or reactivity-sensitive property, like the chemical test in part (c).' },
    ],
  },
  {
    id: 'p2-states-004',
    topic: 'states',
    tier: 4, // isolates which vdW correction term actually drives the deviation, not just "compute a bigger number" — the Platinum move
    title: 'How wrong is the ideal gas law? (van der Waals, CO₂)',
    prompt: '1.00 mol of CO₂ is confined to 0.500 L at 300 K. For CO₂: a = 3.592 L²·atm/mol², b = 0.04267 L/mol. (R = 0.08206 L·atm/mol·K)',
    parts: [
      { q: '(a) Calculate P using the ideal gas law.', a: 'P = nRT/V = (1.00)(0.08206)(300)/0.500 = <b>49.2 atm</b>.' },
      { q: '(b) Calculate P using the van der Waals equation, (P + an²/V²)(V − nb) = nRT.', a: 'P = nRT/(V − nb) − an²/V² = (1.00)(0.08206)(300)/(0.500 − 0.04267) − (3.592)(1.00)²/(0.500)² = 24.618/0.45733 − 14.368 = 53.83 − 14.37 = <b>39.5 atm</b>.' },
      { q: '(c) By what percentage does the ideal gas law overestimate the true pressure here?', a: '(49.2 − 39.5)/39.5 × 100 = <b>≈ 25% too high</b> — nowhere close to a "small correction," because 1 mol in 0.500 L is a genuinely dense gas.' },
      { q: '(d) Compute P using ONLY the volume correction (set a = 0) and ONLY the attraction correction (set b = 0), separately. Which correction is actually responsible for most of the 25% deviation?', a: 'b-only (a = 0): P = nRT/(V − nb) = <b>53.8 atm</b> — 9.3% <i>above</i> ideal. a-only (b = 0): P = nRT/V − an²/V² = <b>34.9 atm</b> — 29.2% <i>below</i> ideal. <span class="trap">The two corrections push in OPPOSITE directions</span> and the attraction term (a) is nearly 3× larger in magnitude — it dominates, which is why the net van der Waals pressure ends up below the ideal value even though the molecular-volume term alone would have raised it.' },
    ],
  },
  {
    id: 'p2-states-005',
    topic: 'states',
    title: 'Finding ΔHvap from two vapor-pressure measurements',
    prompt: 'An unknown liquid\'s vapor pressure is measured at two temperatures: 296 torr at 10.0 °C and 533 torr at 25.0 °C.',
    parts: [
      { q: '(a) Use the two-point Clausius–Clapeyron equation to find ΔHvap.', a: 'ln(P₂/P₁) = −(ΔH/R)(1/T₂ − 1/T₁). ln(533/296) = 0.5893. T₁ = 283.15 K, T₂ = 298.15 K → 1/T₂ − 1/T₁ = −1.775×10⁻⁴ K⁻¹. ΔH = −R·ln(P₂/P₁)/(1/T₂ − 1/T₁) = −(8.314)(0.5893)/(−1.775×10⁻⁴) = <b>27.5 kJ/mol</b>.' },
      { q: '(b) Predict the normal boiling point (the temperature at which the vapor pressure reaches 760 torr).', a: 'Using either data point, e.g. T₁ = 283.15 K, P₁ = 296 torr: ln(760/296) = −(27500/8.314)(1/Tb − 1/283.15) → solving gives Tb ≈ <b>308.0 K = 34.9 °C</b>.' },
      { q: '(c) The two given data points were both measured BELOW the predicted boiling point. Explain why extrapolating the Clausius–Clapeyron line up to 760 torr is still valid, and what would make that extrapolation break down.', a: 'The Clausius–Clapeyron line describes a single physical process — liquid in equilibrium with its own vapor — continuously along the whole liquid branch, so a fit from two points anywhere on that branch predicts any other point on it, including the normal boiling point. It WOULD break down if extrapolated far enough to approach the critical point, where ΔH<sub>vap</sub> itself starts falling toward zero (the liquid and vapor are becoming indistinguishable) rather than staying constant, which the two-point method assumes.' },
    ],
  },
  {
    id: 'p2-states-006',
    topic: 'states',
    title: 'Supercritical CO₂ decaffeination',
    prompt: 'CO₂\'s triple point is −56.6 °C / 5.11 atm; its critical point is 31.1 °C / 72.8 atm. Coffee beans are decaffeinated by soaking them in CO₂ held at 90 °C and 300 atm.',
    parts: [
      { q: '(a) Identify the phase of the CO₂ during extraction, and justify it using both coordinates.', a: '<b>Supercritical fluid.</b> 90 °C (363 K) exceeds the critical temperature (31.1 °C) AND 300 atm exceeds the critical pressure (72.8 atm) — supercritical requires BOTH conditions at once, not just one.' },
      { q: '(b) Estimate the density of the CO₂ under these conditions using the IDEAL gas law, and comment on why this estimate is a poor description of what is actually happening.', a: 'd = PM/RT = (300)(44.01)/(0.08206 × 363) ≈ <b>443 g/L</b>. Real supercritical CO₂ near these conditions is far denser — typically 1.5–2× this ideal estimate, approaching liquid-like densities (hundreds of g/L more) — because at 300 atm the gas is packed dense enough that intermolecular attractions and finite molecular volume both matter enormously; the ideal gas law assumes neither.' },
      { q: '(c) To release the extracted caffeine, engineers vent the pressure from 300 atm back to 1 atm while keeping the temperature above 35 °C throughout, rather than cooling to 20 °C first and then venting. Using the definition of the critical point, explain why staying above 35 °C avoids a discrete "boiling" step.', a: '35 °C is still above Tc (31.1 °C), so at every pressure along the vent-down path there is no liquid–vapor phase boundary to cross — above Tc, "liquid" and "gas" are not distinct phases at any pressure, so density falls smoothly and continuously straight into the ordinary gas region, with no latent heat of vaporization to supply. Venting from 20 °C (below Tc) would cross the real vaporization curve at some pressure, forcing an actual boiling step — exactly the discrete phase change supercritical extraction is designed to avoid, and precisely why a conventional liquid solvent like dichloromethane must be evaporated off instead.' },
    ],
  },
  {
    id: 'p2-states-007',
    topic: 'states',
    title: 'Weighing a protein by osmotic pressure',
    prompt: '2.00 g of a purified protein is dissolved in enough water to make 100.0 mL of solution. Its osmotic pressure at 25 °C is measured to be 0.293 torr. (R = 0.08206 L·atm/mol·K)',
    parts: [
      { q: '(a) Find the molar mass of the protein.', a: 'π = MRT → M = π/(RT) = (0.293/760 atm)/(0.08206 × 298) = 3.855×10⁻⁴/24.45 = 1.577×10⁻⁵ mol/L. n = (1.577×10⁻⁵)(0.1000 L) = 1.577×10⁻⁶ mol. Molar mass = 2.00 g/1.577×10⁻⁶ mol ≈ <b>1.27×10⁶ g/mol</b>.' },
      { q: '(b) Calculate what the freezing-point depression of this same solution would be, and explain why nobody would actually try to measure the protein\'s molar mass this way.', a: 'molality ≈ 1.577×10⁻⁵ mol/kg (dilute aqueous solution) → ΔTf = Kf·m = 1.86 × 1.577×10⁻⁵ ≈ <b>2.93×10⁻⁵ °C</b> — thousands of times smaller than any ordinary thermometer can resolve. <span class="trap">Colligative properties depend only on the NUMBER of dissolved particles, and one huge protein molecule is still just one particle</span> — so for a macromolecule, molality is tiny even at a easily-weighable mass concentration, making ΔTf hopeless while the corresponding osmotic pressure, though still small, remains large enough (fractions of a torr, not fractions of a microdegree) to measure with a sensitive osmometer.' },
      { q: '(c) Why is osmotic pressure so much more sensitive than freezing-point depression for a solute this large?', a: 'Both are the same underlying physics (count the dissolved particles), but the proportionality constants differ: RT ≈ 24.45 L·atm/mol at 25 °C versus Kf = 1.86 °C·kg/mol for water — RT is over ten times larger in magnitude, which alone would make π about 10× more responsive than ΔTf to the same tiny particle concentration. On top of that, standard instruments resolve fractions of a torr in osmotic pressure far more easily in practice than they resolve fractions of a thousandth of a degree in freezing point — so the theoretical amplification and the practical measurement resolution both favor osmotic pressure, compounding into the difference part (b) shows.' },
    ],
  },

  // ================= THERMODYNAMICS =================
  {
    id: 'p2-thermo-001',
    topic: 'thermo',
    title: 'Combustion calorimetry of ethanol',
    prompt: 'Burning 1.00 g of ethanol (C₂H₅OH, M = 46.07) under a simple can calorimeter raises the temperature of 500.0 g of water from 21.0 °C to 33.9 °C. (c = 4.18 J/g·K)',
    parts: [
      { q: '(a) How much heat did the water absorb?', a: 'q = mcΔT = 500.0 × 4.18 × 12.9 = <b>26 960 J ≈ 27.0 kJ</b>.' },
      { q: '(b) Estimate ΔH of combustion per mole of ethanol.', a: 'Per gram: −27.0 kJ. Per mole: −27.0 × 46.07 = <b>≈ −1240 kJ/mol</b> (negative — the water GAINED what the ethanol released).' },
      { q: '(c) The literature value is −1367 kJ/mol. Account for the difference and state whether each factor makes |ΔH| too small or too large.', a: 'Heat escapes to the air, the can, and by radiation, and combustion may be incomplete (sooty flame = some C instead of CO₂). All of these mean the water receives LESS than the true heat → measured |ΔH| is <b>too small</b>, exactly as found (1240 < 1367). Error-direction reasoning is the expected answer style here.' },
    ],
  },
  {
    id: 'p2-thermo-002',
    topic: 'thermo',
    title: 'Free energy and K for dinitrogen tetroxide',
    prompt: 'For N₂O₄(g) ⇌ 2NO₂(g): ΔH° = +57.2 kJ/mol and ΔS° = +175.8 J/mol·K, roughly independent of temperature.',
    parts: [
      { q: '(a) Calculate ΔG° at 298 K.', a: 'ΔG° = ΔH° − TΔS° = 57.2 − 298(0.1758) = 57.2 − 52.4 = <b>+4.8 kJ/mol</b>. Watch the kJ/J unit trap — convert ΔS° first.' },
      { q: '(b) Calculate K at 298 K.', a: 'K = e^(−ΔG°/RT) = e^(−4800/(8.314 × 298)) = e^(−1.94) = <b>0.14</b>. ΔG° > 0 → K < 1, but the reaction still proceeds partially — a flask of N₂O₄ is visibly brown.' },
      { q: '(c) At what temperature does K = 1?', a: 'K = 1 when ΔG° = 0 → T = ΔH°/ΔS° = 57 200/175.8 = <b>325 K (52 °C)</b>. Above this, entropy wins and NO₂ dominates; below, the dimer does.' },
    ],
  },

  // ================= KINETICS =================
  {
    id: 'p2-kinetics-001',
    topic: 'kinetics',
    title: 'Rate law from initial rates',
    prompt: 'For A + B → products:<br><table class="ref-table"><tr><th>[A]₀ (M)</th><th>[B]₀ (M)</th><th>rate (M/s)</th></tr><tr><td>0.10</td><td>0.10</td><td>2.0×10⁻⁴</td></tr><tr><td>0.20</td><td>0.10</td><td>8.0×10⁻⁴</td></tr><tr><td>0.10</td><td>0.20</td><td>4.0×10⁻⁴</td></tr></table>',
    parts: [
      { q: '(a) Determine the order in A and in B.', a: 'Rows 1→2: [A] doubles, rate ×4 → <b>second order in A</b>. Rows 1→3: [B] doubles, rate ×2 → <b>first order in B</b>. Compare experiments where only one concentration changes.' },
      { q: '(b) Write the rate law and find k with units.', a: 'rate = k[A]²[B] → k = 2.0×10⁻⁴ / (0.10² × 0.10) = <b>0.20 M⁻²s⁻¹</b>. Third order overall → M⁻²s⁻¹.' },
      { q: '(c) Predict the rate when [A] = 0.30 M and [B] = 0.15 M.', a: 'rate = 0.20 × (0.30)² × 0.15 = 0.20 × 0.09 × 0.15 = <b>2.7×10⁻³ M/s</b>.' },
    ],
  },
  {
    id: 'p2-kinetics-002',
    topic: 'kinetics',
    title: 'First-order decomposition',
    prompt: 'A compound decomposes by first-order kinetics with k = 0.0231 min⁻¹ at 60 °C.',
    parts: [
      { q: '(a) What is the half-life?', a: 't½ = ln2/k = 0.693/0.0231 = <b>30.0 min</b> — constant throughout the reaction, the first-order signature.' },
      { q: '(b) How long until the reaction is 90% complete?', a: '10% remains: t = ln([A]₀/[A])/k = ln(10)/0.0231 = 2.303/0.0231 = <b>99.7 min</b> (≈ 3.3 half-lives, sensible: 3 half-lives leaves 12.5%).' },
      { q: '(c) What fraction remains after 2.0 hours?', a: '120 min = exactly 4 half-lives → (½)⁴ = <b>1/16 = 6.25%</b>. (Check: e^(−0.0231×120) = e^(−2.77) = 0.0625 ✓)' },
    ],
  },
  {
    id: 'p2-kinetics-003',
    topic: 'kinetics',
    tier: 4, // deriving an experimentally-real rate law from a proposed 3-step mechanism via the steady-state approximation, then justifying why a mechanism is needed at all — the Platinum move
    title: 'Why N₂O₅ decomposes as if it were first order',
    prompt: '2N₂O₅(g) → 4NO₂(g) + O₂(g) is experimentally first order overall in [N₂O₅]. A proposed mechanism:<br>' +
      'Step 1 (fast, reversible): N₂O₅ ⇌ NO₂ + NO₃ &nbsp; (forward k₁, reverse k₋₁)<br>' +
      'Step 2 (slow): NO₂ + NO₃ → NO + O₂ + NO₂ &nbsp; (k₂)<br>' +
      'Step 3 (fast): NO + N₂O₅ → 3NO₂ &nbsp; (k₃)',
    parts: [
      { q: '(a) NO₃ is a reactive intermediate. Apply the steady-state approximation to it (d[NO₃]/dt ≈ 0) and solve for [NO₃] in terms of [N₂O₅] and [NO₂].', a: 'Formation (step 1 forward) minus consumption (step 1 reverse + step 2): d[NO₃]/dt = k₁[N₂O₅] − k₋₁[NO₂][NO₃] − k₂[NO₂][NO₃] = 0. Solving: <b>[NO₃] = k₁[N₂O₅] / ((k₋₁ + k₂)[NO₂])</b>.' },
      { q: '(b) The rate of O₂ formation is set by step 2: rate = k₂[NO₂][NO₃]. Substitute part (a) to find the overall rate law, and confirm it matches the experimental first-order behavior.', a: 'rate = k₂[NO₂] · k₁[N₂O₅]/((k₋₁+k₂)[NO₂]) = <b>(k₁k₂/(k₋₁+k₂)) [N₂O₅]</b> — the [NO₂] cancels completely, leaving a rate law <span class="trap">first order in [N₂O₅] alone</span>, exactly matching experiment, even though the mechanism has three steps and involves two other species.' },
      { q: '(c) Why is a multi-step mechanism like this chemically necessary here, rather than N₂O₅ simply reacting in one single step matching the overall balanced equation (2N₂O₅ → 4NO₂ + O₂)?', a: 'An elementary step is a real molecular collision/rearrangement event, and its molecularity is limited by what can plausibly collide at once — a single step exactly matching "2N₂O₅ → 4NO₂ + O₂" would require two N₂O₅ molecules to collide with exactly the right geometry to simultaneously rearrange into five product molecules, an astronomically improbable event. Real reactions with complex overall stoichiometry almost always proceed through a sequence of simple (uni- or bimolecular) elementary steps — which is exactly why chemists propose a mechanism and test it against the experimental rate law, rather than assuming the balanced equation IS the mechanism.' },
    ],
  },
  {
    id: 'p2-kinetics-004',
    topic: 'kinetics',
    title: 'How much does a catalyst actually have to lower Ea?',
    prompt: 'At 300 K, an uncatalyzed reaction has k = 3.0×10⁻⁵ s⁻¹. With a catalyst present, at the SAME temperature, k = 1.5×10⁻² s⁻¹ (a 500-fold increase). Assume the catalyst leaves the pre-exponential factor A unchanged and acts purely by lowering Ea. (R = 8.314 J/mol·K)',
    parts: [
      { q: '(a) Using k = Ae^(−Ea/RT) for both cases, find ΔEa = Ea(uncatalyzed) − Ea(catalyzed).', a: 'k(cat)/k(uncat) = e^(ΔEa/RT) → 500 = e^(ΔEa/RT) → ΔEa = RT·ln(500) = (8.314)(300)(6.215) = 15 500 J/mol ≈ <b>15.5 kJ/mol</b>.' },
      { q: '(b) A classmate objects: "15.5 kJ/mol seems too small a change to cause a 500-fold rate increase — the catalyst must have changed A instead." Evaluate this claim using the numbers from (a).', a: 'The claim is <span class="trap">wrong, and the numbers already prove it</span>: plugging ΔEa = 15.5 kJ/mol back in reproduces exactly the observed 500× factor, with no change to A needed. The objection mistakes "modest-looking energy in kJ/mol" for "modest effect," but k depends <em>exponentially</em> on Ea/RT, not linearly on Ea — since RT at 300 K is only about 2.5 kJ/mol, a 15.5 kJ/mol shift is about 6 RT units, and e⁶ ≈ 400, comfortably enough to explain a few-hundred-fold rate change on its own.' },
      { q: '(c) If the SAME catalyst still lowers Ea by 15.5 kJ/mol at 400 K instead of 300 K, would the rate-enhancement factor still be 500×? Calculate it and comment.', a: 'k(cat)/k(uncat) = e^(ΔEa/RT) = e^(15500/(8.314×400)) = e^(4.66) ≈ <b>106×</b> — much smaller than 500×. <span class="trap">A fixed energy advantage buys a smaller relative speedup at higher temperature</span>, because RT has grown while ΔEa hasn\'t, shrinking the ratio ΔEa/RT in the exponent. Catalysts matter most, in relative terms, exactly where reactions are otherwise sluggish — at lower temperatures.' },
    ],
  },

  // ================= EQUILIBRIUM =================
  {
    id: 'p2-equilibrium-001',
    topic: 'equilibrium',
    title: 'PCl₅ dissociation from total pressure',
    prompt: 'Pure PCl₅(g) is sealed in a flask at an initial pressure of 1.00 atm. At equilibrium (constant T), the TOTAL pressure is 1.40 atm.<br>PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)',
    parts: [
      { q: '(a) Find the equilibrium partial pressures of all three gases.', a: 'Let x atm dissociate: total = (1.00 − x) + x + x = 1.00 + x = 1.40 → x = 0.40. So <b>P(PCl₅) = 0.60, P(PCl₃) = P(Cl₂) = 0.40 atm</b>. Total pressure tracks the CHANGE in moles — that\'s the insight being tested.' },
      { q: '(b) Calculate Kp.', a: 'Kp = (0.40)(0.40)/0.60 = <b>0.27</b>.' },
      { q: '(c) What is the percent dissociation, and how would halving the volume change it?', a: '<b>40% dissociated</b>. Halving V (doubling pressures) pushes the equilibrium toward FEWER gas moles (left) → percent dissociation drops. Kp stays the same; the position moves.' },
    ],
  },
  {
    id: 'p2-equilibrium-002',
    topic: 'equilibrium',
    title: 'Selective precipitation (the Mohr idea)',
    prompt: 'A solution is 0.010 M in both Cl⁻ and CrO₄²⁻. AgNO₃ is added slowly.<br>Ksp(AgCl) = 1.8×10⁻¹⁰ · Ksp(Ag₂CrO₄) = 1.1×10⁻¹²',
    parts: [
      { q: '(a) What [Ag⁺] is needed to begin precipitating each anion?', a: 'AgCl: [Ag⁺] = 1.8×10⁻¹⁰/0.010 = <b>1.8×10⁻⁸ M</b>. Ag₂CrO₄: [Ag⁺] = √(1.1×10⁻¹²/0.010) = √(1.1×10⁻¹⁰) = <b>1.0×10⁻⁵ M</b>. Note the square root — the stoichiometries differ, so compare required [Ag⁺], never raw Ksp values.' },
      { q: '(b) Which precipitates first, and what fraction of it remains when the second begins?', a: 'AgCl needs ~600× less Ag⁺ → <b>chloride precipitates first</b>. When chromate starts ([Ag⁺] = 1.0×10⁻⁵): [Cl⁻] = 1.8×10⁻¹⁰/1.0×10⁻⁵ = 1.8×10⁻⁵ M → only <b>0.18%</b> of the chloride is left.' },
      { q: '(c) Explain how this is used as a titration indicator.', a: 'In the Mohr method, chromate is the indicator: red-brown Ag₂CrO₄ appears only AFTER essentially all Cl⁻ is consumed — the first permanent red tinge marks the endpoint of a chloride titration.' },
    ],
  },
  {
    id: 'p2-equilibrium-003',
    topic: 'equilibrium',
    title: 'Finding Kc for FeSCN²⁺ by spectrophotometry',
    prompt: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq) (blood-red complex). A 1.00 cm cell is used throughout.<br>' +
      '<b>Calibration:</b> a standard 1.00×10⁻⁴ M FeSCN²⁺ solution gives absorbance A = 0.560 at the wavelength of maximum absorbance.<br>' +
      '<b>Trial:</b> a mixture starting at [Fe³⁺]₀ = 1.00×10⁻³ M and [SCN⁻]₀ = 1.00×10⁻⁴ M is allowed to reach equilibrium; its absorbance at the same wavelength is A = 0.448.',
    parts: [
      { q: '(a) Use the calibration data and Beer\'s law (A = εbc) to find the molar absorptivity ε of FeSCN²⁺.', a: 'ε = A/(bc) = 0.560/(1.00 cm × 1.00×10⁻⁴ M) = <b>5600 M⁻¹cm⁻¹</b>.' },
      { q: '(b) Find [FeSCN²⁺] at equilibrium in the trial mixture.', a: '[FeSCN²⁺] = A/(εb) = 0.448/(5600 × 1.00) = <b>8.00×10⁻⁵ M</b>.' },
      { q: '(c) Build an ICE table and calculate Kc.', a: 'x = 8.00×10⁻⁵ M reacted. [SCN⁻]eq = 1.00×10⁻⁴ − 8.00×10⁻⁵ = 2.00×10⁻⁵ M. [Fe³⁺]eq = 1.00×10⁻³ − 8.00×10⁻⁵ = 9.20×10⁻⁴ M.<br>Kc = [FeSCN²⁺]/([Fe³⁺][SCN⁻]) = 8.00×10⁻⁵/(9.20×10⁻⁴ × 2.00×10⁻⁵) = <b>4.35×10³ M⁻¹</b>.' },
      { q: '(d) Why is Fe³⁺ deliberately used in large excess over SCN⁻, instead of comparable starting concentrations of both?', a: 'A large excess of Fe³⁺ does two things at once: by Le Chatelier, it drives the equilibrium to consume SCN⁻ more completely (more of the colored product forms, giving a stronger, more precisely measurable absorbance), and it keeps [Fe³⁺] changing by only a small fraction of its initial value, so the system behaves as if only one concentration (SCN⁻) is really varying — simplifying both the experiment and the ICE table to a single unknown.' },
    ],
  },
  {
    id: 'p2-equilibrium-004',
    topic: 'equilibrium',
    title: 'Recognizing equilibrium from concentration-vs-time data',
    prompt: 'N₂O₄(g) ⇌ 2NO₂(g) is monitored in a sealed flask starting from pure N₂O₄:<br>' +
      '<table class="ref-table"><tr><th>t (s)</th><th>0</th><th>10</th><th>20</th><th>30</th><th>40</th></tr>' +
      '<tr><td>[N₂O₄] (M)</td><td>1.00</td><td>0.85</td><td>0.78</td><td>0.75</td><td>0.75</td></tr>' +
      '<tr><td>[NO₂] (M)</td><td>0</td><td>0.30</td><td>0.44</td><td>0.50</td><td>0.50</td></tr></table>',
    parts: [
      { q: '(a) From the table alone, identify the earliest time by which the system had reached equilibrium, and state the criterion you used.', a: 'By <b>t = 30 s</b> — [N₂O₄] and [NO₂] are unchanged between t = 30 s and t = 40 s. The criterion is unchanging concentrations between successive measurements (forward and reverse rates equal), not any particular elapsed time.' },
      { q: '(b) Calculate Kc.', a: 'Kc = [NO₂]²/[N₂O₄] = (0.50)²/0.75 = <b>0.333</b>.' },
      { q: '(c) A classmate argues the system reached equilibrium at t = 10 s, "because that\'s when the concentrations were changing the least compared to how fast they changed right at t = 0." What is wrong with this reasoning?', a: '<span class="trap">Slowing down is not the same as stopping.</span> Every approach to equilibrium is a decaying curve that slows continuously and asymptotically — it is slowing down at t = 10 s for the same reason it is still slowing down at t = 20 s, long before it actually arrives. The only valid test is whether concentrations have become <em>constant</em> between measurements, which first happens here at t = 30 s, not the moment the rate of change looks small.' },
    ],
  },
  {
    id: 'p2-equilibrium-005',
    topic: 'equilibrium',
    title: 'The 5% rule is about x versus C₀, not about K',
    prompt: 'At 25 °C, Kc = 4.6×10⁻³ for N₂O₄(g) ⇌ 2NO₂(g). A 0.100 M sample of pure N₂O₄ is allowed to reach equilibrium.',
    parts: [
      { q: '(a) Use the "x is small" shortcut to estimate [NO₂] at equilibrium.', a: 'Let x = [N₂O₄] reacted. Approximate 1.00 − x ≈ 0.100: (2x)²/0.100 ≈ 4.6×10⁻³ → x² = 1.15×10⁻⁴ → x ≈ 0.01072 M → <b>[NO₂] ≈ 0.0214 M</b>.' },
      { q: '(b) Check whether the shortcut was valid here. If not, solve exactly and compare.', a: 'x/C₀ = 0.01072/0.100 = <b>10.7% &gt; 5% — the shortcut was NOT valid.</b> Exact: 4x² + (4.6×10⁻³)x − 4.6×10⁻⁴ = 0 → x = 0.01016 M → <b>[NO₂] = 0.0203 M</b> — the approximation overshot by about 5.6%.' },
      { q: '(c) A classmate argues the shortcut "must be safe here because Kc = 4.6×10⁻³ is a small number." What is the flaw in that reasoning?', a: '<span class="trap">Validity depends on x relative to C₀, not on the raw size of K.</span> A small K only guarantees a small x when C₀ is large enough to keep x/C₀ under 5% — here C₀ is also small (0.100 M), so even this "small" K produces an x that is over 10% of it. There is no shortcut around actually checking x/C₀ after solving; a small K is not, by itself, a guarantee of anything.' },
    ],
  },
  {
    id: 'p2-equilibrium-006',
    topic: 'equilibrium',
    title: 'The Mohr endpoint, quantitatively',
    prompt: 'A chloride solution is titrated with AgNO₃ using K₂CrO₄ as a Mohr indicator, with [CrO₄²⁻] held at 5.0×10⁻³ M. Ksp(AgCl) = 1.8×10⁻¹⁰, Ksp(Ag₂CrO₄) = 1.1×10⁻¹². The original [Cl⁻] was 0.1000 M.',
    parts: [
      { q: '(a) Find [Ag⁺] at the instant Ag₂CrO₄ just begins to precipitate (the visible endpoint).', a: 'Ksp = [Ag⁺]²[CrO₄²⁻] → [Ag⁺]² = 1.1×10⁻¹²/5.0×10⁻³ = 2.2×10⁻¹⁰ → <b>[Ag⁺] = 1.48×10⁻⁵ M</b>.' },
      { q: '(b) At that same [Ag⁺], find the [Cl⁻] still left in solution — the chloride that has NOT yet precipitated when the color change is seen.', a: '[Cl⁻] = Ksp(AgCl)/[Ag⁺] = 1.8×10⁻¹⁰/1.48×10⁻⁵ = <b>1.21×10⁻⁵ M</b>.' },
      { q: '(c) Express that residual [Cl⁻] as a percentage of the original 0.1000 M, and comment on the size of the titration error it represents.', a: '1.21×10⁻⁵/0.1000 × 100 = <b>0.0121%</b> — utterly negligible. By the time the red Ag₂CrO₄ color appears, essentially all of the chloride (99.99%) has already precipitated as AgCl; the indicator signals the endpoint with a systematic error far smaller than ordinary reading/glassware error.' },
    ],
  },
  {
    id: 'p2-equilibrium-007',
    topic: 'equilibrium',
    tier: 4, // a genuine coupled-equilibrium synthesis (Ksp × Kf) with a real experimental-safety trap, not just a longer calculation — the Platinum move
    title: 'Dissolving AgCl in ammonia: a coupled equilibrium',
    prompt: 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq), Ksp = 1.8×10⁻¹⁰.<br>Ag⁺(aq) + 2NH₃(aq) ⇌ [Ag(NH₃)₂]⁺(aq), Kf = 1.7×10⁷.<br>Solid AgCl is stirred with 1.0 M NH₃ until equilibrium.',
    parts: [
      { q: '(a) Add the two equilibria to obtain one overall reaction, and find its equilibrium constant K.', a: 'AgCl(s) + 2NH₃(aq) ⇌ [Ag(NH₃)₂]⁺(aq) + Cl⁻(aq). Combining equilibria multiplies their constants: <b>K = Ksp·Kf = (1.8×10⁻¹⁰)(1.7×10⁷) = 3.06×10⁻³</b>.' },
      { q: '(b) Using the approximation [NH₃]eq ≈ 1.0 M (i.e. assuming little of it is consumed), estimate the molar solubility s of AgCl in 1.0 M NH₃.', a: 'K = s²/(1.0)² → s = √(3.06×10⁻³) ≈ <b>0.0553 M</b> — about 3200× more soluble than in pure water (s(pure) = √Ksp = 1.34×10⁻⁵ M).' },
      { q: '(c) Check whether the approximation in (b) was reasonable. If not, solve without it.', a: 'NH₃ consumed = 2s ≈ 0.111 M, which is <b>11% of the starting 1.0 M</b> — not negligible. Solving exactly: K = s²/(1.0 − 2s)² → √K = s/(1.0 − 2s) → s = √K/(1 + 2√K) = 0.05532/(1 + 0.1106) = <b>0.0498 M</b>. The approximation in (b) overstated the solubility by about 11%.' },
      { q: '(d) A student proposes using 10 M NH₃ instead, to dissolve even more AgCl for a synthesis, and leaving the resulting solution to stand overnight before use. Beyond needing much more concentrated ammonia, what is wrong with this plan?', a: 'Concentrated silver–ammonia solutions are a genuine, well-documented lab hazard: on standing, <span class="trap">[Ag(NH₃)₂]⁺ solutions can slowly deposit silver nitride/fulminating silver, an explosive solid sensitive to the slightest disturbance.</span> This is exactly why Tollens\' reagent (also a silver–ammonia complex) carries a standing instruction to prepare it fresh and never store it — a concentrated diammine-silver solution should be used immediately and never set aside.' },
    ],
  },

  // ================= ACIDS & BASES =================
  {
    id: 'p2-acids-001',
    topic: 'acids',
    title: 'Designing an acetate buffer',
    prompt: 'You have 1.00 L of 0.100 M acetic acid (pKa = 4.74) and solid NaOH. Target: a pH 5.00 buffer.',
    parts: [
      { q: '(a) What ratio [A⁻]/[HA] is required?', a: '10^(pH−pKa) = 10^0.26 = <b>1.82</b>. Slightly more base than acid, since the target sits just above pKa.' },
      { q: '(b) How many moles (and grams) of NaOH should be added?', a: 'NaOH converts HA → A⁻ one-for-one. With x mol converted: x/(0.100 − x) = 1.82 → x = 0.0645 mol → <b>2.58 g NaOH</b>. Partial neutralization builds the buffer in one step.' },
      { q: '(c) Calculate the pH after 0.0050 mol of HCl is added to the finished buffer.', a: 'HCl converts A⁻ → HA: A⁻ = 0.0645 − 0.005 = 0.0595; HA = 0.0355 + 0.005 = 0.0405. pH = 4.74 + log(0.0595/0.0405) = 4.74 + 0.17 = <b>4.91</b> — a drop of only 0.09 despite a strong-acid hit.' },
    ],
  },
  {
    id: 'p2-acids-002',
    topic: 'acids',
    title: 'Phosphoric acid, one proton at a time',
    prompt: 'H₃PO₄: Ka1 = 7.5×10⁻³, Ka2 = 6.2×10⁻⁸, Ka3 = 4.8×10⁻¹³. Consider a 0.100 M solution.',
    parts: [
      { q: '(a) Calculate the pH (justify any approximations).', a: 'Ka1 is too big for the shortcut (x ≈ 0.027 is 27% of 0.10!) — use the quadratic: x² = 7.5×10⁻³(0.100 − x) → x = 0.0239 → <b>pH = 1.62</b>. Later dissociations contribute negligibly to [H⁺].' },
      { q: '(b) Estimate [HPO₄²⁻] at equilibrium.', a: 'For the second step, [H₂PO₄⁻] ≈ [H⁺], so they cancel in the Ka2 expression → <b>[HPO₄²⁻] ≈ Ka2 = 6.2×10⁻⁸ M</b>. A famously slick result worth remembering.' },
      { q: '(c) Why does each successive Ka fall by ~10⁵?', a: 'Each proton must leave a MORE negatively charged ion (H₂PO₄⁻, then HPO₄²⁻) — electrostatics fights the departure harder each time, and the conjugate base has less capacity to stabilize additional charge.' },
    ],
  },

  // ================= ELECTROCHEMISTRY =================
  {
    id: 'p2-redox-001',
    topic: 'redox',
    title: 'A silver–nickel cell, complete workup',
    prompt: 'Half-reactions: Ag⁺ + e⁻ → Ag (E° = +0.80 V); Ni²⁺ + 2e⁻ → Ni (E° = −0.26 V).',
    parts: [
      { q: '(a) Identify anode and cathode, write the overall reaction, and find E°cell.', a: 'Higher E° is reduced: Ag⁺ at the <b>cathode</b>; Ni oxidizes at the <b>anode</b>. Overall: Ni + 2Ag⁺ → Ni²⁺ + 2Ag. E°cell = 0.80 − (−0.26) = <b>1.06 V</b>. (Doubling the silver half-reaction does NOT double its E°.)' },
      { q: '(b) Calculate ΔG°.', a: 'n = 2 → ΔG° = −nFE° = −2 × 96 485 × 1.06 = <b>−205 kJ/mol</b>. Spontaneous, as the positive voltage promised.' },
      { q: '(c) Find E when [Ni²⁺] = 1.0 M and [Ag⁺] = 0.010 M.', a: 'Q = [Ni²⁺]/[Ag⁺]² = 1.0/(10⁻²)² = 10⁴. E = 1.06 − (0.0592/2)log(10⁴) = 1.06 − 0.118 = <b>0.94 V</b>. Depleted cathode ion → weaker cell, as Le Chatelier predicts.' },
    ],
  },
  {
    id: 'p2-redox-002',
    topic: 'redox',
    title: 'Chrome plating by electrolysis',
    prompt: 'A part is plated with 25.0 g of chromium from a Cr³⁺ bath using a 10.0 A current. (M(Cr) = 52.0; F = 96 485 C/mol)',
    parts: [
      { q: '(a) How much charge is required?', a: 'n(Cr) = 25.0/52.0 = 0.481 mol → n(e⁻) = 3 × 0.481 = 1.44 mol → Q = 1.44 × 96 485 = <b>1.39×10⁵ C</b>.' },
      { q: '(b) How long does the plating take?', a: 't = Q/I = 1.39×10⁵/10.0 = 1.39×10⁴ s ≈ <b>3.9 hours</b>.' },
      { q: '(c) The same charge is passed through a Ag⁺ bath. What mass of silver deposits, and why is it so much larger?', a: 'n(Ag) = 1.44 mol (one electron each) → m = 1.44 × 107.9 = <b>156 g</b>. Same charge, 3× the moles (n = 1 vs 3) and double the molar mass — Faraday\'s laws in action.' },
    ],
  },

  // ================= ATOMIC STRUCTURE =================
  {
    id: 'p2-atomic-001',
    topic: 'atomic',
    title: 'The hydrogen spectrum, quantitatively',
    prompt: 'Use Eₙ = −13.6/n² eV for the hydrogen atom.',
    parts: [
      { q: '(a) Find the energy and wavelength of the n = 4 → n = 2 emission.', a: 'ΔE = 13.6(1/4 − 1/16) = 13.6 × 0.1875 = <b>2.55 eV</b> → λ = 1240/2.55 = <b>486 nm</b> — the blue-green Balmer line (H-β).' },
      { q: '(b) How much energy would ionize a hydrogen atom already in n = 2?', a: 'From E₂ = −3.4 eV to zero: <b>3.4 eV</b> — a quarter of the ground-state 13.6 eV, since E scales as 1/n².' },
      { q: '(c) Why does hydrogen emit discrete lines rather than a continuous spectrum?', a: 'Only certain energies are allowed (quantized stationary states); photons carry the exact DIFFERENCE between two levels. A continuum would require a continuum of allowed energies — which the atom doesn\'t have.' },
    ],
  },
  {
    id: 'p2-atomic-002',
    topic: 'atomic',
    title: 'Reading a photoelectron spectrum',
    prompt: 'An element\'s PES shows four peaks. Binding energy falls left to right; relative areas are given:<br><table class="ref-table"><tr><th>peak</th><th>1</th><th>2</th><th>3</th><th>4</th></tr><tr><td>area</td><td>2</td><td>2</td><td>6</td><td>1</td></tr></table>',
    parts: [
      { q: '(a) Assign the peaks and identify the element.', a: 'Areas 2, 2, 6, 1 → 1s², 2s², 2p⁶, 3s¹ → 11 electrons: <b>sodium</b>. Peak count = subshell count; area = electron count.' },
      { q: '(b) Why is the 2p peak at higher binding energy than 3s despite holding more electrons?', a: 'Binding energy reflects distance/shielding, not population: 2p electrons sit in the n = 2 shell, closer to the nucleus and far less shielded than the lone 3s electron.' },
      { q: '(c) Predict two differences in the PES of magnesium.', a: 'Mg (1s²2s²2p⁶3s²): the last peak DOUBLES in area (3s²), and every peak shifts to slightly higher binding energy — one more proton raises Z_eff across the board.' },
    ],
  },
  {
    id: 'p2-atomic-003',
    topic: 'atomic',
    tier: 4, // full multi-technique unknown-element identification — see framework.ts QuizQ.tier docs on when an override is warranted
    title: 'Identifying an unknown period-3 element from two independent techniques',
    prompt: 'An unknown period-3 element X is studied two ways.<br>' +
      '<b>Ionization energies</b> (kJ/mol): IE₁ = 577, IE₂ = 1817, IE₃ = 2745, IE₄ = 11 577.<br>' +
      '<b>Photoelectron spectrum</b> (binding energy falls left to right):<br>' +
      '<table class="ref-table"><tr><th>peak</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><td>relative area</td><td>2</td><td>2</td><td>6</td><td>2</td><td>1</td></tr></table>',
    parts: [
      { q: '(a) Using only the ionization-energy table, find the number of valence electrons in X and explain your reasoning.', a: 'IE₃ → IE₄ jumps from 2745 to 11 577 kJ/mol — a factor of &gt;4, versus roughly 1.6–1.9× between the earlier steps. That jump means the 4th electron removed comes from a full inner shell (much closer to the nucleus, far less shielded), so X has exactly <b>3 valence electrons</b> — a group 13 element.' },
      { q: '(b) Assign the five PES peaks and identify X.', a: 'Areas 2, 2, 6, 2, 1 → 1s², 2s², 2p⁶, 3s², 3p¹ → 13 electrons total. Group 13 (from part a) with Z = 13 is <b>aluminum</b> — and the peak areas alone already fix Z, independent of part (a).' },
      { q: '(c) Using IE₁, calculate the minimum photon energy (in eV) and the corresponding wavelength needed to photoionize a ground-state X atom, and state what region of the spectrum that photon is in.', a: 'IE₁ = 577 kJ/mol ÷ 96.5 kJ/mol per eV = <b>5.98 eV</b> per atom. λ = 1240/5.98 ≈ <b>207 nm</b> — that is <span class="trap">shorter than 400 nm, so this is the ultraviolet, not visible light</span> — ionizing a ground-state atom always takes more energy than a valence electronic transition between bound states.' },
      { q: '(d) Gallium (Z = 31, [Ar]3d¹⁰4s²4p¹) is also group 13 with 3 valence electrons, so it would show the same IE₃→IE₄ jump pattern as part (a). Explain why the PES data in part (b) rules out gallium on its own, without needing part (a) at all.', a: 'For a neutral atom, the sum of all PES peak areas equals the total electron count, i.e. Z. Here the areas sum to 2+2+6+2+1 = <b>13</b>, which is Al\'s atomic number — gallium (Z = 31) would show far more peaks (it has a filled 3d subshell and reaches n = 4) and areas summing to 31, not 13. <span class="trap">Two techniques that individually only narrow down the group both independently pin down the exact element here — that redundancy is what makes the identification solid.</span>' },
    ],
  },
  {
    id: 'p2-atomic-004',
    topic: 'atomic',
    tier: 4, // the data itself proves the series assignment (nf=3 is mathematically impossible for these lines), not just "compute more transitions" — the Platinum move
    title: 'Identifying an emission series from its wavelengths alone',
    prompt: 'A hydrogen discharge tube shows emission lines at <b>656.3 nm</b> and <b>434.2 nm</b>. (Rydberg constant R = 1.097×10⁷ m⁻¹)',
    parts: [
      { q: '(a) Assuming both lines end on the same lower level n_f, use the 656.3 nm line to find n_f and the initial level n_i for that transition. (Try n_f = 2 first.)', a: 'Rydberg: 1/λ = R(1/n_f² − 1/n_i²). With n_f = 2: 1/(656.3×10⁻⁹) = 1.524×10⁶ m⁻¹ = 1.097×10⁷(0.25 − 1/n_i²) → 1/n_i² = 0.25 − 0.1389 = 0.1111 → n_i² = 9 → <b>n_i = 3</b> (an exact integer — confirms the assumption). This is the Balmer series (n_f = 2).' },
      { q: '(b) Use the same n_f to find n_i for the 434.2 nm line.', a: '1/(434.2×10⁻⁹) = 2.303×10⁶ m⁻¹ = 1.097×10⁷(0.25 − 1/n_i²) → 1/n_i² = 0.25 − 0.2100 = 0.0400 → n_i² = 25 → <b>n_i = 5</b> — again an exact integer.' },
      { q: '(c) A classmate suggests these could instead be Paschen-series lines (n_f = 3). Show, using the 656.3 nm line, that this is not just unlikely but mathematically impossible.', a: 'With n_f = 3: 1/n_i² = 1/9 − 1.524×10⁶/1.097×10⁷ = 0.1111 − 0.1389 = <b>−0.0278</b>. A negative value for 1/n_i² is <span class="trap">not just "a bad fit" — it has no real solution at all</span>, since n_i² can never be negative. The Paschen series simply cannot produce a 656.3 nm line (its longest possible wavelength, n_i = ∞ → n_f = 3, is about 820 nm — every Paschen line is longer than that even). n_f = 2 is the only assignment consistent with the data.' },
      { q: '(d) Predict the wavelength of the (unobserved) n = 6 → n = 2 line, and name the region of the spectrum it falls in.', a: '1/λ = 1.097×10⁷(1/4 − 1/36) = 1.097×10⁷(0.2222) = 2.438×10⁶ m⁻¹ → λ = <b>410.2 nm</b> — still in the visible (violet), the fourth line of the Balmer series (H<sub>δ</sub>).' },
    ],
  },
  {
    id: 'p2-atomic-005',
    topic: 'atomic',
    title: 'Why 4s fills first but empties first: a Slater\'s-rules resolution',
    prompt: 'Fe (Z = 26) has ground-state configuration [Ar]3d⁶4s² — yet on ionization, Fe → Fe²⁺ removes BOTH 4s electrons before any 3d electron. Apply Slater\'s rules to Fe\'s 4s and 3d electrons to explain this apparent contradiction. (Slater grouping: (1s)(2s,2p)(3s,3p)(3d)(4s,4p)…; for an ns/np electron, same-group electrons shield 0.35, one-shell-lower shield 0.85, two-or-more-shells-lower shield 1.00; for an nd electron, everything to the left shields 1.00 and same-group electrons shield 0.35.)',
    parts: [
      { q: '(a) Calculate the shielding constant S and Zeff for a 4s electron in Fe.', a: 'Same group (other 4s electron): 1 × 0.35 = 0.35. One shell lower (n = 3: 3s²3p⁶3d⁶ = 14 electrons) at 0.85 each = 11.90. Two-plus shells lower (n ≤ 2: 1s²2s²2p⁶ = 10 electrons) at 1.00 each = 10.00. S = 0.35 + 11.90 + 10.00 = <b>22.25</b> → Zeff = 26 − 22.25 = <b>3.75</b>.' },
      { q: '(b) Calculate S and Zeff for a 3d electron in Fe.', a: 'Same group (other 3d electrons): 5 × 0.35 = 1.75. Everything to the left (1s²2s²2p⁶3s²3p⁶ = 18 electrons, all count as "left" of the 3d group) at 1.00 each = 18.00. The 4s² electrons are to the RIGHT of 3d in the group order and contribute <b>0</b>. S = 1.75 + 18.00 = <b>19.75</b> → Zeff = 26 − 19.75 = <b>6.25</b>.' },
      { q: '(c) Use these two numbers to explain why 4s electrons, not 3d electrons, are removed first on ionization.', a: 'Zeff(3d) = 6.25 is much larger than Zeff(4s) = 3.75 — <span class="trap">3d electrons shield 4s electrons well (0.85 per electron, since 3d counts as "one shell lower" for an s-electron), but s/p electrons shield d electrons at the full 1.00 per electron, an asymmetric relationship</span>. The 4s electrons, feeling the weaker net pull, are the more loosely held (higher-energy) electrons in the built-up atom and are the easiest to remove — even though Madelung\'s (n+ℓ) rule put them in the atom first while the atom was being constructed. Filling order and removal order are governed by different comparisons (orbital energy in the building-up atom vs. Zeff in the finished, multi-electron ion) and don\'t have to agree.' },
    ],
  },
  {
    id: 'p2-atomic-006',
    topic: 'atomic',
    title: 'The photoelectric effect, quantitatively',
    prompt: 'Sodium metal has a work function φ = 2.28 eV. It is illuminated with light of wavelength 400 nm. (hc = 1240 eV·nm)',
    parts: [
      { q: '(a) Calculate the energy of one incident photon, in eV.', a: 'E = hc/λ = 1240/400 = <b>3.10 eV</b>.' },
      { q: '(b) Find the maximum kinetic energy of the ejected photoelectrons, and the stopping potential needed to halt them.', a: 'KE_max = E − φ = 3.10 − 2.28 = <b>0.82 eV</b> → stopping potential V₀ = <b>0.82 V</b> (numerically equal in these units, since eV₀ = KE_max).' },
      { q: '(c) Find the threshold wavelength — the longest wavelength that can still eject an electron from sodium.', a: 'At threshold, KE_max = 0, so the whole photon energy equals φ: λ_threshold = hc/φ = 1240/2.28 = <b>544 nm</b> — green light. Sodium\'s low work function is exactly why alkali metals are used in photoelectric cells: even visible light, not just UV, can eject electrons.' },
      { q: '(d) A student increases the LIGHT INTENSITY at the original 400 nm, keeping the wavelength fixed, and expects the stopping potential to increase. Are they right?', a: '<span class="trap">No.</span> Stopping potential depends only on KE_max = hf − φ, which is set entirely by the photon energy (frequency), not by how many photons arrive per second. More intensity means more photoelectrons ejected per second — a bigger photocurrent — but each individual electron still leaves with the same maximum kinetic energy, so the stopping potential is completely unchanged.' },
    ],
  },

  // ================= BONDING =================
  {
    id: 'p2-bonding-001',
    topic: 'bonding',
    title: 'Nitrous oxide, three ways',
    prompt: 'Dinitrogen monoxide has the connectivity N–N–O (16 valence electrons).',
    parts: [
      { q: '(a) Draw the two major resonance structures and assign formal charges.', a: '<b>N≡N–O</b>: FC = 0, +1, −1 (on O). <b>N=N=O</b>: FC = −1, +1, 0 (on terminal N). Both keep full octets; charges sum to 0 either way.' },
      { q: '(b) Which structure contributes more, and why?', a: 'The <b>N≡N–O form</b> — its −1 sits on oxygen, the more electronegative atom. Measured bond lengths (N–N shorter than a typical double bond) agree.' },
      { q: '(c) Predict the geometry, and name a molecule isoelectronic with N₂O.', a: 'Two σ-domains on the central N → <b>linear</b>. With 16 valence electrons and three atoms, it is isoelectronic with <b>CO₂</b> (and N₃⁻, OCN⁻) — isoelectronic species share shapes.' },
    ],
  },
  {
    id: 'p2-bonding-002',
    topic: 'bonding',
    title: 'The oxygen family by MO theory',
    prompt: 'Consider O₂, O₂⁺, O₂⁻ and O₂²⁻ using the MO diagram for period-2 diatomics (σ2p below π2p).',
    parts: [
      { q: '(a) Give the bond order of each species.', a: 'Valence electrons 11, 12, 13, 14 → BO: <b>O₂⁺ 2.5, O₂ 2, O₂⁻ 1.5, O₂²⁻ 1</b>. Each added electron lands in antibonding π*, each removal takes one out.' },
      { q: '(b) Which are paramagnetic?', a: 'Count unpaired π* electrons: O₂⁺ (1), O₂ (2), O₂⁻ (1) are <b>paramagnetic</b>; peroxide O₂²⁻ has a full π* set — diamagnetic.' },
      { q: '(c) Rank the O–O bond lengths.', a: 'Inverse to bond order: <b>O₂⁺ &lt; O₂ &lt; O₂⁻ &lt; O₂²⁻</b>. Removing an ANTIBONDING electron shortens the bond — the counterintuitive result Lewis theory can\'t produce.' },
    ],
  },
  {
    id: 'p2-bonding-003',
    topic: 'bonding',
    title: 'A Born–Haber cycle, and what it reveals about bonding',
    prompt: 'Data for MgO(s), all per mole of MgO formed:<br>' +
      '<table class="ref-table"><tr><th>step</th><th>ΔH (kJ/mol)</th></tr>' +
      '<tr><td>ΔH°f [Mg(s) + ½O₂(g) → MgO(s)]</td><td>−601.7</td></tr>' +
      '<tr><td>sublimation, Mg(s) → Mg(g)</td><td>+148</td></tr>' +
      '<tr><td>IE₁ + IE₂ of Mg(g)</td><td>+738 + 1451</td></tr>' +
      '<tr><td>atomization, ½O₂(g) → O(g)</td><td>+249</td></tr>' +
      '<tr><td>EA₁ of O(g)</td><td>−141</td></tr>' +
      '<tr><td>EA₂ of O⁻(g)</td><td>+798</td></tr>' +
      '<tr><td>lattice energy, Mg²⁺(g) + O²⁻(g) → MgO(s)</td><td>?</td></tr></table>',
    parts: [
      { q: '(a) Use Hess\'s law to find the lattice energy of MgO.', a: 'Sum every step except the lattice energy: 148 + 738 + 1451 + 249 − 141 + 798 = <b>3243 kJ/mol</b>. Since the whole cycle must return to ΔH°f: −601.7 = 3243 + U → <b>U ≈ −3845 kJ/mol</b>.' },
      { q: '(b) EA₁ of oxygen is favorable (−141 kJ/mol) but EA₂ is strongly unfavorable (+798 kJ/mol). Explain why, given that both steps add one electron to an oxygen species.', a: 'EA₁ adds an electron to a <i>neutral</i> O atom — favorable. EA₂ adds a second electron to an already <b>negatively charged O⁻ ion</b>: the incoming electron is repelled by the existing negative charge, and that electron–electron (Coulombic) repulsion costs far more energy than the atom gains back — <span class="trap">EA₂ is never favorable for any element, which is why O²⁻ can only exist packed in a lattice, never as a free gas-phase ion.</span>' },
      { q: '(c) A purely ionic (point-charge electrostatic) model predicts lattice energies of about −3795 kJ/mol for MgO and about −770 kJ/mol for AgCl — yet the Born–Haber (experimental) value for AgCl is about −905 kJ/mol, a ~135 kJ/mol gap the point-charge model misses entirely, while MgO\'s two values (part a vs. −3795) agree to within a couple percent. What does that contrast say about the bonding in each compound?', a: 'MgO\'s close agreement means it is described well by a simple ionic point-charge picture — both ions have noble-gas-like electron clouds with nothing extra to distort. AgCl\'s large gap means real AgCl is <b>more stable than a pure ionic model predicts</b>, i.e. it has significant covalent character: Ag⁺ is small and has a polarizing 18-electron pseudo-noble-gas core (poor shielding from the filled d-subshell), and it distorts the electron cloud of the polarizable Cl⁻ toward itself (Fajans\' rules) — extra electron density shared between the ions is exactly the stabilization a point-charge model can\'t capture.' },
    ],
  },
  {
    id: 'p2-bonding-004',
    topic: 'bonding',
    tier: 4, // formal charges predicting a dipole direction that DEFEATS naive electronegativity, then a real toxicology consequence — the Platinum move
    title: 'Carbon monoxide: a bond dipole that runs backward',
    prompt: 'Carbon monoxide, CO, is isoelectronic with N₂ (10 valence electrons). Its measured dipole moment is only 0.122 D (compare HCl\'s 1.08 D) — startlingly small given that O (EN 3.44) is far more electronegative than C (EN 2.55).',
    parts: [
      { q: '(a) Draw the best Lewis structure of CO (satisfying the octet on both atoms) and assign formal charges.', a: ':C≡O: with one lone pair on each atom. FC(C) = 4 − 2 − 6/2 = <b>−1</b>. FC(O) = 6 − 2 − 6/2 = <b>+1</b>. (10 electrons total: 6 in the triple bond + 2 + 2 in the two lone pairs — checks out.)' },
      { q: '(b) State the bond order predicted by this structure, and note what real CO\'s bond length (112.8 pm, close to N₂\'s 109.8 pm) confirms.', a: 'Bond order <b>3</b> (a σ + 2π triple bond, exactly like N₂). The very short, N₂-like bond length confirms the triple-bond picture — CO is one of the strongest diatomic bonds known.' },
      { q: '(c) Use the formal charges from (a) to explain why the measured dipole is so much smaller than a simple electronegativity argument would predict — and why, remarkably, the negative end of the real molecule sits on carbon.', a: 'Naive electronegativity alone predicts a dipole with δ⁻ on the more electronegative O. But the Lewis structure puts a full formal <b>−1 on carbon</b> and <b>+1 on oxygen</b> — the opposite direction. The real molecule is a compromise between these two competing effects (electronegativity pulling density toward O, formal charge/orbital structure pushing it toward C), and they very nearly cancel, leaving a tiny net dipole — <span class="trap">with the formal-charge effect winning by just enough that the negative end experimentally sits on carbon, backwards from what EN alone would suggest.</span>' },
      { q: '(d) CO binds to the iron center of hemoglobin through its CARBON atom, not oxygen, and binds roughly 200× more strongly than O₂ does — which is exactly why CO is toxic. Connect this to part (a).', a: 'Carbon\'s lone pair (part a) is the one available to donate into an empty d-orbital on Fe — CO is a classic σ-donor ligand through carbon, not oxygen, in essentially all of its transition-metal chemistry (metal carbonyls, hemoglobin poisoning alike). Because the Fe–C bond it forms is reinforced by π-backbonding from filled Fe d-orbitals into CO\'s empty π* orbitals, the complex is far more stable than Fe–O₂, so CO occupies the oxygen-binding site and doesn\'t let go — the molecular-level reason CO poisoning is a suffocation mechanism, not a direct poison.' },
    ],
  },
  {
    id: 'p2-bonding-005',
    topic: 'bonding',
    title: 'Ozone: resonance you can measure',
    prompt: 'Ozone, O₃, is bent with a bond angle of 116.8° and two equal O–O bond lengths of 127.8 pm each. (Reference: a typical O–O single bond is ~148 pm; a typical O=O double bond is ~121 pm.)',
    parts: [
      { q: '(a) Draw the two resonance structures of O₃ and assign formal charges to all three oxygens in one of them.', a: 'O=O(+)–O(−) ↔ its mirror image, with the central O double-bonded to one terminal O and single-bonded to the other. Central O: 3 bonds + 1 lone pair → FC = 6 − 2 − 6/2 = <b>+1</b>. Double-bonded terminal O: 2 lone pairs + 1 double bond → FC = 6 − 4 − 4/2 = <b>0</b>. Single-bonded terminal O: 3 lone pairs + 1 single bond → FC = 6 − 6 − 2/2 = <b>−1</b>.' },
      { q: '(b) Predict the O–O bond order from resonance, and confirm it against the measured bond length.', a: 'Averaging the two resonance structures: one double (order 2) and one single (order 1) bond per structure, swapped between the two forms → average order <b>1.5</b> for each of the two (now-equivalent) O–O bonds. That sits almost exactly between a single bond (~148 pm) and a double bond (~121 pm) — <b>127.8 pm is close to the double-bond end</b>, but the key confirming observation is that BOTH bonds measure identical lengths, which a single fixed Lewis structure (one double + one single, different lengths) could never produce.' },
      { q: '(c) Is O₃ polar or nonpolar? Justify using its shape.', a: '<b>Polar.</b> O₃ is bent (AX₂E on the central O, ~117°), which is not a symmetric shape — there is no symmetry operation that cancels the net electron distribution the way linear or trigonal-planar shapes can. (Measured dipole moment: 0.53 D.) <span class="trap">Resonance changes where the double bond "is," but it does not turn a bent molecule into a symmetric one — shape, not the resonance structures individually, is what decides polarity.</span>' },
    ],
  },

  // ================= DESCRIPTIVE & INORGANIC =================
  {
    id: 'p2-descriptive-001',
    topic: 'descriptive',
    title: 'A four-cation qualitative analysis',
    prompt: 'A solution may contain Ag⁺, Ba²⁺, Fe³⁺ and Zn²⁺. Observations:<br>1. Adding dilute HCl gives a white precipitate; the filtrate is kept.<br>2. Adding dilute H₂SO₄ to the filtrate gives another white precipitate.<br>3. Adding excess aqueous NH₃ to the remaining solution gives a red-brown precipitate, and the liquid above it is colorless.',
    parts: [
      { q: '(a) Which ion does each observation identify?', a: 'Step 1: white AgCl → <b>Ag⁺ present</b>. Step 2: white BaSO₄ → <b>Ba²⁺ present</b>. Step 3: red-brown Fe(OH)₃ → <b>Fe³⁺ present</b>.' },
      { q: '(b) Is zinc present, absent, or undetermined? Explain.', a: '<b>Undetermined-leaning-present-check-needed</b>: excess NH₃ would convert Zn²⁺ to the COLORLESS soluble [Zn(NH₃)₄]²⁺, so a colorless solution neither confirms nor rules it out. A follow-up test (e.g., S²⁻ → white ZnS) is required.' },
      { q: '(c) Why must the HCl step come before the sulfate step?', a: 'Ag₂SO₄ is slightly soluble but AgCl is far less so; more importantly, if sulfate were added first, BaSO₄ AND any silver salts could co-precipitate, scrambling the identification. Sequential schemes work by removing one group completely before testing the next.' },
    ],
  },
  {
    id: 'p2-descriptive-002',
    topic: 'descriptive',
    title: 'Two cobalt complexes, two colors',
    prompt: 'Compare [Co(NH₃)₆]³⁺ and [CoF₆]³⁻. NH₃ is a strong-field ligand; F⁻ is weak-field.',
    parts: [
      { q: '(a) Determine the d-electron count of cobalt in each.', a: 'Both are Co³⁺: Co is [Ar]3d⁷4s² → remove 3 e⁻ (4s first) → <b>d⁶</b> in both complexes. Ligand charges: 6 NH₃ = 0; 6 F⁻ = −6 → Co must be +3 either way.' },
      { q: '(b) Predict high/low spin and the number of unpaired electrons for each.', a: 'NH₃ (strong field): pairing beats promotion → low spin t₂g⁶ → <b>0 unpaired, diamagnetic</b>. F⁻ (weak field): high spin t₂g⁴e_g² → <b>4 unpaired, strongly paramagnetic</b>. Magnetism experimentally distinguishes them.' },
      { q: '(c) One complex is yellow-orange, the other blue. Assign them.', a: 'Strong field = large Δ = absorbs high-energy (blue/violet) light → looks <b>yellow-orange: [Co(NH₃)₆]³⁺</b>. Weak field absorbs low-energy red/orange → looks <b>blue: [CoF₆]³⁻</b>. Color seen = complement of color absorbed.' },
    ],
  },

  // ================= LABORATORY =================
  {
    id: 'p2-lab-001',
    topic: 'lab',
    tier: 4, // a full gravimetric practical with an embedded systematic-error correction and a redesign step — the Platinum move
    title: 'A gravimetric chloride determination, with a hidden systematic error',
    prompt: 'A student determines the chloride content of a soluble salt by precipitating it as AgCl. A 0.5000 g sample is dissolved, treated with excess AgNO₃, and the precipitate is filtered, dried, and weighed: mass(AgCl) = 0.2870 g. (M: Ag = 107.87, Cl = 35.45, so AgCl = 143.32 g/mol)',
    parts: [
      { q: '(a) Calculate the mass percent of Cl in the sample as the student reports it.', a: 'n(AgCl) = 0.2870/143.32 = 2.003×10⁻³ mol = n(Cl). mass(Cl) = 2.003×10⁻³ × 35.45 = 0.07101 g → %Cl = 0.07101/0.5000 × 100 = <b>14.20%</b>.' },
      { q: '(b) The student used a large (not slight) excess of AgNO₃, reasoning that "more excess means more complete precipitation." Give two independent reasons this is poor practice in a gravimetric determination, beyond simply wasting reagent.', a: '(1) <b>Coprecipitation/occlusion</b>: excess Ag⁺ and NO₃⁻ adsorb onto and get trapped within the growing AgCl surface, adding mass that isn\'t analyte — gravimetric coprecipitation errors are essentially always <span class="trap">positive (mass reads too high)</span>. (2) A large excess raises the solution\'s ionic strength; by the diverse-ion (activity) effect, higher ionic strength lowers the activity coefficients of Ag⁺ and Cl⁻, which — since Ksp is fixed in terms of activities — actually pushes true equilibrium solubility <i>up</i> slightly, partially working against the very goal of complete precipitation.' },
      { q: '(c) Suppose coprecipitated impurities added exactly 0.0040 g of extra mass to the AgCl precipitate in part (a). Find the corrected %Cl, and state whether the TRUE value is higher or lower than the 14.20% first reported.', a: 'Corrected mass(AgCl) = 0.2870 − 0.0040 = 0.2830 g → n = 0.2830/143.32 = 1.975×10⁻³ mol → mass(Cl) = 1.975×10⁻³ × 35.45 = 0.07001 g → %Cl = 0.07001/0.5000 × 100 = <b>14.00%</b>. The true value is <b>lower</b> than first reported — consistent with part (b): coprecipitation always biases the result high.' },
      { q: '(d) Propose one specific change to the experimental procedure (not just "use less AgNO₃") that would reduce this coprecipitation error, and briefly justify it.', a: '<b>Digest</b> the freshly formed precipitate in its hot mother liquor for 30–60 minutes before filtering. AgCl initially forms as very fine, high-surface-area crystallites (which adsorb the most impurity); during digestion, the smallest crystallites redissolve and redeposit onto larger ones (Ostwald ripening), lowering the total surface area available for adsorption and letting trapped impurities escape back into solution.' },
    ],
  },

  // ================= ORGANIC =================
  {
    id: 'p2-organic-001',
    topic: 'organic',
    title: 'One substrate, two fates',
    prompt: '2-bromo-2-methylbutane, (CH₃)₂C(Br)CH₂CH₃, is treated under two different conditions.',
    parts: [
      { q: '(a) With sodium ethoxide in ethanol at reflux: mechanism and major product?', a: 'Strong base + 3° substrate → <b>E2</b>. Zaitsev: remove a β-H from the CH₂ side → <b>2-methyl-2-butene</b> (trisubstituted) as major, with minor 2-methyl-1-butene.' },
      { q: '(b) In warm ethanol alone (no added base): mechanism and products?', a: 'Weak nucleophile, ionizing solvent → <b>SN1/E1 solvolysis</b> through the 3° carbocation. Products: the ethyl ether (SN1, ethanol attacks) plus both alkenes (E1). Heat pushes the mix toward elimination.' },
      { q: '(c) Why is SN2 not observed in either case?', a: 'The 3° carbon\'s backside is walled off by three alkyl groups — the SN2 transition state can\'t form. Substrate structure vetoes the mechanism before conditions even matter.' },
    ],
  },
  {
    id: 'p2-organic-002',
    topic: 'organic',
    title: 'A four-step synthesis from propene',
    prompt: 'Propene is carried through: (1) HBr; (2) NaOH(aq); (3) Na₂Cr₂O₇/H₂SO₄; (4) CH₃MgBr, then H₃O⁺.',
    parts: [
      { q: '(a) Give the product of each step.', a: '(1) Markovnikov → <b>2-bromopropane</b>. (2) substitution → <b>2-propanol</b>. (3) 2° alcohol oxidized → <b>acetone</b> (stops at the ketone). (4) Grignard adds a methyl → <b>tert-butanol</b>, (CH₃)₃COH.' },
      { q: '(b) Why does the oxidation in step 3 stop at the ketone?', a: 'Further oxidation would require removing an H from the carbinol carbon — a ketone has none. Only 1° alcohols (two such H\'s) can climb to the carboxylic acid.' },
      { q: '(c) What would happen if step 4 were run with wet reagents?', a: 'Water (pKa ~15.7) instantly protonates the Grignard (conjugate acid pKa ~50): CH₃MgBr + H₂O → CH₄↑ + Mg(OH)Br. The reagent is destroyed before it can touch the ketone — hence flame-dried glassware.' },
    ],
  },
];
