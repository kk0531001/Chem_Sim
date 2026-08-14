// Mock Paper 5 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
import type { OlympiadPaper } from './bankOlympiad';

export const paper5: OlympiadPaper = {
  id: 'mock5',
  label: 'Mock Paper 5',
  blurb: 'Fifth full-length practice contest — the toughest set, with more olympiad-style traps.',
  partA: [
    { id: 'mock5-a-001', topic: 'stoich', q: 'A sample of \\(\\ce{CuSO4.5H2O}\\) weighs 2.50 g. The mass of water it contains (M(hydrate)=249.7, M(H₂O)=18.0) is:', opts: ['0.18 g', '1.50 g', '0.90 g', '0.45 g'], a: 2, why: 'Mass fraction water = 5(18.0)/249.7 = 0.360 → 0.360 × 2.50 = 0.90 g.' },
    { id: 'mock5-a-002', topic: 'states', q: 'A real gas deviates most from ideal behaviour at:', opts: ['high T, low P', 'STP', 'high T, high P', 'low T, high P'], a: 3, why: 'At low T and high P, attractions and finite molecular volume matter most (Z departs from 1).' },
    { id: 'mock5-a-003', topic: 'thermo', q: 'The standard enthalpy of formation of an element in its standard state is:', opts: ['exactly zero', 'always positive', 'always negative', 'undefined'], a: 0, why: 'By definition ΔH°f of an element in its standard state is 0.' },
    { id: 'mock5-a-004', topic: 'kinetics', q: 'For a zero-order reaction, a plot that gives a straight line is:', opts: ['ln[A] vs t', '[A] vs t', '1/[A] vs t', '[A]² vs t'], a: 1, why: 'For zero order, [A] = [A]₀ − kt, so [A] vs t is linear (slope −k).' },
    { id: 'mock5-a-005', topic: 'equilibrium', q: 'For \\(\\ce{2NO(g) + O2(g) <=> 2NO2(g)}\\), if the volume is halved at constant T, the reaction shifts:', opts: ['left', 'no change', 'right', 'stops'], a: 2, why: 'Compression favours fewer gas moles (3 → 2), shifting right toward NO₂.' },
    { id: 'mock5-a-006', topic: 'acids', q: 'Which 0.1 M solution has the lowest pH?', opts: ['\\(\\ce{NaHCO3}\\)', '\\(\\ce{NaCl}\\)', '\\(\\ce{CH3COONa}\\)', '\\(\\ce{NH4Cl}\\)'], a: 3, why: 'NH₄⁺ is a weak acid (hydrolyzes to give H⁺), so NH₄Cl is acidic; the others are neutral or basic.' },
    { id: 'mock5-a-007', topic: 'acids', q: 'A diprotic acid \\(\\ce{H2A}\\) has Ka₁ = 1.0×10⁻³ and Ka₂ = 1.0×10⁻⁸. In 0.10 M solution, [H⁺] is governed mainly by:', opts: ['Ka₁, the first ionisation', 'Ka₂ alone', 'the product Ka₁ × Ka₂', 'Kw for water'], a: 0, why: 'Ka₁ ≫ Ka₂, so the first ionization dominates [H⁺]; the second contributes negligibly.' },
    { id: 'mock5-a-008', topic: 'states', q: 'The solubility of most gases in water as temperature increases:', opts: ['increases', 'decreases', 'is unchanged', 'first rises then falls'], a: 1, why: 'Dissolving a gas is exothermic; higher T shifts the equilibrium to expel gas, lowering solubility.' },
    { id: 'mock5-a-009', topic: 'redox', q: 'A concentration cell has both electrodes made of Cu in \\(\\ce{Cu^2+}\\). Its standard potential E° is:', opts: ['+0.34 V', '+1.10 V', '0 V', '−0.34 V'], a: 2, why: 'Identical electrodes → E° = 0; any voltage arises only from the concentration difference (Nernst).' },
    { id: 'mock5-a-010', topic: 'redox', q: 'Which change is a reduction?', opts: ['\\(\\ce{Cl2 -> 2Cl-}\\)', '\\(\\ce{Fe^2+ -> Fe^3+}\\)', '\\(\\ce{Zn -> Zn^2+}\\)', '\\(\\ce{2O^2- -> O2}\\)'], a: 0, why: 'Cl₂ + 2e⁻ → 2Cl⁻ is a gain of electrons (reduction); the others are oxidations.' },
    { id: 'mock5-a-011', topic: 'atomic', q: 'The element with valence configuration 4s²4p³ is in:', opts: ['Group 13, Period 4', 'Group 15, Period 3', 'Group 5, Period 3', 'Group 15, Period 4'], a: 3, why: '5 valence electrons (s²p³) and n = 4 → Group 15, Period 4 (arsenic).' },
    { id: 'mock5-a-012', topic: 'atomic', q: 'Which has the largest atomic radius?', opts: ['Li', 'Na', 'Rb', 'K'], a: 2, why: 'Radius increases down a group; Rb is lowest of these, so largest.' },
    { id: 'mock5-a-013', topic: 'bonding', q: 'According to MO theory, the species with bond order 2.5 is:', opts: ['\\(\\ce{N2}\\) molecule', '\\(\\ce{O2+}\\)', '\\(\\ce{O2}\\) molecule', '\\(\\ce{F2}\\) molecule'], a: 1, why: 'O₂⁺ removes one antibonding electron from O₂ (BO 2) → bond order 2.5.' },
    { id: 'mock5-a-014', topic: 'bonding', q: 'Which molecule has a nonzero dipole moment?', opts: ['\\(\\ce{SO2}\\)', '\\(\\ce{SO3}\\)', '\\(\\ce{BeCl2}\\)', '\\(\\ce{CO2}\\)'], a: 0, why: 'SO₂ is bent (lone pair on S) → polar; the others are linear/trigonal-planar and symmetric.' },
    { id: 'mock5-a-015', topic: 'bonding', q: 'The strongest hydrogen bonding occurs in:', opts: ['\\(\\ce{CH3OCH3}\\) gas', '\\(\\ce{CH3F}\\) liquid', '\\(\\ce{CH3CHO}\\) liquid', '\\(\\ce{CH3CH2OH}\\)'], a: 3, why: 'Ethanol has an O–H group (H bonded to O) → true hydrogen bonding; the ether/aldehyde lack O–H.' },
    { id: 'mock5-a-016', topic: 'organic', q: 'The number of primary hydrogens in 2-methylbutane is:', opts: ['3', '6', '9', '12'], a: 2, why: '2-methylbutane, (CH₃)₂CHCH₂CH₃, has three CH₃ groups → 9 primary (1°) H.' },
    { id: 'mock5-a-017', topic: 'organic', q: 'The product of the reaction of a carboxylic acid with an alcohol (acid catalyst) is:', opts: ['an ether product', 'an ester and water', 'an amide product', 'an aldehyde product'], a: 1, why: 'Fischer esterification: \\(\\ce{RCOOH + R\'OH -> RCOOR\' + H2O}\\).' },
    { id: 'mock5-a-018', topic: 'organic', q: 'Which test distinguishes an aldehyde from a ketone?', opts: ['Tollens\' reagent', 'bromine water test', 'a simple flame test', 'damp litmus paper'], a: 0, why: 'Tollens\' oxidizes aldehydes (silver mirror) but not ketones.' },
    { id: 'mock5-a-019', topic: 'atomic', q: 'A \\(\\ce{^{14}_6C}\\) nucleus decays to \\(\\ce{^{14}_7N}\\). The emission is:', opts: ['alpha', 'gamma only', 'positron', 'beta-minus'], a: 3, why: 'Z increases by 1 with A constant → β⁻ decay (a neutron becomes a proton + electron).' },
    { id: 'mock5-a-020', topic: 'lab', q: 'In a Beer\'s-law calibration, absorbance is plotted against concentration. The slope equals:', opts: ['the path length ℓ', '1/ε only', 'the wavelength used', 'εℓ, absorptivity × path length'], a: 3, why: 'A = εℓc, so a plot of A vs c has slope εℓ.' },
    { id: 'mock5-a-021', tier: 3, topic: 'states', q: 'A 0.0100 mol sample of a nonvolatile solute in 100. g water lowers the freezing point by 0.186 °C (Kf = 1.86 °C/m). The van\'t Hoff factor i is:', opts: ['1', '2', '3', '0.5'], a: 0, why: 'ΔTf = i·Kf·m; m = 0.0100/0.100 = 0.100, so i = 0.186/(1.86×0.100) = 1.0 (a nonelectrolyte).' },
    { id: 'mock5-a-022', topic: 'thermo', q: 'For which process is both ΔH < 0 and ΔS < 0?', opts: ['boiling water', 'freezing water', 'dissolving \\(\\ce{NH4NO3}\\)', 'expanding a gas'], a: 1, why: 'Freezing releases heat (ΔH < 0) and orders molecules (ΔS < 0).' },
    { id: 'mock5-a-023', topic: 'equilibrium', q: 'The relationship ΔG = ΔG° + RT ln Q shows that at equilibrium:', opts: ['ΔG° = 0', 'Q = 1', 'ΔG = 0 and Q = K', 'ΔG = ΔG°'], a: 2, why: 'At equilibrium ΔG = 0 and Q = K, giving ΔG° = −RT ln K.' },
    { id: 'mock5-a-024', topic: 'atomic', q: 'The wavelength associated with the n=3 → n=2 transition of hydrogen lies in the:', opts: ['ultraviolet', 'X-ray', 'infrared', 'visible (red, Balmer)'], a: 3, why: 'n → 2 transitions are the Balmer series; 3→2 is the red Hα line (656 nm), visible.' },
    { id: 'mock5-a-025', topic: 'lab', q: 'A student must prepare 250.0 mL of exactly 0.1000 M \\(\\ce{Na2CO3}\\). The correct glassware is:', opts: ['a 250 mL volumetric flask', 'a 250 mL conical flask', 'a 250 mL beaker', 'a 250 mL measuring cylinder'], a: 0, why: 'Only a volumetric flask is calibrated to contain an exact volume to a single graduation mark.' },
  ],
  partB: [
    {
      id: 'mock5-b-001',
      topic: 'stoich', title: 'B1 — Solution stoichiometry and dilution',
      prompt: 'Concentrated \\(\\ce{H2SO4}\\) is 18.0 M. A student needs 500.0 mL of 0.500 M \\(\\ce{H2SO4}\\).',
      parts: [
        { q: '(a) What volume of the concentrated acid is required?', a: 'C₁V₁ = C₂V₂ → V₁ = (0.500 × 500.0)/18.0 = <b>13.9 mL</b>.' },
        { q: '(b) Describe the correct, safe dilution procedure.', a: 'Add the 13.9 mL of concentrated acid <b>slowly to water</b> (never water to acid), with stirring and cooling, then make up to 500.0 mL in a volumetric flask. Dilution is strongly exothermic.' },
        { q: '(c) How many moles of \\(\\ce{OH-}\\) would neutralize the 500 mL of 0.500 M acid?', a: 'n(H₂SO₄) = 0.500 × 0.500 = 0.250 mol; diprotic → n(OH⁻) = 2 × 0.250 = <b>0.500 mol</b>.' },
      ],
    },
    {
      id: 'mock5-b-002',
      topic: 'equilibrium', title: 'B2 — Le Chatelier reasoning',
      prompt: 'For \\(\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}\\), ΔH = −92 kJ/mol (the Haber process).',
      parts: [
        { q: '(a) Predict the effect on yield of NH₃ of (i) higher pressure and (ii) higher temperature.', a: '(i) Higher pressure favours fewer gas moles (4 → 2) → <b>more NH₃</b>. (ii) The forward reaction is exothermic, so higher T shifts left → <b>less NH₃</b>.' },
        { q: '(b) Explain why industry nonetheless uses ~450 °C rather than a lower temperature.', a: 'At low T the equilibrium yield is high but the rate is impractically slow. ~450 °C is a compromise: fast enough (with a catalyst) while keeping a workable yield.' },
        { q: '(c) What is the role of the iron catalyst?', a: 'It speeds attainment of equilibrium (lowers Ea) without shifting the position — improving the rate of NH₃ production, not the equilibrium amount.' },
      ],
    },
    {
      id: 'mock5-b-003',
      topic: 'thermo', title: 'B3 — Born–Haber style enthalpy cycle',
      prompt: 'For \\(\\ce{NaCl}\\): ΔH_sublimation(Na) = +108, ½ D(Cl₂) = +122, IE(Na) = +496, EA(Cl) = −349, lattice energy U = −788 (all kJ/mol).',
      parts: [
        { q: '(a) Use Hess\'s law to find ΔH°f of NaCl(s).', a: 'ΔH°f = 108 + 122 + 496 − 349 − 788 = <b>−411 kJ/mol</b>.' },
        { q: '(b) Which single term most stabilizes the ionic solid?', a: 'The <b>lattice energy</b> (−788 kJ/mol) — the large electrostatic attraction in the crystal — dominates and makes formation exothermic despite the endothermic ionization.' },
        { q: '(c) Predict how the lattice energy of \\(\\ce{MgO}\\) compares, and why.', a: 'MgO has much larger (more negative) lattice energy: ions are 2+/2− (versus 1+/1−) and smaller, and U ∝ (z₊z₋)/d, so the attraction is several times stronger.' },
      ],
    },
    {
      id: 'mock5-b-004',
      topic: 'organic', title: 'B4 — Identifying an unknown',
      prompt: 'An organic liquid X (C, H, O only) has molar mass 60 g/mol. It reacts with sodium to release a gas, and with an alcohol under acid catalysis to give a sweet-smelling product.',
      parts: [
        { q: '(a) Determine the degree of unsaturation and a likely formula.', a: 'For \\(\\ce{C2H4O2}\\) (M = 60): DoU = (2·2+2−4)/2 = 1. The single degree of unsaturation fits a C=O.' },
        { q: '(b) Identify X and justify with the two reactions.', a: '<b>Acetic acid, \\(\\ce{CH3COOH}\\)</b>: it releases H₂ with sodium (acidic O–H) and undergoes Fischer esterification with an alcohol to give a fragrant ester.' },
        { q: '(c) Predict the IR features of X.', a: 'A very broad O–H (2500–3300 cm⁻¹) of the carboxylic-acid dimer plus a strong C=O stretch near 1710 cm⁻¹.' },
      ],
    },
  ],
};
