// Question Bank — Part II: multi-part free-response problems in USNCO Part II /
// CCC Part B-C style. All problems are original. Each part reveals a full
// worked solution.

export interface FRQ {
  topic: string;
  title: string;
  prompt: string; // HTML — the stem / given data
  parts: { q: string; a: string }[];
}

export const PART2: FRQ[] = [
  // ================= STOICHIOMETRY =================
  {
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
    topic: 'stoich',
    title: 'Sodium carbonate and acid',
    prompt: 'A 1.06 g sample of pure Na₂CO₃ (M = 106.0 g/mol) is dissolved in water and titrated with 0.500 M HCl to complete neutralization:<br>Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂',
    parts: [
      { q: '(a) What volume of the HCl solution is required?', a: 'n(Na₂CO₃) = 1.06/106.0 = 0.0100 mol → n(HCl) = 2 × 0.0100 = 0.0200 mol → V = 0.0200/0.500 = <b>40.0 mL</b>. The 2:1 ratio is the whole question — diprotic bases need double.' },
      { q: '(b) What volume of CO₂ is released at STP (22.4 L/mol)?', a: 'n(CO₂) = n(Na₂CO₃) = 0.0100 mol → V = 0.0100 × 22.4 = <b>0.224 L = 224 mL</b>.' },
      { q: '(c) Write the net ionic equation.', a: '<b>CO₃²⁻ + 2H⁺ → H₂O + CO₂(g)</b>. Na⁺ and Cl⁻ are spectators; carbonate stays together (weak base), HCl splits (strong acid).' },
    ],
  },

  // ================= STATES OF MATTER & GASES =================
  {
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
    topic: 'states',
    title: 'Hydrogen collected over water',
    prompt: 'Zinc reacts with excess hydrochloric acid: Zn + 2HCl → ZnCl₂ + H₂. The hydrogen is collected over water at 25.0 °C. The total pressure is 760.0 torr and the collected volume is 500.0 mL. (P°(H₂O, 25 °C) = 23.8 torr)',
    parts: [
      { q: '(a) Find the partial pressure of the dry hydrogen.', a: 'Dalton: P(H₂) = 760.0 − 23.8 = <b>736.2 torr = 0.9687 atm</b>. Gas collected over water is always wet — skipping this correction inflates every later number.' },
      { q: '(b) Calculate the moles of H₂ collected.', a: 'n = PV/RT = (0.9687 × 0.5000)/(0.08206 × 298.2) = 0.4844/24.47 = <b>0.0198 mol</b>.' },
      { q: '(c) What mass of zinc reacted? (M = 65.4)', a: '1:1 ratio → n(Zn) = 0.0198 mol → m = 0.0198 × 65.4 = <b>1.30 g</b>.' },
    ],
  },

  // ================= THERMODYNAMICS =================
  {
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
    topic: 'kinetics',
    title: 'First-order decomposition',
    prompt: 'A compound decomposes by first-order kinetics with k = 0.0231 min⁻¹ at 60 °C.',
    parts: [
      { q: '(a) What is the half-life?', a: 't½ = ln2/k = 0.693/0.0231 = <b>30.0 min</b> — constant throughout the reaction, the first-order signature.' },
      { q: '(b) How long until the reaction is 90% complete?', a: '10% remains: t = ln([A]₀/[A])/k = ln(10)/0.0231 = 2.303/0.0231 = <b>99.7 min</b> (≈ 3.3 half-lives, sensible: 3 half-lives leaves 12.5%).' },
      { q: '(c) What fraction remains after 2.0 hours?', a: '120 min = exactly 4 half-lives → (½)⁴ = <b>1/16 = 6.25%</b>. (Check: e^(−0.0231×120) = e^(−2.77) = 0.0625 ✓)' },
    ],
  },

  // ================= EQUILIBRIUM =================
  {
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
    topic: 'equilibrium',
    title: 'Selective precipitation (the Mohr idea)',
    prompt: 'A solution is 0.010 M in both Cl⁻ and CrO₄²⁻. AgNO₃ is added slowly.<br>Ksp(AgCl) = 1.8×10⁻¹⁰ · Ksp(Ag₂CrO₄) = 1.1×10⁻¹²',
    parts: [
      { q: '(a) What [Ag⁺] is needed to begin precipitating each anion?', a: 'AgCl: [Ag⁺] = 1.8×10⁻¹⁰/0.010 = <b>1.8×10⁻⁸ M</b>. Ag₂CrO₄: [Ag⁺] = √(1.1×10⁻¹²/0.010) = √(1.1×10⁻¹⁰) = <b>1.0×10⁻⁵ M</b>. Note the square root — the stoichiometries differ, so compare required [Ag⁺], never raw Ksp values.' },
      { q: '(b) Which precipitates first, and what fraction of it remains when the second begins?', a: 'AgCl needs ~600× less Ag⁺ → <b>chloride precipitates first</b>. When chromate starts ([Ag⁺] = 1.0×10⁻⁵): [Cl⁻] = 1.8×10⁻¹⁰/1.0×10⁻⁵ = 1.8×10⁻⁵ M → only <b>0.18%</b> of the chloride is left.' },
      { q: '(c) Explain how this is used as a titration indicator.', a: 'In the Mohr method, chromate is the indicator: red-brown Ag₂CrO₄ appears only AFTER essentially all Cl⁻ is consumed — the first permanent red tinge marks the endpoint of a chloride titration.' },
    ],
  },

  // ================= ACIDS & BASES =================
  {
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
    topic: 'atomic',
    title: 'Reading a photoelectron spectrum',
    prompt: 'An element\'s PES shows four peaks. Binding energy falls left to right; relative areas are given:<br><table class="ref-table"><tr><th>peak</th><th>1</th><th>2</th><th>3</th><th>4</th></tr><tr><td>area</td><td>2</td><td>2</td><td>6</td><td>1</td></tr></table>',
    parts: [
      { q: '(a) Assign the peaks and identify the element.', a: 'Areas 2, 2, 6, 1 → 1s², 2s², 2p⁶, 3s¹ → 11 electrons: <b>sodium</b>. Peak count = subshell count; area = electron count.' },
      { q: '(b) Why is the 2p peak at higher binding energy than 3s despite holding more electrons?', a: 'Binding energy reflects distance/shielding, not population: 2p electrons sit in the n = 2 shell, closer to the nucleus and far less shielded than the lone 3s electron.' },
      { q: '(c) Predict two differences in the PES of magnesium.', a: 'Mg (1s²2s²2p⁶3s²): the last peak DOUBLES in area (3s²), and every peak shifts to slightly higher binding energy — one more proton raises Z_eff across the board.' },
    ],
  },

  // ================= BONDING =================
  {
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
    topic: 'bonding',
    title: 'The oxygen family by MO theory',
    prompt: 'Consider O₂, O₂⁺, O₂⁻ and O₂²⁻ using the MO diagram for period-2 diatomics (σ2p below π2p).',
    parts: [
      { q: '(a) Give the bond order of each species.', a: 'Valence electrons 11, 12, 13, 14 → BO: <b>O₂⁺ 2.5, O₂ 2, O₂⁻ 1.5, O₂²⁻ 1</b>. Each added electron lands in antibonding π*, each removal takes one out.' },
      { q: '(b) Which are paramagnetic?', a: 'Count unpaired π* electrons: O₂⁺ (1), O₂ (2), O₂⁻ (1) are <b>paramagnetic</b>; peroxide O₂²⁻ has a full π* set — diamagnetic.' },
      { q: '(c) Rank the O–O bond lengths.', a: 'Inverse to bond order: <b>O₂⁺ &lt; O₂ &lt; O₂⁻ &lt; O₂²⁻</b>. Removing an ANTIBONDING electron shortens the bond — the counterintuitive result Lewis theory can\'t produce.' },
    ],
  },

  // ================= DESCRIPTIVE & INORGANIC =================
  {
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
    topic: 'descriptive',
    title: 'Two cobalt complexes, two colors',
    prompt: 'Compare [Co(NH₃)₆]³⁺ and [CoF₆]³⁻. NH₃ is a strong-field ligand; F⁻ is weak-field.',
    parts: [
      { q: '(a) Determine the d-electron count of cobalt in each.', a: 'Both are Co³⁺: Co is [Ar]3d⁷4s² → remove 3 e⁻ (4s first) → <b>d⁶</b> in both complexes. Ligand charges: 6 NH₃ = 0; 6 F⁻ = −6 → Co must be +3 either way.' },
      { q: '(b) Predict high/low spin and the number of unpaired electrons for each.', a: 'NH₃ (strong field): pairing beats promotion → low spin t₂g⁶ → <b>0 unpaired, diamagnetic</b>. F⁻ (weak field): high spin t₂g⁴e_g² → <b>4 unpaired, strongly paramagnetic</b>. Magnetism experimentally distinguishes them.' },
      { q: '(c) One complex is yellow-orange, the other blue. Assign them.', a: 'Strong field = large Δ = absorbs high-energy (blue/violet) light → looks <b>yellow-orange: [Co(NH₃)₆]³⁺</b>. Weak field absorbs low-energy red/orange → looks <b>blue: [CoF₆]³⁻</b>. Color seen = complement of color absorbed.' },
    ],
  },

  // ================= ORGANIC =================
  {
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
