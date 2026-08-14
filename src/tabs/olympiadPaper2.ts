// Mock Paper 2 — ORIGINAL, CCC-format (Part A: 25 MC; Part B: written).
import type { OlympiadPaper } from './bankOlympiad';

export const paper2: OlympiadPaper = {
  id: 'mock2',
  label: 'Mock Paper 2',
  blurb: 'Second full-length practice contest — 25 multiple-choice and written problems across all topics.',
  partA: [
    { id: 'mock2-a-001', topic: 'stoich', q: 'How many oxygen atoms are in 0.50 mol of \\(\\ce{Al2(SO4)3}\\)?', opts: ['6.0×10²³', '1.8×10²⁴', '7.2×10²⁴', '3.6×10²⁴'], a: 3, why: '12 O per formula unit → 0.50 × 12 × 6.02×10²³ = 3.6×10²⁴.' },
    { id: 'mock2-a-002', topic: 'states', q: 'At the same T and P, equal volumes of two gases contain equal numbers of:', opts: ['atoms', 'electrons', 'molecules', 'grams'], a: 2, why: 'Avogadro\'s law — equal volumes at the same T, P contain equal numbers of molecules.' },
    { id: 'mock2-a-003', topic: 'stoich', q: 'The percent yield is 80.0% and the theoretical yield is 25.0 g. The actual yield is:', opts: ['31.3 g', '20.0 g', '5.0 g', '45.0 g'], a: 1, why: 'Actual = 0.800 × 25.0 = 20.0 g.' },
    { id: 'mock2-a-004', topic: 'kinetics', q: 'Doubling the concentration of a reactant quadruples the rate. The order in that reactant is:', opts: ['2', '1', '0', '3'], a: 0, why: 'rate ∝ [A]ⁿ; 2ⁿ = 4 → n = 2 (second order).' },
    { id: 'mock2-a-005', topic: 'equilibrium', q: 'For an exothermic equilibrium, increasing the temperature causes K to:', opts: ['increase', 'become zero', 'stay the same', 'decrease'], a: 3, why: 'Heat is a product; adding heat shifts left, lowering K (van\'t Hoff).' },
    { id: 'mock2-a-006', tier: 3, topic: 'acids', q: 'In aqueous solution \\(\\ce{HCl}\\), \\(\\ce{HBr}\\) and \\(\\ce{HClO4}\\) all appear to be equally strong acids. The reason is that:', opts: ['their Ka values happen to be identical', 'they all contain a halogen', 'water levels them all to \\(\\ce{H3O+}\\)', 'their conjugate bases are the same species'], a: 2, why: 'The <b>levelling effect</b>: any acid stronger than H₃O⁺ hands its proton entirely to water, so what you actually have in every case is a solution of H₃O⁺ and the acid\'s identity is invisible to a pH measurement. To rank them you must use a <i>differentiating</i> (less basic) solvent such as glacial acetic acid, in which the order HClO₄ > HBr > HCl becomes measurable. The mirror statement holds for bases: OH⁻ is the strongest base that can exist in water, which is why O²⁻ and NH₂⁻ react completely with it.' , misconception: 'The three acids do not have equal Ka values — water simply cannot resolve them. Any acid stronger than H₃O⁺ is completely deprotonated in water, so every such solution IS a solution of H₃O⁺ and the differences become invisible rather than absent. Move to a less basic solvent such as glacial acetic acid and the order HClO₄ > HBr > HCl reappears.' },
    { id: 'mock2-a-007', tier: 3, topic: 'acids', q: 'For \\(\\ce{HF}\\), Ka = 6.8×10⁻⁴. The pH of 0.10 M \\(\\ce{NaF}\\) is closest to:', opts: ['5.9', '8.1', '7.0', '10.9'], a: 1, why: 'F⁻ is the conjugate base of a weak acid, so it hydrolyses: Kb = Kw/Ka = 10⁻¹⁴/6.8×10⁻⁴ = 1.5×10⁻¹¹. Then [OH⁻] ≈ √(Kb·C) = √(1.5×10⁻¹²) = 1.2×10⁻⁶ → pOH = 5.92 → <b>pH = 8.08</b>. The 5.9 option is the trap: it is the pOH, and a salt of a weak acid cannot be acidic.' , misconception: '√(Kb·C) returns [OH⁻], so its negative logarithm is pOH and still needs the pH = 14 − pOH step; stopping at 5.92 reports the pOH as if it were the pH. One sanity check kills that answer before any arithmetic: the salt of a weak acid and a strong base must be basic, so anything below pH 7 is wrong on sight.' },
    { id: 'mock2-a-008', topic: 'equilibrium', q: 'Adding \\(\\ce{NaCl}\\) to a saturated solution of \\(\\ce{AgCl}\\) causes the AgCl solubility to:', opts: ['decrease', 'increase', 'stay the same', 'double'], a: 0, why: 'Common-ion effect: added Cl⁻ shifts \\(\\ce{AgCl <=> Ag+ + Cl-}\\) left, lowering solubility.' },
    { id: 'mock2-a-009', topic: 'redox', q: 'How many moles of electrons are needed to deposit 1.0 mol of Al from \\(\\ce{Al^3+}\\)?', opts: ['1', '2', '6', '3'], a: 3, why: '\\(\\ce{Al^3+ + 3e- -> Al}\\) — 3 mol electrons per mol Al.' },
    { id: 'mock2-a-010', topic: 'redox', q: 'In the reaction \\(\\ce{2Fe^3+ + Sn^2+ -> 2Fe^2+ + Sn^4+}\\), the reducing agent is:', opts: ['Fe³⁺', 'Sn²⁺', 'Fe²⁺', 'Sn⁴⁺'], a: 1, why: 'Sn²⁺ is oxidized (loses electrons), so it is the reducing agent.' },
    { id: 'mock2-a-011', topic: 'atomic', q: 'The ground-state electron configuration of \\(\\ce{Cr}\\) (Z = 24) is:', opts: ['[Ar]3d⁴4s²', '[Ar]3d⁶', '[Ar]3d⁵4s¹', '[Ar]3d³4s²4p¹'], a: 2, why: 'A half-filled 3d⁵ is extra-stable, so Cr is [Ar]3d⁵4s¹ — the other classic d-block exception, alongside Cu\'s filled-shell case.' },
    { id: 'mock2-a-012', topic: 'atomic', q: 'Which species has the smallest radius?', opts: ['\\(\\ce{Na+}\\) ion', '\\(\\ce{O^2-}\\)', '\\(\\ce{F-}\\) ion', '\\(\\ce{Mg^2+}\\)'], a: 3, why: 'All are isoelectronic (10 e⁻); the highest nuclear charge (Mg, Z=12) pulls electrons in tightest.' },
    { id: 'mock2-a-013', topic: 'bonding', q: 'The bond order of \\(\\ce{O2}\\) from molecular-orbital theory is:', opts: ['2', '1.5', '1', '3'], a: 0, why: 'O₂ has bond order (8−4)/2 = 2, with two unpaired electrons (paramagnetic).' },
    { id: 'mock2-a-014', topic: 'bonding', q: 'The shape of the \\(\\ce{XeF4}\\) molecule is:', opts: ['tetrahedral shape', 'square planar', 'see-saw shaped', 'octahedral shape'], a: 1, why: 'AX₄E₂ (6 domains, two lone pairs opposite) → square planar.' },
    { id: 'mock2-a-015', topic: 'bonding', q: 'Which compound contains both ionic and covalent bonding?', opts: ['solid \\(\\ce{NaCl}\\)', 'gaseous \\(\\ce{CO2}\\)', '\\(\\ce{Na2SO4}\\)', 'gaseous \\(\\ce{CH4}\\)'], a: 2, why: 'Na₂SO₄: ionic between Na⁺ and SO₄²⁻, covalent within the sulfate ion.' },
    { id: 'mock2-a-016', topic: 'organic', q: 'Which pair are geometric (cis–trans) isomers?', opts: ['butane / isobutane', 'glucose / fructose', 'ethanol / dimethyl ether', 'cis- and trans-2-butene'], a: 3, why: 'Restricted rotation about the C=C of 2-butene gives cis and trans forms.' },
    { id: 'mock2-a-017', topic: 'organic', q: 'The functional group in \\(\\ce{CH3COOH}\\) is:', opts: ['carboxylic acid', 'a ketone group', 'an aldehyde group', 'an ester group'], a: 0, why: 'The –COOH group is a carboxylic acid.' },
    { id: 'mock2-a-018', topic: 'organic', q: 'Which reagent oxidizes a primary alcohol all the way to a carboxylic acid?', opts: ['NaBH₄ in ethanol', 'hot acidified KMnO₄', 'H₂ over Pd catalyst', 'PCC in dichloromethane'], a: 1, why: 'Strong oxidant KMnO₄ takes a 1° alcohol → aldehyde → carboxylic acid (PCC stops at the aldehyde).' },
    { id: 'mock2-a-019', topic: 'descriptive', q: 'Which ion gives a brick-red flame test colour?', opts: ['\\(\\ce{K+}\\)', '\\(\\ce{Ba^2+}\\)', '\\(\\ce{Ca^2+}\\)', '\\(\\ce{Cu^2+}\\)'], a: 2, why: 'Ca²⁺ burns brick-red; Ba²⁺ green, K⁺ lilac, Cu²⁺ blue-green.' },
    { id: 'mock2-a-020', topic: 'atomic', q: 'A nuclide undergoes β⁻ decay. Its atomic number:', opts: ['stays the same', 'decreases by 1', 'increases by 1', 'decreases by 2'], a: 2, why: 'A neutron → proton + electron, so Z rises by 1 while A is unchanged.' },
    { id: 'mock2-a-021', topic: 'lab', q: 'A student reports a titre of 24.35 mL. The number of significant figures is:', opts: ['2', '4', '3', '5'], a: 1, why: '2, 4, 3, 5 are all significant → 4 significant figures.' },
    { id: 'mock2-a-022', topic: 'states', q: 'The osmotic pressure of a solution is measured mainly to determine a solute\'s:', opts: ['molar mass', 'boiling point', 'density', 'colour'], a: 0, why: 'π = MRT (or via molar concentration) — a sensitive colligative route to molar mass, good for macromolecules.' },
    { id: 'mock2-a-023', topic: 'thermo', q: 'For which reaction is ΔS most positive?', opts: ['\\(\\ce{H2O(l) -> H2O(s)}\\)', '\\(\\ce{2H2 + O2 -> 2H2O(l)}\\)', '\\(\\ce{N2 + 3H2 -> 2NH3}\\)', '\\(\\ce{CaCO3 -> CaO + CO2}\\)'], a: 3, why: 'A gas is produced from a solid — a large increase in disorder.' },
    { id: 'mock2-a-024', topic: 'thermo', q: 'A reaction has ΔG° = −RT ln K. If K < 1, then ΔG° is:', opts: ['negative', 'zero', 'positive', 'infinite'], a: 2, why: 'K < 1 → ln K < 0 → −RT ln K > 0, so ΔG° is positive (non-spontaneous under standard conditions).' },
    { id: 'mock2-a-025', topic: 'atomic', q: 'How many photons of wavelength 500 nm carry a total energy of 3.97×10⁻¹⁹ J? (E = hc/λ, one photon)', opts: ['2', '1', '10', '0.5'], a: 1, why: 'One photon at 500 nm has E = hc/λ = (6.63×10⁻³⁴·3.0×10⁸)/(5.0×10⁻⁷) = 3.97×10⁻¹⁹ J — so exactly one photon.' },
  ],
  partB: [
    {
      id: 'mock2-b-001',
      topic: 'stoich', title: 'B1 — Empirical and molecular formula from combustion',
      prompt: 'Combustion of 0.500 g of a hydrocarbon gives 1.571 g \\(\\ce{CO2}\\) and 0.643 g \\(\\ce{H2O}\\). Its molar mass is 42 g/mol.',
      parts: [
        { q: '(a) Find the moles of C and H, and the empirical formula.', a: 'n(C) = 1.571/44.01 = 0.0357 mol; n(H) = 2 × 0.643/18.02 = 0.0714 mol. Ratio C:H = 1:2 → empirical formula <b>CH₂</b>.' },
        { q: '(b) Determine the molecular formula.', a: 'Empirical mass (CH₂) = 14. 42/14 = 3 → molecular formula <b>C₃H₆</b> (propene or cyclopropane).' },
        { q: '(c) Confirm all carbon and hydrogen came from the sample.', a: 'mass C = 0.0357 × 12.01 = 0.429 g; mass H = 0.0714 × 1.008 = 0.072 g; sum = 0.501 g ≈ 0.500 g sample → consistent, no other element.' },
      ],
    },
    {
      id: 'mock2-b-002',
      topic: 'acids', title: 'B2 — Weak-acid equilibrium and a buffer',
      prompt: 'Acetic acid has Ka = 1.8×10⁻⁵.',
      parts: [
        { q: '(a) Calculate the pH of 0.100 M acetic acid.', a: '[H⁺] ≈ √(Ka·C) = √(1.8×10⁻⁵ × 0.100) = √(1.8×10⁻⁶) = 1.34×10⁻³ → pH = <b>2.87</b>.' },
        { q: '(b) What is the pH after adding sodium acetate to make it 0.100 M in acetate?', a: 'Equal [HA] and [A⁻]: pH = pKa = −log(1.8×10⁻⁵) = <b>4.74</b> — a buffer at its maximum capacity.' },
        { q: '(c) Explain what happens to the pH if a little strong acid is added to the buffer.', a: 'Added H⁺ is consumed by acetate (\\(\\ce{A- + H+ -> HA}\\)); the ratio [A⁻]/[HA] changes only slightly, so the pH barely moves — that is buffering.' },
      ],
    },
    {
      id: 'mock2-b-003',
      topic: 'kinetics', title: 'B3 — Rate law from initial rates',
      prompt: 'For \\(\\ce{A + B -> products}\\):<br><div class="table-scroll"><table class="ref-table"><tr><th>[A]₀ (M)</th><th>[B]₀ (M)</th><th>rate (M/s)</th></tr><tr><td>0.10</td><td>0.10</td><td>2.0×10⁻³</td></tr><tr><td>0.20</td><td>0.10</td><td>4.0×10⁻³</td></tr><tr><td>0.20</td><td>0.30</td><td>4.0×10⁻³</td></tr></table></div>',
      parts: [
        { q: '(a) Determine the rate law and overall order.', a: 'First order in A, zero order in B → rate = k[A]. Overall order = <b>1</b>.' },
        { q: '(b) Calculate the rate constant k with units.', a: 'k = rate/[A] = 2.0×10⁻³ / 0.10 = <b>2.0×10⁻² s⁻¹</b>.' },
        { q: '(c) What does zero order in B suggest about the mechanism?', a: 'B does not appear in (or before) the rate-determining step — e.g. the slow step involves only A, and B reacts in a later fast step.' },
      ],
    },
    {
      id: 'mock2-b-004',
      topic: 'redox', title: 'B4 — Electrolysis and Faraday\'s laws',
      prompt: 'Molten \\(\\ce{Al2O3}\\) is electrolyzed at a constant current of 5.00 A for 1.00 hour (F = 96 485 C/mol).',
      parts: [
        { q: '(a) How many moles of electrons pass?', a: 'Q = It = 5.00 × 3600 = 1.80×10⁴ C → n(e⁻) = 18000/96485 = <b>0.187 mol</b>.' },
        { q: '(b) What mass of aluminium is deposited? \\(\\ce{Al^3+ + 3e- -> Al}\\).', a: 'n(Al) = 0.187/3 = 0.0622 mol → mass = 0.0622 × 26.98 = <b>1.68 g</b>.' },
        { q: '(c) What volume of O₂ at STP forms at the anode? \\(\\ce{2O^2- -> O2 + 4e-}\\).', a: 'n(O₂) = 0.187/4 = 0.0467 mol → V = 0.0467 × 22.4 = <b>1.05 L</b>.' },
      ],
    },
  ],
};
