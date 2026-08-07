// Shared corpus loader for the audit scripts (audit-corpus.mjs, audit-content.mjs).
// Loads every bank by transpiling it with the TypeScript compiler API (type
// annotations erased, no bundler needed — every runtime import between bank
// files is local and none of them touch framework.ts/pixi/etc. at runtime).
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import ts from 'typescript';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TABS = join(ROOT, 'src/tabs');
const scratch = mkdtempSync(join(tmpdir(), 'corpus-'));

const FILES = [
  'questions1', 'questions2', 'questions3', 'questions4', 'questions5', 'questions6', 'questions7',
  'bankPart1', 'bankPart2', 'bankPart3', 'bankCCO', 'bankIntegrated',
  'bankOlympiad', 'olympiadPaper1', 'olympiadPaper2', 'olympiadPaper3', 'olympiadPaper4', 'olympiadPaper5',
];

function transpileToScratch(name) {
  const src = readFileSync(join(TABS, `${name}.ts`), 'utf8');
  const out = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  // Rewrite local relative imports to point at the scratch copies.
  const rewritten = out.replace(/from '(\.\/[a-zA-Z0-9_]+)'/g, "from '$1.mjs'");
  writeFileSync(join(scratch, `${name}.mjs`), rewritten);
}
for (const f of FILES) transpileToScratch(f);
// bankIntegrated.ts calls miniPlot() from framework.ts for embedded SVG
// figures; everything else framework exports is type-only. Stub it — we only
// need question text/metadata, not the rendered plot markup.
writeFileSync(join(scratch, 'framework.mjs'), 'export function miniPlot(){ return ""; }\n');

async function load(name) {
  return import(pathToFileURL(join(scratch, `${name}.mjs`)).href);
}

const { QUANTUM_QUIZ, BONDING_QUIZ, STOICH_QUIZ, THERMO1_QUIZ, THERMO2_QUIZ, EQUILIBRIUM_QUIZ } = await load('questions1');
const { GASES_QUIZ, AEK_QUIZ, NUCLEAR_QUIZ, ORGANIC1_QUIZ, ORGANIC2_QUIZ, LABDATA_QUIZ } = await load('questions2');
const { ANALYTICAL_QUIZ, SPECTROSCOPY_QUIZ } = await load('questions3');
const { INORGANIC_QUIZ, BIOPHYS_QUIZ } = await load('questions4');
const { PERIODICITY_QUIZ, POLYMERS_QUIZ } = await load('questions5');
const { PHYSCHEM_QUIZ, ORGANIC3_QUIZ, COORDCHEM_QUIZ } = await load('questions6');
const { LABTECH_QUIZ, STRUCTURE_QUIZ } = await load('questions7');
const { PART1 } = await load('bankPart1');
const { PART2 } = await load('bankPart2');
const { PART3 } = await load('bankPart3');
const { CCO_SETS } = await load('bankCCO');
const { INTEGRATED_SETS } = await load('bankIntegrated');
const { OLYMPIAD_PAPERS } = await load('bankOlympiad');

export const QUIZ_BANKS = {
  quantum: QUANTUM_QUIZ, bonding: BONDING_QUIZ, stoich: STOICH_QUIZ,
  thermo1: THERMO1_QUIZ, thermo2: THERMO2_QUIZ, equilibrium: EQUILIBRIUM_QUIZ,
  gases: GASES_QUIZ, aek: AEK_QUIZ, nuclear: NUCLEAR_QUIZ,
  organic1: ORGANIC1_QUIZ, organic2: ORGANIC2_QUIZ, labdata: LABDATA_QUIZ,
  analytical: ANALYTICAL_QUIZ, spectroscopy: SPECTROSCOPY_QUIZ,
  advinorganic: INORGANIC_QUIZ, biophys: BIOPHYS_QUIZ,
  periodicity: PERIODICITY_QUIZ, polymers: POLYMERS_QUIZ,
  physchem: PHYSCHEM_QUIZ, organic3: ORGANIC3_QUIZ, coordchem: COORDCHEM_QUIZ,
  labtech: LABTECH_QUIZ, structure: STRUCTURE_QUIZ,
};
export const ID_PREFIX = Object.fromEntries(
  Object.entries(QUIZ_BANKS).map(([mod, arr]) => [arr[0].id.slice(0, 3), mod]),
);

export const ALL_MC = [
  ...Object.values(QUIZ_BANKS).flat(),
  ...PART1,
  ...PART3,
  ...OLYMPIAD_PAPERS.flatMap(p => p.partA),
];
export const ALL_FRQ = [
  ...PART2,
  ...CCO_SETS.flatMap(s => s.problems),
  ...INTEGRATED_SETS.flatMap(s => s.problems),
  ...OLYMPIAD_PAPERS.flatMap(p => p.partB),
];
