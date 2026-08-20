// Mock Paper 1 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
// Not copied from any real exam; format/difficulty matched only.
import type { OlympiadPaper } from './bankOlympiad';

export const paper1: OlympiadPaper = {
  id: 'mock1',
  label: 'Mock Paper 1',
  blurb: 'A full-length practice contest — 25 multiple-choice (Part A) plus written problems (Part B), spanning the whole syllabus.',
  partA: [
    { id: 'mock1-a-001', tier: 3, topic: 'stoich', skill: 'stoich/empirical-formula', q: 'A compound is 26.7% C, 2.2% H, 71.1% O by mass. Its empirical formula is:', opts: ['CHO', 'C₂H₂O₄', 'CHO₂', 'CH₂O'], a: 2, why: 'Moles per 100 g: C 26.7/12.01 = 2.22, H 2.2/1.01 = 2.18, O 71.1/16.00 = 4.44 → ratio ≈ 1:1:2 → <b>CHO₂</b> (oxalic acid\'s empirical formula; its molecular formula is C₂H₂O₄).' , misconception: 'Percentage composition fixes only the RATIO of atoms; it can never distinguish CHO₂ from C₂H₂O₄, because both have identical mass percentages. Choosing the doubled formula answers "molecular" to a question that asked "empirical" — scaling a ratio up needs a separately measured molar mass, which this question does not give you.' },
    { id: 'mock1-a-002', topic: 'states', skill: 'states/gas-laws', q: 'A fixed mass of ideal gas is 2.0 L at 300 K and 1.0 atm. Its volume at 600 K and 2.0 atm is:', opts: ['1.0 L', '0.5 L', '4.0 L', '2.0 L'], a: 3, why: 'V₂ = V₁(P₁/P₂)(T₂/T₁) = 2.0(1/2)(600/300) = 2.0 L — the pressure doubling and temperature doubling cancel.' },
    { id: 'mock1-a-003', topic: 'thermo', skill: 'thermo/enthalpy', q: 'Complete combustion of 8.0 g of CH₄ (ΔH_c = −890 kJ/mol) releases:', opts: ['445 kJ', '890 kJ', '1780 kJ', '223 kJ'], a: 0, why: '8.0 g / 16 g·mol⁻¹ = 0.50 mol → 0.50 × 890 = 445 kJ.' },
    { id: 'mock1-a-004', topic: 'kinetics', skill: 'kinetics/integrated-rate', q: 'A first-order reaction has t₁/₂ = 10 min. The fraction of reactant left after 30 min is:', opts: ['1/2', '1/8', '1/4', '1/16'], a: 1, why: '30 min = 3 half-lives → (½)³ = 1/8 = 12.5%.' },
    { id: 'mock1-a-005', topic: 'equilibrium', skill: 'equilibrium/le-chatelier', q: 'For \\(\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}\\), increasing the total pressure shifts the equilibrium:', opts: ['toward reactants', 'no shift', 'toward products', 'depends on temperature'], a: 2, why: 'Higher pressure favours the side with fewer gas moles (4 → 2), i.e. toward NH₃.' },
    { id: 'mock1-a-006', tier: 3, topic: 'acids', skill: 'acids/buffers', q: 'A buffer solution is diluted tenfold with pure water. Its pH and its buffer capacity, respectively:', opts: ['both fall by a factor of ten exactly', 'both remain entirely unchanged', 'pH falls one unit; capacity holds steady', 'pH barely changes; capacity falls tenfold'], a: 3, why: 'Henderson–Hasselbalch depends on the RATIO [A⁻]/[HA], and dilution divides both by the same factor — so the pH barely moves. Capacity, by contrast, scales with the CONCENTRATION of the acid/base reserve — dilution leaves the moles alone but cuts the concentration tenfold. <b>The pH tells you where a buffer holds; the concentration tells you how hard it can hold there</b> — the same distinction as strong vs concentrated.' , misconception: 'The "tenfold dilution moves pH by one unit" rule belongs to strong acids, where [H⁺] is the concentration itself. A buffer’s pH is set by the RATIO [A⁻]/[HA], and dilution divides both terms alike, so the ratio and the pH survive; what does not survive is the reserve of acid and base per litre, which is the capacity.' },
    { id: 'mock1-a-007', topic: 'acids', skill: 'acids/buffers', q: 'A buffer contains equal concentrations of a weak acid (pKa 4.74) and its conjugate base. Its pH is:', opts: ['4.74', '7.00', '9.26', '2.37'], a: 0, why: 'Henderson–Hasselbalch: pH = pKa + log(1) = pKa = 4.74.' },
    { id: 'mock1-a-008', topic: 'equilibrium', skill: 'equilibrium/ksp', q: 'Ksp of AgCl is 1.8×10⁻¹⁰. Its molar solubility in pure water is about:', opts: ['1.8×10⁻¹⁰ M', '1.3×10⁻⁵ M', '9.0×10⁻¹¹ M', '4.2×10⁻⁵ M'], a: 1, why: 's = √Ksp = √(1.8×10⁻¹⁰) = 1.34×10⁻⁵ M.' },
    { id: 'mock1-a-009', tier: 3, topic: 'redox', skill: 'redox/balancing', q: 'In basic solution, \\(\\ce{CrO2- + ClO- -> CrO4^2- + Cl-}\\). In the balanced equation (smallest whole numbers), the coefficient of \\(\\ce{OH-}\\) is:', opts: ['6', '4', '2', '8'], a: 2, why: 'Half-reactions in base: \\(\\ce{CrO2- + 4OH- -> CrO4^2- + 2H2O + 3e-}\\) and \\(\\ce{ClO- + H2O + 2e- -> Cl- + 2OH-}\\). Balance the electrons (×2 and ×3) and add: 8 OH⁻ appear on the left but 6 are generated on the right, so <b>2 OH⁻</b> survive: \\(\\ce{2CrO2- + 3ClO- + 2OH- -> 2CrO4^2- + 3Cl- + H2O}\\). The 8 is the trap — it is the count before cancelling the hydroxide produced by the other half-reaction. Always cancel species appearing on both sides at the end.' , misconception: 'The 8 is the hydroxide count in the half-equations BEFORE adding them, not in the balanced equation. The chlorate(I) half-reaction generates 6 OH⁻ on the right, so only the net 2 survive on the left. A balanced equation must never show the same species on both sides — cancel first, then read off the coefficient.' },
    { id: 'mock1-a-010', topic: 'redox', skill: 'redox/oxidation-states', q: 'The oxidation number of chromium in \\(\\ce{Cr2O7^2-}\\) is:', opts: ['+6', '+3', '+7', '+12'], a: 0, why: '2x + 7(−2) = −2 → 2x = 12 → x = +6.' },
    { id: 'mock1-a-011', topic: 'atomic', skill: 'atomic/configuration', q: 'The number of unpaired electrons in a ground-state iron atom (Z = 26) is:', opts: ['2', '0', '6', '4'], a: 3, why: 'Fe = [Ar]3d⁶4s²; the 3d⁶ set has 4 unpaired electrons (Hund).' },
    { id: 'mock1-a-012', tier: 3, topic: 'atomic', skill: 'atomic/periodic-trends', q: 'Which of these has the largest first ionization energy: Al, Si, P, S?', opts: ['Al', 'Si', 'P', 'S'], a: 2, why: 'P (3p³, half-filled and extra-stable) exceeds S (3p⁴, which must pair an electron) despite S\'s higher nuclear charge — the same half-filled-subshell dip as N/O in period 2, one row down.' , misconception: 'First ionisation energy does not climb smoothly across a period; it steps back at every half-filled subshell. P is 3p³ with every orbital singly occupied, while S must place a fourth electron into an already-occupied 3p orbital and pays the pairing repulsion — so S sits below P despite the higher nuclear charge, exactly as O sits below N a row above.' },
    { id: 'mock1-a-013', topic: 'bonding', skill: 'bonding/polarity', q: 'Which molecule is polar?', opts: ['CO₂', 'NH₃', 'CCl₄', 'CH₄'], a: 1, why: 'NH₃ is trigonal pyramidal with a lone pair → net dipole; the others are symmetric and non-polar.' },
    { id: 'mock1-a-014', topic: 'bonding', skill: 'bonding/lewis-vsepr', q: 'The molecular geometry of \\(\\ce{SF4}\\) is:', opts: ['see-saw shaped', 'tetrahedral', 'square planar', 'trigonal pyramidal'], a: 0, why: 'AX₄E (5 electron domains, one lone pair) → see-saw.' },
    { id: 'mock1-a-015', topic: 'bonding', skill: 'bonding/hybridisation', q: 'The hybridization of carbon in formaldehyde, \\(\\ce{H2CO}\\), is:', opts: ['sp', 'sp³d', 'sp³', 'sp²'], a: 3, why: 'Three σ-domains around C (two C–H bonds plus one C=O double bond, counted once) → sp², trigonal planar. The remaining unhybridized p orbital forms the C=O π bond.' },
    { id: 'mock1-a-016', topic: 'states', skill: 'states/imf', q: 'Which substance has the highest normal boiling point?', opts: ['CH₄', 'H₂S', 'H₂O', 'CO₂'], a: 2, why: 'H₂O has strong hydrogen bonding; the others rely on weaker dispersion/dipole forces.' },
    { id: 'mock1-a-017', topic: 'organic', q: 'The number of structural (constitutional) isomers of \\(\\ce{C4H10}\\) is:', opts: ['1', '2', '3', '4'], a: 1, why: 'n-butane and isobutane (2-methylpropane) — two isomers.' },
    { id: 'mock1-a-018', topic: 'organic', skill: 'organic/mechanisms', q: 'The major product of \\(\\ce{CH2=CH2 + Br2}\\) is:', opts: ['1,2-dibromoethane', 'bromoethane', 'ethene dibromide radical', '1,1-dibromoethane'], a: 0, why: 'Electrophilic anti-addition of Br₂ across the double bond gives 1,2-dibromoethane.' },
    { id: 'mock1-a-019', topic: 'descriptive', skill: 'descriptive/qualitative-analysis', q: 'In the brown-ring test, a solution is treated with \\(\\ce{FeSO4}\\) and concentrated \\(\\ce{H2SO4}\\) is poured carefully down the side of the tube. A brown ring at the interface confirms:', opts: ['\\(\\ce{SO4^2-}\\)', '\\(\\ce{CO3^2-}\\)', '\\(\\ce{Cl-}\\)', '\\(\\ce{NO3-}\\)'], a: 3, why: 'Concentrated acid reduces nitrate to NO, which is captured by excess Fe²⁺ as the brown nitrosyl complex [Fe(H₂O)₅NO]²⁺. The ring forms at the interface because that is where the acid is concentrated enough to do the reduction but the Fe²⁺ has not yet been consumed — mixing the layers destroys it.' },
    { id: 'mock1-a-020', topic: 'atomic', skill: 'descriptive/nuclear', q: 'Alpha decay of \\(\\ce{^{238}_{92}U}\\) produces:', opts: ['\\(\\ce{^{239}_{92}U}\\)', '\\(\\ce{^{238}_{93}Np}\\)', '\\(\\ce{^{234}_{92}U}\\)', '\\(\\ce{^{234}_{90}Th}\\)'], a: 3, why: 'An α particle (⁴₂He) lowers Z by 2 and A by 4 → ²³⁴₉₀Th.' },
    { id: 'mock1-a-021', topic: 'acids', skill: 'acids/indicators', q: 'The most suitable indicator for titrating a weak acid with a strong base is:', opts: ['phenolphthalein', 'methyl orange', 'bromophenol blue', 'methyl red'], a: 0, why: 'The equivalence point is basic (pH > 7), matching phenolphthalein\'s range (~8.2–10).' },
    { id: 'mock1-a-022', topic: 'states', skill: 'states/colligative', q: 'For equal molality, which solute gives the greatest freezing-point depression?', opts: ['glucose', 'CaCl₂', 'NaCl', 'urea'], a: 1, why: 'ΔTf ∝ i·m; CaCl₂ gives i = 3 ions, the most of these.' },
    { id: 'mock1-a-023', topic: 'thermo', skill: 'thermo/entropy', q: 'The sign of ΔS for the process \\(\\ce{2NO2(g) -> N2O4(g)}\\) is:', opts: ['positive', 'zero', 'negative', 'undefined'], a: 2, why: '2 mol gas → 1 mol gas decreases disorder, so ΔS < 0.' },
    { id: 'mock1-a-024', tier: 3, topic: 'thermo', skill: 'thermo/state-functions', q: 'For \\(\\ce{2CO(g) + O2(g) -> 2CO2(g)}\\) at 298 K, the quantity ΔH − ΔU is about:', opts: ['−7.4 kJ', '+2.5 kJ', 'zero', '−2.5 kJ'], a: 3, why: 'ΔH = ΔU + Δn(gas)RT. Only GAS moles count: Δn = 2 − 3 = −1, so ΔH − ΔU = (−1)(8.314)(298) = −2478 J ≈ −2.5 kJ. Gas moles shrink, so the surroundings do work on the system and ΔH lies below ΔU.' , misconception: 'Δn in ΔH = ΔU + ΔnRT is the NET change in moles of GAS, 2 − 3 = −1 — not the number of gas moles involved, and not the total moles of everything. The −7.4 kJ answer is 3RT: it comes from using the three reactant gas moles instead of the change of one. Condensed phases never enter the count.' },
    { id: 'mock1-a-025', topic: 'atomic', skill: 'atomic/quantum-numbers', q: 'The maximum number of electrons that can occupy the n = 3 shell is:', opts: ['18', '8', '6', '32'], a: 0, why: 'Capacity = 2n² = 2(3²) = 18.' },
  ],
  partB: [
    {
      id: 'mock1-b-001',
      topic: 'stoich', title: 'B1 — Gas stoichiometry with a limiting reagent',
      prompt: '2.00 g of magnesium is dropped into 50.0 mL of 1.00 M HCl. \\(\\ce{Mg + 2HCl -> MgCl2 + H2}\\).',
      parts: [
        { q: '(a) Identify the limiting reagent.', a: 'n(Mg) = 2.00/24.31 = 0.0823 mol; n(HCl) = 1.00 × 0.0500 = 0.0500 mol. HCl needs 2 per Mg, so it can react with only 0.0250 mol Mg → <b>HCl is limiting</b>.' },
        { q: '(b) Volume of H₂ produced at STP (22.4 L/mol).', a: 'n(H₂) = ½ n(HCl) = 0.0250 mol → V = 0.0250 × 22.4 = <b>0.560 L</b>.' },
        { q: '(c) Mass of magnesium left unreacted.', a: 'Mg consumed = 0.0250 mol × 24.31 = 0.608 g → left over = 2.00 − 0.608 = <b>1.39 g</b>.' },
      ],
    },
    {
      id: 'mock1-b-002',
      topic: 'thermo', title: 'B2 — Hess\'s law',
      prompt: 'Given: (1) \\(\\ce{C(s) + O2 -> CO2}\\), ΔH = −393.5 kJ; (2) \\(\\ce{CO + 1/2 O2 -> CO2}\\), ΔH = −283.0 kJ.',
      parts: [
        { q: '(a) Find ΔH for \\(\\ce{C(s) + 1/2 O2 -> CO}\\).', a: 'Target = (1) − (2): ΔH = −393.5 − (−283.0) = <b>−110.5 kJ/mol</b>.' },
        { q: '(b) Is the formation of CO from its elements exothermic? Explain.', a: 'Yes — ΔH°f(CO) = −110.5 kJ/mol < 0, so heat is released when CO forms from C and O₂.' },
        { q: '(c) Why can ΔH°f(CO) not be measured directly by combustion?', a: 'Burning carbon in O₂ inevitably makes some CO₂ as well, so pure CO cannot be isolated as the sole product — Hess\'s law lets us obtain it indirectly from measurable combustion enthalpies.' },
      ],
    },
    {
      id: 'mock1-b-003',
      topic: 'equilibrium', title: 'B3 — ICE table and the reaction quotient',
      prompt: 'For \\(\\ce{H2(g) + I2(g) <=> 2HI(g)}\\), Kc = 50.0 at 445 °C. 1.00 mol H₂ and 1.00 mol I₂ are placed in a 1.00 L flask.',
      parts: [
        { q: '(a) Set up the ICE table and solve for [HI] at equilibrium.', a: 'Let x react: [H₂]=[I₂]=1−x, [HI]=2x. Kc = (2x)²/((1−x)²) = 50.0 → 2x/(1−x) = √50 = 7.07 → x = 0.780. So [HI] = <b>1.56 M</b> ([H₂]=[I₂]=0.220 M).' },
        { q: '(b) If 0.50 mol of HI is now added, which way does the reaction shift?', a: 'Q rises above Kc (extra product), so the reaction shifts <b>toward reactants</b> (left) until Q = Kc again.' },
        { q: '(c) State the effect of raising temperature, given the forward reaction is slightly endothermic.', a: 'For an endothermic forward reaction, higher T increases Kc, shifting further toward HI (van\'t Hoff / Le Chatelier).' },
      ],
    },
    {
      id: 'mock1-b-004',
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
