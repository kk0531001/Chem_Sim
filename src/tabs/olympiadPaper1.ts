// Mock Paper 1 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
// Not copied from any real exam; format/difficulty matched only.
import type { OlympiadPaper } from './bankOlympiad';

export const paper1: OlympiadPaper = {
  id: 'mock1',
  label: 'Mock Paper 1',
  blurb: 'A full-length practice contest — 25 multiple-choice (Part A) plus written problems (Part B), spanning the whole syllabus.',
  partA: [
    { q: 'A compound is 40.0% C, 6.7% H, 53.3% O by mass. Its empirical formula is:', opts: ['CHO', 'CH₂O', 'C₂H₄O', 'CH₄O'], a: 1, why: 'Moles: C 40/12=3.33, H 6.7/1=6.7, O 53.3/16=3.33 → 1:2:1 → CH₂O.' },
    { q: 'A fixed mass of ideal gas is 2.0 L at 300 K and 1.0 atm. Its volume at 600 K and 2.0 atm is:', opts: ['1.0 L', '2.0 L', '4.0 L', '0.5 L'], a: 1, why: 'V₂ = V₁(P₁/P₂)(T₂/T₁) = 2.0(1/2)(600/300) = 2.0 L — the pressure doubling and temperature doubling cancel.' },
    { q: 'Complete combustion of 8.0 g of CH₄ (ΔH_c = −890 kJ/mol) releases:', opts: ['890 kJ', '445 kJ', '1780 kJ', '223 kJ'], a: 1, why: '8.0 g / 16 g·mol⁻¹ = 0.50 mol → 0.50 × 890 = 445 kJ.' },
    { q: 'A first-order reaction has t₁/₂ = 10 min. The fraction of reactant left after 30 min is:', opts: ['1/2', '1/4', '1/8', '1/16'], a: 2, why: '30 min = 3 half-lives → (½)³ = 1/8 = 12.5%.' },
    { q: 'For \\(\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}\\), increasing the total pressure shifts the equilibrium:', opts: ['toward reactants', 'toward products', 'no shift', 'depends on temperature'], a: 1, why: 'Higher pressure favours the side with fewer gas moles (4 → 2), i.e. toward NH₃.' },
    { q: 'The pH of 0.010 M HCl (a strong acid) is:', opts: ['1.0', '2.0', '0.010', '12.0'], a: 1, why: '[H⁺] = 0.010 M → pH = −log(10⁻²) = 2.0.' },
    { q: 'A buffer contains equal concentrations of a weak acid (pKa 4.74) and its conjugate base. Its pH is:', opts: ['7.00', '4.74', '9.26', '2.37'], a: 1, why: 'Henderson–Hasselbalch: pH = pKa + log(1) = pKa = 4.74.' },
    { q: 'Ksp of AgCl is 1.8×10⁻¹⁰. Its molar solubility in pure water is about:', opts: ['1.8×10⁻¹⁰ M', '1.3×10⁻⁵ M', '9.0×10⁻¹¹ M', '4.2×10⁻⁵ M'], a: 1, why: 's = √Ksp = √(1.8×10⁻¹⁰) = 1.34×10⁻⁵ M.' },
    { q: 'For a Zn/Cu galvanic cell, E°(Zn²⁺/Zn) = −0.76 V and E°(Cu²⁺/Cu) = +0.34 V. The standard cell potential is:', opts: ['0.42 V', '1.10 V', '−1.10 V', '0.34 V'], a: 1, why: 'E°cell = E°cathode − E°anode = 0.34 − (−0.76) = 1.10 V.' },
    { q: 'The oxidation number of chromium in \\(\\ce{Cr2O7^2-}\\) is:', opts: ['+3', '+6', '+7', '+12'], a: 1, why: '2x + 7(−2) = −2 → 2x = 12 → x = +6.' },
    { q: 'The number of unpaired electrons in a ground-state iron atom (Z = 26) is:', opts: ['2', '4', '6', '0'], a: 1, why: 'Fe = [Ar]3d⁶4s²; the 3d⁶ set has 4 unpaired electrons (Hund).' },
    { q: 'Which of these has the largest first ionization energy: Na, Mg, Al, Si?', opts: ['Na', 'Mg', 'Al', 'Si'], a: 3, why: 'IE rises across the period (with Al < Mg dip); Si is farthest right here, so highest.' },
    { q: 'Which molecule is polar?', opts: ['CO₂', 'CCl₄', 'NH₃', 'CH₄'], a: 2, why: 'NH₃ is trigonal pyramidal with a lone pair → net dipole; the others are symmetric and non-polar.' },
    { q: 'The molecular geometry of \\(\\ce{SF4}\\) is:', opts: ['tetrahedral', 'see-saw', 'square planar', 'trigonal pyramidal'], a: 1, why: 'AX₄E (5 electron domains, one lone pair) → see-saw.' },
    { q: 'The hybridization of carbon in \\(\\ce{CO2}\\) is:', opts: ['sp', 'sp²', 'sp³', 'sp³d'], a: 0, why: 'Two σ bonds and no lone pairs on C (2 electron domains) → sp.' },
    { q: 'Which substance has the highest normal boiling point?', opts: ['CH₄', 'H₂S', 'CO₂', 'H₂O'], a: 3, why: 'H₂O has strong hydrogen bonding; the others rely on weaker dispersion/dipole forces.' },
    { q: 'The number of structural (constitutional) isomers of \\(\\ce{C4H10}\\) is:', opts: ['1', '2', '3', '4'], a: 1, why: 'n-butane and isobutane (2-methylpropane) — two isomers.' },
    { q: 'The major product of \\(\\ce{CH2=CH2 + Br2}\\) is:', opts: ['bromoethane', '1,2-dibromoethane', 'ethene dibromide radical', '1,1-dibromoethane'], a: 1, why: 'Electrophilic anti-addition of Br₂ across the double bond gives 1,2-dibromoethane.' },
    { q: 'The characteristic flame-test colour of potassium salts is:', opts: ['yellow', 'lilac (violet)', 'green', 'crimson'], a: 1, why: 'K⁺ gives a lilac/violet flame (best seen through blue cobalt glass to filter sodium\'s yellow).' },
    { q: 'Alpha decay of \\(\\ce{^{238}_{92}U}\\) produces:', opts: ['\\(\\ce{^{234}_{90}Th}\\)', '\\(\\ce{^{238}_{93}Np}\\)', '\\(\\ce{^{234}_{92}U}\\)', '\\(\\ce{^{239}_{92}U}\\)'], a: 0, why: 'An α particle (⁴₂He) lowers Z by 2 and A by 4 → ²³⁴₉₀Th.' },
    { q: 'The most suitable indicator for titrating a weak acid with a strong base is:', opts: ['methyl orange', 'phenolphthalein', 'bromophenol blue', 'methyl red'], a: 1, why: 'The equivalence point is basic (pH > 7), matching phenolphthalein\'s range (~8.2–10).' },
    { q: 'For equal molality, which solute gives the greatest freezing-point depression?', opts: ['glucose', 'NaCl', 'CaCl₂', 'urea'], a: 2, why: 'ΔTf ∝ i·m; CaCl₂ gives i = 3 ions, the most of these.' },
    { q: 'The sign of ΔS for the process \\(\\ce{2NO2(g) -> N2O4(g)}\\) is:', opts: ['positive', 'negative', 'zero', 'undefined'], a: 1, why: '2 mol gas → 1 mol gas decreases disorder, so ΔS < 0.' },
    { q: 'A reaction is spontaneous at all temperatures when:', opts: ['ΔH > 0, ΔS > 0', 'ΔH < 0, ΔS > 0', 'ΔH < 0, ΔS < 0', 'ΔH > 0, ΔS < 0'], a: 1, why: 'ΔG = ΔH − TΔS is negative at every T only when ΔH < 0 and ΔS > 0.' },
    { q: 'The maximum number of electrons that can occupy the n = 3 shell is:', opts: ['6', '8', '18', '32'], a: 2, why: 'Capacity = 2n² = 2(3²) = 18.' },
  ],
  partB: [
    {
      topic: 'stoich', title: 'B1 — Gas stoichiometry with a limiting reagent',
      prompt: '2.00 g of magnesium is dropped into 50.0 mL of 1.00 M HCl. \\(\\ce{Mg + 2HCl -> MgCl2 + H2}\\).',
      parts: [
        { q: '(a) Identify the limiting reagent.', a: 'n(Mg) = 2.00/24.31 = 0.0823 mol; n(HCl) = 1.00 × 0.0500 = 0.0500 mol. HCl needs 2 per Mg, so it can react with only 0.0250 mol Mg → <b>HCl is limiting</b>.' },
        { q: '(b) Volume of H₂ produced at STP (22.4 L/mol).', a: 'n(H₂) = ½ n(HCl) = 0.0250 mol → V = 0.0250 × 22.4 = <b>0.560 L</b>.' },
        { q: '(c) Mass of magnesium left unreacted.', a: 'Mg consumed = 0.0250 mol × 24.31 = 0.608 g → left over = 2.00 − 0.608 = <b>1.39 g</b>.' },
      ],
    },
    {
      topic: 'thermo', title: 'B2 — Hess\'s law',
      prompt: 'Given: (1) \\(\\ce{C(s) + O2 -> CO2}\\), ΔH = −393.5 kJ; (2) \\(\\ce{CO + 1/2 O2 -> CO2}\\), ΔH = −283.0 kJ.',
      parts: [
        { q: '(a) Find ΔH for \\(\\ce{C(s) + 1/2 O2 -> CO}\\).', a: 'Target = (1) − (2): ΔH = −393.5 − (−283.0) = <b>−110.5 kJ/mol</b>.' },
        { q: '(b) Is the formation of CO from its elements exothermic? Explain.', a: 'Yes — ΔH°f(CO) = −110.5 kJ/mol < 0, so heat is released when CO forms from C and O₂.' },
        { q: '(c) Why can ΔH°f(CO) not be measured directly by combustion?', a: 'Burning carbon in O₂ inevitably makes some CO₂ as well, so pure CO cannot be isolated as the sole product — Hess\'s law lets us obtain it indirectly from measurable combustion enthalpies.' },
      ],
    },
    {
      topic: 'equilibrium', title: 'B3 — ICE table and the reaction quotient',
      prompt: 'For \\(\\ce{H2(g) + I2(g) <=> 2HI(g)}\\), Kc = 50.0 at 445 °C. 1.00 mol H₂ and 1.00 mol I₂ are placed in a 1.00 L flask.',
      parts: [
        { q: '(a) Set up the ICE table and solve for [HI] at equilibrium.', a: 'Let x react: [H₂]=[I₂]=1−x, [HI]=2x. Kc = (2x)²/((1−x)²) = 50.0 → 2x/(1−x) = √50 = 7.07 → x = 0.780. So [HI] = <b>1.56 M</b> ([H₂]=[I₂]=0.220 M).' },
        { q: '(b) If 0.50 mol of HI is now added, which way does the reaction shift?', a: 'Q rises above Kc (extra product), so the reaction shifts <b>toward reactants</b> (left) until Q = Kc again.' },
        { q: '(c) State the effect of raising temperature, given the forward reaction is slightly endothermic.', a: 'For an endothermic forward reaction, higher T increases Kc, shifting further toward HI (van\'t Hoff / Le Chatelier).' },
      ],
    },
    {
      topic: 'redox', title: 'B4 — Galvanic cell and the Nernst equation',
      prompt: 'A cell is built from \\(\\ce{Zn|Zn^2+(0.10 M)||Cu^2+(1.0 M)|Cu}\\). E°(Zn²⁺/Zn) = −0.76 V, E°(Cu²⁺/Cu) = +0.34 V.',
      parts: [
        { q: '(a) Write the overall cell reaction and E°cell.', a: '\\(\\ce{Zn + Cu^2+ -> Zn^2+ + Cu}\\); E°cell = 0.34 − (−0.76) = <b>+1.10 V</b> (spontaneous).' },
        { q: '(b) Calculate the cell potential at these concentrations (n = 2).', a: 'Q = [Zn²⁺]/[Cu²⁺] = 0.10/1.0 = 0.10. E = 1.10 − (0.0592/2)log(0.10) = 1.10 + 0.0296 = <b>+1.13 V</b>.' },
        { q: '(c) As the cell discharges, how do E and Q change?', a: 'Zn²⁺ builds up and Cu²⁺ is consumed, so Q rises; E falls, reaching 0 at equilibrium (the cell is "dead").' },
      ],
    },
  ],
};
