// The corpus as a graph: module -> topic -> skill -> questions, plus
// competition -> topic -> tier counts (plan2 §10).
//
//   node scripts/content-graph.mjs            # summary
//   node scripts/content-graph.mjs --json     # the whole thing, for diffing
//
// It re-derives nothing: contentGraph() in src/content/registry.ts builds this
// from the same indexes the app queries, so this cannot disagree with what a
// student sees. That is also why there is no checked-in JSON copy.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { ALL_MC, ROOT } from './corpus.mjs';

const scratch = mkdtempSync(join(tmpdir(), 'graph-'));
const tp = (src, out) => writeFileSync(join(scratch, out),
  ts.transpileModule(readFileSync(join(ROOT, src), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText);
tp('src/content/skills.ts', 'skills.mjs');
const { SKILL_IDS, skillLabel } = await import(pathToFileURL(join(scratch, 'skills.mjs')).href);

// The graph itself is rebuilt here from ALL_MC rather than imported from
// registry.ts: registry pulls topics.ts, which pulls the DOM framework. Same
// derivation, and audit-content.mjs already gates the tags it reads.
const skillsOf = q => q.skill === undefined ? [] : typeof q.skill === 'string' ? [q.skill] : q.skill;

const perSkill = new Map();
let tagged = 0, multi = 0;
for (const q of ALL_MC) {
  const sk = skillsOf(q);
  if (sk.length) tagged++;
  if (sk.length > 1) multi++;
  for (const s of sk) perSkill.set(s, (perSkill.get(s) ?? 0) + 1);
}

if (process.argv.includes('--json')) {
  const modules = {};
  for (const q of ALL_MC) {
    const mod = q.topic ?? '(none)';
    const m = modules[mod] ??= { skills: {}, untagged: 0 };
    const sk = skillsOf(q);
    if (!sk.length) m.untagged++;
    for (const s of sk) (m.skills[s] ??= []).push(q.id);
  }
  process.stdout.write(JSON.stringify({ modules, skills: Object.fromEntries(perSkill) }, null, 2));
} else {
  console.log(`${tagged} of ${ALL_MC.length} MC tagged (${Math.round(100 * tagged / ALL_MC.length)}%), ${multi} with more than one skill`);
  console.log(`${perSkill.size} of ${SKILL_IDS.size} skills in the taxonomy have questions\n`);
  const empty = [...SKILL_IDS].filter(s => !perSkill.has(s));
  console.log('busiest skills:');
  for (const [s, n] of [...perSkill].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  ${String(n).padStart(3)}  ${skillLabel(s)}  (${s})`);
  }
  if (empty.length) {
    console.log(`\n${empty.length} skill(s) with no questions yet — either untagged content or a gap in the corpus:`);
    for (const s of empty.slice(0, 12)) console.log(`  ${s}`);
    if (empty.length > 12) console.log(`  … and ${empty.length - 12} more`);
  }
}
