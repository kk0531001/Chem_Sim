// Mock Paper 3 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
import type { OlympiadPaper } from './bankOlympiad';

export const paper3: OlympiadPaper = {
  id: 'mock3',
  label: 'Mock Paper 3',
  blurb: 'Third full-length practice contest — a fresh 25 multiple-choice set and written problems.',
  partA: [
    { q: 'The molar mass of \\(\\ce{Ca(NO3)2}\\) is closest to:', opts: ['102 g/mol', '150 g/mol', '164 g/mol', '188 g/mol'], a: 2, why: '40.08 + 2(14.01 + 3×16.00) = 40.08 + 2(62.01) = 164.1 g/mol.' },
    { q: 'A 3.0 L sample of gas at 2.0 atm is compressed isothermally to 1.0 L. The new pressure is:', opts: ['0.67 atm', '3.0 atm', '6.0 atm', '1.5 atm'], a: 2, why: 'Boyle: P₂ = P₁V₁/V₂ = 2.0×3.0/1.0 = 6.0 atm.' },
    { q: 'The enthalpy of neutralization of a strong acid by a strong base is about −57 kJ/mol because:', opts: ['salts are formed', 'the same reaction \\(\\ce{H+ + OH- -> H2O}\\) always occurs', 'water evaporates', 'ions are coloured'], a: 1, why: 'For strong acid + strong base the net ionic reaction is always \\(\\ce{H+ + OH- -> H2O}\\), giving a nearly constant ΔH.' },
    { q: 'The activation energy of a reaction is lowered by adding a catalyst. The equilibrium constant K:', opts: ['increases', 'decreases', 'is unchanged', 'becomes 1'], a: 2, why: 'A catalyst speeds both directions equally; it changes rate, not K or the position of equilibrium.' },
    { q: 'For \\(\\ce{2SO2 + O2 <=> 2SO3}\\), Kc = 100. What is Kc for \\(\\ce{2SO3 <=> 2SO2 + O2}\\)?', opts: ['100', '0.01', '10', '−100'], a: 1, why: 'Reversing a reaction inverts K: 1/100 = 0.01.' },
    { q: 'The pOH of a 0.010 M \\(\\ce{NaOH}\\) solution is:', opts: ['2.0', '12.0', '1.0', '7.0'], a: 0, why: '[OH⁻] = 0.010 M → pOH = 2.0 (and pH = 12.0).' },
    { q: 'At the equivalence point of a strong-acid/strong-base titration, the pH is:', opts: ['< 7', '= 7', '> 7', 'exactly 0'], a: 1, why: 'The salt formed (e.g. NaCl) is neutral, so pH = 7 at 25 °C.' },
    { q: 'The molar solubility of \\(\\ce{Mg(OH)2}\\) (Ksp = 5.6×10⁻¹²) is s where:', opts: ['Ksp = s²', 'Ksp = 4s³', 'Ksp = 27s⁴', 'Ksp = s'], a: 1, why: '\\(\\ce{Mg(OH)2 <=> Mg^2+ + 2OH-}\\): Ksp = (s)(2s)² = 4s³.' },
    { q: 'Which metal will displace copper from \\(\\ce{CuSO4}\\) solution?', opts: ['Ag', 'Au', 'Zn', 'Pt'], a: 2, why: 'Zn is more reactive (more negative E°) than Cu, so it reduces Cu²⁺ to Cu.' },
    { q: 'The oxidation state of nitrogen in \\(\\ce{NH4+}\\) is:', opts: ['+3', '−3', '+5', '+1'], a: 1, why: 'x + 4(+1) = +1 → x = −3.' },
    { q: 'Which set of quantum numbers is NOT allowed?', opts: ['n=2, l=1, mₗ=0', 'n=3, l=2, mₗ=−2', 'n=1, l=1, mₗ=0', 'n=4, l=0, mₗ=0'], a: 2, why: 'For n = 1, l can only be 0; l = 1 is not permitted.' },
    { q: 'Going down Group 17 (the halogens), the electronegativity:', opts: ['increases', 'decreases', 'stays constant', 'peaks at Br'], a: 1, why: 'Larger atoms with more shielding attract bonding electrons less, so electronegativity falls down the group.' },
    { q: 'How many σ and π bonds are in a molecule of ethyne, \\(\\ce{C2H2}\\)?', opts: ['3 σ, 2 π', '2 σ, 3 π', '5 σ, 0 π', '4 σ, 1 π'], a: 0, why: 'H–C and C–H (2 σ) + the C≡C triple bond (1 σ + 2 π) → 3 σ and 2 π.' },
    { q: 'Which molecule has a trigonal-planar shape?', opts: ['\\(\\ce{NH3}\\)', '\\(\\ce{BF3}\\)', '\\(\\ce{PCl3}\\)', '\\(\\ce{H2O}\\)'], a: 1, why: 'BF₃ is AX₃ with no lone pairs → trigonal planar.' },
    { q: 'The strongest intermolecular force in liquid \\(\\ce{HF}\\) is:', opts: ['dispersion', 'dipole–dipole', 'hydrogen bonding', 'ion–dipole'], a: 2, why: 'H bonded to highly electronegative F → strong hydrogen bonding.' },
    { q: 'The IUPAC name of \\(\\ce{(CH3)2CHCH2CH3}\\) is:', opts: ['pentane', '2-methylbutane', 'neopentane', '2,2-dimethylpropane'], a: 1, why: 'A 4-carbon chain with a methyl branch on C2 → 2-methylbutane.' },
    { q: 'Markovnikov addition of HBr to propene gives mainly:', opts: ['1-bromopropane', '2-bromopropane', '1,2-dibromopropane', 'propan-2-ol'], a: 1, why: 'H⁺ adds to give the more stable (2°) carbocation, so Br ends up on the central carbon → 2-bromopropane.' },
    { q: 'A white precipitate forms when a solution is added to \\(\\ce{BaCl2}\\) and is insoluble in dilute acid. The anion is likely:', opts: ['\\(\\ce{Cl-}\\)', '\\(\\ce{SO4^2-}\\)', '\\(\\ce{CO3^2-}\\)', '\\(\\ce{NO3-}\\)'], a: 1, why: 'BaSO₄ is a white precipitate insoluble in dilute acid; BaCO₃ would dissolve with effervescence.' },
    { q: 'The half-life of a radioisotope is 8.0 days. After 24 days, the activity has fallen to:', opts: ['1/2', '1/4', '1/8', '1/16'], a: 2, why: '24/8 = 3 half-lives → (½)³ = 1/8 of the original activity.' },
    { q: 'Which procedure gives the most precise volume delivery?', opts: ['a beaker', 'a graduated cylinder', 'a burette / volumetric pipette', 'a conical flask'], a: 2, why: 'Volumetric (Class A) pipettes and burettes are calibrated to ±0.01–0.05 mL — far more precise than a beaker or cylinder.' },
    { q: 'Which solution has the highest boiling point?', opts: ['0.10 m glucose', '0.10 m NaCl', '0.10 m CaCl₂', 'pure water'], a: 2, why: 'ΔTb ∝ i·m; CaCl₂ gives i = 3 (most particles), so the greatest boiling-point elevation.' },
    { q: 'For a spontaneous endothermic reaction, which must be true?', opts: ['ΔS < 0', 'ΔS > 0', 'ΔG > 0', 'T = 0'], a: 1, why: 'With ΔH > 0, ΔG < 0 requires TΔS > ΔH, so ΔS must be positive.' },
    { q: 'A reaction has ΔH = +30 kJ/mol and ΔS = +100 J/mol·K. It becomes spontaneous above about:', opts: ['30 K', '100 K', '300 K', '3000 K'], a: 2, why: 'T > ΔH/ΔS = 30000/100 = 300 K.' },
    { q: 'The frequency of light with wavelength 600 nm is about (c = 3.0×10⁸ m/s):', opts: ['5.0×10¹⁴ Hz', '2.0×10⁶ Hz', '1.8×10¹⁷ Hz', '5.0×10⁻⁷ Hz'], a: 0, why: 'ν = c/λ = 3.0×10⁸ / 6.0×10⁻⁷ = 5.0×10¹⁴ Hz.' },
    { q: 'Which best explains why ice floats on water?', opts: ['ice is warmer', 'hydrogen bonding gives ice an open, lower-density lattice', 'ice has more mass', 'water is non-polar'], a: 1, why: 'In ice, hydrogen bonds hold molecules in an open hexagonal lattice, making solid water less dense than liquid.' },
  ],
  partB: [
    {
      topic: 'states', title: 'B1 — Ideal-gas law and gas density',
      prompt: 'A 0.250 g sample of a volatile liquid is vaporized and fills 100.0 mL at 100 °C and 1.00 atm.',
      parts: [
        { q: '(a) Find the moles of vapour (R = 0.0821 L·atm/mol·K).', a: 'n = PV/RT = (1.00 × 0.1000)/(0.0821 × 373) = <b>3.27×10⁻³ mol</b>.' },
        { q: '(b) Determine the molar mass.', a: 'M = mass/moles = 0.250/3.27×10⁻³ = <b>76.5 g/mol</b>.' },
        { q: '(c) Explain one source of error that makes the measured molar mass too high.', a: 'If not all vapour escapes (some liquid remains) the measured moles are too low, so M = mass/moles reads too high; incomplete vaporization or a cool spot causes this.' },
      ],
    },
    {
      topic: 'thermo', title: 'B2 — Calorimetry',
      prompt: 'When 2.00 g of \\(\\ce{NaOH}\\) (M = 40.0) dissolves in 100.0 g of water, the temperature rises from 20.0 °C to 25.3 °C. (c = 4.18 J/g·°C.)',
      parts: [
        { q: '(a) Calculate the heat released.', a: 'q = mcΔT = (102.0 g)(4.18)(5.3) = <b>2.26×10³ J = 2.26 kJ</b> (using solution mass ≈ 102 g).' },
        { q: '(b) Find ΔH of solution per mole of NaOH.', a: 'n(NaOH) = 2.00/40.0 = 0.0500 mol → ΔH = −2.26/0.0500 = <b>−45.2 kJ/mol</b> (exothermic).' },
        { q: '(c) Why is the value approximate?', a: 'It ignores the heat capacity of the cup/thermometer and any heat lost to the surroundings; the specific heat of the solution is also assumed equal to that of water.' },
      ],
    },
    {
      topic: 'equilibrium', title: 'B3 — Ksp and a common ion',
      prompt: 'For \\(\\ce{PbI2}\\), Ksp = 7.1×10⁻⁹.',
      parts: [
        { q: '(a) Calculate the molar solubility in pure water.', a: 'Ksp = (s)(2s)² = 4s³ → s = (7.1×10⁻⁹/4)^{1/3} = <b>1.2×10⁻³ M</b>.' },
        { q: '(b) Calculate the solubility in 0.10 M \\(\\ce{NaI}\\).', a: '[I⁻] ≈ 0.10 M: Ksp = [Pb²⁺](0.10)² → [Pb²⁺] = 7.1×10⁻⁹/0.010 = <b>7.1×10⁻⁷ M</b> — much lower.' },
        { q: '(c) Will a precipitate form on mixing equal volumes of 2.0×10⁻³ M \\(\\ce{Pb(NO3)2}\\) and 2.0×10⁻³ M \\(\\ce{NaI}\\)?', a: 'After mixing (halved): [Pb²⁺]=1.0×10⁻³, [I⁻]=1.0×10⁻³. Q = (10⁻³)(10⁻³)² = 1.0×10⁻⁹ < Ksp → <b>no precipitate</b>.' },
      ],
    },
    {
      topic: 'organic', title: 'B4 — Structure and isomerism',
      prompt: 'Consider the molecular formula \\(\\ce{C4H8}\\).',
      parts: [
        { q: '(a) Give the degree of unsaturation and what it implies.', a: 'DoU = (2·4+2−8)/2 = 1 → one ring OR one double bond.' },
        { q: '(b) Draw/name three constitutional isomers.', a: 'e.g. <b>but-1-ene</b>, <b>but-2-ene</b>, <b>2-methylpropene</b> (alkenes), and <b>cyclobutane</b> / <b>methylcyclopropane</b> (rings).' },
        { q: '(c) Which isomer(s) show cis–trans isomerism, and why?', a: '<b>But-2-ene</b>: each C=C carbon bears two different groups (H and CH₃), and rotation about the double bond is restricted → cis and trans forms exist. But-1-ene and 2-methylpropene do not (one carbon bears two identical H).' },
      ],
    },
  ],
};
