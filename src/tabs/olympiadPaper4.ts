// Mock Paper 4 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
import type { OlympiadPaper } from './bankOlympiad';

export const paper4: OlympiadPaper = {
  id: 'mock4',
  label: 'Mock Paper 4',
  blurb: 'Fourth full-length practice contest — leans a little harder, with more multi-step reasoning.',
  partA: [
    { id: 'mock4-a-001', topic: 'stoich', q: 'A 500. mL solution contains 5.85 g of \\(\\ce{NaCl}\\) (M = 58.5). Its molarity is:', opts: ['0.10 M', '0.20 M', '0.50 M', '1.0 M'], a: 1, why: 'n = 5.85/58.5 = 0.100 mol in 0.500 L → 0.200 M.' },
    { id: 'mock4-a-002', topic: 'states', q: 'Which gas effuses fastest through a small hole?', opts: ['\\(\\ce{He}\\)', '\\(\\ce{CO2}\\)', '\\(\\ce{O2}\\)', '\\(\\ce{Cl2}\\)'], a: 0, why: 'Graham\'s law: rate ∝ 1/√M; He (M = 4) is lightest, so it effuses fastest.' },
    { id: 'mock4-a-003', tier: 3, topic: 'thermo', q: 'The bond enthalpies (kJ/mol) are H–H 436, Cl–Cl 242, H–Cl 431. ΔH for \\(\\ce{H2 + Cl2 -> 2HCl}\\) is:', opts: ['−92 kJ', '−247 kJ', '+184 kJ', '−184 kJ'], a: 3, why: 'ΔH = Σbonds broken − Σbonds formed = (436+242) − 2(431) = 678 − 862 = −184 kJ.' , misconception: 'ΔH = Σ(bonds broken) − Σ(bonds formed) applies to the equation AS WRITTEN, so the 2 in 2HCl must multiply 431 — halving to −92 quotes the value per mole of HCl, not per mole of reaction. And the sign belongs to breaking: bond breaking always costs energy, so reversing the subtraction to give +184 makes an exothermic reaction look endothermic.' },
    { id: 'mock4-a-004', topic: 'kinetics', q: 'The rate constant of a reaction roughly doubles for a 10 °C rise. This is explained by:', opts: ['a larger ΔH of reaction', 'a change in the value of K', 'more molecules exceeding Ea', 'a lower activation energy'], a: 2, why: 'Higher T shifts the Maxwell–Boltzmann distribution so a larger fraction of collisions exceed Ea → k rises.' },
    { id: 'mock4-a-005', topic: 'equilibrium', q: 'A 1.0 L flask at equilibrium holds 0.20 mol \\(\\ce{PCl5}\\), 0.10 mol \\(\\ce{PCl3}\\), 0.10 mol \\(\\ce{Cl2}\\) for \\(\\ce{PCl5 <=> PCl3 + Cl2}\\). Kc is:', opts: ['0.200', '0.050', '2.00', '0.100'], a: 1, why: 'Kc = [PCl₃][Cl₂]/[PCl₅] = (0.10)(0.10)/0.20 = 0.050.' },
    { id: 'mock4-a-006', topic: 'acids', q: 'Which is the strongest acid?', opts: ['\\(\\ce{HF}\\) (Ka=6.6×10⁻⁴)', '\\(\\ce{CH3COOH}\\) (Ka=1.8×10⁻⁵)', '\\(\\ce{HCN}\\) (Ka=6.2×10⁻¹⁰)', '\\(\\ce{H2CO3}\\) (Ka=4.3×10⁻⁷)'], a: 0, why: 'The largest Ka is the strongest acid → HF.' },
    { id: 'mock4-a-007', topic: 'acids', q: '50.0 mL of 0.10 M HCl is mixed with 50.0 mL of 0.10 M NaOH. The resulting pH is:', opts: ['1.0', '3.5', '13.0', '7.0'], a: 3, why: 'Equal moles of strong acid and base exactly neutralize → neutral solution, pH = 7.' },
    { id: 'mock4-a-008', tier: 3, topic: 'equilibrium', q: 'Which addition would dissolve more solid \\(\\ce{CaCO3}\\)?', opts: ['add \\(\\ce{Na2CO3}\\)', 'add \\(\\ce{CaCl2}\\)', 'add \\(\\ce{HCl}\\)', 'lower the temperature'], a: 2, why: 'Acid removes CO₃²⁻ (as CO₂ + H₂O), shifting \\(\\ce{CaCO3 <=> Ca^2+ + CO3^2-}\\) right → more dissolves.' , misconception: 'Adding a soluble salt that shares an ion with the solid pushes the equilibrium the WRONG way — the common-ion effect makes CaCl₂ or Na₂CO₃ precipitate more CaCO₃, not dissolve it. Solubility only rises when an ion is REMOVED from solution, and acid does exactly that by converting CO₃²⁻ into CO₂ and water, so the equilibrium can never catch up.' },
    { id: 'mock4-a-009', topic: 'redox', q: 'In the electrolysis of aqueous \\(\\ce{NaCl}\\) (brine), the product at the cathode is:', opts: ['\\(\\ce{Cl2}\\)', '\\(\\ce{H2}\\)', '\\(\\ce{Na}\\)', '\\(\\ce{O2}\\)'], a: 1, why: 'Water is reduced in preference to Na⁺: \\(\\ce{2H2O + 2e- -> H2 + 2OH-}\\).' },
    { id: 'mock4-a-010', tier: 3, topic: 'redox', q: 'Balancing \\(\\ce{MnO4- + Fe^2+ -> Mn^2+ + Fe^3+}\\) in acid, the ratio of \\(\\ce{MnO4-}\\) to \\(\\ce{Fe^2+}\\) is:', opts: ['1:1', '2:3', '5:1', '1:5'], a: 3, why: 'Mn gains 5 e⁻, Fe loses 1 e⁻; balancing electrons needs 5 Fe²⁺ per MnO₄⁻ → 1:5.' , misconception: 'The coefficient earned by each species is the OTHER one’s electron count: MnO₄⁻ takes 5 electrons and each Fe²⁺ supplies 1, so one permanganate oxidises five iron(II) ions and the ratio is 1:5. Writing 5:1 attaches the 5 to the species that generated it — a swap that also flips every titration calculation built on it.' },
    { id: 'mock4-a-011', tier: 3, topic: 'atomic', q: 'Which element has the highest second ionization energy relative to its first?', opts: ['Na', 'Mg', 'Al', 'Si'], a: 0, why: 'Na⁺ has a noble-gas configuration; removing a second electron breaks it, so IE₂ ≫ IE₁ for Na.' , misconception: 'Forming a 2+ ion easily and having a large IE₂ are opposite properties, and Mg is the tempting answer precisely because it is the familiar 2+ ion. The jump appears when the removal first breaks a noble-gas core: Na has one valence electron, so its second removal digs into the core (IE₂/IE₁ ≈ 9), whereas Mg’s second electron is still a valence electron and comes off cheaply — which is exactly why Mg²⁺ exists and Na²⁺ does not.' },
    { id: 'mock4-a-012', topic: 'bonding', q: 'Which species is diamagnetic?', opts: ['\\(\\ce{O2}\\)', '\\(\\ce{N2}\\)', '\\(\\ce{NO}\\)', '\\(\\ce{O2^-}\\)'], a: 1, why: 'N₂ has all electrons paired (bond order 3, no unpaired e⁻); O₂ and NO are paramagnetic.' },
    { id: 'mock4-a-013', topic: 'bonding', q: 'The number of lone pairs on the central atom of \\(\\ce{ClF3}\\) is:', opts: ['0', '1', '2', '3'], a: 2, why: 'Cl has 7 valence e⁻; 3 bonds use 3, leaving 2 lone pairs (AX₃E₂, T-shaped).' },
    { id: 'mock4-a-014', topic: 'bonding', q: 'Which has the greatest lattice energy?', opts: ['\\(\\ce{NaCl}\\)', '\\(\\ce{KCl}\\)', '\\(\\ce{CaO}\\)', '\\(\\ce{MgO}\\)'], a: 3, why: 'Lattice energy ∝ (charges)/(distance); MgO has 2+/2− ions and small radii → the largest.' },
    { id: 'mock4-a-015', topic: 'acids', q: 'A solution conducts electricity well and turns litmus red. It is most likely:', opts: ['dilute HCl', 'aqueous glucose', 'aqueous ethanol', 'pure water'], a: 0, why: 'Strong electrolyte + acidic → a strong acid such as dilute HCl.' },
    { id: 'mock4-a-016', topic: 'organic', q: 'How many chirality (stereo) centres are in 2,3-dibromobutane, \\(\\ce{CH3CHBrCHBrCH3}\\)?', opts: ['0', '2', '1', '4'], a: 1, why: 'Both C2 and C3 carry four different groups → 2 stereocentres (giving meso and d/l forms).' },
    { id: 'mock4-a-017', topic: 'organic', q: 'Oxidation of ethanol with a limited amount of acidified dichromate gives:', opts: ['ethene gas', 'ethanoic acid', 'ethanal', 'ethane gas'], a: 2, why: 'Controlled/partial oxidation of a 1° alcohol stops at the aldehyde, ethanal.' },
    { id: 'mock4-a-018', tier: 3, topic: 'descriptive', q: 'A gas turns limewater milky AND decolourises acidified \\(\\ce{KMnO4}\\). It is:', opts: ['\\(\\ce{CO2}\\)', '\\(\\ce{NH3}\\)', '\\(\\ce{H2}\\)', '\\(\\ce{SO2}\\)'], a: 3, why: 'Both CO₂ and SO₂ give a white precipitate with limewater (CaCO₃ and CaSO₃), so <span class="trap">the limewater test alone does not identify CO₂</span> — it identifies an acidic gas. SO₂ is also a reducing agent: it decolourises purple MnO₄⁻ and turns orange Cr₂O₇²⁻ green. CO₂ does neither, having sulfur\'s +4 → +6 route unavailable to carbon at +4.' , misconception: 'Limewater turning milky is a test for an ACIDIC gas, not a fingerprint for CO₂ — SO₂ gives an identical white precipitate as CaSO₃. Treating the first observation as an identification makes CO₂ look right and the second clue redundant; in fact the KMnO₄ result is what separates them, since sulfur at +4 can be oxidised to +6 while carbon at +4 has nowhere to go.' },
    { id: 'mock4-a-019', topic: 'atomic', q: 'A nuclide emits a positron. The daughter has:', opts: ['Z−1, same A', 'Z+1, same A', 'Z−2, A−4', 'same Z and A'], a: 0, why: 'Positron (β⁺) emission converts a proton to a neutron → Z falls by 1, A unchanged.' },
    { id: 'mock4-a-020', topic: 'lab', q: 'Repeating an extraction with three small solvent portions instead of one large portion:', opts: ['extracts more', 'extracts less', 'extracts the same', 'only saves time'], a: 0, why: 'Multiple small extractions leave a smaller fraction \\([V_{aq}/(V_{aq}+KV_{org})]^n\\) → more solute recovered.' },
    { id: 'mock4-a-021', topic: 'states', q: 'The van\'t Hoff factor i for \\(\\ce{K2SO4}\\) (fully dissociated) is:', opts: ['1', '2', '4', '3'], a: 3, why: 'K₂SO₄ → 2 K⁺ + SO₄²⁻ = 3 particles.' },
    { id: 'mock4-a-022', tier: 3, topic: 'thermo', q: 'For \\(\\ce{A -> B}\\), ΔH = −40 kJ and ΔS = −120 J/K. Above what temperature is the reaction non-spontaneous?', opts: ['300 K', '360 K', '333 K', 'always spontaneous'], a: 2, why: 'ΔG = 0 at T = ΔH/ΔS = 40000/120 = 333 K; above this ΔG > 0 (non-spontaneous).' , misconception: 'An exothermic reaction is not spontaneous at every temperature. With ΔS also negative, the −TΔS term is positive and grows with T, so it overtakes ΔH above T = ΔH/ΔS = 333 K — this reaction is spontaneous when COLD. (Convert first: ΔH in joules against ΔS in J/K, or the answer comes out a thousandfold wrong.)' },
    { id: 'mock4-a-023', topic: 'redox', q: 'The equilibrium constant K and standard cell potential E° are related by:', opts: ['K = nFE°, directly', 'ΔG° = −nFE° = −RT ln K', 'E° = RT/K, inverted', 'K = E°/n, a ratio'], a: 1, why: 'Both equal −ΔG°: −nFE° = −RT ln K links the electrochemical and equilibrium descriptions.' },
    { id: 'mock4-a-024', tier: 3, topic: 'atomic', q: 'A photon must have at least 494 kJ/mol of energy to break a Cl–Cl bond. The longest wavelength that works is closest to:', opts: ['242 nm', '494 nm', '700 nm', '120 nm'], a: 0, why: 'E per photon = 494000/6.02×10²³ = 8.2×10⁻¹⁹ J; λ = hc/E = (6.63×10⁻³⁴·3.0×10⁸)/8.2×10⁻¹⁹ ≈ 2.4×10⁻⁷ m = 242 nm.' , misconception: 'The 494 nm option is the bond energy’s digits reused as a wavelength, and energy in kJ/mol is not a wavelength in nm. Two steps are compulsory: divide by Avogadro’s number to get the energy of ONE photon, then use λ = hc/E, which runs INVERSELY — the minimum energy that will break the bond corresponds to the maximum wavelength, 242 nm.' },
    { id: 'mock4-a-025', topic: 'kinetics', q: 'Which statement about a catalyst is FALSE?', opts: ['it lowers the activation energy', 'it is regenerated unchanged', 'it speeds forward and reverse equally', 'it shifts equilibrium toward products'], a: 3, why: 'A catalyst does NOT shift equilibrium — it only helps the system reach equilibrium faster.' },
  ],
  partB: [
    {
      id: 'mock4-b-001',
      topic: 'thermo', title: 'B1 — Gibbs free energy and spontaneity',
      prompt: 'The contact process oxidises sulfur dioxide over a vanadium(V) oxide catalyst:<br>\\(\\ce{2SO2(g) + O2(g) -> 2SO3(g)}\\), ΔH° = −197.8 kJ/mol, ΔS° = −188 J/mol·K.',
      parts: [
        { q: '(a) Calculate ΔG° at 298 K and state whether the reaction is spontaneous.', a: 'ΔG° = ΔH° − TΔS° = −197.8 − 298(−0.188) = −197.8 + 56.0 = <b>−141.8 kJ/mol</b> → strongly spontaneous under standard conditions. Convert ΔS° from J to kJ first.' },
        { q: '(b) Estimate the temperature above which the reaction is no longer spontaneous.', a: 'ΔG° = 0 at T = ΔH°/ΔS° = 197800/188 = <b>1052 K (779 °C)</b>. Both terms are negative, so this is the (−,−) case: spontaneous BELOW the crossover, non-spontaneous above it.' },
        { q: '(c) Calculate K at 298 K, and explain why industry nevertheless runs the converter at about 700 K.', a: 'ln K = −ΔG°/RT = 141800/(8.314×298) = 57.2 → K ≈ <b>7×10²⁴</b> — essentially complete conversion at room temperature, on paper. In practice the 298 K rate is negligible: the reaction needs ~700 K and a V₂O₅ catalyst to run at a useful speed, accepting a lower (but still high) equilibrium yield. <span class="trap">Thermodynamics says how far, kinetics says how fast</span> — the same compromise as the Haber process.' },
      ],
    },
    {
      id: 'mock4-b-002',
      topic: 'kinetics', title: 'B2 — Arrhenius analysis',
      prompt: 'A reaction has k = 2.0×10⁻³ s⁻¹ at 300 K and k = 8.0×10⁻³ s⁻¹ at 320 K.',
      parts: [
        { q: '(a) Use the two-point Arrhenius equation to find Ea.', a: 'ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁): ln(4) = −(Ea/8.314)(1/320 − 1/300). 1.386 = −(Ea/8.314)(−2.08×10⁻⁴) → Ea = <b>5.5×10⁴ J/mol = 55 kJ/mol</b>.' },
        { q: '(b) Predict k at 340 K.', a: 'ln(k₃/k₁) = −(55000/8.314)(1/340 − 1/300) = −6615(−3.92×10⁻⁴) = 2.59 → k₃ = k₁e^{2.59} = 2.0×10⁻³ × 13.3 = <b>2.7×10⁻² s⁻¹</b>.' },
        { q: '(c) What does a larger Ea imply about temperature sensitivity?', a: 'A larger Ea means k changes more steeply with T — such reactions are much more temperature-sensitive.' },
      ],
    },
    {
      id: 'mock4-b-003',
      topic: 'acids', title: 'B3 — Titration curve of a weak acid',
      prompt: '25.00 mL of 0.100 M acetic acid (Ka = 1.8×10⁻⁵) is titrated with 0.100 M NaOH.',
      parts: [
        { q: '(a) Find the pH at the half-equivalence point.', a: 'At half-equivalence [HA] = [A⁻] → pH = pKa = <b>4.74</b>.' },
        { q: '(b) Find the pH at the equivalence point.', a: 'All acetic acid → acetate; total volume 50.0 mL, [A⁻] = 0.0500 M. Kb = Kw/Ka = 5.6×10⁻¹⁰; [OH⁻] = √(Kb·C) = √(5.6×10⁻¹⁰×0.0500) = 5.3×10⁻⁶ → pOH = 5.28 → <b>pH = 8.72</b> (basic).' },
        { q: '(c) Why is the equivalence-point pH above 7?', a: 'The acetate ion is the conjugate base of a weak acid; it hydrolyzes water to give OH⁻, making the solution basic at equivalence.' },
      ],
    },
    {
      id: 'mock4-b-004',
      topic: 'redox', title: 'B4 — Combining half-cells',
      prompt: 'E°(Ag⁺/Ag) = +0.80 V and E°(Fe³⁺/Fe²⁺) = +0.77 V.',
      parts: [
        { q: '(a) Predict the spontaneous reaction when the two couples are combined.', a: 'Ag⁺/Ag has the higher E°, so Ag⁺ is reduced and Fe²⁺ oxidized: \\(\\ce{Ag+ + Fe^2+ -> Ag + Fe^3+}\\), E°cell = 0.80 − 0.77 = <b>+0.03 V</b>.' },
        { q: '(b) Calculate K for the reaction at 298 K (n = 1).', a: 'log K = nE°/0.0592 = 0.03/0.0592 = 0.507 → K = <b>3.2</b> (only mildly product-favoured — the small E° gives a modest K).' },
        { q: '(c) How would raising [Fe³⁺] affect the cell potential?', a: 'Increasing a product concentration raises Q, so E = E° − (0.0592)log Q falls — the cell potential decreases.' },
      ],
    },
  ],
};
