// Mock Paper 4 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
import type { OlympiadPaper } from './bankOlympiad';

export const paper4: OlympiadPaper = {
  id: 'mock4',
  label: 'Mock Paper 4',
  blurb: 'Fourth full-length practice contest — leans a little harder, with more multi-step reasoning.',
  partA: [
    { q: 'A 500. mL solution contains 5.85 g of \\(\\ce{NaCl}\\) (M = 58.5). Its molarity is:', opts: ['0.10 M', '0.20 M', '0.50 M', '1.0 M'], a: 1, why: 'n = 5.85/58.5 = 0.100 mol in 0.500 L → 0.200 M.' },
    { q: 'Which gas effuses fastest through a small hole?', opts: ['\\(\\ce{O2}\\)', '\\(\\ce{CO2}\\)', '\\(\\ce{He}\\)', '\\(\\ce{Cl2}\\)'], a: 2, why: 'Graham\'s law: rate ∝ 1/√M; He (M = 4) is lightest, so it effuses fastest.' },
    { q: 'The bond enthalpies (kJ/mol) are H–H 436, Cl–Cl 242, H–Cl 431. ΔH for \\(\\ce{H2 + Cl2 -> 2HCl}\\) is:', opts: ['−184 kJ', '−247 kJ', '+184 kJ', '−92 kJ'], a: 0, why: 'ΔH = Σbonds broken − Σbonds formed = (436+242) − 2(431) = 678 − 862 = −184 kJ.' },
    { q: 'The rate constant of a reaction roughly doubles for a 10 °C rise. This is explained by:', opts: ['a larger ΔH', 'more molecules exceeding Ea (Arrhenius/Boltzmann)', 'a change in K', 'lower activation energy'], a: 1, why: 'Higher T shifts the Maxwell–Boltzmann distribution so a larger fraction of collisions exceed Ea → k rises.' },
    { q: 'A 1.0 L flask at equilibrium holds 0.20 mol \\(\\ce{PCl5}\\), 0.10 mol \\(\\ce{PCl3}\\), 0.10 mol \\(\\ce{Cl2}\\) for \\(\\ce{PCl5 <=> PCl3 + Cl2}\\). Kc is:', opts: ['0.050', '0.20', '2.0', '0.10'], a: 0, why: 'Kc = [PCl₃][Cl₂]/[PCl₅] = (0.10)(0.10)/0.20 = 0.050.' },
    { q: 'Which is the strongest acid?', opts: ['\\(\\ce{HF}\\) (Ka=6.6×10⁻⁴)', '\\(\\ce{CH3COOH}\\) (Ka=1.8×10⁻⁵)', '\\(\\ce{HCN}\\) (Ka=6.2×10⁻¹⁰)', '\\(\\ce{H2CO3}\\) (Ka=4.3×10⁻⁷)'], a: 0, why: 'The largest Ka is the strongest acid → HF.' },
    { q: '50.0 mL of 0.10 M HCl is mixed with 50.0 mL of 0.10 M NaOH. The resulting pH is:', opts: ['1.0', '7.0', '13.0', '3.5'], a: 1, why: 'Equal moles of strong acid and base exactly neutralize → neutral solution, pH = 7.' },
    { q: 'Which addition would dissolve more solid \\(\\ce{CaCO3}\\)?', opts: ['add \\(\\ce{Na2CO3}\\)', 'add \\(\\ce{HCl}\\)', 'add \\(\\ce{CaCl2}\\)', 'lower the temperature'], a: 1, why: 'Acid removes CO₃²⁻ (as CO₂ + H₂O), shifting \\(\\ce{CaCO3 <=> Ca^2+ + CO3^2-}\\) right → more dissolves.' },
    { q: 'In the electrolysis of aqueous \\(\\ce{NaCl}\\) (brine), the product at the cathode is:', opts: ['\\(\\ce{Cl2}\\)', '\\(\\ce{H2}\\)', '\\(\\ce{Na}\\)', '\\(\\ce{O2}\\)'], a: 1, why: 'Water is reduced in preference to Na⁺: \\(\\ce{2H2O + 2e- -> H2 + 2OH-}\\).' },
    { q: 'Balancing \\(\\ce{MnO4- + Fe^2+ -> Mn^2+ + Fe^3+}\\) in acid, the ratio of \\(\\ce{MnO4-}\\) to \\(\\ce{Fe^2+}\\) is:', opts: ['1:1', '1:5', '5:1', '2:3'], a: 1, why: 'Mn gains 5 e⁻, Fe loses 1 e⁻; balancing electrons needs 5 Fe²⁺ per MnO₄⁻ → 1:5.' },
    { q: 'Which element has the highest second ionization energy relative to its first?', opts: ['Mg', 'Na', 'Al', 'Si'], a: 1, why: 'Na⁺ has a noble-gas configuration; removing a second electron breaks it, so IE₂ ≫ IE₁ for Na.' },
    { q: 'Which species is diamagnetic?', opts: ['\\(\\ce{O2}\\)', '\\(\\ce{NO}\\)', '\\(\\ce{N2}\\)', '\\(\\ce{O2^-}\\)'], a: 2, why: 'N₂ has all electrons paired (bond order 3, no unpaired e⁻); O₂ and NO are paramagnetic.' },
    { q: 'The number of lone pairs on the central atom of \\(\\ce{ClF3}\\) is:', opts: ['0', '1', '2', '3'], a: 2, why: 'Cl has 7 valence e⁻; 3 bonds use 3, leaving 2 lone pairs (AX₃E₂, T-shaped).' },
    { q: 'Which has the greatest lattice energy?', opts: ['\\(\\ce{NaCl}\\)', '\\(\\ce{KCl}\\)', '\\(\\ce{MgO}\\)', '\\(\\ce{CaO}\\)'], a: 2, why: 'Lattice energy ∝ (charges)/(distance); MgO has 2+/2− ions and small radii → the largest.' },
    { q: 'A solution conducts electricity well and turns litmus red. It is most likely:', opts: ['aqueous ethanol', 'aqueous glucose', 'dilute HCl', 'pure water'], a: 2, why: 'Strong electrolyte + acidic → a strong acid such as dilute HCl.' },
    { q: 'How many chirality (stereo) centres are in 2,3-dibromobutane, \\(\\ce{CH3CHBrCHBrCH3}\\)?', opts: ['0', '1', '2', '4'], a: 2, why: 'Both C2 and C3 carry four different groups → 2 stereocentres (giving meso and d/l forms).' },
    { q: 'Oxidation of ethanol with a limited amount of acidified dichromate gives:', opts: ['ethene', 'ethanoic acid', 'ethanal (acetaldehyde)', 'ethane'], a: 2, why: 'Controlled/partial oxidation of a 1° alcohol stops at the aldehyde, ethanal.' },
    { q: 'A gas turns limewater milky. It is:', opts: ['\\(\\ce{H2}\\)', '\\(\\ce{O2}\\)', '\\(\\ce{CO2}\\)', '\\(\\ce{NH3}\\)'], a: 2, why: 'CO₂ forms insoluble CaCO₃ with limewater → milky suspension.' },
    { q: 'A nuclide emits a positron. The daughter has:', opts: ['Z+1, same A', 'Z−1, same A', 'Z−2, A−4', 'same Z and A'], a: 1, why: 'Positron (β⁺) emission converts a proton to a neutron → Z falls by 1, A unchanged.' },
    { q: 'Repeating an extraction with three small solvent portions instead of one large portion:', opts: ['extracts less', 'extracts more', 'extracts the same', 'only saves time'], a: 1, why: 'Multiple small extractions leave a smaller fraction \\([V_{aq}/(V_{aq}+KV_{org})]^n\\) → more solute recovered.' },
    { q: 'The van\'t Hoff factor i for \\(\\ce{K2SO4}\\) (fully dissociated) is:', opts: ['1', '2', '3', '4'], a: 2, why: 'K₂SO₄ → 2 K⁺ + SO₄²⁻ = 3 particles.' },
    { q: 'For \\(\\ce{A -> B}\\), ΔH = −40 kJ and ΔS = −120 J/K. Above what temperature is the reaction non-spontaneous?', opts: ['300 K', '333 K', '360 K', 'always spontaneous'], a: 1, why: 'ΔG = 0 at T = ΔH/ΔS = 40000/120 = 333 K; above this ΔG > 0 (non-spontaneous).' },
    { q: 'The equilibrium constant K and standard cell potential E° are related by:', opts: ['ΔG° = −nFE° = −RT ln K', 'K = nFE°', 'E° = RT/K', 'K = E°/n'], a: 0, why: 'Both equal −ΔG°: −nFE° = −RT ln K links the electrochemical and equilibrium descriptions.' },
    { q: 'A photon must have at least 494 kJ/mol of energy to break a Cl–Cl bond. The longest wavelength that works is closest to:', opts: ['242 nm', '494 nm', '700 nm', '120 nm'], a: 0, why: 'E per photon = 494000/6.02×10²³ = 8.2×10⁻¹⁹ J; λ = hc/E = (6.63×10⁻³⁴·3.0×10⁸)/8.2×10⁻¹⁹ ≈ 2.4×10⁻⁷ m = 242 nm.' },
    { q: 'Which statement about a catalyst is FALSE?', opts: ['it lowers Ea', 'it is regenerated', 'it shifts the equilibrium toward products', 'it speeds forward and reverse equally'], a: 2, why: 'A catalyst does NOT shift equilibrium — it only helps the system reach equilibrium faster.' },
  ],
  partB: [
    {
      topic: 'thermo', title: 'B1 — Gibbs free energy and spontaneity',
      prompt: 'For \\(\\ce{N2O4(g) -> 2NO2(g)}\\): ΔH° = +57.2 kJ/mol, ΔS° = +176 J/mol·K.',
      parts: [
        { q: '(a) Calculate ΔG° at 298 K and state whether the reaction is spontaneous.', a: 'ΔG° = 57.2 − 298(0.176) = 57.2 − 52.4 = <b>+4.8 kJ/mol</b> → non-spontaneous under standard conditions at 298 K.' },
        { q: '(b) Estimate the temperature at which ΔG° = 0.', a: 'T = ΔH°/ΔS° = 57200/176 = <b>325 K (52 °C)</b>; above this the dissociation becomes spontaneous.' },
        { q: '(c) Relate ΔG° at 298 K to K.', a: 'ΔG° = −RT ln K → ln K = −4800/(8.314×298) = −1.94 → K = <b>0.14</b> (products slightly disfavoured, consistent with ΔG° > 0).' },
      ],
    },
    {
      topic: 'kinetics', title: 'B2 — Arrhenius analysis',
      prompt: 'A reaction has k = 2.0×10⁻³ s⁻¹ at 300 K and k = 8.0×10⁻³ s⁻¹ at 320 K.',
      parts: [
        { q: '(a) Use the two-point Arrhenius equation to find Ea.', a: 'ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁): ln(4) = −(Ea/8.314)(1/320 − 1/300). 1.386 = −(Ea/8.314)(−2.08×10⁻⁴) → Ea = <b>5.5×10⁴ J/mol = 55 kJ/mol</b>.' },
        { q: '(b) Predict k at 340 K.', a: 'ln(k₃/k₁) = −(55000/8.314)(1/340 − 1/300) = −6615(−3.92×10⁻⁴) = 2.59 → k₃ = k₁e^{2.59} = 2.0×10⁻³ × 13.3 = <b>2.7×10⁻² s⁻¹</b>.' },
        { q: '(c) What does a larger Ea imply about temperature sensitivity?', a: 'A larger Ea means k changes more steeply with T — such reactions are much more temperature-sensitive.' },
      ],
    },
    {
      topic: 'acids', title: 'B3 — Titration curve of a weak acid',
      prompt: '25.00 mL of 0.100 M acetic acid (Ka = 1.8×10⁻⁵) is titrated with 0.100 M NaOH.',
      parts: [
        { q: '(a) Find the pH at the half-equivalence point.', a: 'At half-equivalence [HA] = [A⁻] → pH = pKa = <b>4.74</b>.' },
        { q: '(b) Find the pH at the equivalence point.', a: 'All acetic acid → acetate; total volume 50.0 mL, [A⁻] = 0.0500 M. Kb = Kw/Ka = 5.6×10⁻¹⁰; [OH⁻] = √(Kb·C) = √(5.6×10⁻¹⁰×0.0500) = 5.3×10⁻⁶ → pOH = 5.28 → <b>pH = 8.72</b> (basic).' },
        { q: '(c) Why is the equivalence-point pH above 7?', a: 'The acetate ion is the conjugate base of a weak acid; it hydrolyzes water to give OH⁻, making the solution basic at equivalence.' },
      ],
    },
    {
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
