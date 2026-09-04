// Phase C.1 audit: report-only pass over the whole question corpus.
// Tier distribution, near-duplicate MC pairs (Jaccard), thin explanations.
// Writes nothing back — this is read-only, for a human to triage. The
// pass/fail content gate is the separate audit-content.mjs (D.9).
import { ALL_MC, ALL_FRQ, QUIZ_BANKS, ID_PREFIX } from './corpus.mjs';

console.log(`Loaded ${ALL_MC.length} MC + ${ALL_FRQ.length} FRQ = ${ALL_MC.length + ALL_FRQ.length} items.\n`);

// ---- tier derivation (mirrors src/content/registry.ts tierOf) ----
function moduleOfId(id) {
  return ID_PREFIX[id.slice(0, 3)];
}
function isWarmup(id) {
  const m = /^[a-z0-9]{3}-(\d{3})$/.exec(id);
  return !!m && moduleOfId(id) !== undefined && Number(m[1]) <= 5;
}
// difficulty scale per module (mirrors topics.ts, HS=0..IChO=4 ceiling).
//
// The nine modules split by plan3 Phase 6 carry ['HS'] on their COURSE page,
// which is what a question's module resolves to — their contest pages own no
// questions. HS is below CCC and the floor of 2 (Silver) below is what keeps
// the derived tier the same, exactly as tierOf() does in registry.ts.
const RANK = { HS: 0, CCC: 1, USNCO: 2, CCO: 3, IChO: 4 };
const MODULE_DIFFICULTY = {
  sandbox: ['CCC'], quantum: ['HS'], periodicity: ['HS'], bonding: ['HS'], stoich: ['HS'],
  thermo1: ['HS'], thermo2: ['USNCO'], gases: ['USNCO'], equilibrium: ['HS'], aek: ['HS'],
  physchem: ['USNCO', 'CCO'], biophys: ['CCO', 'IChO'],
  organic1: ['USNCO'], organic2: ['USNCO', 'CCO'], organic3: ['USNCO', 'CCO'], polymers: ['USNCO'],
  nuclear: ['USNCO'], coordchem: ['CCO', 'IChO'], advinorganic: ['CCO', 'IChO'],
  labdata: ['HS'], analytical: ['CCO'], labtech: ['HS'],
  spectroscopy: ['CCO', 'IChO'], structure: ['CCO', 'IChO'],
};
function ceilingRank(mod) {
  const diffs = MODULE_DIFFICULTY[mod] ?? [];
  return diffs.reduce((m, d) => Math.max(m, RANK[d] ?? 2), 2);
}
function tierOf(q) {
  if (q.tier) return q.tier;
  const id = q.id;
  if (isWarmup(id)) return 1;
  if (id.startsWith('cco-') || id.startsWith('int-')) return 4;
  if (id.startsWith('p2-') || /^mock\d-b-/.test(id)) return 3;
  const mod = moduleOfId(id);
  const base = mod ? ceilingRank(mod) : 2;
  return Math.min(3, Math.max(2, base));
}
// Coarse exam-topic collapse (mirrors content/topicIds.ts toExamTopic — only
// the module->examtopic direction is needed here).
const MODULE_EXAM_TOPIC = {
  quantum: 'atomic', periodicity: 'atomic', bonding: 'bonding', stoich: 'stoich',
  thermo1: 'thermo', thermo2: 'thermo', physchem: 'thermo', biophys: 'thermo',
  gases: 'states', equilibrium: 'equilibrium', aek: 'acids', // aek is mixed; see below
  organic1: 'organic', organic2: 'organic', organic3: 'organic', polymers: 'organic',
  nuclear: 'descriptive', coordchem: 'descriptive', advinorganic: 'descriptive',
  labdata: 'lab', analytical: 'lab', labtech: 'lab', spectroscopy: 'organic', structure: 'organic',
};

const TIER_NAME = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum' };
const ALL = [...ALL_MC, ...ALL_FRQ];

// ---- 1. overall + per-module tier distribution ----
const overallTier = { 1: 0, 2: 0, 3: 0, 4: 0 };
const byModuleTier = {};
for (const q of ALL) {
  const t = tierOf(q);
  overallTier[t]++;
  const mod = moduleOfId(q.id) ?? (q.topic && QUIZ_BANKS[q.topic] ? q.topic : null);
  if (mod) {
    byModuleTier[mod] ??= { 1: 0, 2: 0, 3: 0, 4: 0 };
    byModuleTier[mod][t]++;
  }
}
console.log('=== Overall tier distribution ===');
for (const t of [1, 2, 3, 4]) console.log(`  ${TIER_NAME[t]}: ${overallTier[t]}`);

console.log('\n=== Gold/Platinum coverage by module (sorted, worst first) ===');
const modRows = Object.entries(byModuleTier).map(([mod, t]) => ({ mod, gold: t[3], plat: t[4], total: t[1] + t[2] + t[3] + t[4] }));
modRows.sort((a, b) => (a.gold + a.plat * 3) - (b.gold + b.plat * 3) || a.total - b.total);
for (const r of modRows) console.log(`  ${r.mod.padEnd(14)} Gold: ${String(r.gold).padStart(2)}  Platinum: ${String(r.plat).padStart(2)}  (of ${r.total} total)`);

// ---- 2. near-duplicate MC detection (Jaccard on normalized word sets, within same topic bucket) ----
function normWords(s) {
  const stripped = s.replace(/<[^>]+>/g, ' ').replace(/\\[a-zA-Z]+\{[^}]*\}/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase();
  return new Set(stripped.split(/\s+/).filter(w => w.length > 2));
}
function jaccard(a, b) {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}
const buckets = new Map();
for (const q of ALL_MC) {
  const key = q.topic ?? 'untagged';
  (buckets.get(key) ?? buckets.set(key, []).get(key)).push({ id: q.id, q: q.q, words: normWords(q.q) });
}
const dupPairs = [];
for (const [, items] of buckets) {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const sim = jaccard(items[i].words, items[j].words);
      if (sim >= 0.55) dupPairs.push({ a: items[i], b: items[j], sim });
    }
  }
}
dupPairs.sort((a, b) => b.sim - a.sim);
console.log(`\n=== Likely near-duplicate MC pairs (Jaccard >= 0.55): ${dupPairs.length} ===`);
for (const d of dupPairs) {
  console.log(`  [${d.sim.toFixed(2)}] ${d.a.id} vs ${d.b.id}`);
  console.log(`      A: ${d.a.q.slice(0, 100)}`);
  console.log(`      B: ${d.b.q.slice(0, 100)}`);
}

// ---- 3. thin/trivial candidates: MC with a very short "why" ----
const thin = ALL_MC.filter(q => q.why.replace(/<[^>]+>/g, '').length < 35).map(q => ({ id: q.id, q: q.q, why: q.why }));
console.log(`\n=== Thin explanations (why < 35 chars, candidate for weak/trivial): ${thin.length} ===`);
for (const t of thin) console.log(`  ${t.id}: "${t.q.slice(0, 70)}" — why: "${t.why}"`);

// ---- 4. duplicate id / out-of-range answer sanity check (should be empty; Phase A audit already guards this) ----
const seenIds = new Map();
const idProblems = [];
for (const q of ALL_MC) {
  if (seenIds.has(q.id)) idProblems.push(`duplicate id ${q.id}`);
  seenIds.set(q.id, true);
  if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.opts.length) idProblems.push(`${q.id}: answer index ${q.a} outside 0..${q.opts.length - 1}`);
}
console.log(`\n=== Structural sanity (duplicate ids / bad answer index): ${idProblems.length} ===`);
idProblems.forEach(p => console.log('  ' + p));

// ---- 5. list every Platinum item (24 total) for a manual correctness pass ----
console.log('\n=== All Platinum-tier items ===');
for (const q of ALL) {
  if (tierOf(q) !== 4) continue;
  if ('opts' in q) console.log(`  [MC]  ${q.id} (${q.topic}): ${q.q.slice(0, 90)}`);
  else console.log(`  [FRQ] ${q.id} (${q.topic}): ${q.title}`);
}

// ---- 6. per EXAM-TOPIC (the 12-bucket coarse vocabulary) Gold/Platinum coverage ----
// This is what the challenge ladder and qbank filtering actually pool by, so
// it matters more than the per-module table above: a module with 0 of its own
// Gold items is not a gap if its topic already has Gold from Part II/CCO/mocks.
function toExamTopic(topic) {
  if (!topic) return null;
  if (MODULE_EXAM_TOPIC[topic]) return MODULE_EXAM_TOPIC[topic];
  const EXAM_IDS = ['stoich','states','thermo','kinetics','equilibrium','acids','redox','atomic','bonding','descriptive','organic','lab'];
  return EXAM_IDS.includes(topic) ? topic : null;
}
const byExamTopicTier = {};
for (const q of ALL) {
  const et = toExamTopic(q.topic);
  if (!et) continue;
  byExamTopicTier[et] ??= { 1: 0, 2: 0, 3: 0, 4: 0 };
  byExamTopicTier[et][tierOf(q)]++;
}
console.log('\n=== Gold/Platinum coverage by EXAM TOPIC (the pool challenge ladders and qbank actually draw from) ===');
const etRows = Object.entries(byExamTopicTier).map(([t, c]) => ({ t, ...c, total: c[1]+c[2]+c[3]+c[4] }));
etRows.sort((a, b) => (a[3] + a[4]*3) - (b[3] + b[4]*3));
for (const r of etRows) console.log(`  ${r.t.padEnd(13)} Bronze ${String(r[1]).padStart(3)}  Silver ${String(r[2]).padStart(3)}  Gold ${String(r[3]).padStart(3)}  Platinum ${String(r[4]).padStart(2)}  (${r.total} total)`);
console.log(`\n  untopiced (mock Part A questions, excluded from per-topic stats): ${ALL.filter(q => !toExamTopic(q.topic)).length}`);
