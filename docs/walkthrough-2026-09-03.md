# Beginner walk-through audit — Start-here run, 2026-09-03

Read-only audit of the live site by an agent playing a student who has finished
grade 10 science and knows no chemistry vocabulary. Rule applied at every
sentence: has this word been defined by the site before this point? Phase 6
(course/contest split) landed mid-walk, so "the contest block comes too early"
is not reported; findings that Phase 6 resolves by moving a card to the
contest page are marked **P6** in the fix column.

Severity: BLOCKER (cannot proceed or answer) · CONFUSING (can guess) · COSMETIC.

| # | Page | Element | Exact text | Why lost | Fix | Sev |
|---|---|---|---|---|---|---|
| 1 | Home | Hero sub-head | "Interactive lessons from the first mole up to olympiad level." | "mole" undefined, first content word on the site | "…from your first chemistry lesson up to olympiad level." | CONFUSING |
| 2 | Home | Sim caption | "…atoms bonding into water… Hydrogen makes one bond, oxygen makes two." | "bond" undefined | "…joining into water. A bond is a shared pair of electrons; hydrogen makes one, oxygen two." | CONFUSING |
| 3 | Home | Demo instruction | "Press Add NO₂ and watch the mixture settle back." | NO₂ never named; settle back from what | "Press Add brown gas and watch the mixture settle back to its balance point." | CONFUSING |
| 4 | Home | Demo readout | "Brown NO₂ is 0.48 mol/L · colourless N₂O₄ is 0.76 mol/L · it is settled." | mol/L undefined | one line under the readout: "mol/L means moles per litre — how much is packed into each litre" | CONFUSING |
| 5 | Home | Demo buttons | "Add N₂O₄" / "Add NO₂" | formulas, no names | "Add colourless gas (N₂O₄)" / "Add brown gas (NO₂)" | COSMETIC |
| 6 | Home | Demo link | "Open the equilibrium topic" | equilibrium undefined | "Open the topic on reactions that settle (Chemical Equilibrium)" | CONFUSING |
| 7 | Home | Under Start-here | "Doing a contest? Runs for CCC, organic, and advanced are in All topics." | CCC unexpanded; "runs" is jargon | "Doing a contest? Ready-made sequences for the Canadian Chemistry Contest, organic chemistry and advanced work are in All topics." | CONFUSING |
| 8 | Home | Third reason | "A Basics level in every topic, then exam-style." | contradicts Basics → Core → Contest | "A Basics level in every topic, then Core, then contest material." | COSMETIC |
| 9 | Home | Continue block | "0/30 solved" under "Nothing answered yet" | wrong denominator; redundant | page's denominator (20); drop one zero statement | COSMETIC |
| 10 | Moles | Breadcrumb meta | "35 min HS" | bare badge, no legend | plain label beside badge: "HS — the grade 11–12 course" | CONFUSING |
| 11 | Moles | Chip | "Limiting reagent visualizer" | chip read before Basics defines it | "Which reactant runs out first" | CONFUSING |
| 12 | Moles | Chip | "Solution chemistry tools" | says nothing | "Make a solution, then dilute it" | COSMETIC |
| 13 | Moles | Basics | "…the molarity is 1 ÷ 2 = 0.5 mol/L, written 0.5 M." | M = molar mass two paragraphs earlier | mol/L throughout Basics; introduce M in Core with one sentence on the clash | CONFUSING |
| 14 | Moles | Basics | "One mole of water is 6.022 × 10²³ water molecules." | molecule undefined | "…molecules — groups of atoms joined together." | COSMETIC |
| 15 | Moles | Core | "A salt splits into ions when it dissolves…" | first use of "ion" on the site; popover only | define in place: "ions — atoms that carry a charge because they gained or lost electrons" | CONFUSING |
| 16 | Moles | Core | "…two Na⁺ and one SO₄²⁻ per formula unit" | formula unit undefined; ⁺/⁻ notation never explained | define both in place | CONFUSING |
| 17 | Moles | Core | "Adding water adds no solute" | popover only | "…no solute, the substance that is dissolved" | COSMETIC |
| 18 | Moles | Glossary "salt" | "The ionic compound left when an acid neutralises a base…" | four undefined words on module 1 | "A solid made of positive and negative ions, such as table salt, NaCl." | BLOCKER |
| 19 | Moles | Glossary "atomic masses" | "…in atomic mass units, as printed on the periodic table." | unit undefined | drop the unit clause | COSMETIC |
| 20 | Moles | Glossary "ions" | "…has gained or lost electrons and so carries a charge." | electron not yet introduced on module 1 | reword; or Core gets a one-line electron primer before "ion" | CONFUSING |
| 21 | Moles | Limiting reagent readout | "extent of reaction = 1.000 mol" | term appears nowhere | "the reaction ran 1.000 times through the equation as written" | CONFUSING |
| 22 | Moles | Limiting reagent controls | "mol N₂" / "mol H₂" | "mol" abbreviation never introduced | "moles of N₂" | COSMETIC |
| 23 | Moles | Limiting reagent meter | "N₂: mol/coef = 2.00 · H₂: mol/coef = 1.00" | "coef" | "moles ÷ coefficient" | CONFUSING |
| 24 | Moles | Limiting reagent readout after mission | mission "neither is left over" yet panel says "Limiting reagent: N₂" | contradiction | "Limiting reagent: neither — perfectly matched" when both leftovers are zero | CONFUSING |
| 25 | Moles | Limiting reagent caption | "Divide moles by coefficient — smallest ratio loses." | cleverness | "…the smallest answer is the reactant that runs out first." | COSMETIC |
| 26 | Moles | Solution tools readout/controls | "n = m/M" above "Dilution: M₁V₁ = M₂V₂", "stock M₁ (mol/L)" | M = molar mass and molarity in one card | c₁V₁ = c₂V₂; sliders "starting concentration (mol/L)" | BLOCKER |
| 27 | Moles | Solution tools | "stock" | undefined | "the stock, the concentrated solution you start from" | CONFUSING |
| 28 | Moles | Contest reference | heading "The mole highway" | named in STYLE.md as a violation | "Converting between grams, moles and particles" | COSMETIC |
| 29 | Moles | Contest reference | heading "Reaction types to recognize instantly" | named in STYLE.md | "Four reactions worth recognising on sight" | COSMETIC |
| 30 | Moles | Percent yield recipe | "molar mass ÷ empirical mass" | empirical mass undefined | "the mass of one empirical-formula unit" | CONFUSING |
| 31 | Moles/Thermo/Lab | Quiz stems | "Molar mass of water?" · "Units of specific heat capacity?" · "Read a buret at the…" | fragments | full questions: "What is the molar mass of water?" | COSMETIC |
| 32 | Atoms | Overview | "…write any element's electron configuration and read a hydrogen spectral line as an electron dropping between energy levels." | three undefined terms | "…write down which orbitals an atom's electrons occupy, and read a line in hydrogen's light as an electron dropping from one energy step to a lower one." | CONFUSING |
| 33 | Atoms | In this topic | "(Rydberg)", "(H → Kr)" | surname and symbols in labels | drop parentheticals from the list too | COSMETIC |
| 34 | Atoms | Basics | "The wave that describes the electron changes sign as it crosses one" | wave never introduced | add: "An electron is described by a wave, a number that can be positive on one side of a surface and negative on the other." | CONFUSING |
| 35 | Atoms | Core | "…check it against Z." | Z never spelled out | "Z, the atomic number — the number of protons" at first use | BLOCKER |
| 36 | Atoms | Core | "cation or anion" | only in a bullet and popover | "A positive ion is a cation and a negative one an anion." in the ion paragraph | CONFUSING |
| 37 | Atoms | Core | "take no part in bonding" | bonding is module 4 | "bonding, the joining of atoms" | CONFUSING |
| 38 | Atoms | Core | "The blocks of the table": period, group, p block | Periodicity's Basics vocabulary, next module | define period and group in one sentence here | CONFUSING |
| 39 | Atoms | Orbital viewer title | "Hydrogen orbital viewer — ψ, signed amplitude (blue = ψ > 0, red = ψ < 0)" | undefined in the title | "Orbital shapes"; ψ note into the caption | BLOCKER |
| 40 | Atoms | Orbital viewer task | "…where the wavefunction changes sign." | Basics says "the wave that describes the electron" | use Basics wording or add "wavefunction" to Basics | CONFUSING |
| 41 | Atoms | Orbital viewer mission 1 | "Select 3s and count its radial nodes" (hint: n − ℓ − 1) | radial vs angular never split in Basics | add two lines to Basics ("a radial node is a spherical shell; an angular node is a flat plane"), or move mission to contest | BLOCKER |
| 42 | Atoms | Orbital viewer readout | "angular nodes = ℓ = 1 · 1 angular node (xy-plane)" | undefined | same fix; "the flat plane between the two lobes" | CONFUSING |
| 43 | Atoms | Orbital viewer caption | "This plots ψ itself, not |ψ|²… bonding vs antibonding… MO theory" | four undefined terms | **P6** contest page; leave "The two colours are the two signs the wave can take." | BLOCKER |
| 44 | Atoms | Radial distribution title | "Radial distribution — where the electron actually is" | undefined | "How far out the electron actually sits" | CONFUSING |
| 45 | Atoms | Radial distribution caption | "…it feels a larger Z_eff" | Periodicity's term | **P6** contest page; or spell out | BLOCKER |
| 46 | Atoms | Rydberg mission 1 | "Find the transition that emits the blue-green 486 nm Balmer line" | defined only in a hint | "…the jump that emits the blue-green 486 nm line (one of the Balmer lines, which all land on n = 2)" | CONFUSING |
| 47 | Atoms | Rydberg readout | "ΔE = 1.890 eV … series: Balmer" | eV, ΔE, series undefined | kJ/mol as Core does, or "eV, the electronvolt — an energy unit sized for one atom" | CONFUSING |
| 48 | Atoms | Config builder control | slider "Z" | undefined single letter | "atomic number Z (protons)" | BLOCKER |
| 49 | Atoms | Config builder task | "Sweep Z through the first four rows and stop at Cr and Cu" | rows of what; bare symbols | "Drag the atomic number through the first four rows of the periodic table, and stop at chromium (24) and copper (29)…" | CONFUSING |
| 50 | Atoms | Config builder caption | "Hund's rule: one ↑ in each degenerate orbital… Cations lose 4s before 3d" | degenerate undefined anywhere | "equal-energy"; expand cation once | BLOCKER |
| 51 | Atoms | Quiz Q4, Q9 | "(Z = 11)" | undefined Z in a stem | "(11 electrons)" or define Z | BLOCKER |
| 52 | Periodicity | Basics | "…pulls on the electrons of a bond it already shares." | bond is module 4 | "a bond, the shared pair of electrons that joins two atoms" | CONFUSING |
| 53 | Periodicity | Core / Slater card | S = screening, S = sulfur, "S (Z = 16)" beside "S = 10.55" | three meanings of S | σ or "screening"; label "element: sulfur" | BLOCKER |
| 54 | Periodicity | Chip | "Slater's rules" | surname | "Estimating the pull an electron feels" | CONFUSING |
| 55 | Periodicity | Slater meter | "Zeff" vs "Z_eff" | two spellings | one spelling | COSMETIC |
| 56 | Periodicity | Slater caption | "same-group electrons shield 0.35" | "group" just meant a column | "electrons in the same shell shield 0.35…" | CONFUSING |
| 57 | Periodicity | Chip | "Anomalies, diagonals & amphoterism" | abstract nouns | "Where the trends break, and why" (**P6** contest) | CONFUSING |
| 58 | Periodicity | Trends control vs Basics | "ionization" vs "ionisation" | two spellings | -ise everywhere in periodicity.ts and questions | COSMETIC |
| 59 | Periodicity | Trends readout | "Showing first ionization energy (kJ/mol) ." | no value shown | show the value at the selected element | COSMETIC |
| 60 | Periodicity | Contest reference | "IE ↑, EA more −ve, EN ↑" | abbreviations never expanded | expand once at the top | CONFUSING |
| 61 | Periodicity | Quiz Q4 | "Which is the largest species?" | "species" undefined | "Which of these four particles is the largest?" | CONFUSING |
| 62 | Periodicity | Quiz Q4, Q10 misconception | box states the correct rule under "Common misconception" | wrong shape | lead with the wrong belief | CONFUSING |
| 63 | Periodicity | Q4 misconception | "quantum level" | site says "shell" | "shell" | COSMETIC |
| 64 | Periodicity | Q3 why | "bond"; "4.0" vs Basics 3.98 | undefined; inconsistent | define; 3.98 | COSMETIC |
| 65 | Bonding | Overview | "…molecular orbital diagram… why oxygen gas is magnetic" | heaviest Overview sentence | move to contest page overview | CONFUSING |
| 66 | Bonding | Overview | "(domains)" | bare synonym | drop or "also called electron domains" | COSMETIC |
| 67 | Bonding | Basics heading | "Valence electrons and the octet" | octet never defined | define in first sentence or "…and the rule of eight" | BLOCKER |
| 68 | Bonding | Basics | "AXₙEₘ, where X is a bonded atom and E is a lone pair" | A never explained | "A is the central atom" | CONFUSING |
| 69 | Bonding | Core | "one bond of any order" | bond order undefined | "…one bond, single, double or triple." | CONFUSING |
| 70 | Bonding | VSEPR task | "…bends the shape away from the electron geometry." | undefined | "…away from the arrangement the groups themselves take." | CONFUSING |
| 71 | Bonding | VSEPR mission 1 | nonpolar shape with lone pairs among AX₂E₃, AX₃E, AX₂E₂, AX₄E₂ | needs 5- and 6-group geometries the course never covers | replace with a four-group mission ("find the shape where two lone pairs squeeze the angle to 104.5°"); move this one to contest | BLOCKER |
| 72 | Bonding | VSEPR readout | "hybridization: sp³" | contest-only concept in the Basics sim | hide on course page | BLOCKER |
| 73 | Bonding | VSEPR control | six 5/6-group shape names | never met | four-group shapes on course page; rest on contest | CONFUSING |
| 74 | Bonding | MO chip/title | "MO diagram — period 2 diatomics" | undefined | **P6** contest | BLOCKER |
| 75 | Bonding | MO task/mission/caption | "bond order", "paramagnetic… the single most famous example", "antibonding π*", "e⁻" | undefined; punchline | **P6** contest | BLOCKER |
| 76 | Bonding | Quiz Q3, Q8, Q10 options | "1 σ + 1 π" | symbols never introduced | "1 sigma (σ) + 1 pi (π)" in options, or introduce symbols in Basics | CONFUSING |
| 77 | Bonding | Quiz Q1 | "covalent bonds" | bare word never defined | Basics: "A covalent bond is a shared pair of electrons." | CONFUSING |
| 78 | Thermo I | Overview | "coffee-cup calorimeter" | undefined until Core | "…in an insulated cup" | CONFUSING |
| 79 | Thermo I | Chips | "Calorimetry: mix two substances (q = mcΔT)" · "Hess's law worked examples" · "ΔH from bond enthalpies" · "Born–Haber cycle" | four undefined labels | "Mixing hot and cold" · "Adding reactions together" · "Estimating heat from bond strengths" · (Born–Haber **P6** contest) | CONFUSING |
| 80 | Thermo I | Core | "ΔH ≈ Σ(bonds broken) − Σ(bonds formed)" | Σ unexplained | "Σ means 'add up all of'" | CONFUSING |
| 81 | Moles onward | Everywhere | (s), (l), (g), (aq) | state symbols never defined anywhere | one line in Moles Basics: "(s) solid, (l) liquid, (g) gas, (aq) dissolved in water." | BLOCKER |
| 82 | Thermo I | Hess caption | "Enthalpy is a state function" | undefined | "Enthalpy depends only on where you start and finish." | CONFUSING |
| 83 | Thermo I | Bond enthalpies mission 2 | "enthalpy of combustion… −890 kJ/mol" (hint ΔH_vap) | undefined; unanswerable from page | move to contest, or state ΔH_vap in the prompt | BLOCKER |
| 84 | Thermo I | Born–Haber controls | "ΔH_sub", "IE", "½ dissociation X₂", "EA", "ΔH_f", "U_lattice" | all undefined | **P6** contest; expand labels there | BLOCKER |
| 85 | Thermo I | Quiz Q1 | distractor "ΔS < 0" | entropy is Thermo II | "the beaker gets colder" | CONFUSING |
| 86 | Thermo I | Quiz Q5 | "spontaneously" | Basics says "on its own" | "Left alone, heat flows from…" | COSMETIC |
| 87 | Equilibrium | Chip | "Ksp" | bare; never mentioned in Basics/Core | "How much of a solid will dissolve"; define inside (**P6** contest) | BLOCKER |
| 88 | Equilibrium | Chip | "ICE table solver: HA ⇌ H⁺ + A⁻" | HA/A⁻ never introduced | "ICE table solver — working out how far a weak acid splits" | CONFUSING |
| 89 | Equilibrium | Core | "R = 0.08206 L·atm/(mol·K)" | R unnamed | "R, the gas constant, is…" | CONFUSING |
| 90 | Equilibrium | Live sim title | "(colorless ⇌ brown, ΔH° = +57 kJ)" | ° unexplained; colorless vs colourless | drop ΔH° from title; one spelling | CONFUSING |
| 91 | Equilibrium | Live sim mission 2 | "Press '+ Ar (inert, constant V)'" | undefined | "Press '+ argon, a gas that does not react'" | CONFUSING |
| 92 | Equilibrium | Live sim mission 3 | "the one stress that changes K" | Basics says "disturbance" | "disturbance" | COSMETIC |
| 93 | Equilibrium | Live sim caption | "rate_f ∝ [N₂O₄]… elementary step… rate law… (see Kinetics)" | undefined; caption of the Basics sim | move to contest; one plain line stays | BLOCKER |
| 94 | Equilibrium | ICE task/controls | "pKa", "Ka", "C₀ (M)" | Ka defined two modules later | define Ka/pKa in the card, or move card behind Acids | BLOCKER |
| 95 | Equilibrium | ICE readout | "% ionization… pH climbs" | pH not yet defined | same | BLOCKER |
| 96 | Equilibrium | Ksp task | "common ion… molar solubility… precipitate" | three undefined | **P6** contest; define all three there | BLOCKER |
| 97 | Equilibrium | Ksp mission 1 | "Gravimetric analysis… analyte" | undefined, unneeded | "To weigh a product accurately you need essentially all of it out of solution." | BLOCKER |
| 98 | Equilibrium | Ksp caption | "The coefficient trap: for AgCl, s is NOT √Ksp…" | s undefined; "trap"; Le Chatelier spelling | "s, the molar solubility"; one spelling | CONFUSING |
| 99 | Equilibrium | Ksp caption 2 | "endpoint… (Mohr titration)" | undefined | **P6** contest | CONFUSING |
| 100 | Acids | Overview | "a working buret… equivalence point… rate law" | undefined; buret vs burette | "…a working burette (the tap-and-scale tube used to add liquid drop by drop). You will find the point where an acid is exactly neutralised…" | CONFUSING |
| 101 | Acids | Core | "cathode… anode" | first use, undefined, then reused | "the cathode, the electrode where reduction happens, and the anode, where oxidation happens" | CONFUSING |
| 102 | Acids | Core | "rate = k[A]²[B]" | k named later | name at first use | CONFUSING |
| 103 | Acids | Core | "diprotic" | only in outcomes | name it in the body | CONFUSING |
| 104 | Acids | Titration task | "half-equivalence point where pH = pKa" | undefined in Basics/Core; Basics-level sim | define in Core, or task to the equivalence point only | BLOCKER |
| 105 | Acids | Titration control | "open the buret" formatted "50%·Veq" | Veq undefined | "12.5 mL added (equivalence is at 25.0 mL)" | BLOCKER |
| 106 | Acids | Titration mission 2 | "methyl orange (range 3.1–4.4)… Which indicator…" | indicator undefined; unanswerable | define indicator and pH range in the prompt, or move to contest | BLOCKER |
| 107 | Acids | Buffer chip/task/missions | "Buffer designer & shock test", "Henderson–Hasselbalch", "capacity" | buffer never defined | **P6** contest; define buffer in Core if shown on course | BLOCKER |
| 108 | Acids | Galvanic task | "half-cells… cathode… log Q… Nernst term" | four undefined | plain-words task; Nernst clause to contest | BLOCKER |
| 109 | Acids | Galvanic controls | "Li⁺/Li (−3.04)" | slash notation | "written as ion/metal, the pair the electrons move between" | CONFUSING |
| 110 | Acids | Electrolysis chip/task | "Electrolysis / Faraday calculator"; "a different n" | undefined; n ≠ moles | "Plating metal with electricity"; "electrons per ion" | BLOCKER |
| 111 | Acids | Latimer | "Latimer diagram & disproportionation"; "intensive" | undefined | **P6** contest | BLOCKER |
| 112 | Acids | Rate laws missions | "half-life… t½" | undefined in Basics/Core | define half-life in Core | BLOCKER |
| 113 | Acids | Rate laws controls | "k", "[A]₀ (M)" | unnamed; subscript zero | "rate constant k", "starting concentration [A]₀" | CONFUSING |
| 114 | Acids | Arrhenius | "Arrhenius: temperature sensitivity"; "Raise Ea" | surname; symbol | **P6** contest; "Ea, the activation energy" | CONFUSING |
| 115 | Acids | Quiz | quiz(AEK_QUIZ, 5): Q6–10 need pKa, ΔG°, half-life, buffer, rate-determining step | only run module with 5 Basics questions | five more Basics questions; quiz(AEK_QUIZ, 10) | BLOCKER |
| 116 | Acids | Quiz Q11 why | "'An Ox, Red Cat.'" | unexpanded mnemonic | spell out or drop | CONFUSING |
| 117 | Lab & Data | Overview | "calibration line… absorbance… significant figures" | undefined | "…a straight-line chart from readings of how much light a solution absorbs, decide how many digits an answer is allowed to keep…" | CONFUSING |
| 118 | Lab & Data | Core | "Four titres come in at…" | titre undefined | "the titre, the volume the burette delivered" | CONFUSING |
| 119 | Lab & Data | Core | "end point" | undefined; differs from equivalence point | define both together | CONFUSING |
| 120 | Lab & Data | Chips | "Sig fig counter" · "Uncertainty propagation" · "Q-test for outliers" · "Qualitative functional-group tests" | abbreviations; Q collides with reaction quotient; functional group is Organic | "Significant figures", "Combining uncertainties", "Testing an odd result"; functional-group card **P6** contest | BLOCKER |
| 121 | Lab & Data | Functional-group caption | "2,4-DNP… carbonyl… Tollens/iodoform… aldehyde… methyl ketone… Baeyer… unsaturation" | eight undefined | **P6** contest | BLOCKER |
| 122 | Lab & Data | Glassware caption | "buret" | vs "burette" | one spelling | COSMETIC |
| 123 | Lab & Data | Chip | "Titration technique — the classic exam questions" | banned words on course page | "Titration technique — which way each mistake pushes the answer" | COSMETIC |
| 124 | Lab & Data | Uncertainty caption | "Compute A·B/C" | A also = absorbance | named quantities | CONFUSING |
| 125 | Menu | Header | "CCC study guide · USNCO… · CCO… · IChO…" | acronyms | expand once | CONFUSING |
| 126 | Menu | Level filter | "HS · CCC · USNCO · CCO · IChO" | bare | visible plain gloss for each | CONFUSING |
| 127 | Menu | Area filter / group headings | "Physical Chemistry · Organic · Inorganic…" | professional divisions | one-line gloss under each heading | CONFUSING |
| 128 | Menu | Blurb, Periodicity | "IE/EA anomalies… Slater's-rules Z_eff… amphoterism" | five undefined terms | "Why atoms get smaller across a row and bigger down a column — and the four places the pattern breaks." | BLOCKER |
| 129 | Menu | Blurb, Atoms | "Real hydrogen orbitals, radial distributions, spectral series…" | four undefined | "Where an atom's electrons actually sit, and how to write any element's arrangement down." | BLOCKER |
| 130 | Menu | Blurb, Bonding | "Every VSEPR shape… MO diagrams…" | same | "How atoms join, and how counting electron groups gives you a molecule's shape." | CONFUSING |
| 131 | Menu | Blurb, Thermo I | "Calorimetry… Hess's law… Born–Haber… ΔH… bond enthalpies" | same | "Measuring the heat a reaction gives out, and adding known reactions together to get one you cannot measure." | CONFUSING |
| 132 | Menu | Blurb, Equilibrium | "…ICE solver, and the full Ksp toolkit" | same | "Reactions that stop part-way — what settles, and what moves it." | CONFUSING |
| 133 | Menu | Blurb, Acids | "Titration… buret… buffer… galvanic… Latimer… rate laws" | six terms | "How acidic a solution is, which way electrons flow between two metals, and how fast a reaction goes." | CONFUSING |
| 134 | Menu | Blurb, Lab & Data | "Beer's law… sig figs… Q-test…" | same | "How to read glassware, how many digits to keep, and how to turn a colour reading into a concentration." | CONFUSING |
| 135 | Menu | Blurb, Moles | "Limiting reagents… molarity… empirical-formula recipe" | first card a beginner sees | "Counting atoms by weighing them, and working out how much a reaction can make." | CONFUSING |
| 136 | Menu | Tag vs filter | "PHYSICAL" / "SKILLS" vs "Physical Chemistry" / "Laboratory Skills" | two names for one group | full name in both | COSMETIC |
| 137 | Sidebar | Mode chip | "All" + hover tooltip "Preparing for All competitions…" | no visible label; ungrammatical | "Level: all" | CONFUSING |
| 138 | Sidebar | Group headings | "PHYSICAL CHEMISTRY · ORGANIC CHEMISTRY · INORGANIC CHEMISTRY" | professional divisions | gloss in All Topics; sidebar terse | CONFUSING |
| 139 | Sidebar | Module names | "Bonding & Shape", "Acids, Batteries & Rates", "Thermo I", "Lab Techniques", "Analytical & Quant.", "Physical & Biochem" | differ from page titles | full title, CSS truncation | CONFUSING |
| 140 | Sidebar | Progress footer | "Weakest: Stoichiometry 20%" | retired name | map exam-topic ids through topic titles | CONFUSING |
| 141 | Sidebar | Search | "Search 850+ questions ⌘K" | stale count; Mac-only key | drive from corpus; platform-correct key | COSMETIC |
| 142 | Quiz | Progress line | "QUESTION 1 OF 30 · BASICS · SCORE 0 · 0/30 SOLVED" | wrong denominator; redundant | page's denominator; one counter | CONFUSING |
| 143 | Quiz | Checkpoint | "You have the basics — 2/10 right." | untrue at 2/10 | branch on score; "Review basics again" primary when low | CONFUSING |
| 144 | Quiz | End screen | "review the theory panel and retry" | not a name on the page | "…re-read Basics and Core, then retry." | CONFUSING |

## Patterns

1. Chip/card titles made of undefined words — 21 rows. Chips are read before the Overview.
2. One letter, two meanings on a page — 6 rows (M, S, n, Q, A).
3. Sim task/mission/readout uses a later module's vocabulary — 19 rows, five on Basics-level sims.
4. Terms defined only in a popover — 6 rows.
5. Notation never explained anywhere — state symbols, Z, Σ, charge superscripts, σ/π.
6. Two spellings of one word — 5 rows.
7. Menu/home blurbs are term lists — all 8 Start-here modules.
8. Misconception box states the correct rule — 2 rows.
9. Exam-culture words on course surfaces — 4 rows.

## Most lost

1. Ksp and ICE cards on Equilibrium (#87–97): both first missions unanswerable from the page; pKa/Ka/pH two modules early.
2. VSEPR explorer mission 1 (#71–73): needs 5/6-group geometries the course page never covers.
3. Acids quiz Q6–10 (#115): the only run module with five Basics questions; the floor drops at question 6.
