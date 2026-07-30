// Propose an ExamTopicId for each olympiad mock-paper Part A question.
//
// These 125 are the only questions in the corpus with no topic: a mock paper
// spans the whole syllabus, so a topic isn't derivable from file or position the
// way every other bank's is. This scores each question's text against per-topic
// keyword sets and reports the winner WITH the matched evidence, so the
// assignments can be reviewed before anything is written. Nothing is written
// without --write, and it refuses to write if any question is unclassified.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');

// Ordered MOST SPECIFIC FIRST — the first topic to match wins, so that e.g. a
// question about a buffer is filed under acids even though it also says
// "equilibrium". Organic and bonding lead because their vocabulary is
// unambiguous; stoich trails because "mole" appears in half the corpus.
// Questions the keyword pass gets wrong or can't see, judged by reading them.
// Explicit beats clever here: a regex tuned until these 21 fall out correctly
// would be overfitted to this one bank and would mis-file the next paper.
const OVERRIDES = {
  'mock1-a-011': 'atomic',      // unpaired electrons in a ground-state Fe atom
  'mock1-a-013': 'bonding',     // "which molecule is polar" — polarity, not moles
  'mock1-a-014': 'bonding',     // molecular geometry of SF4
  'mock1-a-018': 'organic',     // CH2=CH2 + Br2 addition
  'mock1-a-019': 'descriptive', // flame-test colour of potassium
  'mock1-a-025': 'atomic',      // max electrons in the n = 3 shell
  'mock2-a-001': 'stoich',      // oxygen atoms in 0.50 mol Al2(SO4)3
  'mock2-a-002': 'states',      // Avogadro's law
  'mock2-a-004': 'kinetics',    // order from a rate-doubling observation
  'mock2-a-009': 'redox',       // moles of electrons to deposit Al — electrolysis
  'mock2-a-012': 'atomic',      // smallest radius (isoelectronic series)
  'mock2-a-014': 'bonding',     // shape of XeF4
  'mock2-a-015': 'bonding',     // both ionic and covalent bonding
  'mock3-a-003': 'thermo',      // enthalpy of neutralization is a ΔH fact
  'mock3-a-006': 'acids',       // pOH of NaOH
  'mock3-a-009': 'redox',       // metal displacing copper — activity series
  'mock3-a-013': 'bonding',     // sigma/pi count in ethyne
  'mock3-a-018': 'descriptive', // white precipitate with BaCl2 — ion identification
  'mock3-a-020': 'lab',         // most precise volume delivery — glassware choice
  'mock3-a-024': 'atomic',      // frequency from wavelength
  'mock3-a-025': 'bonding',     // ice floats: the open hydrogen-bonded lattice
  'mock4-a-008': 'equilibrium', // dissolving CaCO3 — Le Chatelier on solubility
  'mock4-a-010': 'redox',       // balancing a redox equation by electron count
  'mock4-a-015': 'acids',       // conducts + turns litmus red = strong acid
  'mock5-a-024': 'atomic',      // Balmer 3->2 transition
  // Concept tested is that a catalyst does NOT change K, not the catalysis
  'mock3-a-004': 'equilibrium',
};

const RULES = [
  ['organic', /isomer|chiral|stereocent|IUPAC|alk[ey]ne|alkane|aromatic|benzene|phenol|aldehyde|ketone|carboxyl|ester\b|amide|amine|nucleophil|electrophil|SN1|SN2|Markovnikov|Grignard|Friedel|esterification|Tollens|polymer|monomer|saponif|functional group|unsaturation|primary hydrogen|meth(yl|ane|anol)|eth(yl|ane|ene|yne|anol|anal)|prop(yl|ane|ene|yne)|but(yl|ane|ene)|acetic|acetone|major product/i],
  ['descriptive', /flame test|limewater|coordination number|ligand|complex ion|crystal field|transition metal|amphoteric|allotrop|Haber process|contact process|brown ring|Jahn|18-electron|HSAB/i],
  ['bonding', /hybrid|VSEPR|bond order|lone pair|resonance|dipole|electronegativ|molecular orbital|bond angle|molecular geometry|shape of|tetrahedral|trigonal|octahedral|paramagnetic|diamagnetic|lattice energy|hydrogen bond|London|van der Waals force|intermolecular|\bpolar\b|nonpolar|formal charge|Lewis structure|strongest bond|σ and π|sigma and pi|ionic and covalent/i],
  ['atomic', /quantum number|orbital|electron configuration|Aufbau|Hund|Pauli|ionization energy|electron affinity|atomic radius|shielding|effective nuclear|periodic trend|isotop|nuclide|half-life|decay|alpha particle|beta|positron|radioact|Rydberg|Balmer|Lyman|photon|de Broglie|photoelectric|emission|valence configuration|group \d+, period|subshell|unpaired electron|\bshell\b|smallest radius|largest radius|largest atomic/i],
  ['kinetics', /rate law|rate constant|zero.order|first.order|second.order|activation energy|Arrhenius|catalys|rate.determining|initial rate|rate of reaction|order in|quadruples|straight line/i],
  ['acids', /\bpH\b|\bpOH\b|pKa|pKb|\bKa\b|\bKb\b|buffer|titrat|equivalence point|neutraliz|conjugate|hydroly|Henderson|indicator|diprotic|monoprotic|hydronium|strongest acid|weak acid|strong acid|weak base/i],
  ['redox', /oxidation state|oxidation number|reduc|oxidi|redox|half.reaction|electrochem|galvanic|voltaic|electroly|cathode|anode|cell potential|E°|Nernst|Faraday|standard reduction|salt bridge|electrode|concentration cell|displace|moles of electrons|deposit/i],
  ['equilibrium', /equilibrium|Le Chatelier|\bKc\b|\bKp\b|Ksp|reaction quotient|common.ion|solubility product|saturated|precipitate|ICE table|shifts?\b/i],
  ['thermo', /enthalp|entrop|Gibbs|free energy|ΔH|ΔS|ΔG|Hess|calorim|exotherm|endotherm|spontaneous|heat capacit|specific heat|Born.?Haber|formation of an element|standard state/i],
  ['states', /ideal gas|real gas|partial pressure|Dalton|Graham|effus|kinetic.molecular|rms speed|STP\b|molar volume|boiling point|melting point|vapou?r pressure|phase diagram|triple point|critical point|sublim|condens|viscosity|surface tension|colligative|freezing.point|osmotic|van.t Hoff factor|Raoult|compressib|isotherm|solubility of most gases|equal volumes|Avogadro/i],
  ['lab', /volumetric flask|burette|buret|pipette|graduated cylinder|conical flask|desiccat|filtrat|recrystall|distill|chromatograph|\bTLC\b|extraction|separating funnel|reflux|significant figure|uncertaint|systematic error|calibrat|standard solution|primary standard|Beer|absorbance|spectrophotom|glassware|meniscus/i],
  // Trails everything: its vocabulary ("mole", "mass of") is the most common in
  // the corpus, so it must only win when nothing more specific matched. Note
  // \bmoles?\b — a bare /mole/ also matches "MOLEcule" and "MOLEcular", which
  // is what filed "which molecule is polar?" under stoichiometry.
  ['stoich', /\bmoles?\b|\bmol\b|molar mass|empirical formula|molecular formula|limiting|percent yield|percent composition|molarity|dilut|stoichiometr|mass percent|ppm\b|hydrate|combustion analysis|mass of/i],
];

function classify(id, text) {
  if (OVERRIDES[id]) return [{ topic: OVERRIDES[id], evidence: 'REVIEWED' }];
  const hits = [];
  for (const [topic, pat] of RULES) {
    const m = text.match(pat);
    if (m) hits.push({ topic, evidence: m[0] });
  }
  return hits;
}

const files = [1, 2, 3, 4, 5].map(n => `src/tabs/olympiadPaper${n}.ts`);
const rows = [];
const edits = new Map();

for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), 'utf8');
  const start = src.indexOf('partA:');
  const region = src.slice(start, src.indexOf('partB:'));
  const re = /\{ id: '([a-z0-9-]+)',( topic: '[a-z0-9]+',)? q: '((?:[^'\\]|\\.)*)'/g;
  const fileEdits = [];
  let m;
  while ((m = re.exec(region)) !== null) {
    const [full, id, existingTopic, qraw] = m;
    const q = qraw.replace(/\\'/g, "'");
    if (existingTopic) {
      rows.push({ id, topic: existingTopic.match(/'([a-z0-9]+)'/)[1], evidence: '(already tagged)', q, already: true });
      continue;
    }
    const hits = classify(id, q);
    rows.push({ id, topic: hits[0]?.topic ?? 'UNCLASSIFIED', evidence: hits[0]?.evidence ?? '', q, alts: hits.slice(1, 3).map(h => h.topic) });
    const offset = start + m.index + full.indexOf(`'${id}',`) + `'${id}',`.length;
    fileEdits.push({ offset, text: ` topic: '${hits[0]?.topic ?? 'UNCLASSIFIED'}',` });
  }
  edits.set(rel, fileEdits);
}

const todo = rows.filter(r => !r.already);
const counts = {};
for (const r of todo) counts[r.topic] = (counts[r.topic] ?? 0) + 1;

console.log(`\n${rows.length} Part A questions — ${todo.length} to classify, ${rows.length - todo.length} already tagged\n`);
for (const r of todo) {
  const alt = r.alts?.length ? `   {also: ${r.alts.join(',')}}` : '';
  console.log(`${r.id}  ${r.topic.padEnd(12)} ${('«' + r.evidence + '»').padEnd(24)} ${r.q.slice(0, 76)}${alt}`);
}
console.log('\ndistribution: ' + JSON.stringify(counts));
const unc = todo.filter(r => r.topic === 'UNCLASSIFIED');
if (unc.length) { console.log(`\n${unc.length} UNCLASSIFIED:`); unc.forEach(r => console.log('  ' + r.id + '  ' + r.q.slice(0, 110))); }

if (!WRITE) { console.log('\nDry run. Re-run with --write to apply.\n'); process.exit(0); }
if (unc.length) { console.error('\nRefusing to write while anything is UNCLASSIFIED.'); process.exit(1); }
for (const [rel, fileEdits] of edits) {
  if (!fileEdits.length) continue;
  let src = readFileSync(join(ROOT, rel), 'utf8');
  for (const e of [...fileEdits].sort((a, b) => b.offset - a.offset)) src = src.slice(0, e.offset) + e.text + src.slice(e.offset);
  writeFileSync(join(ROOT, rel), src, 'utf8');
  console.log(`wrote ${rel} (${fileEdits.length} topics)`);
}
console.log('\nDone. Re-run without --write: it must report 0 to classify.\n');
