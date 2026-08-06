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
  {
    id: 'p2-thermo-003',
    topic: 'thermo',
    tier: 4, // standardising a calorimeter, extracting ΔU from raw data, then converting ΔU → ΔH through Δn(gas)RT with the water-condenses trap — three techniques in one problem
    title: 'A bomb calorimeter measures the wrong quantity',
    prompt: 'A bomb calorimeter is a rigid, sealed steel vessel immersed in a water bath. It is first <b>standardised</b> by burning 1.000 g of benzoic acid, for which ΔU<sub>comb</sub> = −26.43 kJ/g; the bath temperature rises by 2.517 °C.<br>' +
      'A 0.5000 g sample of octane, C₈H₁₈(l) (M = 114.23 g/mol), is then burned in the same calorimeter and the temperature rises by 2.275 °C. Both runs start at 25 °C. (R = 8.314 J/mol·K)',
    parts: [
      { q: '(a) Calculate the heat capacity of the calorimeter, C<sub>cal</sub>, and explain why it must be measured this way rather than calculated from the masses of steel and water.', a: 'C<sub>cal</sub> = q/ΔT = 26.43 kJ / 2.517 °C = <b>10.50 kJ/°C</b>. It cannot be built up from the parts because the "calorimeter" is not one substance at one temperature — it is the steel bomb, the water bath, the stirrer, the thermometer and the ignition wire, each with its own mass and specific heat, and only part of each is thermally coupled to the bath on the timescale of the run. Burning a substance of accurately known ΔU<sub>comb</sub> measures the whole assembly as it actually behaves, in one number. <span class="trap">Benzoic acid is the standard for this because it is a stable, non-hygroscopic solid that pellets well and burns cleanly and completely to CO₂ and H₂O.</span>' },
      { q: '(b) Calculate ΔU<sub>comb</sub> of octane in kJ/mol.', a: 'Heat absorbed by the calorimeter: q = C<sub>cal</sub>ΔT = 10.50 × 2.275 = 23.89 kJ, so the reaction released 23.89 kJ.<br>n(octane) = 0.5000/114.23 = 4.377×10⁻³ mol.<br>ΔU<sub>comb</sub> = −23.89 kJ / 4.377×10⁻³ mol = <b>−5458 kJ/mol</b>. The vessel is rigid, so no expansion work is done and the measured heat is exactly q<sub>V</sub> = ΔU — not ΔH.' },
      { q: '(c) Convert this to ΔH<sub>comb</sub> at 298 K. The combustion is \\(\\ce{C8H18(l) + 25/2 O2(g) -> 8CO2(g) + 9H2O(l)}\\).', a: 'ΔH = ΔU + Δn(gas)RT. <span class="trap">Only species in the GAS phase count</span>, and inside a sealed bomb at 25 °C the product water is a liquid, not steam — so the 9 H₂O contribute nothing and neither does the liquid octane.<br>Δn(gas) = 8 − 12.5 = <b>−4.5</b>.<br>Δn(gas)RT = (−4.5)(8.314×10⁻³ kJ/mol·K)(298 K) = −11.2 kJ/mol.<br>ΔH<sub>comb</sub> = −5458 + (−11.2) = <b>−5469 kJ/mol</b>, against a literature value of −5470 kJ/mol.' },
      { q: '(d) The correction in (c) is only 11 kJ out of 5469 — about 0.2%. Give one reason it is still worth applying, and state what would happen to the size and sign of that correction for the combustion of methane instead.', a: 'It is worth applying because the correction is <em>systematic</em>, not random: it pushes every measurement the same way, so it does not average out over repeated runs and it propagates into every quantity derived from the tabulated ΔH — Hess-cycle enthalpies, ΔH°f values, and any ΔG° built from them. A 0.2% bias is also larger than the precision of a good bomb calorimeter, so leaving it in would mean quoting a number to more figures than it deserves.<br>For \\(\\ce{CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)}\\), Δn(gas) = 1 − 3 = −2, giving Δn(gas)RT = −5.0 kJ/mol — smaller in magnitude but a much larger <em>fraction</em> of methane\'s ΔH<sub>comb</sub> of −890 kJ/mol (0.6% versus 0.2%). The correction is negative in both cases because both reactions consume more gas than they produce; a combustion that <em>increased</em> the gas count, or one producing gaseous water, would flip the sign.' },
    ],
  },
  {
    id: 'p2-thermo-004',
    topic: 'thermo',
    title: 'Enthalpy is not a constant: Kirchhoff\'s law and the Haber reactor',
    prompt: 'For \\(\\ce{N2(g) + 3H2(g) -> 2NH3(g)}\\), ΔH°(298 K) = −92.2 kJ/mol. Molar heat capacities (J/mol·K, treat as constant): N₂ 29.12, H₂ 28.82, NH₃ 35.06. An industrial converter runs at about 700 K.',
    parts: [
      { q: '(a) Calculate ΔC<sub>p</sub> for the reaction.', a: 'ΔC<sub>p</sub> = ΣC<sub>p</sub>(products) − ΣC<sub>p</sub>(reactants) = 2(35.06) − [29.12 + 3(28.82)] = 70.12 − 115.58 = <b>−45.46 J/mol·K</b>. Negative because four moles of gas become two — fewer molecules to absorb heat on the product side.' },
      { q: '(b) Use Kirchhoff\'s law to estimate ΔH° at 700 K.', a: 'ΔH°(T₂) = ΔH°(T₁) + ΔC<sub>p</sub>(T₂ − T₁) = −92.2 kJ/mol + (−45.46×10⁻³ kJ/mol·K)(700 − 298) = −92.2 − 18.3 = <b>−110.5 kJ/mol</b>.' },
      { q: '(c) Is ammonia synthesis more or less exothermic at reactor temperature, and what does that mean for the engineer designing the converter?', a: '<b>More</b> exothermic — about 20% more heat released per mole of N₂ at 700 K than the 298 K table value suggests. An engineer sizing the heat exchangers off the 298 K number would under-provide cooling by roughly a fifth. Since the reaction is exothermic and the plant is already fighting the fact that high temperature <em>lowers</em> the equilibrium yield, removing that heat efficiently is not a detail — poor heat removal raises the bed temperature further and drives the yield down again.' },
      { q: '(d) The van\'t Hoff analysis of K versus T usually assumes ΔH° is independent of temperature. Comment on that assumption in the light of your answer, and say how you would improve the calculation in (b).', a: 'The assumption is a convenience, not a truth. Over a small range (a few tens of K) the drift in ΔH° is negligible and van\'t Hoff\'s straight line is safe; over the 400 K gap here, ΔH° has moved by 18 kJ/mol, so a ln K versus 1/T line fitted across that whole range would be measurably curved and the "ΔH°" from its slope would be some average of the true values, not either endpoint.<br>Improvement: heat capacities themselves rise with temperature, so treating them as constant over 400 K is the weakest step. Use empirical C<sub>p</sub>(T) = a + bT + c/T² expressions for each species and integrate: ΔH°(T₂) = ΔH°(T₁) + ∫ΔC<sub>p</sub>(T)dT. That is exactly what thermodynamic data tables and process-simulation software do.' },
    ],
  },
  {
    id: 'p2-thermo-005',
    topic: 'thermo',
    tier: 4, // ΔG is derived, not assumed: Kirchhoff-corrected ΔH and ΔS at a non-standard temperature, the universe criterion applied in both directions, then shown to be the same statement as ΔG < 0
    title: 'Why water freezes at −10 °C but not at +10 °C',
    prompt: 'Supercooled water freezes spontaneously at −10 °C, even though freezing lowers the entropy of the water itself. Explain this from the second law.<br>' +
      'Data at 273 K: ΔH<sub>fus</sub> = +6.01 kJ/mol. C<sub>p</sub>: H₂O(l) 75.3, H₂O(s) 37.7 J/mol·K (assume constant). Consider one mole of H₂O(l) → H₂O(s).',
    parts: [
      { q: '(a) Find ΔH and ΔS of freezing at 273 K, then correct both to 263 K.', a: 'At 273 K freezing is the reverse of fusion: ΔH = −6010 J/mol, and because the two phases are in equilibrium there, ΔG = 0 → ΔS = ΔH/T = −6010/273 = −22.0 J/mol·K.<br>ΔC<sub>p</sub> = C<sub>p</sub>(s) − C<sub>p</sub>(l) = 37.7 − 75.3 = −37.6 J/mol·K.<br>Kirchhoff: ΔH(263) = −6010 + (−37.6)(263 − 273) = <b>−5634 J/mol</b>.<br>Entropy version: ΔS(263) = ΔS(273) + ΔC<sub>p</sub> ln(263/273) = −22.0 + (−37.6)(−0.0373) = <b>−20.6 J/mol·K</b>.<br><span class="trap">The two corrections use different formulas — ΔC<sub>p</sub>ΔT for enthalpy, ΔC<sub>p</sub> ln(T₂/T₁) for entropy — because dS = C<sub>p</sub>dT/T carries the extra 1/T.</span>' },
      { q: '(b) Calculate ΔS<sub>surroundings</sub> and ΔS<sub>universe</sub> at 263 K, and decide whether freezing is spontaneous.', a: 'The surroundings are a large reservoir at 263 K that absorbs the released heat reversibly: ΔS<sub>surr</sub> = −ΔH<sub>sys</sub>/T = +5634/263 = <b>+21.4 J/mol·K</b>.<br>ΔS<sub>univ</sub> = ΔS<sub>sys</sub> + ΔS<sub>surr</sub> = −20.6 + 21.4 = <b>+0.8 J/mol·K > 0 → spontaneous.</b><br>The water becomes more ordered, but the heat it dumps disorders the surroundings slightly more. That margin is thin — under one J/mol·K against terms of 20 — which is exactly why the process sits so close to reversible near the melting point.' },
      { q: '(c) Repeat the calculation at 283 K (+10 °C) and comment.', a: 'ΔH(283) = −6010 + (−37.6)(+10) = −6386 J/mol. ΔS<sub>sys</sub>(283) = −22.0 + (−37.6)ln(283/273) = −22.0 − 1.4 = −23.4 J/mol·K. ΔS<sub>surr</sub> = +6386/283 = +22.6 J/mol·K.<br>ΔS<sub>univ</sub> = −23.4 + 22.6 = <b>−0.8 J/mol·K < 0 → NOT spontaneous</b>, which is the everyday observation that water does not freeze at +10 °C. Note the symmetry: the same two competing terms simply swap which one is larger, and they cross exactly at 273 K — the melting point is the temperature where ΔS<sub>univ</sub> = 0, i.e. where the two phases coexist reversibly.' },
      { q: '(d) Now calculate ΔG for the system alone at each temperature, and use the comparison to say precisely what ΔG is.', a: 'ΔG(263) = ΔH − TΔS = −5634 − 263(−20.6) = <b>−213 J/mol</b> (negative → spontaneous).<br>ΔG(283) = −6386 − 283(−23.4) = <b>+227 J/mol</b> (positive → not spontaneous).<br>Compare with (b) and (c): −263 × (+0.81) = −213 J and −283 × (−0.80) = +227 J. The agreement is exact, not coincidental — dividing the second law by the (constant) temperature gives ΔG = −TΔS<sub>univ</sub>.<br><b>So ΔG is not a separate criterion for spontaneity.</b> It is the second law rewritten so that only system properties appear: the −TΔS term is the entropy change of the <em>surroundings</em> in disguise, which is what makes ΔG usable in a laboratory where you can measure the beaker but not the universe. This works only at constant T and P — the conditions under which −ΔH/T is the right expression for ΔS<sub>surr</sub>.' },
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
  {
    id: 'p2-acids-003',
    topic: 'acids',
    tier: 4, // identify an unknown acid from its own titration data — equivalence point, molar mass and pKa each read off the curve, then cross-checked against a candidate table
    title: 'An unknown acid, identified from its titration curve',
    prompt: '0.4504 g of a pure, solid, monoprotic acid is dissolved in 50.0 mL of water and titrated with 0.1000 M NaOH:<br>' +
      '<div class="table-scroll"><table class="ref-table"><tr><th>V(NaOH)/mL</th><td>0</td><td>5.00</td><td>10.00</td><td>12.50</td><td>20.00</td><td>24.00</td><td>24.90</td><td>25.00</td><td>25.10</td><td>26.00</td><td>30.00</td></tr>' +
      '<tr><th>pH</th><td>2.41</td><td>2.95</td><td>3.33</td><td>3.50</td><td>4.10</td><td>4.87</td><td>5.89</td><td>8.01</td><td>10.12</td><td>11.12</td><td>11.80</td></tr></table></div>' +
      'Candidate acids:<br>' +
      '<table class="ref-table"><tr><th>acid</th><th>M / g·mol⁻¹</th><th>pK<sub>a</sub></th></tr>' +
      '<tr><td>propanoic acid</td><td>74.08</td><td>4.87</td></tr>' +
      '<tr><td>benzoic acid</td><td>122.12</td><td>4.20</td></tr>' +
      '<tr><td>salicylic acid</td><td>138.12</td><td>2.97</td></tr>' +
      '<tr><td>acetylsalicylic acid</td><td>180.16</td><td>3.49</td></tr>' +
      '<tr><td>ibuprofen</td><td>206.28</td><td>4.91</td></tr></table>',
    parts: [
      { q: '(a) Locate the equivalence point from the data, and say precisely what defines it. (A classmate proposes "the volume at which pH = 7".)', a: 'The equivalence point is where the added base has exactly consumed the acid — chemically defined, and located on the curve as the point of <b>steepest slope</b> (maximum dpH/dV), the centre of the near-vertical jump. Between 24.90 and 25.10 mL the pH climbs 5.89 → 10.12, so the equivalence point is <b>V = 25.00 mL</b>.<br>The classmate\'s rule is wrong here. Equivalence leaves a solution of A⁻, the conjugate base of a weak acid, which is <b>basic</b> — this curve passes pH 7 at about 24.96 mL, a little before equivalence. <span class="trap">pH = 7 marks the neutral point, not the equivalence point; they coincide only for strong acid + strong base.</span>' },
      { q: '(b) Calculate the molar mass of the acid.', a: 'n(NaOH) at equivalence = 0.1000 mol/L × 0.02500 L = 2.500×10⁻³ mol, and the acid is monoprotic, so n(acid) = 2.500×10⁻³ mol.<br>M = m/n = 0.4504 g / 2.500×10⁻³ mol = <b>180.2 g/mol</b>.' },
      { q: '(c) Determine the pKa, explaining why the volume you use is the right one.', a: 'At <b>half</b>-equivalence (12.50 mL), exactly half the acid has been converted, so [HA] = [A⁻] and Henderson–Hasselbalch collapses to pH = pK<sub>a</sub>. Reading the table at 12.50 mL: <b>pK<sub>a</sub> = 3.50</b> (K<sub>a</sub> = 3.2×10⁻⁴).<br>This is the standard method because it is unusually forgiving: the ratio [A⁻]/[HA] is 1 regardless of how concentrated the acid was, so the answer does not depend on knowing the acid\'s concentration, and dilution by the added titrant cancels out of the ratio entirely.' },
      { q: '(d) Identify the acid, and show that a second, independent feature of the data supports your answer.', a: 'M = 180.2 g/mol and pK<sub>a</sub> = 3.50 both point to <b>acetylsalicylic acid (aspirin)</b>, 180.16 g/mol, pK<sub>a</sub> 3.49. No other candidate matches either measurement: the nearest in mass is ibuprofen (206.3, 14% away) and the nearest in pK<sub>a</sub> is salicylic acid (2.97, more than half a unit away).<br>Third independent check — the equivalence pH. At 25.00 mL the salt concentration is 2.500×10⁻³ mol / 0.0750 L = 0.0333 M, and K<sub>b</sub> = K<sub>w</sub>/K<sub>a</sub> = 10⁻¹⁴/3.2×10⁻⁴ = 3.1×10⁻¹¹.<br>[OH⁻] = √(K<sub>b</sub>·C) = √(1.03×10⁻¹²) = 1.0×10⁻⁶ → pOH = 5.99 → <b>pH = 8.01</b>, exactly the measured value. Mass, pK<sub>a</sub> and equivalence pH agree, which is what makes this an identification rather than a guess.' },
      { q: '(e) Suppose the titration had been done with methyl orange (3.1–4.4) as the indicator instead of a pH meter. Estimate the molar mass that would have been reported, and comment on the danger.', a: 'Methyl orange finishes turning yellow near pH 4.4, which this curve reaches at about <b>22.2 mL</b> — nearly 3 mL early, because the endpoint falls in the flat buffer region rather than on the jump.<br>n(acid) would be read as 2.22×10⁻³ mol → M = 0.4504/2.22×10⁻³ = <b>203 g/mol</b>.<br>The danger is not the 13% error itself but where it lands: 203 g/mol sits within 2% of ibuprofen (206.28), so the wrong indicator does not produce an obviously silly number — it produces a <span class="trap">plausible wrong identification from the very table you are matching against</span>. Choose the indicator from the equivalence pH (8.01 here → phenolphthalein), and where the identification matters, use a pH meter and locate the equivalence point from the steepest slope.' },
    ],
  },
  {
    id: 'p2-acids-004',
    topic: 'acids',
    title: 'The pH of very dilute acid, done properly',
    prompt: 'A student calculates the pH of 1.0×10⁻⁸ M HCl as −log(1.0×10⁻⁸) = 8.00, and concludes that this solution of a strong acid is basic. (K<sub>w</sub> = 1.0×10⁻¹⁴ at 25 °C)',
    parts: [
      { q: '(a) State what is wrong with the reasoning, without doing any arithmetic.', a: 'Adding an acid to water cannot make it basic — the pH must fall on the acidic side of 7, however slightly. The student\'s calculation assumes every H⁺ comes from the HCl, which is a fine approximation at ordinary concentrations but collapses here: pure water itself supplies 1.0×10⁻⁷ M H⁺, ten times more than the acid contributes. <span class="trap">Ignoring the autoionization of water is an approximation, not a law, and it fails whenever the acid is more dilute than about 10⁻⁶ M.</span>' },
      { q: '(b) Set up the exact treatment from the charge balance and solve for the pH.', a: 'Charge balance in the solution: [H⁺] = [Cl⁻] + [OH⁻], with [Cl⁻] = C = 1.0×10⁻⁸ M (HCl is strong, so it is all dissociated) and [OH⁻] = K<sub>w</sub>/[H⁺].<br>[H⁺] = C + K<sub>w</sub>/[H⁺] → [H⁺]² − C[H⁺] − K<sub>w</sub> = 0<br>[H⁺] = (C + √(C² + 4K<sub>w</sub>))/2 = (1.0×10⁻⁸ + √(1.0×10⁻¹⁶ + 4.0×10⁻¹⁴))/2 = (1.0×10⁻⁸ + 2.0025×10⁻⁷)/2 = 1.051×10⁻⁷ M<br><b>pH = 6.98</b> — acidic, but only just, exactly as the qualitative argument demanded.' },
      { q: '(c) What fraction of the H⁺ in that solution actually came from the HCl? Use it to explain the result in words.', a: 'The acid contributes 1.0×10⁻⁸ M of the total 1.051×10⁻⁷ M, or about <b>9.5%</b> — more than 90% of the hydrogen ions came from water. The added acid does shift water\'s equilibrium slightly (Le Chatelier: the extra H⁺ suppresses autoionization, which is why [OH⁻] = 9.5×10⁻⁸ rather than 10⁻⁷), but the solution is essentially water with a barely detectable acidic tilt. Diluting a strong acid drives its pH toward 7 asymptotically; it can never cross it.' },
      { q: '(d) At what concentration does the correction stop mattering? Justify with a number at each end.', a: 'Compare the two contributions. At C = 1.0×10⁻⁶ M the exact treatment gives [H⁺] = 1.010×10⁻⁶ M, pH 6.00 against the naive 6.00 — water contributes about 1%, already inside normal experimental error. At C = 0.10 M, [H⁺] = 0.10 M to twelve decimal places and water\'s contribution is a part in 10¹².<br>Rule of thumb: apply the exact treatment when C is within about two orders of magnitude of 10⁻⁷ M, i.e. below ~10⁻⁶ M; above that the simple −log C is right to the precision anyone can measure. The same correction, for the same reason, is what stops a very dilute <em>base</em> from computing to a pH below 7.' },
    ],
  },
  {
    id: 'p2-acids-005',
    topic: 'acids',
    title: 'Why blood is well buffered at a pH more than a unit from its pKa',
    prompt: 'Blood plasma is buffered by the carbon dioxide/bicarbonate pair. In plasma the relevant relation is pH = 6.1 + log([HCO₃⁻]/(0.03 × pCO₂)), with pCO₂ in mmHg and concentrations in mmol/L; the 0.03 converts the gas pressure into dissolved CO₂. Normal arterial values are [HCO₃⁻] = 24 mM and pCO₂ = 40 mmHg.',
    parts: [
      { q: '(a) Verify the normal blood pH from these values.', a: 'Dissolved CO₂ = 0.03 × 40 = 1.2 mM. Ratio = 24/1.2 = 20.<br>pH = 6.1 + log 20 = 6.1 + 1.30 = <b>7.40</b> — the accepted normal arterial pH.' },
      { q: '(b) A 20:1 ratio is more than one pH unit away from the pKa. By the usual rule of thumb this should be a poor buffer. Explain why blood is nevertheless buffered extremely well.', a: 'The rule of thumb assumes a <b>closed</b> system, where neutralising added H⁺ permanently consumes one of the two components. Blood is an <b>open</b> system: H⁺ + HCO₃⁻ → H₂CO₃ → H₂O + CO₂, and the CO₂ is exhaled. The lungs hold pCO₂ at ~40 mmHg by adjusting ventilation, so the <em>denominator of the ratio is clamped</em> rather than growing as acid is added.<br>The consequence is that the acid component is continuously regenerated to its set point instead of being used up, so the effective capacity is far larger than the 24 mM of bicarbonate alone suggests — and the kidneys independently regulate the numerator [HCO₃⁻] over hours. <span class="trap">A buffer\'s capacity depends on whether its components can be replenished, not only on how close the pH is to the pKa.</span>' },
      { q: '(c) 2.0 mmol/L of a strong acid enters the blood. Calculate the resulting pH (i) if the system were closed, and (ii) open, with the lungs holding pCO₂ at 40 mmHg, and compare.', a: '(i) <b>Closed:</b> the H⁺ converts 2.0 mM of HCO₃⁻ into dissolved CO₂. [HCO₃⁻] = 24 − 2.0 = 22.0 mM; CO₂ = 1.2 + 2.0 = 3.2 mM.<br>pH = 6.1 + log(22.0/3.2) = 6.1 + 0.837 = <b>6.94</b> — a fall of 0.46, which in a patient is a life-threatening acidosis.<br>(ii) <b>Open:</b> the extra CO₂ is exhaled, so CO₂ stays at 1.2 mM while [HCO₃⁻] = 22.0 mM.<br>pH = 6.1 + log(22.0/1.2) = 6.1 + 1.263 = <b>7.36</b> — a fall of only 0.04.<br>The open system absorbs the same acid load with roughly a tenth of the pH change. Note also which term did the work: in the closed case the denominator nearly tripled, and it is that term, not the loss of bicarbonate, that dominates the damage.' },
      { q: '(d) Data tables give pK<sub>a1</sub> = 6.35 for carbonic acid, yet the plasma equation uses 6.1. Account for the difference — and then explain why 6.35 is itself not the pK<sub>a</sub> of H₂CO₃.', a: 'Both numbers are <b>apparent</b> constants, and they differ in the conditions they apply to. The tabulated 6.35 is the thermodynamic value at 25 °C and zero ionic strength; plasma is at 37 °C and ionic strength ≈0.15 M, and pK′ absorbs both the temperature dependence and the activity coefficients of H⁺ and HCO₃⁻. Both corrections push in the same direction, giving pK′ ≈ 6.1 under physiological conditions. Using 6.35 with blood-gas numbers would put the calculated pH about 0.25 units too high — a clinically enormous error.<br>The deeper point is that 6.35 is <em>already</em> an apparent constant. It is written against <b>total dissolved CO₂</b>, because that is what an instrument can measure, whereas the acid that actually donates the proton is H₂CO₃ — and only about one dissolved CO₂ molecule in 400 is hydrated to it at any moment. The true pK<sub>a</sub> of H₂CO₃ is near 3.6, making it a moderately strong acid, comparable to formic acid. Diluting its concentration by a factor of ~400 in the denominator raises the apparent pK by log 400 ≈ 2.6: 3.6 + 2.6 ≈ 6.2, which is the tabulated 6.35 within the spread of literature values for the hydration ratio. <span class="trap">An equilibrium constant is only meaningful alongside the species and conditions its expression is written against.</span>' },
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

  {
    id: 'p2-redox-003',
    topic: 'redox',
    tier: 4, // combining non-adjacent couples by ΔG° additivity, predicting two disproportionations from the same diagram, and writing the balanced reaction they imply
    title: 'Reading a Latimer diagram: manganese in acid',
    prompt: 'The Latimer diagram for manganese in acidic solution (all potentials in volts, each between the species it joins):<br>' +
      '<div class="table-scroll"><table class="ref-table"><tr>' +
      // <td><b>, not <th>: .ref-table th is uppercase-styled, which is right for
      // word headings and wrong for formulas — it renders MnO₄²⁻ as MNO₄²⁻.
      '<td><b>MnO₄⁻</b></td><td>—1e⁻, +0.56→</td><td><b>MnO₄²⁻</b></td><td>—2e⁻, +2.27→</td><td><b>MnO₂</b></td><td>—1e⁻, +0.95→</td><td><b>Mn³⁺</b></td><td>—1e⁻, +1.51→</td><td><b>Mn²⁺</b></td><td>—2e⁻, −1.18→</td><td><b>Mn</b></td>' +
      '</tr></table></div>',
    parts: [
      { q: '(a) Calculate E° for the non-adjacent couple MnO₄⁻/MnO₂, and state the rule you used.', a: 'Potentials are intensive and do <b>not</b> add; free energies do. Adding ΔG° for the two steps: −(n₁+n₂)FE° = −n₁FE°₁ − n₂FE°₂, so E° = (n₁E°₁ + n₂E°₂)/(n₁+n₂).<br>E°(MnO₄⁻/MnO₂) = (1 × 0.56 + 2 × 2.27)/3 = 5.10/3 = <b>+1.70 V</b>, matching the tabulated value for that couple.' },
      { q: '(b) Now find E°(MnO₄⁻/Mn²⁺), and use it to check your method against a value you already know.', a: 'Five electrons in total, chaining all four steps down to Mn²⁺:<br>E° = (1×0.56 + 2×2.27 + 1×0.95 + 1×1.51)/5 = 7.56/5 = <b>+1.51 V</b>.<br>That is exactly the standard potential quoted for MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O in every table — an independent confirmation that the electron-weighted combination is right. A plain average of the same four numbers gives 1.32 V, and of the two-step route in (a), 1.465 V; both are wrong.' },
      { q: '(c) Which species in this diagram are unstable with respect to disproportionation? Justify each from the diagram alone.', a: 'A species disproportionates when the potential on its <b>right</b> (its reduction) exceeds the potential on its <b>left</b> (its own formation by reduction of the species above it) — that combination makes the self-reaction spontaneous.<br><b>MnO₄²⁻</b>: right 2.27 > left 0.56 ✓ unstable.<br><b>Mn³⁺</b>: right 1.51 > left 0.95 ✓ unstable.<br>MnO₂: right 0.95 < left 2.27 — stable. Mn²⁺: right −1.18 < left 1.51 — stable, which is why Mn²⁺ is the ordinary end point of permanganate reductions in acid.' },
      { q: '(d) Write the balanced equation for the disproportionation of the manganate ion MnO₄²⁻ in acid, and calculate E°cell for it.', a: 'Manganese(VI) goes both up to Mn(VII) and down to Mn(IV): two ions lose one electron each, one gains two.<br><b>3MnO₄²⁻ + 4H⁺ → 2MnO₄⁻ + MnO₂(s) + 2H₂O</b> (check: Mn 3 = 3; O 12 = 8 + 2 + 2; charge −6 + 4 = −2 = 2(−1)).<br>E°cell = E°(reduction half, MnO₄²⁻→MnO₂) − E°(oxidation half, MnO₄⁻→MnO₄²⁻) = 2.27 − 0.56 = <b>+1.71 V</b>, strongly spontaneous.<br>This is why potassium manganate(VI) is only handled in strong alkali: the deep green K₂MnO₄ solution turns purple with a brown precipitate the moment it is acidified — MnO₄⁻ and MnO₂ appearing together in the flask.' },
    ],
  },
  {
    id: 'p2-redox-004',
    topic: 'redox',
    title: 'An oxidising agent you can tune with pH',
    prompt: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O, E° = +1.51 V. Take [MnO₄⁻] = [Mn²⁺] = 1 M throughout, and use E = E° − (0.0592/n)·log Q at 25 °C.',
    parts: [
      { q: '(a) Show that the potential of this couple falls by about 0.095 V per pH unit.', a: 'Q = [Mn²⁺]/([MnO₄⁻][H⁺]⁸) = 1/[H⁺]⁸ under the stated conditions, so log Q = −8 log[H⁺] = 8·pH.<br>E = 1.51 − (0.0592/5)(8·pH) = <b>1.51 − 0.0947·pH</b>.<br>The eight protons are doing the work: a half-reaction that consumes H⁺ is pushed backwards as H⁺ is removed, and dividing by n = 5 leaves 8/5 × 0.0592 V per pH unit.' },
      { q: '(b) Evaluate E at pH 0, 7 and 14, and comment on what happens to permanganate as an oxidant.', a: 'pH 0 → <b>1.51 V</b>; pH 7 → 1.51 − 0.663 = <b>0.85 V</b>; pH 14 → <b>0.18 V</b>.<br>Permanganate goes from one of the strongest practical oxidising agents to a mild one across the pH range. In practice the product changes too: in neutral or alkaline solution MnO₄⁻ is reduced only as far as brown MnO₂ rather than colourless Mn²⁺, which is precisely why redox titrations with permanganate are run in strongly acidic solution — you need both the driving force and a clean, colourless, single product.' },
      { q: '(c) Fe³⁺ + e⁻ → Fe²⁺ has E° = +0.77 V and involves no H⁺. Compare the two couples at pH 0 and pH 7 and state the general principle.', a: 'At pH 0 permanganate (1.51 V) beats the iron couple (0.77 V) by 0.74 V — the basis of the classic MnO₄⁻/Fe²⁺ titration. At pH 7 the margin has shrunk to 0.85 − 0.77 = 0.08 V, essentially nothing.<br>The principle: <b>only half-reactions that involve H⁺ or OH⁻ are pH-sensitive</b>. Fe³⁺/Fe²⁺ has no protons in its equation, so its potential is (to this level of treatment) flat with pH, while oxo-anions such as MnO₄⁻, Cr₂O₇²⁻ and NO₃⁻ weaken sharply as acid is removed. Choosing the pH is therefore a way of selecting <em>which</em> species an oxidant will and will not attack — the idea a Pourbaix diagram maps out systematically.' },
      { q: '(d) A student acidifies a permanganate titration with hydrochloric acid instead of sulfuric acid, and gets a titre that is too high. Explain, using potentials.', a: 'Cl₂ + 2e⁻ → 2Cl⁻ has E° = +1.36 V. At pH 0 permanganate sits at 1.51 V, comfortably above it, so MnO₄⁻ oxidises chloride to chlorine in a side reaction that consumes titrant without touching the analyte — the titre reads <b>high</b> and the result is overstated. (The effect is worse than the 0.15 V margin suggests, because Fe²⁺ present in the flask catalyses the induced oxidation of chloride.)<br>Sulfuric acid is used instead because sulfate is already fully oxidised and cannot be attacked. Nitric acid is equally unsuitable, for the opposite reason: it is itself an oxidant and would attack the analyte. <span class="trap">"Acidify the solution" is never a free move — the acid\'s anion is a reagent too.</span>' },
    ],
  },
  {
    id: 'p2-redox-005',
    topic: 'redox',
    title: 'The chlor-alkali cell: thermodynamics loses to kinetics',
    prompt: 'A membrane chlor-alkali cell electrolyses concentrated brine, producing Cl₂ at the anode and H₂ plus NaOH at the cathode. It runs at <b>30 000 A</b> for 24 hours at a cell voltage of about <b>3.2 V</b>, with a current efficiency of 96%.<br>(F = 96 485 C/mol; M: Cl₂ 70.90, NaOH 40.00, H₂ 2.016)',
    parts: [
      { q: '(a) Write the electrode reactions and the overall cell reaction, and give the mole ratio of the three products.', a: 'Anode: 2Cl⁻ → Cl₂ + 2e⁻. Cathode: 2H₂O + 2e⁻ → H₂ + 2OH⁻ (the Na⁺ crossing the membrane pairs with that OH⁻ to give the caustic soda product).<br>Overall: <b>2NaCl + 2H₂O → Cl₂ + H₂ + 2NaOH</b>, so Cl₂ : H₂ : NaOH = <b>1 : 1 : 2</b> by mole.<br>That ratio is fixed by the electron count and cannot be adjusted, which is a genuine commercial constraint: a plant cannot make caustic soda without making an equivalent amount of chlorine, so the two markets have to be balanced against each other.' },
      { q: '(b) Calculate the daily output of Cl₂ and of NaOH.', a: 'Q = It = 30 000 × 86 400 = 2.592×10⁹ C → n(e⁻) = 2.592×10⁹/96 485 = 26 864 mol.<br>At 100%: n(Cl₂) = 13 432 mol → 952.3 kg; n(NaOH) = 26 864 mol → 1074.6 kg.<br>At 96% current efficiency: <b>914 kg Cl₂ and 1032 kg NaOH</b> per day (with 26.0 kg of hydrogen alongside). The missing 4% went into side reactions — chiefly some O₂ at the anode and the small amount of hydroxide that leaks back through the membrane and is oxidised.' },
      { q: '(c) Water is oxidised at +1.23 V and chloride at +1.36 V, so thermodynamics says the anode should give oxygen, not chlorine. Explain why the cell produces chlorine anyway.', a: 'Two effects, both pushing the same way. First, <b>overpotential</b>: oxygen evolution is kinetically sluggish — a four-electron process going through adsorbed intermediates — and needs several tenths of a volt beyond its thermodynamic value on any practical anode, while chlorine evolution is a fast two-electron process with a small overpotential. That reverses the order of the two <em>actual</em> onset potentials. Second, <b>concentration</b>: the brine is near-saturated, roughly 5 M in Cl⁻, and the Nernst term shifts the chloride couple down by about 0.04 V.<br>The general lesson is that an electrolysis product is decided by which reaction is fastest at the working potential, not by which is most favourable at equilibrium. <span class="trap">Predicting electrolysis products from a table of E° alone will get brine, and much else, wrong.</span>' },
      { q: '(d) Calculate the electrical energy consumed per tonne of chlorine, compare it with the thermodynamic minimum (E°cell = −2.19 V for the overall reaction), and say where the difference goes.', a: 'Per mole of Cl₂, 2 mol of electrons pass: energy = nFV = 2 × 96 485 × 3.2 = 618 kJ. One tonne is 10⁶/70.90 = 14 104 mol, so E = 8.72×10⁶ kJ = <b>2420 kWh per tonne of Cl₂</b>, which is close to real membrane-cell figures.<br>The thermodynamic minimum, at 2.19 V, is 1660 kWh/tonne — so the cell is about <b>68% voltage-efficient</b>. The extra 1.0 V is spent on the anode and cathode overpotentials (part (c)\'s kinetic cost, now appearing as an energy bill) plus ohmic losses in the electrolyte, the membrane and the hardware. At national scale this is why chlor-alkali plants are sited where electricity is cheap, and why a tenth of a volt of overpotential is worth serious research money.' },
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

  {
    id: 'p2-atomic-007',
    topic: 'atomic',
    title: 'Dating a wooden artifact — and the background nobody subtracted',
    prompt: 'Carbon-14 decays by β⁻ emission with a half-life of 5730 years. A freshly cut sample of the same species of wood gives a specific activity of <b>13.6 disintegrations per minute per gram of carbon</b> (dpm/g C), measured with the background already subtracted. A carbon sample from an archaeological artifact is reported by the counting lab at <b>9.4 dpm/g C</b>.',
    parts: [
      { q: '(a) Find the decay constant k, and justify using the ratio of ACTIVITIES in place of the ratio of ¹⁴C nuclei.', a: 'k = ln2/t½ = 0.693/5730 = <b>1.21×10⁻⁴ yr⁻¹</b>. Radioactive decay is first order, so A = kN with k a constant for a given nuclide: A/A₀ = kN/kN₀ = N/N₀. The k cancels, which is why a counter — which measures A, never N — can be used directly. It also means the specific activity must be quoted <i>per gram of carbon</i>, not per gram of sample: only the carbon carries the ¹⁴C.' },
      { q: '(b) Calculate the age of the artifact from the reported activity.', a: 'ln(A₀/A) = kt → t = ln(13.6/9.4)/(1.21×10⁻⁴) = ln(1.447)/(1.21×10⁻⁴) = 0.3694/(1.21×10⁻⁴) = <b>3.05×10³ years</b>.' },
      { q: '(c) The lab later admits that the 9.4 dpm/g figure was NOT background-corrected, and that the counter records 0.8 dpm/g of background. Recalculate the age, and say — before you compute — whether the uncorrected answer was too old or too young.', a: 'Uncorrected counts are <i>too high</i>, and a higher activity means less decay has happened, so the uncorrected age reads <b>too young</b>. True sample activity = 9.4 − 0.8 = 8.6 dpm/g → t = ln(13.6/8.6)/(1.21×10⁻⁴) = 0.4583/(1.21×10⁻⁴) = <b>3.79×10³ years</b>, about <b>740 years older</b> than the uncorrected figure. <span class="trap">The reference sample was already background-corrected, so subtracting the background from only one of the two activities is correct here — subtracting it from both would be the error.</span> Always ask which numbers in a ratio have had the same corrections applied.' },
      { q: '(d) Radiocarbon dating is not used beyond about 50 000 years. Support that limit with a number, and name what replaces it.', a: '50 000 yr is 50 000/5730 = 8.7 half-lives, so A/A₀ = e^(−1.21×10⁻⁴ × 50 000) = e^(−6.05) = <b>0.24%</b> of modern — roughly 0.03 dpm/g C, which is lost in the counter background and in contamination by any trace of modern carbon. The method fails on counting statistics, not on physics. Longer clocks need longer half-lives: <b>K–Ar</b> (t½ = 1.25×10⁹ yr) or <b>U–Pb</b> (t½ = 4.5×10⁹ yr) for rocks — and note those date the <i>mineral</i>, not once-living tissue, so they answer a different question.' },
    ],
  },
  {
    id: 'p2-atomic-008',
    topic: 'atomic',
    tier: 4,
    title: 'Mass defect, and the electrons that quietly cancel',
    prompt: 'Nuclear masses are almost never tabulated; <b>atomic</b> masses are. Use these, all in unified mass units:<br><table class="ref-table"><tr><th>species</th><td><b>¹H atom</b></td><td><b>n</b></td><td><b>²H atom</b></td><td><b>³H atom</b></td><td><b>⁴He atom</b></td><td><b>⁵⁶Fe atom</b></td><td><b>²²Na atom</b></td><td><b>²²Ne atom</b></td></tr><tr><td>mass / u</td><td>1.007825</td><td>1.008665</td><td>2.014102</td><td>3.016049</td><td>4.002603</td><td>55.934936</td><td>21.994437</td><td>21.991385</td></tr></table>1 u = 931.494 MeV/c²; mₑc² = 0.511 MeV.',
    parts: [
      { q: '(a) Find the binding energy per nucleon of ⁵⁶Fe — and state why atomic masses may be used without correcting for electrons.', a: 'Δm = 26(1.007825) + 30(1.008665) − 55.934936 = 26.20345 + 30.25995 − 55.934936 = <b>0.528464 u</b> → E = 0.528464 × 931.494 = 492.3 MeV → per nucleon 492.3/56 = <b>8.79 MeV</b>. The electron bookkeeping: 26 ¹H <i>atoms</i> carry 26 electrons, and the ⁵⁶Fe <i>atom</i> carries 26 electrons, so the electron masses appear identically on both sides and cancel. This works because the count matches — it is a property of the balanced equation, not a general licence.' },
      { q: '(b) Calculate the energy released by the D–T fusion reaction ²H + ³H → ⁴He + n, and check the electron bookkeeping again.', a: 'Reactants 2.014102 + 3.016049 = 5.030151 u; products 4.002603 + 1.008665 = 5.011268 u; Δm = <b>0.018883 u</b> → <b>17.6 MeV</b>. Electrons: 1 + 1 on the left (two atoms), 2 + 0 on the right (the ⁴He atom; a neutron has none) — they cancel again. Per nucleon that is 17.6/5 = 3.5 MeV, an order of magnitude above any chemical bond (~5 eV), which is the whole reason nuclear fuel is measured in grams and coal in tonnes.' },
      { q: '(c) ²²Na decays by positron emission: ²²Na → ²²Ne + β⁺ + ν. A student computes Δm from the two atomic masses and reports Q = 2.84 MeV. The measured maximum positron energy is 1.82 MeV. Find the student\'s error and the correct Q.', a: 'From atomic masses: Δm = 21.994437 − 21.991385 = 0.003052 u → 2.843 MeV. But the ²²Na atom has 11 electrons and the ²²Ne atom has 10, so this difference already includes one surplus electron mass — and the decay <i>also</i> creates a positron. Both must be paid for: <b>Q(β⁺) = [M(parent) − M(daughter) − 2mₑ]c²</b> = 2.843 − 2(0.511) = <b>1.82 MeV</b>, matching experiment. <span class="trap">The cancellation in (a) and (b) is not a rule about atomic masses; it is an accident of matching electron counts. β⁻ decay happens to cancel exactly (the daughter has one more proton and the atomic mass includes one more electron), β⁺ decay costs 2mₑc², and electron capture costs none — three different corrections for three superficially similar processes.</span> The corollary: a nuclide with 0 < Q < 1.022 MeV can decay by electron capture but is energetically forbidden from emitting a positron.' },
      { q: '(d) Both the fusion in (b) and the fission of ²³⁵U release energy. Reconcile that with one curve, and be careful about where its maximum lies.', a: 'Binding energy per nucleon rises steeply from ¹H, peaks around A ≈ 56–62 at about 8.8 MeV, and falls slowly to 7.6 MeV at ²³⁸U. Energy is released by any process that moves nucleons <i>up</i> that curve — so light nuclei release it by fusing and heavy nuclei by splitting, and the two are not contradictory. For ²³⁵U: 235 nucleons gaining roughly 0.85 MeV each gives about <b>200 MeV per fission</b>. <span class="trap">"Iron is the most stable nucleus" is very nearly right and slightly wrong: ⁶²Ni (8.7945 MeV/nucleon) edges out ⁵⁸Fe (8.7921) and ⁵⁶Fe (8.7903).</span> ⁵⁶Fe dominates stellar ash because of the reaction pathways available at those temperatures, not because it sits at the absolute maximum — a good reminder that "most abundant end-product" and "most stable" are different claims.' },
    ],
  },
  {
    id: 'p2-atomic-009',
    topic: 'atomic',
    title: 'The trends that misbehave: group 13 and the Zr/Hf twins',
    prompt: 'First ionization energies down group 13, in kJ/mol:<br><table class="ref-table"><tr><th>element</th><td><b>B</b></td><td><b>Al</b></td><td><b>Ga</b></td><td><b>In</b></td><td><b>Tl</b></td></tr><tr><td>IE₁</td><td>800.6</td><td>577.5</td><td>578.8</td><td>558.3</td><td>589.4</td></tr></table>For comparison, group 2 behaves itself: Be 899.5, Mg 737.7, Ca 589.8, Sr 549.5, Ba 502.9.',
    parts: [
      { q: '(a) State the expected trend and identify every place group 13 breaks it.', a: 'IE₁ should fall down a group: the valence electron enters a higher n, sits further out, and is better screened. Group 2 does exactly that, falling monotonically 899.5 → 502.9. Group 13 falls sharply B → Al, then <b>rises</b> at Ga (577.5 → 578.8), falls at In, and <b>rises again</b> at Tl (558.3 → 589.4). Two anomalies, and they have two different causes.' },
      { q: '(b) Explain the Al → Ga anomaly, and back it with Slater\'s rules.', a: 'Ten 3d electrons are inserted between Al and Ga. d orbitals are diffuse and penetrate the core poorly, so they screen the outer 4p electron much less effectively than an equivalent number of s or p electrons would — Z rises by 18 while the shielding rises by less. Slater, for the outermost p electron: <b>Al</b> (3s²3p¹) S = 2(0.35) + 8(0.85) + 2(1.00) = 9.50 → Z_eff = 13 − 9.50 = <b>3.50</b>. <b>Ga</b> (4s²4p¹, with 3s3p3d = 18 in the n−1 shell) S = 2(0.35) + 18(0.85) + 10(1.00) = 26.00 → Z_eff = 31 − 26.00 = <b>5.00</b>. Z_eff climbs by 43% while n goes only 3 → 4, and the two effects very nearly cancel — leaving Ga marginally harder to ionize than Al.' },
      { q: '(c) Explain the In → Tl rise, which has a different origin.', a: 'Two effects stack. The <b>lanthanide contraction</b>: fourteen 4f electrons are inserted before Tl, and f orbitals screen even worse than d. On top of that, at Z ≈ 81 the 6s electrons are moving fast enough for <b>relativistic mass increase</b> to contract and stabilize the 6s orbital — which also explains why Tl\'s common oxidation state is +1 rather than +3 (the "inert pair" is the relativistically stabilized 6s²), and why mercury next door is a liquid.' },
      { q: '(d) Zirconium and hafnium have metallic radii of 160 and 159 pm — essentially identical, though Hf is a whole period lower. Predict the consequence for their densities (M: Zr 91.22, Hf 178.49 g/mol; ρ(Zr) = 6.52 g/cm³) and for their separation.', a: 'Same size, roughly double the mass → roughly <b>double the density</b>. Quantitatively, molar volume V = M/ρ: Zr gives 91.22/6.52 = 14.0 cm³/mol, so Hf should be near 178.49/14.0 = <b>12.8 g/cm³</b>; the measured value is <b>13.31 g/cm³</b> (molar volume 13.4 cm³/mol, 4% below Zr\'s — consistent with the 1 pm smaller radius, since 1.4% in radius is 4% in volume). Chemically the pair is nearly inseparable: identical radii and identical +4 chemistry mean ordinary precipitation and crystallization barely discriminate, and industrial separation needs solvent extraction or ion exchange. <span class="trap">This matters practically — Hf is a strong neutron absorber and Zr is nearly transparent to neutrons, so nuclear-grade zirconium cladding must be hafnium-free to about 100 ppm. Two elements that chemistry can hardly tell apart, that a reactor absolutely can.</span>' },
    ],
  },
  {
    id: 'p2-atomic-010',
    topic: 'atomic',
    title: 'Isotope abundances from a mass spectrum',
    prompt: 'Chlorine has two stable isotopes: ³⁵Cl (34.96885 u) and ³⁷Cl (36.96590 u). The standard atomic weight of chlorine is 35.453.',
    parts: [
      { q: '(a) Determine the fractional abundance of each isotope.', a: 'Let x = fraction of ³⁵Cl. Then 34.96885x + 36.96590(1 − x) = 35.453 → 36.96590 − 1.99705x = 35.453 → x = 1.51290/1.99705 = 0.7575. So <b>75.75% ³⁵Cl and 24.25% ³⁷Cl</b>. Sanity check without algebra: 35.453 sits about a quarter of the way from 34.97 to 36.97, so the heavier isotope must be the minor one — the average atomic mass is a weighted average, and it always leans toward the more abundant isotope.' },
      { q: '(b) Predict the m/z values and relative intensities of the molecular-ion cluster of Cl₂ in a mass spectrum.', a: 'Three combinations, at nominal m/z <b>70</b> (³⁵Cl³⁵Cl), <b>72</b> (³⁵Cl³⁷Cl) and <b>74</b> (³⁷Cl³⁷Cl). With p = 0.7575 and q = 0.2425 the probabilities are p² : 2pq : q² = 0.5738 : 0.3674 : 0.0588. <span class="trap">The middle peak carries a factor of 2 because there are two distinguishable ways to build it</span> (³⁵Cl³⁷Cl and ³⁷Cl³⁵Cl) — dropping it is the single most common error here. Normalising to the smallest peak: <b>9.8 : 6.2 : 1</b>, which is the familiar <b>9 : 6 : 1</b> pattern.' },
      { q: '(c) A student looks at the three peaks and concludes that chlorine has three isotopes. Diagnose the error.', a: 'They have read a <i>molecular</i>-ion cluster as an <i>atomic</i> one. Cl₂ has two atoms, so its isotopologues are pairs, and n + 1 = 3 peaks arise from 2 isotopes — the peak count is the number of ways to distribute the isotopes among the atoms, not the number of isotopes. The atomic spectrum of chlorine (a Cl atom fragment at m/z 35 and 37) shows exactly two peaks, in the 3 : 1 ratio of (a). A quick test on any spectrum: the spacing is 2 u here, which is a ³⁵/³⁷ substitution, not a third nuclide sitting at 36.' },
      { q: '(d) In an organic mass spectrum, how do you tell "contains one Cl" from "contains one Br" from the M/M+2 pattern? (⁷⁹Br 50.69%, ⁸¹Br 49.31%)', a: 'Compare the M+2 peak to M. <b>One Cl</b>: 24.25/75.75 = <b>32%</b> — the M+2 peak is about one third of M. <b>One Br</b>: 49.31/50.69 = <b>97%</b> — M and M+2 are nearly equal, a pair of twin peaks that is unmistakable at a glance. (Two chlorines give roughly 10 : 6 : 1 by the same binomial argument as (b), so the number of halogens is readable too.) This is why an M/M+2 inspection is the first thing to do on an unknown\'s mass spectrum: it identifies the halogen before any fragmentation analysis begins.' },
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

  {
    id: 'p2-descriptive-003',
    topic: 'descriptive',
    title: 'A lattice energy you cannot measure, and what its error reveals',
    prompt: 'Lattice energy is never measured directly — it is obtained from a Born–Haber cycle. All values in kJ mol⁻¹:<br><table class="ref-table"><tr><td><b>step</b></td><td><b>NaCl</b></td><td><b>AgCl</b></td></tr><tr><td>ΔH°f (MCl, s)</td><td>−411</td><td>−127</td></tr><tr><td>ΔH°sub (M, s → g)</td><td>+107</td><td>+284</td></tr><tr><td>IE₁ (M)</td><td>+496</td><td>+731</td></tr><tr><td>½ D(Cl₂)</td><td>+122</td><td>+122</td></tr><tr><td>EA (Cl)</td><td>−349</td><td>−349</td></tr></table>A purely ionic calculation (Born–Landé, from the charges, radii and Madelung constant) predicts <b>−766 kJ mol⁻¹</b> for NaCl and <b>−833 kJ mol⁻¹</b> for AgCl.',
    parts: [
      { q: '(a) State the reaction whose enthalpy the lattice energy is, then find it for NaCl from the cycle.', a: 'Lattice energy here is the <i>formation</i> convention: Na⁺(g) + Cl⁻(g) → NaCl(s), which is exothermic. Hess\'s law around the cycle: ΔH°f = ΔH°sub + IE₁ + ½D + EA + U, so<br>U = ΔH°f − (ΔH°sub + IE₁ + ½D + EA) = −411 − (107 + 496 + 122 − 349) = −411 − 376 = <b>−787 kJ mol⁻¹</b>. <span class="trap">Half the marks lost on this question are sign errors from mixing the two conventions — some texts quote lattice <i>dissociation</i> enthalpy, +787, for the reverse reaction. Say which one you are using.</span>' },
      { q: '(b) Repeat for AgCl.', a: 'U = −127 − (284 + 731 + 122 − 349) = −127 − 788 = <b>−915 kJ mol⁻¹</b>.' },
      { q: '(c) Compare each experimental value with the ionic-model prediction. Which salt does the ionic model describe well, and what does the discrepancy in the other one mean physically?', a: 'NaCl: −787 measured vs −766 predicted, a gap of 21 kJ mol⁻¹ (2.7%) — the ionic model essentially works. AgCl: −915 vs −833, a gap of <b>82 kJ mol⁻¹ (9.8%)</b>, four times larger. The real AgCl lattice is held together more strongly than point charges can explain, which means the bonding has significant <b>covalent character</b>: Ag⁺ is large and polarizable with a filled 4d¹⁰ shell that shields poorly, so it polarizes the soft Cl⁻ and shares electron density (Fajans\' rules). Note the direction — the extra bonding always makes the measured value <i>more</i> negative than the ionic prediction, never less.' },
      { q: '(d) NaCl is freely soluble in water and AgCl is not, yet AgCl has the LARGER lattice energy AND silver ion has the larger hydration enthalpy. Explain why solubility does not follow from lattice energy alone.', a: 'Dissolution balances two large numbers: ΔH°soln = −U + ΣΔH°hyd. For NaCl, +787 against −(406 + 378) = −784 → ΔH°soln ≈ +3 kJ mol⁻¹, near-zero and easily carried by the entropy of mixing. For AgCl the lattice term (+915) outruns hydration (−(464 + 378) = −842) → ΔH°soln ≈ +73 kJ mol⁻¹ from these figures (experiment: +66), far too endothermic for TΔS to pay. <span class="trap">The question is never "is the lattice energy big?" but "does hydration keep up with it?" — both terms grow together as ions get smaller or more charged, and solubility is the small difference between two numbers near 1000 kJ mol⁻¹. That is also why solubility trends are so hard to predict and so easy to rationalise after the fact.</span>' },
    ],
  },
  {
    id: 'p2-descriptive-004',
    topic: 'descriptive',
    tier: 4, // Ellingham crossover computed from raw thermodynamic data, then used to explain why one metal is smelted with coke and the other must be electrolysed — the Platinum move is that the arithmetic decides an industrial process
    title: 'Why zinc is smelted with coke and aluminium never is',
    prompt: 'An Ellingham diagram plots ΔG° against T for oxidations written <b>per mole of O₂</b>, so competing reactions can be compared directly. Use ΔH° and ΔS° as temperature-independent, all per mole of O₂:<br><table class="ref-table"><tr><td><b>reaction</b></td><td><b>ΔH° / kJ</b></td><td><b>ΔS° / J K⁻¹</b></td></tr><tr><td>2Zn(s) + O₂ → 2ZnO(s)</td><td>−696.6</td><td>−201.0</td></tr><tr><td>4/3Al(s) + O₂ → 2/3Al₂O₃(s)</td><td>−1117.1</td><td>−209.0</td></tr><tr><td>2C(s) + O₂ → 2CO(g)</td><td>−221.0</td><td>+178.8</td></tr></table>',
    parts: [
      { q: '(a) The two metal oxidations have ΔS° ≈ −205 J K⁻¹ and the carbon line has ΔS° = +179 J K⁻¹. Account for both signs, and say what each does to the line on the diagram.', a: 'ΔG° = ΔH° − TΔS°, so the plotted slope is <b>−ΔS°</b>. Both metals consume a mole of gas and produce only solid: ΔS° is large and negative (roughly −205 J K⁻¹, essentially the entropy of the O₂ that disappears), so those lines slope <b>upward</b> — the oxide gets less stable as it is heated. Carbon consumes one mole of gas and makes <i>two</i>, so ΔS° is positive and the carbon line slopes <b>downward</b>: CO gets more stable the hotter it gets. That single sign difference is the whole basis of smelting — the carbon line must eventually cut under every metal line it starts above.' },
      { q: '(b) Find the temperature above which carbon can reduce ZnO.', a: 'Set the two ΔG° lines equal (below the crossing, ZnO is the more stable oxide; above it, CO is):<br>−696.6 + 0.2010T = −221.0 − 0.1788T<br>0.2010T + 0.1788T = 696.6 − 221.0<br>0.3798T = 475.6 → T = <b>1252 K = 979 °C</b>.<br>Above this, ZnO(s) + C(s) → Zn(g) + CO(g) has ΔG° < 0. Industrial zinc retorts run at 1100–1300 °C ✓ — and above zinc\'s boiling point of 907 °C, so the metal leaves as a vapour and is condensed, which is how the process separates it from the gangue.' },
      { q: '(c) Repeat for Al₂O₃, and give the numerical reason aluminium is produced by electrolysis instead.', a: '−1117.1 + 0.2090T = −221.0 − 0.1788T → 0.3878T = 896.1 → T = <b>2311 K = 2038 °C</b>. Carbothermic reduction of alumina is therefore <i>not</i> thermodynamically forbidden — it is forbidden in practice. At 2038 °C no ordinary furnace lining survives, the energy cost is enormous, and carbon and aluminium react to form aluminium carbide (Al₄C₃) rather than delivering the metal. Hall–Héroult sidesteps the whole line by dissolving Al₂O₃ in molten cryolite at ~960 °C and paying with electrons instead of heat. <span class="trap">"Non-spontaneous" and "not industrially viable" are different claims. The Ellingham diagram answers only the first; the second needs materials, kinetics and cost.</span>' },
      { q: '(d) An Ellingham line for a metal shows a sharp increase in slope at one temperature. What has happened, and why must the slope increase rather than decrease?', a: 'The <b>metal has boiled</b> (a melting point gives a small kink; vaporisation gives a large one). Once M(l) → M(g), the reactant side gains a gas, so the reaction now destroys more moles of gas than before — ΔS° becomes more negative, and since the slope is −ΔS°, the line turns more steeply <b>upward</b>. It can never turn downward at a reactant phase change, because vaporising a reactant can only increase the entropy lost on oxidation. For zinc the kink at 907 °C sits just below the crossover computed in (b), which is why zinc smelting produces a vapour rather than a melt.' },
    ],
  },
  {
    id: 'p2-descriptive-005',
    topic: 'descriptive',
    title: 'Walking across period 3 with water',
    prompt: 'Separate samples of the period-3 oxides and chlorides are each added to water at 25 °C.',
    parts: [
      { q: '(a) Give the equation and the approximate pH for Na₂O, P₄O₁₀ and SO₃ in water, and account for the trend across the period.', a: 'Na₂O + H₂O → 2NaOH, <b>pH ≈ 13–14</b> (the oxide ion is a stronger base than hydroxide, so it is quantitatively protonated).<br>P₄O₁₀ + 6H₂O → 4H₃PO₄, <b>pH ≈ 1</b>.<br>SO₃ + H₂O → H₂SO₄, <b>pH ≈ 0–1</b>.<br>The trend is basic → amphoteric → acidic, driven by the <b>polarising power</b> of the central atom. Na⁺ is large and singly charged and cannot hold O²⁻, which is released to the water as a base. P(V) and S(VI) are small and highly charged: they pull the oxygen electron density toward themselves, weakening the O–H bonds of the resulting hydroxide until it ionises as an acid. The same E–O–H unit is a base at one end of the period and an acid at the other.' },
      { q: '(b) MgO and Al₂O₃ are both close to insoluble. How would you show experimentally that they are not the same case?', a: 'Test each against strong acid <i>and</i> strong base. MgO dissolves in HCl (→ Mg²⁺) but not in NaOH: it is a <b>basic</b> oxide that is merely insoluble in water because its lattice energy is very high (double charges, small ions). Al₂O₃ dissolves in <i>both</i>, giving Al³⁺ in acid and the aluminate [Al(OH)₄]⁻ in base: it is <b>amphoteric</b>. Insolubility in water is a statement about lattice energy versus hydration; acid–base character is a separate axis, and the two are routinely conflated.' },
      { q: '(c) NaCl dissolves to give pH 7 while AlCl₃ gives pH ≈ 3 and SiCl₄ fumes and gives pH ≈ 2. Write what each has actually done and identify the two distinct mechanisms at work.', a: 'NaCl → Na⁺(aq) + Cl⁻(aq): simple <b>dissolution</b>, neither ion appreciably hydrolysed, pH 7.<br>AlCl₃ → [Al(H₂O)₆]³⁺, whose high charge density polarises a coordinated water enough to release a proton: [Al(H₂O)₆]³⁺ ⇌ [Al(H₂O)₅(OH)]²⁺ + H⁺, Ka ≈ 10⁻⁵ — <b>cation hydrolysis</b>, the salt survives as a hydrated ion.<br>SiCl₄ + 2H₂O → SiO₂ + 4HCl: complete, irreversible <b>hydrolysis of the covalent chloride</b>, with the Si–Cl bonds destroyed. The fuming is HCl gas meeting moist air. The first two leave the chloride intact in solution; the third does not exist in water at all.' },
      { q: '(d) CCl₄ and SiCl₄ are both tetrahedral covalent chlorides, yet CCl₄ can be shaken with water indefinitely with no reaction — even though CCl₄(l) + 2H₂O(l) → CO₂(g) + 4HCl(aq) has ΔH° ≈ −360 kJ mol⁻¹. Resolve the contradiction.', a: 'There is no contradiction, because the two facts are about different things. The reaction is strongly <b>thermodynamically favourable</b>; CCl₄\'s stability is entirely <b>kinetic</b>. Hydrolysis begins with water attacking the central atom, which requires expanding its coordination number to five in the transition state. Silicon can do this — it is large enough to accommodate a fifth group and has energetically accessible 3d orbitals to help — so SiCl₄ hydrolyses violently. Carbon is small, has no 2d orbitals, and is completely sheathed by four chlorines: there is no low-energy path in, so the barrier is prohibitive. <span class="trap">"Stable" is ambiguous and this pair is the standard trap for it. Always ask: stable against what — a lower free energy (thermodynamic) or a reaction pathway (kinetic)? Diamond, benzene and CCl₄ are all "stable" in the second sense only.</span>' },
    ],
  },
  {
    id: 'p2-descriptive-006',
    topic: 'descriptive',
    title: 'Why magnetite is inverse and hausmannite is not',
    prompt: 'A spinel AB₂O₄ has an oxide lattice with 8 tetrahedral and 16 octahedral sites occupied per formula unit set. In a <b>normal</b> spinel, A²⁺ takes the tetrahedral sites and both B³⁺ take octahedral. In an <b>inverse</b> spinel, half the B³⁺ move to the tetrahedral sites and A²⁺ joins the rest in the octahedral ones. Both Fe₃O₄ (magnetite) and Mn₃O₄ (hausmannite) are M²⁺M³⁺₂O₄; both are high-spin; and Δ_t ≈ (4/9)Δ_o. Use LFSE = (−0.4 n_lower + 0.6 n_upper)Δ_o for octahedral and (−0.6 n_lower + 0.4 n_upper)Δ_t for tetrahedral.',
    parts: [
      { q: '(a) Compute the octahedral site preference energy (OSPE = LFSE_oct − LFSE_tet, both in units of Δ_o) for high-spin Fe³⁺ (d⁵) and Fe²⁺ (d⁶).', a: '<b>Fe³⁺, d⁵ high spin.</b> Octahedral t₂g³e_g²: 3(−0.4) + 2(0.6) = <b>0</b>. Tetrahedral e²t₂³: 2(−0.6) + 3(0.4) = 0. OSPE = <b>0</b> — a half-filled shell has no ligand-field preference in either geometry.<br><b>Fe²⁺, d⁶ high spin.</b> Octahedral t₂g⁴e_g²: 4(−0.4) + 2(0.6) = −0.4 Δ_o. Tetrahedral e³t₂³: 3(−0.6) + 3(0.4) = −0.6 Δ_t = −0.6(4/9)Δ_o = −0.267 Δ_o. OSPE = −0.400 − (−0.267) = <b>−0.133 Δ_o</b>, a real if modest preference for the octahedral site.' },
      { q: '(b) Predict the structure of Fe₃O₄ from those two numbers.', a: 'Fe³⁺ is indifferent, Fe²⁺ prefers octahedral — so the ion that gets to choose is Fe²⁺, and it takes an octahedral site. That displaces one Fe³⁺ into the tetrahedral set, which costs nothing. The result is (Fe³⁺)_tet[Fe²⁺Fe³⁺]_oct O₄: <b>an inverse spinel</b> ✓, which is what magnetite is. Its conductivity follows directly — Fe²⁺ and Fe³⁺ share equivalent octahedral sites, so an electron can hop between them without moving an atom, and magnetite is a far better conductor than a normal spinel like MgAl₂O₄.' },
      { q: '(c) Now do Mn₃O₄, where Mn²⁺ is d⁵ and Mn³⁺ is d⁴ high spin, and explain the different outcome.', a: '<b>Mn²⁺, d⁵:</b> OSPE = 0, as in (a).<br><b>Mn³⁺, d⁴ high spin.</b> Octahedral t₂g³e_g¹: 3(−0.4) + 1(0.6) = −0.6 Δ_o. Tetrahedral e²t₂²: 2(−0.6) + 2(0.4) = −0.4 Δ_t = −0.4(4/9)Δ_o = −0.178 Δ_o. OSPE = −0.600 + 0.178 = <b>−0.422 Δ_o</b> — more than three times Fe²⁺\'s preference.<br>Here the strong preference belongs to the <i>trivalent</i> ion, so both Mn³⁺ take octahedral sites and the indifferent Mn²⁺ is left with tetrahedral: <b>a normal spinel</b> ✓. The whole difference between the two minerals is which oxidation state happens to carry the d-count with the larger site preference.' },
      { q: '(d) Mn₃O₄ is not cubic but tetragonally distorted. Predict this from your own answer to (c), and say why Fe₃O₄ is not distorted in the same way.', a: 'Mn³⁺ in an octahedral site is high-spin d⁴ = t₂g³e_g¹ — an <b>unevenly occupied e_g set</b>, the strong Jahn–Teller case, because e_g points directly at the ligands. Sixteen JT-active octahedra per cell all elongate along the same axis (a cooperative distortion), pulling the whole crystal from cubic to tetragonal ✓. In magnetite the octahedral sites hold Fe²⁺ (d⁶, t₂g⁴e_g², e_g evenly filled) and Fe³⁺ (d⁵, t₂g³e_g², also even) — neither is JT-active in the strong sense, so the lattice stays cubic. <span class="trap">A d⁴ or d⁹ ion in an octahedral hole is a structural prediction, not just a spectroscopic one: cooperative Jahn–Teller distortion is why so many Cu(II) and Mn(III) solids are tetragonal.</span>' },
    ],
  },
  {
    id: 'p2-descriptive-007',
    topic: 'descriptive',
    title: 'Two nickel complexes, one d-count, two geometries',
    prompt: 'Both [NiCl₄]²⁻ and [Ni(CN)₄]²⁻ are four-coordinate nickel(II). One has μ_eff = 2.83 BM; the other is diamagnetic. Use μ = √(n(n+2)) BM.',
    parts: [
      { q: '(a) Establish the d-count, then assign each complex a geometry from its magnetism.', a: 'Ni is [Ar]3d⁸4s²; Ni²⁺ removes the 4s pair → <b>d⁸</b> in both. μ = 2.83 → n(n+2) = 8 → <b>n = 2 unpaired</b>; μ = 0 → n = 0.<br>A <b>tetrahedral</b> d⁸ is e⁴t₂⁴ (the lower e set is a filled pair of orbitals; the upper t₂ set of three holds the remaining four), and the small Δ_t leaves t₂ with one pair and two parallel electrons → 2 unpaired, paramagnetic. A <b>square-planar</b> d⁸ pushes d_{x²−y²} far above the other four, which then hold all 8 electrons in pairs → diamagnetic. So [NiCl₄]²⁻ (μ = 2.83) is <b>tetrahedral</b> and [Ni(CN)₄]²⁻ (μ = 0) is <b>square planar</b> ✓.' },
      { q: '(b) Explain the geometry choice in terms of the ligands.', a: 'CN⁻ is at the strong-field end of the spectrochemical series. It generates a splitting large enough that paying the pairing energy twice is worth vacating the high d_{x²−y²} orbital altogether, and square planar is the geometry that pushes one orbital that far up. Cl⁻ is weak-field: the splitting it produces is nowhere near the pairing energy, so there is no gain in the square-planar arrangement and the complex adopts the sterically cheaper tetrahedral shape, which also keeps four ligands as far apart as possible.' },
      { q: '(c) [PdCl₄]²⁻ and [PtCl₄]²⁻ are both square planar and diamagnetic — with the same weak-field ligand that gave tetrahedral nickel. Explain, and state what this shows about the argument in (b).', a: 'Δ grows sharply down a group: 4d and 5d orbitals are larger and more diffuse, overlap the ligands better, and have smaller pairing energies than compact 3d orbitals. Δ for a 4d or 5d metal is roughly 1.5× and 2× the 3d value for the same ligand, so even Cl⁻ exceeds the pairing energy at Pd(II) and Pt(II). Essentially all 4d⁸ and 5d⁸ complexes are square planar, whatever the ligand. <span class="trap">Geometry is set by the size of Δ, not by the ligand alone. Predicting from the spectrochemical series while ignoring which row the metal is in is the standard error here — and it is the same reason low-spin is the default for second- and third-row metals.</span>' },
      { q: '(d) A nickel(II) complex with two bidentate ligands is found to be paramagnetic in solution at 25 °C but diamagnetic on cooling. What is happening, and what single further measurement would settle it?', a: 'The two geometries are close enough in energy to be in <b>equilibrium</b>: tetrahedral (paramagnetic) ⇌ square planar (diamagnetic). The tetrahedral form has the higher entropy and the square-planar form the lower enthalpy, so raising T shifts the mixture toward tetrahedral and cooling shifts it back. Measure <b>μ_eff as a function of temperature</b> (the Evans NMR method works in solution): a genuine equilibrium gives a smooth, reversible curve between 0 and 2.83 BM, from which ΔH° and ΔS° follow via a van\'t Hoff plot of ln K against 1/T. A sudden step, or hysteresis, would instead indicate a cooperative solid-state spin transition rather than a solution equilibrium.' },
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
  {
    id: 'p2-lab-002',
    topic: 'lab',
    title: 'Standardising a NaOH solution, and living with its uncertainty',
    prompt: 'NaOH cannot be weighed out to make a standard solution directly, so an approximately 0.1 M solution is standardised against potassium hydrogen phthalate (KHP, HKC₈H₄O₄, M = 204.22 g/mol), which reacts 1:1 with NaOH.<br>' +
      'A student weighs <b>0.5106 g</b> of dried KHP (analytical balance, ±0.0002 g), dissolves it in about 50 mL of distilled water, and titrates it with the NaOH to a phenolphthalein endpoint at <b>24.35 mL</b> (buret, ±0.02 mL per reading).',
    parts: [
      { q: '(a) Calculate the concentration of the NaOH solution.', a: 'n(KHP) = 0.5106/204.22 = 2.500×10⁻³ mol, and the reaction is 1:1, so n(NaOH) = 2.500×10⁻³ mol.<br>c(NaOH) = 2.500×10⁻³ mol / 0.02435 L = <b>0.1027 M</b>.' },
      { q: '(b) Propagate the uncertainties and state the result to the number of figures it actually justifies.', a: 'Both quantities enter as a quotient, so combine RELATIVE uncertainties.<br>Mass: 0.0002/0.5106 = 0.039%. Titre: a delivered volume is a DIFFERENCE of two buret readings, so its uncertainty is 2 × 0.02 = ±0.04 mL → 0.04/24.35 = 0.164%.<br>In quadrature: √(0.039² + 0.164²) = 0.169% → ±0.00017 M.<br>Report <b>c(NaOH) = 0.1027 ± 0.0002 M</b>. <span class="trap">The buret dominates by a factor of four</span> — buying a better balance would change nothing, while a second, more careful titration (or a larger titre) is worth real accuracy. Quoting 0.10268 M would claim a precision the buret cannot deliver.' },
      { q: '(c) The KHP was in fact NOT dried before weighing, and carried about 0.4% adsorbed moisture. Does the reported concentration of NaOH come out too high or too low? Reason it through the calculation rather than guessing.', a: 'The 0.5106 g weighed is KHP <em>plus</em> water, so the true moles of KHP are 0.4% <em>lower</em> than the 2.500×10⁻³ mol assumed. The titre measured, 24.35 mL, is the volume that really did neutralise that smaller amount of acid.<br>The student divides an inflated numerator by an honest denominator, so the reported c(NaOH) is <b>too high</b> by about 0.4%: the 0.1027 M from part (a) against a true 0.1023 M.<br>Note the size of it: 0.4% is more than twice the ±0.169% the careful uncertainty analysis in (b) just produced. <span class="trap">A systematic error you failed to think about routinely swamps the random error you carefully quantified</span> — which is why "dry the primary standard at 110 °C" is a step in the procedure and not a suggestion.' },
      { q: '(d) That same NaOH is now used to titrate an unknown acid. State the direction of the error in the reported concentration of the acid, and explain why standardising against a primary standard is worth the extra experiment at all.', a: 'n(acid) is computed as c(NaOH) × V(NaOH). With c(NaOH) overstated by 0.4%, the acid\'s concentration is reported <b>0.4% too high as well</b> — the bias propagates straight through, undiminished, into every result the solution is ever used for.<br>Standardisation is worth it because NaOH is a <b>secondary</b> standard: it is hygroscopic (a pellet gains water on the balance pan while you weigh it) and it absorbs atmospheric CO₂ to form carbonate, consuming hydroxide. Its concentration therefore cannot be known from the mass weighed out, however carefully you weigh. A primary standard — KHP, Na₂CO₃, K₂Cr₂O₇ — is chosen precisely for the opposite properties: high purity, stable in air, non-hygroscopic, and a high molar mass so that weighing error is a small fraction of the sample.' },
    ],
  },
  {
    id: 'p2-lab-003',
    topic: 'lab',
    tier: 4, // a full spectrophotometric determination: calibration with a real intercept, an out-of-range sample that must be diluted, a borderline Q-test, and instrument reasoning about WHY the raw reading was untrustworthy
    title: 'A spectrophotometric determination that will not fit on the calibration line',
    prompt: 'A coloured complex is determined by visible spectrophotometry at λ<sub>max</sub>, in 1.00 cm cells. Five standards give:<br>' +
      '<table class="ref-table"><tr><th>c (10⁻⁴ M)</th><th>0 (blank)</th><th>2.00</th><th>4.00</th><th>6.00</th><th>8.00</th></tr>' +
      '<tr><th>A</th><td>0.045</td><td>0.233</td><td>0.420</td><td>0.610</td><td>0.796</td></tr></table>' +
      'The unknown reads <b>A = 1.42</b>. The student pipets 10.00 mL of it into a 50.00 mL volumetric flask, makes up to the mark, and re-measures: <b>A = 0.285</b>.',
    parts: [
      { q: '(a) Fit the calibration data and report the molar absorptivity ε. The line does not pass through the origin — say what that means and how you should handle it.', a: 'Least squares on the five points gives <b>A = 940·c + 0.045</b>, so ε = slope/b = <b>940 L·mol⁻¹·cm⁻¹</b> (b = 1.00 cm).<br>The intercept of +0.045 is a constant absorbance present even at zero analyte: an imperfectly matched blank, a scratched or fingerprinted cell, or slight turbidity. Two responses are correct and one is not. Correct: find and remove the cause (re-blank against the true matrix, clean the cell) and re-run; or, if it is genuinely constant across the set, <b>use the fitted line including its intercept</b> — the calibration then corrects for the offset automatically.<br><span class="trap">Forcing the line through the origin is the wrong response.</span> It does not remove the offset; it smears it into the slope, biasing ε and every concentration read from it.' },
      { q: '(b) Calculate the concentration of the original (undiluted) unknown.', a: 'Work from the diluted reading, which lies inside the calibrated range:<br>c(diluted) = (0.285 − 0.045)/940 = 0.240/940 = 2.55×10⁻⁴ M.<br>Dilution factor = 50.00/10.00 = 5.00 → c(original) = 5.00 × 2.55×10⁻⁴ = <b>1.28×10⁻³ M</b>.<br>Note that the intercept must be subtracted BEFORE dividing by the slope, and the dilution factor applied AFTER — reversing either step is a common and silent error.' },
      { q: '(c) The determination is run in triplicate, giving 1.277, 1.281 and 1.352 (×10⁻³ M). Apply the Q-test (Q_crit = 0.941 at 90% confidence for n = 3) and report the final result.', a: 'Order the data: 1.277, 1.281, 1.352. The suspect value is 1.352, whose gap to its neighbour is 1.352 − 1.281 = 0.071; the total range is 1.352 − 1.277 = 0.075.<br>Q = gap/range = 0.071/0.075 = <b>0.947 > 0.941 → reject</b> the 1.352 result.<br>Mean of the two survivors: <b>1.279×10⁻³ M</b>.<br>Two honest caveats belong in the report. The rejection is <em>marginal</em> — 0.947 against 0.941 — and a third reading of 1.344 rather than 1.352 would have given Q = 0.940 and had to be kept. And discarding one of three measurements leaves an average of two, which is a weak basis for any claim of precision: the right response to a borderline Q-test is to run more replicates, not to publish the mean of what survived.' },
      { q: '(d) Why is the original A = 1.42 reading untrustworthy, and why does diluting improve the result even though it adds two more volumetric measurements?', a: 'At A = 1.42, T = 10⁻¹·⁴² = 3.8% — only about one photon in 26 reaches the detector, so the measurement sits where photometric error is largest and the signal is close to the instrument\'s dark noise. Worse, the error is not merely random: <b>stray light</b> (any light reaching the detector without passing through the sample at the analytical wavelength) sets a floor on apparent transmittance, so high absorbances read systematically <em>low</em> and the Beer–Lambert plot bends toward the concentration axis. Reading A = 1.42 off an extrapolated line would therefore under-report the concentration.<br>The dilution replaces that with two volumetric operations of well-characterised precision — a 10.00 mL pipet (±0.02 mL, 0.2%) and a 50.00 mL flask (±0.05 mL, 0.1%) — contributing about 0.2% in quadrature, and it moves the reading to A = 0.285, comfortably inside the 0.1–1.0 window where photometric precision is best. Trading a several-percent systematic error for a few tenths of a percent of random error is a bargain.' },
    ],
  },
  {
    id: 'p2-lab-004',
    topic: 'lab',
    title: 'Recrystallization: how much can you actually get back?',
    prompt: 'A crude solid (5.00 g) is to be purified by recrystallization from water. Its solubility in water is <b>25 g per 100 mL at 80 °C</b> and <b>2.5 g per 100 mL at 0 °C</b>. The pure compound melts at 121–122 °C.',
    parts: [
      { q: '(a) What is the minimum volume of hot water that will dissolve the whole sample, and what is the maximum mass recoverable after cooling to 0 °C?', a: 'Minimum hot solvent: 5.00 g ÷ (25 g/100 mL) = <b>20.0 mL</b>.<br>At 0 °C that same 20.0 mL still holds 2.5 × (20.0/100) = 0.50 g in solution.<br>Maximum recovery = 5.00 − 0.50 = <b>4.50 g (90.0%)</b>. The compound left dissolved in the cold mother liquor is the unavoidable cost of the method.' },
      { q: '(b) A classmate uses 60 mL of hot water instead — "to make sure it all dissolves." Calculate their maximum recovery and comment.', a: 'Cold loss = 2.5 × (60/100) = 1.50 g → recovery = 5.00 − 1.50 = <b>3.50 g (70.0%)</b>.<br>Three times the solvent throws away three times the product: a fifth of the yield lost for no purification benefit at all. <span class="trap">"Minimum hot solvent" is not a stylistic preference — it is the single biggest determinant of recrystallization yield.</span> If the solid genuinely will not dissolve in the minimum volume, add solvent in small portions at the boil until it just goes in, rather than starting generously.' },
      { q: '(c) The classmate cools their flask rapidly in an ice bath for 30 seconds and recovers 4.7 g — more than your calculated maximum for 20 mL, and far more than their own 3.50 g. Explain what has happened, and state what one measurement would confirm it.', a: 'Recovering more than the theoretical maximum is a warning, not a success: the excess mass is not product. Crashing the solution out quickly gives fast, disordered crystal growth that <b>occludes solvent and traps impurities</b> inside the crystals instead of leaving them in the mother liquor — and the recovered solid may still be wet. The purification has essentially been undone; the whole point of cooling slowly is to let the lattice grow selectively, excluding anything that does not fit.<br>Confirming measurement: the <b>melting point</b>. Pure material melts sharply at 121–122 °C; the rapidly cooled solid will melt lower and over a wide range (say 114–119 °C), because dissolved impurity depresses and broadens the melting point. Weighing after further drying to constant mass would separately reveal any trapped solvent.' },
      { q: '(d) Your own product melts at 120–122 °C. Is that proof you have made the expected compound? Say what it does and does not establish, and what further test settles it.', a: 'It establishes <b>purity</b>, not <b>identity</b>. A sharp melting range at the literature value is strong evidence the solid is a single substance, but many compounds melt near 121 °C, so it cannot by itself say which one you have.<br>The classical test is a <b>mixed melting point</b>: grind your product with an authentic sample of the expected compound and melt the mixture. If they are the same substance the melting point is unchanged; if they are different, each acts as an impurity in the other and the mixture melts lower and broader. In a modern lab you would confirm with spectroscopy (IR for the functional groups, NMR for the skeleton) — but the mixed melting point remains the cheapest definitive answer when an authentic sample is on hand.' },
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
  {
    id: 'p2-organic-003',
    topic: 'organic',
    title: 'The same reaction, run twice, giving two different major products',
    prompt: 'Adding HBr to buta-1,3-diene gives two products — 3-bromobut-1-ene (<b>1,2-adduct</b>) and 1-bromobut-2-ene (<b>1,4-adduct</b>) — in a ratio that depends only on temperature:<br><table class="ref-table"><tr><td><b>conditions</b></td><td><b>1,2-adduct</b></td><td><b>1,4-adduct</b></td></tr><tr><td>−80 °C</td><td>71%</td><td>29%</td></tr><tr><td>+40 °C</td><td>15%</td><td>85%</td></tr></table>',
    parts: [
      { q: '(a) Both products come from the same intermediate. Identify it and explain why it gives two products at all.', a: 'Protonation at C1 gives the <b>allylic carbocation</b> CH₃–CH⁺–CH=CH₂ ↔ CH₃–CH=CH–CH₂⁺, one delocalised cation with positive charge shared over C2 and C4. Bromide can attack either carbon: C2 gives the 1,2-adduct, C4 the 1,4-adduct. <span class="trap">Protonation goes at C1, not C2, because only then is the resulting cation allylic — the same "most stable cation" rule as Markovnikov, applied to a conjugated system.</span>' },
      { q: '(b) Which product is formed faster, which is more stable, and how do you know each from the data alone?', a: 'The 1,2-adduct dominates at −80 °C, where nothing has enough energy to go back, so it must be the <b>kinetic</b> product — formed faster. The 1,4-adduct dominates at +40 °C, where the reaction is reversible and the mixture equilibrates, so it must be the <b>thermodynamic</b> product — more stable. Its stability is structural: the 1,4-adduct has an internal <i>disubstituted</i> alkene, the 1,2-adduct a terminal monosubstituted one.<br>The 1,2-adduct is faster because in the ion pair, bromide is already sitting next to C2 (the carbon it just left the proton near) and because more of the positive charge resides on the secondary carbon.' },
      { q: '(c) Design the single experiment that proves the +40 °C result is equilibrium control and not simply a different reaction pathway.', a: 'Take the <b>pure 1,2-adduct</b>, isolated at −80 °C, and warm it to 40 °C with the HBr still present. If it converts to the same 15:85 mixture, the products interconvert through the allylic cation and the high-temperature ratio is a genuine equilibrium. If it just sits there, the two temperatures run different mechanisms. (The experiment works: it does convert.) Thermodynamic control <i>requires</i> reversibility, so demonstrating reversibility is the whole proof.' },
      { q: '(d) Apply the same idea to 2-methylcyclohexanone, which has two different α-positions. Give the reagent and conditions for each enolate and say which α-carbon is deprotonated.', a: '<b>Kinetic enolate:</b> LDA, THF, −78 °C. LDA is bulky and strong enough to deprotonate irreversibly, so it takes the <i>more accessible</i> proton — the CH₂ at C6, away from the methyl — giving the <b>less substituted</b> enolate. <b>Thermodynamic enolate:</b> NaOEt in EtOH at reflux. A weaker base sets up an equilibrium among the enolates, and the mixture settles on the <b>more substituted</b> (tetrasubstituted) enolate at C2, which is more stable for the same reason a more substituted alkene is. The rule generalises: <b>irreversible + hindered + cold = kinetic; reversible + small + hot = thermodynamic.</b>' },
    ],
  },
  {
    id: 'p2-organic-004',
    topic: 'organic',
    tier: 4, // a Hammett analysis: extract rho from rate data, then read the mechanism off its sign and magnitude, and recognise when the substituent constant itself is the wrong one
    title: 'Reading a mechanism off a straight line',
    prompt: 'Alkaline hydrolysis of 4-substituted ethyl benzoates, 4-X-C₆H₄CO₂Et + HO⁻, was followed at 30 °C:<br><table class="ref-table"><tr><td><b>X</b></td><td><b>OCH₃</b></td><td><b>CH₃</b></td><td><b>H</b></td><td><b>Cl</b></td><td><b>NO₂</b></td></tr><tr><td>σ<sub>p</sub></td><td>−0.27</td><td>−0.17</td><td>0.00</td><td>+0.23</td><td>+0.78</td></tr><tr><td>10³k / M⁻¹s⁻¹</td><td>0.255</td><td>0.423</td><td>1.00</td><td>3.21</td><td>52.0</td></tr></table>The Hammett equation is log(k/k₀) = ρσ, where σ is defined so that ρ ≡ 1.00 for the ionisation of benzoic acids in water at 25 °C.',
    parts: [
      { q: '(a) Compute log(k/k₀) for each substituent and obtain ρ.', a: 'k₀ is the unsubstituted (X = H) value, 1.00×10⁻³.<br>OCH₃: log(0.255) = <b>−0.593</b> · CH₃: log(0.423) = <b>−0.374</b> · H: <b>0.000</b> · Cl: log(3.21) = <b>+0.507</b> · NO₂: log(52.0) = <b>+1.716</b>.<br>Plotting these against σ gives a straight line through the origin. Taking the two extremes, ρ = [1.716 − (−0.593)]/[0.78 − (−0.27)] = 2.309/1.05 = <b>ρ ≈ +2.2</b>. (Every adjacent pair gives the same slope to two figures — that consistency <i>is</i> the evidence the analysis is valid.)' },
      { q: '(b) Interpret the SIGN of ρ. What does it say about the charge at the reaction centre in the rate-determining transition state?', a: 'ρ is <b>positive</b>, so electron-withdrawing groups (positive σ) <i>accelerate</i> the reaction. A substituent that withdraws electron density stabilises developing <b>negative</b> charge. Therefore the rate-determining transition state has more negative charge at the reaction centre than the starting material does — consistent with hydroxide attacking the carbonyl carbon to build the tetrahedral <b>alkoxide</b> intermediate. A negative ρ would have meant positive charge developing, as in an SN1 ionisation.' },
      { q: '(c) Interpret the MAGNITUDE. What does ρ ≈ +2.2 say that the sign alone does not?', a: 'Since ρ ≡ 1.00 for benzoic acid ionisation — where a full negative charge appears on an oxygen one atom from the ring — a ρ of 2.2 means the reaction centre in this transition state is <b>more than twice as sensitive</b> to the substituent as that reference. So a large amount of negative charge is developed by the transition state, which must therefore resemble the tetrahedral intermediate rather than the starting ester: formation of the C–O bond is well advanced before the transition state is reached. Small |ρ| (< 0.5) would indicate little charge development, and ρ ≈ 0 that the mechanism does not build charge at the ring-bearing carbon at all.' },
      { q: '(d) A student applies the same σ values to the ionisation of 4-substituted PHENOLS and finds every point on the line except 4-nitrophenol, which is far more acidic than predicted. Explain, and state the general lesson.', a: 'Phenoxide bears its negative charge on an oxygen attached <i>directly</i> to the ring, so that charge is delocalised straight into a para nitro group through the π system. Ordinary σ<sub>p</sub> is calibrated on benzoic acids, where the charge sits on a carboxylate insulated from the ring by the carbonyl carbon, so it accounts only for induction plus modest resonance — it underestimates a substituent that can conjugate with the charge itself. The fix is the <b>σ⁻ scale</b> (σ⁻ for p-NO₂ is +1.27, not +0.78), used whenever a negative charge is in direct conjugation with the substituent; σ⁺ is its mirror image for positive charge, as in SN1 solvolysis of benzylic halides.<br><span class="trap">A point that misses the line is data, not noise. A single outlier usually means the wrong σ scale; a genuine <i>break</i> in slope — two straight segments — means something else entirely: the rate-determining step has changed, and the two segments are two different mechanisms competing.</span>' },
    ],
  },
  {
    id: 'p2-organic-005',
    topic: 'organic',
    title: 'How much of it is the right enantiomer?',
    prompt: 'Enantiomerically pure (S)-butan-2-ol has [α]<sub>D</sub> = +13.5° (neat, 25 °C). Three samples are measured under identical conditions.',
    parts: [
      { q: '(a) Sample A gives [α]D = +6.75°. Find its enantiomeric excess and the percentage of each enantiomer.', a: 'ee = observed/pure × 100 = (6.75/13.5) × 100 = <b>50% ee</b>, favouring (S).<br>Composition: ee is the <i>excess</i> of one over the other, so the remaining 50% is racemic and splits evenly. %(S) = (100 + 50)/2 = <b>75%</b>, %(R) = <b>25%</b>. <span class="trap">50% ee is not a 50:50 mixture — that would be 0% ee. The two scales differ by exactly this factor-of-two step, and it is the most common slip in the whole topic.</span>' },
      { q: '(b) Sample B gives [α]D = 0.00°. Give two chemically different situations that produce this reading, and one measurement that tells them apart.', a: '(1) A true <b>racemate</b>, 50:50 (R)/(S). (2) The compound is present but the sample is a <b>meso</b> form or otherwise achiral — not possible for butan-2-ol itself, but the general trap. (3) A <i>fortuitously</i> zero rotation: the compound has a small [α] at the sodium D line specifically, and would rotate at a different wavelength. Distinguish with <b>chiral chromatography or chiral-shift NMR</b>, which counts the two enantiomers directly instead of measuring a bulk optical property. Polarimetry can only ever report a net rotation, so it cannot distinguish "equal amounts of two things" from "no chiral thing".' },
      { q: '(c) Optically pure (S)-2-bromobutane is solvolysed in aqueous ethanol. The butan-2-ol produced has [α]D = −2.70°. Report the stereochemical outcome quantitatively, and explain why a clean SN1 does not give this result.', a: '|ee| = 2.70/13.5 = <b>20% ee</b>, and the sign is negative, so the excess is <b>(R)</b> — the inverted configuration. The product is 80% racemic and 20% inverted, i.e. <b>60% (R) / 40% (S)</b>.<br>A textbook SN1 goes through a free, planar carbocation, which is attacked equally from both faces and must give 0% ee. Getting net inversion means the cation is <i>not</i> free: in the <b>intimate ion pair</b>, the departing bromide still shields the face it left from, so the nucleophile preferentially attacks the opposite face. Partial inversion is the normal experimental result for secondary substrates, and it is direct evidence that ion pairs, not naked cations, are the real intermediates.' },
      { q: '(d) The racemic alcohol is to be resolved. Explain why recrystallisation cannot separate the enantiomers directly, and give a route that works.', a: 'Enantiomers have identical scalar properties — melting point, solubility, lattice energy — so no achiral separation (distillation, ordinary crystallisation, standard chromatography) can distinguish them. Convert them to <b>diastereomers</b>, which are genuinely different compounds: esterify the racemic alcohol with a single enantiomer of a chiral acid (e.g. (S)-mandelic or a tartrate derivative). The (S,S) and (R,S) esters have different melting points and solubilities and can be recrystallised apart; hydrolysing each recovers one enantiomer of the alcohol. The principle is general — <b>make the difference a diastereomeric one, then use ordinary physical methods</b> — and it is also how a chiral chromatography column works, by forming transient diastereomeric complexes with the stationary phase.' },
    ],
  },
  {
    id: 'p2-organic-006',
    topic: 'organic',
    title: 'Why nylon needs a chemist who can weigh accurately',
    prompt: 'Nylon-6,6 is made from hexamethylenediamine, H₂N(CH₂)₆NH₂ (M = 116.21), and adipic acid, HOOC(CH₂)₄COOH (M = 146.14), which condense with loss of water. For step-growth polymerisation the Carothers equation gives the number-average degree of polymerisation X̄<sub>n</sub> = 1/(1 − p), where p is the fraction of functional groups that have reacted. With a stoichiometric imbalance r = (moles of the deficient group)/(moles of the excess group), this becomes X̄<sub>n</sub> = (1 + r)/(1 + r − 2rp).',
    parts: [
      { q: '(a) Work out the mass of the repeat unit, then the M̄n of a sample with X̄n = 100.', a: 'One repeat unit joins one of each monomer and expels two molecules of water (one per amide bond formed):<br>M(repeat) = 116.21 + 146.14 − 2(18.02) = <b>226.31 g/mol</b>.<br>M̄n = X̄n × M(repeat) = 100 × 226.31 = <b>2.26×10⁴ g/mol</b>.' },
      { q: '(b) With exact 1:1 stoichiometry, what conversion p is needed for X̄n = 100, and for X̄n = 200? Comment.', a: 'X̄n = 1/(1−p) → p = 1 − 1/X̄n.<br>X̄n = 100 → p = <b>0.990</b>. X̄n = 200 → p = <b>0.995</b>.<br>Note what that means: taking the reaction from 99.0% to 99.5% completion — squeezing out the last half a percent — <i>doubles</i> the chain length. Step-growth molar mass is controlled almost entirely in the final fraction of a percent of conversion, which is why these polymerisations are run for long times under vacuum to strip the water and drive the equilibrium.' },
      { q: '(c) A batch is charged with a 2.0% excess of adipic acid and run to complete conversion of the diamine (p = 1.000). Find the maximum X̄n, and explain the cap.', a: 'r = 1.000/1.020 = 0.9804. At p = 1:<br>X̄n = (1 + r)/(1 + r − 2r) = (1 + r)/(1 − r) = 1.9804/0.0196 = <b>101</b>.<br>Even with <i>every</i> amine group consumed, the chains stop at about 100 units. The excess diacid ends up capping chain ends with –COOH groups that have no partner left to react with; a chain with the same group at both ends cannot grow further. <span class="trap">Perfect conversion does not rescue imperfect stoichiometry — the two limits multiply rather than substitute. A 2% weighing error caps the product at X̄n ≈ 100 no matter how long you run it.</span> This is also used deliberately: adding a measured excess, or a monofunctional acid, is how chain length is <i>controlled</i> industrially.' },
      { q: '(d) Contrast this with the radical polymerisation of ethene to polyethylene, where high molar mass appears within seconds and at a few percent conversion. What is structurally different about the two mechanisms?', a: 'In <b>chain-growth</b>, an initiator creates a small number of active centres and each one adds thousands of monomers within a fraction of a second before terminating. At any moment the flask holds full-length dead polymer plus unreacted monomer, and almost nothing in between — so molar mass is high from the start and conversion only affects <i>yield</i>.<br>In <b>step-growth</b>, every molecule in the flask is reactive at both ends and any two can couple. The population climbs through dimers, trimers and oligomers together, so long chains only exist once nearly every end group has found a partner. Molar mass and conversion are therefore the same variable, and X̄n is the reciprocal of what is left over.' },
    ],
  },
  {
    id: 'p2-organic-007',
    topic: 'organic',
    title: 'Four questions a Diels–Alder answers at once',
    prompt: 'Cyclopentadiene reacts with maleic anhydride at room temperature within minutes to give a single major stereoisomer. Buta-1,3-diene and maleic anhydride need heating. (2Z,4Z)-hexa-2,4-diene does not react usefully at all.',
    parts: [
      { q: '(a) Account for the enormous rate spread across the three dienes.', a: 'Only the <b>s-cis</b> conformation can reach both ends of the dienophile at once. <b>Cyclopentadiene is locked s-cis</b> by its ring — it pays no conformational penalty and is one of the most reactive dienes known (so reactive it dimerises with itself on standing, and is cracked from the dimer before use). <b>Butadiene</b> prefers s-trans and must pay to rotate into s-cis, so it needs heat. <b>(2Z,4Z)-hexa-2,4-diene</b> cannot adopt s-cis at all without forcing its two inward-pointing methyl groups into each other — the s-cis conformation is sterically prohibitive, so the reaction is effectively shut off. Reactivity here is a question of <i>conformation</i>, not of the π bonds themselves.' },
      { q: '(b) Cyclopentadiene + maleic anhydride gives the endo adduct, although the exo is the more stable product. Name the principle and say what kind of control this is.', a: 'The <b>endo rule</b>: in the transition state the dienophile tucks <i>under</i> the diene so that its carbonyl π system overlaps with the developing π bond at C2–C3 of the diene — <b>secondary orbital interaction</b>, which stabilises the endo transition state without contributing anything to the product. Endo is therefore the <b>kinetic</b> product and exo the thermodynamic one. At room temperature the reaction is irreversible on the timescale of the experiment and endo wins; prolonged heating can equilibrate some Diels–Alder adducts to the exo isomer via retro-Diels–Alder. Same kinetic/thermodynamic logic as diene hydrobromination, but the kinetic preference here comes from an orbital interaction rather than from proximity.' },
      { q: '(c) Predict the regiochemistry of 2-methylbuta-1,3-diene (isoprene) with acrolein (prop-2-enal), and state the rule.', a: 'A 2-substituted diene with a mono-substituted dienophile gives the <b>"para"</b> product — here 4-methylcyclohex-3-ene-1-carbaldehyde, with the methyl and the CHO group 1,4 on the new ring. (A 1-substituted diene would give the "ortho" product instead.) The names are borrowed from benzene and mean only the relative positions on the new six-membered ring. The origin is orbital coefficients: the diene HOMO and dienophile LUMO each have one terminus with the larger lobe, and the reaction pairs large with large.' },
      { q: '(d) Classify the Diels–Alder under the Woodward–Hoffmann rules, and predict the stereochemical outcome of the THERMAL electrocyclic ring closure of (2E,4Z,6E)-octa-2,4,6-triene.', a: 'The Diels–Alder is a [4+2] cycloaddition — <b>6 π electrons = 4n+2</b> — so thermally allowed suprafacial–suprafacial. Two consequences visible in the products: the dienophile\'s stereochemistry is retained (cis substituents stay cis in the adduct), because both new σ bonds form on the same face in one step.<br>For the triene: a <b>6 π-electron (4n+2) thermal</b> electrocyclisation is <b>disrotatory</b>. The two termini rotate in opposite senses, which places the two terminal methyl groups <b>cis</b> on the new cyclohexadiene ring. Photochemically the rules invert — the same 4n+2 system closes conrotatory and gives the trans product, which is exactly how the two can be told apart experimentally.' },
    ],
  },
];
